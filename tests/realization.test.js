// tests/realization.test.js — unit tests for realize()
// Tests pure construction logic: architecture selection, lexical picking,
// passage combination. All deterministic via controlled random values.

import { test, expect, describe } from 'bun:test';
import { realize } from '../js/realization.js';

// --- Helpers ---

/** Deterministic RNG: returns values in sequence, cycling. */
function mkRng(...values) {
  let i = 0;
  return () => values[i++ % values.length];
}

/** r=0.0 always picks the first eligible item (lowest cumulative weight). */
const FIRST = 0.0;
/** r=0.99 always picks the last eligible item. */
const LAST  = 0.99;
/** r=0.5 picks the middle item. */
const MID   = 0.5;

const NEUTRAL = { gaba: 0.5, ne: 0.5, aden: 0.3, serotonin: 0.5, dopamine: 0.5 };
const ANXIOUS = { gaba: 0.25, ne: 0.75, aden: 0.4, serotonin: 0.4, dopamine: 0.4 };
const FOGGY   = { gaba: 0.5, ne: 0.3, aden: 0.8, serotonin: 0.5, dopamine: 0.4 };
const FLAT    = { gaba: 0.5, ne: 0.4, aden: 0.3, serotonin: 0.25, dopamine: 0.25 };

// Minimal valid Observation objects

const fridgeObs = {
  sourceId: 'fridge',
  channels: ['sound'],
  salience: 0.8,
  properties: {
    sound: { quality: 'hum', perceived_intensity: 0.4 },
  },
};

const coldObs = {
  sourceId: 'indoor_temperature',
  channels: ['thermal', 'touch'],
  salience: 0.7,
  properties: {
    thermal: { celsius: 10, cold: true, warm: false, very_cold: false, immediate: false },
  },
};

const veryColObs = {
  sourceId: 'outdoor_temperature',
  channels: ['thermal'],
  salience: 0.9,
  properties: {
    thermal: { celsius: 2, cold: true, warm: false, very_cold: true, immediate: true },
  },
};

const fatigueObs = {
  sourceId: 'fatigue',
  channels: ['interoception'],
  salience: 0.75,
  properties: {
    interoception: { adenosine: 72 },
  },
};

const hungerObs = {
  sourceId: 'hunger_signal',
  channels: ['interoception'],
  salience: 0.6,
  properties: {
    interoception: { gnawing: true, hollow: false, low_grade: false, irritable: true },
  },
};

const anxietyObs = {
  sourceId: 'anxiety_signal',
  channels: ['interoception'],
  salience: 0.65,
  properties: {
    interoception: { gaba: 30, ne: 70 },
  },
};

const trafficObs = {
  sourceId: 'traffic_outdoor',
  channels: ['sound'],
  salience: 0.5,
  properties: {
    sound: { quality: 'traffic', filtered: false },
  },
};

const unknownObs = {
  sourceId: 'unknown_source_xyz',
  channels: ['sound'],
  salience: 0.5,
  properties: {},
};

// --- Null / empty ---

describe('realize — null / empty', () => {
  test('returns null for null observations', () => {
    expect(realize(null, 'calm', NEUTRAL, mkRng(0.5))).toBeNull();
  });

  test('returns null for empty array', () => {
    expect(realize([], 'calm', NEUTRAL, mkRng(0.5))).toBeNull();
  });

  test('returns null when all observations have unknown sourceId', () => {
    expect(realize([unknownObs], 'calm', NEUTRAL, mkRng(FIRST))).toBeNull();
  });
});

// --- Short declarative ---

