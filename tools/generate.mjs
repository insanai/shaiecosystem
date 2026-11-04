import fs from 'node:fs';
import path from 'node:path';
import {districts,entities,funding,checked} from '../data/catalog.mjs';
import {universities,universityDetails} from '../data/universities.mjs';
import {chapters,workflows} from '../data/chapters.mjs';

const root=path.resolve(import.meta.dirname,'..');
process.chdir(root);
// Guidedog validates configured asset folders before every builder, including gettext.
fs.mkdirSync('docs/downloads',{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);};
const registry=read('data/university-register.json');
const adult=read('data/adult-college-register.json');
const translations=new Map();
function tr(en,zh){
 if(!en||!zh)throw new Error('Empty translation pair');
 if(en===zh&&translations.has(en))return en;
 zh=zh.replace(/:doc:`[^`]+`|`[^`]+ <[^>]+>`_/g,s=>translations.get(s)||s);
 if(translations.has(en)&&translations.get(en)!==zh)throw new Error(`Translation collision: ${en}`);
 translations.set(en,zh);return en;
}
function heading(en,zh,level=0){const s=tr(en,zh);return `${s}\n${['=','-','~','^'][level].repeat(Math.max(s.length,12))}\n\n`;}
const p=(en,zh)=>`${tr(en,zh)}\n\n`;
const bullet=(en,zh)=>`* ${tr(en,zh)}\n`;
const link=(en,zh,url)=>tr('`'+en+' <'+url+'>`_','`'+zh+' <'+url+'>`_');
const doc=(en,zh,target)=>tr(`:doc:\u0060${en} <${target}>\u0060`,`:doc:\u0060${zh} <${target}>\u0060`);
const sourceBank=[...read('data/research-index.json'),...read('data/extra-sources.json'),
 {title:'National higher education institutions, June 2026',url:'https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202606/t20260618_1441074.html',accessed:checked,language:'zh-CN'},
 {title:'Shanghai municipal flower and overview',url:'https://english.shanghai.gov.cn/en-Overview/',accessed:checked,language:'en'},
 {title:'DataV Shanghai district geometry',url:'https://geo.datav.aliyun.com/areas_v3/bound/310000_full.json',accessed:checked,language:'zh-CN'},
 {title:'STEFG application and program introduction',url:'https://fund.stefg.org/Angel/Intro.aspx',accessed:checked,language:'zh-CN'},
 {title:'Shanghai Lida University official website',url:'https://www.lidapoly.edu.cn/',accessed:checked,language:'zh-CN'},
];
const used=[];
function source(fragment){
 let s=sourceBank.find(x=>x.url.includes(fragment)||x.title.includes(fragment));
 if(!s)throw new Error(`Missing source: ${fragment}`);
 let existing=used.find(x=>x.url===s.url);
 if(!existing){existing={...s,id:`S${String(used.length+1).padStart(3,'0')}`};used.push(existing);}
 return existing;
}
function evidence(fragment){
 const s=source(fragment);return p(link(`Evidence ${s.id}`,`证据 ${s.id}`,s.url)+`. ${s.title}.`,link(`Evidence ${s.id}`,`证据 ${s.id}`,s.url)+`. ${s.title}.`);
}
const labels={
 'Incubator':'孵化器','Accelerator':'加速器','Technology park':'科技园区','Research platform':'科研平台','Corporate program':'企业创新计划','Global program':'全球计划','Investor':'投资机构','University':'高校','Government':'政府部门',
 'Software AI':'软件人工智能','Hardware AI':'硬件人工智能','Chips':'芯片','Sensors':'传感器','Robotics':'机器人','Health':'健康','AI for Science':'科学智能','Industry':'产业','Mobility':'交通','Materials':'材料','Drones':'无人机','Climate':'气候','Agriculture':'农业','Consumer':'消费',
 'Grant':'补助','Reimbursement':'报销支持','Loan':'贷款','Equity investment':'股权投资','Tax relief':'税收优惠','Competition':'比赛','In-kind services':'实物与服务支持','Cloud credits':'云积分','Loan / insurance':'贷款与保险','Grant / market access':'补助与市场准入',
 'Grant / reimbursement':'补助与报销','Convertible support':'可转股支持','Potential equity conversion; review contract':'可能转为股权，须审核协议',
 'Published directory; lender review':'目录已公布，须贷款方审核',
 'No equity':'不占股','No equity; repayable':'不占股，须偿还','Temporary equity; original-price exit':'临时股权，原价退出','Award / investment terms vary':'奖励与投资条款各异','No equity stated in offer; verify terms':'所述方案无股权要求，须核验协议','Verify current agreement':'核验现行协议','Negotiated equity':'协商股权','No equity; product obligations apply':'不占股，适用产品义务','No equity for qualifying public support':'合资格财政支持不占股',
 'Program published; eligibility review':'项目已公布，须资格审核','Historical / confirm continuation':'历史项目，须确认延续','Regional eligibility to confirm':'地区资格待确认','Published entity; intake to confirm':'机构有来源，招募待确认',
 'Closed':'已截止','Policy in force; confirm service and order':'政策有效，须核验服务与订单','Policy in force; call not confirmed open':'政策有效，未确认正在申报','Published policy; implementing intake to confirm':'政策已公布，实施受理待确认','Published service; current terms to confirm':'服务已公布，现行条款待确认','Published tax guidance; applicability review':'税务指引已公布，适用性待核验','Published tax guidance; recognition required':'税务指引已公布，须认定','2026 call published; deadline check required':'2026通知已公布，须核验截止日','2026 competition published; track intake to confirm':'2026赛事已公布，赛道受理待确认','2026 call published; not confirmed open':'2026通知已公布，未确认正在受理','Fund announced; deal intake to confirm':'基金已公布，项目受理待确认','Published investment platform; deal review':'投资平台已公布，须项目审核','Quarterly scheme published; current intake to confirm':'季度机制已公布，当前批次待确认','First 2026 batch closed; later batches to verify':'2026首批已截止，后续批次待核验','2026 directory published; lender review':'2026清单已公布，须贷款方审核','Published route; current call to confirm':'路径已公布，现行申报待确认',
};
for(const [a,b]of Object.entries(labels))tr(a,b);
const cn=s=>labels[s]||s;
const dname=id=>districts.find(x=>x.id===id)?.name||'Citywide / global';
const dzh=id=>districts.find(x=>x.id===id)?.zh||'全市／全球';
function workflow(key){
 let s=p('Editorial application checklist. The current official notice or agreement controls the actual procedure.','编辑申请清单，实际流程以现行官方通知或协议为准。');
 for(const [en,zh]of workflows[key||'incubation'])s+=`#. ${tr(en,zh)}\n\n`;
 return s;
}
const universityEntities=universities.map(([id,name,zh,district,domain,fit,fitZh])=>{
 const info=universityDetails[id]||{};
 const record=registry.find(x=>x.zh===zh);
 if(!record)throw new Error(`University not in official register: ${zh}`);
 return {id:`university-${id}`,name,zh,district,category:'University',sectors:[],website:`https://${domain==='shanghai.nyu.edu'?'':'www.'}${domain}/`,
  summary:`Institutional entry in the June 2026 Ministry of Education register. Suggested collaboration themes: ${fit}. These themes are editorial routing guidance, not a verified offer of laboratory access or startup funding.`,
  summaryZh:`列入教育部2026年6月高校名录。建议合作主题：${fitZh}。这些主题为编辑对接建议，并非已经核实的实验室准入或创业资助承诺。`,
  source:'moe.gov.cn/jyb_xxgk',workflow:'research',code:record.code,sourceDetail:info.source,
  contact:'Official university website; request the technology-transfer, research cooperation or entrepreneurship office',contactZh:'通过高校官网咨询技术转移、科研合作或创业部门',...info};
});
const allEntities=[...entities,...universityEntities];
for(const d of districts)allEntities.push({id:`government-${d.id}`,name:d.owner,zh:d.ownerZh,district:d.id,category:'Government',sectors:[],summary:d.note,summaryZh:d.noteZh,source:d.source,website:`https://www.${d.domain}/`,phone:d.phone,workflow:'grant'});
const ids=new Set();
for(const e of allEntities){if(ids.has(e.id))throw new Error(`Duplicate ${e.id}`);ids.add(e.id);source(e.source);}
for(const f of funding)source(f.source);

