/**
 * Charset registry — lazy-loaded map of all supported character sets.
 * @see https://morsecodeapp.com
 */

import type { Charset, CharsetId } from '../types.js';
import { itu } from './itu.js';
import { american } from './american.js';
import { latinExt } from './latin-ext.js';
import { cyrillic } from './cyrillic.js';
import { greek } from './greek.js';
import { hebrew } from './hebrew.js';
import { arabic } from './arabic.js';
import { persian } from './persian.js';
import { japanese } from './japanese.js';
import { korean } from './korean.js';
import { thai } from './thai.js';

/** All registered charsets keyed by id */
const registry: ReadonlyMap<CharsetId, Charset> = new Map<CharsetId, Charset>([
  ['itu', itu],
  ['american', american],
  ['latin-ext', latinExt],
  ['cyrillic', cyrillic],
  ['greek', greek],
  ['hebrew', hebrew],
  ['arabic', arabic],
  ['persian', persian],
  ['japanese', japanese],
  ['korean', korean],
  ['thai', thai],
]);

/**
 * Get a charset by id.
 * @throws {Error} If charset id is unknown
 */
export function getCharset(id: CharsetId = 'itu'): Charset {
  const cs = registry.get(id);
  if (!cs) {
    throw new Error(
      `Unknown charset "${id}". Available: ${listCharsets().join(', ')}`,
    );
  }
  return cs;
}

/** List all available charset ids */
export function listCharsets(): CharsetId[] {
  return [...registry.keys()];
}

/** List all available charsets with metadata */
export function listCharsetsDetailed(): Array<{ id: CharsetId; name: string; size: number }> {
  return [...registry.values()].map((cs) => ({
    id: cs.id,
    name: cs.name,
    size: Object.keys(cs.charToMorse).length,
  }));
}

/**
 * Auto-detect the best charset for given text.
 * Returns the charset whose character map covers the most input characters.
 */
export function detectCharset(text: string): CharsetId {
  const upper = text.toUpperCase();
  let bestId: CharsetId = 'itu';
  let bestScore = 0;

  for (const [id, cs] of registry) {
    let score = 0;
    for (const ch of upper) {
      if (ch === ' ') continue;
      if (cs.charToMorse[ch] !== undefined) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  return bestId;
}

// Re-export individual charsets for direct import
export { itu } from './itu.js';
export { american } from './american.js';
export { latinExt } from './latin-ext.js';
export { cyrillic } from './cyrillic.js';
export { greek } from './greek.js';
export { hebrew } from './hebrew.js';
export { arabic } from './arabic.js';
export { persian } from './persian.js';
export { japanese } from './japanese.js';
export { korean } from './korean.js';
export { thai } from './thai.js';
