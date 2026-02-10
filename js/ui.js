// ui.js — rendering, text display, interaction handling

const UI = (() => {
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

    // Pause idle timer when tab is hidden — prevents queued timeouts
    // from dumping a wall of idle text when the player returns
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopIdleTimer();
      } else if (idleCallback) {
        scheduleNextIdle();
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

  // --- Actions ---

  /** @param {Interaction[]} interactions */
  function showActions(interactions) {
    actionsEl.innerHTML = '';
    actionsEl.classList.remove('visible');

    if (interactions.length === 0) {
      actionsEl.classList.add('visible');
      return;
    }

    for (const interaction of interactions) {
      const btn = document.createElement('button');
      btn.className = 'action';
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

  /** @param {ConnectionInfo[]} connections */
  function showMovement(connections) {
    movementEl.innerHTML = '';
    movementEl.classList.remove('visible');

    if (connections.length === 0) {
      return;
    }

    for (const conn of connections) {
      const btn = document.createElement('button');
      btn.className = 'movement-link';
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
    // Escalating silence: first few come relatively quickly, then stretch out, then stop
    // 0: 25s, 1: 40s, 2: 60s, 3: 90s, 4+: done
    const delays = [IDLE_DELAY, 40000, 60000, 90000];
    if (idleCount >= delays.length) return; // gone quiet
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
    const location = World.getLocationId();
    const descFn = /** @type {Record<string, (() => string) | undefined>} */ (Content.locationDescriptions)[location];
    const description = descFn ? descFn() : '';

    showPassage(description);

    const interactions = Content.getAvailableInteractions();
    showActions(interactions);

    const connections = World.getConnections();
    showMovement(connections);
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
})();