for(const [id,c]of Object.entries(chapters)){
 let s=heading(...c.title)+p(...c.intro);
 if(id==='reading-the-city')s+='.. figure:: _static/atlas/shanghai-map.svg\n   :alt: Illustrative Shanghai district map, with numbered district anchors and a bilingual legend.\n   :width: 100%\n\n   '+tr('Sixteen districts, connected by people, research and industry.','十六个区，以人才、科研及产业相连。')+'\n\n';
 if(id==='software-ai')s+=`.. graphviz:: figures/ai-stack.dot\n   :caption: ${tr('An AI product connects models to a customer workflow.','人工智能产品把模型连接到客户流程。')}\n   :alt: Data, compute and models support an evaluated product connected to customers.\n\n`;
 if(id==='hardware-ai')s+=`.. typst-diagram:: figures/hardware.typ\n   :caption: ${tr('Engineering gates from research to repeatable production.','从科研到可重复生产的工程关口。')}\n   :alt: Research, prototype, verification, pilot production and scale form a sequence.\n\n`;
 if(id==='apply')s+=`.. typst-diagram:: figures/application.typ\n   :caption: ${tr('A clear application separates eligibility, evidence and the decision.','清晰的申请区分资格、证据与决策。')}\n   :alt: Fit check leads to evidence, submission and review, with a feedback path.\n\n`;
 if(id==='funding-guide')s+=`.. graphviz:: figures/funding.dot\n   :caption: ${tr('Match the resource need to the financing mechanism.','按资源需求匹配资金机制。')}\n   :alt: Technical services connect to vouchers; working capital connects to grants or debt; patient capital connects to negotiated equity.\n\n`;
 for(const [en,zh,paras]of c.sections){s+=heading(en,zh,1);for(const pair of paras)s+=p(...pair);}
 if(id==='reading-the-city')s+=evidence('english.shanghai.gov.cn/en-Overview/');
 if(id==='software-ai')s+=evidence('cd1dcb1e5cb4449cbc36c69befafcc0a');
 if(id==='hardware-ai')s+=evidence('992800bb77b6492b97ba4a9c14c09944');
 if(id==='methodology')s+=evidence('geo.datav.aliyun.com');
 write(`docs/${id}.rst`,s);
}

