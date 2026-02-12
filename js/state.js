// state.js — hidden state engine
// The player never sees these numbers. Ever.

/** @typedef {ReturnType<typeof State.getAll>} GameState */

const State = (() => {
  // --- Internal state ---
  /** @type {ReturnType<typeof defaults>} */
  let s = /** @type {any} */ ({});

  function defaults() {
    return {
      energy: 60,       // 0-100. Physical/mental capacity.
      money: 47.50,     // Dollars. Tight but not zero.
      stress: 30,       // 0-100. Accumulated friction.
      hunger: 25,       // 0-100. 0 = full, 100 = starving.
      time: 6 * 60 + 30, // Minutes since game start. Keeps incrementing, never resets.
      social: 40,       // 0-100. 0 = deeply isolated, 100 = connected.
      job_standing: 65, // 0-100. How work perceives you.

      // Calendar anchor — minutes since Unix epoch. Set once from charRng.
      start_timestamp: 0,

      // Flags and soft state
      alarm_time: 6 * 60 + 30,  // Minutes since midnight. When the alarm fires.
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
      previous_location: /** @type {string | null} */ (null),

      // Work specifics
      work_shift_start: 9 * 60,   // 9:00 AM in minutes since midnight
      work_shift_end: 17 * 60,    // 5:00 PM in minutes since midnight
      work_tasks_done: 0,
      work_tasks_expected: 4,

      // Phone inbox and mode
      phone_inbox: /** @type {{ type: string, text: string, read: boolean }[]} */ ([]),
      phone_silent: false,
      viewing_phone: false,
      last_msg_gen_time: 0,     // game time of last generateIncomingMessages call
      work_nagged_today: false, // reset on wake
      last_bill_day: 0,         // last game-day a bill notification arrived

      // Internal counters the player never sees
      actions_since_rest: 0,
      times_late_this_week: 0,
      consecutive_meals_skipped: 0,
      last_social_interaction: 0, // action count at last interaction

      // Event surfacing — tracks how many times state-condition events have appeared.
      // After cap, they go silent and let tier-based prose carry the weight.
      surfaced_hunger: 0,
      surfaced_exhaustion: 0,
      surfaced_late: 0,
      surfaced_mess: 0,

      // Observation tracking — fidelity degrades with distance from last observation
      last_observed_time: 6 * 60 + 30,   // alarm time
      last_observed_money: 47.50,         // matches default starting money
    };
  }

  function init() {
    s = defaults();
  }

  /** @template {keyof ReturnType<typeof defaults>} K @param {K} key @returns {ReturnType<typeof defaults>[K]} */
  function get(key) {
    return s[key];
  }

  /** @template {keyof ReturnType<typeof defaults>} K @param {K} key @param {ReturnType<typeof defaults>[K]} value */
  function set(key, value) {
    s[key] = value;
  }

  function getAll() {
    return { ...s };
  }

  /** @param {Partial<ReturnType<typeof defaults>>} saved */
  function loadState(saved) {
    s = { ...defaults(), ...saved };
  }

  // --- Time ---

  /** @param {number} minutes */
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

    // Gradual apartment entropy
    s.apartment_mess = Math.min(100, s.apartment_mess + hours * 0.2);

    // Actions since rest
    s.actions_since_rest++;
  }

  // --- Time of day / calendar ---

  /** Minutes within the current 24h period */
  function timeOfDay() {
    return ((s.time % 1440) + 1440) % 1440;
  }

  function getHour() {
    return Math.floor(timeOfDay() / 60);
  }

  function getMinute() {
    return Math.floor(timeOfDay() % 60);
  }

  function getTimeString() {
    const h = getHour();
    const m = getMinute();
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  }

  /** Game day counter (1-indexed) */
  function getDay() {
    return Math.floor(s.time / 1440) + 1;
  }

  /** Calendar date from start_timestamp + time */
  function calendarDate() {
    const d = new Date((s.start_timestamp + s.time) * 60000);
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth(),    // 0-11
      day: d.getUTCDate(),       // 1-31
      weekday: d.getUTCDay(),    // 0-6 (Sun=0)
      hour: d.getUTCHours(),
      minute: d.getUTCMinutes(),
    };
  }

  function dayOfWeek() {
    return calendarDate().weekday;
  }

  function season() {
    const month = calendarDate().month;
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /** @param {number} eventTime @returns {number} */
  function daysSince(eventTime) {
    return (s.time - eventTime) / 1440;
  }

  /** @param {number} t1 @param {number} t2 @returns {boolean} */
  function isSameDay(t1, t2) {
    return Math.floor(t1 / 1440) === Math.floor(t2 / 1440);
  }

  function isWorkHours() {
    const tod = timeOfDay();
    return tod >= s.work_shift_start && tod < s.work_shift_end;
  }

  function isLateForWork() {
    const tod = timeOfDay();
    return tod > s.work_shift_start + 15 && !s.at_work_today && !s.called_in;
  }

  /** Reset wake-period flags — called when the player wakes from sleep */
  function wakeUp() {
    s.dressed = false;
    s.showered = false;
    s.ate_today = false;
    s.at_work_today = false;
    s.called_in = false;
    s.work_tasks_done = 0;
    s.alarm_went_off = false;
    s.surfaced_late = 0;
    s.work_nagged_today = false;
  }

  // --- Qualitative tiers ---
  // These translate numbers into qualitative states the content system uses.
  // The player never sees "energy: 23" — they see prose that reflects the tier.

  /** @param {number} value @param {[number, string][]} thresholds */
  function tier(value, thresholds) {
    // thresholds = [[max, label], ...] sorted ascending
    for (const [max, label] of thresholds) {
      if (value <= max) return label;
    }
    return /** @type {[number, string]} */ (thresholds[thresholds.length - 1])[1];
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

  /** @param {number} amount */
  function adjustEnergy(amount) {
    s.energy = Math.max(0, Math.min(100, s.energy + amount));
    // Resting resets exhaustion surfacing
    if (amount >= 10) s.surfaced_exhaustion = 0;
  }

  /** @param {number} amount */
  function adjustStress(amount) {
    s.stress = Math.max(0, Math.min(100, s.stress + amount));
  }

  /** @param {number} amount */
  function adjustHunger(amount) {
    s.hunger = Math.max(0, Math.min(100, s.hunger + amount));
    // Eating resets hunger surfacing — next time hunger builds, it's noticed fresh
    if (amount < 0) s.surfaced_hunger = 0;
  }

  /** @param {number} amount */
  function adjustSocial(amount) {
    s.social = Math.max(0, Math.min(100, s.social + amount));
    if (amount > 0) {
      s.last_social_interaction = Timeline.getActionCount();
    }
  }

  /** @param {number} amount */
  function adjustMoney(amount) {
    s.money = Math.round((s.money + amount) * 100) / 100;
  }

  /** @param {number} amount */
  function adjustJobStanding(amount) {
    s.job_standing = Math.max(0, Math.min(100, s.job_standing + amount));
  }

  /** @param {number} amount */
  function spendMoney(amount) {
    if (s.money >= amount) {
      const before = s.money;
      adjustMoney(-amount);

      // Bank notification — qualitative balance after purchase
      const balStr = perceivedMoneyString();
      addPhoneMessage({ type: 'bank', text: 'Purchase notification. Remaining balance: ' + balStr + '.', read: false });

      // Threshold warnings
      if (before >= 50 && s.money < 50) {
        addPhoneMessage({ type: 'bank', text: 'Low balance alert.', read: false });
      } else if (before >= 20 && s.money < 20) {
        addPhoneMessage({ type: 'bank', text: 'Your account balance is very low.', read: false });
      }

      return true;
    }
    return false;
  }

  // --- Phone inbox helpers ---

  /** @param {{ type: string, text: string, read: boolean }} msg */
  function addPhoneMessage(msg) {
    s.phone_inbox.push(msg);
  }

  function getUnreadMessages() {
    return s.phone_inbox.filter(m => !m.read);
  }

  function hasUnreadMessages() {
    return s.phone_inbox.some(m => !m.read);
  }

  function markMessagesRead() {
    for (const m of s.phone_inbox) m.read = true;
  }

  // --- Observation / fidelity ---
  // The player's awareness of time and money degrades with distance
  // from when they last directly observed the value.

  function observeTime() {
    s.last_observed_time = s.time;
  }

  function observeMoney() {
    s.last_observed_money = s.money;
  }

  function glanceTime() {
    s.last_observed_time = s.time - 20;
  }

  function glanceMoney() {
    // Offset by ~$5 in the direction of last known
    const offset = s.last_observed_money > s.money ? 5 : -5;
    s.last_observed_money = s.money + offset;
  }

  function timeFidelity() {
    const elapsed = Math.abs(s.time - s.last_observed_time);
    if (elapsed < 15) return 'exact';
    if (elapsed < 45) return 'rounded';
    if (elapsed < 120) return 'vague';
    return 'sensory';
  }

  function moneyFidelity() {
    const change = Math.abs(s.money - s.last_observed_money);
    if (change < 2) return 'exact';
    if (change < 10) return 'approximate';
    if (change < 25) return 'rough';
    return 'qualitative';
  }

  // --- Perceived strings ---
  // Prose representations at each fidelity tier.

  function perceivedTimeString() {
    const fidelity = timeFidelity();
    if (fidelity === 'exact') return getTimeString();
    if (fidelity === 'rounded') return roundedTimeString();
    if (fidelity === 'vague') return vagueTimeString();
    return sensoryTimeString();
  }

  function perceivedMoneyString() {
    const fidelity = moneyFidelity();
    if (fidelity === 'exact') return '$' + Math.round(s.money);
    if (fidelity === 'approximate') return approximateMoneyString();
    if (fidelity === 'rough') return roughMoneyString();
    return qualitativeMoneyString();
  }

  function roundedTimeString() {
    // Round to nearest 15 minutes within current day
    const tod = timeOfDay();
    const rounded = Math.round(tod / 15) * 15;
    const h = Math.floor(rounded / 60) % 24;
    const m = rounded % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return 'around ' + displayH + ':' + m.toString().padStart(2, '0') + ' ' + period;
  }

  function vagueTimeString() {
    const h = getHour();
    if (h < 5) return 'the middle of the night';
    if (h < 7) return 'early morning';
    if (h < 9) return 'sometime in the morning';
    if (h < 11) return 'mid-morning';
    if (h < 13) return 'around midday';
    if (h < 15) return 'early afternoon';
    if (h < 17) return 'late afternoon';
    if (h < 19) return 'early evening';
    if (h < 21) return 'evening';
    if (h < 23) return 'late';
    return 'the middle of the night';
  }

  function sensoryTimeString() {
    const h = getHour();
    if (h < 5) return 'It feels late. Or early. Hard to tell.';
    if (h < 7) return 'The light is thin. Morning, but barely.';
    if (h < 9) return 'Morning light. You\'re not sure when exactly.';
    if (h < 12) return 'The light has shifted. Morning still, probably.';
    if (h < 15) return 'The light says afternoon.';
    if (h < 18) return 'The light has changed. Later than you thought.';
    if (h < 21) return 'It\'s getting dark. You lost track of when.';
    return 'It\'s dark. Has been for a while.';
  }

  function approximateMoneyString() {
    // Round to nearest $5
    const rounded = Math.round(s.money / 5) * 5;
    return 'around $' + rounded;
  }

  function roughMoneyString() {
    const m = s.money;
    if (m < 10) return 'not much — under ten dollars, maybe';
    if (m < 20) return 'maybe ten, fifteen dollars';
    const tens = Math.floor(m / 10) * 10;
    return 'maybe $' + tens + '-something';
  }

  function qualitativeMoneyString() {
    const mt = moneyTier();
    if (mt === 'broke') return 'almost nothing';
    if (mt === 'scraping') return 'barely anything';
    if (mt === 'tight') return 'not much';
    if (mt === 'careful') return 'some, but not a lot';
    if (mt === 'okay') return 'enough for now';
    return 'enough';
  }

  return {
    init,
    get,
    set,
    getAll,
    loadState,
    advanceTime,
    timeOfDay,
    getHour,
    getMinute,
    getTimeString,
    getDay,
    calendarDate,
    dayOfWeek,
    season,
    daysSince,
    isSameDay,
    isWorkHours,
    isLateForWork,
    wakeUp,
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
    spendMoney,
    addPhoneMessage,
    getUnreadMessages,
    hasUnreadMessages,
    markMessagesRead,
    observeTime,
    observeMoney,
    glanceTime,
    glanceMoney,
    timeFidelity,
    moneyFidelity,
    perceivedTimeString,
    perceivedMoneyString,
  };
})();
