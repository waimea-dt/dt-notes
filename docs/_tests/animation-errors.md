# Animation: Errors

Bad lines are listed under the animation and skipped; the rest still draws. The lines are grouped in the order of the test pages.

## Errors

<animation name="Errors" grid="8x3" debug hold="fast" controls="hidden">

```anim
# shapes the lines below use
Dw: rect at 5,1 draw
A: rect "A" at 2,2
B: rect at 9,9
Vv: var 5 at 1,1
Er: row [1 2] at 1,1
Tr: rect at 1,1
Tln3: line from 1,1 to 2,2

# lines and ids
C: blob at 3,3
A: wibble 3
E: rect "x" "y" at 4,2
remove: rect at 1,1
Er[9]: fill red
A.b: rect at 1,1
A: fill Red

# shapes and lines
Rr: rect at 4,2 radius 0.2
D: line from A to Zz
F: circle at 5,2 corner 0.2
G: rect at 6,2 x 3
H: rect at 7,2
H: size +1x0
Vl: curve from A to 6,1 via 3,2 bend 1
Cv1: curve from A to 6,1 angle up
Cv2: curve from A to A bend 1
Cv3: curve from A to 6,1 corner 0.2
Cv4: line from A to A angle up
Tr: fill red line
Tln3: end blob
Tln3: arrow
Tln3: arrows
Pg1: polygon at 1,1
Pg2: polygon [0 0 1 1] at 1,1
Pg3: polygon [0 0 1 1 2] at 1,1
Pg4: polygon [0 0 1 x 2 2] at 1,1
Pg5: polygon [0 0 1 0 1 1 at 1,1

# looks
St: text "x" at 3,2 stroke red
Fl: line from 1,3 to 3,3 dashed flow
Fl: solid
A: angle sideways
Cv: rect at 1,1 fill muted-bright
Cv2: rect at 1,1 fill red-vivid
Cf5: rect at 1,1 fill contrast
defaults fill reset
defaults style reset

# placing and moving, and the camera
Pm: rect move 2,2
Dw: at 2,2
camera: move 2,2
camera
camera move below Dw
camera fill red
camera reset zoom 2
camera zoom 0
camera zoom 1
At2: circle attach Dw gap 1
Cp: copy Zz
Vb: rect at 4,1 via 5,2
A: fill blue via 3,2
A: move 6,1 via Zz
Gb1: group A B
Gb2: group [A, Zz]
Gb3: group [A
Gb4: group []
Gb5: group [A] at 2,2
Ga: arrange right
A: arrange right
Er: arrange right
Ga: group [A B]
Ga: arrange
Ga: arrange sideways
Ga: arrange right fill red
Tr2: rect at 3,1 about 2,2
Tr: about 2,2
Tr: angle +90 about 2,2 move 3,3
Tr: angle +90 about Zz
Tln: line from Tr to Dw
Tln: angle +90 about 2,2
Tln2: line from 1,1 to 2,2 angle 45
Er: angle +90 about 1,1
Tr: trail
Tr: trail
Dw: trail clear
Tln3: trail
Tr.trail: from 1,1
defaults trail
defaults about 1,1

# timing, effects and beat lines
pause -1
auto now
then -1
defaults: fill red
Sp: rect at 1,2 slow
Sq: rect at 2,2 speed -1
Sl: line from 1,1 to 2,1 slide
defaults fill none
defaults fill none
defaults via 2,2
Q: rect at 1,1 ease bouncy
Dw: fill red stagger -1
defaults name "x"
defaults "x"
Rp: rect at 1,1
Rp2: rect at 2,1 repeat 2
Rp: fill red repeat 0
Rp: fill red repeat 1.5
Rp: move 3,3 via 2,2 repeat 2
Rp: fill red repeat forever
Rp: angle +90 repeat forever
Rp: angle +30 about +0,+1 repeat 2
Rv: var 1 at 3,1
Rv: +1 repeat 3
defaults repeat 2

# emphasis and highlights
Hb: rect at 1,1 highlight box
Hln: line from 1,1 to 2,2 highlight outline
Ht: text "t" at 3,3 highlight inside
Hl: rect at 3,1 highlight sparkle
Dw: signal
Hlr: rect at 1,1 highlight line

# data structures
Ar: row at 1,1
Ar2: row 5 3 at 1,1
Ar3: row [5 3 at 1,1
Ar4: row [] at 1,1
Ar5: row [5, 3] "label" at 1,1
Ar6: rect at 1,1 [5]
Ar7: row 2.5 at 1,1
Ar8: column 0 at 1,1
Ar9: row 3 "x" at 1,1
Dw: swap 0 1
Dw: name "x"
Dw: indices
Vv: name clear
Er: remove 5
Er: insert 3 at 9
Er: remove 1 fill red
Er: delete 0
Er: remove 0 into Zz
Er: remove 0 into Er[0]
Er: insert 3 at front
Dw: remove 0
Dw: fill red keep-style
Dw: zoom 2
Dw: clear
Dw: delete fill red
Er2: row [1 2] at 1,3 end arrow
Er3: row [1 2] at 1,4 "x"
Er: swap 0 1 fill red
Er: insert 3 at 0 keep-style
Er[0..5]: fill red
Dw[0..1]: fill red
Er[0..1]: move 2,2
Sp1: span Er[0..9]
Sp2: span Dw[0..1]
Sp3: span Er 0
Sp4: span Zz[0..1]
Sp5: span Er[0..1] at 2,2
Sp6: span Er[0..1]
Sp6: move 2,2
Sp6: size 2
Eg: grid [[1 2] [3 4 5]] at 1,1
Eg[5][0]: 7
Eg2: grid [1 2] at 1,1
Eg3: grid 4 at 1,1
Eg4: grid [[1 2] [3 at 1,1
Eg5: grid [[]] at 1,1
Eg[1]: move 2,2
Eg.col[0]: delete
Eg[1]: indices
Eg: swap 0 9
Eg: swap col 0 [1][1]
Eg: insert [1 2 3 4] at 0
Eg: insert col [1] at 5
Eg: remove 0 into Er[0]
Eg: remove [1][1]
Sg4: grid [[1]] at 1,1
Sg4: remove 0
Eg[0]: remove 0
Eg6: group [Eg[0]]
Sg1: span Eg[0..5][0]
Sg2: span Eg[0..1][0..1][0]
Sg3: span Er[end..9]

# values
Dw: 5
Dw: null
Vv: var 5 "x" at 1,1
Vv: 6 "x"
Vv: Er[0] fill red
Br: rect at 1,1 bar
Bm: var 5 at 1,1 bar max 0
Rg1: var 5 at 1,1 ring size 2x1
Rg2: var 5 at 1,1 size 2 pie
Rg2: width 3
Rg2: corner 0.2
Rg3: rect at 1,1 ring
Cf1: rect at 1,1 fill rgb(1 2)
Cf2: rect at 1,1 fill rgb(red 0 0)
Cf3: rect at 1,1 fill rgb(Er 0 0)
Cf4: rect at 1,1 fill rgb(300 0 0)
Cf6: rect at 1,1 fill hsl(0 50 50)
Ex1: var 4 at 1,1
Ex1: Ex1 + Zz
Ex1: Ex1 / 0
Ex1: Ex1 * 
Ex1: Er[0] + "x"
Ex2: rect at 1,1
Ex2: x {Ex1 +}
Ex2: width {Ex1 * speed}
Ex1: {Ex1 + Zz}
Ex1: (Ex1 + 1
Ex1: ()
Ex1: fill red (2)
Ex2: {Ex1}
Ex2: angle Ex1 about 1,1
Ex2: counter
camera x Ex1
Ex3: text "{Zz + 1}" at 1,1
Ex4: rect at 1,1 width Ex4

# numbers
Eb: binary 5 at 1,1 digits 4
Eb[0]: 2
Eb[1]: "x"
Eb: -9
Eb: +1.5
Vv: +1
Eb: swap 0 1
Eb: insert 1 at 0
Eb: remove 0
Eb: digits 8
Eb[0..9]: flip
Eb: flip fill red
Eb: ink clear
Eb: style
Eb2: binary 1.5 at 1,1
Eb3: binary null at 1,1
Eb4: binary at 1,1
Eb5: binary 5 digits 0 at 1,1
Eb6: binary 5 digits 40 at 1,1
Eb10: binary 5 bits 4 at 1,1
Eh: hex 255 at 1,1
Eh[0]: G
Eh[0]: F
Eh[0]: 16
Eh: flip
Eh[1]: flip
Eh2: hex 5 digits 9 at 1,1
Ed: denary 5 at 1,1 decimal
Ed2: denary 5 at 1,1
Ed2[0]: Q
Ed2[0]: -9
Eb7: binary Zz at 1,1
Eb8: binary 5 [1 0] at 1,1
Eb9: binary 300 at 1,1
Er: powers
Dw: decimal
Dw: flip
Eb[0][0..1]: flip
defaults decimal

# code and Scratch
Ec: code ["a" "b"] at 1,1
Ec: remove 0
Ec: insert "x" at 4
Ec: swap 0 1
Ec: "x"
Ec: code 4 at 1,1
Ec2: code ["a" 5] at 1,1
Ec3: code "a" size 2 at 1,1
Ec4: code ["a" at 1,1
Ec5: code [] at 1,1
Ec6: code "a" lang pyhton at 1,1
Ec7: text "a" lang python at 1,1
Ec8: row [1 2] at 1,5 lang python
Es: scratch ["move (10) steps" 5] at 1,1
Es: scratch ["move (10) steps"] "say [Hi]" at 1,1
Es2: scratch ["move (10) steps" at 1,1
Es3: scratch "move (10) steps" at 1,1 fill red
Es3: scratch "move (10) steps" at 1,1 typed
Es3: highlight line
Es5: scratch ["move (10) steps" "turn right (5) degrees"] at 1,1
Es5[3]: highlight line
Es5[1.5]: highlight line
Hlr2: rect at 1,1 highlight line 1
Es5[9]: "move (10) steps"
Es5[x]: "move (10) steps"
Es5: insert "move (10) steps"
Es5: insert at 1
Es5: swap 1 1
Es5: remove 3
Es6: scratch ["forever" "move (10) steps" "" "end"] at 1,1
Es6: swap 1 2
Es6: remove 1
Es6: remove 3
Es6[4]: highlight line
Es4: rect at 1,1
Es4: ["move (10) steps"]
Ec: highlight line
Er: highlight line
Ec[1..2]: bar
```

</animation>
