// senses.js — prose compositor for sensory fragments
// Combines ambient, body-state, and environment fragments into natural sentences.
//
// See docs/design/senses.md and docs/research/prose-construction.md.
//
// Architecture:
//   composeFragments(fragments, hint) — pure exported function, no state dependency.
//     Takes pre-selected typed fragments + NT structure hint, returns combined sentence.
//     Testable in isolation.
//
//   createSenses(ctx) — factory. Contains fragment library, state queries, selection.
//     sense() — main entry point. Consumes 0 or 1 RNG call. Returns string or null.

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
 * Pure function: combine sensory fragments into a sentence.
 * NT structure hint determines sentence architecture.
 *
 * Authoring conventions for fragment content:
 *   'main'       — full independent clause, no trailing period
 *   'participle' — -ing phrase, no period
 *   'absolute'   — noun + participle/adjective, no period
 *   'fragment'   — NP or adjective fragment, no period
 *   'adverbial'  — subordinate clause (while/as/because), no period
 *
 * Ordering rules (attention order): involuntary_body → deliberate_visual → ambient
 *
 * Combination rules by hint:
 *   calm/heightened/flat: main clause root + participials/absolutes comma-attached;
 *     other types become separate sentences ordered by attention priority
 *   anxious/dissociated: each fragment its own sentence, period-separated
 *   overwhelmed: polysyndeton (joined with "and")
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

  if (sorted.length === 1) return ensurePeriod(sorted[0].content);

  // Overwhelmed: polysyndeton (and…and…)
  if (hint === 'overwhelmed') {
    return sorted.map(f => stripPunct(f.content)).join(' and ') + '.';
  }

  // Anxious / dissociated: each fragment stands alone as its own sentence
  if (hint === 'anxious' || hint === 'dissociated') {
    return sorted.map(f => ensurePeriod(f.content)).join(' ');
  }

  // Calm / heightened / flat / default:
  // Main clause as root; participials and absolutes comma-attached trailing;
  // pure fragments and additional mains become separate sentences.
  const mainIdx = sorted.findIndex(f => f.grammatical_type === 'main');
  if (mainIdx === -1) {
    // No main clause — period-separate everything
    return sorted.map(f => ensurePeriod(f.content)).join(' ');
  }

  const main = sorted[mainIdx];
  const rest = sorted.filter((_, i) => i !== mainIdx);

  // Participials and absolutes attach to main clause with trailing comma
  const modifying = rest.filter(
    f => f.grammatical_type === 'participle' || f.grammatical_type === 'absolute'
  );
  // Everything else becomes a separate sentence
  const standalone = rest.filter(
    f => f.grammatical_type !== 'participle' && f.grammatical_type !== 'absolute'
  );

  let sentence = stripPunct(main.content);
  if (modifying.length > 0) {
    sentence += ', ' + modifying.map(f => stripPunct(f.content)).join(', ');
  }
  sentence += '.';

  // Standalones with higher attention priority than main go before it;
  // equal or lower priority go after
  const mainOrder = ORDER[main.attention_order] ?? 1;
  const preMains = standalone.filter(f => (ORDER[f.attention_order] ?? 1) < mainOrder);
  const postMains = standalone.filter(f => (ORDER[f.attention_order] ?? 1) >= mainOrder);

  const parts = [
    ...preMains.map(f => ensurePeriod(f.content)),
    sentence,
    ...postMains.map(f => ensurePeriod(f.content)),
  ];
  return parts.join(' ');
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
  ];

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
   * Compose a sensory sentence for the current location and state.
   * Consumes 1 RNG call if pool has more than 1 eligible fragment; 0 otherwise.
   * Returns null if nothing surfaces.
   * @returns {string | null}
   */
  function sense() {
    const pool = getTriggeredFragments();
    if (pool.length === 0) return null;

    const hint = getStructureHint();
    const budget = getPacingBudget(hint);
    const selected = selectFragments(pool, budget);
    if (selected.length === 0) return null;

    return composeFragments(selected, hint);
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
    canDisplay,
    markDisplayed,
    getStructureHint,
    getTriggeredFragments,
  };
}
