// runs.js — IndexedDB storage layer for multi-run support

const Runs = (() => {
  const DB_NAME = 'existence';
  const DB_VERSION = 1;

  /** @type {IDBDatabase | null} */
  let db = null;

  // Debounced save state
  /** @type {ReturnType<typeof setTimeout> | null} */
  let saveTimer = null;
  /** @type {{ id: string, actions: ActionEntry[] } | null} */
  let pendingSave = null;

  const SAVE_DEBOUNCE_MS = 500;

  // --- Database lifecycle ---

  /** @returns {Promise<void>} */
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = /** @type {IDBOpenDBRequest} */ (event.target).result;

        // Runs store
        const runsStore = db.createObjectStore('runs', { keyPath: 'id' });
        runsStore.createIndex('status', 'status', { unique: false });
        runsStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });

        // Meta store (key-value)
        db.createObjectStore('meta', { keyPath: 'key' });
      };

      request.onsuccess = (event) => {
        db = /** @type {IDBOpenDBRequest} */ (event.target).result;

        // Flush pending writes on unload
        window.addEventListener('beforeunload', flush);

        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // --- Run CRUD ---

  /**
   * Create a new active run.
   * @param {number} seed
   * @param {GameCharacter} character
   * @returns {Promise<string>} The new run ID
   */
  function createRun(seed, character) {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const now = Date.now();

      /** @type {RunRecord} */
      const record = {
        id,
        seed,
        character,
        actions: [],
        status: 'active',
        createdAt: now,
        lastPlayed: now,
        version: 2,
      };

      const tx = /** @type {IDBDatabase} */ (db).transaction(['runs', 'meta'], 'readwrite');
      tx.objectStore('runs').put(record);
      tx.objectStore('meta').put({ key: 'activeRunId', value: id });

      tx.oncomplete = () => resolve(id);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Load full run data.
   * @param {string} id
   * @returns {Promise<RunRecord | null>}
   */
  function loadRun(id) {
    return new Promise((resolve, reject) => {
      const tx = /** @type {IDBDatabase} */ (db).transaction('runs', 'readonly');
      const request = tx.objectStore('runs').get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get the active run ID (which run to auto-continue).
   * @returns {Promise<string | null>}
   */
  function getActiveRunId() {
    return new Promise((resolve, reject) => {
      const tx = /** @type {IDBDatabase} */ (db).transaction('meta', 'readonly');
      const request = tx.objectStore('meta').get('activeRunId');

      request.onsuccess = () => {
        const record = request.result;
        resolve(record ? record.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set the active run ID.
   * @param {string | null} id
   * @returns {Promise<void>}
   */
  function setActiveRunId(id) {
    return new Promise((resolve, reject) => {
      const tx = /** @type {IDBDatabase} */ (db).transaction('meta', 'readwrite');
      tx.objectStore('meta').put({ key: 'activeRunId', value: id });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Debounced action save. Updates in-memory immediately, writes to IDB on timer.
   * @param {string} id
   * @param {ActionEntry[]} actions
   */
  function saveActions(id, actions) {
    pendingSave = { id, actions };

    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      writePendingSave();
    }, SAVE_DEBOUNCE_MS);
  }

  function writePendingSave() {
    if (!pendingSave || !db) return;

    const { id, actions } = pendingSave;
    pendingSave = null;
    saveTimer = null;

    const tx = db.transaction('runs', 'readwrite');
    const store = tx.objectStore('runs');
    const request = store.get(id);

    request.onsuccess = () => {
      const record = request.result;
      if (record) {
        record.actions = actions;
        record.lastPlayed = Date.now();
        store.put(record);
      }
    };
  }

  /**
   * Force-write any pending save immediately. Called on beforeunload.
   */
  function flush() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (pendingSave && db) {
      const { id, actions } = pendingSave;
      pendingSave = null;

      try {
        const tx = db.transaction('runs', 'readwrite');
        const store = tx.objectStore('runs');
        const request = store.get(id);

        request.onsuccess = () => {
          const record = request.result;
          if (record) {
            record.actions = actions;
            record.lastPlayed = Date.now();
            store.put(record);
          }
        };
      } catch (e) {
        // Best effort on unload
      }
    }
  }

  /**
   * List all runs as lightweight summaries (no actions blob), ordered by lastPlayed descending.
   * @returns {Promise<RunSummary[]>}
   */
  function listRuns() {
    return new Promise((resolve, reject) => {
      const tx = /** @type {IDBDatabase} */ (db).transaction('runs', 'readonly');
      const store = tx.objectStore('runs');
      const index = store.index('lastPlayed');
      const request = index.openCursor(null, 'prev');

      /** @type {RunSummary[]} */
      const summaries = [];

      request.onsuccess = (event) => {
        const cursor = /** @type {IDBCursorWithValue | null} */ (/** @type {IDBRequest} */ (event.target).result);
        if (cursor) {
          const record = cursor.value;
          summaries.push({
            id: record.id,
            status: record.status,
            createdAt: record.createdAt,
            lastPlayed: record.lastPlayed,
            actionCount: record.actions ? record.actions.length : 0,
            characterName: record.character
              ? record.character.first_name + ' ' + record.character.last_name
              : 'Unknown',
            jobType: record.character ? record.character.job_type : '',
            ageStage: record.character ? record.character.age_stage : '',
            version: record.version,
          });
          cursor.continue();
        } else {
          resolve(summaries);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a run permanently.
   * @param {string} id
   * @returns {Promise<void>}
   */
  function deleteRun(id) {
    return new Promise((resolve, reject) => {
      const tx = /** @type {IDBDatabase} */ (db).transaction('runs', 'readwrite');
      tx.objectStore('runs').delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  return {
    open,
    createRun,
    loadRun,
    getActiveRunId,
    setActiveRunId,
    saveActions,
    flush,
    listRuns,
    deleteRun,
  };
})();
