// storage.js (global)
window.AppStorage = {
  save(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){} },
  load(key, fallback){ try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch(e){ return fallback; } }
};
