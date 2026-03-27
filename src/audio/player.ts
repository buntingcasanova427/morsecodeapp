/**
 * MorsePlayer — Web Audio API morse code playback.
 * Plays morse code as audio with configurable frequency, waveform, and timing.
 * Supports play/pause/stop, gain envelope, and event callbacks.
 *
 * @see https://morsecodeapp.com
 */

import { encode } from '../core/encode.js';
import { timing, farnsworthTiming, DEFAULT_WPM } from '../core/timing.js';
import { buildSchedule, scheduleDuration, type ScheduleEvent } from './scheduler.js';
import type {
  MorsePlayerOptions,
  PlayOptions,
  PlayerState,
  WaveformType,
  GainEnvelopeOptions,
} from './types.js';

const DEFAULT_FREQUENCY = 600;
const DEFAULT_VOLUME = 80;
const DEFAULT_WAVEFORM: WaveformType = 'sine';
const DEFAULT_ENVELOPE: GainEnvelopeOptions = { attack: 0.01, release: 0.01 };
const MIN_FREQUENCY = 200;
const MAX_FREQUENCY = 2000;
const PROGRESS_INTERVAL = 50; // ms

/**
 * Web Audio API morse code player.
 *
 * @example
 * ```ts
 * const player = new MorsePlayer({ wpm: 20, frequency: 600 });
 * await player.play('Hello World');
 * ```
 */
export class MorsePlayer {
  // --- Configurable properties ---
  private _wpm: number;
  private _frequency: number;
  private _waveform: WaveformType;
  private _volume: number;
  private _farnsworth: boolean;
  private _farnsworthWpm: number;
  private _envelope: GainEnvelopeOptions;

  // --- State ---
  private _state: PlayerState = 'idle';
  private _totalTime: number = 0;

