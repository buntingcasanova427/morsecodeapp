# @morsecodeapp/morse — Project Plan

> **Created:** 2026-03-27
> **Status:** Phase 1 — Foundation
> **Repository:** github.com/morsecodeapp/morse-code
> **npm:** @morsecodeapp/morse
> **Homepage:** https://morsecodeapp.com

---

## 1. Mission

Build the most complete, tree-shakeable, zero-dependency Morse code library on npm.
Link back to morsecodeapp.com from every surface (GitHub, npm, playground, docs) to establish EEAT authority.

---

## 2. Competitive Landscape

| Library | Stars | Monthly Downloads | Features | Gaps |
|---------|-------|-------------------|----------|------|
| `@ozdemirburak/morse-code-translator` | 273 | 86 | encode, decode, 12 charsets, audio, WAV | No prosigns, no tap, no visual, no gain envelope, no framework bindings, single flat export |
| `morse-decoder` | ~50 | ~200 | encode, decode | Unmaintained, no audio, no charsets |
| `morsify` | ~30 | ~100 | encode, decode, audio | Basic, no charsets beyond Latin |

**Our differentiators:** Prosigns, tap decoder, visual output (flash/vibrate), Goertzel mic decoder, gain envelope, Farnsworth timing, American Morse, sound presets, React/Vue hooks, interactive playground, backed by production site (morsecodeapp.com).

---

## 3. Architecture

### Single Package with Sub-path Exports

```
@morsecodeapp/morse
├── /core     — encode, decode, charsets, timing, prosigns, stats (0 deps, works in Node/Bun/Deno/browser)
├── /audio    — Web Audio player, WAV export (browser only)
├── /visual   — flash, vibrate controllers (browser only)
├── /tap      — tap input decoder (browser only)
├── /decoder  — Goertzel mic decoder (browser only, future)
└── /react    — React hooks (future)
```

**Why single package, not monorepo?**
- One `npm install` for everything
- Sub-path exports give the same tree-shaking as separate packages
- Simpler CI/CD, versioning, and docs
- Migrate to monorepo later only if React/Vue packages diverge significantly

### Import Patterns

```js
// Full library (everything)
import { encode, decode, MorsePlayer, TapDecoder } from '@morsecodeapp/morse'

// Just core (~3KB gzipped) — works in Node.js, no DOM needed
import { encode, decode, timing, prosigns } from '@morsecodeapp/morse/core'

// Just audio (~5KB gzipped)
import { MorsePlayer, toWav } from '@morsecodeapp/morse/audio'

// Just tap decoder (~2KB gzipped)
import { TapDecoder } from '@morsecodeapp/morse/tap'

// Visual output (~1KB gzipped)
import { FlashController, VibrateController } from '@morsecodeapp/morse/visual'
```

### Directory Structure

```
morse-code/
├── src/
│   ├── core/
│   │   ├── index.ts          # barrel export
│   │   ├── encode.ts         # text → morse
│   │   ├── decode.ts         # morse → text
│   │   ├── charsets/
│   │   │   ├── index.ts      # charset registry
│   │   │   ├── itu.ts        # International (Latin + Numbers + Punctuation)
│   │   │   ├── american.ts   # American Morse Code
│   │   │   ├── cyrillic.ts
│   │   │   ├── greek.ts
│   │   │   ├── hebrew.ts
│   │   │   ├── arabic.ts
│   │   │   ├── persian.ts
│   │   │   ├── japanese.ts   # Wabun
│   │   │   ├── korean.ts
│   │   │   ├── thai.ts
│   │   │   └── latin-ext.ts  # Turkish, Polish, etc.
│   │   ├── timing.ts         # PARIS standard, Farnsworth
│   │   ├── prosigns.ts       # SOS, AR, SK, BT, KN, AS, etc.
│   │   ├── stats.ts          # dots, dashes, duration, signal count
│   │   ├── validate.ts       # isValidMorse, isValidText
│   │   └── types.ts          # shared types
│   ├── audio/
│   │   ├── index.ts
│   │   ├── player.ts         # MorsePlayer class (Web Audio API)
│   │   ├── wav.ts            # WAV encoding (44.1kHz, 16-bit PCM)
│   │   ├── presets.ts        # Sound presets (telegraph, radio, military, etc.)
│   │   └── types.ts
│   ├── visual/
│   │   ├── index.ts
│   │   ├── flash.ts          # Screen flash controller
│   │   └── vibrate.ts        # navigator.vibrate controller
│   ├── tap/
│   │   ├── index.ts
│   │   └── decoder.ts        # TapDecoder class
│   ├── decoder/               # Phase 5 (future)
│   │   ├── index.ts
│   │   ├── goertzel.ts       # Goertzel algorithm
│   │   ├── mic.ts            # Microphone input manager
│   │   └── file.ts           # Audio file decoder
│   └── index.ts               # main barrel export
├── test/
│   ├── core/
│   │   ├── encode.test.ts
│   │   ├── decode.test.ts
│   │   ├── charsets.test.ts
│   │   ├── timing.test.ts
│   │   ├── prosigns.test.ts
│   │   └── stats.test.ts
│   ├── audio/
│   │   ├── player.test.ts
│   │   └── wav.test.ts
│   ├── tap/
│   │   └── decoder.test.ts
│   └── visual/
│       ├── flash.test.ts
│       └── vibrate.test.ts
├── playground/                 # Interactive demo (Vite, links to morsecodeapp.com)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             # Test + build on every PR
│   │   ├── release.yml        # Auto-publish to npm on tag
│   │   └── size.yml           # Bundle size check
│   └── ISSUE_TEMPLATE/
├── package.json
├── tsconfig.json
├── tsup.config.ts             # Build config (ESM + CJS + UMD + types)
├── vitest.config.ts
├── .gitignore
├── .npmignore
├── LICENSE                    # MIT
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── PROJECT_PLAN.md            # This file
```

