// storage.js
// ---------------------------------------------------------
// Local storage handler: last surah, last ayah, settings
// ---------------------------------------------------------

const STORAGE_KEY = "quran_tools_settings_v1";

export function saveSettings(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error saving settings:", e);
    }
}

export function loadSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error("Error loading settings:", e);
        return {};
    }
}

export function saveLastPosition(surah, ayah) {
    try {
        const saved = loadSettings();
        saved.lastSurah = surah;
        saved.lastAyah = ayah;
        saveSettings(saved);
    } catch (e) {
        console.error("Error saving last position:", e);
    }
}

export function loadLastPosition() {
    const saved = loadSettings();
    return {
        surah: saved.lastSurah || null,
        ayah: saved.lastAyah || null
    };
}

// Generic key-value storage if needed later
export function getItem(key, fallback = null) {
    const saved = loadSettings();
    return saved[key] !== undefined ? saved[key] : fallback;
}

export function setItem(key, value) {
    const saved = loadSettings();
    saved[key] = value;
    saveSettings(saved);
}
