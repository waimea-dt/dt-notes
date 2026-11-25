# Animation: Errors

Bad lines are listed under the animation and skipped; the rest still draws. The lines are grouped in the order of the test pages.

## Errors

<animation name="Errors" grid="8x3" debug hold="fast" controls="hidden">

```anim
# shapes the lines below use
dw: rect at 5,1 draw
a: rect "A" at 2,2
b: rect at 9,9
vv: var 5 at 1,1
er: row [1 2] at 1,1
tr: rect at 1,1
tln3: line from 1,1 to 2,2

# lines and ids
c: blob at 3,3
a: wibble 3
e: rect "x" "y" at 4,2
remove: rect at 1,1
null: rect at 1,1

# shapes and lines
rr: rect at 4,2 radius 0.2
d: line from a to zz
f: circle at 5,2 corner 0.2
g: rect at 6,2 x 3
h: rect at 7,2
h: size +1x0
vl: curve from a to 6,1 via 3,2 bend 1
cv1: curve from a to 6,1 angle up
cv2: curve from a to a bend 1
cv3: curve from a to 6,1 corner 0.2
cv4: line from a to a angle up
tr: fill red line
tln3: end blob
tln3: arrow
tln3: arrows
pg1: polygon at 1,1
pg2: polygon [0 0 1 1] at 1,1
pg3: polygon [0 0 1 1 2] at 1,1
pg4: polygon [0 0 1 x 2 2] at 1,1
pg5: polygon [0 0 1 0 1 1 at 1,1

# looks
st: text "x" at 3,2 stroke red
fl: line from 1,3 to 3,3 dashed flow
fl: solid
a: angle sideways
cv: rect at 1,1 fill muted-bright
cv2: rect at 1,1 fill red-vivid
cf5: rect at 1,1 fill contrast
defaults fill reset
defaults style reset

# placing and moving, and the camera
camera: at 2,2
camera
camera at below dw
camera fill red
camera reset zoom 2
camera zoom 0
camera zoom 1
at2: circle attach dw gap 1
cp: copy zz
vb: rect at 4,1 via 5,2
a: fill blue via 3,2
a: move 6,1 via zz
gb1: group a b
gb2: group [a, zz]
gb3: group [a
gb4: group []
gb5: group [a] at 2,2
ga: arrange right
a: arrange right
er: arrange right
ga: group [a b]
ga: arrange
ga: arrange sideways
ga: arrange right fill red
tr2: rect at 3,1 about 2,2
tr: about 2,2
tr: angle +90 about 2,2 move 3,3
tr: angle +90 about zz
tln: line from tr to dw
tln: angle +90 about 2,2
tln2: line from 1,1 to 2,2 angle 45
er: angle +90 about 1,1
tr: trail
tr: trail
dw: trail clear
tln3: trail
tr.trail: from 1,1
defaults trail
defaults about 1,1

# timing, effects and beat lines
pause -1
auto now
then -1
then: rect at 1,1
defaults: fill red
sp: rect at 1,2 slow
sq: rect at 2,2 speed -1
sl: line from 1,1 to 2,1 slide
defaults fill none
defaults fill none
defaults via 2,2
q: rect at 1,1 ease bouncy
dw: fill red stagger -1
defaults name "x"
defaults "x"
defaults range 0 1
rp: rect at 1,1
rp2: rect at 2,1 repeat 2
rp: fill red repeat 0
rp: fill red repeat 1.5
rp: move 3,3 via 2,2 repeat 2
rp: fill red repeat forever
rp: angle +90 repeat forever
rp: angle +30 about +0,+1 repeat 2
rv: var 1 at 3,1
rv: +1 repeat 3
defaults repeat 2

# emphasis and highlights
hb: rect at 1,1 highlight box
hln: line from 1,1 to 2,2 highlight outline
ht: text "t" at 3,3 highlight inside
hl: rect at 3,1 highlight sparkle
dw: signal
hlr: rect at 1,1 highlight line

# data structures
ar: row at 1,1
ar2: row 5 3 at 1,1
ar3: row [5 3 at 1,1
ar4: row [] at 1,1
ar5: row [5, 3] "label" at 1,1
ar6: rect at 1,1 [5]
ar7: row 2.5 at 1,1
ar8: column 0 at 1,1
ar9: row 3 "x" at 1,1
dw: swap 0 1
dw: name "x"
dw: indices
vv: name clear
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
er2: row [1 2] at 1,3 end arrow
er3: row [1 2] at 1,4 "x"
er: swap 0 1 fill red
er: insert 3 at 0 keep-style
er: numbered indices
er: range 0 5 fill red
dw: range 0 1 fill red
er: range 0 1 move 2,2
er: range 0 fill red
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

# values
dw: 5
dw: null
vv: var 5 "x" at 1,1
vv: 6 "x"
vv: er.0 fill red
br: rect at 1,1 bar
bm: var 5 at 1,1 bar max 0
rg1: var 5 at 1,1 ring size 2x1
rg2: var 5 at 1,1 size 2 pie
rg2: width 3
rg2: corner 0.2
rg3: rect at 1,1 ring
cf1: rect at 1,1 fill rgb(1 2)
cf2: rect at 1,1 fill rgb(red 0 0)
cf3: rect at 1,1 fill rgb(er 0 0)
cf4: rect at 1,1 fill rgb(300 0 0)
cf6: rect at 1,1 fill hsl(0 50 50)
ex1: var 4 at 1,1
ex1: ex1 + zz
ex1: ex1 / 0
ex1: ex1 * 
ex1: er.0 + "x"
ex2: rect at 1,1
ex2: x {ex1 +}
ex2: width {ex1 * speed}
ex2: {ex1}
ex2: angle ex1 about 1,1
ex2: counter
camera x ex1
ex3: text "{zz + 1}" at 1,1
ex4: rect at 1,1 width ex4

# numbers
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

# code and Scratch
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
ec: range 1 2 bar
```

</animation>
