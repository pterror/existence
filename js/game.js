// game.js — initialization, game loop, orchestration

const Game = (() => {

  function init() {
    // Try to restore existing game
    const saved = Timeline.restore();

    if (saved) {
      // Replay all actions to reconstruct state
      State.init();
      // Consume same initial RNG as fresh start (opening events)
      const initEvents = World.checkEvents();
      for (const eventId of initEvents) {
        const eventFn = Content.eventText[eventId];
        if (eventFn) eventFn();
      }
      replayActions(saved.actions);
    } else {
      // Fresh start
      Timeline.init();
      State.init();
    }

    // Initialize UI
    UI.init({
      onAction: handleAction,
      onMove: handleMove,
      onIdle: handleIdle,
    });

    // First render
    if (!saved) {
      // Opening — check for initial events (consumes RNG)
      const events = World.checkEvents();
      // Generate event text synchronously to consume RNG in order
      const eventTexts = [];
      for (const eventId of events) {
        const eventFn = Content.eventText[eventId];
        if (eventFn) {
          const text = eventFn();
          if (text && text.trim()) eventTexts.push(text);
        }
      }

      UI.render();

      if (eventTexts.length > 0) {
        const firstText = eventTexts[0];
        setTimeout(() => UI.showEventText(firstText), 1200);
      }
    } else {
      UI.render();
    }
  }

  function replayActions(actions) {
    for (const entry of actions) {
      const action = entry.action;
      if (action.type === 'interact') {
        replayInteraction(action.id);
        // Consume the same RNG calls as live play:
        // checkEvents + event text functions
        consumeEvents();
      } else if (action.type === 'move') {
        replayMove(action.destination);
        consumeEvents();
      } else if (action.type === 'idle') {
        // Idle handles its own RNG consumption entirely
        replayIdle();
      }
    }
  }

  function consumeEvents() {
    const events = World.checkEvents();
    for (const eventId of events) {
      const eventFn = Content.eventText[eventId];
      if (eventFn) eventFn();
    }
  }

  function replayInteraction(id) {
    // During replay, always execute — don't check availability.
    // The action was available when originally taken; re-checking
    // could cause divergence.
    const interaction = findInteraction(id);
    if (interaction) {
      interaction.execute();
    }
  }

  function replayIdle() {
    // Consume the same RNG as live idle
    Content.idleThoughts();
    State.advanceTime(Timeline.randomInt(2, 5));
    if (Timeline.chance(0.3)) {
      consumeEvents();
    }
  }

  function replayMove(destId) {
    // During replay, always execute the move
    const fromId = World.getLocationId();
    World.travelTo(destId);
    // Consume same RNG as live play (transitionText may use RNG in future)
    Content.transitionText(fromId, destId);
  }

  function findInteraction(id) {
    for (const interaction of Object.values(Content.interactions)) {
      if (interaction.id === id) return interaction;
    }
    // Check call in sick
    const callIn = Content.getInteraction('call_in');
    if (callIn && callIn.id === id) return callIn;
    return null;
  }

  // --- Action handling ---

  function handleAction(interaction) {
    // Record the action
    Timeline.recordAction({ type: 'interact', id: interaction.id });

    // Execute and get prose response
    const responseText = interaction.execute();

    // Check for events after action
    const events = World.checkEvents();

    // Show the response
    UI.showPassage(responseText);

    // Generate event text now (consuming RNG synchronously), display later
    const eventTexts = [];
    for (const eventId of events) {
      const eventFn = Content.eventText[eventId];
      if (eventFn) {
        const text = eventFn();
        if (text && text.trim()) eventTexts.push(text);
      }
    }

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

  function handleMove(destId) {
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
    const eventTexts = [];
    for (const eventId of events) {
      const eventFn = Content.eventText[eventId];
      if (eventFn) {
        const text = eventFn();
        if (text && text.trim()) eventTexts.push(text);
      }
    }

    if (transText && transText.trim()) {
      // Show transition, then location
      UI.showPassage(transText);

      setTimeout(() => {
        UI.render();

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
    // Record idle as an action so RNG consumption is replayable
    Timeline.recordAction({ type: 'idle' });

    // Surface an idle thought
    const thought = Content.idleThoughts();
    if (thought) {
      UI.appendEventText(thought);
    }

    // Small time passage from idling
    State.advanceTime(Timeline.randomInt(2, 5));

    // Occasionally check for events during idle
    if (Timeline.chance(0.3)) {
      const events = World.checkEvents();
      const eventTexts = [];
      for (const eventId of events) {
        const eventFn = Content.eventText[eventId];
        if (eventFn) {
          const text = eventFn();
          if (text && text.trim()) eventTexts.push(text);
        }
      }
      let delay = 2000;
      for (const text of eventTexts) {
        const t = text;
        setTimeout(() => UI.appendEventText(t), delay);
        delay += 1200;
      }
    }
  }

  // --- Start ---

  document.addEventListener('DOMContentLoaded', init);

  return { init };
})();
