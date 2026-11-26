# Animation: Placing and Moving

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: Position and placement

`at` a point or a shape (its centre), `x` and `y` alone, or beside a shape: `above`, `below`, `left-of`, `right-of`, with a `gap`.

<animation name="Placement" grid="12x5">

```anim
a: rect "a" at 6.5,3
up: circle "above" above a font 0.5
down: circle "below" below a font 0.5
lt: circle "left-of" left-of a font 0.5
rt: circle "gap 1" right-of a gap 1 font 0.5
on: circle at a radius 0.15 fill amber front
```

---

## x, y and move

```anim
rt: x 11
up: y 1
on: move lt
```

---

## move

`at` places a shape as it's made; `move` places one that's there.

```anim
lt: move 2,2
down: move 11,4
```

---

## Signed: relative

```anim
a: move -1,+0
```

+++

```anim
rt: x -1
up: y +0.5
on: move +0,+1
```

</animation>

## Feature: arrange

<animation name="Arrange" grid="fit">

```anim
a: rect "a" at 2,2
b: circle "b" at 6,6
c: icon(laptop) at 9,6
g: group [a b c] highlight outline
```

---

## arrange right

From the first, in the order they're listed, centres level.

```anim
g: arrange right gap 1.5
```

---

## arrange down

0.25 apart by default, as with below.

```anim
g: arrange down
```

---

## arrange 30 gap 1

Any angle

```anim
g: arrange 30 gap 1
```

---

## arrange 45 stagger 0.2

```anim
g: arrange 45 stagger 0.2
```

---

## Still a group

```anim
g: move 5,3
```

---

## A group in a group

```anim
g: ungroup
d: rect "d" at 8,1
inner: group [c d] highlight outline
outer: group [a b inner] highlight outline
```

+++

The inner group is placed by its box.

```anim
inner: arrange down gap 0.5
outer: arrange right gap 0.5
```

+++

Its first shape stays put.

```anim
inner: arrange right gap 1
```

+++

```anim
outer: arrange down gap 1
```

</animation>

## Feature: Points on an edge

`a.top`, `a.bottom`, `a.left`, `a.right` and the four corners (`a.top-left` …): a point on a shape's edge. They turn and stretch with the shape, and a line end on one follows it.

<animation name="Edge Points" grid="14x7">

```anim
b: rect "b" at 4.5,3.5 size 4x2 fill blue-muted
defaults size 0.3 fill red front
p1: circle attach b.top-left
p2: circle attach b.top
p3: circle attach b.top-right
p4: circle attach b.right
p5: circle attach b.bottom-right
p6: circle attach b.bottom
p7: circle attach b.bottom-left
p8: circle attach b.left
defaults clear
q: diamond "yes?" at 11,2 size 2.4x1.6 fill amber
no: rect "no" at 11,5.5 size 2x1
lb: arrow from b.right to q.left
ln: arrow from q.bottom to no.top "no"
```

---

## They turn and stretch with it

```anim
b: angle 30 speed slow
```

+++

```anim
b: angle 0 size 2.6x2.6
```

---

## A line end on one follows it

```anim
q: angle 25
b: move 4.5,4.5
```

---

## A turn's pivot, travel and the camera

```anim
no: angle +360 about no.bottom-left speed slow
camera move q.top zoom 1.5
```

+++

```anim
camera reset
no: travel b.bottom-right q.top-right 11,5.5
```

</animation>

## Feature: Moving lines

<animation name="Moving Lines" grid="12x5">

```anim
a: rect "a" at 2,1
b: rect "b" at 10,1
p: arrow from a to b
l: line from 2,4 to 6,4 "l" stroke pink
```

---

## l: to +4,-1

One end.

```anim
l: to +4,-1
```

---

## l: move +0,+1

The whole line.

```anim
l: move +0,+1
```

---

## p: from 2,3 to b

```anim
p: from 2,3 to b
```

</animation>

## Feature: Curved moves

<animation name="Curved Moves" grid="12x5">

```anim
a: circle "a" at 2,4 radius 0.4 fill blue
b: rect "b" at 6,3
c: circle "c" at 2,2.5 radius 0.4 fill pink
```

---

## One via

An arc over `b`.

```anim
a: move 8,4 via 5,1 speed slow
```

---

## Several vias

A wave, at an even speed.

```anim
c: move 10,2.5 via 4,4 via 6,2.5 via 8,1 speed slow
```

---

## Via a shape, and relative

```anim
a: move 2,4 via below b speed slow
c: move 2,2.5 via -2,+2 speed slow
```

</animation>

## Feature: travel

Hop by hop; each hop takes the speed.

<animation name="Travel" grid="14x4">

```anim
pc: icon(laptop) "PC" at 1.5,2
r1: circle "R1" at 4.5,1.5 radius 0.45
r2: circle "R2" at 7.5,3 radius 0.45
r3: circle "R3" at 10.5,1.5 radius 0.45
srv: icon(server) "Server" at 13,2
defaults stroke muted back
l1: line from pc to r1
l2: line from r1 to r2
l3: line from r2 to r3
l4: line from r3 to srv
defaults clear
pkt: rect at 1.5,2 size 0.5x0.35 fill amber front
```

---

```anim
pkt: travel r1 r2 r3 srv
```

</animation>