let districtIndex=heading('Sixteen districts, sixteen entry routes','十六区，十六条对接路径')+p('Every district has a chapter. We begin with its documented specialization and receiving authority, then follow the local organizations. An official portal remains the contact route when no current named officer or direct intake form is established.','每个区均设章节，从有来源的产业方向和主管部门出发，再了解本地机构。尚无经核实现任联系人或直接表格时，以官方门户作为联系入口。');
for(const d of districts)districtIndex+=bullet(doc(d.name,d.zh,`districts/${d.id}`),doc(d.name,d.zh,`districts/${d.id}`));
districtIndex+='\n.. toctree::\n   :hidden:\n\n'+districts.map(d=>'   districts/'+d.id).join('\n')+'\n';
write('docs/districts.rst',districtIndex);
for(const d of districts){
 let s=heading(d.name,d.zh)+p(d.focus,d.focusZh)+p(d.note,d.noteZh)+evidence(d.source);
 s+=heading('Who receives the inquiry','咨询受理',1)+p(d.owner,d.ownerZh);
 s+=p(link('Official district website','区政府官网',`https://www.${d.domain}/`),link('Official district website','区政府官网',`https://www.${d.domain}/`));
 if(d.phone)s+=p(`Published contact: ${d.phone}.`,`已公布联系电话：${d.phone}。`);
 else s+=p('A current direct program phone or email is not established in this record. Use the official website to request the named receiving team.','本记录未核实现行项目直线电话或邮箱。请通过官网索取具体受理团队。');
 s+=heading('Before applying','申请之前',1)+workflow('grant');
 s+=p('Ask which current notice governs the project, whether registration and actual operations must both be in the district, which expenditure period is eligible, and whether previous municipal or district awards exclude a claim. Obtain the answer before moving a company or incurring costs.','询问适用的现行通知、注册与经营是否均须属地、可计入支出期间，以及已获市区资助是否影响申报。应在迁移企业或发生费用之前获得答复。');
 s+=heading('Local organizations in this atlas','本图谱中的本区机构',1);
 const local=allEntities.filter(e=>e.district===d.id&&e.category!=='Government');
 for(const e of local)s+=bullet(doc(e.name,e.zh,`/entities/${e.id}`),doc(e.name,e.zh,`/entities/${e.id}`));
 s+='\n'+heading('Funding routes','资金路径',1);
 const funds=funding.filter(f=>f.district===d.id);
 for(const f of funds)s+=bullet(doc(f.name,f.zh,`/funding/${f.id}`),doc(f.name,f.zh,`/funding/${f.id}`));
 s+='\n'+p(doc('Also compare citywide funding','同时比较全市资金路径','/funding'),doc('Also compare citywide funding','同时比较全市资金路径','/funding'));
 write(`docs/districts/${d.id}.rst`,s);
}

