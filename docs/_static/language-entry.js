/* Only the language-neutral entry page loads this script. Edition URLs stay explicit. */
(() => {
  const folders = new Map([
    ['en', 'en'], ['zh', 'zh-CN'], ['hi', 'hi'], ['ja', 'ja'],
    ['ko', 'ko'], ['de', 'de'], ['es', 'es'],
  ]);
  const match = value => typeof value === 'string'
    ? folders.get(value.trim().toLowerCase().split(/[-_]/)[0]) : undefined;
  let saved;
  try { saved = match(localStorage.getItem('shanghai-atlas-language')); } catch {}
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  const folder = saved || preferred.map(match).find(Boolean) || 'en';
  const target = new URL(`${folder}/index.html`, location.href);
  target.search = location.search;
  target.hash = location.hash;
  location.replace(target.href);
})();
