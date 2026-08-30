let draft = {};
let activeKey = '';
let mode = 'visual';

document.addEventListener('DOMContentLoaded', async () => {
  await GDP.boot('templates');
  draft = structuredClone(getTemplates());
  bindTemplatePage();
  renderList();
  const first = Object.keys(draft)[0];
  if (first) selectTemplate(first);
  else renderEmpty();
});

document.addEventListener('gdp:langchange', () => {
  renderList();
  if (activeKey && draft[activeKey]) renderEditor();
});

function bindTemplatePage() {
  document.getElementById('addTemplate').onclick = addTemplate;
  document.getElementById('saveAll').onclick = saveAll;
  document.getElementById('exportTemplates').onclick = () => {
    downloadText(`${todayISO()}-templates.json`, formatTemplatesText(draft));
  };
  document.getElementById('importTemplates').onclick = () => {
    document.getElementById('importFile').click();
  };
  document.getElementById('importFile').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      validateTemplates(parsed);
      draft = orderTemplates(parsed);
      activeKey = Object.keys(draft)[0] || '';
      renderList();
      if (activeKey) renderEditor();
      else renderEmpty();
      ui.showToast(t('templates.successImport'));
    } catch (err) {
      ui.showToast(`${t('templates.errorFormat')}: ${err.message}`, 'error');
    }
    e.target.value = '';
  };
  document.getElementById('resetDefaults').onclick = async () => {
    if (!(await ui.confirm(t('templates.confirmReset')))) return;
    draft = structuredClone(DEFAULT_TEMPLATES);
    activeKey = Object.keys(draft)[0];
    renderList();
    renderEditor();
  };
  document.getElementById('tabVisual').onclick = () => setMode('visual');
  document.getElementById('tabJson').onclick = () => setMode('json');
}

function setMode(next) {
  syncFromEditor();
  mode = next;
  document.getElementById('tabVisual').classList.toggle('active', mode === 'visual');
  document.getElementById('tabJson').classList.toggle('active', mode === 'json');
  renderEditor();
}

function renderList() {
  const list = document.getElementById('templateList');
  const keys = Object.keys(draft);
  if (!keys.length) {
    list.innerHTML = `<p class="muted">${t('templatesPage.empty')}</p>`;
    return;
  }
  list.innerHTML = keys
    .map(
      (key) => `
      <button type="button" class="tpl-item ${key === activeKey ? 'active' : ''}" data-key="${escapeHtml(key)}">
        <strong>${escapeHtml(draft[key].name || key)}</strong>
        <span>${escapeHtml(key)} · ${escapeHtml(draft[key].filename || '')}</span>
      </button>`
    )
    .join('');
  list.querySelectorAll('.tpl-item').forEach((btn) => {
    btn.onclick = () => {
      syncFromEditor();
      selectTemplate(btn.dataset.key);
    };
  });
}

function selectTemplate(key) {
  activeKey = key;
  renderList();
  renderEditor();
}

function renderEmpty() {
  document.getElementById('editorPane').innerHTML = `<div class="empty-state"><p>${t('templatesPage.empty')}</p></div>`;
}

function renderEditor() {
  const pane = document.getElementById('editorPane');
  const tpl = draft[activeKey];
  if (!tpl) return renderEmpty();

  if (mode === 'json') {
    pane.innerHTML = `
      <textarea id="jsonEditor" class="mono" style="min-height:520px">${escapeHtml(
        formatTemplatesText({ [activeKey]: tpl })
      )}</textarea>
      <p class="meta-row"><span>JSON</span><span>${escapeHtml(activeKey)}</span></p>
    `;
    return;
  }

  const fields = (tpl.fieldOrder || []).map((name, index) => fieldEditorHtml(name, tpl.fields[name], index)).join('');
  pane.innerHTML = `
    <div class="field-grid">
      <div class="form-group">
        <label data-i18n="templatesPage.key"></label>
        <input id="tplKey" value="${escapeHtml(activeKey)}" />
      </div>
      <div class="form-group">
        <label data-i18n="templatesPage.name"></label>
        <input id="tplName" value="${escapeHtml(tpl.name || '')}" />
      </div>
    </div>
    <div class="form-group">
      <label data-i18n="templatesPage.filename"></label>
      <input id="tplFilename" value="${escapeHtml(tpl.filename || '')}" />
    </div>
    <div class="toolbar">
      <button type="button" class="btn btn-sm btn-muted" id="addField" data-i18n="templatesPage.addField"></button>
      <button type="button" class="btn btn-sm btn-ghost" id="dupTpl" data-i18n="templatesPage.duplicate"></button>
      <button type="button" class="btn btn-sm btn-danger" id="delTpl" data-i18n="templatesPage.delete"></button>
    </div>
    <div id="fieldEditors">${fields}</div>
  `;
  ui.applyI18n(pane);

  pane.querySelector('#addField').onclick = () => {
    syncFromEditor();
    const name = `field_${Date.now().toString(36)}`;
    draft[activeKey].fieldOrder.push(name);
    draft[activeKey].fields[name] = { type: 'text', label: name, required: false };
    renderEditor();
  };
  pane.querySelector('#dupTpl').onclick = () => {
    syncFromEditor();
    const next = `${activeKey}_copy`;
    draft[next] = structuredClone(draft[activeKey]);
    draft[next].name = `${draft[next].name} copy`;
    selectTemplate(next);
  };
  pane.querySelector('#delTpl').onclick = async () => {
    if (!(await ui.confirm(t('templates.confirmDelete')))) return;
    delete draft[activeKey];
    activeKey = Object.keys(draft)[0] || '';
    renderList();
    if (activeKey) renderEditor();
    else renderEmpty();
  };
}

