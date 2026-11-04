#import "theme.typ": configure-document, gd-serif, gd-sans, gd-mono
// guidedog: margin-x = 24mm
#let book(title: "", author: "", version: "", date: "", lang: "en", paper: "a4",
 logo: none, copyright: "", accent: rgb("315b50"), numbering: false,
 version-label: "Edition", serif: gd-serif, sans: gd-sans, mono: gd-mono,
 size: 10.5pt, page-ref: none, body) = {
 let code = lower(lang.replace("_", "-").split("-").first())
 let zh = code == "zh"
 let hi = code == "hi"
 let ja = code == "ja"
 let ko = code == "ko"
 let de = code == "de"
 let es = code == "es"
 let ink = rgb("263b36")
 let jade = rgb("315b50")
 let gold = rgb("a88b53")
 let pearl = rgb("faf8f2")
 let quiet = rgb("68746d")
 let words = json("book-labels.json").at(code, default: json("book-labels.json").at("en"))
 let counts = json("coverage.json")
 let title = words.title
 let scope = words.scope.replace("{entities}", str(counts.entities)).replace("{funding}", str(counts.funding))
 let serif = if zh {
  ("Noto Serif CJK SC", "Libertinus Serif")
 } else if ja {
  ("Noto Serif CJK JP", "Noto Serif CJK SC", "Libertinus Serif")
 } else if ko {
  ("Noto Serif CJK KR", "Noto Serif CJK SC", "Libertinus Serif")
 } else if hi {
  ("Noto Serif Devanagari", "Libertinus Serif", "Noto Serif CJK SC")
 } else {
  ("Libertinus Serif", "Noto Serif CJK SC", "Noto Serif Devanagari")
 }
 let sans = if ja {
  ("DejaVu Sans", "Noto Serif CJK JP", "Noto Serif CJK SC", "Libertinus Serif")
 } else if ko {
  ("DejaVu Sans", "Noto Serif CJK KR", "Noto Serif CJK SC", "Libertinus Serif")
 } else if hi {
  ("DejaVu Sans", "Noto Sans Devanagari", "Noto Serif Devanagari", "Noto Serif CJK SC", "Libertinus Serif")
 } else {
  ("DejaVu Sans", "Noto Serif CJK SC", "Libertinus Serif")
 }
 show: configure-document.with(lang: lang, serif: serif, sans: sans, mono: mono, size: size, accent: jade)
 set document(title: title, author: "Vikrant Rathore")
 set text(fill: ink, font: serif, size: size)
 set par(justify: true, leading: 0.67em, spacing: 0.8em)
 set page(width: 240mm, height: 300mm, margin: (x: 24mm, top: 23mm, bottom: 24mm), fill: pearl)
 show heading: set text(font: sans, fill: ink, hyphenate: false)
 show heading: set par(justify: false, first-line-indent: 0pt)
 set heading(numbering: none)
 show heading.where(level: 1): it => {
  if it.outlined {
   pagebreak(weak: true, to: "odd")
   block(above: 0pt, below: 13mm, sticky: true)[
    #v(11mm)
    #text(font: sans, size: 8pt, tracking: 0.12em, fill: gold, if zh { "上海 / 创新图谱" } else if hi { "शंघाई / इनोवेशन गाइड" } else if ja { "上海 / フィールドノート" } else if ko { "상하이 / 필드 노트" } else if de { "SHANGHAI / FELDNOTIZEN" } else if es { "SHANGHÁI / NOTAS DE CAMPO" } else { "SHANGHAI / FIELD NOTES" })
    #v(7mm)
    #text(size: 31pt, weight: "regular", it.body)
    #v(7mm)
    #line(length: 23mm, stroke: 1.2pt + gold)
    #if logo != none {
     v(5mm)
     image(logo, width: 100%, height: 45mm, fit: "cover")
    }
   ]
  } else { block(above: 5mm, below: 5mm, text(size: 22pt, it.body)) }
 }
 show heading.where(level: 2): it => {
  let key = if it.has("label") { repr(it.label) } else { "" }
  let profile = key.contains("entities-") or key.contains("districts-") or (key.contains("funding-") and not key.contains("funding-guide-"))
  if profile {
   pagebreak(weak: true)
   block(above: 0pt, below: 7mm, sticky: true)[
    #v(4mm)
    #text(font: sans, size: 7pt, tracking: 0.12em, fill: gold, if zh { "机构 / 资源 / 对接路径" } else if hi { "संस्थान / संसाधन / प्रवेश मार्ग" } else if ja { "機関 / リソース / 窓口" } else if ko { "기관 / 자원 / 진입 경로" } else if de { "AKTEURE / RESSOURCEN / ZUGANGSWEGE" } else if es { "ORGANIZACIONES / RECURSOS / RUTAS DE ACCESO" } else { "PEOPLE / RESOURCES / ENTRY POINTS" })
    #v(5mm)
    #text(size: 25pt, weight: "regular", fill: jade, it.body)
    #v(4mm)
    #line(length: 100%, stroke: 0.5pt + rgb("d8d8ca"))
   ]
  } else {
   block(above: 10mm, below: 4mm, sticky: true, text(size: 17pt, weight: "regular", fill: jade, it.body))
  }
 }
 show heading.where(level: 3): it => block(above: 6mm, below: 2.5mm, sticky: true,
  text(size: 10.5pt, weight: "bold", fill: jade, it.body))
 show heading.where(level: 4): set text(size: 10pt, weight: "bold")
 show link: set text(fill: jade)
 show regex("https?://[^\\s]+"): it => text(size: 7.5pt, it.text.replace("/", "/\u{200b}").replace("%", "%\u{200b}"))
 set figure(numbering: none, gap: 3mm)
 show figure: set block(above: 7mm, below: 7mm)
 show figure.caption: set text(size: 8pt, font: sans, fill: quiet)
 show figure.caption: set par(justify: false)
 set table(stroke: none, inset: (x: 5pt, y: 5pt), align: start)
 show table: set text(size: 9pt)
 set list(indent: 0.8em, body-indent: 0.6em, spacing: 0.65em)
 set enum(indent: 0.8em, body-indent: 0.6em, spacing: 0.7em)
 show raw: set text(font: mono, size: 0.85em)
 state("gd-page-ref").update(_ => page-ref)
 page(margin: 0mm, header: none, footer: none, numbering: none, background: none)[
  #if logo != none { place(top + left, image(logo, width: 240mm, height: 300mm, fit: "cover")) }
  #place(top + center, dy: 18mm)[
   #block(width: 194mm)[
   #align(center)[
   #set par(justify: false, leading: 0.35em)
   #text(font: sans, size: 8pt, tracking: 0.16em, fill: jade, if zh { "东方明珠 · 白玉兰水墨珍藏版" } else if hi { "पूरब का मोती · श्वेत मैग्नोलिया संस्करण" } else if ja { "東洋の真珠 · 白玉蘭水墨エディション" } else if ko { "동양의 진주 · 백목련 수묵 에디션" } else if de { "DIE PERLE DES ORIENTS · MAGNOLIEN-EDITION" } else if es { "LA PERLA DE ORIENTE · EDICIÓN MAGNOLIA" } else { "THE PEARL OF THE ORIENT · MAGNOLIA EDITION" })
   #v(7mm)
   #text(font: serif, size: if zh or ja or ko { 32pt } else if de or es or hi { 31pt } else { 39pt }, fill: ink, words.cover_lines.map(line => [#line]).join(linebreak()))
   #v(5mm)
   #text(font: sans, size: 9pt, fill: jade, if zh { "十六区 · 高校 · 软硬件人工智能 · 融资与扶持渠道" } else if hi { "16 जिले · विश्वविद्यालय · AI · पूंजी" } else if ja { "16行政区 · 大学 · AI · 資金ルート" } else if ko { "16개 행정구 · 대학 · AI · 자금 지원" } else if de { "16 BEZIRKE · UNIVERSITÄTEN · KI · KAPITAL" } else if es { "16 DISTRITOS · UNIVERSIDADES · IA · CAPITAL" } else { "16 DISTRICTS / UNIVERSITIES / AI / CAPITAL" })
   #v(4mm)
   #text(font: sans, size: 8.5pt, fill: ink, words.author + " Vikrant Rathore")
   ]]
  ]
  #place(bottom + left, dx: 23mm, dy: -15mm)[
   #block(fill: rgb("faf8f2eb"), stroke: 0.5pt + rgb("dcded2"), inset: (x: 10pt, y: 7pt), radius: 2pt)[
    #text(font: sans, size: 7.5pt, fill: ink, if zh { "2026研究版 / 简体中文 · Guidedog HTML & PDF" } else if hi { "2026 शोध संस्करण / हिन्दी · Guidedog HTML & PDF" } else if ja { "2026研究版 / 日本語 · Guidedog HTML & PDF" } else if ko { "2026 연구판 / 한국어 · Guidedog HTML & PDF" } else if de { "FORSCHUNGSAUSGABE 2026 / DEUTSCH · Guidedog HTML & PDF" } else if es { "EDICIÓN DE INVESTIGACIÓN 2026 / ESPAÑOL · Guidedog HTML & PDF" } else { "RESEARCH EDITION 2026 / ENGLISH · Guidedog HTML & PDF" })
   ]
  ]
 ]
 page(header: none, footer: none, numbering: none)[
  #set par(justify: false)
  #v(1fr)
  #text(font: sans, size: 9pt, tracking: 0.1em, fill: gold, if zh { "白玉兰 / 珍珠白 / 上海" } else if hi { "श्वेत मैग्नोलिया / पर्ल व्हाइट / शंघाई" } else if ja { "白玉蘭 / パールホワイト / 上海" } else if ko { "백목련 / 펄 화이트 / 상하이" } else if de { "WEISSE MAGNOLIE / PERLENWEISS / SHANGHAI" } else if es { "MAGNOLIA BLANCA / BLANCO PERLA / SHANGHÁI" } else { "MAGNOLIA / PEARL WHITE / SHANGHAI" })
  #v(7mm)
  #text(size: 24pt, title)
  #v(6mm)
  #text(size: 10pt, if zh { "一部为加速器、创始人、研究者及人工智能爱好者编写的实用图谱。" } else if hi { "एक्सेलेरेटर, संस्थापकों, शोधकर्ताओं और AI उत्साही लोगों के लिए एक व्यावहारिक मार्गदर्शिका।" } else if ja { "アクセラレーター、創業者、研究者、AI実践者のための実用フィールドガイド。" } else if ko { "액셀러레이터, 창업자, 연구자 및 AI 실무자를 위한 실용 필드 가이드." } else if de { "Ein praktischer Leitfaden für Acceleratoren, Gründer, Forschende und KI-Interessierte." } else if es { "Una guía práctica para aceleradoras, fundadores, investigadores y entusiastas de la IA." } else { "A field guide for accelerators, founders, researchers and AI enthusiasts." })
  #v(6mm)
  #block(fill: rgb("f4f2ea"), stroke: 0.5pt + rgb("dcded2"), inset: 12pt, width: 100%)[
   #text(font: sans, size: 8pt, tracking: 0.08em, fill: gold, words.credits)
   #v(3mm)
   #text(size: 9.5pt, weight: "bold", fill: ink, words.author + " Vikrant Rathore")
   #v(2mm)
   #text(size: 9pt, fill: ink, words.contributors + " Lauren Zhao, Vicky Ni, Jennifer Yuan, Ronak Rathore, Kanak Rathore, Emily Yue Xu")
   #v(2mm)
   #text(size: 8.5pt, fill: jade, words.publication)
  ]
  #v(5mm)
  #text(size: 9pt, fill: quiet, scope)
  #v(4mm)
  #text(size: 8pt, fill: quiet, words.cover_note)
  #v(4mm)
  #text(font: sans, size: 8pt, fill: quiet, "Guidedog (HTML & PDF) / Typst / CeTZ / Fletcher / Graphviz")
  #v(8mm)
 ]
 set page(numbering: "i", header: none,
  footer: context align(right, text(font: sans, size: 8pt, fill: quiet, counter(page).display())))
 counter(page).update(1)
 outline(title: if zh { "目录" } else if hi { "विषय-सूची" } else if ja { "目次" } else if ko { "목차" } else if de { "Inhaltsverzeichnis" } else if es { "Índice" } else { "Contents" }, depth: 1, indent: auto)
 pagebreak(to: "odd")
 counter(page).update(1)
 set page(numbering: "1",
  header: [#text(font: sans, size: 7pt, tracking: 0.06em, fill: quiet, words.running) #h(1fr) #text(font: sans, size: 7pt, fill: gold, "2026 · Vikrant Rathore")],
  footer: context [#line(length: 100%, stroke: 0.4pt + rgb("d8d8ca")) #v(2mm) #text(font: sans, size: 7pt, fill: quiet, words.footer + " · Guidedog HTML & PDF") #h(1fr) #text(font: sans, size: 9pt, fill: jade, counter(page).display())])
 body
}
