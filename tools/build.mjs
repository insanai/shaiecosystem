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
fs.writeFileSync(
  'docs/_build/site/index.html',
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=en/index.html"><title>Shanghai Ecosystem Atlas</title><p><a href="en/index.html">English</a> / <a href="zh-CN/index.html" lang="zh-CN">简体中文</a> / <a href="hi/index.html" lang="hi">हिन्दी</a> / <a href="ja/index.html" lang="ja">日本語</a> / <a href="ko/index.html" lang="ko">한국어</a> / <a href="de/index.html" lang="de">Deutsch</a> / <a href="es/index.html" lang="es">Español</a></p></html>\n'
);
fs.writeFileSync('docs/_build/site/.nojekyll', '');
console.log('\nBuilt all 7 PDF books and all 7 website editions in docs/_build/site/.');
