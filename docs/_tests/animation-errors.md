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
a: angle sideways
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
vl: curve from a to 6,1 via 3,2 bend 1
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
es: scratch ["move (10) steps" 5] at 1,1
es: scratch ["move (10) steps"] "say [Hi]" at 1,1
es2: scratch ["move (10) steps" at 1,1
es3: scratch "move (10) steps" at 1,1 fill red
es3: scratch "move (10) steps" at 1,1 typed
es3: highlight line
es5: scratch ["move (10) steps" "turn right (5) degrees"] at 1,1
es5: highlight line 3
es5: highlight line 1.5
hlr2: rect at 1,1 highlight line 1
es5: line 9 "move (10) steps"
es5: line x "move (10) steps"
es5: insert "move (10) steps"
es5: insert at 1
es5: swap 1 1
es5: remove 3
er: line 1 "move (10) steps"
es6: scratch ["forever" "move (10) steps" "" "end"] at 1,1
es6: swap 1 2
es6: remove 1
es6: remove 3
es6: highlight line 4
es4: rect at 1,1
es4: ["move (10) steps"]
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
rg1: var 5 at 1,1 ring size 2x1
rg2: var 5 at 1,1 size 2 pie
rg2: width 3
rg2: corner 0.2
rg3: rect at 1,1 ring
cv: rect at 1,1 fill muted-bright
cv2: rect at 1,1 fill red-vivid
sp1: span er 0 9
sp2: span dw 0 1
sp3: span er 0
sp4: span zz 0 1
sp5: span er 0 1 at 2,2
sp6: span er 0 1
sp6: move 2,2
sp6: size 2
eg: grid [[1 2] [3 4 5]] at 1,1
eg2: grid [1 2] at 1,1
eg3: grid 4 at 1,1
eg4: grid [[1 2] [3 at 1,1
eg5: grid [[]] at 1,1
eg.1: move 2,2
eg.col.0: delete
eg.1: indices
eg: swap 0 9
eg: swap col 0 1.1
eg: insert [1 2 3 4] at 0
eg: insert col [1] at 5
eg: remove 0 into er.0
eg: remove 1.1
sg4: grid [[1]] at 1,1
sg4: remove 0
eg.0: remove 0
eg6: group [eg.0]
sg1: span eg 0.0 5.0
sg2: span eg 0 1
sg3: span er end 9
cv1: curve from a to 6,1 angle up
cv2: curve from a to a bend 1
cv3: curve from a to 6,1 corner 0.2
cv4: line from a to a angle up
eb: binary 5 at 1,1 digits 4
eb.0: 2
eb.1: "x"
eb: -9
eb: +1.5
vv: +1
eb: swap 0 1
eb: insert 1 at 0
eb: remove 0
eb: digits 8
eb: flip 0 9
eb: flip fill red
eb: colour clear
eb: style
defaults fill reset
defaults style reset
eb2: binary 1.5 at 1,1
eb3: binary null at 1,1
eb4: binary at 1,1
eb5: binary 5 digits 0 at 1,1
eb6: binary 5 digits 40 at 1,1
eb10: binary 5 bits 4 at 1,1
eh: hex 255 at 1,1
eh.0: G
eh.0: 16
eh: flip
eh.1: flip
eh2: hex 5 digits 9 at 1,1
ed: denary 5 at 1,1 decimal
ed2: denary 5 at 1,1
ed2.0: A
ed2.0: -9
eb7: binary zz at 1,1
eb8: binary 5 [1 0] at 1,1
eb9: binary 300 at 1,1
er: powers
dw: decimal
dw: flip
eb.0: flip 0 1
defaults decimal
```

</animation>
