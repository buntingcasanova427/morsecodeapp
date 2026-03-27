/**
 * ITU International Morse Code (ITU-R M.1677-1)
 * Latin letters A–Z, Numbers 0–9, Punctuation
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

const charToMorse: Record<string, string> = {
  // Letters
  'A': '.-',     'B': '-...',   'C': '-.-.',   'D': '-..',
  'E': '.',      'F': '..-.',   'G': '--.',    'H': '....',
  'I': '..',     'J': '.---',   'K': '-.-',    'L': '.-..',
  'M': '--',     'N': '-.',     'O': '---',    'P': '.--.',
  'Q': '--.-',   'R': '.-.',    'S': '...',    'T': '-',
  'U': '..-',    'V': '...-',   'W': '.--',    'X': '-..-',
  'Y': '-.--',   'Z': '--..',

  // Numbers
  '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',
  '4': '....-',  '5': '.....',  '6': '-....',  '7': '--...',
  '8': '---..',  '9': '----.',

  // Punctuation
  '.': '.-.-.-',  ',': '--..--',  '?': '..--..',  "'": '.----.',
  '!': '-.-.--',  '/': '-..-.',   '(': '-.--.',   ')': '-.--.-',
  '&': '.-...',   ':': '---...',  ';': '-.-.-.',  '=': '-...-',
  '+': '.-.-.',   '-': '-....-',  '_': '..--.-',  '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const itu: Charset = {
  id: 'itu',
  name: 'International (ITU)',
  charToMorse,
  morseToChar,
};
