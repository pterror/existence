// character.js — character schema, accessors, state application

export function createCharacter(ctx) {
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

    const State = ctx.state;
    const Timeline = ctx.timeline;

    // Calendar and geography
    State.set('start_timestamp', current.start_timestamp);
    State.set('latitude', current.latitude);

    // Personality — raw values stored in state for drift engine to read.
    // Set base values first; backstory adjustments are applied below additively.
    State.set('neuroticism', current.personality.neuroticism);
    State.set('self_esteem', current.personality.self_esteem);
    State.set('rumination', current.personality.rumination);

    // Sentiments — Layer 2 basic likes/dislikes. Start with chargen sentiments.
    State.set('sentiments', [...current.sentiments]);

    // --- Financial parameters from backstory ---
    const sim = current.financial_sim;
    State.set('money', sim.starting_money);
    // Fidelity: approximate awareness of starting balance
    State.set('last_observed_money', sim.starting_money > 100
      ? sim.starting_money - 50  // off by ~$50 at larger amounts
      : Math.max(0, sim.starting_money - 5));
    State.set('pay_rate', sim.pay_rate);
    State.set('rent_amount', sim.rent_amount);
    State.set('job_standing', sim.job_standing_start);
    // Health conditions — determines which condition systems are active
    State.set('health_conditions', current.conditions || []);
    // Sleep cycle length — personal biology (70–120 min, default 90 for legacy saves)
    State.set('sleep_cycle_length', current.sleep_cycle_length ?? 90);
    // Age — drives age-dependent physiology (N3 scaling, etc.). Default 35 for legacy saves.
    State.set('age_stage', current.age_stage ?? 35);
    // Billing cycle offsets — needed by State.nextPaycheck() / nextBillDue()
    State.set('paycheck_day_offset', current.paycheck_day_offset ?? 7);
    State.set('rent_day_offset', current.rent_day_offset ?? 1);
    State.set('utility_day_offset', current.utility_day_offset ?? 15);
    State.set('phone_bill_day_offset', current.phone_bill_day_offset ?? 20);
    State.set('ebt_day_offset', current.ebt_day_offset ?? 5);

    // EBT/SNAP — start with one month's balance if enrolled
    State.set('ebt_monthly_amount', sim.ebt_monthly_amount ?? 0);
    State.set('ebt_balance', sim.ebt_monthly_amount ?? 0);

    // Financial anxiety sentiment
    if (sim.financial_anxiety > 0.01) {
      State.adjustSentiment('money', 'anxiety', sim.financial_anxiety);
    }

    // Work sentiment from career stability
    if (sim.work_sentiment && sim.work_sentiment.intensity > 0.01) {
      State.adjustSentiment('work', sim.work_sentiment.quality, sim.work_sentiment.intensity);
    }

    // Personality adjustments from life events (additive nudges, clamped)
    if (sim.personality_adjustments) {
      const adj = sim.personality_adjustments;
      if (adj.neuroticism) {
        const n = State.get('neuroticism');
        State.set('neuroticism', Math.max(0, Math.min(100, n + adj.neuroticism)));
      }
      if (adj.self_esteem) {
        const se = State.get('self_esteem');
        State.set('self_esteem', Math.max(0, Math.min(100, se + adj.self_esteem)));
      }
    }

    // Life event sentiments (health anxiety, authority dread, etc.)
    if (current.backstory && current.backstory.life_events) {
      const lifeEventDefs = {
        medical_crisis:    { target: 'health', quality: 'anxiety', intensity: 0.1 },
        job_loss:          { target: 'work', quality: 'dread', intensity: 0.05 },
        family_help:       { target: 'family', quality: 'guilt', intensity: 0.05 },
        legal_trouble:     { target: 'authority', quality: 'dread', intensity: 0.08 },
      };
      for (const evt of current.backstory.life_events) {
        const def = lifeEventDefs[evt.type];
        if (def) {
          State.adjustSentiment(def.target, def.quality, def.intensity);
        }
      }
    }

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
}

