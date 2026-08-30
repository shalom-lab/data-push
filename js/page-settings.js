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
  bindTemplateSync();
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

function bindTemplateSync() {
  const repoInput = document.getElementById('syncRepo');
  const pathInput = document.getElementById('syncPath');
  const branchInput = document.getElementById('syncBranch');
  const auto = document.getElementById('syncAuto');
  repoInput.value = store.prefs.templateRepo || '';
  pathInput.value = store.prefs.templatePath || 'data-push/templates.json';
  branchInput.value = store.prefs.templateBranch || '';
  auto.checked = store.prefs.templateAutoSync !== false;
  refreshSyncStatus();

  let repos = [];
  bindRepoCombo(repoInput, document.getElementById('syncRepoList'), () => repos, (full) => {
    store.setPrefs({ templateRepo: full });
    refreshSyncStatus();
  });
  repoInput.addEventListener('change', () => {
    store.setPrefs({ templateRepo: repoInput.value.trim() });
    refreshSyncStatus();
  });
  pathInput.addEventListener('change', () => {
    store.setPrefs({ templatePath: pathInput.value.trim() || 'data-push/templates.json' });
    refreshSyncStatus();
  });
  branchInput.addEventListener('change', () => {
    store.setPrefs({ templateBranch: branchInput.value.trim() });
    refreshSyncStatus();
  });
  auto.onchange = () => store.setPrefs({ templateAutoSync: auto.checked });

  document.getElementById('syncPull').onclick = async () => {
    persistSyncFields();
    const btn = document.getElementById('syncPull');
    ui.setBusy(btn, true);
    try {
      const result = await templateSync.pull();
      if (result.missing) ui.showToast(t('sync.missing'));
      else ui.showToast(t('sync.pulled'));
      if (result.htmlUrl) {
        const link = document.getElementById('syncFileLink');
        link.hidden = false;
        link.href = result.htmlUrl;
      }
    } catch (err) {
      ui.showToast(ui.mapError(err), 'error');
    } finally {
      ui.setBusy(btn, false, 'sync.pull');
      btn.dataset.label = t('sync.pull');
      btn.textContent = t('sync.pull');
    }
  };

  document.getElementById('syncPush').onclick = async () => {
    persistSyncFields();
    const btn = document.getElementById('syncPush');
    ui.setBusy(btn, true);
    try {
      const result = await templateSync.push(getTemplates());
      ui.showToast(t('sync.pushed'));
      if (result.htmlUrl) {
        const link = document.getElementById('syncFileLink');
        link.hidden = false;
        link.href = result.htmlUrl;
      }
    } catch (err) {
      ui.showToast(ui.mapError(err), 'error');
    } finally {
      ui.setBusy(btn, false, 'sync.push');
      btn.dataset.label = t('sync.push');
      btn.textContent = t('sync.push');
    }
  };

  if (store.token) {
    github.listRepos().then((list) => {
      repos = list;
    }).catch(() => {});
  }
}

function persistSyncFields() {
  store.setPrefs({
    templateRepo: document.getElementById('syncRepo').value.trim(),
    templatePath: document.getElementById('syncPath').value.trim() || 'data-push/templates.json',
    templateBranch: document.getElementById('syncBranch').value.trim(),
    templateAutoSync: document.getElementById('syncAuto').checked
  });
  refreshSyncStatus();
}

function refreshSyncStatus() {
  const status = document.getElementById('syncStatus');
  if (!status) return;
  status.textContent = templateSync.configured()
    ? t('sync.dest', { dest: templateSync.destLabel() })
    : t('sync.notConfigured');
}

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