---

## 4. Build & Tooling

| Tool | Purpose |
|------|---------|
| **TypeScript 5.x** | Source language, full strict mode |
| **tsup** | Build (ESM + CJS + DTS in one command, faster than Vite for libraries) |
| **Vitest** | Testing (fast, Vite-compatible, happy-dom for browser APIs) |
| **changesets** | Versioning & changelog generation |
| **GitHub Actions** | CI/CD: test → build → publish |
| **size-limit** | Bundle size guard (~10KB gzipped target for core) |

### Build Outputs

```
dist/
├── index.js          # ESM (main entry)
├── index.cjs         # CJS (Node.js require())
├── index.d.ts        # TypeScript declarations
├── core/
│   ├── index.js
│   ├── index.cjs
│   └── index.d.ts
├── audio/
│   ├── index.js
│   ├── index.cjs
│   └── index.d.ts
├── visual/...
├── tap/...
└── decoder/...
```

---

## 5. Feature Spec — Phase by Phase

### Phase 1: Core (Week 1-2) ⬅ START HERE

**Goal:** Ship to npm. Beat competitor on API ergonomics and prosign support.

#### 5.1.1 `encode(text, options?) → string`

```ts
encode('SOS')                          // '... --- ...'
encode('SOS', { charset: 'itu' })      // '... --- ...' (default)
encode('Ленинград', { charset: 'cyrillic' }) // '.-.. . -. .. -. --. .-. .- -..'
encode('SOS', { dot: '·', dash: '—', separator: ' ', wordSeparator: ' / ' })
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `charset` | `string` | `'itu'` | Character set: `'itu'`, `'american'`, `'cyrillic'`, `'greek'`, `'hebrew'`, `'arabic'`, `'persian'`, `'japanese'`, `'korean'`, `'thai'`, `'latin-ext'` |
| `dot` | `string` | `'.'` | Dot character in output |
| `dash` | `string` | `'-'` | Dash character in output |
| `separator` | `string` | `' '` | Between letters |
| `wordSeparator` | `string` | `' / '` | Between words |
| `invalid` | `string` | `'?'` | Replacement for unknown chars |

**vs competitor:** They use `{ priority: 5 }` — a magic number. We use `{ charset: 'cyrillic' }` — self-documenting.

#### 5.1.2 `decode(morse, options?) → string`

```ts
decode('... --- ...')                    // 'SOS'
decode('... --- ...', { charset: 'itu' }) // 'SOS'
decode('·· ——— · ———', { dot: '·', dash: '—' }) // 'SOS'  (custom symbols)
```

Same options as `encode`, plus:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `caseSensitive` | `boolean` | `false` | Return lowercase if input was lowercase |

#### 5.1.3 Character Sets

| ID | Name | Characters | Source |
|----|------|-----------|--------|
| `itu` | International (ITU) | A-Z, 0-9, 16 punctuation | ITU-R M.1677-1 |
| `american` | American Morse | A-Z, 0-9, punctuation (different patterns) | Historical |
| `latin-ext` | Latin Extended | Ã, Ä, Ç, É, Ñ, Ö, Ü, etc. | HAM practice |
| `cyrillic` | Russian/Cyrillic | А-Я + Ukrainian Ї, Є, І, Ґ | Wikipedia |
| `greek` | Greek | Α-Ω | Wikipedia |
| `hebrew` | Hebrew | א-ת | Wikipedia |
| `arabic` | Arabic | ا-ي + ﺀ | Wikipedia |
| `persian` | Persian/Farsi | ا-ی + پ, چ, ژ, گ | Wikipedia |
| `japanese` | Japanese Wabun | ア-ン + punctuation | Wikipedia |
| `korean` | Korean | ㄱ-ㅣ + ㅐ, ㅔ | Wikipedia |
| `thai` | Thai | ก-ฮ + vowels + tones | Wikipedia |

#### 5.1.4 Prosigns (Competitor has ZERO)

```ts
import { prosigns, encodeProsign } from '@morsecodeapp/morse/core'

