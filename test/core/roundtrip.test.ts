import { describe, it, expect } from 'vitest';
import { encode, decode } from '../../src/core/index.js';

describe('encode ↔ decode roundtrip', () => {
  const testCases = [
    'SOS',
    'HELLO WORLD',
    'THE QUICK BROWN FOX',
    'MORSE CODE',
    '1234567890',
    'A1B2C3',
  ];

  for (const text of testCases) {
    it(`round-trips "${text}"`, () => {
      const morse = encode(text);
      const decoded = decode(morse);
      expect(decoded).toBe(text);
    });
  }

  it('round-trips all ITU letters', () => {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const morse = encode(alpha);
    expect(decode(morse)).toBe(alpha);
  });

  it('round-trips all ITU numbers', () => {
    const nums = '0123456789';
    const morse = encode(nums);
    expect(decode(morse)).toBe(nums);
  });
});