const groups=[['universities','Universities and commercialization','高校与成果转化',['University']],['incubation','Incubators, accelerators and parks','孵化器、加速器及园区',['Incubator','Accelerator','Technology park']],['research','Research and technical platforms','科研与技术平台',['Research platform']],['corporate','Corporate and global programs','企业与全球计划',['Corporate program','Global program']],['investors','Investors and patient capital','投资机构与耐心资本',['Investor']],['government','Government entry points','政府对接入口',['Government']]];
for(const [id,title,zh,categories]of groups){
 const list=allEntities.filter(e=>categories.includes(e.category));
 let s=heading(title,zh)+p(`${list.length} profiles with evidence, contact routes and an application checklist. Published existence is distinguished from current intake.`,`${list.length}份档案，附来源、联系渠道及申请清单。机构存在与当前招募情况分别标注。`);
 if(id==='universities'){
  s+=p('All 40 undergraduate institutions in the official Shanghai register have an institutional profile here. Some have documented science-park or technology-transfer contacts; others have a general institutional route. A profile does not assert that a dedicated startup program is open.','官方上海名录中的40所本科院校均有机构档案。部分有科技园或技术转移联系渠道，其他仅有机构对接入口。档案不代表专属创业项目正在开放。');
  s+=p(doc('Full higher-education register, including diploma and adult institutions','含专科与成人高校的完整名录','university-register'),doc('Full higher-education register, including diploma and adult institutions','含专科与成人高校的完整名录','university-register'));
 }
 if(id==='corporate')s+=p('Global programs are kept separate from local offices. Their China-region eligibility, service availability and account rules require direct verification. Historical corporate cohorts are marked.','全球计划与本地办公室区分，中国地区资格、服务及账户规则须直接核实。历史企业招募另行标注。');
 s+='.. toctree::\n   :maxdepth: 1\n\n'+list.map(e=>'   entities/'+e.id).join('\n')+'\n';
 write(`docs/${id}.rst`,s);
}
for(const e of allEntities){
 let s=heading(e.name,e.zh)+p(e.zh,e.zh);
 s+=p(`${e.category} | ${dname(e.district)} | Research checked ${checked}`,`${cn(e.category)}｜${dzh(e.district)}｜研究核对日期 ${checked}`);
 s+=p(e.summary,e.summaryZh)+evidence(e.source);
 if(e.sourceDetail&&e.sourceDetail!==e.source)s+=evidence(e.sourceDetail);
 s+=heading('Status and support','状态与支持',1)+p(e.status||'Published entity; intake to confirm',cn(e.status||'Published entity; intake to confirm'));
 if(e.funding)s+=p(`Funding mechanism: ${e.funding}.`,`支持机制：${{'Equity-free services':'不占股服务','Cloud credits':'云积分','Loan / temporary equity':'贷款／临时股权','Equity investment':'股权投资'}[e.funding]||e.funding}。`);
 else s+=p('No standard cash award, fee waiver or equity percentage is verified for this entry. Request the current written offer.','本条未核实统一现金资助、免费权益或股权比例，请索取现行书面方案。');
 s+=heading('Contact and location','联系与位置',1);
 if(e.contact)s+=p(e.contact,e.contactZh);
 if(e.website)s+=p(link('Official website / intake route','官网／对接入口',e.website),link('Official website / intake route','官网／对接入口',e.website));
 else s+=p(link('Official evidence and authority route','官方来源与主管部门入口',source(e.source).url),link('Official evidence and authority route','官方来源与主管部门入口',source(e.source).url));
 if(e.phone)s+=p(`Telephone: ${e.phone}.`,`电话：${e.phone}。`);
 if(e.email)s+=p(link(`Email: ${e.email}`,`邮箱：${e.email}`,`mailto:${e.email}`),link(`Email: ${e.email}`,`邮箱：${e.email}`,`mailto:${e.email}`));
 if(e.address)s+=p(`Published address: ${e.address}.`,`公布地址：${e.addressZh}。`);
 if(!e.phone&&!e.email)s+=p('A direct program phone or email is not verified here. Use the official route and request the responsible team; no contact has been invented.','本版未核实项目直线电话或邮箱。请通过官方渠道索取负责团队，本图谱不编造联系人。');
 s+=p(e.coords?'Map point is approximate, based on the published street context; it is not an entrance or navigation coordinate.':'Map position uses a district or campus anchor; it is not a verified office location.',e.coords?'地图点依据公布街道信息近似定位，不是入口或导航坐标。':'地图位置使用区级或校区锚点，并非核实后的办公室位置。');
 s+=heading('Application workflow','申请流程',1)+workflow(e.workflow);
 if(e.category==='University')s+=p('Confirm whether external founders can apply, whether student or alumni status is required, who owns the research IP, and whether support is a service, a loan, a grant or equity. The thematic match in this profile is editorial guidance.','确认外部创业者能否申请、是否要求在校或校友身份、科研知识产权权属，以及支持属于服务、贷款、补助还是股权。本档案的主题匹配为编辑建议。');
 s+=p(doc(`${dname(e.district)} district route`,`${dzh(e.district)}对接路径`,e.district==='citywide'?'/funding':`/districts/${e.district}`),doc(`${dname(e.district)} district route`,`${dzh(e.district)}对接路径`,e.district==='citywide'?'/funding':`/districts/${e.district}`));
 write(`docs/entities/${e.id}.rst`,s);
}

