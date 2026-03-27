import { describe, it, expect } from 'vitest';
import { stats } from '../../src/core/stats.js';

describe('stats', () => {
  it('counts dots and dashes in SOS', () => {
    const s = stats('... --- ...');
    expect(s.dots).toBe(6);
    expect(s.dashes).toBe(3);
    expect(s.signals).toBe(9);
  });

  it('counts characters and words', () => {
    const s = stats('.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
    expect(s.characters).toBe(10);
    expect(s.words).toBe(2);
  });

  it('computes duration > 0', () => {
    const s = stats('... --- ...');
    expect(s.durationMs).toBeGreaterThan(0);
    expect(parseFloat(s.durationSec)).toBeGreaterThan(0);
  });

  it('formats duration', () => {
    const s = stats('... --- ...');
    expect(s.durationFormatted).toMatch(/\d/);
  });
});
