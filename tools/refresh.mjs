import path from 'node:path';
import {spawnSync} from 'node:child_process';

process.chdir(path.resolve(import.meta.dirname,'..'));
const commands=[
 ['node',['tools/generate.mjs']],
 ['node',['tools/map.mjs']],
 ['guidedog',['build','-b','gettext','docs','docs/locales/templates','-W']],
 ['guidedog',['intl','update','-p','docs/locales/templates','-l','zh_CN','docs']],
 ['node',['tools/translate.mjs']],
];
for(const [program,args]of commands){
 console.log(`\n${program} ${args.join(' ')}`);
 const result=spawnSync(program,args,{stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)throw new Error(`${program} failed (${result.status}).`);
}
console.log('\nRefreshed the native RST, PO and map inputs. Review and commit the changes before publishing.');
