import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);
fs.mkdirSync('docs/downloads', { recursive: true });

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s.replace(/\n+$/, '\n'));
};

const catalogData = read('data/catalog.json');
const districtFunding = read('data/district-funding.json');
const { universities, universityDetails } = read('data/universities.json');
const { chapters, workflows } = read('data/chapters.json');
const i18nData = read('data/i18n.json');
const registry = read('data/university-register.json');
const adult = read('data/adult-college-register.json');

const { checked, districts, entities, citywideFunding } = catalogData;
const funding = [...citywideFunding, ...districtFunding];

const LANGS = ['zh_CN', 'hi', 'ja', 'ko', 'de', 'es'];
const maps = Object.fromEntries(LANGS.map(l => [l, new Map()]));

function register(en, dict) {
  if (!en) throw new Error('Empty English source string');
  for (const lang of LANGS) {
    let val = dict[lang];
    if (!val) throw new Error(`Missing ${lang} translation for: ${en}`);
    const m = maps[lang];
    val = val.replace(/:doc:`[^`]+`|`[^`]+ <[^>]+>`_/g, s => m.get(s) || s);
    if (m.has(en)) {
      continue;
    }
    m.set(en, val);
  }
  return en;
}

const st = en => ({
  zh_CN: null,
  hi: i18nData.hi.structural[en],
  ja: i18nData.ja.structural[en],
  ko: i18nData.ko.structural[en],
  de: i18nData.de.structural[en],
  es: i18nData.es.structural[en]
});

const trS = (en, zh) => register(en, { ...st(en), zh_CN: zh });

function heading(en, dict, level = 0) {
  const s = typeof dict === 'string' ? trS(en, dict) : register(en, dict);
  return `${s}\n${['=', '-', '~', '^'][level].repeat(Math.max(s.length, 12))}\n\n`;
}
const p = (en, dict) => `${typeof dict === 'string' ? trS(en, dict) : register(en, dict)}\n\n`;
const bullet = (en, dict) => `* ${typeof dict === 'string' ? trS(en, dict) : register(en, dict)}\n`;

function link(en, dict, url) {
  const obj = typeof dict === 'string' ? { ...st(en), zh_CN: dict } : dict;
  const wrapped = Object.fromEntries(LANGS.map(l => [l, `\`${obj[l]} <${url}>\`_`]));
  return register(`\`${en} <${url}>\`_`, wrapped);
}

function doc(en, dict, target) {
  const obj = typeof dict === 'string' ? { ...st(en), zh_CN: dict } : dict;
  const wrapped = Object.fromEntries(LANGS.map(l => [l, `:doc:\`${obj[l]} <${target}>\``]));
  return register(`:doc:\`${en} <${target}>\``, wrapped);
}

const sourceBank = [
  ...read('data/research-index.json'),
  ...read('data/extra-sources.json'),
  { title: 'National higher education institutions, June 2026', url: 'https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202606/t20260618_1441074.html', accessed: checked, language: 'zh-CN' },
  { title: 'Shanghai municipal flower and overview', url: 'https://english.shanghai.gov.cn/en-Overview/', accessed: checked, language: 'en' },
  { title: 'DataV Shanghai district geometry', url: 'https://geo.datav.aliyun.com/areas_v3/bound/310000_full.json', accessed: checked, language: 'zh-CN' },
  { title: 'STEFG application and program introduction', url: 'https://fund.stefg.org/Angel/Intro.aspx', accessed: checked, language: 'zh-CN' },
  { title: 'Shanghai Lida University official website', url: 'https://www.lidapoly.edu.cn/', accessed: checked, language: 'zh-CN' },
];
const used = [];
function source(fragment) {
  let s = sourceBank.find(x => x.url.includes(fragment) || x.title.includes(fragment));
  if (!s) throw new Error(`Missing source: ${fragment}`);
  let existing = used.find(x => x.url === s.url);
  if (!existing) {
    existing = { ...s, id: `S${String(used.length + 1).padStart(3, '0')}` };
    used.push(existing);
  }
  return existing;
}

const EV_WORD = { zh_CN: '证据', hi: 'साक्ष्य', ja: '出典', ko: '근거', de: 'Nachweis', es: 'Evidencia' };
function evidence(fragment) {
  const s = source(fragment);
  const lnk = link(
    `Evidence ${s.id}`,
    Object.fromEntries(LANGS.map(l => [l, `${EV_WORD[l]} ${s.id}`])),
    s.url
  );
  return p(
    `${lnk}. ${s.title}.`,
    Object.fromEntries(LANGS.map(l => [l, `${maps[l].get(lnk)}. ${s.title}.`]))
  );
}

const labels = {
  'Incubator': '孵化器', 'Accelerator': '加速器', 'Technology park': '科技园区', 'Research platform': '科研平台', 'Corporate program': '企业创新计划', 'Global program': '全球计划', 'Investor': '投资机构', 'University': '高校', 'Government': '政府部门',
  'Software AI': '软件人工智能', 'Hardware AI': '硬件人工智能', 'Chips': '芯片', 'Sensors': '传感器', 'Robotics': '机器人', 'Health': '健康', 'AI for Science': '科学智能', 'Industry': '产业', 'Mobility': '交通', 'Materials': '材料', 'Drones': '无人机', 'Climate': '气候', 'Agriculture': '农业', 'Consumer': '消费',
  'Grant': '补助', 'Reimbursement': '报销支持', 'Loan': '贷款', 'Equity investment': '股权投资', 'Tax relief': '税收优惠', 'Competition': '比赛', 'In-kind services': '实物与服务支持', 'Cloud credits': '云积分', 'Loan / insurance': '贷款与保险', 'Grant / market access': '补助与市场准入',
  'Grant / reimbursement': '补助与报销', 'Convertible support': '可转股支持', 'Potential equity conversion; review contract': '可能转为股权，须审核协议',
  'Published directory; lender review': '目录已公布，须贷款方审核',
  'No equity': '不占股', 'No equity; repayable': '不占股，须偿还', 'Temporary equity; original-price exit': '临时股权，原价退出', 'Award / investment terms vary': '奖励与投资条款各异', 'No equity stated in offer; verify terms': '所述方案无股权要求，须核验协议', 'Verify current agreement': '核验现行协议', 'Negotiated equity': '协商股权', 'No equity; product obligations apply': '不占股，适用产品义务', 'No equity for qualifying public support': '合资格财政支持不占股',
  'Program published; eligibility review': '项目已公布，须资格审核', 'Historical / confirm continuation': '历史项目，须确认延续', 'Regional eligibility to confirm': '地区资格待确认', 'Published entity; intake to confirm': '机构有来源，招募待确认',
  'Services / possible incentives': '空间服务／潜在政策激励', 'Equity-free services': '不占股服务', 'Loan / temporary equity': '贷款／临时股权',
  'Closed': '已截止', 'Policy in force; confirm service and order': '政策有效，须核验服务与订单', 'Policy in force; call not confirmed open': '政策有效，未确认正在申报', 'Published policy; implementing intake to confirm': '政策已公布，实施受理待确认', 'Published service; current terms to confirm': '服务已公布，现行条款待确认', 'Published tax guidance; applicability review': '税务指引已公布，适用性待核验', 'Published tax guidance; recognition required': '税务指引已公布，须认定', '2026 call published; deadline check required': '2026通知已公布，须核验截止日', '2026 competition published; track intake to confirm': '2026赛事已公布，赛道受理待确认', '2026 call published; not confirmed open': '2026通知已公布，未确认正在受理', 'Fund announced; deal intake to confirm': '基金已公布，项目受理待确认', 'Published investment platform; deal review': '投资平台已公布，须项目审核', 'Quarterly scheme published; current intake to confirm': '季度机制已公布，当前批次待确认', 'First 2026 batch closed; later batches to verify': '2026首批已截止，后续批次待核验', '2026 directory published; lender review': '2026清单已公布，须贷款方审核', 'Published route; current call to confirm': '路径已公布，现行申报待确认',
};
const lbl = (s, lang) => {
  if (!s) return '';
  if (lang === 'zh_CN') return labels[s] || s;
  return i18nData[lang]?.labels?.[s] || s;
};
for (const [a, b] of Object.entries(labels)) {
  register(a, Object.fromEntries(LANGS.map(l => [l, lbl(a, l)])));
}

const CITYWIDE_NAME = {
  zh_CN: '全市／全球',
  hi: 'शहर-व्यापी / वैश्विक',
  ja: '全市／グローバル',
  ko: '상하이 전역 / 글로벌',
  de: 'Stadtweit / global',
  es: 'Toda la ciudad / global'
};
const dname = id => districts.find(x => x.id === id)?.name || 'Citywide / global';
const dnameL = (id, lang) => {
  const d = districts.find(x => x.id === id);
  if (!d) return CITYWIDE_NAME[lang];
  if (lang === 'zh_CN') return d.zh;
  return i18nData[lang]?.districts?.[id]?.name || d.name;
};
const dfocusL = (d, lang) => lang === 'zh_CN' ? d.focusZh : (i18nData[lang]?.districts?.[d.id]?.focus || d.focus);
const downerL = (d, lang) => lang === 'zh_CN' ? d.ownerZh : (i18nData[lang]?.districts?.[d.id]?.owner || d.owner);
const dnoteL = (d, lang) => lang === 'zh_CN' ? d.noteZh : (i18nData[lang]?.districts?.[d.id]?.note || d.note);

function workflow(key) {
  const k = key || 'incubation';
  let s = p('Editorial application checklist. The current official notice or agreement controls the actual procedure.', '编辑申请清单，实际流程以现行官方通知或协议为准。');
  for (const [idx, [en, zh]] of workflows[k].entries()) {
    s += `#. ${register(en, {
      zh_CN: zh,
      hi: i18nData.hi.workflows[k][idx],
      ja: i18nData.ja.workflows[k][idx],
      ko: i18nData.ko.workflows[k][idx],
      de: i18nData.de.workflows[k][idx],
      es: i18nData.es.workflows[k][idx]
    })}\n\n`;
  }
  return s;
}

