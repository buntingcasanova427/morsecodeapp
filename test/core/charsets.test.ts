import { describe, it, expect } from 'vitest';
import {
  getCharset,
  listCharsets,
  listCharsetsDetailed,
  detectCharset,
} from '../../src/core/charsets/index.js';

describe('getCharset', () => {
  it('returns ITU by default', () => {
    const cs = getCharset();
    expect(cs.id).toBe('itu');
  });

  it('returns requested charset', () => {
    const cs = getCharset('cyrillic');
    expect(cs.id).toBe('cyrillic');
    expect(cs.name).toBe('Russian/Cyrillic');
  });

  it('throws for unknown charset', () => {
    expect(() => getCharset('klingon' as any)).toThrowError(/Unknown charset/);
  });
});

describe('listCharsets', () => {
  it('lists all 11 charset ids', () => {
    const ids = listCharsets();
    expect(ids).toHaveLength(11);
    expect(ids).toContain('itu');
    expect(ids).toContain('cyrillic');
    expect(ids).toContain('japanese');
    expect(ids).toContain('korean');
    expect(ids).toContain('thai');
  });
});

describe('listCharsetsDetailed', () => {
  it('returns objects with id, name, size', () => {
    const list = listCharsetsDetailed();
    const itu = list.find((c) => c.id === 'itu');
    expect(itu).toBeDefined();
    expect(itu!.name).toBe('International (ITU)');
    expect(itu!.size).toBeGreaterThan(36);
  });
});

describe('detectCharset', () => {
  it('detects ITU for English text', () => {
    expect(detectCharset('HELLO WORLD')).toBe('itu');
  });

  it('detects cyrillic for Russian text', () => {
    expect(detectCharset('ПРИВЕТ МИР')).toBe('cyrillic');
  });

  it('detects japanese for katakana', () => {
    expect(detectCharset('アイウエオ')).toBe('japanese');
  });
});

describe('charset bidirectional consistency', () => {
  it('every charToMorse entry has a reverse morseToChar entry for ITU', () => {
    const cs = getCharset('itu');
    for (const [char, morse] of Object.entries(cs.charToMorse)) {
      expect(cs.morseToChar[morse]).toBeDefined();
    }
  });

  it('ITU has A-Z 0-9', () => {
    const cs = getCharset('itu');
    for (let c = 65; c <= 90; c++) {
      expect(cs.charToMorse[String.fromCharCode(c)]).toBeDefined();
    }
    for (let d = 0; d <= 9; d++) {
      expect(cs.charToMorse[String(d)]).toBeDefined();
    }
  });
});
