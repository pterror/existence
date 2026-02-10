// ui.js — rendering, text display, interaction handling

const UI = (() => {
  let passageEl, eventTextEl, actionsEl, movementEl;
  let onAction = null; // callback set by game.js
  let onMove = null;
  let idleTimer = null;
  let idleCallback = null;

  const IDLE_DELAY = 25000; // 25 seconds before idle thoughts

  function init(callbacks) {
    passageEl = document.getElementById('passage');
    eventTextEl = document.getElementById('event-text');
    actionsEl = document.getElementById('actions');
    movementEl = document.getElementById('movement');
    onAction = callbacks.onAction;
    onMove = callbacks.onMove;
    idleCallback = callbacks.onIdle;
  }

  // --- Text rendering ---

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

  function textToHTML(text) {
    // Split into paragraphs on double newlines, wrap in <p>
    // Single string = single paragraph
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    if (paragraphs.length <= 1) {
      return `<p>${text}</p>`;
    }
    return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
  }

  // --- Actions ---

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

  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (idleCallback) idleCallback();
      // Set up recurring idle with longer interval
      idleTimer = setInterval(() => {
        if (idleCallback) idleCallback();
      }, 40000);
    }, IDLE_DELAY);
  }

  function stopIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      clearInterval(idleTimer);
      idleTimer = null;
    }
  }

  // --- Full render ---

  function render() {
    const location = World.getLocationId();
    const descFn = Content.locationDescriptions[location];
    const description = descFn ? descFn() : '';

    showPassage(description);

    const interactions = Content.getAvailableInteractions();
    showActions(interactions);

    const connections = World.getConnections();
    showMovement(connections);
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
  };
})();
