const PREFIX = 'gdp_';

const DEFAULT_PREFS = {
  lastRepo: '',
  lastTemplate: '',
  lastBranch: '',
  commitMessage: 'Add new entry via Data Push',
  remember: true,
  templateRepo: '',
  templatePath: 'data-push/templates.json',
  templateBranch: '',
  templateAutoSync: true
};

const store = {
  token: '',
  templates: null,
  templatesText: '',
  language: '',
  theme: '',
  prefs: { ...DEFAULT_PREFS },
  history: [],
  user: null,

  load() {
    this.token = this._getRaw('token') || '';
    this.templates = this._getJSON('templates', null);
    this.templatesText = this._getRaw('templatesText') || '';
    this.language = this._getRaw('language') || detectLanguage();
    this.theme = this._getRaw('theme') || 'dark';
    this.prefs = { ...DEFAULT_PREFS, ...this._getJSON('prefs', {}) };
    this.history = this._getJSON('history', []);
    this.user = this._getJSON('user', null);
    return this;
  },

  _getRaw(key) {
    return localStorage.getItem(PREFIX + key);
  },

  _getJSON(key, fallback) {
    try {
      const raw = this._getRaw(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  _setRaw(key, value) {
    if (value == null || value === '') {
      localStorage.removeItem(PREFIX + key);
    } else {
      localStorage.setItem(PREFIX + key, value);
    }
  },

  _setJSON(key, value) {
    if (value == null) {
      localStorage.removeItem(PREFIX + key);
    } else {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  },

  setToken(token) {
    this.token = (token || '').trim();
    this._setRaw('token', this.token);
  },

  clearToken() {
    this.token = '';
    this.user = null;
    this._setRaw('token', '');
    this._setJSON('user', null);
  },

  setUser(user) {
    this.user = user;
    this._setJSON('user', user);
  },

  setLanguage(lang) {
    this.language = lang;
    this._setRaw('language', lang);
  },

  setTheme(theme) {
    this.theme = theme;
    this._setRaw('theme', theme);
  },

  setTemplates(templates, text) {
    this.templates = templates;
    this.templatesText = text || '';
    this._setJSON('templates', templates);
    this._setRaw('templatesText', this.templatesText);
  },

  setPrefs(partial) {
    this.prefs = { ...this.prefs, ...partial };
    this._setJSON('prefs', this.prefs);
  },

  addHistory(entry) {
    this.history.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      ...entry
    });
    this.history = this.history.slice(0, 100);
    this._setJSON('history', this.history);
  },

  clearHistory() {
    this.history = [];
    this._setJSON('history', []);
  },

  removeHistory(id) {
    this.history = this.history.filter((item) => item.id !== id);
    this._setJSON('history', this.history);
  },

  exportAll() {
    return {
      templates: this.templates,
      templatesText: this.templatesText,
      language: this.language,
      theme: this.theme,
      prefs: this.prefs,
      history: this.history
    };
  },

  wipeLocalData() {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
    this.token = '';
    this.templates = null;
    this.templatesText = '';
    this.language = detectLanguage();
    this.theme = 'dark';
    this.prefs = { ...DEFAULT_PREFS };
    this.history = [];
    this.user = null;
  }
};
