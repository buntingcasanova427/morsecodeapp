/**
 * Morse → timed event scheduler.
 * Converts a morse string and timing values into a timeline of tone/silence events.
 * Used by both MorsePlayer and WAV export for consistent audio generation.
 *
 * @see https://morsecodeapp.com
 */

import type { TimingValues } from '../core/types.js';

/** A single event in the playback schedule */
export interface ScheduleEvent {
  /** Event type */
  type: 'tone' | 'silence';
  /** Start time in milliseconds from beginning */
  start: number;
  /** Duration in milliseconds */
  duration: number;
  /** Signal type (tone events only) */
  signal?: 'dot' | 'dash';
  /** The morse pattern this signal belongs to (e.g., '.-') */
  morseChar?: string;
  /** Sequential character index in the message */
  charIndex?: number;
}

/**
 * Build a schedule of tones and silences from a morse string.
 *
 * @param morse - Standard morse string (dots, dashes, spaces, slashes)
 * @param timings - Timing values from timing() or farnsworthTiming()
 * @returns Array of timed events
 */
export function buildSchedule(
  morse: string,
  timings: TimingValues,
): ScheduleEvent[] {
  const trimmed = morse.trim();
  if (!trimmed) return [];

  const events: ScheduleEvent[] = [];
  let cursor = 0;
  let charIndex = 0;

  const words = trimmed.split(/\s*\/\s*/);

  for (let wi = 0; wi < words.length; wi++) {
    if (wi > 0) {
      events.push({ type: 'silence', start: cursor, duration: timings.interWord });
      cursor += timings.interWord;
    }

    const word = words[wi];
    if (!word) continue;
    const letters = word.trim().split(/\s+/);

    for (let li = 0; li < letters.length; li++) {
      if (li > 0) {
        events.push({ type: 'silence', start: cursor, duration: timings.interChar });
        cursor += timings.interChar;
      }

      const morseChar = letters[li];
      if (!morseChar) continue;

      for (let si = 0; si < morseChar.length; si++) {
        if (si > 0) {
          events.push({ type: 'silence', start: cursor, duration: timings.intraChar });
          cursor += timings.intraChar;
        }

        const isDash = morseChar.charAt(si) === '-';
        const duration = isDash ? timings.dash : timings.dot;
        events.push({
          type: 'tone',
          start: cursor,
          duration,
          signal: isDash ? 'dash' : 'dot',
          morseChar,
          charIndex,
        });
        cursor += duration;
      }

      charIndex++;
    }
  }

  return events;
}

/**
 * Get total duration of a schedule in milliseconds.
 */
export function scheduleDuration(events: ScheduleEvent[]): number {
  if (events.length === 0) return 0;
  const last = events[events.length - 1]!;
  return Math.round(last.start + last.duration);
}
