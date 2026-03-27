/**
 * Prosigns — procedural signals sent as single unbroken characters
 * @see https://morsecodeapp.com
 */

import type { Prosign } from './types.js';

/** Standard ITU prosigns */
export const PROSIGNS: readonly Prosign[] = [
  { label: 'SOS',  morse: '...---...',  meaning: 'International distress signal' },
  { label: 'AR',   morse: '.-.-.',      meaning: 'End of message' },
  { label: 'SK',   morse: '...-.-',     meaning: 'End of contact / Silent Key' },
  { label: 'BT',   morse: '-...-',      meaning: 'Break / New paragraph' },
  { label: 'KN',   morse: '-.--.',      meaning: 'Go ahead, named station only' },
  { label: 'AS',   morse: '.-...',      meaning: 'Wait / Stand by' },
  { label: 'CL',   morse: '-.-..-..',   meaning: 'Closing station' },
  { label: 'CT',   morse: '-.-.-',      meaning: 'Commence transmission' },
  { label: 'SN',   morse: '...-.',      meaning: 'Understood / Verified' },
  { label: 'HH',   morse: '........',   meaning: 'Error / Correction' },
] as const;

/** Prosign label → morse pattern */
const labelToMorse = new Map<string, string>(
  PROSIGNS.map((p) => [p.label, p.morse]),
);

/** Morse pattern → prosign label */
const morseToLabel = new Map<string, string>(
  PROSIGNS.map((p) => [p.morse, p.label]),
);

/**
 * Get the morse pattern for a prosign.
 * @param label - e.g., 'SOS', 'AR'
 */
export function encodeProsign(label: string): string | undefined {
  return labelToMorse.get(label.toUpperCase());
}

/**
 * Check if a morse pattern is a known prosign.
 * @returns The prosign label or undefined
 */
export function decodeProsign(morse: string): string | undefined {
  return morseToLabel.get(morse);
}

/**
 * Get full prosign info by label.
 */
export function getProsign(label: string): Prosign | undefined {
  return PROSIGNS.find((p) => p.label === label.toUpperCase());
}

/** List all prosign labels */
export function listProsigns(): string[] {
  return PROSIGNS.map((p) => p.label);
}
