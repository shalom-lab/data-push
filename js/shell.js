const GDP = {
  async boot(page) {
    store.load();
    ui.applyTheme();
    mountShell(page);
    ui.applyI18n();
    refreshTokenChip();
    return store;
  }
};

function mountShell(page) {
  const header = document.getElementById('app-header');
  const footer = document.getElementById('app-footer');
  if (header) header.innerHTML = renderHeader(page);
  if (footer) footer.innerHTML = renderFooter();

  header?.querySelector('#themeToggle')?.addEventListener('click', () => {
    store.setTheme(store.theme === 'light' ? 'dark' : 'light');
    ui.applyTheme();
    mountShell(page);
    ui.applyI18n();
    refreshTokenChip();
  });

  header?.querySelector('#langSelect')?.addEventListener('change', (e) => {
    store.setLanguage(e.target.value);
    ui.applyI18n();
    mountShell(page);
    ui.applyI18n();
    refreshTokenChip();
    document.dispatchEvent(new CustomEvent('gdp:langchange'));
  });
}

function renderHeader(page) {
  const langs = Object.entries(SUPPORTED_LANGUAGES)
    .map(
      ([code, name]) =>
        `<option value="${code}" ${code === store.language ? 'selected' : ''}>${name}</option>`
    )
    .join('');

  const links = [
    ['index.html', 'home', 'nav.home'],
    ['push.html', 'push', 'nav.push'],
    ['templates.html', 'templates', 'nav.templates'],
    ['history.html', 'history', 'nav.history'],
    ['docs.html', 'docs', 'nav.docs'],
    ['settings.html', 'settings', 'nav.settings']
  ];

  return `
    <div class="nav-inner">
      <a class="brand" href="index.html">
        <img src="icons/icon128.png?v=2" alt="" width="32" height="32" />
        <span>Data Push</span>
      </a>
      <nav class="nav-links">
        ${links
          .map(
            ([href, id, key]) =>
              `<a href="${href}" class="${page === id ? 'active' : ''}" data-i18n="${key}"></a>`
          )
          .join('')}
      </nav>
      <div class="nav-tools">
        <a id="tokenChip" class="token-chip" href="settings.html"></a>
        <select id="langSelect" class="lang-select" aria-label="Language">${langs}</select>
        <button type="button" id="themeToggle" class="icon-btn" data-i18n-title="nav.theme" aria-label="theme">
          ${themeIconSvg(store.theme)}
        </button>
        <a class="icon-btn" href="https://github.com/shalom-lab/data-push" target="_blank" rel="noreferrer" data-i18n-title="nav.repo" aria-label="GitHub">
          ${githubIconSvg()}
        </a>
      </div>
    </div>
  `;
}

function renderFooter() {
  return `
    <div class="footer-inner">
      <p data-i18n="footer.byok"></p>
      <p><a href="https://github.com/shalom-lab/data-push" target="_blank" rel="noreferrer">shalom-lab/data-push</a> · MIT</p>
    </div>
  `;
}

function themeIconSvg(theme) {
  if (theme === 'light') {
    return `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3z"/></svg>`;
}

function githubIconSvg() {
  return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;
}

function refreshTokenChip() {
  const chip = document.getElementById('tokenChip');
  if (!chip) return;
  if (store.token && store.user) {
    chip.classList.add('ok');
    chip.innerHTML = `<img src="${escapeHtml(store.user.avatar_url)}" alt="" /><span>@${escapeHtml(store.user.login)}</span>`;
  } else if (store.token) {
    chip.classList.add('ok');
    chip.textContent = t('nav.tokenReady');
  } else {
    chip.classList.remove('ok');
    chip.textContent = t('nav.byok');
  }
}
