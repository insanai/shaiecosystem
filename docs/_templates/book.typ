#import "theme.typ": configure-document, gd-serif, gd-sans, gd-mono
// guidedog: margin-x = 24mm
#let book(title: "", author: "", version: "", date: "", lang: "en", paper: "a4",
 logo: none, copyright: "", accent: rgb("315b50"), numbering: false,
 version-label: "Edition", serif: gd-serif, sans: gd-sans, mono: gd-mono,
 size: 11.5pt, page-ref: none, body) = {
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
 set par(justify: true, leading: 0.75em, spacing: 0.9em)
 set page(width: 240mm, height: 300mm, margin: (x: 24mm, top: 23mm, bottom: 24mm), fill: pearl)
 // Chapter labels follow the source document IDs, so every translation uses the same structure.
 let roots = ("reading-the-city", "software-ai", "hardware-ai", "districts", "universities", "university-register", "incubation", "research", "corporate", "government", "funding-guide", "funding", "investors", "apply", "methodology", "sources")
 let chapter-index(it) = {
  let key = if it.has("label") { repr(it.label) } else { "" }
  let number = 0
  for (n, root) in roots.enumerate() {
   if key.starts-with("<" + root + "-") { number = n + 1; break }
  }
  number
 }
 let part-index(n) = if n <= 3 { 0 } else if n <= 10 { 1 } else if n <= 14 { 2 } else { 3 }
 let part-colors = (rgb("4b737f"), jade, rgb("8f6a3e"), quiet)
 show heading: set text(font: serif, fill: ink, hyphenate: false)
 show heading: set par(justify: false, first-line-indent: 0pt)
 set heading(numbering: none)
 show heading.where(level: 1): it => {
  if it.outlined {
   let n = chapter-index(it)
   let section = part-index(n)
   pagebreak(weak: true)
   block(above: 3mm, below: 9mm, sticky: true)[
    #grid(columns: (23mm, 1fr), gutter: 7mm,
     text(font: serif, size: 57pt, fill: rgb("cdd7ce"), if n > 0 { if n < 10 { "0" + str(n) } else { str(n) } } else { "" }),
     [#text(font: sans, size: 7.5pt, tracking: 0.08em, fill: part-colors.at(section), words.parts.at(section))
      #v(3mm)
      #text(size: 32pt, weight: "regular", it.body)]
    )
    #v(5mm)
    #line(length: 100%, stroke: 0.55pt + rgb("cbd5cb"))
   ]
  } else { block(above: 5mm, below: 5mm, text(size: 22pt, it.body)) }
 }
 show heading.where(level: 2): it => {
  let key = if it.has("label") { repr(it.label) } else { "" }
  let profile = key.contains("entities-") or key.contains("districts-") or (key.contains("funding-") and not key.contains("funding-guide-"))
  if profile {
   pagebreak(weak: true)
   block(above: 3mm, below: 8mm, sticky: true)[
    #text(font: sans, size: 7.5pt, tracking: 0.08em, fill: gold, words.profile)
    #v(5mm)
    #text(size: 29pt, weight: "regular", fill: ink, it.body)
    #v(5mm)
    #line(length: 26mm, stroke: 1.4pt + jade)
   ]
  } else {
   block(above: 9mm, below: 4mm, sticky: true, text(size: 20pt, weight: "regular", fill: jade, it.body))
  }
 }
 show heading.where(level: 3): it => block(above: 6mm, below: 2.5mm, sticky: true,
  text(size: 10pt, font: sans, weight: "bold", fill: jade, it.body))
 show heading.where(level: 4): set text(size: 10pt, weight: "bold")
 show link: set text(fill: jade)
 show regex("https?://[^\\s]+"): it => text(size: 7.5pt, it.text.replace("/", "/\u{200b}").replace("%", "%\u{200b}"))
 set figure(numbering: none, gap: 3mm)
 show figure: it => align(center, block(width: 100%, above: 6mm, below: 6mm, it))
 show figure.caption: set text(size: 8pt, font: sans, fill: quiet)
 show figure.caption: set par(justify: false)
 set table(stroke: (bottom: 0.35pt + rgb("d8dfd4")), inset: (x: 6pt, y: 7pt), align: start)
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
   #text(font: sans, size: 8pt, tracking: 0.16em, fill: jade, if zh { "东方明珠 · 白玉兰版" } else if hi { "पूरब का मोती · श्वेत मैग्नोलिया संस्करण" } else if ja { "東洋の真珠 · 白玉蘭水墨エディション" } else if ko { "동양의 진주 · 백목련 수묵 에디션" } else if de { "DIE PERLE DES ORIENTS · MAGNOLIEN-EDITION" } else if es { "LA PERLA DE ORIENTE · EDICIÓN MAGNOLIA" } else { "THE PEARL OF THE ORIENT · MAGNOLIA EDITION" })
   #v(7mm)
   #text(font: serif, size: if zh or ja or ko { 32pt } else if de or es or hi { 31pt } else { 39pt }, fill: ink, words.cover_lines.map(line => [#line]).join(linebreak()))
   #v(5mm)
   #text(font: sans, size: 9pt, fill: jade, if zh { "16区 · 高校 · AI软硬件 · 融资与扶持" } else if hi { "16 जिले · विश्वविद्यालय · AI · पूंजी" } else if ja { "16行政区 · 大学 · AI · 資金ルート" } else if ko { "16개 행정구 · 대학 · AI · 자금 지원" } else if de { "16 BEZIRKE · UNIVERSITÄTEN · KI · KAPITAL" } else if es { "16 DISTRITOS · UNIVERSIDADES · IA · CAPITAL" } else { "16 DISTRICTS / UNIVERSITIES / AI / CAPITAL" })
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
  #v(12mm)
  #text(font: sans, size: 9pt, tracking: 0.1em, fill: gold, if zh { "白玉兰 / 珍珠白 / 上海" } else if hi { "श्वेत मैग्नोलिया / पर्ल व्हाइट / शंघाई" } else if ja { "白玉蘭 / パールホワイト / 上海" } else if ko { "백목련 / 펄 화이트 / 상하이" } else if de { "WEISSE MAGNOLIE / PERLENWEISS / SHANGHAI" } else if es { "MAGNOLIA BLANCA / BLANCO PERLA / SHANGHÁI" } else { "MAGNOLIA / PEARL WHITE / SHANGHAI" })
  #v(7mm)
  #text(size: 24pt, title)
  #v(6mm)
  #text(size: 10pt, if zh { "面向加速器、创业者、研究人员和AI爱好者的实用图谱。" } else if hi { "एक्सेलेरेटर, संस्थापकों, शोधकर्ताओं और AI उत्साही लोगों के लिए एक व्यावहारिक मार्गदर्शिका।" } else if ja { "アクセラレーター、創業者、研究者、AI実践者のための実用フィールドガイド。" } else if ko { "액셀러레이터, 창업자, 연구자 및 AI 실무자를 위한 실용 필드 가이드." } else if de { "Ein praktischer Leitfaden für Acceleratoren, Gründer, Forschende und KI-Interessierte." } else if es { "Una guía práctica para aceleradoras, fundadores, investigadores y entusiastas de la IA." } else { "A field guide for accelerators, founders, researchers and AI enthusiasts." })
  #v(14mm)
  #grid(columns: (1fr, 1fr, 1fr, 1fr), gutter: 6mm,
   ..(str(counts.districts), str(counts.entities), str(counts.funding), str(counts.sources)).enumerate().map(((n, value)) => [
    #text(size: 34pt, fill: jade, value)
    #v(3mm)
    #text(font: sans, size: 8pt, fill: quiet, words.statistics.at(n))
   ])
  )
  #v(1fr)
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
  #v(3mm)
  #text(size: 8pt, fill: quiet)[#link("https://creativecommons.org/licenses/by-sa/4.0/")[CC BY-SA 4.0] #words.license #words.rights]
  #v(4mm)
  #text(font: sans, size: 8pt, fill: quiet, "Guidedog (HTML & PDF) / Typst / CeTZ / Fletcher / Graphviz")
  #v(8mm)
 ]
 set page(numbering: "i", header: none,
  footer: context align(right, text(font: sans, size: 8pt, fill: quiet, counter(page).display())))
 counter(page).update(1)
 set text(size: 11.5pt)
 show outline.entry: it => context {
  let n = chapter-index(it.element)
  block(width: 100%, above: 3.5mm, below: 0pt)[
   #grid(columns: (12mm, 1fr, 13mm), gutter: 3mm,
    text(font: sans, size: 9pt, fill: gold, if n < 10 { "0" + str(n) } else { str(n) }),
    link(it.element.location(), text(font: serif, size: 13pt, it.body())),
    align(right, link(it.element.location(), text(font: sans, size: 10pt, it.page()))))
  ]
 }
 outline(title: if zh { "目录" } else if hi { "विषय-सूची" } else if ja { "目次" } else if ko { "목차" } else if de { "Inhaltsverzeichnis" } else if es { "Índice" } else { "Contents" }, depth: 1, indent: auto)
 pagebreak()
 counter(page).update(1)
 set page(numbering: "1",
  header: [#text(font: sans, size: 7pt, tracking: 0.06em, fill: quiet, words.running) #h(1fr) #text(font: sans, size: 7pt, fill: gold, "2026 · Vikrant Rathore")],
  footer: context {
   let folio = text(font: serif, size: 11pt, fill: jade, counter(page).display())
   let edition = text(font: sans, size: 7pt, tracking: 0.04em, fill: quiet, words.footer)
   if calc.odd(here().page()) { [#edition #h(1fr) #folio] } else { [#folio #h(1fr) #edition] }
  })
 body
}
