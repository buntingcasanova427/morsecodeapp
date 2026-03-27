import { describe, it, expect } from 'vitest';
import {
  PROSIGNS,
  encodeProsign,
  decodeProsign,
  getProsign,
  listProsigns,
} from '../../src/core/prosigns.js';

describe('PROSIGNS', () => {
  it('contains at least 9 prosigns', () => {
    expect(PROSIGNS.length).toBeGreaterThanOrEqual(9);
  });

  it('includes SOS', () => {
    const sos = PROSIGNS.find((p) => p.label === 'SOS');
    expect(sos).toBeDefined();
    expect(sos!.morse).toBe('...---...');
  });
});

describe('encodeProsign', () => {
  it('encodes SOS', () => {
    expect(encodeProsign('SOS')).toBe('...---...');
  });

  it('encodes AR', () => {
    expect(encodeProsign('AR')).toBe('.-.-.');
  });

  it('is case-insensitive', () => {
    expect(encodeProsign('sos')).toBe('...---...');
  });

  it('returns undefined for unknown prosign', () => {
    expect(encodeProsign('XYZ')).toBeUndefined();
  });
});

describe('decodeProsign', () => {
  it('decodes SOS morse pattern', () => {
    expect(decodeProsign('...---...')).toBe('SOS');
  });

  it('returns undefined for non-prosign pattern', () => {
    expect(decodeProsign('.-')).toBeUndefined();
  });
});

describe('getProsign', () => {
  it('returns full prosign info', () => {
    const p = getProsign('SK');
    expect(p).toBeDefined();
    expect(p!.label).toBe('SK');
    expect(p!.meaning).toContain('End of contact');
  });
});

describe('listProsigns', () => {
  it('returns array of labels', () => {
    const labels = listProsigns();
    expect(labels).toContain('SOS');
    expect(labels).toContain('AR');
    expect(labels).toContain('SK');
  });
});