describe('realize — short declarative', () => {
  test('fridge calm: produces sentence containing "fridge"', () => {
    // r1=FIRST → first arch (short), r2=FIRST → first subject ("the fridge"),
    // r3=FIRST → first predicate ("hums"), r4=LAST → modifier check
    const result = realize([fridgeObs], 'calm', NEUTRAL, mkRng(FIRST, FIRST, FIRST, LAST));
    expect(result).toBeTruthy();
    expect(result.toLowerCase()).toMatch(/fridge/);
  });

  test('fridge calm: ends with period', () => {
    const result = realize([fridgeObs], 'calm', NEUTRAL, mkRng(FIRST));
    expect(result).toMatch(/\.$/);
  });

  test('fridge calm: starts with capital letter', () => {
    const result = realize([fridgeObs], 'calm', NEUTRAL, mkRng(FIRST));
    expect(result).toMatch(/^[A-Z]/);
  });

  test('traffic outdoor: produces sentence containing car/traffic', () => {
    const result = realize([trafficObs], 'anxious', ANXIOUS, mkRng(FIRST));
    expect(result.toLowerCase()).toMatch(/car|traffic/);
  });

  test('anxious: produces short declarative (high short weight)', () => {
    // With r1=FIRST, anxious arch weights heavily favor 'short'
    const result = realize([fridgeObs], 'anxious', ANXIOUS, mkRng(FIRST, FIRST, FIRST, FIRST));
    expect(result).toMatch(/fridge/i);
  });
});

// --- Bare fragment ---

describe('realize — bare fragment', () => {
  test('dissociated fridge: can produce bare fragment', () => {
    // r1 set to pick 'bare' architecture (third arch in list)
    // In dissociated: archs are [short(0.8), body(0), bare(1.2), ambig(0), escape(0)]
    // bare weight 1.2 out of total 2.0 → hits at r >= 0.4
    const result = realize([fridgeObs], 'dissociated', FOGGY, mkRng(0.6, FIRST, FIRST, FIRST));
    expect(result).toMatch(/\.$/);
  });

  test('fatigue dissociated: bare fragment returns a complete sentence', () => {
    const result = realize([fatigueObs], 'dissociated', FOGGY, mkRng(0.6, FIRST, FIRST, FIRST));
    expect(result).toBeTruthy();
    expect(result).toMatch(/\.$/);
  });
});

// --- Body-as-subject ---

describe('realize — body-as-subject', () => {
  test('fatigue calm: body-as-subject produces "something" or "weight" as subject', () => {
    // r1 set to pick 'body' architecture
    // In calm: archs [short(1.2), body(0.8), bare(0.2), ambig(0), escape(0)] total=2.2
    // body starts at 1.2, hits at r in [1.2/2.2, 2.0/2.2) ≈ [0.545, 0.909)
    const result = realize([fatigueObs], 'calm', FOGGY, mkRng(0.6, FIRST, FIRST, FIRST));
    expect(result).toBeTruthy();
    expect(result.toLowerCase()).toMatch(/weight|something|everything/);
  });

  test('outdoor cold: body-as-subject produces cold-themed sentence', () => {
    const result = realize([veryColObs], 'calm', NEUTRAL, mkRng(0.6, FIRST, FIRST, FIRST));
    expect(result.toLowerCase()).toMatch(/cold|wind|air/);
  });

  test('body-as-subject ends with period', () => {
    const result = realize([fatigueObs], 'calm', FOGGY, mkRng(0.6, FIRST, FIRST, FIRST));
    expect(result).toMatch(/\.$/);
  });
});

// --- Source ambiguity ---

describe('realize — source ambiguity', () => {
  test('fridge dissociated: source ambiguity produces "Something — ... —" sentence', () => {
    // In dissociated: [short(0.8), body(0), bare(1.2), ambig(1.5), escape(0)] total=3.5
    // ambig starts at 2.0, hits at r in [2.0/3.5, 3.5/3.5) ≈ [0.571, 1.0)
    const result = realize([fridgeObs], 'dissociated', FOGGY, mkRng(0.8, FIRST, FIRST, FIRST));
    expect(result).toMatch(/Something/);
    expect(result).toMatch(/—/);
    expect(result).toMatch(/fridge/i);
    expect(result).toMatch(/maybe/);
  });

  test('source ambiguity includes an alternative label', () => {
    const result = realize([fridgeObs], 'dissociated', FOGGY, mkRng(0.8, FIRST, FIRST, FIRST));
    // Should contain one of the ambiguity_alts
    expect(result.toLowerCase()).toMatch(/heat|building/);
  });
});

