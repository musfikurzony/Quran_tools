/* storage.js - simple localStorage helper (non-module) */
const Storage = {
  save: function(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){ console.error(e); }
  },
  load: function(key, defaultValue){
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : (defaultValue===undefined?null:defaultValue); } catch(e){ console.error(e); return defaultValue===undefined?null:defaultValue; }
  },
  remove: function(key){ try{ localStorage.removeItem(key); }catch(e){console.error(e);} }
};
