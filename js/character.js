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

    // Age stage affects starting money
    // last_observed_money offset by ~$5 → starts at approximate fidelity
    switch (current.age_stage) {
      case 'twenties':
        State.set('money', 35);
        State.set('last_observed_money', 30);
        break;
      case 'thirties':
        State.set('money', 47.50);
        State.set('last_observed_money', 42.50);
        break;
      case 'forties':
        State.set('money', 55);
        State.set('last_observed_money', 50);
        break;
    }

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
        break;
      case 'retail':
        State.set('work_shift_start', 10 * 60);   // 10:00 AM
        State.set('work_shift_end', 18 * 60);      // 6:00 PM
        State.set('work_tasks_expected', 5);
        State.set('alarm_time', 8 * 60 + 30);      // 8:30 AM
        State.set('time', 8 * 60 + 30);
        State.set('last_observed_time', 8 * 60 + 10);
        break;
      case 'food_service':
        State.set('work_shift_start', 7 * 60);    // 7:00 AM
        State.set('work_shift_end', 15 * 60);      // 3:00 PM
        State.set('work_tasks_expected', 6);
        State.set('alarm_time', 5 * 60 + 30);      // 5:30 AM
        State.set('time', 5 * 60 + 30);
        State.set('last_observed_time', 5 * 60 + 10);
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
