/**
 * American Morse Code (1844 telegraph variant)
 * Different patterns from International/ITU for several characters
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

// American Morse uses longer internal spaces (marked as 0 in historical docs)
// Here we represent the patterns using standard dot/dash notation
const charToMorse: Record<string, string> = {
  'A': '.-',     'B': '-...',   'C': '.. .',   'D': '-..',
  'E': '.',      'F': '.-.',    'G': '--.',    'H': '....',
  'I': '..',     'J': '-.-.',   'K': '-.-',    'L': '---',
  'M': '--',     'N': '-.',     'O': '. .',    'P': '.....',
  'Q': '..-.',   'R': '. ..',   'S': '...',    'T': '-',
  'U': '..-',    'V': '...-',   'W': '.--',    'X': '.-..', 
  'Y': '.. ..',  'Z': '... .',

  '0': '-----',  '1': '.--.',   '2': '..-..', '3': '...-.',
  '4': '....-',  '5': '---',    '6': '......', '7': '--..',
  '8': '-....',  '9': '-..-',

  '.': '..--..',  ',': '.-.-',   '?': '-..-.',
  '!': '---.',    '/': '-..-.',  '&': '. ...',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const american: Charset = {
  id: 'american',
  name: 'American Morse Code',
  charToMorse,
  morseToChar,
};
