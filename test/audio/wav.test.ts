import { describe, it, expect } from 'vitest';
import { toWav, toWavBlob, toWavUrl, downloadWav } from '../../src/audio/wav.js';

describe('toWav', () => {
  it('generates valid WAV header', () => {
    const wav = toWav('E', { wpm: 20 });
    const view = new DataView(wav.buffer);

    // RIFF header
    expect(readStr(wav, 0, 4)).toBe('RIFF');
    expect(readStr(wav, 8, 4)).toBe('WAVE');
    // fmt sub-chunk
    expect(readStr(wav, 12, 4)).toBe('fmt ');
    expect(view.getUint16(20, true)).toBe(1);     // PCM format
    expect(view.getUint16(22, true)).toBe(1);     // mono
    expect(view.getUint32(24, true)).toBe(44100); // sample rate
    expect(view.getUint16(34, true)).toBe(16);    // bits per sample
    // data sub-chunk
    expect(readStr(wav, 36, 4)).toBe('data');
  });

  it('generates correct sample count for a dot at 20 WPM', () => {
    const wav = toWav('.', { morse: true, wpm: 20, sampleRate: 44100 });
    const view = new DataView(wav.buffer);
    const dataSize = view.getUint32(40, true);
    // dot at 20 WPM = 60ms → ceil(0.06 * 44100) = 2646 samples × 2 bytes
    const expectedSamples = Math.ceil(0.06 * 44100);
    expect(dataSize).toBe(expectedSamples * 2);
  });

  it('contains non-zero audio data (tones present)', () => {
    const wav = toWav('SOS');
    const view = new DataView(wav.buffer);
    let hasNonZero = false;
    for (let i = 44; i < Math.min(wav.length, 400); i += 2) {
      if (view.getInt16(i, true) !== 0) {
        hasNonZero = true;
        break;
      }
    }
    expect(hasNonZero).toBe(true);
  });

  it('has silence during gaps (not all samples are tones)', () => {
    // Two dots with inter-char gap: . .
    const wav = toWav('. .', { morse: true, wpm: 20, sampleRate: 8000 });
    const view = new DataView(wav.buffer);
    // Check some samples in the silence gap region
    // dot ends at 60ms, gap starts. At 8000 Hz, 60ms = 480 samples
    // Silence starts around sample 480, which is byte offset 44 + 480*2 = 1004
    let foundSilence = false;
    const gapStart = Math.floor(0.065 * 8000); // just after dot ends
    const gapEnd = Math.floor(0.235 * 8000);   // before next dot starts
    for (let i = gapStart; i < gapEnd; i++) {
      const offset = 44 + i * 2;
      if (offset + 2 <= wav.length) {
        const sample = view.getInt16(offset, true);
        if (Math.abs(sample) < 100) {
          foundSilence = true;
          break;
        }
      }
    }
    expect(foundSilence).toBe(true);
  });

  it('returns header-only WAV for empty input', () => {
    const wav = toWav('');
    expect(wav.length).toBe(44); // header only
  });

  it('respects custom sample rate', () => {
    const wav = toWav('E', { sampleRate: 22050 });
    const view = new DataView(wav.buffer);
    expect(view.getUint32(24, true)).toBe(22050);
  });

  it('text and morse produce same-length output for E (.)', () => {
    const fromText = toWav('E');
    const fromMorse = toWav('.', { morse: true });
    expect(fromText.length).toBe(fromMorse.length);
  });

  it('longer messages produce larger output', () => {
    const short = toWav('E');
    const long = toWav('HELLO WORLD');
    expect(long.length).toBeGreaterThan(short.length);
  });

  it('volume 0 produces silent output', () => {
    const wav = toWav('SOS', { volume: 0, sampleRate: 8000 });
    const view = new DataView(wav.buffer);
    let allSilent = true;
    for (let i = 44; i < wav.length; i += 2) {
      if (view.getInt16(i, true) !== 0) {
        allSilent = false;
        break;
      }
    }
    expect(allSilent).toBe(true);
  });

  it('supports all waveform types', () => {
    const waveforms = ['sine', 'square', 'sawtooth', 'triangle'] as const;
    for (const waveform of waveforms) {
      const wav = toWav('E', { waveform });
      expect(wav.length).toBeGreaterThan(44);
    }
  });

  it('respects Farnsworth timing (longer duration)', () => {
    const normal = toWav('. .', { morse: true, wpm: 20 });
    const farnsworth = toWav('. .', { morse: true, wpm: 20, farnsworth: true, farnsworthWpm: 10 });
    // Farnsworth spacing adds extra time between characters
    expect(farnsworth.length).toBeGreaterThan(normal.length);
  });

  it('handles zero gain envelope (no ramp)', () => {
    const wav = toWav('E', { gainEnvelope: { attack: 0, release: 0 } });
    expect(wav.length).toBeGreaterThan(44);
  });
});

describe('toWavBlob', () => {
  it('returns a Blob with audio/wav type', () => {
    const blob = toWavBlob('E');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('audio/wav');
  });

  it('has correct size matching toWav output', () => {
    const wav = toWav('E');
    const blob = toWavBlob('E');
    expect(blob.size).toBe(wav.length);
  });
});

describe('downloadWav', () => {
  it('is a no-op in non-browser environment', () => {
    // In Node, document is undefined, so downloadWav should do nothing
    expect(() => downloadWav('SOS')).not.toThrow();
  });
});

describe('toWavUrl', () => {
  it('returns a data URL with audio/wav mime type', () => {
    const url = toWavUrl('E');
    expect(url).toMatch(/^data:audio\/wav;base64,/);
  });

  it('contains valid base64 data', () => {
    const url = toWavUrl('E');
    const base64 = url.replace('data:audio/wav;base64,', '');
    expect(() => atob(base64)).not.toThrow();
  });

  it('decodes back to valid WAV header', () => {
    const url = toWavUrl('E');
    const base64 = url.replace('data:audio/wav;base64,', '');
    const binary = atob(base64);
    expect(binary.substring(0, 4)).toBe('RIFF');
    expect(binary.substring(8, 12)).toBe('WAVE');
  });
});

// Helper to read ASCII string from Uint8Array
function readStr(arr: Uint8Array, offset: number, length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) {
    s += String.fromCharCode(arr[offset + i] ?? 0);
  }
  return s;
}
