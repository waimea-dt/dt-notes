# Animation Errors

See [the full animation demo page](animation.md)

## Errors

Bad lines are listed under the animation and skipped; the rest still draws.

<animation grid="8x3" debug hold="fast" controls="hidden">

```anim
pause -1
auto now
defaults: fill red
camera: at 2,2
hb: rect at 1,1 highlight box
hln: line from 1,1 to 2,2 highlight outline
ht: text "t" at 3,3 highlight inside
camera
camera at below dw
camera fill red
camera reset zoom 2
camera zoom 0
camera zoom 1
sp: rect at 1,2 slow
sq: rect at 2,2 speed -1
st: text "x" at 3,2 stroke red
rr: rect at 4,2 radius 0.2
dw: rect at 5,1 draw
sl: line from 1,1 to 2,1 slide
fl: line from 1,3 to 3,3 dashed flow
fl: solid
at2: circle attach dw gap 1
cp: copy zz
hl: rect at 3,1 highlight sparkle
a: rect "A" at 2,2
b: rect at 9,9
c: blob at 3,3
a: wibble 3
d: line from a to zz
e: rect "x" "y" at 4,2
f: circle at 5,2 size 1x2
g: rect at 6,2 x 3
h: rect at 7,2
h: size +1x0
k: circle at 1,1 width 2
defaults fill none
defaults fill none
remove: rect at 1,1
vb: rect at 4,1 via 5,2
a: fill blue via 3,2
vl: line from a to 6,1 via 3,2
defaults via 2,2
a: move 6,1 via zz
ar: row at 1,1
ar2: row 5 3 at 1,1
ar3: row [5 3 at 1,1
ar4: row [] at 1,1
ar5: row [5, 3] "label" at 1,1
ar6: rect at 1,1 [5]
ar7: row 2.5 at 1,1
ar8: column 0 at 1,1
ar9: row 3 "x" at 1,1
gb1: group a b
gb2: group [a, zz]
gb3: group [a
gb4: group []
dw: swap 0 1
dw: signal
q: rect at 1,1 ease bouncy
dw: fill red stagger -1
dw: name "x"
dw: indices
dw: 5
dw: null
vv: var 5 "x" at 1,1
vv: var 5 at 1,1
vv: 6 "x"
vv: name clear
defaults name "x"
null: rect at 1,1
er: row [1 2] at 1,1
er: remove 5
er: insert 3 at 9
er: remove 1 fill red
er: delete 0
er: remove 0 into zz
er: remove 0 into er.0
er: insert 3 at front
dw: remove 0
dw: fill red keep-style
dw: zoom 2
dw: clear
dw: delete fill red
gb5: group [a] at 2,2
defaults "x"
er2: row [1 2] at 1,3 arrow
er3: row [1 2] at 1,4 "x"
vv: er.0 fill red
er: swap 0 1 fill red
er: insert 3 at 0 keep-style
ec: code ["a" "b"] at 1,1
ec: remove 0
ec: insert "x" at 4
ec: swap 0 1
ec: "x"
ec: code 4 at 1,1
ec2: code ["a" 5] at 1,1
ec3: code "a" size 2 at 1,1
ec4: code ["a" at 1,1
ec5: code [] at 1,1
ec6: code "a" lang pyhton at 1,1
ec7: text "a" lang python at 1,1
ec8: row [1 2] at 1,5 lang python
ec: highlight line
er: highlight line
hlr: rect at 1,1 highlight line
er: numbered indices
er: range 0 5 fill red
dw: range 0 1 fill red
er: range 0 1 move 2,2
er: range 0 fill red
ec: range 1 2 bar
defaults range 0 1
br: rect at 1,1 bar
bm: var 5 at 1,1 bar max 0
```

</animation>
