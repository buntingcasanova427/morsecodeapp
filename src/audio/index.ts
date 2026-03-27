/**
 * @morsecodeapp/morse/audio — Audio playback and WAV export.
 * MorsePlayer requires a browser with Web Audio API.
 * WAV export works in any JavaScript runtime.
 *
 * @see https://morsecodeapp.com
 * @license MIT
 */

// Types
export type {
  WaveformType,
  PlayerState,
  GainEnvelopeOptions,
  MorsePlayerOptions,
  PlayOptions,
  SoundPreset,
  WavOptions,
} from './types.js';

// Player
export { MorsePlayer } from './player.js';

// Presets
export {
  presets,
  telegraph,
  radio,
  military,
  sonar,
  naval,
  beginner,
  type PresetName,
} from './presets.js';

// WAV Export
export { toWav, toWavBlob, toWavUrl, downloadWav } from './wav.js';

// Scheduler (useful for custom audio rendering)
export type { ScheduleEvent } from './scheduler.js';
export { buildSchedule, scheduleDuration } from './scheduler.js';
