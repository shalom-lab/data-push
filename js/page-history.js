document.addEventListener('DOMContentLoaded', async () => {
  await GDP.boot('history');
  document.getElementById('clearHistory').onclick = async () => {
    if (!store.history.length) return;
    if (await ui.confirm(t('historyPage.clear'))) {
      store.clearHistory();
      renderHistory();
    }
  };
  renderHistory();
});

document.addEventListener('gdp:langchange', renderHistory);

function renderHistory() {
  const box = document.getElementById('historyList');
  if (!store.history.length) {
    box.innerHTML = `<div class="empty-state"><h2>${t('historyPage.empty')}</h2></div>`;
    return;
  }
  box.innerHTML = store.history
    .map(
      (item) => `
      <article class="card history-card">
        <time>${escapeHtml(item.time || '')}</time>
        <h3>${escapeHtml(item.templateName || item.templateKey || '')}</h3>
        <p>${t('historyPage.repo')}: ${escapeHtml(item.repo || '')}${
          item.branch ? ` @ ${escapeHtml(item.branch)}` : ''
        }</p>
        <p class="path-box">${escapeHtml(item.filename || '')}</p>
        <pre class="preview-block">${escapeHtml(JSON.stringify(item.data, null, 2))}</pre>
        <div class="history-actions">
          <button type="button" class="btn btn-sm" data-reuse="${item.id}">${t('historyPage.reuse')}</button>
          ${
            item.htmlUrl
              ? `<a class="btn btn-sm btn-ghost" target="_blank" rel="noreferrer" href="${escapeHtml(item.htmlUrl)}">${t('historyPage.open')}</a>`
              : ''
          }
          <button type="button" class="btn btn-sm btn-danger" data-del="${item.id}">${t('historyPage.remove')}</button>
        </div>
      </article>`
    )
    .join('');

  box.querySelectorAll('[data-reuse]').forEach((btn) => {
    btn.onclick = () => {
      const item = store.history.find((h) => h.id === btn.dataset.reuse);
      if (!item) return;
      sessionStorage.setItem('gdp_reuse', JSON.stringify(item));
      location.href = 'push.html';
    };
  });
  box.querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = () => {
      store.removeHistory(btn.dataset.del);
      renderHistory();
    };
  });
}
