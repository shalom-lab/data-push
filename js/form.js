function generateFormFields(container, template, preset) {
  container.innerHTML = '';
  if (!template?.fieldOrder || !template.fields) return;

  template.fieldOrder.forEach((fieldName) => {
    const field = template.fields[fieldName];
    if (!field) return;
    const presetValue = preset ? preset[fieldName] : undefined;
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = field.label || fieldName;
    if (field.required) {
      const star = document.createElement('span');
      star.className = 'required';
      star.textContent = ' *';
      label.appendChild(star);
    }

    if (field.type === 'textarea') {
      group.appendChild(label);
      const input = document.createElement('textarea');
      input.rows = 4;
      input.id = fieldName;
      input.value = presetValue ?? field.default ?? '';
      group.appendChild(input);
    } else if (field.type === 'select') {
      group.appendChild(label);
      const input = document.createElement('select');
      input.id = fieldName;
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = t('form.pleaseSelect', { field: field.label || fieldName });
      input.appendChild(empty);
      (field.options || []).forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        input.appendChild(option);
      });
      input.value = presetValue ?? field.default ?? '';
      group.appendChild(input);
    } else if (field.type === 'checkbox') {
      const wrap = document.createElement('label');
      wrap.className = 'check-row';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = fieldName;
      input.checked = presetValue ?? field.default ?? false;
      wrap.appendChild(input);
      wrap.appendChild(document.createTextNode(field.label || fieldName));
      if (field.required) {
        const star = document.createElement('span');
        star.className = 'required';
        star.textContent = ' *';
        wrap.appendChild(star);
      }
      group.appendChild(wrap);
    } else if (field.type === 'radio') {
      group.appendChild(label);
      const wrap = document.createElement('div');
      wrap.className = 'radio-group';
      const selected = presetValue ?? field.default ?? '';
      (field.options || []).forEach((opt, index) => {
        const row = document.createElement('label');
        row.className = 'check-row';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = fieldName;
        radio.id = `${fieldName}_${index}`;
        radio.value = opt;
        radio.checked = selected === opt;
        row.appendChild(radio);
        row.appendChild(document.createTextNode(opt));
        wrap.appendChild(row);
      });
      group.appendChild(wrap);
    } else if (field.type === 'array') {
      group.appendChild(label);
      group.appendChild(createArrayField(fieldName, field, presetValue));
    } else {
      group.appendChild(label);
      const input = document.createElement('input');
      input.type = field.type === 'url' ? 'url' : field.type || 'text';
      input.id = fieldName;
      input.value = presetValue ?? field.default ?? '';
      if (field.placeholder) input.placeholder = field.placeholder;
      group.appendChild(input);
    }

    container.appendChild(group);
  });
}

function createArrayField(fieldName, field, presetValue) {
  const wrap = document.createElement('div');
  wrap.className = 'array-wrapper';

  const tags = document.createElement('div');
  tags.className = 'tags-container';

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.id = fieldName;
  hidden.className = 'array-hidden-input';
  const initial = Array.isArray(presetValue)
    ? presetValue
    : Array.isArray(field.default)
      ? field.default
      : [];
  hidden.value = JSON.stringify(initial);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'array-text-input';
  input.placeholder = field.placeholder || t('form.tagPlaceholder');

  const render = () => {
    const list = JSON.parse(hidden.value || '[]');
    tags.innerHTML = '';
    list.forEach((tag) => {
      const el = document.createElement('span');
      el.className = 'tag';
      el.innerHTML = `${escapeHtml(tag)}<button type="button" class="tag-remove" aria-label="remove">×</button>`;
      el.querySelector('.tag-remove').onclick = () => {
        const next = JSON.parse(hidden.value).filter((x) => x !== tag);
        hidden.value = JSON.stringify(next);
        render();
      };
      tags.appendChild(el);
    });
  };

  const addTag = () => {
    const value = input.value.trim();
    if (!value) return;
    const list = JSON.parse(hidden.value || '[]');
    if (!list.includes(value)) {
      list.push(value);
      hidden.value = JSON.stringify(list);
      render();
    }
    input.value = '';
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addTag();
    }
  });

  wrap.appendChild(tags);
  wrap.appendChild(input);
  wrap.appendChild(hidden);
  render();
  return wrap;
}

function collectFormData(template) {
  const data = {};
  for (const fieldName of template.fieldOrder) {
    const field = template.fields[fieldName];
    const required = field.required ?? false;
    let value;

    if (field.type === 'checkbox') {
      const el = document.getElementById(fieldName);
      value = el ? el.checked : false;
    } else if (field.type === 'radio') {
      const checked = document.querySelector(`input[name="${fieldName}"]:checked`);
      value = checked ? checked.value : '';
    } else if (field.type === 'number') {
      const el = document.getElementById(fieldName);
      const raw = el ? el.value : '';
      value = raw === '' ? (field.default ?? '') : Number(raw);
    } else if (field.type === 'array') {
      const hidden = document.getElementById(fieldName);
      try {
        value = JSON.parse(hidden?.value || '[]');
      } catch {
        value = [];
      }
      if (!Array.isArray(value)) value = [];
    } else {
      const el = document.getElementById(fieldName);
      value = el ? el.value : '';
    }

    if (required) {
      const emptyArray = field.type === 'array' && (!Array.isArray(value) || !value.length);
      const emptyScalar = field.type !== 'array' && field.type !== 'checkbox' && (value === '' || value == null);
      if (emptyArray || emptyScalar) {
        throw new Error(t('error.fieldRequired', { field: field.label || fieldName }));
      }
    }
    data[fieldName] = value;
  }
  return data;
}

function resetForm(template) {
  generateFormFields(document.getElementById('formFields'), template);
}
