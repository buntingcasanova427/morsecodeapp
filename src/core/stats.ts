/**
 * Morse code statistics calculator
 * @see https://morsecodeapp.com
 */

import type { MorseStats } from './types.js';
import { duration, formatDuration, DEFAULT_WPM } from './timing.js';

/**
 * Compute statistics for a morse code string.
 *
 * @example
 * ```ts
 * stats('... --- ...')
 * // { dots: 6, dashes: 3, signals: 9, characters: 3, words: 1, ... }
 * ```
 */
export function stats(morse: string, wpm: number = DEFAULT_WPM): MorseStats {
  const dots = (morse.match(/\./g) || []).length;
  const dashes = (morse.match(/-/g) || []).length;

  // Characters = groups of consecutive dots/dashes
  const words = morse.split(/\s*\/\s*/).filter(Boolean);
  let characters = 0;
  for (const word of words) {
    const letters = word.trim().split(/\s+/).filter(Boolean);
    characters += letters.length;
  }

  const durationMs = duration(morse, wpm);
  const durationSec = (durationMs / 1000).toFixed(1);

  return {
    dots,
    dashes,
    signals: dots + dashes,
    characters,
    words: words.length,
    durationMs,
    durationSec,
    durationFormatted: formatDuration(durationMs),
  };
}
