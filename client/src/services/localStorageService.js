// SRS: LocalStorage for document records and settings
// Fallback when server is unavailable - SRS Section 2.2.2 Graceful Failure

const DOCS_KEY  = 'docalert_documents';
const SETTINGS_KEY = 'docalert_settings';

const safeGet = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('LocalStorage write error:', e);
    return false;
  }
};

export const localStorageService = {
  // Documents
  getDocuments: ()              => safeGet(DOCS_KEY, []),
  saveDocument: (doc)           => {
    const docs = safeGet(DOCS_KEY, []);
    const idx  = docs.findIndex(d => d._id === doc._id);
    if (idx >= 0) docs[idx] = doc; else docs.unshift(doc);
    safeSet(DOCS_KEY, docs);
  },
  updateDocument: (id, updated) => {
    const docs = safeGet(DOCS_KEY, []);
    const idx  = docs.findIndex(d => d._id === id);
    if (idx >= 0) { docs[idx] = { ...docs[idx], ...updated }; safeSet(DOCS_KEY, docs); }
  },
  deleteDocument: (id)          => {
    const docs = safeGet(DOCS_KEY, []).filter(d => d._id !== id);
    safeSet(DOCS_KEY, docs);
  },
  clearDocuments: ()            => localStorage.removeItem(DOCS_KEY),

  // Settings
  getSettings: ()               => safeGet(SETTINGS_KEY, { reminderPeriod: 30, notificationsEnabled: false }),
  saveSettings: (settings)      => safeSet(SETTINGS_KEY, settings),
};

// IndexedDB for attachments (SRS: binary files exceed LocalStorage limits)
export const indexedDBService = {
  DB_NAME: 'DocAlertDB',
  STORE:   'attachments',
  VERSION: 1,

  openDB: () => new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('IndexedDB not supported')); return; }
    const req = indexedDB.open('DocAlertDB', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('attachments')) {
        db.createObjectStore('attachments', { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  }),

  saveAttachment: async (docId, file) => {
    try {
      const db = await indexedDBService.openDB();
      const arrayBuffer = await file.arrayBuffer();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction('attachments', 'readwrite');
        const store = tx.objectStore('attachments');
        const req   = store.put({ id: docId, fileName: file.name, mimeType: file.type, sizeBytes: file.size, data: arrayBuffer });
        req.onsuccess = () => resolve({ fileName: file.name, mimeType: file.type, sizeBytes: file.size });
        req.onerror   = (e) => reject(e.target.error);
      });
    } catch (e) {
      console.error('IndexedDB save error:', e);
      throw e;
    }
  },

  getAttachment: async (docId) => {
    try {
      const db = await indexedDBService.openDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction('attachments', 'readonly');
        const store = tx.objectStore('attachments');
        const req   = store.get(docId);
        req.onsuccess = (e) => resolve(e.target.result || null);
        req.onerror   = (e) => reject(e.target.error);
      });
    } catch { return null; }
  },

  deleteAttachment: async (docId) => {
    try {
      const db = await indexedDBService.openDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction('attachments', 'readwrite');
        const store = tx.objectStore('attachments');
        const req   = store.delete(docId);
        req.onsuccess = () => resolve(true);
        req.onerror   = (e) => reject(e.target.error);
      });
    } catch { return false; }
  },
};