prosigns.SOS   // { morse: '···−−−···', meaning: 'Distress Signal' }
prosigns.AR    // { morse: '·−·−·', meaning: 'End of Message' }

encodeProsign('SOS')  // '...---...' (no inter-character gaps)
```

| Prosign | Morse | Meaning |
|---------|-------|---------|
| SOS | `···---···` | Distress Signal |
| AR | `·-·-·` | End of Message |
| SK | `···-·-` | End of Contact |
| BT | `-···-` | Break / New Paragraph |
| KN | `-·--·` | Go Ahead (specific station) |
| AS | `·-···` | Wait |
| CL | `-·-··-··` | Going Off Air |
| CT | `-·-·-` | Attention / Copy This |
| SN | `···-·` | Understood |

#### 5.1.5 Timing

```ts
import { timing } from '@morsecodeapp/morse/core'

timing.paris(20)
// { dot: 60, dash: 180, intraChar: 60, interChar: 180, interWord: 420, unit: 60 }
// All values in milliseconds

timing.farnsworth(20, 10)
// Character speed at 20 WPM, effective speed at 10 WPM
// Extended inter-char and inter-word gaps

timing.wpmFromUnit(60)  // 20 (reverse calculation)
```

#### 5.1.6 Stats

```ts
import { stats } from '@morsecodeapp/morse/core'

stats('... --- ...', { wpm: 20 })
// { dots: 6, dashes: 3, signals: 9, characters: 3, words: 1,
//   durationMs: 3420, durationFormatted: '3.4s at 20 WPM' }
```

#### 5.1.7 Validation

```ts
import { isValidMorse, isValidText } from '@morsecodeapp/morse/core'

isValidMorse('... --- ...')  // true
isValidMorse('abc')          // false
isValidText('HELLO', { charset: 'itu' })  // true
isValidText('Ж', { charset: 'itu' })      // false
isValidText('Ж', { charset: 'cyrillic' }) // true
```

#### 5.1.8 Character Lookup

```ts
import { charsets } from '@morsecodeapp/morse/core'

charsets.itu.get('A')       // '.-'
charsets.itu.get('.-')      // 'A'  (reverse lookup)
charsets.itu.entries()       // Map iterator
charsets.cyrillic.get('Ж')  // '...-'

// Auto-detect charset for a character
charsets.detect('Ж')        // 'cyrillic'
charsets.detect('A')        // 'itu'
```

---

### Phase 2: Audio (Week 3-4)

**Goal:** Full audio playback + WAV export. Beat competitor on quality (gain envelope, Farnsworth).

#### 5.2.1 `MorsePlayer`

```ts
import { MorsePlayer } from '@morsecodeapp/morse/audio'

const player = new MorsePlayer({
  wpm: 20,               // 5-50 (default: 20)
  frequency: 600,         // 300-1200 Hz (default: 600)
  waveform: 'sine',       // 'sine' | 'square' | 'sawtooth' | 'triangle'
  volume: 80,             // 0-100 (default: 80)
  farnsworth: false,      // Extended spacing for learners
  farnsworthWpm: 10,      // Effective WPM when farnsworth=true
  gainEnvelope: {         // Click-free audio ← competitor lacks this
    attack: 0.01,         // 10ms ramp up
    release: 0.01,        // 10ms ramp down
  },
  events: {
    onReady: () => {},
    onPlay: () => {},
    onPause: () => {},
    onStop: () => {},
    onEnd: () => {},
    onSignal: (type, char, index) => {},   // 'dot' | 'dash', per signal
    onCharacter: (char, morseChar) => {},  // per character completed
    onProgress: (current, total) => {},    // playback position
  }
})

