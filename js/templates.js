const DEFAULT_TEMPLATES = {
  'my-project': {
    name: '🚀 我的项目',
    filename: 'data-raw/projects.json',
    fieldOrder: ['title', 'link', 'description', 'category', 'tags'],
    fields: {
      title: { type: 'text', label: '项目名称', required: true },
      link: { type: 'url', label: '项目链接', required: false },
      description: { type: 'textarea', label: '项目描述', required: true },
      category: { type: 'text', label: '项目分类', required: false },
      tags: {
        type: 'array',
        label: '标签',
        placeholder: '输入后按回车或空格',
        default: [],
        required: false
      }
    }
  },
  field_types: {
    name: '🔎 模板示例',
    filename: 'data-raw/examples.json',
    fieldOrder: [
      'text_example',
      'textarea_example',
      'select_example',
      'date_example',
      'number_example',
      'checkbox_example',
      'radio_example',
      'array_example'
    ],
    fields: {
      text_example: { type: 'text', label: '文本输入', default: '默认文本', required: true },
      textarea_example: {
        type: 'textarea',
        label: '多行文本',
        default: '默认多行\n文本内容',
        required: true
      },
      select_example: {
        type: 'select',
        label: '下拉选择',
        options: ['选项A', '选项B', '选项C'],
        default: '选项B',
        required: true
      },
      date_example: { type: 'date', label: '日期选择', required: false },
      number_example: { type: 'number', label: '数字输入', required: false },
      checkbox_example: { type: 'checkbox', label: '是否启用', default: false, required: false },
      radio_example: {
        type: 'radio',
        label: '选择性别',
        options: ['男', '女', '其他'],
        default: '男',
        required: true
      },
      array_example: {
        type: 'array',
        label: '标签',
        placeholder: '输入后按回车或空格',
        default: [],
        required: true
      }
    }
  }
};

const FIELD_TYPES = [
  'text',
  'textarea',
  'url',
  'select',
  'date',
  'number',
  'checkbox',
  'radio',
  'array'
];

function getTemplates() {
  return store.templates && Object.keys(store.templates).length
    ? store.templates
    : structuredClone(DEFAULT_TEMPLATES);
}

function orderTemplates(templates) {
  const ordered = {};
  Object.keys(templates).forEach((key) => {
    const tpl = templates[key];
    const fieldOrder = Array.isArray(tpl.fieldOrder)
      ? tpl.fieldOrder
      : Object.keys(tpl.fields || {});
    ordered[key] = {
      name: tpl.name,
      filename: tpl.filename,
      fieldOrder,
      fields: {}
    };
    fieldOrder.forEach((fieldName) => {
      if (tpl.fields?.[fieldName]) {
        ordered[key].fields[fieldName] = tpl.fields[fieldName];
      }
    });
  });
  return ordered;
}

function validateTemplates(templates) {
  if (!templates || typeof templates !== 'object' || Array.isArray(templates)) {
    throw new Error('ROOT');
  }
  for (const [key, template] of Object.entries(templates)) {
    if (!template.name || typeof template.name !== 'string') {
      throw new Error(`Template ${key} missing name`);
    }
    if (!template.filename || typeof template.filename !== 'string') {
      throw new Error(`Template ${key} missing filename`);
    }
    if (!template.fields || typeof template.fields !== 'object') {
      throw new Error(`Template ${key} missing fields`);
    }
    if (!template.fieldOrder || !Array.isArray(template.fieldOrder)) {
      template.fieldOrder = Object.keys(template.fields);
    }
    for (const fieldName of template.fieldOrder) {
      if (!template.fields[fieldName]) {
        throw new Error(`Template ${key} fieldOrder has unknown field: ${fieldName}`);
      }
    }
    for (const fieldName of Object.keys(template.fields)) {
      if (!template.fieldOrder.includes(fieldName)) {
        throw new Error(`Template ${key} field ${fieldName} not in fieldOrder`);
      }
      const field = template.fields[fieldName];
      if (!FIELD_TYPES.includes(field.type)) {
        throw new Error(`Template ${key} field ${fieldName} has invalid type: ${field.type}`);
      }
      if ((field.type === 'select' || field.type === 'radio') && !Array.isArray(field.options)) {
        throw new Error(`Template ${key} field ${fieldName} needs options`);
      }
    }
  }
  return true;
}

function formatJSON(obj, indent = 2) {
  if (typeof obj !== 'object' || obj === null) return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    if (!obj.length) return '[]';
    const items = obj.map((item) => formatJSON(item, indent)).join(',\n' + ' '.repeat(indent));
    return `[\n${' '.repeat(indent)}${items}\n${' '.repeat(Math.max(0, indent - 2))}]`.replace(
      /\n +\]$/,
      '\n]'
    );
  }

  const isTemplate = obj.name && obj.filename && obj.fieldOrder && obj.fields;
  const keys = isTemplate ? ['name', 'filename', 'fieldOrder', 'fields'] : Object.keys(obj);
  let result = '{\n';
  keys.forEach((key, index) => {
    if (!(key in obj)) return;
    const comma = index < keys.length - 1 ? ',' : '';
    if (key === 'fields' && isTemplate) {
      result += `${' '.repeat(indent)}"${key}": {\n`;
      obj.fieldOrder.forEach((fieldName, fieldIndex) => {
        if (!obj.fields[fieldName]) return;
        const fieldComma = fieldIndex < obj.fieldOrder.length - 1 ? ',' : '';
        result += `${' '.repeat(indent * 2)}"${fieldName}": ${formatJSON(
          obj.fields[fieldName],
          indent * 2
        )}${fieldComma}\n`;
      });
      result += `${' '.repeat(indent)}}${comma}\n`;
    } else {
      result += `${' '.repeat(indent)}"${key}": ${formatJSON(obj[key], indent)}${comma}\n`;
    }
  });
  result += '}';
  return result;
}

function formatTemplatesText(templates) {
  const entries = Object.entries(templates);
  let out = '{\n';
  entries.forEach(([key, value], index) => {
    const comma = index < entries.length - 1 ? ',' : '';
    out += `  "${key}": ${formatJSON(value, 4).replace(/\n/g, '\n  ')}${comma}\n`;
  });
  out += '}';
  return out;
}

function slugifyKey(name) {
  const ascii = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ascii || `template_${Date.now().toString(36)}`;
}
