function detectLanguage() {
  const code = (navigator.language || 'en').toLowerCase();
  for (const lang of Object.keys(SUPPORTED_LANGUAGES)) {
    if (code.startsWith(lang)) return lang;
  }
  return 'en';
}

function t(key, vars) {
  const lang = I18N[store.language] || I18N.en;
  const parts = key.split('.');
  let value = lang;
  for (const part of parts) {
    value = value?.[part];
  }
  if (value == null) {
    value = I18N.en;
    for (const part of parts) value = value?.[part];
  }
  if (value == null) return key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      value = String(value).replaceAll(`{${k}}`, v);
    });
  }
  return value;
}

const ui = {
  applyTheme() {
    document.documentElement.dataset.theme = store.theme || 'dark';
  },

  applyI18n(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });
    document.title = t(document.body.dataset.titleKey || 'meta.title');
    document.documentElement.lang = store.language || 'zh';
    document.documentElement.dir = store.language === 'ar' ? 'rtl' : 'ltr';
  },

  showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach((n) => n.remove());
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    toast.offsetHeight;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 280);
    }, 3200);
  },

  confirm(message) {
    return new Promise((resolve) => {
      document.querySelectorAll('.confirm-toast').forEach((n) => n.remove());
      const dialog = document.createElement('div');
      dialog.className = 'confirm-toast';
      dialog.innerHTML = `
        <div class="confirm-card">
          <p class="confirm-message">${escapeHtml(message)}</p>
          <div class="confirm-buttons">
            <button type="button" class="btn btn-danger confirm-yes">${t('common.yes')}</button>
            <button type="button" class="btn btn-ghost confirm-no">${t('common.no')}</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
      dialog.offsetHeight;
      dialog.classList.add('show');
      const done = (ok) => {
        dialog.classList.remove('show');
        setTimeout(() => dialog.remove(), 200);
        resolve(ok);
      };
      dialog.querySelector('.confirm-yes').onclick = () => done(true);
      dialog.querySelector('.confirm-no').onclick = () => done(false);
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) done(false);
      });
    });
  },

  setBusy(btn, busy, labelKey) {
    if (!btn) return;
    if (busy) {
      btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.classList.add('loading');
      btn.textContent = t(labelKey || 'common.loading');
    } else {
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.textContent = btn.dataset.label || t(labelKey || 'common.submit');
    }
  },

  mapError(err) {
    const msg = err?.message || String(err);
    const map = {
      NO_TOKEN: 'error.noToken',
      UNAUTHORIZED: 'error.unauthorized',
      ACCESS_DENIED: 'error.accessDenied',
      FORBIDDEN: 'error.accessDenied',
      NOT_FOUND: 'error.notFound',
      NO_SYNC: 'sync.notConfigured'
    };
    return map[msg] ? t(map[msg]) : msg;
  }
};

function bindRepoCombo(input, list, getRepos, onPick) {
  if (!input || !list) return;
  const filter = () => {
    const repos = getRepos() || [];
    const q = input.value.trim().toLowerCase();
    const items = repos.filter((r) => !q || r.full_name.toLowerCase().includes(q)).slice(0, 40);
    list.innerHTML = items
      .map(
        (r) =>
          `<div class="combo-item" data-full="${escapeHtml(r.full_name)}">${escapeHtml(
            r.full_name
          )}<small>${r.private ? 'private' : 'public'}</small></div>`
      )
      .join('');
    list.classList.toggle('open', items.length > 0);
  };
  input.addEventListener('focus', filter);
  input.addEventListener('input', filter);
  list.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.combo-item');
    if (!item) return;
    input.value = item.dataset.full;
    list.classList.remove('open');
    onPick?.(item.dataset.full);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.combo')) list.classList.remove('open');
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function downloadText(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}
