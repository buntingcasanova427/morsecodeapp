import { describe, it, expect } from 'vitest';
import { decode, decodeDetailed } from '../../src/core/decode.js';

describe('decode', () => {
  it('decodes SOS', () => {
    expect(decode('... --- ...')).toBe('SOS');
  });

  it('decodes HELLO WORLD', () => {
    expect(
      decode('.... . .-.. .-.. --- / .-- --- .-. .-.. -..'),
    ).toBe('HELLO WORLD');
  });

  it('decodes numbers', () => {
    expect(decode('.---- ..--- ...--')).toBe('123');
  });

  it('handles unknown patterns', () => {
    expect(decode('... ........ ---')).toBe('S?O');
  });

  it('supports custom dot/dash symbols', () => {
    expect(decode('•—', { dot: '•', dash: '—' })).toBe('A');
  });

  it('decodes with cyrillic charset', () => {
    expect(decode('.-', { charset: 'cyrillic' })).toBe('А');
  });

  it('decodes with fallback charsets', () => {
    // '.---' is J in ITU but also ע in Hebrew
    // With ITU primary, should decode to J
    expect(decode('.---', { charset: 'itu' })).toBe('J');
  });
});

describe('decodeDetailed', () => {
  it('returns valid: true for known patterns', () => {
    const result = decodeDetailed('... --- ...');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns errors for unknown patterns', () => {
    const result = decodeDetailed('... ........ ---');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('........');
  });
});