let fundingIndex=heading('Funding, without mixing the mechanisms','资金路径：分清不同机制')+p(`${funding.length} researched routes. We distinguish equity-free support from repayable debt, credits and investment. No item is labelled open merely because its policy or web page exists.`,`${funding.length}条研究路径，区分不占股支持、须偿还债务、积分及投资。不会仅因政策或网页存在便标记正在开放。`)+p(doc('Read the funding guide first','先阅读资金指南','funding-guide'),doc('Read the funding guide first','先阅读资金指南','funding-guide'));
fundingIndex+='.. toctree::\n   :maxdepth: 1\n\n'+funding.map(f=>'   funding/'+f.id).join('\n')+'\n';
write('docs/funding.rst',fundingIndex);
for(const f of funding){
 let s=heading(f.name,f.zh)+p(`${f.type} | ${dname(f.district)}`,`${cn(f.type)}｜${dzh(f.district)}`)+p(f.status,cn(f.status))+evidence(f.source);
 s+=heading('Amount and mechanism','额度与机制',1)+p(f.amount,f.amountZh)+p(f.equity,cn(f.equity));
 s+=heading('Eligibility and timing','资格与时间',1)+p(f.eligibility,f.eligibilityZh)+p(f.deadline,f.deadlineZh||translateDeadline(f.deadline));
 s+=heading('Contact and application','联系与申请',1)+p(link('Official application / policy route','官方申请／政策入口',f.apply),link('Official application / policy route','官方申请／政策入口',f.apply));
 if(f.phone)s+=p(`Published consultation: ${f.phone}.`,`公布咨询电话：${f.phone}。`);
 if(f.email)s+=p(link(f.email,f.email,`mailto:${f.email}`),link(f.email,f.email,`mailto:${f.email}`));
 if(!f.phone&&!f.email)s+=p('The linked authority or operator is the contact route. A direct current program contact is not established in this profile.','请通过所链主管部门或运营方联系，本档案未核实现任项目直接联系人。');
 s+=workflow(f.workflow);
 s+=p('The published maximum is a ceiling, not an entitlement. Check the applicable notice, eligible cost period, other public support and written payment conditions.','公布最高额为上限，不构成当然权益。须核验适用通知、合资格支出期间、其他财政资助及书面拨付条件。');
 write(`docs/funding/${f.id}.rst`,s);
}
function translateDeadline(s){
 const pairs={
 'Policy: 1 Sep 2025 to 31 Aug 2030':'政策有效期：2025年9月1日至2030年8月31日',
 'Policy: 9 Dec 2025 to 8 Dec 2030':'政策有效期：2025年12月9日至2030年12月8日',
 'Closed 31 Aug 2026, 16:00 China Standard Time':'已于2026年8月31日中国标准时间16:00截止',
 'Policy through 31 Aug 2030':'政策有效期至2030年8月31日',
 'Confirm applicable implementing notice':'核验适用实施通知',
 'Confirm branch intake and review schedule':'确认受理分会及评审安排',
 'Confirm current HRSS service rules':'核验现行人社服务规则',
 'Annual tax filing and applicable rules':'按年度纳税申报及适用规则',
 'Recognition batches and annual filing':'按认定批次及年度申报',
 'Check the specific 2026 track; not labelled open':'核验2026年具体赛道，不标记正在开放',
 'Confirm track and division dates':'确认赛道及分赛区日期',
 'Confirm category deadline and host review':'确认类别截止日期及依托单位审核',
 'Online application; regional eligibility review':'在线申请，须地区资格审核',
 'Confirm current package and expiration':'确认现行支持包及到期',
 'Confirm current application and credit validity':'确认现行申请及积分有效期',
 'Manager-led sourcing and due diligence':'管理人开展项目筛选与尽调',
 'Investment committee process; no guaranteed award':'经投委会程序，不保证获资',
 'Quarterly claims; confirm the current batch':'按季度申报，确认当前批次',
 'First batch closed 27 May 2026, 16:00 China Standard Time; notice plans quarterly follow-ups':'首批已于2026年5月27日中国标准时间16:00截止，通知计划后续按季度受理',
 'Product-specific':'依具体产品',
 'Track-specific notices':'依赛道通知',
 };
 if(!pairs[s])throw new Error(`Missing deadline translation: ${s}`);return pairs[s];
}