const UNI_SUMMARY_TPL = {
  hi: (fit) => `जून 2026 के शिक्षा मंत्रालय के रजिस्टर में संस्थागत प्रविष्टि। सुझाए गए सहयोग विषय: ${fit}। ये विषय संपादकीय मार्गदर्शन हैं, न कि प्रयोगशाला प्रवेश या स्टार्टअप फंडिंग का सत्यापित प्रस्ताव।`,
  ja: (fit) => `2026年6月の教育部名簿に掲載された機関プロファイル。推奨される連携テーマ：${fit}。これらは編集上の案内であり、研究室の受け入れやスタートアップ資金提供を保証するものではありません。`,
  ko: (fit) => `2026년 6월 교육부 명부에 등재된 기관 프로필. 권장 협력 주제: ${fit}. 이 주제들은 편집상의 안내이며, 실험실 출입이나 창업 자금 지원이 검증된 제안은 아닙니다.`,
  de: (fit) => `Institutioneller Eintrag im Hochschulregister des Bildungsministeriums vom Juni 2026. Vorgeschlagene Kooperationsthemen: ${fit}. Diese Themen dienen der redaktionellen Orientierung und stellen kein verifiziertes Angebot für Laborzugang oder Startup-Förderung dar.`,
  es: (fit) => `Registro institucional en el padrón del Ministerio de Educación de junio de 2026. Temas de colaboración sugeridos: ${fit}. Estos temas constituyen una orientación editorial y no una oferta verificada de acceso a laboratorios o financiación para startups.`
};

const universityEntities = universities.map(([uid, name, zh, district, domain, fit, fitZh]) => {
  const info = universityDetails[uid] || {};
  const record = registry.find(x => x.zh === zh);
  if (!record) throw new Error(`University not in official register: ${zh}`);
  return {
    id: `university-${uid}`,
    uid,
    name,
    zh,
    district,
    category: 'University',
    sectors: [],
    website: `https://${domain === 'shanghai.nyu.edu' ? '' : 'www.'}${domain}/`,
    summary: `Institutional entry in the June 2026 Ministry of Education register. Suggested collaboration themes: ${fit}. These themes are editorial routing guidance, not a verified offer of laboratory access or startup funding.`,
    summaryZh: `列入教育部2026年6月高校名录。建议合作主题：${fitZh}。这些主题为编辑对接建议，并非已经核实的实验室准入或创业资助承诺。`,
    workflow: 'research',
    code: record.code,
    contact: 'Official university website; request the technology-transfer, research cooperation or entrepreneurship office',
    contactZh: '通过高校官网咨询技术转移、科研合作或创业部门',
    ...info,
    source: info.source || 'moe.gov.cn/jyb_xxgk',
    sourceDetail: info.sourceDetail || (info.source ? 'moe.gov.cn/jyb_xxgk' : undefined),
    sourceExtra: info.sourceDetail ? 'moe.gov.cn/jyb_xxgk' : undefined
  };
});

const allEntities = [...entities, ...universityEntities];
for (const d of districts) {
  allEntities.push({
    id: `government-${d.id}`,
    govDistrictId: d.id,
    name: d.owner,
    zh: d.ownerZh,
    district: d.id,
    category: 'Government',
    sectors: [],
    summary: d.note,
    summaryZh: d.noteZh,
    source: d.source,
    website: `https://www.${d.domain}/`,
    phone: d.phone,
    workflow: 'grant'
  });
}

const eNameL = (e, lang) => {
  if (lang === 'zh_CN') return e.zh;
  if (e.uid) return i18nData[lang]?.universities?.[e.uid]?.name || e.name;
  if (e.govDistrictId) return i18nData[lang]?.districts?.[e.govDistrictId]?.owner || e.name;
  return i18nData[lang]?.entities?.[e.id]?.name || e.name;
};
const eSummaryL = (e, lang) => {
  if (lang === 'zh_CN') return e.summaryZh;
  if (e.uid) {
    const fitL = i18nData[lang]?.universities?.[e.uid]?.fit || e.summary;
    return UNI_SUMMARY_TPL[lang](fitL);
  }
  if (e.govDistrictId) return i18nData[lang]?.districts?.[e.govDistrictId]?.note || e.summary;
  return i18nData[lang]?.entities?.[e.id]?.summary || e.summary;
};
const eAddressL = (e, lang) => {
  if (!e.address) return '';
  if (lang === 'zh_CN') return e.addressZh || e.address;
  if (e.uid) return i18nData[lang]?.universities?.[e.uid]?.address || e.address;
  return i18nData[lang]?.entities?.[e.id]?.address || e.address;
};
const eContactL = (e, lang) => {
  if (!e.contact) return '';
  if (lang === 'zh_CN') return e.contactZh || e.contact;
  if (e.uid) {
    if (e.contact === 'Official university website; request the technology-transfer, research cooperation or entrepreneurship office') {
      return i18nData[lang]?.structural?.[e.contact] || e.contact;
    }
    return i18nData[lang]?.universities?.[e.uid]?.contact || e.contact;
  }
  return i18nData[lang]?.entities?.[e.id]?.contact || e.contact;
};

const fNameL = (f, lang) => lang === 'zh_CN' ? f.zh : (i18nData[lang]?.funding?.[f.id]?.name || f.name);
const fAmountL = (f, lang) => lang === 'zh_CN' ? f.amountZh : (i18nData[lang]?.funding?.[f.id]?.amount || f.amount);
const fEligL = (f, lang) => lang === 'zh_CN' ? f.eligibilityZh : (i18nData[lang]?.funding?.[f.id]?.eligibility || f.eligibility);

function translateDeadline(s, lang = 'zh_CN') {
  const pairs = {
    'Policy: 1 Sep 2025 to 31 Aug 2030': '政策有效期：2025年9月1日至2030年8月31日',
    'Policy: 9 Dec 2025 to 8 Dec 2030': '政策有效期：2025年12月9日至2030年12月8日',
    'Closed 31 Aug 2026, 16:00 China Standard Time': '已于2026年8月31日中国标准时间16:00截止',
    'Policy through 31 Aug 2030': '政策有效期至2030年8月31日',
    'Confirm applicable implementing notice': '核验适用实施通知',
    'Confirm branch intake and review schedule': '确认受理分会及评审安排',
    'Confirm current HRSS service rules': '核验现行人社服务规则',
    'Annual tax filing and applicable rules': '按年度纳税申报及适用规则',
    'Recognition batches and annual filing': '按认定批次及年度申报',
    'Check the specific 2026 track; not labelled open': '核验2026年具体赛道，不标记正在开放',
    'Confirm track and division dates': '确认赛道及分赛区日期',
    'Confirm category deadline and host review': '确认类别截止日期及依托单位审核',
    'Online application; regional eligibility review': '在线申请，须地区资格审核',
    'Confirm current package and expiration': '确认现行支持包及到期',
    'Confirm current application and credit validity': '确认现行申请及积分有效期',
    'Manager-led sourcing and due diligence': '管理人开展项目筛选与尽调',
    'Investment committee process; no guaranteed award': '经投委会程序，不保证获资',
    'Quarterly claims; confirm the current batch': '按季度申报，确认当前批次',
    'First batch closed 27 May 2026, 16:00 China Standard Time; notice plans quarterly follow-ups': '首批已于2026年5月27日中国标准时间16:00截止，通知计划后续按季度受理',
    'Product-specific': '依具体产品',
    'Track-specific notices': '依赛道通知',
  };
  if (lang === 'zh_CN') {
    if (!pairs[s]) throw new Error(`Missing deadline translation: ${s}`);
    return pairs[s];
  }
  return i18nData[lang]?.deadlines?.[s] || s;
}
const fDeadlineL = (f, lang) => {
  if (lang === 'zh_CN') return f.deadlineZh || translateDeadline(f.deadline, 'zh_CN');
  return i18nData[lang]?.funding?.[f.id]?.deadline || translateDeadline(f.deadline, lang);
};

const ids = new Set();
for (const e of allEntities) {
  if (ids.has(e.id)) throw new Error(`Duplicate ${e.id}`);
  ids.add(e.id);
  source(e.source);
  if (e.sourceDetail) source(e.sourceDetail);
  if (e.sourceExtra) source(e.sourceExtra);
}
for (const f of funding) source(f.source);

