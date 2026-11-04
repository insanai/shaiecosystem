#import "@preview/fletcher:0.5.8": diagram, node, edge
#set text(font: ("DejaVu Sans", "Noto Sans CJK SC"), size: 9pt, fill: rgb("263b36"))
#diagram(
 spacing: (13mm, 12mm), node-stroke: 0.6pt + rgb("a88b53"), node-fill: rgb("f5f2e8"), node-inset: 8pt, edge-stroke: 0.8pt + rgb("315b50"),
 node((0,0), [Fit check\ 匹配核验]), node((1,0), [Evidence\ 证据材料]),
 node((2,0), [Submit\ 正式提交]), node((3,0), [Review\ 审核决策], fill: rgb("e2eade")),
 edge((0,0),(1,0),"->"), edge((1,0),(2,0),"->"), edge((2,0),(3,0),"->"),
)
