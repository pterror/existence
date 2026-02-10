// character.js — character schema, accessors, state application

const Character = (() => {
  let current = null;

  // Legacy defaults — matches the original hardcoded content.js values
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

  function set(character) {
    current = { ...legacyDefaults(), ...character };
  }

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
    switch (current.age_stage) {
      case 'twenties':
        State.set('money', 35);
        break;
      case 'thirties':
        State.set('money', 47.50);
        break;
      case 'forties':
        State.set('money', 55);
        break;
    }

    // Job type affects shift times and task expectations
    switch (current.job_type) {
      case 'office':
        State.set('work_shift_start', 9 * 60);   // 9:00 AM
        State.set('work_shift_end', 17 * 60);     // 5:00 PM
        State.set('work_tasks_expected', 4);
        break;
      case 'retail':
        State.set('work_shift_start', 10 * 60);   // 10:00 AM
        State.set('work_shift_end', 18 * 60);      // 6:00 PM
        State.set('work_tasks_expected', 5);
        break;
      case 'food_service':
        State.set('work_shift_start', 7 * 60);    // 7:00 AM
        State.set('work_shift_end', 15 * 60);      // 3:00 PM
        State.set('work_tasks_expected', 6);
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
