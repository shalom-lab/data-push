document.addEventListener('DOMContentLoaded', async () => {
  await GDP.boot('settings');
  const tokenInput = document.getElementById('settingsToken');
  const showBtn = document.getElementById('toggleToken');
  const remember = document.getElementById('rememberLast');
  const commit = document.getElementById('defaultCommit');
  const theme = document.getElementById('themeSelect');
  const lang = document.getElementById('settingsLang');

  remember.checked = !!store.prefs.remember;
  commit.value = store.prefs.commitMessage || '';
  theme.value = store.theme;
  lang.innerHTML = Object.entries(SUPPORTED_LANGUAGES)
    .map(([code, name]) => `<option value="${code}" ${code === store.language ? 'selected' : ''}>${name}</option>`)
    .join('');

  renderUser();

  document.getElementById('saveToken').onclick = async () => {
    const token = tokenInput.value.trim();
    if (!token) return ui.showToast(t('token.required'), 'error');
    const btn = document.getElementById('saveToken');
    ui.setBusy(btn, true, 'common.loading');
    const previous = store.token;
    store.setToken(token);
    try {
      const user = await github.getUser();
      store.setUser({ login: user.login, avatar_url: user.avatar_url, name: user.name || user.login });
      tokenInput.value = '';
      renderUser();
      refreshTokenChip();
      ui.showToast(t('token.successUpdate'));
    } catch (err) {
      store.setToken(previous);
      ui.showToast(ui.mapError(err), 'error');
    } finally {
      ui.setBusy(btn, false, 'settingsPage.saveToken');
      btn.dataset.label = t('settingsPage.saveToken');
      btn.textContent = t('settingsPage.saveToken');
    }
  };

  document.getElementById('resetToken').onclick = async () => {
    if (!(await ui.confirm(t('token.confirmReset')))) return;
    store.clearToken();
    tokenInput.value = '';
    renderUser();
    refreshTokenChip();
    ui.showToast(t('token.successReset'));
  };

  showBtn.onclick = () => {
    const hidden = tokenInput.type === 'password';
    tokenInput.type = hidden ? 'text' : 'password';
    showBtn.textContent = t(hidden ? 'settingsPage.hideToken' : 'settingsPage.showToken');
  };

  remember.onchange = () => store.setPrefs({ remember: remember.checked });
  commit.onchange = () => store.setPrefs({ commitMessage: commit.value.trim() });
  theme.onchange = () => {
    store.setTheme(theme.value);
    ui.applyTheme();
    mountShell('settings');
    ui.applyI18n();
    refreshTokenChip();
  };
  lang.onchange = () => {
    store.setLanguage(lang.value);
    mountShell('settings');
    ui.applyI18n();
    refreshTokenChip();
    showBtn.textContent = t(tokenInput.type === 'password' ? 'settingsPage.showToken' : 'settingsPage.hideToken');
  };

  document.getElementById('exportData').onclick = () => {
    downloadText(`${todayISO()}-data-push-config.json`, JSON.stringify(store.exportAll(), null, 2));
  };

  document.getElementById('wipeData').onclick = async () => {
    if (!(await ui.confirm(t('settingsPage.wipeConfirm')))) return;
    store.wipeLocalData();
    location.reload();
  };
});

function renderUser() {
  const box = document.getElementById('userCard');
  if (store.user) {
    box.hidden = false;
    box.innerHTML = `
      <img src="${escapeHtml(store.user.avatar_url)}" alt="" />
      <div>
        <strong>${t('settingsPage.testOk', { login: store.user.login })}</strong>
        <div class="muted">${escapeHtml(store.user.name || '')}</div>
      </div>
    `;
  } else {
    box.hidden = true;
    box.innerHTML = '';
  }
}
