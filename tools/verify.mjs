import fs from 'node:fs';
import path from 'node:path';
import { monetaryValues } from './financial-values.mjs';

const root = path.resolve('docs/_build/site');
const data = JSON.parse(fs.readFileSync('docs/_static/atlas/catalog.json', 'utf8'));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);

const LANGS = ['zh_CN', 'hi', 'ja', 'ko', 'de', 'es'];
const EDITIONS = ['en', 'zh-CN', 'hi', 'ja', 'ko', 'de', 'es'];
const PDF_LANGS = ['en', 'zh_CN', 'hi', 'ja', 'ko', 'de', 'es'];

const report = { translated: 0, missing: [], byLanguage: {} };
const decode = s => s.trim().split('\n').map(line => JSON.parse(line.trim())).join('');

for (const lang of LANGS) {
  let langTranslated = 0;
  for (const file of walk(`docs/locales/${lang}/LC_MESSAGES`).filter(f => f.endsWith('.po'))) {
    const catalog = fs.readFileSync(file, 'utf8');
    check(!/^#, .*\bfuzzy\b/m.test(catalog), `Unreviewed fuzzy translation: ${file}`);
    for (const entry of catalog.matchAll(/msgid ((?:"[^\n]*"\n)+)msgstr ((?:"[^\n]*"(?:\n|$))+)/g)) {
      const id = decode(entry[1]);
      if (!id) continue;
      if (decode(entry[2])) {
        report.translated++;
        langTranslated++;
      } else {
        report.missing.push(`${file}: ${id}`);
      }
    }
  }
  report.byLanguage[lang] = langTranslated;
}

check(data.districts.length === 16, 'The atlas must include 16 districts.');
check(data.license?.name === 'CC BY-SA 4.0', 'The dataset must identify its CC BY-SA license.');
check(Boolean(data.license?.notice && data.license?.exceptions), 'The dataset must identify third-party exceptions.');
check(data.entities.filter(e => e.category === 'University').length === 40, 'The undergraduate directory must contain 40 institutions.');
check(new Set(data.entities.map(e => e.id)).size === data.entities.length, 'Organization IDs must be unique.');
check(new Set(data.funding.map(e => e.id)).size === data.funding.length, 'Funding IDs must be unique.');
check(report.missing.length === 0, `Native translation catalogs have ${report.missing.length} missing messages.`);

for (const e of [...data.entities, ...data.funding]) {
  check(Boolean(e.source?.url?.startsWith('https://')), `Missing cited source: ${e.id}`);
  check(Boolean(e.zh && e.name), `Missing bilingual name: ${e.id}`);
  check(!e.status.toLowerCase().includes('open now'), `Unverified open status: ${e.id}`);
  check(!('email' in e), `Email contact field must not be published: ${e.id}`);
}

const emailAddress = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
for (const file of [...walk('data'), ...walk('docs')].filter(f => !f.includes('/_build/') && !f.includes('/locales/templates/') && /\.(?:rst|po|json|js|html|txt)$/.test(f))) {
  check(!emailAddress.test(fs.readFileSync(file, 'utf8')), `Email address found in publication input: ${file}`);
}

check(fs.existsSync(path.join(root, '.nojekyll')), 'Missing .nojekyll in built site for GitHub Pages.');
check(fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim() === 'bettershanghai.com', 'Incorrect publication domain.');
const entry = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
check(entry.includes('src="language-entry.js" defer'), 'The entry page must load browser-language detection.');
check(!/http-equiv="refresh"/i.test(entry), 'An unconditional refresh would override the browser language.');
check(fs.readFileSync(path.join(root, 'language-entry.js'), 'utf8') === fs.readFileSync('docs/_static/language-entry.js', 'utf8'), 'The published language selector is stale.');
for (const edition of EDITIONS) {
  check(entry.includes(`href="${edition}/index.html"`), `Missing no-JavaScript language choice: ${edition}`);
}
const bookLabels = JSON.parse(fs.readFileSync('docs/_templates/book-labels.json', 'utf8'));
for (const edition of ['en', 'zh', 'hi', 'ja', 'ko', 'de', 'es']) {
  check(Boolean(bookLabels[edition]?.license && bookLabels[edition]?.rights), `Missing book license notice: ${edition}`);
}
const counts = JSON.parse(fs.readFileSync('docs/_templates/coverage.json', 'utf8'));
check(JSON.stringify(counts) === JSON.stringify(data.counts), 'PDF coverage metadata is stale.');
for (const record of data.funding) {
  check(JSON.stringify(monetaryValues(record.amount)) === JSON.stringify(monetaryValues(record.amountZh, 'zh')), `RMB amount differs in Chinese: ${record.id}`);
}
for (const lang of ['hi', 'ja', 'ko', 'de', 'es']) {
  const local = data.i18n[lang];
  for (const record of data.funding) {
    const translated = local.funding[record.id];
    for (const field of ['name', 'amount', 'eligibility', 'deadline']) {
      check(Boolean(translated?.[field]), `Missing ${lang} funding ${field}: ${record.id}`);
    }
    // Currency conversion mistakes change a funding claim, even when a PO is complete.
    check(JSON.stringify(monetaryValues(record.amount)) === JSON.stringify(monetaryValues(translated?.amount || '', lang)), `RMB amount differs in ${lang}: ${record.id}`);
  }
  for (const record of data.entities) {
    check(Boolean(local.entities[record.id]?.name && local.entities[record.id]?.summary), `Missing ${lang} organization: ${record.id}`);
  }
}

let htmlCount = 0, links = 0;
for (const edition of EDITIONS) {
  const directory = path.join(root, edition);
  check(fs.existsSync(directory), `Missing edition directory: ${edition}`);
  if (!fs.existsSync(directory)) continue;
  for (const e of [...data.entities, ...data.funding]) {
    check(fs.existsSync(path.join(directory, e.url)), `Missing ${edition} profile: ${e.url}`);
  }
  for (const lang of PDF_LANGS) {
    const pdf = path.join(directory, `shanghai-ecosystem-atlas-${lang}.pdf`);
    check(fs.existsSync(pdf), `Missing ${edition} book download: ${lang}`);
    if (fs.existsSync(pdf)) {
      check(fs.readFileSync(pdf).subarray(0, 5).toString() === '%PDF-', `Invalid PDF: ${pdf}`);
    }
  }
  for (const file of walk(directory).filter(f => f.endsWith('.html'))) {
    htmlCount++;
    const text = fs.readFileSync(file, 'utf8');
    check(!emailAddress.test(text), `Email address found in published page: ${file}`);
    check(!text.includes('{{ '), `Unrendered template: ${file}`);
    check(text.includes('rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/"'), `Missing CC BY-SA notice: ${file}`);
    check(!text.includes('src="language-entry.js"'), `Explicit language pages must not redirect: ${file}`);
    check((text.match(/class="gd-language"/g) || []).length === 1, `Expected one language menu: ${file}`);
    for (const folder of EDITIONS) {
      const relativePage = path.relative(directory, file).replaceAll(path.sep, '/');
      check(text.includes(`https://bettershanghai.com/${folder}/${relativePage}`), `Missing language alternate ${folder}: ${file}`);
    }
    for (const match of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = match[1].replaceAll('&amp;', '&');
      if (!url || url.startsWith('#') || /^(https?:|mailto:|data:|javascript:)/.test(url)) continue;
      let p;
      try { p = decodeURIComponent(url.split(/[?#]/)[0]); } catch { failures.push(`Invalid link encoding: ${url}`); continue; }
      const target = path.resolve(path.dirname(file), p);
      links++;
      check(fs.existsSync(target), `Broken local link in ${path.relative(root, file)}: ${url}`);
    }
  }
}

const result = {
  checked: new Date().toISOString(),
  editions: EDITIONS.length,
  languages: ['en', ...LANGS],
  htmlPages: htmlCount,
  localLinksChecked: links,
  organizations: data.entities.length,
  fundingRoutes: data.funding.length,
  citedSources: data.sources.length,
  translatedMessages: report.translated,
  translatedByLanguage: report.byLanguage,
  failures
};
fs.writeFileSync('data/verification-report.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
