// senses.js — sensory prose compositor.
// Builds ambient passages from observation sources via the realization engine.
//
// Architecture:
//   composeFragments(fragments, hint) — pure exported function (fragment-system legacy).
//     Still used by the test suite; kept for reference.
//
//   createSenses(ctx) — factory.
//     sense() — main entry point. Delegates to getObservations() → realize().
//               RNG consumption: N×4 calls where N = getPassageBudget(hint) if
//               observations are available; 0 if nothing surfaces.
//               Returns string or null.

import { realize } from './realization.js';

/**
 * @typedef {{
 *   id: string,
 *   content: string,
 *   grammatical_type: 'main' | 'participle' | 'absolute' | 'adverbial' | 'fragment',
 *   rhetorical_tag: 'cause' | 'concession' | 'temporal' | 'simultaneous' | 'contrast' | 'continuation',
 *   channels: string[],
 *   attention_order: 'involuntary_body' | 'deliberate_visual' | 'ambient',
 *   locations?: string[],
 *   areas?: string[],
 *   trigger_conditions: (s: any) => boolean,
 *   character_conditions?: (c: any) => boolean,
 *   nt_weight?: (s: any) => number,
 * }} SensoryFragment
 */

/**
 * An observation source: a thing in the world (or body) with observable properties.
 * Sources are the input layer of the procedural prose pipeline.
 * Properties are evaluated values — not prose. The realization engine turns them into text.
 *
 * @typedef {{
 *   id: string,
 *   areas?: string[],
 *   locations?: string[],
 *   channels: string[],
 *   available: (s: any, w: any) => boolean,
 *   salience: (s: any) => number,
 *   properties: Object.<string, Object.<string, (s: any) => any>>,
 * }} ObservationSource
 */

/**
 * The result of observing a source: evaluated property values + salience at observation time.
 *
 * @typedef {{
 *   sourceId: string,
 *   channels: string[],
 *   salience: number,
 *   properties: Object.<string, Object.<string, any>>,
 * }} Observation
 */

/**
 * Pure function: combine sensory fragments into a sentence.
 * NT structure hint determines sentence architecture.
 *
 * Authoring conventions for fragment content:
 *   'main'       — full independent clause, no trailing period
 *   'participle' — -ing phrase attached to main clause subject, no period
 *   'absolute'   — noun + participle/adjective, grammatically free-floating, no period
 *   'fragment'   — NP or adjective fragment, no period
 *   'adverbial'  — clause body WITHOUT connective, no period.
 *                  The connective is derived from rhetorical_tag:
 *                  simultaneous→while, temporal→as, cause→because,
 *                  concession→although, contrast→though
 *                  Concession adverbials lead the sentence; all others trail.
 *
 * Ordering rules (attention order): involuntary_body → deliberate_visual → ambient
 *
 * Combination rules by hint:
 *   calm/heightened/flat/default:
 *     - main clause root
 *     - participle + absolute: comma-attached after main
 *     - adverbial (concession): leads — "Although [adv], [main, modifiers]."
 *     - adverbial (other): trails — "[main, modifiers], [conn] [adv]."
 *     - fragment + extra mains: separate sentences, ordered by attention priority
 *   anxious/dissociated: each fragment its own sentence; adverbials get
 *     connective prepended and capitalize
 *   overwhelmed: polysyndeton (joined with "and"); adverbials keep connective
 *
 * @param {SensoryFragment[]} fragments
 * @param {string} hint — 'calm' | 'anxious' | 'dissociated' | 'overwhelmed' | 'heightened' | 'flat'
 * @returns {string | null}
 */
export function composeFragments(fragments, hint) {
  if (!fragments || fragments.length === 0) return null;

  // Sort by attention order: involuntary_body first, then deliberate_visual, then ambient
  const ORDER = { involuntary_body: 0, deliberate_visual: 1, ambient: 2 };
  const sorted = [...fragments].sort(
    (a, b) => (ORDER[a.attention_order] ?? 1) - (ORDER[b.attention_order] ?? 1)
  );

  if (sorted.length === 1) return renderSingle(sorted[0]);

  // Overwhelmed: polysyndeton (and…and…); adverbials keep their connective
  if (hint === 'overwhelmed') {
    return sorted.map(f => renderForPolysyndeton(f)).join(' and ') + '.';
  }

  // Anxious / dissociated: each fragment its own sentence
  if (hint === 'anxious' || hint === 'dissociated') {
    return sorted.map(f => renderStandalone(f)).join(' ');
  }

  // Calm / heightened / flat / default:
  // Main clause root; participials + absolutes comma-attached; adverbials
  // woven in with connective (concession leads, rest trail); fragments
  // and surplus mains become separate sentences.
  const mainIdx = sorted.findIndex(f => f.grammatical_type === 'main');
  if (mainIdx === -1) {
    return sorted.map(f => renderStandalone(f)).join(' ');
  }

  const main = sorted[mainIdx];
  const rest = sorted.filter((_, i) => i !== mainIdx);

  const commaModifiers = rest.filter(
    f => f.grammatical_type === 'participle' || f.grammatical_type === 'absolute'
  );
  const adverbials = rest.filter(f => f.grammatical_type === 'adverbial');
  const standalone = rest.filter(
    f => f.grammatical_type !== 'participle' &&
         f.grammatical_type !== 'absolute' &&
         f.grammatical_type !== 'adverbial'
  );

  // Leading adverbial: concession only ("Although X, main.")
  const leadingAdv = adverbials.find(f => f.rhetorical_tag === 'concession');
  // Trailing adverbials: everything else ("[main], while X.")
  const trailingAdvs = adverbials.filter(f => f.rhetorical_tag !== 'concession');

  // Build the core sentence: main + comma-modifiers + trailing adverbials
  let core = stripPunct(main.content);
  if (commaModifiers.length > 0) {
    core += ', ' + commaModifiers.map(f => stripPunct(f.content)).join(', ');
  }
  for (const f of trailingAdvs) {
    const conn = CONNECTIVES[f.rhetorical_tag] || 'while';
    core += ', ' + conn + ' ' + stripPunct(f.content);
  }

  let sentence;
  if (leadingAdv) {
    const conn = CONNECTIVES[leadingAdv.rhetorical_tag] || 'although';
    // Lowercase first char of core when it follows the adverbial clause
    const lowerCore = core.charAt(0).toLowerCase() + core.slice(1);
    sentence = capitalize(conn) + ' ' + stripPunct(leadingAdv.content) + ', ' + lowerCore + '.';
  } else {
    sentence = core + '.';
  }

  // Standalone fragments: higher attention priority than main → before; otherwise after
  const mainOrder = ORDER[main.attention_order] ?? 1;
  const preMains = standalone.filter(f => (ORDER[f.attention_order] ?? 1) < mainOrder);
  const postMains = standalone.filter(f => (ORDER[f.attention_order] ?? 1) >= mainOrder);

  const parts = [
    ...preMains.map(f => renderStandalone(f)),
    sentence,
    ...postMains.map(f => renderStandalone(f)),
  ];
  return parts.join(' ');
}