  // --- Audio context ---
  private ctx: AudioContext | null;
  private ownCtx: boolean;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];

  // --- Playback tracking ---
  private toneEvents: ScheduleEvent[] = [];
  private playStartCtxTime: number = 0;
  private pauseElapsed: number = 0;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private endTimer: ReturnType<typeof setTimeout> | null = null;
  private playResolve: (() => void) | null = null;
  private nextSignalIdx: number = 0;
  private lastFiredCharIdx: number = -1;
  private charTextMap: string[] = [];

  // --- Callbacks ---
  private _onPlay?: () => void;
  private _onPause?: () => void;
  private _onResume?: () => void;
  private _onStop?: () => void;
  private _onEnd?: () => void;
  private _onSignal?: (signal: 'dot' | 'dash', charIndex: number) => void;
  private _onCharacter?: (char: string, morse: string, charIndex: number) => void;
  private _onProgress?: (currentMs: number, totalMs: number) => void;

  constructor(options?: MorsePlayerOptions) {
    this._wpm = clamp(options?.wpm ?? DEFAULT_WPM, 1, 60);
    this._frequency = clamp(options?.frequency ?? DEFAULT_FREQUENCY, MIN_FREQUENCY, MAX_FREQUENCY);
    this._waveform = options?.waveform ?? DEFAULT_WAVEFORM;
    this._volume = clamp(options?.volume ?? DEFAULT_VOLUME, 0, 100);
    this._farnsworth = options?.farnsworth ?? false;
    this._farnsworthWpm = options?.farnsworthWpm ?? 15;
    this._envelope = { ...DEFAULT_ENVELOPE, ...options?.gainEnvelope };

    if (options?.audioContext) {
      this.ctx = options.audioContext;
      this.ownCtx = false;
    } else {
      this.ctx = null;
      this.ownCtx = false;
    }

    this._onPlay = options?.onPlay;
    this._onPause = options?.onPause;
    this._onResume = options?.onResume;
    this._onStop = options?.onStop;
    this._onEnd = options?.onEnd;
    this._onSignal = options?.onSignal;
    this._onCharacter = options?.onCharacter;
    this._onProgress = options?.onProgress;
  }

  // --- Public getters / setters ---

  get state(): PlayerState {
    return this._state;
  }

  get totalTime(): number {
    return this._totalTime;
  }

  get currentTime(): number {
    if (this._state === 'idle') return 0;
    if (this._state === 'paused') return this.pauseElapsed;
    if (!this.ctx) return 0;
    return Math.min(
      (this.ctx.currentTime - this.playStartCtxTime) * 1000,
      this._totalTime,
    );
  }

  get progress(): number {
    if (this._totalTime === 0) return 0;
    return Math.min(this.currentTime / this._totalTime, 1);
  }

  get wpm(): number {
    return this._wpm;
  }
  set wpm(value: number) {
    this._wpm = clamp(value, 1, 60);
  }

  get frequency(): number {
    return this._frequency;
  }
  set frequency(value: number) {
    this._frequency = clamp(value, MIN_FREQUENCY, MAX_FREQUENCY);
  }

  get volume(): number {
    return this._volume;
  }
  set volume(value: number) {
    this._volume = clamp(value, 0, 100);
    if (this.masterGain) {
      this.masterGain.gain.value = this._volume / 100;
    }
  }

  // --- Public methods ---

  /**
   * Play morse code audio.
   * Accepts text (auto-encodes) or raw morse (with `{ morse: true }`).
   *
   * @returns Promise that resolves when playback ends or is stopped
   */
  async play(input: string, options?: PlayOptions): Promise<void> {
    if (this._state !== 'idle') {
      this.stopInternal(false);
    }

    // Determine morse string
    const isMorse = options?.morse ?? false;
    const morse = isMorse ? input : encode(input, { charset: options?.charset });

    // Build character map for callbacks
    if (!isMorse) {
      this.charTextMap = input.replace(/\s+/g, '').split('');
    } else {
      const morseLetters: string[] = [];
      for (const word of morse.split(/\s*\/\s*/)) {
        if (!word) continue;
        for (const l of word.trim().split(/\s+/)) {
          if (l) morseLetters.push(l);
        }
      }
      this.charTextMap = morseLetters;
    }

    // Build timing
    const t = this._farnsworth
      ? farnsworthTiming(this._farnsworthWpm, this._wpm)
      : timing(this._wpm);

    // Build schedule
    const schedule = buildSchedule(morse, t);
    this.toneEvents = schedule.filter(e => e.type === 'tone');
    this._totalTime = scheduleDuration(schedule);
    this.nextSignalIdx = 0;
    this.lastFiredCharIdx = -1;

    if (this.toneEvents.length === 0) return;

    // Ensure AudioContext
    await this.ensureContext();

    // Master gain (volume control)
    this.masterGain = this.ctx!.createGain();
    this.masterGain.gain.value = this._volume / 100;
    this.masterGain.connect(this.ctx!.destination);

    // Schedule all tones with gain envelopes
    const now = this.ctx!.currentTime;
    this.playStartCtxTime = now;
    this.pauseElapsed = 0;

    for (const event of this.toneEvents) {
      const startSec = now + event.start / 1000;
      const durationSec = event.duration / 1000;
      const endSec = startSec + durationSec;

      const osc = this.ctx!.createOscillator();
      osc.type = this._waveform;
      osc.frequency.value = this._frequency;

      const gain = this.ctx!.createGain();
      const attack = Math.min(this._envelope.attack, durationSec / 2);
      const release = Math.min(this._envelope.release, durationSec / 2);

      // Gain envelope: silence → attack → sustain → release → silence
      gain.gain.setValueAtTime(0, startSec);
      gain.gain.linearRampToValueAtTime(1, startSec + attack);
      if (durationSec > attack + release) {
        gain.gain.setValueAtTime(1, endSec - release);
      }
      gain.gain.linearRampToValueAtTime(0, endSec);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startSec);
      osc.stop(endSec + 0.05); // small buffer for clean release

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    }

    this._state = 'playing';
    this._onPlay?.();

    // Start progress polling
    this.startProgressPolling();

    // Return promise that resolves on natural end or stop
    return new Promise<void>((resolve) => {
      this.playResolve = resolve;
      this.endTimer = setTimeout(() => {
        this.handlePlaybackEnd();
      }, this._totalTime + 100);
    });
  }

  /** Pause playback. Suspends the AudioContext. */
  pause(): void {
    if (this._state !== 'playing' || !this.ctx) return;

    this.pauseElapsed = (this.ctx.currentTime - this.playStartCtxTime) * 1000;
    this.ctx.suspend();
    this.stopProgressPolling();

    this._state = 'paused';
    this._onPause?.();
  }

  /** Resume playback from paused state. */
  async resume(): Promise<void> {
    if (this._state !== 'paused' || !this.ctx) return;

    await this.ctx.resume();
    this._state = 'playing';
    this.startProgressPolling();
    this._onResume?.();
  }

  /** Stop playback and reset to idle. */
  stop(): void {
    this.stopInternal(true);
  }

  /** Dispose of all resources. Call when done with the player. */
  dispose(): void {
    this.stopInternal(false);
    if (this.ctx && this.ownCtx) {
      this.ctx.close().catch(() => {});
    }
    this.ctx = null;
  }

  // --- Internal ---

  private async ensureContext(): Promise<void> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.ownCtx = true;
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  private stopInternal(fireCallback: boolean): void {
    this.stopProgressPolling();

    if (this.endTimer) {
      clearTimeout(this.endTimer);
      this.endTimer = null;
    }

    // Disconnect all audio nodes
    for (const osc of this.oscillators) {
      try { osc.stop(); } catch { /* already stopped */ }
      try { osc.disconnect(); } catch { /* already disconnected */ }
    }
    for (const gain of this.gainNodes) {
      try { gain.disconnect(); } catch { /* already disconnected */ }
    }
    this.oscillators = [];
    this.gainNodes = [];

    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch { /* */ }
      this.masterGain = null;
    }

    // Resume suspended context so it's usable for next play()
    if (this._state === 'paused' && this.ctx) {
      this.ctx.resume().catch(() => {});
    }

    this._state = 'idle';
    this.pauseElapsed = 0;

    if (fireCallback) {
      this._onStop?.();
    }

    if (this.playResolve) {
      const resolve = this.playResolve;
      this.playResolve = null;
      resolve();
    }
  }

  private handlePlaybackEnd(): void {
    this.stopProgressPolling();
    this.fireRemainingEvents();

    // Cleanup audio nodes
    for (const osc of this.oscillators) {
      try { osc.disconnect(); } catch { /* */ }
    }
    for (const gain of this.gainNodes) {
      try { gain.disconnect(); } catch { /* */ }
    }
    this.oscillators = [];
    this.gainNodes = [];

    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch { /* */ }
      this.masterGain = null;
    }

    this._state = 'idle';
    this.endTimer = null;
    this._onEnd?.();

    if (this.playResolve) {
      const resolve = this.playResolve;
      this.playResolve = null;
      resolve();
    }
  }

  private startProgressPolling(): void {
    this.progressTimer = setInterval(() => {
      this.pollProgress();
    }, PROGRESS_INTERVAL);
  }

  private stopProgressPolling(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private pollProgress(): void {
    const elapsed = this.currentTime;

    this._onProgress?.(elapsed, this._totalTime);

    // Fire onSignal / onCharacter for newly-passed tones
    while (this.nextSignalIdx < this.toneEvents.length) {
      const event = this.toneEvents[this.nextSignalIdx]!;
      if (event.start <= elapsed) {
        if (event.signal) {
          this._onSignal?.(event.signal, event.charIndex ?? 0);
        }

        // Fire onCharacter when the last signal of a character is reached
        const nextEvent = this.toneEvents[this.nextSignalIdx + 1];
        const charFinished = !nextEvent || nextEvent.charIndex !== event.charIndex;
        if (
          charFinished &&
          event.charIndex !== undefined &&
          event.charIndex !== this.lastFiredCharIdx
        ) {
          this.lastFiredCharIdx = event.charIndex;
          const charText = this.charTextMap[event.charIndex] ?? '';
          this._onCharacter?.(charText, event.morseChar ?? '', event.charIndex);
        }

        this.nextSignalIdx++;
      } else {
        break;
      }
    }
  }

  private fireRemainingEvents(): void {
    while (this.nextSignalIdx < this.toneEvents.length) {
      const event = this.toneEvents[this.nextSignalIdx]!;
      if (event.signal) {
        this._onSignal?.(event.signal, event.charIndex ?? 0);
      }

      const nextEvent = this.toneEvents[this.nextSignalIdx + 1];
      const charFinished = !nextEvent || nextEvent.charIndex !== event.charIndex;
      if (
        charFinished &&
        event.charIndex !== undefined &&
        event.charIndex !== this.lastFiredCharIdx
      ) {
        this.lastFiredCharIdx = event.charIndex;
        const charText = this.charTextMap[event.charIndex] ?? '';
        this._onCharacter?.(charText, event.morseChar ?? '', event.charIndex);
      }

      this.nextSignalIdx++;
    }

    this._onProgress?.(this._totalTime, this._totalTime);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
