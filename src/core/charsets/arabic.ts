/**
 * Arabic Morse Code
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

const charToMorse: Record<string, string> = {
  'ا': '.-',     'ب': '-...',   'ت': '-',      'ث': '-.-.',
  'ج': '.---',   'ح': '....',   'خ': '---',    'د': '-..',
  'ذ': '--..',   'ر': '.-.',    'ز': '---.',   'س': '...',
  'ش': '----',   'ص': '-..-',   'ض': '...-',   'ط': '..-',
  'ظ': '-.--',   'ع': '.-.-',   'غ': '--.',    'ف': '..-.',
  'ق': '--.-',   'ك': '-.-',    'ل': '.-..',   'م': '--',
  'ن': '-.',     'ه': '..--..',  'و': '.--',    'ي': '..',
  'ء': '.',      'ئ': '-..-.',  'ؤ': '..--',   'لا': '.-...-',

  '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',
  '4': '....-',  '5': '.....',  '6': '-....',  '7': '--...',
  '8': '---..',  '9': '----.',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const arabic: Charset = {
  id: 'arabic',
  name: 'Arabic',
  charToMorse,
  morseToChar,
};
