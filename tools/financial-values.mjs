// Normalize RMB amounts across the publication's numeric and currency conventions.
export function monetaryValues(text,lang='en') {
 const factors={bn:1e9,m:1e6,million:1e6,'Mio.':1e6,'Mrd.':1e9,millones:1e6,'millón':1e6,mil:1e3,'मिलियन':1e6,'लाख':1e5,'करोड़':1e7,'万':1e4,'亿':1e8,'億':1e8,'만':1e4,'억':1e8};
 const number=s=>{
  s=s.replaceAll(/\s/g,'');
  if(['de','es'].includes(lang))s=s.replaceAll('.','').replace(',','.');else s=s.replaceAll(',','');
  return Number(s);
 };
 const patterns=[/RMB\s*([\d][\d,.]*)(?:\s*(bn\b|m\b|million\b|मिलियन))?/g,/([\d][\d.,]*)(?:\s*(Mio\.|Mrd\.|millones|millón|mil|million|मिलियन|लाख|करोड़))?(?:\s+de)?\s+RMB/g,/([\d][\d.,]*)\s*(万|亿|億|만|억)?\s*(?:元|위안)/g];
 const found=[];for(const p of patterns)for(const m of text.matchAll(p))found.push(number(m[1])*(factors[m[2]]||1));return found.sort((a,b)=>a-b);
}