// 1. Narrative Chapters
for (const [id, c] of Object.entries(chapters)) {
  const titleDict = Object.fromEntries(LANGS.map(l => [l, l === 'zh_CN' ? c.title[1] : i18nData[l].chapters[id].title]));
  const introDict = Object.fromEntries(LANGS.map(l => [l, l === 'zh_CN' ? c.intro[1] : i18nData[l].chapters[id].intro]));
  let s = heading(c.title[0], titleDict) + p(c.intro[0], introDict);
  if (id === 'reading-the-city') {
    s += '.. figure:: _static/atlas/shanghai-map.svg\n   :alt: Illustrative Shanghai district map, with numbered district anchors and a bilingual legend.\n   :width: 100%\n\n   ' +
      trS('Sixteen districts, connected by people, research and industry.', '十六个区，以人才、科研及产业相连。') + '\n\n';
  }
  if (id === 'software-ai') {
    s += `.. graphviz:: figures/ai-stack.dot\n   :caption: ${trS('An AI product connects models to a customer workflow.', '人工智能产品把模型连接到客户流程。')}\n   :alt: Data, compute and models support an evaluated product connected to customers.\n\n`;
  }
  if (id === 'hardware-ai') {
    s += `.. typst-diagram:: figures/hardware.typ\n   :caption: ${trS('Engineering gates from research to repeatable production.', '从科研到可重复生产的工程关口。')}\n   :alt: Research, prototype, verification, pilot production and scale form a sequence.\n\n`;
  }
  if (id === 'apply') {
    s += `.. typst-diagram:: figures/application.typ\n   :caption: ${trS('A clear application separates eligibility, evidence and the decision.', '清晰的申请区分资格、证据与决策。')}\n   :alt: Fit check leads to evidence, submission and review, with a feedback path.\n\n`;
  }
  if (id === 'funding-guide') {
    s += `.. graphviz:: figures/funding.dot\n   :caption: ${trS('Match the resource need to the financing mechanism.', '按资源需求匹配资金机制。')}\n   :alt: Technical services connect to vouchers; working capital connects to grants or debt; patient capital connects to negotiated equity.\n\n`;
  }
  for (const [secIdx, [en, zh, paras]] of c.sections.entries()) {
    const secDict = Object.fromEntries(LANGS.map(l => [l, l === 'zh_CN' ? zh : i18nData[l].chapters[id].sections[secIdx][0]]));
    s += heading(en, secDict, 1);
    for (const [pIdx, pair] of paras.entries()) {
      const pDict = Object.fromEntries(LANGS.map(l => [l, l === 'zh_CN' ? pair[1] : i18nData[l].chapters[id].sections[secIdx][1][pIdx]]));
      s += p(pair[0], pDict);
    }
  }
  if (id === 'reading-the-city') { s += evidence('english.shanghai.gov.cn/en-Overview/'); s += evidence('f4a84e6d90824c649a705ba2192e0a18.html'); }
  if (id === 'software-ai') s += evidence('cd1dcb1e5cb4449cbc36c69befafcc0a');
  if (id === 'hardware-ai') s += evidence('992800bb77b6492b97ba4a9c14c09944');
  if (id === 'apply') { s += evidence('3c543c31bce34e1b9e2bc5615a63d2df.html'); s += evidence('ceeb991fd16649f4b82f89906a3b5fff.html'); }
  if (id === 'methodology') s += evidence('geo.datav.aliyun.com');
  write(`docs/${id}.rst`, s);
}

// 2. Districts Index & 16 District Chapters
const onlyHtml = s => '.. only:: html\n\n' + s.trimEnd().split('\n').map(l => l ? '   ' + l : '').join('\n') + '\n\n';
let districtIndex = heading('Sixteen districts, sixteen entry routes', '十六区，十六条对接路径') +
  p('Every district has a chapter. We begin with its documented specialization and receiving authority, then follow the local organizations and district funding routes. An official portal remains the contact route when no current named officer or direct intake form is established.', '每个区均设章节，从有来源的产业方向和主管部门出发，再了解本地机构与区级融资与扶持渠道。尚无经核实现任联系人或直接表格时，以官方门户作为联系入口。');
districtIndex += onlyHtml('.. figure:: _static/atlas/shanghai-map.svg\n   :alt: Illustrative Shanghai district map, with numbered district anchors and a bilingual legend.\n   :width: 100%\n\n   ' +
  trS('All 16 administrative districts of Shanghai, with numbered anchors corresponding to the directory below.', '上海全部16个行政区示意图，编号锚点对应下方名录。') + '\n');

const DIST_BULLET_TPL = {
  zh_CN: (num, dLink, d, focus, owner, phone, note, lc, fc) => `**[${num}]** ${dLink} （${d.zh}）—— **${focus}**。受理部门：${owner}。${phone ? ` 公布电话：${phone}。` : ''}政策与载体说明：${note}（本区收录 ${lc} 家机构、${fc} 条区级融资与扶持渠道）。`,
  hi: (num, dLink, d, focus, owner, phone, note, lc, fc) => `**[${num}]** ${dLink} (${d.zh}) — **${focus}**। नोडल प्राधिकरण: ${owner}.${phone ? ` प्रकाशित फ़ोन: ${phone}.` : ''} नीति व कैरियर विवरण: ${note} (${lc} स्थानीय संस्थान, ${fc} ज़िला वित्तपोषण मार्ग)।`,
  ja: (num, dLink, d, focus, owner, phone, note, lc, fc) => `**[${num}]** ${dLink} （${d.zh}）— **${focus}**。担当窓口：${owner}。${phone ? ` 公開電話：${phone}。` : ''}政策・拠点注記：${note}（区内機関 ${lc} 件、区独自の資金ルート ${fc} 件）。`,
  ko: (num, dLink, d, focus, owner, phone, note, lc, fc) => `**[${num}]** ${dLink} (${d.zh}) — **${focus}**. 담당 부처: ${owner}.${phone ? ` 공개 전화: ${phone}.` : ''} 정책 및 거점 안내: ${note} (관내 기관 ${lc}개, 구 단위 자금 경로 ${fc}개).`,
  de: (num, dLink, d, focus, owner, phone, note, lc, fc) => `**[${num}]** ${dLink} (${d.zh}) — **${focus}**. Zuständige Stelle: ${owner}.${phone ? ` Veröffentlichte Telefonnummer: ${phone}.` : ''} Richtlinien- & Trägerhinweis: ${note} (${lc} lokale Organisationen, ${fc} Bezirksförderwege).`,
  es: (num, dLink, d, focus, owner, phone, note, lc, fc) => `**[${num}]** ${dLink} (${d.zh}) — **${focus}**. Autoridad receptora: ${owner}.${phone ? ` Teléfono publicado: ${phone}.` : ''} Nota de política y operadores: ${note} (${lc} organizaciones locales, ${fc} vías de financiación distrital).`
};

for (const [idx, d] of districts.entries()) {
  const localCount = allEntities.filter(e => e.district === d.id && e.category !== 'Government').length;
  const fundCount = funding.filter(f => f.district === d.id).length;
  const dLink = doc(d.name, Object.fromEntries(LANGS.map(l => [l, dnameL(d.id, l)])), `districts/${d.id}`);
  const num = String(idx + 1).padStart(2, '0');
  const phoneEn = d.phone ? ` Published phone: ${d.phone}.` : '';
  const enStr = `**[${num}]** ${dLink} (${d.zh}) — **${d.focus}**. Receiving authority: ${d.owner}.${phoneEn} Policy & carrier note: ${d.note} (${localCount} local organizations, ${fundCount} district funding routes).`;
  const dict = Object.fromEntries(LANGS.map(l => [
    l,
    DIST_BULLET_TPL[l](num, maps[l].get(dLink), d, dfocusL(d, l), downerL(d, l), d.phone, dnoteL(d, l), localCount, fundCount)
  ]));
  districtIndex += bullet(enStr, dict);
}
districtIndex += '\n.. toctree::\n   :hidden:\n\n' + districts.map(d => '   districts/' + d.id).join('\n') + '\n';
write('docs/districts.rst', districtIndex);

const PUB_CONTACT_TPL = {
  zh_CN: ph => `已公布联系电话：${ph}。`,
  hi: ph => `प्रकाशित संपर्क: ${ph}।`,
  ja: ph => `公開連絡先：${ph}。`,
  ko: ph => `공개 연락처: ${ph}.`,
  de: ph => `Veröffentlichter Kontakt: ${ph}.`,
  es: ph => `Contacto publicado: ${ph}.`
};
const DIST_ORG_BULLET_TPL = {
  zh_CN: (eLink, e, cat, sec, sum, st) => `${eLink} （${e.zh} · ${cat}${sec}）—— ${sum}【状态：${st}】`,
  hi: (eLink, e, cat, sec, sum, st) => `${eLink} (${e.zh} · ${cat}${sec}) — ${sum} [स्थिति: ${st}]`,
  ja: (eLink, e, cat, sec, sum, st) => `${eLink} （${e.zh} · ${cat}${sec}）— ${sum}［ステータス：${st}］`,
  ko: (eLink, e, cat, sec, sum, st) => `${eLink} (${e.zh} · ${cat}${sec}) — ${sum} [상태: ${st}]`,
  de: (eLink, e, cat, sec, sum, st) => `${eLink} (${e.zh} · ${cat}${sec}) — ${sum} [Status: ${st}]`,
  es: (eLink, e, cat, sec, sum, st) => `${eLink} (${e.zh} · ${cat}${sec}) — ${sum} [Estado: ${st}]`
};
const DIST_FUND_BULLET_TPL = {
  zh_CN: (fLink, f, tp, eq, amt, st, dl) => `${fLink} （${f.zh} · ${tp} · ${eq}）—— ${amt}。状态：${st}。时间：${dl}。`,
  hi: (fLink, f, tp, eq, amt, st, dl) => `${fLink} (${f.zh} · ${tp} · ${eq}) — ${amt}। स्थिति: ${st}। समय-सीमा: ${dl}।`,
  ja: (fLink, f, tp, eq, amt, st, dl) => `${fLink} （${f.zh} · ${tp} · ${eq}）— ${amt}。ステータス：${st}。時期：${dl}。`,
  ko: (fLink, f, tp, eq, amt, st, dl) => `${fLink} (${f.zh} · ${tp} · ${eq}) — ${amt}. 상태: ${st}. 일정: ${dl}.`,
  de: (fLink, f, tp, eq, amt, st, dl) => `${fLink} (${f.zh} · ${tp} · ${eq}) — ${amt}. Status: ${st}. Zeitrahmen: ${dl}.`,
  es: (fLink, f, tp, eq, amt, st, dl) => `${fLink} (${f.zh} · ${tp} · ${eq}) — ${amt}. Estado: ${st}. Plazo: ${dl}.`
};

