// world.js — locations, movement, event triggers

const World = (() => {

  // --- Location definitions ---
  // Each location has an id, connections, and travel times (in minutes)

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
  };

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

  function canTravel(destId) {
    const loc = getCurrentLocation();
    if (!loc) return false;
    return destId in loc.connections;
  }

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
        if (State.get('time') > State.get('work_shift_start') + 15) {
          State.set('times_late_this_week', State.get('times_late_this_week') + 1);
          State.adjustJobStanding(-5);
        }
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

  function checkEvents() {
    const events = [];
    const time = State.get('time');
    const hour = State.getHour();
    const location = State.get('location');

    // Alarm
    if (State.get('alarm_set') && !State.get('alarm_went_off') && time >= 6 * 60 + 30 && time < 7 * 60) {
      if (location === 'apartment_bedroom') {
        State.set('alarm_went_off', true);
        events.push('alarm');
      }
    }

    // Phone buzz — random chance, needs phone and battery
    if (State.get('has_phone') && State.get('phone_battery') > 5) {
      if (Timeline.chance(0.08)) {
        const phoneEvents = [];
        if (hour >= 9 && hour < 17 && !State.get('at_work_today') && !State.get('called_in')) {
          phoneEvents.push('phone_work_where_are_you');
        }
        if (State.get('money') < 20) {
          phoneEvents.push('phone_bill_notification');
        }
        phoneEvents.push('phone_message_friend');
        events.push(Timeline.pick(phoneEvents));
      }
    }

    // Late for work stress
    if (State.isLateForWork() && hour < 12) {
      if (Timeline.chance(0.15)) {
        events.push('late_anxiety');
      }
    }

    // Hunger pangs
    if (State.get('hunger') > 65 && Timeline.chance(0.12)) {
      events.push('hunger_pang');
    }

    // Exhaustion
    if (State.get('energy') < 15 && Timeline.chance(0.15)) {
      events.push('exhaustion_wave');
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
        events.push(Timeline.pick(['apartment_sound', 'apartment_notice']));
      }
    }

    // Street ambient
    if (location === 'street' || location === 'bus_stop') {
      if (Timeline.chance(0.08)) {
        events.push(Timeline.pick(['street_ambient', 'someone_passes']));
      }
    }

    return events;
  }

  // --- Weather ---

  function updateWeather() {
    const weathers = [
      { weight: 3, value: 'overcast' },
      { weight: 2, value: 'clear' },
      { weight: 2, value: 'grey' },
      { weight: 1, value: 'drizzle' },
    ];
    const newWeather = Timeline.weightedPick(weathers);
    State.set('weather', newWeather);
    State.set('rain', newWeather === 'drizzle');
  }

  function isInside() {
    const area = getCurrentLocation()?.area;
    return area === 'apartment' || area === 'work';
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
  };
})();
