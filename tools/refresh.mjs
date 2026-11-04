import path from 'node:path';
import { spawnSync } from 'node:child_process';

process.chdir(path.resolve(import.meta.dirname, '..'));
const commands = [
  ['node', ['tools/generate.mjs']],
  ['node', ['tools/map.mjs']],
  ['guidedog', ['build', '-b', 'gettext', 'docs', 'docs/locales/templates', '-W']],
  ['guidedog', ['intl', 'update', '-p', 'docs/locales/templates', '-l', 'zh_CN', '-l', 'hi', '-l', 'ja', '-l', 'ko', '-l', 'de', '-l', 'es', 'docs']],
  ['node', ['tools/generate.mjs', '--sync-po']],
  ['guidedog', ['intl', 'stat', '-l', 'zh_CN', '-l', 'hi', '-l', 'ja', '-l', 'ko', '-l', 'de', '-l', 'es', 'docs']],
];
for (const [program, args] of commands) {
  console.log(`\n${program} ${args.join(' ')}`);
  const result = spawnSync(program, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${program} failed (${result.status}).`);
}
console.log('\nRefreshed the native RST, Guidedog PO catalogs and SVG map inputs.');
