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
 * Each pool item: string | { text: string|null, w: number | (nt, obs) => number }
 * Returns string or null (null items represent "no modifier").
 */
function pickText(pool, nt, obs, r) {
  if (!pool || pool.length === 0) return null;
  const items = pool.map(item => {
    if (typeof item === 'string') return { weight: 1, value: item };
    const w = typeof item.w === 'function' ? item.w(nt, obs) : (item.w ?? 1);
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
      { text: 'the refrigerator', w: 0.3 },
    ],
    predicates: [
      'hums',
      { text: 'has been going', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'sits there', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.1 },
      { text: 'kicks on', w: 0.6 },
      { text: 'clicks off', w: 0.5 },
      { text: 'settles', w: nt => nt.gaba > 0.5 ? 0.8 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 1.2 },
      { text: 'too loud', w: nt => nt.gaba < 0.4 ? 1.5 : 0.1 },
      { text: 'at the wrong frequency', w: nt => nt.ne > 0.6 ? 1.0 : 0.05 },
      { text: 'steadily', w: nt => nt.gaba > 0.5 ? 0.8 : 0.1 },
      { text: 'in the background', w: nt => nt.gaba > 0.6 ? 0.7 : 0.1 },
      { text: 'as always', w: nt => nt.serotonin < 0.45 ? 0.8 : 0.2 },
    ],
    ambiguity_alts: ['the heat', 'the building'],
    escapes: [
      { text: 'the sound was just a sound', w: 1.0 },
      { text: 'it had been going the whole time', w: nt => nt.aden > 0.5 ? 1.0 : 0.5 },
      { text: 'the fridge was just the fridge', w: nt => nt.serotonin < 0.4 ? 1.5 : 0.3 },
      { text: 'it would keep going', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.2 },
    ],
    fragments: [
      'the fridge',
      'a hum',
      { text: 'a hum from somewhere', w: nt => nt.aden > 0.5 ? 1.2 : 0.4 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.5 : 0.4 },
      { text: 'the hum', w: 0.5 },
    ],
  },

  pipes: {
    subjects: [
      'something in the pipes',
      { text: 'the pipes', w: nt => nt.aden < 0.5 ? 1.0 : 0.4 },
      { text: 'something in the walls', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'something', w: nt => nt.aden > 0.65 ? 0.8 : 0.2 },
    ],
    predicates: [
      'ticks',
      'clicks',
      { text: 'settles', w: 0.7 },
      { text: 'knocks once', w: 0.5 },
      { text: 'pops', w: 0.4 },
      { text: 'goes quiet', w: nt => nt.gaba > 0.5 ? 0.6 : 0.1 },
    ],
    modifiers: [
      { text: null, w: 1.5 },
      { text: 'and then again', w: 0.5 },
      { text: 'somewhere in the walls', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'then nothing', w: nt => nt.ne > 0.55 ? 0.8 : 0.2 },
      { text: 'once', w: 0.4 },
    ],
    fragments: [
      'something in the pipes',
      { text: 'a tick from somewhere', w: 0.7 },
      { text: 'something settling', w: 0.6 },
      { text: 'a knock', w: 0.5 },
    ],
  },

  electronic_whine: {
    subjects: [
      'a thin whine',
      { text: 'a frequency', w: nt => nt.ne > 0.6 ? 1.5 : 0.5 },
      'something electronic',
      { text: 'a pitch', w: nt => nt.ne > 0.5 ? 1.0 : 0.4 },
      { text: 'something in the wall', w: nt => nt.aden > 0.5 ? 0.8 : 0.3 },
    ],
    predicates: [
      'from somewhere',
      { text: 'from the outlet, maybe', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: "that isn't quite a sound", w: nt => nt.aden > 0.6 ? 1.2 : 0.3 },
      { text: 'sits above the other sounds', w: nt => nt.ne > 0.6 ? 1.5 : 0.3 },
      { text: "doesn't stop", w: nt => nt.gaba < 0.4 ? 1.5 : 0.3 },
      { text: 'is barely there', w: nt => nt.gaba > 0.5 ? 0.8 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'persistent', w: nt => nt.gaba < 0.4 ? 1.0 : 0.1 },
      { text: 'just above hearing', w: nt => nt.ne > 0.6 ? 0.8 : 0.1 },
    ],
    fragments: [
      'a thin whine',
      { text: "a frequency that doesn't belong", w: nt => nt.ne > 0.6 ? 1.0 : 0.3 },
      { text: 'a pitch from somewhere', w: nt => nt.ne > 0.5 ? 0.8 : 0.3 },
      { text: 'something barely there', w: nt => nt.gaba > 0.5 ? 0.8 : 0.2 },
    ],
  },

  traffic_through_walls: {
    subjects: [
      'traffic outside',
      { text: 'the street', w: nt => nt.aden < 0.5 ? 1.0 : 0.3 },
      { text: 'cars outside', w: nt => nt.ne > 0.6 ? 1.0 : 0.4 },
      { text: 'something outside', w: nt => nt.aden > 0.5 ? 0.8 : 0.3 },
      { text: 'the world outside', w: nt => nt.serotonin < 0.4 ? 0.8 : 0.2 },
    ],
    predicates: [
      'bleeds through the walls',
      'makes it through anyway',
      { text: 'is still going', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'keeps on', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.3 },
      { text: 'comes through the floor', w: 0.5 },
      { text: 'is still there', w: nt => nt.serotonin < 0.35 ? 1.0 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'low', w: nt => nt.aden > 0.5 ? 0.8 : 0.2 },
      { text: 'muffled', w: nt => nt.gaba > 0.5 ? 0.7 : 0.2 },
    ],
    fragments: [
      'traffic outside',
      { text: 'the street, muffled', w: 0.8 },
      { text: 'traffic', w: 0.5 },
      { text: 'something outside', w: nt => nt.aden > 0.5 ? 0.8 : 0.3 },
    ],
  },

  indoor_temperature: {
    subjects: [
      { text: 'the room', w: 1.0 },
      { text: 'the apartment', w: 0.6 },
      { text: 'the air', w: 0.8 },
      { text: 'the floor', w: (nt, obs) => obs.properties.thermal?.cold ? 0.7 : 0.2 },
      { text: 'the window', w: (nt, obs) => obs.properties.thermal?.cold ? 0.5 : 0.2 },
    ],
    predicates: [
      { text: 'is cold', w: (nt, obs) => obs.properties.thermal?.cold ? 1.0 : 0 },
      { text: "hasn't warmed up", w: (nt, obs) => obs.properties.thermal?.cold ? 0.7 : 0 },
      { text: 'holds the cold', w: (nt, obs) => obs.properties.thermal?.cold ? 0.8 : 0 },
      { text: 'is cold in the morning way', w: (nt, obs) => obs.properties.thermal?.cold ? 0.6 : 0 },
      { text: 'is warm', w: (nt, obs) => obs.properties.thermal?.warm ? 1.0 : 0 },
      { text: 'holds the heat', w: (nt, obs) => obs.properties.thermal?.warm ? 0.8 : 0 },
      { text: 'is close', w: (nt, obs) => obs.properties.thermal?.warm ? 0.7 : 0 },
      { text: 'is stuffy', w: (nt, obs) => obs.properties.thermal?.warm && nt.gaba < 0.4 ? 1.0 : 0 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'still', w: (nt, obs) => obs.properties.thermal?.cold ? 0.7 : 0 },
      { text: 'through the blanket', w: (nt, obs) => obs.properties.thermal?.cold ? 0.5 : 0 },
    ],
    body_subjects: [
      { text: 'the cold', w: (nt, obs) => obs.properties.thermal?.cold ? 1.5 : 0.1 },
      { text: 'cold', w: (nt, obs) => obs.properties.thermal?.cold && nt.aden > 0.6 ? 1.2 : 0.4 },
      { text: 'the warmth', w: (nt, obs) => obs.properties.thermal?.warm ? 1.5 : 0.1 },
      { text: 'heat', w: (nt, obs) => obs.properties.thermal?.warm && nt.gaba < 0.4 ? 1.2 : 0.2 },
    ],
    body_predicates: [
      { text: 'sits in the room', w: 1.0 },
      { text: 'has settled in', w: 0.8 },
      { text: 'finds its way through', w: nt => nt.ne > 0.5 ? 1.0 : 0.4 },
      { text: 'finds the face first', w: (nt, obs) => obs.properties.thermal?.cold ? 0.8 : 0.2 },
      { text: 'comes from the floor', w: (nt, obs) => obs.properties.thermal?.cold ? 0.7 : 0.1 },
      { text: 'is everywhere at once', w: (nt, obs) => obs.properties.thermal?.warm && nt.gaba < 0.4 ? 1.5 : 0.1 },
      { text: 'presses in', w: (nt, obs) => obs.properties.thermal?.warm && nt.gaba < 0.4 ? 1.0 : 0.1 },
    ],
    fragments: [
      { text: 'cold', w: (nt, obs) => obs.properties.thermal?.cold ? 2.5 : 0 },
      { text: 'warm in here', w: (nt, obs) => obs.properties.thermal?.warm ? 2.5 : 0 },
      { text: 'the room', w: 0.3 },
      { text: 'cold floor', w: (nt, obs) => obs.properties.thermal?.cold ? 0.8 : 0 },
      { text: 'stuffy', w: (nt, obs) => obs.properties.thermal?.warm && nt.gaba < 0.4 ? 1.0 : 0 },
    ],
  },

  fatigue: {
    subjects: [
      { text: 'something', w: nt => nt.aden > 0.7 ? 1.5 : 0.5 },
      { text: 'the body', w: 0.6 },
      { text: 'it', w: nt => nt.aden > 0.7 ? 0.8 : 0.2 },
      { text: 'the weight of it', w: nt => nt.aden > 0.80 ? 1.0 : 0.1 },
    ],
    predicates: [
      { text: 'has weight to it', w: 1.0 },
      { text: "doesn't lift", w: nt => nt.aden > 0.7 ? 1.0 : 0.3 },
      { text: 'is there', w: nt => nt.aden > 0.6 ? 0.8 : 0.3 },
      { text: 'sits in the limbs', w: nt => nt.aden > 0.65 ? 1.2 : 0.3 },
      { text: "hasn't cleared", w: nt => nt.aden > 0.65 ? 1.0 : 0.3 },
      { text: 'stays', w: nt => nt.serotonin < 0.4 ? 0.8 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'still', w: nt => nt.aden > 0.7 ? 0.8 : 0.2 },
      { text: 'a specific kind', w: nt => nt.aden > 0.6 ? 0.6 : 0.1 },
    ],
    body_subjects: [
      { text: 'something', w: nt => nt.aden > 0.7 ? 1.5 : 0.8 },
      { text: 'weight', w: nt => nt.aden > 0.65 ? 1.5 : 0.5 },
      { text: 'everything', w: nt => nt.aden > 0.85 ? 1.2 : 0.2 },
      { text: 'the arms', w: nt => nt.aden > 0.65 ? 0.8 : 0.2 },
      { text: 'the body', w: 0.5 },
    ],
    body_predicates: [
      { text: 'pulls toward horizontal', w: nt => nt.aden > 0.80 ? 2.0 : 0.3 },
      { text: 'has the density of something real', w: nt => nt.aden > 0.80 ? 1.5 : 0.1 },
      { text: 'settles into the shoulders', w: nt => nt.aden > 0.65 ? 2.0 : 0.4 },
      { text: 'sits in the chest', w: nt => nt.aden > 0.65 ? 1.0 : 0.3 },
      { text: 'is just there', w: 0.8 },
      { text: 'makes itself heavy', w: nt => nt.aden > 0.6 ? 1.0 : 0.3 },
      { text: 'refuses to lift', w: nt => nt.aden > 0.75 ? 1.5 : 0.2 },
      { text: 'wants to lie down', w: nt => nt.aden > 0.80 ? 1.5 : 0.3 },
    ],
    fragments: [
      { text: 'heavy', w: nt => nt.aden > 0.65 ? 1.5 : 0.7 },
      { text: 'something', w: nt => nt.aden > 0.7 ? 1.0 : 0.3 },
      { text: 'the body, heavy', w: nt => nt.aden > 0.80 ? 1.0 : 0.1 },
      { text: 'still tired', w: nt => nt.aden > 0.65 ? 0.8 : 0.1 },
    ],
  },

  hunger_signal: {
    subjects: [
      { text: 'something', w: (nt, obs) => obs.properties.interoception?.low_grade ? 1.5 : 0.5 },
      { text: 'hunger', w: (nt, obs) => (obs.properties.interoception?.gnawing || obs.properties.interoception?.hollow) ? 1.5 : 0.7 },
      { text: 'an emptiness', w: (nt, obs) => obs.properties.interoception?.hollow ? 2.0 : 0.2 },
      { text: 'an irritability', w: (nt, obs) => obs.properties.interoception?.irritable ? 1.5 : 0.1 },
      { text: 'the stomach', w: (nt, obs) => obs.properties.interoception?.gnawing ? 1.2 : 0.4 },
      { text: 'it', w: (nt, obs) => obs.properties.interoception?.low_grade ? 0.8 : 0.2 },
    ],
    predicates: [
      { text: 'is there', w: 0.8 },
      { text: 'makes itself known', w: (nt, obs) => obs.properties.interoception?.gnawing ? 1.5 : 0.5 },
      { text: 'is going', w: (nt, obs) => obs.properties.interoception?.low_grade ? 1.5 : 0.5 },
      { text: 'is starting', w: (nt, obs) => obs.properties.interoception?.low_grade ? 1.0 : 0.2 },
      { text: 'is audible', w: (nt, obs) => obs.properties.interoception?.gnawing ? 1.2 : 0.2 },
      { text: 'is specific', w: (nt, obs) => obs.properties.interoception?.hollow ? 1.0 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'hunger', w: (nt, obs) => (obs.properties.interoception?.gnawing || obs.properties.interoception?.hollow) ? 1.5 : 0.7 },
      { text: 'something', w: 0.8 },
      { text: 'an emptiness', w: (nt, obs) => obs.properties.interoception?.hollow ? 1.5 : 0.2 },
      { text: 'the stomach', w: (nt, obs) => obs.properties.interoception?.gnawing ? 1.2 : 0.3 },
    ],
    body_predicates: [
      { text: "hasn't found a target yet", w: (nt, obs) => obs.properties.interoception?.irritable ? 1.5 : 0.3 },
      { text: "won't stop", w: (nt, obs) => obs.properties.interoception?.gnawing ? 1.5 : 0.3 },
      { text: 'makes itself specific', w: (nt, obs) => obs.properties.interoception?.hollow ? 1.0 : 0.3 },
      { text: 'is in the background', w: (nt, obs) => obs.properties.interoception?.low_grade ? 1.5 : 0.3 },
      { text: 'is starting', w: (nt, obs) => obs.properties.interoception?.low_grade ? 1.0 : 0.2 },
      { text: 'is audible now', w: (nt, obs) => obs.properties.interoception?.gnawing ? 1.2 : 0.2 },
      { text: 'has been going for a while', w: (nt, obs) => obs.properties.interoception?.gnawing ? 1.0 : 0.2 },
      { text: 'presents itself', w: (nt, obs) => obs.properties.interoception?.hollow ? 0.8 : 0.2 },
    ],
    fragments: [
      { text: 'hungry', w: (nt, obs) => obs.properties.interoception?.gnawing ? 1.5 : 0.8 },
      { text: 'something', w: (nt, obs) => obs.properties.interoception?.low_grade ? 1.5 : 0.5 },
      { text: 'hollow', w: (nt, obs) => obs.properties.interoception?.hollow ? 1.5 : 0.1 },
      { text: 'the stomach', w: (nt, obs) => obs.properties.interoception?.gnawing ? 0.8 : 0.2 },
    ],
  },

  anxiety_signal: {
    subjects: [
      { text: 'something', w: 1.2 },
      { text: 'the body', w: nt => nt.ne > 0.65 ? 1.0 : 0.4 },
      { text: 'an unease', w: nt => nt.gaba < 0.35 ? 1.0 : 0.3 },
      { text: 'a tightness', w: nt => nt.gaba < 0.35 || nt.ne > 0.65 ? 0.8 : 0.2 },
      { text: 'the chest', w: nt => nt.gaba < 0.35 ? 0.8 : 0.1 },
    ],
    predicates: [
      { text: "can't settle", w: nt => nt.gaba < 0.35 ? 2.0 : 0.3 },
      { text: 'is running faster than it should', w: nt => nt.ne > 0.65 ? 2.0 : 0.2 },
      { text: 'is ahead of wherever this is going', w: nt => nt.ne > 0.65 ? 1.0 : 0.2 },
      { text: 'needs something to fix on', w: nt => nt.ne > 0.52 && nt.gaba < 0.45 ? 1.5 : 0.3 },
      { text: 'is there and unreasonable', w: nt => nt.gaba < 0.4 ? 1.0 : 0.2 },
      { text: 'has no object', w: nt => nt.gaba < 0.35 ? 0.8 : 0.1 },
      { text: 'braces', w: nt => nt.ne > 0.65 ? 0.8 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'something', w: 1.5 },
      { text: 'the body', w: 0.8 },
      { text: 'a tightness', w: nt => nt.gaba < 0.4 ? 1.0 : 0.3 },
    ],
    body_predicates: [
      { text: "can't settle", w: nt => nt.gaba < 0.35 ? 2.0 : 0.5 },
      { text: 'is already ahead of this', w: nt => nt.ne > 0.65 ? 1.5 : 0.3 },
      { text: 'keeps looking for the thing', w: nt => nt.ne > 0.52 && nt.gaba < 0.45 ? 1.5 : 0.3 },
      { text: 'is running without direction', w: 0.7 },
      { text: 'is somewhere in the chest', w: nt => nt.gaba < 0.4 ? 1.0 : 0.3 },
      { text: 'has no object for this', w: nt => nt.gaba < 0.35 ? 0.8 : 0.2 },
      { text: 'is bracing against something', w: nt => nt.ne > 0.65 ? 0.8 : 0.2 },
    ],
    fragments: [
      { text: "can't settle", w: nt => nt.gaba < 0.35 ? 1.5 : 0.8 },
      { text: 'something', w: 0.6 },
      { text: 'braced', w: nt => nt.ne > 0.65 ? 1.0 : 0.2 },
      { text: 'the chest, tight', w: nt => nt.gaba < 0.35 ? 1.0 : 0.1 },
    ],
  },

  traffic_outdoor: {
    subjects: [
      'a car',
      { text: 'traffic', w: 0.7 },
      { text: "someone's car", w: 0.6 },
      { text: 'a bus', w: 0.4 },
      { text: 'something on the road', w: nt => nt.aden > 0.5 ? 0.7 : 0.2 },
    ],
    predicates: [
      'goes past',
      'passes',
      { text: 'slows and accelerates', w: 0.7 },
      { text: 'rumbles past', w: nt => nt.ne > 0.55 ? 1.0 : 0.3 },
      { text: 'goes by without stopping', w: 0.5 },
    ],
    modifiers: [
      { text: null, w: 1.0 },
      { text: 'without stopping', w: 0.8 },
      { text: 'with its headlights still on', w: 0.6 },
      { text: 'somewhere to be', w: nt => nt.serotonin < 0.4 ? 0.8 : 0.2 },
      { text: 'at the corner', w: 0.4 },
    ],
    fragments: [
      'traffic',
      { text: 'a car going past', w: 0.7 },
      { text: 'a bus', w: 0.4 },
      { text: 'the street', w: 0.4 },
    ],
  },

  street_voices: {
    subjects: [
      'voices',
      { text: 'someone', w: 0.7 },
      { text: 'two people', w: 0.6 },
      { text: 'a voice', w: 0.5 },
      { text: 'someone out there', w: nt => nt.aden > 0.5 ? 0.8 : 0.3 },
    ],
    predicates: [
      'from across the street',
      'passing',
      { text: 'going past without stopping', w: 0.5 },
      { text: 'going somewhere', w: nt => nt.serotonin < 0.4 ? 0.8 : 0.3 },
      { text: 'out there', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'nearby', w: nt => nt.ne > 0.55 ? 1.0 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'not stopping', w: 0.5 },
      { text: 'going on about something', w: nt => nt.ne > 0.55 ? 0.7 : 0.1 },
    ],
    ambiguity_alts: ['the building', 'the apartment above'],
    escapes: [
      { text: 'it was just people', w: 1.0 },
      { text: 'they were just out there', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
    ],
    fragments: [
      'voices',
      { text: 'someone outside', w: 0.6 },
      { text: 'someone going by', w: 0.5 },
      { text: 'out there', w: nt => nt.aden > 0.5 ? 0.8 : 0.2 },
    ],
  },

  outdoor_temperature: {
    subjects: [
      { text: 'the air', w: 0.8 },
      { text: 'the cold', w: (nt, obs) => obs.properties.thermal?.cold ? 1.5 : 0 },
      { text: 'the warmth', w: (nt, obs) => obs.properties.thermal?.warm ? 1.5 : 0 },
    ],
    predicates: [
      { text: 'hits immediately', w: (nt, obs) => obs.properties.thermal?.immediate ? 1.5 : 0.2 },
      { text: 'is cold', w: (nt, obs) => obs.properties.thermal?.cold ? 1.0 : 0 },
      { text: 'is warm', w: (nt, obs) => obs.properties.thermal?.warm ? 1.0 : 0 },
      { text: 'has stayed warm', w: (nt, obs) => obs.properties.thermal?.warm ? 0.7 : 0 },
      { text: "doesn't let up", w: (nt, obs) => obs.properties.thermal?.warm && nt.ne > 0.55 ? 0.8 : 0 },
      { text: 'is colder than expected', w: (nt, obs) => obs.properties.thermal?.cold && nt.gaba > 0.5 ? 0.6 : 0 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
    ],
    body_subjects: [
      { text: 'the cold', w: (nt, obs) => obs.properties.thermal?.cold ? 1.5 : 0.1 },
      { text: 'cold', w: (nt, obs) => obs.properties.thermal?.cold && nt.aden > 0.6 ? 1.2 : 0.3 },
      { text: 'the warmth', w: (nt, obs) => obs.properties.thermal?.warm ? 1.5 : 0.1 },
      { text: 'heat', w: (nt, obs) => obs.properties.thermal?.warm && nt.ne > 0.5 ? 0.8 : 0.1 },
    ],
    body_predicates: [
      { text: 'hits immediately', w: (nt, obs) => obs.properties.thermal?.immediate ? 2.0 : 0.3 },
      { text: 'sits on the back of the neck', w: 1.0 },
      { text: 'finds the face first', w: 0.8 },
      { text: 'goes through the coat', w: (nt, obs) => obs.properties.thermal?.very_cold ? 1.5 : 0.3 },
      { text: 'sits on the arms', w: (nt, obs) => obs.properties.thermal?.warm ? 1.2 : 0.1 },
      { text: 'comes from the pavement', w: (nt, obs) => obs.properties.thermal?.warm ? 0.7 : 0.1 },
    ],
    fragments: [
      { text: 'cold', w: (nt, obs) => obs.properties.thermal?.cold ? 1.5 : 0 },
      { text: 'warm out', w: (nt, obs) => obs.properties.thermal?.warm ? 1.5 : 0 },
      { text: 'the air', w: 0.5 },
      { text: 'heat', w: (nt, obs) => obs.properties.thermal?.warm ? 0.7 : 0 },
    ],
  },

  wind: {
    subjects: [
      'a wind',
      { text: 'the wind', w: 0.8 },
      { text: 'something cold', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'it', w: nt => nt.aden > 0.6 ? 0.6 : 0.1 },
    ],
    predicates: [
      'cuts',
      { text: 'actually cuts', w: nt => nt.ne > 0.5 ? 1.5 : 0.7 },
      'goes through the coat',
      { text: 'hits in gusts', w: nt => nt.ne > 0.55 ? 1.0 : 0.3 },
      { text: "doesn't let up", w: nt => nt.ne > 0.6 ? 1.0 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'at an angle', w: nt => nt.ne > 0.55 ? 0.7 : 0.2 },
      { text: 'from nowhere', w: nt => nt.aden > 0.5 ? 0.6 : 0.2 },
    ],
    body_subjects: [
      'the wind',
      { text: 'something cutting', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'cold', w: nt => nt.aden > 0.5 ? 0.7 : 0.2 },
    ],
    body_predicates: [
      'finds the collar',
      'goes through rather than around',
      { text: 'actually cuts', w: nt => nt.ne > 0.5 ? 1.5 : 0.7 },
      { text: 'gets in through the collar', w: 0.6 },
      { text: 'is sharp today', w: nt => nt.ne > 0.6 ? 0.8 : 0.2 },
    ],
    fragments: [
      'wind',
      { text: 'cold wind', w: 0.8 },
      { text: 'the cold', w: nt => nt.aden > 0.5 ? 0.7 : 0.3 },
      { text: 'gusts', w: nt => nt.ne > 0.55 ? 0.8 : 0.3 },
    ],
  },

  rain: {
    subjects: [
      'rain',
      { text: 'it', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'the rain', w: 0.8 },
      { text: 'water', w: nt => nt.ne > 0.55 ? 0.7 : 0.3 },
    ],
    predicates: [
      'is coming down',
      { text: 'has already been going for a while', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      'covers everything',
      { text: 'taps against the window', w: nt => nt.gaba > 0.5 ? 1.0 : 0.3 },
      { text: "hasn't stopped", w: nt => nt.serotonin < 0.4 ? 1.2 : 0.3 },
      { text: 'comes down hard', w: nt => nt.ne > 0.6 ? 1.0 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 1.5 },
      { text: 'and everything is wet', w: 0.7 },
      { text: 'steady', w: nt => nt.gaba > 0.5 ? 1.0 : 0.2 },
      { text: 'still', w: nt => nt.serotonin < 0.4 ? 0.8 : 0.2 },
      { text: 'hard', w: nt => nt.ne > 0.6 ? 0.8 : 0.2 },
    ],
    body_subjects: [
      { text: 'something', w: 0.7 },
      { text: 'the wet', w: nt => nt.ne > 0.55 ? 1.2 : 0.4 },
      { text: 'cold', w: (nt, obs) => obs.properties.touch?.cold ? 1.0 : 0.2 },
    ],
    body_predicates: [
      { text: 'finds the back of the neck', w: 0.8 },
      { text: 'soaks through', w: nt => nt.ne > 0.55 ? 1.5 : 0.3 },
      { text: 'is everywhere', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'gets in', w: 0.7 },
    ],
    ambiguity_alts: ['the cold', 'the street'],
    escapes: [
      { text: 'it was just rain', w: 1.0 },
      { text: 'it had been raining the whole time', w: nt => nt.aden > 0.5 ? 1.5 : 0.3 },
    ],
    fragments: [
      'rain',
      { text: 'everything wet', w: 0.6 },
      { text: 'wet', w: nt => nt.ne > 0.55 ? 0.8 : 0.3 },
      { text: 'still raining', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.2 },
    ],
  },

  // === APARTMENT: VISUAL ===

  window_light: {
    subjects: [
      { text: 'the window', w: 0.8 },
      { text: 'grey light', w: (nt, obs) => obs.properties.sight?.grey ? 2.0 : 0 },
      { text: 'morning light', w: (nt, obs) => obs.properties.sight?.early_light ? 2.0 : 0 },
      { text: 'afternoon light', w: (nt, obs) => obs.properties.sight?.dimming ? 0.8 : 0 },
      { text: 'daylight', w: (nt, obs) => !obs.properties.sight?.dark && !obs.properties.sight?.grey ? 0.7 : 0 },
      { text: 'the light', w: (nt, obs) => !obs.properties.sight?.dark ? 1.0 : 0.1 },
    ],
    predicates: [
      { text: 'is still dark', w: (nt, obs) => obs.properties.sight?.dark ? 3.0 : 0 },
      { text: 'is grey', w: (nt, obs) => obs.properties.sight?.grey ? 2.0 : 0 },
      { text: 'is flat', w: (nt, obs) => obs.properties.sight?.grey ? 1.5 : 0 },
      { text: 'has arrived', w: (nt, obs) => obs.properties.sight?.early_light ? 2.0 : 0 },
      { text: 'is going', w: (nt, obs) => obs.properties.sight?.dimming ? 2.0 : 0 },
      { text: 'comes through', w: (nt, obs) => !obs.properties.sight?.dark ? 1.0 : 0 },
      { text: 'sits in the room', w: (nt, obs) => !obs.properties.sight?.dark && nt.gaba > 0.5 ? 0.7 : 0 },
      { text: 'is outside', w: 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.5 },
      { text: 'flat', w: (nt, obs) => nt.serotonin < 0.4 && obs.properties.sight?.grey ? 1.5 : 0 },
      { text: 'without warmth', w: (nt, obs) => obs.properties.sight?.grey && nt.serotonin < 0.45 ? 1.0 : 0 },
      { text: 'through the blinds', w: (nt, obs) => !obs.properties.sight?.dark ? 0.5 : 0 },
      { text: 'already', w: (nt, obs) => obs.properties.sight?.early_light && nt.aden > 0.5 ? 1.0 : 0 },
    ],
    escapes: [
      { text: 'it was morning', w: (nt, obs) => obs.properties.sight?.early_light ? 1.5 : 0.3 },
      { text: 'the day had started', w: (nt, obs) => obs.properties.sight?.early_light ? 1.0 : 0.3 },
      { text: 'it was just the light', w: 1.0 },
      { text: 'it was getting dark', w: (nt, obs) => obs.properties.sight?.dimming ? 1.5 : 0.3 },
    ],
    fragments: [
      { text: 'grey', w: (nt, obs) => obs.properties.sight?.grey ? 2.5 : 0 },
      { text: 'dark', w: (nt, obs) => obs.properties.sight?.dark ? 2.5 : 0 },
      { text: 'morning', w: (nt, obs) => obs.properties.sight?.early_light ? 2.0 : 0 },
      { text: 'light', w: (nt, obs) => !obs.properties.sight?.dark ? 0.8 : 0 },
      { text: 'the window', w: 0.5 },
      { text: 'going dark', w: (nt, obs) => obs.properties.sight?.dimming ? 1.2 : 0 },
    ],
  },

  // === APARTMENT: BATHROOM ===

  bathroom_echo: {
    subjects: [
      { text: 'everything', w: 0.5 },
      { text: 'the tile', w: nt => nt.ne > 0.6 ? 1.0 : 0.5 },
      { text: 'small sounds', w: nt => nt.ne > 0.5 ? 1.2 : 0.5 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: 'the silence', w: nt => nt.gaba > 0.5 ? 0.7 : 0.2 },
    ],
    predicates: [
      { text: 'echo in here', w: 1.0 },
      { text: 'carry in here', w: 0.7 },
      { text: 'have that quality', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'are clearer than they should be', w: nt => nt.ne > 0.5 ? 1.2 : 0.3 },
      { text: 'is a specific kind of quiet', w: nt => nt.gaba > 0.5 ? 0.8 : 0.1 },
      { text: 'bounces', w: nt => nt.ne > 0.55 ? 0.8 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'off the tile', w: 0.8 },
      { text: 'in here', w: nt => nt.ne > 0.6 ? 0.5 : 0.1 },
    ],
    ambiguity_alts: ['the pipes', 'the building'],
    body_subjects: [
      { text: 'your own breathing', w: nt => nt.ne > 0.55 ? 1.5 : 0.5 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: 'everything', w: 0.5 },
    ],
    body_predicates: [
      { text: 'carries in here', w: 1.0 },
      { text: 'comes back differently', w: nt => nt.ne > 0.55 ? 1.2 : 0.4 },
      { text: 'is louder than it should be', w: nt => nt.ne > 0.6 ? 1.5 : 0.3 },
      { text: 'fills the space', w: 0.6 },
    ],
    fragments: [
      { text: 'echo', w: 1.0 },
      { text: 'tile', w: 0.8 },
      { text: 'the small room', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'quiet in here', w: nt => nt.gaba > 0.5 ? 0.7 : 0.2 },
    ],
  },

  // === INTEROCEPTIVE: STRESS ===

  stress_signal: {
    subjects: [
      { text: 'something', w: 0.8 },
      { text: 'the shoulders', w: nt => nt.ne <= 0.65 && nt.gaba >= 0.35 ? 2.0 : 0.1 },
      { text: 'the jaw', w: nt => nt.ne > 0.65 ? 2.0 : 0.1 },
      { text: 'the chest', w: nt => nt.gaba < 0.35 ? 2.0 : 0.1 },
      { text: 'the neck', w: nt => nt.ne <= 0.65 && nt.gaba >= 0.35 ? 1.2 : 0.1 },
      { text: 'a tension', w: (nt, obs) => obs.properties.interoception?.high ? 0.8 : 0.3 },
    ],
    predicates: [
      { text: 'is carrying something', w: nt => nt.ne <= 0.65 && nt.gaba >= 0.35 ? 1.5 : 0.3 },
      { text: 'is braced', w: nt => nt.ne > 0.65 ? 1.5 : 0.3 },
      { text: 'is tight', w: nt => nt.gaba < 0.35 ? 1.5 : 0.5 },
      { text: "won't let go", w: (nt, obs) => obs.properties.interoception?.high ? 1.5 : 0.3 },
      { text: 'is holding', w: 0.8 },
      { text: 'is specific', w: 0.5 },
      { text: 'has been there', w: (nt, obs) => obs.properties.interoception?.high ? 1.0 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'all the way up', w: nt => nt.ne <= 0.65 && nt.gaba >= 0.35 ? 0.8 : 0 },
      { text: 'without reason', w: nt => nt.serotonin < 0.4 ? 0.6 : 0.1 },
      { text: 'without letting go', w: (nt, obs) => obs.properties.interoception?.high ? 0.7 : 0.1 },
      { text: 'since this morning', w: (nt, obs) => obs.properties.interoception?.high ? 0.5 : 0.1 },
    ],
    body_subjects: [
      { text: 'the shoulders', w: nt => nt.ne <= 0.65 && nt.gaba >= 0.35 ? 2.0 : 0.3 },
      { text: 'the jaw', w: nt => nt.ne > 0.65 ? 2.0 : 0.1 },
      { text: 'the neck', w: nt => nt.ne <= 0.65 || nt.ne > 0.65 ? 1.2 : 0.1 },
      { text: 'the chest', w: nt => nt.gaba < 0.35 ? 1.8 : 0.2 },
      { text: 'something', w: 0.8 },
    ],
    body_predicates: [
      { text: 'has been holding this whole time', w: (nt, obs) => obs.properties.interoception?.high ? 1.5 : 0.5 },
      { text: "won't release", w: 1.0 },
      { text: 'is braced against something', w: nt => nt.ne > 0.65 ? 1.5 : 0.3 },
      { text: 'goes up around the ears', w: nt => nt.ne <= 0.65 && nt.gaba >= 0.35 ? 1.2 : 0.1 },
      { text: 'is tight in a specific way', w: nt => nt.gaba < 0.35 ? 1.0 : 0.2 },
      { text: 'runs up the back of the neck', w: nt => nt.ne <= 0.65 || nt.ne > 0.6 ? 1.3 : 0.2 },
      { text: 'never quite unclips', w: (nt, obs) => obs.properties.interoception?.high ? 1.2 : 0.3 },
      { text: 'has been like this since morning', w: (nt, obs) => obs.properties.interoception?.high ? 0.9 : 0.1 },
    ],
    fragments: [
      { text: 'tight', w: (nt, obs) => obs.properties.interoception?.high ? 1.5 : 0.8 },
      { text: 'holding', w: 0.7 },
      { text: 'braced', w: nt => nt.ne > 0.65 ? 1.2 : 0.4 },
      { text: 'the neck', w: nt => nt.ne <= 0.65 && nt.gaba >= 0.35 ? 0.9 : 0.2 },
      { text: 'the shoulders', w: nt => nt.ne <= 0.65 && nt.gaba >= 0.35 ? 1.0 : 0.2 },
      { text: 'something', w: 0.5 },
    ],
  },

  // === INTEROCEPTIVE: CAFFEINE ===

  caffeine_signal: {
    subjects: [
      { text: 'something', w: (nt, obs) => obs.properties.interoception?.jitter ? 1.0 : 0.5 },
      { text: 'the body', w: (nt, obs) => obs.properties.interoception?.jitter ? 1.5 : 0.4 },
      { text: 'everything', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.2 : 0.2 },
      { text: 'a sharpness', w: (nt, obs) => obs.properties.interoception?.sharp || obs.properties.interoception?.edge ? 1.2 : 0.2 },
      { text: 'the edges', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.0 : 0.2 },
    ],
    predicates: [
      { text: 'is running a little fast', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.5 : 0.4 },
      { text: "won't quite settle", w: (nt, obs) => obs.properties.interoception?.jitter ? 1.5 : 0.3 },
      { text: 'has an edge to it', w: (nt, obs) => obs.properties.interoception?.edge ? 1.5 : 0.4 },
      { text: 'is a little sharper than usual', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.0 : 0.2 },
      { text: 'is clearer than usual', w: (nt, obs) => obs.properties.interoception?.sharp && !obs.properties.interoception?.jitter ? 1.3 : 0.2 },
      { text: 'comes in', w: (nt, obs) => obs.properties.interoception?.edge ? 0.8 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'today', w: (nt, obs) => obs.properties.interoception?.sharp ? 0.5 : 0.1 },
      { text: 'in a way', w: (nt, obs) => obs.properties.interoception?.edge ? 0.4 : 0.1 },
    ],
    body_subjects: [
      { text: 'something', w: 1.0 },
      { text: 'the hands', w: (nt, obs) => obs.properties.interoception?.jitter ? 1.5 : 0.1 },
      { text: 'the mind', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.3 : 0.2 },
      { text: 'the eyes', w: (nt, obs) => obs.properties.interoception?.sharp || obs.properties.interoception?.edge ? 0.8 : 0.2 },
    ],
    body_predicates: [
      { text: "won't quite stop moving", w: (nt, obs) => obs.properties.interoception?.jitter ? 2.0 : 0.2 },
      { text: 'is running at a slightly different frequency', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.5 : 0.3 },
      { text: 'is running just a little fast', w: 0.8 },
      { text: 'is running clean', w: (nt, obs) => obs.properties.interoception?.sharp && !obs.properties.interoception?.jitter ? 1.4 : 0.2 },
      { text: 'takes note of everything', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.0 : 0.2 },
      { text: 'is sharp today', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.2 : 0.2 },
    ],
    fragments: [
      { text: 'running fast', w: (nt, obs) => obs.properties.interoception?.sharp || obs.properties.interoception?.jitter ? 1.5 : 0.4 },
      { text: 'sharp', w: (nt, obs) => obs.properties.interoception?.sharp ? 1.5 : 0.3 },
      { text: 'alert', w: (nt, obs) => obs.properties.interoception?.sharp && !obs.properties.interoception?.jitter ? 1.2 : 0.2 },
      { text: 'clear', w: (nt, obs) => obs.properties.interoception?.sharp && !obs.properties.interoception?.jitter ? 1.0 : 0.2 },
      { text: 'something', w: 0.5 },
    ],
  },

  // === WORK: ACOUSTIC ===

  workplace_hvac: {
    subjects: [
      { text: 'the ventilation', w: nt => nt.aden < 0.5 ? 1.0 : 0.4 },
      { text: 'something overhead', w: nt => nt.aden > 0.5 ? 1.2 : 0.5 },
      { text: 'the building', w: 0.5 },
      { text: 'the air', w: 0.4 },
    ],
    predicates: [
      'runs',
      { text: 'cycles', w: 0.7 },
      { text: 'breathes', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'keeps going', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.3 },
      { text: 'hums', w: 0.6 },
      { text: 'kicks on', w: 0.5 },
    ],
    modifiers: [
      { text: null, w: 2.5 },
      { text: 'overhead', w: nt => nt.ne > 0.6 ? 0.7 : 0.2 },
      { text: 'without stopping', w: nt => nt.serotonin < 0.4 ? 0.6 : 0.1 },
      { text: 'like it always does', w: nt => nt.aden > 0.5 ? 0.5 : 0.15 },
    ],
    ambiguity_alts: ['the building', 'something in the ceiling'],
    escapes: [
      { text: 'the building had always breathed like this', w: nt => nt.aden > 0.5 ? 1.2 : 0.5 },
      { text: 'it was just the air', w: 1.0 },
    ],
    fragments: [
      { text: 'the ventilation', w: nt => nt.aden < 0.5 ? 1.0 : 0.3 },
      { text: 'something overhead', w: nt => nt.aden > 0.5 ? 1.2 : 0.4 },
      { text: 'the building', w: 0.5 },
      { text: 'background hum', w: nt => nt.aden > 0.4 ? 0.7 : 0.2 },
    ],
  },

  fluorescent_lights: {
    subjects: [
      { text: 'the lights', w: 1.0 },
      { text: 'the fluorescents', w: nt => nt.ne > 0.6 ? 1.2 : 0.4 },
      { text: 'something overhead', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'the ceiling', w: 0.4 },
      { text: 'something about the light', w: nt => nt.aden > 0.5 ? 0.8 : 0.2 },
    ],
    predicates: [
      'hum',
      { text: 'flicker slightly', w: (nt, obs) => obs.properties.sight?.flicker === true ? 2.0 : 0 },
      { text: 'have a quality', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'are going', w: 0.4 },
      { text: 'wash everything out', w: nt => nt.aden > 0.5 ? 0.8 : 0.2 },
      { text: 'cast everything evenly', w: nt => nt.aden < 0.4 ? 0.7 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 1.5 },
      { text: 'high and thin', w: nt => nt.ne > 0.6 ? 1.5 : 0.2 },
      { text: 'overhead', w: 0.4 },
      { text: 'all day', w: nt => nt.aden > 0.6 ? 0.8 : 0.1 },
      { text: 'everywhere', w: nt => nt.aden > 0.5 ? 0.5 : 0.1 },
    ],
    ambiguity_alts: ['the projector', 'the ventilation'],
    escapes: [
      { text: 'the lights were just lights', w: 1.0 },
      { text: 'it had always been like this', w: nt => nt.aden > 0.5 ? 1.0 : 0.5 },
    ],
    body_subjects: [
      { text: 'the back of the eyes', w: nt => nt.ne > 0.6 || nt.aden > 0.6 ? 1.5 : 0.2 },
      { text: 'something behind the eyes', w: nt => nt.ne > 0.6 ? 1.2 : 0.2 },
      { text: 'the eyes', w: (nt, obs) => obs.properties.sight?.flicker === true ? 1.3 : 0.4 },
    ],
    body_predicates: [
      { text: 'registers it', w: nt => nt.ne > 0.6 ? 1.5 : 0.4 },
      { text: 'tightens', w: (nt, obs) => nt.ne > 0.6 || obs.properties.sight?.flicker === true ? 1.5 : 0.3 },
      { text: 'has been doing this all day', w: nt => nt.aden > 0.6 ? 1.2 : 0.2 },
      { text: 'is going slightly', w: (nt, obs) => obs.properties.sight?.flicker === true || nt.aden > 0.5 ? 1.0 : 0.2 },
    ],
    fragments: [
      { text: 'the lights', w: 1.0 },
      { text: 'a hum', w: nt => nt.aden > 0.5 ? 1.2 : 0.5 },
      { text: 'fluorescent', w: nt => nt.ne > 0.6 ? 1.0 : 0.3 },
      { text: 'the ceiling', w: 0.4 },
      { text: 'everywhere', w: nt => nt.aden > 0.5 ? 0.6 : 0.2 },
    ],
  },

  coworker_background: {
    subjects: [
      'voices',
      { text: 'keyboards', w: 0.6 },
      { text: 'the office', w: 0.5 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'a conversation', w: (nt, obs) => obs.properties.sound?.intelligible === true ? 1.5 : 0.3 },
      { text: 'someone', w: (nt, obs) => obs.properties.sound?.intelligible === true ? 1.2 : 0.3 },
      { text: 'the whole room', w: nt => nt.ne > 0.6 ? 1.0 : 0.3 },
    ],
    predicates: [
      'in the background',
      { text: 'at a remove', w: nt => nt.aden > 0.5 ? 1.2 : 0.4 },
      { text: 'carrying on', w: nt => nt.serotonin > 0.5 ? 1.0 : 0.3 },
      { text: 'keep going', w: (nt, obs) => obs.properties.sound?.intelligible === true ? 1.0 : 0.2 },
      { text: 'nearby', w: (nt, obs) => obs.properties.sound?.intelligible === true || nt.ne > 0.6 ? 1.2 : 0.3 },
      { text: 'going on across the room', w: (nt, obs) => obs.properties.sound?.intelligible === true ? 1.0 : 0.2 },
      { text: 'not stopping', w: nt => nt.ne > 0.6 || nt.aden > 0.5 ? 1.0 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'from across the room', w: (nt, obs) => obs.properties.sound?.intelligible === true ? 0.8 : 0.1 },
      { text: 'not stopping', w: nt => nt.ne > 0.6 ? 0.7 : 0.1 },
      { text: 'without pause', w: nt => nt.ne > 0.6 || nt.aden > 0.5 ? 0.5 : 0.1 },
    ],
    ambiguity_alts: [
      { text: 'the hallway', w: 0.8 },
      { text: 'someone on the phone', w: (nt, obs) => obs.properties.sound?.intelligible === true ? 1.2 : 0.4 },
    ],
    fragments: [
      'voices',
      { text: 'keyboards', w: 0.5 },
      { text: 'the office', w: 0.6 },
      { text: 'someone talking', w: (nt, obs) => obs.properties.sound?.intelligible === true ? 1.5 : 0.2 },
      { text: 'a conversation somewhere', w: (nt, obs) => obs.properties.sound?.intelligible === true ? 1.2 : 0.3 },
      { text: 'laughter', w: nt => nt.serotonin < 0.4 ? 0.8 : 0.3 },
      { text: 'someone talking nearby', w: (nt, obs) => obs.properties.sound?.intelligible === true && nt.ne > 0.6 ? 1.5 : 0.2 },
    ],
  },

  // === SMELL ===
  //
  // Smell prose leans heavily on body_subjects + body_predicates (nose registers before
  // mind names) and bare fragments. Short declarative works for outdoor smells that
  // arrive as weather-events. Escapes suit petrichor (it was just rain).

  stale_air: {
    subjects: [
      'the air',
      { text: 'something in the air', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.5 : 0.5 },
      { text: 'the room', w: 0.5 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    predicates: [
      "hasn't moved",
      { text: 'has been sitting', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.5 : 0.5 },
      { text: 'is close', w: nt => nt.gaba < 0.4 ? 1.0 : 0.4 },
      { text: "hasn't changed", w: nt => nt.serotonin < 0.4 ? 1.0 : 0.2 },
      { text: 'is stuffy', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.2 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.5 },
      { text: 'still', w: nt => nt.aden > 0.5 ? 0.7 : 0.2 },
      { text: 'a little', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) <= 0.60 ? 0.8 : 0 },
    ],
    body_subjects: [
      { text: 'something', w: 1.2 },
      { text: 'the air', w: 0.7 },
      { text: 'the nose', w: 0.5 },
    ],
    body_predicates: [
      { text: 'registers the closed-in quality', w: 1.0 },
      { text: 'recognizes this particular staleness', w: nt => nt.aden > 0.5 ? 1.2 : 0.4 },
      { text: "hasn't moved in here", w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.5 : 0.4 },
      { text: 'is the same as yesterday', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.3 },
      { text: 'has a particular density', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.0 : 0.2 },
    ],
    fragments: [
      'stale',
      { text: 'close', w: nt => nt.gaba < 0.4 ? 1.5 : 0.5 },
      { text: 'the same air', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.2 },
      { text: 'stuffy', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.2 : 0.2 },
      { text: 'the room', w: 0.3 },
    ],
  },

  dishes_smell: {
    subjects: [
      'something in the kitchen',
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: 'the kitchen', w: 0.7 },
      { text: 'the sink', w: 0.5 },
    ],
    predicates: [
      'is there',
      { text: 'has been there', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.5 : 0.4 },
      { text: 'is specific', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.2 : 0.3 },
      { text: "won't leave", w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.0 : 0.2 },
      { text: 'has settled in', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 0.8 : 0.2 },
    ],
    modifiers: [
      { text: null, w: 2.5 },
      { text: 'sour', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 0.8 : 0.15 },
    ],
    body_subjects: [
      { text: 'something', w: 1.5 },
      { text: 'it', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'the kitchen', w: 0.6 },
    ],
    body_predicates: [
      { text: 'reaches before you register it', w: 1.2 },
      { text: 'lands', w: 0.8 },
      { text: 'is specific in the bad way', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.5 : 0.3 },
      { text: "doesn't leave", w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.0 : 0.2 },
      { text: 'registers', w: nt => nt.aden > 0.5 ? 1.0 : 0.5 },
    ],
    fragments: [
      'the dishes',
      { text: 'the sink', w: 0.7 },
      { text: 'something sour', w: (nt, obs) => (obs.properties.smell?.intensity ?? 0) > 0.60 ? 1.0 : 0.1 },
      { text: 'something in the kitchen', w: 0.7 },
    ],
  },

  petrichor: {
    subjects: [
      'the smell of rain',
      { text: 'rain', w: 0.7 },
      { text: 'something in the air', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
      { text: 'petrichor', w: 0.3 },
    ],
    predicates: [
      'is everywhere',
      { text: 'has come through', w: 0.8 },
      { text: 'rises from the pavement', w: 0.7 },
      { text: 'fills everything', w: nt => nt.gaba > 0.5 ? 0.7 : 0.2 },
      { text: 'is in everything now', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    modifiers: [
      { text: null, w: 1.5 },
      { text: 'the specific smell of rain on concrete', w: 0.8 },
      { text: 'familiar', w: nt => nt.serotonin > 0.5 ? 0.8 : 0.2 },
    ],
    escapes: [
      { text: 'it was just rain', w: 1.0 },
      { text: 'it had been raining', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: 'rain had that smell', w: 0.6 },
    ],
    fragments: [
      'the smell of rain',
      { text: 'petrichor', w: 0.4 },
      { text: 'rain', w: 0.7 },
      { text: 'the wet', w: 0.5 },
    ],
  },

  cold_air_smell: {
    subjects: [
      'the air',
      { text: 'cold air', w: (nt, obs) => obs.properties.smell?.sharp === true ? 1.5 : 0.8 },
      { text: 'something sharp', w: (nt, obs) => obs.properties.smell?.sharp === true ? 1.2 : 0.3 },
      { text: 'something clean', w: (nt, obs) => obs.properties.smell?.sharp !== true ? 1.0 : 0.2 },
    ],
    predicates: [
      'is clean',
      { text: 'is sharp', w: (nt, obs) => obs.properties.smell?.sharp === true ? 2.0 : 0.2 },
      { text: 'is almost nothing', w: nt => nt.aden > 0.5 ? 0.8 : 0.3 },
      { text: 'is empty in a specific way', w: nt => nt.aden > 0.5 ? 0.7 : 0.2 },
      { text: 'is cold', w: 0.7 },
    ],
    modifiers: [
      { text: null, w: 2.5 },
    ],
    body_subjects: [
      { text: 'cold', w: 1.5 },
      { text: 'something sharp', w: (nt, obs) => obs.properties.smell?.sharp === true ? 1.5 : 0.3 },
      { text: 'the air', w: 0.5 },
    ],
    body_predicates: [
      { text: 'finds the nose first', w: 1.0 },
      { text: 'registers before anything else', w: (nt, obs) => obs.properties.smell?.sharp === true ? 1.2 : 0.5 },
      { text: 'is clean in the back of the throat', w: 1.0 },
      { text: 'hits sharp', w: (nt, obs) => obs.properties.smell?.sharp === true ? 1.5 : 0.3 },
    ],
    fragments: [
      'cold air',
      { text: 'sharp', w: (nt, obs) => obs.properties.smell?.sharp === true ? 1.5 : 0.3 },
      { text: 'clean', w: (nt, obs) => obs.properties.smell?.sharp !== true ? 1.0 : 0.2 },
      { text: 'the cold', w: 0.5 },
    ],
  },

  seasonal_outside_smell: {
    subjects: [
      { text: 'something', w: 1.5 },
      { text: 'the smell of cut grass', w: (nt, obs) => obs.properties.smell?.season_type === 'cut_grass' ? 1.8 : 0 },
      { text: 'something in the air', w: nt => nt.aden > 0.5 ? 0.6 : 0.3 },
      { text: 'something blooming', w: (nt, obs) => obs.properties.smell?.season_type === 'bloom' ? 1.5 : 0 },
      { text: 'the smell of leaves', w: (nt, obs) => obs.properties.smell?.season_type === 'leaf_decay' ? 1.5 : 0 },
      { text: 'a smell', w: 0.5 },
    ],
    predicates: [
      { text: 'is out', w: (nt, obs) => obs.properties.smell?.season_type === 'cut_grass' ? 1.5 : 0.3 },
      { text: 'carries', w: 0.8 },
      { text: 'is turning', w: (nt, obs) => obs.properties.smell?.season_type === 'leaf_decay' ? 1.5 : 0.2 },
      { text: 'is decaying somewhere', w: (nt, obs) => obs.properties.smell?.season_type === 'leaf_decay' ? 1.2 : 0 },
      { text: 'is coming through', w: (nt, obs) => obs.properties.smell?.season_type === 'bloom' ? 1.0 : 0.3 },
      { text: 'comes through', w: 0.5 },
    ],
    modifiers: [
      { text: null, w: 2.0 },
      { text: 'everywhere', w: (nt, obs) => obs.properties.smell?.season_type === 'cut_grass' ? 0.8 : 0.1 },
      { text: 'nearby', w: (nt, obs) => obs.properties.smell?.season_type === 'bloom' ? 0.7 : 0.1 },
    ],
    body_subjects: [
      { text: 'something', w: 1.0 },
      { text: 'the air', w: 0.6 },
      { text: 'autumn', w: (nt, obs) => obs.properties.smell?.season_type === 'leaf_decay' ? 1.5 : 0 },
      { text: 'spring', w: (nt, obs) => obs.properties.smell?.season_type === 'bloom' ? 1.2 : 0 },
      { text: 'summer', w: (nt, obs) => obs.properties.smell?.season_type === 'cut_grass' ? 1.2 : 0 },
    ],
    body_predicates: [
      { text: 'is in the air now', w: 1.0 },
      { text: 'is here already', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: 'registers', w: 0.7 },
      { text: 'has arrived', w: (nt, obs) => (obs.properties.smell?.season_type === 'bloom' || obs.properties.smell?.season_type === 'cut_grass') ? 1.0 : 0.2 },
      { text: 'is going', w: (nt, obs) => obs.properties.smell?.season_type === 'leaf_decay' ? 1.2 : 0.2 },
    ],
    escapes: [
      { text: 'it was autumn', w: (nt, obs) => obs.properties.smell?.season_type === 'leaf_decay' ? 2.0 : 0 },
      { text: 'it was summer', w: (nt, obs) => obs.properties.smell?.season_type === 'cut_grass' ? 2.0 : 0 },
      { text: 'spring was here', w: (nt, obs) => obs.properties.smell?.season_type === 'bloom' ? 2.0 : 0 },
      { text: 'it was just the air', w: 0.5 },
    ],
    fragments: [
      { text: 'cut grass', w: (nt, obs) => obs.properties.smell?.season_type === 'cut_grass' ? 2.5 : 0 },
      { text: 'leaves', w: (nt, obs) => obs.properties.smell?.season_type === 'leaf_decay' ? 2.0 : 0 },
      { text: 'something blooming', w: (nt, obs) => obs.properties.smell?.season_type === 'bloom' ? 2.0 : 0 },
      { text: 'autumn', w: (nt, obs) => obs.properties.smell?.season_type === 'leaf_decay' ? 1.5 : 0 },
      { text: 'spring', w: (nt, obs) => obs.properties.smell?.season_type === 'bloom' ? 1.2 : 0 },
      { text: 'summer', w: (nt, obs) => obs.properties.smell?.season_type === 'cut_grass' ? 1.2 : 0 },
      { text: 'the air', w: 0.3 },
    ],
  },

  office_ambient_smell: {
    subjects: [
      'the office',
      { text: 'something about the building', w: nt => nt.aden > 0.5 ? 1.2 : 0.4 },
      { text: 'the carpet', w: 0.6 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 1.0 : 0.3 },
    ],
    predicates: [
      'smells like an office',
      { text: 'has a particular smell', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: 'is the same as every office', w: nt => nt.serotonin < 0.4 ? 1.2 : 0.3 },
      { text: 'carries that smell', w: 0.6 },
      { text: 'is unmistakably an office', w: 0.5 },
    ],
    modifiers: [
      { text: null, w: 3.0 },
      { text: 'carpet and plastic and something else', w: 0.8 },
    ],
    body_subjects: [
      { text: 'something', w: 1.0 },
      { text: 'the building', w: 0.6 },
      { text: 'offices', w: 0.5 },
    ],
    body_predicates: [
      { text: 'registers first', w: 1.0 },
      { text: 'is familiar in the wrong way', w: nt => nt.serotonin < 0.4 ? 1.5 : 0.3 },
      { text: 'has always smelled like this', w: nt => nt.aden > 0.5 ? 1.0 : 0.4 },
      { text: 'is carpet, plastic, paper', w: 0.8 },
    ],
    fragments: [
      { text: 'the office', w: 1.0 },
      { text: 'carpet', w: 0.8 },
      { text: 'an office', w: nt => nt.serotonin < 0.4 ? 1.0 : 0.4 },
      { text: 'something', w: nt => nt.aden > 0.5 ? 0.8 : 0.2 },
    ],
  },
};

// --- Architecture builders ---
//
// Each builder consumes the pre-rolled values r2, r3, r4 (r1 is for
// architecture selection, consumed by the caller). If an architecture
// doesn't need all three, it uses them in order and discards the rest
// — this keeps total RNG consumption fixed at 4 per observation.

/** "The fridge hums." / "The fridge hums, too loud." */
function buildShortDeclarative(obs, nt, r2, r3, r4) {
  const lex = LEX[obs.sourceId];
  if (!lex?.subjects || !lex?.predicates) return null;
  const subject   = pickText(lex.subjects,   nt, obs, r2);
  const predicate = pickText(lex.predicates, nt, obs, r3);
  if (!subject || !predicate) return null;
  const modifier = lex.modifiers ? pickText(lex.modifiers, nt, obs, r4) : null;
  if (modifier) return `${cap(subject)} ${predicate}, ${modifier}.`;
  return `${cap(subject)} ${predicate}.`;
}

/** "Heavy." / "The fridge." — uses r2, discards r3/r4 */
function buildBareFragment(obs, nt, r2, _r3, _r4) {
  const lex = LEX[obs.sourceId];
  if (!lex) return null;
  const pool = lex.fragments ?? lex.subjects;
  const text = pickText(pool, nt, obs, r2);
  return text ? `${cap(text)}.` : null;
}

/** "Cold sits on the back of the neck." — uses r2, r3, discards r4 */
function buildBodyAsSubject(obs, nt, r2, r3, _r4) {
  const lex = LEX[obs.sourceId];
  if (!lex?.body_subjects || !lex?.body_predicates) return null;
  const subject   = pickText(lex.body_subjects,   nt, obs, r2);
  const predicate = pickText(lex.body_predicates, nt, obs, r3);
  if (!subject || !predicate) return null;
  return `${cap(subject)} ${predicate}.`;
}

/** "Something — the fridge, maybe, or the heat — hums." — uses r2, r3, discards r4 */
function buildSourceAmbiguity(obs, nt, r2, r3, _r4) {
  const lex = LEX[obs.sourceId];
  if (!lex?.ambiguity_alts || !lex?.predicates) return null;
  const altIdx    = Math.floor(r2 * lex.ambiguity_alts.length);
  const alt       = lex.ambiguity_alts[altIdx];
  const primary   = typeof lex.subjects[0] === 'string'
    ? lex.subjects[0]
    : lex.subjects[0].text;
  const predicate = pickText(lex.predicates, nt, obs, r3);
  if (!predicate) return null;
  return `Something — ${primary}, maybe, or ${alt} — ${predicate}.`;
}

/** "The fridge hums, and the sound was just a sound." — uses r2, r3, r4 */
function buildInterpretiveEscape(obs, nt, r2, r3, r4) {
  const lex = LEX[obs.sourceId];
  if (!lex?.escapes) return buildShortDeclarative(obs, nt, r2, r3, r4);
  const subject   = pickText(lex.subjects,   nt, obs, r2);
  const predicate = pickText(lex.predicates, nt, obs, r3);
  const escape    = pickText(lex.escapes,    nt, obs, r4);
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

// --- Single-observation realization ---
//
// Consumes exactly r1..r4 (4 pre-rolled values from the caller).

function realizeOne(obs, hint, ntCtx, r1, r2, r3, r4) {
  const lex    = LEX[obs.sourceId];
  if (!lex) return null;

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
    case 'body':   result = buildBodyAsSubject(obs, ntCtx, r2, r3, r4);    break;
    case 'bare':   result = buildBareFragment(obs, ntCtx, r2, r3, r4);     break;
    case 'ambig':  result = buildSourceAmbiguity(obs, ntCtx, r2, r3, r4);  break;
    case 'escape': result = buildInterpretiveEscape(obs, ntCtx, r2, r3, r4); break;
    default:       result = buildShortDeclarative(obs, ntCtx, r2, r3, r4); break;
  }

  // Fallback: if chosen architecture couldn't build (missing lex fields), use short declarative
  return result ?? buildShortDeclarative(obs, ntCtx, r2, r3, r4);
}

// --- Main entry point ---

/**
 * Construct a prose passage from the given observations.
 *
 * Realizes every observation passed — the caller decides what to include
 * (salience threshold, habituation, budget). Sorted highest-salience first.
 *
 * RNG consumption: exactly observations.length × 4 calls.
 *
 * @param {import('./senses.js').Observation[]} observations
 * @param {string} hint
 * @param {{ gaba: number, ne: number, aden: number, serotonin: number, dopamine: number }} ntCtx
 * @param {() => number} random
 * @returns {string | null}
 */
export function realize(observations, hint, ntCtx, random) {
  if (!observations || observations.length === 0) return null;

  // Overwhelmed: polysyndeton — combine all observations into one sentence
  if (hint === 'overwhelmed') {
    const phrases = observations.map((obs, idx) => {
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
  const sentences = observations.map(obs => {
    const r1 = random(), r2 = random(), r3 = random(), r4 = random();
    return realizeOne(obs, hint, ntCtx, r1, r2, r3, r4);
  }).filter(Boolean);

  if (sentences.length === 0) return null;
  return sentences.join(' ');
}
