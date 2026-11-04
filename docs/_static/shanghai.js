/* Local, dependency-free interactions for all 7 editions (EN, ZH-CN, HI, JA, KO, DE, ES). */
document.addEventListener('DOMContentLoaded',()=>{
 const data=window.SHANGHAI_ATLAS;
 if(!data)return;
 const rawLang=(document.documentElement.lang||'en').toLowerCase();
 const lang=rawLang.startsWith('zh')?'zh':rawLang.startsWith('hi')?'hi':rawLang.startsWith('ja')?'ja':rawLang.startsWith('ko')?'ko':rawLang.startsWith('de')?'de':rawLang.startsWith('es')?'es':'en';
 const zh=lang==='zh';
 const loc=data.i18n?.[lang]||null;

 const UI={
  en:{
   dirView:'Directory view',orgs:'Organizations',funding:'Funding pathways',shortlist:'My shortlist',
   searchLabel:'SEARCH THE ECOSYSTEM',searchPlaceholder:'Try robotics, Fudan, 模速空间, Zhangjiang...',
   districtLabel:'DISTRICT',allDistricts:'All 16 districts',citywide:'Citywide / global',
   typeLabel:'TYPE / MECHANISM',allTypes:'All types',
   sectorLabel:'AI / INDUSTRY FOCUS',allSectors:'All focus areas',
   equityLabel:'OWNERSHIP / REPAYMENT',allMechs:'All mechanisms',
   nonrepayable:'No equity / not a loan',debt:'Repayable debt',equity:'Equity investment',convertible:'Possible equity conversion',other:'Competitions / verify terms',
   mapHeader:'SHANGHAI / 16 DISTRICTS',city:'City',core:'Core',zoomIn:'Zoom in',zoomOut:'Zoom out',
   mapAria:'Interactive Shanghai district map. Select a district or use the district dropdown.',
   selectDistrict:n=>`Select ${n}`,
   legend:'District shapes and pins are illustrative. District anchors are not office locations; street-based pins are approximate. Global programs are not mapped as Shanghai offices.',
   boundarySource:'Boundary source: DataV',
   reset:'Reset',exportCsv:'Export CSV',
   note:'Research checked 4 November 2026. Published policies and program announcements are not evidence of an open application window. Saved selections remain in this browser.',
   countOrgs:n=>`${n} organizations`,countFunding:n=>`${n} funding routes`,
   empty:'No matching records. Try another district, focus or search. Global programs are listed under Citywide / global.',
   readDistrict:'Read the district guide',
   mapDefaultTitle:'One city. Many entry points.',
   mapDefaultBody:'Click a district to discover its organizations and support routes. Use Core to inspect central Shanghai.',
   detailsLink:'Details, contact & application',
   saved:'Saved',addShortlist:'+ Shortlist',
   approxLoc:'Approximate street location',anchorLoc:'District anchor, not office location',
   approxShort:'Approximate',anchorShort:'District anchor',
   supportLabel:'Funding / support',eligibilityLabel:'Eligibility',addressLabel:'Address',contactLabel:'Contact',moeLabel:'MOE code',sourceLabel:'Source',
   districtOrgs:(n,c)=>`${n}: ${c} organizations. Read district guide.`
  },
  zh:{
   dirView:'目录视图',orgs:'机构',funding:'资金路径',shortlist:'我的清单',
   searchLabel:'搜索创新生态',searchPlaceholder:'搜索机器人、复旦、模速空间、张江等',
   districtLabel:'行政区',allDistricts:'全部16区',citywide:'全市／全球',
   typeLabel:'类型／机制',allTypes:'全部类型',
   sectorLabel:'人工智能／产业方向',allSectors:'全部方向',
   equityLabel:'股权／偿还义务',allMechs:'全部机制',
   nonrepayable:'不占股／非贷款',debt:'须偿还债务',equity:'股权投资',convertible:'可能转股',other:'比赛／条款待核验',
   mapHeader:'上海／十六区',city:'全市',core:'城区',zoomIn:'放大',zoomOut:'缩小',
   mapAria:'上海行政区交互地图，可点击选区或使用下拉框。',
   selectDistrict:n=>`选择${n}`,
   legend:'行政区及标点仅供示意。区级锚点不是办公地点，有街道信息的标点仍为近似。全球计划不标作上海办公室。',
   boundarySource:'区界来源：DataV',
   reset:'重置',exportCsv:'导出CSV',
   note:'研究核对日期为2026年11月4日。政策与启动公告不能证明申报正在开放。收藏清单仅保存在本浏览器。',
   countOrgs:n=>`${n}个机构`,countFunding:n=>`${n}个资金路径`,
   empty:'暂无匹配记录，请调整行政区、方向或搜索。全球项目列于全市／全球。',
   readDistrict:'阅读本区指南',
   mapDefaultTitle:'一座城市，多个入口。',
   mapDefaultBody:'点击行政区了解机构与支持路径，点击城区查看中心区域。',
   detailsLink:'详情、联系与申请',
   saved:'已收藏',addShortlist:'+ 收藏',
   approxLoc:'近似街道位置',anchorLoc:'区级锚点，非办公地点',
   approxShort:'近似位置',anchorShort:'区级锚点',
   supportLabel:'资金与支持',eligibilityLabel:'申报条件',addressLabel:'地址',contactLabel:'联系方式',moeLabel:'教育部代码',sourceLabel:'来源',
   districtOrgs:(n,c)=>`${n}：${c}家机构，阅读本区指南。`
  },
  hi:{
   dirView:'निर्देशिका दृश्य',orgs:'संस्थान',funding:'वित्तपोषण मार्ग',shortlist:'मेरी सूची',
   searchLabel:'इकोसिस्टम में खोजें',searchPlaceholder:'रोबोटिक्स, फ़ुदान, 模速空间, झांगजियांग खोजें...',
   districtLabel:'ज़िला',allDistricts:'सभी 16 ज़िले',citywide:'शहर-व्यापी / वैश्विक',
   typeLabel:'प्रकार / तंत्र',allTypes:'सभी प्रकार',
   sectorLabel:'एआई / उद्योग क्षेत्र',allSectors:'सभी क्षेत्र',
   equityLabel:'इक्विटी / पुनर्भुगतान',allMechs:'सभी तंत्र',
   nonrepayable:'गैर-इक्विटी / ऋण नहीं',debt:'पुनर्भुगतान योग्य ऋण',equity:'इक्विटी निवेश',convertible:'संभावित इक्विटी रूपांतरण',other:'प्रतियोगिताएं / शर्तें जांचें',
   mapHeader:'शंघाई / 16 ज़िले',city:'संपूर्ण शहर',core:'केंद्र',zoomIn:'ज़ूम इन',zoomOut:'ज़ूम आउट',
   mapAria:'इंटरैक्टिव शंघाई ज़िला मानचित्र। किसी ज़िले को चुनें या ड्रॉपडाउन का उपयोग करें।',
   selectDistrict:n=>`${n} चुनें`,
   legend:'ज़िला आकृतियाँ और पिन केवल सांकेतिक हैं। ज़िला एंकर कार्यालय के सटीक पते नहीं हैं।',
   boundarySource:'सीमा स्रोत: DataV',
   reset:'रीसेट',exportCsv:'CSV निर्यात करें',
   note:'शोध 4 नवंबर 2026 को सत्यापित। प्रकाशित नीतियां खुली आवेदन विंडो का प्रमाण नहीं हैं।',
   countOrgs:n=>`${n} संस्थान`,countFunding:n=>`${n} वित्तपोषण मार्ग`,
   empty:'कोई मेल खाने वाला रिकॉर्ड नहीं मिला। कृपया अन्य ज़िला या खोज शब्द आज़माएं।',
   readDistrict:'ज़िला गाइड पढ़ें',
   mapDefaultTitle:'एक शहर। अनेक प्रवेश द्वार।',
   mapDefaultBody:'संस्थानों और सहायता मार्गों को जानने के लिए किसी ज़िले पर क्लिक करें।',
   detailsLink:'विवरण, संपर्क और आवेदन',
   saved:'सहेजा गया',addShortlist:'+ सूची में जोड़ें',
   approxLoc:'अनुमानित सड़क स्थान',anchorLoc:'ज़िला एंकर (कार्यालय स्थान नहीं)',
   approxShort:'अनुमानित',anchorShort:'ज़िला एंकर',
   supportLabel:'सहायता / वित्तपोषण',eligibilityLabel:'पात्रता',addressLabel:'पता',contactLabel:'संपर्क',moeLabel:'MOE कोड',sourceLabel:'स्रोत',
   districtOrgs:(n,c)=>`${n}: ${c} संस्थान। ज़िला गाइड पढ़ें।`
  },
  ja:{
   dirView:'ディレクトリ表示',orgs:'機関・組織',funding:'資金調達ルート',shortlist:'保存リスト',
   searchLabel:'エコシステムを検索',searchPlaceholder:'ロボティクス、復旦、模速空間、張江などを検索...',
   districtLabel:'行政区',allDistricts:'全16区',citywide:'全市／グローバル',
   typeLabel:'種別／スキーム',allTypes:'すべての種別',
   sectorLabel:'AI／産業分野',allSectors:'すべての分野',
   equityLabel:'株式／返済条件',allMechs:'すべてのスキーム',
   nonrepayable:'非エクイティ／返済不要',debt:'返済義務のある融資',equity:'株式投資',convertible:'株式転換の可能性あり',other:'コンテスト／条件要確認',
   mapHeader:'上海／全16区',city:'全市',core:'都心部',zoomIn:'拡大',zoomOut:'縮小',
   mapAria:'上海市16区インタラクティブマップ。行政区をクリックするかドロップダウンで選択してください。',
   selectDistrict:n=>`${n}を選択`,
   legend:'行政区の形状とピンは参考表示です。区アンカーはオフィス所在地ではなく、通りレベルのピンも概略位置です。',
   boundarySource:'境界データ出典：DataV',
   reset:'リセット',exportCsv:'CSV出力',
   note:'調査確認日：2026年11月4日。政策や公募発表は現在募集期間中であることを保証するものではありません。',
   countOrgs:n=>`${n} 機関`,countFunding:n=>`${n} 資金ルート`,
   empty:'該当するレコードがありません。別の行政区や検索語をお試しください。',
   readDistrict:'区ガイドを読む',
   mapDefaultTitle:'ひとつの都市、多様な入り口。',
   mapDefaultBody:'行政区をクリックして機関と支援ルートを確認できます。「都心部」で中心城区を拡大します。',
   detailsLink:'詳細・連絡先・申請',
   saved:'保存済み',addShortlist:'+ リストに追加',
   approxLoc:'おおよその所在地',anchorLoc:'区アンカー（オフィス所在地ではありません）',
   approxShort:'概略位置',anchorShort:'区アンカー',
   supportLabel:'資金・支援内容',eligibilityLabel:'対象・要件',addressLabel:'所在地',contactLabel:'連絡先',moeLabel:'教育部コード',sourceLabel:'出典',
   districtOrgs:(n,c)=>`${n}：${c}機関。区ガイドを読む。`
  },
  ko:{
   dirView:'디렉터리 보기',orgs:'기관 및 조직',funding:'자금 지원 경로',shortlist:'관심 목록',
   searchLabel:'생태계 검색',searchPlaceholder:'로보틱스, 푸단, 모수공간(模速空间), 장장 등 검색...',
   districtLabel:'행정구',allDistricts:'전체 16개 구',citywide:'전시 / 글로벌',
   typeLabel:'유형 / 메커니즘',allTypes:'모든 유형',
   sectorLabel:'AI / 산업 분야',allSectors:'모든 분야',
   equityLabel:'지분 / 상환 조건',allMechs:'모든 메커니즘',
   nonrepayable:'비지분 / 비대출(무상)',debt:'상환 의무 대출',equity:'지분 투자',convertible:'지분 전환 가능',other:'경진대회 / 조건 확인 필요',
   mapHeader:'상하이 / 16개 행정구',city:'전시',core:'도심',zoomIn:'확대',zoomOut:'축소',
   mapAria:'상하이 행정구 인터랙티브 지도. 구를 클릭하거나 드롭다운에서 선택하세요.',
   selectDistrict:n=>`${n} 선택`,
   legend:'행정구 경계와 핀은 참고용입니다. 구 앵커는 실제 사무실 위치가 아니며 도로 기준 핀도 대략적인 위치입니다.',
   boundarySource:'경계 데이터 출처: DataV',
   reset:'초기화',exportCsv:'CSV 내보내기',
   note:'2026년 11월 4일 기준 검증. 정책 발표가 현재 접수 중임을 의미하지 않습니다.',
   countOrgs:n=>`${n}개 기관`,countFunding:n=>`${n}개 자금 경로`,
   empty:'일치하는 결과가 없습니다. 다른 행정구나 검색어를 시도해 보세요.',
   readDistrict:'행정구 가이드 읽기',
   mapDefaultTitle:'하나의 도시, 다양한 진입점.',
   mapDefaultBody:'행정구를 클릭하여 주요 기관과 지원 경로를 확인하세요.',
   detailsLink:'상세 정보, 연락처 및 신청',
   saved:'저장됨',addShortlist:'+ 관심 목록',
   approxLoc:'대략적인 거리 위치',anchorLoc:'구 앵커(실제 사무실 위치 아님)',
   approxShort:'대략적 위치',anchorShort:'구 앵커',
   supportLabel:'지원 / 자금',eligibilityLabel:'신청 자격',addressLabel:'주소',contactLabel:'연락처',moeLabel:'교육부 코드',sourceLabel:'출처',
   districtOrgs:(n,c)=>`${n}: ${c}개 기관. 행정구 가이드 읽기.`
  },
  de:{
   dirView:'Verzeichnisansicht',orgs:'Organisationen',funding:'Förderwege',shortlist:'Meine Merkliste',
   searchLabel:'ÖKOSYSTEM DURCHSUCHEN',searchPlaceholder:'Suche nach Robotik, Fudan, 模速空间, Zhangjiang...',
   districtLabel:'BEZIRK',allDistricts:'Alle 16 Bezirke',citywide:'Stadtweit / global',
   typeLabel:'TYP / MECHANISMUS',allTypes:'Alle Typen',
   sectorLabel:'KI- / BRANCHENFOKUS',allSectors:'Alle Fokusbereiche',
   equityLabel:'ANTEILE / RÜCKZAHLUNG',allMechs:'Alle Mechanismen',
   nonrepayable:'Kein Eigenkapital / kein Darlehen',debt:'Rückzahlbares Darlehen',equity:'Eigenkapitalinvestition',convertible:'Mögliche Wandlung',other:'Wettbewerbe / Bedingungen prüfen',
   mapHeader:'SHANGHAI / 16 BEZIRKE',city:'Gesamtstadt',core:'Zentrum',zoomIn:'Vergrößern',zoomOut:'Verkleinern',
   mapAria:'Interaktive Bezirks-Karte von Shanghai. Wählen Sie einen Bezirk oder nutzen Sie das Auswahlmenü.',
   selectDistrict:n=>`${n} auswählen`,
   legend:'Bezirksformen und Pins dienen der Illustration. Bezirksanker sind keine Büroadressen; Straßenpins sind Näherungswerte.',
   boundarySource:'Grenzdaten: DataV',
   reset:'Zurücksetzen',exportCsv:'CSV exportieren',
   note:'Recherche geprüft am 4. November 2026. Veröffentlichte Richtlinien sind kein Nachweis für ein aktuell geöffnetes Bewerbungsfenster.',
   countOrgs:n=>`${n} Organisationen`,countFunding:n=>`${n} Förderwege`,
   empty:'Keine passenden Einträge gefunden. Bitte Bezirk, Fokus oder Suchbegriff anpassen.',
   readDistrict:'Bezirksleitfaden lesen',
   mapDefaultTitle:'Eine Stadt. Viele Zugänge.',
   mapDefaultBody:'Klicken Sie auf einen Bezirk, um Organisationen und Förderwege zu entdecken.',
   detailsLink:'Details, Kontakt & Bewerbung',
   saved:'Gespeichert',addShortlist:'+ Merkliste',
   approxLoc:'Ungefähre Straßenlage',anchorLoc:'Bezirksanker, keine Büroadresse',
   approxShort:'Ungefähr',anchorShort:'Bezirksanker',
   supportLabel:'Förderung / Unterstützung',eligibilityLabel:'Berechtigung',addressLabel:'Adresse',contactLabel:'Kontakt',moeLabel:'MOE-Code',sourceLabel:'Quelle',
   districtOrgs:(n,c)=>`${n}: ${c} Organisationen. Bezirksleitfaden lesen.`
  },
  es:{
   dirView:'Vista del directorio',orgs:'Organizaciones',funding:'Vías de financiación',shortlist:'Mi lista',
   searchLabel:'BUSCAR EN EL ECOSISTEMA',searchPlaceholder:'Buscar robótica, Fudan, 模速空间, Zhangjiang...',
   districtLabel:'DISTRITO',allDistricts:'Los 16 distritos',citywide:'Toda la ciudad / global',
   typeLabel:'TIPO / MECANISMO',allTypes:'Todos los tipos',
   sectorLabel:'ENFOQUE IA / INDUSTRIA',allSectors:'Todas las áreas',
   equityLabel:'CAPITAL / REEMBOLSO',allMechs:'Todos los mecanismos',
   nonrepayable:'Sin cesión de capital / no préstamo',debt:'Deuda reembolsable',equity:'Inversión de capital',convertible:'Posible conversión en capital',other:'Competiciones / verificar términos',
   mapHeader:'SHANGHÁI / 16 DISTRITOS',city:'Ciudad',core:'Centro',zoomIn:'Acercar',zoomOut:'Alejar',
   mapAria:'Mapa interactivo de los distritos de Shanghái. Seleccione un distrito o use el menú desplegable.',
   selectDistrict:n=>`Seleccionar ${n}`,
   legend:'Las formas de los distritos y los pines son ilustrativos. Los anclajes distritales no son direcciones de oficinas.',
   boundarySource:'Fuente de límites: DataV',
   reset:'Restablecer',exportCsv:'Exportar CSV',
   note:'Investigación verificada el 4 de noviembre de 2026. Las políticas publicadas no implican una convocatoria abierta.',
   countOrgs:n=>`${n} organizaciones`,countFunding:n=>`${n} vías de financiación`,
   empty:'No hay registros coincidentes. Pruebe con otro distrito, enfoque o término de búsqueda.',
   readDistrict:'Leer guía del distrito',
   mapDefaultTitle:'Una ciudad. Múltiples puntos de entrada.',
   mapDefaultBody:'Haga clic en un distrito para descubrir sus organizaciones y rutas de apoyo.',
   detailsLink:'Detalles, contacto y solicitud',
   saved:'Guardado',addShortlist:'+ Guardar',
   approxLoc:'Ubicación aproximada en calle',anchorLoc:'Anclaje distrital, no ubicación de oficina',
   approxShort:'Aproximado',anchorShort:'Anclaje distrital',
   supportLabel:'Financiación / apoyo',eligibilityLabel:'Elegibilidad',addressLabel:'Dirección',contactLabel:'Contacto',moeLabel:'Código MOE',sourceLabel:'Fuente',
   districtOrgs:(n,c)=>`${n}: ${c} organizaciones. Leer guía del distrito.`
  }
 };
 const ui=UI[lang]||UI.en;
 const base=document.body.dataset.base||'';
 const label=s=>{
  if(!s)return '';
  if(zh)return data.labels[s]||s;
  if(loc?.labels?.[s])return loc.labels[s];
  return s;
 };
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dObj=id=>data.districts.find(d=>d.id===id);
 const name=e=>{
  if(!e)return '';
  if(zh)return e.zh||e.name;
  if(loc){
   if(loc.districts?.[e.id]?.name)return loc.districts[e.id].name;
   if(loc.entities?.[e.id]?.name)return loc.entities[e.id].name;
   if(loc.universities?.[e.id]?.name)return loc.universities[e.id].name;
   if(loc.funding?.[e.id]?.name)return loc.funding[e.id].name;
  }
  return e.name;
 };
 const summaryText=e=>{
  if(zh)return e.summaryZh||e.summary;
  if(loc?.entities?.[e.id]?.summary)return loc.entities[e.id].summary;
  if(loc?.universities?.[e.id]?.fit)return loc.universities[e.id].fit;
  return e.summary;
 };
 const amountText=e=>{
  if(zh)return e.amountZh||e.amount;
  if(loc?.funding?.[e.id]?.amount)return loc.funding[e.id].amount;
  return e.amount;
 };
 const eligibilityText=e=>{
  if(zh)return e.eligibilityZh||e.eligibility;
  if(loc?.funding?.[e.id]?.eligibility)return loc.funding[e.id].eligibility;
  return e.eligibility;
 };
 const deadlineText=e=>{
  if(zh)return e.deadlineZh||e.deadline;
  if(loc?.funding?.[e.id]?.deadline)return loc.funding[e.id].deadline;
  if(loc?.deadlines?.[e.deadline])return loc.deadlines[e.deadline];
  return e.deadline;
 };
 const districtFocus=d=>{
  if(zh)return d.focusZh||d.focus;
  if(loc?.districts?.[d.id]?.focus)return loc.districts[d.id].focus;
  return d.focus;
 };
 const addressText=e=>{
  if(zh)return e.addressZh||e.address||'';
  if(loc?.entities?.[e.id]?.address)return loc.entities[e.id].address;
  if(loc?.universities?.[e.id]?.address)return loc.universities[e.id].address;
  return e.address||'';
 };

 document.querySelectorAll('[data-stat]').forEach(el=>{
  if(data.counts[el.dataset.stat]!==undefined)el.textContent=data.counts[el.dataset.stat];
 });
 const langMenu=document.querySelector('.gd-language');
 if(langMenu){
  const links=Array.from(langMenu.querySelectorAll('a[data-language]'));
  const syncLanguageLinks=()=>links.forEach(link=>{
   const url=new URL(link.href,location.href);
   url.search=location.search;
   url.hash=location.hash;
   link.href=url.href;
  });
  syncLanguageLinks();
  // Map filters can change the URL after the initial page load.
  langMenu.addEventListener('toggle',syncLanguageLinks);
  links.forEach(link=>{
   link.addEventListener('click',()=>{
    try{localStorage.setItem('shanghai-atlas-language',link.dataset.language);}catch{}
   });
  });
  document.addEventListener('click',event=>{
   if(!langMenu.contains(event.target))langMenu.open=false;
  });
  document.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&langMenu.open){
    langMenu.open=false;
    langMenu.querySelector('summary')?.focus();
   }
  });
 }
 const mount=document.querySelector('#atlas-app');if(!mount)return;
 const params=new URLSearchParams(location.search);
 const state={mode:params.get('mode')==='funding'?'funding':'entities',district:params.get('district')||'',q:params.get('q')||'',type:params.get('type')||'',sector:params.get('sector')||'',equity:params.get('equity')||'',savedOnly:false};
 if(!data.districts.some(d=>d.id===state.district)&&state.district!=='citywide')state.district='';
 let saved=new Set();try{saved=new Set(JSON.parse(localStorage.getItem('shanghai-atlas-shortlist')||'[]'));}catch{}
 let view='0 0 800 900';
 mount.innerHTML=`<div class="atlas-tabs" role="tablist" aria-label="${esc(ui.dirView)}"><button role="tab" data-mode="entities">${esc(ui.orgs)}</button><button role="tab" data-mode="funding">${esc(ui.funding)}</button><button role="tab" data-mode="saved">${esc(ui.shortlist)} <span id="saved-count"></span></button></div>
 <div class="atlas-toolbar"><label class="search-label">${esc(ui.searchLabel)}<input type="search" id="atlas-search" placeholder="${esc(ui.searchPlaceholder)}" value="${esc(state.q)}"></label><label>${esc(ui.districtLabel)}<select id="district-filter"><option value="">${esc(ui.allDistricts)}</option><option value="citywide">${esc(ui.citywide)}</option>${data.districts.map(d=>`<option value="${d.id}">${esc(name(d))}</option>`).join('')}</select></label><label>${esc(ui.typeLabel)}<select id="type-filter"></select></label><label>${esc(ui.sectorLabel)}<select id="sector-filter"><option value="">${esc(ui.allSectors)}</option>${[...new Set(data.entities.flatMap(e=>e.sectors))].sort().map(s=>`<option value="${esc(s)}">${esc(label(s))}</option>`).join('')}</select></label></div>
 <div class="atlas-workspace"><div class="atlas-map-panel"><div class="map-topbar"><span>${esc(ui.mapHeader)}</span><div class="map-controls"><button id="map-all">${esc(ui.city)}</button><button id="map-core">${esc(ui.core)}</button><button id="map-in" aria-label="${esc(ui.zoomIn)}">+</button><button id="map-out" aria-label="${esc(ui.zoomOut)}">-</button></div></div><div class="map-canvas"><svg id="shanghai-map" viewBox="${view}" role="img" aria-label="${esc(ui.mapAria)}"><g id="district-shapes"></g><g id="district-labels"></g><g id="entity-pins"></g><text x="50" y="80" fill="#315b50" font-size="15">N &#8593;</text></svg></div><div class="map-detail" id="map-detail"></div><div class="mobile-districts">${data.districts.map(d=>`<button data-district="${d.id}">${esc(name(d))}</button>`).join('')}</div><div class="map-legend">${esc(ui.legend)}<br><a href="https://geo.datav.aliyun.com/areas_v3/bound/310000_full.json">${esc(ui.boundarySource)}</a></div></div><div><div class="results-topbar"><span id="results-count" role="status"></span><div><button class="quiet-button" id="reset-filters">${esc(ui.reset)}</button> <button class="quiet-button" id="export-results">${esc(ui.exportCsv)}</button></div></div><div id="atlas-results" class="atlas-results"></div></div></div><p class="atlas-note">${esc(ui.note)}</p>`;
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
 for(const d of data.districts){
  const f=getFeature(d);if(!f)continue;
  const path=document.createElementNS(ns,'path');
  const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
  path.setAttribute('d',polys.map(p=>p.map(ring).join(' ')).join(' '));
  path.setAttribute('class','district-shape');path.dataset.district=d.id;
  path.setAttribute('tabindex','0');path.setAttribute('role','button');
  path.setAttribute('aria-label',ui.selectDistrict(name(d)));
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
  typeSelect.innerHTML=`<option value="">${esc(ui.allTypes)}</option>`+options.map(s=>`<option value="${esc(s)}">${esc(label(s))}</option>`).join('');
  typeSelect.value=state.type;
 }
 function visible(){
  return(state.mode==='funding'?data.funding:data.entities).filter(e=>{
   if(state.district&&e.district!==state.district)return false;
   if(state.type&&(state.mode==='funding'?e.type:e.category)!==state.type)return false;
   if(state.mode==='entities'&&state.sector&&!e.sectors.includes(state.sector))return false;
   if(state.mode==='funding'&&state.equity&&capital(e)!==state.equity)return false;
   if(state.savedOnly&&!saved.has(`${state.mode}:${e.id}`))return false;
   const dist=dObj(e.district);
   const hay=[e.name,e.zh,name(e),e.summary,e.summaryZh,summaryText(e),e.eligibility,e.eligibilityZh,eligibilityText(e),e.amount,e.amountZh,amountText(e),e.type,e.category,label(e.type||e.category),e.equity,label(e.equity),...(e.sectors||[]),...(e.sectors||[]).map(label),dist?.name,dist?.zh,dist?name(dist):''].join(' ').toLowerCase();
   return state.q.trim().toLowerCase().split(/\s+/).filter(Boolean).every(q=>hay.includes(q));
  });
 }
 function capital(e){if(e.type==='Equity investment')return 'equity';if(e.type==='Convertible support')return 'convertible';if(e.type.startsWith('Loan'))return 'debt';if(e.equity.startsWith('No equity')&&!e.equity.includes('repayable'))return 'nonrepayable';return 'other';}
 function updateUrl(){
  const q=new URLSearchParams();for(const k of ['mode','district','q','type','sector','equity'])if(state[k])q.set(k,state[k]);
   history.replaceState(null,'',location.pathname+(q.size?'?'+q:''));
  const switcher=document.querySelector('.language-switch');if(switcher)switcher.search=q.toString();
  document.querySelectorAll('.gd-language a[data-language]').forEach(a=>{a.search=q.toString();});
 }
 function render(){
  setTypes();districtSelect.value=state.district;
  if(sectorSelect.dataset.mode!==state.mode){
   sectorSelect.dataset.mode=state.mode;
   const text=sectorSelect.parentElement.firstChild;
   if(state.mode==='funding'){
    text.textContent=ui.equityLabel;
    sectorSelect.innerHTML=[['',ui.allMechs],['nonrepayable',ui.nonrepayable],['debt',ui.debt],['equity',ui.equity],['convertible',ui.convertible],['other',ui.other]].map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('');
   }else{
    text.textContent=ui.sectorLabel;
    sectorSelect.innerHTML=`<option value="">${esc(ui.allSectors)}</option>`+[...new Set(data.entities.flatMap(e=>e.sectors))].sort().map(s=>`<option value="${esc(s)}">${esc(label(s))}</option>`).join('');
   }
  }
  sectorSelect.value=state.mode==='funding'?state.equity:state.sector;
  mount.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.mode===(state.savedOnly?'saved':state.mode))));
  mount.querySelector('#saved-count').textContent=`(${[...saved].filter(s=>s.startsWith(state.mode+':')).length})`;
  mount.querySelectorAll('[data-district]').forEach(el=>{el.classList.toggle('selected',el.dataset.district===state.district);el.classList.toggle('active',el.dataset.district===state.district);if(el.tagName.toLowerCase()==='path')el.setAttribute('aria-pressed',String(el.dataset.district===state.district));});
  const list=visible();
  mount.querySelector('#results-count').textContent=state.mode==='funding'?ui.countFunding(list.length):ui.countOrgs(list.length);
  mount.querySelector('#atlas-results').innerHTML=list.length?list.map(card).join(''):`<div class="empty-state">${esc(ui.empty)}</div>`;
  const d=dObj(state.district);
  mount.querySelector('#map-detail').innerHTML=d?`<strong>${esc(name(d))}</strong><p>${esc(districtFocus(d))}</p><a href="${base}districts/${d.id}.html">${esc(ui.readDistrict)} &#8599;</a>`:`<strong>${esc(ui.mapDefaultTitle)}</strong><p>${esc(ui.mapDefaultBody)}</p>`;
  drawPins(list);updateUrl();
 }
 function card(e){
  const fund=state.mode==='funding';const key=`${state.mode}:${e.id}`;
  const dist=dObj(e.district);
  const distName=dist?name(dist):ui.citywide;
  const tags=!fund&&(e.sectors||[]).length?`<div class="card-tags">${e.sectors.map(s=>`<span class="card-tag">${esc(label(s))}</span>`).join('')}</div>`:'';
  const addr=addressText(e);
  const details=[];
  if(fund){
   const elig=eligibilityText(e);
   if(elig)details.push(`<div><strong>${esc(ui.eligibilityLabel)}:</strong> ${esc(elig)}</div>`);
  }else{
   const amt=amountText(e);
   if(amt)details.push(`<div><strong>${esc(ui.supportLabel)}:</strong> ${esc(amt)}</div>`);
   if(addr)details.push(`<div><strong>${esc(ui.addressLabel)}:</strong> ${esc(addr)}</div>`);
   const contacts=e.phone||'';
   if(contacts)details.push(`<div><strong>${esc(ui.contactLabel)}:</strong> ${esc(contacts)}</div>`);
   if(e.code)details.push(`<div><strong>${esc(ui.moeLabel)}:</strong> ${esc(e.code)}</div>`);
  }
  if(e.source?.id)details.push(`<div><strong>${esc(ui.sourceLabel)}:</strong> [${esc(e.source.id)}] ${esc(e.source.title)}</div>`);
  return `<article class="atlas-card"><div class="card-meta"><span class="category">${esc(label(fund?e.type:e.category))}</span><span>/</span><span>${esc(distName)}</span></div><h3><a href="${base}${e.url}">${esc(name(e))}</a></h3>${!zh&&e.zh?`<div class="card-cn" lang="zh-CN">${esc(e.zh)}</div>`:''}<p>${esc(fund?amountText(e):summaryText(e))}</p>${tags}${fund?`<span class="funding-badge">${esc(label(e.equity))}</span>`:''}${details.length?`<div class="card-details">${details.join('')}</div>`:''}<div class="card-status${e.status==='Closed'?' closed':''}">${esc(label(e.status))}${fund?'<br>'+esc(deadlineText(e)):''}</div><div class="card-footer"><a href="${base}${e.url}">${esc(ui.detailsLink)} &#8599;</a><button class="save-button" data-save="${key}" aria-pressed="${saved.has(key)}">${saved.has(key)?esc(ui.saved):esc(ui.addShortlist)}</button></div></article>`;
 }
 function drawPins(list){
  const group=mount.querySelector('#entity-pins');group.replaceChildren();
  if(state.mode==='funding')return;
  if(!state.district){
   for(const d of data.districts){const count=list.filter(e=>e.district===d.id).length;if(!count)continue;const f=getFeature(d);if(!f)continue;const[x,y]=project(f.properties.center);const a=document.createElementNS(ns,'a');a.setAttribute('href',base+`districts/${d.id}.html`);a.setAttribute('aria-label',ui.districtOrgs(name(d),count));a.innerHTML=`<circle cx="${x}" cy="${y}" r="11" class="map-pin"/><text x="${x}" y="${y+3.5}" class="pin-label">${count}</text>`;group.append(a);}return;
  }
  const d=dObj(state.district);if(!d)return;
  const f=getFeature(d);if(!f)return;
  const anchor=project(f.properties.center);
  for(const e of list){
   const pos=e.coords?project(e.coords):anchor;
   const a=document.createElementNS(ns,'a');a.setAttribute('href',base+e.url);a.setAttribute('class','pin-link');a.setAttribute('aria-label',`${name(e)}. ${e.coords?ui.approxLoc:ui.anchorLoc}`);
   const title=document.createElementNS(ns,'title');title.textContent=name(e)+' / '+(e.coords?ui.approxShort:ui.anchorShort);a.append(title);
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
  const rows=[['Name','Chinese name','District','Type','Status','Phone','Apply / website','Funding amount','Deadline','Evidence'],...visible().map(e=>[name(e),e.zh,e.district,label(e.type||e.category),label(e.status),e.phone||'',e.apply||e.website||'',amountText(e)||'',deadlineText(e)||'',e.source.url])];
  const safe=value=>{const s=String(value??'');return /^[=+\-@\t\r]/.test(s)?"'"+s:s;};
  const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+safe(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`shanghai-atlas-${state.mode}-${data.checked}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 render();
});