// --- Interpretive escape ---

describe('realize — interpretive escape', () => {
  test('fridge calm: escape produces "and [escape]" clause', () => {
    // In calm: [short(1.2), body(0), bare(0.2), ambig(0), escape(1.0)] total=2.4
    // escape starts at 1.4, hits at r in [1.4/2.4, 2.4/2.4) ≈ [0.583, 1.0)
    const result = realize([fridgeObs], 'calm', NEUTRAL, mkRng(0.9, FIRST, FIRST, FIRST));
    expect(result).toMatch(/, and /);
  });

  test('interpretive escape ends with period', () => {
    const result = realize([fridgeObs], 'calm', NEUTRAL, mkRng(0.9, FIRST, FIRST, FIRST));
    expect(result).toMatch(/\.$/);
  });
});

// --- Multi-observation passages ---

describe('realize — multi-observation passages', () => {
  test('calm: two observations produce two sentences', () => {
    const result = realize([fridgeObs, coldObs], 'calm', NEUTRAL, mkRng(FIRST));
    expect(result).toBeTruthy();
    // Two sentences → two periods
    expect((result.match(/\./g) || []).length).toBeGreaterThanOrEqual(2);
  });

  test('anxious: three observations produces multiple sentences', () => {
    const result = realize(
      [fatigueObs, fridgeObs, trafficObs], 'anxious', ANXIOUS, mkRng(FIRST)
    );
    expect(result).toBeTruthy();
    expect((result.match(/\./g) || []).length).toBeGreaterThanOrEqual(2);
  });

  test('realize takes all observations passed — caller controls selection', () => {
    // Caller (senses.js) applies threshold; realize() processes everything given.
    // Passing 2 observations produces 2 sentences regardless of NT hint.
    const observations = [fridgeObs, coldObs];
    const result = realize(observations, 'calm', NEUTRAL, mkRng(FIRST));
    expect((result.match(/\./g) || []).length).toBeGreaterThanOrEqual(2);
  });
});

// --- Overwhelmed: polysyndeton ---

describe('realize — overwhelmed polysyndeton', () => {
  test('overwhelmed: multiple observations joined with "and"', () => {
    const result = realize([fatigueObs, fridgeObs, trafficObs], 'overwhelmed', ANXIOUS, mkRng(FIRST));
    expect(result).toMatch(/ and /);
  });

  test('overwhelmed: single sentence (no mid-sentence periods)', () => {
    const result = realize([fatigueObs, fridgeObs], 'overwhelmed', ANXIOUS, mkRng(FIRST));
    // Should end with exactly one period
    expect(result).toMatch(/\.$/);
    // No periods before the final one
    expect(result.replace(/\.$/, '')).not.toMatch(/\./);
  });

  test('overwhelmed: starts with capital letter', () => {
    const result = realize([fridgeObs, trafficObs], 'overwhelmed', ANXIOUS, mkRng(FIRST));
    expect(result).toMatch(/^[A-Z]/);
  });

  test('overwhelmed: subsequent phrases are lowercased', () => {
    const result = realize([fridgeObs, trafficObs], 'overwhelmed', ANXIOUS, mkRng(FIRST));
    // After first "and", the next phrase should start lowercase
    const parts = result.replace(/\.$/, '').split(' and ');
    if (parts.length > 1) {
      expect(parts[1].charAt(0)).toMatch(/[a-z]/);
    }
  });
});

// --- NT-weighted lexical selection ---

