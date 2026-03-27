/**
 * Sound presets for MorsePlayer.
 * Each preset provides audio settings tuned for a specific character.
 *
 * @see https://morsecodeapp.com
 */

import type { SoundPreset } from './types.js';

/** Classic telegraph key/sounder — warm, clicky tone */
export const telegraph: SoundPreset = {
  name: 'Telegraph',
  description: 'Classic telegraph sounder — warm, clicky tone',
  wpm: 15,
  frequency: 550,
  waveform: 'square',
  volume: 70,
  gainEnvelope: { attack: 0.002, release: 0.002 },
};

/** Clean amateur radio CW tone */
export const radio: SoundPreset = {
  name: 'Radio',
  description: 'Clean amateur radio CW tone',
  wpm: 20,
  frequency: 600,
  waveform: 'sine',
  volume: 80,
  gainEnvelope: { attack: 0.01, release: 0.01 },
};

/** Crisp military communication tone */
export const military: SoundPreset = {
  name: 'Military',
  description: 'Crisp military communication tone',
  wpm: 25,
  frequency: 700,
  waveform: 'sine',
  volume: 85,
  gainEnvelope: { attack: 0.005, release: 0.005 },
};

/** Deep submarine sonar ping */
export const sonar: SoundPreset = {
  name: 'Sonar',
  description: 'Deep submarine sonar ping',
  wpm: 12,
  frequency: 400,
  waveform: 'sine',
  volume: 75,
  gainEnvelope: { attack: 0.02, release: 0.04 },
};

/** Naval fleet communication tone */
export const naval: SoundPreset = {
  name: 'Naval',
  description: 'Naval fleet communication tone',
  wpm: 18,
  frequency: 650,
  waveform: 'triangle',
  volume: 78,
  gainEnvelope: { attack: 0.008, release: 0.008 },
};

/** Slow Farnsworth spacing for learning */
export const beginner: SoundPreset = {
  name: 'Beginner',
  description: 'Slow Farnsworth spacing for learning',
  wpm: 18,
  frequency: 600,
  waveform: 'sine',
  volume: 80,
  farnsworth: true,
  farnsworthWpm: 5,
  gainEnvelope: { attack: 0.01, release: 0.01 },
};

/** All available presets */
export const presets = {
  telegraph,
  radio,
  military,
  sonar,
  naval,
  beginner,
} as const;

/** Preset name */
export type PresetName = keyof typeof presets;
