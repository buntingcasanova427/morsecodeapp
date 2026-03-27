/**
 * @morsecodeapp/morse/core — Tree-shakeable core module
 * Encode, decode, charsets, prosigns, timing, stats, validation.
 * No DOM / Web Audio dependencies.
 *
 * @see https://morsecodeapp.com
 * @license MIT
 */

// Types
export type {
  CharsetId,
  Charset,
  EncodeOptions,
  DecodeOptions,
  EncodeResult,
  DecodeResult,
  TimingValues,
  Prosign,
  MorseStats,
} from './types.js';

// Encode / Decode
export { encode, encodeDetailed } from './encode.js';
export { decode, decodeDetailed } from './decode.js';

// Charsets
export {
  getCharset,
  listCharsets,
  listCharsetsDetailed,
  detectCharset,
  itu,
  american,
  latinExt,
  cyrillic,
  greek,
  hebrew,
  arabic,
  persian,
  japanese,
  korean,
  thai,
} from './charsets/index.js';

// Prosigns
export {
  PROSIGNS,
  encodeProsign,
  decodeProsign,
  getProsign,
  listProsigns,
} from './prosigns.js';

// Timing
export {
  timing,
  farnsworthTiming,
  duration,
  formatDuration,
  DEFAULT_WPM,
  MIN_WPM,
  MAX_WPM,
} from './timing.js';

// Stats
export { stats } from './stats.js';

// Validation
export {
  isValidMorse,
  isEncodable,
  isDecodable,
  findInvalidChars,
  findInvalidPatterns,
} from './validate.js';
