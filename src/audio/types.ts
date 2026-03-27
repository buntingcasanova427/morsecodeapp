/**
 * @morsecodeapp/morse — Audio module types
 * @see https://morsecodeapp.com
 */

import type { CharsetId } from '../core/types.js';

/** Supported oscillator waveform types */
export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

/** Player state machine */
export type PlayerState = 'idle' | 'playing' | 'paused';

/** Gain envelope configuration for click-free audio */
export interface GainEnvelopeOptions {
  /** Attack time in seconds (ramp up from silence). Default: 0.01 */
  attack: number;
  /** Release time in seconds (ramp down to silence). Default: 0.01 */
  release: number;
}

/** Options for MorsePlayer constructor */
export interface MorsePlayerOptions {
  /** Words per minute (1–60). Default: 20 */
  wpm?: number;
  /** Tone frequency in Hz (200–2000). Default: 600 */
  frequency?: number;
  /** Oscillator waveform. Default: 'sine' */
  waveform?: WaveformType;
  /** Volume (0–100). Default: 80 */
  volume?: number;
  /** Enable Farnsworth spacing. Default: false */
  farnsworth?: boolean;
  /** Farnsworth overall WPM (character WPM uses `wpm`). Default: 15 */
  farnsworthWpm?: number;
  /** Gain envelope for click-free audio. Default: { attack: 0.01, release: 0.01 } */
  gainEnvelope?: GainEnvelopeOptions;
  /** Existing AudioContext to reuse (optional, browser only) */
  audioContext?: AudioContext;

  // Event callbacks
  /** Fired when playback starts */
  onPlay?: () => void;
  /** Fired when playback is paused */
  onPause?: () => void;
  /** Fired when playback resumes from pause */
  onResume?: () => void;
  /** Fired when playback is stopped */
  onStop?: () => void;
  /** Fired when playback ends naturally */
  onEnd?: () => void;
  /** Fired for each dot or dash signal */
  onSignal?: (signal: 'dot' | 'dash', charIndex: number) => void;
  /** Fired when a complete character finishes playing */
  onCharacter?: (char: string, morse: string, charIndex: number) => void;
  /** Fired periodically with playback progress */
  onProgress?: (currentMs: number, totalMs: number) => void;
}

/** Options for play() method */
export interface PlayOptions {
  /** If true, input is treated as raw morse code. Default: false (text) */
  morse?: boolean;
  /** Character set for encoding text input. Default: 'itu' */
  charset?: CharsetId;
}

/** Sound preset configuration */
export interface SoundPreset {
  /** Preset name */
  readonly name: string;
  /** Short description */
  readonly description: string;
  /** Words per minute */
  readonly wpm: number;
  /** Tone frequency in Hz */
  readonly frequency: number;
  /** Oscillator waveform */
  readonly waveform: WaveformType;
  /** Volume (0–100) */
  readonly volume: number;
  /** Farnsworth enabled */
  readonly farnsworth?: boolean;
  /** Farnsworth overall WPM */
  readonly farnsworthWpm?: number;
  /** Gain envelope */
  readonly gainEnvelope?: GainEnvelopeOptions;
}

/** Options for WAV export functions */
export interface WavOptions {
  /** Words per minute (1–60). Default: 20 */
  wpm?: number;
  /** Tone frequency in Hz (200–2000). Default: 600 */
  frequency?: number;
  /** Oscillator waveform. Default: 'sine' */
  waveform?: WaveformType;
  /** Volume (0–100). Default: 80 */
  volume?: number;
  /** Sample rate in Hz. Default: 44100 */
  sampleRate?: number;
  /** Gain envelope. Default: { attack: 0.01, release: 0.01 } */
  gainEnvelope?: GainEnvelopeOptions;
  /** Enable Farnsworth spacing. Default: false */
  farnsworth?: boolean;
  /** Farnsworth overall WPM */
  farnsworthWpm?: number;
  /** Character set for text input. Default: 'itu' */
  charset?: CharsetId;
  /** If true, input is treated as raw morse. Default: false */
  morse?: boolean;
  /** Filename for downloadWav. Default: 'morse.wav' */
  filename?: string;
}
