# Animation: Movement, Timing and Camera

Click an animation to give it focus, then use ← / → to step and `F` for full screen.

**Animation tests:** [Blocks](animation.md) · [Examples](animation-examples.md) · [Shapes, Looks and Highlights](animation-shapes.md) · **Movement, Timing and Camera** · [Images and Scenes](animation-images.md) · [Data Structures and Code](animation-data.md) · [Errors](animation-errors.md)

## Feature: Position and placement

<animation grid="12x5">

```anim
a: rect "a" at 6,3
up: circle "above" above a font 0.5
down: circle "below" below a font 0.5
lt: circle "left-of" left-of a font 0.5
rt: circle "gap 1" right-of a gap 1 font 0.5
on: circle at a radius 0.15 fill amber front
```

---

## x, y and at

```anim
rt: x 11
up: y 1
on: at lt
```


</animation>

## Feature: Relative values

<animation grid="12x5">

```anim
r: rect "r" at 3,2
```

---

## move +2,+1

```anim
r: move +2,+1
```

---

## x +3

```anim
r: x +3
```

---

## width +1, size +0.5, angle +45

```anim
r: width +1
```

+++

```anim
r: size +0.5
```

+++

```anim
r: angle +45
```

</animation>

## Feature: Moving lines

<animation grid="12x5">

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

<animation grid="12x5">

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

<animation grid="14x4">

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

<animation grid="12x5">

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

## Feature: copy

The copy starts on the original and moves off.

<animation grid="12x3">

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

<animation grid="12x5">

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

<animation grid="12x4">

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

## Feature: speed

<animation grid="12x7">

```anim
defaults radius 0.3 fill blue
s1: circle at 3,1
s2: circle at 3,2
s3: circle at 3,3
s4: circle at 3,4
s5: circle at 3,5
s6: circle at 3,6
s7: circle at 3,7
defaults clear
t1: text "instant" at 1.5,1 font 0.6
t2: text "vfast" at 1.5,2 font 0.6
t3: text "fast" at 1.5,3 font 0.6
t4: text "normal" at 1.5,4 font 0.6
t5: text "slow" at 1.5,5 font 0.6
t6: text "vslow" at 1.5,6 font 0.6
t7: text "3 s" at 1.5,7 font 0.6
```

---

```anim
s1: move 11,1 speed instant
s2: move 11,2 speed vfast
s3: move 11,3 speed fast
s4: move 11,4
s5: move 11,5 speed slow
s6: move 11,6 speed vslow
s7: move 11,7 speed 3
```

</animation>

## Feature: delay

<animation grid="12x3">

```anim
a: rect "0" at 3,2
b: rect "1 s" at 6,2
c: rect "2 s" at 9,2
```

---

```anim
a: fill green
b: fill green delay 1
c: fill green delay 2
```

</animation>

## Feature: stagger

<animation grid="12x5">

```anim
arr: row [5, 3, 8, 1, 9, 2] at 3,2 size 1 gap 0.3 fill blue corner 0.3 pop stagger 0.15
```

---

## stagger

```anim
arr: fill green stagger
```

+++

```anim
arr: pulse stagger 0.1
```

---

## stagger-reverse, after a delay

```anim
arr: fill amber stagger-reverse 0.2 delay 0.5
```

---

## One highlight per cell

```anim
arr: highlight arrow stagger 0.2
```

+++

```anim
arr: highlight clear stagger 0.1
```

+++

```anim
arr: highlight number stagger 0.4
```

---

## A group, in listed order

```anim
a: rect "a" at 3,4
b: circle "b" at 6,4
c: rect "c" at 9,4
g: group [c, a, b]
```

+++

```anim
g: fill pink stagger 0.3
```

+++

```anim
g: delete pop stagger 0.2
```

</animation>

<animation grid="8x8" autoplay>

```anim
c1: column 6 at 2,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15
c2: column 6 at 3,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 1
c3: column 6 at 4,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 2
c4: column 6 at 5,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 3
c5: column 6 at 6,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 4
c6: column 6 at 7,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 5
auto
```

+++

