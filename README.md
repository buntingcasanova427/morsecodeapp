<div align="center">

# @morsecodeapp/morse

**The most complete Morse code library for JavaScript and TypeScript** — built for professional radio operators, educators, and developers. Features 11 character sets, prosigns, PARIS/Farnsworth timing, real-time audio synthesis via Web Audio API, and WAV export. Zero dependencies, tree-shakeable, TypeScript-first.

Built and used in production by **[MorseCodeApp.com](https://morsecodeapp.com)** — a morse code translator and learning platform used by thousands every month. This is the same library that powers the website.

[![npm version](https://img.shields.io/npm/v/@morsecodeapp/morse.svg)](https://www.npmjs.com/package/@morsecodeapp/morse)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@morsecodeapp/morse)](https://bundlephobia.com/package/@morsecodeapp/morse)
[![tests](https://img.shields.io/github/actions/workflow/status/AppsYogi-com/morsecodeapp/ci.yml?label=tests)](https://github.com/AppsYogi-com/morsecodeapp/actions)
[![license](https://img.shields.io/npm/l/@morsecodeapp/morse.svg)](./LICENSE)

[Install](#install) · [Quick Start](#quick-start) · [Audio](#audio-playback) · [API Reference](API.md) · [Report Bug](https://github.com/AppsYogi-com/morsecodeapp/issues)

</div>

---

## Why this library?

|  | @morsecodeapp/morse | morse-code-translator | morsify |
|--|:---:|:---:|:---:|
| Character sets | **11** | 12 | 1 |
| Audio playback (Web Audio) | **Yes** | — | Partial |
| WAV export | **Yes** | — | — |
| Sound presets | **6** | — | — |
| Gain envelope (click-free) | **Yes** | — | — |
| Prosigns (SOS, AR, SK…) | **10** | — | — |
| Farnsworth timing | **Yes** | — | — |
| PARIS timing calculator | **Yes** | — | — |
| Statistics & duration | **Yes** | — | — |
| Validation utilities | **Yes** | — | — |
| Tree-shakeable sub-paths | **Yes** | — | — |
| TypeScript-first | **Yes** | Partial | — |
| Zero dependencies | **Yes** | 1 dep | — |
| Roundtrip safe | **Yes** | — | — |

---

## Install

```bash
npm install @morsecodeapp/morse
```

Works with npm, yarn, pnpm, and bun.

---

## Quick Start

```ts
import { encode, decode } from '@morsecodeapp/morse';

encode('SOS');         // '... --- ...'
decode('... --- ...'); // 'SOS'

encode('Hello World'); // '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'
```

Three lines. That's it.

---

## Features

- **11 character sets** — ITU, American, Latin Extended, Cyrillic, Greek, Hebrew, Arabic, Persian, Japanese (Wabun), Korean (SKATS), Thai
- **Audio playback** — Web Audio API player with play/pause/stop, gain envelope, event callbacks
- **WAV export** — 44.1 kHz 16-bit PCM, works in any JS runtime
- **6 sound presets** — telegraph, radio, military, sonar, naval, beginner
- **10 prosigns** — SOS, AR, SK, BT, KN, AS, CL, CT, SN, HH
- **PARIS timing** — standard and Farnsworth spacing, duration estimates
- **Validation** — check morse syntax, encodability, find unsupported characters
- **Statistics** — dots, dashes, signal count, duration in ms/sec
- **Zero dependencies** — nothing but your code
- **Tree-shakeable** — import from `@morsecodeapp/morse/core` or `@morsecodeapp/morse/audio`
- **TypeScript-first** — strict types, full `.d.ts`, zero `any`
- **ESM + CJS** — works in Node.js, Bun, Deno, and browsers (via bundler)
- **Roundtrip safe** — `decode(encode(text)) === text` for all supported characters

---

## Usage Examples

### Encode with different charsets

```ts
import { encode } from '@morsecodeapp/morse';

encode('ПРИВЕТ', { charset: 'cyrillic' }); // '.--. .-. .. .-- . -'
encode('SOS',    { dot: '•', dash: '—' }); // '••• ——— •••'
```

### Detailed results with error info

```ts
import { encodeDetailed } from '@morsecodeapp/morse';

const result = encodeDetailed('A§B');
// { morse: '.- ? -...', valid: false, errors: ['§'] }
```

### Prosigns

```ts
import { encodeProsign, decodeProsign, PROSIGNS } from '@morsecodeapp/morse';

encodeProsign('SOS');       // '...---...'
decodeProsign('...---...'); // 'SOS'
PROSIGNS.length;            // 10
```

### Timing calculations

```ts
import { timing, farnsworthTiming } from '@morsecodeapp/morse';

const t = timing(20);
// { unit: 60, dot: 60, dash: 180, intraChar: 60, interChar: 180, interWord: 420 }

const ft = farnsworthTiming(10, 20);
// Characters at 20 WPM, overall pace slowed to 10 WPM
```

### Statistics

```ts
import { stats } from '@morsecodeapp/morse';

stats('... --- ...');
// { dots: 6, dashes: 3, signals: 9, characters: 3, words: 1,
//   durationMs: 1620, durationSec: '1.6', durationFormatted: '1.6s' }
```

### Validation

```ts
import { isValidMorse, isEncodable, findInvalidChars } from '@morsecodeapp/morse';

isValidMorse('... --- ...'); // true
isEncodable('HELLO', 'itu'); // true
findInvalidChars('A§B');     // ['§']
```

### Charset detection

```ts
import { detectCharset, listCharsets } from '@morsecodeapp/morse';

detectCharset('ПРИВЕТ'); // 'cyrillic'
listCharsets();          // ['itu', 'american', 'latin-ext', 'cyrillic', ...]
```

> Full API documentation with all options and return types → **[API.md](API.md)**

---

## Audio Playback

### Play Morse audio in the browser

```ts
import { MorsePlayer } from '@morsecodeapp/morse/audio';

const player = new MorsePlayer({ wpm: 20, frequency: 600 });

await player.play('Hello World');
```

### Use a sound preset

```ts
import { MorsePlayer, presets } from '@morsecodeapp/morse/audio';

const player = new MorsePlayer(presets.telegraph);
await player.play('CQ CQ CQ');
```

### Export to WAV

```ts
import { toWav, downloadWav } from '@morsecodeapp/morse/audio';

// Raw WAV bytes (works in Node.js, Bun, Deno, browsers)
const wavBytes = toWav('SOS', { frequency: 800 });

// One-click download in the browser
downloadWav('SOS', { filename: 'sos.wav' });
```

### Event callbacks

```ts
const player = new MorsePlayer({
  wpm: 15,
  onSignal: (signal, idx) => console.log(signal), // 'dot' | 'dash'
  onCharacter: (char, morse, idx) => console.log(char, morse),
  onProgress: (current, total) => console.log(`${current}/${total} ms`),
});

await player.play('SOS');
```

> Available presets: `telegraph`, `radio`, `military`, `sonar`, `naval`, `beginner`

---

## Tree Shaking

For minimal bundle size, import from sub-paths:

```ts
// Core only — encode, decode, charsets, timing, validation
import { encode, decode } from '@morsecodeapp/morse/core';

// Audio only — player, WAV export, presets
import { MorsePlayer, toWav } from '@morsecodeapp/morse/audio';
```

Each sub-path is independently tree-shakeable. The root `@morsecodeapp/morse` re-exports everything.

---

## Supported Character Sets

| ID | Name | Script |
|----|------|--------|
| `itu` | International (ITU-R M.1677-1) | Latin A–Z, 0–9, punctuation |
| `american` | American Morse | Historical telegraph variant |
| `latin-ext` | Latin Extended | Accented European characters |
| `cyrillic` | Russian / Cyrillic | А–Я |
| `greek` | Greek | Α–Ω |
| `hebrew` | Hebrew | א–ת |
| `arabic` | Arabic | Arabic alphabet |
| `persian` | Persian (Farsi) | Extended Arabic for Farsi |
| `japanese` | Japanese (Wabun) | Katakana syllabary |
| `korean` | Korean (SKATS) | Jamo consonants & vowels |
| `thai` | Thai | Thai consonants, vowels, tone marks |

---

## Roadmap

### Phase 1 — Core ✅ `v0.1.0`
> Encode, decode, validate — the foundation.

- [x] 11 character sets (ITU, American, Cyrillic, Greek, Hebrew, Arabic, Persian, Japanese, Korean, Thai, Latin Extended)
- [x] 10 prosigns (SOS, AR, SK, BT, KN, AS, CL, CT, SN, HH)
- [x] PARIS standard + Farnsworth timing
- [x] Statistics, validation, charset detection
- [x] ESM + CJS, TypeScript-first, zero dependencies
- [x] 99%+ test coverage

### Phase 2 — Audio 🔊 `v0.2.0` ✅
> Hear your Morse code.

- [x] `MorsePlayer` class — Web Audio API playback with play/pause/stop
- [x] WAV export (44.1 kHz, 16-bit PCM)
- [x] 6 sound presets — telegraph, radio, military, sonar, naval, beginner
- [x] Gain envelope — clean start/stop, no audio clicks
- [x] Configurable frequency, WPM, volume, and waveform
- [x] Event callbacks — onSignal, onCharacter, onProgress, and more
- [x] Scheduler — timed tone/silence events for custom rendering

### Phase 3 — Visual + Tap 📱 `v0.3.0`
> See it. Tap it.

- [ ] Screen flash / LED controller
- [ ] Vibration API output
- [ ] Tap-to-morse decoder (touch/click timing → text)

### Phase 4 — React ⚛️ `v0.4.0`
> Drop-in components for React apps.

- [ ] `useMorse()` hook
- [ ] `<MorsePlayer />` audio component
- [ ] `<MorseVisualizer />` waveform component

### Phase 5 — Decoder 🧠 `v0.5.0`
> Decode Morse from real audio.

- [ ] Real-time audio decoding (Goertzel algorithm)
- [ ] Microphone input
- [ ] Audio file decoding

---

## Contributing

Contributions are welcome. Please read the [Contributing Guide](CONTRIBUTING.md) before opening a Pull Request.

```bash
git clone https://github.com/AppsYogi-com/morsecodeapp.git
cd morsecodeapp
npm install
npm test          # Run tests
npm run build     # ESM + CJS + DTS
npm run lint      # Type check
```

---

## About

Built and maintained by the team behind **[MorseCodeApp.com](https://morsecodeapp.com)** — a comprehensive suite of Morse code tools used by thousands of people every month.

## License

[MIT](./LICENSE) © [MorseCodeApp](https://morsecodeapp.com)
