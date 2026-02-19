// content.js — all text content, variants, events
// A world, not a script. Text carries everything.

export function createContent(ctx) {
  const State = ctx.state;
  const Timeline = ctx.timeline;
  const Character = ctx.character;
  const World = ctx.world;
  const Events = ctx.events;
  const Dishes = ctx.dishes;
  const Linens = ctx.linens;
  const Clothing = ctx.clothing;

  // --- Relationship prose tables ---
  // Keyed on flavor archetype. Name is the only dynamic part.

  /** @type {Record<string, (name: string) => string | undefined>} */
  const friendMessages = {
    sends_things: (name) => {
      const dopa = State.get('dopamine');
      return Timeline.weightedPick([
        { weight: 1, value: `${name} sent a picture of a cat sitting in a shopping bag. No caption. None needed.` },
        { weight: 1, value: `A message from ${name} — a screenshot of a tweet, no context. The kind of thing that means she was thinking of you.` },
        { weight: 1, value: `${name} sent a voice memo. Fifteen seconds of background noise and half a laugh. That's it.` },
        { weight: 1, value: `A link from ${name}. No message, just the link. You tap it, skim two sentences, close it.` },
        // Low dopamine — the gesture doesn't land
        { weight: State.lerp01(dopa, 40, 15), value: `${name} sent something. A picture, a link — you see the notification. You don't open it. It sits there, proof that someone thought of you, and that proof does nothing.` },
      ]);
    },
    checks_in: (name) => {
      const ser = State.get('serotonin');
      return Timeline.weightedPick([
        { weight: 1, value: `A message from ${name}. "Hey, you good?" You stare at it. You don't type anything back yet.` },
        { weight: 1, value: `${name} texted. "Haven't heard from you." Simple. Not pushy. That makes it harder to ignore.` },
        { weight: 1, value: `A text from ${name}: "Just checking in." Three words that sit there, waiting.` },
        { weight: 1, value: `${name} sent a thumbs up emoji, then "thinking of you." Nothing else. Nothing else needed.` },
        // Low serotonin — the check-in is a weight
        { weight: State.lerp01(ser, 35, 15), value: `A message from ${name}. "Hey, you good?" The question lands like something you have to carry. You're not good. The lie you'd have to type is heavier than not answering.` },
      ]);
    },
    dry_humor: (name) => {
      const dopa = State.get('dopamine');
      return Timeline.weightedPick([
        { weight: 1, value: `${name} linked a video with "lmao this is you." You don't watch it yet but you save it.` },
        { weight: 1, value: `${name} in the group chat, complaining about his landlord again. The usual.` },
        { weight: 1, value: `A text from ${name}: "life update: still alive." You almost smile.` },
        { weight: 1, value: `${name} sent a meme. It's not funny, but that's the joke. You get it.` },
        // Low dopamine — the humor slides off
        { weight: State.lerp01(dopa, 40, 15), value: `${name} sent something meant to be funny. You read it. You understand that it's funny. The understanding and the feeling are in different rooms.` },
      ]);
    },
    earnest: (name) => {
      const ser = State.get('serotonin');
      return Timeline.weightedPick([
        { weight: 1, value: `A message from ${name}. Something about a sunset. Genuine in a way you can't match right now.` },
        { weight: 1, value: `${name} texted a long paragraph about their week. You read it twice. You don't reply yet.` },
        { weight: 1, value: `A text from ${name}: "Saw something that reminded me of you today." It lands somewhere soft.` },
        { weight: 1, value: `${name} asks how you're really doing. The "really" is doing a lot of work in that sentence.` },
        // Low serotonin — sincerity is unbearable
        { weight: State.lerp01(ser, 35, 15), value: `A long message from ${name}. Genuine. Open. The kind that would need you to be honest back, and that's the one thing you can't do right now. You read it and close the phone.` },
      ]);
    },
  };

  /** @type {Record<string, (name: string) => string>} */
  const friendIsolatedMessages = {
    sends_things: (name) => `Your phone buzzes. ${name}. You look at the name on the screen. You don't open it yet.`,
    checks_in: (name) => `A message from ${name}. "Hey, you good?" You stare at it. You don't type anything back yet.`,
    dry_humor: (name) => `${name} texted something. The notification sits there. You'll read it later.`,
    earnest: (name) => `Your phone buzzes. ${name}. You look at the name on the screen for a while.`,
  };

  /** @type {Record<string, (name: string) => string>} */
  const friendReplyProse = {
    sends_things: (name) => {
      const dopa = State.get('dopamine');
      return Timeline.weightedPick([
        { weight: 1, value: `You tap back a reaction. Quick. ${name} will know you saw it.` },
        { weight: 1, value: `You send something small — two characters, an emoji. The effort is almost nothing, which is the only way it could have happened.` },
        { weight: State.lerp01(dopa, 40, 15), value: `You send a single character back. The effort it takes is out of proportion to how small it is.` },
      ]);
    },
    checks_in: (name) => {
      const ser = State.get('serotonin');
      return Timeline.weightedPick([
        { weight: 1, value: `You type "yeah, I'm good." You're not sure if it's true. You hit send before you can second-guess it.` },
        { weight: 1, value: `"Been busy." Not a lie, exactly. You send it.` },
        { weight: State.lerp01(ser, 35, 15), value: `You stare at the text field for a moment. "Sorry, been a lot going on." Vague enough to be true. You send it before you can revise it into nothing.` },
      ]);
    },
    dry_humor: (_name) => {
      const dopa = State.get('dopamine');
      return Timeline.weightedPick([
        { weight: 1, value: `You type something brief. He'll understand what it means.` },
        { weight: 1, value: `You send a meme back, or one word, or not much. He doesn't need more than that.` },
        { weight: State.lerp01(dopa, 40, 15), value: `You send something back. It comes out flat, but that's fine — he doesn't require anything more.` },
      ]);
    },
    earnest: (name) => {
      const ser = State.get('serotonin');
      return Timeline.weightedPick([
        { weight: 1, value: `You write back. It takes a minute — ${name} put thought into hers, and you want to give it some.` },
        { weight: 1, value: `You compose a reply. Not long, but honest. You send it.` },
        { weight: State.lerp01(ser, 35, 15), value: `You write something short. It doesn't feel like enough. You send it anyway.` },
      ]);
    },
  };

  /** @type {Record<string, (name: string) => string>} */
  const friendReplyMessages = {
    sends_things: (name) => Timeline.weightedPick([
      { weight: 1, value: `${name} responds immediately. A follow-up — she had it ready. The thread continues on its own terms.` },
      { weight: 1, value: `${name} sends a thumbs up, then a voice note. Three seconds. The sound of her laughing at something off-screen.` },
      { weight: 1, value: `Another thing from ${name}. She had this one saved. The conversation is alive again.` },
    ]),
    checks_in: (name) => Timeline.weightedPick([
      { weight: 1, value: `${name}: "Good. Just wanted to make sure." Then, a beat later: "Let me know if you need anything."` },
      { weight: 1, value: `A response from ${name}. "Okay good. Miss you." Short. Means what it says.` },
      { weight: 1, value: `${name} replies quickly. "okay good :)" And then nothing, which is exactly right.` },
    ]),
    dry_humor: (name) => Timeline.weightedPick([
      { weight: 1, value: `${name} sends a meme back. Different one. No explanation needed.` },
      { weight: 1, value: `His response: two words. The whole exchange is complete.` },
      { weight: 1, value: `"lmao" from ${name}. That's it. Conversation finished.` },
    ]),
    earnest: (name) => Timeline.weightedPick([
      { weight: 1, value: `A longer reply from ${name}. She's glad you reached out. She asks a follow-up question — gentle, not pushy. You could answer it or leave it there.` },
      { weight: 1, value: `${name} responds warmly. The kind of message that doesn't ask for anything. You feel slightly less alone.` },
      { weight: 1, value: `${name}: "I've been thinking about you." Two more sentences. Genuine. No pressure in it.` },
    ]),
  };

  /** @type {Record<string, (name: string) => string>} */
  const friendInitiateProse = {
    sends_things: (name) => {
      const dopa = State.get('dopamine');
      return Timeline.weightedPick([
        { weight: 1, value: `You scroll until something stands out. You forward it without a caption. ${name} will know what it means.` },
        { weight: 1, value: `You find a thing — something she'd like, probably — and send it before you think about it too hard.` },
        { weight: 1, value: `You share something. A picture, a link. The sending takes a second. Small, but it goes out.` },
        // Low dopamine — the gesture feels hollow
        { weight: State.lerp01(dopa, 40, 15), value: `You find a thing and forward it. The act is flatter than you want it to be, but it goes out.` },
      ]);
    },
    checks_in: (_name) => {
      const ser = State.get('serotonin');
      return Timeline.weightedPick([
        { weight: 1, value: `You type "hey." You delete the rest. The "hey" is enough.` },
        { weight: 1, value: `You open the thread. Two words. Something small. You send it.` },
        { weight: 1, value: `You check in. Brief. Just enough to say you're still here.` },
        // Low serotonin — even small words are hard
        { weight: State.lerp01(ser, 35, 15), value: `You open the thread. The cursor blinks. You draft three things and delete them. What you finally send is the smallest version of what you meant. You hit send before you can take it back.` },
      ]);
    },
    dry_humor: (name) => {
      const dopa = State.get('dopamine');
      return Timeline.weightedPick([
        { weight: 1, value: `You send the thing you've had sitting in another tab for two days. ${name} will get it.` },
        { weight: 1, value: `You type something stupid and send it before you can second-guess yourself.` },
        { weight: 1, value: `A meme, or a link, or just a line. Something dumb and specific enough to count. Sent.` },
        // Low dopamine — sending without feeling
        { weight: State.lerp01(dopa, 40, 15), value: `You send something. It goes out. You watch the delivered receipt appear and feel nothing particular about it. But it's sent.` },
      ]);
    },
    earnest: (name) => {
      const ser = State.get('serotonin');
      return Timeline.weightedPick([
        { weight: 1, value: `You open ${name}'s thread. You write something — not everything, just enough. You send it.` },
        { weight: 1, value: `You type. Delete half of it. What you send is shorter but truer for it.` },
        { weight: 1, value: `You start writing and don't stop until it's done. You read it once and send it before you revise it into nothing.` },
        // Low serotonin — the words don't want to come
        { weight: State.lerp01(ser, 35, 15), value: `You open the thread and stare at it for a while. The things you want to say are too big. You write something small and true and send it before you change your mind.` },
      ]);
    },
  };

  /** @type {Record<string, (name: string) => string>} */
  const friendInitiateMessages = {
    sends_things: (name) => Timeline.weightedPick([
      { weight: 1, value: `${name} responds immediately. She had something saved, ready. The thread is alive now.` },
      { weight: 1, value: `A reaction from ${name}, then a follow-up. She's been keeping things to send you.` },
      { weight: 1, value: `${name} sends something back — a picture, a voice note. The exchange has started.` },
    ]),
    checks_in: (name) => Timeline.weightedPick([
      { weight: 1, value: `${name}: "Hey! So good to hear from you." You can feel the genuineness of it.` },
      { weight: 1, value: `A quick reply from ${name}. "I was just thinking about you." Probably true.` },
      { weight: 1, value: `${name} responds fast. "Hi! How are you?" Like she'd been waiting for an opening.` },
    ]),
    dry_humor: (name) => Timeline.weightedPick([
      { weight: 1, value: `${name} sends something back immediately. Two words. The whole exchange is symmetrical.` },
      { weight: 1, value: `He responds. Something brief and dry. He understood.` },
      { weight: 1, value: `"lmao" from ${name}, and then something else. He was waiting for you to say something first.` },
    ]),
    earnest: (name) => Timeline.weightedPick([
      { weight: 1, value: `A longer reply from ${name}. She's glad you reached out — she says so plainly, which is her way.` },
      { weight: 1, value: `${name} responds warmly. She asks a follow-up question. Gentle, not demanding.` },
      { weight: 1, value: `${name}: "I've been thinking about you." And then more. She had things to say.` },
    ]),
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

  /** @type {Record<string, (name: string) => string[]>} */
  const friendGuiltThoughts = {
    sends_things: (name) => [
      `${name} sent you something. Days ago. You still haven't opened it. The notification just sits there, getting heavier.`,
      `You think about how easy it would be to just reply to ${name}. One line. Anything. But the gap has its own weight now.`,
      `${name} keeps reaching out. You keep not answering. The asymmetry of it — she hasn't stopped, and you haven't started.`,
      `You could open what ${name} sent. You almost do. Then the thought of all the ones before it, unanswered, stops your hand.`,
    ],
    checks_in: (name) => [
      `${name} asked how you were. That was — how long ago? The silence since then is its own answer.`,
      `You think about ${name}. About the message you haven't replied to. The one before that. The gap is becoming a thing with edges.`,
      `${name} checks in because that's what ${name} does. You don't reply because that's what you do. The pattern is settling into something permanent.`,
      `The longer you don't answer ${name}, the harder the answering gets. You know this. It doesn't help.`,
    ],
    dry_humor: (name) => [
      `${name} texted. You read it, almost laughed, almost replied. Almost is doing a lot of work in that sentence.`,
      `You owe ${name} a reply. Several, actually. They're stacking up in a way that makes each one harder to send than the last.`,
      `${name} would make a joke about how long it's been. That's the problem — you can already hear it, and it's easier to avoid than to face.`,
      `The draft you keep composing to ${name} in your head never makes it to your hands. Something about putting it in writing makes the silence before it too visible.`,
    ],
    earnest: (name) => [
      `${name} said to reach out anytime. The word "anytime" has a shelf life, and you're testing it.`,
      `You think about ${name} waiting. Not dramatically — just the small background fact of someone who cared and got nothing back.`,
      `${name} would understand if you explained. But explaining means starting, and starting means acknowledging how long it's been.`,
      `The thing about ${name} is that the kindness makes it worse. It would be easier to ignore someone who didn't mean it.`,
    ],
  };

  // --- Coworker prose tables ---

  /** @type {Record<string, (name: string) => string | undefined>} */
  // Coworker sentiment lookup — called from chatter/interaction functions.
  // Requires the slot ('coworker1'/'coworker2') to be passed, but the chatter
  // tables are keyed by flavor and only receive name. So we read both slots and
  // match by name — imperfect but correct since names are unique per character.
  function coworkerSlotByName(name) {
    const c1 = Character.get('coworker1');
    if (c1 && c1.name === name) return 'coworker1';
    return 'coworker2';
  }

  const coworkerChatter = {
    warm_quiet: (name) => {
      const ser = State.get('serotonin');
      const slot = coworkerSlotByName(name);
      const irr = State.sentimentIntensity(slot, 'irritation');
      return Timeline.weightedPick([
        { weight: 1, value: `"Long day, huh?" ${name}, not really expecting an answer. Never does.` },
        { weight: 1, value: `"You want coffee?" ${name}, already walking to the machine, asking over a shoulder.` },
        { weight: 1, value: `${name} glances over and half-smiles. Doesn't say anything. Doesn't need to.` },
        { weight: 1, value: `${name} sets a cup of water near you without a word. Small.` },
        // Higher serotonin — the small gesture lands
        { weight: State.lerp01(ser, 45, 65), value: `${name} looks over. Half-smile. Something about it — the lack of expectation, the ease — actually reaches you. A small warm thing that doesn't ask anything back.` },
        // Accumulated irritation — even quiet warmth grates
        { weight: irr * 1.5, value: `${name} glances over. The half-smile. The quiet gesture. It shouldn't bother you — it's kind, you know it's kind — but something about the ease of it lands wrong today.` },
      ]);
    },
    mundane_talker: (name) => {
      const ne = State.get('norepinephrine');
      const slot = coworkerSlotByName(name);
      const irr = State.sentimentIntensity(slot, 'irritation');
      const wrm = State.sentimentIntensity(slot, 'warmth');
      return Timeline.weightedPick([
        { weight: 1, value: `${name} mentions something about the weather. You say something back. The ritual of it.` },
        { weight: 1, value: `${name} is talking about a show from last night. You nod in the right places.` },
        { weight: 1, value: `${name} sighs loudly at the screen. Does this about once an hour.` },
        { weight: 1, value: `${name} says something about traffic this morning. You make a sound of agreement.` },
        // High NE — the chatter grates
        { weight: State.lerp01(ne, 55, 75), value: `${name} is talking. About what, you've lost track — the words arrive one at a time, each one landing on the last nerve you have. You nod. You can't stop nodding.` },
        // Accumulated irritation — the voice itself is the problem
        { weight: irr * 1.5, value: `${name} starts talking and you feel your jaw tighten before the first sentence lands. The voice. The cadence. You've heard it so many times that the sound itself carries weight.` },
        // Accumulated warmth — the ritual has ease
        { weight: wrm * 1.2, value: `${name} says something about nothing in particular. You say something back. There's a shorthand to it now — the rhythm of two people who've had this exchange enough times that it doesn't need to mean anything to matter.` },
      ]);
    },
    stressed_out: (name) => {
      const gaba = State.get('gaba');
      const slot = coworkerSlotByName(name);
      const irr = State.sentimentIntensity(slot, 'irritation');
      return Timeline.weightedPick([
        { weight: 1, value: `${name} mutters something under their breath. Screen-related, probably.` },
        { weight: 1, value: `${name} is on the phone again, voice tighter than it needs to be.` },
        { weight: 1, value: `"Can you believe this?" ${name}, to no one in particular. The screen is the problem today.` },
        { weight: 1, value: `${name} exhales through teeth. Something happened. Something always happens.` },
        // Low GABA — their stress is contagious
        { weight: State.lerp01(gaba, 40, 20), value: `${name} is tense — you can feel it from here. The tight voice, the sharp movements. Your own shoulders climb in response. Other people's stress is a frequency and you're tuned to it.` },
        // Accumulated irritation — their stress is a personal offense now
        { weight: irr * 1.5, value: `${name} is stressed again. Of course ${name} is stressed. ${name} is always stressed, and somehow it always becomes your problem — the sighing, the muttering, the tight little sounds that land in your space like they own it.` },
      ]);
    },
  };

  /** @type {Record<string, (name: string) => string | undefined>} */
  const coworkerInteraction = {
    warm_quiet: (name) => {
      const ser = State.get('serotonin');
      const slot = coworkerSlotByName(name);
      const wrm = State.sentimentIntensity(slot, 'warmth');
      return Timeline.weightedPick([
        { weight: 1, value: `"Hey." ${name} looks up. "Hey." That's it. That's the whole exchange. But it happened.` },
        { weight: 1, value: `${name}'s talking about a restaurant from the weekend. You ask which one. An almost-smile while describing it.` },
        { weight: 1, value: `You say something to ${name}. Something small. The response is warm and brief. Enough.` },
        // Higher serotonin — the exchange has warmth
        { weight: State.lerp01(ser, 45, 65), value: `You and ${name} exchange a few words. Nothing important. But the rhythm of it — the easy back and forth, the pauses that aren't awkward — is like a small door opening.` },
        // Accumulated warmth — there's history in the ease
        { weight: wrm * 1.5, value: `You and ${name} talk for a minute. The ease of it — knowing what they'll say, knowing they won't ask too much — has the texture of something built from a lot of small moments. Recognition, not performance.` },
      ]);
    },
    mundane_talker: (name) => {
      const aden = State.get('adenosine');
      const slot = coworkerSlotByName(name);
      const wrm = State.sentimentIntensity(slot, 'warmth');
      const irr = State.sentimentIntensity(slot, 'irritation');
      return Timeline.weightedPick([
        { weight: 1, value: `You ask ${name} about the coffee. Same as yesterday. You nod. It's small. It's something.` },
        { weight: 1, value: `${name} tells you about a sale somewhere. You listen. It's easier than not listening.` },
        { weight: 1, value: `You mention the weather to ${name}. The conversation goes exactly where you'd expect. It's fine.` },
        // High adenosine — you drift through the interaction
        { weight: State.lerp01(aden, 50, 70), value: `${name} is saying something. You catch every third word — enough to nod, enough to make the right face. The rest dissolves. You're here but the fog is doing most of the work.` },
        // Accumulated irritation — everything they say costs you
        { weight: irr * 1.5, value: `You say something to ${name}. They respond at length. You knew they would. You always know they will. Every word takes something from you that you can't name.` },
        // Accumulated warmth — the mundane has become familiar
        { weight: wrm * 1.2, value: `${name} tells you something you've heard before. But there's something in the telling — the unselfconsciousness of it, the assumption that you're listening — that's become its own kind of comfort.` },
      ]);
    },
    stressed_out: (name) => {
      const ne = State.get('norepinephrine');
      const slot = coworkerSlotByName(name);
      const irr = State.sentimentIntensity(slot, 'irritation');
      return Timeline.weightedPick([
        { weight: 1, value: `You ask ${name} how it's going. The answer involves a deadline. It always involves a deadline.` },
        { weight: 1, value: `${name} vents for thirty seconds about something that happened. You listen. That's what's needed.` },
        { weight: 1, value: `"Don't even ask," ${name} says, before you ask. So you don't.` },
        // High NE — the tension is catching
        { weight: State.lerp01(ne, 50, 70), value: `${name} starts talking and the tension in their voice does something to yours. By the time they finish, your jaw has been clenched the whole time. Their stress is a frequency and you're receiving it.` },
        // Accumulated irritation — you brace before they even speak
        { weight: irr * 1.5, value: `You approach ${name} and feel yourself brace. The venting will come — it always comes — and you'll absorb it because that's what you do. What you've always done. You're tired of doing it.` },
      ]);
    },
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
      const dread = State.sentimentIntensity('work', 'dread');
      const sat = State.sentimentIntensity('work', 'satisfaction');
      if (!canFocus && energy === 'depleted') {
        return Timeline.weightedPick([
          { weight: 1, value: 'You stare at the screen. Words move but they don\'t mean anything. Time passes anyway. You\'re not sure what you accomplished.' },
          { weight: dread * 2, value: 'The task list. The same task list. You open it like opening a wound. The screen swims. Nothing sticks. Nothing has stuck for a while.' },
        ]);
      }
      if (!canFocus) {
        return Timeline.weightedPick([
          { weight: 1, value: 'You try to focus. It\'s like pushing through water. Things get done, maybe, but you couldn\'t say what exactly.' },
          { weight: dread * 2, value: 'You try. The screen is right there. The work is right there. But there\'s something between you and it now — a heaviness that wasn\'t always this heavy.' },
        ]);
      }
      if (stress === 'overwhelmed') {
        return 'You work through it. Each task is a small wall you have to climb. You climb them because that\'s what\'s there.';
      }
      if (energy === 'tired') {
        return 'You work. Slowly, but it happens. One thing, then the next. The clock moves.';
      }
      return Timeline.weightedPick([
        { weight: 1, value: 'You settle into it. The work is the work — it\'s not interesting, but your hands know what to do. Something gets finished.' },
        { weight: sat * 2, value: 'You settle into it and the work cooperates. There\'s a rhythm here — not exciting, but competent. Something gets done, and you know it got done right.' },
      ]);
    },

    retail: (canFocus, energy, stress) => {
      const dread = State.sentimentIntensity('work', 'dread');
      const sat = State.sentimentIntensity('work', 'satisfaction');
      if (!canFocus && energy === 'depleted') {
        return Timeline.weightedPick([
          { weight: 1, value: 'You stand at the register. Scan, bag, repeat. Your body does it. Your mind is somewhere behind glass.' },
          { weight: dread * 2, value: 'Scan. Bag. The beep of the register is a sound you hear in your sleep now. Your body does the job. The rest of you left a while ago.' },
        ]);
      }
      if (!canFocus) {
        return Timeline.weightedPick([
          { weight: 1, value: 'Restock, face the shelves, help someone find something. The motions happen. Whether you\'re in them is another question.' },
          { weight: dread * 2, value: 'Shelves need facing. Customers need helping. You do it because the alternative is standing still, and standing still here is worse.' },
        ]);
      }
      if (stress === 'overwhelmed') {
        return '"Excuse me, do you work here?" You do. You help them. Another one. Another one after that.';
      }
      if (energy === 'tired') {
        return 'Shelves. Register. Customer. Shelves again. Your feet have their own opinion about all of this.';
      }
      return Timeline.weightedPick([
        { weight: 1, value: 'You work the floor. Straighten things, ring people up, answer the same three questions. It fills the time.' },
        { weight: sat * 2, value: 'You work the floor. Someone can\'t find what they need and you know exactly where it is. Small competence. It\'s something.' },
      ]);
    },

    food_service: (canFocus, energy, stress) => {
      const dread = State.sentimentIntensity('work', 'dread');
      const sat = State.sentimentIntensity('work', 'satisfaction');
      if (!canFocus && energy === 'depleted') {
        return Timeline.weightedPick([
          { weight: 1, value: 'The ticket says what to do. Your hands do it. There\'s a gap between you and the work that\'s getting wider.' },
          { weight: dread * 2, value: 'Ticket after ticket. The kitchen is too hot and too loud and the gap between you and the work is a chasm now. Your hands keep going. They don\'t need you for this.' },
        ]);
      }
      if (!canFocus) {
        return Timeline.weightedPick([
          { weight: 1, value: 'Orders come in. You make them. The fryer beeps and you pull the basket. It\'s not focus, it\'s muscle memory.' },
          { weight: dread * 2, value: 'More orders. The fryer beeps. You pull the basket. Every shift is the same shift and your body knows it before you walk in the door.' },
        ]);
      }
      if (stress === 'overwhelmed') {
        return 'Three tickets at once. The timer. Someone needs more fries. You work through it because stopping isn\'t one of the options.';
      }
      if (energy === 'tired') {
        return 'You work the line. Plate, garnish, slide. Your back has a suggestion about when to stop. You ignore it.';
      }
      return Timeline.weightedPick([
        { weight: 1, value: 'The rhythm of it. Ticket comes, you make it, it goes out. When it\'s flowing like this, the time actually moves.' },
        { weight: sat * 2, value: 'The rhythm catches and holds. Ticket, prep, plate — your hands know the sequence and the sequence knows your hands. When it flows like this, you almost don\'t mind being here.' },
      ]);
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
      const ne = State.get('norepinephrine');
      return Timeline.weightedPick([
        { weight: 1, value: 'The walkie crackles. Someone needs help in aisle six.' },
        { weight: 1, value: 'A customer is waiting at the counter. Has been for a while, apparently.' },
        { weight: 1, value: 'A delivery showed up. Boxes in the back that need to be somewhere else.' },
        // High NE — the demand cuts sharper
        { weight: State.lerp01(ne, 55, 75), value: 'The walkie crackles and the sound goes through you. Another voice, another task, another thing that needs you now. Your jaw tightens before you can stop it.' },
      ]);
    },
    food_service: () => {
      State.adjustStress(3);
      const ne = State.get('norepinephrine');
      return Timeline.weightedPick([
        { weight: 1, value: 'The ticket printer rattles. Another order. The paper curls off the end.' },
        { weight: 1, value: 'Someone calls out an order correction. You adjust. Again.' },
        { weight: 1, value: 'The timer beeps. Something needs to come out of the fryer now.' },
        // High NE — sounds compound
        { weight: State.lerp01(ne, 55, 75), value: 'The ticket printer, the timer, someone shouting behind you — all at once, all urgent, all aimed at you. The kitchen is a machine and you\'re a part that\'s running hot.' },
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
      const aden = State.get('adenosine');
      return Timeline.weightedPick([
        { weight: 1, value: 'The overhead music changes to a song you know. You wish it hadn\'t.' },
        { weight: 1, value: 'The automatic doors open and close. Open and close.' },
        { weight: 1, value: 'A child is crying somewhere in the store. The sound carries.' },
        // High adenosine — everything blurs together
        { weight: State.lerp01(aden, 50, 70), value: 'The store sounds blur into a single hum — registers, music, voices, the hiss of the HVAC. You\'re standing in it. It\'s hard to pick anything apart.' },
      ]);
    },
    food_service: () => {
      const aden = State.get('adenosine');
      return Timeline.weightedPick([
        { weight: 1, value: 'The exhaust fan changes pitch for a second, then settles.' },
        { weight: 1, value: 'Someone drops a pan in the back. The clatter hangs in the air.' },
        { weight: 1, value: 'The drive-through speaker crackles with a voice you can\'t quite make out.' },
        // High adenosine — the kitchen noise is a wall
        { weight: State.lerp01(aden, 50, 70), value: 'The kitchen noise is a wall of sound and you\'re behind it. Hood fans, fryer, someone talking — it\'s all one texture. You move through it without separating the parts.' },
      ]);
    },
  };

  // --- Location descriptions ---
  // Each returns prose based on current state. No labels, no meters.

  const locationDescriptions = {
    apartment_bedroom: () => {
      const energy = State.energyTier();
      const time = State.timePeriod();
      const mess = State.messTier();
      const mood = State.moodTone();

      // NT values for continuous shading (no RNG consumed)
      const ser = State.get('serotonin');
      const ne = State.get('norepinephrine');
      const gaba = State.get('gaba');
      const aden = State.get('adenosine');

      let desc = '';

      // Time-based opening — NT values shade within mood branches
      if (time === 'early_morning' || time === 'morning') {
        if (energy === 'depleted' || energy === 'exhausted') {
          if (ser < 30) {
            desc = 'The room is too bright. The light is an accusation. Everything about getting up feels impossible in a way you can\'t argue with.';
          } else {
            desc = 'The room is too bright. Everything about getting up feels like a negotiation with your own body.';
          }
        } else if (energy === 'tired') {
          desc = 'Morning light pushes through the blinds. You\'re awake, technically.';
        } else {
          if (ser > 55 && gaba > 50) {
            desc = 'Morning. The blinds let in pale light. The day is there, and for once it\'s not demanding anything yet.';
          } else {
            desc = 'Morning. The blinds let in pale light. The day is there, waiting.';
          }
        }
      } else if (time === 'deep_night' || time === 'night') {
        if (mood === 'numb' || mood === 'hollow') {
          if (ser < 30) {
            desc = 'The ceiling. It doesn\'t change. You\'ve been watching it not change for a while now. It\'s the most honest thing in the room.';
          } else {
            desc = 'The ceiling is there. It\'s been there. You\'ve been looking at it.';
          }
        } else if (energy === 'depleted') {
          desc = 'The bed has you. Not in a restful way — more like gravity won.';
        } else {
          if (ne > 55) {
            desc = 'Your room in the dark. Every small sound is louder than it should be. You know what\'s there. Your body keeps checking anyway.';
          } else {
            desc = 'Your room in the dark. The shapes of things you know are there.';
          }
        }
      } else if (time === 'evening') {
        if (mood === 'heavy' || mood === 'numb') {
          if (ser < 35) {
            desc = 'The room feels smaller in the evening. The walls are close. The light is leaving and you\'re not sure you want it to.';
          } else {
            desc = 'The room feels smaller in the evening. The walls are close.';
          }
        } else {
          if (ne > 50 && gaba < 40) {
            desc = 'Evening light makes the room almost warm. Almost. There\'s a tension you can\'t place — the day winding down but something in you not winding down with it.';
          } else {
            desc = 'Evening light makes the room almost warm. Almost.';
          }
        }
      } else {
        // Daytime
        if (mood === 'clear') {
          desc = 'Your bedroom. Familiar, small, yours.';
        } else if (mood === 'hollow' || mood === 'quiet') {
          if (ser < 35) {
            desc = 'Your room. The quiet is the loudest thing in it. The walls know something about you that you don\'t say out loud.';
          } else {
            desc = 'Your room. The quiet is the loudest thing in it.';
          }
        } else {
          desc = 'Your bedroom. The bed, the dresser, the window.';
        }
      }

      // Migraine — overrides mood tone with physical reality (deterministic, no RNG)
      const migraineTier = State.migraineTier();
      if (migraineTier === 'severe') {
        desc = 'The room is too bright. Everything is. Light from the window is a problem. Sound from outside is a problem. The headache has its own gravity.';
      } else if (migraineTier === 'active') {
        desc += ' The headache is here. A specific, one-sided pressure that makes you aware of the exact dimensions of your skull.';
      } else if (migraineTier === 'building') {
        desc += ' Something is starting behind your left eye. Or your right. The kind of pressure that you know, by now, what it means.';
      }

      // Floor clothes — from Clothing module
      const floorClothes = Clothing.floorDescription('bedroom');
      if (floorClothes) {
        desc += ' ' + floorClothes;
      }

      // General mess — still from apartment_mess (residual clutter not tracked by objects)
      if (!floorClothes && mess === 'tidy') {
        desc += ' It\'s relatively in order in here. The surfaces have their surfaces back.';
      } else if (mess === 'chaotic') {
        desc += ' Things that migrated from where they lived and didn\'t go back. The room has a layer to it now.';
      }

      // Bed state — from Linens
      const bed = Linens.bedState();
      if (bed === 'messy') {
        desc += ' The bed is a wreck — sheets pulled loose, pillow somewhere it shouldn\'t be.';
      } else if (bed === 'made') {
        desc += ' The bed is made.';
      }
      // 'unmade' is the default, already implied — no additional sentence

      // Alarm detail
      if (State.get('alarm_set') && !State.get('alarm_went_off')
          && (time === 'early_morning' || time === 'deep_night' || time === 'morning')) {
        desc += ' The alarm clock on the nightstand shows ' + State.getTimeString() + '.';
      }

      if (!State.get('dressed') && time !== 'deep_night' && time !== 'night') {
        desc += ' You\'re still in ' + Character.get('sleepwear') + '.';
      }

      // Deterministic NT modifiers — no RNG consumed, appended as undertones
      if (aden > 65) {
        desc += ' The edges of things are soft. Not blurry — just not quite sharp.';
      }
      if (ne > 60 && gaba < 35) {
        desc += ' Something restless underneath the stillness. You can\'t sit with it and you can\'t name it.';
      }

      return desc;
    },

    apartment_kitchen: () => {
      const hunger = State.hungerTier();
      const fridge = State.fridgeTier();
      const mess = State.messTier();
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
      if (fridge === 'empty') {
        if (hunger === 'starving' || hunger === 'very_hungry') {
          desc += ' The fridge is empty. You checked already, but you check again.';
        } else {
          desc += ' The fridge has nothing in it worth mentioning.';
        }
      } else if (fridge === 'sparse') {
        desc += ' There\'s something in the fridge. Not much.';
      } else if (fridge === 'stocked') {
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

      // Dishes — sink state from object system
      desc += ' ' + Dishes.sinkDescription();

      // Counter clutter — still from apartment_mess (general mess, not dishes)
      if (mess === 'chaotic' || mess === 'messy') {
        desc += ' The counter has its own layer — things set down and left, the kind that stops registering once it\'s been there long enough.';
      }

      // Microwave clock — the kitchen always tells you the time
      desc += ' The microwave clock reads ' + State.getTimeString() + '.';

      // NT deterministic modifiers (no RNG — location descriptions called from UI.render)
      const aden = State.get('adenosine');
      const ne = State.get('norepinephrine');
      if (aden > 65) {
        desc += ' The light in here is doing more than its share.';
      } else if (ne > 65 && (time === 'morning' || time === 'early_morning')) {
        desc += ' Everything in here feels very present this early.';
      }

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
      const mess = State.messTier();

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

      // Towel — from Linens
      const towel = Linens.towelState();
      if (towel === 'on_floor') {
        desc += ' The towel\'s on the floor. Been there a while.';
      } else if (towel === 'damp_hanging') {
        desc += ' The towel from earlier still hanging damp.';
      }

      // NT deterministic modifiers
      const aden = State.get('adenosine');
      const ne = State.get('norepinephrine');
      if (aden > 70) {
        desc += ' The light in here is harsh.';
      } else if (ne > 65) {
        desc += ' The faucet drip sounds too loud.';
      }

      return desc;
    },

    street: () => {
      const weather = State.get('weather');
      const time = State.timePeriod();
      const energy = State.energyTier();
      const mood = State.moodTone();
      const temp = State.temperatureTier();

      let desc = '';

      // Weather + time
      if (weather === 'drizzle') {
        if (mood === 'heavy' || mood === 'numb') {
          desc = 'Rain. Not hard enough to be dramatic. Just enough to be one more thing.';
        } else {
          desc = 'A light drizzle. The sidewalk darkens in patches.';
        }
      } else if (weather === 'snow') {
        if (mood === 'heavy' || mood === 'numb') {
          desc = 'Snow. White on everything, muffled. The kind that makes the world feel smaller and quieter than you need it to be.';
        } else {
          desc = 'Snow coming down. The street is quiet in that way it only gets when it snows.';
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

      // Temperature
      if (temp === 'bitter')   desc += ' Bitter cold. Each breath is a small shock.';
      else if (temp === 'freezing') desc += ' The cold cuts through whatever you\'re wearing.';
      else if (temp === 'cold')     desc += ' Cold out. You feel it.';
      else if (temp === 'hot')      desc += ' Warm out. The air has weight.';

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
      } else if (weather === 'snow') {
        desc += ' Snow on the bench. You brush a corner clear.';
      }

      const temp = State.temperatureTier();
      if (temp === 'bitter')   desc += ' Your feet are already numb.';
      else if (temp === 'freezing') desc += ' The cold makes standing here miserable.';
      else if (temp === 'cold')     desc += ' Cold. You pull your jacket tighter.';
      else if (temp === 'hot')      desc += ' No shade worth speaking of.';

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

      // NT deterministic modifiers
      const ne = State.get('norepinephrine');
      const aden = State.get('adenosine');
      if (ne > 65) {
        desc += ' The fluorescent hum, the fridge doors rattling — too much input for a corner store.';
      } else if (aden > 65) {
        desc += ' The aisles smear a little. You know what you need.';
      }

      return desc;
    },
  };

  // --- Helpers ---

  /** Returns the friend slot + character to reply to, or null if nothing to reply to.
   *  When phone_thread_contact is set (live play with thread open), uses that slot.
   *  Falls back to guilt-based selection for replay compat when thread contact isn't set. */
  function getReplyTarget() {
    const inbox = State.get('phone_inbox');
    const pending = State.get('pending_replies') || [];
    const threadContact = State.get('phone_thread_contact');

    // Live play — use the active thread
    if (threadContact && ['friend1', 'friend2'].includes(threadContact)) {
      if (pending.some(r => r.slot === threadContact)) return null;
      return { slot: threadContact, friend: Character.get(threadContact) };
    }

    // Fallback — old guilt-based logic for replay compat
    const candidates = ['friend1', 'friend2'].filter(
      slot => inbox.some(m => m.source === slot) && !pending.some(r => r.slot === slot)
    );
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return { slot: candidates[0], friend: Character.get(candidates[0]) };
    const g0 = State.sentimentIntensity(candidates[0], 'guilt');
    const g1 = State.sentimentIntensity(candidates[1], 'guilt');
    let slot;
    if (g0 > g1 + 0.05) slot = candidates[0];
    else if (g1 > g0 + 0.05) slot = candidates[1];
    else {
      slot = candidates[0];
      for (const m of inbox) {
        if (m.source && candidates.includes(m.source)) slot = m.source;
      }
    }
    return { slot, friend: Character.get(slot) };
  }

  /** Returns the friend slot + character to initiate contact with, or null if no valid target.
   *  When phone_thread_contact is set (live play with thread open), uses that slot.
   *  Falls back to guilt-based selection for replay compat when thread contact isn't set. */
  function getInitiateTarget() {
    const pending = State.get('pending_replies') || [];
    const inbox = State.get('phone_inbox');
    const threadContact = State.get('phone_thread_contact');

    // Live play — use the active thread
    if (threadContact && ['friend1', 'friend2'].includes(threadContact)) {
      if (pending.some(r => r.slot === threadContact)) return null;
      if (inbox.some(m => m.source === threadContact && !m.read)) return null; // has unread → use reply
      return { slot: threadContact, friend: Character.get(threadContact) };
    }

    // Fallback — old logic for replay compat
    const candidates = ['friend1', 'friend2'].filter(slot => {
      if (pending.some(r => r.slot === slot)) return false;
      if (inbox.some(m => m.source === slot && !m.read)) return false;
      return true;
    });
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return { slot: candidates[0], friend: Character.get(candidates[0]) };
    const g0 = State.sentimentIntensity(candidates[0], 'guilt');
    const g1 = State.sentimentIntensity(candidates[1], 'guilt');
    if (g0 > g1 + 0.05) return { slot: candidates[0], friend: Character.get(candidates[0]) };
    if (g1 > g0 + 0.05) return { slot: candidates[1], friend: Character.get(candidates[1]) };
    const fc = State.get('friend_contact');
    const t0 = fc[candidates[0]] || 0;
    const t1 = fc[candidates[1]] || 0;
    const slot = t0 <= t1 ? candidates[0] : candidates[1];
    return { slot, friend: Character.get(slot) };
  }

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
        const hunger = State.hungerTier();

        // Pre-sleep NT values for falling-asleep prose shading
        const preSleepAden = State.get('adenosine');
        const preSleepGaba = State.get('gaba');
        const preSleepNE = State.get('norepinephrine');
        const preSleepSer = State.get('serotonin');

        // Falling-asleep delay — stress and racing thoughts keep you up
        let fallAsleepDelay;
        if (energy === 'depleted') {
          fallAsleepDelay = Timeline.randomInt(2, 8);
        } else if (stress === 'overwhelmed' || stress === 'strained') {
          fallAsleepDelay = Timeline.randomInt(15, 45);
        } else if (stress === 'tense') {
          fallAsleepDelay = Timeline.randomInt(8, 25);
        } else {
          fallAsleepDelay = Timeline.randomInt(3, 15);
        }

        // Melatonin modifier — high melatonin eases onset, low delays it
        const melatoninAtOnset = State.get('melatonin');
        if (melatoninAtOnset > 60) {
          fallAsleepDelay = Math.max(1, Math.round(fallAsleepDelay * 0.7));
        } else if (melatoninAtOnset < 20) {
          fallAsleepDelay = Math.round(fallAsleepDelay * 1.4);
        }

        // Natural sleep duration
        let sleepMinutes;
        if (energy === 'depleted') {
          sleepMinutes = Timeline.randomInt(300, 540);
        } else if (energy === 'exhausted') {
          sleepMinutes = Timeline.randomInt(240, 480);
        } else {
          sleepMinutes = Timeline.randomInt(120, 360);
        }

        // Alarm interruption — check if alarm fires during sleep
        let wokeByAlarm = false;
        if (State.get('alarm_set') && !State.get('alarm_went_off')) {
          const alarmTime = State.get('alarm_time');
          const tod = State.timeOfDay();
          // Time from now until alarm (wrapping across midnight)
          const minutesToAlarm = ((alarmTime - tod) % 1440 + 1440) % 1440;
          if (minutesToAlarm > 0 && minutesToAlarm < fallAsleepDelay + sleepMinutes) {
            // Alarm fires during sleep — chance to sleep through if depleted
            if (energy === 'depleted' && Timeline.chance(0.3)) {
              // Sleep through the alarm
              State.set('alarm_went_off', true);
            } else {
              // Alarm truncates sleep
              sleepMinutes = Math.max(30, minutesToAlarm - fallAsleepDelay);
              wokeByAlarm = true;
              State.set('alarm_went_off', true);
            }
          }
        }

        // Quality factor — stress and hunger degrade recovery
        let qualityMult = 1.0;
        if (stress === 'overwhelmed') qualityMult *= 0.5;
        else if (stress === 'strained') qualityMult *= 0.7;
        if (hunger === 'starving') qualityMult *= 0.7;
        else if (hunger === 'very_hungry') qualityMult *= 0.85;

        // Rain sound comfort — sleeping to rain improves quality slightly
        const rainComfort = State.sentimentIntensity('rain_sound', 'comfort');
        if (State.get('weather') === 'drizzle' && rainComfort > 0) {
          qualityMult += rainComfort * 0.1;  // max +0.09 at intensity 0.9
        }

        // Melatonin at sleep onset — proper melatonin improves architecture
        if (melatoninAtOnset > 60) qualityMult *= 1.05;
        else if (melatoninAtOnset < 25) qualityMult *= 0.85;

        // Circadian alignment — sleeping at the wrong time degrades quality
        const sleepHour = Math.floor(State.timeOfDay() / 60);
        if (sleepHour >= 10 && sleepHour <= 16) {
          qualityMult *= 0.75;  // daytime sleep is structurally worse
        } else if (sleepHour >= 6 && sleepHour < 10) {
          qualityMult *= 0.9;   // late morning sleep is suboptimal
        }

        // Crash sleep — emergency shutdown is less restorative
        if (State.get('adenosine') > 80) qualityMult *= 0.9;

        // Caffeine interference — caffeine at bedtime degrades sleep architecture
        qualityMult *= State.caffeineSleepInterference();

        // Sleep debt: ideal 480 min/day. Deficit accumulates fully, excess repays at 33%.
        const ideal = 480;
        const deficit = ideal - sleepMinutes;
        const debtChange = deficit > 0 ? deficit : deficit * 0.33;
        const oldDebt = State.get('sleep_debt');
        State.set('sleep_debt', Math.max(0, Math.min(4800, oldDebt + debtChange)));

        // Debt penalty on energy recovery: chronic deficit impairs restoration
        const currentDebt = State.get('sleep_debt');
        const debtPenalty = 1 / (1 + currentDebt / 1200);
        const energyGain = (sleepMinutes / 5) * qualityMult * debtPenalty;

        // Sleep cycle breakdown — determines deep sleep / REM architecture
        const cycles = State.sleepCycleBreakdown(sleepMinutes);

        // Neurochemistry: sleep effects
        // Store sleep quality for serotonin/NE target functions
        State.set('last_sleep_quality', qualityMult);
        // Adenosine: cleared by deep sleep (the clearing mechanism)
        const adenosineClear = -(sleepMinutes / 480) * State.get('adenosine') * 0.9 * (0.4 + 0.6 * cycles.deepSleepFrac);
        State.adjustNT('adenosine', adenosineClear);
        // Serotonin: good sleep promotes synthesis, poor sleep impairs
        State.adjustNT('serotonin', qualityMult >= 0.9 ? 3 : qualityMult < 0.6 ? -2 : 0);
        // Norepinephrine: REM sleep is the NE-free environment — more REM = better NE clearing
        const neClear = cycles.remFrac * qualityMult;
        State.adjustNT('norepinephrine', neClear > 0.15 ? -4 * neClear : qualityMult < 0.6 ? 3 : 0);

        State.advanceTime(fallAsleepDelay + sleepMinutes);

        // Phone charges overnight if sleeping at home
        if (State.get('location') === 'apartment_bedroom') {
          const chargeHours = (fallAsleepDelay + sleepMinutes) / 60;
          State.adjustBattery(chargeHours * 30);
        }

        State.adjustEnergy(energyGain);
        State.adjustStress(-sleepMinutes / 20);
        State.set('actions_since_rest', 0);

        // Sleep emotional processing — REM quality determines processing effectiveness
        const emotionalQuality = qualityMult * (0.4 + 0.6 * cycles.remFrac);
        State.processSleepEmotions(Character.get().sentiments, emotionalQuality, sleepMinutes);

        // Friend absence — guilt accumulates per night of silence
        State.processAbsenceEffects();

        // Fridge food slowly goes bad overnight
        if (State.fridgeTier() !== 'empty' && Timeline.chance(0.15)) {
          State.set('fridge_food', Math.max(0, State.get('fridge_food') - 1));
        }

        // Undress — destination depends on energy + mood
        Clothing.undress(State.energyTier(), State.moodTone(), State.get('location'));

        // Reset wake-period flags
        State.wakeUp();
        Linens.noteSlept();
        // Set just_woke_alarm AFTER wakeUp() clears it — enables snooze/dismiss
        if (wokeByAlarm) {
          State.set('just_woke_alarm', true);
        }
        Habits.noteWake();

        // Record events
        const quality = qualityMult >= 0.9 ? 'good' : qualityMult >= 0.6 ? 'restless' : 'poor';
        Events.record('slept', { duration: sleepMinutes, wokeByAlarm, quality });
        Events.record('woke_up', {});

        // Post-sleep state — how you actually are on waking
        const postEnergy = State.energyTier();
        const postMood = State.moodTone();
        const wakeTime = State.timePeriod();

        // Post-sleep NT values for waking prose shading
        const postSer = State.get('serotonin');
        const postNE = State.get('norepinephrine');
        const postGaba = State.get('gaba');
        const postAden = State.get('adenosine');
        const sleepInertia = cycles.sleepInertia;

        // --- Falling asleep ---
        let asleep;
        if (wokeByAlarm) {
          if (energy === 'depleted') {
            asleep = Timeline.weightedPick([
              { weight: 1, value: 'You\'re gone before your head settles. The kind of sleep that takes you — no transition, no drift, just off.' },
              { weight: 1, value: 'Your body gives out. Not falling asleep so much as shutting down. One breath you\'re lying there, the next you\'re nowhere.' },
              // High adenosine — consciousness collapses
              { weight: State.lerp01(preSleepAden, 60, 90), value: 'You don\'t fall asleep. You drop. Like someone pulled a plug — one moment the ceiling, the next nothing, not even the nothing.' },
            ]);
          } else if (stress === 'overwhelmed' || stress === 'strained') {
            asleep = Timeline.weightedPick([
              { weight: 1, value: 'Sleep comes late. You lie there turning the same thoughts over, the same knots, until exhaustion wins. It\'s not rest. It\'s surrender.' },
              { weight: 1, value: 'You stare at the dark for a long time. The thoughts don\'t stop — they just blur, eventually, into something close enough to unconsciousness.' },
              { weight: 1, value: 'It takes a while. You lie still and your head won\'t stop. Eventually the gap between thoughts gets wide enough and you slip through.' },
              // Low GABA — the mind won't release
              { weight: State.lerp01(preSleepGaba, 40, 15), value: 'Your body is exhausted but your head won\'t let go. Every time you get close to the edge, something yanks you back — a thought, a fear, your own pulse. Sleep has to fight for it.' },
              // High NE — hyper-alert in the dark
              { weight: State.lerp01(preSleepNE, 55, 80), value: 'Every sound is too loud. The building settling, the fridge, your own breathing. You lie rigid in the dark, listening to everything, and the listening is what keeps you awake.' },
            ]);
          } else {
            asleep = Timeline.weightedPick([
              { weight: 1, value: 'You close your eyes and the day lets go of you. Sleep comes — not instantly, but without a fight.' },
              { weight: 1, value: 'The pillow, the dark, the quiet. You drift. Somewhere between one thought and the next you stop being awake.' },
              { weight: 1, value: 'You settle in. A few minutes of the ceiling, then nothing. Actual sleep.' },
              // Higher serotonin — settling in feels warm
              { weight: State.lerp01(preSleepSer, 50, 70), value: 'Your eyes close and there\'s a warmth to it — the sheets, the dark, your body letting go without being asked. You\'re asleep before you notice.' },
              // Rain lover during drizzle — the sound helps
              { weight: State.get('weather') === 'drizzle' && rainComfort > 0 ? rainComfort * 0.8 : 0, value: 'The rain taps the window and your eyes close. The sound fills the dark — steady, patient, asking nothing. Sleep comes with the rain.' },
            ]);
          }
        } else {
          if (energy === 'depleted' && quality === 'poor') {
            asleep = Timeline.weightedPick([
              { weight: 1, value: 'You lie down and something gives way. Not quite sleep. More like your body collecting a debt it\'s owed.' },
              { weight: 1, value: 'Your body folds into the mattress. Sleep takes you, but roughly — dragging you under before you\'re ready.' },
              // High NE — body won't unclench even in exhaustion
              { weight: State.lerp01(preSleepNE, 50, 75), value: 'You collapse more than lie down. Sleep takes you but your jaw stays clenched, your shoulders stay locked. Even unconscious, something in you is bracing.' },
            ]);
          } else if (energy === 'depleted') {
            asleep = Timeline.weightedPick([
              { weight: 1, value: 'You\'re asleep before you finish lying down. Gone. The kind of unconsciousness that doesn\'t feel like rest because you weren\'t awake enough to notice the transition.' },
              { weight: 1, value: 'Your body doesn\'t ask. It takes. You\'re horizontal and then you\'re nowhere, instantly, like a switch thrown.' },
              // Very high adenosine — past crash, into oblivion
              { weight: State.lerp01(preSleepAden, 70, 95), value: 'You don\'t remember lying down. Between standing and unconscious there was nothing — no transition, no last thought, just the world switching off.' },
            ]);
          } else if (quality === 'poor') {
            asleep = Timeline.weightedPick([
              { weight: 1, value: 'Sleep comes in pieces. You\'re awake, then you\'re not, then you are again and the ceiling is the same.' },
              { weight: 1, value: 'You drift, surface, drift again. Every time you almost get there, something pulls you back — a thought, a sound, your own body shifting.' },
              { weight: 1, value: 'Not really sleeping. More like visiting unconsciousness in short trips and coming back each time with less to show for it.' },
              // Low GABA — anxiety keeps breaking through
              { weight: State.lerp01(preSleepGaba, 40, 15), value: 'You sink, then your chest tightens and you\'re back. Sink again. Tighten. Back. Your body wants sleep but something underneath keeps tripping the wire.' },
              // High NE — startling awake
              { weight: State.lerp01(preSleepNE, 50, 75), value: 'You jolt awake. You were asleep — you think — but now you\'re staring at the ceiling with your heart going. Nothing happened. You lie there until it slows, then try again.' },
            ]);
          } else if (sleepMinutes >= 240) {
            asleep = Timeline.weightedPick([
              { weight: 1, value: 'You sleep. Actually sleep. The kind that takes you somewhere and brings you back changed.' },
              { weight: 1, value: 'You close your eyes and the world does the decent thing and goes away for a while.' },
              { weight: 1, value: 'Sleep comes, and it\'s the real kind. Deep, blank, generous.' },
              // Higher serotonin — sleep with warmth
              { weight: State.lerp01(preSleepSer, 50, 70), value: 'Sleep gathers you up. No resistance, no negotiation — just warmth and dark and the easy surrender of a body that\'s been allowed to rest.' },
              // Rain lover during drizzle — rain carries you under
              { weight: State.get('weather') === 'drizzle' && rainComfort > 0 ? rainComfort : 0, value: 'Rain on the window. The sound of it — steady, close, the whole room softened. Your eyes close and the rain is the last thing you hear, tapping its patient rhythm on the glass. Sleep takes you gently.' },
            ]);
          } else {
            asleep = Timeline.weightedPick([
              { weight: 1, value: 'You close your eyes. Something between sleep and not — the body resting even if the mind doesn\'t fully let go.' },
              { weight: 1, value: 'You drift. Not deep, not long, but your body takes what it can get.' },
              // High adenosine — drift is heavier than expected
              { weight: State.lerp01(preSleepAden, 55, 75), value: 'You meant to just close your eyes. The tiredness was deeper than you realized — you\'re under before you can reconsider.' },
            ]);
          }
        }

        // --- Waking up ---
        let waking;
        if (wokeByAlarm) {
          // Alarm waking — the specific fog of being pulled out
          if (postEnergy === 'depleted' || postEnergy === 'exhausted') {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'The alarm. It comes from far away and then it\'s right there, inside your skull. Your hand finds it somehow. The silence after is worse — now you have to be a person. Your body says no. Every part of you says no.' },
              { weight: 1, value: 'Sound. Your arm moves before you\'re awake. The alarm stops. You lie in the sudden quiet and your eyelids weigh more than anything has ever weighed. Not enough. It wasn\'t enough.' },
              { weight: 1, value: 'The alarm drags you up from somewhere deep. You kill it and lie there in the aftermath, not yet a person, not yet anything. The room is dark, or bright, or something. You can\'t make it matter yet.' },
              // High adenosine — can barely surface
              { weight: State.lerp01(postAden, 30, 55), value: 'The alarm is somewhere. Far away and getting closer, or maybe it was always close and you\'re the one who was far. Your hand moves through something thick. Finds the phone. Silence. Your eyes won\'t open. They genuinely won\'t open.' },
              // Low serotonin — waking into dread
              { weight: State.lerp01(postSer, 35, 15), value: 'The alarm, and before you\'re even awake, the feeling is already there — not a thought, not yet, just weight. The day waiting on the other side of your eyelids, and you already know what it\'s going to be.' },
            ]);
          } else if (quality === 'poor') {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'The alarm. You were already half-awake anyway, floating in that grey zone between sleep and not. The sound just makes it official. Your eyes feel like they\'ve been open for days.' },
              { weight: 1, value: 'Sound cuts through the thin sleep you had. You turn it off. The room comes back — same room, same light, same you. Except grittier, like something\'s been rubbed raw.' },
              // High NE — edges too sharp
              { weight: State.lerp01(postNE, 50, 70), value: 'The alarm is an assault. Not loud — it\'s always this loud — but every frequency is a needle. You slap it quiet and the silence rings. Your skin feels too thin for the morning.' },
            ]);
          } else if (postEnergy === 'tired' || postEnergy === 'okay') {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'The alarm. You were actually sleeping — deeply enough that the sound takes a second to become a sound and not just part of whatever you were dreaming. You reach for the phone. The room assembles itself around you: walls, ceiling, the light saying morning.' },
              { weight: 1, value: 'The alarm goes off and you\'re not yet a person. A hand hits the phone. Silence. You lie there while the fog lifts in layers — first you know where you are, then when, then why it matters. A minute passes before any of it feels real.' },
              { weight: 1, value: 'Noise. Then not noise. Then the slow work of becoming someone who is awake. The pillow is warm. The air is not. You\'re somewhere between the two.' },
              // High adenosine residual — thicker fog
              { weight: State.lerp01(postAden, 25, 45), value: 'The alarm. You hear it for a long time before it becomes an alarm — just sound, formless, part of something you were already in. Your hand knows what to do before you do. The silence after is cotton. You float in it, not yet here.' },
              // Sleep inertia — pulled out of deep sleep
              { weight: sleepInertia, value: 'The alarm rips you out of something. Deep, whatever it was — the sound is wrong, the room is wrong, everything is a foreign country for a few bad seconds. Your hand kills the noise and you lie there while the world slowly becomes a place you recognize.' },
            ]);
          } else {
            // rested/alert alarm wake
            waking = Timeline.weightedPick([
              { weight: 1, value: 'The alarm and you\'re awake — actually awake, not the usual drag. Your eyes open and the room is just a room. Morning. Your body cooperates for once.' },
              { weight: 1, value: 'The alarm. But you were already surfacing, already close to the edge of waking. The sound just tips you over. You open your eyes and the day is right there, ready. So are you, more or less.' },
              // Higher serotonin — morning feels possible
              { weight: State.lerp01(postSer, 55, 75), value: 'The alarm, and you\'re already there. Eyes open, body present, the room making sense on the first try. Something in you cooperated overnight. The morning is just morning.' },
            ]);
          }
        } else if (wakeTime === 'deep_night' || wakeTime === 'night') {
          // Waking in the dark — the wrong kind of awake
          if (postEnergy === 'depleted' || postEnergy === 'exhausted') {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You surface in the dark. Not morning — not close. The room is black and quiet and your body is a thing that is awake when it shouldn\'t be. Nowhere to go with it. Nothing to do with it.' },
              { weight: 1, value: 'Dark. You\'re awake. That\'s wrong — it should be later, should be light. But here you are, eyes open in a room that gives you nothing to look at. Too tired to get up. Too awake to go back.' },
              // Low GABA — night anxiety, the 3am dread
              { weight: State.lerp01(postGaba, 40, 15), value: 'You\'re awake and it\'s dark and the first thing that arrives is the dread. Not of anything specific — just the particular terror of being conscious at the wrong hour with a body too tired to do anything about it.' },
            ]);
          } else {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You come back to yourself in the dark. The room is silent except for the building being a building — pipes, settling, the hum you only notice at night. It\'s the wrong time to be awake. You know this the way you know your own name.' },
              { weight: 1, value: 'Dark. Still. You\'re awake and the world isn\'t. The silence has that particular quality — the one that means everyone else is asleep and you\'re on the wrong side of it.' },
              { weight: 1, value: 'Your eyes open to nothing. Dark room, dark window. The kind of awake that comes without a reason, just you suddenly here in the middle of the night with no idea what to do about it.' },
              // High NE — hyper-aware in the dark
              { weight: State.lerp01(postNE, 45, 70), value: 'You\'re awake, and every sound is a fact. The pipes. A car outside. Someone\'s footsteps above you, or below. The dark is full of information you didn\'t ask for, and you can\'t stop receiving it.' },
            ]);
          }
        } else if (wakeTime === 'afternoon' || wakeTime === 'evening') {
          // Late waking — the disorientation of lost time
          if (postMood === 'numb' || postMood === 'heavy') {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You open your eyes and the light is wrong. Afternoon light — low, coming in at an angle that means the day happened without you. You lie there with that. The weight of it.' },
              { weight: 1, value: 'The room is bright in the wrong way. You slept through the morning, through whatever the morning was going to be. The day is mostly over. You\'re mostly not surprised.' },
              // Low serotonin — the lost time has gravity
              { weight: State.lerp01(postSer, 35, 15), value: 'Afternoon. The day already gone. Some part of you chose this, the long sleep, the missed hours. It doesn\'t feel like a choice. It feels like the only thing that was going to happen.' },
            ]);
          } else {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You surface and the light says afternoon. The day is already half-gone, already somewhere you\'ll never catch. The room has that overslept feeling — stale air, warm sheets, time you didn\'t spend.' },
              { weight: 1, value: 'You come back. The light through the window is angled low and golden, which means it\'s later than it should be. Much later. The morning happened without you. It\'s gone.' },
              { weight: 1, value: 'Your eyes open and the sun is wrong — past the middle of the sky, past the part of the day when waking up feels like waking up. This feels like something else. Surfacing.' },
              // High adenosine residual — sluggish re-entry
              { weight: State.lerp01(postAden, 25, 45), value: 'The light is wrong and so is your head. Thick, slow, like waking up underwater. Afternoon. The day has been happening without you, and getting back to it feels like swimming through something.' },
            ]);
          }
        } else if (postEnergy === 'depleted' || postEnergy === 'exhausted') {
          // Still exhausted despite sleeping — not enough
          waking = Timeline.weightedPick([
            { weight: 1, value: 'You surface. That\'s the only word for it — coming up from somewhere that wasn\'t deep enough, breaking the surface and finding the air no different. Your body is heavy. Your eyes are heavy. Everything is heavy and the room is asking you to be a person in it.' },
            { weight: 1, value: 'You wake up, and the first thing you know is that it wasn\'t enough. The sleep, the hours, whatever your body did in the dark — not enough. You\'re here, eyes open, and the distance between this and rested is a distance you can feel.' },
            { weight: 1, value: 'Morning, probably. You\'re awake, technically. Your body is a sandbag version of itself — present but dense, uncooperative. The ceiling is up there. You\'re down here. The gap between is everything.' },
            // Low serotonin — the not-enough has a color
            { weight: State.lerp01(postSer, 35, 15), value: 'You surface and the first thing waiting is the knowledge that this is it. This is all the rest you\'re getting. Your body is heavy. Your thoughts are heavy. The room is the same room, and you\'re worse for having opened your eyes.' },
            // Moderate+ sleep debt — not just last night, it's cumulative
            { weight: State.lerp01(currentDebt, 300, 720), value: 'You wake up and it\'s not just last night. It\'s the night before, and the one before that. The tiredness has layers — each one a sleep that wasn\'t enough, stacked up, compounding. One good night won\'t fix this. You can feel that in your bones.' },
            // Severe sleep debt — the body running on empty
            { weight: State.lerp01(currentDebt, 720, 2400), value: 'You\'re awake. You think. The line between sleeping and not has worn so thin you can\'t always tell which side you\'re on. Your body has been running a tab it can\'t pay, and this morning it\'s not even pretending to try. Everything is far away.' },
          ]);
        } else if (quality === 'poor') {
          // Slept but poorly — the gritty surface feeling
          waking = Timeline.weightedPick([
            { weight: 1, value: 'You wake up feeling like you didn\'t sleep. You did — you must have, because time passed — but your body didn\'t get the memo. Your eyes are gritty, your neck is wrong, everything is slightly off in a way you can\'t fix by stretching.' },
            { weight: 1, value: 'You come back. The room. The light. You. Something\'s wrong, or not wrong exactly — just not right. Sleep happened but it didn\'t take. You feel like a rough draft of a person.' },
            { weight: 1, value: 'Awake. Or some version of it. Your body did the hours but skipped the rest — you can feel it in your eyes, your joints, the dull headache that isn\'t quite a headache. The room is the same room. You\'re a worse version of who lay down in it.' },
            // High NE — sleep didn't clear the charge
            { weight: State.lerp01(postNE, 50, 70), value: 'You wake up tight. Your jaw, your shoulders, your hands — clenched around something that wasn\'t there when you went to sleep, or was and didn\'t leave. The sleep didn\'t clear it. You can feel the charge in your teeth.' },
            // Moderate sleep debt — the poor quality is catching up
            { weight: State.lerp01(currentDebt, 300, 720), value: 'You slept, but your body isn\'t buying it. This isn\'t one bad night — it\'s a string of them, the deficit compounding, each morning a little worse than the last. The ceiling looks the same but you\'re seeing it from deeper down.' },
          ]);
        } else if (postEnergy === 'rested' || postEnergy === 'alert') {
          // Actually rested — rare clarity
          if (postMood === 'clear' || postMood === 'present') {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You open your eyes and the room is just a room. Not a problem, not a weight — just walls and light and air. Your body is yours. It works. The morning is outside the window doing morning things, and you\'re in here, and that\'s fine. Actually fine.' },
              { weight: 1, value: 'You wake up and something is different. It takes a second to place it — the absence of dread. The room is light, the bed is warm, your body cooperated. You\'re just awake. Just here. It feels rare because it is.' },
              { weight: 1, value: 'Light through the curtain. Your eyes open and your body doesn\'t argue. No fog, no weight, no negotiation with your own limbs. The room, the morning, you — all present, all accounted for. This is what it\'s supposed to feel like.' },
              // High serotonin — actually warm
              { weight: State.lerp01(postSer, 60, 80), value: 'You wake up and the world is gentle. That\'s the word — gentle. The light, the air, the fact of being alive in a bed. Your body is easy in itself. You lie there for a moment just because you can, and the moment is good.' },
            ]);
          } else {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You wake up and your body is there — present, functional, not fighting you. The room comes into focus: the light, the shapes, the ordinary evidence of morning. You don\'t feel good, exactly. But you feel like yourself.' },
              { weight: 1, value: 'Your eyes open. The ceiling, the light, the quiet. Your body did the thing it was supposed to do for once — slept, recovered, came back to you more or less intact. The day is out there. You can probably meet it.' },
              // Low GABA despite rest — body rested but mind already running
              { weight: State.lerp01(postGaba, 45, 25), value: 'Your body is rested — you can feel that, the energy is there. But your mind is already going, already making lists, already three steps into a day that hasn\'t started. You\'re functional. Just not calm.' },
            ]);
          }
        } else {
          // Tired but functional — the middle ground
          if (postMood === 'heavy' || postMood === 'numb') {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You\'re awake. The room, the light. Your body moves when you tell it to, just slowly, just with the particular reluctance of something that would rather not. The day is there, outside the window. It doesn\'t care if you\'re ready.' },
              { weight: 1, value: 'You surface slowly. The fog doesn\'t lift so much as thin — you can see through it, but it\'s still there, clinging. The room is a room again. Your body is a body again. Neither feels like a gift.' },
              // Low serotonin — the heaviness has weight
              { weight: State.lerp01(postSer, 35, 15), value: 'You\'re awake, and the first thing you feel is the cost of it. Being conscious takes something from you, some toll paid at the door. The room is there. The day is there. That\'s already too much.' },
            ]);
          } else if (wakeTime === 'early_morning' || wakeTime === 'morning') {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You wake up. Not sharply, not gently — just the slow fade from not-here to here. The room materializes: the light through the curtain, the shapes of things, the particular silence of early morning. You\'re somewhere between fog and awake. The body moves, but it takes a minute.' },
              { weight: 1, value: 'Morning. You know this before you open your eyes — the light, the feel of it. Your body is still negotiating the transition from asleep to not. The room is there when you\'re ready for it. You\'re almost ready for it.' },
              { weight: 1, value: 'You surface into morning. The light is thin and pale — early, or early enough. Your body does an inventory without your permission: stiff, slow, but functional. The day hasn\'t started demanding things yet. Give it a minute.' },
              // High NE — sharper morning than expected
              { weight: State.lerp01(postNE, 45, 65), value: 'You wake up and the room is immediately all there — every edge, every sound, the light too precise for how early it is. Your body is already cataloguing: the temperature, the stiffness in your back, the air. Too awake for how tired you are.' },
            ]);
          } else {
            waking = Timeline.weightedPick([
              { weight: 1, value: 'You wake up. The room, the light, the fact of being conscious again. Your body comes back to you in pieces — hands first, then weight, then the specific feeling of a head that was recently asleep. You\'re here.' },
              { weight: 1, value: 'Eyes open. The room. You. The slow assembly of a person from the raw material of someone who was just unconscious. It takes a minute. Things come back — where you are, what day it is, what you\'re supposed to be doing. You\'re not sure about the last one.' },
              // High adenosine residual — foggy edges
              { weight: State.lerp01(postAden, 25, 40), value: 'You come back slowly. The room is there but soft, like looking through gauze. Your thoughts are shapes, not words yet. It takes a while for the edges to sharpen — for the room to become a room and not just light and surfaces.' },
            ]);
          }
        }

        // Slept-through-alarm awareness — alarm fired but didn't wake you
        if (State.get('alarm_went_off') && !wokeByAlarm) {
          waking += ' Your phone is quiet. The alarm went off, earlier. You think.';
        }

        return asleep + ' ' + waking;
      },
    },

    get_dressed: {
      id: 'get_dressed',
      label: 'Get dressed',
      location: 'apartment_bedroom',
      available: () => !State.get('dressed'),
      execute: () => {
        State.set('dressed', true);
        Clothing.wear();
        State.advanceTime(5);
        Events.record('got_dressed');

        const mood = State.moodTone();
        // Messy outfit when grabbing from the floor (low wearable items) or bad mood
        const grabbingFromFloor = Clothing.wearableItems().length === 0;

        if (mood === 'numb' || mood === 'heavy') {
          return Character.get('outfit_low_mood');
        }
        if (grabbingFromFloor) {
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

    snooze_alarm: {
      id: 'snooze_alarm',
      label: 'Snooze',
      location: 'apartment_bedroom',
      available: () => State.get('just_woke_alarm'),
      execute: () => {
        const count = State.get('snooze_count');
        State.set('snooze_count', count + 1);
        State.advanceTime(9);
        const energyGain = Timeline.randomInt(1, 3);
        State.adjustEnergy(energyGain);
        State.adjustNT('adenosine', -1);
        // Phone charges a tiny bit during snooze
        if (State.get('location') === 'apartment_bedroom') {
          State.adjustBattery(4);
        }

        Events.record('snoozed', { count: count + 1 });

        const mood = State.moodTone();
        const aden = State.get('adenosine');
        const ser = State.get('serotonin');

        if (count === 0) {
          // First snooze — pure fog
          return Timeline.weightedPick([
            { weight: 1, value: 'Your hand finds the button before the rest of you wakes up. Nine minutes. The pillow takes you back. The room dissolves.' },
            { weight: 1, value: 'Snooze. The sound stops. The silence rushes in and you sink back into it, the warm dark, the not-yet. Nine minutes of borrowed time.' },
            { weight: 1, value: 'You hit snooze the way you breathe — without deciding. The alarm goes quiet. The mattress has you. Nine more minutes of not being a person.' },
            // High adenosine — barely surfaced
            { weight: State.lerp01(aden, 40, 70), value: 'The sound. Your hand. Silence. You were never really awake — just close enough to the surface for your arm to know what to do. You\'re already gone again.' },
          ]);
        } else if (count === 1) {
          // Second snooze — negotiation
          return Timeline.weightedPick([
            { weight: 1, value: 'Again. The alarm, the hand, the silence. You know you should get up. You know exactly what you should do. Nine minutes. Just nine more.' },
            { weight: 1, value: 'The alarm comes back and part of you expected it, and part of you is furious. You hit snooze. Your body makes a convincing argument for staying. You listen to it.' },
            // Low serotonin — the negotiation has weight
            { weight: State.lerp01(ser, 40, 20), value: 'Again. And this time there\'s something behind it — not just tired, but the specific reluctance of knowing what\'s on the other side of getting up. The alarm goes quiet. You stay.' },
          ]);
        } else {
          // Third+ snooze — guilt building
          return Timeline.weightedPick([
            { weight: 1, value: 'You hit snooze again and the guilt is there now, thin but present, accumulating with each press. You know. You know. Nine minutes won\'t fix anything. You press it anyway.' },
            { weight: 1, value: 'Snooze. Again. The ritual of it — sound, hand, silence, sinking. You\'re losing time you\'ll pay for later. You can feel that and you do it anyway because the alternative is now and now is too much.' },
            // High adenosine — guilt can't compete with the fog
            { weight: State.lerp01(aden, 40, 65), value: 'You should feel bad about this. You will, later. Right now the fog is thicker than the guilt and nine minutes is nine minutes is nine minutes.' },
            // Low serotonin — each snooze is a small defeat
            { weight: State.lerp01(ser, 40, 20), value: 'Again. And each time it\'s less about being tired and more about the thing you can\'t name — the weight of it, the knowing that getting up means starting and starting is the part you can\'t do. Nine more minutes of not starting.' },
          ]);
        }
      },
    },

    dismiss_alarm: {
      id: 'dismiss_alarm',
      label: 'Get up',
      location: 'apartment_bedroom',
      available: () => State.get('just_woke_alarm'),
      execute: () => {
        State.set('just_woke_alarm', false);
        State.advanceTime(1);

        Events.record('dismissed_alarm', { snoozeCount: State.get('snooze_count') });

        const count = State.get('snooze_count');
        const mood = State.moodTone();
        const energy = State.energyTier();

        if (count === 0) {
          // Dismissed immediately — no snoozes
          return Timeline.weightedPick([
            { weight: 1, value: 'You turn off the alarm and sit up. Just like that. Some mornings you can do it. This is one of them.' },
            { weight: 1, value: 'Alarm off. Feet on the floor. The air is cold and the bed is warm and you leave it anyway, the way you leave a conversation — just turning away before you can change your mind.' },
            // Good energy — body cooperates
            { weight: (energy === 'rested' || energy === 'alert') ? 0.8 : 0, value: 'The alarm, and you\'re up. Actually up, not the negotiation, not the bargaining — just a body that slept and is now vertical and mostly willing to be.' },
            // Heavy mood — up, but at cost
            { weight: (mood === 'heavy' || mood === 'numb') ? 0.6 : 0, value: 'You turn off the alarm and sit up because that\'s what happens next. Not because you want to. Because the alternative is lying here and you already know what lying here becomes.' },
          ]);
        } else if (count <= 2) {
          // A few snoozes — the typical morning
          return Timeline.weightedPick([
            { weight: 1, value: 'You turn off the alarm this time. Actually turn it off. Your body protests — loudly, in the language of heavy limbs and warm sheets — but you\'re up. You\'re up.' },
            { weight: 1, value: 'Enough. You sit up before you can hit snooze again. The room tilts slightly, then settles. The morning is waiting. It\'s been waiting.' },
            // Heavy mood — getting up is the hard part
            { weight: (mood === 'heavy') ? 0.5 : 0, value: 'You force yourself up and it takes everything the word "force" implies. The hardest part of the day is over. It\'s also the first part.' },
          ]);
        } else {
          // Many snoozes — running late, aware of it
          return Timeline.weightedPick([
            { weight: 1, value: 'You finally get up and the clock tells you what you already know — you\'re late, or close to it, and every snoozed minute is a minute you don\'t have. The day started without you.' },
            { weight: 1, value: 'Up. Finally. Your body moves like it\'s doing you a personal favor. The time — you don\'t want to look at the time, but you do, and it\'s exactly as bad as you thought.' },
          ]);
        }
      },
    },

    charge_phone: {
      id: 'charge_phone',
      label: 'Plug your phone in',
      location: 'apartment_bedroom',
      available: () => State.get('has_phone') && State.get('phone_battery') < 80 && !State.get('viewing_phone'),
      execute: () => {
        const minutes = Timeline.randomInt(15, 30);
        const chargeGain = (minutes / 60) * 30;
        State.advanceTime(minutes);
        State.adjustBattery(chargeGain);

        const mood = State.moodTone();
        const battery = State.batteryTier();

        if (battery === 'dead' || battery === 'critical') {
          if (mood === 'numb' || mood === 'heavy') {
            return 'You plug it in and wait. The screen stays dark for a while, then the charging icon appears. You watch it like it matters.';
          }
          return 'You plug it in. Dead phones take a minute to show signs of life. Eventually the screen lights up with the charging symbol.';
        }
        if (mood === 'numb' || mood === 'heavy') {
          return 'You plug the phone in and sit on the bed while it charges. Time passes. The cable isn\'t long enough to go anywhere.';
        }
        if (mood === 'fraying') {
          return 'You plug it in. Stand there for a minute watching the screen, then make yourself stop.';
        }
        return 'You plug the phone in and do nothing for a few minutes while it charges. The cable reaches the nightstand and that\'s about it.';
      },
    },

    check_phone_bedroom: {
      id: 'check_phone_bedroom',
      label: 'Check your phone',
      location: 'apartment_bedroom',
      available: () => State.get('has_phone') && State.get('phone_battery') > 0 && !State.get('viewing_phone'),
      execute: () => {
        State.set('viewing_phone', true);
        State.advanceTime(1);
        Events.record('checked_phone');
        return phoneScreenDescription();
      },
    },

    lie_there: {
      id: 'lie_there',
      label: 'Stay in bed',
      location: 'apartment_bedroom',
      available: () => true,
      execute: () => {
        const mood = State.moodTone();
        const minutes = Timeline.randomInt(10, 20);
        State.advanceTime(minutes);

        // NT values for continuous prose and mechanical shading
        const ser = State.get('serotonin');
        const ne = State.get('norepinephrine');
        const gaba = State.get('gaba');
        const aden = State.get('adenosine');

        let text;

        if (mood === 'fraying') {
          State.adjustStress(2);
          text = Timeline.weightedPick([
            { weight: 1, value: 'You lie there. The thoughts don\'t stop. They circle — the same three things, faster, tighter. You\'re not resting. You\'re trapped horizontally.' },
            { weight: 1, value: 'The ceiling. Your jaw is clenched. You notice it, unclench, and it\'s back thirty seconds later. The bed isn\'t helping.' },
            { weight: 1, value: 'You stay in bed. The quiet makes it worse — nothing to drown out what\'s in your head. Your body is still but nothing else is.' },
            // High NE — sensory overload even horizontal
            { weight: State.lerp01(ne, 60, 85), value: 'You lie down but the sheets are wrong. The texture. The temperature. Your skin is reading everything at twice the volume.' },
            // Low GABA — no way to settle
            { weight: State.lerp01(gaba, 35, 15), value: 'The bed should help. Lying down should help. Nothing is helping. Your body is still but everything underneath is running.' },
          ]);
        } else if (mood === 'numb') {
          text = Timeline.weightedPick([
            { weight: 1, value: 'You lie there. Time passes. You know this because the light changes slightly. That\'s the only evidence.' },
            { weight: 1, value: 'The bed. The ceiling. The space between them, with you in it. Nothing moves. Nothing needs to.' },
            { weight: 1, value: 'You stay. It\'s not rest and it\'s not not-rest. It\'s just the absence of getting up.' },
            // Very low serotonin — numb is deep
            { weight: State.lerp01(ser, 30, 10), value: 'You lie there. You could be anyone. You could be no one. It wouldn\'t change what the ceiling looks like.' },
          ]);
        } else if (mood === 'heavy') {
          // Mechanical shading: low GABA means anxiety under the heaviness — no relief from lying down
          if (gaba < 35) {
            // Heavy + anxious: bed doesn't help, stress stays
            State.adjustStress(0);
          } else {
            State.adjustStress(-1);
          }
          text = Timeline.weightedPick([
            { weight: 1, value: 'You stay in bed. The pressure to be somewhere, do something — it\'s still there, but quieter when you\'re lying down. Barely.' },
            { weight: 1, value: 'The pillow is warm from your head. You turn it over. The cool side. Small.' },
            { weight: 1, value: 'You don\'t get up. Nobody is asking you to. That helps, a little, in a way that also doesn\'t help.' },
            // Low serotonin — heavy and sinking
            { weight: State.lerp01(ser, 35, 15), value: 'You lie there. The mattress takes your shape and you let it. Getting back out of this shape seems like a problem for someone else.' },
            // Low GABA — heavy but can't rest
            { weight: State.lerp01(gaba, 40, 20), value: 'You stay in bed. It doesn\'t help. There\'s a hum underneath the heaviness, a vibration that won\'t let the weight settle into rest.' },
          ]);
        } else if (mood === 'hollow' || mood === 'quiet') {
          State.adjustStress(-1);
          text = Timeline.weightedPick([
            { weight: 1, value: 'You lie there. The room is quiet. You\'re quiet. The two of you have an understanding.' },
            { weight: 1, value: 'Just being. The bed, the air, the sound of nothing in particular. It\'s not peace. But it\'s not war.' },
            { weight: 1, value: 'You stay. The quiet settles. Not comfortable exactly — but not uncomfortable either. Just still.' },
            // Higher serotonin — quiet tips toward gentle
            { weight: State.lerp01(ser, 45, 65), value: 'You lie there. The quiet isn\'t asking anything. Neither are you. Something about that is almost okay.' },
            // High NE — quiet but wired
            { weight: State.lerp01(ne, 45, 70), value: 'You stay still. The quiet should be restful but you\'re listening for something. You don\'t know what. The listening doesn\'t stop.' },
          ]);
        } else if (mood === 'clear' || mood === 'present') {
          State.adjustStress(-2);
          text = Timeline.weightedPick([
            { weight: 1, value: 'You lie still. Actually still — not the holding-still of trying to sleep, just the stillness of not needing to move. Your breath slows. Something loosens.' },
            { weight: 1, value: 'The sheets, the light, the quiet. You\'re lying here because you can. That\'s the whole reason. It\'s enough.' },
            { weight: 1, value: 'You stay in bed. Not sleeping, not trying to. Just being horizontal in a room that asks nothing of you. Something settles.' },
            // High serotonin — genuinely warm
            { weight: State.lerp01(ser, 60, 80), value: 'You lie there and your body is quiet. Not tired-quiet. Just — at ease. The kind of still that\'s chosen, not collapsed into.' },
          ]);
        } else {
          // flat
          text = Timeline.weightedPick([
            { weight: 1, value: 'You lie there for a while. The ceiling doesn\'t change. Neither do you. Eventually you shift, but that\'s about it.' },
            { weight: 1, value: 'Time passes. You\'re in bed. These are the facts. Nothing else happens.' },
            { weight: 1, value: 'You stay. Not resting, not thinking, not anything in particular. Just lying there because you\'re already lying there.' },
            // Low serotonin — flat has an undertow
            { weight: State.lerp01(ser, 42, 25), value: 'You lie there. It should be nothing. It is nothing. But the nothing has a color to it and the color isn\'t good.' },
            // High NE — flat but restless
            { weight: State.lerp01(ne, 45, 65), value: 'You lie there. Your foot moves. Your hand adjusts the sheet. Small things that aren\'t rest and aren\'t decisions. Just the body fidgeting with itself.' },
          ]);
        }

        // Deterministic modifiers — no RNG consumed
        if (aden > 70) {
          text += ' Everything is soft at the edges. The kind of tired that blurs.';
        }

        return text;
      },
    },

    look_out_window: {
      id: 'look_out_window',
      label: 'Look out the window',
      location: 'apartment_bedroom',
      available: () => true,
      execute: () => {
        const mood = State.moodTone();
        const weather = State.get('weather');
        const minutes = Timeline.randomInt(5, 10);
        State.advanceTime(minutes);

        // Rain sound sentiment — serotonin nudge during drizzle + habituation
        const rc = State.sentimentIntensity('rain_sound', 'comfort');
        if (weather === 'drizzle' && rc > 0) {
          State.adjustNT('serotonin', rc * 2);
          State.adjustSentiment('rain_sound', 'comfort', -0.002);
        }

        // NT values for continuous prose shading
        const ser = State.get('serotonin');
        const ne = State.get('norepinephrine');
        const dopa = State.get('dopamine');
        const gaba = State.get('gaba');
        const aden = State.get('adenosine');

        // Weather sentiment
        const weatherComfort = State.sentimentIntensity('weather_' + weather, 'comfort');

        if (mood === 'numb') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You look out the window. The street is there. People, cars, the sky. You see all of it. None of it registers.' },
            { weight: 1, value: 'The window. The world on the other side of the glass. You watch it like it\'s on a screen — present, visible, not quite real.' },
            { weight: 1, value: 'Outside exists. You can see it. Knowing that doesn\'t do anything, but you look anyway.' },
            // Low dopamine — nothing catches
            { weight: State.lerp01(dopa, 40, 15), value: 'You look out. Things move — a person, a car, a bird. Your eyes follow without your permission. None of it reaches the part of you that would care.' },
          ]);
        }
        if (mood === 'heavy') {
          return Timeline.weightedPick([
            { weight: 1, value: 'The world outside. People going places. You\'re in here. The glass between you and that is thin but it might as well be a wall.' },
            { weight: 1, value: 'You look out. Trees, if there are trees. Sky. The distance between you and all of it feels wider than the window.' },
            { weight: 1, value: 'Outside is happening. You watch it from the bed. The effort of being out there — even thinking about it is a lot.' },
            // Low serotonin — the distance is heavier
            { weight: State.lerp01(ser, 35, 15), value: 'You look out and the world is right there, close enough to touch if you opened the window. You won\'t. The distance isn\'t the glass. It\'s everything between you and being a person who goes outside.' },
          ]);
        }
        if (mood === 'fraying') {
          if (weather === 'clear') {
            State.adjustStress(-2);
            return Timeline.weightedPick([
              { weight: 1, value: 'You look out. Clear sky. The light is doing something good today — something open. Your shoulders drop half an inch. It helps.' },
              { weight: 1, value: 'The window. Blue out there, or close to it. Your eyes rest on the sky because it\'s the only thing not asking anything of you.' },
              { weight: 1, value: 'Clear outside. The light comes in and touches the floor. You stand in it for a minute. Something loosens, slightly.' },
              // Higher serotonin — the light actually reaches you
              { weight: State.lerp01(ser, 40, 60), value: 'The sky is clear and the light comes in and for a second it\'s just light — not an accusation, not a reminder. Just warmth on your face. Your shoulders come down. Your breath comes easier.' },
            ]);
          }
          return Timeline.weightedPick([
            { weight: 1, value: 'You look out the window. Grey. The same grey as the inside of your head. It doesn\'t help.' },
            { weight: 1, value: 'Outside is flat and overcast. You were hoping for something — you\'re not sure what. This isn\'t it.' },
            { weight: 1, value: 'The window. Rain, or the threat of it. The world out there looks exactly like you feel.' },
            // Low GABA — the grey presses in
            { weight: State.lerp01(gaba, 40, 20), value: 'You look out and the grey is everywhere — the sky, the buildings, the flat light on the street. It presses against the glass. You step back without deciding to.' },
            // Rain lover during drizzle — the sound helps even when fraying
            { weight: weather === 'drizzle' && rc > 0 ? rc * 0.6 : 0, value: 'You look out. Grey, drizzle, the streaked glass. But the sound of the rain — that steady tapping — is doing something. Somewhere beneath the noise in your head, the rain is a rhythm you can hold onto.' },
          ]);
        }
        if (mood === 'hollow') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You look out. Someone\'s walking a dog. Someone else is carrying groceries. People with destinations. You watch.' },
            { weight: 1, value: 'The window shows the usual. The street, the building opposite. A life-sized diorama of people going somewhere.' },
            { weight: 1, value: 'Outside. People. Movement. The glass keeps the sound out. You watch like it\'s an aquarium.' },
            // Low dopamine — watching without any pull to join
            { weight: State.lerp01(dopa, 40, 20), value: 'Someone crosses the street. Someone else waits at the corner. You watch them the way you\'d watch a screensaver — movement without meaning, pattern without pull.' },
          ]);
        }
        if (mood === 'clear' || mood === 'present') {
          State.adjustStress(-3);
          return Timeline.weightedPick([
            { weight: 1, value: 'You look out the window. The light, the sky, the ordinary scene below — it\'s actually nice. The kind of nice you can feel today.' },
            { weight: 1, value: 'The view. Nothing special — rooftops, sky, a tree if you lean. But you\'re seeing it. Actually seeing it. That\'s different.' },
            { weight: 1, value: 'You stand at the window. The world is out there, doing its thing. For a minute you\'re part of it, watching from the inside. Something close to peace.' },
            // High serotonin + NE — vivid and warm
            { weight: State.lerp01(ser, 55, 75) * State.lerp01(ne, 40, 60), value: 'The light is good today. You notice the color of the sky, the way shadows fall on the building opposite, a bird sitting on a wire. Small things, all of them clear, all of them enough. You stay at the window longer than you meant to.' },
            // Rain lover during drizzle — rain on glass
            { weight: weather === 'drizzle' && rc > 0 ? rc : 0, value: 'Rain on the glass. You stand at the window and watch it run in lines down the pane. The sound of it — steady, close, the whole world softened by water. Something in you settles. You stay.' },
            // Weather comfort — the weather itself lands
            { weight: weatherComfort > 0 ? weatherComfort * 0.7 : 0, value: 'You look out and the weather is right. Not dramatically — just quietly right, the way only your kind of weather can be. The sky, the light, the feel of the air through the cracked window. You stand there and let it reach you.' },
          ]);
        }
        // flat
        State.adjustStress(-1);
        return Timeline.weightedPick([
          { weight: 1, value: 'You look out. The usual view. It\'s something to look at that isn\'t the room.' },
          { weight: 1, value: 'The window. Outside. Not much happening, but you look for a while anyway.' },
          { weight: 1, value: 'You watch the street for a few minutes. Nothing in particular. It passes the time.' },
          // High adenosine — the view is soft
          { weight: State.lerp01(aden, 50, 75), value: 'You look out. The view is there but soft — edges blurred, details optional. You watch without really watching. The tiredness makes it all a little far away.' },
          // Rain lover during drizzle — rain on glass
          { weight: weather === 'drizzle' && rc > 0 ? rc * 0.7 : 0, value: 'You look out. The rain runs down the glass in slow lines. The sound of it is something you don\'t have a word for, just a feeling. You watch.' },
        ]);
      },
    },

    // === KITCHEN ===
    eat_food: {
      id: 'eat_food',
      label: 'Eat something',
      location: 'apartment_kitchen',
      available: () => State.fridgeTier() !== 'empty',
      execute: () => {
        State.set('fridge_food', State.get('fridge_food') - 1);
        Dishes.use();
        State.adjustHunger(-35);
        State.set('ate_today', true);
        State.set('consecutive_meals_skipped', 0);
        State.advanceTime(15);
        Events.record('ate', { what: 'fridge_food' });

        // Food comfort sentiment — small serotonin nudge + habituation
        const fc = State.sentimentIntensity('eating', 'comfort');
        if (fc > 0) {
          State.adjustNT('serotonin', fc * 3);
          State.adjustSentiment('eating', 'comfort', -0.003);
        }

        const hunger = State.hungerTier();
        const mood = State.moodTone();
        const ser = State.get('serotonin');
        const aden = State.get('adenosine');
        const dopa = State.get('dopamine');

        if (mood === 'numb') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You eat. It goes in. You don\'t taste much of it, but your body takes it without complaint.' },
            { weight: 1, value: 'Food. You put it together, put it in. The motions of eating without the experience of it.' },
            // Low dopamine — eating is mechanical
            { weight: State.lerp01(dopa, 40, 15), value: 'You eat because the body requires it. Fork to mouth, chew, swallow. The flavors are there, technically. They don\'t reach you.' },
          ]);
        }
        if (hunger === 'starving' || hunger === 'very_hungry') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You eat too fast. Standing at the counter, not even sitting down. It helps. It helps a lot, actually.' },
            { weight: 1, value: 'You eat standing up, barely tasting it. Your body was louder than you realized. The relief is immediate and physical.' },
            // High food comfort — the eating itself is a release
            { weight: fc > 0 ? fc : 0, value: 'You eat too fast and it doesn\'t matter — the warmth of it, the taste, the simple animal fact of being fed. Something unwinds. Your body thanks you the only way it knows how.' },
          ]);
        }
        return Timeline.weightedPick([
          { weight: 1, value: 'You put something together from what\'s there and eat it. Nothing special. It\'s enough.' },
          { weight: 1, value: 'Something from the fridge. You eat it at the counter. It\'s food. It does the job.' },
          // High food comfort — eating is a small pleasure
          { weight: fc > 0 ? fc : 0, value: 'You make something simple from what\'s there and eat it slowly. The warmth of it, the familiar taste. A small comfort, but a real one.' },
          // High adenosine — eating through fog
          { weight: State.lerp01(aden, 55, 75), value: 'You eat something. Standing at the counter, half-awake, chewing without really tasting. The food goes in. Your body processes it somewhere behind the fog.' },
        ]);
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

        // NT deterministic variants (no RNG — replay-safe)
        const energy = State.energyTier();
        const aden = State.get('adenosine');
        const mood = State.moodTone();

        if (energy === 'depleted' || energy === 'exhausted') {
          return 'Water from the tap. You drink it standing at the sink. Your body wanted it more than you realized.';
        }
        if (aden > 60 && (mood === 'numb' || mood === 'heavy')) {
          return 'Water. Something your body can process without much thought from you.';
        }
        return 'You fill a glass and drink it. Tap water. It\'s fine.';
      },
    },

    make_coffee: {
      id: 'make_coffee',
      label: 'Make coffee',
      location: 'apartment_kitchen',
      available: () => State.caffeineTier() !== 'high',
      execute: () => {
        State.consumeCaffeine(50);
        State.advanceTime(Timeline.randomInt(5, 8));

        const mood = State.moodTone();
        const aden = State.get('adenosine');
        const caffeine = State.caffeineTier();

        // Second cup — already caffeinated
        if (caffeine === 'active') {
          return Timeline.weightedPick([
            { weight: 1, value: 'The second one. The first one wore off faster than it should have.' },
            { weight: State.lerp01(aden, 40, 80), value: 'You weren\'t done needing it yet. The second cup goes down the same way as the first.' },
          ]);
        }

        // First cup of the day
        if (mood === 'numb' || mood === 'hollow') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You make coffee. Something to do with your hands. The smell is better than it usually is.' },
            { weight: State.lerp01(aden, 40, 80), value: 'Coffee. Your brain needs something to hold onto. The warmth helps, a little.' },
          ]);
        }
        if (mood === 'heavy' || mood === 'fraying') {
          return Timeline.weightedPick([
            { weight: 1, value: 'Coffee. You need the ritual as much as the caffeine. The kettle, the wait, the first sip.' },
            { weight: State.lerp01(aden, 50, 85) * State.adenosineBlock(), value: 'You\'re dragging. The coffee is supposed to help with that.' },
          ]);
        }
        return Timeline.weightedPick([
          { weight: 1, value: 'You make coffee. The machine goes through its routine. You go through yours.' },
          { weight: State.lerp01(aden, 30, 70) * State.adenosineBlock(), value: 'You make coffee. It\'s early enough that it feels necessary.' },
          { weight: State.lerp01(State.get('serotonin'), 50, 80), value: 'Coffee. The smell fills the kitchen before it\'s even done.' },
        ]);
      },
    },

    do_dishes: {
      id: 'do_dishes',
      label: 'Deal with the dishes',
      location: 'apartment_kitchen',
      available: () => Dishes.dirtyCount() > 0 && State.energyTier() !== 'depleted',
      execute: () => {
        Dishes.wash();
        // Also reduce apartment_mess — still tracks general disorder until Clothing covers it
        State.set('apartment_mess', Math.max(0, State.get('apartment_mess') - 25));
        State.set('surfaced_mess', 0);
        State.adjustEnergy(-8);
        State.adjustStress(-5);
        State.advanceTime(15);

        const mood = State.moodTone();
        const sinkClear = Dishes.dirtyCount() === 0;
        const aden = State.get('adenosine');

        if (sinkClear) {
          // Sink is now empty
          if (mood === 'heavy' || mood === 'numb') {
            return 'You wash dishes. The warm water helps more than it should. When you dry your hands, the sink is empty. The counter has its surface back. One thing, at least, dealt with.';
          }
          return 'Warm water, soap, the rhythm of it. When you\'re done the sink is empty, the counter clear. The kitchen looks like someone lives here on purpose.';
        }
        if (mood === 'heavy' || mood === 'numb') {
          return 'You wash dishes. The warm water is the closest thing to comfort available right now. One thing, at least, is done.';
        }
        if (aden > 65) {
          return 'Your hands know what to do without you deciding anything. Hot water, soap, the stack going down. When it\'s over you\'re not sure how long it took.';
        }
        return 'You wash the dishes. Warm water, soap, the repetition of it. The kitchen looks a little more like someone lives here on purpose.';
      },
    },

    check_phone_kitchen: {
      id: 'check_phone_kitchen',
      label: 'Check your phone',
      location: 'apartment_kitchen',
      available: () => State.get('has_phone') && State.get('phone_battery') > 0 && !State.get('viewing_phone'),
      execute: () => {
        State.set('viewing_phone', true);
        State.advanceTime(1);
        Events.record('checked_phone');
        return phoneScreenDescription();
      },
    },

    sit_at_table: {
      id: 'sit_at_table',
      label: 'Sit at the table',
      location: 'apartment_kitchen',
      available: () => true,
      execute: () => {
        const mood = State.moodTone();
        const minutes = Timeline.randomInt(5, 15);
        State.advanceTime(minutes);

        // Quiet sentiment — the kitchen is a quiet space + habituation
        const qc = State.sentimentIntensity('quiet', 'comfort');
        const qi = State.sentimentIntensity('quiet', 'irritation');
        if (qc > 0) {
          State.adjustNT('serotonin', qc * 2);
          State.adjustSentiment('quiet', 'comfort', -0.002);
        }
        if (qi > 0) {
          State.adjustNT('norepinephrine', qi * 2);
          State.adjustSentiment('quiet', 'irritation', -0.001);
        }

        // NT values for continuous prose shading
        const ser = State.get('serotonin');
        const ne = State.get('norepinephrine');
        const dopa = State.get('dopamine');
        const gaba = State.get('gaba');
        const aden = State.get('adenosine');

        if (mood === 'numb') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You sit at the table. The surface is cool under your hands. You sit there. That\'s it.' },
            { weight: 1, value: 'The kitchen table. You\'re at it. The fridge hums. Minutes pass. You don\'t move.' },
            { weight: 1, value: 'Sitting. The table, the chair, the quiet kitchen. You\'re here. That\'s the whole event.' },
            // Low dopamine — nothing to reach for
            { weight: State.lerp01(dopa, 40, 15), value: 'You sit at the table. Your hands are on the surface. You could get up. You could do something. The thought arrives and lies there, flat, like everything else.' },
          ]);
        }
        if (mood === 'heavy') {
          State.adjustEnergy(1);
          return Timeline.weightedPick([
            { weight: 1, value: 'You sit. The chair takes your weight. Not standing is something. Not much, but something.' },
            { weight: 1, value: 'The kitchen table. You put your arms on it and lean forward. The not-standing helps. Your body is grateful for small mercies.' },
            { weight: 1, value: 'You sit down. The effort of being upright transfers to the chair. Your back says thank you in its own way.' },
            // Low serotonin — sitting doesn't ease the weight
            { weight: State.lerp01(ser, 35, 15), value: 'You sit. The chair holds you. You put your head on the table and the cool surface is the only good thing. You stay like that for a while, folded over, not resting.' },
          ]);
        }
        if (mood === 'fraying') {
          State.adjustStress(-1);
          return Timeline.weightedPick([
            { weight: 1, value: 'You sit at the table. The kitchen is quieter than the rest of your head. Barely, but it\'s something.' },
            { weight: 1, value: 'The table. Your hands on it. The solidity of a flat surface. The fridge hum. For a minute the noise inside dims, slightly.' },
            { weight: 1, value: 'You sit. The kitchen has a specific quiet — the fridge, the clock, the tap. It\'s not peaceful. But it\'s not loud.' },
            // Low GABA — can't settle even sitting
            { weight: State.lerp01(gaba, 40, 20), value: 'You sit but your leg bounces. Your fingers drum the table. The kitchen is quiet and the quiet makes room for the thing that won\'t stop running in your chest.' },
            // Quiet irritation — the silence is wrong
            { weight: qi > 0 ? qi * 0.8 : 0, value: 'You sit at the table and the quiet presses in. The fridge hum. The clock. The specific silence of a room with nobody in it. Your skin prickles. You need noise, or movement, or something.' },
          ]);
        }
        if (mood === 'hollow') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You sit at the kitchen table. The chair. The surface. The quiet. You\'re sitting because you walked in here and this is what\'s here.' },
            { weight: 1, value: 'The table. You sit at it. Not eating, not doing anything. Just occupying a chair in a room where chairs exist.' },
            { weight: 1, value: 'You sit. The kitchen is empty in the way it always is. You\'re in it. The clock ticks, or doesn\'t. Hard to tell.' },
            // High adenosine — the sitting is heavy
            { weight: State.lerp01(aden, 50, 75), value: 'You sit down and your body thanks you by getting heavier. The table is a surface to put your arms on. Your eyelids are interested in closing. The kitchen hums around you, distant.' },
          ]);
        }
        if (mood === 'clear' || mood === 'present') {
          State.adjustStress(-2);
          return Timeline.weightedPick([
            { weight: 1, value: 'You sit at the table. The kitchen is quiet. Your hands are warm. Something close to comfort — the kind you don\'t notice until you\'re in it.' },
            { weight: 1, value: 'The kitchen table. The light from the window. You sit and it\'s fine — actually fine, not the word you say when nothing is. Just sitting, in a room, and it\'s okay.' },
            { weight: 1, value: 'You sit. The apartment is still. The fridge hums its one note. For a few minutes, that\'s all there is, and that\'s enough.' },
            // Higher serotonin — warmth settles in
            { weight: State.lerp01(ser, 55, 75), value: 'You sit at the table and the kitchen holds you. The light, the quiet, the smell of the place you live. Your hands are warm. Your chest is easy. You stay because staying feels like the right thing.' },
            // Quiet comfort — the silence is the point
            { weight: qc > 0 ? qc : 0, value: 'You sit at the table and the quiet is perfect. Not empty — full of small things. The fridge, the light, the particular stillness of a room you\'re alone in. Something in you expands into the silence. You needed this.' },
          ]);
        }
        // flat / quiet
        State.adjustStress(-1);
        return Timeline.weightedPick([
          { weight: 1, value: 'You sit at the table for a while. Not doing anything. The kitchen is the kitchen. Time passes.' },
          { weight: 1, value: 'The table. You sit at it. The microwave clock changes. That\'s the most interesting thing that happens.' },
          { weight: 1, value: 'You sit. It\'s not productive, it\'s not restful, it\'s just sitting in a kitchen. Sometimes that\'s what there is.' },
          // High NE — aware of every small sound
          { weight: State.lerp01(ne, 45, 65), value: 'You sit at the table. The fridge cycles on. A pipe ticks somewhere in the wall. Your body is still but your ears are busy — cataloguing the kitchen\'s small noises like they matter.' },
          // Quiet irritation — the stillness is wrong
          { weight: qi > 0 ? qi * 0.5 : 0, value: 'You sit at the table. The quiet is too much. You tap your fingers, shift in the chair. The kitchen hums its one note and you wish it would hum a different one.' },
        ]);
      },
    },

    // === BATHROOM ===
    shower: {
      id: 'shower',
      label: 'Take a shower',
      location: 'apartment_bathroom',
      available: () => !State.get('showered') && State.energyTier() !== 'depleted',
      execute: () => {
        State.set('showered', true);
        Linens.useTowel();
        State.adjustEnergy(-3);
        State.adjustStress(-8);
        State.advanceTime(15);
        Events.record('showered');

        // Warmth comfort sentiment — extra stress relief + habituation
        const wc = State.sentimentIntensity('warmth', 'comfort');
        if (wc > 0) {
          State.adjustStress(-wc * 3);
          State.adjustSentiment('warmth', 'comfort', -0.002);
        }

        const mood = State.moodTone();
        const energy = State.energyTier();

        if (mood === 'numb' || mood === 'heavy') {
          return Timeline.weightedPick([
            { weight: 1, value: 'The water is warm. You stand in it longer than you need to. The world outside the shower curtain can wait.' },
            { weight: 1, value: 'Hot water. You stand under it. The steam fills the small room. For a few minutes, the world is just this.' },
            // High warmth comfort — the heat is an anchor
            { weight: wc > 0 ? wc : 0, value: 'The water is hot and you stand in it and the heat is the only good thing. It seeps through the skin to wherever the cold lives. You stay until the room is all steam and your fingers are wrinkled and the world outside is someone else\'s problem.' },
          ]);
        }
        if (energy === 'tired' || energy === 'exhausted') {
          return Timeline.weightedPick([
            { weight: 1, value: 'Hot water. It doesn\'t fix anything but it makes the surface of things bearable. You get out when it starts going cold.' },
            { weight: 1, value: 'The shower runs hot and you lean into it. Your body is tired enough to just stand there and let the water do something.' },
            // High warmth comfort — the heat reaches the exhaustion
            { weight: wc > 0 ? wc : 0, value: 'The hot water hits your shoulders and something lets go. Not everything — but the layer closest to the surface. The warmth finds the tired places. You stay longer than you should.' },
          ]);
        }
        return Timeline.weightedPick([
          { weight: 1, value: 'A shower. Hot water, steam, the sound of it. You feel more like a person when you step out.' },
          { weight: 1, value: 'You shower. The water is hot, the bathroom fills with steam. When you step out, you\'re clean. That\'s something.' },
          // High warmth comfort — the hot water is an old friend
          { weight: wc > 0 ? wc : 0, value: 'The hot water is an old comfort. You stand in it past the point of clean, just for the heat, just for the sound. When you step out the mirror is fogged and your skin is flushed and something is a little easier than it was.' },
        ]);
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

        // NT deterministic variants (no RNG — replay-safe)
        const mood = State.moodTone();
        const aden = State.get('adenosine');
        const ne = State.get('norepinephrine');
        const ser = State.get('serotonin');

        if (mood === 'numb' || mood === 'hollow') {
          return 'Cold water. You go through the motions. The face in the mirror is yours. You don\'t stay to look.';
        }
        if (aden > 70) {
          return 'Cold water on your face. The shock of it is the point. You stand there dripping for a second, waiting to feel more awake.';
        }
        if (ne > 65) {
          return 'Water on your face. The cold is immediate, distinct. Your hands on the edges of the sink, grounded.';
        }
        if (ser < 35) {
          return 'Cold water. You look at yourself in the mirror. You look away before the looking becomes something.';
        }
        return 'Cold water on your face. You look at yourself in the mirror, briefly. You look away.';
      },
    },

    take_pain_reliever: {
      id: 'take_pain_reliever',
      label: 'Take something for the headache',
      location: 'apartment_bathroom',
      available: () => State.hasCondition('migraines') && State.migraineTier() !== 'none',
      execute: () => {
        // Pain reliever cuts intensity by ~35 points — takes the edge off but doesn't end it
        State.set('migraine_intensity', Math.max(0, State.get('migraine_intensity') - 35));
        State.advanceTime(Timeline.randomInt(3, 6));

        const tier = State.migraineTier();
        const mood = State.moodTone();

        if (tier === 'none') {
          return Timeline.weightedPick([
            { weight: 1, value: 'The pill. You wash it down and wait. By the time you leave the bathroom the worst of it is already lifting.' },
            { weight: 1, value: 'You take two. The headache recedes — not gone, but manageable. You can think again.' },
          ]);
        }
        if (State.get('migraine_intensity') <= 20) {
          return Timeline.weightedPick([
            { weight: 1, value: 'The medication is doing something. The throb is still there but the edge has come off it. You can tolerate light now.' },
            { weight: State.lerp01(State.get('migraine_intensity'), 20, 5), value: 'The headache is quieting. Not gone — never quite gone — but livable. You hold still for a minute, waiting to be sure.' },
          ]);
        }
        return Timeline.weightedPick([
          { weight: 1, value: 'You swallow it and stand at the sink. The headache doesn\'t respond immediately. It will. You\'ve done this before.' },
          { weight: 1, value: 'Two tablets and the tap. You lean against the sink and wait. The pill will work. You just have to be still for a while.' },
          { weight: State.lerp01(State.get('serotonin'), 40, 20), value: 'You take the medication in the dark. Light makes it worse. You close your eyes and wait for the pills to do something. They usually do. Eventually.' },
        ]);
      },
    },

    // === STREET ===
    check_phone_street: {
      id: 'check_phone_street',
      label: 'Check your phone',
      location: 'street',
      available: () => State.get('has_phone') && State.get('phone_battery') > 0 && !State.get('viewing_phone'),
      execute: () => {
        State.set('viewing_phone', true);
        State.advanceTime(1);
        Events.record('checked_phone');
        return phoneScreenDescription();
      },
    },

    sit_on_step: {
      id: 'sit_on_step',
      label: 'Sit on the step for a minute',
      location: 'street',
      available: () => ['depleted', 'exhausted', 'tired'].includes(State.energyTier()),
      execute: () => {
        State.adjustEnergy(3);
        State.advanceTime(Timeline.randomInt(5, 12));

        const mood = State.moodTone();
        const weather = State.get('weather');

        if (weather === 'snow') {
          return 'You sit on the step. Cold through your clothes immediately. The street is muffled, quieted. You stay a minute anyway.';
        }
        if (weather === 'drizzle') {
          return 'You sit on the step under the awning. Rain taps the concrete. A few minutes. No one bothers you about it.';
        }
        if (mood === 'hollow' || mood === 'quiet') {
          return 'You sit. Watch people. They\'re all going places. You\'re sitting. Both of these things are fine.';
        }

        // NT deterministic shading (no RNG — replay-safe)
        const aden = State.get('adenosine');
        const ne = State.get('norepinephrine');
        if (aden > 65) {
          return 'You sit down. Your body asked for this before the rest of you decided.';
        }
        if (ne > 65) {
          return 'You sit on the step. The street goes on around you — cars, footsteps, someone\'s music. A lot for a step.';
        }
        return 'You sit on the step. Just for a minute. The air is better than inside.';
      },
    },

    go_for_walk: {
      id: 'go_for_walk',
      label: 'Walk for a while',
      location: 'street',
      available: () => State.energyTier() !== 'depleted' && State.migraineTier() !== 'severe',
      execute: () => {
        const mood = State.moodTone();
        const weather = State.get('weather');
        const minutes = Timeline.randomInt(15, 30);
        const energyCost = Timeline.randomInt(5, 8);

        State.advanceTime(minutes);
        State.adjustEnergy(-energyCost);

        // Outside comfort sentiment — serotonin nudge + habituation
        const oc = State.sentimentIntensity('outside', 'comfort');
        if (oc > 0) {
          State.adjustNT('serotonin', oc * 2);
          State.adjustSentiment('outside', 'comfort', -0.002);
        }

        // NT values for continuous prose shading
        const ser = State.get('serotonin');
        const ne = State.get('norepinephrine');
        const dopa = State.get('dopamine');
        const gaba = State.get('gaba');
        const aden = State.get('adenosine');

        // Rain sound sentiment (for drizzle prose)
        const rc = State.sentimentIntensity('rain_sound', 'comfort');
        // Weather sentiment
        const weatherComfort = State.sentimentIntensity('weather_' + weather, 'comfort');

        // Weather modifier — drizzle adds discomfort
        if (weather === 'drizzle') {
          State.adjustStress(2);
        }

        // Stress effect depends on mood
        if (mood === 'clear' || mood === 'present') {
          State.adjustStress(-8);
          if (weather === 'drizzle') {
            return Timeline.weightedPick([
              { weight: 1, value: 'You walk. The drizzle is cold on your face but the air is good. Your legs find a rhythm. The wet doesn\'t ruin it — just changes the texture.' },
              { weight: 1, value: 'Rain on your jacket. Your shoes get damp. But the walking helps — the movement, the air, the world being bigger than a room. It\'s worth it.' },
              // High NE — the rain is vivid
              { weight: State.lerp01(ne, 45, 65), value: 'The rain is on your face and you can feel every drop — distinct, cold, alive. Your feet on the wet pavement. The smell of it. The world in the rain is a specific, sharp thing, and you\'re in it.' },
              // Rain lover — the drizzle is welcome
              { weight: rc > 0 ? rc : 0, value: 'You walk in the rain and it\'s good. The sound of it on your jacket, the wet air, the way the street smells different. Something about rain has always been yours. You walk slower than you need to.' },
            ]);
          }
          return Timeline.weightedPick([
            { weight: 1, value: 'You walk. No destination, just movement. The air is different from inside — wider, cooler, real. Your thoughts spread out. Something loosens in your chest.' },
            { weight: 1, value: 'A walk. Around the block, then further because it feels good to keep going. Your legs know what to do. Your head quiets down. The world passes at a human speed.' },
            { weight: 1, value: 'You walk until the apartment feels far away. The sky, the street, the sound of your own footsteps. This is what outside is for.' },
            // High serotonin + dopamine — the walk is actually good
            { weight: State.lerp01(ser, 55, 75) * State.lerp01(dopa, 50, 70), value: 'You walk, and the walking is good. Not because anything is happening — just the rhythm, the air, the way your body knows how to do this. The street unfolds. The sky is big. You feel like a person in the world, and it\'s enough.' },
            // Outside lover — being out is the point
            { weight: oc > 0 ? oc : 0, value: 'You walk and the outside is enough. The air, the space, the sky that goes on without you. Your body knows this — the way it loosens, the way your breath comes easier. You needed out. This is out.' },
          ]);
        }
        if (mood === 'flat') {
          State.adjustStress(-4);
          if (weather === 'drizzle') {
            return Timeline.weightedPick([
              { weight: 1, value: 'You walk in the drizzle. Your jacket darkens at the shoulders. The movement helps some — not a lot, but some. You come back damp.' },
              { weight: 1, value: 'Rain. You walk through it because you\'re already out. It\'s not pleasant but the walking itself does something. Slightly.' },
              // High adenosine — the walk is a slog
              { weight: State.lerp01(aden, 50, 70), value: 'You walk in the rain and your legs are heavy. The dampness seeps into your shoes. Each block takes more than the last. The air helps, barely. You come back tired and wet.' },
              // Rain lover — the drizzle is okay
              { weight: rc > 0 ? rc * 0.7 : 0, value: 'You walk in the drizzle and it\'s fine, actually. The sound of rain on your hood. The wet streets. Not everyone likes this. You don\'t mind it.' },
            ]);
          }
          return Timeline.weightedPick([
            { weight: 1, value: 'You walk. It\'s not transformative. But the air is different and your legs are moving and that\'s better than not.' },
            { weight: 1, value: 'A walk. The neighborhood. You\'ve seen it before. But moving through it is different from being inside looking at walls. It helps, some.' },
            { weight: 1, value: 'You walk for a while. It doesn\'t fix anything. But the blood moves and the air gets in and when you stop you feel slightly less like you were cemented to the floor.' },
            // Higher NE — details register more than usual
            { weight: State.lerp01(ne, 40, 60), value: 'You walk. You notice things — the crack in the sidewalk, the color of someone\'s door, a sound from a window. Details that don\'t matter but your brain collects them anyway, like it needed something to do.' },
          ]);
        }
        if (mood === 'heavy') {
          State.adjustStress(-2);
          if (weather === 'drizzle') {
            return Timeline.weightedPick([
              { weight: 1, value: 'You walk in the rain. Every step costs something. The wet gets into your shoes. But the air — the air is different from inside. That\'s something.' },
              { weight: 1, value: 'Drizzle. You walk through it slowly. The world is grey and wet and you\'re in it. The effort is real. So is the fact that you went outside.' },
              // Low serotonin — the effort is almost too much
              { weight: State.lerp01(ser, 35, 15), value: 'You walk in the rain and every step asks why. The wet, the cold, the weight of your own legs. You did this to yourself. You chose outside. It\'s unclear what it was supposed to fix.' },
            ]);
          }
          return Timeline.weightedPick([
            { weight: 1, value: 'You walk. Slowly. The effort of being outside is real — the bodies, the noise, the fact of being vertical and moving. But the air changes things, slightly.' },
            { weight: 1, value: 'A walk. Your body does it reluctantly. The street, the sounds, the sky that\'s bigger than any ceiling. By the end something has shifted — not much, but it\'s there.' },
            { weight: 1, value: 'You make yourself walk. Each block is a small negotiation. But the air is different out here and by the time you turn back, something in your chest is a fraction looser.' },
            // High adenosine — the body drags
            { weight: State.lerp01(aden, 50, 70), value: 'You walk. Your body is a heavy thing you\'re carrying through space. The legs work but they want you to know they\'re working. By the second block you\'re wondering if this was a mistake. By the third, you don\'t care. You just walk.' },
          ]);
        }
        if (mood === 'fraying') {
          // No stress relief — the thoughts follow you
          if (weather === 'drizzle') {
            return Timeline.weightedPick([
              { weight: 1, value: 'You walk. The rain gets in your collar. Your thoughts are exactly as loud out here as they were inside, plus now you\'re wet.' },
              { weight: 1, value: 'Drizzle. You walk through it fast, shoulders hunched. The thoughts don\'t care about the scenery. They came with you. Now you\'re tired and damp.' },
              // High NE — every drop is an irritant
              { weight: State.lerp01(ne, 55, 75), value: 'The rain is on your neck and you can feel every drop. Your jacket isn\'t enough. The cold, the wet, the sound of cars on wet road — every sensation is a needle. You walk faster. It doesn\'t help.' },
            ]);
          }
          return Timeline.weightedPick([
            { weight: 1, value: 'You walk. Fast, tight, shoulders up. The thoughts come with you — they don\'t care about the change of scenery. You burn energy. That\'s what you accomplish.' },
            { weight: 1, value: 'A walk. You thought it would help. The air is fine. The sky is there. The thing in your chest is exactly the same, just outside now instead of inside.' },
            { weight: 1, value: 'You walk until your legs notice. The thoughts follow you the whole way — across the street, around the block, back again. Walking didn\'t help. But you walked.' },
            // Low GABA — the anxiety walks with you
            { weight: State.lerp01(gaba, 40, 20), value: 'You walk fast. Too fast. Your breath is shallow and your hands are fists in your pockets. The movement should help. It doesn\'t. The thing inside you has legs too, and it keeps up easily.' },
          ]);
        }
        if (mood === 'numb') {
          // No stress relief — nothing registers
          if (weather === 'drizzle') {
            return Timeline.weightedPick([
              { weight: 1, value: 'You walk in the rain. You get wet. You walk back. The rain happened to you. That\'s about all you can say about it.' },
              { weight: 1, value: 'Drizzle. You walk through it. Your body moves through space. You come back damp. Nothing changed except your socks.' },
              // Low serotonin — numb even to discomfort
              { weight: State.lerp01(ser, 30, 10), value: 'You walk in the rain. It\'s cold. You know it\'s cold because your hands are wet, but the cold doesn\'t bother you the way it should. Nothing does. You walk until walking stops, then you turn around.' },
            ]);
          }
          return Timeline.weightedPick([
            { weight: 1, value: 'You walk. The street, the air, the people. You move through all of it like water through a pipe. You were out. Now you\'re back. That happened.' },
            { weight: 1, value: 'A walk. You went, you returned. The scenery was there. You were there. The two of you didn\'t really connect.' },
            { weight: 1, value: 'You walk. Your legs do it. The air touches your face. People pass. None of it reaches whatever part of you would need to be reached. You come back.' },
            // Low dopamine — no engagement with the world
            { weight: State.lerp01(dopa, 40, 15), value: 'You walk. Trees, buildings, people — the world scrolls past like a feed you\'re not interested in. Your legs carry you through it. At no point do you feel like you\'re in it.' },
          ]);
        }
        // hollow
        State.adjustStress(-1);
        if (weather === 'drizzle') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You walk in the drizzle. The world exists. You were in it, briefly, getting rained on. It\'s something.' },
            { weight: 1, value: 'Rain on the street. You walk through it. Cars pass. People with umbrellas. You\'re out here. That\'s a fact about your life right now.' },
            // High NE — the rain is oddly present
            { weight: State.lerp01(ne, 40, 60), value: 'You walk in the drizzle and the rain is on your face, each drop a small fact. Cars hiss past on wet road. Someone\'s umbrella is red. You notice things. You don\'t know what to do with any of them.' },
          ]);
        }
        return Timeline.weightedPick([
          { weight: 1, value: 'You walk. The world exists and you\'re in it, briefly. People going places. Cars. The sky. You were part of the scene for a few minutes. Then you came back.' },
          { weight: 1, value: 'A walk. The street, the air, the feeling of being a body among other bodies. It doesn\'t fill the hollow, but it proves the world is still out there.' },
          { weight: 1, value: 'You walk for a while. Past the store, past the bus stop, past people you\'ll never see again. The world is there. You were in it.' },
          // Higher serotonin — the hollow lets some light in
          { weight: State.lerp01(ser, 40, 55), value: 'You walk. The hollow is still there, but the air moves through it. A tree. A stranger\'s dog. The light on the pavement. Small things that don\'t fix anything but prove the world is wider than the inside of your head.' },
        ]);
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
        const long = waitTime > 10;

        let text = '';

        if (weather === 'snow') {
          text = long
            ? 'Snow on your shoulders. The bus takes a long time. There\'s nowhere warmer within reach.'
            : 'Snow while you wait. The bus comes.';
        } else if (weather === 'drizzle') {
          text = 'Rain collects on the shelter roof and drips from the edge in a line.';
          if (long) text += ' The bus takes its time.';
        } else if (mood === 'hollow' || mood === 'quiet') {
          text = 'You stand there. People come and go. The bus doesn\'t, and then it does.';
        } else {
          text = long ? 'The bus takes its time. You wait.' : 'A few minutes. Buses arrive when they arrive.';
        }

        // NT deterministic modifiers (no RNG — replay-safe)
        const aden = State.get('adenosine');
        const ne = State.get('norepinephrine');
        if (weather !== 'snow' && aden > 65) {
          text += ' Your legs are tired from standing.';
        } else if (ne > 65 && weather !== 'drizzle' && weather !== 'snow') {
          text += ' The street is a lot of input right now.';
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
          State.adjustJobStanding(1); // focused work builds standing
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

        // Accumulating sentiments: work builds dread or satisfaction
        if (canFocus) {
          State.adjustSentiment('work', 'satisfaction', 0.015);
          State.adjustSentiment('work', 'dread', -0.01);
        } else {
          State.adjustSentiment('work', 'dread', 0.02);
          State.adjustSentiment('work', 'satisfaction', -0.005);
        }

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
      available: () => !['okay', 'rested', 'alert'].includes(State.energyTier()) || !['calm', 'baseline'].includes(State.stressTier()),
      execute: () => {
        State.adjustEnergy(5);
        State.adjustStress(-5);

        // The need to escape is itself a signal
        if (['tense', 'strained', 'overwhelmed'].includes(State.stressTier())) {
          State.adjustSentiment('work', 'dread', 0.005);
        } else if (State.sentimentIntensity('work', 'dread') > 0 && ['calm', 'baseline'].includes(State.stressTier())) {
          // A relaxed break at work gently challenges dread
          State.adjustSentiment('work', 'dread', -0.005);
        }

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
      available: () => State.socialTier() !== 'warm' && State.energyTier() !== 'depleted' && State.isWorkHours(),
      execute: () => {
        const mood = State.moodTone();

        // Coworker sentiment affects mechanical outcomes
        const isFirst = Timeline.chance(0.5);
        const slot = isFirst ? 'coworker1' : 'coworker2';
        const coworker = Character.get(slot);

        const warmth = State.sentimentIntensity(slot, 'warmth');
        const irritation = State.sentimentIntensity(slot, 'irritation');

        // Base social/stress effects, modified by accumulated sentiment
        const socialBonus = 8 + (warmth > 0.3 ? 2 : 0);
        const stressEffect = irritation > 0.4 ? 2 : -3;
        State.adjustSocial(socialBonus);
        State.adjustStress(stressEffect);

        // Accumulate coworker sentiments based on mood
        // Cross-reduction: good interactions gently challenge irritation, bad ones challenge warmth
        if (mood === 'present' || mood === 'clear' || ['calm', 'baseline'].includes(State.stressTier())) {
          State.adjustSentiment(slot, 'warmth', 0.02);
          State.adjustSentiment(slot, 'irritation', -0.008);
        } else if (mood === 'fraying' || mood === 'heavy' || mood === 'numb' || ['strained', 'overwhelmed'].includes(State.stressTier())) {
          State.adjustSentiment(slot, 'irritation', 0.015);
          State.adjustSentiment(slot, 'warmth', -0.005);
        }

        State.advanceTime(5);

        const social = State.socialTier();

        Events.record('talked_to_coworker', { name: coworker.name, flavor: coworker.flavor });

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
      available: () => State.get('has_phone') && State.get('phone_battery') > 0 && !State.get('viewing_phone'),
      execute: () => {
        State.set('viewing_phone', true);
        State.advanceTime(1);
        Events.record('checked_phone');
        return phoneScreenDescription();
      },
    },

    // === CORNER STORE ===
    buy_groceries: {
      id: 'buy_groceries',
      label: 'Get a few things',
      location: 'corner_store',
      available: () => State.canAfford(8),
      execute: () => {
        const cost = Timeline.randomFloat(8, 14);
        const roundedCost = Math.round(cost * 100) / 100;

        if (!State.spendMoney(roundedCost)) {
          return 'You pick things up and put them back. The math doesn\'t work today.';
        }

        State.set('fridge_food', Math.min(6, State.get('fridge_food') + 3));
        State.advanceTime(10);
        State.glanceMoney();
        Events.record('bought_groceries', { cost: roundedCost });

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
      available: () => State.canAfford(3),
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
        Events.record('ate', { what: 'cheap_meal' });

        // Food comfort sentiment — weaker than home food + habituation
        const fc = State.sentimentIntensity('eating', 'comfort');
        if (fc > 0) {
          State.adjustNT('serotonin', fc * 2);
          State.adjustSentiment('eating', 'comfort', -0.002);
        }

        const mood = State.moodTone();

        if (mood === 'numb' || mood === 'heavy') {
          return Timeline.weightedPick([
            { weight: 1, value: 'You eat it on the way out. Something wrapped in plastic from a warmer. It\'s food. It does what food does.' },
            { weight: 1, value: 'You eat standing by the door. Cheap food in a plastic wrapper. Your body accepts it. That\'s about all.' },
            // High food comfort — even cheap food can be something
            { weight: fc > 0 ? fc * 0.7 : 0, value: 'You eat it on the way out. It\'s cheap and wrapped in plastic and warm, and the warmth is something. Not much. But something your body reaches for.' },
          ]);
        }
        return Timeline.weightedPick([
          { weight: 1, value: 'A sandwich from the cooler. You eat it standing outside the store. It\'s fine. It\'s enough.' },
          { weight: 1, value: 'You grab something from the counter and eat it outside. Corner store food. It does the job.' },
          // High food comfort — small pleasure in cheap food
          { weight: fc > 0 ? fc * 0.7 : 0, value: 'You eat it outside the store. Cheap food, nothing to it, but the taste is good and the eating is a comfort in the simple way it always is.' },
        ]);
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

    // === PHONE MODE ===
    read_messages: {
      id: 'read_messages',
      label: 'Messages',
      location: null,
      available: () => State.get('viewing_phone') && State.hasUnreadMessages(),
      execute: () => {
        // Battery death check
        if (State.get('phone_battery') <= 0) {
          State.set('viewing_phone', false);
          return 'The screen goes dark. Dead.';
        }

        const unread = State.getUnreadMessages();
        State.markMessagesRead();
        State.advanceTime(2);

        const parts = [];
        for (const msg of unread) {
          parts.push(msg.text);
          // Apply per-type effects
          if (msg.type === 'friend') {
            State.adjustSocial(3);
            // Reading a friend's message = contact. Reset timer, reduce guilt.
            if (msg.source) {
              const fc = State.get('friend_contact');
              fc[msg.source] = State.get('time');
              State.adjustSentiment(msg.source, 'guilt', -0.02);
            }
          }
          else if (msg.type === 'paycheck') {
            State.adjustStress(-3);
            State.glanceMoney();
          }
          else if (msg.type === 'bill') {
            if (msg.paid === false) {
              State.adjustStress(8);
            } else {
              State.adjustStress(3);
            }
            State.glanceMoney();
          }
          else if (msg.type === 'bank') State.glanceMoney();
          else if (msg.type === 'work') State.adjustStress(3);
        }

        return parts.join('\n\n');
      },
    },

    toggle_phone_silent: {
      id: 'toggle_phone_silent',
      label: 'Silence it',
      location: null,
      available: () => State.get('viewing_phone'),
      execute: () => {
        // Battery death check
        if (State.get('phone_battery') <= 0) {
          State.set('viewing_phone', false);
          return 'The screen goes dark. Dead.';
        }

        const wasSilent = State.get('phone_silent');
        State.set('phone_silent', !wasSilent);
        if (wasSilent) {
          return 'Sound on. You\'ll hear it now.';
        }
        return 'Silent. Whatever comes, it comes quietly.';
      },
    },

    put_phone_away: {
      id: 'put_phone_away',
      label: 'Put it away',
      location: null,
      available: () => State.get('viewing_phone'),
      execute: () => {
        State.set('viewing_phone', false);
        State.set('phone_screen', 'home');
        State.set('phone_thread_contact', null);
        const location = World.getLocationId();
        const descFn = /** @type {Record<string, (() => string) | undefined>} */ (Content.locationDescriptions)[location];
        return descFn ? descFn() : '';
      },
    },

    reply_to_friend: {
      id: 'reply_to_friend',
      label: 'Reply',
      location: null,
      available: () => {
        if (!State.get('viewing_phone') || State.get('phone_battery') <= 0) return false;
        const thread = State.get('phone_thread_contact');
        if (!thread || !['friend1', 'friend2'].includes(thread)) return false;
        const inbox = State.get('phone_inbox');
        if (!inbox.some(m => m.source === thread && !m.read)) return false;
        const pending = State.get('pending_replies') || [];
        if (pending.some(r => r.slot === thread)) return false;
        return true;
      },
      execute: () => {
        if (State.get('phone_battery') <= 0) {
          State.set('viewing_phone', false);
          return 'The screen goes dark. Dead.';
        }
        const target = getReplyTarget();
        if (!target) return '';
        const { slot, friend } = target;

        // 1 RNG call: reply prose
        const replyText = friendReplyProse[friend.flavor](friend.name);
        // 1 RNG call: friend's response text (generated now, delivered later)
        const responseText = friendReplyMessages[friend.flavor](friend.name);
        // 1 RNG call: arrival delay
        const delay = Timeline.randomInt(30, 90);
        State.addPendingReply({ slot, arrivesAt: State.get('time') + delay, text: responseText });

        // Store sent message in inbox for thread view
        State.addPhoneMessage({ type: 'sent', source: slot, text: replyText, read: true, direction: 'sent' });

        // Reset contact timer, reduce guilt more than just reading does
        const fc = State.get('friend_contact');
        fc[slot] = State.get('time');
        State.adjustSentiment(slot, 'guilt', -0.06);
        State.adjustSocial(3);

        State.advanceTime(5);
        State.adjustBattery(-1);

        return replyText;
      },
    },

    message_friend: {
      id: 'message_friend',
      label: 'Write',
      location: null,
      available: () => {
        if (!State.get('viewing_phone') || State.get('phone_battery') <= 0) return false;
        const thread = State.get('phone_thread_contact');
        if (!thread || !['friend1', 'friend2'].includes(thread)) return false;
        const inbox = State.get('phone_inbox');
        if (inbox.some(m => m.source === thread && !m.read)) return false; // has unread → use reply
        const pending = State.get('pending_replies') || [];
        if (pending.some(r => r.slot === thread)) return false;
        return true;
      },
      execute: () => {
        if (State.get('phone_battery') <= 0) {
          State.set('viewing_phone', false);
          return 'The screen goes dark. Dead.';
        }
        const target = getInitiateTarget();
        if (!target) return '';
        const { slot, friend } = target;

        // 1 RNG call: initiation prose
        const initiateText = friendInitiateProse[friend.flavor](friend.name);
        // 1 RNG call: friend's response (generated now, delivered later)
        const responseText = friendInitiateMessages[friend.flavor](friend.name);
        // 1 RNG call: arrival delay
        const delay = Timeline.randomInt(30, 90);
        State.addPendingReply({ slot, arrivesAt: State.get('time') + delay, text: responseText });

        // Store sent message in inbox for thread view
        State.addPhoneMessage({ type: 'sent', source: slot, text: initiateText, read: true, direction: 'sent' });

        // Reset contact timer, reduce guilt
        const fc = State.get('friend_contact');
        fc[slot] = State.get('time');
        State.adjustSentiment(slot, 'guilt', -0.06);
        State.adjustSocial(2);

        State.advanceTime(5);
        State.adjustBattery(-1);

        return initiateText;
      },
    },
  };

  // --- Phone mode ---

  /**
   * Generate incoming messages based on elapsed time since last check.
   * Called once per action/move, after event checks.
   * Returns true if any new message arrived (for buzz notification).
   * @returns {boolean}
   */
  function generateIncomingMessages() {
    const now = State.get('time');
    const last = State.get('last_msg_gen_time');
    const elapsed = Math.max(0, now - last);
    State.set('last_msg_gen_time', now);

    if (elapsed <= 0) return false;

    let added = false;

    // --- Friend messages (RNG-consuming) ---
    const friend1 = Character.get('friend1');
    const friend2 = Character.get('friend2');
    const socialT = State.socialTier();
    const socialLow = socialT === 'withdrawn' || socialT === 'isolated';

    const friendSlots = [
      { friend: friend1, slot: 'friend1' },
      { friend: friend2, slot: 'friend2' },
    ];
    for (const { friend, slot } of friendSlots) {
      let multiplier;
      switch (friend.flavor) {
        case 'sends_things': multiplier = 0.007; break;
        case 'checks_in':    multiplier = socialLow ? 0.008 : 0.004; break;
        case 'dry_humor':    multiplier = 0.004; break;
        case 'earnest':      multiplier = 0.003; break;
        default:             multiplier = 0.004;
      }
      const prob = elapsed * multiplier;
      // Two RNG calls per friend: chance + text pick
      if (Timeline.chance(prob)) {
        // friendMessages uses Timeline.pick internally (1 RNG call)
        // friendIsolatedMessages does not — consume RNG to stay consistent
        if (socialLow) {
          Timeline.random(); // balance RNG consumption
          const msgFn = friendIsolatedMessages[friend.flavor];
          const text = /** @type {(name: string) => string} */ (msgFn)(friend.name);
          if (text) {
            State.addPhoneMessage({ type: 'friend', text, read: false, source: slot });
            added = true;
          }
        } else {
          const msgFn = friendMessages[friend.flavor];
          const text = /** @type {(name: string) => string} */ (msgFn)(friend.name);
          if (text) {
            State.addPhoneMessage({ type: 'friend', text, read: false, source: slot });
            added = true;
          }
        }
      } else {
        // Consume matching RNG even on miss (text pick uses 1 call)
        Timeline.random();
      }
    }

    // --- Work nag (deterministic trigger, no RNG) ---
    const minutesLate = State.latenessMinutes();
    if (minutesLate >= 30 && !State.get('at_work_today') && !State.get('called_in') && !State.get('work_nagged_today')) {
      State.set('work_nagged_today', true);
      const supervisor = Character.get('supervisor');
      State.addPhoneMessage({
        type: 'work',
        source: 'supervisor',
        text: `A message from ${supervisor.name}. "Everything okay?" Which means: where are you.`,
        read: false,
      });
      added = true;
    }

    // --- Financial cycle triggers (deterministic, no RNG) ---
    // Paycheck, rent, utilities, phone bill — all on character-specific schedules.
    // Amounts and offsets derive from character backstory.
    const day = State.getDay();

    // Paycheck — every 14 days, offset stored in state from character
    const paycheckOffset = State.get('paycheck_day_offset');
    if (day > 1 && day % 14 === paycheckOffset % 14 && State.get('last_paycheck_day') !== day) {
      State.set('last_paycheck_day', day);
      const payRate = State.get('pay_rate');
      const daysWorked = State.get('days_worked_this_period');
      const pay = Math.round(payRate * Math.min(daysWorked, 10) / 10 * 100) / 100;
      const wasBroke = State.moneyTier() === 'broke' || State.moneyTier() === 'scraping';

      if (pay > 0) {
        const shortPay = daysWorked < 10;
        const text = shortPay
          ? 'Direct deposit. Less than usual.'
          : 'Direct deposit.';
        State.receiveMoney(pay, 'paycheck', text);
        added = true;
        // Paycheck when broke gives tiny anxiety relief
        if (wasBroke) {
          State.adjustSentiment('money', 'anxiety', -0.01);
        }
      }
      State.set('days_worked_this_period', 0);
    }

    // Rent — every 30 days, offset stored in state from character
    const rentOffset = State.get('rent_day_offset');
    if (day > 1 && day % 30 === rentOffset % 30 && State.get('last_rent_day') !== day) {
      State.set('last_rent_day', day);
      State.deductBill(State.get('rent_amount'), 'rent');
      added = true;
    }

    // Utilities — every 30 days
    const utilityOffset = State.get('utility_day_offset');
    if (day > 1 && day % 30 === utilityOffset % 30 && State.get('last_utility_day') !== day) {
      State.set('last_utility_day', day);
      State.deductBill(65, 'utilities');
      added = true;
    }

    // Phone bill — every 30 days
    const phoneOffset = State.get('phone_bill_day_offset');
    if (day > 1 && day % 30 === phoneOffset % 30 && State.get('last_phone_bill_day') !== day) {
      State.set('last_phone_bill_day', day);
      State.deductBill(45, 'phone');
      added = true;
    }

    // --- Pending friend replies (deterministic, no RNG) ---
    const pendingReplies = State.get('pending_replies');
    if (pendingReplies && pendingReplies.length > 0) {
      const remaining = [];
      for (const reply of pendingReplies) {
        if (reply.arrivesAt <= now) {
          State.addPhoneMessage({ type: 'friend', text: reply.text, read: false, source: reply.slot });
          added = true;
        } else {
          remaining.push(reply);
        }
      }
      State.set('pending_replies', remaining);
    }

    return added;
  }

  /**
   * Build prose for the phone screen when in phone mode.
   * @returns {string}
   */
  function phoneScreenDescription() {
    const unread = State.getUnreadMessages();
    const mood = State.moodTone();

    let desc = '';

    // Time — glance when looking at phone
    State.glanceTime();
    desc += State.perceivedTimeString() + '.';

    // Messages
    if (unread.length > 0) {
      const senders = [];
      // Track which friend slots have unread messages for guilt nudge
      const seenFriendSlots = new Set();
      for (const msg of unread) {
        if (msg.type === 'friend') {
          senders.push('a message');
          // Seeing an unread friend message nudges guilt proportionally
          if (msg.source) {
            if (!seenFriendSlots.has(msg.source)) {
              seenFriendSlots.add(msg.source);
              const guilt = State.sentimentIntensity(msg.source, 'guilt');
              if (guilt > 0.03) {
                State.adjustSentiment(msg.source, 'guilt', guilt * 0.02);
              }
            }
          }
        } else if (msg.type === 'work') {
          senders.push('something from work');
        } else if (msg.type === 'bank') {
          senders.push('a bank notification');
        } else if (msg.type === 'paycheck') {
          senders.push('a bank deposit');
        } else if (msg.type === 'bill') {
          senders.push('a bill notification');
        }
      }
      if (senders.length === 1) {
        desc += ' ' + senders[0].charAt(0).toUpperCase() + senders[0].slice(1) + '.';
      } else if (senders.length === 2) {
        desc += ' ' + senders[0].charAt(0).toUpperCase() + senders[0].slice(1) + ', and ' + senders[1] + '.';
      } else {
        desc += ' Notifications. Several of them.';
      }
    } else {
      if (mood === 'hollow' || mood === 'quiet') {
        desc += ' Nothing new. The screen looks at you back.';
      } else if (mood === 'numb') {
        desc += ' Nothing. The screen glows.';
      } else {
        desc += ' Nothing new.';
      }
    }

    // Battery — you notice when it's low, not when it's fine
    const bt = State.batteryTier();
    if (bt === 'critical') {
      desc += ' Battery\'s red.';
    } else if (bt === 'low') {
      desc += ' Low battery.';
    }

    return desc;
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
      Events.record('called_in_sick');

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
        if (weather === 'snow') {
          return 'Snow starts outside. The light through the window changes — that particular white.';
        }
        return '';
      }
      if (weather === 'drizzle') {
        return 'It starts to rain. Not hard. Just enough to matter.';
      }
      if (weather === 'snow') {
        return 'It starts snowing. The noise of the street softens.';
      }
      if (weather === 'clear') {
        return 'The clouds thin. Actual light comes through. It changes the look of everything.';
      }
      return 'The sky shifts. Still grey, but a different grey.';
    },

    coworker_speaks: () => {
      State.adjustSocial(3);
      const isFirst = Timeline.chance(0.5);
      const slot = isFirst ? 'coworker1' : 'coworker2';
      const coworker = Character.get(slot);

      // Involuntary exposure builds smaller sentiment than chosen interaction
      // Cross-reduction: even involuntary good moments gently challenge irritation, and vice versa
      const mood = State.moodTone();
      if (mood === 'fraying' || mood === 'numb' || mood === 'heavy') {
        State.adjustSentiment(slot, 'irritation', 0.01);
        State.adjustSentiment(slot, 'warmth', -0.003);
      } else {
        State.adjustSentiment(slot, 'warmth', 0.008);
        State.adjustSentiment(slot, 'irritation', -0.003);
      }

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
      const ne = State.get('norepinephrine');
      if (time === 'deep_night' || time === 'night') {
        return Timeline.weightedPick([
          { weight: 1, value: 'A pipe knocks somewhere in the wall. The building talking to itself.' },
          { weight: 1, value: 'The fridge hums louder for a moment, then settles.' },
          { weight: 1, value: 'Footsteps above you. Someone else awake.' },
          // High NE at night — sounds are louder, more present
          { weight: State.lerp01(ne, 45, 70), value: 'A sound. You freeze. The building settles — a creak, a tick, something in the walls. It\'s nothing. You know it\'s nothing. You\'re still listening.' },
        ]);
      }
      return Timeline.weightedPick([
        { weight: 1, value: 'A door shuts somewhere else in the building.' },
        { weight: 1, value: 'Muffled TV from next door. Voices that aren\'t talking to you.' },
        { weight: 1, value: 'The radiator clicks.' },
        // High NE during day — hyper-aware of building sounds
        { weight: State.lerp01(ne, 50, 70), value: 'Water running through the pipes — upstairs, you think. You track the sound through the wall without meaning to. Your building full of people, all of them doing things.' },
      ]);
    },

    apartment_notice: () => {
      const n = State.get('surfaced_mess');
      State.set('surfaced_mess', n + 1);
      const mess = State.messTier();
      const ser = State.get('serotonin');
      const aden = State.get('adenosine');
      const dop = State.get('dopamine');
      if (mess === 'chaotic' || mess === 'messy') {
        return Timeline.weightedPick([
          { weight: 1, value: 'You notice how cluttered things have gotten. When did that happen.' },
          { weight: 1, value: 'The apartment. You see it for a second the way a visitor would. Then you stop seeing it that way.' },
          { weight: 1, value: 'Everything\'s been here long enough to stop being mess and start just being how it is.' },
          // Low serotonin — it reads as evidence
          { weight: State.lerp01(ser, 40, 20), value: 'The apartment looks like what it is. A place someone\'s been barely keeping up with. You know because you\'re that person.' },
          // High adenosine — it blurs, then unregisters
          { weight: State.lerp01(aden, 55, 75), value: 'You look at the state of things for a second. Then the moment passes and you\'ve stopped registering it.' },
          // Low dopamine — nothing moves toward fixing it
          { weight: State.lerp01(dop, 40, 20), value: 'You know it needs dealing with. Knowing and doing are in different rooms right now.' },
        ]);
      }
      if (mess === 'cluttered') {
        return Timeline.weightedPick([
          { weight: 1, value: 'A few things out of place. The kind of mess that builds without you deciding to let it.' },
          { weight: 1, value: 'Things where they fell. Things moved somewhere temporary and then stayed.' },
          { weight: 1, value: 'The mess hasn\'t moved. You knew it wouldn\'t.' },
          // Low serotonin — minor disorder registers as more than it is
          { weight: State.lerp01(ser, 40, 20), value: 'The small disorder of the place catches your eye. It shouldn\'t bother you this much.' },
          // High adenosine — registers then blurs
          { weight: State.lerp01(aden, 55, 75), value: 'The mess registers and then doesn\'t. You don\'t have the bandwidth to hold it.' },
        ]);
      }
      return '';
    },

    street_ambient: () => {
      const time = State.timePeriod();
      const weather = State.get('weather');
      const ne = State.get('norepinephrine');
      if (weather === 'drizzle') {
        return 'Car tires on wet road. That specific hiss.';
      }
      if (time === 'morning') {
        return Timeline.weightedPick([
          { weight: 1, value: 'A bus goes past, full of people who look like they\'re still waking up.' },
          { weight: 1, value: 'Someone walks a dog. The dog is more enthusiastic about it than they are.' },
          // High NE — the morning is sharp
          { weight: State.lerp01(ne, 45, 65), value: 'The morning traffic is louder than it should be. Brakes, engines, a horn somewhere. Each sound is a separate thing hitting you.' },
        ]);
      }
      return Timeline.weightedPick([
        { weight: 1, value: 'Traffic. The city sound that stops being a sound if you live here long enough.' },
        { weight: 1, value: 'A siren, far off. Moving away from you.' },
        // High NE — street sounds register individually
        { weight: State.lerp01(ne, 45, 65), value: 'A car door. Footsteps. Someone\'s bass through a window. The street is a catalog of sounds and you\'re taking inventory whether you want to or not.' },
      ]);
    },

    someone_passes: () => {
      const social = State.socialTier();
      if (social === 'isolated') {
        return 'Someone walks past. They don\'t see you. You\'re part of the scenery.';
      }
      const ser = State.get('serotonin');
      return Timeline.weightedPick([
        { weight: 1, value: 'Someone passes, talking on their phone. Fragments of someone else\'s life.' },
        { weight: 1, value: 'A person walks by quickly, somewhere to be.' },
        { weight: 1, value: 'An older woman passes and nods. You nod back. That\'s enough.' },
        // Low serotonin — other people feel far away
        { weight: State.lerp01(ser, 40, 20), value: 'Someone passes. You watch them go. They have a life — somewhere to be, someone to see. The distance between you and that is a thing you can feel.' },
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

    // NT values for continuous prose shading
    const ser = State.get('serotonin');
    const dop = State.get('dopamine');
    const ne = State.get('norepinephrine');
    const gaba = State.get('gaba');
    const aden = State.get('adenosine');

    // Helper: wrap a plain string as a weight-1 item
    const w1 = (/** @type {string} */ s) => ({ weight: 1, value: s });

    /** @type {{ weight: number, value: string }[]} */
    const thoughts = [];

    // Mood-based — general texts at weight 1, NT-shaded variants with continuous weights
    if (mood === 'numb') {
      thoughts.push(
        w1('You\'re here. That\'s the whole thought.'),
        w1('Time is passing. You know this because things are slightly different than before.'),
        w1('There\'s a blankness that isn\'t peace and isn\'t pain. Just absence of the energy for either.'),
        w1('You look at your hands. They\'re your hands. That\'s all you\'ve got.'),
        w1('Something should be happening. Nothing is. That\'s the thing about nothing — it keeps going.'),
        w1('Your eyes are open. That counts as being awake, technically.'),
        w1('You\'re aware of the room. The room is not aware of you. Fair enough.'),
        // Low serotonin deepens the numbness toward despair
        { weight: State.lerp01(ser, 35, 15), value: 'There was a feeling here once. You can\'t remember what it was shaped like.' },
        { weight: State.lerp01(ser, 35, 15), value: 'You try to care about something. Anything. The effort folds in on itself.' },
        // High adenosine — the numbness is also fog
        { weight: State.lerp01(aden, 50, 80), value: 'Your thoughts don\'t finish. They start and then they\'re somewhere else. Or nowhere.' },
        { weight: State.lerp01(aden, 50, 80), value: 'The edges of the room are soft. Not comforting. Just indistinct.' },
      );
    } else if (mood === 'hollow') {
      const friend1 = Character.get('friend1');
      thoughts.push(
        w1(`You think about calling ${friend1.name}. You don't pick up the phone.`),
        w1('What would you do if you could do anything. The question doesn\'t even finish forming.'),
        w1('The silence has texture. You\'re learning its patterns.'),
        w1('You had a thought a minute ago. It\'s gone now. It wasn\'t important. Probably.'),
        w1('There\'s a shape where something used to matter. You can feel the outline of it.'),
        w1('You open your mouth to say something, then realize there\'s no one to say it to. And nothing to say.'),
        w1('A memory tries to surface. You let it sink back down.'),
        // Low serotonin — hollow tips toward hopeless
        { weight: State.lerp01(ser, 40, 20), value: 'The distance between you and everyone else isn\'t measured in miles. It\'s measured in something you can\'t close.' },
        // Low dopamine — can't even want connection
        { weight: State.lerp01(dop, 40, 20), value: 'You could reach out. The thought is there. It doesn\'t connect to anything that would make your hand move.' },
        // High NE — hollow but wired
        { weight: State.lerp01(ne, 45, 70), value: 'The quiet isn\'t peaceful. There\'s something underneath it, humming. You can\'t name it but your body knows.' },
      );
    } else if (mood === 'heavy') {
      thoughts.push(
        w1('Everything takes more than it should. Even thinking about doing things.'),
        w1('You stand still for a moment, not deciding. Just not moving yet.'),
        w1('Gravity is personal today. It\'s working harder on you specifically.'),
        w1('You breathe. That\'s happening. You notice it like you notice weather.'),
        w1('The next thing. There\'s always a next thing. You look at it from a distance.'),
        w1('Your body wants to be horizontal. Your life requires you to be vertical. The negotiation continues.'),
        w1('You shift your weight from one foot to the other. That\'s the most you\'ve done in a while.'),
        w1('The thought of doing something and the doing of it — there\'s a gap there. It\'s wider than usual.'),
        // Low serotonin — heavy tilts darker
        { weight: State.lerp01(ser, 40, 20), value: 'It\'s not that you can\'t. It\'s that the part of you that would want to is somewhere you can\'t reach.' },
        { weight: State.lerp01(ser, 40, 20), value: 'Your hands are in your lap. They could do things. They don\'t feel like your hands.' },
        // Low GABA — heavy with anxiety underneath
        { weight: State.lerp01(gaba, 45, 25), value: 'The heaviness has a tremor in it. Not visible. Internal. The weight is there and something under it is vibrating.' },
        // Low dopamine — can't start anything
        { weight: State.lerp01(dop, 40, 20), value: 'You look at the room. There are things you could do. The list exists somewhere outside you, behind glass.' },
      );
    } else if (mood === 'fraying') {
      thoughts.push(
        w1('Your jaw is clenched. When did that start.'),
        w1('There\'s a tightness behind your eyes. Not a headache. Just proximity to one.'),
        w1('Something small would set you off. You can feel the edge of it.'),
        w1('You catch yourself holding your breath. You let it out. It doesn\'t help much.'),
        w1('Everything is a little too loud. A little too close.'),
        w1('Your shoulders are up near your ears. You force them down. They\'ll be back.'),
        w1('A sound from somewhere. You flinch. It was nothing.'),
        w1('The inside of your skin feels too small for what\'s in there.'),
        // High NE — sensory overload
        { weight: State.lerp01(ne, 55, 80), value: 'You can hear the light. The hum of whatever makes electricity work. It\'s in the walls and it won\'t stop.' },
        { weight: State.lerp01(ne, 55, 80), value: 'The texture of your clothes. You can feel every fiber. When did fabric get this loud.' },
        // Low GABA — no brakes
        { weight: State.lerp01(gaba, 40, 20), value: 'The thing about being wound this tight is there\'s nothing to wind down into. No floor. Just tighter.' },
        // High cortisol — body stress
        { weight: State.lerp01(State.get('cortisol'), 60, 85), value: 'Your stomach is a fist. It\'s been a fist. You keep forgetting and then noticing again.' },
      );
    } else if (mood === 'quiet') {
      thoughts.push(
        w1('It\'s quiet. It\'s been quiet. You\'re used to it, which is different from liking it.'),
        w1('You exist in the room. The room exists around you. That\'s the arrangement.'),
        w1('The sound of nothing. It has a frequency, if you listen long enough.'),
        w1('You\'re here. Not going anywhere. Not coming from anywhere. Just here.'),
        w1('A thought starts to form and doesn\'t finish. That\'s fine. It wasn\'t going anywhere.'),
        w1('Somewhere a pipe ticks. Or a wall settles. Something structural, doing what it does.'),
        w1('You notice yourself noticing the quiet. That\'s a layer you didn\'t need.'),
        w1('The stillness has a weight to it. Not heavy. Just present.'),
        // Higher serotonin — quiet edges toward something almost peaceful
        { weight: State.lerp01(ser, 45, 60), value: 'The quiet doesn\'t need filling. You notice that without reaching for a reason.' },
        // High NE — quiet but watchful
        { weight: State.lerp01(ne, 45, 65), value: 'Quiet on the outside. Something scanning, underneath. Not anxious exactly. Just — listening for what isn\'t there.' },
        // Low dopamine — quiet bleeds into apathy
        { weight: State.lerp01(dop, 40, 20), value: 'The quiet is the loudest thing, and you don\'t mind, because minding takes something you don\'t have.' },
      );
    } else if (mood === 'clear' || mood === 'present') {
      thoughts.push(
        w1('Nothing to do. Not in a bad way. Just — nothing.'),
        w1('The light coming through the window is doing something interesting on the wall. You watch it.'),
        w1('A breath that feels like it belongs to you. Not many of those today.'),
        w1('You\'re here. Actually here. Not thinking about being somewhere else.'),
        w1('Your hands are warm. When did that happen.'),
        w1('Something close to okay. You don\'t examine it too closely. Just let it be there.'),
        w1('The ordinary is ordinary. That\'s enough. That\'s more than enough.'),
        // High serotonin — present tips toward genuine warmth
        { weight: State.lerp01(ser, 55, 75), value: 'For a second the room is just a room and you\'re just in it and that\'s fine. Actually fine.' },
        // Moderate NE — present and noticing
        { weight: State.lerp01(ne, 35, 55), value: 'You notice the dust in the light. The way it moves. Slow, undirected. Like it has time.' },
        // High dopamine — spark of engagement
        { weight: State.lerp01(dop, 55, 75), value: 'Something in you wants to do something. Not urgent. Just — the idea of doing has a small pull to it.' },
      );
    } else {
      // flat
      thoughts.push(
        w1('A moment. Nothing happening. Just a moment.'),
        w1('You wait, though you\'re not sure for what.'),
        w1('The day has a shape. You\'re somewhere in the middle of it.'),
        w1('Nothing urgent. Nothing pulling. Just the hum of being somewhere.'),
        w1('You\'re between things. Not in a hurry to get to the next one.'),
        w1('The light is different than it was a while ago. Things shift without you deciding.'),
        w1('You look around. Everything is where you left it.'),
        // Low serotonin — flat is darker than it looks
        { weight: State.lerp01(ser, 45, 25), value: 'Nothing is wrong. You keep checking. Still nothing wrong. The checking is the closest thing to a feeling.' },
        { weight: State.lerp01(ser, 45, 25), value: 'You\'re fine. That\'s what you\'d say if someone asked. Fine covers a lot of territory.' },
        // High NE — flat with restless edge
        { weight: State.lerp01(ne, 45, 65), value: 'You\'re not doing anything but your foot is bouncing. When did it start. You stop it. It starts again.' },
        // Low dopamine — flat and going through motions
        { weight: State.lerp01(dop, 42, 25), value: 'The day is happening. You\'re technically in it. Participation is a strong word.' },
        // High adenosine — flat is also foggy
        { weight: State.lerp01(aden, 50, 75), value: 'Your thoughts keep softening at the edges. Not drifting. Dissolving. Like sugar in water.' },
      );
    }

    // Hunger
    if (hunger === 'starving') {
      thoughts.push(
        w1('Your stomach has stopped asking and started insisting.'),
        w1('The hunger is a dull weight now. Less sharp, more permanent.'),
        w1('You think about food. Then you think about something else. Then food again.'),
        w1('Everything you look at, you evaluate whether it\'s food. Nothing is.'),
        w1('The emptiness in your stomach has its own gravity.'),
      );
    } else if (hunger === 'very_hungry') {
      thoughts.push(
        w1('Food. The thought comes and goes and comes back.'),
        w1('You could eat. The thought has an edge to it.'),
        w1('There\'s a hollowness below your ribs. Not painful. Just insistent.'),
        w1('You swallow. Your body notices there\'s nothing there.'),
      );
    }

    // Energy
    if (energy === 'depleted') {
      thoughts.push(
        w1('Your eyelids are heavy. Everything is heavy.'),
        w1('Sitting down sounds like the best idea anyone ever had.'),
        w1('The distance between you and lying down is a math problem you keep solving.'),
        w1('You blink and it takes longer than it should. Each one a negotiation to reopen.'),
        w1('Your thoughts are moving through something thick. They get there. Eventually.'),
      );
    }

    // Social
    if (social === 'isolated') {
      const friend1 = Character.get('friend1');
      const friend2 = Character.get('friend2');
      const f1thoughts = /** @type {(name: string) => string[]} */ (friendIdleThoughts[friend1.flavor])(friend1.name);
      const f2thoughts = /** @type {(name: string) => string[]} */ (friendIdleThoughts[friend2.flavor])(friend2.name);
      thoughts.push(...f1thoughts.map(w1), ...f2thoughts.map(w1));
    }

    // Friend guilt — fires regardless of social tier
    {
      const f1 = Character.get('friend1');
      const f2 = Character.get('friend2');
      const g1 = State.sentimentIntensity('friend1', 'guilt');
      const g2 = State.sentimentIntensity('friend2', 'guilt');
      if (g1 > 0.03) {
        const gThoughts = /** @type {(name: string) => string[]} */ (friendGuiltThoughts[f1.flavor])(f1.name);
        thoughts.push(...gThoughts.map(t => ({ weight: g1 * 8, value: t })));
      }
      if (g2 > 0.03) {
        const gThoughts = /** @type {(name: string) => string[]} */ (friendGuiltThoughts[f2.flavor])(f2.name);
        thoughts.push(...gThoughts.map(t => ({ weight: g2 * 8, value: t })));
      }
    }

    // Financial anxiety
    {
      const moneyAnx = State.sentimentIntensity('money', 'anxiety');
      if (moneyAnx > 0.05) {
        thoughts.push(
          { weight: moneyAnx * 6, value: 'The bills. You don\'t do the math. You already know the math.' },
          { weight: moneyAnx * 6, value: 'There\'s a number in your head. It\'s not the right number, but it\'s close enough to make your stomach tighten.' },
          { weight: moneyAnx * 4, value: 'Rent is due. Or was due. Or will be. The due dates blur together after a while.' },
        );
        // Upcoming bill awareness
        const bill = State.nextBillDue();
        if (bill && bill.daysUntil <= 3) {
          const timing = bill.daysUntil === 0 ? 'today' : bill.daysUntil === 1 ? 'tomorrow' : 'in a couple days';
          const label = bill.name === 'rent' ? 'Rent' : 'A bill';
          thoughts.push({ weight: moneyAnx * 8, value: `${label} is due ${timing}. You know the amount. You don\'t say it.` });
        }
        // Upcoming paycheck awareness when tight
        const mt = State.moneyTier();
        if (mt === 'broke' || mt === 'scraping' || mt === 'tight') {
          const paycheckDays = State.nextPaycheckDays();
          if (paycheckDays <= 4) {
            const timing = paycheckDays === 0 ? 'today' : paycheckDays === 1 ? 'tomorrow' : `in ${paycheckDays} days`;
            thoughts.push({ weight: moneyAnx * 7, value: `Paycheck ${timing}. The math between now and then is the only math that matters right now.` });
          }
        }
      }
      if (moneyAnx > 0.2) {
        thoughts.push(
          { weight: moneyAnx * 5, value: 'You think about the account balance without checking. The not-checking is its own kind of checking.' },
          { weight: moneyAnx * 5, value: 'Every purchase is a small negotiation. Not with anyone. Just with the feeling in your chest.' },
        );
      }
    }

    // Filter out recently shown thoughts (compare .value)
    const fresh = thoughts.filter(t => !recentIdle.includes(t.value));
    const pool = fresh.length > 0 ? fresh : thoughts;
    const picked = Timeline.weightedPick(pool);

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
    /** @type {Interaction[]} */
    const available = [];

    // Phone mode — phone UI renders its own action buttons, #actions stays empty
    if (State.get('viewing_phone')) {
      return available;
    }

    const location = World.getLocationId();

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

  function resetIdleTracking() {
    recentIdle.length = 0;
  }

  // --- Approaching prose ---
  // Shown during auto-advance: the character is about to act on habit.
  // CRITICAL: No RNG consumed. All selection is deterministic — moodTone()
  // and NT conditionals only. This fires before handleAction/handleMove,
  // so consuming RNG would desync replay.

  /** @type {Record<string, () => string>} */
  const approachingProse = {

    // === BEDROOM ===

    sleep: () => {
      const mood = State.moodTone();
      const aden = State.get('adenosine');
      if (aden > 80) return 'Your body is already deciding.';
      if (mood === 'numb' || mood === 'heavy') return 'The bed. You\'re moving toward it before you\'ve thought about it.';
      if (mood === 'fraying') return 'You need to lie down. You need to stop.';
      return 'Bed.';
    },

    get_dressed: () => {
      const mood = State.moodTone();
      if (mood === 'numb' || mood === 'heavy') return 'You\'re reaching for your clothes before you\'ve thought about it.';
      if (mood === 'fraying') return 'Your hands find your clothes.';
      return 'Clothes.';
    },

    set_alarm: () => {
      const mood = State.moodTone();
      if (mood === 'heavy' || mood === 'numb') return 'The alarm. A number for tomorrow.';
      return 'Alarm.';
    },

    skip_alarm: () => {
      return 'No alarm.';
    },

    snooze_alarm: () => {
      const count = State.get('snooze_count');
      const aden = State.get('adenosine');
      if (count > 1) return 'Again.';
      if (aden > 50) return 'Your hand is already moving.';
      return 'Snooze.';
    },

    dismiss_alarm: () => {
      const count = State.get('snooze_count');
      if (count > 2) return 'Enough. Up.';
      return 'Up.';
    },

    charge_phone: () => {
      return 'The charger.';
    },

    check_phone_bedroom: () => {
      const mood = State.moodTone();
      const cortisol = State.get('cortisol');
      if (cortisol > 60) return 'Your hand is already on your phone.';
      if (mood === 'numb') return 'Phone. Screen. Light in the dark.';
      return 'Your phone.';
    },

    lie_there: () => {
      const mood = State.moodTone();
      const aden = State.get('adenosine');
      if (aden > 60) return 'You\'re not getting up yet.';
      if (mood === 'heavy') return 'You stay. The ceiling stays.';
      if (mood === 'numb') return 'Nothing to get up for. Not yet.';
      return 'A few more minutes.';
    },

    look_out_window: () => {
      const mood = State.moodTone();
      if (mood === 'hollow') return 'The window. Something outside.';
      return 'The window.';
    },

    // === KITCHEN ===

    eat_food: () => {
      const mood = State.moodTone();
      if (['very_hungry', 'starving'].includes(State.hungerTier())) return 'You need to eat something.';
      if (mood === 'numb') return 'You open the fridge. Standing there.';
      if (mood === 'heavy') return 'Something from the fridge. Whatever\'s there.';
      return 'Something from the fridge.';
    },

    drink_water: () => {
      const aden = State.get('adenosine');
      if (aden > 60) return 'Water. Your mouth is dry.';
      return 'Water.';
    },

    make_coffee: () => {
      const aden = State.get('adenosine');
      const caffeine = State.caffeineTier();
      if (caffeine === 'active') return 'The second cup.';
      if (aden > 65 && State.adenosineBlock() > 0.5) return 'Coffee. You need it.';
      return 'Coffee.';
    },

    do_dishes: () => {
      const mood = State.moodTone();
      if (mood === 'heavy') return 'The dishes. They\'re still there.';
      return 'The dishes.';
    },

    check_phone_kitchen: () => {
      const mood = State.moodTone();
      if (mood === 'fraying') return 'Your hand finds your phone again.';
      return 'Your phone.';
    },

    sit_at_table: () => {
      const mood = State.moodTone();
      if (mood === 'numb' || mood === 'heavy') return 'The chair. You\'re sitting down before you meant to.';
      if (mood === 'fraying') return 'You sit. Your body made the decision.';
      return 'The table.';
    },

    // === BATHROOM ===

    shower: () => {
      const mood = State.moodTone();
      if (mood === 'numb') return 'The bathroom. Automatic.';
      if (mood === 'fraying') return 'Water. You need the water.';
      if (mood === 'heavy') return 'Shower. Going through the motions.';
      return 'Shower.';
    },

    use_sink: () => {
      return 'The sink.';
    },

    take_pain_reliever: () => {
      const tier = State.migraineTier();
      if (tier === 'severe') return 'The medication. You need it.';
      if (tier === 'active') return 'Something for the headache.';
      return 'Pain reliever.';
    },

    // === STREET ===

    check_phone_street: () => {
      return 'Your phone, out of your pocket.';
    },

    sit_on_step: () => {
      const mood = State.moodTone();
      if (mood === 'heavy' || mood === 'numb') return 'You\'re stopping. Sitting.';
      return 'The step.';
    },

    go_for_walk: () => {
      const mood = State.moodTone();
      const ne = State.get('norepinephrine');
      if (ne > 60) return 'Moving. You need to be moving.';
      if (mood === 'heavy') return 'Walking. Not going anywhere, just walking.';
      return 'A walk.';
    },

    // === BUS STOP ===

    wait_for_bus: () => {
      const mood = State.moodTone();
      if (mood === 'numb') return 'You stand there. The bus will come.';
      return 'Waiting.';
    },

    // === WORKPLACE ===

    do_work: () => {
      const mood = State.moodTone();
      const dopa = State.get('dopamine');
      if (dopa < 30) return 'The screen. The work. You\'re starting before you\'re ready.';
      if (mood === 'flat') return 'Work.';
      return 'Back to it.';
    },

    work_break: () => {
      const mood = State.moodTone();
      const cortisol = State.get('cortisol');
      if (cortisol > 55) return 'You need a minute. You\'re taking a minute.';
      if (mood === 'heavy') return 'A break. Whether it helps or not.';
      return 'A break.';
    },

    talk_to_coworker: () => {
      const mood = State.moodTone();
      if (mood === 'hollow' || mood === 'numb') return 'Someone\'s there. You\'re turning toward them.';
      return 'A word with someone.';
    },

    check_phone_work: () => {
      return 'Your phone, under the desk.';
    },

    // === CORNER STORE ===

    buy_groceries: () => {
      const mood = State.moodTone();
      if (mood === 'heavy') return 'Groceries. Whatever\'s cheap.';
      return 'Groceries.';
    },

    buy_cheap_meal: () => {
      if (['very_hungry', 'starving'].includes(State.hungerTier())) return 'Something quick. You\'re hungry.';
      return 'Something to eat.';
    },

    browse_store: () => {
      return 'Looking around.';
    },

    // === PHONE MODE ===

    read_messages: () => {
      const mood = State.moodTone();
      if (mood === 'hollow') return 'The messages. Someone wrote to you.';
      return 'Messages.';
    },

    toggle_phone_silent: () => {
      return State.get('phone_silent') ? 'Sound on.' : 'Silent.';
    },

    put_phone_away: () => {
      return 'Phone away.';
    },

    reply_to_friend: () => {
      const mood = State.moodTone();
      if (mood === 'hollow' || mood === 'heavy') return 'Reply. Just a few words.';
      if (mood === 'fraying') return 'Send something back.';
      return 'Reply.';
    },

    message_friend: () => {
      const mood = State.moodTone();
      if (mood === 'hollow' || mood === 'heavy') return 'Write. Just something.';
      if (mood === 'fraying') return 'Send something. Anything.';
      return 'Write.';
    },

    // === ANYWHERE ===

    call_in: () => {
      const mood = State.moodTone();
      if (mood === 'heavy' || mood === 'numb') return 'You\'re not going in. You\'re already not going in.';
      if (mood === 'fraying') return 'You can\'t do it today. You\'re reaching for the phone.';
      return 'Calling in.';
    },

    // === MOVEMENT ===

    'move:apartment_kitchen': () => {
      const mood = State.moodTone();
      if (mood === 'heavy') return 'Kitchen. The steps happen.';
      return 'Kitchen.';
    },

    'move:apartment_bathroom': () => {
      return 'Bathroom.';
    },

    'move:apartment_bedroom': () => {
      const mood = State.moodTone();
      const aden = State.get('adenosine');
      if (aden > 60) return 'Back to the bedroom. Back to the bed.';
      if (mood === 'heavy') return 'The bedroom.';
      return 'Bedroom.';
    },

    'move:street': () => {
      const mood = State.moodTone();
      const temp = State.temperatureTier();
      const weather = State.get('weather');
      const cold = temp === 'bitter' || temp === 'freezing';
      if (weather === 'snow') return mood === 'heavy' ? 'Out. Into the snow.' : 'Out. Snow.';
      if (mood === 'heavy') return cold ? 'Out. It\'s cold.' : 'Out. You\'re heading out.';
      if (mood === 'fraying') return 'Door. Air. Outside.';
      if (cold && temp === 'bitter') return 'Door. Brace for the cold.';
      return 'Door.';
    },

    'move:bus_stop': () => {
      const mood = State.moodTone();
      if (mood === 'numb' || mood === 'heavy') return 'The bus stop. Your feet know the way.';
      return 'Bus stop.';
    },

    'move:workplace': () => {
      const mood = State.moodTone();
      if (mood === 'heavy') return 'Work. The bus, the building, the desk. All of it coming.';
      return 'Bus.';
    },

    'move:corner_store': () => {
      const mood = State.moodTone();
      if (mood === 'heavy') return 'The store. Walking there.';
      return 'The store.';
    },
  };

  return {
    locationDescriptions,
    interactions,
    eventText,
    idleThoughts,
    transitionText,
    getAvailableInteractions,
    getInteraction,
    generateIncomingMessages,
    phoneScreenDescription,
    getTimeSource,
    getMoneySource,
    resetIdleTracking,
    approachingProse,
  };
}