// Connective words keyed by rhetorical_tag for adverbial fragments
const CONNECTIVES = {
  simultaneous: 'while',
  temporal: 'as',
  cause: 'because',
  concession: 'although',
  contrast: 'though',
  continuation: 'and',
};

/** Render a fragment as a standalone sentence (anxious/dissociated/pre-post standalones) */
function renderStandalone(f) {
  if (f.grammatical_type === 'adverbial') {
    const conn = CONNECTIVES[f.rhetorical_tag] || 'while';
    return capitalize(conn) + ' ' + ensurePeriod(f.content);
  }
  return ensurePeriod(f.content);
}

/** Render for polysyndeton chain (overwhelmed) — strip punct, keep connective for adverbials */
function renderForPolysyndeton(f) {
  if (f.grammatical_type === 'adverbial') {
    const conn = CONNECTIVES[f.rhetorical_tag] || 'while';
    return conn + ' ' + stripPunct(f.content);
  }
  return stripPunct(f.content);
}

/** Render a single fragment as a complete sentence */
function renderSingle(f) {
  if (f.grammatical_type === 'adverbial') {
    const conn = CONNECTIVES[f.rhetorical_tag] || 'while';
    return capitalize(conn) + ' ' + ensurePeriod(f.content);
  }
  return ensurePeriod(f.content);
}

/** @param {string} s */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** @param {string} s */
function stripPunct(s) {
  return s.replace(/[.!?]+$/, '').trim();
}

/** @param {string} s */
function ensurePeriod(s) {
  const t = s.trim();
  return /[.!?]$/.test(t) ? t : t + '.';
}

// --- Factory ---

