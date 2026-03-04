export const DEFAULT_BINDINGS = {
    UP: 'W',
    LEFT: 'A',
    DOWN: 'S',
    RIGHT: 'D',
    SHOOT: 'LEFT_CLICK' // Custom identifier for mouse
};

class SettingsManager {
    constructor() {
        this.bindings = { ...DEFAULT_BINDINGS };
        this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('game_bindings');
        if (saved) {
            try {
                this.bindings = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load settings:", e);
                this.bindings = { ...DEFAULT_BINDINGS };
            }
        }
    }

    saveSettings() {
        localStorage.setItem('game_bindings', JSON.stringify(this.bindings));
    }

    setBinding(action, key) {
        this.bindings[action] = key;
        this.saveSettings();
    }

    getBinding(action) {
        return this.bindings[action];
    }
}

export const settingsManager = new SettingsManager();
