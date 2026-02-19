// ui.js — rendering, text display, interaction handling

export function createUI(ctx) {
  const State = ctx.state;
  const Content = ctx.content;
  const World = ctx.world;
  const Habits = ctx.habits;
  const Character = ctx.character;
  /** @type {HTMLElement} */ let passageEl;
  /** @type {HTMLElement} */ let eventTextEl;
  /** @type {HTMLElement} */ let actionsEl;
  /** @type {HTMLElement} */ let movementEl;
  /** @type {HTMLElement} */ let awarenessEl;
  /** @type {HTMLElement} */ let awarenessTimeEl;
  /** @type {HTMLElement} */ let awarenessMoneyEl;
  /** @type {HTMLElement | null} */ let phoneEl = null;
  /** @type {((interaction: Interaction) => void) | null} */
  let onAction = null;
  /** @type {((destId: string) => void) | null} */
  let onMove = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let idleTimer = null;
  /** @type {(() => void) | null} */
  let idleCallback = null;
  let idleCount = 0;
  let lastActivityTime = Date.now();
  let afkDetectionEnabled = true;
  /** @type {HTMLElement | null} */
  let afkIndicatorEl = null;

  // Focus state — UI-only, not saved or replayed
  let timeFocus = 0.5;
  let moneyFocus = 0.5;

  // How long without any user input before idle thoughts stop firing
  const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

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
    phoneEl = /** @type {HTMLElement} */ (document.getElementById('phone'));
    phoneEl.addEventListener('click', phoneClickHandler);
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

    // Track real user presence — any input resets the activity clock.
    // Don't touch the indicator here; it clears when a game action is taken.
    const markActive = () => { lastActivityTime = Date.now(); };
    document.addEventListener('mousemove', markActive, { passive: true });
    document.addEventListener('keydown', markActive, { passive: true });
    document.addEventListener('click', markActive, { passive: true });

    afkIndicatorEl = /** @type {HTMLElement} */ (document.getElementById('afk-indicator'));
    afkIndicatorEl.addEventListener('click', () => {
      afkDetectionEnabled = !afkDetectionEnabled;
      if (!afkDetectionEnabled) {
        // Detection off — show indicator in off state, restart chain so thoughts continue
        afkIndicatorEl.classList.remove('hidden');
        afkIndicatorEl.classList.add('detection-off');
        resetIdleTimer();
      } else {
        // Detection on — remove off styling and hide (player just clicked = present)
        afkIndicatorEl.classList.remove('detection-off');
        afkIndicatorEl.classList.add('hidden');
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

  /**
   * @param {string} text
   * @param {string} tier — 'uneasy' | 'prominent' | 'tremor'
   */
  function appendInnerVoice(text, tier) {
    if (!text || text.trim() === '') return;
    const p = document.createElement('p');
    p.innerHTML = text;
    p.className = `inner-voice inner-voice--${tier}`;
    p.style.opacity = '0';
    p.style.transition = 'opacity 0.5s ease';
    eventTextEl.appendChild(p);
    eventTextEl.classList.add('visible');
    requestAnimationFrame(() => { p.style.opacity = '1'; });
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
    if (State.get('viewing_phone')) return;
    // Escalating delays: quick at first, then space out. Plateau at 20 min.
    const delays = [30000, 60000, 120000, 300000, 1200000];
    const delay = delays[Math.min(idleCount, delays.length - 1)];
    idleTimer = setTimeout(() => {
      // If the player has been truly absent, drop silently without rescheduling.
      if (afkDetectionEnabled && Date.now() - lastActivityTime > ACTIVITY_TIMEOUT) {
        if (afkIndicatorEl) afkIndicatorEl.classList.remove('hidden');
        return;
      }
      if (idleCallback) idleCallback();
      idleCount++;
      scheduleNextIdle();
    }, delay);
  }

  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleCount = 0;
    // Clear the absent indicator when the player takes a game action
    if (afkDetectionEnabled && afkIndicatorEl) {
      afkIndicatorEl.classList.add('hidden');
    }
    scheduleNextIdle();
  }

  function stopIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  // --- Phone UI ---

  const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function phoneTimeStr() {
    const cal = State.calendarDate();
    const h = cal.hour;
    const m = cal.minute;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return h12 + ':' + String(m).padStart(2, '0') + '\u202f' + ampm;
  }

  function phoneDateStr() {
    const cal = State.calendarDate();
    return WEEKDAY_NAMES[cal.weekday] + ', ' + MONTH_NAMES[cal.month] + '\u202f' + cal.day;
  }

  /** @param {string} text */
  function escPhoneText(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** Get display name for a contact slot */
  function contactDisplayName(slot) {
    if (slot === 'bank') return 'Bank';
    if (slot === 'supervisor') {
      const sup = /** @type {{ name: string } | undefined} */ (Character && Character.get('supervisor'));
      return sup ? sup.name : 'Work';
    }
    const c = /** @type {{ name: string } | undefined} */ (Character && Character.get(slot));
    return c ? c.name : slot;
  }

  /** Get messages for a specific contact slot from the inbox */
  function contactMessages(inbox, slot) {
    return inbox.filter(m => {
      if (slot === 'bank') return m.source === 'bank' || (!m.source && (m.type === 'bank' || m.type === 'paycheck' || m.type === 'bill'));
      if (slot === 'supervisor') return m.source === 'supervisor' || (!m.source && m.type === 'work');
      return m.source === slot;
    });
  }

  /** Build ordered contact list for messages screen */
  function buildContactList(inbox) {
    const contacts = [];

    for (const slot of ['friend1', 'friend2']) {
      const msgs = contactMessages(inbox, slot);
      if (msgs.length === 0) continue;
      const lastMsg = msgs[msgs.length - 1];
      const hasUnread = msgs.some(m => !m.read && m.direction !== 'sent');
      contacts.push({ slot, name: contactDisplayName(slot), lastMsg, hasUnread, ts: lastMsg.timestamp || 0 });
    }

    // Sort friends by most recent message
    contacts.sort((a, b) => b.ts - a.ts);

    for (const slot of ['supervisor', 'bank']) {
      const msgs = contactMessages(inbox, slot);
      if (msgs.length === 0) continue;
      const lastMsg = msgs[msgs.length - 1];
      const hasUnread = msgs.some(m => !m.read && m.direction !== 'sent');
      contacts.push({ slot, name: contactDisplayName(slot), lastMsg, hasUnread, ts: lastMsg.timestamp || 0 });
    }

    return contacts;
  }

  function buildPhoneStatusBar(timeStr, batteryPct) {
    const batteryClass = batteryPct <= 15 ? ' phone-battery--low' : '';
    const isSilent = State.get('phone_silent');
    const silentDot = isSilent ? `<span class="phone-silent-dot" title="Silent"></span>` : '';
    return `<button class="phone-status-bar" data-phone-nav="notifications"><span class="phone-status-time">${timeStr}</span>${silentDot}<span class="phone-battery-pct${batteryClass}">${Math.round(batteryPct)}%</span></button>`;
  }

  function buildPhoneNotificationsScreen(timeStr, batteryPct) {
    const isSilent = State.get('phone_silent');
    const silentLabel = isSilent ? 'Sound on' : 'Silent';
    const silentState = isSilent ? 'on' : 'off';
    return `<div class="phone-notifications">`
      + `<div class="phone-notif-header"><span class="phone-notif-time">${timeStr}</span><button class="phone-notif-close" data-phone-nav="back">&#x2715;</button></div>`
      + `<div class="phone-quick-settings">`
      + `<button class="phone-quick-tile phone-quick-tile--silent-${silentState}" data-phone-action="toggle_phone_silent">${silentLabel}</button>`
      + `</div>`
      + `</div>`;
  }

  function buildPhoneHomeScreen(timeStr, dateStr, batteryPct, unreadCount) {
    const badge = unreadCount > 0 ? `<span class="phone-app-badge">${unreadCount}</span>` : '';
    return buildPhoneStatusBar(timeStr, batteryPct)
      + `<div class="phone-home-time">${timeStr}</div>`
      + `<div class="phone-home-date">${dateStr}</div>`
      + `<div class="phone-apps">`
      + `<button class="phone-app" data-phone-nav="messages">Messages${badge}</button>`
      + `</div>`
      + `<button class="phone-home-bar" data-phone-action="put_phone_away">&#x2014;</button>`;
  }

  function buildPhoneMessagesScreen(timeStr, batteryPct, inbox) {
    const contacts = buildContactList(inbox);
    let rows = '';
    for (const c of contacts) {
      const dot = c.hasUnread ? '<span class="phone-unread-dot"></span>' : '';
      const preview = escPhoneText(c.lastMsg.text.substring(0, 48) + (c.lastMsg.text.length > 48 ? '\u2026' : ''));
      rows += `<button class="phone-contact-row${c.hasUnread ? ' phone-contact-row--unread' : ''}" data-phone-nav="thread" data-contact="${c.slot}">`
        + `<span class="phone-contact-name">${escPhoneText(c.name)}</span>`
        + `<span class="phone-contact-preview">${preview}</span>`
        + dot
        + `</button>`;
    }
    if (rows === '') rows = '<div class="phone-empty">No messages.</div>';
    return buildPhoneStatusBar(timeStr, batteryPct)
      + `<div class="phone-nav-header"><button class="phone-nav-back" data-phone-nav="home">&#x2039;</button><span class="phone-nav-title">Messages</span></div>`
      + `<div class="phone-contact-list">${rows}</div>`
      + `<button class="phone-home-bar" data-phone-action="put_phone_away">&#x2014;</button>`;
  }

  function buildPhoneThreadScreen(timeStr, batteryPct, inbox, slot) {
    const name = contactDisplayName(slot);
    const msgs = contactMessages(inbox, slot);
    let bubbles = '';
    for (const msg of msgs) {
      const isSent = msg.direction === 'sent';
      const cls = isSent ? 'phone-bubble--sent' : 'phone-bubble--received';
      const unreadCls = (!msg.read && !isSent) ? ' phone-bubble--unread' : '';
      const sender = isSent ? 'You' : name.split(' ')[0];
      bubbles += `<div class="phone-bubble ${cls}${unreadCls}">`
        + `<div class="phone-bubble-sender">${escPhoneText(sender)}</div>`
        + `<div class="phone-bubble-text">${escPhoneText(msg.text)}</div>`
        + `</div>`;
    }
    if (bubbles === '') bubbles = '<div class="phone-empty">No messages yet.</div>';

    // Compose row — only for friend threads
    let compose = '';
    if (['friend1', 'friend2'].includes(slot)) {
      const replyInter = Content.getInteraction('reply_to_friend');
      const writeInter = Content.getInteraction('message_friend');
      const askInter = Content.getInteraction('ask_for_help');
      const canReply = replyInter && replyInter.available();
      const canWrite = writeInter && writeInter.available();
      const canAsk = askInter && askInter.available();
      if (canReply || canWrite || canAsk) {
        compose = '<div class="phone-compose">';
        if (canReply) compose += `<button class="phone-compose-btn" data-phone-action="reply_to_friend">Reply</button>`;
        if (canWrite) compose += `<button class="phone-compose-btn" data-phone-action="message_friend">Write</button>`;
        if (canAsk) compose += `<button class="phone-compose-btn" data-phone-action="ask_for_help">Ask for help</button>`;
        compose += '</div>';
      }
    }

    return buildPhoneStatusBar(timeStr, batteryPct)
      + `<div class="phone-nav-header"><button class="phone-nav-back" data-phone-nav="messages">&#x2039;</button><span class="phone-nav-title">${escPhoneText(name)}</span></div>`
      + `<div class="phone-thread-messages" id="phone-thread-scroll">${bubbles}</div>`
      + compose
      + `<button class="phone-home-bar" data-phone-action="put_phone_away">&#x2014;</button>`;
  }

  function renderPhone() {
    if (!phoneEl) return;
    phoneEl.removeAttribute('hidden');
    document.body.classList.add('phone-open');

    const screen = State.get('phone_screen') || 'home';
    const threadContact = State.get('phone_thread_contact');
    const battery = State.get('phone_battery');
    const inbox = State.get('phone_inbox') || [];
    const timeStr = phoneTimeStr();
    const dateStr = phoneDateStr();

    let html = '';
    if (screen === 'notifications') {
      html = buildPhoneNotificationsScreen(timeStr, battery);
    } else if (screen === 'messages') {
      html = buildPhoneMessagesScreen(timeStr, battery, inbox);
    } else if (screen === 'thread' && threadContact) {
      html = buildPhoneThreadScreen(timeStr, battery, inbox, threadContact);
    } else {
      const unreadCount = inbox.filter(m => !m.read && m.direction !== 'sent').length;
      html = buildPhoneHomeScreen(timeStr, dateStr, battery, unreadCount);
    }

    phoneEl.innerHTML = html;

    // Scroll thread to bottom
    if (screen === 'thread') {
      const scrollEl = document.getElementById('phone-thread-scroll');
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    }

    // Mark thread messages as read + apply contact timestamp/guilt side-effects
    if (screen === 'thread' && threadContact && ['friend1', 'friend2'].includes(threadContact)) {
      const msgs = inbox.filter(m => m.source === threadContact && !m.read && m.direction !== 'sent');
      for (const msg of msgs) {
        msg.read = true;
        const fc = State.get('friend_contact');
        fc[threadContact] = State.get('time');
        State.adjustSentiment(threadContact, 'guilt', -0.02);
      }
    } else if (screen === 'thread' && threadContact && (threadContact === 'supervisor' || threadContact === 'bank')) {
      const msgs = contactMessages(inbox, threadContact);
      for (const msg of msgs) {
        if (!msg.read) msg.read = true;
      }
    }

  }

  function phoneClickHandler(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const btn = target.closest('[data-phone-nav],[data-phone-action]');
    if (!btn) return;

    const nav = btn.getAttribute('data-phone-nav');
    const action = btn.getAttribute('data-phone-action');

    if (nav) {
      e.stopPropagation();
      if (nav === 'notifications') {
        State.set('phone_prev_screen', State.get('phone_screen') || 'home');
        State.set('phone_screen', 'notifications');
      } else if (nav === 'back') {
        const prev = State.get('phone_prev_screen') || 'home';
        State.set('phone_screen', prev);
        State.set('phone_prev_screen', null);
      } else if (nav === 'home') {
        State.set('phone_screen', 'home');
        State.set('phone_thread_contact', null);
      } else if (nav === 'messages') {
        State.set('phone_screen', 'messages');
        State.set('phone_thread_contact', null);
      } else if (nav === 'thread') {
        const contact = btn.getAttribute('data-contact');
        State.set('phone_screen', 'thread');
        State.set('phone_thread_contact', contact);
      }
      renderPhone();
    } else if (action) {
      e.stopPropagation();
      if (action === 'put_phone_away') {
        const inter = Content.getInteraction('put_phone_away');
        if (inter && onAction) onAction(/** @type {Interaction} */ (inter));
      } else if (action === 'reply_to_friend') {
        const inter = Content.getInteraction('reply_to_friend');
        if (inter && onAction) onAction(/** @type {Interaction} */ (inter));
      } else if (action === 'message_friend') {
        const inter = Content.getInteraction('message_friend');
        if (inter && onAction) onAction(/** @type {Interaction} */ (inter));
      } else if (action === 'ask_for_help') {
        const inter = Content.getInteraction('ask_for_help');
        if (inter && onAction) onAction(/** @type {Interaction} */ (inter));
      } else if (action === 'toggle_phone_silent') {
        const inter = Content.getInteraction('toggle_phone_silent');
        if (inter && onAction) onAction(/** @type {Interaction} */ (inter));
      }
    }
  }

  function hidePhone() {
    if (!phoneEl) return;
    phoneEl.setAttribute('hidden', '');
    document.body.classList.remove('phone-open');
  }

  // --- Full render ---

  function render() {
    if (State.get('viewing_phone')) {
      // Show phone overlay; clear main content areas
      showPassage('');
      showActions([]);
      showMovement([]);
      renderPhone();
      return;
    }

    hidePhone();

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
    appendInnerVoice,
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

