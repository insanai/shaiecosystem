import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('docs/_build/site');
const port=Number(process.env.PORT||8123);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf'};
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 let file=path.resolve(root,'.'+pathname);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Shanghai Atlas: http://127.0.0.1:${port}/en/index.html`));
