// world.js — locations, movement, event triggers

export function createWorld(ctx) {
  const State = ctx.state;
  const Timeline = ctx.timeline;
  const Events = ctx.events;

  // --- Location definitions ---
  // Each location has an id, connections, and travel times (in minutes)

  /** @type {Record<string, LocationDef>} */
  const locations = {
    apartment_bedroom: {
      name: 'bedroom',
      area: 'apartment',
      connections: {
        apartment_kitchen: 1,
        apartment_bathroom: 1,
      },
    },
    apartment_kitchen: {
      name: 'kitchen',
      area: 'apartment',
      connections: {
        apartment_bedroom: 1,
        apartment_bathroom: 1,
        street: 2,
      },
    },
    apartment_bathroom: {
      name: 'bathroom',
      area: 'apartment',
      connections: {
        apartment_bedroom: 1,
        apartment_kitchen: 1,
      },
    },
    street: {
      name: 'street',
      area: 'outside',
      connections: {
        apartment_kitchen: 2,
        bus_stop: 3,
        corner_store: 4,
        soup_kitchen: 8,
        food_bank: 12,
      },
    },
    bus_stop: {
      name: 'bus stop',
      area: 'outside',
      connections: {
        street: 3,
        workplace: 20, // Bus ride takes time
      },
    },
    workplace: {
      name: 'workplace',
      area: 'work',
      connections: {
        bus_stop: 20,
      },
    },
    corner_store: {
      name: 'corner store',
      area: 'outside',
      connections: {
        street: 4,
      },
    },
    soup_kitchen: {
      name: 'community meal',
      area: 'outside',
      connections: {
        street: 8,
      },
    },
    food_bank: {
      name: 'food bank',
      area: 'outside',
      connections: {
        street: 12,
      },
    },
  };

  /** @param {string} id */
  function getLocation(id) {
    return locations[id] || null;
  }

  function getCurrentLocation() {
    return locations[State.get('location')];
  }

  function getLocationId() {
    return State.get('location');
  }

  function getConnections() {
    const loc = getCurrentLocation();
    if (!loc) return [];
    const connections = [];
    for (const [destId, travelTime] of Object.entries(loc.connections)) {
      const dest = locations[destId];
      if (dest) {
        connections.push({
          id: destId,
          name: dest.name,
          travelTime,
          area: dest.area,
        });
      }
    }
    return connections;
  }

  /** @param {string} destId */
  function canTravel(destId) {
    const loc = getCurrentLocation();
    if (!loc) return false;
    return destId in loc.connections;
  }

  /** @param {string} destId */
  function travelTo(destId) {
    const loc = getCurrentLocation();
    if (!loc || !loc.connections[destId]) return null;

    const travelTime = loc.connections[destId];
    const prevLocation = State.get('location');

    State.set('previous_location', prevLocation);
    State.set('location', destId);
    State.advanceTime(travelTime);

    // Travel costs energy — more if tired or hungry
    const energyCost = travelTime > 10 ? -5 : -1;
    State.adjustEnergy(energyCost);

    // Bus ride is stressful when crowded (morning/evening)
    if ((prevLocation === 'bus_stop' || destId === 'bus_stop') && travelTime >= 20) {
      const hour = State.getHour();
      if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
        State.adjustStress(3);
      }
    }

    // Arriving at work
    if (destId === 'workplace') {
      if (!State.get('at_work_today')) {
        State.set('at_work_today', true);
        // Track attendance for paycheck calculation
        State.set('days_worked_this_period', State.get('days_worked_this_period') + 1);
        const tod = State.timeOfDay();
        if (tod > State.get('work_shift_start') + 15) {
          State.set('times_late_this_week', State.get('times_late_this_week') + 1);
          State.adjustJobStanding(-5);
          Events.record('late_for_work', { minutesLate: Math.round(tod - State.get('work_shift_start')) });
        } else {
          // On time — demonstrates reliability
          State.adjustJobStanding(2);
        }
        Events.record('arrived_at_work', { late: tod > State.get('work_shift_start') + 15, minutesLate: Math.round(tod - State.get('work_shift_start')) });
      }
    }

    return {
      from: prevLocation,
      to: destId,
      travelTime,
    };
  }

  // --- Event checking ---
  // Returns events that should fire based on current state

  /** @returns {string[]} */
  function checkEvents() {
    /** @type {(string | undefined)[]} */
    const events = [];
    const tod = State.timeOfDay();
    const hour = State.getHour();
    const location = State.get('location');

    // Alarm
    const alarmTime = State.get('alarm_time');
    if (State.get('alarm_set') && !State.get('alarm_went_off') && tod >= alarmTime && tod < alarmTime + 30) {
      if (location === 'apartment_bedroom') {
        State.set('alarm_went_off', true);
        events.push('alarm');
      }
    }

    // Late for work stress — fires on crossing into late, then again when very late.
    // Deterministic: no RNG consumed. Resets each morning in wakeUp().
    if (State.isLateForWork() && hour < 12) {
      const late = State.latenessMinutes();
      const surfacedLate = State.get('surfaced_late');
      if (surfacedLate === 0) {
        events.push('late_anxiety');  // first notice — just became late
      } else if (surfacedLate === 1 && late > 30) {
        events.push('late_anxiety');  // escalation — now significantly late
      }
    }

    // Hunger pang — fires once per tier crossing (hungry → very_hungry → starving).
    // Deterministic: no RNG consumed. Resets when eating.
    const hTier = State.hungerTier();
    const lastHTier = State.get('last_surfaced_hunger_tier');
    const hungerTierRank = { hungry: 0, very_hungry: 1, starving: 2 };
    if (hTier in hungerTierRank) {
      const current = hungerTierRank[hTier];
      const last = lastHTier !== null && lastHTier in hungerTierRank ? hungerTierRank[lastHTier] : -1;
      if (current > last) {
        State.set('last_surfaced_hunger_tier', hTier);
        events.push('hunger_pang');
      }
    }

    // Exhaustion wave — fires once per tier crossing (exhausted → depleted).
    // Deterministic: no RNG consumed. Resets when energy recovers.
    const eTier = State.energyTier();
    const lastETier = State.get('last_surfaced_energy_tier');
    const energyTierRank = { exhausted: 0, depleted: 1 };
    if (eTier in energyTierRank) {
      const current = energyTierRank[eTier];
      const last = lastETier !== null && lastETier in energyTierRank ? energyTierRank[lastETier] : -1;
      if (current > last) {
        State.set('last_surfaced_energy_tier', eTier);
        events.push('exhaustion_wave');
      }
    }

    // Weather change
    if (Timeline.chance(0.03)) {
      events.push('weather_shift');
    }

    // Workplace events
    if (location === 'workplace') {
      if (Timeline.chance(0.1)) {
        events.push(Timeline.pick(['coworker_speaks', 'work_task_appears', 'break_room_noise']));
      }
    }

    // Apartment ambient
    if (locations[location]?.area === 'apartment') {
      if (Timeline.chance(0.06)) {
        const picked = Timeline.pick(['apartment_sound', 'apartment_notice']);
        // apartment_notice caps after surfacing enough — fall back to sound
        if (picked === 'apartment_notice' && State.get('surfaced_mess') >= 2) {
          events.push('apartment_sound');
        } else {
          events.push(picked);
        }
      }
    }

    // Street ambient
    if (location === 'street' || location === 'bus_stop') {
      if (Timeline.chance(0.08)) {
        events.push(Timeline.pick(['street_ambient', 'someone_passes']));
      }
    }

    return /** @type {string[]} */ (events.filter(e => e !== undefined));
  }

  // --- Weather ---

  function updateWeather() {
    const weathers = [
      { weight: 3, value: 'overcast' },
      { weight: 2, value: 'clear' },
      { weight: 2, value: 'grey' },
      { weight: 1, value: 'drizzle' },
    ];
    // Snow: only in winter when cold enough
    if (State.season() === 'winter' && State.seasonalTemperatureBaseline() <= 2) {
      weathers.push({ weight: 2, value: 'snow' });
    }
    const newWeather = Timeline.weightedPick(weathers);
    State.set('weather', newWeather);
    State.set('rain', newWeather === 'drizzle');
    // Temperature: seasonal baseline + weather offset + diurnal variation
    // (advanceTime keeps this updated continuously; updateWeather recalculates on weather change)
    const base = State.seasonalTemperatureBaseline();
    const weatherOffset = newWeather === 'drizzle' ? -3
      : newWeather === 'overcast' ? -1
      : newWeather === 'snow' ? -2
      : 0;
    State.set('temperature', Math.round((base + weatherOffset + State.diurnalTemperatureOffset()) * 10) / 10);
  }

  function isInside() {
    const area = getCurrentLocation()?.area;
    return area === 'apartment' || area === 'work';
  }

  function isHome() {
    return getCurrentLocation()?.area === 'apartment';
  }

  function isWorkplace() {
    return getCurrentLocation()?.area === 'work';
  }

  return {
    locations,
    getLocation,
    getCurrentLocation,
    getLocationId,
    getConnections,
    canTravel,
    travelTo,
    checkEvents,
    updateWeather,
    isInside,
    isHome,
    isWorkplace,
  };
}

