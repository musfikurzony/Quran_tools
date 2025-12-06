/* storage.js — simple localStorage helper (non-module) */

window.AppStorage = {
  save(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
    }catch(e){
      console.error('Storage save error', e);
    }
  },

  load(key, fallback = null){
    try{
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    }catch(e){
      console.error('Storage load error', e);
      return fallback;
    }
  },

  remove(key){
    try { localStorage.removeItem(key); } catch(e){ console.error(e); }
  }
};