export function createSenses(ctx) {
  const State = ctx.state;
  const Timeline = ctx.timeline;
  const World = ctx.world;

  // Minimum game-minutes between sensory fragment displays.
  // RNG is always consumed regardless — this only gates UI output.
  const SENSE_COOLDOWN_MINUTES = 12;
  let lastSensoryGameTime = -Infinity;

  // --- Fragment library ---
  // Each fragment: authored text + conditions + NT weights.
  // Fragments are selected from the pool based on location, state conditions, and NT weights.
  //
  // nt_weight defaults to 1. Higher weight = more likely to be selected.
  // trigger_conditions filters the pool before weighting; use for hard conditions.
  //
  /** @type {SensoryFragment[]} */
  const fragments = [

    // === INDOOR AMBIENT: SOUND ===
    // Latent-until-noticed: always present, surfaces when GABA low (can't filter ambient noise)
    {
      id: 'fridge_hum',
      content: 'The fridge hums',
      grammatical_type: 'main',
      rhetorical_tag: 'continuation',
      channels: ['sound'],
      attention_order: 'ambient',
      areas: ['apartment'],
      trigger_conditions: () => true,
      nt_weight: s => {
        const gaba = s.get('gaba');
        // More salient when GABA low (can't filter); baseline present otherwise
        return gaba < 45 ? 1 + State.lerp01(gaba, 45, 20) * 2 : 0.6;
      },
    },
    {
      id: 'pipes_click',
      content: 'something ticking in the pipes',
      grammatical_type: 'absolute',
      rhetorical_tag: 'simultaneous',
      channels: ['sound'],
      attention_order: 'ambient',
      areas: ['apartment'],
      // Only surfaces when filtering is degraded
      trigger_conditions: s => s.get('gaba') < 52 || s.get('norepinephrine') > 52,
      nt_weight: () => 1,
    },
    {
      id: 'coil_whine',
      content: 'a thin electronic whine from somewhere',
      grammatical_type: 'absolute',
      rhetorical_tag: 'simultaneous',
      channels: ['sound'],
      attention_order: 'ambient',
      areas: ['apartment'],
      // Coil whine: latent until can't filter (GABA low) or hypersensitive (NE high)
      trigger_conditions: s => s.get('gaba') < 42 || s.get('norepinephrine') > 58,
      nt_weight: () => 1,
    },
    {
      id: 'traffic_muffled',
      content: 'Traffic outside, reduced to texture by the walls',
      grammatical_type: 'main',
      rhetorical_tag: 'continuation',
      channels: ['sound'],
      attention_order: 'ambient',
      areas: ['apartment'],
      trigger_conditions: () => true,
      nt_weight: s => {
        const ne = s.get('norepinephrine');
        // Intrudes when NE high (sounds harder to screen out)
        return ne > 55 ? 0.5 + State.lerp01(ne, 55, 80) * 1.5 : 0.4;
      },
    },

    // === INDOOR AMBIENT: THERMAL ===
    {
      id: 'apartment_cold',
      content: 'Cold',
      grammatical_type: 'fragment',
      rhetorical_tag: 'continuation',
      channels: ['thermal'],
      attention_order: 'involuntary_body',
      areas: ['apartment'],
      trigger_conditions: s => s.get('temperature') < 15,
      nt_weight: () => 1,
    },
    {
      id: 'floor_cold_socks',
      content: 'the floor cold through socks',
      grammatical_type: 'absolute',
      rhetorical_tag: 'simultaneous',
      channels: ['thermal', 'touch'],
      attention_order: 'involuntary_body',
      locations: ['apartment_bedroom', 'apartment_bathroom', 'apartment_kitchen'],
      trigger_conditions: s => s.get('temperature') < 18,
      nt_weight: () => 1,
    },
    {
      id: 'apartment_warm',
      content: 'Warm in here',
      grammatical_type: 'fragment',
      rhetorical_tag: 'continuation',
      channels: ['thermal'],
      attention_order: 'involuntary_body',
      areas: ['apartment'],
      trigger_conditions: s => s.get('temperature') > 26,
      nt_weight: () => 1,
    },

    // === OUTDOOR: SOUND ===
    {
      id: 'traffic_street',
      content: 'Traffic',
      grammatical_type: 'fragment',
      rhetorical_tag: 'continuation',
      channels: ['sound'],
      attention_order: 'ambient',
      areas: ['outside'],
      trigger_conditions: () => true,
      nt_weight: s => s.get('norepinephrine') > 55 ? 1.5 : 1,
    },
    {
      id: 'street_voices',
      content: 'voices from somewhere across the street',
      grammatical_type: 'absolute',
      rhetorical_tag: 'simultaneous',
      channels: ['sound'],
      attention_order: 'ambient',
      areas: ['outside'],
      trigger_conditions: () => true,
      nt_weight: () => 1,
    },

    // === OUTDOOR: THERMAL ===
    {
      id: 'outside_cold_hits',
      content: 'The cold hits immediately',
      grammatical_type: 'main',
      rhetorical_tag: 'continuation',
      channels: ['thermal'],
      attention_order: 'involuntary_body',
      areas: ['outside'],
      trigger_conditions: s => s.get('temperature') < 8,
      nt_weight: () => 1,
    },
    {
      id: 'outside_warm',
      content: 'still warm out',
      grammatical_type: 'fragment',
      rhetorical_tag: 'continuation',
      channels: ['thermal'],
      attention_order: 'involuntary_body',
      areas: ['outside'],
      trigger_conditions: s => s.get('temperature') > 22,
      nt_weight: () => 1,
    },
    {
      id: 'wind_cuts',
      content: 'a wind that actually cuts',
      grammatical_type: 'absolute',
      rhetorical_tag: 'simultaneous',
      channels: ['thermal'],
      attention_order: 'involuntary_body',
      areas: ['outside'],
      trigger_conditions: s => s.get('temperature') < 5,
      nt_weight: () => 1,
    },

    // === OUTDOOR: RAIN ===
    {
      id: 'rain_ambient',
      content: 'Rain',
      grammatical_type: 'fragment',
      rhetorical_tag: 'continuation',
      channels: ['sound', 'thermal'],
      attention_order: 'ambient',
      areas: ['outside'],
      trigger_conditions: s => s.get('rain') === true,
      nt_weight: () => 1,
    },
    {
      id: 'rain_wet_everything',
      content: 'everything already wet',
      grammatical_type: 'absolute',
      rhetorical_tag: 'simultaneous',
      channels: ['sight', 'touch'],
      attention_order: 'ambient',
      areas: ['outside'],
      trigger_conditions: s => s.get('rain') === true,
      nt_weight: () => 1,
    },

    // === INTEROCEPTIVE: FATIGUE (adenosine) ===
    {
      id: 'adenosine_heavy',
      content: 'Heavy',
      grammatical_type: 'fragment',
      rhetorical_tag: 'continuation',
      channels: ['interoception'],
      attention_order: 'involuntary_body',
      trigger_conditions: s => s.get('adenosine') > 65,
      nt_weight: s => 0.5 + State.lerp01(s.get('adenosine'), 65, 90) * 1.5,
    },
    {
      id: 'adenosine_pulling',
      content: 'Something pulling toward horizontal',
      grammatical_type: 'main',
      rhetorical_tag: 'continuation',
      channels: ['interoception'],
      attention_order: 'involuntary_body',
      trigger_conditions: s => s.get('adenosine') > 75,
      nt_weight: s => State.lerp01(s.get('adenosine'), 75, 95),
    },

    // === INTEROCEPTIVE: HUNGER ===
    {
      id: 'hunger_stomach',
      content: 'stomach going',
      grammatical_type: 'absolute',
      rhetorical_tag: 'simultaneous',
      channels: ['interoception'],
      attention_order: 'involuntary_body',
      trigger_conditions: s => s.get('hunger') > 55,
      nt_weight: s => State.lerp01(s.get('hunger'), 55, 85),
    },
    {
      id: 'hunger_irritable',
      content: "an irritability that hasn't found a target yet",
      grammatical_type: 'absolute',
      rhetorical_tag: 'simultaneous',
      channels: ['interoception'],
      attention_order: 'involuntary_body',
      trigger_conditions: s => s.get('hunger') > 65,
      nt_weight: s => State.lerp01(s.get('hunger'), 65, 90) * 1.5,
    },

    // === ANXIETY SIGNALS ===
    {
      id: 'gaba_restless',
      content: "can't quite settle",
      grammatical_type: 'fragment',
      rhetorical_tag: 'continuation',
      channels: ['interoception'],
      attention_order: 'involuntary_body',
      trigger_conditions: s => s.get('gaba') < 38,
      nt_weight: s => 0.5 + State.lerp01(s.get('gaba'), 38, 20) * 1.5,
    },
    {
      id: 'ne_too_present',
      content: 'everything slightly too present',
      grammatical_type: 'fragment',
      rhetorical_tag: 'continuation',
      channels: ['interoception'],
      attention_order: 'involuntary_body',
      trigger_conditions: s => s.get('norepinephrine') > 65,
      nt_weight: s => State.lerp01(s.get('norepinephrine'), 65, 85),
    },

    // === PARTICIPIALS ===
    // -ing phrases that attach to the main clause's implied subject (the character).
    // Grammatically, they dangle in literary prose — the implied "you" is acceptable.
    {
      id: 'part_watching_light',
      content: 'watching the light shift on the wall',
      grammatical_type: 'participle',
      rhetorical_tag: 'simultaneous',
      channels: ['sight'],
      attention_order: 'deliberate_visual',
      trigger_conditions: () => true,
      nt_weight: () => 1,
    },
    {
      id: 'part_following_shadow',
      content: 'following the shadow line across the floor',
      grammatical_type: 'participle',
      rhetorical_tag: 'simultaneous',
      channels: ['sight'],
      attention_order: 'deliberate_visual',
      // Not too foggy to track visual movement
      trigger_conditions: s => s.get('adenosine') < 70,
      nt_weight: () => 1,
    },
    {
      id: 'part_feeling_weight',
      content: 'feeling the weight settle into your shoulders',
      grammatical_type: 'participle',
      rhetorical_tag: 'simultaneous',
      channels: ['interoception'],
      attention_order: 'involuntary_body',
      trigger_conditions: s => s.get('adenosine') > 55,
      nt_weight: s => 0.5 + State.lerp01(s.get('adenosine'), 55, 85) * 0.8,
    },
    {
      id: 'part_holding_still',
      content: 'holding still without deciding to',
      grammatical_type: 'participle',
      rhetorical_tag: 'simultaneous',
      channels: ['interoception'],
      attention_order: 'involuntary_body',
      trigger_conditions: s => s.get('adenosine') > 70,
      nt_weight: s => State.lerp01(s.get('adenosine'), 70, 92),
    },

    // === ADVERBIALS ===
    // Clause body WITHOUT connective. Connective derived from rhetorical_tag.
    // Concession (although) leads; all others trail.
    {
      id: 'adv_traffic_outside',
      content: 'the traffic builds outside',
      grammatical_type: 'adverbial',
      rhetorical_tag: 'simultaneous',
      channels: ['sound'],
      attention_order: 'ambient',
      trigger_conditions: () => true,
      nt_weight: () => 1,
    },
    {
      id: 'adv_rain_glass',
      content: 'rain comes in against the glass',
      grammatical_type: 'adverbial',
      rhetorical_tag: 'simultaneous',
      channels: ['sound', 'sight'],
      attention_order: 'ambient',
      trigger_conditions: s => s.get('rain') === true,
      nt_weight: () => 1,
    },
    {
      id: 'adv_building_settles',
      content: 'the building settles',
      grammatical_type: 'adverbial',
      rhetorical_tag: 'temporal',
      channels: ['sound'],
      attention_order: 'ambient',
      trigger_conditions: () => true,
      nt_weight: () => 0.7,
    },
    {
      id: 'adv_room_cools',
      content: 'the room cools around you',
      grammatical_type: 'adverbial',
      rhetorical_tag: 'temporal',
      channels: ['touch'],
      attention_order: 'ambient',
      trigger_conditions: () => true,
      nt_weight: () => 0.8,
    },
    {
      id: 'adv_day_moving',
      content: 'the day keeps moving',
      grammatical_type: 'adverbial',
      rhetorical_tag: 'contrast',
      channels: [],
      attention_order: 'ambient',
      trigger_conditions: s => s.get('adenosine') > 55,
      nt_weight: s => State.lerp01(s.get('adenosine'), 55, 80),
    },
    {
      id: 'adv_nothing_wrong',
      content: 'nothing is actually wrong',
      grammatical_type: 'adverbial',
      rhetorical_tag: 'concession',
      channels: ['interoception'],
      attention_order: 'ambient',
      // Triggers when anxious but not overwhelmed — the cognitive mismatch is the point
      trigger_conditions: s => s.get('gaba') < 45 && s.get('stress') < 55,
      nt_weight: s => State.lerp01(s.get('gaba'), 45, 20),
    },
    {
      id: 'adv_nothing_to_do',
      content: "there's nothing that needs doing right now",
      grammatical_type: 'adverbial',
      rhetorical_tag: 'concession',
      channels: [],
      attention_order: 'ambient',
      trigger_conditions: s => s.get('stress') < 35,
      nt_weight: () => 1,
    },
  ];

  // --- Observation source library ---
  // Sources model things in the world (and body) with observable properties.
  // They are the foundation of the procedural prose pipeline (realization engine TBD).
  // Properties are evaluated values — not prose. The realization engine turns them into text.
  //
  // Available sources for the current location are filtered by areas/locations + available().
  // Salience (0–1) weights how much a source forces attention in current NT state.
  //
  /** @type {ObservationSource[]} */
  const sources = [

    // === INDOOR: ACOUSTIC ===
    {
      id: 'fridge',
      areas: ['apartment'],
      channels: ['sound'],
      available: () => true,
      salience: s => {
        const gaba = s.get('gaba');
        // More salient when GABA low (filtering degraded)
        return gaba < 45 ? 0.35 + State.lerp01(gaba, 45, 20) * 0.5 : 0.15;
      },
      properties: {
        sound: {
          quality: () => 'hum',
          // Perceived louder when GABA low — same physical level, reduced filtering
          perceived_intensity: s => State.lerp01(s.get('gaba'), 65, 20),
        },
      },
    },
    {
      id: 'pipes',
      areas: ['apartment'],
      channels: ['sound'],
      available: s => s.get('gaba') < 52 || s.get('norepinephrine') > 52,
      salience: s => {
        const gaba = s.get('gaba');
        const ne = s.get('norepinephrine');
        return Math.max(
          gaba < 52 ? State.lerp01(gaba, 52, 25) * 0.4 : 0,
          ne > 52 ? State.lerp01(ne, 52, 80) * 0.3 : 0,
        );
      },
      properties: {
        sound: {
          quality: () => 'tick',
          rhythm: () => 'irregular',
        },
      },
    },
    {
      id: 'electronic_whine',
      areas: ['apartment'],
      channels: ['sound'],
      available: s => s.get('gaba') < 42 || s.get('norepinephrine') > 58,
      salience: s => {
        const gaba = s.get('gaba');
        const ne = s.get('norepinephrine');
        return Math.max(
          gaba < 42 ? State.lerp01(gaba, 42, 20) * 0.35 : 0,
          ne > 58 ? State.lerp01(ne, 58, 85) * 0.3 : 0,
        );
      },
      properties: {
        sound: {
          quality: () => 'whine',
          pitch: () => 'high',
        },
      },
    },
    {
      id: 'traffic_through_walls',
      areas: ['apartment'],
      channels: ['sound'],
      available: () => true,
      salience: s => {
        const ne = s.get('norepinephrine');
        // Low baseline; harder to screen out at high NE
        return ne > 55 ? 0.2 + State.lerp01(ne, 55, 80) * 0.4 : 0.1;
      },
      properties: {
        sound: {
          quality: () => 'muffled_traffic',
          source_distance: () => 'outside',
          filtered: () => true,
        },
      },
    },

    // === INDOOR: THERMAL ===
    {
      id: 'indoor_temperature',
      areas: ['apartment'],
      channels: ['thermal', 'touch'],
      // Only surfaces when meaningfully outside comfort zone
      available: s => s.get('temperature') < 16 || s.get('temperature') > 26,
      salience: s => {
        const temp = s.get('temperature');
        if (temp < 16) return State.lerp01(temp, 16, 5) * 0.7;
        if (temp > 26) return State.lerp01(temp, 26, 35) * 0.5;
        return 0;
      },
      properties: {
        thermal: {
          celsius: s => s.get('temperature'),
          tier: s => {
            const t = s.get('temperature');
            if (t < 5)  return 'very_cold';
            if (t < 12) return 'cold';
            if (t < 16) return 'cool';
            if (t > 35) return 'very_hot';
            if (t > 30) return 'hot';
            return 'warm';
          },
        },
      },
    },

    // === INTEROCEPTIVE: FATIGUE ===
    {
      id: 'fatigue',
      channels: ['interoception'],
      available: s => s.get('adenosine') > 55,
      salience: s => State.lerp01(s.get('adenosine'), 55, 95) * 0.8,
      properties: {
        interoception: {
          adenosine: s => s.get('adenosine'),
          tier: s => {
            const a = s.get('adenosine');
            if (a > 85) return 'crushing';
            if (a > 70) return 'heavy';
            if (a > 55) return 'present';
            return 'none';
          },
          // Character of the fatigue — what it feels like, not just how much
          quality: s => {
            const a = s.get('adenosine');
            if (a > 80) return 'gravitational'; // pulling toward horizontal
            if (a > 65) return 'weighted';       // weight in the limbs
            return 'dull';                       // background drag
          },
        },
      },
    },

    // === INTEROCEPTIVE: HUNGER ===
    {
      id: 'hunger_signal',
      channels: ['interoception'],
      available: s => s.get('hunger') > 45,
      salience: s => State.lerp01(s.get('hunger'), 45, 90) * 0.7,
      properties: {
        interoception: {
          hunger: s => s.get('hunger'),
          tier: s => {
            const h = s.get('hunger');
            if (h > 80) return 'starving';
            if (h > 65) return 'very_hungry';
            if (h > 45) return 'hungry';
            return 'none';
          },
          quality: s => {
            const h = s.get('hunger');
            if (h > 75) return 'hollow';    // emptied out
            if (h > 60) return 'gnawing';   // active discomfort
            return 'low_grade';             // background signal
          },
          // Whether hunger is bleeding into mood — behavioral, not just physical
          irritability: s => s.get('hunger') > 65,
        },
      },
    },

    // === INTEROCEPTIVE: ANXIETY ===
    {
      id: 'anxiety_signal',
      channels: ['interoception'],
      available: s => s.get('gaba') < 45 || s.get('norepinephrine') > 60,
      salience: s => {
        const gaba = s.get('gaba');
        const ne = s.get('norepinephrine');
        return Math.max(
          gaba < 45 ? State.lerp01(gaba, 45, 20) * 0.6 : 0,
          ne > 60 ? State.lerp01(ne, 60, 85) * 0.5 : 0,
        );
      },
      properties: {
        interoception: {
          gaba: s => s.get('gaba'),
          ne: s => s.get('norepinephrine'),
          // Qualitative character of the anxiety state
          character: s => {
            const gaba = s.get('gaba');
            const ne = s.get('norepinephrine');
            if (gaba < 30 && ne > 70) return 'overwhelmed'; // both systems
            if (ne > 65) return 'keyed_up';                 // NE-dominant: hyperalert
            if (gaba < 35) return 'unsettled';              // GABA-dominant: can't settle
            return 'restless';
          },
        },
      },
    },

    // === OUTDOOR: ACOUSTIC ===
    {
      id: 'traffic_outdoor',
      areas: ['outside'],
      channels: ['sound'],
      available: () => true,
      salience: s => {
        const ne = s.get('norepinephrine');
        return ne > 55 ? 0.3 + State.lerp01(ne, 55, 85) * 0.4 : 0.25;
      },
      properties: {
        sound: {
          quality: () => 'traffic',
          filtered: () => false,
        },
      },
    },
    {
      id: 'street_voices',
      areas: ['outside'],
      channels: ['sound'],
      available: () => true,
      salience: () => 0.3,
      properties: {
        sound: {
          quality: () => 'voices',
          source_distance: () => 'nearby',
          intelligible: () => false, // heard but not parsed
        },
      },
    },

    // === OUTDOOR: THERMAL ===
    {
      id: 'outdoor_temperature',
      areas: ['outside'],
      channels: ['thermal'],
      available: s => s.get('temperature') < 10 || s.get('temperature') > 28,
      salience: s => {
        const temp = s.get('temperature');
        if (temp < 10) return 0.4 + State.lerp01(temp, 10, -5) * 0.5;
        if (temp > 28) return 0.2 + State.lerp01(temp, 28, 40) * 0.4;
        return 0;
      },
      properties: {
        thermal: {
          celsius: s => s.get('temperature'),
          tier: s => {
            const t = s.get('temperature');
            if (t < 0)  return 'freezing';
            if (t < 5)  return 'very_cold';
            if (t < 10) return 'cold';
            if (t > 35) return 'very_hot';
            if (t > 28) return 'hot';
            return 'warm';
          },
          // Very cold hits immediately; warmth you notice more gradually
          immediate: s => s.get('temperature') < 8,
        },
      },
    },
    {
      id: 'wind',
      areas: ['outside'],
      channels: ['thermal', 'touch'],
      available: s => s.get('temperature') < 8,
      salience: s => {
        const temp = s.get('temperature');
        return temp < 8 ? 0.3 + State.lerp01(temp, 8, -5) * 0.5 : 0;
      },
      properties: {
        thermal: {
          quality: () => 'cutting',
          celsius: s => s.get('temperature'),
        },
      },
    },

    // === OUTDOOR: RAIN ===
    {
      id: 'rain',
      areas: ['outside'],
      channels: ['sound', 'touch', 'sight'],
      available: s => s.get('rain') === true,
      salience: () => 0.6,
      properties: {
        sound:  { quality: () => 'rain' },
        touch:  { quality: () => 'wet' },
        sight:  { quality: () => 'grey' },
      },
    },

    // === APARTMENT: VISUAL ===
    {
      id: 'window_light',
      areas: ['apartment'],
      channels: ['sight'],
      available: () => true,
      salience: () => {
        const h = State.getHour();
        const rain = State.get('rain');
        // Most salient at transitions: dawn, evening dimming, and when still dark
        if (h >= 6 && h < 9)   return rain ? 0.5 : 0.45;  // morning grey or early light
        if (h >= 17 && h < 21) return 0.4;                 // evening darkening
        if (h < 6 || h >= 21)  return 0.35;                // window is dark
        return rain ? 0.2 : 0.1;                           // full daylight — not grabby
      },
      properties: {
        sight: {
          condition: () => {
            const h = State.getHour();
            const rain = State.get('rain');
            if (h < 6 || h >= 22)  return 'dark';
            if (h >= 6 && h < 8)   return rain ? 'grey_morning' : 'early_light';
            if (h >= 17 && h < 20) return rain ? 'grey_evening' : 'dimming';
            if (rain) return 'overcast';
            return 'daylight';
          },
          rain: () => State.get('rain'),
        },
      },
    },

    // === APARTMENT: BATHROOM ===
    {
      id: 'bathroom_echo',
      locations: ['apartment_bathroom'],
      channels: ['sound'],
      available: () => true,
      salience: () => {
        const ne = State.get('norepinephrine');
        const gaba = State.get('gaba');
        // Tile acoustics are more noticeable when perceptual filtering is reduced
        return Math.max(
          ne > 55 ? State.lerp01(ne, 55, 80) * 0.35 : 0.1,
          gaba < 45 ? State.lerp01(gaba, 45, 25) * 0.3 : 0,
        );
      },
      properties: {
        sound: {
          quality: () => 'reverberant',
          surface: () => 'tile',
        },
      },
    },

    // === INTEROCEPTIVE: STRESS ===
    {
      id: 'stress_signal',
      channels: ['interoception'],
      available: s => s.get('stress') > 50,
      salience: s => State.lerp01(s.get('stress'), 50, 90) * 0.65,
      properties: {
        interoception: {
          stress: s => s.get('stress'),
          tier: s => {
            const st = s.get('stress');
            if (st > 80) return 'overwhelmed';
            if (st > 65) return 'strained';
            return 'elevated';
          },
          // Where the body holds the tension — a somatic location, not an emotional one
          location: s => {
            const ne = s.get('norepinephrine');
            const gaba = s.get('gaba');
            if (ne > 65) return 'jaw';       // hyperalert: jaw clenching, bracing
            if (gaba < 35) return 'chest';   // GABA depleted: tight chest, shallow breath
            return 'shoulders';              // default: load-bearing tension
          },
        },
      },
    },

    // === INTEROCEPTIVE: CAFFEINE ===
    {
      id: 'caffeine_signal',
      channels: ['interoception'],
      available: s => s.get('caffeine_level') > 30,
      salience: s => {
        const c = s.get('caffeine_level');
        return c > 60 ? State.lerp01(c, 60, 100) * 0.55 : State.lerp01(c, 30, 60) * 0.2;
      },
      properties: {
        interoception: {
          caffeine: s => s.get('caffeine_level'),
          quality: s => {
            const c = s.get('caffeine_level');
            const ne = s.get('norepinephrine');
            if (c > 75 && ne > 65) return 'jitter';  // too much: shaky, running hot
            if (c > 50) return 'sharp';               // working: focused edge
            return 'edge';                            // low dose: present but subtle
          },
        },
      },
    },

    // === WORK: ACOUSTIC ===
    {
      id: 'workplace_hvac',
      areas: ['work'],
      channels: ['sound'],
      available: () => true,
      salience: () => {
        const gaba = State.get('gaba');
        // Normally screened out; breaks through when anxiety degrades filtering
        return gaba < 45 ? 0.15 + State.lerp01(gaba, 45, 20) * 0.3 : 0.1;
      },
      properties: {
        sound: {
          quality: () => 'hvac',
          source: () => 'overhead',
        },
      },
    },
    {
      id: 'fluorescent_lights',
      areas: ['work'],
      channels: ['sight', 'sound'],
      available: s => s.get('gaba') < 48 || s.get('norepinephrine') > 55,
      salience: s => {
        const gaba = s.get('gaba');
        const ne = s.get('norepinephrine');
        return Math.max(
          gaba < 48 ? State.lerp01(gaba, 48, 22) * 0.4 : 0,
          ne > 55 ? State.lerp01(ne, 55, 80) * 0.35 : 0,
        );
      },
      properties: {
        sight: {
          quality: () => 'fluorescent',
          // Flickering is a real phenomenon with fluorescents; NE makes it impossible to ignore
          flicker: s => s.get('norepinephrine') > 65,
        },
        sound: {
          quality: () => 'hum',
          pitch: () => 'high',
        },
      },
    },
    {
      id: 'coworker_background',
      areas: ['work'],
      channels: ['sound'],
      available: () => true,
      salience: () => {
        const ne = State.get('norepinephrine');
        const socialEnergy = State.get('social_energy');
        // High NE makes voices intrude; depleted social energy makes them harder to screen
        return Math.max(
          ne > 58 ? State.lerp01(ne, 58, 85) * 0.45 : 0.15,
          socialEnergy < 30 ? State.lerp01(socialEnergy, 30, 0) * 0.3 : 0,
        );
      },
      properties: {
        sound: {
          quality: () => 'voices',
          source: () => 'open_office',
          // At very high NE, individual voices become almost parseable — not quite
          intelligible: s => s.get('norepinephrine') > 70,
        },
      },
    },
  ];

  // --- Observation functions ---

  /**
   * Filter sources for the current location and state.
   * No RNG consumed.
   * @returns {ObservationSource[]}
   */
  function getAvailableSources() {
    const locationId = World.getLocationId();
    const location = World.getLocation(locationId);
    const area = location ? location.area : null;

    return sources.filter(src => {
      if (src.locations && !src.locations.includes(locationId)) return false;
      if (src.areas && !src.areas.includes(area ?? '')) return false;
      return src.available(State, World);
    });
  }

  /**
   * Evaluate a source's properties to produce an Observation.
   * No RNG consumed.
   * @param {ObservationSource} source
   * @returns {Observation}
   */
  function observe(source) {
    const evaluatedProperties = {};
    for (const [channel, props] of Object.entries(source.properties)) {
      evaluatedProperties[channel] = {};
      for (const [key, fn] of Object.entries(props)) {
        evaluatedProperties[channel][key] = fn(State);
      }
    }
    return {
      sourceId: source.id,
      channels: source.channels,
      salience: source.salience(State),
      properties: evaluatedProperties,
    };
  }

  /**
   * Get all observations for the current location and state,
   * sorted by salience descending. No RNG consumed.
   * (Selection with RNG will be added when this integrates with sense().)
   * @returns {Observation[]}
   */
  function getObservations() {
    return getAvailableSources()
      .map(src => observe(src))
      .sort((a, b) => b.salience - a.salience);
  }

  // --- NT state → structure hint ---

  function getStructureHint() {
    const gaba = State.get('gaba');
    const ne = State.get('norepinephrine');
    const aden = State.get('adenosine');
    const ser = State.get('serotonin');
    const dopa = State.get('dopamine');

    if (gaba < 30 && ne > 70) return 'overwhelmed';
    if (gaba < 40 || ne > 60) return 'anxious';
    if (aden > 75 && ne < 45) return 'dissociated';
    if (ser > 60 && dopa > 55 && ne > 50) return 'heightened';
    if (ser < 35 && dopa < 40) return 'flat';
    return 'calm';
  }

  // --- Fragment pool ---

  /** @returns {SensoryFragment[]} */
  function getTriggeredFragments() {
    const locationId = World.getLocationId();
    const location = World.getLocation(locationId);
    const area = location ? location.area : null;

    return fragments.filter(f => {
      if (f.locations && !f.locations.includes(locationId)) return false;
      if (f.areas && !f.areas.includes(area ?? '')) return false;
      return f.trigger_conditions(State);
    });
  }

  /**
   * Select fragments from the triggered pool using NT weights.
   * Consumes exactly 1 RNG call via weightedPick if pool.length > 1.
   * If pool has 0 or 1 fragment, returns without consuming RNG.
   * @param {SensoryFragment[]} pool
   * @param {number} budget
   * @returns {SensoryFragment[]}
   */
  function selectFragments(pool, budget) {
    if (pool.length === 0) return [];
    if (pool.length === 1) return pool;

    // Primary pick: weighted random (1 RNG call)
    const weighted = pool.map(f => ({
      weight: Math.max(0.01, f.nt_weight ? f.nt_weight(State) : 1),
      value: f,
    }));
    const first = Timeline.weightedPick(weighted);
    if (budget <= 1) return [first];

    // Additional picks: deterministic (highest-weight from remainder, no more RNG)
    const rest = pool
      .filter(f => f !== first)
      .sort((a, b) => {
        const wa = Math.max(0.01, a.nt_weight ? a.nt_weight(State) : 1);
        const wb = Math.max(0.01, b.nt_weight ? b.nt_weight(State) : 1);
        return wb - wa;
      });
    return [first, ...rest.slice(0, budget - 1)];
  }

  /** @param {string} hint */
  function getPacingBudget(hint) {
    if (hint === 'overwhelmed') return 4;
    if (hint === 'dissociated' || hint === 'flat') return 1;
    return 2;
  }

  /**
   * NT context for the realization engine — normalized 0–1 values.
   * @returns {{ gaba: number, ne: number, aden: number, serotonin: number, dopamine: number }}
   */
  function getNtCtx() {
    return {
      gaba:      State.get('gaba')           / 100,
      ne:        State.get('norepinephrine') / 100,
      aden:      State.get('adenosine')      / 100,
      serotonin: State.get('serotonin')      / 100,
      dopamine:  State.get('dopamine')       / 100,
    };
  }

  /**
   * Compose a sensory passage for the current location and state.
   * Delegates to the observation source pipeline and realization engine.
   * RNG consumption: N×4 calls (N = getPassageBudget(hint)) if observations
   * are available; 0 if nothing surfaces. Always the same count for the same state.
   * @returns {string | null}
   */
  function sense() {
    const observations = getObservations();
    if (observations.length === 0) return null;
    const hint = getStructureHint();
    return realize(observations, hint, getNtCtx(), () => Timeline.random());
  }

  /**
   * Compose a single first-impression observation for location arrival.
   * Only the highest-salience source fires — a first impression, not a full passage.
   * RNG consumption: exactly 4 calls if any source is available; 0 otherwise.
   * No cooldown — arrival is a distinct context from idle sensing.
   * @returns {string | null}
   */
  function arrivalSense() {
    const observations = getObservations();
    if (observations.length === 0) return null;
    // Only fire when something is genuinely salient — not every room transition warrants a beat.
    // Threshold check is pure state (no RNG), so replay stays deterministic.
    if (observations[0].salience < 0.4) return null;
    const hint = getStructureHint();
    return realize(observations.slice(0, 1), hint, getNtCtx(), () => Timeline.random());
  }

  /**
   * Whether enough game time has passed since last sensory display.
   * Gates UI output only — RNG consumption is always the same regardless.
   * @returns {boolean}
   */
  function canDisplay() {
    return State.get('time') - lastSensoryGameTime >= SENSE_COOLDOWN_MINUTES;
  }

  function markDisplayed() {
    lastSensoryGameTime = State.get('time');
  }

  return {
    sense,
    arrivalSense,
    canDisplay,
    markDisplayed,
    getStructureHint,
    getTriggeredFragments,
    getObservations,
  };
}
