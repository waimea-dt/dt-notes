# Animation: Placing and Moving

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: Position and placement

`at` a point or a shape (its centre), `x` and `y` alone, or beside a shape: `above`, `below`, `left-of`, `right-of`, with a `gap`.

<animation name="Placement" grid="12x5">

```anim
A: rect "a" at 6.5,3
Up: circle "above" above A font 0.5
Down: circle "below" below A font 0.5
Lt: circle "left-of" left-of A font 0.5
Rt: circle "gap 1" right-of A gap 1 font 0.5
On: circle at A radius 0.15 fill amber front
```

---

## x, y and move

```anim
Rt: x 11
Up: y 1
On: move Lt
```

---

## move

`at` places a shape as it's made; `move` places one that's there.

```anim
Lt: move 2,2
Down: move 11,4
```

---

## Signed: relative

```anim
A: move -1,+0
```

+++

```anim
Rt: x -1
Up: y +0.5
On: move +0,+1
```

</animation>

## Feature: arrange

<animation name="Arrange" grid="fit">

```anim
A: rect "a" at 2,2
B: circle "b" at 6,6
C: icon(laptop) at 9,6
G: group [A B C] highlight outline
```

---

## arrange right

From the first, in the order they're listed, centres level.

```anim
G: arrange right gap 1.5
```

---

## arrange down

0.25 apart by default, as with below.

```anim
G: arrange down
```

---

## arrange 30 gap 1

Any angle

```anim
G: arrange 30 gap 1
```

---

## arrange 45 stagger 0.2

```anim
G: arrange 45 stagger 0.2
```

---

## Still a group

```anim
G: move 5,3
```

---

## A group in a group

```anim
G: ungroup
D: rect "d" at 8,1
Inner: group [C D] highlight outline
Outer: group [A B Inner] highlight outline
```

+++

The inner group is placed by its box.

```anim
Inner: arrange down gap 0.5
Outer: arrange right gap 0.5
```

+++

Its first shape stays put.

```anim
Inner: arrange right gap 1
```

+++

```anim
Outer: arrange down gap 1
```

</animation>

## Feature: Points on an edge

`a.top`, `a.bottom`, `a.left`, `a.right` and the four corners (`a.top-left` …): a point on a shape's edge. They turn and stretch with the shape, and a line end on one follows it.

<animation name="Edge Points" grid="14x7">

```anim
B: rect "b" at 4.5,3.5 size 4x2 fill blue-muted
defaults size 0.3 fill red front
P1: circle attach B.top-left
P2: circle attach B.top
P3: circle attach B.top-right
P4: circle attach B.right
P5: circle attach B.bottom-right
P6: circle attach B.bottom
P7: circle attach B.bottom-left
P8: circle attach B.left
defaults clear
Q: diamond "yes?" at 11,2 size 2.4x1.6 fill amber
No: rect "no" at 11,5.5 size 2x1
Lb: arrow from B.right to Q.left
Ln: arrow from Q.bottom to No.top "no"
```

---

## They turn and stretch with it

```anim
B: angle 30 speed slow
```

+++

```anim
B: angle 0 size 2.6x2.6
```

---

## A line end on one follows it

```anim
Q: angle 25
B: move 4.5,4.5
```

---

## A turn's pivot, travel and the camera

```anim
No: angle +360 about No.bottom-left speed slow
camera move Q.top zoom 1.5
```

+++

```anim
camera reset
No: travel B.bottom-right Q.top-right 11,5.5
```

</animation>

## Feature: Moving lines

<animation name="Moving Lines" grid="12x5">

```anim
A: rect "a" at 2,1
B: rect "b" at 10,1
P: arrow from A to B
L: line from 2,4 to 6,4 "l" stroke pink
```

---

## l: to +4,-1

One end.

```anim
L: to +4,-1
```

---

## l: move +0,+1

The whole line.

```anim
L: move +0,+1
```

---

## p: from 2,3 to b

```anim
P: from 2,3 to B
```

</animation>

## Feature: Curved moves

<animation name="Curved Moves" grid="12x5">

```anim
A: circle "a" at 2,4 radius 0.4 fill blue
B: rect "b" at 6,3
C: circle "c" at 2,2.5 radius 0.4 fill pink
```

---

## One via

An arc over `B`.

```anim
A: move 8,4 via 5,1 speed slow
```

---

## Several vias

A wave, at an even speed.

```anim
C: move 10,2.5 via 4,4 via 6,2.5 via 8,1 speed slow
```

---

## Via a shape, and relative

```anim
A: move 2,4 via below B speed slow
C: move 2,2.5 via -2,+2 speed slow
```

</animation>

## Feature: travel

Hop by hop; each hop takes the speed.

<animation name="Travel" grid="14x4">

```anim
Pc: icon(laptop) "PC" at 1.5,2
R1: circle "R1" at 4.5,1.5 radius 0.45
R2: circle "R2" at 7.5,3 radius 0.45
R3: circle "R3" at 10.5,1.5 radius 0.45
Srv: icon(server) "Server" at 13,2
defaults stroke muted back
L1: line from Pc to R1
L2: line from R1 to R2
L3: line from R2 to R3
L4: line from R3 to Srv
defaults clear
Pkt: rect at 1.5,2 size 0.5x0.35 fill amber front
```

---

```anim
Pkt: travel R1 R2 R3 Srv
```

</animation>

## Feature: follow

<animation name="Follow" grid="12x5">

```anim
A: circle "a" at 2,3
B: circle "b" at 10,3
L: line from A to B
C: curve from A to B via 6,1 dashed
Dot: circle at 2,3 radius 0.2 fill amber front
```

