/**
 * Latin Extended — accented characters for European languages
 * Extension of ITU; import ITU as base and overlay accented chars
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';
import { itu } from './itu.js';

const accented: Record<string, string> = {
  'À': '.--.-',   'Á': '.--.-',   'Â': '.--.-',
  'Ä': '.-.-',    'Å': '.--.-',   'Ç': '-.-..',
  'È': '.-..-',   'É': '..-.',    'Ê': '-..-.',
  'Ñ': '--.--',   'Ö': '---.',    'Ü': '..--',
  'Ð': '..--..',  'Þ': '.--..',
  'Ś': '...-...',  'Ź': '--..-.',  'Ż': '--..-',
  'Ą': '.-.-',    'Ć': '-.-..',   'Ę': '..-..',
  'Ł': '.-..-',   'Ó': '---.',    'Ń': '--.--',
  'Š': '----',    'Ž': '--..-',   'Č': '-..-.',
};

const charToMorse: Record<string, string> = {
  ...itu.charToMorse,
  ...accented,
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const latinExt: Charset = {
  id: 'latin-ext',
  name: 'Latin Extended',
  charToMorse,
  morseToChar,
};
