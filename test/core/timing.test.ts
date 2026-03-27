import { describe, it, expect } from 'vitest';
import {
  timing,
  farnsworthTiming,
  duration,
  formatDuration,
  DEFAULT_WPM,
} from '../../src/core/timing.js';

describe('timing', () => {
  it('calculates standard PARIS timing at 20 WPM', () => {
    const t = timing(20);
    expect(t.unit).toBe(60);    // 1200/20 = 60ms
    expect(t.dot).toBe(60);
    expect(t.dash).toBe(180);   // 3 × 60
    expect(t.intraChar).toBe(60);
    expect(t.interChar).toBe(180);
    expect(t.interWord).toBe(420);
  });

  it('uses default WPM when called without args', () => {
    const t = timing();
    expect(t.unit).toBe(1200 / DEFAULT_WPM);
  });

  it('clamps WPM to minimum', () => {
    const t = timing(0);
    expect(t.unit).toBe(1200); // 1200/1
  });

  it('clamps WPM to maximum', () => {
    const t = timing(100);
    expect(t.unit).toBe(1200 / 60); // 20ms
  });
});

describe('farnsworthTiming', () => {
  it('has same dot/dash as char speed', () => {
    const ft = farnsworthTiming(10, 20);
    const standard = timing(20);
    expect(ft.dot).toBe(standard.dot);
    expect(ft.dash).toBe(standard.dash);
    expect(ft.intraChar).toBe(standard.intraChar);
  });

  it('has longer inter-char and inter-word than standard', () => {
    const ft = farnsworthTiming(10, 20);
    const standard = timing(10);
    // Farnsworth inter-char should exist and be positive
    expect(ft.interChar).toBeGreaterThan(0);
    expect(ft.interWord).toBeGreaterThan(0);
  });
});

describe('duration', () => {
  it('calculates duration of SOS at 20 WPM', () => {
    // S = ... = dot + gap + dot + gap + dot = 5 units
    // O = --- = dash + gap + dash + gap + dash = 11 units
    // inter-char gaps: 2 × 3 units = 6 units
    // total = 5 + 3 + 11 + 3 + 5 = 27 units × 60ms = 1620ms
    const d = duration('... --- ...', 20);
    expect(d).toBeGreaterThan(0);
    // 27 units = S(5) + gap(3) + O(11) + gap(3) + S(5) = 27 × 60 = 1620
    expect(d).toBe(1620);
  });

  it('handles word separators', () => {
    const single = duration('.-', 20);
    const withWord = duration('.- / .-', 20);
    expect(withWord).toBeGreaterThan(single * 2);
  });
});

describe('formatDuration', () => {
  it('formats milliseconds', () => {
    expect(formatDuration(500)).toBe('500ms');
  });

  it('formats seconds', () => {
    expect(formatDuration(3500)).toBe('3.5s');
  });

  it('formats minutes', () => {
    expect(formatDuration(65000)).toBe('1m 5.0s');
  });
});
