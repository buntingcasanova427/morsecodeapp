/**
 * Korean (SKATS) Morse Code
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

const charToMorse: Record<string, string> = {
  // Consonants (자음)
  'ㄱ': '.-..',   'ㄴ': '..-.',   'ㄷ': '-...',   'ㄹ': '...-',
  'ㅁ': '--',     'ㅂ': '.--',    'ㅅ': '-.-',    'ㅇ': '-.-.',
  'ㅈ': '.--.',   'ㅊ': '-.--.', 'ㅋ': '-..-',   'ㅌ': '--..',
  'ㅍ': '---',    'ㅎ': '.---',

  // Double consonants
  'ㄲ': '.-.. .-..', 'ㄸ': '-... -...', 'ㅃ': '.-- .--',
  'ㅆ': '-.- -.-',   'ㅉ': '.--. .--.',

  // Vowels (모음)
  'ㅏ': '.',      'ㅑ': '..',     'ㅓ': '-',      'ㅕ': '...',
  'ㅗ': '.-',     'ㅛ': '-.',     'ㅜ': '....',   'ㅠ': '.-.',
  'ㅡ': '-..',    'ㅣ': '..-',

  // Compound vowels
  'ㅐ': '--.',    'ㅒ': '--. ..',  'ㅔ': '-.--',   'ㅖ': '-.-- ..',
  'ㅘ': '.- .',   'ㅙ': '.- --.',  'ㅚ': '.- ..-',
  'ㅝ': '.... -', 'ㅞ': '.... -.--', 'ㅟ': '.... ..-',
  'ㅢ': '-.. ..-',

  '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',
  '4': '....-',  '5': '.....',  '6': '-....',  '7': '--...',
  '8': '---..',  '9': '----.',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const korean: Charset = {
  id: 'korean',
  name: 'Korean (SKATS)',
  charToMorse,
  morseToChar,
};
