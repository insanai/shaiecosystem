import fs from 'node:fs';
import {districts} from '../data/catalog.mjs';
const geo=JSON.parse(fs.readFileSync('data/shanghai-districts.geojson','utf8'));
const projection=([lon,lat])=>[(lon-120.84)*580+18,(31.90-lat)*660+20];
const ringPath=ring=>ring.map((p,i)=>`${i?'L':'M'}${projection(p).map(x=>x.toFixed(1)).join(',')}`).join(' ')+'Z';
const shape=f=>(f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates]).map(poly=>poly.map(ringPath).join(' ')).join(' ');
const color=['#d3dfcf','#c6d7c2','#e0e5d8','#b8cdb9'];
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="900" viewBox="0 0 1100 900"><rect width="1100" height="900" fill="#f8f7f2"/><g>';
for(const [i,f]of geo.features.entries())svg+=`<path d="${shape(f)}" fill="${color[i%4]}" stroke="#f8f7f2" stroke-width="2"/>`;
svg+='</g><path d="M54 80 L54 30 L47 48 M54 30 L61 48" fill="none" stroke="#315b50"/><text x="50" y="20" font-size="12" fill="#315b50">N</text>';
for(const [i,d]of districts.entries()){
 const f=geo.features.find(f=>f.properties.name===d.zh);
 const [x,y]=projection(f.properties.center);
 svg+=`<circle cx="${x}" cy="${y}" r="8" fill="#315b50" stroke="#faf8f2"/><text x="${x}" y="${y+3}" text-anchor="middle" font-size="8" fill="#ffffff" font-family="sans-serif">${i+1}</text>`;
 const ly=100+i*38;
 svg+=`<text x="790" y="${ly}" fill="#a88b53" font-size="11" font-family="sans-serif">${String(i+1).padStart(2,'0')}</text><text x="825" y="${ly}" fill="#263b36" font-size="14" font-family="sans-serif">${d.name} / ${d.zh}</text>`;
}
svg+='<text x="790" y="55" fill="#315b50" font-size="18" font-family="serif">Shanghai / 上海</text><text x="790" y="78" fill="#68746d" font-size="10">16 DISTRICTS / 十六区</text><text x="30" y="854" fill="#68746d" font-size="10">Illustrative district anchors, not office locations. / 区级锚点，不代表办公地点。</text><text x="30" y="874" fill="#68746d" font-size="9">Boundary source: DataV. Not for navigation or legal boundary determination. / 区界来源：DataV，仅供示意。</text></svg>';
fs.writeFileSync('docs/_static/atlas/shanghai-map.svg',svg);
const logo='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><g fill="#faf8f2" stroke="#a88b53" stroke-width="1.1"><ellipse cx="40" cy="27" rx="10" ry="22"/><ellipse cx="40" cy="27" rx="10" ry="22" transform="rotate(60 40 40)"/><ellipse cx="40" cy="27" rx="10" ry="22" transform="rotate(120 40 40)"/><ellipse cx="40" cy="27" rx="10" ry="22" transform="rotate(180 40 40)"/><ellipse cx="40" cy="27" rx="10" ry="22" transform="rotate(240 40 40)"/><ellipse cx="40" cy="27" rx="10" ry="22" transform="rotate(300 40 40)"/></g><circle cx="40" cy="40" r="6" fill="#a88b53"/><circle cx="40" cy="40" r="2.5" fill="#315b50"/></svg>';
fs.writeFileSync('docs/_static/atlas/magnolia.svg',logo);
console.log('Created print map and magnolia mark.');
