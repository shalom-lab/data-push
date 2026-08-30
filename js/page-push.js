let repos = [];
let currentTemplateKey = '';
let fileInfo = { exists: false, count: 0, htmlUrl: '' };

document.addEventListener('DOMContentLoaded', async () => {
  await GDP.boot('push');
  const gated = document.getElementById('pushGated');
  const work = document.getElementById('pushWork');

  if (!store.token) {
    gated.hidden = false;
    work.hidden = true;
    return;
  }

  gated.hidden = true;
  work.hidden = false;
  fillTemplateSelect();
  bindPushEvents();
  await loadReposSafe();

  const reuse = sessionStorage.getItem('gdp_reuse');
  if (reuse) {
    sessionStorage.removeItem('gdp_reuse');
    try {
      applyReuse(JSON.parse(reuse));
    } catch {
      /* ignore */
    }
  }
});

document.addEventListener('gdp:langchange', () => {
  fillTemplateSelect();
  if (currentTemplateKey) renderTemplate(currentTemplateKey);
});

function fillTemplateSelect() {
  const select = document.getElementById('templateSelect');
  const templates = getTemplates();
  const previous = select.value || store.prefs.lastTemplate;
  select.innerHTML = `<option value="">${t('push.template')}</option>`;
  Object.entries(templates).forEach(([key, tpl]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = tpl.name;
    select.appendChild(opt);
  });
  if (previous && templates[previous]) select.value = previous;
  if (select.value) renderTemplate(select.value);
}

async function loadReposSafe() {
  const input = document.getElementById('repoSearch');
  input.placeholder = t('common.loading');
  try {
    repos = await github.listRepos();
    input.placeholder = t('push.repoPlaceholder');
    if (store.prefs.remember && store.prefs.lastRepo) {
      input.value = store.prefs.lastRepo;
      await onRepoChosen(store.prefs.lastRepo);
    }
  } catch (err) {
    ui.showToast(ui.mapError(err), 'error');
    input.placeholder = t('error.loadRepos');
  }
}

function bindPushEvents() {
  const input = document.getElementById('repoSearch');
  const list = document.getElementById('repoList');

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    const items = repos
      .filter((r) => !q || r.full_name.toLowerCase().includes(q))
      .slice(0, 40);
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
  list.addEventListener('mousedown', async (e) => {
    const item = e.target.closest('.combo-item');
    if (!item) return;
    input.value = item.dataset.full;
    list.classList.remove('open');
    await onRepoChosen(item.dataset.full);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.combo')) list.classList.remove('open');
  });

  document.getElementById('templateSelect').addEventListener('change', (e) => {
    renderTemplate(e.target.value);
    if (store.prefs.remember) store.setPrefs({ lastTemplate: e.target.value });
    refreshFileStatus();
  });

  document.getElementById('branchSelect').addEventListener('change', () => {
    store.setPrefs({ lastBranch: document.getElementById('branchSelect').value });
    refreshFileStatus();
  });

  document.getElementById('reloadFile').addEventListener('click', refreshFileStatus);
  document.getElementById('resetForm').addEventListener('click', () => {
    if (currentTemplateKey) renderTemplate(currentTemplateKey);
  });
  document.getElementById('submit').addEventListener('click', submitData);

  document.getElementById('formFields').addEventListener('input', updatePreview);
  document.getElementById('formFields').addEventListener('change', updatePreview);
}

async function onRepoChosen(fullName) {
  if (store.prefs.remember) store.setPrefs({ lastRepo: fullName });
  const branchSelect = document.getElementById('branchSelect');
  branchSelect.innerHTML = `<option>${t('common.loading')}</option>`;
  try {
    const repo = repos.find((r) => r.full_name === fullName);
    const branches = await github.listBranches(fullName);
    branchSelect.innerHTML = branches
      .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
      .join('');
    const preferred = store.prefs.lastBranch || repo?.default_branch;
    if (preferred && branches.includes(preferred)) branchSelect.value = preferred;
  } catch (err) {
    branchSelect.innerHTML = `<option value="">${ui.mapError(err)}</option>`;
  }
  await refreshFileStatus();
}