// Playback
await player.play('HELLO')       // Accepts text (auto-encodes) or morse
await player.play('.... . .-.. .-.. ---')  // Accepts raw morse too
player.pause()
await player.resume()
await player.seek(1.5)           // Seek to 1.5 seconds
player.stop()
player.dispose()                 // Clean up AudioContext

// State
player.state        // 'ready' | 'playing' | 'paused' | 'stopped'
player.currentTime  // seconds
player.totalTime    // seconds
player.progress     // 0-1

// Dynamic settings
player.wpm = 25
player.frequency = 800
player.volume = 50
```

#### 5.2.2 Sound Presets (Differentiator)

```ts
import { MorsePlayer, presets } from '@morsecodeapp/morse/audio'

const player = new MorsePlayer(presets.telegraph)
// { wpm: 15, frequency: 550, waveform: 'square', volume: 70 }

const player2 = new MorsePlayer(presets.radio)
// { wpm: 20, frequency: 600, waveform: 'sine', volume: 80 }

// Available presets:
presets.telegraph   // Classic telegraph sounder
presets.radio       // Modern amateur radio
presets.military    // Military standard
presets.sonar       // Submarine sonar ping
presets.naval       // Naval communication
presets.beginner    // Slow learner-friendly (5 WPM, Farnsworth)
```

#### 5.2.3 WAV Export

```ts
import { toWav, toWavUrl, downloadWav } from '@morsecodeapp/morse/audio'

const blob = await toWav('SOS', { wpm: 20, frequency: 600 })
const url = await toWavUrl('SOS', { wpm: 20 })
await downloadWav('SOS', { filename: 'sos.wav' })
```

---

### Phase 3: Visual + Tap (Week 5-6)

#### 5.3.1 Visual Output

```ts
import { FlashController, VibrateController } from '@morsecodeapp/morse/visual'

const flash = new FlashController({
  element: document.getElementById('flash-overlay'),  // or auto-creates fullscreen overlay
  color: '#FFFFFF',
  opacity: 1,
})

await flash.play('... --- ...',  { wpm: 20 })
flash.stop()

const vibrate = new VibrateController()
await vibrate.play('... --- ...', { wpm: 20 })
vibrate.stop()
```

#### 5.3.2 Tap Decoder

```ts
import { TapDecoder } from '@morsecodeapp/morse/tap'

const tap = new TapDecoder({
  wpm: 20,                    // Used for adaptive thresholds
  dotDashThreshold: 200,      // ms, below = dot, above = dash
  letterTimeout: 800,         // ms silence → finalize letter
  wordTimeout: 2000,          // ms silence → insert word space
  adaptiveThreshold: true,    // Auto-adjust based on user's speed
  events: {
    onDot: () => {},
    onDash: () => {},
    onLetter: (char: string) => {},
    onWord: () => {},
    onChange: (text: string, morse: string) => {},  // Full accumulated text/morse
  }
})

// Connect to events
tap.keyDown()        // Call on mousedown/touchstart/keydown(Space)
tap.keyUp()          // Call on mouseup/touchend/keyup(Space)
tap.backspace()      // Delete last signal (before letter finalizes)
tap.clear()          // Reset all
tap.space()          // Manual word space

// State
tap.text             // Accumulated decoded text
tap.morse            // Accumulated morse string
tap.currentSignals   // Current unfinalized signals (e.g., '.-')
```

---

### Phase 4: React Hooks (Week 7-8, future)

```tsx
import { useMorse, useMorsePlayer, useTap } from '@morsecodeapp/morse/react'

function App() {
  const { morse, text, encode, decode } = useMorse()
  const { play, stop, isPlaying, progress } = useMorsePlayer({ wpm: 20 })
  const { keyDown, keyUp, decoded, clear } = useTap({ wpm: 15 })

  return (
    <input onChange={e => encode(e.target.value)} />
    <button onClick={() => play(morse)}>Play</button>
    <div onMouseDown={keyDown} onMouseUp={keyUp}>TAP HERE</div>
    <p>{decoded}</p>
  )
}
```

---

### Phase 5: Mic Decoder (Week 9-10, future)

```ts
import { MorseDecoder } from '@morsecodeapp/morse/decoder'

const decoder = new MorseDecoder({
  targetFrequency: 600,     // Hz to listen for
  sensitivity: 0.5,         // 0-1
  wpm: 20,                  // Expected speed (for timing)
  calibrationDuration: 1.5, // Seconds of ambient noise sampling
  events: {
    onCalibrated: (threshold) => {},
    onSignal: (type: 'dot' | 'dash') => {},
    onCharacter: (char) => {},
    onText: (fullText) => {},
    onStrength: (level: number) => {},  // 0-1 signal strength
  }
})

