import { describe, it, expect } from 'vitest';
import { buildSchedule, scheduleDuration } from '../../src/audio/scheduler.js';
import { timing } from '../../src/core/timing.js';

describe('buildSchedule', () => {
  // At 20 WPM: unit = 60ms, dot = 60, dash = 180
  // intraChar = 60, interChar = 180, interWord = 420
  const t = timing(20);

  it('returns empty array for empty input', () => {
    expect(buildSchedule('', t)).toEqual([]);
    expect(buildSchedule('  ', t)).toEqual([]);
  });

  it('schedules a single dot (E)', () => {
    const events = buildSchedule('.', t);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'tone',
      start: 0,
      duration: 60,
      signal: 'dot',
      morseChar: '.',
      charIndex: 0,
    });
  });

  it('schedules a single dash (T)', () => {
    const events = buildSchedule('-', t);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'tone',
      start: 0,
      duration: 180,
      signal: 'dash',
      morseChar: '-',
      charIndex: 0,
    });
  });

  it('schedules dot-dash with intra-char gap (A = .-)', () => {
    const events = buildSchedule('.-', t);
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ type: 'tone', start: 0, duration: 60, signal: 'dot' });
    expect(events[1]).toMatchObject({ type: 'silence', start: 60, duration: 60 });
    expect(events[2]).toMatchObject({ type: 'tone', start: 120, duration: 180, signal: 'dash' });
  });

  it('schedules two characters with inter-char gap (E E = . .)', () => {
    const events = buildSchedule('. .', t);
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ type: 'tone', start: 0, duration: 60, charIndex: 0 });
    expect(events[1]).toMatchObject({ type: 'silence', start: 60, duration: 180 });
    expect(events[2]).toMatchObject({ type: 'tone', start: 240, duration: 60, charIndex: 1 });
  });

  it('schedules two words with inter-word gap (E E = . / .)', () => {
    const events = buildSchedule('. / .', t);
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ type: 'tone', start: 0, charIndex: 0 });
    expect(events[1]).toMatchObject({ type: 'silence', start: 60, duration: 420 });
    expect(events[2]).toMatchObject({ type: 'tone', start: 480, charIndex: 1 });
  });

  it('schedules SOS (... --- ...)', () => {
    const events = buildSchedule('... --- ...', t);
    const tones = events.filter(e => e.type === 'tone');
    expect(tones).toHaveLength(9);

    // S = 3 dots → charIndex 0
    expect(tones[0]!.charIndex).toBe(0);
    expect(tones[1]!.charIndex).toBe(0);
    expect(tones[2]!.charIndex).toBe(0);
    // O = 3 dashes → charIndex 1
    expect(tones[3]!.charIndex).toBe(1);
    expect(tones[4]!.charIndex).toBe(1);
    expect(tones[5]!.charIndex).toBe(1);
    // S = 3 dots → charIndex 2
    expect(tones[6]!.charIndex).toBe(2);
    expect(tones[7]!.charIndex).toBe(2);
    expect(tones[8]!.charIndex).toBe(2);

    // Signal types
    expect(tones[0]!.signal).toBe('dot');
    expect(tones[3]!.signal).toBe('dash');
  });

  it('tracks morseChar for each tone', () => {
    const events = buildSchedule('.- ...', t);
    const tones = events.filter(e => e.type === 'tone');
    // A = .-
    expect(tones[0]!.morseChar).toBe('.-');
    expect(tones[1]!.morseChar).toBe('.-');
    // S = ...
    expect(tones[2]!.morseChar).toBe('...');
    expect(tones[3]!.morseChar).toBe('...');
    expect(tones[4]!.morseChar).toBe('...');
  });

  it('increments charIndex across words', () => {
    // H E / E = .... . / .
    const events = buildSchedule('.... . / .', t);
    const tones = events.filter(e => e.type === 'tone');
    expect(tones[0]!.charIndex).toBe(0); // H (first dot)
    expect(tones[4]!.charIndex).toBe(1); // E (after H)
    expect(tones[5]!.charIndex).toBe(2); // E (second word)
  });

  it('handles consecutive slashes gracefully', () => {
    const events = buildSchedule('. / / .', t);
    const tones = events.filter(e => e.type === 'tone');
    expect(tones).toHaveLength(2); // two dots
  });

  it('handles extra spaces in input', () => {
    const events = buildSchedule('.  .', t);
    const tones = events.filter(e => e.type === 'tone');
    expect(tones).toHaveLength(2);
  });
});

describe('scheduleDuration', () => {
  const t = timing(20);

  it('returns 0 for empty schedule', () => {
    expect(scheduleDuration([])).toBe(0);
  });

  it('returns dot duration for single dot', () => {
    const events = buildSchedule('.', t);
    expect(scheduleDuration(events)).toBe(60);
  });

  it('returns dash duration for single dash', () => {
    const events = buildSchedule('-', t);
    expect(scheduleDuration(events)).toBe(180);
  });

  it('calculates correct SOS duration', () => {
    const events = buildSchedule('... --- ...', t);
    const dur = scheduleDuration(events);
    // S: dot + gap + dot + gap + dot = 60+60+60+60+60 = 300
    // interChar: 180
    // O: dash + gap + dash + gap + dash = 180+60+180+60+180 = 660
    // interChar: 180
    // S: 300
    // Total: 300 + 180 + 660 + 180 + 300 = 1620
    expect(dur).toBe(1620);
  });

  it('includes inter-word gap in total duration', () => {
    const events = buildSchedule('. / .', t);
    // dot + wordGap + dot = 60 + 420 + 60 = 540
    expect(scheduleDuration(events)).toBe(540);
  });
});