function renderTemplate(key) {
  const templates = getTemplates();
  currentTemplateKey = key;
  const tpl = templates[key];
  const fields = document.getElementById('formFields');
  if (!tpl) {
    fields.innerHTML = '';
    document.getElementById('savePath').textContent = '—';
    document.getElementById('fieldInfo').textContent = '—';
    updatePreview();
    return;
  }
  document.getElementById('savePath').textContent = tpl.filename;
  document.getElementById('fieldInfo').textContent = tpl.fieldOrder
    .map((name) => `${name}: ${tpl.fields[name]?.type || '?'}`)
    .join('\n');
  generateFormFields(fields, tpl);
  updatePreview();
}

async function refreshFileStatus() {
  const repo = document.getElementById('repoSearch').value.trim();
  const tpl = getTemplates()[currentTemplateKey];
  const status = document.getElementById('fileStatus');
  const link = document.getElementById('fileLink');
  fileInfo = { exists: false, count: 0, htmlUrl: '' };
  if (!repo || !tpl) {
    status.textContent = t('push.existingUnknown');
    link.hidden = true;
    return;
  }
  status.textContent = t('common.loading');
  try {
    const file = await github.getFile(repo, tpl.filename, document.getElementById('branchSelect').value);
    if (!file) {
      status.textContent = t('push.existingMissing');
      link.hidden = true;
      return;
    }
    let count = 0;
    try {
      const parsed = JSON.parse(github.decodeContent(file));
      count = Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      count = 0;
    }
    fileInfo = { exists: true, count, htmlUrl: file.html_url };
    status.textContent = t('push.existingCount', { n: String(count) });
    link.hidden = false;
    link.href = file.html_url;
  } catch (err) {
    status.textContent = ui.mapError(err);
    link.hidden = true;
  }
}

function currentPayload() {
  const tpl = getTemplates()[currentTemplateKey];
  if (!tpl) return null;
  try {
    return {
      ...collectFormData(tpl),
      timestamp: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

function updatePreview() {
  const box = document.getElementById('payloadPreview');
  const data = currentPayload();
  box.textContent = data ? JSON.stringify(data, null, 2) : '—';
}

function applyReuse(entry) {
  const input = document.getElementById('repoSearch');
  if (entry.repo) input.value = entry.repo;
  const select = document.getElementById('templateSelect');
  if (entry.templateKey && getTemplates()[entry.templateKey]) {
    select.value = entry.templateKey;
    const tpl = getTemplates()[entry.templateKey];
    currentTemplateKey = entry.templateKey;
    document.getElementById('savePath').textContent = tpl.filename;
    generateFormFields(document.getElementById('formFields'), tpl, entry.data);
    updatePreview();
  }
  if (entry.repo) onRepoChosen(entry.repo);
}

async function submitData() {
  const btn = document.getElementById('submit');
  const repo = document.getElementById('repoSearch').value.trim();
  const tpl = getTemplates()[currentTemplateKey];
  if (!tpl) return ui.showToast(t('error.selectTemplate'), 'error');
  if (!repo) return ui.showToast(t('error.selectRepo'), 'error');

  let formData;
  try {
    formData = collectFormData(tpl);
  } catch (err) {
    return ui.showToast(err.message, 'error');
  }

  const entry = { ...formData, timestamp: new Date().toISOString() };
  const message = document.getElementById('commitMessage').value.trim() || store.prefs.commitMessage;
  const branch = document.getElementById('branchSelect').value;

  ui.setBusy(btn, true);
  try {
    const { htmlUrl, count } = await github.appendJson(repo, tpl.filename, entry, message, branch);
    store.addHistory({
      time: entry.timestamp,
      repo,
      branch,
      templateKey: currentTemplateKey,
      templateName: tpl.name,
      filename: tpl.filename,
      data: formData,
      htmlUrl
    });
    ui.showToast(t('success.submit'));
    generateFormFields(document.getElementById('formFields'), tpl);
    updatePreview();
    fileInfo = { exists: true, count, htmlUrl };
    document.getElementById('fileStatus').textContent = t('push.existingCount', { n: String(count) });
    const link = document.getElementById('fileLink');
    if (htmlUrl) {
      link.hidden = false;
      link.href = htmlUrl;
    }
  } catch (err) {
    ui.showToast(ui.mapError(err), 'error');
  } finally {
    ui.setBusy(btn, false, 'common.submit');
    btn.dataset.label = t('common.submit');
    btn.textContent = t('common.submit');
  }
}
