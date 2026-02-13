// character.js — character schema, accessors, state application

const Character = (() => {
  /** @type {GameCharacter | null} */
  let current = null;

  /** @param {GameCharacter} character */
  function set(character) {
    current = { ...character };
  }

  /** @template {keyof GameCharacter} K @param {K} key @returns {GameCharacter[K]} */
  function get(key) {
    return current?.[key];
  }

  function getAll() {
    return current ? { ...current } : null;
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

    // Personality — raw values stored in state for drift engine to read.
    // Legacy saves without personality get 50/50/50 → inertia exactly 1.0 → no change.
    const personality = current.personality || { neuroticism: 50, self_esteem: 50, rumination: 50 };
    State.set('neuroticism', personality.neuroticism);
    State.set('self_esteem', personality.self_esteem);
    State.set('rumination', personality.rumination);

    // Phone battery — slept at home, charged overnight, but not everyone charges to full
    State.set('phone_battery', Timeline.charRandomInt(80, 100));

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
    set,
    get,
    getAll,
    isSet,
    applyToState,
  };
})();
