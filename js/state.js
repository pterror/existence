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

      // Geography — latitude in degrees (-90 to 90). Everything derives from this:
      // sign → hemisphere, |lat| < 23.5 → tropical, |lat| 23.5-66.5 → temperate
      latitude: 42,

      // --- Neurochemistry (0-100 scales, hidden) ---
      // Layer 1 of emotional architecture (DESIGN-EMOTIONS.md).
      // These drift toward targets via exponential approach, giving mood inertia.
      // References: RESEARCH-HORMONES.md, REFERENCE-HORMONES.md

      // Neurotransmitters
      // Serotonin: tonic mood regulator. Half-life days. Fed by sleep quality, social, tryptophan/hunger.
      // Low serotonin → depressed mood, irritability. SSRIs block reuptake.
      // Ref: estradiol upregulates synthesis (RESEARCH-HORMONES.md Part 1)
      serotonin: 50,
      // Dopamine: reward, motivation, energy. Half-life ~12-24h.
      // Fed by energy, achievement. Depleted by chronic stress.
      // Ref: substantia nigra, D1/D2 receptors (REFERENCE-HORMONES.md)
      dopamine: 50,
      // Norepinephrine: arousal, alertness, fight-or-flight. Half-life hours.
      // Fed by stress, poor sleep quality. Adrenal medulla + locus coeruleus.
      // REM sleep occurs in NE-free environment (DESIGN-EMOTIONS.md Layer 1)
      norepinephrine: 40,
      // GABA: primary inhibitory NT. Half-life ~12-24h.
      // Chronic stress slowly depletes. ALLO is a GABA-A modulator.
      // Ref: ALLO/GABA-A withdrawal mechanism (RESEARCH-HORMONES.md Part 1)
      gaba: 55,
      // Glutamate: primary excitatory NT. Half-life days. Placeholder.
      // Ketamine targets NMDA glutamate receptors.
      glutamate: 50,
      // Beta-endorphin: endogenous opioid. Half-life ~12-24h. Placeholder.
      // Released by exercise, bonding, pain. Opioids target mu-opioid receptor.
      endorphin: 45,
      // Acetylcholine: attention, memory, neuromuscular. Half-life ~12h. Placeholder.
      // Nicotine is an acetylcholine receptor agonist.
      acetylcholine: 50,
      // Endocannabinoid (anandamide + 2-AG): mood regulation, stress buffering. Half-life ~12-24h. Placeholder.
      // Released by exercise and stress. Cannabis targets CB1/CB2 receptors.
      endocannabinoid: 50,
      // Histamine: wakefulness, arousal. Half-life hours. Diurnal — high during waking.
      // Antihistamines cause drowsiness by blocking H1 receptors.
      histamine: 50,

      // Stress axis
      // Cortisol: primary stress hormone. Diurnal rhythm (peaks AM, nadir PM).
      // CRH → ACTH → cortisol chain modeled as single output.
      // Chronic stress flattens diurnal rhythm (DESIGN-EMOTIONS.md).
      // Ref: dual hormone hypothesis — high cortisol suppresses testosterone behavioral effects (RESEARCH-HORMONES.md Part 4)
      cortisol: 50,

      // Circadian
      // Melatonin: sleep/wake regulator. Diurnal — rises in darkness, suppressed by light.
      // Pineal gland, derived from tryptophan via serotonin.
      // Ref: REFERENCE-HORMONES.md #2
      melatonin: 20,
      // Adenosine: sleep pressure. Accumulates during wakefulness, cleared by sleep.
      // Caffeine blocks adenosine receptors (A1, A2A).
      adenosine: 20,

      // Sex/reproductive hormones
      // Testosterone: diurnal rhythm (peaks 5:30-8AM, nadir ~7-8PM). 25-50% amplitude in young adults.
      // Ref: amygdala reactivity + reduced PFC coupling (RESEARCH-HORMONES.md Part 4)
      testosterone: 50,
      // DHT (dihydrotestosterone): converted from testosterone by 5α-reductase. Placeholder.
      // More potent androgen receptor agonist than testosterone.
      dht: 50,
      // Estradiol (E2): primary estrogen. Placeholder. Menstrual cycle / HRT later.
      // Upregulates serotonin synthesis, increases 5-HT2A density, reduces reuptake.
      // Ref: estradiol-serotonin link (RESEARCH-HORMONES.md Part 1)
      estradiol: 50,
      // Progesterone: placeholder. Menstrual cycle / pregnancy later.
      // Converts to allopregnanolone via 5α-reductase → 3α-HSD.
      // Ref: ALLO pathway (RESEARCH-HORMONES.md Part 1)
      progesterone: 50,
      // Allopregnanolone (ALLO): derived from progesterone. GABA-A positive allosteric modulator.
      // Placeholder. PMS/PMDD mechanism — withdrawal causes GABAergic deficit.
      // Ref: ALLO/GABA-A withdrawal (RESEARCH-HORMONES.md Part 1)
      allopregnanolone: 50,
      // LH (luteinizing hormone): placeholder. Drives sex hormone production.
      // Pre-ovulatory surge triggers ovulation.
      lh: 50,
      // FSH (follicle-stimulating hormone): placeholder. Follicle development.
      fsh: 50,

      // Bonding hormones
      // Oxytocin: social bonding, trust, anxiolytic. Placeholder.
      // Released by touch, social interaction, suckling.
      // Ref: oxytocin pulses during breastfeeding (RESEARCH-HORMONES.md Part 3)
      oxytocin: 45,
      // Prolactin: promotes well-being, calmness. Inverse relationship with dopamine. Placeholder.
      // Elevated during lactation. Suppresses HPA axis.
      // Ref: prolactin mood effects (RESEARCH-HORMONES.md Part 3)
      prolactin: 50,

      // Metabolic hormones
      // Thyroid (T3/T4 composite): metabolic rate regulator. Very slow dynamics. Placeholder.
      // Hypothyroidism → fatigue, depression, weight gain. Hyperthyroidism → anxiety, irritability.
      // Ref: REFERENCE-HORMONES.md #4, #5
      thyroid: 50,
      // Insulin: blood sugar regulation. Placeholder. Diabetes later.
      // Ref: REFERENCE-HORMONES.md polypeptide section
      insulin: 50,
      // Leptin: long-term satiety signal from adipose tissue. Placeholder.
      // High body fat → high leptin (but leptin resistance possible).
      leptin: 50,
      // Ghrelin: hunger hormone. Active — maps to hunger state.
      // Stomach produces when empty. Rises before meals, drops after eating.
      ghrelin: 40,

      // Other
      // DHEA (dehydroepiandrosterone): anti-cortisol, precursor to sex hormones. Placeholder.
      // Adrenal gland. Declines with age.
      dhea: 50,
      // hCG (human chorionic gonadotropin): pregnancy marker. Default 0.
      // Stimulates thyroid weakly (nausea in first trimester).
      // Ref: hCG/thyroid interaction (RESEARCH-HORMONES.md Part 2)
      hcg: 0,
      // Calcitriol (active vitamin D): mood effects from deficiency. Placeholder.
      // Sunlight exposure → skin synthesis. Deficiency linked to depression.
      calcitriol: 50,

      // Layer 2 — directed sentiments. Array of {target, quality, intensity}.
      // Generated at chargen, written by Character.applyToState(). Mutable during play.
      sentiments: /** @type {{ target: string, quality: string, intensity: number }[]} */ ([]),

      // Personality — raw values from character, used by emotional inertia.
      // 50/50/50 = neutral (inertia 1.0). Set by Character.applyToState().
      neuroticism: 50,    // 0-100. Higher → negative moods persist longer.
      self_esteem: 50,    // 0-100. Lower → all moods stickier.
      rumination: 50,     // 0-100. Higher → all moods stickier.

      // Sleep tracking for neurochemistry
      last_sleep_quality: 0.8,  // 0-1 quality multiplier from most recent sleep

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
      phone_inbox: /** @type {{ type: string, text: string, read: boolean, source?: string, paid?: boolean }[]} */ ([]),
      phone_silent: false,
      viewing_phone: false,
      last_msg_gen_time: 0,     // game time of last generateIncomingMessages call
      work_nagged_today: false, // reset on wake
      // Financial cycle
      pay_rate: 0,              // biweekly take-home, set from character backstory
      rent_amount: 0,           // monthly rent, from character backstory
      days_worked_this_period: 0, // tracks attendance for variable pay
      last_paycheck_day: 0,     // guard: game day of last paycheck
      last_rent_day: 0,         // guard: game day of last rent deduction
      last_utility_day: 0,      // guard: game day of last utility deduction
      last_phone_bill_day: 0,   // guard: game day of last phone bill deduction

      // Internal counters the player never sees
      actions_since_rest: 0,
      times_late_this_week: 0,
      consecutive_meals_skipped: 0,
      last_social_interaction: 0, // action count at last interaction
      friend_contact: /** @type {Record<string, number>} */ ({}), // slot → game time of last engagement

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

  /** @param {ReturnType<typeof defaults>} snapshot */
  function restoreSnapshot(snapshot) {
    s = structuredClone(snapshot);
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

    // Phone battery drains — screen-on vs standby
    const batteryDrain = s.viewing_phone ? 15 : 1;
    s.phone_battery = Math.max(0, s.phone_battery - hours * batteryDrain);

    // Social isolation increases over time without interaction
    const actionsSinceLastSocial = Timeline.getActionCount() - s.last_social_interaction;
    if (actionsSinceLastSocial > 10) {
      s.social = Math.max(0, s.social - hours * 2);
    }

    // Gradual apartment entropy
    s.apartment_mess = Math.min(100, s.apartment_mess + hours * 0.2);

    // Actions since rest
    s.actions_since_rest++;

    // Neurochemistry drift — levels approach targets with inertia
    driftNeurochemistry(hours);
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
    const absLat = Math.abs(s.latitude);

    // Tropical — wet/dry, not four seasons
    if (absLat < 23.5) {
      // Wet season aligns with the hemisphere's summer
      if (s.latitude >= 0) {
        return (month >= 4 && month <= 9) ? 'wet' : 'dry';
      }
      return (month >= 10 || month <= 3) ? 'wet' : 'dry';
    }

    // Temperate / subarctic — four seasons from calendar month
    let m = month;
    if (s.latitude < 0) {
      m = (month + 6) % 12;
    }
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'autumn';
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

  function batteryTier() {
    if (s.phone_battery <= 0) return 'dead';
    if (s.phone_battery <= 5) return 'critical';
    if (s.phone_battery <= 15) return 'low';
    return 'fine';
  }

  function moneyTier() {
    if (s.money <= 0) return 'broke';
    if (s.money < 50) return 'scraping';
    if (s.money < 200) return 'tight';
    if (s.money < 600) return 'careful';
    if (s.money < 1500) return 'okay';
    if (s.money < 5000) return 'comfortable';
    return 'cushioned';
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
    // WARNING: This is a lossy bottleneck. 28 continuous neurochemical systems
    // collapsed to one of 8 discrete strings — hard thresholds producing the
    // exact snap the neurochemistry layer exists to prevent. Fine as a coarse
    // prose-variant selector for now, but content.js should increasingly read
    // NT values directly for continuous shading. This function must not remain
    // the primary interface between state and prose.
    //
    // Primary: neurochemistry (serotonin, dopamine, NE, GABA).
    // Override: extreme physical conditions can break through.
    // Same 8 tones as before — all ~27 content.js callsites unchanged.

    const ser = s.serotonin;
    const dop = s.dopamine;
    const ne = s.norepinephrine;
    const ga = s.gaba;
    const e = s.energy;
    const st = s.stress;
    const so = s.social;

    // Physical overrides — the body breaking through neurochemistry
    if (st > 75) return 'fraying';        // acute stress overwhelms everything
    if (e <= 15 && st > 60) return 'numb'; // depleted + stressed = shutdown

    // Neurochemical fraying — NE high + GABA low = system overloaded
    if (ne > 65 && ga < 35) return 'fraying';

    // Neurochemical numb — serotonin + dopamine both very low = emotional shutdown
    if (ser < 25 && dop < 25) return 'numb';

    // Heavy — low energy + lowered serotonin, or sustained low serotonin + dopamine
    if ((e <= 25 && ser < 40) || (ser < 35 && dop < 35)) return 'heavy';

    // Hollow — low serotonin + social isolation
    if (ser < 40 && so <= 20) return 'hollow';

    // Quiet — low social engagement + moderate NE (withdrawn but not in pain)
    if (so <= 20 && ne > 35) return 'quiet';

    // Clear — serotonin high + dopamine high + NE moderate + GABA adequate (rare, earned)
    if (ser > 65 && dop > 65 && ne > 30 && ne < 60 && ga > 45) return 'clear';

    // Present — serotonin and dopamine above baseline
    if (ser > 45 && dop > 42) return 'present';

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
  function adjustBattery(amount) {
    s.phone_battery = Math.max(0, Math.min(100, s.phone_battery + amount));
  }

  /** Nudge a neurochemistry value by amount, clamped 0-100.
   * @param {string} key @param {number} amount */
  function adjustNT(key, amount) {
    if (typeof s[key] === 'number') {
      s[key] = clamp(s[key] + amount, 0, 100);
    }
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

  // --- Financial cycle helpers ---

  /**
   * Receive money (paycheck, etc). Adds amount, generates bank notification.
   * @param {number} amount
   * @param {string} source — 'paycheck' or other identifier
   * @param {string} [extraText] — optional additional note text
   */
  function receiveMoney(amount, source, extraText) {
    adjustMoney(amount);
    const balStr = perceivedMoneyString();
    let text;
    if (source === 'paycheck') {
      text = 'Direct deposit. Balance: ' + balStr + '.';
      if (extraText) text = extraText + ' Balance: ' + balStr + '.';
    } else {
      text = 'Deposit. Balance: ' + balStr + '.';
    }
    addPhoneMessage({ type: 'paycheck', text, read: false });
  }

  /**
   * Auto-deduct a bill. Handles insufficient funds.
   * @param {number} amount
   * @param {string} billName — 'rent', 'utilities', 'phone'
   * @returns {boolean} whether payment succeeded
   */
  function deductBill(amount, billName) {
    if (s.money >= amount) {
      adjustMoney(-amount);
      const balStr = perceivedMoneyString();
      addPhoneMessage({
        type: 'bill',
        text: 'Autopay \u2014 ' + billName + '. ' + balStr + ' remaining.',
        read: false,
        paid: true,
      });
      return true;
    }
    // Insufficient funds — drain to zero, bill fails
    s.money = 0;
    addPhoneMessage({
      type: 'bill',
      text: 'Payment declined \u2014 ' + billName + '. Insufficient funds.',
      read: false,
      paid: false,
    });
    adjustStress(8);
    adjustSentiment('money', 'anxiety', 0.03);
    return false;
  }

  // --- Phone inbox helpers ---

  /** @param {{ type: string, text: string, read: boolean, source?: string, paid?: boolean }} msg */
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
    const m = s.money;
    if (m < 100) {
      const rounded = Math.round(m / 5) * 5;
      return 'around $' + rounded;
    }
    if (m < 1000) {
      const rounded = Math.round(m / 10) * 10;
      return 'around $' + rounded;
    }
    const rounded = Math.round(m / 100) * 100;
    return 'around $' + rounded.toLocaleString();
  }

  function roughMoneyString() {
    const m = s.money;
    if (m < 10) return 'not much — under ten dollars, maybe';
    if (m < 100) return 'maybe $' + (Math.floor(m / 10) * 10) + '-something';
    if (m < 1000) return 'a few hundred, maybe';
    if (m < 5000) return 'a few thousand';
    return 'several thousand';
  }

  function qualitativeMoneyString() {
    const mt = moneyTier();
    if (mt === 'broke') return 'almost nothing';
    if (mt === 'scraping') return 'barely anything';
    if (mt === 'tight') return 'not much';
    if (mt === 'careful') return 'some, but not a lot';
    if (mt === 'okay') return 'enough for now';
    if (mt === 'cushioned') return 'more than enough';
    return 'enough';
  }

  // --- Sentiment helpers ---

  /** Look up a sentiment's intensity by target and quality. Returns 0 if not found. */
  function sentimentIntensity(target, quality) {
    if (!s.sentiments || !s.sentiments.length) return 0;
    for (const sent of s.sentiments) {
      if (sent.target === target && sent.quality === quality) return sent.intensity;
    }
    return 0;
  }

  /** Adjust a sentiment's intensity by amount. Finds existing or creates new entry.
   *  Entries at intensity 0 remain (sleep processing needs them). Clamped [0, 1].
   *  No PRNG consumed — deterministic and replay-safe.
   *  @param {string} target @param {string} quality @param {number} amount */
  function adjustSentiment(target, quality, amount) {
    if (!s.sentiments) s.sentiments = [];
    let found = null;
    for (const sent of s.sentiments) {
      if (sent.target === target && sent.quality === quality) { found = sent; break; }
    }
    if (!found) {
      found = { target, quality, intensity: 0 };
      s.sentiments.push(found);
    }
    found.intensity = clamp(found.intensity + amount, 0, 1);
  }

  // --- Sleep emotional processing ---
  // REM sleep attenuates sentiment deviations from character baseline.
  // Better sleep = more processing. No PRNG consumed — fully deterministic.
  // See DESIGN-EMOTIONS.md Layer 2 step: Sleep Emotional Processing.

  // Per-quality processing factors for sleep emotional processing.
  // Comfort processes fully (1.0), negative sentiments resist processing (entrenchment).
  const qualityProcessingFactor = {
    comfort: 1.0,
    satisfaction: 0.9,
    warmth: 0.85,
    guilt: 0.7,
    anxiety: 0.6,       // financial anxiety entrenches like dread
    dread: 0.6,
    irritation: 0.6,
  };
  const defaultQualityFactor = 0.8;

  /**
   * Sleep emotional processing — attenuate sentiment deviations from baseline.
   * REM sleep strips emotional charge; better sleep = more processing.
   * Three multiplicative modifiers create meaningful dynamics:
   *   - intensityFactor: high-intensity deviations resist processing
   *   - qualityFactor: negative sentiments (dread, irritation) process 40% slower
   *   - regulation: personality-dependent processing efficiency
   * @param {Array} baseSentiments - character's original sentiments (baseline)
   * @param {number} qualityMult - sleep quality (0-1+)
   * @param {number} sleepMinutes - total sleep duration
   */
  function processSleepEmotions(baseSentiments, qualityMult, sleepMinutes) {
    if (!s.sentiments || !s.sentiments.length) return;

    const durationFactor = clamp(sleepMinutes / 420, 0.3, 1.0);
    const baseRate = 0.4 * qualityMult * durationFactor;
    const regulation = regulationCapacity();

    for (const sent of s.sentiments) {
      const base = baseSentiments
        ? baseSentiments.find(cs => cs.target === sent.target && cs.quality === sent.quality)
        : null;
      const baseIntensity = base ? base.intensity : 0;
      const deviation = sent.intensity - baseIntensity;
      if (Math.abs(deviation) < 0.001) continue;

      // Intensity resistance: high deviations resist processing (squared falloff)
      const intensityFactor = Math.max(0.3, 1 - 0.7 * deviation * deviation);

      // Entrenchment: negative sentiments process slower than comfort
      const qf = qualityProcessingFactor[sent.quality] ?? defaultQualityFactor;

      const effectiveRate = baseRate * intensityFactor * qf * regulation;
      sent.intensity -= deviation * effectiveRate;
    }
  }

  // --- Friend absence effects ---
  // Friends who reach out deserve a response. Ignoring them builds guilt over time.
  // Called during sleep — guilt accumulates per night of absence, not per tick.
  // No PRNG consumed — fully deterministic.

  /**
   * Process friend absence effects during sleep.
   * For each friend: if no contact time yet, initialize to current time.
   * After 1.5 days grace period, guilt accumulates each night.
   * Unread messages from the friend intensify guilt by 40%.
   */
  function processAbsenceEffects() {
    const now = s.time;
    const inbox = s.phone_inbox;
    if (!s.friend_contact) s.friend_contact = {};

    for (const slot of ['friend1', 'friend2']) {
      let lastContact = s.friend_contact[slot];

      // First sleep: initialize contact time, skip guilt
      if (lastContact === undefined || lastContact === 0) {
        s.friend_contact[slot] = now;
        continue;
      }

      const absenceMinutes = now - lastContact;
      const absenceDays = absenceMinutes / 1440;

      // Grace period: 1.5 days
      if (absenceDays <= 1.5) continue;

      // Growth rate: base 0.005, scaling gently with duration (cap 1.6x at 14 days)
      let growth = 0.005 * Math.min(1 + absenceDays / 14, 1.6);

      // Unread messages from this friend intensify guilt
      const hasUnreadFromFriend = inbox.some(m => !m.read && m.source === slot);
      if (hasUnreadFromFriend) {
        growth *= 1.4;
      }

      adjustSentiment(slot, 'guilt', growth);
    }
  }

  // --- Neurochemistry drift engine ---
  // Exponential approach to target with asymmetric up/down rates.
  // Biological jitter via incommensurate sine waves (no PRNG consumed).
  // See DESIGN-EMOTIONS.md Layer 1.

  /** @param {number} v @param {number} lo @param {number} hi */
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /** Map value to 0–1 between lo and hi, clamped. Building block for continuous prose weights. */
  /** @param {number} value @param {number} lo @param {number} hi */
  function lerp01(value, lo, hi) {
    return clamp((value - lo) / (hi - lo), 0, 1);
  }

  /**
   * Deterministic biological noise — "some days are harder and you can't name why."
   * Two incommensurate sine frequencies with per-system phase seeds.
   * Range ±3.5. No PRNG consumed — safe for forward-compatibility.
   * @param {number} timeHours - total game hours
   * @param {number} seed - unique per system
   */
  function biologicalJitter(timeHours, seed) {
    return Math.sin(timeHours * 0.017 + seed) * 2 +
           Math.sin(timeHours * 0.0073 + seed * 1.7) * 1.5;
  }

  // --- Target functions ---
  // Active systems have target functions fed by current state.
  // Placeholder systems return baseline 50 (will gain feeders as systems are built).

  /** Serotonin target: sleep quality, social connection, hunger (tryptophan availability), sentiments */
  function serotoninTarget() {
    let t = 50;
    // Sleep quality is the strongest lever (DESIGN-EMOTIONS.md)
    const sq = s.last_sleep_quality;
    t += (sq - 0.7) * 20;  // good sleep pushes up, poor sleep pushes down
    // Social connection
    t += (s.social - 50) * 0.15;
    // Hunger reduces tryptophan availability (competes for blood-brain transport)
    if (s.hunger > 60) t -= (s.hunger - 60) * 0.2;

    // Sentiments: weather preference
    const wComfort = sentimentIntensity('weather_' + s.weather, 'comfort');
    const wIrritation = sentimentIntensity('weather_' + s.weather, 'irritation');
    t += wComfort * 4 - wIrritation * 3;

    // Sentiments: time-of-day preference
    const hour = Math.floor(timeOfDay() / 60);
    const mornComfort = sentimentIntensity('time_morning', 'comfort');
    const eveComfort = sentimentIntensity('time_evening', 'comfort');
    if (mornComfort > 0) {
      if (hour >= 6 && hour <= 11) t += mornComfort * 4;
      else if (hour >= 21) t -= mornComfort * 3;
    }
    if (eveComfort > 0) {
      if (hour >= 18 && hour <= 23) t += eveComfort * 4;
      else if (hour >= 6 && hour <= 9) t -= eveComfort * 3;
    }

    // Accumulating sentiments: work dread/satisfaction at workplace
    if (s.location === 'workplace') {
      const workDread = sentimentIntensity('work', 'dread');
      const workSat = sentimentIntensity('work', 'satisfaction');
      t -= workDread * 6;    // dread lowers serotonin target at work
      t += workSat * 3;      // satisfaction gives a small lift
    }

    // Friend guilt at home — the weight of not responding
    if (s.location && s.location.startsWith('apartment')) {
      const g1 = sentimentIntensity('friend1', 'guilt');
      const g2 = sentimentIntensity('friend2', 'guilt');
      t -= (g1 + g2) * 3;   // max ~6 points at extreme guilt toward both friends
    }

    // Financial anxiety at home — the weight of bills you haven't checked
    if (s.location && s.location.startsWith('apartment')) {
      const moneyAnx = sentimentIntensity('money', 'anxiety');
      t -= moneyAnx * 4;    // max ~3.2 at high anxiety
    }

    // Direct money level effects — being broke hurts regardless of anxiety
    const mt = moneyTier();
    if (mt === 'tight' || mt === 'scraping' || mt === 'broke') {
      // Scale: tight → -1, scraping → -2.5, broke → -3.75
      if (s.money < 200) t -= (200 - s.money) * 0.019;
    }

    return clamp(t, 15, 85);
  }

  /** Dopamine target: energy, general vitality, sentiments */
  function dopamineTarget() {
    let t = 50;
    // Energy reflects capacity for engagement
    t += (s.energy - 50) * 0.25;
    // Chronic stress depletes dopamine
    if (s.stress > 60) t -= (s.stress - 60) * 0.2;

    // Sentiments: time-of-day preference
    const hour = Math.floor(timeOfDay() / 60);
    const mornComfort = sentimentIntensity('time_morning', 'comfort');
    const eveComfort = sentimentIntensity('time_evening', 'comfort');
    if (mornComfort > 0) {
      if (hour >= 6 && hour <= 11) t += mornComfort * 3;
      else if (hour >= 21) t -= mornComfort * 2;
    }
    if (eveComfort > 0) {
      if (hour >= 18 && hour <= 23) t += eveComfort * 3;
      else if (hour >= 6 && hour <= 9) t -= eveComfort * 2;
    }

    // Accumulating sentiments: work dread/satisfaction at workplace
    if (s.location === 'workplace') {
      const workDread = sentimentIntensity('work', 'dread');
      const workSat = sentimentIntensity('work', 'satisfaction');
      t -= workDread * 5;    // dread kills motivation
      t += workSat * 4;      // satisfaction supports engagement

      // Financial anxiety at work — working for money you'll never keep
      const moneyAnx = sentimentIntensity('money', 'anxiety');
      t -= moneyAnx * 2;
    }

    return clamp(t, 15, 85);
  }

  /** Norepinephrine target: stress, sleep quality.
   *  REM sleep occurs in NE-free environment — good sleep lowers NE. */
  function norepinephrineTarget() {
    let t = 40;
    // Stress is the primary driver
    t += (s.stress - 30) * 0.3;
    // Poor sleep elevates NE (unprocessed emotional charge)
    const sq = s.last_sleep_quality;
    t -= (sq - 0.5) * 15;  // good sleep lowers, poor sleep raises
    return clamp(t, 10, 90);
  }

  /** GABA target: chronic stress slowly erodes. ALLO crosslink (placeholder). */
  function gabaTarget() {
    let t = 55;
    // Chronic stress depletes GABA (slow mechanism)
    if (s.stress > 50) t -= (s.stress - 50) * 0.15;
    // ALLO modulates GABA-A — when implemented, allopregnanolone will feed here
    return clamp(t, 20, 80);
  }

  /** Cortisol target: diurnal rhythm + stress.
   *  Peaks at ~8AM (Cortisol Awakening Response), nadir at ~midnight.
   *  Ref: RESEARCH-HORMONES.md Part 4 (dual hormone hypothesis) */
  function cortisolTarget() {
    const tod = timeOfDay();
    const hourFrac = tod / 60;
    // Diurnal curve: peak at 8, nadir at 0/24
    // Using cosine shifted so peak=8AM: cos((hour - 8) * pi/12)
    const diurnal = Math.cos((hourFrac - 8) * Math.PI / 12);
    // Map diurnal [-1,1] to [25,65]
    let t = 45 + diurnal * 20;
    // Stress pushes cortisol above rhythm
    if (s.stress > 40) t += (s.stress - 40) * 0.3;
    // Very low money — financial stress adds cortisol
    if (s.money < 50) t += 3;
    return clamp(t, 10, 95);
  }

  /** Melatonin target: rises in darkness, suppressed by light/activity.
   *  Peaks ~2-3AM, suppressed during daylight hours. */
  function melatoninTarget() {
    const tod = timeOfDay();
    const hourFrac = tod / 60;
    // Inverse of light: high at night (peak ~3AM), low during day
    // cos((hour - 3) * pi/12) peaks at 3AM
    const nocturnal = Math.cos((hourFrac - 3) * Math.PI / 12);
    // Map to [5,80]: fully suppressed during day, high at night
    return clamp(42.5 + nocturnal * 37.5, 5, 80);
  }

  /** Ghrelin target: maps directly to hunger state.
   *  Stomach produces ghrelin when empty, suppressed after eating. */
  function ghrelinTarget() {
    // Hunger 0-100 maps to ghrelin 15-85
    return 15 + (s.hunger / 100) * 70;
  }

  /** Histamine target: wakefulness signal. High during day, low at night.
   *  Ref: REFERENCE-HORMONES.md #2 (antihistamines cause drowsiness) */
  function histamineTarget() {
    const tod = timeOfDay();
    const hourFrac = tod / 60;
    // Follows wakefulness: peaks midday (~14:00), low at night
    const wake = Math.cos((hourFrac - 14) * Math.PI / 12);
    return clamp(50 + wake * 30, 10, 80);
  }

  /** Testosterone target: diurnal rhythm.
   *  Peaks 5:30-8AM, nadir ~7-8PM. 25-50% amplitude.
   *  Ref: RESEARCH-HORMONES.md Part 4 */
  function testosteroneTarget() {
    const tod = timeOfDay();
    const hourFrac = tod / 60;
    // Peaks at ~7AM: cos((hour - 7) * pi/12)
    const diurnal = Math.cos((hourFrac - 7) * Math.PI / 12);
    // ~25% amplitude around baseline: [37, 63]
    return clamp(50 + diurnal * 13, 30, 70);
  }

  // --- Rate constants ---
  // Per-system up/down rates (per hour) derived from biological half-lives.
  // Asymmetric: most systems fall faster than they rise.
  // rate = ln(2) / halflife_hours, scaled to give meaningful drift on 0-100 scale.

  const ntRates = {
    // key:        [upRate,  downRate]  — per-hour exponential approach rates
    serotonin:     [0.015,   0.025],    // days half-life — very slow
    dopamine:      [0.04,    0.06],     // ~12-24h half-life
    norepinephrine:[0.08,    0.12],     // hours half-life — responds quickly
    gaba:          [0.03,    0.05],     // ~12-24h, chronic stress mechanism is slow
    glutamate:     [0.015,   0.02],     // days half-life, placeholder
    endorphin:     [0.04,    0.06],     // ~12-24h
    acetylcholine: [0.05,    0.07],     // ~12h
    endocannabinoid:[0.04,   0.06],     // ~12-24h
    histamine:     [0.08,    0.12],     // hours — tracks wakefulness quickly
    cortisol:      [0.1,     0.15],     // diurnal — needs to follow rhythm
    melatonin:     [0.12,    0.18],     // diurnal — rises and falls with darkness
    testosterone:  [0.06,    0.08],     // diurnal rhythm, moderate speed
    dht:           [0.03,    0.04],     // slow, placeholder
    estradiol:     [0.01,    0.015],    // very slow, placeholder (cycle later)
    progesterone:  [0.01,    0.015],    // very slow, placeholder
    allopregnanolone:[0.02,  0.03],     // derived from progesterone
    lh:            [0.02,    0.03],     // placeholder
    fsh:           [0.01,    0.015],    // placeholder
    oxytocin:      [0.06,    0.1],      // short bursts, decays faster
    prolactin:     [0.03,    0.05],     // placeholder
    thyroid:       [0.005,   0.005],    // very slow — weeks timescale
    insulin:       [0.15,    0.2],      // fast — meal-responsive (placeholder)
    leptin:        [0.005,   0.008],    // very slow — body composition
    ghrelin:       [0.1,     0.15],     // fast — tracks hunger
    dhea:          [0.008,   0.01],     // slow, placeholder
    hcg:           [0.001,   0.001],    // pregnancy only, near-static
    calcitriol:    [0.005,   0.008],    // very slow — sunlight/diet
  };

  // Phase seeds for biological jitter — each system gets a unique offset
  // so their noise patterns don't correlate
  const ntPhaseSeed = {
    serotonin: 1.0, dopamine: 2.3, norepinephrine: 3.7, gaba: 4.1,
    glutamate: 5.9, endorphin: 6.4, acetylcholine: 7.2, endocannabinoid: 8.8,
    histamine: 9.3, cortisol: 10.6, melatonin: 11.1, testosterone: 12.5,
    dht: 13.2, estradiol: 14.7, progesterone: 15.3, allopregnanolone: 16.9,
    lh: 17.4, fsh: 18.0, oxytocin: 19.6, prolactin: 20.1,
    thyroid: 21.8, insulin: 22.3, leptin: 23.7, ghrelin: 24.2,
    dhea: 25.5, hcg: 26.1, calcitriol: 27.8,
  };

  // Target functions by key. Systems without active feeders use baseline 50.
  const ntTargetFns = {
    serotonin: serotoninTarget,
    dopamine: dopamineTarget,
    norepinephrine: norepinephrineTarget,
    gaba: gabaTarget,
    cortisol: cortisolTarget,
    melatonin: melatoninTarget,
    ghrelin: ghrelinTarget,
    histamine: histamineTarget,
    testosterone: testosteroneTarget,
  };

  /** Placeholder target for inactive systems — returns baseline with jitter */
  function placeholderTarget() { return 50; }

  // --- Emotional inertia (Layer 2 of DESIGN-EMOTIONS.md) ---
  // Per-character trait: how sticky moods are. Affects only the four mood-primary
  // systems (serotonin, dopamine, NE, GABA). Physiological rhythms (cortisol,
  // melatonin, etc.) are unaffected — personality doesn't change your cortisol cycle.
  //
  // Higher inertia → rate divided by more → slower drift → mood sticks.
  // Range ~0.6 (fluid) to ~1.6 (very sticky).

  // "Worse direction" per mood-primary system — the direction that represents
  // mood degradation. Neuroticism adds extra stickiness in this direction only.
  // true = falling is worse, false = rising is worse.
  const moodWorseWhenFalling = {
    serotonin: true,       // low = depressed
    dopamine: true,        // low = anhedonia
    norepinephrine: false,  // high = agitation
    gaba: true,            // low = anxiety
  };

  /**
   * Compute effective emotional inertia for a mood-primary system.
   * @param {string} _system - system name (unused for now; signature supports per-system formulas)
   * @param {boolean} isNegativeDirection - true if drifting toward "worse" mood
   * @returns {number} inertia multiplier (>1 = stickier, <1 = more fluid)
   */
  function effectiveInertia(_system, isNegativeDirection) {
    // Normalize personality to 0-1
    const n = s.neuroticism / 100;
    const seInv = 1 - (s.self_esteem / 100);  // inverted: low SE → high inertia
    const r = s.rumination / 100;

    // Base inertia: weighted combination of personality traits
    // At 50/50/50 → n=0.5, seInv=0.5, r=0.5 → weighted=0.5 → base=1.0
    // At 0/100/0 → n=0, seInv=0, r=0 → weighted=0 → base=0.6 (fluid)
    // At 100/0/100 → n=1, seInv=1, r=1 → weighted=1 → base=1.4 (sticky)
    const weighted = n * 0.5 + seInv * 0.3 + r * 0.2;
    let inertia = 0.6 + weighted * 0.8;

    // Neuroticism negative-direction bonus: negative moods stick harder
    // for neurotic characters. Up to +0.2 at neuroticism=100.
    if (isNegativeDirection) {
      inertia += n * 0.2;
    }

    // State modifiers — current conditions can increase inertia.
    // Sleep deprivation (adenosine > 60): tired brain processes mood slower.
    if (s.adenosine > 60) {
      inertia += (s.adenosine - 60) * 0.005;  // up to +0.2 at adenosine=100
    }
    // Poor sleep quality: emotional processing was impaired.
    if (s.last_sleep_quality < 0.5) {
      inertia += (0.5 - s.last_sleep_quality) * 0.3;  // up to +0.15 at quality=0
    }
    // Chronic stress: sustained stress makes mood changes harder.
    if (s.stress > 60) {
      inertia += (s.stress - 60) * 0.005;  // up to +0.2 at stress=100
    }

    return inertia;
  }

  // --- Regulation capacity (inverse of inertia for sleep processing) ---
  // Fluid characters (low neuroticism, high self-esteem, low rumination) process
  // emotions more efficiently during sleep. Sticky characters process slower.
  // Range: 0.5 (very sticky + stressed) to 1.3 (very fluid + rested).
  // At 50/50/50 personality → 1.0.

  function regulationCapacity() {
    const n = s.neuroticism / 100;
    const se = s.self_esteem / 100;
    const r = s.rumination / 100;

    // Inverse of inertia weighting: low n, high se, low r → high regulation
    // At 50/50/50 → weighted=0.5 → capacity=1.0
    // At 0/100/0 → weighted=0 → capacity=1.3 (fluid)
    // At 100/0/100 → weighted=1 → capacity=0.5 (sticky)
    const weighted = n * 0.5 + (1 - se) * 0.3 + r * 0.2;
    let capacity = 1.3 - weighted * 0.8;

    // State penalties — current conditions reduce processing capacity
    // Sleep deprivation (adenosine > 60): tired brain processes less
    if (s.adenosine > 60) {
      capacity -= (s.adenosine - 60) * 0.004;  // up to -0.16 at adenosine=100
    }
    // Chronic stress: sustained stress impairs regulation
    if (s.stress > 60) {
      capacity -= (s.stress - 60) * 0.004;  // up to -0.16 at stress=100
    }

    return clamp(capacity, 0.5, 1.3);
  }

  /**
   * Drift all neurochemistry systems toward their targets.
   * Called at end of advanceTime().
   *
   * Mechanic: exponential approach (drift)
   *   target = targetFunction() + biologicalJitter()
   *   rate = (level > target) ? downRate : upRate
   *   decay = exp(-rate * hours)
   *   level = clamp(target + (level - target) * decay, 0, 100)
   *
   * Adenosine is special: accumulates linearly during wakefulness,
   * cleared proportionally by sleep (handled in content.js sleep interaction).
   *
   * @param {number} hours
   */
  function driftNeurochemistry(hours) {
    if (hours <= 0) return;

    const timeHours = s.time / 60;

    // Adenosine: linear accumulation during wakefulness
    // (cleared proportionally by sleep in content.js)
    s.adenosine = clamp(s.adenosine + hours * 4, 0, 100);

    // All other systems: exponential drift toward target
    for (const key of Object.keys(ntRates)) {
      const targetFn = ntTargetFns[key] || placeholderTarget;
      const jitter = biologicalJitter(timeHours, ntPhaseSeed[key]);
      const target = clamp(targetFn() + jitter, 0, 100);

      const rates = ntRates[key];
      let rate = (s[key] > target) ? rates[1] : rates[0];

      // Emotional inertia: mood-primary systems have personality-dependent rate
      if (key in moodWorseWhenFalling) {
        const falling = s[key] > target;
        const worseWhenFalling = moodWorseWhenFalling[key];
        const isNegative = falling === worseWhenFalling;
        rate = rate / effectiveInertia(key, isNegative);
      }

      const decay = Math.exp(-rate * hours);
      s[key] = clamp(target + (s[key] - target) * decay, 0, 100);
    }
  }

  return {
    init,
    get,
    set,
    getAll,
    loadState,
    restoreSnapshot,
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
    batteryTier,
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
    adjustBattery,
    adjustNT,
    spendMoney,
    receiveMoney,
    deductBill,
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
    lerp01,
    sentimentIntensity,
    adjustSentiment,
    processSleepEmotions,
    processAbsenceEffects,
    regulationCapacity,
  };
})();
