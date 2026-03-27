# @morsecodeapp/morse

> A comprehensive, tree-shakeable Morse code library for JavaScript & TypeScript.

[![npm version](https://img.shields.io/npm/v/@morsecodeapp/morse.svg)](https://www.npmjs.com/package/@morsecodeapp/morse)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@morsecodeapp/morse)](https://bundlephobia.com/package/@morsecodeapp/morse)
[![license](https://img.shields.io/npm/l/@morsecodeapp/morse.svg)](./LICENSE)
[![tests](https://img.shields.io/github/actions/workflow/status/AppsYogi-com/morsecodeapp/ci.yml?label=tests)](https://github.com/AppsYogi-com/morsecodeapp/actions)

**Built by the team behind [morsecodeapp.com](https://morsecodeapp.com)** — the most feature-rich Morse code translator on the web.

## Features

- **11 character sets** — ITU, American, Latin Extended, Cyrillic, Greek, Hebrew, Arabic, Persian, Japanese (Wabun), Korean (SKATS), Thai
- **10 prosigns** — SOS, AR, SK, BT, KN, AS, CL, CT, SN, HH
- **PARIS timing** — standard and Farnsworth spacing calculations
- **Zero dependencies** — nothing but your code
- **Tree-shakeable** — import only what you need via `@morsecodeapp/morse/core`
- **TypeScript-first** — strict types, full `.d.ts` declarations
- **ESM + CJS** — works everywhere: Node.js, Bun, Deno, browsers (via bundler)
- **Roundtrip safe** — `decode(encode(text)) === text` for all supported characters

## Install

```bash
npm install @morsecodeapp/morse
```

## Quick Start

```ts
import { encode, decode } from '@morsecodeapp/morse';

encode('SOS');           // '... --- ...'
decode('... --- ...');   // 'SOS'

encode('Hello World');   // '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'
```

## API

### `encode(text, options?): string`

Converts text to Morse code.

```ts
import { encode } from '@morsecodeapp/morse';

// Basic
encode('SOS');                           // '... --- ...'

// Cyrillic
encode('ПРИВЕТ', { charset: 'cyrillic' }); // '.--.  .-. .. .-- . -'

// Custom symbols
encode('SOS', { dot: '•', dash: '—' }); // '•••  ———  •••'
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `charset` | `CharsetId` | `'itu'` | Character set to use |
| `fallbackCharsets` | `CharsetId[]` | `[]` | Additional charsets for mixed-script text |
| `dot` | `string` | `'.'` | Dot symbol in output |
| `dash` | `string` | `'-'` | Dash symbol in output |
| `separator` | `string` | `' '` | Letter separator |
| `wordSeparator` | `string` | `' / '` | Word separator |
| `invalid` | `string` | `'?'` | Replacement for unknown characters |

### `decode(morse, options?): string`

Converts Morse code back to text.

```ts
import { decode } from '@morsecodeapp/morse';

decode('... --- ...');   // 'SOS'
decode('.-', { charset: 'cyrillic' }); // 'А'
```

### `encodeDetailed(text, options?): EncodeResult`

Like `encode()` but returns detailed validation info:

```ts
import { encodeDetailed } from '@morsecodeapp/morse';

const result = encodeDetailed('A§B');
// { morse: '.- ? -...', valid: false, errors: ['§'] }
```

### `timing(wpm?): TimingValues`

Calculate PARIS standard timing in milliseconds.

```ts
import { timing } from '@morsecodeapp/morse';

const t = timing(20);
// { unit: 60, dot: 60, dash: 180, intraChar: 60, interChar: 180, interWord: 420 }
```

### `farnsworthTiming(overallWpm?, charWpm?): TimingValues`

Farnsworth timing — characters sent fast, extra gap between them.

```ts
import { farnsworthTiming } from '@morsecodeapp/morse';

const ft = farnsworthTiming(10, 20);
// Characters at 20 WPM, overall pace at 10 WPM
```

### `stats(morse, wpm?): MorseStats`

Get statistics about a Morse code string.

```ts
import { stats } from '@morsecodeapp/morse';

const s = stats('... --- ...');
// { dots: 6, dashes: 3, signals: 9, characters: 3, words: 1, durationMs: 1620, ... }
```

### Character Sets

```ts
import { listCharsets, getCharset, detectCharset } from '@morsecodeapp/morse';

listCharsets();        // ['itu', 'american', 'latin-ext', 'cyrillic', ...]
getCharset('cyrillic'); // { id, name, charToMorse, morseToChar }
detectCharset('ПРИВЕТ'); // 'cyrillic'
```

### Prosigns

```ts
import { encodeProsign, decodeProsign, PROSIGNS } from '@morsecodeapp/morse';

encodeProsign('SOS');       // '...---...'
decodeProsign('...---...'); // 'SOS'
PROSIGNS; // [{ label: 'SOS', morse: '...---...', meaning: 'International distress signal' }, ...]
```

### Validation

```ts
import { isValidMorse, isEncodable, findInvalidChars } from '@morsecodeapp/morse';

isValidMorse('... --- ...');  // true
isValidMorse('HELLO');        // false
isEncodable('HELLO', 'itu');  // true
findInvalidChars('A§B');      // ['§']
```

## Tree Shaking

For minimal bundle size, import from the `/core` sub-path:

```ts
import { encode, decode } from '@morsecodeapp/morse/core';
```

This gives you encode/decode, charsets, timing, stats, and validation — no DOM or Web Audio dependencies.

## Supported Character Sets

| ID | Name | Characters |
|----|------|-----------|
| `itu` | International (ITU) | A–Z, 0–9, 18 punctuation marks |
| `american` | American Morse | Historical telegraph variant |
| `latin-ext` | Latin Extended | ITU + accented European characters |
| `cyrillic` | Russian/Cyrillic | А–Я, 0–9 |
| `greek` | Greek | Α–Ω, 0–9 |
| `hebrew` | Hebrew | א–ת, 0–9 |
| `arabic` | Arabic | Arabic alphabet, 0–9 |
| `persian` | Persian (Farsi) | Extended Arabic for Farsi |
| `japanese` | Japanese (Wabun) | Katakana syllabary |
| `korean` | Korean (SKATS) | Jamo consonants & vowels |
| `thai` | Thai | Thai consonants, vowels, tone marks |

## Roadmap

- [ ] 🔊 **Audio** — Web Audio playback, WAV export, gain envelope
- [ ] 📱 **Visual** — Flash, vibrate, visual output
- [ ] 👆 **Tap** — Decode morse from tap/click timing
- [ ] ⚛️ **React** — `useMorse()` hook, `<MorsePlayer>` component
- [ ] 🧠 **Decoder** — Real-time audio decoding via Web Audio

## About

This library is built and maintained by the team behind **[morsecodeapp.com](https://morsecodeapp.com)** — a comprehensive suite of Morse code tools including a translator, audio player, learning resources, and more.

We created this library to share the expertise we've built powering tens of thousands of Morse code translations every month.

## License

[MIT](./LICENSE) © [MorseCodeApp](https://morsecodeapp.com)
