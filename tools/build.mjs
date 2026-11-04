import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);

const run = (program, args, quiet = false) => {
  console.log(`\n${program} ${args.join(' ')}`);
  const r = spawnSync(program, args, { stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit', encoding: 'utf8' });
  if (r.status !== 0) {
    if (quiet) console.error(r.stdout, r.stderr);
    throw new Error(`${program} failed (${r.status}): ${r.error || ''}`);
  }
};

const EDITIONS = [
  ['en', 'en'],
  ['zh_CN', 'zh-CN'],
  ['hi', 'hi'],
  ['ja', 'ja'],
  ['ko', 'ko'],
  ['de', 'de'],
  ['es', 'es'],
];

fs.mkdirSync('docs/downloads', { recursive: true });
for (const [lang] of EDITIONS) {
  run('guidedog', ['build', '-b', 'pdf', 'docs', `docs/_build/pdf/${lang}`, '-D', `language=${lang}`, '-W', '-a']);
}
for (const [lang] of EDITIONS) {
  const dir = `docs/_build/pdf/${lang}`;
  const pdf = fs.readdirSync(dir).find(x => x.endsWith('.pdf'));
  if (!pdf) throw new Error(`PDF missing for ${lang}`);
  fs.copyFileSync(path.join(dir, pdf), `docs/downloads/shanghai-ecosystem-atlas-${lang}.pdf`);
}
const baseUrl = process.env.PAGES_BASE_URL || '';
for (const [lang, folder] of EDITIONS) {
  const args = ['build', '-b', 'html', 'docs', `docs/_build/site/${folder}`, '-D', `language=${lang}`, '-D', 'html_context.assembled_site=true', '-W', '-a'];
  if (baseUrl) args.push('-D', `html_baseurl=${baseUrl.replace(/\/$/, '')}/${folder}/`);
  run('guidedog', args);
}
fs.copyFileSync('docs/_templates/language-entry.html', 'docs/_build/site/index.html');
fs.copyFileSync('docs/_static/language-entry.js', 'docs/_build/site/language-entry.js');
fs.writeFileSync('docs/_build/site/.nojekyll', '');
fs.writeFileSync('docs/_build/site/CNAME', 'bettershanghai.com\n');
console.log('\nBuilt all 7 PDF books and all 7 website editions in docs/_build/site/.');
