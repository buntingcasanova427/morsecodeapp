import { describe, it, expect } from 'vitest';
import {
  isValidMorse,
  isEncodable,
  isDecodable,
  findInvalidChars,
  findInvalidPatterns,
} from '../../src/core/validate.js';

describe('isValidMorse', () => {
  it('accepts valid morse string', () => {
    expect(isValidMorse('... --- ...')).toBe(true);
  });

  it('accepts word separators', () => {
    expect(isValidMorse('.- / -...')).toBe(true);
  });

  it('rejects strings with letters', () => {
    expect(isValidMorse('HELLO')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidMorse('')).toBe(false);
  });
});

describe('isEncodable', () => {
  it('returns true for ASCII text with ITU', () => {
    expect(isEncodable('HELLO 123')).toBe(true);
  });

  it('returns false for unsupported characters', () => {
    expect(isEncodable('HELLO §')).toBe(false);
  });

  it('works with other charsets', () => {
    expect(isEncodable('ПРИВЕТ', 'cyrillic')).toBe(true);
    expect(isEncodable('ПРИВЕТ', 'itu')).toBe(false);
  });
});

describe('isDecodable', () => {
  it('returns true for valid morse with known patterns', () => {
    expect(isDecodable('... --- ...')).toBe(true);
  });

  it('returns false for unknown patterns', () => {
    expect(isDecodable('........')).toBe(false);
  });

  it('returns false for non-morse input', () => {
    expect(isDecodable('HELLO')).toBe(false);
  });
});

describe('findInvalidChars', () => {
  it('returns empty array for valid text', () => {
    expect(findInvalidChars('SOS')).toEqual([]);
  });

  it('returns invalid characters', () => {
    const invalid = findInvalidChars('A§B©');
    expect(invalid).toContain('§');
    expect(invalid).toContain('©');
  });
});

describe('findInvalidPatterns', () => {
  it('returns empty array for valid morse', () => {
    expect(findInvalidPatterns('... --- ...')).toEqual([]);
  });

  it('returns unknown patterns', () => {
    const invalid = findInvalidPatterns('... ........ ---');
    expect(invalid).toContain('........');
  });
});