## Feature: follow

<animation name="Follow" grid="12x5">

```anim
a: circle "a" at 2,3
b: circle "b" at 10,3
l: line from a to b
c: curve from a to b via 6,1 dashed
dot: circle at 2,3 radius 0.2 fill amber front
```

---

## follow l

Ends on b's centre, not at the line's end on b's edge.

```anim
dot: follow l speed slow
```

---

## follow-reverse c

Back along the curve, ending on a's centre.

```anim
dot: follow-reverse c speed slow
```

---

## A free end

```anim
f: arrow from a to 6,4.6
```

+++

Ends at the arrow's tip: there's no shape there.

```anim
dot: follow f speed slow
```

</animation>

## Feature: about

<animation name="About" grid="14x7">

```anim
face: circle at 3,4 radius 2.2 fill none
hub: circle at 3,4 radius 0.15 fill fg
hand: arrow from 3,4 to 3,2.3 weight 2
box: rect "A" at 9,2 size 1.4x0.8
p: circle at 9,4 radius 0.08 fill red stroke none
```

---

## A line turns about a point

Its free ends go round it.

```anim
hand: angle +90 about 3,4
```

+++

An absolute angle turns from as drawn.

```anim
hand: angle 210 about hub speed slow
```

+++

```anim
hand: angle +360 about hub speed vslow ease linear
```

---

## A shape goes round, and turns with it

```anim
box: angle +90 about p
```

+++

```anim
box: angle +180 about p speed slow
```

+++

Signed: from its own centre.

```anim
box: angle +90 about +0,+1
```

---

## A group turns as one

```anim
box: angle 0 about p speed instant
w1: circle "1" at 11,6 radius 0.4
w2: circle "2" at 13,6 radius 0.4
spoke: line from w1 to w2
car: group [w1 w2 spoke]
```

+++

```anim
car: angle +180 about 12,6 speed slow
```

+++

```anim
car: angle +90 about p
```

</animation>

## Feature: trail

<animation name="Trail" grid="12x6">

```anim
a: circle "a" at 2,2 radius 0.4 fill teal
b: rect "b" at 2,5
r: line from 6,1 via 8,4 to 11,2
```

---

## trail

From where it is now.

```anim
a: trail
```

+++

```anim
a: move 6,2
```

+++

Along the real path.

```anim
a: move 10,4 via 8,1
```

+++

```anim
a: travel 10,1 7,4 3,3
```

---

## Turned on with a move

```anim
b: move 5,5 trail
```

+++

```anim
b: follow r
b.trail: stroke pink solid
```

+++

```anim
b: angle +180 about 8,3.5 speed slow
```

---

## Styled

```anim
a.trail: stroke teal solid weight 2
b.trail: dotted opacity 0.5 end arrow
```

+++

```anim
a: move 2,2
```

---

## trail clear

```anim
a: trail clear
```

+++

```anim
b: delete
```

---

## Through a swap

A cell's trail stays with the cell, bow and all.

```anim
arr: row [5 3 8 1 6 7] at 2,5
arr.0: trail
arr.3: trail
```

+++

```anim
arr: swap 0 5 speed slow
```

+++

```anim
arr: swap 3 1 speed slow
arr: swap 5 2 speed slow
```

</animation>

## Feature: copy

The copy starts on the original and moves off.

<animation name="Copy" grid="12x3">

```anim
key: icon(key-round) "key" at 2,2 stroke green
```

---

```anim
k2: copy key move 6,2 via 4,1 speed slow
```

+++

```anim
k3: copy k2 move 10,2 stroke amber
```

</animation>

## Feature: attach and detach

<animation name="Attach & Detach" grid="12x5">

```anim
msg: rect "msg" at 2,4 size 1.6x0.8 fill amber
```

---

## attach right-of msg

```anim
lock: icon(lock) attach right-of msg stroke amber pop
```

+++

It rides along, even round a curve.

```anim
msg: move 9,4 via 6,2.5 speed slow
```

---

## detach

```anim
lock: detach
```

+++

```anim
msg: move 3,4 speed slow
```

---

## attach msg

On top.

```anim
lock: attach msg
```

</animation>

## Feature: group and ungroup

<animation name="Group & Ungroup" grid="12x4">

```anim
a: rect "a" at 2,2
b: circle "b" at 5,3
l: arrow from a to b
```

---

## group

```anim
g: group [a, b, l] highlight outline
```

+++

Acts as one.

```anim
g: move +5,+0 speed slow
```

+++

```anim
g: pulse
```

---

## ungroup

The members stay where they are.

```anim
g: ungroup
```

+++

```anim
a: move 2,2
```

---

## Removing a group removes its members

```anim
g2: group [a, b]
```

+++

```anim
g2: delete pop
```

</animation>

## Feature: Camera

<animation name="Camera" grid="12x6">

```anim
a: rect "a" at 2,2 fill red
b: circle "b" at 10,5 fill blue
l: arrow from a to b
```

---

## at a zoom 3

```anim
camera move a zoom 3
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
a: circle "a" at 2,2
b: circle "b" at 10,2
c: circle "c" at 10,5
d: circle "d" at 2,5
```

---

```anim
camera move a zoom 3
```

+++

```anim
camera travel b c d
```

+++

```anim
camera reset speed slow
```

</animation>
