document.addEventListener('DOMContentLoaded', async () => {
  await GDP.boot('docs');
  showDocsLang();
  document.addEventListener('gdp:langchange', showDocsLang);
});

function showDocsLang() {
  const zh = store.language === 'zh';
  document.getElementById('docsZh').hidden = !zh;
  document.getElementById('docsEn').hidden = zh;
}