let register=heading('The higher-education register','高等教育机构名录')+p('We use the Ministry of Education list dated 17 June 2026, published 18 June 2026. The downloaded source workbooks are retained in the repository. Institutional inclusion does not prove a startup program, available funding or admission for an external founder.','采用教育部截至2026年6月17日、6月18日公布的名单，源工作簿保存在仓库。列入名录不代表存在创业计划、可用资金或接受外部创业者。')+evidence('moe.gov.cn/jyb_xxgk');
register+=heading('40 undergraduate institutions','40所本科院校',1);
for(const u of universityEntities)register+=bullet(doc(`${u.name} / ${u.zh}`,u.zh,`/entities/${u.id}`)+` (${u.code})`,doc(`${u.name} / ${u.zh}`,u.zh,`/entities/${u.id}`)+` (${u.code})`);
register+='\n'+heading('29 diploma colleges','29所专科院校',1)+p('Chinese legal names and institution codes follow the official workbook. Program contacts and startup funding for these colleges have not been individually verified. Use the official education register to confirm the institution before seeking its research-cooperation or entrepreneurship office.','中文法定名称与学校标识码依官方工作簿。本版尚未逐校核实专科院校的创业联系及资金，请先通过官方教育名录确认机构，再咨询科研合作或创业部门。');
for(const r of registry.filter(x=>x.level==='专科'))register+=bullet(`${r.zh} (${r.code})`,`${r.zh} (${r.code})`);
register+='\n'+heading('12 adult higher-education institutions','12所成人高校',1)+p('A separate Ministry register; these are not added to the 69 ordinary institutions. Names and codes are authoritative register entries, not a claim of a verified startup program.','来自教育部独立名录，不计入69所普通高校。名称及代码为官方名录信息，不代表已核实创业项目。');
for(const r of adult)register+=bullet(`${r.zh} (${r.code})`,`${r.zh} (${r.code})`);
register+='\n'+heading('Additional specialist routes','其他专业路径',1)+p(link('CEIBS official institutional route','中欧国际工商学院官方入口','https://www.ceibs.edu/')+'. '+tr('CEIBS appears in Shanghai\'s international education directory and is listed separately here; no specific startup funding offer has been verified.','中欧国际工商学院列于上海国际教育目录，本图谱另列；尚未核实具体创业资助。'),link('CEIBS official institutional route','中欧国际工商学院官方入口','https://www.ceibs.edu/')+'. '+translations.get('CEIBS appears in Shanghai\'s international education directory and is listed separately here; no specific startup funding offer has been verified.'));
register+=evidence('edu.sh.gov.cn/study_cn_school');
write('docs/university-register.rst',register);

