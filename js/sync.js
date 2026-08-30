const templateSync = {
  configured() {
    return !!(store.token && store.prefs.templateRepo && store.prefs.templatePath);
  },

  destLabel() {
    const { templateRepo, templatePath, templateBranch } = store.prefs;
    if (!templateRepo || !templatePath) return '';
    return templateBranch
      ? `${templateRepo}/${templatePath}@${templateBranch}`
      : `${templateRepo}/${templatePath}`;
  },

  async pull() {
    if (!this.configured()) throw new Error('NO_SYNC');
    const file = await github.getFile(
      store.prefs.templateRepo,
      store.prefs.templatePath,
      store.prefs.templateBranch || undefined
    );
    if (!file) return { missing: true, templates: null, htmlUrl: '' };
    const parsed = JSON.parse(github.decodeContent(file));
    validateTemplates(parsed);
    const ordered = orderTemplates(parsed);
    store.setTemplates(ordered, formatTemplatesText(ordered));
    return { missing: false, templates: ordered, htmlUrl: file.html_url || '' };
  },

  async push(templates) {
    if (!this.configured()) throw new Error('NO_SYNC');
    const ordered = orderTemplates(templates);
    validateTemplates(ordered);
    const text = formatTemplatesText(ordered);
    const result = await github.putFile(
      store.prefs.templateRepo,
      store.prefs.templatePath,
      text,
      'Update Data Push templates',
      store.prefs.templateBranch || undefined
    );
    store.setTemplates(ordered, text);
    return {
      htmlUrl: result?.content?.html_url || '',
      templates: ordered
    };
  }
};
