/**
 * Morse code decoder — converts morse code back to text.
 * @see https://morsecodeapp.com
 */

import type { CharsetId, DecodeOptions, DecodeResult } from './types.js';
import { getCharset } from './charsets/index.js';

/** Default decode options */
const DEFAULTS: Required<DecodeOptions> = {
  charset: 'itu',
  fallbackCharsets: [],
  dot: '.',
  dash: '-',
  separator: ' ',
  wordSeparator: ' / ',
  invalid: '?',
};

/**
 * Decode morse code to text.
 *
 * @example
 * ```ts
 * decode('... --- ...')          // 'SOS'
 * decode('.... . .-.. .-.. ---') // 'HELLO'
 * ```
 */
export function decode(morse: string, options?: DecodeOptions): string {
  return decodeDetailed(morse, options).text;
}

/**
 * Decode morse code to text with detailed results.
 * Returns the text plus validity info and any unrecognized patterns.
 */
export function decodeDetailed(
  morse: string,
  options?: DecodeOptions,
): DecodeResult {
  const opts = { ...DEFAULTS, ...options };
  const charset = getCharset(opts.charset);
  const fallbacks = opts.fallbackCharsets.map((id: CharsetId) => getCharset(id));

  const errors: string[] = [];

  // Normalize input: replace custom dot/dash with standard
  let normalized = morse;
  if (opts.dot !== '.' || opts.dash !== '-') {
    normalized = morse
      .replace(new RegExp(escapeRegex(opts.dot), 'g'), '\x00')
      .replace(new RegExp(escapeRegex(opts.dash), 'g'), '-')
      .replace(/\x00/g, '.');
  }

  // Split into words by word separator
  const wordSep = opts.wordSeparator.trim() || '/';
  const words = normalized.split(new RegExp(`\\s*${escapeRegex(wordSep)}\\s*`));
  const textWords: string[] = [];

  for (const word of words) {
    const patterns = word.trim().split(/\s+/).filter(Boolean);
    let textChars = '';

    for (const pattern of patterns) {
      let ch = charset.morseToChar[pattern];

      // Try fallback charsets
      if (ch === undefined) {
        for (const fb of fallbacks) {
          ch = fb.morseToChar[pattern];
          if (ch !== undefined) break;
        }
      }

      if (ch !== undefined) {
        textChars += ch;
      } else {
        errors.push(pattern);
        textChars += opts.invalid;
      }
    }

    textWords.push(textChars);
  }

  return {
    text: textWords.join(' '),
    valid: errors.length === 0,
    errors: [...new Set(errors)],
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
