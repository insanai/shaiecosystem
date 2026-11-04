import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script = fs.readFileSync(new URL('../docs/_static/language-entry.js', import.meta.url), 'utf8');
function route(languages, saved, { blocked = false, base = 'https://bettershanghai.com/?q=robot#map', language } = {}) {
  let result;
  const url = new URL(base);
  vm.runInNewContext(script, {
    URL,
    navigator: { languages, language },
    localStorage: { getItem() { if (blocked) throw new Error('Storage disabled'); return saved; } },
    location: { href: url.href, search: url.search, hash: url.hash, replace(value) { result = value; } },
  });
  return new URL(result);
}
for (const [tag, folder] of Object.entries({ 'en-US': 'en', 'zh-CN': 'zh-CN', 'zh-SG': 'zh-CN', 'zh-TW': 'zh-CN', 'hi-IN': 'hi', 'ja-JP': 'ja', 'ko-KR': 'ko', 'de-AT': 'de', 'es-MX': 'es' })) {
  const result = route([tag]);
  assert.equal(result.pathname, `/${folder}/index.html`);
  assert.equal(result.search, '?q=robot');
  assert.equal(result.hash, '#map');
}
assert.equal(route(['fr-FR', 'de-DE', 'en']).pathname, '/de/index.html');
assert.equal(route(['fr-FR']).pathname, '/en/index.html');
assert.equal(route(['zh-CN'], 'ja').pathname, '/ja/index.html');
assert.equal(route(['en'], 'zh_CN').pathname, '/zh-CN/index.html');
assert.equal(route(['ko'], 'invalid').pathname, '/ko/index.html');
assert.equal(route(['es'], null, { blocked: true }).pathname, '/es/index.html');
assert.equal(route(undefined, null, { language: 'hi-IN' }).pathname, '/hi/index.html');
assert.equal(route([], null, { language: 'ja-JP', base: 'https://example.org/shaiecosystem/index.html' }).pathname, '/shaiecosystem/ja/index.html');
console.log('Language entry: regional matching, preference order, saved choices, storage failures, fallback and URL preservation passed.');