for (const d of districts) {
  let s = heading(d.name, Object.fromEntries(LANGS.map(l => [l, dnameL(d.id, l)]))) +
    p(d.focus, Object.fromEntries(LANGS.map(l => [l, dfocusL(d, l)]))) +
    p(d.note, Object.fromEntries(LANGS.map(l => [l, dnoteL(d, l)]))) +
    evidence(d.source);
  s += heading('Who receives the inquiry', '咨询受理', 1) +
    p(d.owner, Object.fromEntries(LANGS.map(l => [l, downerL(d, l)])));
  const webLink = link('Official district website', '区政府官网', `https://www.${d.domain}/`);
  s += p(webLink, Object.fromEntries(LANGS.map(l => [l, maps[l].get(webLink)])));
  if (d.phone) {
    s += p(`Published contact: ${d.phone}.`, Object.fromEntries(LANGS.map(l => [l, PUB_CONTACT_TPL[l](d.phone)])));
  } else {
    s += p('A current direct program phone or email is not established in this record. Use the official website to request the named receiving team.', '本记录未核实现行项目直线电话或邮箱。请通过官网索取具体受理团队。');
  }
  s += heading('Before applying', '申请之前', 1) + workflow('grant');
  s += p('Ask which current notice governs the project, whether registration and actual operations must both be in the district, which expenditure period is eligible, and whether previous municipal or district awards exclude a claim. Obtain the answer before moving a company or incurring costs.', '询问适用的现行通知、注册与经营是否均须属地、可计入支出期间，以及已获市区资助是否影响申报。应在迁移企业或发生费用之前获得答复。');
  s += heading('Local organizations in this atlas', '本图谱中的本区机构', 1);
  const local = allEntities.filter(e => e.district === d.id && e.category !== 'Government');
  for (const e of local) {
    const eLink = doc(e.name, Object.fromEntries(LANGS.map(l => [l, eNameL(e, l)])), `/entities/${e.id}`);
    const secEn = e.sectors?.length ? ` · ${e.sectors.join(', ')}` : '';
    const stKey = e.status || 'Published entity; intake to confirm';
    const enStr = `${eLink} (${e.zh} · ${e.category}${secEn}) — ${e.summary} [Status: ${stKey}]`;
    const dict = Object.fromEntries(LANGS.map(l => {
      const sep = l === 'zh_CN' || l === 'ja' ? '、' : ', ';
      const secL = e.sectors?.length ? ` · ${e.sectors.map(x => lbl(x, l)).join(sep)}` : '';
      return [l, DIST_ORG_BULLET_TPL[l](maps[l].get(eLink), e, lbl(e.category, l), secL, eSummaryL(e, l), lbl(stKey, l))];
    }));
    s += bullet(enStr, dict);
  }
  s += '\n' + heading('Funding routes', '融资与扶持渠道', 1);
  const funds = funding.filter(f => f.district === d.id);
  for (const f of funds) {
    const fLink = doc(f.name, Object.fromEntries(LANGS.map(l => [l, fNameL(f, l)])), `/funding/${f.id}`);
    const enStr = `${fLink} (${f.zh} · ${f.type} · ${f.equity}) — ${f.amount}. Status: ${f.status}. Timing: ${f.deadline}.`;
    const dict = Object.fromEntries(LANGS.map(l => [
      l,
      DIST_FUND_BULLET_TPL[l](maps[l].get(fLink), f, lbl(f.type, l), lbl(f.equity, l), fAmountL(f, l), lbl(f.status, l), fDeadlineL(f, l))
    ]));
    s += bullet(enStr, dict);
  }
  const cmpDoc = doc('Also compare citywide funding', '同时比较全市融资与扶持渠道', '/funding');
  s += '\n' + p(cmpDoc, Object.fromEntries(LANGS.map(l => [l, maps[l].get(cmpDoc)])));
  write(`docs/districts/${d.id}.rst`, s);
}

// 3. Category directories and organization profiles
const GROUP_COUNT_TPL = {
  zh_CN: n => `${n}份档案，附来源、联系渠道及申请清单。机构存在与当前招募情况分别标注。`,
  hi: n => `साक्ष्य, संपर्क मार्ग और आवेदन चेकलिस्ट के साथ ${n} प्रोफ़ाइल। प्रकाशित अस्तित्व और वर्तमान प्रवेश को अलग-अलग दर्शाया गया है।`,
  ja: n => `出典、連絡ルート、申請チェックリスト付きの ${n} 件のプロファイル。機関の存在と現在の募集状況は区別して記載しています。`,
  ko: n => `출처, 연락 경로 및 신청 체크리스트가 포함된 ${n}개의 프로필. 기관의 존재 여부와 현재 모집 여부는 구분하여 표기합니다.`,
  de: n => `${n} Profile mit Quellenbelegen, Kontaktwegen und Bewerbungs-Checkliste. Veröffentlichte Existenz wird von laufenden Bewerbungsrunden unterschieden.`,
  es: n => `${n} perfiles con evidencia, vías de contacto y lista de verificación de solicitud. La existencia publicada se distingue de la recepción activa de candidaturas.`
};

const groups = [
  ['universities', 'Universities and commercialization', '高校与成果转化', ['University']],
  ['incubation', 'Incubators, accelerators and parks', '孵化器、加速器及园区', ['Incubator', 'Accelerator', 'Technology park']],
  ['research', 'Research and technical platforms', '科研与技术平台', ['Research platform']],
  ['corporate', 'Corporate and global programs', '企业与全球计划', ['Corporate program', 'Global program']],
  ['investors', 'Investors and patient capital', '投资机构与耐心资本', ['Investor']],
  ['government', 'Government entry points', '政府对接入口', ['Government']]
];

for (const [id, title, zh, categories] of groups) {
  const list = allEntities.filter(e => categories.includes(e.category));
  let s = heading(title, zh) +
    p(`${list.length} profiles with evidence, contact routes and an application checklist. Published existence is distinguished from current intake.`,
      Object.fromEntries(LANGS.map(l => [l, GROUP_COUNT_TPL[l](list.length)])));
  if (id === 'universities') {
    s += p('All 40 undergraduate institutions in the official Shanghai register have an institutional profile here. Some have documented science-park or technology-transfer contacts; others have a general institutional route. A profile does not assert that a dedicated startup program is open.', '官方上海名录中的40所本科院校均有机构档案。部分有科技园或技术转移联系渠道，其他仅有机构对接入口。档案不代表专属创业项目正在开放。');
    const regDoc = doc('Full higher-education register, including diploma and adult institutions', '含专科与成人高校的完整名录', 'university-register');
    s += p(regDoc, Object.fromEntries(LANGS.map(l => [l, maps[l].get(regDoc)])));
  }
  if (id === 'corporate') {
    s += p('Global programs are kept separate from local offices. Their China-region eligibility, service availability and account rules require direct verification. Historical corporate cohorts are marked.', '全球计划与本地办公室区分，中国地区资格、服务及账户规则须直接核实。历史企业招募另行标注。');
  }
  let htmlDir = heading('Complete directory summary', '完整机构名录摘要', 1);
  for (const e of list) {
    const eLink = doc(e.name, Object.fromEntries(LANGS.map(l => [l, eNameL(e, l)])), `entities/${e.id}`);
    const codeEn = e.code ? ` · MOE code ${e.code}` : '';
    const secEn = e.sectors?.length ? ` · Focus: ${e.sectors.join(', ')}` : '';
    const mechEn = e.funding ? ` Support: ${e.funding}.` : e.support ? ` Support: ${e.support}.` : '';
    const contactBitsEn = [e.address ? `Address: ${e.address}` : '', e.phone ? `Tel: ${e.phone}` : '', e.email ? `Email: ${e.email}` : ''].filter(Boolean).join(' | ');
    const stKey = e.status || 'Published entity; intake to confirm';
    const enStr = `${eLink} (${e.zh} · ${e.category} · ${dname(e.district)}${codeEn}${secEn}) — ${e.summary}${mechEn}${contactBitsEn ? ' ' + contactBitsEn + '.' : ''} [Status: ${stKey}]`;
    const dict = Object.fromEntries(LANGS.map(l => {
      const codeL = e.code ? (l === 'zh_CN' ? ` · 标识码 ${e.code}` : ` · MOE ${e.code}`) : '';
      const sep = l === 'zh_CN' || l === 'ja' ? '、' : ', ';
      const secL = e.sectors?.length ? (l === 'zh_CN' ? ` · 方向：${e.sectors.map(x => lbl(x, l)).join(sep)}` : ` · ${e.sectors.map(x => lbl(x, l)).join(sep)}`) : '';
      const mechL = e.funding ? (l === 'zh_CN' ? ` 支持机制：${lbl(e.funding, l)}。` : ` [${lbl(e.funding, l)}].`) : e.support ? (l === 'zh_CN' ? ` 支持说明：${lbl(e.support, l)}。` : ` [${lbl(e.support, l)}].`) : '';
      const addrL = eAddressL(e, l);
      const bitsL = [addrL ? (l === 'zh_CN' ? `地址：${addrL}` : addrL) : '', e.phone ? (l === 'zh_CN' ? `电话：${e.phone}` : `Tel: ${e.phone}`) : '', e.email ? (l === 'zh_CN' ? `邮箱：${e.email}` : `Email: ${e.email}`) : ''].filter(Boolean).join(l === 'zh_CN' ? '｜' : ' | ');
      if (l === 'zh_CN') {
        return [l, `${maps[l].get(eLink)} （${e.zh} · ${lbl(e.category, l)} · ${dnameL(e.district, l)}${codeL}${secL}）—— ${eSummaryL(e, l)}${mechL}${bitsL ? ' ' + bitsL + '。' : ''}【状态：${lbl(stKey, l)}】`];
      }
      return [l, `${maps[l].get(eLink)} (${e.zh} · ${lbl(e.category, l)} · ${dnameL(e.district, l)}${codeL}${secL}) — ${eSummaryL(e, l)}${mechL}${bitsL ? ' ' + bitsL + '.' : ''} [${lbl(stKey, l)}]`];
    }));
    htmlDir += bullet(enStr, dict);
  }
  s += onlyHtml(htmlDir);
  s += '.. toctree::\n   :maxdepth: 1\n\n' + list.map(e => '   entities/' + e.id).join('\n') + '\n';
  write(`docs/${id}.rst`, s);
}

