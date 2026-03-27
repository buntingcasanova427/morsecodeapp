/**
 * @morsecodeapp/morse — Core types
 * @see https://morsecodeapp.com
 */

/** Supported character set identifiers */
export type CharsetId =
  | 'itu'
  | 'american'
  | 'latin-ext'
  | 'cyrillic'
  | 'greek'
  | 'hebrew'
  | 'arabic'
  | 'persian'
  | 'japanese'
  | 'korean'
  | 'thai';

/** A bidirectional mapping of characters ↔ morse patterns */
export interface Charset {
  /** Unique identifier */
  readonly id: CharsetId;
  /** Human-readable name */
  readonly name: string;
  /** Character → morse dot/dash pattern (using '.' and '-') */
  readonly charToMorse: Readonly<Record<string, string>>;
  /** Morse pattern → character (reverse lookup) */
  readonly morseToChar: Readonly<Record<string, string>>;
}

/** Options for encode() */
export interface EncodeOptions {
  /** Character set to use (default: 'itu') */
  charset?: CharsetId;
  /** Additional charsets to search after primary (for mixed-script text) */
  fallbackCharsets?: CharsetId[];
  /** Dot character in output (default: '.') */
  dot?: string;
  /** Dash character in output (default: '-') */
  dash?: string;
  /** Separator between letters (default: ' ') */
  separator?: string;
  /** Separator between words (default: ' / ') */
  wordSeparator?: string;
  /** Replacement for unknown characters (default: '?') */
  invalid?: string;
}

/** Options for decode() */
export interface DecodeOptions {
  /** Character set to use (default: 'itu') */
  charset?: CharsetId;
  /** Additional charsets to search after primary */
  fallbackCharsets?: CharsetId[];
  /** Dot character in input (default: '.') */
  dot?: string;
  /** Dash character in input (default: '-') */
  dash?: string;
  /** Separator between letters (default: ' ') */
  separator?: string;
  /** Separator between words (default: ' / ') */
  wordSeparator?: string;
  /** Replacement for unknown morse sequences (default: '?') */
  invalid?: string;
}

/** Result of encode() with detailed info */
export interface EncodeResult {
  /** The morse code string */
  morse: string;
  /** Whether all characters were valid */
  valid: boolean;
  /** Characters that could not be encoded */
  errors: string[];
}

/** Result of decode() with detailed info */
export interface DecodeResult {
  /** The decoded text */
  text: string;
  /** Whether all morse sequences were valid */
  valid: boolean;
  /** Morse sequences that could not be decoded */
  errors: string[];
}

/** PARIS timing values in milliseconds */
export interface TimingValues {
  /** Duration of a dot (1 unit) */
  dot: number;
  /** Duration of a dash (3 units) */
  dash: number;
  /** Gap between signals within a character (1 unit) */
  intraChar: number;
  /** Gap between characters (3 units, or extended for Farnsworth) */
  interChar: number;
  /** Gap between words (7 units, or extended for Farnsworth) */
  interWord: number;
  /** Base unit duration in ms */
  unit: number;
}

/** Prosign definition */
export interface Prosign {
  /** The prosign abbreviation (e.g., 'SOS') */
  label: string;
  /** Morse pattern with no inter-character gaps */
  morse: string;
  /** Human-readable meaning */
  meaning: string;
}

/** Stats about a morse code string */
export interface MorseStats {
  /** Number of dots */
  dots: number;
  /** Number of dashes */
  dashes: number;
  /** Total signals (dots + dashes) */
  signals: number;
  /** Number of characters (letters/numbers) */
  characters: number;
  /** Number of words */
  words: number;
  /** Estimated duration in milliseconds */
  durationMs: number;
  /** Estimated duration in seconds (1 decimal) */
  durationSec: string;
  /** Formatted duration string */
  durationFormatted: string;
}
