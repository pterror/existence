// ui.js — rendering, text display, interaction handling

export function createUI(ctx) {
  const State = ctx.state;
  const Content = ctx.content;
  const World = ctx.world;
  const Habits = ctx.habits;
  /** @type {HTMLElement} */ let passageEl;
  /** @type {HTMLElement} */ let eventTextEl;
  /** @type {HTMLElement} */ let actionsEl;
  /** @type {HTMLElement} */ let movementEl;
  /** @type {HTMLElement} */ let awarenessEl;
  /** @type {HTMLElement} */ let awarenessTimeEl;
  /** @type {HTMLElement} */ let awarenessMoneyEl;
  /** @type {((interaction: Interaction) => void) | null} */
  let onAction = null;
  /** @type {((destId: string) => void) | null} */
  let onMove = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let idleTimer = null;
  /** @type {(() => void) | null} */
  let idleCallback = null;
  let idleCount = 0;

  // Focus state — UI-only, not saved or replayed
  let timeFocus = 0.5;
  let moneyFocus = 0.5;

  const IDLE_DELAY = 25000; // 25 seconds before idle thoughts

  // Color interpolation between unfocused and focused
  const FOCUSED_COLOR = { r: 0xc8, g: 0xc0, b: 0xb8 };
  const UNFOCUSED_COLOR = { r: 0x50, g: 0x48, b: 0x40 };

  /** @param {number} t */
  function lerpColor(t) {
    const r = Math.round(UNFOCUSED_COLOR.r + (FOCUSED_COLOR.r - UNFOCUSED_COLOR.r) * t);
    const g = Math.round(UNFOCUSED_COLOR.g + (FOCUSED_COLOR.g - UNFOCUSED_COLOR.g) * t);
    const b = Math.round(UNFOCUSED_COLOR.b + (FOCUSED_COLOR.b - UNFOCUSED_COLOR.b) * t);
    return `rgb(${r},${g},${b})`;
  }

  /** @param {UICallbacks} callbacks */
  function init(callbacks) {
    if (passageEl) return;
    passageEl = /** @type {HTMLElement} */ (document.getElementById('passage'));
    eventTextEl = /** @type {HTMLElement} */ (document.getElementById('event-text'));
    actionsEl = /** @type {HTMLElement} */ (document.getElementById('actions'));
    movementEl = /** @type {HTMLElement} */ (document.getElementById('movement'));
    awarenessEl = /** @type {HTMLElement} */ (document.getElementById('awareness'));
    awarenessTimeEl = /** @type {HTMLElement} */ (document.getElementById('awareness-time'));
    awarenessMoneyEl = /** @type {HTMLElement} */ (document.getElementById('awareness-money'));
    onAction = callbacks.onAction;
    onMove = callbacks.onMove;
    idleCallback = callbacks.onIdle;

    awarenessTimeEl.addEventListener('click', () => {
      if (callbacks.onFocusTime) callbacks.onFocusTime();
    });
    awarenessMoneyEl.addEventListener('click', () => {
      if (callbacks.onFocusMoney) callbacks.onFocusMoney();
    });

    // Pause idle timer when tab is hidden.
    // Don't restart on return — let the player's next action restart it.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopIdleTimer();
      }
    });
  }

  // --- Text rendering ---

  /** @param {string} text */
  function showPassage(text) {
    // Fade out, swap, fade in
    passageEl.classList.remove('visible');

    setTimeout(() => {
      passageEl.innerHTML = textToHTML(text);
      passageEl.classList.add('visible');
    }, 150);

    // Clear event text
    clearEventText();

    // Reset idle timer
    resetIdleTimer();
  }

  /** @param {string} text */
  function showEventText(text) {
    if (!text || text.trim() === '') return;

    eventTextEl.classList.remove('visible');

    setTimeout(() => {
      eventTextEl.innerHTML = textToHTML(text);
      eventTextEl.classList.add('visible');
    }, 200);
  }

  function clearEventText() {
    eventTextEl.classList.remove('visible');
    setTimeout(() => {
      eventTextEl.innerHTML = '';
    }, 500);
  }

  /** @param {string} text */
  function appendEventText(text) {
    if (!text || text.trim() === '') return;

    const p = document.createElement('p');
    p.innerHTML = text;
    p.style.opacity = '0';
    p.style.transition = 'opacity 0.5s ease';
    eventTextEl.appendChild(p);
    eventTextEl.classList.add('visible');

    // Trigger fade in
    requestAnimationFrame(() => {
      p.style.opacity = '1';
    });
  }

  /** @param {string} text */
  function textToHTML(text) {
    // Split into paragraphs on double newlines, wrap in <p>
    // Single string = single paragraph
    const paragraphs = text.split(/\n\n+/).filter(/** @param {string} p */ p => p.trim());
    if (paragraphs.length <= 1) {
      return `<p>${text}</p>`;
    }
    return paragraphs.map(/** @param {string} p */ p => `<p>${p.trim()}</p>`).join('');
  }

  // --- Habit strength → color ---
  // Continuous brightness based on prediction strength. No threshold snap.
  // Strength 0.6 (minimum) = barely above base, 1.0 = approaching body text.

  // Action: base #8a8078 (138,128,120) → bright #c8c0b8 (200,192,184)
  const ACTION_BASE = { r: 0x8a, g: 0x80, b: 0x78 };
  const ACTION_BRIGHT = { r: 0xc8, g: 0xc0, b: 0xb8 };
  // Movement: base #605850 (96,88,80) → bright #a09890 (160,152,144)
  const MOVE_BASE = { r: 0x60, g: 0x58, b: 0x50 };
  const MOVE_BRIGHT = { r: 0xa0, g: 0x98, b: 0x90 };

  /**
   * Interpolate color from base to bright based on habit strength.
   * @param {number} strength — prediction probability (0.6–1.0 range)
   * @param {{ r: number, g: number, b: number }} base
   * @param {{ r: number, g: number, b: number }} bright
   * @returns {string}
   */
  function habitColor(strength, base, bright) {
    const t = Math.min(1, Math.max(0, (strength - 0.6) / 0.4));
    const r = Math.round(base.r + (bright.r - base.r) * t);
    const g = Math.round(base.g + (bright.g - base.g) * t);
    const b = Math.round(base.b + (bright.b - base.b) * t);
    return `rgb(${r},${g},${b})`;
  }

  // --- Actions ---

  /** @param {Interaction[]} interactions @param {{ actionId: string, strength: number, tier: string } | null} [prediction] */
  function showActions(interactions, prediction) {
    actionsEl.innerHTML = '';
    actionsEl.classList.remove('visible');

    if (interactions.length === 0) {
      actionsEl.classList.add('visible');
      return;
    }

    for (const interaction of interactions) {
      const btn = document.createElement('button');
      btn.className = 'action';
      if (prediction && prediction.actionId === interaction.id) {
        btn.style.color = habitColor(prediction.strength, ACTION_BASE, ACTION_BRIGHT);
      }
      btn.textContent = interaction.label;
      btn.addEventListener('click', () => {
        if (onAction) onAction(interaction);
      });
      actionsEl.appendChild(btn);
    }

    // Slight delay before showing
    setTimeout(() => {
      actionsEl.classList.add('visible');
    }, 400);
  }

  // --- Movement ---

  /** @param {ConnectionInfo[]} connections @param {{ actionId: string, strength: number, tier: string } | null} [prediction] */
  function showMovement(connections, prediction) {
    movementEl.innerHTML = '';
    movementEl.classList.remove('visible');

    if (connections.length === 0) {
      return;
    }

    for (const conn of connections) {
      const btn = document.createElement('button');
      btn.className = 'movement-link';
      if (prediction && prediction.actionId === 'move:' + conn.id) {
        btn.style.color = habitColor(prediction.strength, MOVE_BASE, MOVE_BRIGHT);
      }
      btn.textContent = conn.name;
      btn.addEventListener('click', () => {
        if (onMove) onMove(conn.id);
      });
      movementEl.appendChild(btn);
    }

    setTimeout(() => {
      movementEl.classList.add('visible');
    }, 600);
  }

  // --- Idle behavior ---

  function scheduleNextIdle() {
    // Escalating silence: one comes, then another, then quiet
    // 0: 30s, 1: 60s, 2+: done
    const delays = [30000, 60000];
    if (idleCount >= delays.length) return; // gone quiet
    if (State.get('viewing_phone')) return; // actively engaged
    idleTimer = setTimeout(() => {
      if (idleCallback) idleCallback();
      idleCount++;
      scheduleNextIdle();
    }, delays[idleCount]);
  }

  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleCount = 0;
    scheduleNextIdle();
  }

  function stopIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  // --- Full render ---

  function render() {
    if (State.get('viewing_phone')) {
      showPassage(Content.phoneScreenDescription());
      showActions(Content.getAvailableInteractions());
      showMovement([]);
      return;
    }

    const location = World.getLocationId();
    const descFn = /** @type {Record<string, (() => string) | undefined>} */ (Content.locationDescriptions)[location];
    const description = descFn ? descFn() : '';

    showPassage(description);

    const interactions = Content.getAvailableInteractions();
    const connections = World.getConnections();
    const allIds = [
      ...interactions.map(i => i.id),
      ...connections.map(c => 'move:' + c.id),
    ];
    const prediction = Habits.predictHabit(allIds);
    showActions(interactions, prediction);
    showMovement(connections, prediction);
  }

  // --- Awareness display ---

  function updateAwareness() {
    // Decay focus each update
    timeFocus = Math.max(0.1, timeFocus - 0.08);
    moneyFocus = Math.max(0.1, moneyFocus - 0.08);

    // Read perceived strings from state
    awarenessTimeEl.textContent = State.perceivedTimeString();
    awarenessMoneyEl.textContent = State.perceivedMoneyString();

    // Apply focus-driven opacity and color
    awarenessTimeEl.style.opacity = String(timeFocus);
    awarenessTimeEl.style.color = lerpColor(timeFocus);
    awarenessMoneyEl.style.opacity = String(moneyFocus);
    awarenessMoneyEl.style.color = lerpColor(moneyFocus);
  }

  function boostTimeFocus() {
    timeFocus = 1.0;
  }

  function boostMoneyFocus() {
    moneyFocus = 1.0;
  }

  function showAwareness() {
    awarenessEl.classList.remove('hidden');
  }

  function hideAwareness() {
    awarenessEl.classList.add('hidden');
  }

  return {
    init,
    showPassage,
    showEventText,
    clearEventText,
    appendEventText,
    showActions,
    showMovement,
    resetIdleTimer,
    stopIdleTimer,
    render,
    updateAwareness,
    boostTimeFocus,
    boostMoneyFocus,
    showAwareness,
    hideAwareness,
  };
}

