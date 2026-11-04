import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('docs/_build/site');
const data=JSON.parse(fs.readFileSync('docs/_static/atlas/catalog.json','utf8'));
const report=JSON.parse(fs.readFileSync('data/translation-report.json','utf8'));
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};
check(data.districts.length===16,'The atlas must include 16 districts.');
check(data.entities.filter(e=>e.category==='University').length===40,'The undergraduate directory must contain 40 institutions.');
check(new Set(data.entities.map(e=>e.id)).size===data.entities.length,'Organization IDs must be unique.');
check(new Set(data.funding.map(e=>e.id)).size===data.funding.length,'Funding IDs must be unique.');
check(report.missing.length===0,'Native translation catalogs have missing messages.');
for(const e of [...data.entities,...data.funding]){
 check(Boolean(e.source?.url?.startsWith('https://')),`Missing cited source: ${e.id}`);
 check(Boolean(e.zh&&e.name),`Missing bilingual name: ${e.id}`);
 check(!e.status.toLowerCase().includes('open now'),`Unverified open status: ${e.id}`);
}
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
let htmlCount=0,links=0;
for(const edition of ['en','zh-CN']){
 const directory=path.join(root,edition);
 for(const e of [...data.entities,...data.funding])check(fs.existsSync(path.join(directory,e.url)),`Missing ${edition} profile: ${e.url}`);
 for(const lang of ['en','zh_CN']){
  const pdf=path.join(directory,`shanghai-ecosystem-atlas-${lang}.pdf`);
  check(fs.existsSync(pdf),`Missing ${edition} book download: ${lang}`);
  if(fs.existsSync(pdf))check(fs.readFileSync(pdf).subarray(0,5).toString()==='%PDF-',`Invalid PDF: ${pdf}`);
 }
 for(const file of walk(directory).filter(f=>f.endsWith('.html'))){
  htmlCount++;const text=fs.readFileSync(file,'utf8');
  check(!text.includes('{{ '),`Unrendered template: ${file}`);
  for(const match of text.matchAll(/(?:href|src)="([^"]+)"/g)){
   const url=match[1].replaceAll('&amp;','&');
   if(!url||url.startsWith('#')||/^(https?:|mailto:|data:|javascript:)/.test(url))continue;
   let p;try{p=decodeURIComponent(url.split(/[?#]/)[0]);}catch{failures.push(`Invalid link encoding: ${url}`);continue;}
   const target=path.resolve(path.dirname(file),p);links++;
   check(fs.existsSync(target),`Broken local link in ${path.relative(root,file)}: ${url}`);
  }
 }
}
const result={checked:new Date().toISOString(),editions:2,htmlPages:htmlCount,localLinksChecked:links,organizations:data.entities.length,fundingRoutes:data.funding.length,citedSources:data.sources.length,translatedMessages:report.translated,failures};
fs.writeFileSync('data/verification-report.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
