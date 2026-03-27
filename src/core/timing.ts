/**
 * PARIS timing calculator — millisecond durations for morse code elements.
 *
 * The word PARIS is the international standard for measuring morse code speed.
 * PARIS = 50 dot-units, so at W WPM: unit = 1200 / W ms.
 *
 * Farnsworth timing sends characters at a faster speed but adds extra space
 * between characters and words to slow overall speed.
 *
 * @see https://morsecodeapp.com
 */

import type { TimingValues } from './types.js';

/** Default words-per-minute */
export const DEFAULT_WPM = 20;

/** Minimum WPM allowed */
export const MIN_WPM = 1;

/** Maximum WPM allowed */
export const MAX_WPM = 60;

/**
 * Calculate standard PARIS timing values.
 * @param wpm - Words per minute (1–60)
 */
export function timing(wpm: number = DEFAULT_WPM): TimingValues {
  const w = clampWpm(wpm);
  const unit = 1200 / w;

  return {
    unit,
    dot: unit,
    dash: unit * 3,
    intraChar: unit,
    interChar: unit * 3,
    interWord: unit * 7,
  };
}

/**
 * Calculate Farnsworth timing values.
 * Characters are sent at `charWpm`, overall speed is `overallWpm`.
 * Extra delay is added between characters and words.
 *
 * @param overallWpm - Desired effective WPM (slower)
 * @param charWpm - Character sending speed (faster)
 */
export function farnsworthTiming(
  overallWpm: number = 15,
  charWpm: number = DEFAULT_WPM,
): TimingValues {
  const ow = clampWpm(overallWpm);
  const cw = clampWpm(Math.max(charWpm, ow));

  const charUnit = 1200 / cw;

  // Total time for PARIS at overall speed
  const totalTime = (60 / ow) * 1000; // ms for one "PARIS " at overall WPM
  // Time taken by characters at char speed (31 units of character content in PARIS)
  const charTime = 31 * charUnit;
  // Remaining time distributed among 19 inter-element spaces in PARIS
  const extraTime = Math.max(0, totalTime - charTime);
  const delayUnit = extraTime / 19;

  return {
    unit: charUnit,
    dot: charUnit,
    dash: charUnit * 3,
    intraChar: charUnit,
    interChar: delayUnit * 3,
    interWord: delayUnit * 7,
  };
}

/**
 * Calculate the duration of a morse string in milliseconds.
 * @param morse - Morse string (dots, dashes, spaces)
 * @param wpm - Speed in WPM
 */
export function duration(morse: string, wpm: number = DEFAULT_WPM): number {
  const t = timing(wpm);
  let ms = 0;

  const words = morse.split(/\s*\/\s*/);
  for (let wi = 0; wi < words.length; wi++) {
    if (wi > 0) ms += t.interWord;
    const word = words[wi];
    if (!word) continue;
    const letters = word.trim().split(/\s+/);
    for (let li = 0; li < letters.length; li++) {
      if (li > 0) ms += t.interChar;
      const signals = letters[li];
      if (!signals) continue;
      for (let si = 0; si < signals.length; si++) {
        if (si > 0) ms += t.intraChar;
        ms += signals.charAt(si) === '-' ? t.dash : t.dot;
      }
    }
  }

  return Math.round(ms);
}

/**
 * Format milliseconds to a human-readable string.
 * @example formatDuration(3500) → "3.5s"
 * @example formatDuration(65000) → "1m 5.0s"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const totalSec = ms / 1000;
  if (totalSec < 60) return `${totalSec.toFixed(1)}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}m ${sec.toFixed(1)}s`;
}

function clampWpm(wpm: number): number {
  return Math.max(MIN_WPM, Math.min(MAX_WPM, Math.round(wpm)));
}
