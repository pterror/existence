// content.js — all text content, variants, events
// A world, not a script. Text carries everything.

const Content = (() => {

  // --- Relationship prose tables ---
  // Keyed on flavor archetype. Name is the only dynamic part.

  /** @type {Record<string, (name: string) => string | undefined>} */
  const friendMessages = {
    sends_things: (name) => Timeline.pick([
      `${name} sent a picture of a cat sitting in a shopping bag. No caption. None needed.`,
      `A message from ${name} — a screenshot of a tweet, no context. The kind of thing that means she was thinking of you.`,
      `${name} sent a voice memo. Fifteen seconds long. You'll listen to it later. Probably.`,
      `A link from ${name}. No message, just the link. You save it without opening it.`,
    ]),
    checks_in: (name) => Timeline.pick([
      `A message from ${name}. "Hey, you good?" You stare at it. You don't type anything back yet.`,
      `${name} texted. "Haven't heard from you." Simple. Not pushy. That makes it harder to ignore.`,
      `A text from ${name}: "Just checking in." Three words that sit there, waiting.`,
      `${name} sent a thumbs up emoji, then "thinking of you." Nothing else. Nothing else needed.`,
    ]),
    dry_humor: (name) => Timeline.pick([
      `${name} linked a video with "lmao this is you." You don't watch it yet but you save it.`,
      `${name} in the group chat, complaining about his landlord again. The usual.`,
      `A text from ${name}: "life update: still alive." You almost smile.`,
      `${name} sent a meme. It's not funny, but that's the joke. You get it.`,
    ]),
    earnest: (name) => Timeline.pick([
      `A message from ${name}. Something about a sunset. Genuine in a way you can't match right now.`,
      `${name} texted a long paragraph about their week. You read it twice. You don't reply yet.`,
      `A text from ${name}: "Saw something that reminded me of you today." It lands somewhere soft.`,
      `${name} asks how you're really doing. The "really" is doing a lot of work in that sentence.`,
    ]),
  };

  /** @type {Record<string, (name: string) => string>} */
  const friendIsolatedMessages = {
    sends_things: (name) => `Your phone buzzes. ${name}. You look at the name on the screen. You don't open it yet.`,
    checks_in: (name) => `A message from ${name}. "Hey, you good?" You stare at it. You don't type anything back yet.`,
    dry_humor: (name) => `${name} texted something. The notification sits there. You'll read it later.`,
    earnest: (name) => `Your phone buzzes. ${name}. You look at the name on the screen for a while.`,
  };

  /** @type {Record<string, (name: string) => string[]>} */
  const friendIdleThoughts = {
    sends_things: (name) => [
      `You think about messaging ${name}. You don't pick up the phone.`,
      `You try to remember the last time you talked to ${name}. Actually talked, not just reacted to something sent.`,
      `${name} would send you something if she knew. But she doesn't know, because you haven't said anything.`,
      `There's probably something from ${name} you haven't opened yet.`,
    ],
    checks_in: (name) => [
      `${name} would want to know how you're doing. That's the problem.`,
      `You could text ${name} back. The thought comes and goes.`,
      `${name} asked how you were. You said fine. That was days ago. The word just sits there.`,
      `Somewhere ${name} is going about the day, not knowing you're here, doing this. Nothing.`,
    ],
    dry_humor: (name) => [
      `Your phone is right there. ${name} texted two days ago. You still haven't answered.`,
      `You think about ${name}'s last message. You almost type something back.`,
      `${name} would have something to say about this. Something dry. You almost smile, almost.`,
      `You draft a message to ${name} in your head. It stays there.`,
    ],
    earnest: (name) => [
      `${name} would listen, if you called. You know that. It doesn't help as much as it should.`,
      `You think about ${name}. About reaching out. The thought weighs more than it should.`,
      `${name} said to call anytime. Anytime is a big word. It includes now. You don't call.`,
      `You wonder what ${name} is doing. Not enough to find out.`,
    ],
  };

  // --- Coworker prose tables ---

  /** @type {Record<string, (name: string) => string | undefined>} */
  const coworkerChatter = {
    warm_quiet: (name) => Timeline.pick([
      `"Long day, huh?" ${name}, not really expecting an answer. Never does.`,
      `"You want coffee?" ${name}, already walking to the machine, asking over a shoulder.`,
      `${name} glances over and half-smiles. Doesn't say anything. Doesn't need to.`,
      `${name} sets a cup of water near you without a word. Small.`,
    ]),
    mundane_talker: (name) => Timeline.pick([
      `${name} mentions something about the weather. You say something back. The ritual of it.`,
      `${name} is talking about a show from last night. You nod in the right places.`,
      `${name} sighs loudly at the screen. Does this about once an hour.`,
      `${name} says something about traffic this morning. You make a sound of agreement.`,
    ]),
    stressed_out: (name) => Timeline.pick([
      `${name} mutters something under their breath. Screen-related, probably.`,
      `${name} is on the phone again, voice tighter than it needs to be.`,
      `"Can you believe this?" ${name}, to no one in particular. The screen is the problem today.`,
      `${name} exhales through teeth. Something happened. Something always happens.`,
    ]),
  };

  /** @type {Record<string, (name: string) => string | undefined>} */
  const coworkerInteraction = {
    warm_quiet: (name) => Timeline.pick([
      `"Hey." ${name} looks up. "Hey." That's it. That's the whole exchange. But it happened.`,
      `${name}'s talking about a restaurant from the weekend. You ask which one. An almost-smile while describing it.`,
      `You say something to ${name}. Something small. The response is warm and brief. Enough.`,
    ]),
    mundane_talker: (name) => Timeline.pick([
      `You ask ${name} about the coffee. Same as yesterday. You nod. It's small. It's something.`,
      `${name} tells you about a sale somewhere. You listen. It's easier than not listening.`,
      `You mention the weather to ${name}. The conversation goes exactly where you'd expect. It's fine.`,
    ]),
    stressed_out: (name) => Timeline.pick([
      `You ask ${name} how it's going. The answer involves a deadline. It always involves a deadline.`,
      `${name} vents for thirty seconds about something that happened. You listen. That's what's needed.`,
      `"Don't even ask," ${name} says, before you ask. So you don't.`,
    ]),
  };

  // --- Job-specific workplace descriptions ---

  /** @type {Record<string, () => string>} */
  const workplaceDescriptions = {
    office: () => {
      const mood = State.moodTone();
      const job = State.jobTier();
      const energy = State.energyTier();
      const stress = State.stressTier();
      const tasksDone = State.get('work_tasks_done');
      const tasksExpected = State.get('work_tasks_expected');
      const time = State.timePeriod();

      let desc = '';

      if (mood === 'numb' || mood === 'heavy') {
        desc = 'The office. Fluorescent lights that make everything the same temperature of visible.';
      } else if (mood === 'fraying') {
        desc = 'The office. The sound of keyboards and the smell of someone\'s microwave lunch.';
      } else {
        desc = 'The workplace. Your desk, your screen, the sounds of other people working.';
      }

      if (job === 'at_risk') {
        desc += ' You can feel people noticing when you arrive. When you leave. What you do in between.';
      } else if (job === 'shaky') {
        desc += ' Nobody has said anything directly. That might be worse.';
      }

      if (tasksDone < tasksExpected) {
        if (energy === 'depleted' || energy === 'exhausted') {
          desc += ' There are things to do. The screen is right there. Your eyes keep sliding off it.';
        } else if (stress === 'overwhelmed') {
          desc += ' The task list exists. Looking at it feels like swallowing something solid.';
        } else {
          desc += ' Things to do on the screen. The usual.';
        }
      } else {
        desc += ' You\'ve gotten through what was expected today. The time still needs to pass.';
      }

      if (time === 'afternoon') {
        desc += ' The afternoon stretches.';
      }

      return desc;
    },

    retail: () => {
      const mood = State.moodTone();
      const job = State.jobTier();
      const energy = State.energyTier();
      const stress = State.stressTier();
      const tasksDone = State.get('work_tasks_done');
      const tasksExpected = State.get('work_tasks_expected');
      const time = State.timePeriod();

      let desc = '';

      if (mood === 'numb' || mood === 'heavy') {
        desc = 'The store. Overhead music you stopped hearing weeks ago. Fluorescent everything.';
      } else if (mood === 'fraying') {
        desc = 'The store. The music is always the same playlist. Someone is always looking for something.';
      } else {
        desc = 'The store floor. Registers, shelves, the quiet hum of the place being open.';
      }

      if (job === 'at_risk') {
        desc += ' You feel the cameras more than usual. Or maybe that\'s just you.';
      } else if (job === 'shaky') {
        desc += ' The schedule has been shorter lately. Nobody explains why.';
      }

      if (tasksDone < tasksExpected) {
        if (energy === 'depleted' || energy === 'exhausted') {
          desc += ' There\'s stock to move. Your legs already know how long you\'ve been standing.';
        } else if (stress === 'overwhelmed') {
          desc += ' The returns pile. The reshelf cart. The customer at register two who\'s been waiting.';
        } else {
          desc += ' Things to restock. The usual.';
        }
      } else {
        desc += ' The tasks are done. The shift isn\'t. You find something to look busy with.';
      }

      if (time === 'afternoon') {
        desc += ' The afternoon lull. Fewer customers, more standing.';
      }

      return desc;
    },

    food_service: () => {
      const mood = State.moodTone();
      const job = State.jobTier();
      const energy = State.energyTier();
      const stress = State.stressTier();
      const tasksDone = State.get('work_tasks_done');
      const tasksExpected = State.get('work_tasks_expected');
      const time = State.timePeriod();

      let desc = '';

      if (mood === 'numb' || mood === 'heavy') {
        desc = 'The kitchen. Grease smell baked into everything. The floor mats are the only mercy.';
      } else if (mood === 'fraying') {
        desc = 'The line. Ticket printer going. Someone calls an order. Timer beeps. All of it at once.';
      } else {
        desc = 'Behind the counter. The kitchen hum, the fryer, the steady rhythm of orders.';
      }

      if (job === 'at_risk') {
        desc += ' The manager has been watching more. Counting things. Making notes.';
      } else if (job === 'shaky') {
        desc += ' Your hours got cut last week. Nobody said why. You didn\'t ask.';
      }

      if (tasksDone < tasksExpected) {
        if (energy === 'depleted' || energy === 'exhausted') {
          desc += ' Tickets keep coming. Your hands know the work but the rest of you is somewhere else.';
        } else if (stress === 'overwhelmed') {
          desc += ' Three tickets deep and the printer isn\'t stopping. The lunch rush doesn\'t care how you feel.';
        } else {
          desc += ' Orders on the rail. The usual flow.';
        }
      } else {
        desc += ' The rush is over. Cleaning. Prep for next round. The quieter kind of work.';
      }

      if (time === 'morning' || time === 'early_morning') {
        desc += ' Morning prep. The opening routine your body does without you.';
      }

      return desc;
    },
  };

  // --- Job-specific do_work prose ---

  /** @type {Record<string, (canFocus: boolean, energy: string, stress: string) => string>} */
  const doWorkProse = {
    office: (canFocus, energy, stress) => {
      if (!canFocus && energy === 'depleted') {
        return 'You stare at the screen. Words move but they don\'t mean anything. Time passes anyway. You\'re not sure what you accomplished.';
      }
      if (!canFocus) {
        return 'You try to focus. It\'s like pushing through water. Things get done, maybe, but you couldn\'t say what exactly.';
      }
      if (stress === 'overwhelmed') {
        return 'You work through it. Each task is a small wall you have to climb. You climb them because that\'s what\'s there.';
      }
      if (energy === 'tired') {
        return 'You work. Slowly, but it happens. One thing, then the next. The clock moves.';
      }
      return 'You settle into it. The work is the work — it\'s not interesting, but your hands know what to do. Something gets finished.';
    },

    retail: (canFocus, energy, stress) => {
      if (!canFocus && energy === 'depleted') {
        return 'You stand at the register. Scan, bag, repeat. Your body does it. Your mind is somewhere behind glass.';
      }
      if (!canFocus) {
        return 'Restock, face the shelves, help someone find something. The motions happen. Whether you\'re in them is another question.';
      }
      if (stress === 'overwhelmed') {
        return '"Excuse me, do you work here?" You do. You help them. Another one. Another one after that.';
      }
      if (energy === 'tired') {
        return 'Shelves. Register. Customer. Shelves again. Your feet have their own opinion about all of this.';
      }
      return 'You work the floor. Straighten things, ring people up, answer the same three questions. It fills the time.';
    },

    food_service: (canFocus, energy, stress) => {
      if (!canFocus && energy === 'depleted') {
        return 'The ticket says what to do. Your hands do it. There\'s a gap between you and the work that\'s getting wider.';
      }
      if (!canFocus) {
        return 'Orders come in. You make them. The fryer beeps and you pull the basket. It\'s not focus, it\'s muscle memory.';
      }
      if (stress === 'overwhelmed') {
        return 'Three tickets at once. The timer. Someone needs more fries. You work through it because stopping isn\'t one of the options.';
      }
      if (energy === 'tired') {
        return 'You work the line. Plate, garnish, slide. Your back has a suggestion about when to stop. You ignore it.';
      }
      return 'The rhythm of it. Ticket comes, you make it, it goes out. When it\'s flowing like this, the time actually moves.';
    },
  };

  // --- Job-specific work_break prose ---

  /** @type {Record<string, (mood: string) => string>} */
  const workBreakProse = {
    office: (mood) => {
      if (mood === 'numb' || mood === 'hollow') {
        return 'You stand in the hallway near the water fountain. Not getting water. Just standing somewhere that isn\'t your desk.';
      }
      if (mood === 'fraying') {
        return 'You go to the bathroom and stand there. Breathe. The tiles are cool. Nobody needs anything from you for sixty seconds.';
      }
      return 'Break room. Stale coffee smell. You stand by the window and look at nothing in particular. It helps more than it should.';
    },

    retail: (mood) => {
      if (mood === 'numb' || mood === 'hollow') {
        return 'The stockroom. You lean against a shelf of product and close your eyes for a minute. Nobody comes looking.';
      }
      if (mood === 'fraying') {
        return 'You go to the back. Stand by the loading dock door. The air is different back here. Colder. Better.';
      }
      return 'You step into the break room. Plastic chair, vending machine hum. You sit. Your feet thank you silently.';
    },

    food_service: (mood) => {
      if (mood === 'numb' || mood === 'hollow') {
        return 'You step outside the back door. Concrete, dumpster, sky. It\'s not pretty but it\'s not the kitchen.';
      }
      if (mood === 'fraying') {
        return 'You lean against the walk-in cooler door. The cold on your back. Thirty seconds of something like relief.';
      }
      return 'You drink water from the plastic cup you\'ve been refilling all shift. Lean against the wall. Breathe air that isn\'t fryer grease.';
    },
  };

  // --- Job-specific work_task_appears event ---

  /** @type {Record<string, () => string | undefined>} */
  const workTaskEvent = {
    office: () => {
      State.adjustStress(3);
      return 'An email. Another thing that needs doing. It goes on the list, which is the same as all the other lists.';
    },
    retail: () => {
      State.adjustStress(3);
      return Timeline.pick([
        'The walkie crackles. Someone needs help in aisle six.',
        'A customer is waiting at the counter. Has been for a while, apparently.',
        'A delivery showed up. Boxes in the back that need to be somewhere else.',
      ]);
    },
    food_service: () => {
      State.adjustStress(3);
      return Timeline.pick([
        'The ticket printer rattles. Another order. The paper curls off the end.',
        'Someone calls out an order correction. You adjust. Again.',
        'The timer beeps. Something needs to come out of the fryer now.',
      ]);
    },
  };

  // --- Job-specific break_room_noise / ambient ---

  /** @type {Record<string, () => string | undefined>} */
  const workAmbientEvent = {
    office: () => {
      return 'Laughter from the break room. You\'re not sure about what. It drifts and fades.';
    },
    retail: () => {
      return Timeline.pick([
        'The overhead music changes to a song you know. You wish it hadn\'t.',
        'The automatic doors open and close. Open and close.',
        'A child is crying somewhere in the store. The sound carries.',
      ]);
    },
    food_service: () => {
      return Timeline.pick([
        'The exhaust fan changes pitch for a second, then settles.',
        'Someone drops a pan in the back. The clatter hangs in the air.',
        'The drive-through speaker crackles with a voice you can\'t quite make out.',
      ]);
    },
  };

  // --- Location descriptions ---
  // Each returns prose based on current state. No labels, no meters.

  const locationDescriptions = {
    apartment_bedroom: () => {
      const energy = State.energyTier();
      const time = State.timePeriod();
      const mess = State.get('apartment_mess');
      const mood = State.moodTone();

      let desc = '';

      // Time-based opening
      if (time === 'early_morning' || time === 'morning') {
        if (energy === 'depleted' || energy === 'exhausted') {
          desc = 'The room is too bright. Everything about getting up feels like a negotiation with your own body.';
        } else if (energy === 'tired') {
          desc = 'Morning light pushes through the blinds. You\'re awake, technically.';
        } else {
          desc = 'Morning. The blinds let in pale light. The day is there, waiting.';
        }
      } else if (time === 'deep_night' || time === 'night') {
        if (mood === 'numb' || mood === 'hollow') {
          desc = 'The ceiling is there. It\'s been there. You\'ve been looking at it.';
        } else if (energy === 'depleted') {
          desc = 'The bed has you. Not in a restful way — more like gravity won.';
        } else {
          desc = 'Your room in the dark. The shapes of things you know are there.';
        }
      } else if (time === 'evening') {
        if (mood === 'heavy' || mood === 'numb') {
          desc = 'The room feels smaller in the evening. The walls are close.';
        } else {
          desc = 'Evening light makes the room almost warm. Almost.';
        }
      } else {
        if (mood === 'clear') {
          desc = 'Your bedroom. Familiar, small, yours.';
        } else if (mood === 'hollow' || mood === 'quiet') {
          desc = 'Your room. The quiet is the loudest thing in it.';
        } else {
          desc = 'Your bedroom. The bed, the dresser, the window.';
        }
      }

      // Mess details
      if (mess > 70) {
        desc += ' Clothes on the floor have been there long enough to stop looking like they just fell.';
      } else if (mess > 45) {
        desc += ' A few things out of place. Not bad. Not great.';
      }

      // Alarm detail
      if (State.get('alarm_set') && !State.get('alarm_went_off')
          && (time === 'early_morning' || time === 'deep_night' || time === 'morning')) {
        desc += ' The alarm clock on the nightstand shows ' + State.getTimeString() + '.';
      }

      if (!State.get('dressed') && time !== 'deep_night' && time !== 'night') {
        desc += ' You\'re still in ' + Character.get('sleepwear') + '.';
      }

      return desc;
    },

    apartment_kitchen: () => {
      const hunger = State.hungerTier();
      const fridge = State.get('fridge_food');
      const mess = State.get('apartment_mess');
      const mood = State.moodTone();
      const time = State.timePeriod();

      let desc = '';

      if (mood === 'numb' || mood === 'heavy') {
        desc = 'The kitchen. Fluorescent light. Linoleum.';
      } else if (mood === 'clear') {
        desc = 'The kitchen. Small but functional.';
      } else {
        desc = 'The kitchen.';
      }

      // Fridge
      if (fridge === 0) {
        if (hunger === 'starving' || hunger === 'very_hungry') {
          desc += ' The fridge is empty. You checked already, but you check again.';
        } else {
          desc += ' The fridge has nothing in it worth mentioning.';
        }
      } else if (fridge === 1) {
        desc += ' There\'s something in the fridge. Not much.';
      } else if (fridge <= 3) {
        desc += ' A few things in the fridge. Enough for now.';
      } else {
        desc += ' The fridge is reasonably stocked.';
      }

      // Hunger
      if (hunger === 'starving') {
        desc += ' Your stomach has moved past complaining into something quieter and worse.';
      } else if (hunger === 'very_hungry') {
        desc += ' Standing in here makes the hunger sharper.';
      }

      // Mess
      if (mess > 60) {
        desc += ' Dishes in the sink. They\'ve been there.';
      }

      // Microwave clock — the kitchen always tells you the time
      desc += ' The microwave clock reads ' + State.getTimeString() + '.';

      // Time of day flavor
      if (time === 'morning' || time === 'early_morning') {
        desc += ' The window shows grey morning outside.';
      }

      // The door out
      desc += ' The front door is through here.';

      return desc;
    },

    apartment_bathroom: () => {
      const energy = State.energyTier();
      const mood = State.moodTone();
      const showered = State.get('showered');

      let desc = 'The bathroom. Mirror, sink, shower.';

      if (mood === 'numb' || mood === 'hollow') {
        desc = 'The bathroom. The mirror is there. You don\'t have to look.';
      } else if (mood === 'fraying') {
        desc = 'Tile walls. The faucet drips on its own schedule.';
      }

      if (!showered) {
        if (energy === 'depleted' || energy === 'exhausted') {
          desc += ' A shower would take something you\'re not sure you have.';
        } else if (energy === 'tired') {
          desc += ' A shower might help. Or it might just be one more thing.';
        } else {
          desc += ' The shower is right there.';
        }
      }

      return desc;
    },

    street: () => {
      const weather = State.get('weather');
      const time = State.timePeriod();
      const energy = State.energyTier();
      const mood = State.moodTone();

      let desc = '';

      // Weather + time
      if (weather === 'drizzle') {
        if (mood === 'heavy' || mood === 'numb') {
          desc = 'Rain. Not hard enough to be dramatic. Just enough to be one more thing.';
        } else {
          desc = 'A light drizzle. The sidewalk darkens in patches.';
        }
      } else if (weather === 'overcast') {
        desc = 'The sky is flat and grey. The kind of sky that doesn\'t commit.';
      } else if (weather === 'clear') {
        if (mood === 'clear' || mood === 'present') {
          desc = 'Clear sky. The light is honest today.';
        } else {
          desc = 'The sky is clear. It doesn\'t help as much as it should.';
        }
      } else {
        desc = 'Grey. Everything out here is some shade of grey today.';
      }

      // Time
      if (time === 'early_morning' || time === 'morning') {
        desc += ' A few people heading somewhere. Everyone is heading somewhere.';
      } else if (time === 'deep_night') {
        desc += ' Empty street. Streetlights. The occasional car.';
      } else if (time === 'evening') {
        desc += ' The light is going. People walk faster in the evening.';
      }

      // Energy
      if (energy === 'depleted' || energy === 'exhausted') {
        desc += ' The sidewalk feels longer than it is.';
      }

      desc += ' Your apartment building is behind you. The bus stop is down the block. There\'s a corner store across the way.';

      return desc;
    },

    bus_stop: () => {
      const time = State.timePeriod();
      const weather = State.get('weather');
      const energy = State.energyTier();
      const mood = State.moodTone();

      let desc = 'The bus stop. A bench, a sign, a schedule nobody trusts.';

      if (time === 'morning' || time === 'late_morning') {
        desc += ' Other people waiting. Nobody makes eye contact.';
      } else if (time === 'deep_night') {
        desc = 'The bus stop at night. The schedule says buses run until midnight. It\'s vague about what "run" means.';
      } else if (time === 'evening') {
        desc += ' Fewer people now. The ones here look like they\'re coming from the same kind of day.';
      }

      if (weather === 'drizzle') {
        desc += ' The shelter doesn\'t quite cover the bench.';
      }

      if (energy === 'depleted') {
        desc += ' The bench is the best thing here.';
      }

      if (mood === 'hollow' || mood === 'quiet') {
        desc += ' Waiting. That\'s what this place is for.';
      }

      return desc;
    },

    workplace: () => {
      const jobType = Character.get('job_type');
      const descFn = /** @type {() => string} */ (workplaceDescriptions[jobType] || workplaceDescriptions.office);
      return descFn();
    },

    corner_store: () => {
      const money = State.moneyTier();
      const hunger = State.hungerTier();
      const mood = State.moodTone();

      let desc = 'The corner store. Bright inside, that chemical-clean smell.';

      if (money === 'broke') {
        desc += ' You look at things. Looking is free.';
      } else if (money === 'scraping' || money === 'tight') {
        if (hunger === 'starving' || hunger === 'very_hungry') {
          desc += ' Everything has a price tag. You do the math without wanting to.';
        } else {
          desc += ' Shelves of things. You know what things cost here.';
        }
      } else {
        desc += ' Shelves of the usual. Bread, canned stuff, drinks.';
      }

      if (mood === 'hollow') {
        desc += ' The cashier doesn\'t look up.';
      } else {
        desc += ' The person at the register is watching something on their phone.';
      }

      return desc;
    },
  };

  // --- Interactions ---

  const interactions = {
    // === BEDROOM ===
    sleep: {
      id: 'sleep',
      label: 'Lie down',
      location: 'apartment_bedroom',
      available: () => {
        const energy = State.energyTier();
        const time = State.timePeriod();
        return energy === 'depleted' || energy === 'exhausted' || energy === 'tired'
          || time === 'night' || time === 'deep_night' || time === 'evening';
      },
      execute: () => {
        const energy = State.energyTier();
        const stress = State.stressTier();

        let sleepMinutes;
        if (energy === 'depleted') {
          sleepMinutes = Timeline.randomInt(180, 360);
        } else if (energy === 'exhausted') {
          sleepMinutes = Timeline.randomInt(120, 300);
        } else {
          sleepMinutes = Timeline.randomInt(60, 180);
        }

        let energyGain;
        if (stress === 'overwhelmed' || stress === 'strained') {
          energyGain = sleepMinutes / 10;
        } else {
          energyGain = sleepMinutes / 5;
        }

        State.adjustEnergy(energyGain);
        State.adjustStress(-sleepMinutes / 20);
        State.set('actions_since_rest', 0);
        State.advanceTime(sleepMinutes);

        const hours = Math.round(sleepMinutes / 60);

        if (energy === 'depleted') {
          if (stress === 'overwhelmed') {
            return 'You lie down and something gives way. Not quite sleep. More like your body collecting a debt. You surface ' + hours + ' hours later, not rested exactly, but less far from it.';
          }
          return 'You\'re asleep before you finish lying down. ' + hours + ' hours disappear. You wake up like coming up from deep water.';
        }

        if (stress === 'overwhelmed' || stress === 'strained') {
          return 'Sleep comes in pieces. You\'re awake, then you\'re not, then you are again and the ceiling is the same. ' + hours + ' hours of something that isn\'t quite rest.';
        }

        if (hours >= 4) {
          return 'You sleep. Actually sleep. ' + hours + ' hours that feel like they belonged to you. You wake up and the light has changed.';
        }

        return 'You close your eyes. Time passes — maybe an hour, maybe more. When you open them the room looks the same, but something shifted.';
      },
    },

    get_dressed: {
      id: 'get_dressed',
      label: 'Get dressed',
      location: 'apartment_bedroom',
      available: () => !State.get('dressed'),
      execute: () => {
        State.set('dressed', true);
        State.advanceTime(5);

        const mood = State.moodTone();
        const mess = State.get('apartment_mess');

        if (mood === 'numb' || mood === 'heavy') {
          return Character.get('outfit_low_mood');
        }
        if (mess > 60) {
          return Character.get('outfit_messy');
        }
        return Character.get('outfit_default');
      },
    },

    set_alarm: {
      id: 'set_alarm',
      label: 'Set your alarm',
      location: 'apartment_bedroom',
      available: () => {
        const time = State.timePeriod();
        return (time === 'evening' || time === 'night' || time === 'deep_night')
          && State.get('has_phone') && State.get('phone_battery') > 0;
      },
      execute: () => {
        // Set alarm relative to work shift — enough time to get ready and commute
        const shiftStart = State.get('work_shift_start');
        const alarmTime = shiftStart - 90; // 90 min before shift
        State.set('alarm_time', alarmTime);
        State.set('alarm_set', true);
        State.set('alarm_went_off', false);
        State.advanceTime(1);

        const h = Math.floor(alarmTime / 60);
        const m = alarmTime % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const timeStr = displayH + ':' + m.toString().padStart(2, '0') + ' ' + period;

        return 'You set the alarm. ' + timeStr + '. The phone screen dims.';
      },
    },

    skip_alarm: {
      id: 'skip_alarm',
      label: 'Turn off your alarm',
      location: 'apartment_bedroom',
      available: () => {
        const time = State.timePeriod();
        return State.get('alarm_set') && !State.get('alarm_went_off')
          && (time === 'evening' || time === 'night' || time === 'deep_night');
      },
      execute: () => {
        State.set('alarm_set', false);
        State.advanceTime(1);
        return 'You turn off the alarm. Tomorrow is tomorrow\'s problem.';
      },
    },

    check_phone_bedroom: {
      id: 'check_phone_bedroom',
      label: 'Check your phone',
      location: 'apartment_bedroom',
      available: () => State.get('has_phone') && State.get('phone_battery') > 0,
      execute: () => checkPhoneContent(),
    },

    // === KITCHEN ===
    eat_food: {
      id: 'eat_food',
      label: 'Eat something',
      location: 'apartment_kitchen',
      available: () => State.get('fridge_food') > 0,
      execute: () => {
        State.set('fridge_food', State.get('fridge_food') - 1);
        State.adjustHunger(-35);
        State.set('ate_today', true);
        State.set('consecutive_meals_skipped', 0);
        State.advanceTime(15);

        const hunger = State.hungerTier();
        const mood = State.moodTone();

        if (mood === 'numb') {
          return 'You eat. It goes in. You don\'t taste much of it, but your body takes it without complaint.';
        }
        if (hunger === 'starving' || hunger === 'very_hungry') {
          return 'You eat too fast. Standing at the counter, not even sitting down. It helps. It helps a lot, actually.';
        }
        return 'You put something together from what\'s there and eat it. Nothing special. It\'s enough.';
      },
    },

    drink_water: {
      id: 'drink_water',
      label: 'Glass of water',
      location: 'apartment_kitchen',
      available: () => true,
      execute: () => {
        State.adjustEnergy(2);
        State.adjustHunger(-3);
        State.advanceTime(2);

        const energy = State.energyTier();
        if (energy === 'depleted' || energy === 'exhausted') {
          return 'Water from the tap. You drink it standing at the sink. Your body wanted it more than you realized.';
        }
        return 'You fill a glass and drink it. Tap water. It\'s fine.';
      },
    },

    do_dishes: {
      id: 'do_dishes',
      label: 'Deal with the dishes',
      location: 'apartment_kitchen',
      available: () => State.get('apartment_mess') > 40 && State.get('energy') > 15,
      execute: () => {
        State.set('apartment_mess', Math.max(0, State.get('apartment_mess') - 25));
        State.set('surfaced_mess', 0);
        State.adjustEnergy(-8);
        State.adjustStress(-5);
        State.advanceTime(15);

        const mood = State.moodTone();
        if (mood === 'heavy' || mood === 'numb') {
          return 'You wash dishes. The warm water is the closest thing to comfort available right now. One thing, at least, is done.';
        }
        return 'You wash the dishes. Warm water, soap, the repetition of it. The kitchen looks a little more like someone lives here on purpose.';
      },
    },

    check_phone_kitchen: {
      id: 'check_phone_kitchen',
      label: 'Check your phone',
      location: 'apartment_kitchen',
      available: () => State.get('has_phone') && State.get('phone_battery') > 0,
      execute: () => checkPhoneContent(),
    },

    // === BATHROOM ===
    shower: {
      id: 'shower',
      label: 'Take a shower',
      location: 'apartment_bathroom',
      available: () => !State.get('showered') && State.get('energy') > 8,
      execute: () => {
        State.set('showered', true);
        State.adjustEnergy(-3);
        State.adjustStress(-8);
        State.advanceTime(15);

        const mood = State.moodTone();
        const energy = State.energyTier();

        if (mood === 'numb' || mood === 'heavy') {
          return 'The water is warm. You stand in it longer than you need to. The world outside the shower curtain can wait.';
        }
        if (energy === 'tired' || energy === 'exhausted') {
          return 'Hot water. It doesn\'t fix anything but it makes the surface of things bearable. You get out when it starts going cold.';
        }
        return 'A shower. Hot water, steam, the sound of it. You feel more like a person when you step out.';
      },
    },

    use_sink: {
      id: 'use_sink',
      label: 'Wash your face',
      location: 'apartment_bathroom',
      available: () => true,
      execute: () => {
        State.adjustEnergy(2);
        State.adjustStress(-2);
        State.advanceTime(3);

        return 'Cold water on your face. You look at yourself in the mirror, briefly. You look away.';
      },
    },

    // === STREET ===
    check_phone_street: {
      id: 'check_phone_street',
      label: 'Check your phone',
      location: 'street',
      available: () => State.get('has_phone') && State.get('phone_battery') > 0,
      execute: () => checkPhoneContent(),
    },

    sit_on_step: {
      id: 'sit_on_step',
      label: 'Sit on the step for a minute',
      location: 'street',
      available: () => State.get('energy') < 50,
      execute: () => {
        State.adjustEnergy(3);
        State.advanceTime(Timeline.randomInt(5, 12));

        const mood = State.moodTone();
        const weather = State.get('weather');

        if (weather === 'drizzle') {
          return 'You sit on the step under the awning. Rain taps the concrete. A few minutes. No one bothers you about it.';
        }
        if (mood === 'hollow' || mood === 'quiet') {
          return 'You sit. Watch people. They\'re all going places. You\'re sitting. Both of these things are fine.';
        }
        return 'You sit on the step. Just for a minute. The air is better than inside.';
      },
    },

    // === BUS STOP ===
    wait_for_bus: {
      id: 'wait_for_bus',
      label: 'Wait',
      location: 'bus_stop',
      available: () => true,
      execute: () => {
        const waitTime = Timeline.randomInt(3, 15);
        State.advanceTime(waitTime);

        const mood = State.moodTone();
        const weather = State.get('weather');

        let text = '';
        if (waitTime > 10) {
          text = 'The bus takes its time. You wait. ';
        } else {
          text = 'A few minutes. ';
        }

        if (weather === 'drizzle') {
          text += 'Rain collects on the shelter roof and drips from the edge in a line.';
        } else if (mood === 'hollow') {
          text += 'You stand there. People come and go. The bus doesn\'t, and then it does.';
        } else {
          text += 'Buses arrive when they arrive.';
        }

        return text;
      },
    },

    // === WORKPLACE ===
    do_work: {
      id: 'do_work',
      label: 'Work on what\'s in front of you',
      location: 'workplace',
      available: () => State.get('work_tasks_done') < State.get('work_tasks_expected'),
      execute: () => {
        const canFocus = State.canFocus();
        const energy = State.energyTier();
        const stress = State.stressTier();

        let timeCost, energyCost, stressEffect;

        if (canFocus) {
          timeCost = Timeline.randomInt(30, 60);
          energyCost = -10;
          stressEffect = -3;
          State.set('work_tasks_done', State.get('work_tasks_done') + 1);
        } else {
          timeCost = Timeline.randomInt(45, 90);
          energyCost = -15;
          stressEffect = 5;
          if (Timeline.chance(0.6)) {
            State.set('work_tasks_done', State.get('work_tasks_done') + 1);
          }
        }

        State.adjustEnergy(energyCost);
        State.adjustStress(stressEffect);
        State.advanceTime(timeCost);

        const jobType = Character.get('job_type');
        const proseFn = /** @type {(canFocus: boolean, energy: string, stress: string) => string} */ (doWorkProse[jobType] || doWorkProse.office);
        return proseFn(canFocus, energy, stress);
      },
    },

    work_break: {
      id: 'work_break',
      label: 'Step away for a minute',
      location: 'workplace',
      available: () => State.get('energy') < 60 || State.get('stress') > 40,
      execute: () => {
        State.adjustEnergy(5);
        State.adjustStress(-5);
        State.advanceTime(10);

        const mood = State.moodTone();
        const jobType = Character.get('job_type');
        const proseFn = /** @type {(mood: string) => string} */ (workBreakProse[jobType] || workBreakProse.office);
        return proseFn(mood);
      },
    },

    talk_to_coworker: {
      id: 'talk_to_coworker',
      label: 'Say something to someone nearby',
      location: 'workplace',
      available: () => State.get('social') < 70 && State.get('energy') > 10 && State.isWorkHours(),
      execute: () => {
        State.adjustSocial(8);
        State.adjustStress(-3);
        State.advanceTime(5);

        const social = State.socialTier();
        const mood = State.moodTone();

        // Pick a coworker
        const coworker = Timeline.chance(0.5)
          ? Character.get('coworker1')
          : Character.get('coworker2');

        if (social === 'isolated' || social === 'withdrawn') {
          return /** @type {(name: string) => string | undefined} */ (coworkerInteraction[coworker.flavor])(coworker.name);
        }
        if (mood === 'present' || mood === 'clear') {
          return /** @type {(name: string) => string | undefined} */ (coworkerInteraction[coworker.flavor])(coworker.name);
        }
        return /** @type {(name: string) => string | undefined} */ (coworkerChatter[coworker.flavor])(coworker.name);
      },
    },

    check_phone_work: {
      id: 'check_phone_work',
      label: 'Check your phone',
      location: 'workplace',
      available: () => State.get('has_phone') && State.get('phone_battery') > 0,
      execute: () => checkPhoneContent(),
    },

    // === CORNER STORE ===
    buy_groceries: {
      id: 'buy_groceries',
      label: 'Get a few things',
      location: 'corner_store',
      available: () => State.get('money') >= 8,
      execute: () => {
        const cost = Timeline.randomFloat(8, 14);
        const roundedCost = Math.round(cost * 100) / 100;

        if (!State.spendMoney(roundedCost)) {
          return 'You pick things up and put them back. The math doesn\'t work today.';
        }

        State.set('fridge_food', Math.min(6, State.get('fridge_food') + 3));
        State.advanceTime(10);
        State.glanceMoney();

        const money = State.moneyTier();

        if (money === 'scraping' || money === 'tight') {
          return 'Bread. Rice. A can of beans. You count it out at the register.';
        }
        if (money === 'broke') {
          return 'The basics. Just the basics. The receipt is a small piece of bad news.';
        }
        return 'You pick up what you need. Bread, some produce, a couple of cans. The cashier rings it up.';
      },
    },

    buy_cheap_meal: {
      id: 'buy_cheap_meal',
      label: 'Grab something to eat now',
      location: 'corner_store',
      available: () => State.get('money') >= 3,
      execute: () => {
        const cost = Timeline.randomFloat(3, 5.50);
        const roundedCost = Math.round(cost * 100) / 100;

        if (!State.spendMoney(roundedCost)) {
          return 'Not enough. You put it back.';
        }

        State.adjustHunger(-30);
        State.set('ate_today', true);
        State.set('consecutive_meals_skipped', 0);
        State.advanceTime(5);
        State.glanceMoney();

        const mood = State.moodTone();

        if (mood === 'numb' || mood === 'heavy') {
          return 'You eat it on the way out. Something wrapped in plastic from a warmer. It\'s food. It does what food does.';
        }
        return 'A sandwich from the cooler. You eat it standing outside the store. It\'s fine. It\'s enough.';
      },
    },

    browse_store: {
      id: 'browse_store',
      label: 'Look around',
      location: 'corner_store',
      available: () => true,
      execute: () => {
        State.advanceTime(5);

        const money = State.moneyTier();
        const hunger = State.hungerTier();

        if (money === 'broke') {
          return 'You walk the aisles. Everything has a number attached and the numbers all say no.';
        }
        if (hunger === 'starving' && (money === 'scraping' || money === 'tight')) {
          return 'You look at things you want and things you can afford and the overlap is very small.';
        }
        if (money === 'scraping') {
          return 'You look at the prices. You know most of them already. They haven\'t gotten better.';
        }
        return 'You walk through. The fluorescent aisles. Same stuff as always. You don\'t need anything specific, but you look.';
      },
    },
  };

  // --- Shared phone content ---
  function checkPhoneContent() {
    State.set('phone_battery', Math.max(0, State.get('phone_battery') - 2));
    State.advanceTime(3);

    const results = [];

    const supervisor = Character.get('supervisor');

    // Work message if late
    if (State.isLateForWork() && !State.get('at_work_today') && !State.get('called_in')) {
      if (Timeline.chance(0.5)) {
        results.push(`A message from your supervisor, ${supervisor.name}. "Everything okay?" Which means: where are you.`);
      }
    }

    // Bank notification — glance at money
    if (Timeline.chance(0.25)) {
      State.glanceMoney();
      const moneyStr = State.perceivedMoneyString();
      results.push('A bank notification. Balance: ' + moneyStr + '.');
    }

    // Bill notification
    if (State.get('money') < 30 && Timeline.chance(0.3)) {
      results.push('A notification from the electric company. The amount is higher than last month. It\'s always higher than last month.');
      State.adjustStress(5);
    }

    // Social message
    if (Timeline.chance(0.25)) {
      const social = State.socialTier();
      // Pick a friend
      const friend = Timeline.chance(0.5)
        ? Character.get('friend1')
        : Character.get('friend2');

      if (social === 'isolated' || social === 'withdrawn') {
        results.push(/** @type {(name: string) => string} */ (friendIsolatedMessages[friend.flavor])(friend.name));
      } else {
        results.push(/** @type {(name: string) => string | undefined} */ (friendMessages[friend.flavor])(friend.name));
      }
      State.adjustSocial(3);
    }

    // Low battery
    if (State.get('phone_battery') < 15) {
      results.push('The battery is getting low.');
    }

    if (results.length === 0) {
      // Nothing happened
      const mood = State.moodTone();
      if (mood === 'hollow' || mood === 'quiet') {
        return 'Nothing new. The screen looks at you back.';
      }
      return 'Nothing new. You put it away.';
    }

    return results.join(' ');
  }

  // --- Call in sick ---
  const callInSick = {
    id: 'call_in',
    label: 'Call in to work',
    location: null,
    available: () => {
      return State.get('has_phone') && State.get('phone_battery') > 5
        && !State.get('at_work_today') && !State.get('called_in')
        && State.isWorkHours() && State.getHour() < 12;
    },
    execute: () => {
      State.set('called_in', true);
      State.adjustJobStanding(-8);
      State.adjustStress(-10);
      State.advanceTime(5);

      const job = State.jobTier();
      if (job === 'at_risk' || job === 'shaky') {
        return 'You call. The phone rings twice. You say you\'re not coming in. The pause on the other end says more than the words that follow.';
      }
      return 'You call in. They say okay. It\'s fine. It\'s always fine, until it isn\'t.';
    },
  };

  // --- Events ---

  const eventText = {
    alarm: () => {
      State.glanceTime();
      const timeStr = State.getTimeString();
      const energy = State.energyTier();
      if (energy === 'depleted' || energy === 'exhausted') {
        return 'The alarm. ' + timeStr + '. That sound. It exists only to tell you that lying here isn\'t an option. Except it is. The snooze button is right there.';
      }
      return 'The alarm goes off. ' + timeStr + '. That sound you picked because you thought you wouldn\'t hate it. You were wrong.';
    },

    phone_work_where_are_you: () => {
      State.adjustStress(8);
      const supervisor = Character.get('supervisor');
      return `Your phone buzzes. ${supervisor.name}. "Hey, are you coming in today?" The screen waits for an answer you don't type yet.`;
    },

    phone_bill_notification: () => {
      State.adjustStress(5);
      return 'A notification slides down. Electric bill, due in four days. The number is right there. You swipe it away but the number stays.';
    },

    phone_message_friend: () => {
      State.adjustSocial(2);
      const social = State.socialTier();
      const friend = Timeline.chance(0.5)
        ? Character.get('friend1')
        : Character.get('friend2');

      if (social === 'isolated') {
        return /** @type {(name: string) => string} */ (friendIsolatedMessages[friend.flavor])(friend.name);
      }
      return /** @type {(name: string) => string | undefined} */ (friendMessages[friend.flavor])(friend.name);
    },

    late_anxiety: () => {
      const n = State.get('surfaced_late');
      State.set('surfaced_late', n + 1);
      State.adjustStress(5);
      if (n === 0) {
        return 'You\'re aware of the time. The kind of awareness that sits in your chest.';
      }
      return 'The time. It\'s still there, pressing against the inside of your ribs. You know. You already know.';
    },

    hunger_pang: () => {
      const n = State.get('surfaced_hunger');
      State.set('surfaced_hunger', n + 1);
      if (n === 0) {
        const location = World.getLocationId();
        if (location === 'workplace') {
          return 'Your stomach makes a sound. You glance around to see if anyone heard.';
        }
        return 'A wave of hunger. Not dramatic. Just your body reminding you it\'s there and it needs things.';
      }
      return 'The hunger again. Sharper this time. Your body is done being polite about it.';
    },

    exhaustion_wave: () => {
      const n = State.get('surfaced_exhaustion');
      State.set('surfaced_exhaustion', n + 1);
      if (n === 0) {
        return 'For a second everything feels heavy. Not just your body — the air, the light, the idea of doing the next thing.';
      }
      return 'Your body is making its case. The argument is getting harder to ignore.';
    },

    weather_shift: () => {
      World.updateWeather();
      const weather = State.get('weather');
      if (World.isInside()) {
        if (weather === 'drizzle') {
          return 'Rain starts outside. You hear it on the window.';
        }
        return '';
      }
      if (weather === 'drizzle') {
        return 'It starts to rain. Not hard. Just enough to matter.';
      }
      if (weather === 'clear') {
        return 'The clouds thin. Actual light comes through. It changes the look of everything.';
      }
      return 'The sky shifts. Still grey, but a different grey.';
    },

    coworker_speaks: () => {
      State.adjustSocial(3);
      const coworker = Timeline.chance(0.5)
        ? Character.get('coworker1')
        : Character.get('coworker2');
      return /** @type {(name: string) => string | undefined} */ (coworkerChatter[coworker.flavor])(coworker.name);
    },

    work_task_appears: () => {
      const jobType = Character.get('job_type');
      const fn = /** @type {() => string | undefined} */ (workTaskEvent[jobType] || workTaskEvent.office);
      return fn();
    },

    break_room_noise: () => {
      const jobType = Character.get('job_type');
      const fn = /** @type {() => string | undefined} */ (workAmbientEvent[jobType] || workAmbientEvent.office);
      return fn();
    },

    apartment_sound: () => {
      const time = State.timePeriod();
      if (time === 'deep_night' || time === 'night') {
        const sounds = [
          'A pipe knocks somewhere in the wall. The building talking to itself.',
          'The fridge hums louder for a moment, then settles.',
          'Footsteps above you. Someone else awake.',
        ];
        return Timeline.pick(sounds);
      }
      const sounds = [
        'A door shuts somewhere else in the building.',
        'Muffled TV from next door. Voices that aren\'t talking to you.',
        'The radiator clicks.',
      ];
      return Timeline.pick(sounds);
    },

    apartment_notice: () => {
      const n = State.get('surfaced_mess');
      State.set('surfaced_mess', n + 1);
      const mess = State.get('apartment_mess');
      if (mess > 70) {
        if (n === 0) {
          return 'You notice how cluttered things have gotten. When did that happen.';
        }
        return 'The apartment. You see it for a second the way a visitor would. Then you stop seeing it that way.';
      }
      if (mess > 40) {
        if (n === 0) {
          return 'A few things out of place. The kind of mess that builds without you deciding to let it.';
        }
        return 'The mess hasn\'t moved. You knew it wouldn\'t.';
      }
      return '';
    },

    street_ambient: () => {
      const time = State.timePeriod();
      const weather = State.get('weather');
      if (weather === 'drizzle') {
        return 'Car tires on wet road. That specific hiss.';
      }
      if (time === 'morning') {
        return Timeline.pick([
          'A bus goes past, full of people who look like they\'re still waking up.',
          'Someone walks a dog. The dog is more enthusiastic about it than they are.',
        ]);
      }
      return Timeline.pick([
        'Traffic. The city sound that stops being a sound if you live here long enough.',
        'A siren, far off. Moving away from you.',
      ]);
    },

    someone_passes: () => {
      const social = State.socialTier();
      if (social === 'isolated') {
        return 'Someone walks past. They don\'t see you. You\'re part of the scenery.';
      }
      return Timeline.pick([
        'Someone passes, talking on their phone. Fragments of someone else\'s life.',
        'A person walks by quickly, somewhere to be.',
        'An older woman passes and nods. You nod back. That\'s enough.',
      ]);
    },
  };

  // --- Idle thoughts ---

  /** @type {string[]} */
  const recentIdle = [];

  const idleThoughts = () => {
    const mood = State.moodTone();
    const hunger = State.hungerTier();
    const energy = State.energyTier();
    const social = State.socialTier();
    const location = World.getLocationId();

    const thoughts = [];

    // Mood-based
    if (mood === 'numb') {
      thoughts.push(
        'You\'re here. That\'s the whole thought.',
        'Time is passing. You know this because things are slightly different than before.',
        'There\'s a blankness that isn\'t peace and isn\'t pain. Just absence of the energy for either.',
        'You look at your hands. They\'re your hands. That\'s all you\'ve got.',
        'Something should be happening. Nothing is. That\'s the thing about nothing — it keeps going.',
        'Your eyes are open. That counts as being awake, technically.',
        'You\'re aware of the room. The room is not aware of you. Fair enough.',
      );
    } else if (mood === 'hollow') {
      const friend1 = Character.get('friend1');
      thoughts.push(
        `You think about calling ${friend1.name}. You don't pick up the phone.`,
        'What would you do if you could do anything. The question doesn\'t even finish forming.',
        'The silence has texture. You\'re learning its patterns.',
        'You had a thought a minute ago. It\'s gone now. It wasn\'t important. Probably.',
        'There\'s a shape where something used to matter. You can feel the outline of it.',
        'You open your mouth to say something, then realize there\'s no one to say it to. And nothing to say.',
        'A memory tries to surface. You let it sink back down.',
      );
    } else if (mood === 'heavy') {
      thoughts.push(
        'Everything takes more than it should. Even thinking about doing things.',
        'You stand still for a moment, not deciding. Just not moving yet.',
        'Gravity is personal today. It\'s working harder on you specifically.',
        'You breathe. That\'s happening. You notice it like you notice weather.',
        'The next thing. There\'s always a next thing. You look at it from a distance.',
        'Your body wants to be horizontal. Your life requires you to be vertical. The negotiation continues.',
        'You shift your weight from one foot to the other. That\'s the most you\'ve done in a while.',
        'The thought of doing something and the doing of it — there\'s a gap there. It\'s wider than usual.',
      );
    } else if (mood === 'fraying') {
      thoughts.push(
        'Your jaw is clenched. When did that start.',
        'There\'s a tightness behind your eyes. Not a headache. Just proximity to one.',
        'Something small would set you off. You can feel the edge of it.',
        'You catch yourself holding your breath. You let it out. It doesn\'t help much.',
        'Everything is a little too loud. A little too close.',
        'Your shoulders are up near your ears. You force them down. They\'ll be back.',
        'A sound from somewhere. You flinch. It was nothing.',
        'The inside of your skin feels too small for what\'s in there.',
      );
    } else if (mood === 'quiet') {
      thoughts.push(
        'It\'s quiet. It\'s been quiet. You\'re used to it, which is different from liking it.',
        'You exist in the room. The room exists around you. That\'s the arrangement.',
        'The sound of nothing. It has a frequency, if you listen long enough.',
        'You\'re here. Not going anywhere. Not coming from anywhere. Just here.',
        'A thought starts to form and doesn\'t finish. That\'s fine. It wasn\'t going anywhere.',
        'Somewhere a pipe ticks. Or a wall settles. Something structural, doing what it does.',
        'You notice yourself noticing the quiet. That\'s a layer you didn\'t need.',
        'The stillness has a weight to it. Not heavy. Just present.',
      );
    } else if (mood === 'clear' || mood === 'present') {
      thoughts.push(
        'Nothing to do. Not in a bad way. Just — nothing.',
        'The light coming through the window is doing something interesting on the wall. You watch it.',
        'A breath that feels like it belongs to you. Not many of those today.',
        'You\'re here. Actually here. Not thinking about being somewhere else.',
        'Your hands are warm. When did that happen.',
        'Something close to okay. You don\'t examine it too closely. Just let it be there.',
        'The ordinary is ordinary. That\'s enough. That\'s more than enough.',
      );
    } else {
      thoughts.push(
        'A moment. Nothing happening. Just a moment.',
        'You wait, though you\'re not sure for what.',
        'The day has a shape. You\'re somewhere in the middle of it.',
        'Nothing urgent. Nothing pulling. Just the hum of being somewhere.',
        'You\'re between things. Not in a hurry to get to the next one.',
        'The light is different than it was a while ago. Things shift without you deciding.',
        'You look around. Everything is where you left it.',
      );
    }

    // Hunger
    if (hunger === 'starving') {
      thoughts.push(
        'Your stomach has stopped asking and started insisting.',
        'The hunger is a dull weight now. Less sharp, more permanent.',
        'You think about food. Then you think about something else. Then food again.',
        'Everything you look at, you evaluate whether it\'s food. Nothing is.',
        'The emptiness in your stomach has its own gravity.',
      );
    } else if (hunger === 'very_hungry') {
      thoughts.push(
        'Food. The thought comes and goes and comes back.',
        'You could eat. The thought has an edge to it.',
        'There\'s a hollowness below your ribs. Not painful. Just insistent.',
        'You swallow. Your body notices there\'s nothing there.',
      );
    }

    // Energy
    if (energy === 'depleted') {
      thoughts.push(
        'Your eyelids are heavy. Everything is heavy.',
        'Sitting down sounds like the best idea anyone ever had.',
        'The distance between you and lying down is a math problem you keep solving.',
        'You blink and it takes longer than it should. Each one a negotiation to reopen.',
        'Your thoughts are moving through something thick. They get there. Eventually.',
      );
    }

    // Social
    if (social === 'isolated') {
      const friend1 = Character.get('friend1');
      const friend2 = Character.get('friend2');
      const f1thoughts = /** @type {(name: string) => string[]} */ (friendIdleThoughts[friend1.flavor])(friend1.name);
      const f2thoughts = /** @type {(name: string) => string[]} */ (friendIdleThoughts[friend2.flavor])(friend2.name);
      thoughts.push(...f1thoughts, ...f2thoughts);
    }

    // Filter out recently shown thoughts
    const fresh = thoughts.filter(t => !recentIdle.includes(t));
    const pool = fresh.length > 0 ? fresh : thoughts;
    const picked = Timeline.pick(pool);

    // Track recency — avoid repeats across consecutive idle periods
    if (picked) {
      recentIdle.push(picked);
      while (recentIdle.length > 4) recentIdle.shift();
    }

    return picked;
  };

  // --- Transition text ---

  /** @param {string} from @param {string} to */
  const transitionText = (from, to) => {
    const mood = State.moodTone();
    const energy = State.energyTier();

    // Kitchen has a visible clock — glance on arrival
    if (to === 'apartment_kitchen') {
      State.glanceTime();
    }

    // Within apartment
    if (World.getLocation(from)?.area === 'apartment' && World.getLocation(to)?.area === 'apartment') {
      return '';
    }

    // Leaving apartment
    if (World.getLocation(from)?.area === 'apartment' && to === 'street') {
      if (energy === 'depleted' || energy === 'exhausted') {
        return 'Getting out the door takes more than it should. But you\'re out.';
      }
      if (mood === 'heavy') {
        return 'You lock the door. The hallway, the stairs, the outside. Each one a small decision you make by making it.';
      }
      if (!State.get('dressed')) {
        return 'You step outside in ' + Character.get('sleepwear') + '. The air reminds you immediately. You don\'t go back in.';
      }
      return 'You lock up and head out.';
    }

    // Going home
    if (from === 'street' && World.getLocation(to)?.area === 'apartment') {
      if (energy === 'depleted') {
        return 'The stairs up to your apartment are the last obstacle. You clear them.';
      }
      return 'Back inside. The apartment is the same as you left it.';
    }

    // To bus stop
    if (from === 'street' && to === 'bus_stop') {
      return 'You walk to the bus stop. It\'s not far.';
    }

    // Bus ride to work
    if (from === 'bus_stop' && to === 'workplace') {
      const hour = State.getHour();
      if (hour >= 7 && hour <= 9) {
        if (mood === 'numb' || mood === 'heavy') {
          return 'The bus is full. Bodies pressed together going the same direction. You find a spot to stand and not be. Twenty minutes of that.';
        }
        return 'The morning bus. Standing room only. You wedge in and stare at the back of someone\'s jacket for twenty minutes.';
      }
      return 'The bus comes. It\'s quieter this time of day. You find a seat and watch the city slide past the window.';
    }

    // Bus ride from work
    if (from === 'workplace' && to === 'bus_stop') {
      if (energy === 'depleted' || energy === 'exhausted') {
        return 'The bus ride back. You sit and close your eyes and exist in the motion of it.';
      }
      return 'The ride back. The city in reverse. You\'re not thinking about work anymore, mostly.';
    }

    // To corner store
    if (from === 'street' && to === 'corner_store') {
      return 'The corner store\'s door chimes when you push it open.';
    }

    // From corner store
    if (from === 'corner_store' && to === 'street') {
      return 'Back outside.';
    }

    // From bus stop back to street
    if (from === 'bus_stop' && to === 'street') {
      return 'You walk back from the bus stop.';
    }

    return '';
  };

  // --- Get available interactions for current location ---

  /** @returns {Interaction[]} */
  function getAvailableInteractions() {
    const location = World.getLocationId();
    /** @type {Interaction[]} */
    const available = [];

    for (const interaction of Object.values(interactions)) {
      if (interaction.location === location && interaction.available()) {
        available.push(/** @type {Interaction} */ (interaction));
      }
    }

    // Call in sick — available anywhere
    if (callInSick.available()) {
      available.push(/** @type {Interaction} */ (callInSick));
    }

    return available;
  }

  /** @param {string} id */
  function getInteraction(id) {
    for (const interaction of Object.values(interactions)) {
      if (interaction.id === id) return interaction;
    }
    if (callInSick.id === id) return callInSick;
    return null;
  }

  // --- Awareness source functions ---

  /** @type {Record<string, () => string>} */
  const timeSources = {
    apartment_bedroom: () => 'The alarm clock on the nightstand. ' + State.getTimeString() + '.',
    apartment_kitchen: () => 'The microwave clock. ' + State.getTimeString() + '.',
    workplace: () => 'The clock on your screen. ' + State.getTimeString() + '.',
    corner_store: () => 'The clock behind the register. ' + State.getTimeString() + '.',
  };

  function getTimeSource() {
    const loc = World.getLocationId();
    const fn = timeSources[loc];
    if (fn) return fn();
    if (State.get('has_phone') && State.get('phone_battery') > 0)
      return 'You check your phone. ' + State.getTimeString() + '.';
    return null;
  }

  function getMoneySource() {
    if (State.get('has_phone') && State.get('phone_battery') > 0)
      return 'You open the banking app. $' + Math.round(State.get('money')) + '.';
    return null;
  }

  return {
    locationDescriptions,
    interactions,
    eventText,
    idleThoughts,
    transitionText,
    getAvailableInteractions,
    getInteraction,
    checkPhoneContent,
    getTimeSource,
    getMoneySource,
  };
})();