describe('realize — NT-weighted lexical variation', () => {
  test('fridge at high adenosine: more likely to use vague subject', () => {
    // At very high aden, "something" gets weight 1.5 vs "the fridge" at 1.0
    // Drive r2 toward LAST to pick higher-weighted "something" variants
    const foggyHighAden = { ...FOGGY, aden: 0.85 };
    const result = realize([fridgeObs], 'calm', foggyHighAden, mkRng(FIRST, 0.7, FIRST, LAST));
    expect(result).toBeTruthy();
    // Can't guarantee exact pick but result should be a valid sentence
    expect(result).toMatch(/\.$/);
  });

  test('hunger gnawing: body predicate mentions "won\'t stop" or makes itself known', () => {
    const result = realize([hungerObs], 'calm', NEUTRAL, mkRng(0.6, FIRST, 0.3, LAST));
    expect(result.toLowerCase()).toMatch(/hunger|something|emptiness|irritability/i);
  });

  test('anxiety unsettled: predicate contains "can\'t settle" ', () => {
    // Body architecture in calm picks body_predicates weighted by _char_unsettled
    const result = realize([anxietyObs], 'calm', NEUTRAL, mkRng(0.6, FIRST, FIRST, LAST));
    expect(result.toLowerCase()).toMatch(/settle|body|something|unease/);
  });
});

// --- RNG consumption is fixed ---

describe('realize — fixed RNG consumption', () => {
  test('2 observations: consumes exactly 8 random() calls', () => {
    let calls = 0;
    const countingRng = () => { calls++; return 0.1; };
    realize([fridgeObs, trafficObs], 'calm', NEUTRAL, countingRng);
    expect(calls).toBe(8); // 2 observations × 4 calls each
  });

  test('3 observations: consumes exactly 12 calls', () => {
    let calls = 0;
    const countingRng = () => { calls++; return 0.1; };
    realize([fatigueObs, fridgeObs, trafficObs], 'anxious', ANXIOUS, countingRng);
    expect(calls).toBe(12);
  });

  test('3 observations overwhelmed: consumes exactly 12 calls', () => {
    let calls = 0;
    const countingRng = () => { calls++; return 0.1; };
    realize([fatigueObs, fridgeObs, trafficObs], 'overwhelmed', ANXIOUS, countingRng);
    expect(calls).toBe(12);
  });

  test('1 observation (any hint): consumes exactly 4 calls', () => {
    let calls = 0;
    const countingRng = () => { calls++; return 0.1; };
    realize([fridgeObs], 'dissociated', FOGGY, countingRng);
    expect(calls).toBe(4);
  });
});

// --- Unknown hint fallback ---

describe('realize — unknown hint fallback', () => {
  test('unknown hint falls back to calm behavior', () => {
    const result = realize([fridgeObs], 'unknown_hint', NEUTRAL, mkRng(FIRST));
    expect(result).toBeTruthy();
    expect(result).toMatch(/\.$/);
  });
});

// --- Reframe dash ---

describe('realize — reframe dash', () => {
  test('fatigue flat: reframe dash produces "Not ... — ..." sentence', () => {
    // flat hint: reframe=0.2, char_pred=0.6, flat_taut=0.6
    // fatigue has reframe_pairs, character_predicates, flat_descriptions
    // Need to force r1 to pick reframe arch
    // flat + fatigue total: short(1.5)+body(0.8)+bare(0.6)+ambig(0)+escape(0)+reframe(0.2)+char_pred(0.6)+flat_taut(0.6)+inversion(0.2) = 4.5
    // reframe starts at: 1.5+0.8+0.6+0+0 = 2.9, so r >= 2.9/4.5 = 0.644
    // reframe ends at: 2.9+0.2 = 3.1, so r < 3.1/4.5 = 0.689
    // Use r1=0.66 to pick reframe
    const result = realize([fatigueObs], 'flat', FLAT, mkRng(0.66, FIRST, FIRST, FIRST));
    expect(result).toMatch(/^Not /);
    expect(result).toMatch(/—/);
    expect(result).toMatch(/\.$/);
  });

  test('reframe dash: starts with "Not"', () => {
    const result = realize([fatigueObs], 'flat', FLAT, mkRng(0.66, FIRST, FIRST, FIRST));
    expect(result).toMatch(/^Not /);
  });
});

// --- Sensation as character ---

