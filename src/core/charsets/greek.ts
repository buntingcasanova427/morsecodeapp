/**
 * Greek Morse Code
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

const charToMorse: Record<string, string> = {
  'Α': '.-',     'Β': '-...',   'Γ': '--.',    'Δ': '-..',
  'Ε': '.',      'Ζ': '--..',   'Η': '....',   'Θ': '-.-.',
  'Ι': '..',     'Κ': '-.-',    'Λ': '.-..',   'Μ': '--',
  'Ν': '-.',     'Ξ': '-..-',   'Ο': '---',    'Π': '.--.',
  'Ρ': '.-.',    'Σ': '...',    'Τ': '-',      'Υ': '-.--',
  'Φ': '..-.',   'Χ': '----',   'Ψ': '--.-',   'Ω': '.--',

  '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',
  '4': '....-',  '5': '.....',  '6': '-....',  '7': '--...',
  '8': '---..',  '9': '----.',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const greek: Charset = {
  id: 'greek',
  name: 'Greek',
  charToMorse,
  morseToChar,
};
