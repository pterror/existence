// game.js — initialization, game loop, orchestration

const Game = (() => {

  let isReplaying = false;

  /** @param {string[]} events @param {string[]} eventTexts */
  function generateEventTexts(events, eventTexts) {
    for (const eventId of events) {
      const eventFn = /** @type {Record<string, (() => string) | undefined>} */ (Content.eventText)[eventId];
      if (eventFn) {
        const text = eventFn();
        if (text && text.trim()) eventTexts.push(text);
      }
    }
  }

  async function init() {
    // Open IndexedDB
    await Runs.open();

    const activeRunId = await Runs.getActiveRunId();

    if (activeRunId) {
      const runData = await Runs.loadRun(activeRunId);
      if (runData) {
        await resumeRun(runData);
        return;
      }
    }

    // No active run — check for past runs
    const runs = await Runs.listRuns();
    if (runs.length > 0) {
      showThreshold(runs);
    } else {
      startFresh();
    }
  }

  /** @param {RunRecord} runData */
  async function resumeRun(runData) {
    const saved = Timeline.restoreFrom(runData);
    Timeline.setActiveRunId(runData.id);

    // Restore character from save
    if (saved.character) {
      Character.set(saved.character);
    }

    // Replay all actions to reconstruct state
    State.init();
    Character.applyToState();

    // Consume same initial RNG as fresh start (opening events)
    const initEvents = World.checkEvents();
    for (const eventId of initEvents) {
      const eventFn = /** @type {Record<string, (() => string) | undefined>} */ (Content.eventText)[eventId];
      if (eventFn) eventFn();
    }
    const { lastIdleThought } = replayActions(saved.actions);

    // Initialize UI
    UI.init({
      onAction: handleAction,
      onMove: handleMove,
      onIdle: handleIdle,
      onFocusTime: handleFocusTime,
      onFocusMoney: handleFocusMoney,
      onStepAway: handleStepAway,
    });

    UI.render();
    UI.showAwareness();
    UI.updateAwareness();
    showStepAway();

    // Restore last idle thought so it doesn't vanish on refresh
    if (lastIdleThought) {
      setTimeout(() => UI.appendEventText(lastIdleThought), 500);
    }
  }

  function startFresh() {
    Timeline.init();

    // Initialize UI early (chargen uses the same DOM)
    UI.init({
      onAction: handleAction,
      onMove: handleMove,
      onIdle: handleIdle,
      onFocusTime: handleFocusTime,
      onFocusMoney: handleFocusMoney,
      onStepAway: handleStepAway,
    });

    // Pause idle timer during chargen, hide awareness
    UI.stopIdleTimer();
    UI.hideAwareness();
    hideStepAway();

    Chargen.startCreation().then(character => {
      // Character is set and saved by chargen.
      // Now start the game.
      State.init();
      Character.applyToState();

      // Opening — check for initial events (consumes RNG)
      const events = World.checkEvents();
      /** @type {string[]} */
      const eventTexts = [];
      generateEventTexts(events, eventTexts);

      UI.render();
      UI.showAwareness();
      UI.updateAwareness();
      showStepAway();

      if (eventTexts.length > 0) {
        const firstText = /** @type {string} */ (eventTexts[0]);
        setTimeout(() => UI.showEventText(firstText), 1200);
      }
    });
  }

  // --- Threshold screen (run management) ---

  /** @param {RunSummary[]} runs */
  function showThreshold(runs) {
    // Initialize UI if not already done
    UI.init({
      onAction: handleAction,
      onMove: handleMove,
      onIdle: handleIdle,
      onFocusTime: handleFocusTime,
      onFocusMoney: handleFocusMoney,
      onStepAway: handleStepAway,
    });

    UI.stopIdleTimer();
    UI.hideAwareness();
    hideStepAway();

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
      passageEl.innerHTML = '<p>Lives you\'ve lived. Or are living. Or will.</p>';
      passageEl.classList.add('visible');

      setTimeout(() => {
        // Active runs first, then finished
        const active = runs.filter(r => r.status === 'active');
        const finished = runs.filter(r => r.status === 'finished');

        for (const run of active) {
          const btn = document.createElement('button');
          btn.className = 'action';
          btn.textContent = thresholdLabel(run);
          btn.addEventListener('click', () => pickRun(run.id));
          actionsEl.appendChild(btn);
        }

        for (const run of finished) {
          const btn = document.createElement('button');
          btn.className = 'action threshold-finished';
          btn.textContent = thresholdLabel(run);
          btn.addEventListener('click', () => replayFinishedRun(run.id));
          actionsEl.appendChild(btn);
        }

        // New life option
        const newBtn = document.createElement('button');
        newBtn.className = 'action';
        newBtn.textContent = 'Another life.';
        newBtn.addEventListener('click', () => startFresh());
        actionsEl.appendChild(newBtn);

        actionsEl.classList.add('visible');
      }, 400);
    }, 150);
  }

  /** @param {RunSummary} run */
  function thresholdLabel(run) {
    const name = run.characterName || 'Someone';
    const age = run.ageStage || '';
    if (run.status === 'active') {
      return `${name}, ${age}. Still going.`;
    }
    return `${name}, ${age}. That one's over.`;
  }

  /** @param {string} id */
  async function pickRun(id) {
    const runData = await Runs.loadRun(id);
    if (!runData) return;
    await Runs.setActiveRunId(id);
    await resumeRun(runData);
  }

  /** @param {string} id */
  async function replayFinishedRun(id) {
    const runData = await Runs.loadRun(id);
    if (!runData) return;

    // Initialize UI for replay
    UI.init({
      onAction: handleAction,
      onMove: handleMove,
      onIdle: handleIdle,
      onFocusTime: handleFocusTime,
      onFocusMoney: handleFocusMoney,
      onStepAway: handleStepAway,
    });

    isReplaying = true;
    UI.stopIdleTimer();
    UI.hideAwareness();
    hideStepAway();

    // Restore seed/character/PRNG
    const saved = Timeline.restoreFrom(runData);
    if (saved.character) {
      Character.set(saved.character);
    }

    State.init();
    Character.applyToState();

    // Consume initial events (same as live play)
    const initEvents = World.checkEvents();
    /** @type {string[]} */
    const initEventTexts = [];
    generateEventTexts(initEvents, initEventTexts);

    // Show opening description
    const location = World.getLocationId();
    const descFn = /** @type {Record<string, (() => string) | undefined>} */ (Content.locationDescriptions)[location];
    const description = descFn ? descFn() : '';

    const passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    const movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));

    passageEl.classList.remove('visible');
    actionsEl.innerHTML = '';
    actionsEl.classList.remove('visible');
    movementEl.innerHTML = '';
    movementEl.classList.remove('visible');

    setTimeout(() => {
      passageEl.innerHTML = textToHTML(description);
      passageEl.classList.add('visible');

      // Show initial event texts
      let delay = 1200;
      for (const text of initEventTexts) {
        const t = text;
        setTimeout(() => UI.appendEventText(t), delay);
        delay += 1200;
      }

      // Start stepping through actions
      replayVisual(saved.actions, 0, delay + 800);
    }, 150);
  }

  /**
   * Visual replay — steps through actions with delays, showing prose.
   * @param {ActionEntry[]} actions
   * @param {number} index
   * @param {number} startDelay
   */
  function replayVisual(actions, index, startDelay) {
    if (index >= actions.length) {
      // Replay done — show back link
      setTimeout(() => showReplayEnd(), startDelay);
      return;
    }

    setTimeout(() => {
      const entry = /** @type {ActionEntry} */ (actions[index]);
      const action = entry.action;

      let responseText = '';
      /** @type {string[]} */
      let eventTexts = [];

      if (action.type === 'interact' && action.id) {
        const interaction = findInteraction(action.id);
        if (interaction) {
          responseText = /** @type {string} */ (interaction.execute());
        }
        const events = World.checkEvents();
        generateEventTexts(events, eventTexts);
      } else if (action.type === 'move') {
        if (action.destination) {
          const fromId = World.getLocationId();
          World.travelTo(action.destination);
          responseText = Content.transitionText(fromId, action.destination);
          const events = World.checkEvents();
          generateEventTexts(events, eventTexts);
        }
      } else if (action.type === 'idle') {
        const thought = Content.idleThoughts();
        if (thought) responseText = thought;
        State.advanceTime(Timeline.randomInt(2, 5));
      } else if (action.type === 'observe_time') {
        State.observeTime();
        const source = Content.getTimeSource();
        if (source) responseText = source;
      } else if (action.type === 'observe_money') {
        State.observeMoney();
        const source = Content.getMoneySource();
        if (source) responseText = source;
      }

      // Show the text
      if (responseText && responseText.trim()) {
        UI.showPassage(responseText);
      }

      let eventDelay = 1200;
      for (const text of eventTexts) {
        const t = text;
        setTimeout(() => UI.appendEventText(t), eventDelay);
        eventDelay += 1000;
      }

      // Next action after text has settled
      replayVisual(actions, index + 1, eventDelay + 600);
    }, startDelay);
  }

  function showReplayEnd() {
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    actionsEl.innerHTML = '';

    const btn = document.createElement('button');
    btn.className = 'action';
    btn.textContent = 'Back.';
    btn.addEventListener('click', async () => {
      isReplaying = false;
      const runs = await Runs.listRuns();
      showThreshold(runs);
    });
    actionsEl.appendChild(btn);
    actionsEl.classList.add('visible');
  }

  /** @param {string} text @returns {string} */
  function textToHTML(text) {
    const paragraphs = text.split(/\n\n+/).filter(/** @param {string} p */ p => p.trim());
    if (paragraphs.length <= 1) {
      return `<p>${text}</p>`;
    }
    return paragraphs.map(/** @param {string} p */ p => `<p>${p.trim()}</p>`).join('');
  }

  // --- Step away ---

  function showStepAway() {
    const el = document.getElementById('step-away');
    if (el) {
      el.classList.remove('hidden');
      el.classList.add('arriving');
      el.textContent = 'step away';
      el.onclick = handleStepAway;
      el.addEventListener('animationend', () => el.classList.remove('arriving'), { once: true });
    }
  }

  function hideStepAway() {
    const el = document.getElementById('step-away');
    if (el) {
      el.classList.add('hidden');
      el.onclick = null;
    }
  }

  async function handleStepAway() {
    // Flush any pending save
    Runs.flush();
    await Runs.setActiveRunId(null);

    // Fade out and show threshold
    const passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    const actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    const movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));

    passageEl.classList.remove('visible');
    actionsEl.classList.remove('visible');
    movementEl.classList.remove('visible');

    UI.stopIdleTimer();
    UI.hideAwareness();
    hideStepAway();

    setTimeout(async () => {
      const runs = await Runs.listRuns();
      showThreshold(runs);
    }, 500);
  }

  // --- Replay (state reconstruction, no visual) ---

  /** @param {ActionEntry[]} actions @returns {{ lastIdleThought: string | undefined }} */
  function replayActions(actions) {
    let lastIdleThought;
    for (const entry of actions) {
      const action = entry.action;
      if (action.type === 'interact') {
        replayInteraction(action.id);
        // Consume the same RNG calls as live play:
        // checkEvents + event text functions
        consumeEvents();
        lastIdleThought = undefined; // player acted, clear stale idle
      } else if (action.type === 'move') {
        replayMove(action.destination);
        consumeEvents();
        lastIdleThought = undefined;
      } else if (action.type === 'idle') {
        lastIdleThought = replayIdle();
      } else if (action.type === 'observe_time') {
        State.observeTime();
      } else if (action.type === 'observe_money') {
        State.observeMoney();
      }
    }
    return { lastIdleThought };
  }

  function consumeEvents() {
    const events = World.checkEvents();
    for (const eventId of events) {
      const eventFn = /** @type {Record<string, (() => string) | undefined>} */ (Content.eventText)[eventId];
      if (eventFn) eventFn();
    }
  }

  /** @param {string | undefined} id */
  function replayInteraction(id) {
    if (!id) return;
    // During replay, always execute — don't check availability.
    const interaction = findInteraction(id);
    if (interaction) {
      interaction.execute();
    }
  }

  /** @returns {string | undefined} the idle thought text (for resume display) */
  function replayIdle() {
    // Consume the same RNG as live idle
    const thought = Content.idleThoughts();
    State.advanceTime(Timeline.randomInt(2, 5));
    return thought;
  }

  /** @param {string | undefined} destId */
  function replayMove(destId) {
    if (!destId) return;
    // During replay, always execute the move
    const fromId = World.getLocationId();
    World.travelTo(destId);
    // Consume same RNG as live play
    Content.transitionText(fromId, destId);
  }

  /** @param {string} id */
  function findInteraction(id) {
    for (const interaction of Object.values(Content.interactions)) {
      if (interaction.id === id) return interaction;
    }
    // Check call in sick
    const callIn = Content.getInteraction('call_in');
    if (callIn && callIn.id === id) return callIn;
    return null;
  }

  // --- Focus handlers (clicking awareness display) ---

  function handleFocusTime() {
    if (isReplaying) return;
    UI.boostTimeFocus();
    const source = Content.getTimeSource();
    if (source) {
      Timeline.recordAction({ type: 'observe_time' });
      State.observeTime();
      UI.appendEventText(source);
    }
    UI.updateAwareness();
  }

  function handleFocusMoney() {
    if (isReplaying) return;
    UI.boostMoneyFocus();
    const source = Content.getMoneySource();
    if (source) {
      Timeline.recordAction({ type: 'observe_money' });
      State.observeMoney();
      UI.appendEventText(source);
    }
    UI.updateAwareness();
  }

  // --- Focus triggers from events ---

  /** @param {string[]} events @param {Interaction | null} interaction */
  function applyFocusTriggers(events, interaction) {
    for (const eventId of events) {
      if (eventId === 'alarm' || eventId === 'late_anxiety') {
        UI.boostTimeFocus();
      }
      if (eventId === 'phone_bill_notification') {
        UI.boostMoneyFocus();
      }
    }
    // Purchase interactions boost money focus
    if (interaction) {
      const id = interaction.id;
      if (id === 'buy_groceries' || id === 'buy_cheap_meal') {
        UI.boostMoneyFocus();
      }
    }
  }

  /** @param {string} destId */
  function applyMoveFocusTriggers(destId) {
    if (destId === 'corner_store') {
      UI.boostMoneyFocus();
    }
    if (destId === 'apartment_kitchen') {
      UI.boostTimeFocus();
    }
  }

  // --- Action handling ---

  /** @param {Interaction} interaction */
  function handleAction(interaction) {
    if (isReplaying) return;

    // Record the action
    Timeline.recordAction({ type: 'interact', id: interaction.id });

    // Execute and get prose response
    const responseText = interaction.execute();

    // Check for events after action
    const events = World.checkEvents();

    // Show the response
    UI.showPassage(responseText);

    // Generate event text now (consuming RNG synchronously), display later
    /** @type {string[]} */
    const eventTexts = [];
    generateEventTexts(events, eventTexts);

    // Apply focus triggers
    applyFocusTriggers(events, interaction);
    UI.updateAwareness();

    if (eventTexts.length > 0) {
      let delay = 1500;
      for (const text of eventTexts) {
        const t = text;
        setTimeout(() => UI.appendEventText(t), delay);
        delay += 1200;
      }
    }

    // Re-render actions and movement after a beat
    setTimeout(() => {
      const interactions = Content.getAvailableInteractions();
      UI.showActions(interactions);

      const connections = World.getConnections();
      UI.showMovement(connections);
    }, 800);
  }

  /** @param {string} destId */
  function handleMove(destId) {
    if (isReplaying) return;
    if (!World.canTravel(destId)) return;

    // Record the action
    Timeline.recordAction({ type: 'move', destination: destId });

    const fromId = World.getLocationId();

    // Execute travel
    const travel = World.travelTo(destId);
    if (!travel) return;

    // Transition text
    const transText = Content.transitionText(travel.from, travel.to);

    // Check events at new location
    const events = World.checkEvents();

    // Generate event text now (consuming RNG synchronously), display later
    /** @type {string[]} */
    const eventTexts = [];
    generateEventTexts(events, eventTexts);

    // Apply focus triggers
    applyMoveFocusTriggers(travel.to);
    applyFocusTriggers(events, null);
    UI.updateAwareness();

    if (transText && transText.trim()) {
      // Show transition, then location
      UI.showPassage(transText);

      setTimeout(() => {
        UI.render();
        UI.updateAwareness();

        if (eventTexts.length > 0) {
          let delay = 1000;
          for (const text of eventTexts) {
            const t = text;
            setTimeout(() => UI.appendEventText(t), delay);
            delay += 1200;
          }
        }
      }, 1500);
    } else {
      // No transition text — go straight to location
      UI.render();
      UI.updateAwareness();

      if (eventTexts.length > 0) {
        let delay = 800;
        for (const text of eventTexts) {
          const t = text;
          setTimeout(() => UI.appendEventText(t), delay);
          delay += 1200;
        }
      }
    }
  }

  function handleIdle() {
    if (isReplaying) return;

    // Record idle as an action so RNG consumption is replayable
    Timeline.recordAction({ type: 'idle' });

    // Surface an idle thought — pure atmosphere, no events or state changes
    const thought = Content.idleThoughts();
    if (thought) {
      UI.appendEventText(thought);
    }

    // Small time passage from idling
    State.advanceTime(Timeline.randomInt(2, 5));

    UI.updateAwareness();
  }

  // --- Start ---

  document.addEventListener('DOMContentLoaded', init);

  return { init };
})();
