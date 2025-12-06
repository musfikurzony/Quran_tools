// storage.js
// -------------------------------------------
// Handles saving and loading settings from localStorage
// -------------------------------------------

export const Storage = {
    save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("Storage Save Error:", e);
        }
    },

    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error("Storage Load Error:", e);
            return defaultValue;
        }
    }
};
