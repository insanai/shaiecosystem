#import "@preview/cetz:0.3.4"
#set text(font: ("DejaVu Sans", "Noto Serif CJK SC"), size: 9pt, fill: rgb("263b36"))
#cetz.canvas({
 import cetz.draw: *
 let labels = ([Research\ 科研], [Prototype\ 样机], [Verification\ 验证], [Pilot line\ 中试], [Production\ 生产])
 for (i, label) in labels.enumerate() {
  let x = i * 3.0
  rect((x,0), (x+2.5,1.5), fill: if i == 4 { rgb("e2eade") } else { rgb("f5f2e8") }, stroke: 0.6pt + rgb("a88b53"), radius: 0.12)
  content((x+1.25,0.75), align(center,label), anchor: "center")
  circle((x+1.25,-0.45), radius: 0.09, fill: rgb("315b50"), stroke: none)
  if i < 4 { line((x+2.55,0.75),(x+2.95,0.75),stroke: 0.8pt + rgb("315b50"),mark: (end: ">")) }
 }
 line((1.25,-0.45),(13.25,-0.45),stroke: 0.5pt + rgb("a88b53"))
})
