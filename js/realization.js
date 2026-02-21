// js/realization.js — procedural sentence construction from Observation data.
// Pure module: no game imports, no side effects. Testable in isolation.
//
// realize(observations, hint, ntCtx, random) → string | null
//
//   observations  Observation[] from senses.getObservations()
//   hint          'calm' | 'anxious' | 'dissociated' | 'overwhelmed' | 'flat' | 'heightened'
//   ntCtx         { gaba, ne, aden, serotonin, dopamine } — normalized 0–1 (0.5 = baseline)
//   random        () => number in [0, 1) — caller provides seeded RNG
//
// RNG consumption: exactly 4 calls per selected observation, always.
// A passage of N sentences consumes N × 4 calls regardless of which architectures fire.

// --- Utilities ---

function cap(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Weighted pick using a single pre-rolled value r in [0, 1).
 * items: [{ weight: number, value: any }]
 */
function wpick(items, r) {
  const total = items.reduce((s, i) => s + Math.max(0, i.weight), 0);
  if (total <= 0) return items[0]?.value ?? null;
  let cursor = r * total;
  for (const item of items) {
    cursor -= Math.max(0, item.weight);
    if (cursor <= 0) return item.value;
  }
  return items[items.length - 1]?.value ?? null;
}

/**
 * Pick text from a pool using NT-weighted items.
 * Each pool item: string | { text: string|null, w: number | (ntCtx) => number }
 * Returns string or null (null items represent "no modifier").
 */
function pickText(pool, ntCtx, r) {
  if (!pool || pool.length === 0) return null;
  const items = pool.map(item => {
    if (typeof item === 'string') return { weight: 1, value: item };
    const w = typeof item.w === 'function' ? item.w(ntCtx) : (item.w ?? 1);
    return { weight: Math.max(0, w), value: item.text };
  });
  return wpick(items, r);
}

// --- Lexical sets ---
//
// One entry per sourceId. Each entry defines how to realize that source.
// Body sources (interoception, thermal) include body_subjects + body_predicates
// for the body-as-subject architecture.
// Modifier pools include { text: null, w: N } options for "no modifier."
// ambiguity_alts: alternatives for the source-ambiguity architecture.
// escapes: interpretive-escape suffixes ("and [escape].").
// fragments: short NP forms used in bare-fragment architecture.

const LEX = {

  fridge: {
    // Only subjects that can take any predicate — "a hum" can't "run" or "sit there"
    subjects: [
      'the fridge',
      { text: 'something', w: nt => nt.aden > 0.6 ? 1.5 : 0.2 },
    ],
    predicates: [
      'hums',
      { text: 'has been going', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'sits there', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.1 },
    ],
    modifiers: [
      { text: null, w: 1.2 },
      { text: 'too loud', w: nt => nt.gaba < 0.4 ? 1.5 : 0.1 },
      { text: 'at the wrong frequency', w: nt => nt.ne > 0.6 ? 1.0 : 0.05 },
      { text: 'steadily', w: nt => nt.gaba > 0.5 ? 0.8 : 0.1 },
    ],
    ambiguity_alts: ['the heat', 'the building'],
    escapes: [
      { text: 'the sound was just a sound', w: 1.0 },
      { text: 'it had been going the whole time', w: nt => nt.aden > 0.5 ? 1.0 : 0.5 },
      { text: 'the fridge was just the fridge', w: nt => nt.serotonin < 0.4 ? 1.5 : 0.3 },
    ],
    fragments: [
      'the fridge',
      'a hum',
      { text: 'a hum from somewhere', w: nt => nt.aden > 0.5 ? 1.2 : 0.4 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.5 : 0.4 },
    ],
  },

  pipes: {
    subjects: [
      'something in the pipes',
      { text: 'the pipes', w: nt => nt.aden < 0.5 ? 1.0 : 0.4 },
      { text: 'something in the walls', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    predicates: [
      'ticks',
      'clicks',
      { text: 'settles', w: 0.7 },
      { text: 'knocks once', w: 0.5 },
    ],
    modifiers: [
      { text: null, w: 1.5 },
      { text: 'and then again', w: 0.5 },
      { text: 'somewhere in the walls', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    fragments: [
      'something in the pipes',
      { text: 'a tick from somewhere', w: 0.7 },
    ],
  },

  electronic_whine: {
    subjects: [
      'a thin whine',
      { text: 'a frequency', w: nt => nt.ne > 0.6 ? 1.5 : 0.5 },
      'something electronic',
    ],
    predicates: [
      'from somewhere',
      { text: 'from the outlet, maybe', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: "that isn't quite a sound", w: nt => nt.aden > 0.6 ? 1.2 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    fragments: [
      'a thin whine',
      { text: "a frequency that doesn't belong", w: nt => nt.ne > 0.6 ? 1.0 : 0.3 },
    ],
  },

  traffic_through_walls: {
    subjects: [
      'traffic outside',
      { text: 'the street', w: nt => nt.aden < 0.5 ? 1.0 : 0.3 },
      { text: 'cars outside', w: nt => nt.ne > 0.6 ? 1.0 : 0.4 },
    ],
    predicates: [
      'bleeds through the walls',
      'makes it through anyway',
      { text: 'is still going', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    fragments: [
      'traffic outside',
      { text: 'the street, muffled', w: 0.8 },
    ],
  },

  indoor_temperature: {
    subjects: [
      { text: 'the room', w: 1.0 },
      { text: 'the apartment', w: 0.6 },
      { text: 'the air', w: 0.8 },
    ],
    predicates: [
      { text: 'is cold', w: nt => nt._temp_cold ? 1.0 : 0 },
      { text: "hasn't warmed up", w: nt => nt._temp_cold ? 0.7 : 0 },
      { text: 'holds the cold', w: nt => nt._temp_cold ? 0.8 : 0 },
      { text: 'is warm', w: nt => nt._temp_warm ? 1.0 : 0 },
      { text: 'holds the heat', w: nt => nt._temp_warm ? 0.8 : 0 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'the cold', w: nt => nt._temp_cold ? 1.5 : 0.1 },
      { text: 'cold', w: nt => nt._temp_cold && nt.aden > 0.6 ? 1.2 : 0.4 },
    ],
    body_predicates: [
      { text: 'sits in the room', w: 1.0 },
      { text: 'has settled in', w: 0.8 },
      { text: 'finds its way through', w: nt => nt.ne > 0.5 ? 1.0 : 0.4 },
    ],
    fragments: [
      { text: 'cold', w: nt => nt._temp_cold ? 2.5 : 0 },
      { text: 'warm in here', w: nt => nt._temp_warm ? 2.5 : 0 },
      { text: 'the room', w: 0.3 },
    ],
  },

  fatigue: {
    subjects: [
      { text: 'something', w: nt => nt.aden > 0.7 ? 1.5 : 0.5 },
      { text: 'the body', w: 0.6 },
    ],
    predicates: [
      { text: 'has weight to it', w: 1.0 },
      { text: "doesn't lift", w: nt => nt.aden > 0.7 ? 1.0 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'something', w: nt => nt.aden > 0.7 ? 1.5 : 0.8 },
      { text: 'weight', w: nt => nt._quality_weighted ? 1.5 : 0.5 },
      { text: 'everything', w: nt => nt._quality_crushing ? 1.2 : 0.2 },
    ],
    body_predicates: [
      { text: 'pulls toward horizontal', w: nt => nt._quality_gravitational ? 2.0 : 0.3 },
      { text: 'has the density of something real', w: nt => nt._quality_gravitational ? 1.5 : 0.1 },
      { text: 'settles into the shoulders', w: nt => nt._quality_weighted ? 2.0 : 0.4 },
      { text: 'sits in the chest', w: nt => nt._quality_weighted ? 1.0 : 0.3 },
      { text: 'is just there', w: 0.8 },
      { text: 'makes itself heavy', w: nt => nt.aden > 0.6 ? 1.0 : 0.3 },
    ],
    fragments: [
      { text: 'heavy', w: nt => (nt._quality_weighted || nt._quality_gravitational) ? 1.5 : 0.7 },
      { text: 'something', w: nt => nt.aden > 0.7 ? 1.0 : 0.3 },
    ],
  },

  hunger_signal: {
    subjects: [
      { text: 'something', w: nt => nt._quality_low_grade ? 1.5 : 0.5 },
      { text: 'hunger', w: nt => (nt._quality_gnawing || nt._quality_hollow) ? 1.5 : 0.7 },
      { text: 'an emptiness', w: nt => nt._quality_hollow ? 2.0 : 0.2 },
      { text: 'an irritability', w: nt => nt._irritable ? 1.5 : 0.1 },
    ],
    predicates: [
      { text: 'is there', w: 0.8 },
      { text: 'makes itself known', w: nt => nt._quality_gnawing ? 1.5 : 0.5 },
      { text: 'is going', w: nt => nt._quality_low_grade ? 1.5 : 0.5 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'hunger', w: nt => (nt._quality_gnawing || nt._quality_hollow) ? 1.5 : 0.7 },
      { text: 'something', w: 0.8 },
      { text: 'an emptiness', w: nt => nt._quality_hollow ? 1.5 : 0.2 },
    ],
    body_predicates: [
      { text: "hasn't found a target yet", w: nt => nt._irritable ? 1.5 : 0.3 },
      { text: "won't stop", w: nt => nt._quality_gnawing ? 1.5 : 0.3 },
      { text: 'makes itself specific', w: nt => nt._quality_hollow ? 1.0 : 0.3 },
      { text: 'is in the background', w: nt => nt._quality_low_grade ? 1.5 : 0.3 },
      { text: 'is starting', w: nt => nt._quality_low_grade ? 1.0 : 0.2 },
    ],
    fragments: [
      { text: 'hungry', w: nt => nt._quality_gnawing ? 1.5 : 0.8 },
      { text: 'something', w: nt => nt._quality_low_grade ? 1.5 : 0.5 },
    ],
  },

  anxiety_signal: {
    subjects: [
      { text: 'something', w: 1.2 },
      { text: 'the body', w: nt => nt._char_keyed_up ? 1.0 : 0.4 },
      { text: 'an unease', w: nt => nt._char_unsettled ? 1.0 : 0.3 },
    ],
    predicates: [
      { text: "can't settle", w: nt => nt._char_unsettled ? 2.0 : 0.3 },
      { text: 'is running faster than it should', w: nt => nt._char_keyed_up ? 2.0 : 0.2 },
      { text: 'is ahead of wherever this is going', w: nt => nt._char_keyed_up ? 1.0 : 0.2 },
      { text: 'needs something to fix on', w: nt => nt._char_restless ? 1.5 : 0.3 },
      { text: 'is there and unreasonable', w: nt => nt.gaba < 0.4 ? 1.0 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'something', w: 1.5 },
      { text: 'the body', w: 0.8 },
    ],
    body_predicates: [
      { text: "can't settle", w: nt => nt._char_unsettled ? 2.0 : 0.5 },
      { text: 'is already ahead of this', w: nt => nt._char_keyed_up ? 1.5 : 0.3 },
      { text: 'keeps looking for the thing', w: nt => nt._char_restless ? 1.5 : 0.3 },
      { text: 'is running without direction', w: 0.7 },
    ],
    fragments: [
      { text: "can't settle", w: nt => nt._char_unsettled ? 1.5 : 0.8 },
      { text: 'something', w: 0.6 },
    ],
  },

  traffic_outdoor: {
    subjects: [
      'a car',
      { text: 'traffic', w: 0.7 },
      { text: "someone's car", w: 0.6 },
    ],
    predicates: [
      'goes past',
      'passes',
      { text: 'slows and accelerates', w: 0.7 },
    ],
    modifiers: [
      { text: null, w: 1.0 },
      { text: 'without stopping', w: 0.8 },
      { text: 'with its headlights still on', w: 0.6 },
    ],
    fragments: [
      'traffic',
      { text: 'a car going past', w: 0.7 },
    ],
  },

  street_voices: {
    subjects: [
      'voices',
      { text: 'someone', w: 0.7 },
      { text: 'two people', w: 0.6 },
    ],
    predicates: [
      'from across the street',
      'passing',
      { text: 'going past without stopping', w: 0.5 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    fragments: [
      'voices',
      { text: 'someone outside', w: 0.6 },
    ],
  },

  outdoor_temperature: {
    subjects: [
      { text: 'the air', w: 0.8 },
      { text: 'the cold', w: nt => nt._temp_cold ? 1.5 : 0 },
      { text: 'the warmth', w: nt => nt._temp_warm ? 1.5 : 0 },
    ],
    predicates: [
      { text: 'hits immediately', w: nt => nt._immediate ? 1.5 : 0.2 },
      { text: 'is cold', w: nt => nt._temp_cold ? 1.0 : 0 },
      { text: 'is warm', w: nt => nt._temp_warm ? 1.0 : 0 },
      { text: 'has stayed warm', w: nt => nt._temp_warm ? 0.7 : 0 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'the cold', w: nt => nt._temp_cold ? 1.5 : 0.1 },
      { text: 'cold', w: nt => nt._temp_cold && nt.aden > 0.6 ? 1.2 : 0.3 },
    ],
    body_predicates: [
      { text: 'hits immediately', w: nt => nt._immediate ? 2.0 : 0.3 },
      { text: 'sits on the back of the neck', w: 1.0 },
      { text: 'finds the face first', w: 0.8 },
      { text: 'goes through the coat', w: nt => nt._temp_very_cold ? 1.5 : 0.3 },
    ],
    fragments: [
      { text: 'cold', w: nt => nt._temp_cold ? 1.5 : 0 },
      { text: 'warm out', w: nt => nt._temp_warm ? 1.5 : 0 },
      { text: 'the air', w: 0.5 },
    ],
  },

  wind: {
    subjects: [
      'a wind',
      { text: 'the wind', w: 0.8 },
    ],
    predicates: [
      'cuts',
      { text: 'actually cuts', w: nt => nt.ne > 0.5 ? 1.5 : 0.7 },
      'goes through the coat',
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      'the wind',
      { text: 'something cutting', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    body_predicates: [
      'finds the collar',
      'goes through rather than around',
      { text: 'actually cuts', w: nt => nt.ne > 0.5 ? 1.5 : 0.7 },
    ],
    fragments: [
      'wind',
      { text: 'cold wind', w: 0.8 },
    ],
  },

  rain: {
    subjects: [
      'rain',
      { text: 'it', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'the rain', w: 0.8 },
    ],
    predicates: [
      'is coming down',
      { text: 'has already been going for a while', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      'covers everything',
    ],
    modifiers: [
      { text: null, w: 1.5 },
      { text: 'and everything is wet', w: 0.7 },
    ],
    fragments: [
      'rain',
      { text: 'everything wet', w: 0.6 },
    ],
  },

  // === APARTMENT: VISUAL ===

  window_light: {
    subjects: [
      { text: 'the window', w: 0.8 },
      { text: 'grey light', w: nt => nt._condition_grey ? 2.0 : 0 },
      { text: 'morning light', w: nt => nt._condition_early_light ? 2.0 : 0 },
      { text: 'the light', w: nt => !nt._condition_dark ? 1.0 : 0.1 },
    ],
    predicates: [
      { text: 'is still dark', w: nt => nt._condition_dark ? 3.0 : 0 },
      { text: 'is grey', w: nt => nt._condition_grey ? 2.0 : 0 },
      { text: 'has arrived', w: nt => nt._condition_early_light ? 2.0 : 0 },
      { text: 'is going', w: nt => nt._condition_dimming ? 2.0 : 0 },
      { text: 'comes through', w: nt => !nt._condition_dark ? 1.0 : 0 },
      { text: 'is outside', w: 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.5 },
      { text: 'flat', w: nt => nt.serotonin < 0.4 && nt._condition_grey ? 1.5 : 0 },
      { text: 'through the blinds', w: nt => !nt._condition_dark ? 0.5 : 0 },
      { text: 'already', w: nt => nt._condition_early_light && nt.aden > 0.5 ? 1.0 : 0 },
    ],
    escapes: [
      { text: 'it was morning', w: nt => nt._condition_early_light ? 1.5 : 0.3 },
      { text: 'the day had started', w: nt => nt._condition_early_light ? 1.0 : 0.3 },
      { text: 'it was just the light', w: 1.0 },
    ],
    fragments: [
      { text: 'grey', w: nt => nt._condition_grey ? 2.5 : 0 },
      { text: 'dark', w: nt => nt._condition_dark ? 2.5 : 0 },
      { text: 'morning', w: nt => nt._condition_early_light ? 2.0 : 0 },
      { text: 'light', w: nt => !nt._condition_dark ? 0.8 : 0 },
      { text: 'the window', w: 0.5 },
    ],
  },

  // === APARTMENT: BATHROOM ===

  bathroom_echo: {
    subjects: [
      { text: 'everything', w: 0.5 },
      { text: 'the tile', w: nt => nt.ne > 0.6 ? 1.0 : 0.5 },
      { text: 'small sounds', w: nt => nt.ne > 0.5 ? 1.2 : 0.5 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
    ],
    predicates: [
      { text: 'echo in here', w: 1.0 },
      { text: 'carry in here', w: 0.7 },
      { text: 'have that quality', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'are clearer than they should be', w: nt => nt.ne > 0.5 ? 1.2 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'off the tile', w: 0.8 },
    ],
    ambiguity_alts: ['the pipes', 'the building'],
    fragments: [
      { text: 'echo', w: 1.0 },
      { text: 'tile', w: 0.8 },
      { text: 'the small room', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
  },

  // === INTEROCEPTIVE: STRESS ===

  stress_signal: {
    subjects: [
      { text: 'something', w: 0.8 },
      { text: 'the shoulders', w: nt => nt._stress_loc_shoulders ? 2.0 : 0.1 },
      { text: 'the jaw', w: nt => nt._stress_loc_jaw ? 2.0 : 0.1 },
      { text: 'the chest', w: nt => nt._stress_loc_chest ? 2.0 : 0.1 },
    ],
    predicates: [
      { text: 'is carrying something', w: nt => nt._stress_loc_shoulders ? 1.5 : 0.3 },
      { text: 'is braced', w: nt => nt._stress_loc_jaw ? 1.5 : 0.3 },
      { text: 'is tight', w: nt => nt._stress_loc_chest ? 1.5 : 0.5 },
      { text: "won't let go", w: nt => nt._stress_high ? 1.5 : 0.3 },
      { text: 'is holding', w: 0.8 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'all the way up', w: nt => nt._stress_loc_shoulders ? 0.8 : 0 },
      { text: 'without reason', w: nt => nt.serotonin < 0.4 ? 0.6 : 0.1 },
    ],
    body_subjects: [
      { text: 'the shoulders', w: nt => nt._stress_loc_shoulders ? 2.0 : 0.3 },
      { text: 'the jaw', w: nt => nt._stress_loc_jaw ? 2.0 : 0.1 },
      { text: 'something', w: 0.8 },
    ],
    body_predicates: [
      { text: 'has been holding this whole time', w: nt => nt._stress_high ? 1.5 : 0.5 },
      { text: "won't release", w: 1.0 },
      { text: 'is braced against something', w: nt => nt._stress_loc_jaw || nt.ne > 0.6 ? 1.5 : 0.3 },
      { text: 'goes up around the ears', w: nt => nt._stress_loc_shoulders ? 1.2 : 0.1 },
      { text: 'is tight in a specific way', w: nt => nt._stress_loc_chest ? 1.0 : 0.2 },
    ],
    fragments: [
      { text: 'tight', w: nt => nt._stress_high ? 1.5 : 0.8 },
      { text: 'holding', w: 0.7 },
      { text: 'something', w: 0.5 },
    ],
  },

  // === INTEROCEPTIVE: CAFFEINE ===

  caffeine_signal: {
    subjects: [
      { text: 'something', w: nt => nt._caffeine_jitter ? 1.0 : 0.5 },
      { text: 'the body', w: nt => nt._caffeine_jitter ? 1.5 : 0.4 },
      { text: 'everything', w: nt => nt._caffeine_sharp ? 1.2 : 0.2 },
    ],
    predicates: [
      { text: 'is running a little fast', w: nt => nt._caffeine_sharp ? 1.5 : 0.4 },
      { text: "won't quite settle", w: nt => nt._caffeine_jitter ? 1.5 : 0.3 },
      { text: 'has an edge to it', w: nt => nt._caffeine_edge ? 1.5 : 0.4 },
      { text: 'is a little sharper than usual', w: nt => nt._caffeine_sharp ? 1.0 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'something', w: 1.0 },
      { text: 'the hands', w: nt => nt._caffeine_jitter ? 1.5 : 0.1 },
    ],
    body_predicates: [
      { text: "won't quite stop moving", w: nt => nt._caffeine_jitter ? 2.0 : 0.2 },
      { text: 'is running at a slightly different frequency', w: nt => nt._caffeine_sharp ? 1.5 : 0.3 },
      { text: 'is running just a little fast', w: 0.8 },
    ],
    fragments: [
      { text: 'running fast', w: nt => nt._caffeine_sharp || nt._caffeine_jitter ? 1.5 : 0.4 },
      { text: 'something', w: 0.5 },
    ],
  },

  // === WORK: ACOUSTIC ===

  workplace_hvac: {
    subjects: [
      { text: 'the ventilation', w: nt => nt.aden < 0.5 ? 1.0 : 0.4 },
      { text: 'something overhead', w: nt => nt.aden > 0.5 ? 1.2 : 0.5 },
      { text: 'the building', w: 0.5 },
    ],
    predicates: [
      'runs',
      { text: 'cycles', w: 0.7 },
      { text: 'breathes', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'keeps going', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.5 },
      { text: 'overhead', w: nt => nt.ne > 0.6 ? 0.7 : 0.2 },
    ],
    ambiguity_alts: ['the building', 'something in the ceiling'],
    fragments: [
      { text: 'the ventilation', w: nt => nt.aden < 0.5 ? 1.0 : 0.3 },
      { text: 'something overhead', w: nt => nt.aden > 0.5 ? 1.2 : 0.4 },
    ],
  },

  fluorescent_lights: {
    subjects: [
      { text: 'the lights', w: 1.0 },
      { text: 'the fluorescents', w: nt => nt.ne > 0.6 ? 1.2 : 0.4 },
      { text: 'something overhead', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    predicates: [
      'hum',
      { text: 'flicker slightly', w: nt => nt._light_flicker ? 2.0 : 0 },
      { text: 'have a quality', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'are going', w: 0.4 },
    ],
    modifiers: [
      { text: null, w: 1.5 },
      { text: 'high and thin', w: nt => nt.ne > 0.6 ? 1.5 : 0.2 },
      { text: 'overhead', w: 0.4 },
    ],
    ambiguity_alts: ['the projector', 'the ventilation'],
    escapes: [
      { text: 'the lights were just lights', w: 1.0 },
      { text: 'it had always been like this', w: nt => nt.aden > 0.5 ? 1.0 : 0.5 },
    ],
    fragments: [
      { text: 'the lights', w: 1.0 },
      { text: 'a hum', w: nt => nt.aden > 0.5 ? 1.2 : 0.5 },
      { text: 'fluorescent', w: nt => nt.ne > 0.6 ? 1.0 : 0.3 },
    ],
  },

  coworker_background: {
    subjects: [
      'voices',
      { text: 'keyboards', w: 0.6 },
      { text: 'the office', w: 0.5 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    predicates: [
      'in the background',
      { text: 'at a remove', w: nt => nt.aden > 0.5 ? 1.2 : 0.4 },
      { text: 'carrying on', w: nt => nt.serotonin > 0.5 ? 1.0 : 0.3 },
      { text: 'keep going', w: nt => nt._voices_intelligible ? 1.0 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    fragments: [
      'voices',
      { text: 'keyboards', w: 0.5 },
      { text: 'the office', w: 0.6 },
      { text: 'someone talking', w: nt => nt._voices_intelligible ? 1.5 : 0.2 },
    ],
  },
};

// --- Observation property augmentation ---
//
// Before picking lexical items for a source, augment the base ntCtx with
// property flags derived from the observation. These _flags are only
// meaningful in the weight functions of that source's lexical pool.

function augmentNT(base, obs) {
  const a = { ...base };

  const sound = obs.properties.sound;
  if (sound) {
    a._perceived_intensity  = sound.perceived_intensity ?? 0.5;
    a._voices_intelligible  = sound.intelligible === true;
  }

  const thermal = obs.properties.thermal;
  if (thermal) {
    const tier = thermal.tier;
    a._temp_cold      = ['freezing', 'very_cold', 'cold', 'cool'].includes(tier);
    a._temp_warm      = ['warm', 'hot', 'very_hot'].includes(tier);
    a._temp_very_cold = ['freezing', 'very_cold'].includes(tier);
    a._immediate      = thermal.immediate === true;
  }

  const sight = obs.properties.sight;
  if (sight) {
    const cond = sight.condition;
    a._condition_dark        = cond === 'dark';
    a._condition_grey        = cond === 'grey_morning' || cond === 'overcast' || cond === 'grey_evening';
    a._condition_early_light = cond === 'early_light';
    a._condition_dimming     = cond === 'dimming';
    a._light_flicker         = sight.flicker === true;
  }

  const i = obs.properties.interoception;
  if (i) {
    // Fatigue
    a._quality_gravitational = i.quality === 'gravitational';
    a._quality_weighted      = i.quality === 'weighted';
    a._quality_crushing      = i.tier === 'crushing';
    // Hunger
    a._quality_gnawing       = i.quality === 'gnawing';
    a._quality_hollow        = i.quality === 'hollow';
    a._quality_low_grade     = i.quality === 'low_grade';
    a._irritable             = i.irritability === true;
    // Anxiety
    a._char_keyed_up         = i.character === 'keyed_up';
    a._char_unsettled        = i.character === 'unsettled';
    a._char_restless         = i.character === 'restless';
    a._char_overwhelmed      = i.character === 'overwhelmed';
    // Stress
    a._stress_loc_jaw        = i.location === 'jaw';
    a._stress_loc_shoulders  = i.location === 'shoulders';
    a._stress_loc_chest      = i.location === 'chest';
    a._stress_high           = i.tier === 'overwhelmed' || i.tier === 'strained';
    // Caffeine
    a._caffeine_jitter       = i.quality === 'jitter';
    a._caffeine_sharp        = i.quality === 'sharp';
    a._caffeine_edge         = i.quality === 'edge';
  }

  return a;
}

// --- Architecture builders ---
//
// Each builder consumes the pre-rolled values r2, r3, r4 (r1 is for
// architecture selection, consumed by the caller). If an architecture
// doesn't need all three, it uses them in order and discards the rest
// — this keeps total RNG consumption fixed at 4 per observation.

/** "The fridge hums." / "The fridge hums, too loud." */
function buildShortDeclarative(obs, augNT, r2, r3, r4) {
  const lex = LEX[obs.sourceId];
  if (!lex?.subjects || !lex?.predicates) return null;
  const subject   = pickText(lex.subjects,   augNT, r2);
  const predicate = pickText(lex.predicates, augNT, r3);
  if (!subject || !predicate) return null;
  const modifier = lex.modifiers ? pickText(lex.modifiers, augNT, r4) : null;
  if (modifier) return `${cap(subject)} ${predicate}, ${modifier}.`;
  return `${cap(subject)} ${predicate}.`;
}

/** "Heavy." / "The fridge." — uses r2, discards r3/r4 */
function buildBareFragment(obs, augNT, r2, _r3, _r4) {
  const lex = LEX[obs.sourceId];
  if (!lex) return null;
  const pool = lex.fragments ?? lex.subjects;
  const text = pickText(pool, augNT, r2);
  return text ? `${cap(text)}.` : null;
}

/** "Cold sits on the back of the neck." — uses r2, r3, discards r4 */
function buildBodyAsSubject(obs, augNT, r2, r3, _r4) {
  const lex = LEX[obs.sourceId];
  if (!lex?.body_subjects || !lex?.body_predicates) return null;
  const subject   = pickText(lex.body_subjects,   augNT, r2);
  const predicate = pickText(lex.body_predicates, augNT, r3);
  if (!subject || !predicate) return null;
  return `${cap(subject)} ${predicate}.`;
}

/** "Something — the fridge, maybe, or the heat — hums." — uses r2, r3, discards r4 */
function buildSourceAmbiguity(obs, augNT, r2, r3, _r4) {
  const lex = LEX[obs.sourceId];
  if (!lex?.ambiguity_alts || !lex?.predicates) return null;
  const altIdx    = Math.floor(r2 * lex.ambiguity_alts.length);
  const alt       = lex.ambiguity_alts[altIdx];
  const primary   = typeof lex.subjects[0] === 'string'
    ? lex.subjects[0]
    : lex.subjects[0].text;
  const predicate = pickText(lex.predicates, augNT, r3);
  if (!predicate) return null;
  return `Something — ${primary}, maybe, or ${alt} — ${predicate}.`;
}

/** "The fridge hums, and the sound was just a sound." — uses r2, r3, r4 */
function buildInterpretiveEscape(obs, augNT, r2, r3, r4) {
  const lex = LEX[obs.sourceId];
  if (!lex?.escapes) return buildShortDeclarative(obs, augNT, r2, r3, r4);
  const subject   = pickText(lex.subjects,   augNT, r2);
  const predicate = pickText(lex.predicates, augNT, r3);
  const escape    = pickText(lex.escapes,    augNT, r4);
  if (!subject || !predicate || !escape) return null;
  return `${cap(subject)} ${predicate}, and ${escape}.`;
}

// --- Architecture weights per hint ---
//
// Relative weights — normalized inside wpick. 0 = never selected.
// body and ambig eligibility are further gated by lex availability.

const ARCH_WEIGHTS = {
  calm: {
    short:  1.2,
    body:   0.8,
    bare:   0.2,
    ambig:  0.0,
    escape: 1.0,
  },
  heightened: {
    short:  1.0,
    body:   0.7,
    bare:   0.1,
    ambig:  0.0,
    escape: 1.2,
  },
  anxious: {
    short:  2.5,
    body:   0.5,
    bare:   0.3,
    ambig:  0.0,
    escape: 0.0,
  },
  dissociated: {
    short:  0.8,
    body:   0.6,
    bare:   1.2,
    ambig:  1.5,
    escape: 0.0,
  },
  overwhelmed: {
    short:  1.5,
    body:   0.8,
    bare:   0.8,
    ambig:  0.0,
    escape: 0.0,
  },
  flat: {
    short:  1.5,
    body:   0.8,
    bare:   0.6,
    ambig:  0.0,
    escape: 0.1,
  },
};

/** How many observations to include per passage. */
function getPassageBudget(hint) {
  if (hint === 'overwhelmed') return 3;
  if (hint === 'anxious')     return 3;
  return 2;
}

// --- Single-observation realization ---
//
// Consumes exactly r1..r4 (4 pre-rolled values from the caller).

function realizeOne(obs, hint, ntCtx, r1, r2, r3, r4) {
  const lex    = LEX[obs.sourceId];
  if (!lex) return null;

  const augNT  = augmentNT(ntCtx, obs);
  const w      = ARCH_WEIGHTS[hint] ?? ARCH_WEIGHTS.calm;

  // Build eligible architecture list; gate body/ambig on lex availability
  const archs = [
    { weight: w.short,                                    value: 'short'  },
    { weight: w.body   * (lex.body_subjects ? 1 : 0),    value: 'body'   },
    { weight: w.bare,                                     value: 'bare'   },
    { weight: w.ambig  * (lex.ambiguity_alts ? 1 : 0),   value: 'ambig'  },
    { weight: w.escape * (lex.escapes ? 1 : 0),          value: 'escape' },
  ];

  const arch = wpick(archs, r1);

  let result;
  switch (arch) {
    case 'body':   result = buildBodyAsSubject(obs, augNT, r2, r3, r4);    break;
    case 'bare':   result = buildBareFragment(obs, augNT, r2, r3, r4);     break;
    case 'ambig':  result = buildSourceAmbiguity(obs, augNT, r2, r3, r4);  break;
    case 'escape': result = buildInterpretiveEscape(obs, augNT, r2, r3, r4); break;
    default:       result = buildShortDeclarative(obs, augNT, r2, r3, r4); break;
  }

  // Fallback: if chosen architecture couldn't build (missing lex fields), use short declarative
  return result ?? buildShortDeclarative(obs, augNT, r2, r3, r4);
}

// --- Main entry point ---

/**
 * Construct a prose passage from the given observations.
 *
 * Selects up to getPassageBudget(hint) observations (highest salience first —
 * the caller should provide them sorted). Realizes each into a sentence using
 * an NT-weighted architecture. Returns a single passage string or null.
 *
 * RNG consumption: exactly budget × 4 calls, always.
 *
 * @param {import('./senses.js').Observation[]} observations
 * @param {string} hint
 * @param {{ gaba: number, ne: number, aden: number, serotonin: number, dopamine: number }} ntCtx
 * @param {() => number} random
 * @returns {string | null}
 */
export function realize(observations, hint, ntCtx, random) {
  if (!observations || observations.length === 0) return null;

  const budget   = getPassageBudget(hint);
  const selected = observations.slice(0, budget);

  // Overwhelmed: polysyndeton — combine all observations into one sentence
  if (hint === 'overwhelmed') {
    const phrases = selected.map((obs, idx) => {
      const r1 = random(), r2 = random(), r3 = random(), r4 = random();
      const sentence = realizeOne(obs, hint, ntCtx, r1, r2, r3, r4);
      if (!sentence) return null;
      // Strip terminal punctuation; lowercase all but the first phrase
      const phrase = sentence.replace(/[.!?]+$/, '');
      return idx === 0 ? phrase : phrase.charAt(0).toLowerCase() + phrase.slice(1);
    }).filter(Boolean);

    if (phrases.length === 0) return null;
    return phrases.join(' and ') + '.';
  }

  // All other hints: each observation is its own sentence
  const sentences = selected.map(obs => {
    const r1 = random(), r2 = random(), r3 = random(), r4 = random();
    return realizeOne(obs, hint, ntCtx, r1, r2, r3, r4);
  }).filter(Boolean);

  if (sentences.length === 0) return null;
  return sentences.join(' ');
}
