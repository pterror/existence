// timeline.js — seeded PRNG, action log, autosave/restore, deterministic replay

const Timeline = (() => {
  const STORAGE_KEY = 'existence_timeline';

  // --- xoshiro128** PRNG ---
  // 128-bit state, excellent statistical quality, deterministic

  function xoshiro128ss(a, b, c, d) {
    return () => {
      const t = b << 9;
      let r = a * 5;
      r = ((r << 7) | (r >>> 25)) * 9;

      c ^= a;
      d ^= b;
      b ^= c;
      a ^= d;

      c ^= t;
      d = (d << 11) | (d >>> 21);

      return (r >>> 0) / 4294967296;
    };
  }

  // Seed splitmix32 to initialize xoshiro state from a single integer
  function splitmix32(seed) {
    return () => {
      seed |= 0;
      seed = (seed + 0x9e3779b9) | 0;
      let t = seed ^ (seed >>> 16);
      t = Math.imul(t, 0x21f0aaad);
      t ^= t >>> 15;
      t = Math.imul(t, 0x735a2d97);
      t ^= t >>> 15;
      return t >>> 0;
    };
  }

  function createPRNG(seed) {
    const sm = splitmix32(seed);
    return xoshiro128ss(sm(), sm(), sm(), sm());
  }

  // --- Timeline state ---
  let seed = 0;
  let actions = [];
  let rng = null;       // game PRNG stream
  let charRng = null;   // character generation PRNG stream (separate)
  let character = null;  // stored character data

  // Track how many RNG calls have been made (for replay)
  let rngCallCount = 0;

  function init(existingSeed) {
    seed = existingSeed != null ? existingSeed : generateSeed();
    actions = [];

    // Derive two independent sub-seeds from master seed
    // so chargen changes never break gameplay replay
    const sm = splitmix32(seed);
    const charSeed = sm();
    const gameSeed = sm();

    charRng = createPRNG(charSeed);
    rng = createPRNG(gameSeed);
    rngCallCount = 0;
    character = null;
  }

  function generateSeed() {
    // Use crypto for initial seed — this is the ONE place we use non-deterministic randomness
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0];
  }

  // --- Game PRNG (gameplay, events, prose) ---

  // Get next random number [0, 1)
  function random() {
    rngCallCount++;
    return rng();
  }

  // Random integer in [min, max] inclusive
  function randomInt(min, max) {
    return min + Math.floor(random() * (max - min + 1));
  }

  // Random float in [min, max)
  function randomFloat(min, max) {
    return min + random() * (max - min);
  }

  // Weighted random pick from array of { weight, value } objects
  function weightedPick(items) {
    let total = 0;
    for (const item of items) total += item.weight;
    let r = random() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item.value;
    }
    return items[items.length - 1].value;
  }

  // Random boolean with given probability
  function chance(probability) {
    return random() < probability;
  }

  // Pick random element from array
  function pick(arr) {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(random() * arr.length)];
  }

  // --- Character PRNG (chargen only, separate stream) ---

  function charRandom() {
    return charRng();
  }

  function charRandomInt(min, max) {
    return min + Math.floor(charRandom() * (max - min + 1));
  }

  function charPick(arr) {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(charRandom() * arr.length)];
  }

  // Weighted pick using character stream — for name sampling
  // Takes array of [value, weight] pairs (compact format from names.js)
  function charWeightedPick(pairs) {
    let total = 0;
    for (const pair of pairs) total += pair[1];
    let r = charRandom() * total;
    for (const pair of pairs) {
      r -= pair[1];
      if (r <= 0) return pair[0];
    }
    return pairs[pairs.length - 1][0];
  }

  // --- Action log ---

  function recordAction(action) {
    actions.push({ action, timestamp: actions.length });
    save();
  }

  function getActions() {
    return actions.slice();
  }

  function getActionCount() {
    return actions.length;
  }

  // --- Autosave / Restore ---

  function setCharacter(char) {
    character = char;
  }

  function getCharacter() {
    return character;
  }

  function save() {
    try {
      const data = JSON.stringify({ seed, character, actions });
      localStorage.setItem(STORAGE_KEY, data);
    } catch (e) {
      // localStorage might be full or unavailable — silently continue
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && typeof data.seed === 'number' && Array.isArray(data.actions)) {
        return data;
      }
    } catch (e) {
      // Corrupted save — treat as fresh start
    }
    return null;
  }

  function hasSave() {
    return load() !== null;
  }

  function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // --- Replay ---
  // Reconstruct state by replaying seed + action sequence
  // Returns the action list for the game to replay through its own update logic

  function restore() {
    const data = load();
    if (!data) return null;

    seed = data.seed;
    actions = data.actions;
    character = data.character || null;

    // Re-derive the same sub-seeds
    const sm = splitmix32(seed);
    const charSeed = sm();
    const gameSeed = sm();

    charRng = createPRNG(charSeed);
    rng = createPRNG(gameSeed);
    rngCallCount = 0;

    return { seed, character, actions: data.actions };
  }

  function getSeed() {
    return seed;
  }

  return {
    init,
    random,
    randomInt,
    randomFloat,
    weightedPick,
    chance,
    pick,
    charRandom,
    charRandomInt,
    charPick,
    charWeightedPick,
    setCharacter,
    getCharacter,
    recordAction,
    getActions,
    getActionCount,
    save,
    load,
    hasSave,
    clearSave,
    restore,
    getSeed
  };
})();
