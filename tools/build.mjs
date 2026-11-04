import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const run=(program,args,quiet=false)=>{
 console.log(`\n${program} ${args.join(' ')}`);
 const r=spawnSync(program,args,{stdio:quiet?['ignore','pipe','pipe']:'inherit',encoding:'utf8'});
 if(r.status!==0){if(quiet)console.error(r.stdout,r.stderr);throw new Error(`${program} failed (${r.status}): ${r.error||''}`);}
};
run('node',['tools/generate.mjs']);run('node',['tools/map.mjs']);
run('guidedog',['build','-b','gettext','docs','docs/locales/templates','-W']);
run('guidedog',['intl','update','-p','docs/locales/templates','-l','zh_CN','docs'],true);
run('node',['tools/translate.mjs']);
for(const lang of ['en','zh_CN']){
 run('guidedog',['build','-b','pdf','docs',`docs/_build/pdf/${lang}`,'-D',`language=${lang}`,'-W','--budget=2048']);
}
for(const lang of ['en','zh_CN']){
 const dir=`docs/_build/pdf/${lang}`;
 const pdf=fs.readdirSync(dir).find(x=>x.endsWith('.pdf'));
 if(!pdf)throw new Error(`PDF missing for ${lang}`);
 fs.copyFileSync(path.join(dir,pdf),`docs/downloads/shanghai-ecosystem-atlas-${lang}.pdf`);
}
for(const [lang,folder]of [['en','en'],['zh_CN','zh-CN']]){
 run('guidedog',['build','-b','html','docs',`docs/_build/site/${folder}`,'-D',`language=${lang}`,'-W']);
}
fs.writeFileSync('docs/_build/site/index.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=en/index.html"><title>Shanghai Ecosystem Atlas</title><p><a href="en/index.html">English</a> / <a href="zh-CN/index.html" lang="zh-CN">简体中文</a></p></html>\n');
console.log('\nBuilt both books and both website editions in docs/_build/.');
