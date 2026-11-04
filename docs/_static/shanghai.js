/* Local, dependency-free interactions. The research data is shared by both languages. */
document.addEventListener('DOMContentLoaded',()=>{
 const data=window.SHANGHAI_ATLAS;
 if(!data)return;
 const zh=document.documentElement.lang.startsWith('zh');
 const t=(en,cn)=>zh?cn:en;
 const base=document.body.dataset.base||'';
 const label=s=>zh?(data.labels[s]||s):s;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const name=e=>zh?e.zh:e.name;
 document.querySelectorAll('[data-stat]').forEach(el=>el.textContent=data.counts[el.dataset.stat]);
 const mount=document.querySelector('#atlas-app');if(!mount)return;
 const params=new URLSearchParams(location.search);
 const state={mode:params.get('mode')==='funding'?'funding':'entities',district:params.get('district')||'',q:params.get('q')||'',type:params.get('type')||'',sector:params.get('sector')||'',equity:params.get('equity')||'',savedOnly:false};
 if(!data.districts.some(d=>d.id===state.district)&&state.district!=='citywide')state.district='';
 let saved=new Set();try{saved=new Set(JSON.parse(localStorage.getItem('shanghai-atlas-shortlist')||'[]'));}catch{}
 let view='0 0 800 900';
 mount.innerHTML=`<div class="atlas-tabs" role="tablist" aria-label="${t('Directory view','目录视图')}"><button role="tab" data-mode="entities">${t('Organizations','机构')}</button><button role="tab" data-mode="funding">${t('Funding pathways','资金路径')}</button><button role="tab" data-mode="saved">${t('My shortlist','我的清单')} <span id="saved-count"></span></button></div>
 <div class="atlas-toolbar"><label class="search-label">${t('SEARCH THE ECOSYSTEM','搜索创新生态')}<input type="search" id="atlas-search" placeholder="${t('Try robotics, Fudan, 模速空间...','搜索机器人、复旦、模速空间等')}" value="${esc(state.q)}"></label><label>${t('DISTRICT','行政区')}<select id="district-filter"><option value="">${t('All 16 districts','全部16区')}</option><option value="citywide">${t('Citywide / global','全市／全球')}</option>${data.districts.map(d=>`<option value="${d.id}">${esc(name(d))}</option>`).join('')}</select></label><label>${t('TYPE / MECHANISM','类型／机制')}<select id="type-filter"></select></label><label>${t('AI / INDUSTRY FOCUS','人工智能／产业方向')}<select id="sector-filter"><option value="">${t('All focus areas','全部方向')}</option>${[...new Set(data.entities.flatMap(e=>e.sectors))].sort().map(s=>`<option value="${esc(s)}">${esc(label(s))}</option>`).join('')}</select></label></div>
 <div class="atlas-workspace"><div class="atlas-map-panel"><div class="map-topbar"><span>${t('SHANGHAI / 16 DISTRICTS','上海／十六区')}</span><div class="map-controls"><button id="map-all">${t('City','全市')}</button><button id="map-core">${t('Core','城区')}</button><button id="map-in" aria-label="${t('Zoom in','放大')}">+</button><button id="map-out" aria-label="${t('Zoom out','缩小')}">-</button></div></div><div class="map-canvas"><svg id="shanghai-map" viewBox="${view}" role="img" aria-label="${t('Interactive Shanghai district map. Select a district or use the district dropdown.','上海行政区交互地图，可点击选区或使用下拉框。')}"><g id="district-shapes"></g><g id="district-labels"></g><g id="entity-pins"></g><text x="50" y="80" fill="#315b50" font-size="15">N &#8593;</text></svg></div><div class="map-detail" id="map-detail"></div><div class="mobile-districts">${data.districts.map(d=>`<button data-district="${d.id}">${esc(name(d))}</button>`).join('')}</div><div class="map-legend">${t('District shapes and pins are illustrative. District anchors are not office locations; street-based pins are approximate. Global programs are not mapped as Shanghai offices.','行政区及标点仅供示意。区级锚点不是办公地点，有街道信息的标点仍为近似。全球计划不标作上海办公室。')}<br><a href="https://geo.datav.aliyun.com/areas_v3/bound/310000_full.json">${t('Boundary source: DataV','区界来源：DataV')}</a></div></div><div><div class="results-topbar"><span id="results-count" role="status"></span><div><button class="quiet-button" id="reset-filters">${t('Reset','重置')}</button> <button class="quiet-button" id="export-results">${t('Export CSV','导出CSV')}</button></div></div><div id="atlas-results" class="atlas-results"></div></div></div><p class="atlas-note">${t('Research checked 4 November 2026. Published policies and program announcements are not evidence of an open application window. Saved selections remain in this browser.','研究核对日期为2026年11月4日。政策与启动公告不能证明申报正在开放。收藏清单仅保存在本浏览器。')}</p>`;
 const search=mount.querySelector('#atlas-search');
 const districtSelect=mount.querySelector('#district-filter');
 const typeSelect=mount.querySelector('#type-filter');
 const sectorSelect=mount.querySelector('#sector-filter');
 const svg=mount.querySelector('#shanghai-map');
 const ns='http://www.w3.org/2000/svg';
 const project=([lon,lat])=>[(lon-120.84)*580+18,(31.90-lat)*660+20];
 const ring=r=>r.map((p,i)=>`${i?'L':'M'}${project(p).join(',')}`).join(' ')+'Z';
 const features=window.SHANGHAI_GEOMETRY?.features||[];
 const getFeature=d=>features.find(f=>f.properties.name===d.zh);
 for(const [i,d]of data.districts.entries()){
  const f=getFeature(d);if(!f)continue;
  const path=document.createElementNS(ns,'path');
  const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
  path.setAttribute('d',polys.map(p=>p.map(ring).join(' ')).join(' '));
  path.setAttribute('class','district-shape');path.dataset.district=d.id;
  path.setAttribute('tabindex','0');path.setAttribute('role','button');
  path.setAttribute('aria-label',t(`Select ${d.name}`,`选择${d.zh}`));
  const title=document.createElementNS(ns,'title');title.textContent=name(d);path.append(title);
  path.addEventListener('click',()=>selectDistrict(d.id));
  path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectDistrict(d.id);}});
  mount.querySelector('#district-shapes').append(path);
  const outer=['pudong','jiading','baoshan','qingpu','songjiang','jinshan','fengxian','chongming'].includes(d.id);
  if(outer){const [x,y]=project(f.properties.centroid||f.properties.center);const text=document.createElementNS(ns,'text');text.setAttribute('x',x);text.setAttribute('y',y);text.setAttribute('class','district-label');text.textContent=name(d);mount.querySelector('#district-labels').append(text);}
 }
 function selectDistrict(id){state.district=state.district===id?'':id;render();}
 function setTypes(){
  const options=[...new Set((state.mode==='funding'?data.funding:data.entities).map(e=>state.mode==='funding'?e.type:e.category))].sort();
  if(!options.includes(state.type))state.type='';
  typeSelect.innerHTML=`<option value="">${t('All types','全部类型')}</option>`+options.map(s=>`<option value="${esc(s)}">${esc(label(s))}</option>`).join('');
  typeSelect.value=state.type;
 }
 function visible(){
  return(state.mode==='funding'?data.funding:data.entities).filter(e=>{
   if(state.district&&e.district!==state.district)return false;
   if(state.type&&(state.mode==='funding'?e.type:e.category)!==state.type)return false;
   if(state.mode==='entities'&&state.sector&&!e.sectors.includes(state.sector))return false;
   if(state.mode==='funding'&&state.equity&&capital(e)!==state.equity)return false;
   if(state.savedOnly&&!saved.has(`${state.mode}:${e.id}`))return false;
   const hay=[e.name,e.zh,e.summary,e.summaryZh,e.eligibility,e.eligibilityZh,e.amount,e.amountZh,e.type,e.category,label(e.type||e.category),e.equity,label(e.equity),...(e.sectors||[]),...(e.sectors||[]).map(label),data.districts.find(d=>d.id===e.district)?.name,data.districts.find(d=>d.id===e.district)?.zh].join(' ').toLowerCase();
   return state.q.trim().toLowerCase().split(/\s+/).filter(Boolean).every(q=>hay.includes(q));
  });
 }
 function capital(e){if(e.type==='Equity investment')return 'equity';if(e.type==='Convertible support')return 'convertible';if(e.type.startsWith('Loan'))return 'debt';if(e.equity.startsWith('No equity')&&!e.equity.includes('repayable'))return 'nonrepayable';return 'other';}
 function updateUrl(){
  const q=new URLSearchParams();for(const k of ['mode','district','q','type','sector','equity'])if(state[k])q.set(k,state[k]);
  history.replaceState(null,'',location.pathname+(q.size?'?'+q:''));
  const switcher=document.querySelector('.language-switch');if(switcher)switcher.search=q.toString();
 }
 function render(){
  setTypes();districtSelect.value=state.district;
  if(sectorSelect.dataset.mode!==state.mode){
   sectorSelect.dataset.mode=state.mode;
   const text=sectorSelect.parentElement.firstChild;
   if(state.mode==='funding'){
    text.textContent=t('OWNERSHIP / REPAYMENT','股权／偿还义务');
    sectorSelect.innerHTML=[['',t('All mechanisms','全部机制')],['nonrepayable',t('No equity / not a loan','不占股／非贷款')],['debt',t('Repayable debt','须偿还债务')],['equity',t('Equity investment','股权投资')],['convertible',t('Possible equity conversion','可能转股')],['other',t('Competitions / verify terms','比赛／条款待核验')]].map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
   }else{
    text.textContent=t('AI / INDUSTRY FOCUS','人工智能／产业方向');
    sectorSelect.innerHTML=`<option value="">${t('All focus areas','全部方向')}</option>`+[...new Set(data.entities.flatMap(e=>e.sectors))].sort().map(s=>`<option value="${esc(s)}">${esc(label(s))}</option>`).join('');
   }
  }
  sectorSelect.value=state.mode==='funding'?state.equity:state.sector;
  mount.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.mode===(state.savedOnly?'saved':state.mode))));
  mount.querySelector('#saved-count').textContent=`(${[...saved].filter(s=>s.startsWith(state.mode+':')).length})`;
  mount.querySelectorAll('[data-district]').forEach(el=>{el.classList.toggle('selected',el.dataset.district===state.district);el.classList.toggle('active',el.dataset.district===state.district);if(el.tagName.toLowerCase()==='path')el.setAttribute('aria-pressed',String(el.dataset.district===state.district));});
  const list=visible();
  mount.querySelector('#results-count').textContent=t(`${list.length} ${state.mode==='funding'?'funding routes':'organizations'}`,`${list.length}个${state.mode==='funding'?'资金路径':'机构'}`);
  mount.querySelector('#atlas-results').innerHTML=list.length?list.map(card).join(''):`<div class="empty-state">${t('No matching records. Try another district, focus or search. Global programs are listed under Citywide / global.','暂无匹配记录，请调整行政区、方向或搜索。全球项目列于全市／全球。')}</div>`;
  const d=data.districts.find(d=>d.id===state.district);
  mount.querySelector('#map-detail').innerHTML=d?`<strong>${esc(name(d))}</strong><p>${esc(zh?d.focusZh:d.focus)}</p><a href="${base}districts/${d.id}.html">${t('Read the district guide','阅读本区指南')} &#8599;</a>`:`<strong>${t('One city. Many entry points.','一座城市，多个入口。')}</strong><p>${t('Click a district to discover its organizations and support routes. Use Core to inspect central Shanghai.','点击行政区了解机构与支持路径，点击城区查看中心区域。')}</p>`;
  drawPins(list);updateUrl();
 }
 function card(e){
  const fund=state.mode==='funding';const key=`${state.mode}:${e.id}`;
  return `<article class="atlas-card"><div class="card-meta"><span class="category">${esc(label(fund?e.type:e.category))}</span><span>/</span><span>${esc(name(data.districts.find(d=>d.id===e.district)||{name:'Citywide / global',zh:'全市／全球'}))}</span></div><h3><a href="${base}${e.url}">${esc(name(e))}</a></h3>${!zh?`<div class="card-cn" lang="zh-CN">${esc(e.zh)}</div>`:''}<p>${esc(fund?(zh?e.amountZh:e.amount):(zh?e.summaryZh:e.summary))}</p>${fund?`<span class="funding-badge">${esc(label(e.equity))}</span>`:''}<div class="card-status${e.status==='Closed'?' closed':''}">${esc(label(e.status))}${fund?'<br>'+esc(zh?e.deadlineZh:e.deadline):''}</div><div class="card-footer"><a href="${base}${e.url}">${t('Details, contact & application','详情、联系与申请')} &#8599;</a><button class="save-button" data-save="${key}" aria-pressed="${saved.has(key)}">${saved.has(key)?t('Saved','已收藏'):t('+ Shortlist','+ 收藏')}</button></div></article>`;
 }
 function drawPins(list){
  const group=mount.querySelector('#entity-pins');group.replaceChildren();
  if(state.mode==='funding')return;
  if(!state.district){
   for(const d of data.districts){const count=list.filter(e=>e.district===d.id).length;if(!count)continue;const f=getFeature(d);if(!f)continue;const[x,y]=project(f.properties.center);const a=document.createElementNS(ns,'a');a.setAttribute('href',base+`districts/${d.id}.html`);a.setAttribute('aria-label',t(`${d.name}: ${count} organizations. Read district guide.`,`${d.zh}：${count}家机构，阅读本区指南。`));a.innerHTML=`<circle cx="${x}" cy="${y}" r="11" class="map-pin"/><text x="${x}" y="${y+3.5}" class="pin-label">${count}</text>`;group.append(a);}return;
  }
  const d=data.districts.find(d=>d.id===state.district);if(!d)return;
  const f=getFeature(d);if(!f)return;
  const anchor=project(f.properties.center);
  for(const [i,e]of list.entries()){
   const pos=e.coords?project(e.coords):anchor;
   // Unknown offices remain a single district anchor, not fabricated coordinates.
   const a=document.createElementNS(ns,'a');a.setAttribute('href',base+e.url);a.setAttribute('class','pin-link');a.setAttribute('aria-label',`${name(e)}. ${e.coords?t('Approximate street location','近似街道位置'):t('District anchor, not office location','区级锚点，非办公地点')}`);
   const title=document.createElementNS(ns,'title');title.textContent=name(e)+' / '+(e.coords?t('Approximate','近似位置'):t('District anchor','区级锚点'));a.append(title);
   const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',pos[0]);circle.setAttribute('cy',pos[1]);circle.setAttribute('r',e.coords?'7':'10');circle.setAttribute('class',e.coords?'map-pin':'map-anchor');a.append(circle);group.append(a);
  }
 }
 mount.addEventListener('click',e=>{
  const save=e.target.closest('[data-save]');if(save){const key=save.dataset.save;saved.has(key)?saved.delete(key):saved.add(key);try{localStorage.setItem('shanghai-atlas-shortlist',JSON.stringify([...saved]));}catch{}render();return;}
  const tab=e.target.closest('[data-mode]');if(tab){if(tab.dataset.mode==='saved')state.savedOnly=!state.savedOnly;else{state.mode=tab.dataset.mode;state.savedOnly=false;state.type='';}render();return;}
  const d=e.target.closest('button[data-district]');if(d)selectDistrict(d.dataset.district);
 });
 search.addEventListener('input',()=>{state.q=search.value;render();});
 districtSelect.addEventListener('change',()=>{state.district=districtSelect.value;render();});
 typeSelect.addEventListener('change',()=>{state.type=typeSelect.value;render();});
 sectorSelect.addEventListener('change',()=>{state[state.mode==='funding'?'equity':'sector']=sectorSelect.value;render();});
 mount.querySelector('#reset-filters').addEventListener('click',()=>{Object.assign(state,{district:'',q:'',type:'',sector:'',equity:'',savedOnly:false});search.value='';render();});
 const setView=v=>{view=v;svg.setAttribute('viewBox',v);};
 mount.querySelector('#map-all').addEventListener('click',()=>setView('0 0 800 900'));
 mount.querySelector('#map-core').addEventListener('click',()=>setView('280 310 260 245'));
 function zoom(factor){let[x,y,w,h]=view.split(' ').map(Number);let nw=Math.max(120,Math.min(1200,w*factor));let nh=h*nw/w;setView(`${x+(w-nw)/2} ${y+(h-nh)/2} ${nw} ${nh}`);}
 mount.querySelector('#map-in').addEventListener('click',()=>zoom(.75));mount.querySelector('#map-out').addEventListener('click',()=>zoom(1.35));
 mount.querySelector('#export-results').addEventListener('click',()=>{
  const rows=[[t('Name','名称'),t('Chinese name','中文名'),t('District','行政区'),t('Type','类型'),t('Status','状态'),t('Phone','电话'),t('Email','邮箱'),t('Apply / website','申请／网站'),t('Funding amount','资助额度'),t('Deadline','截止'),t('Evidence','来源')],...visible().map(e=>[name(e),e.zh,e.district,label(e.type||e.category),label(e.status),e.phone||'',e.email||'',e.apply||e.website||'',zh?e.amountZh||'':e.amount||'',zh?e.deadlineZh||'':e.deadline||'',e.source.url])];
  const safe=value=>{const s=String(value??'');return /^[=+\-@\t\r]/.test(s)?"'"+s:s;};
  const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+safe(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`shanghai-atlas-${state.mode}-${data.checked}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 render();
});