function fieldEditorHtml(name, field, index) {
  const options = (field.options || []).join(', ');
  const typeOptions = FIELD_TYPES.map(
    (tp) => `<option value="${tp}" ${tp === field.type ? 'selected' : ''}>${tp}</option>`
  ).join('');
  return `
    <div class="field-card" data-index="${index}">
      <div class="field-grid">
        <div class="form-group">
          <label>${t('templatesPage.fieldKey')}</label>
          <input class="f-key" value="${escapeHtml(name)}" />
        </div>
        <div class="form-group">
          <label>${t('templatesPage.fieldType')}</label>
          <select class="f-type">${typeOptions}</select>
        </div>
        <div class="form-group">
          <label>${t('templatesPage.fieldLabel')}</label>
          <input class="f-label" value="${escapeHtml(field.label || '')}" />
        </div>
        <div class="form-group">
          <label>${t('templatesPage.fieldDefault')}</label>
          <input class="f-default" value="${escapeHtml(
            Array.isArray(field.default) ? field.default.join(', ') : field.default ?? ''
          )}" />
        </div>
        <div class="form-group">
          <label>${t('templatesPage.fieldOptions')}</label>
          <input class="f-options" value="${escapeHtml(options)}" />
        </div>
        <div class="form-group">
          <label>${t('templatesPage.fieldPlaceholder')}</label>
          <input class="f-placeholder" value="${escapeHtml(field.placeholder || '')}" />
        </div>
      </div>
      <label class="check-row">
        <input type="checkbox" class="f-required" ${field.required ? 'checked' : ''} />
        ${t('templatesPage.fieldRequired')}
      </label>
    </div>
  `;
}

function syncFromEditor() {
  if (!activeKey || !draft[activeKey]) return;
  const pane = document.getElementById('editorPane');
  if (mode === 'json') {
    const raw = pane.querySelector('#jsonEditor')?.value;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const [key, value] = Object.entries(parsed)[0] || [];
      if (!key || !value) return;
      if (key !== activeKey) {
        delete draft[activeKey];
        activeKey = key;
      }
      draft[activeKey] = value;
      validateTemplates({ [activeKey]: value });
    } catch {
      /* keep previous draft until save */
    }
    return;
  }

  const keyInput = pane.querySelector('#tplKey');
  if (!keyInput) return;
  const nextKey = keyInput.value.trim() || activeKey;
  const tpl = {
    name: pane.querySelector('#tplName').value.trim(),
    filename: pane.querySelector('#tplFilename').value.trim(),
    fieldOrder: [],
    fields: {}
  };
  pane.querySelectorAll('.field-card').forEach((card) => {
    const name = card.querySelector('.f-key').value.trim();
    if (!name) return;
    const type = card.querySelector('.f-type').value;
    const field = {
      type,
      label: card.querySelector('.f-label').value.trim() || name,
      required: card.querySelector('.f-required').checked
    };
    const def = card.querySelector('.f-default').value;
    const placeholder = card.querySelector('.f-placeholder').value.trim();
    const options = card.querySelector('.f-options').value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (placeholder) field.placeholder = placeholder;
    if (type === 'array') field.default = def ? def.split(',').map((s) => s.trim()).filter(Boolean) : [];
    else if (type === 'checkbox') field.default = def === 'true' || def === '1';
    else if (def !== '') field.default = type === 'number' ? Number(def) : def;
    if (type === 'select' || type === 'radio') field.options = options;
    tpl.fieldOrder.push(name);
    tpl.fields[name] = field;
  });
  if (nextKey !== activeKey) {
    delete draft[activeKey];
    activeKey = nextKey;
  }
  draft[activeKey] = tpl;
}

function addTemplate() {
  syncFromEditor();
  const key = slugifyKey(`template_${Object.keys(draft).length + 1}`);
  draft[key] = {
    name: 'New template',
    filename: 'data-raw/new.json',
    fieldOrder: ['title'],
    fields: { title: { type: 'text', label: 'Title', required: true } }
  };
  selectTemplate(key);
}

function saveAll() {
  syncFromEditor();
  try {
    validateTemplates(draft);
    const ordered = orderTemplates(draft);
    draft = ordered;
    store.setTemplates(ordered, formatTemplatesText(ordered));
    renderList();
    if (activeKey) renderEditor();
    ui.showToast(t('templates.successSave'));
  } catch (err) {
    ui.showToast(`${t('templates.errorFormat')}: ${err.message}`, 'error');
  }
}
