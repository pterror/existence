// chargen.js — character generation and creation UI flow

const Chargen = (() => {

  // --- Name generation ---

  /** @param {Set<string>} exclude */
  function generateName(exclude) {
    let first, last, attempts = 0;
    do {
      first = Timeline.charWeightedPick(NameData.first);
      attempts++;
    } while (exclude.has(first) && attempts < 50);
    exclude.add(first);

    last = Timeline.charWeightedPick(NameData.last);
    return { first, last };
  }

  /** @param {Set<string>} exclude */
  function generateFirstName(exclude) {
    let name, attempts = 0;
    do {
      name = Timeline.charWeightedPick(NameData.first);
      attempts++;
    } while (exclude.has(name) && attempts < 50);
    exclude.add(name);
    return name;
  }

  // --- Outfit sets ---
  // Each set is a triple: [default, low_mood, messy]
  // Complete prose sentences — no assembly.

  const outfitSets = [
    {
      outfit_default: 'Jeans, a flannel, socks that match close enough. You get dressed.',
      outfit_low_mood: 'Jeans. The black hoodie. Each piece is a separate decision. You make them all, eventually.',
      outfit_messy: 'You find a shirt in the pile that passes the smell test. Jeans from the chair. Good enough.',
    },
    {
      outfit_default: 'Dark jeans, a grey sweater. Simple. It works.',
      outfit_low_mood: 'You pull on the same sweater as yesterday. The jeans from the floor. Getting dressed is a verb. You do it.',
      outfit_messy: 'Something from the chair. You don\'t check if it\'s clean. It\'s close enough to clean.',
    },
    {
      outfit_default: 'Khakis and a polo. The uniform of not trying too hard.',
      outfit_low_mood: 'Khakis. A shirt. The motions of getting dressed happen. You watch them from somewhere inside.',
      outfit_messy: 'The khakis have a stain you didn\'t notice until now. The polo is wrinkled. It\'ll do.',
    },
    {
      outfit_default: 'Black pants, a plain tee, your jacket. Ready.',
      outfit_low_mood: 'Black on black. It\'s easier when everything matches by default. You pull it on.',
      outfit_messy: 'The pants from the floor, a shirt from the pile. You\'re wearing clothes. That counts.',
    },
    {
      outfit_default: 'Leggings and an oversized cardigan. Comfortable enough to forget you\'re wearing it.',
      outfit_low_mood: 'The leggings. The big cardigan. Like wearing a blanket you can go outside in.',
      outfit_messy: 'Whatever\'s on the chair. The cardigan hides a lot. That\'s one of its better features.',
    },
    {
      outfit_default: 'Jeans and a worn-in tee. Nothing to think about.',
      outfit_low_mood: 'The same jeans. A shirt. You\'re dressed. That\'s the bar and you\'ve cleared it.',
      outfit_messy: 'Something from the pile that doesn\'t smell wrong. Good enough for what today is.',
    },
  ];

  // --- Sleepwear options ---
  const sleepwearOptions = [
    'the old grey t-shirt and boxers you slept in',
    'a faded band shirt and sweatpants',
    'an oversized sleep shirt that hangs past your knees',
    'a tank top and flannel pajama pants',
    'the same clothes you wore yesterday, because you fell asleep in them',
    'a worn hoodie and shorts',
  ];

  // --- Random character generation ---

  function generateRandom() {
    const usedNames = new Set();

    // Player name
    const playerName = generateName(usedNames);

    // Friends
    const friend1Name = generateFirstName(usedNames);
    const friend2Name = generateFirstName(usedNames);
    const friendFlavors = ['sends_things', 'checks_in', 'dry_humor', 'earnest'];
    const f1flavor = Timeline.charPick(friendFlavors);
    const remainingFriend = friendFlavors.filter(f => f !== f1flavor);
    const f2flavor = Timeline.charPick(remainingFriend);

    // Coworkers
    const coworker1Name = generateFirstName(usedNames);
    const coworker2Name = generateFirstName(usedNames);
    const coworkerFlavors = ['warm_quiet', 'mundane_talker', 'stressed_out'];
    const c1flavor = Timeline.charPick(coworkerFlavors);
    const remainingCoworker = coworkerFlavors.filter(f => f !== c1flavor);
    const c2flavor = Timeline.charPick(remainingCoworker);

    // Supervisor
    const supervisorName = generateFirstName(usedNames);

    // Job, age, wardrobe
    const jobType = Timeline.charPick(['office', 'retail', 'food_service']);
    const ageStage = Timeline.charPick(['twenties', 'thirties', 'forties']);
    const outfit = Timeline.charPick(outfitSets);
    const sleepwear = Timeline.charPick(sleepwearOptions);

    return /** @type {GameCharacter} */ ({
      first_name: playerName.first,
      last_name: playerName.last,
      sleepwear,
      ...outfit,
      friend1: { name: friend1Name, flavor: f1flavor },
      friend2: { name: friend2Name, flavor: f2flavor },
      coworker1: { name: coworker1Name, flavor: c1flavor },
      coworker2: { name: coworker2Name, flavor: c2flavor },
      supervisor: { name: supervisorName },
      job_type: jobType,
      age_stage: ageStage,
    });
  }

  // --- Sandbox UI flow ---
  // Uses the same #passage / #actions DOM as the game.
  // Forward-only screens, one choice per screen.

  /** @type {Partial<GameCharacter>} */
  let sandboxState = {};
  /** @type {Set<string>} */
  let usedNames = new Set();
  /** @type {((char: GameCharacter) => void) | null} */
  let resolveCreation = null;

  function startCreation() {
    return new Promise(resolve => {
      resolveCreation = resolve;
      showOpeningScreen();
    });
  }

  /** @param {string} text @param {ScreenChoice[]} choices */
  function showScreen(text, choices) {
    const passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    const movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));
    const eventTextEl = /** @type {HTMLElement} */ (document.getElementById('event-text'));

    // Clear
    passageEl.classList.remove('visible');
    actionsEl.innerHTML = '';
    actionsEl.classList.remove('visible');
    movementEl.innerHTML = '';
    movementEl.classList.remove('visible');
    eventTextEl.innerHTML = '';
    eventTextEl.classList.remove('visible');

    setTimeout(() => {
      passageEl.innerHTML = text.split(/\n\n+/).filter(/** @param {string} p */ p => p.trim()).map(/** @param {string} p */ p => `<p>${p.trim()}</p>`).join('');
      passageEl.classList.add('visible');

      setTimeout(() => {
        for (const choice of choices) {
          const btn = document.createElement('button');
          btn.className = 'action';
          btn.textContent = choice.label;
          btn.addEventListener('click', () => choice.action());
          actionsEl.appendChild(btn);
        }
        actionsEl.classList.add('visible');
      }, 400);
    }, 150);
  }

  function showOpeningScreen() {
    showScreen(
      'A life.\n\nNot the one you would have picked, maybe. But the one that\'s here.',
      [
        {
          label: 'Begin with a random life',
          action: () => {
            const char = generateRandom();
            showPlayerNameScreen(char);
          }
        },
        {
          label: 'Choose your own',
          action: () => {
            sandboxState = {};
            usedNames = new Set();
            showJobScreen();
          }
        },
      ]
    );
  }

  // --- Sandbox screens ---

  function showJobScreen() {
    showScreen(
      'Work is a fact. The kind depends on what life handed you.',
      [
        {
          label: 'An office',
          action: () => { sandboxState.job_type = 'office'; showAgeScreen(); }
        },
        {
          label: 'A store',
          action: () => { sandboxState.job_type = 'retail'; showAgeScreen(); }
        },
        {
          label: 'A kitchen counter',
          action: () => { sandboxState.job_type = 'food_service'; showAgeScreen(); }
        },
      ]
    );
  }

  function showAgeScreen() {
    showScreen(
      'Time has passed. How much depends.',
      [
        {
          label: 'Twenties',
          action: () => { sandboxState.age_stage = 'twenties'; showWardrobeScreen(); }
        },
        {
          label: 'Thirties',
          action: () => { sandboxState.age_stage = 'thirties'; showWardrobeScreen(); }
        },
        {
          label: 'Forties',
          action: () => { sandboxState.age_stage = 'forties'; showWardrobeScreen(); }
        },
      ]
    );
  }

  function showWardrobeScreen() {
    // Pick 3 random outfit sets to offer
    const shuffled = [...outfitSets];
    // Fisher-Yates using charRng
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Timeline.charRandomInt(0, i);
      [shuffled[i], shuffled[j]] = [/** @type {OutfitSet} */ (shuffled[j]), /** @type {OutfitSet} */ (shuffled[i])];
    }
    const options = shuffled.slice(0, 3);

    showScreen(
      'Getting dressed. The daily negotiation with what to put on.',
      options.map((outfit, i) => ({
        label: outfit.outfit_default.split('.')[0] + '.',
        action: () => {
          sandboxState.outfit_default = outfit.outfit_default;
          sandboxState.outfit_low_mood = outfit.outfit_low_mood;
          sandboxState.outfit_messy = outfit.outfit_messy;
          sandboxState.sleepwear = /** @type {string} */ (Timeline.charPick(sleepwearOptions));
          showFriendNamesScreen();
        }
      }))
    );
  }

  function showFriendNamesScreen() {
    // Generate suggested names
    const name1 = generateFirstName(usedNames);
    const name2 = generateFirstName(usedNames);

    const friendFlavors = ['sends_things', 'checks_in', 'dry_humor', 'earnest'];
    const f1flavor = Timeline.charPick(friendFlavors);
    const remainingFriend = friendFlavors.filter(f => f !== f1flavor);
    const f2flavor = Timeline.charPick(remainingFriend);

    showNamePairScreen(
      'Two people who still text you. Not every day. But enough.',
      name1, name2,
      (/** @type {string} */ finalName1, /** @type {string} */ finalName2) => {
        sandboxState.friend1 = { name: finalName1, flavor: /** @type {string} */ (f1flavor) };
        sandboxState.friend2 = { name: finalName2, flavor: /** @type {string} */ (f2flavor) };
        showWorkNamesScreen();
      }
    );
  }

  function showWorkNamesScreen() {
    const name1 = generateFirstName(usedNames);
    const name2 = generateFirstName(usedNames);
    const name3 = generateFirstName(usedNames);

    const coworkerFlavors = ['warm_quiet', 'mundane_talker', 'stressed_out'];
    const c1flavor = Timeline.charPick(coworkerFlavors);
    const remainingCoworker = coworkerFlavors.filter(f => f !== c1flavor);
    const c2flavor = Timeline.charPick(remainingCoworker);

    showNameTripleScreen(
      'The people at work. You didn\'t choose them. They didn\'t choose you.',
      name1, name2, name3,
      (/** @type {string} */ coName1, /** @type {string} */ coName2, /** @type {string} */ supName) => {
        sandboxState.coworker1 = { name: coName1, flavor: /** @type {string} */ (c1flavor) };
        sandboxState.coworker2 = { name: coName2, flavor: /** @type {string} */ (c2flavor) };
        sandboxState.supervisor = { name: supName };

        // Generate player name
        const playerName = generateName(usedNames);
        sandboxState.first_name = playerName.first;
        sandboxState.last_name = playerName.last;

        showPlayerNameScreen(/** @type {GameCharacter} */ (sandboxState));
      }
    );
  }

  // --- Name input screens ---

  /** @param {string} text @param {string} defaultName1 @param {string} defaultName2 @param {(n1: string, n2: string) => void} callback */
  function showNamePairScreen(text, defaultName1, defaultName2, callback) {
    const passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    const movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));
    const eventTextEl = /** @type {HTMLElement} */ (document.getElementById('event-text'));

    passageEl.classList.remove('visible');
    actionsEl.innerHTML = '';
    actionsEl.classList.remove('visible');
    movementEl.innerHTML = '';
    movementEl.classList.remove('visible');
    eventTextEl.innerHTML = '';
    eventTextEl.classList.remove('visible');

    setTimeout(() => {
      passageEl.innerHTML = text.split(/\n\n+/).filter(/** @param {string} p */ p => p.trim()).map(/** @param {string} p */ p => `<p>${p.trim()}</p>`).join('');
      passageEl.classList.add('visible');

      setTimeout(() => {
        const input1 = createNameInput(defaultName1);
        const input2 = createNameInput(defaultName2);

        actionsEl.appendChild(input1);
        actionsEl.appendChild(input2);

        const btn = document.createElement('button');
        btn.className = 'action';
        btn.textContent = 'These two';
        btn.addEventListener('click', () => {
          const n1 = /** @type {HTMLInputElement} */ (input1.querySelector('input')).value.trim() || defaultName1;
          const n2 = /** @type {HTMLInputElement} */ (input2.querySelector('input')).value.trim() || defaultName2;
          callback(n1, n2);
        });
        actionsEl.appendChild(btn);
        actionsEl.classList.add('visible');
      }, 400);
    }, 150);
  }

  /** @param {string} text @param {string} defaultName1 @param {string} defaultName2 @param {string} defaultName3 @param {(n1: string, n2: string, n3: string) => void} callback */
  function showNameTripleScreen(text, defaultName1, defaultName2, defaultName3, callback) {
    const passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    const movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));
    const eventTextEl = /** @type {HTMLElement} */ (document.getElementById('event-text'));

    passageEl.classList.remove('visible');
    actionsEl.innerHTML = '';
    actionsEl.classList.remove('visible');
    movementEl.innerHTML = '';
    movementEl.classList.remove('visible');
    eventTextEl.innerHTML = '';
    eventTextEl.classList.remove('visible');

    setTimeout(() => {
      passageEl.innerHTML = text.split(/\n\n+/).filter(/** @param {string} p */ p => p.trim()).map(/** @param {string} p */ p => `<p>${p.trim()}</p>`).join('');
      passageEl.classList.add('visible');

      setTimeout(() => {
        const input1 = createNameInput(defaultName1);
        const input2 = createNameInput(defaultName2);
        const input3 = createNameInput(defaultName3);

        actionsEl.appendChild(input1);
        actionsEl.appendChild(input2);
        actionsEl.appendChild(input3);

        const btn = document.createElement('button');
        btn.className = 'action';
        btn.textContent = 'That\'s them';
        btn.addEventListener('click', () => {
          const n1 = /** @type {HTMLInputElement} */ (input1.querySelector('input')).value.trim() || defaultName1;
          const n2 = /** @type {HTMLInputElement} */ (input2.querySelector('input')).value.trim() || defaultName2;
          const n3 = /** @type {HTMLInputElement} */ (input3.querySelector('input')).value.trim() || defaultName3;
          callback(n1, n2, n3);
        });
        actionsEl.appendChild(btn);
        actionsEl.classList.add('visible');
      }, 400);
    }, 150);
  }

  /** @param {string} defaultValue */
  function createNameInput(defaultValue) {
    const wrapper = document.createElement('div');
    wrapper.className = 'name-input-wrapper';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'name-input';
    input.value = defaultValue;
    input.maxLength = 20;
    wrapper.appendChild(input);
    return wrapper;
  }

  // --- Player name screen ---

  /** @param {GameCharacter} char */
  function showPlayerNameScreen(char) {
    const passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    const movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));
    const eventTextEl = /** @type {HTMLElement} */ (document.getElementById('event-text'));

    passageEl.classList.remove('visible');
    actionsEl.innerHTML = '';
    actionsEl.classList.remove('visible');
    movementEl.innerHTML = '';
    movementEl.classList.remove('visible');
    eventTextEl.innerHTML = '';
    eventTextEl.classList.remove('visible');

    setTimeout(() => {
      const first = document.createElement('span');
      first.className = 'editable-name';
      first.contentEditable = 'true';
      first.spellcheck = false;
      first.textContent = char.first_name;

      const last = document.createElement('span');
      last.className = 'editable-name';
      last.contentEditable = 'true';
      last.spellcheck = false;
      last.textContent = char.last_name;

      const p = document.createElement('p');
      p.append(
        'Your name is ',
        first,
        ' ',
        last,
        '. At least, that\u2019s what it says on everything.'
      );

      passageEl.innerHTML = '';
      passageEl.appendChild(p);
      passageEl.classList.add('visible');

      // Prevent line breaks and strip pasted formatting
      /** @param {KeyboardEvent} e */
      const preventEnter = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          /** @type {HTMLElement} */ (e.target).blur();
        }
      };
      /** @param {ClipboardEvent} e */
      const pastePlain = (e) => {
        e.preventDefault();
        const text = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
        document.execCommand('insertText', false, text.replace(/\n/g, ''));
      };

      first.addEventListener('keydown', preventEnter);
      first.addEventListener('paste', pastePlain);
      last.addEventListener('keydown', preventEnter);
      last.addEventListener('paste', pastePlain);

      setTimeout(() => {
        const btn = document.createElement('button');
        btn.className = 'action';
        btn.textContent = 'This is you.';
        btn.addEventListener('click', () => {
          const firstName = (first.textContent || '').trim() || char.first_name;
          const lastName = (last.textContent || '').trim() || char.last_name;
          char.first_name = firstName;
          char.last_name = lastName;
          finishCreation(char);
        });
        actionsEl.appendChild(btn);
        actionsEl.classList.add('visible');
      }, 400);
    }, 150);
  }

  // --- Finish ---

  /** @param {GameCharacter} char */
  async function finishCreation(char) {
    Timeline.setCharacter(char);
    Character.set(char);

    // Create run in IndexedDB and set as active
    const runId = await Runs.createRun(Timeline.getSeed(), char);
    Timeline.setActiveRunId(runId);

    if (resolveCreation) {
      resolveCreation(char);
      resolveCreation = null;
    }
  }

  return {
    generateRandom,
    startCreation,
    outfitSets,
    sleepwearOptions,
  };
})();