const META_LINE_TPL = {
  zh_CN: (cat, dist, chk) => `${cat}｜${dist}｜研究核对日期 ${chk}`,
  hi: (cat, dist, chk) => `${cat} | ${dist} | शोध सत्यापन तिथि ${chk}`,
  ja: (cat, dist, chk) => `${cat}｜${dist}｜調査確認日 ${chk}`,
  ko: (cat, dist, chk) => `${cat} | ${dist} | 연구 확인일 ${chk}`,
  de: (cat, dist, chk) => `${cat} | ${dist} | Recherche geprüft am ${chk}`,
  es: (cat, dist, chk) => `${cat} | ${dist} | Investigación verificada el ${chk}`
};
const FOCUS_LINE_TPL = {
  zh_CN: list => `人工智能与产业方向：${list}。`,
  hi: list => `एआई और उद्योग फोकस: ${list}।`,
  ja: list => `AIおよび産業フォーカス：${list}。`,
  ko: list => `AI 및 산업 분야: ${list}.`,
  de: list => `KI- und Branchenfokus: ${list}.`,
  es: list => `Enfoque de IA e industria: ${list}.`
};
const MOE_LINE_TPL = {
  zh_CN: c => `教育部学校标识码：${c}。`,
  hi: c => `शिक्षा मंत्रालय संस्थान कोड: ${c}।`,
  ja: c => `教育部機関コード：${c}。`,
  ko: c => `교육부 학교 식별 코드: ${c}.`,
  de: c => `Institutionencode des Bildungsministeriums (MOE): ${c}.`,
  es: c => `Código institucional del Ministerio de Educación (MOE): ${c}.`
};
const SUP_LINE_TPL = {
  zh_CN: v => `已公布支持说明：${v}。`,
  hi: v => `प्रकाशित सहायता विवरण: ${v}।`,
  ja: v => `公開支援内容：${v}。`,
  ko: v => `공개 지원 안내: ${v}.`,
  de: v => `Veröffentlichter Unterstützungshinweis: ${v}.`,
  es: v => `Nota de apoyo publicada: ${v}.`
};
const FUND_MECH_TPL = {
  zh_CN: v => `支持机制：${v}。`,
  hi: v => `वित्तपोषण तंत्र: ${v}।`,
  ja: v => `資金・支援スキーム：${v}。`,
  ko: v => `지원 메커니즘: ${v}.`,
  de: v => `Fördermechanismus: ${v}.`,
  es: v => `Mecanismo de financiación: ${v}.`
};
const TEL_LINE_TPL = {
  zh_CN: v => `电话：${v}。`,
  hi: v => `टेलीफ़ोन: ${v}।`,
  ja: v => `電話：${v}。`,
  ko: v => `전화: ${v}.`,
  de: v => `Telefon: ${v}.`,
  es: v => `Teléfono: ${v}.`
};
const EMAIL_LABEL_TPL = {
  zh_CN: v => `邮箱：${v}`,
  hi: v => `ईमेल: ${v}`,
  ja: v => `メール：${v}`,
  ko: v => `이메일: ${v}`,
  de: v => `E-Mail: ${v}`,
  es: v => `Correo electrónico: ${v}`
};
const ADDR_LINE_TPL = {
  zh_CN: v => `公布地址：${v}。`,
  hi: v => `प्रकाशित पता: ${v}।`,
  ja: v => `公開所在地：${v}。`,
  ko: v => `공개 주소: ${v}.`,
  de: v => `Veröffentlichte Adresse: ${v}.`,
  es: v => `Dirección publicada: ${v}.`
};
const DIST_ROUTE_TPL = {
  zh_CN: d => `${d}对接路径`,
  hi: d => `${d} ज़िला मार्ग`,
  ja: d => `${d}の案内ルート`,
  ko: d => `${d} 경로 안내`,
  de: d => `Bezirksroute ${d}`,
  es: d => `Ruta del distrito de ${d}`
};

for (const e of allEntities) {
  let s = heading(e.name, Object.fromEntries(LANGS.map(l => [l, eNameL(e, l)]))) +
    p(e.zh, Object.fromEntries(LANGS.map(l => [l, e.zh])));
  s += p(
    `${e.category} | ${dname(e.district)} | Research checked ${checked}`,
    Object.fromEntries(LANGS.map(l => [l, META_LINE_TPL[l](lbl(e.category, l), dnameL(e.district, l), checked)]))
  );
  if (e.sectors?.length) {
    s += p(
      `AI and industry focus: ${e.sectors.join(', ')}.`,
      Object.fromEntries(LANGS.map(l => {
        const sep = l === 'zh_CN' || l === 'ja' ? '、' : ', ';
        return [l, FOCUS_LINE_TPL[l](e.sectors.map(x => lbl(x, l)).join(sep))];
      }))
    );
  }
  if (e.code) {
    s += p(
      `Ministry of Education institution code: ${e.code}.`,
      Object.fromEntries(LANGS.map(l => [l, MOE_LINE_TPL[l](e.code)]))
    );
  }
  s += p(e.summary, Object.fromEntries(LANGS.map(l => [l, eSummaryL(e, l)]))) + evidence(e.source);
  if (e.sourceDetail && e.sourceDetail !== e.source) s += evidence(e.sourceDetail);
  if (e.sourceExtra && e.sourceExtra !== e.source && e.sourceExtra !== e.sourceDetail) s += evidence(e.sourceExtra);

  const stKey = e.status || 'Published entity; intake to confirm';
  s += heading('Status and support', '状态与支持', 1) +
    p(stKey, Object.fromEntries(LANGS.map(l => [l, lbl(stKey, l)])));
  if (e.support) {
    s += p(`Published support note: ${e.support}.`, Object.fromEntries(LANGS.map(l => [l, SUP_LINE_TPL[l](lbl(e.support, l))])));
  }
  if (e.funding) {
    s += p(`Funding mechanism: ${e.funding}.`, Object.fromEntries(LANGS.map(l => [l, FUND_MECH_TPL[l](lbl(e.funding, l))])));
  } else {
    s += p('No standard cash award, fee waiver or equity percentage is verified for this entry. Request the current written offer.', '本条未核实统一现金资助、免费权益或股权比例，请索取现行书面方案。');
  }
  s += heading('Contact and location', '联系与位置', 1);
  if (e.contact) {
    s += p(e.contact, Object.fromEntries(LANGS.map(l => [l, eContactL(e, l)])));
  }
  if (e.website) {
    const wLink = link('Official website / intake route', '官网／对接入口', e.website);
    s += p(wLink, Object.fromEntries(LANGS.map(l => [l, maps[l].get(wLink)])));
  } else {
    const aLink = link('Official evidence and authority route', '官方来源与主管部门入口', source(e.source).url);
    s += p(aLink, Object.fromEntries(LANGS.map(l => [l, maps[l].get(aLink)])));
  }
  if (e.phone) {
    s += p(`Telephone: ${e.phone}.`, Object.fromEntries(LANGS.map(l => [l, TEL_LINE_TPL[l](e.phone)])));
  }
  if (e.email) {
    const emLink = link(`Email: ${e.email}`, Object.fromEntries(LANGS.map(l => [l, EMAIL_LABEL_TPL[l](e.email)])), `mailto:${e.email}`);
    s += p(emLink, Object.fromEntries(LANGS.map(l => [l, maps[l].get(emLink)])));
  }
  if (e.address) {
    s += p(`Published address: ${e.address}.`, Object.fromEntries(LANGS.map(l => [l, ADDR_LINE_TPL[l](eAddressL(e, l))])));
  }
  if (!e.phone && !e.email) {
    s += p('A direct program phone or email is not verified here. Use the official route and request the responsible team; no contact has been invented.', '本版未核实项目直线电话或邮箱。请通过官方渠道索取负责团队，本图谱不编造联系人。');
  }
  s += p(
    e.coords ? 'Map point is approximate, based on the published street context; it is not an entrance or navigation coordinate.' : 'Map position uses a district or campus anchor; it is not a verified office location.',
    e.coords ? '地图点依据公布街道信息近似定位，不是入口或导航坐标。' : '地图位置使用区级或校区锚点，并非核实后的办公室位置。'
  );
  s += heading('Application workflow', '申请流程', 1) + workflow(e.workflow);
  if (e.category === 'University') {
    s += p('Confirm whether external founders can apply, whether student or alumni status is required, who owns the research IP, and whether support is a service, a loan, a grant or equity. The thematic match in this profile is editorial guidance.', '确认外部创业者能否申请、是否要求在校或校友身份、科研知识产权权属，以及支持属于服务、贷款、补助还是股权。本档案的主题匹配为编辑建议。');
  }
  const targetRoute = e.district === 'citywide' ? '/funding' : `/districts/${e.district}`;
  const dDoc = doc(
    `${dname(e.district)} district route`,
    Object.fromEntries(LANGS.map(l => [l, DIST_ROUTE_TPL[l](dnameL(e.district, l))])),
    targetRoute
  );
  s += p(dDoc, Object.fromEntries(LANGS.map(l => [l, maps[l].get(dDoc)])));
  write(`docs/entities/${e.id}.rst`, s);
}

// 4. Funding directory and profiles
const FUND_INTRO_TPL = {
  zh_CN: n => `覆盖全市及全部16个区的${n}条研究路径，区分不占股支持、须偿还债务、积分及投资。不会仅因政策或网页存在便标记正在开放。`,
  hi: n => `शहर-व्यापी कार्यक्रमों और सभी 16 ज़िलों में ${n} शोधित मार्ग। हम गैर-इक्विटी सहायता को पुनर्भुगतान योग्य ऋण, क्रेडिट और निवेश से अलग करते हैं। केवल नीति या वेब पेज मौजूद होने के कारण किसी भी कार्यक्रम को खुला नहीं माना गया है।`,
  ja: n => `全市プログラムおよび全16行政区にわたる ${n} 件の調査済み資金ルート。非エクイティ支援、返済義務のある融資、クラウドクレジット、株式投資を明確に区別しています。政策やWebページが存在するだけで募集中と表示することはありません。`,
  ko: n => `전시 프로그램과 16개 전 행정구에 걸친 ${n}개의 연구된 자금 경로. 비지분 지원과 상환 의무 대출, 크레딧, 지분 투자를 명확히 구분합니다. 정책이나 웹페이지가 존재한다는 이유만으로 접수 중으로 표시하지 않습니다.`,
  de: n => `${n} recherchierte Förderwege über stadtweite Programme und alle 16 Bezirke hinweg. Wir unterscheiden eigenkapitalfreie Förderung klar von rückzahlbaren Darlehen, Gutscheinen und Beteiligungskapital.`,
  es: n => `${n} rutas investigadas en programas de toda la ciudad y en los 16 distritos. Distinguimos el apoyo libre de capital de la deuda reembolsable, los créditos y la inversión de capital.`
};

