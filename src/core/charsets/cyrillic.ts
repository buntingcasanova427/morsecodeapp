/**
 * Russian/Cyrillic Morse Code
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

const charToMorse: Record<string, string> = {
  'А': '.-',     'Б': '-...',   'В': '.--',    'Г': '--.',
  'Д': '-..',    'Е': '.',      'Ж': '...-',   'З': '--..',
  'И': '..',     'Й': '.---',   'К': '-.-',    'Л': '.-..',
  'М': '--',     'Н': '-.',     'О': '---',    'П': '.--.',
  'Р': '.-.',    'С': '...',    'Т': '-',      'У': '..-',
  'Ф': '..-.',   'Х': '....',   'Ц': '-.-.',   'Ч': '---.',
  'Ш': '----',   'Щ': '--.-',   'Ъ': '--.--',  'Ы': '-.--',
  'Ь': '-..-',   'Э': '..-..',  'Ю': '..--',   'Я': '.-.-',
  'Ё': '.',

  '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',
  '4': '....-',  '5': '.....',  '6': '-....',  '7': '--...',
  '8': '---..',  '9': '----.',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const cyrillic: Charset = {
  id: 'cyrillic',
  name: 'Russian/Cyrillic',
  charToMorse,
  morseToChar,
};