---

## follow l

Ends on b's centre, not at the line's end on b's edge.

```anim
Dot: follow L speed slow
```

---

## follow-reverse c

Back along the curve, ending on a's centre.

```anim
Dot: follow-reverse C speed slow
```

---

## A free end

```anim
F: arrow from A to 6,4.6
```

+++

Ends at the arrow's tip: there's no shape there.

```anim
Dot: follow F speed slow
```

</animation>

## Feature: about

<animation name="About" grid="14x7">

```anim
Face: circle at 3,4 radius 2.2 fill none
Hub: circle at 3,4 radius 0.15 fill fg
Hand: arrow from 3,4 to 3,2.3 weight 2
Box: rect "A" at 9,2 size 1.4x0.8
P: circle at 9,4 radius 0.08 fill red stroke none
```

---

## A line turns about a point

Its free ends go round it.

```anim
Hand: angle +90 about 3,4
```

+++

An absolute angle turns from as drawn.

```anim
Hand: angle 210 about Hub speed slow
```

+++

```anim
Hand: angle +360 about Hub speed vslow ease linear
```

---

## A shape goes round, and turns with it

```anim
Box: angle +90 about P
```

+++

```anim
Box: angle +180 about P speed slow
```

+++

Signed: from its own centre.

```anim
Box: angle +90 about +0,+1
```

---

## A group turns as one

```anim
Box: angle 0 about P speed instant
W1: circle "1" at 11,6 radius 0.4
W2: circle "2" at 13,6 radius 0.4
Spoke: line from W1 to W2
Car: group [W1 W2 Spoke]
```

+++

```anim
Car: angle +180 about 12,6 speed slow
```

+++

```anim
Car: angle +90 about P
```

</animation>

## Feature: trail

<animation name="Trail" grid="12x6">

```anim
A: circle "a" at 2,2 radius 0.4 fill teal
B: rect "b" at 2,5
R: line from 6,1 via 8,4 to 11,2
```

---

## trail

From where it is now.

```anim
A: trail
```

+++

```anim
A: move 6,2
```

+++

Along the real path.

```anim
A: move 10,4 via 8,1
```

+++

```anim
A: travel 10,1 7,4 3,3
```

---

## Turned on with a move

```anim
B: move 5,5 trail
```

+++

```anim
B: follow R
B.trail: stroke pink solid
```

+++

```anim
B: angle +180 about 8,3.5 speed slow
```

---

## Styled

```anim
A.trail: stroke teal solid weight 2
B.trail: dotted opacity 0.5 end arrow
```

+++

```anim
A: move 2,2
```

---

## trail clear

```anim
A: trail clear
```

+++

```anim
B: delete
```

---

## Through a swap

A cell's trail stays with the cell, bow and all.

```anim
Arr: row [5 3 8 1 6 7] at 2,5
Arr[0]: trail
Arr[3]: trail
```

+++

```anim
Arr: swap 0 5 speed slow
```

+++

```anim
Arr: swap 3 1 speed slow
Arr: swap 5 2 speed slow
```

</animation>

## Feature: copy

The copy starts on the original and moves off.

<animation name="Copy" grid="12x3">

```anim
Key: icon(key-round) "key" at 2,2 stroke green
```

---

```anim
K2: copy Key move 6,2 via 4,1 speed slow
```

+++

```anim
K3: copy K2 move 10,2 stroke amber
```

</animation>

## Feature: attach and detach

<animation name="Attach & Detach" grid="12x5">

```anim
Msg: rect "msg" at 2,4 size 1.6x0.8 fill amber
```

---

## attach right-of msg

```anim
Lock: icon(lock) attach right-of Msg stroke amber pop
```

+++

It rides along, even round a curve.

```anim
Msg: move 9,4 via 6,2.5 speed slow
```

---

## detach

```anim
Lock: detach
```

+++

```anim
Msg: move 3,4 speed slow
```

---

## attach msg

On top.

```anim
Lock: attach Msg
```

</animation>

## Feature: group and ungroup

<animation name="Group & Ungroup" grid="12x4">

```anim
A: rect "a" at 2,2
B: circle "b" at 5,3
L: arrow from A to B
```

---

## group

```anim
G: group [A, B, L] highlight outline
```

+++

Acts as one.

```anim
G: move +5,+0 speed slow
```

+++

```anim
G: pulse
```

---

## ungroup

The members stay where they are.

```anim
G: ungroup
```

+++

```anim
A: move 2,2
```

---

## Removing a group removes its members

```anim
G2: group [A, B]
```

+++

```anim
G2: delete pop
```

</animation>

## Feature: Camera

<animation name="Camera" grid="12x6">

```anim
A: rect "a" at 2,2 fill red
B: circle "b" at 10,5 fill blue
L: arrow from A to B
```

---

## at a zoom 3

```anim
camera move A zoom 3
```

---

## at 6,3.5 zoom 2

```anim
camera move 6,3.5 zoom 2 speed slow
```

---

## reset

```anim
camera reset
```

---

## zoom 0.8 move +1,+0

Zoomed out and nudged.

```anim
camera zoom 0.8 move +1,+0
```

+++

```anim
camera reset speed fast
```

</animation>

## Feature: Camera travel

<animation name="Camera Travel" grid="12x6">

```anim
A: circle "a" at 2,2
B: circle "b" at 10,2
C: circle "c" at 10,5
D: circle "d" at 2,5
```

---

```anim
camera move A zoom 3
```

+++

```anim
camera travel B C D
```

+++

```anim
camera reset speed slow
```

</animation>
