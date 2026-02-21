// tests/senses.test.js — unit tests for composeFragments
// Tests the pure combination logic independent of game state.

import { test, expect, describe } from 'bun:test';
import { composeFragments } from '../js/senses.js';

// Helpers for building test fragments
const frag = (content, grammatical_type, attention_order = 'ambient') => ({
  id: content.slice(0, 8),
  content,
  grammatical_type,
  rhetorical_tag: 'continuation',
  channels: ['sound'],
  attention_order,
  trigger_conditions: () => true,
});

describe('composeFragments — null / empty', () => {
  test('returns null for null input', () => {
    expect(composeFragments(null, 'calm')).toBeNull();
  });

  test('returns null for empty array', () => {
    expect(composeFragments([], 'calm')).toBeNull();
  });
});

describe('composeFragments — single fragment', () => {
  test('single main: returned with period', () => {
    const result = composeFragments([frag('The fridge hums', 'main')], 'calm');
    expect(result).toBe('The fridge hums.');
  });

  test('single fragment: returned with period', () => {
    const result = composeFragments([frag('Cold', 'fragment', 'involuntary_body')], 'calm');
    expect(result).toBe('Cold.');
  });

  test('already-terminated content is not double-punctuated', () => {
    const result = composeFragments([frag('The fridge hums.', 'main')], 'calm');
    expect(result).toBe('The fridge hums.');
  });
});

describe('composeFragments — calm: main + modifiers', () => {
  test('main + absolute: comma-joined', () => {
    const result = composeFragments([
      frag('The fridge hums', 'main', 'ambient'),
      frag('something ticking in the pipes', 'absolute', 'ambient'),
    ], 'calm');
    expect(result).toBe('The fridge hums, something ticking in the pipes.');
  });

  test('main + participle: comma-joined', () => {
    const result = composeFragments([
      frag('She sat by the window', 'main', 'ambient'),
      frag('watching the street below', 'participle', 'ambient'),
    ], 'calm');
    expect(result).toBe('She sat by the window, watching the street below.');
  });

  test('main + two modifiers: all comma-joined', () => {
    const result = composeFragments([
      frag('The fridge hums', 'main', 'ambient'),
      frag('pipes ticking', 'absolute', 'ambient'),
      frag('traffic hissing', 'participle', 'ambient'),
    ], 'calm');
    expect(result).toBe('The fridge hums, pipes ticking, traffic hissing.');
  });

  test('fragment (involuntary_body) before main (ambient): fragment sentence first', () => {
    const result = composeFragments([
      frag('The fridge hums', 'main', 'ambient'),
      frag('Cold', 'fragment', 'involuntary_body'),
    ], 'calm');
    // involuntary_body before ambient → "Cold." comes before the main sentence
    expect(result).toBe('Cold. The fridge hums.');
  });

  test('no main clause: period-separated fallback', () => {
    const result = composeFragments([
      frag('Cold', 'fragment', 'involuntary_body'),
      frag('traffic hissing', 'absolute', 'ambient'),
    ], 'calm');
    expect(result).toBe('Cold. traffic hissing.');
  });
});

describe('composeFragments — anxious / dissociated', () => {
  test('anxious: each fragment is its own sentence', () => {
    const result = composeFragments([
      frag('The fridge hums', 'main', 'ambient'),
      frag('something in the pipes', 'absolute', 'ambient'),
    ], 'anxious');
    expect(result).toBe('The fridge hums. something in the pipes.');
  });

  test('dissociated: same as anxious — period-separated', () => {
    const result = composeFragments([
      frag('Cold', 'fragment', 'involuntary_body'),
      frag('The window', 'fragment', 'deliberate_visual'),
    ], 'dissociated');
    expect(result).toBe('Cold. The window.');
  });
});

describe('composeFragments — overwhelmed', () => {
  test('overwhelmed: polysyndeton (and...and...)', () => {
    const result = composeFragments([
      frag('the cold', 'fragment', 'involuntary_body'),
      frag('the noise', 'fragment', 'ambient'),
      frag('the light', 'fragment', 'deliberate_visual'),
    ], 'overwhelmed');
    expect(result).toBe('the cold and the light and the noise.');
  });

  test('overwhelmed: strips trailing punctuation before joining', () => {
    const result = composeFragments([
      frag('The fridge hums.', 'main', 'ambient'),
      frag('traffic outside', 'absolute', 'ambient'),
    ], 'overwhelmed');
    expect(result).toBe('The fridge hums and traffic outside.');
  });
});

describe('composeFragments — attention ordering', () => {
  test('involuntary_body sorts before ambient', () => {
    const result = composeFragments([
      frag('Traffic', 'fragment', 'ambient'),
      frag('Heavy', 'fragment', 'involuntary_body'),
    ], 'anxious');
    // involuntary_body first
    expect(result).toBe('Heavy. Traffic.');
  });

  test('deliberate_visual between involuntary_body and ambient', () => {
    const result = composeFragments([
      frag('Traffic', 'fragment', 'ambient'),
      frag('Heavy', 'fragment', 'involuntary_body'),
      frag('The window', 'fragment', 'deliberate_visual'),
    ], 'anxious');
    expect(result).toBe('Heavy. The window. Traffic.');
  });

  test('calm: modifiers attach to main regardless of source order', () => {
    const result = composeFragments([
      frag('traffic hissing', 'absolute', 'ambient'),  // listed first
      frag('The fridge hums', 'main', 'ambient'),       // listed second
    ], 'calm');
    // main should be root, absolute attached
    expect(result).toBe('The fridge hums, traffic hissing.');
  });
});

describe('composeFragments — hint fallback', () => {
  test('unknown hint falls back to calm behavior', () => {
    const result = composeFragments([
      frag('The fridge hums', 'main', 'ambient'),
      frag('traffic hissing', 'absolute', 'ambient'),
    ], 'unknown_hint');
    expect(result).toBe('The fridge hums, traffic hissing.');
  });

  test('undefined hint falls back to calm behavior', () => {
    const result = composeFragments([
      frag('The fridge hums', 'main', 'ambient'),
      frag('traffic hissing', 'absolute', 'ambient'),
    ], undefined);
    expect(result).toBe('The fridge hums, traffic hissing.');
  });
});
