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
        <button type="button" id="themeToggle" class="icon-btn" data-i18n-title="nav.theme">
          ${store.theme === 'light' ? '☾' : '☀'}
        </button>
      </div>
    </div>
  `;
}

function renderFooter() {
  return `
    <div class="footer-inner">
      <p data-i18n="footer.byok"></p>
      <p><a href="https://github.com/shalom-lab/push-data" target="_blank" rel="noreferrer">GitHub</a> · MIT</p>
    </div>
  `;
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
