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
    const age = Timeline.charRandomInt(22, 48);
    const outfit = Timeline.charPick(outfitSets);
    const sleepwear = Timeline.charPick(sleepwearOptions);

    // Start date — random day in 2024, stored as minutes since Unix epoch
    const baseDateMinutes = 28401120; // 2024-01-01 00:00 UTC
    const dayOffset = Timeline.charRandomInt(0, 364);
    const startTimestamp = baseDateMinutes + dayOffset * 1440;
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
      age_stage: age,
      start_timestamp: startTimestamp,
      latitude: Timeline.charRandomInt(-55, 55),
    });
  }

  // --- Creation UI flow ---

  /** @type {Partial<GameCharacter>} */
  let sandboxState = {};
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
            showSandboxPage();
          }
        },
      ]
    );
  }

  // --- Sandbox: single-page character creation ---

  function showSandboxPage() {
    sandboxState = {};
    const usedNames = new Set();

    // Consume charRng upfront for random elements
    const shuffled = [...outfitSets];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Timeline.charRandomInt(0, i);
      [shuffled[i], shuffled[j]] = [/** @type {OutfitSet} */ (shuffled[j]), /** @type {OutfitSet} */ (shuffled[i])];
    }
    const outfitOptions = shuffled.slice(0, 3);
    const sleepwear = /** @type {string} */ (Timeline.charPick(sleepwearOptions));
    const ageDefault = Timeline.charRandomInt(22, 48);

    // Start date — random day in 2024
    const baseDateMinutes = 28401120; // 2024-01-01 00:00 UTC
    const dayOffset = Timeline.charRandomInt(0, 364);
    const defaultSeason = dayOffset < 91 ? 'winter' : dayOffset < 182 ? 'spring' : dayOffset < 274 ? 'summer' : 'autumn';
    let selectedSeason = defaultSeason;
    let selectedLatitude = 42;

    const friendFlavors = ['sends_things', 'checks_in', 'dry_humor', 'earnest'];
    const f1flavor = /** @type {string} */ (Timeline.charPick(friendFlavors));
    const remainingFriend = friendFlavors.filter(f => f !== f1flavor);
    const f2flavor = /** @type {string} */ (Timeline.charPick(remainingFriend));

    const coworkerFlavors = ['warm_quiet', 'mundane_talker', 'stressed_out'];
    const c1flavor = /** @type {string} */ (Timeline.charPick(coworkerFlavors));
    const remainingCoworker = coworkerFlavors.filter(f => f !== c1flavor);
    const c2flavor = /** @type {string} */ (Timeline.charPick(remainingCoworker));

    const friend1Default = generateFirstName(usedNames);
    const friend2Default = generateFirstName(usedNames);
    const coworker1Default = generateFirstName(usedNames);
    const coworker2Default = generateFirstName(usedNames);
    const supervisorDefault = generateFirstName(usedNames);
    const playerDefault = generateName(usedNames);

    // Build page
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
      passageEl.innerHTML = '';

      // --- Job ---
      const jobP = document.createElement('p');
      jobP.textContent = 'Work is a fact. The kind depends on what life handed you.';
      passageEl.appendChild(jobP);

      const jobGroup = document.createElement('div');
      jobGroup.className = 'chargen-group';
      const jobs = [
        { label: 'An office', value: 'office' },
        { label: 'A store', value: 'retail' },
        { label: 'A kitchen counter', value: 'food_service' },
      ];
      for (const job of jobs) {
        const btn = document.createElement('button');
        btn.className = 'chargen-option';
        btn.textContent = job.label;
        btn.addEventListener('click', () => {
          sandboxState.job_type = job.value;
          jobGroup.querySelectorAll('.chargen-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          maybeShowConfirm();
        });
        jobGroup.appendChild(btn);
      }
      passageEl.appendChild(jobGroup);

      // --- Age ---
      const ageInput = document.createElement('input');
      ageInput.type = 'text';
      ageInput.inputMode = 'numeric';
      ageInput.className = 'age-input';
      ageInput.value = String(ageDefault);
      ageInput.maxLength = 2;

      const ageP = document.createElement('p');
      ageP.append('You\u2019re ');
      ageP.appendChild(ageInput);
      ageP.append('.');
      passageEl.appendChild(ageP);

      // --- Season ---
      const seasonP = document.createElement('p');
      seasonP.textContent = 'Outside \u2014';
      passageEl.appendChild(seasonP);

      const seasonGroup = document.createElement('div');
      seasonGroup.className = 'chargen-group';
      const seasons = [
        { label: 'Cold. Frost on the window, maybe.', value: 'winter' },
        { label: 'Something blooming somewhere. You can almost smell it.', value: 'spring' },
        { label: 'Already warm. Going to be one of those days.', value: 'summer' },
        { label: 'Grey light. Days getting shorter.', value: 'autumn' },
      ];
      for (const s of seasons) {
        const btn = document.createElement('button');
        btn.className = 'chargen-option';
        if (s.value === defaultSeason) btn.classList.add('selected');
        btn.textContent = s.label;
        btn.addEventListener('click', () => {
          selectedSeason = s.value;
          seasonGroup.querySelectorAll('.chargen-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
        seasonGroup.appendChild(btn);
      }
      passageEl.appendChild(seasonGroup);

      // --- Wardrobe ---
      const wardrobeP = document.createElement('p');
      wardrobeP.textContent = 'Getting dressed. The daily negotiation with what to put on.';
      passageEl.appendChild(wardrobeP);

      const wardrobeGroup = document.createElement('div');
      wardrobeGroup.className = 'chargen-group';
      for (const outfit of outfitOptions) {
        const btn = document.createElement('button');
        btn.className = 'chargen-option';
        btn.textContent = outfit.outfit_default.split('.')[0] + '.';
        btn.addEventListener('click', () => {
          sandboxState.outfit_default = outfit.outfit_default;
          sandboxState.outfit_low_mood = outfit.outfit_low_mood;
          sandboxState.outfit_messy = outfit.outfit_messy;
          wardrobeGroup.querySelectorAll('.chargen-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          maybeShowConfirm();
        });
        wardrobeGroup.appendChild(btn);
      }
      passageEl.appendChild(wardrobeGroup);

      // --- Friends ---
      const friendP = document.createElement('p');
      friendP.textContent = 'Two people who still text you. Not every day. But enough.';
      passageEl.appendChild(friendP);

      const friendGroup = document.createElement('div');
      friendGroup.className = 'chargen-group';
      const friend1Input = createNameInput(friend1Default, usedNames);
      const friend2Input = createNameInput(friend2Default, usedNames);
      friendGroup.appendChild(friend1Input);
      friendGroup.appendChild(friend2Input);
      passageEl.appendChild(friendGroup);

      // --- Work ---
      const workP = document.createElement('p');
      workP.textContent = 'The people at work. You didn\'t choose them. They didn\'t choose you.';
      passageEl.appendChild(workP);

      const workGroup = document.createElement('div');
      workGroup.className = 'chargen-group';
      const co1Input = createNameInput(coworker1Default, usedNames);
      const co2Input = createNameInput(coworker2Default, usedNames);
      const supInput = createNameInput(supervisorDefault, usedNames);
      workGroup.appendChild(co1Input);
      workGroup.appendChild(co2Input);
      workGroup.appendChild(supInput);
      passageEl.appendChild(workGroup);

      // --- Player name ---
      const first = document.createElement('span');
      first.className = 'editable-name';
      first.contentEditable = 'true';
      first.spellcheck = false;
      first.textContent = playerDefault.first;

      const last = document.createElement('span');
      last.className = 'editable-name';
      last.contentEditable = 'true';
      last.spellcheck = false;
      last.textContent = playerDefault.last;

      const nameP = document.createElement('p');
      nameP.append('Your name is ', first, ' ', last, '. At least, that\u2019s what it says on everything.');
      passageEl.appendChild(nameP);

      const nameReroll = document.createElement('button');
      nameReroll.className = 'name-reroll';
      nameReroll.textContent = '\u21bb';
      nameReroll.addEventListener('click', () => {
        const currentFirst = (first.textContent || '').trim();
        if (currentFirst) usedNames.delete(currentFirst);
        const newName = generateName(usedNames);
        first.textContent = newName.first;
        last.textContent = newName.last;
      });
      passageEl.appendChild(nameReroll);

      /** @param {KeyboardEvent} e */
      const preventEnter = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); /** @type {HTMLElement} */ (e.target).blur(); }
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

      // --- Start over ---
      const startOverBtn = document.createElement('button');
      startOverBtn.className = 'chargen-option';
      startOverBtn.textContent = 'Start over';
      startOverBtn.addEventListener('click', () => showOpeningScreen());
      passageEl.appendChild(startOverBtn);

      passageEl.classList.add('visible');

      // Confirm button — appears once job and wardrobe are chosen
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'action';
      confirmBtn.textContent = 'This is you.';
      confirmBtn.addEventListener('click', () => {
        const ageVal = parseInt(ageInput.value, 10);
        sandboxState.age_stage = (ageVal >= 18 && ageVal <= 65) ? ageVal : ageDefault;
        sandboxState.sleepwear = sleepwear;
        sandboxState.friend1 = { name: /** @type {HTMLInputElement} */ (friend1Input.querySelector('input')).value.trim() || friend1Default, flavor: f1flavor };
        sandboxState.friend2 = { name: /** @type {HTMLInputElement} */ (friend2Input.querySelector('input')).value.trim() || friend2Default, flavor: f2flavor };
        sandboxState.coworker1 = { name: /** @type {HTMLInputElement} */ (co1Input.querySelector('input')).value.trim() || coworker1Default, flavor: c1flavor };
        sandboxState.coworker2 = { name: /** @type {HTMLInputElement} */ (co2Input.querySelector('input')).value.trim() || coworker2Default, flavor: c2flavor };
        sandboxState.supervisor = { name: /** @type {HTMLInputElement} */ (supInput.querySelector('input')).value.trim() || supervisorDefault };
        sandboxState.first_name = (first.textContent || '').trim() || playerDefault.first;
        sandboxState.last_name = (last.textContent || '').trim() || playerDefault.last;

        // Compute start_timestamp from selected season + latitude.
        // Season names map to NH calendar months; SH flips by 182 days.
        const seasonStarts = { winter: 0, spring: 91, summer: 182, autumn: 274 };
        const seasonLengths = { winter: 91, spring: 91, summer: 92, autumn: 91 };
        const ss = /** @type {'winter'|'spring'|'summer'|'autumn'} */ (selectedSeason);
        let remappedDay = seasonStarts[ss] + (dayOffset % seasonLengths[ss]);
        if (selectedLatitude < 0) {
          remappedDay = (remappedDay + 182) % 365;
        }
        sandboxState.start_timestamp = baseDateMinutes + remappedDay * 1440;
        sandboxState.latitude = selectedLatitude;

        finishCreation(/** @type {GameCharacter} */ (sandboxState));
      });
      actionsEl.appendChild(confirmBtn);

      function maybeShowConfirm() {
        if (sandboxState.job_type && sandboxState.outfit_default) {
          actionsEl.classList.add('visible');
        }
      }
    }, 150);
  }

  // --- Helpers ---

  /** @param {string} defaultValue @param {Set<string>} [usedNames] */
  function createNameInput(defaultValue, usedNames) {
    const wrapper = document.createElement('div');
    wrapper.className = 'name-input-wrapper';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'name-input';
    input.value = defaultValue;
    input.maxLength = 20;
    wrapper.appendChild(input);

    if (usedNames) {
      const btn = document.createElement('button');
      btn.className = 'name-reroll';
      btn.textContent = '\u21bb';
      btn.addEventListener('click', () => {
        const current = input.value.trim();
        if (current) usedNames.delete(current);
        const newName = generateFirstName(usedNames);
        input.value = newName;
      });
      wrapper.appendChild(btn);
    }

    return wrapper;
  }

  // --- Player name screen (random path) ---

  /** @param {GameCharacter} char */
  function showPlayerNameScreen(char) {
    const passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    const movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));
    const eventTextEl = /** @type {HTMLElement} */ (document.getElementById('event-text'));

    const usedNames = new Set([
      char.friend1.name, char.friend2.name,
      char.coworker1.name, char.coworker2.name,
      char.supervisor.name, char.first_name,
    ]);

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

      const nameReroll = document.createElement('button');
      nameReroll.className = 'name-reroll';
      nameReroll.textContent = '\u21bb';
      nameReroll.addEventListener('click', () => {
        const currentFirst = (first.textContent || '').trim();
        if (currentFirst) usedNames.delete(currentFirst);
        const newName = generateName(usedNames);
        first.textContent = newName.first;
        last.textContent = newName.last;
      });
      passageEl.appendChild(nameReroll);

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

        const rerollBtn = document.createElement('button');
        rerollBtn.className = 'action';
        rerollBtn.textContent = 'A different life';
        rerollBtn.addEventListener('click', () => {
          const newChar = generateRandom();
          showPlayerNameScreen(newChar);
        });
        actionsEl.appendChild(rerollBtn);

        const startOverBtn = document.createElement('button');
        startOverBtn.className = 'action';
        startOverBtn.textContent = 'Start over';
        startOverBtn.addEventListener('click', () => showOpeningScreen());
        actionsEl.appendChild(startOverBtn);

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