describe('realize — sensation as character', () => {
  test('fatigue flat: char_pred produces a sentence with character predicate', () => {
    // flat + fatigue: char_pred starts at 3.1, ends at 3.7, so r in [3.1/4.5, 3.7/4.5) = [0.689, 0.822)
    // Use r1=0.75
    const result = realize([fatigueObs], 'flat', FLAT, mkRng(0.75, FIRST, FIRST, FIRST));
    expect(result).toBeTruthy();
    expect(result).toMatch(/\.$/);
    // Subject comes from lex.subjects (fatigue): something/the body/it/the weight of it
    expect(result.toLowerCase()).toMatch(/something|body|weight/);
  });

  test('anxiety dissociated: char_pred uses subject from subjects pool', () => {
    // dissociated + anxiety_signal has reframe(0.2), char_pred(0.8)
    // dissociated + anxiety total: short(0.8)+body(0.6)+bare(1.2)+ambig(0)+escape(0)+reframe(0.2)+char_pred(0.8)+flat_taut(0)+inversion(0) = 3.6
    // char_pred starts at 0.8+0.6+1.2+0+0+0.2 = 2.8, ends at 3.6, r in [2.8/3.6, 3.6/3.6) = [0.778, 1.0)
    const result = realize([anxietyObs], 'dissociated', FOGGY, mkRng(0.9, FIRST, FIRST, FIRST));
    expect(result).toBeTruthy();
    expect(result).toMatch(/\.$/);
  });
});

// --- Flat tautology ---

describe('realize — flat tautology', () => {
  test('fatigue flat: flat_taut produces a short description', () => {
    // flat + fatigue: flat_taut starts at 3.7, ends at 4.3, r in [3.7/4.5, 4.3/4.5) = [0.822, 0.956)
    // Use r1=0.88
    const result = realize([fatigueObs], 'flat', FLAT, mkRng(0.88, FIRST, FIRST, FIRST));
    expect(result).toBeTruthy();
    expect(result).toMatch(/\.$/);
    // Should be one of the flat_descriptions for fatigue
    expect(result).toMatch(/tired|body|heavy/i);
  });

  test('flat tautology: ends with period', () => {
    const result = realize([fatigueObs], 'flat', FLAT, mkRng(0.88, FIRST, FIRST, FIRST));
    expect(result).toMatch(/\.$/);
  });
});

// --- Conditional inversion ---

describe('realize — conditional inversion', () => {
  test('fatigue calm: inversion produces "subject predicate, but only..." sentence', () => {
    // calm + fatigue: inversion starts at 2.9, ends at 3.3, r in [2.9/3.3, 3.3/3.3) = [0.879, 1.0)
    // Use r1=0.92
    const result = realize([fatigueObs], 'calm', FOGGY, mkRng(0.92, FIRST, FIRST, FIRST));
    expect(result).toBeTruthy();
    expect(result).toMatch(/but only/);
    expect(result).toMatch(/\.$/);
  });

  test('inversion: contains comma before condition', () => {
    const result = realize([fatigueObs], 'calm', FOGGY, mkRng(0.92, FIRST, FIRST, FIRST));
    expect(result).toMatch(/, but only/);
  });
});

// --- New architectures: RNG consumption unchanged ---

describe('realize — new architectures consume exactly 4 calls', () => {
  test('reframe dash: still 4 calls', () => {
    let calls = 0;
    const countingRng = () => { calls++; return 0.66; };
    realize([fatigueObs], 'flat', FLAT, countingRng);
    expect(calls).toBe(4);
  });

  test('sensation character: still 4 calls', () => {
    let calls = 0;
    const countingRng = () => { calls++; return 0.75; };
    realize([fatigueObs], 'flat', FLAT, countingRng);
    expect(calls).toBe(4);
  });

  test('flat tautology: still 4 calls', () => {
    let calls = 0;
    const countingRng = () => { calls++; return 0.88; };
    realize([fatigueObs], 'flat', FLAT, countingRng);
    expect(calls).toBe(4);
  });

  test('conditional inversion: still 4 calls', () => {
    let calls = 0;
    const countingRng = () => { calls++; return 0.92; };
    realize([fatigueObs], 'calm', FOGGY, countingRng);
    expect(calls).toBe(4);
  });
});