await decoder.start()       // Request mic access, calibrate, start
decoder.stop()
decoder.state               // 'idle' | 'calibrating' | 'listening' | 'decoding'

// File decode
const text = await decoder.decodeFile(audioBlob)
```

---

### Phase 6: Dogfood (Future)

Replace morsecodeapp.com's inline JS with:
```js
import { encode, decode, MorsePlayer, TapDecoder } from '@morsecodeapp/morse'
```

---

## 6. SEO & Backlink Strategy

### Every surface links to morsecodeapp.com:

| Surface | Link Placement | DA |
|---------|---------------|-----|
| GitHub repo "Website" field | `https://morsecodeapp.com` | 95 |
| GitHub README hero | "Built by [MorseCodeApp.com](https://morsecodeapp.com)" | 95 |
| npm `package.json` homepage | `"homepage": "https://morsecodeapp.com"` | 93 |
| npm `package.json` author | `"url": "https://morsecodeapp.com"` | 93 |
| Playground demo site | "Powered by MorseCodeApp.com" in footer | — |
| CONTRIBUTING.md | "This library powers [MorseCodeApp.com](https://morsecodeapp.com)" | 95 |
| JSDoc comments | `@see https://morsecodeapp.com` | — |
| GitHub Discussions | Links to live tool | 95 |
| CHANGELOG.md | "Try it live at [MorseCodeApp.com](https://morsecodeapp.com)" | 95 |

### GitHub Topics (match/exceed competitor's 10)

`morse-code`, `morse`, `morse-translator`, `morse-decoder`, `morse-encoder`, `morse-audio`, `text-to-morse`, `morse-code-translator`, `morse-code-converter`, `web-audio-api`, `morse-learning`, `prosigns`, `tap-decoder`, `javascript`, `typescript`, `npm-package`

### npm Keywords

`morse`, `morse code`, `morse translator`, `morse decoder`, `morse encoder`, `text to morse`, `morse audio`, `morse player`, `web audio`, `morse tap`, `prosigns`, `itu morse code`, `cwops`, `ham radio`, `amateur radio`

---

## 7. Quality Gates

| Gate | Threshold |
|------|-----------|
| Test coverage | ≥ 95% for core, ≥ 85% for audio/visual/tap |
| Bundle size (core) | ≤ 5KB gzipped |
| Bundle size (full) | ≤ 15KB gzipped |
| TypeScript strict | `strict: true`, zero `any` |
| Zero dependencies | Must stay at 0 |
| Node.js compat (core) | Works in Node 18+, Bun, Deno |
| Browser compat (audio) | Chrome 66+, Firefox 76+, Safari 14.1+, Edge 79+ |

---

## 8. Release Checklist (Phase 1)

- [ ] Core encode/decode with ITU charset works
- [ ] All 12 charsets implemented and tested
- [ ] Prosigns implemented and tested
- [ ] Timing (PARIS + Farnsworth) tested
- [ ] Stats calculator tested
- [ ] Validation functions tested
- [ ] TypeScript types exported
- [ ] ESM + CJS builds working
- [ ] README with examples, badges, morsecodeapp.com links
- [ ] LICENSE (MIT)
- [ ] CONTRIBUTING.md with morsecodeapp.com reference
- [ ] CHANGELOG.md
- [ ] GitHub Actions CI passing
- [ ] npm publish succeeds
- [ ] GitHub repo "Website" field set
- [ ] GitHub topics added
- [ ] Bundle size under threshold

---

## 9. Open Questions

| Question | Options | Decision |
|----------|---------|----------|
| Package name | `@morsecodeapp/morse` vs `morse-code-toolkit` vs `morsecode` | `@morsecodeapp/morse` (scoped, brand-aligned) |
| Build tool | `tsup` vs `vite` vs `rollup` | `tsup` (simplest for libraries, handles ESM/CJS/DTS) |
| Charset auto-detect | Should `encode('Ж')` auto-detect Cyrillic? | Yes, with explicit charset override. Priority: ITU → Latin-Ext → Cyrillic → others |
| American Morse | Separate charset or mode? | Separate charset: `{ charset: 'american' }` |
| Prosign encoding | Part of `encode()` or separate function? | Both: `encode('<SOS>')` recognizes angle-bracket syntax + `encodeProsign('SOS')` for explicit use |

---

*This is a living document. Update as decisions are made and phases are completed.*