let fundingIndex = heading('Funding, without mixing the mechanisms', '融资与扶持渠道：分清不同机制') +
  p(`${funding.length} researched routes across citywide programs and all 16 districts. We distinguish equity-free support from repayable debt, credits and investment. No item is labelled open merely because its policy or web page exists.`,
    Object.fromEntries(LANGS.map(l => [l, FUND_INTRO_TPL[l](funding.length)])));
const fgDoc = doc('Read the funding guide first', '先阅读资金指南', 'funding-guide');
fundingIndex += p(fgDoc, Object.fromEntries(LANGS.map(l => [l, maps[l].get(fgDoc)])));

let fundingHtmlDir = heading('All researched funding routes at a glance', '全部研究融资与扶持渠道总览', 1);
for (const f of funding) {
  const fLink = doc(f.name, Object.fromEntries(LANGS.map(l => [l, fNameL(f, l)])), `funding/${f.id}`);
  const phEn = f.phone ? ` Tel: ${f.phone}.` : '';
  const enStr = `${fLink} (${f.zh} · ${f.type} · ${dname(f.district)} · ${f.equity}) — **${f.amount}**. Eligibility: ${f.eligibility} Timing: ${f.deadline}.${phEn} [Status: ${f.status}]`;
  const dict = Object.fromEntries(LANGS.map(l => {
    const phL = f.phone ? (l === 'zh_CN' ? ` 电话：${f.phone}。` : ` Tel: ${f.phone}.`) : '';
    if (l === 'zh_CN') {
      return [l, `${maps[l].get(fLink)} （${f.zh} · ${lbl(f.type, l)} · ${dnameL(f.district, l)} · ${lbl(f.equity, l)}）—— **${fAmountL(f, l)}**。资格：${fEligL(f, l)} 时间：${fDeadlineL(f, l)}。${phL}【状态：${lbl(f.status, l)}】`];
    }
    return [l, `${maps[l].get(fLink)} (${f.zh} · ${lbl(f.type, l)} · ${dnameL(f.district, l)} · ${lbl(f.equity, l)}) — **${fAmountL(f, l)}**. ${fEligL(f, l)} (${fDeadlineL(f, l)}).${phL} [${lbl(f.status, l)}]`];
  }));
  fundingHtmlDir += bullet(enStr, dict);
}
fundingIndex += onlyHtml(fundingHtmlDir);
fundingIndex += '.. toctree::\n   :maxdepth: 1\n\n' + funding.map(f => '   funding/' + f.id).join('\n') + '\n';
write('docs/funding.rst', fundingIndex);

const CONSULT_TEL_TPL = {
  zh_CN: v => `公布咨询电话：${v}。`,
  hi: v => `प्रकाशित परामर्श फ़ोन: ${v}।`,
  ja: v => `公開相談電話：${v}。`,
  ko: v => `공개 상담 전화: ${v}.`,
  de: v => `Veröffentlichte Beratungstelefonnummer: ${v}.`,
  es: v => `Teléfono de consulta publicado: ${v}.`
};

for (const f of funding) {
  let s = heading(f.name, Object.fromEntries(LANGS.map(l => [l, fNameL(f, l)]))) +
    p(`${f.type} | ${dname(f.district)}`, Object.fromEntries(LANGS.map(l => [l, l === 'zh_CN' ? `${lbl(f.type, l)}｜${dnameL(f.district, l)}` : `${lbl(f.type, l)} | ${dnameL(f.district, l)}`]))) +
    p(f.status, Object.fromEntries(LANGS.map(l => [l, lbl(f.status, l)]))) +
    evidence(f.source);
  s += heading('Amount and mechanism', '额度与机制', 1) +
    p(f.amount, Object.fromEntries(LANGS.map(l => [l, fAmountL(f, l)]))) +
    p(f.equity, Object.fromEntries(LANGS.map(l => [l, lbl(f.equity, l)])));
  s += heading('Eligibility and timing', '资格与时间', 1) +
    p(f.eligibility, Object.fromEntries(LANGS.map(l => [l, fEligL(f, l)]))) +
    p(f.deadline, Object.fromEntries(LANGS.map(l => [l, fDeadlineL(f, l)])));
  const appLink = link('Official application / policy route', '官方申请／政策入口', f.apply);
  s += heading('Contact and application', '联系与申请', 1) +
    p(appLink, Object.fromEntries(LANGS.map(l => [l, maps[l].get(appLink)])));
  if (f.phone) {
    s += p(`Published consultation: ${f.phone}.`, Object.fromEntries(LANGS.map(l => [l, CONSULT_TEL_TPL[l](f.phone)])));
  }
  if (f.email) {
    const emL = link(f.email, Object.fromEntries(LANGS.map(l => [l, f.email])), `mailto:${f.email}`);
    s += p(emL, Object.fromEntries(LANGS.map(l => [l, maps[l].get(emL)])));
  }
  if (!f.phone && !f.email) {
    s += p('The linked authority or operator is the contact route. A direct current program contact is not established in this profile.', '请通过所链主管部门或运营方联系，本档案未核实现任项目直接联系人。');
  }
  s += workflow(f.workflow);
  s += p('The published maximum is a ceiling, not an entitlement. Check the applicable notice, eligible cost period, other public support and written payment conditions.', '公布最高额为上限，不构成当然权益。须核验适用通知、合资格支出期间、其他财政资助及书面拨付条件。');
  write(`docs/funding/${f.id}.rst`, s);
}

// 5. Higher-Education Register
let registerRst = heading('The higher-education register', '高等教育机构名录') +
  p('We use the Ministry of Education list dated 17 June 2026, published 18 June 2026. The downloaded source workbooks are retained in the repository. Institutional inclusion does not prove a startup program, available funding or admission for an external founder.', '采用教育部截至2026年6月17日、6月18日公布的名单，源工作簿保存在仓库。列入名录不代表存在创业计划、可用资金或接受外部创业者。') +
  evidence('moe.gov.cn/jyb_xxgk');
registerRst += heading('40 undergraduate institutions', '40所本科院校', 1);
for (const u of universityEntities) {
  const uDoc = doc(`${u.name} / ${u.zh}`, Object.fromEntries(LANGS.map(l => [l, l === 'zh_CN' ? u.zh : `${eNameL(u, l)} / ${u.zh}`])), `/entities/${u.id}`);
  registerRst += bullet(`${uDoc} (${u.code})`, Object.fromEntries(LANGS.map(l => [l, `${maps[l].get(uDoc)} (${u.code})`])));
}
registerRst += '\n' + heading('29 diploma colleges', '29所专科院校', 1) +
  p('Chinese legal names and institution codes follow the official workbook. Program contacts and startup funding for these colleges have not been individually verified. Use the official education register to confirm the institution before seeking its research-cooperation or entrepreneurship office.', '中文法定名称与学校标识码依官方工作簿。本版尚未逐校核实专科院校的创业联系及资金，请先通过官方教育名录确认机构，再咨询科研合作或创业部门。');
for (const r of registry.filter(x => x.level === '专科')) {
  registerRst += bullet(`${r.zh} (${r.code})`, Object.fromEntries(LANGS.map(l => [l, `${r.zh} (${r.code})`])));
}
registerRst += '\n' + heading('12 adult higher-education institutions', '12所成人高校', 1) +
  p('A separate Ministry register; these are not added to the 69 ordinary institutions. Names and codes are authoritative register entries, not a claim of a verified startup program.', '来自教育部独立名录，不计入69所普通高校。名称及代码为官方名录信息，不代表已核实创业项目。');
for (const r of adult) {
  registerRst += bullet(`${r.zh} (${r.code})`, Object.fromEntries(LANGS.map(l => [l, `${r.zh} (${r.code})`])));
}
const ceibsLink = link('CEIBS official institutional route', '中欧国际工商学院官方入口', 'https://www.ceibs.edu/');
const ceibsNote = trS("CEIBS appears in Shanghai's international education directory and is listed separately here; no specific startup funding offer has been verified.", '中欧国际工商学院列于上海国际教育目录，本图谱另列；尚未核实具体创业资助。');
registerRst += '\n' + heading('Additional specialist routes', '其他专业路径', 1) +
  p(`${ceibsLink}. ${ceibsNote}`, Object.fromEntries(LANGS.map(l => [l, `${maps[l].get(ceibsLink)}. ${maps[l].get(ceibsNote)}`])));
registerRst += evidence('edu.sh.gov.cn/study_cn_school');
write('docs/university-register.rst', registerRst);

// 6. Interactive Atlas Page
let atlas = heading('Explore the Shanghai ecosystem', '探索上海创新生态') +
  p('Select a district, search a Chinese or English organization name, and filter by organization type or funding mechanism. Each result opens a sourced profile with contact and application steps.', '选择行政区，搜索中英文机构名称，按类型或资助机制筛选。每个结果均可打开附来源、联系与申请步骤的档案。');
