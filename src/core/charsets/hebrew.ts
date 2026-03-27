/**
 * Hebrew Morse Code
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

const charToMorse: Record<string, string> = {
  'א': '.-',     'ב': '-...',   'ג': '--.',    'ד': '-..',
  'ה': '---',    'ו': '.',      'ז': '--..',   'ח': '....',
  'ט': '..-',    'י': '..',     'כ': '-.-',    'ל': '.-..',
  'מ': '--',     'נ': '-.',     'ס': '-.-.',   'ע': '.---',
  'פ': '.--.',   'צ': '.--',    'ק': '--.-',   'ר': '.-.',
  'ש': '...',    'ת': '-',

  '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',
  '4': '....-',  '5': '.....',  '6': '-....',  '7': '--...',
  '8': '---..',  '9': '----.',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const hebrew: Charset = {
  id: 'hebrew',
  name: 'Hebrew',
  charToMorse,
  morseToChar,
};
