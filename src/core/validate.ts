/**
 * Morse code validation utilities
 * @see https://morsecodeapp.com
 */

import type { CharsetId } from './types.js';
import { getCharset } from './charsets/index.js';

/**
 * Check if a string is valid morse code (only contains dots, dashes, spaces, slashes).
 */
export function isValidMorse(morse: string): boolean {
  return /^[.\-\s/]+$/.test(morse.trim());
}

/**
 * Check if all characters in text can be encoded with the given charset.
 * Returns true if every non-space character has a mapping.
 */
export function isEncodable(text: string, charset: CharsetId = 'itu'): boolean {
  const cs = getCharset(charset);
  for (const ch of text) {
    if (ch === ' ' || ch === '\t' || ch === '\n') continue;
    if (cs.charToMorse[ch.toUpperCase()] === undefined) return false;
  }
  return true;
}

/**
 * Check if all morse patterns can be decoded with the given charset.
 * Returns true if every morse group has a mapping.
 */
export function isDecodable(morse: string, charset: CharsetId = 'itu'): boolean {
  if (!isValidMorse(morse)) return false;
  const cs = getCharset(charset);
  const words = morse.split(/\s*\/\s*/).filter(Boolean);
  for (const word of words) {
    const patterns = word.trim().split(/\s+/).filter(Boolean);
    for (const pattern of patterns) {
      if (cs.morseToChar[pattern] === undefined) return false;
    }
  }
  return true;
}

/**
 * Find characters in text that cannot be encoded.
 * Useful for showing users which characters are unsupported.
 */
export function findInvalidChars(text: string, charset: CharsetId = 'itu'): string[] {
  const cs = getCharset(charset);
  const invalid = new Set<string>();
  for (const ch of text) {
    if (ch === ' ' || ch === '\t' || ch === '\n') continue;
    if (cs.charToMorse[ch.toUpperCase()] === undefined) {
      invalid.add(ch);
    }
  }
  return [...invalid];
}

/**
 * Find morse patterns that cannot be decoded.
 */
export function findInvalidPatterns(morse: string, charset: CharsetId = 'itu'): string[] {
  const cs = getCharset(charset);
  const invalid = new Set<string>();
  const words = morse.split(/\s*\/\s*/).filter(Boolean);
  for (const word of words) {
    const patterns = word.trim().split(/\s+/).filter(Boolean);
    for (const pattern of patterns) {
      if (cs.morseToChar[pattern] === undefined) {
        invalid.add(pattern);
      }
    }
  }
  return [...invalid];
}
