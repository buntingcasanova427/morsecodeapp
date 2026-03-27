import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MorsePlayer } from '../../src/audio/player.js';

// --- Web Audio API mocks ---

class MockGainParam {
  value = 1;
  setValueAtTime = vi.fn().mockReturnThis();
  linearRampToValueAtTime = vi.fn().mockReturnThis();
}

class MockOscillatorNode {
  type = 'sine';
  frequency = { value: 440 };
  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockGainNode {
  gain = new MockGainParam();
  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  state: string = 'running';
  destination = {} as AudioDestinationNode;

  createOscillator = vi.fn(() => new MockOscillatorNode() as unknown as OscillatorNode);
  createGain = vi.fn(() => new MockGainNode() as unknown as GainNode);
  suspend = vi.fn(async () => { this.state = 'suspended'; });
  resume = vi.fn(async () => { this.state = 'running'; });
  close = vi.fn(async () => { this.state = 'closed'; });
}

// Install global AudioContext mock
const originalAudioContext = globalThis.AudioContext;

beforeEach(() => {
  vi.useFakeTimers();
  (globalThis as unknown as Record<string, unknown>).AudioContext = MockAudioContext;
});

afterEach(() => {
  vi.useRealTimers();
  if (originalAudioContext) {
    globalThis.AudioContext = originalAudioContext;
  } else {
    delete (globalThis as unknown as Record<string, unknown>).AudioContext;
  }
});

describe('MorsePlayer', () => {
  describe('constructor', () => {
    it('starts in idle state', () => {
      const player = new MorsePlayer();
      expect(player.state).toBe('idle');
    });

    it('has sensible defaults', () => {
      const player = new MorsePlayer();
      expect(player.wpm).toBe(20);
      expect(player.frequency).toBe(600);
      expect(player.volume).toBe(80);
    });

    it('accepts custom options', () => {
      const player = new MorsePlayer({ wpm: 25, frequency: 800, volume: 50 });
      expect(player.wpm).toBe(25);
      expect(player.frequency).toBe(800);
      expect(player.volume).toBe(50);
    });

    it('clamps frequency to valid range', () => {
      expect(new MorsePlayer({ frequency: 50 }).frequency).toBe(200);
      expect(new MorsePlayer({ frequency: 5000 }).frequency).toBe(2000);
    });

    it('clamps volume to valid range', () => {
      expect(new MorsePlayer({ volume: -10 }).volume).toBe(0);
      expect(new MorsePlayer({ volume: 200 }).volume).toBe(100);
    });
  });

  describe('dynamic property setters', () => {
    it('updates wpm', () => {
      const player = new MorsePlayer();
      player.wpm = 30;
      expect(player.wpm).toBe(30);
    });

    it('clamps wpm on set', () => {
      const player = new MorsePlayer();
      player.wpm = 100;
      expect(player.wpm).toBe(60);
    });

    it('updates frequency', () => {
      const player = new MorsePlayer();
      player.frequency = 700;
      expect(player.frequency).toBe(700);
    });

    it('updates volume', () => {
      const player = new MorsePlayer();
      player.volume = 60;
      expect(player.volume).toBe(60);
    });
  });

  describe('play()', () => {
    it('transitions to playing state', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('E');

      // Flush microtasks (ensureContext is async)
      await vi.advanceTimersByTimeAsync(0);
      expect(player.state).toBe('playing');

      await vi.advanceTimersByTimeAsync(500);
      await playPromise;
    });

    it('fires onPlay callback', async () => {
      const onPlay = vi.fn();
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx, onPlay });
      const playPromise = player.play('E');

      await vi.advanceTimersByTimeAsync(0);
      expect(onPlay).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(500);
      await playPromise;
    });

    it('fires onEnd when playback completes', async () => {
      const onEnd = vi.fn();
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx, onEnd });
      const playPromise = player.play('E');

      await vi.advanceTimersByTimeAsync(0);
      // E at 20 WPM = 60ms + 100ms buffer = setTimeout at ~160ms
      await vi.advanceTimersByTimeAsync(500);
      await playPromise;

      expect(onEnd).toHaveBeenCalledOnce();
    });

    it('creates oscillator nodes for each signal', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('E');

      await vi.advanceTimersByTimeAsync(0);
      // E = . → 1 oscillator
      expect(ctx.createOscillator).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(500);
      await playPromise;
    });

    it('creates 9 oscillators for SOS', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');

      await vi.advanceTimersByTimeAsync(0);
      // SOS = ... --- ... → 9 signals
      expect(ctx.createOscillator).toHaveBeenCalledTimes(9);

      await vi.advanceTimersByTimeAsync(5000);
      await playPromise;
    });

    it('accepts raw morse with { morse: true }', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('...', { morse: true });

      await vi.advanceTimersByTimeAsync(0);
      expect(ctx.createOscillator).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(500);
      await playPromise;
    });

    it('resolves immediately for empty input', async () => {
      const player = new MorsePlayer();
      await player.play('');
      expect(player.state).toBe('idle');
    });

    it('reports totalTime', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx, wpm: 20 });
      const playPromise = player.play('E');

      await vi.advanceTimersByTimeAsync(0);
      // E = . at 20 WPM = 60ms
      expect(player.totalTime).toBe(60);

      player.stop();
      await playPromise;
    });

    it('creates gain envelope for each tone', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('E');

      await vi.advanceTimersByTimeAsync(0);
      // createGain called at least 2x (1 master + 1 per-tone)
      expect(ctx.createGain).toHaveBeenCalled();
      // Index 0 is masterGain, index 1+ are per-tone envelope gains
      const toneGainNode = (ctx.createGain as ReturnType<typeof vi.fn>).mock.results[1]?.value;
      expect(toneGainNode.gain.setValueAtTime).toHaveBeenCalled();
      expect(toneGainNode.gain.linearRampToValueAtTime).toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(500);
      await playPromise;
    });
  });

  describe('pause()', () => {
    it('transitions to paused state', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.pause();
      expect(player.state).toBe('paused');

      player.stop();
      await playPromise;
    });

    it('fires onPause callback', async () => {
      const onPause = vi.fn();
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx, onPause });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.pause();
      expect(onPause).toHaveBeenCalledOnce();

      player.stop();
      await playPromise;
    });

    it('suspends AudioContext', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.pause();
      expect((ctx as unknown as MockAudioContext).suspend).toHaveBeenCalled();

      player.stop();
      await playPromise;
    });

    it('is no-op when idle', () => {
      const player = new MorsePlayer();
      player.pause();
      expect(player.state).toBe('idle');
    });
  });

  describe('resume()', () => {
    it('transitions back to playing', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.pause();
      await player.resume();
      expect(player.state).toBe('playing');

      player.stop();
      await playPromise;
    });

    it('fires onResume callback', async () => {
      const onResume = vi.fn();
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx, onResume });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.pause();
      await player.resume();
      expect(onResume).toHaveBeenCalledOnce();

      player.stop();
      await playPromise;
    });

    it('resumes AudioContext', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.pause();
      await player.resume();
      expect((ctx as unknown as MockAudioContext).resume).toHaveBeenCalled();

      player.stop();
      await playPromise;
    });

    it('is no-op when idle', async () => {
      const player = new MorsePlayer();
      await player.resume();
      expect(player.state).toBe('idle');
    });
  });

  describe('stop()', () => {
    it('transitions to idle', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.stop();
      expect(player.state).toBe('idle');

      await playPromise;
    });

    it('fires onStop callback', async () => {
      const onStop = vi.fn();
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx, onStop });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.stop();
      expect(onStop).toHaveBeenCalledOnce();

      await playPromise;
    });

    it('resolves the play promise', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.stop();
      await expect(playPromise).resolves.toBeUndefined();
    });

    it('can stop from paused state', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      player.pause();
      player.stop();
      expect(player.state).toBe('idle');

      await playPromise;
    });
  });

  describe('dispose()', () => {
    it('stops playback and goes idle', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('E');
      await vi.advanceTimersByTimeAsync(0);

      player.dispose();
      expect(player.state).toBe('idle');

      await playPromise;
    });
  });

  describe('progress tracking', () => {
    it('starts with 0 currentTime and progress', () => {
      const player = new MorsePlayer();
      expect(player.currentTime).toBe(0);
      expect(player.progress).toBe(0);
    });

    it('returns 0 progress when totalTime is 0', () => {
      const player = new MorsePlayer();
      expect(player.progress).toBe(0);
    });
  });

  describe('preset integration', () => {
    it('works with preset-style options', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({
        audioContext: ctx,
        wpm: 15,
        frequency: 550,
        waveform: 'square',
        volume: 70,
      });

      expect(player.wpm).toBe(15);
      expect(player.frequency).toBe(550);
      expect(player.volume).toBe(70);

      const playPromise = player.play('E');
      await vi.advanceTimersByTimeAsync(0);

      // At 15 WPM: unit = 80ms, dot = 80ms
      expect(player.totalTime).toBe(80);

      player.stop();
      await playPromise;
    });
  });

  describe('edge cases', () => {
    it('stops previous playback when play is called again', async () => {
      const onStop = vi.fn();
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx, onStop });

      const firstPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);
      expect(player.state).toBe('playing');

      // Play again without stopping first
      const secondPromise = player.play('E');
      await vi.advanceTimersByTimeAsync(0);
      expect(player.state).toBe('playing');

      // First promise should resolve
      await firstPromise;

      player.stop();
      await secondPromise;
    });

    it('creates own AudioContext when none provided', async () => {
      const player = new MorsePlayer();
      const playPromise = player.play('E');
      await vi.advanceTimersByTimeAsync(0);
      expect(player.state).toBe('playing');

      player.stop();
      await playPromise;
    });

    it('dispose closes owned AudioContext', async () => {
      const player = new MorsePlayer();
      const playPromise = player.play('E');
      await vi.advanceTimersByTimeAsync(0);

      player.dispose();
      expect(player.state).toBe('idle');
      await playPromise;
    });

    it('supports Farnsworth timing', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({
        audioContext: ctx,
        wpm: 20,
        farnsworth: true,
        farnsworthWpm: 10,
      });

      const playPromise = player.play('. .', { morse: true });
      await vi.advanceTimersByTimeAsync(0);

      // Farnsworth extends inter-char gaps, so totalTime > standard timing
      // Standard: dot(60) + interChar(180) + dot(60) = 300
      // Farnsworth at 10 WPM overall: larger gaps
      expect(player.totalTime).toBeGreaterThan(300);

      player.stop();
      await playPromise;
    });

    it('paused currentTime returns pauseElapsed', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      (ctx as unknown as MockAudioContext).currentTime = 0;
      const player = new MorsePlayer({ audioContext: ctx });

      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      // Simulate some time passing
      (ctx as unknown as MockAudioContext).currentTime = 0.5;
      player.pause();

      expect(player.currentTime).toBeGreaterThan(0);

      player.stop();
      await playPromise;
    });

    it('volume setter updates masterGain while playing', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      const player = new MorsePlayer({ audioContext: ctx });
      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      // masterGain exists now, set volume should update it
      player.volume = 50;
      expect(player.volume).toBe(50);
      // The masterGain.gain.value should be updated (0.5)
      const masterGain = (ctx.createGain as ReturnType<typeof vi.fn>).mock.results[0]?.value;
      expect(masterGain.gain.value).toBe(0.5);

      player.stop();
      await playPromise;
    });

    it('progress is non-zero during playback', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      (ctx as unknown as MockAudioContext).currentTime = 0;
      const player = new MorsePlayer({ audioContext: ctx });

      const playPromise = player.play('SOS');
      await vi.advanceTimersByTimeAsync(0);

      // Simulate time advancing
      (ctx as unknown as MockAudioContext).currentTime = 0.5;
      expect(player.progress).toBeGreaterThan(0);
      expect(player.progress).toBeLessThanOrEqual(1);

      player.stop();
      await playPromise;
    });

    it('ensureContext resumes suspended context', async () => {
      const ctx = new MockAudioContext() as unknown as AudioContext;
      (ctx as unknown as MockAudioContext).state = 'suspended';
      const player = new MorsePlayer({ audioContext: ctx });

      const playPromise = player.play('E');
      await vi.advanceTimersByTimeAsync(0);

      expect((ctx as unknown as MockAudioContext).resume).toHaveBeenCalled();

      player.stop();
      await playPromise;
    });
  });
});
