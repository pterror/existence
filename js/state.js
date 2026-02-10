// state.js — hidden state engine
// The player never sees these numbers. Ever.

const State = (() => {
  // --- Internal state ---
  let s = {};

  function defaults() {
    return {
      energy: 60,       // 0-100. Physical/mental capacity.
      money: 47.50,     // Dollars. Tight but not zero.
      stress: 30,       // 0-100. Accumulated friction.
      hunger: 25,       // 0-100. 0 = full, 100 = starving.
      time: 6 * 60 + 30, // Minutes since midnight. Start at 6:30 AM.
      social: 40,       // 0-100. 0 = deeply isolated, 100 = connected.
      job_standing: 65, // 0-100. How work perceives you.

      // Flags and soft state
      alarm_set: true,
      alarm_went_off: false,
      at_work_today: false,
      called_in: false,
      ate_today: false,
      showered: false,
      dressed: false,
      has_phone: true,
      phone_battery: 70,     // 0-100
      fridge_food: 2,        // Rough units. 0 = empty.
      apartment_mess: 35,    // 0-100. Dishes, clothes, etc.
      weather: 'overcast',   // Set by events
      rain: false,

      // Location
      location: 'apartment_bedroom',
      previous_location: null,

      // Work specifics
      work_shift_start: 9 * 60,   // 9:00 AM
      work_shift_end: 17 * 60,    // 5:00 PM
      work_tasks_done: 0,
      work_tasks_expected: 4,

      // Day tracking
      day: 1,

      // Internal counters the player never sees
      actions_since_rest: 0,
      times_late_this_week: 0,
      consecutive_meals_skipped: 0,
      last_social_interaction: 0, // action count at last interaction
    };
  }

  function init() {
    s = defaults();
  }

  function get(key) {
    return s[key];
  }

  function set(key, value) {
    s[key] = value;
  }

  function getAll() {
    return { ...s };
  }

  function loadState(saved) {
    s = { ...defaults(), ...saved };
  }

  // --- Time ---

  function advanceTime(minutes) {
    s.time += minutes;

    // Passive effects per time passage
    const hours = minutes / 60;

    // Hunger increases over time
    s.hunger = Math.min(100, s.hunger + hours * 4);

    // Energy drain — accelerated by hunger
    const hungerDrainMultiplier = s.hunger > 70 ? 1.8 : s.hunger > 40 ? 1.3 : 1.0;
    s.energy = Math.max(0, s.energy - hours * 3 * hungerDrainMultiplier);

    // Stress creeps up slightly with time if already stressed
    if (s.stress > 50) {
      s.stress = Math.min(100, s.stress + hours * 1);
    }

    // Phone battery drains
    s.phone_battery = Math.max(0, s.phone_battery - hours * 1.5);

    // Social isolation increases over time without interaction
    const actionsSinceLastSocial = Timeline.getActionCount() - s.last_social_interaction;
    if (actionsSinceLastSocial > 10) {
      s.social = Math.max(0, s.social - hours * 2);
    }

    // Actions since rest
    s.actions_since_rest++;

    // Day rollover
    if (s.time >= 24 * 60) {
      s.time -= 24 * 60;
      s.day++;
      s.at_work_today = false;
      s.called_in = false;
      s.ate_today = false;
      s.showered = false;
      s.dressed = false;
      s.work_tasks_done = 0;
      s.alarm_went_off = false;
      s.apartment_mess = Math.min(100, s.apartment_mess + 5);

      // Fridge food slowly goes bad
      if (s.fridge_food > 0 && Timeline.chance(0.15)) {
        s.fridge_food = Math.max(0, s.fridge_food - 1);
      }
    }
  }

  function getHour() {
    return Math.floor(s.time / 60);
  }

  function getMinute() {
    return Math.floor(s.time % 60);
  }

  function getTimeString() {
    const h = getHour();
    const m = getMinute();
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  }

  function isWorkHours() {
    return s.time >= s.work_shift_start && s.time < s.work_shift_end;
  }

  function isLateForWork() {
    return s.time > s.work_shift_start + 15 && !s.at_work_today && !s.called_in;
  }

  // --- Qualitative tiers ---
  // These translate numbers into qualitative states the content system uses.
  // The player never sees "energy: 23" — they see prose that reflects the tier.

  function tier(value, thresholds) {
    // thresholds = [[max, label], ...] sorted ascending
    for (const [max, label] of thresholds) {
      if (value <= max) return label;
    }
    return thresholds[thresholds.length - 1][1];
  }

  function energyTier() {
    return tier(s.energy, [
      [10, 'depleted'],
      [25, 'exhausted'],
      [45, 'tired'],
      [65, 'okay'],
      [85, 'rested'],
      [100, 'alert']
    ]);
  }

  function stressTier() {
    return tier(s.stress, [
      [15, 'calm'],
      [35, 'baseline'],
      [55, 'tense'],
      [75, 'strained'],
      [100, 'overwhelmed']
    ]);
  }

  function hungerTier() {
    return tier(s.hunger, [
      [15, 'satisfied'],
      [35, 'fine'],
      [55, 'hungry'],
      [75, 'very_hungry'],
      [100, 'starving']
    ]);
  }

  function socialTier() {
    return tier(s.social, [
      [15, 'isolated'],
      [35, 'withdrawn'],
      [55, 'neutral'],
      [75, 'connected'],
      [100, 'warm']
    ]);
  }

  function jobTier() {
    return tier(s.job_standing, [
      [20, 'at_risk'],
      [40, 'shaky'],
      [55, 'adequate'],
      [75, 'solid'],
      [100, 'valued']
    ]);
  }

  function moneyTier() {
    if (s.money <= 0) return 'broke';
    if (s.money < 5) return 'scraping';
    if (s.money < 15) return 'tight';
    if (s.money < 40) return 'careful';
    if (s.money < 80) return 'okay';
    return 'comfortable';
  }

  function timePeriod() {
    const h = getHour();
    if (h < 5) return 'deep_night';
    if (h < 7) return 'early_morning';
    if (h < 9) return 'morning';
    if (h < 12) return 'late_morning';
    if (h < 14) return 'midday';
    if (h < 17) return 'afternoon';
    if (h < 20) return 'evening';
    if (h < 23) return 'night';
    return 'deep_night';
  }

  // --- Compound state queries ---
  // These reflect how states interact

  function canFocus() {
    return s.energy > 20 && s.hunger < 70 && s.stress < 80;
  }

  function moodTone() {
    // Returns a general tone for prose selection
    const e = s.energy;
    const st = s.stress;
    const h = s.hunger;
    const so = s.social;

    if (e <= 15 && st > 60) return 'numb';
    if (st > 75) return 'fraying';
    if (e <= 25) return 'heavy';
    if (so <= 20 && st > 40) return 'hollow';
    if (so <= 20) return 'quiet';
    if (e > 60 && st < 30) return 'clear';
    if (e > 40 && st < 50) return 'present';
    return 'flat';
  }

  // --- State modification helpers ---

  function adjustEnergy(amount) {
    s.energy = Math.max(0, Math.min(100, s.energy + amount));
  }

  function adjustStress(amount) {
    s.stress = Math.max(0, Math.min(100, s.stress + amount));
  }

  function adjustHunger(amount) {
    s.hunger = Math.max(0, Math.min(100, s.hunger + amount));
  }

  function adjustSocial(amount) {
    s.social = Math.max(0, Math.min(100, s.social + amount));
    if (amount > 0) {
      s.last_social_interaction = Timeline.getActionCount();
    }
  }

  function adjustMoney(amount) {
    s.money = Math.round((s.money + amount) * 100) / 100;
  }

  function adjustJobStanding(amount) {
    s.job_standing = Math.max(0, Math.min(100, s.job_standing + amount));
  }

  function spendMoney(amount) {
    if (s.money >= amount) {
      adjustMoney(-amount);
      return true;
    }
    return false;
  }

  return {
    init,
    get,
    set,
    getAll,
    loadState,
    advanceTime,
    getHour,
    getMinute,
    getTimeString,
    isWorkHours,
    isLateForWork,
    energyTier,
    stressTier,
    hungerTier,
    socialTier,
    jobTier,
    moneyTier,
    timePeriod,
    canFocus,
    moodTone,
    adjustEnergy,
    adjustStress,
    adjustHunger,
    adjustSocial,
    adjustMoney,
    adjustJobStanding,
    spendMoney
  };
})();
