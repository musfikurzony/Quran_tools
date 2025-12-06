// storage.js (plain, no export)
window.AppStorage = {
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {
      console.error("Storage save error", e);
    }
  },
  load(key, defaultValue) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : defaultValue;
    } catch(e) {
      console.error("Storage load error", e);
      return defaultValue;
    }
  }
};
