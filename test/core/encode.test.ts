import { describe, it, expect } from 'vitest';
import { encode, encodeDetailed } from '../../src/core/encode.js';

describe('encode', () => {
  it('encodes simple letters', () => {
    expect(encode('SOS')).toBe('... --- ...');
  });

  it('encodes hello world', () => {
    expect(encode('HELLO WORLD')).toBe(
      '.... . .-.. .-.. --- / .-- --- .-. .-.. -..',
    );
  });

  it('is case-insensitive', () => {
    expect(encode('hello')).toBe(encode('HELLO'));
  });

  it('encodes numbers', () => {
    expect(encode('123')).toBe('.---- ..--- ...--');
  });

  it('encodes punctuation', () => {
    expect(encode('A.B')).toBe('.- .-.-.- -...');
  });

  it('handles multiple spaces as word separator', () => {
    expect(encode('A  B')).toBe('.- / -...');
  });

  it('marks unknown characters with ?', () => {
    expect(encode('A§B')).toBe('.- ? -...');
  });

  it('supports custom dot/dash symbols', () => {
    expect(encode('E', { dot: '•', dash: '—' })).toBe('•');
    expect(encode('T', { dot: '•', dash: '—' })).toBe('—');
    expect(encode('A', { dot: '•', dash: '—' })).toBe('•—');
  });

  it('supports custom separators', () => {
    expect(
      encode('AB', { separator: ' | ', wordSeparator: ' || ' }),
    ).toBe('.- | -...');
  });

  it('encodes with cyrillic charset', () => {
    expect(encode('А', { charset: 'cyrillic' })).toBe('.-');
    expect(encode('Б', { charset: 'cyrillic' })).toBe('-...');
  });

  it('encodes with fallback charsets', () => {
    // Mix Latin and Cyrillic — 'A' is in ITU, 'Б' only in Cyrillic
    const result = encodeDetailed('AБ', {
      charset: 'itu',
      fallbackCharsets: ['cyrillic'],
    });
    expect(result.morse).toBe('.- -...');
    expect(result.valid).toBe(true);
  });
});

describe('encodeDetailed', () => {
  it('returns valid: true when all chars are known', () => {
    const result = encodeDetailed('SOS');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns errors for unknown characters', () => {
    const result = encodeDetailed('A§B©');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('§');
    expect(result.errors).toContain('©');
  });
});
