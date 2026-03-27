/**
 * WAV file generation — converts morse code to WAV audio data.
 * Pure computation — works in Node.js, Bun, Deno, and browsers.
 *
 * @see https://morsecodeapp.com
 */

import { encode } from '../core/encode.js';
import { timing, farnsworthTiming } from '../core/timing.js';
import { buildSchedule, scheduleDuration } from './scheduler.js';
import type { WavOptions, WaveformType } from './types.js';

const DEFAULT_SAMPLE_RATE = 44100;
const DEFAULT_FREQUENCY = 600;
const DEFAULT_VOLUME = 80;
const DEFAULT_WPM = 20;
const DEFAULT_ATTACK = 0.01;
const DEFAULT_RELEASE = 0.01;

/**
 * Generate WAV audio data from text or morse code.
 * Returns raw WAV file bytes as a Uint8Array.
 *
 * @example
 * ```ts
 * const wav = toWav('SOS');
 * const wav = toWav('... --- ...', { morse: true, frequency: 800 });
 * ```
 */
export function toWav(input: string, options?: WavOptions): Uint8Array {
  const opts = resolveOptions(options);
  const morse = opts.morse ? input : encode(input, { charset: opts.charset });

  const t = opts.farnsworth && opts.farnsworthWpm !== undefined
    ? farnsworthTiming(opts.farnsworthWpm, opts.wpm)
    : timing(opts.wpm);

  const schedule = buildSchedule(morse, t);
  const totalMs = scheduleDuration(schedule);

  if (totalMs === 0) return createWavFile(new Float32Array(0), opts.sampleRate);

  const totalSamples = Math.ceil((totalMs / 1000) * opts.sampleRate);
  const samples = new Float32Array(totalSamples);
  const volume = opts.volume / 100;
  const tones = schedule.filter(e => e.type === 'tone');

  for (const tone of tones) {
    const startSample = Math.floor((tone.start / 1000) * opts.sampleRate);
    const endSample = Math.min(
      Math.floor(((tone.start + tone.duration) / 1000) * opts.sampleRate),
      totalSamples,
    );
    const durationSec = tone.duration / 1000;
    const effectiveAttack = Math.min(opts.gainEnvelope.attack, durationSec / 2);
    const effectiveRelease = Math.min(opts.gainEnvelope.release, durationSec / 2);

    for (let i = startSample; i < endSample; i++) {
      const globalT = i / opts.sampleRate;
      const localT = (i - startSample) / opts.sampleRate;

      // Gain envelope
      let envelope = 1;
      if (localT < effectiveAttack) {
        envelope = effectiveAttack > 0 ? localT / effectiveAttack : 1;
      } else if (localT > durationSec - effectiveRelease) {
        envelope = effectiveRelease > 0
          ? (durationSec - localT) / effectiveRelease
          : 1;
      }

      const signal = generateWaveform(opts.waveform, opts.frequency, globalT);
      samples[i] = signal * volume * envelope;
    }
  }

  return createWavFile(samples, opts.sampleRate);
}

/**
 * Generate a WAV Blob from text or morse code.
 *
 * @example
 * ```ts
 * const blob = toWavBlob('SOS');
 * ```
 */
export function toWavBlob(input: string, options?: WavOptions): Blob {
  const data = toWav(input, options);
  return new Blob([data.buffer as ArrayBuffer], { type: 'audio/wav' });
}

/**
 * Generate a data URL of a WAV file.
 *
 * @example
 * ```ts
 * const url = toWavUrl('SOS');
 * // 'data:audio/wav;base64,...'
 * ```
 */
export function toWavUrl(input: string, options?: WavOptions): string {
  const data = toWav(input, options);
  // Build base64 data URL (chunked to avoid stack overflow on large arrays)
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/**
 * Download a WAV file in the browser.
 * No-op in non-browser environments.
 *
 * @example
 * ```ts
 * downloadWav('SOS', { filename: 'sos.wav' });
 * ```
 */
export function downloadWav(input: string, options?: WavOptions): void {
  if (typeof document === 'undefined') return;

  const blob = toWavBlob(input, options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = options?.filename ?? 'morse.wav';
  a.click();
  URL.revokeObjectURL(url);
}

// --- Internal helpers ---

function resolveOptions(options?: WavOptions) {
  return {
    wpm: clamp(options?.wpm ?? DEFAULT_WPM, 1, 60),
    frequency: clamp(options?.frequency ?? DEFAULT_FREQUENCY, 200, 2000),
    waveform: (options?.waveform ?? 'sine') as WaveformType,
    volume: clamp(options?.volume ?? DEFAULT_VOLUME, 0, 100),
    sampleRate: options?.sampleRate ?? DEFAULT_SAMPLE_RATE,
    gainEnvelope: {
      attack: options?.gainEnvelope?.attack ?? DEFAULT_ATTACK,
      release: options?.gainEnvelope?.release ?? DEFAULT_RELEASE,
    },
    farnsworth: options?.farnsworth ?? false,
    farnsworthWpm: options?.farnsworthWpm,
    charset: options?.charset,
    morse: options?.morse ?? false,
  };
}

/** Generate a single waveform sample at time t */
function generateWaveform(type: WaveformType, frequency: number, t: number): number {
  const phase = ((frequency * t) % 1 + 1) % 1; // ensure positive phase
  switch (type) {
    case 'sine':
      return Math.sin(2 * Math.PI * frequency * t);
    case 'square':
      return phase < 0.5 ? 1 : -1;
    case 'sawtooth':
      return 2 * phase - 1;
    case 'triangle':
      return 4 * Math.abs(phase - 0.5) - 1;
    default:
      return Math.sin(2 * Math.PI * frequency * t);
  }
}

/** Write a WAV file from float samples (-1 to 1) */
function createWavFile(samples: Float32Array, sampleRate: number): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const dataSize = samples.length * bytesPerSample;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);                                      // PCM chunk size
  view.setUint16(20, 1, true);                                       // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // byte rate
  view.setUint16(32, numChannels * bytesPerSample, true);             // block align
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, Math.round(s * 32767), true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