```anim
c1: fill red    stagger 0.15
c2: fill orange stagger 0.15 delay 1
c3: fill yellow stagger 0.15 delay 2
c4: fill green  stagger 0.15 delay 3
c5: fill cyan   stagger 0.15 delay 4
c6: fill purple stagger 0.15 delay 5
auto
```

+++

```anim
c1: fill green  stagger-reverse 0.15
c2: fill cyan   stagger-reverse 0.15 delay 1
c3: fill purple stagger-reverse 0.15 delay 2
c4: fill red    stagger-reverse 0.15 delay 3
c5: fill orange stagger-reverse 0.15 delay 4
c6: fill yellow stagger-reverse 0.15 delay 5
auto
```

+++

```anim
c1: delete stagger 0.15
c2: delete stagger 0.15 delay 1
c3: delete stagger 0.15 delay 2
c4: delete stagger 0.15 delay 3
c5: delete stagger 0.15 delay 4
c6: delete stagger 0.15 delay 5
auto
```

</animation>

## Feature: ease

<animation grid="12x6">

```anim
defaults radius 0.3 fill blue
e1: circle at 3,1
e2: circle at 3,2
e3: circle at 3,3
e4: circle at 3,4
e5: circle at 3,5
defaults clear
t1: text "in-out" at 1.5,1 font 0.6
t2: text "linear" at 1.5,2 font 0.6
t3: text "in" at 1.5,3 font 0.6
t4: text "out" at 1.5,4 font 0.6
t5: text "spring" at 1.5,5 font 0.6
```

---

```anim
e1: move 11,1 speed slow
e2: move 11,2 speed slow ease linear
e3: move 11,3 speed slow ease in
e4: move 11,4 speed slow ease out
e5: move 11,5 speed slow ease spring
```

---

## spring on pop, and on the camera

```anim
b: rect "spring" at 7,3 size 2x1 fill pink pop ease spring
camera at b zoom 1.5 ease spring
```

+++

```anim
camera reset ease out
```

</animation>

## Feature: Entrance and exit effects

<animation grid="12x4">

## Entrances

+++

```anim
no: rect "none" at 2,2
fd: rect "fade" at 5,2 fade delay 1
pp: rect "pop" at 8,2 pop delay 2
sl: circle "slide" at 11,2 slide delay 3
dr: arrow from 1,3.5 to 11,3.5 draw delay 4
```

---

## Exits

```anim
no: delete
fd: delete fade delay 1
pp: delete pop delay 2
sl: delete slide delay 3
dr: delete draw delay 4
```

</animation>

## Feature: typed

<animation grid="12x3">

```anim
prompt: text "$" at 2,1 mono colour yellow
```

+++

```anim
t1: text "ls -la" at 3,1 align left mono typed speed slow
```

+++

```anim
t2: text "Hello, world!" at 2,2 align left bold mono typed speed slow delay 2
```

---

## As an exit it un-types

```anim
t2: delete typed
```

</animation>

## Feature: defaults

<animation grid="12x4">

```anim
defaults fill blue size 2x1
a: rect "a" at 2,1.5
b: rect "b" at 5,1.5
defaults clear
c: rect "c" at 8,1.5
```

---

## defaults speed slow ease spring

```anim
defaults speed slow ease spring
a: move 2,3
b: move 5,3
c: move 8,3
```

---

## defaults flow-reverse, static

The top line flows right to left; the bottom one is still.

```anim
defaults clear
defaults dashed flow-reverse
l1: line from 1,0.5 to 11,0.5
defaults static
l2: line from 1,3.7 to 11,3.7
```

</animation>

## Feature: Camera

<animation grid="12x6">

```anim
a: rect "a" at 2,2 fill red
b: circle "b" at 10,5 fill blue
l: arrow from a to b
```

---

## at a zoom 3

```anim
camera at a zoom 3
```

---

## at 6,3.5 zoom 2

```anim
camera at 6,3.5 zoom 2 speed slow
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

<animation grid="12x6">

```anim
a: circle "a" at 2,2
b: circle "b" at 10,2
c: circle "c" at 10,5
d: circle "d" at 2,5
```

---

```anim
camera at a zoom 3
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
