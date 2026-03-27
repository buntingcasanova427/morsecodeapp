/**
 * Persian (Farsi) Morse Code — extends Arabic with additional characters
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

const charToMorse: Record<string, string> = {
  'ا': '.-',     'ب': '-...',   'پ': '.--.',   'ت': '-',
  'ث': '-.-.',   'ج': '.---',   'چ': '---.',   'ح': '....',
  'خ': '-..-',   'د': '-..',    'ذ': '...-',   'ر': '.-.',
  'ز': '--..',   'ژ': '--.',    'س': '...',    'ش': '----',
  'ص': '.-.-',   'ض': '..--..',  'ط': '..-',    'ظ': '-.--',
  'ع': '---',    'غ': '..--',   'ف': '..-.',   'ق': '...---',
  'ک': '-.-',    'گ': '--.-',   'ل': '.-..',   'م': '--',
  'ن': '-.',     'و': '.--',    'ه': '.',      'ی': '..',

  '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',
  '4': '....-',  '5': '.....',  '6': '-....',  '7': '--...',
  '8': '---..',  '9': '----.',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const persian: Charset = {
  id: 'persian',
  name: 'Persian (Farsi)',
  charToMorse,
  morseToChar,
};
