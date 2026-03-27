import { describe, it, expect } from 'vitest';
import {
  presets,
  telegraph,
  radio,
  military,
  sonar,
  naval,
  beginner,
} from '../../src/audio/presets.js';
import type { SoundPreset } from '../../src/audio/types.js';

describe('presets', () => {
  it('exports 6 presets', () => {
    expect(Object.keys(presets)).toHaveLength(6);
  });

  const allPresets: SoundPreset[] = [telegraph, radio, military, sonar, naval, beginner];
  const validWaveforms = ['sine', 'square', 'sawtooth', 'triangle'];

  for (const preset of allPresets) {
    describe(preset.name, () => {
      it('has required string properties', () => {
        expect(preset.name).toBeTypeOf('string');
        expect(preset.name.length).toBeGreaterThan(0);
        expect(preset.description).toBeTypeOf('string');
        expect(preset.description.length).toBeGreaterThan(0);
      });

      it('has valid wpm (1–60)', () => {
        expect(preset.wpm).toBeGreaterThanOrEqual(1);
        expect(preset.wpm).toBeLessThanOrEqual(60);
      });

      it('has valid frequency (200–2000 Hz)', () => {
        expect(preset.frequency).toBeGreaterThanOrEqual(200);
        expect(preset.frequency).toBeLessThanOrEqual(2000);
      });

      it('has valid volume (0–100)', () => {
        expect(preset.volume).toBeGreaterThanOrEqual(0);
        expect(preset.volume).toBeLessThanOrEqual(100);
      });

      it('has valid waveform', () => {
        expect(validWaveforms).toContain(preset.waveform);
      });
    });
  }

  it('telegraph uses square waveform', () => {
    expect(telegraph.waveform).toBe('square');
  });

  it('radio uses sine waveform', () => {
    expect(radio.waveform).toBe('sine');
  });

  it('beginner has Farnsworth enabled', () => {
    expect(beginner.farnsworth).toBe(true);
    expect(beginner.farnsworthWpm).toBeTypeOf('number');
    expect(beginner.farnsworthWpm).toBeLessThan(beginner.wpm);
  });

  it('all presets have gain envelopes', () => {
    for (const preset of allPresets) {
      expect(preset.gainEnvelope).toBeDefined();
      expect(preset.gainEnvelope!.attack).toBeGreaterThan(0);
      expect(preset.gainEnvelope!.release).toBeGreaterThan(0);
    }
  });

  it('presets object matches individual exports', () => {
    expect(presets.telegraph).toBe(telegraph);
    expect(presets.radio).toBe(radio);
    expect(presets.military).toBe(military);
    expect(presets.sonar).toBe(sonar);
    expect(presets.naval).toBe(naval);
    expect(presets.beginner).toBe(beginner);
  });
});
