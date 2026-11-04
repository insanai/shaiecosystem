#import "theme.typ": configure-document, gd-serif, gd-sans, gd-mono
// guidedog: margin-x = 24mm
#let book(title: "", author: "", version: "", date: "", lang: "en", paper: "a4",
 logo: none, copyright: "", accent: rgb("315b50"), numbering: false,
 version-label: "Edition", serif: gd-serif, sans: gd-sans, mono: gd-mono,
 size: 10.5pt, page-ref: none, body) = {
 let zh = lang.starts-with("zh")
 let ink = rgb("263b36")
 let jade = rgb("315b50")
 let gold = rgb("a88b53")
 let pearl = rgb("faf8f2")
 let quiet = rgb("68746d")
 let title = if zh { "上海创新生态图谱" } else { "Shanghai Ecosystem Atlas" }
 let serif = if zh { ("Noto Serif CJK SC", "Libertinus Serif") } else { ("Libertinus Serif", "Noto Serif CJK SC") }
 let sans = ("DejaVu Sans", "Noto Sans CJK SC", "Libertinus Serif")
 show: configure-document.with(lang: lang, serif: serif, sans: sans, mono: mono, size: size, accent: jade)
 set document(title: title, author: author)
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
    #text(font: sans, size: 8pt, tracking: 0.12em, fill: gold, if zh { "上海 / 创新图谱" } else { "SHANGHAI / FIELD NOTES" })
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
    #text(font: sans, size: 7pt, tracking: 0.12em, fill: gold, if zh { "机构 / 资源 / 对接路径" } else { "PEOPLE / RESOURCES / ENTRY POINTS" })
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
  #place(top + left, dx: 23mm, dy: 24mm)[
   #set par(justify: false, leading: 0.35em)
   #text(font: sans, size: 8pt, tracking: 0.16em, fill: jade, if zh { "东方明珠 / 研究与创新" } else { "THE PEARL OF THE ORIENT" })
   #v(8mm)
   #text(font: serif, size: if zh { 33pt } else { 40pt }, fill: ink, if zh { [上海创新\ 生态图谱] } else { [Shanghai\ Ecosystem Atlas] })
   #v(6mm)
   #text(font: sans, size: 9pt, fill: jade, if zh { "高校 · 产业 · 人工智能 · 资金" } else { "RESEARCH / ENTERPRISE / AI / CAPITAL" })
  ]
  #place(bottom + left, dx: 23mm, dy: -15mm)[
   #text(font: sans, size: 8pt, fill: ink, if zh { "2026研究版 / 简体中文" } else { "RESEARCH EDITION 2026 / ENGLISH" })
  ]
 ]
 page(header: none, footer: none, numbering: none)[
  #set par(justify: false)
  #v(1fr)
  #text(font: sans, size: 9pt, tracking: 0.1em, fill: gold, if zh { "白玉兰 / 珍珠白 / 上海" } else { "MAGNOLIA / PEARL WHITE / SHANGHAI" })
  #v(8mm)
  #text(size: 24pt, title)
  #v(8mm)
  #text(size: 10pt, if zh { "一部为加速器、创始人、研究者及人工智能爱好者编写的实用图谱。" } else { "A field guide for accelerators, founders, researchers and AI enthusiasts." })
  #v(5mm)
  #text(size: 9pt, fill: quiet, if zh { "研究核对日期：2026年11月4日。覆盖16个区、40所本科院校，并附专科及成人高校名录。项目目录为经研究筛选的集合，并非穷尽。政策有效不代表申报开放。" } else { "Research checked 4 November 2026. All 16 districts and 40 undergraduate institutions, with diploma and adult college registers. Program coverage is a researched selection, not an exhaustive census. A valid policy does not imply an open application window." })
  #v(5mm)
  #text(size: 8pt, fill: quiet, if zh { "封面：原创生成水墨风插画，描绘上海天际线、白玉兰与珍珠般的人工智能网络。艺术构图，不作精确地理表达。来源、研究边界及联系说明见书末。" } else { "Cover: original generated ink-style illustration of Shanghai, white magnolia and a pearl-like AI constellation. Artistic composition rather than a geographically exact view. Sources, research limits and contact notes appear at the end." })
  #v(5mm)
  #text(font: sans, size: 8pt, fill: quiet, "Guidedog / Typst / CeTZ / Fletcher / Graphviz")
  #v(10mm)
 ]
 set page(numbering: "i", header: none,
  footer: context align(right, text(font: sans, size: 8pt, fill: quiet, counter(page).display())))
 counter(page).update(1)
 outline(title: if zh { "目录" } else { "Contents" }, depth: 1, indent: auto)
 pagebreak(to: "odd")
 counter(page).update(1)
 set page(numbering: "1",
  header: [#text(font: sans, size: 7pt, tracking: 0.06em, fill: quiet, if zh { "上海 / 创新生态图谱" } else { "SHANGHAI / ECOSYSTEM ATLAS" }) #h(1fr) #text(font: sans, size: 7pt, fill: gold, "2026")],
  footer: context [#line(length: 100%, stroke: 0.4pt + rgb("d8d8ca")) #v(2mm) #text(font: sans, size: 7pt, fill: quiet, if zh { "白玉兰研究版" } else { "THE MAGNOLIA EDITION" }) #h(1fr) #text(font: sans, size: 9pt, fill: jade, counter(page).display())])
 body
}
