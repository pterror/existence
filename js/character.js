// character.js — character schema, accessors, state application

const Character = (() => {
  /** @type {GameCharacter | null} */
  let current = null;

  // Legacy defaults — matches the original hardcoded content.js values
  /** @returns {GameCharacter} */
  function legacyDefaults() {
    return {
      first_name: 'You',
      last_name: '',
      sleepwear: 'the old grey t-shirt and boxers you slept in',
      outfit_default: 'Jeans, a flannel, socks that match close enough. You get dressed.',
      outfit_low_mood: 'Jeans. The black hoodie. Each piece is a separate decision. You make them all, eventually.',
      outfit_messy: 'You find a shirt in the pile that passes the smell test. Jeans from the chair. Good enough.',
      friend1: { name: 'Dana', flavor: 'sends_things' },
      friend2: { name: 'Marcus', flavor: 'dry_humor' },
      coworker1: { name: 'Priya', flavor: 'warm_quiet' },
      coworker2: { name: 'Kevin', flavor: 'mundane_talker' },
      supervisor: { name: 'Terri' },
      job_type: 'office',
      age_stage: 'thirties',
      start_timestamp: 28401120, // 2024-01-01 00:00 UTC
      latitude: 42,
    };
  }

  /** @param {GameCharacter} character */
  function set(character) {
    current = { ...legacyDefaults(), ...character };
  }

  /** @template {keyof GameCharacter} K @param {K} key @returns {GameCharacter[K]} */
  function get(key) {
    if (!current) return legacyDefaults()[key];
    return current[key];
  }

  function getAll() {
    return current ? { ...current } : legacyDefaults();
  }

  function isSet() {
    return current !== null;
  }

  // Apply character to game state (called once at game start)
  function applyToState() {
    if (!current) return;

    // Calendar and geography
    if (current.start_timestamp) {
      State.set('start_timestamp', current.start_timestamp);
    }
    if (current.latitude !== undefined) {
      State.set('latitude', current.latitude);
    }
    // Age affects starting money
    // last_observed_money offset by ~$5 → starts at approximate fidelity
    const age = current.age_stage;
    let startMoney = 47.50, startLastMoney = 42.50; // default (thirties)
    if (typeof age === 'number') {
      if (age < 30) { startMoney = 35; startLastMoney = 30; }
      else if (age >= 40) { startMoney = 55; startLastMoney = 50; }
    } else {
      // Legacy string format
      if (age === 'twenties') { startMoney = 35; startLastMoney = 30; }
      else if (age === 'forties') { startMoney = 55; startLastMoney = 50; }
    }
    State.set('money', startMoney);
    State.set('last_observed_money', startLastMoney);

    // Job type affects shift times, alarm, and task expectations
    // last_observed_time offset by -20 from alarm → starts at rounded fidelity
    switch (current.job_type) {
      case 'office':
        State.set('work_shift_start', 9 * 60);    // 9:00 AM
        State.set('work_shift_end', 17 * 60);      // 5:00 PM
        State.set('work_tasks_expected', 4);
        State.set('alarm_time', 7 * 60 + 30);      // 7:30 AM
        State.set('time', 7 * 60 + 30);
        State.set('last_observed_time', 7 * 60 + 10);
        State.set('last_msg_gen_time', 7 * 60 + 30);
        break;
      case 'retail':
        State.set('work_shift_start', 10 * 60);   // 10:00 AM
        State.set('work_shift_end', 18 * 60);      // 6:00 PM
        State.set('work_tasks_expected', 5);
        State.set('alarm_time', 8 * 60 + 30);      // 8:30 AM
        State.set('time', 8 * 60 + 30);
        State.set('last_observed_time', 8 * 60 + 10);
        State.set('last_msg_gen_time', 8 * 60 + 30);
        break;
      case 'food_service':
        State.set('work_shift_start', 7 * 60);    // 7:00 AM
        State.set('work_shift_end', 15 * 60);      // 3:00 PM
        State.set('work_tasks_expected', 6);
        State.set('alarm_time', 5 * 60 + 30);      // 5:30 AM
        State.set('time', 5 * 60 + 30);
        State.set('last_observed_time', 5 * 60 + 10);
        State.set('last_msg_gen_time', 5 * 60 + 30);
        break;
    }
  }

  return {
    legacyDefaults,
    set,
    get,
    getAll,
    isSet,
    applyToState,
  };
})();
