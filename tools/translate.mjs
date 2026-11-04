import fs from 'node:fs';
import path from 'node:path';
const pairs=JSON.parse(fs.readFileSync('data/translation-pairs.json','utf8'));
const normalized=new Map(Object.entries(pairs).map(([k,v])=>[k.replace(/\s+/g,' ').trim(),v]));
const missing=new Set();let count=0,files=0;
function visit(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?visit(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function decode(s){return s.trim().split('\n').map(l=>JSON.parse(l.trim())).join('');}
for(const file of visit('docs/locales/zh_CN/LC_MESSAGES').filter(f=>f.endsWith('.po'))){
 let raw=fs.readFileSync(file,'utf8');
 let fileMissing=false;
 raw=raw.replace(/msgid ((?:"[^\n]*"\n)+)msgstr ((?:"[^\n]*"(?:\n|$))+)/g,(all,idRaw,strRaw)=>{
  const id=decode(idRaw);
  if(!id)return all.replace('PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE','PO-Revision-Date: 2026-11-04 00:00+0000').replace('Last-Translator: FULL NAME <EMAIL@ADDRESS>','Last-Translator: Shanghai Ecosystem Atlas').replace('Language-Team: LANGUAGE <LL@li.org>','Language-Team: Simplified Chinese');
  const translated=pairs[id]??normalized.get(id.replace(/\s+/g,' ').trim());
  if(translated===undefined){missing.add(id);fileMissing=true;return all;}
  count++;return `msgid ${idRaw}msgstr ${JSON.stringify(translated)}\n`;
 });
 if(!fileMissing){
  // Exact translations from the bilingual records replace gettext's fuzzy matches.
  raw=raw.replace(/^#, (.*)$/gm,(_,flags)=>{
   const retained=flags.split(',').map(s=>s.trim()).filter(s=>s!=='fuzzy');
   return retained.length?'#, '+retained.join(', '):'';
  });
 }
 raw=raw.replace('# SOME DESCRIPTIVE TITLE.','# Simplified Chinese translation of the Shanghai Ecosystem Atlas.')
  .replace('# FIRST AUTHOR <EMAIL@ADDRESS>, YEAR.\n','');
 fs.writeFileSync(file,raw.replace(/\n+$/,'\n'));files++;
}
fs.writeFileSync('data/translation-report.json',JSON.stringify({language:'zh_CN',files,translated:count,missing:[...missing]},null,2)+'\n');
console.log(`Translated ${count} messages across ${files} native Guidedog PO catalogs; ${missing.size} missing.`);
if(missing.size){console.log([...missing].slice(0,15));process.exitCode=1;}