atlas += '.. only:: html\n\n   .. raw:: html\n\n      <div id="atlas-app" aria-live="polite"></div>\n      <noscript><p>Use the district and directory links below. / 请使用下方行政区与目录链接。</p></noscript>\n\n';
const bDistDoc = doc('Browse all district chapters', '浏览全部行政区章节', 'districts');
const bFundDoc = doc('Browse funding', '浏览资金', 'funding');
atlas += p(`${bDistDoc} | ${bFundDoc}`, Object.fromEntries(LANGS.map(l => [l, `${maps[l].get(bDistDoc)} | ${maps[l].get(bFundDoc)}`])));
atlas += '.. only:: pdf\n\n   ' + trS('The website provides the interactive map. The printed district map and the directory chapters provide the same routes without requiring a device.', '网站提供交互地图。纸本行政区地图与目录章节提供相同对接路径，无需设备。') + '\n';
write('docs/atlas.rst', atlas);

// 7. Home Index Page
const tree = ['reading-the-city', 'atlas', 'software-ai', 'hardware-ai', 'districts', 'universities', 'university-register', 'incubation', 'research', 'corporate', 'government', 'funding-guide', 'funding', 'investors', 'apply', 'methodology', 'sources'];
let index = heading('Shanghai Ecosystem Atlas', '上海创新生态图谱') +
  p('The Pearl of the Orient. A field guide to research, enterprise and possibility.', '东方明珠。连接科研、企业与机遇的实用图谱。') +
  p("An illustrated guide in seven languages for accelerators, founders, researchers and AI enthusiasts. It connects Shanghai's universities, software and hardware AI communities, and practical routes to support across all 16 districts.", '为加速器、创始人、研究者及人工智能爱好者编写的七语插图指南，连接上海16个行政区的高校、软硬件人工智能社区及实用扶持渠道。');

const EDITION_STAT_TPL = {
  zh_CN: `研究版本：${checked}。${allEntities.length}份机构档案，${funding.length}条融资与扶持渠道，覆盖16个行政区，引用${used.length}项原始证据来源。`,
  hi: `शोध संस्करण: ${checked}। ${allEntities.length} संस्थान प्रोफ़ाइल। ${funding.length} वित्तपोषण मार्ग। 16 ज़िले। ${used.length} उद्धृत स्रोत।`,
  ja: `調査エディション：${checked}。${allEntities.length}件の機関プロファイル、${funding.length}件の資金ルート、全16行政区、${used.length}件の引用一次出典。`,
  ko: `연구 에디션: ${checked}. ${allEntities.length}개 기관 프로필. ${funding.length}개 자금 경로. 16개 행정구. ${used.length}개 인용 출처.`,
  de: `Forschungsausgabe: ${checked}. ${allEntities.length} Organisationsprofile. ${funding.length} Förderwege. 16 Bezirke. ${used.length} zitierte Quellen.`,
  es: `Edición de investigación: ${checked}. ${allEntities.length} perfiles de organizaciones. ${funding.length} vías de financiación. 16 distritos. ${used.length} fuentes citadas.`
};
index += p(`Research edition: ${checked}. ${allEntities.length} organization profiles. ${funding.length} funding routes. 16 districts. ${used.length} cited sources.`, EDITION_STAT_TPL);
index += p("Written by **Vikrant Rathore** with contributions from **Lauren Zhao, Vicky Ni, Jennifer Yuan, Ronak Rathore, Kanak Rathore and Emily Yue Xu**. Produced using **Guidedog** as a unified seven-language **HTML and PDF** publication inspired by Shanghai's official flower, the white magnolia (*Yulania denudata*).", '本书由 **Vikrant Rathore** 撰写，**Lauren Zhao、Vicky Ni、Jennifer Yuan、Ronak Rathore、Kanak Rathore 与 Emily Yue Xu** 共同贡献。采用 **Guidedog** 原生构建为七语 **HTML 网站与 PDF 图书**，视觉设计汲取上海市花白玉兰之灵感。');

const nav1 = doc('Explore the interactive atlas', '探索交互图谱', 'atlas');
const nav2 = doc('Browse all 16 districts', '浏览全部16个行政区', 'districts');
const nav3 = doc('Find funding', '寻找资金', 'funding');
const nav4 = doc('Plan an application', '规划申请', 'apply');
index += p(`${nav1} | ${nav2} | ${nav3} | ${nav4}`, Object.fromEntries(LANGS.map(l => [l, `${maps[l].get(nav1)} | ${maps[l].get(nav2)} | ${maps[l].get(nav3)} | ${maps[l].get(nav4)}`])));

let indexHtml = heading('All 16 administrative districts of Shanghai', '上海十六个行政区全景导览', 1);
indexHtml += p('Every administrative district of Shanghai is covered in both the website and the PDF book with its documented industrial focus, receiving government authority, local innovation carriers, universities and district funding routes:', '网站与PDF图书完整收录上海全部16个行政区的定位方向、受理政府部门、本地创新载体、高校及区级融资与扶持渠道：');
for (const [idx, d] of districts.entries()) {
  const dLink = doc(d.name, Object.fromEntries(LANGS.map(l => [l, dnameL(d.id, l)])), `districts/${d.id}`);
  const num = String(idx + 1).padStart(2, '0');
  const localCount = allEntities.filter(e => e.district === d.id && e.category !== 'Government').length;
  const fundCount = funding.filter(f => f.district === d.id).length;
  const enStr = `**[${num}]** ${dLink} (${d.zh}) — **${d.focus}**. Authority: ${d.owner}. (${localCount} organizations, ${fundCount} district funding routes)`;
  const dict = Object.fromEntries(LANGS.map(l => {
    if (l === 'zh_CN') {
      return [l, `**[${num}]** ${maps[l].get(dLink)} （${d.zh}）—— **${dfocusL(d, l)}**。主管部门：${downerL(d, l)}。（${localCount}家机构，${fundCount}条区级融资与扶持渠道）`];
    }
    return [l, `**[${num}]** ${maps[l].get(dLink)} (${d.zh}) — **${dfocusL(d, l)}**. ${downerL(d, l)}. (${localCount} / ${fundCount})`];
  }));
  indexHtml += bullet(enStr, dict);
}
indexHtml += '\n' + heading('Complete chapters & directories in this atlas', '本图谱完整章节与目录', 1);
const chapterSummaries = [
  ['reading-the-city', 'A city of connected possibilities', '一座连接机遇的城市', 'Spatial logic across central Shanghai, industrial corridors, five新城 (New Cities) and Chongming Eco-Island, plus magnolia design notes and authorship credits.', '中心城区、产业走廊、五个新城与崇明生态岛的空间逻辑，以及白玉兰设计说明与作者署名。'],
  ['atlas', 'Explore the Shanghai ecosystem', '探索上海创新生态', 'Interactive 16-district vector map, bilingual search, sector and equity filters, shortlist and CSV export.', '16区交互式矢量地图、中英双语检索、产业与股权筛选、收藏清单及CSV导出。'],
  ['software-ai', 'Intelligence in software', '软件中的智能', 'Foundation models, vertical agents, Model Speed Space, Zhangjiang Model Community, compute/corpus vouchers and compliance routing.', '基础模型、垂类智能体、模速空间、张江模力社区、算力语料券及合规路径。'],
  ['hardware-ai', 'Intelligence in the physical world', '物理世界中的智能', 'AI chips, EDA/MPW tape-out, MEMS sensors, embodied robotics, low-altitude drones, BCI and wet-lab biocomputing.', 'AI芯片、EDA与流片、传感器、具身智能机器人、低空无人机、脑机接口与生物计算。'],
  ['districts', 'Sixteen districts, sixteen entry routes', '十六区，十六条对接路径', "Dedicated chapter for each of Shanghai's 16 districts with receiving authorities, policy boundaries, local carriers and funding.", '上海16个行政区逐区专章，含受理部门、政策边界、本地载体与融资与扶持渠道。'],
  ['universities', 'Universities and commercialization', '高校与成果转化', 'Profiles for all 40 undergraduate universities in Shanghai with MOE codes, collaboration themes and tech-transfer contacts.', '上海全部40所本科高校档案，含教育部标识码、合作主题与技术转移联系方式。'],
  ['university-register', 'The higher-education register', '高等教育机构名录', 'Complete June 2026 Ministry of Education register: 40 undergraduate universities, 29 diploma colleges, 12 adult institutions and CEIBS.', '教育部2026年6月完整名录：40所本科、29所专科、12所成人高校及中欧国际工商学院。'],
  ['incubation', 'Incubators, accelerators and parks', '孵化器、加速器及园区', '28 researched incubators, accelerators and technology parks across Shanghai with admission checklists and operator details.', '全市28家孵化器、加速器与科技园区档案，含入驻核对清单与运营方信息。'],
  ['research', 'Research and technical platforms', '科研与技术平台', 'Shanghai AI Lab, ICC chip service center and Tongji autonomous and PAI research platforms.', '上海人工智能实验室、集成电路促进中心及同济无人系统与PAI科研平台。'],
  ['corporate', 'Corporate and global programs', '企业与全球计划', 'Roche, SAP.iO, ABB, DroidUp, PaddlePaddle, Yangtze AI+ Center, JLABS, Bayer Co.Lab, NVIDIA Inception, Microsoft, AWS, Siemens and BMW.', '罗氏、SAP.iO、ABB、卓益得、飞桨、长三角AI+中心、JLABS、拜耳、英伟达、微软、亚马逊云、西门子与宝马项目。'],
  ['government', 'Government entry points', '政府对接入口', 'All 16 district science, technology and economy authorities with official portals, published contacts and policy notes.', '16个区科技与经济主管部门入口，含官方网站、公开电话与政策说明。'],
  ['funding-guide', 'Capital, with its conditions attached', '资金及其附带条件', 'How to distinguish non-repayable grants, post-expenditure reimbursements, vouchers, debt, tax relief and equity investment.', '如何区分无偿补助、先支后补、创新券、债务贷款、税收优惠与股权投资。'],
  ['funding', 'Funding, without mixing the mechanisms', '融资与扶持渠道：分清不同机制', 'All 40 citywide and district funding pathways with ceilings, equity rules, eligibility criteria, deadlines and official links.', '全市及16区全部40条融资与扶持渠道，含额度上限、股权规则、资格条件、截止时间与官方入口。'],
  ['investors', 'Investors and patient capital', '投资机构与耐心资本', 'STEFG Angel Fund, Shanghai Leading Industry Funds, Pudong AI Seed Fund, Embodied AI Fund, STVC and Qiming Venture Partners.', '大学生科创基金会天使基金、三大先导母基金、浦东AI种子基金、具身智能基金、科投集团与启明创投。'],
  ['apply', 'From introduction to application', '从初次对接到正式申请', 'Bilingual outreach templates, shared data-room checklist, decision workflows and a four-week accelerator field program.', '中英双语初次沟通模板、共用资料库清单、四类决策流程及加速器四周实地计划。'],
  ['methodology', 'How to read the evidence', '如何阅读证据', 'Source verification rules, translation discipline, map accuracy disclosures, known gaps and authorship credits.', '来源核验规则、翻译规范、地图精度说明、已知缺口及作者团队署名。'],
  ['sources', 'Sources and reading room', '来源与阅读室', 'Complete bibliography of all cited government notices, institutional registers and operator pages with access dates.', '全部引用的政府通知、高校名录与运营方网页完整文献库及核对日期。'],
];
for (const [idx, [cid, ctEn, ctZh, cdEn, cdZh]] of chapterSummaries.entries()) {
  const cLink = doc(ctEn, Object.fromEntries(LANGS.map(l => [l, l === 'zh_CN' ? ctZh : i18nData[l].chapterSummaries[idx][1]])), cid);
  const dict = Object.fromEntries(LANGS.map(l => {
    const descL = l === 'zh_CN' ? cdZh : i18nData[l].chapterSummaries[idx][2];
    const sep = l === 'zh_CN' ? ' —— ' : ' — ';
    return [l, `${maps[l].get(cLink)}${sep}${descL}`];
  }));
  indexHtml += bullet(`${cLink} — ${cdEn}`, dict);
}
index += onlyHtml(indexHtml);
index += '.. toctree::\n   :maxdepth: 2\n   :hidden:\n\n' + tree.map(x => '   ' + x).join('\n') + '\n';
write('docs/index.rst', index);

