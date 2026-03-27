/**
 * Japanese Wabun Morse Code
 * @see https://morsecodeapp.com
 */

import type { Charset } from '../types.js';

const charToMorse: Record<string, string> = {
  // Vowels
  'ア': '--.--',  'イ': '.-',     'ウ': '..-',    'エ': '-.---',
  'オ': '.-...',

  // K-row
  'カ': '.-..',   'キ': '-.-..',  'ク': '...-',   'ケ': '-.--',
  'コ': '----',

  // S-row
  'サ': '-.-.-',  'シ': '--.-.',  'ス': '---.-',  'セ': '.---.',
  'ソ': '---.',

  // T-row
  'タ': '-.',     'チ': '..-.',   'ツ': '.--.',   'テ': '.-.--',
  'ト': '..-..',

  // N-row
  'ナ': '.-.',    'ニ': '-.-.',   'ヌ': '....',   'ネ': '--.-',
  'ノ': '..--',

  // H-row
  'ハ': '-...',   'ヒ': '--..-',  'フ': '--..',   'ヘ': '.',
  'ホ': '-..',

  // M-row
  'マ': '-..-',   'ミ': '..-.-',  'ム': '-',      'メ': '-...-',
  'モ': '-..-.',

  // Y-row
  'ヤ': '.--',    'ユ': '-..--',  'ヨ': '--',

  // R-row
  'ラ': '...',    'リ': '--.',    'ル': '-.--.',  'レ': '---',
  'ロ': '.-.-',

  // W-row + N
  'ワ': '-.-',    'ヰ': '.-..-',  'ヱ': '.--..',  'ヲ': '.---',
  'ン': '.-.-.',

  // Dakuten / Handakuten marks
  '゛': '..',     '゜': '..--.',

  // Long vowel mark
  'ー': '.--.-',

  // Punctuation
  '、': '.-.-.-', '。': '.-.-..',
};

const morseToChar: Record<string, string> = {};
for (const [char, morse] of Object.entries(charToMorse)) {
  morseToChar[morse] = char;
}

export const japanese: Charset = {
  id: 'japanese',
  name: 'Japanese (Wabun)',
  charToMorse,
  morseToChar,
};
