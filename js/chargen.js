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

  // --- Season helpers ---

  const seasonLabels = {
    winter: 'Cold. Frost on the window.',
    spring: 'Something blooming somewhere. You can almost smell it.',
    summer: 'Already warm. Going to be one of those days.',
    autumn: 'Grey light. Days getting shorter.',
  };

  const tropicalSeasonLabels = {
    wet: 'The air is thick, rain every afternoon.',
    dry: 'Dry heat. Dust on everything.',
  };

  const locationOptions = [
    { label: 'Somewhere the heat never quite lets go.', value: 'tropical', latitude: 10 },
    { label: 'A place where the seasons still bother to change.', value: 'nh_temperate', latitude: 42 },
    { label: 'Far enough north the cold has opinions.', value: 'nh_cold', latitude: 58 },
    { label: 'South of the equator. Everything\u2019s the same, but reversed.', value: 'sh_temperate', latitude: -35 },
  ];

  const jobLabels = {
    office: 'An office',
    retail: 'A store',
    food_service: 'A kitchen counter',
  };

  /**
   * Derive the season name from a start_timestamp and latitude.
   * Mirrors State.season() logic — month from timestamp, hemisphere flip.
   */
  function deriveSeasonFromTimestamp(startTimestamp, latitude) {
    const d = new Date(startTimestamp * 60000);
    const month = d.getUTCMonth(); // 0-11

    // Tropical — wet/dry
    if (Math.abs(latitude) < 23.5) {
      if (latitude >= 0) {
        return (month >= 4 && month <= 9) ? 'wet' : 'dry';
      }
      return (month >= 10 || month <= 3) ? 'wet' : 'dry';
    }

    // Temperate — four seasons
    let m = month;
    if (latitude < 0) {
      m = (month + 6) % 12;
    }
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * Compute a new start_timestamp that falls in the requested season.
   * Keeps the same year but picks a day within the target season's months.
   * Accounts for hemisphere by flipping months for southern latitudes.
   */
  function timestampForSeason(seasonName, latitude) {
    // Tropical wet/dry
    if (seasonName === 'wet' || seasonName === 'dry') {
      // NH tropical: wet = May–Oct, dry = Nov–Apr
      // SH tropical: wet = Oct–Mar, dry = Apr–Sep
      let targetMonth;
      if (latitude >= 0) {
        targetMonth = seasonName === 'wet' ? 6 : 0; // Jul or Jan
      } else {
        targetMonth = seasonName === 'wet' ? 0 : 6; // Jan or Jul
      }
      const d = new Date(Date.UTC(2024, targetMonth, 15));
      return Math.floor(d.getTime() / 60000);
    }

    // Temperate four seasons
    const seasonMonthStarts = { spring: 2, summer: 5, autumn: 8, winter: 11 };
    let targetMonth = seasonMonthStarts[seasonName];
    // For SH, flip by 6 months so the calendar date produces the right derived season
    if (latitude < 0) {
      targetMonth = (targetMonth + 6) % 12;
    }
    // Pick the 15th of that month
    const d = new Date(Date.UTC(2024, targetMonth, 15));
    return Math.floor(d.getTime() / 60000);
  }

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
    // Personality — generated silently, never shown in chargen UI
    const personality = {
      neuroticism: Math.floor(Timeline.charRandom() * 101),
      self_esteem: Math.floor(Timeline.charRandom() * 101),
      rumination: Math.floor(Timeline.charRandom() * 101),
    };

    // Extract latitude before sentiments to preserve existing charRng order
    const latitude = Timeline.charPick(locationOptions).latitude;

    // Sentiments — likes/dislikes, generated silently (Layer 2 basic sentiments)
    const sentiments = [];

    // Weather — everyone has preferences
    const weathers = ['clear', 'overcast', 'grey', 'drizzle'];
    const likedWeather = Timeline.charPick(weathers);
    const likedIntensity = 0.05 + Timeline.charRandom() * 0.8;
    sentiments.push({ target: 'weather_' + likedWeather, quality: 'comfort', intensity: likedIntensity });
    const dislikedPool = weathers.filter(w => w !== likedWeather);
    const dislikedWeather = Timeline.charPick(dislikedPool);
    const dislikedIntensity = 0.05 + Timeline.charRandom() * 0.55;
    sentiments.push({ target: 'weather_' + dislikedWeather, quality: 'irritation', intensity: dislikedIntensity });

    // Time of day — morning or evening person
    const timePref = Timeline.charPick(['morning', 'evening']);
    const timeIntensity = 0.1 + Timeline.charRandom() * 0.7;
    sentiments.push({ target: 'time_' + timePref, quality: 'comfort', intensity: timeIntensity });

    // Food comfort — some eat for comfort, others eat mechanically
    const foodIntensity = 0.02 + Timeline.charRandom() * 0.78;
    sentiments.push({ target: 'eating', quality: 'comfort', intensity: foodIntensity });

    // Rain sound — the sound of rain on windows
    const rainIntensity = 0.02 + Timeline.charRandom() * 0.88;
    sentiments.push({ target: 'rain_sound', quality: 'comfort', intensity: rainIntensity });

    // Quiet — comfort or irritation
    const quietIntensity = 0.1 + Timeline.charRandom() * 0.6;
    const quietQuality = Timeline.charRandom() > 0.35 ? 'comfort' : 'irritation';
    sentiments.push({ target: 'quiet', quality: quietQuality, intensity: quietIntensity });

    // Being outside
    const outsideIntensity = 0.02 + Timeline.charRandom() * 0.68;
    sentiments.push({ target: 'outside', quality: 'comfort', intensity: outsideIntensity });

    // Physical warmth
    const warmthIntensity = 0.02 + Timeline.charRandom() * 0.78;
    sentiments.push({ target: 'warmth', quality: 'comfort', intensity: warmthIntensity });

    // Routine — comfort or irritation
    const routineIntensity = 0.1 + Timeline.charRandom() * 0.5;
    const routineQuality = Timeline.charRandom() > 0.4 ? 'comfort' : 'irritation';
    sentiments.push({ target: 'routine', quality: routineQuality, intensity: routineIntensity });

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
      latitude,
      personality,
      sentiments,
    });
  }

  // --- Custom dropdown component ---

  /**
   * @param {Array<{label: string, value: string}>} options
   * @param {string} selectedValue
   * @param {(value: string) => void} onChange
   * @returns {{ element: HTMLElement, getValue: () => string, setValue: (v: string) => void }}
   */
  function createDropdown(options, selectedValue, onChange) {
    const wrapper = document.createElement('span');
    wrapper.className = 'chargen-dropdown';

    const trigger = document.createElement('span');
    trigger.className = 'chargen-dropdown-trigger';
    const selected = options.find(o => o.value === selectedValue);
    trigger.textContent = selected ? selected.label : options[0].label;

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'chargen-dropdown-options';

    let currentValue = selectedValue;

    for (const opt of options) {
      const btn = document.createElement('button');
      btn.className = 'chargen-option';
      if (opt.value === selectedValue) btn.classList.add('selected');
      btn.textContent = opt.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentValue = opt.value;
        trigger.textContent = opt.label;
        optionsContainer.querySelectorAll('.chargen-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        optionsContainer.classList.remove('open');
        onChange(opt.value);
      });
      optionsContainer.appendChild(btn);
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close any other open dropdowns
      document.querySelectorAll('.chargen-dropdown-options.open').forEach(el => {
        if (el !== optionsContainer) el.classList.remove('open');
      });
      optionsContainer.classList.toggle('open');
      if (optionsContainer.classList.contains('open')) {
        requestAnimationFrame(() => optionsContainer.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
      }
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);

    return {
      element: wrapper,
      getValue: () => currentValue,
      setValue: (v) => {
        currentValue = v;
        const match = options.find(o => o.value === v);
        if (match) {
          trigger.textContent = match.label;
          optionsContainer.querySelectorAll('.chargen-option').forEach(b => b.classList.remove('selected'));
          const btns = optionsContainer.querySelectorAll('.chargen-option');
          btns.forEach(b => { if (b.textContent === match.label) b.classList.add('selected'); });
        }
      },
    };
  }

  // --- Creation UI flow ---

  /** @type {(() => void) | null} */
  let activeCloseDropdowns = null;

  /** @type {((char: GameCharacter) => void) | null} */
  let resolveCreation = null;

  function startCreation() {
    return new Promise(resolve => {
      resolveCreation = resolve;
      showOpeningScreen();
    });
  }

  function showOpeningScreen() {
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
      passageEl.innerHTML = '<p>A life.</p><p>Not the one you would have picked, maybe. But the one that\u2019s here.</p>';
      passageEl.classList.add('visible');

      setTimeout(() => {
        const btn = document.createElement('button');
        btn.className = 'action';
        btn.textContent = 'Begin.';
        btn.addEventListener('click', () => {
          const char = generateRandom();
          showCharacterScreen(char);
        });
        actionsEl.appendChild(btn);
        actionsEl.classList.add('visible');
      }, 400);
    }, 150);
  }

  // --- Character screen (merged, always expanded) ---

  /** @param {GameCharacter} char */
  function showCharacterScreen(char) {
    const passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    const movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));
    const eventTextEl = /** @type {HTMLElement} */ (document.getElementById('event-text'));

    const usedNames = new Set([
      char.first_name,
      char.friend1.name, char.friend2.name,
      char.coworker1.name, char.coworker2.name,
      char.supervisor.name,
    ]);

    passageEl.classList.remove('visible');
    actionsEl.innerHTML = '';
    actionsEl.classList.remove('visible');
    movementEl.innerHTML = '';
    movementEl.classList.remove('visible');
    eventTextEl.innerHTML = '';
    eventTextEl.classList.remove('visible');

    // Close dropdowns when clicking outside
    if (activeCloseDropdowns) {
      document.removeEventListener('click', activeCloseDropdowns);
    }
    activeCloseDropdowns = () => {
      document.querySelectorAll('.chargen-dropdown-options.open').forEach(el => el.classList.remove('open'));
    };
    document.addEventListener('click', activeCloseDropdowns);

    setTimeout(() => {
      passageEl.innerHTML = '';

      // --- Job ---
      const jobDropdown = createDropdown(
        Object.entries(jobLabels).map(([value, label]) => ({ label, value })),
        char.job_type,
        (v) => { char.job_type = v; }
      );

      const jobP = document.createElement('p');
      jobP.append('Work is a fact. ', jobDropdown.element, '.');
      passageEl.appendChild(jobP);

      // --- Age ---
      const ageInput = document.createElement('input');
      ageInput.type = 'text';
      ageInput.inputMode = 'numeric';
      ageInput.className = 'age-input';
      ageInput.value = String(char.age_stage);
      ageInput.maxLength = 2;

      const ageP = document.createElement('p');
      ageP.append('You\u2019re ');
      ageP.appendChild(ageInput);
      ageP.append('.');
      passageEl.appendChild(ageP);

      // --- Location ---
      const closestLocation = locationOptions.reduce((best, opt) =>
        Math.abs(opt.latitude - char.latitude) < Math.abs(best.latitude - char.latitude) ? opt : best
      );

      const locationDropdown = createDropdown(
        locationOptions.map(o => ({ label: o.label, value: o.value })),
        closestLocation.value,
        (v) => {
          const loc = locationOptions.find(o => o.value === v);
          char.latitude = loc.latitude;
          rebuildSeasonDropdown();
        }
      );

      const locationP = document.createElement('p');
      locationP.append('You live \u2014 ', locationDropdown.element);
      passageEl.appendChild(locationP);

      // --- Season ---
      const seasonP = document.createElement('p');
      passageEl.appendChild(seasonP);

      function rebuildSeasonDropdown() {
        const isTropical = Math.abs(char.latitude) < 23.5;
        const labels = isTropical ? tropicalSeasonLabels : seasonLabels;
        const currentSeason = deriveSeasonFromTimestamp(char.start_timestamp, char.latitude);
        // If current season isn't valid for the new climate, pick the first option
        const validSeason = labels[currentSeason] ? currentSeason : Object.keys(labels)[0];
        if (validSeason !== currentSeason) {
          char.start_timestamp = timestampForSeason(validSeason, char.latitude);
        }

        const dropdown = createDropdown(
          Object.entries(labels).map(([value, label]) => ({ label, value })),
          validSeason,
          (v) => {
            char.start_timestamp = timestampForSeason(v, char.latitude);
          }
        );

        seasonP.textContent = '';
        seasonP.append('Outside \u2014 ', dropdown.element);
      }

      rebuildSeasonDropdown();

      // --- Sleepwear ---
      const currentSleepwearIndex = sleepwearOptions.indexOf(char.sleepwear);
      const sleepwearDropdownOptions = sleepwearOptions.map((sw, i) => ({
        label: sw,
        value: String(i),
      }));

      const sleepwearDropdown = createDropdown(
        sleepwearDropdownOptions,
        String(currentSleepwearIndex === -1 ? 0 : currentSleepwearIndex),
        (v) => { char.sleepwear = sleepwearOptions[parseInt(v, 10)]; }
      );

      const sleepwearP = document.createElement('p');
      sleepwearP.append('You\u2019re still in ', sleepwearDropdown.element, '.');
      passageEl.appendChild(sleepwearP);

      // --- Wardrobe ---
      const currentOutfitIndex = outfitSets.findIndex(o => o.outfit_default === char.outfit_default);
      const wardrobeOptions = outfitSets.map((outfit, i) => ({
        label: outfit.outfit_default.split('.')[0] + '.',
        value: String(i),
      }));

      const wardrobeDropdown = createDropdown(
        wardrobeOptions,
        String(currentOutfitIndex === -1 ? 0 : currentOutfitIndex),
        (v) => {
          const outfit = outfitSets[parseInt(v, 10)];
          char.outfit_default = outfit.outfit_default;
          char.outfit_low_mood = outfit.outfit_low_mood;
          char.outfit_messy = outfit.outfit_messy;
        }
      );

      const wardrobeP = document.createElement('p');
      wardrobeP.append('Getting dressed. ', wardrobeDropdown.element);
      passageEl.appendChild(wardrobeP);

      // --- Friends ---
      const friendP = document.createElement('p');
      friendP.textContent = 'Two people who still text you. Not every day. But enough.';
      passageEl.appendChild(friendP);

      const friendGroup = document.createElement('div');
      friendGroup.className = 'chargen-group';
      const friend1Input = createNameInput(char.friend1.name, usedNames);
      const friend2Input = createNameInput(char.friend2.name, usedNames);
      friendGroup.appendChild(friend1Input);
      friendGroup.appendChild(friend2Input);
      passageEl.appendChild(friendGroup);

      // --- Coworkers ---
      const workP = document.createElement('p');
      workP.textContent = 'The people at work. You didn\'t choose them. They didn\'t choose you.';
      passageEl.appendChild(workP);

      const workGroup = document.createElement('div');
      workGroup.className = 'chargen-group';
      const co1Input = createNameInput(char.coworker1.name, usedNames);
      const co2Input = createNameInput(char.coworker2.name, usedNames);
      const supInput = createNameInput(char.supervisor.name, usedNames);
      workGroup.appendChild(co1Input);
      workGroup.appendChild(co2Input);
      workGroup.appendChild(supInput);
      passageEl.appendChild(workGroup);

      // --- Player name ---
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

      passageEl.classList.add('visible');

      // --- Action buttons ---
      setTimeout(() => {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'action';
        confirmBtn.textContent = 'This is you.';
        confirmBtn.addEventListener('click', () => {
          // Read final values from controls
          const ageVal = parseInt(ageInput.value, 10);
          char.age_stage = (ageVal >= 18 && ageVal <= 65) ? ageVal : char.age_stage;
          char.friend1 = { ...char.friend1, name: /** @type {HTMLInputElement} */ (friend1Input.querySelector('input')).value.trim() || char.friend1.name };
          char.friend2 = { ...char.friend2, name: /** @type {HTMLInputElement} */ (friend2Input.querySelector('input')).value.trim() || char.friend2.name };
          char.coworker1 = { ...char.coworker1, name: /** @type {HTMLInputElement} */ (co1Input.querySelector('input')).value.trim() || char.coworker1.name };
          char.coworker2 = { ...char.coworker2, name: /** @type {HTMLInputElement} */ (co2Input.querySelector('input')).value.trim() || char.coworker2.name };
          char.supervisor = { name: /** @type {HTMLInputElement} */ (supInput.querySelector('input')).value.trim() || char.supervisor.name };
          char.first_name = (first.textContent || '').trim() || char.first_name;
          char.last_name = (last.textContent || '').trim() || char.last_name;
          // job_type, outfit, start_timestamp already updated via dropdown callbacks

          if (activeCloseDropdowns) {
            document.removeEventListener('click', activeCloseDropdowns);
            activeCloseDropdowns = null;
          }
          finishCreation(char);
        });
        actionsEl.appendChild(confirmBtn);

        const rerollBtn = document.createElement('button');
        rerollBtn.className = 'action';
        rerollBtn.textContent = 'A different life';
        rerollBtn.addEventListener('click', () => {
          if (activeCloseDropdowns) {
            document.removeEventListener('click', activeCloseDropdowns);
            activeCloseDropdowns = null;
          }
          const newChar = generateRandom();
          showCharacterScreen(newChar);
        });
        actionsEl.appendChild(rerollBtn);

        const startOverBtn = document.createElement('button');
        startOverBtn.className = 'action';
        startOverBtn.textContent = 'Start over';
        startOverBtn.addEventListener('click', () => {
          if (activeCloseDropdowns) {
            document.removeEventListener('click', activeCloseDropdowns);
            activeCloseDropdowns = null;
          }
          showOpeningScreen();
        });
        actionsEl.appendChild(startOverBtn);

        actionsEl.classList.add('visible');
      }, 400);
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