// 8. Sources & Bibliography
const SRC_URL_TPL = {
  zh_CN: u => `来源网址：${u}`,
  hi: u => `स्रोत URL: ${u}`,
  ja: u => `出典URL：${u}`,
  ko: u => `출처 URL: ${u}`,
  de: u => `Quellen-URL: ${u}`,
  es: u => `URL de la fuente: ${u}`
};
const SRC_LANG_TPL = {
  zh_CN: (lg, chk) => `来源语言：${lg}。研究日期：${chk}。`,
  hi: (lg, chk) => `स्रोत भाषा: ${lg}। शोध तिथि: ${chk}।`,
  ja: (lg, chk) => `出典言語：${lg}。調査日：${chk}。`,
  ko: (lg, chk) => `출처 언어: ${lg}. 연구 일자: ${chk}.`,
  de: (lg, chk) => `Quellensprache: ${lg}. Recherchedatum: ${chk}.`,
  es: (lg, chk) => `Idioma de la fuente: ${lg}. Fecha de investigación: ${chk}.`
};

let bibliography = heading('Sources and reading room', '来源与阅读室') +
  p('These are the sources used by the profiles and editorial chapters. Access dates refer to the research session. Source languages are preserved. Institutional registers and mapped boundaries have different purposes from current application notices.', '下列来源用于机构档案及编辑章节。访问日期指本次研究，保留来源原语言。机构名录、地图边界与现行申报通知的用途不同。');
for (const s of used) {
  const sLnk = link(s.title, Object.fromEntries(LANGS.map(l => [l, s.title])), s.url);
  bibliography += heading(s.id, Object.fromEntries(LANGS.map(l => [l, s.id])), 1) +
    p(sLnk, Object.fromEntries(LANGS.map(l => [l, maps[l].get(sLnk)]))) +
    p(`Source URL: ${s.url}`, Object.fromEntries(LANGS.map(l => [l, SRC_URL_TPL[l](s.url)]))) +
    p(`Source language: ${s.language}. Research date: ${checked}.`, Object.fromEntries(LANGS.map(l => [l, SRC_LANG_TPL[l](s.language, checked)])));
}
write('docs/sources.rst', bibliography);

// 9. Interactive Atlas Dataset (JSON + JS)
const credits = {
  author: 'Vikrant Rathore',
  contributors: ['Lauren Zhao', 'Vicky Ni', 'Jennifer Yuan', 'Ronak Rathore', 'Kanak Rathore', 'Emily Yue Xu'],
  generator: 'Guidedog',
  formats: ['HTML', 'PDF'],
  languages: ['en', 'zh_CN', 'hi', 'ja', 'ko', 'de', 'es']
};

const clientI18n = {};
for (const lang of ['hi', 'ja', 'ko', 'de', 'es']) {
  const loc = i18nData[lang];
  const ents = { ...loc.entities };
  for (const u of universityEntities) {
    ents[u.id] = {
      name: eNameL(u, lang),
      summary: eSummaryL(u, lang),
      address: eAddressL(u, lang),
      contact: eContactL(u, lang)
    };
  }
  for (const d of districts) {
    ents[`government-${d.id}`] = {
      name: downerL(d, lang),
      summary: dnoteL(d, lang)
    };
  }
  clientI18n[lang] = {
    districts: loc.districts,
    entities: ents,
    funding: loc.funding,
    labels: loc.labels,
    deadlines: loc.deadlines
  };
}

const dataset = {
  checked,
  credits,
  districts: districts.map(d => ({ ...d, source: source(d.source) })),
  entities: allEntities.map(e => ({ ...e, source: source(e.source), status: e.status || 'Published entity; intake to confirm', url: `entities/${e.id}.html` })),
  funding: funding.map(f => ({ ...f, source: source(f.source), url: `funding/${f.id}.html`, deadlineZh: f.deadlineZh || translateDeadline(f.deadline, 'zh_CN') })),
  diplomaColleges: registry.filter(x => x.level === '专科'),
  adultColleges: adult,
  labels,
  i18n: clientI18n,
  sources: used,
  counts: { entities: allEntities.length, funding: funding.length, undergraduate: 40, diploma: 29, adult: adult.length, districts: 16, sources: used.length }
};

write('docs/_static/atlas/catalog.json', JSON.stringify(dataset, null, 2) + '\n');
write('docs/_static/atlas/catalog.js', 'window.SHANGHAI_ATLAS=' + JSON.stringify(dataset) + ';\n');
write('docs/_static/atlas/geometry.js', 'window.SHANGHAI_GEOMETRY=' + fs.readFileSync('data/shanghai-districts.geojson', 'utf8') + ';\n');
write('data/published-sources.json', JSON.stringify(used, null, 2) + '\n');
// A maintained template input keeps the native PDF cover statistics in sync.
write('docs/_templates/coverage.json', JSON.stringify(dataset.counts, null, 2) + '\n');

// 10. Optional PO catalog sync after `guidedog intl update`
if (process.argv.includes('--sync-po')) {
  function visit(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? visit(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  }
  function decode(s) {
    return s.trim().split('\n').map(l => JSON.parse(l.trim())).join('');
  }
  for (const lang of LANGS) {
    const pairs = maps[lang];
    const normalized = new Map([...pairs.entries()].map(([k, v]) => [k.replace(/\s+/g, ' ').trim(), v]));
    const dir = path.join('docs/locales', lang, 'LC_MESSAGES');
    if (!fs.existsSync(dir)) continue;
    let missingCount = 0, translatedCount = 0;
    for (const file of visit(dir).filter(f => f.endsWith('.po') && path.basename(f) !== 'guidedog.po')) {
      let raw = fs.readFileSync(file, 'utf8');
      let fileMissing = false;
      raw = raw.replace(/msgid ((?:"[^\n]*"\n)+)msgstr ((?:"[^\n]*"(?:\n|$))+)/g, (all, idRaw) => {
        const id = decode(idRaw);
        if (!id) {
          return all
            .replace('PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE', 'PO-Revision-Date: 2026-11-04 00:00+0000')
            .replace('Last-Translator: FULL NAME <EMAIL@ADDRESS>', 'Last-Translator: Vikrant Rathore & contributors')
            .replace('Language-Team: LANGUAGE <LL@li.org>', `Language-Team: ${lang}`);
        }
        const translated = pairs.get(id) ?? normalized.get(id.replace(/\s+/g, ' ').trim());
        if (translated === undefined) {
          missingCount++;
          fileMissing = true;
          console.error(`Missing [${lang}] in ${file}:`, id);
          return all;
        }
        translatedCount++;
        return `msgid ${idRaw}msgstr ${JSON.stringify(translated)}\n`;
      });
      if (!fileMissing) {
        raw = raw.replace(/^#, (.*)$/gm, (_, flags) => {
          const retained = flags.split(',').map(s => s.trim()).filter(s => s !== 'fuzzy');
          return retained.length ? '#, ' + retained.join(', ') : '';
        });
      }
      raw = raw.replace('# SOME DESCRIPTIVE TITLE.', `# ${lang} translation of the Shanghai Ecosystem Atlas.`)
        .replace('# FIRST AUTHOR <EMAIL@ADDRESS>, YEAR.\n', '');
      fs.writeFileSync(file, raw.replace(/\n+$/, '\n'));
    }
    console.log(`Synced Guidedog PO catalogs for ${lang}: ${translatedCount} messages (${missingCount} missing).`);
    if (missingCount > 0) process.exitCode = 1;
  }
} else {
  console.log(`Generated ${allEntities.length} profiles, ${funding.length} funding routes, ${used.length} cited sources across 7 languages.`);
}
