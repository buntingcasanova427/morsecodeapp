/**
 * Morse code encoder — converts text to morse code.
 * @see https://morsecodeapp.com
 */

import type { CharsetId, EncodeOptions, EncodeResult } from './types.js';
import { getCharset } from './charsets/index.js';

/** Default encode options */
const DEFAULTS: Required<EncodeOptions> = {
  charset: 'itu',
  fallbackCharsets: [],
  dot: '.',
  dash: '-',
  separator: ' ',
  wordSeparator: ' / ',
  invalid: '?',
};

/**
 * Encode text to morse code.
 *
 * @example
 * ```ts
 * encode('SOS')        // '... --- ...'
 * encode('Hello')      // '.... . .-.. .-.. ---'
 * encode('Привет', { charset: 'cyrillic' })
 * ```
 */
export function encode(text: string, options?: EncodeOptions): string {
  return encodeDetailed(text, options).morse;
}

/**
 * Encode text to morse code with detailed results.
 * Returns the morse string plus validity info and any errors.
 */
export function encodeDetailed(
  text: string,
  options?: EncodeOptions,
): EncodeResult {
  const opts = { ...DEFAULTS, ...options };
  const charset = getCharset(opts.charset);
  const fallbacks = opts.fallbackCharsets.map((id: CharsetId) => getCharset(id));

  const errors: string[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  const morseWords: string[] = [];

  for (const word of words) {
    const morseChars: string[] = [];
    for (const ch of word) {
      const upper = ch.toUpperCase();
      let pattern = charset.charToMorse[upper];

      // Try fallback charsets
      if (pattern === undefined) {
        for (const fb of fallbacks) {
          pattern = fb.charToMorse[upper];
          if (pattern !== undefined) break;
        }
      }

      if (pattern !== undefined) {
        // Replace dots/dashes if custom symbols requested
        let output = pattern;
        if (opts.dot !== '.' || opts.dash !== '-') {
          output = pattern
            .replace(/\./g, '\x00')
            .replace(/-/g, opts.dash)
            .replace(/\x00/g, opts.dot);
        }
        morseChars.push(output);
      } else {
        errors.push(ch);
        morseChars.push(opts.invalid);
      }
    }
    morseWords.push(morseChars.join(opts.separator));
  }

  return {
    morse: morseWords.join(opts.wordSeparator),
    valid: errors.length === 0,
    errors: [...new Set(errors)],
  };
}