let atlas=heading('Explore the Shanghai ecosystem','探索上海创新生态')+p('Select a district, search a Chinese or English organization name, and filter by organization type or funding mechanism. Each result opens a sourced profile with contact and application steps.','选择行政区，搜索中英文机构名称，按类型或资助机制筛选。每个结果均可打开附来源、联系与申请步骤的档案。');
atlas+='.. only:: html\n\n   .. raw:: html\n\n      <div id="atlas-app" aria-live="polite"></div>\n      <noscript><p>Use the district and directory links below. / 请使用下方行政区与目录链接。</p></noscript>\n\n';
atlas+=p(doc('Browse all district chapters','浏览全部行政区章节','districts')+' | '+doc('Browse funding','浏览资金','funding'),doc('Browse all district chapters','浏览全部行政区章节','districts')+' | '+doc('Browse funding','浏览资金','funding'));
atlas+='.. only:: pdf\n\n   '+tr('The website provides the interactive map. The printed district map and the directory chapters provide the same routes without requiring a device.','网站提供交互地图。纸本行政区地图与目录章节提供相同对接路径，无需设备。')+'\n';
write('docs/atlas.rst',atlas);

const tree=['reading-the-city','atlas','software-ai','hardware-ai','districts','universities','university-register','incubation','research','corporate','government','funding-guide','funding','investors','apply','methodology','sources'];
let index=heading('Shanghai Ecosystem Atlas','上海创新生态图谱')+p('The Pearl of the Orient. A field guide to research, enterprise and possibility.','东方明珠。连接科研、企业与机遇的实用图谱。')+p('An illustrated English and Simplified Chinese guide for accelerators, founders, researchers and AI enthusiasts. Explore Shanghai\'s districts, universities, innovation programs, software and hardware AI, and the practical routes to support.','为加速器、创始人、研究者及人工智能爱好者编写的中英双语插图指南，探索上海各区、高校、创新计划、软件与硬件人工智能，以及获得支持的实用路径。');
index+=p(`Research edition: ${checked}. ${allEntities.length} organization profiles. ${funding.length} funding routes. 16 districts.`, `研究版本：${checked}。${allEntities.length}份机构档案，${funding.length}条资金路径，覆盖16个区。`);
index+=p(doc('Explore the interactive atlas','探索交互图谱','atlas')+' | '+doc('Find funding','寻找资金','funding')+' | '+doc('Plan an application','规划申请','apply'),doc('Explore the interactive atlas','探索交互图谱','atlas')+' | '+doc('Find funding','寻找资金','funding')+' | '+doc('Plan an application','规划申请','apply'));
index+='.. toctree::\n   :maxdepth: 2\n   :hidden:\n\n'+tree.map(x=>'   '+x).join('\n')+'\n';
write('docs/index.rst',index);

let bibliography=heading('Sources and reading room','来源与阅读室')+p('These are the sources used by the profiles and editorial chapters. Access dates refer to the research session. Source languages are preserved. Institutional registers and mapped boundaries have different purposes from current application notices.','下列来源用于机构档案及编辑章节。访问日期指本次研究，保留来源原语言。机构名录、地图边界与现行申报通知的用途不同。');
for(const s of used){bibliography+=heading(s.id,s.id,1)+p(link(s.title,s.title,s.url),link(s.title,s.title,s.url))+p(`Source URL: ${s.url}`,`来源网址：${s.url}`)+p(`Source language: ${s.language}. Research date: ${checked}.`,`来源语言：${s.language}。研究日期：${checked}。`);}
write('docs/sources.rst',bibliography);
const dataset={checked,districts:districts.map(d=>({...d,source:source(d.source)})),entities:allEntities.map(e=>({...e,source:source(e.source),status:e.status||'Published entity; intake to confirm',url:`entities/${e.id}.html`})),funding:funding.map(f=>({...f,source:source(f.source),url:`funding/${f.id}.html`,deadlineZh:f.deadlineZh||translateDeadline(f.deadline)})),labels,sources:used,counts:{entities:allEntities.length,funding:funding.length,undergraduate:40,diploma:29,adult:adult.length,districts:16}};
write('docs/_static/atlas/catalog.json',JSON.stringify(dataset,null,2)+'\n');
write('docs/_static/atlas/catalog.js','window.SHANGHAI_ATLAS='+JSON.stringify(dataset)+';\n');
write('docs/_static/atlas/geometry.js','window.SHANGHAI_GEOMETRY='+fs.readFileSync('data/shanghai-districts.geojson','utf8')+';\n');
write('data/published-sources.json',JSON.stringify(used,null,2)+'\n');
write('data/translation-pairs.json',JSON.stringify(Object.fromEntries(translations),null,2)+'\n');
console.log(`Generated ${allEntities.length} profiles, ${funding.length} funding routes, ${used.length} cited sources and ${translations.size} translation pairs.`);
