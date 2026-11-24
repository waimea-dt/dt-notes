# Animation: Values

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: var

<animation grid="12x4">

A box that holds a value: a number, "text" or null (muted).

```anim
defaults corner 0.2
v1: var 67 at 3,2
v2: var "Dog" at 6,2 size 1.6x1
v3: var null at 9,2
```

---

## A new value

```anim
v1: 123
v2: "Cat"
v3: 4
```

+++

```anim
v1: +7                            # signed: relative, = 130
v3: -0.5                          # = 3.5
```

+++

```anim
v1: null
v2: null fill red
```

+++

A cell holds values too.

```anim
r: row [1 2 3] at 4,3.5 size 0.8
r.1: null
```

</animation>

## Feature: Moving values

<animation grid="14x7">

```anim
v1: var 7 at 2,6 name "v1" fill teal
v2: var "Dog" at 10,6 size 1.6x1 name "v2"
a: row [1 2 3] at 4,2.5 name "a" indices fill blue
```

---

## Copy into a var or a cell

A copy of `a.0` glides onto `v1`, which takes its value as it lands.

```anim
v1: a.0
```

+++

And back: `a.2` takes v2's value. The copy turns from v2's look into the row's.

```anim
a.2: v2 speed slow
```

---

## insert a var

The space opens while a copy of `v1` glides to just below it, then slides up into it.

```anim
v1: 9
```

+++

```anim
a: insert v1 at 1
```

+++

```anim
a: insert v2 at end speed slow
```

---

## remove into a var

The last cell itself drops out and glides onto `v1`, while the space closes behind it.

```anim
a: remove end into v1
```

+++

```anim
a: remove end into v2 speed slow
```

+++

From the middle: the cells after it close up.

```anim
a: remove 1 into v1
```

---

## exchange vars

New value for v1

```anim
v1: "Egg"
```

+++

Copy to v2

```anim
v2: v1
```

---

## keep-style

A red value keeps its look as it goes in, so it can be followed.

```anim
v1: 5 fill red colour white
```

+++

```anim
a: insert v1 at 0 keep-style
```

+++

```anim
v2: a.0 keep-style
```

+++

Without it, the box keeps its own look.

```anim
a.1: v2
```

</animation>

## Feature: Sums

`+ - * / mod`, with spaces round each: worked out once, when the line runs (as in code).

<animation grid="12x5">

```anim
a: var 7 name "a" at 2,2
b: var 3 name "b" at 5,2
c: var 0 name "c" at 8,2
arr: row [1 2 3 4] at 2,4 name "arr"
```

---

## c: a + b * 2

```anim
c: a + b * 2
```

+++

```anim
c: a mod b
arr.3: arr.0 + arr.1 * 10
```

+++

Changing `a` leaves `c` as it is.

```anim
a: 100
c: c / 4
```

+++

```anim
b: a - b
```

</animation>

## Feature: Values in labels

`{ }` in a label shows a sum's value, kept up to date. Anything else in `{ }` shows as written.

<animation grid="12x5">

```anim
n: var 3 name "n" at 2,2
s: var 4 name "s" at 4,2
t: text "{n} × {s} = {n * s}" at 8,2
box: rect "sides: {s}" at 8,4 size 3x1
set: text "{1, 2, 3}" at 3,4
```

---

## New values

The labels change with their values.

```anim
n: 5 speed slow
s: 6
```

</animation>

## Feature: Following values

A number given a var or cell (or `{ }`) follows it as it changes.

<animation grid="12x6">

```anim
px: var 2 name "px" at 2,1
turn: var 0 name "turn" at 5,1
w: var 1 name "w" at 8,1
dot: circle y 4 x px size 0.6 fill amber
hand: rect at 9,4 height 0.2 angle {turn * 3} width w fill teal
arr: arrow from 2,5.5 to 11,5.5 show {w / 4}
```

---

## Changing the values

```anim
px: 10 speed slow
turn: 60 speed slow
w: 3 speed slow
```

+++

A number given again stops following.

```anim
dot: x 2
px: 4
```

</animation>

## Feature: counter

A new value counts its way there.

<animation grid="12x5">

```anim
score: var 0 name "score" at 3,2 size 2x1
hp: var 100 at 7,2 size 4x0.6 bar fill green track muted
b: binary 0 at 3,4 digits 4 decimal
i1: icon(laptop) "laptop {score}" at 10,4
```

---

## Counting

```anim
score: 25 counter speed slow
hp: 37 counter speed slow
b: 11 counter speed slow
```

+++

```anim
defaults counter
score: score * 4
b: 3
```

</animation>

## Feature: Colours from values

`rgb(r g b)` works a colour out from three values from 0 to 255: numbers, or vars, cells and numbers that it follows as they change. It goes wherever a colour does: `fill`, `stroke`, `colour` and `track`.

<animation grid="16x7">

```anim
defaults max 255 size 4x0.8 track black stroke muted colour contrast
r: var 255 name "r" bar at 3,1.5 fill #f00
g: var 128 name "g" bar at 3,2.5 fill #0f0
b: var 0 name "b" bar at 3,3.5 fill #00f
defaults clear
sw: rect "fill and stroke" at 11,2.5 size 4x2.4 fill rgb(r g b) stroke rgb(255, g, b) weight 4 colour contrast
arr: row [0 128 255] at 2,6 indices
hx: hex 255 at 7,6 name "hx"
cell: rect "cells" at 12,6 size 3x1 fill rgb(arr.2 hx arr.0) colour contrast
```

---

## New values

```anim
r: 0
g: 255
```

+++

```anim
b: 200 speed slow
```

---

## A value on the move: the colour changes as it lands

```anim
b: arr.0
r: hx
```

---

## A number's digits, and a cell

```anim
hx: 0
arr.2: 64
```

---

## Given a colour again, it stops following

```anim
sw: stroke fg
```

+++

The fill still follows; the stroke doesn't.

```anim
g: 0
b: 255
```

+++

```anim
sw: fill rgb(b 0 r)
```

</animation>

## Feature: Bars

<animation grid="13x6">

```anim
arr: row [5, 3, 8, 1, 9, 2] at 2,3 bar stroke none fill pink-bright size 0.6x3 gap 0.15 indices
hp: var 67 name "health" at 10,2 size 3x0.7 bar fill green-bright track red corner 0.25
```

---

## Swapping bars, a new value, hidden values

```anim
arr: swap 0 3
hp: 30
```

+++

```anim
arr.2: 4
hp: 100
```

+++

```anim
arr: colour none
hp: colour none
```

---

## A value on the move

```anim
t: var 0 at 10,4 size 3x0.5 bar max 9 fill blue name "avg"
```

+++

```anim
t: arr.3
```

---

## Some cells, a new max, and back to boxes

```anim
arr: range 0 2 fill amber
hp: max 200
```

+++

```anim
arr: bar clear
hp: track none
```

</animation>

## Feature: Horizontal bars

A column of wide bars is a bar chart: the bars grow from the left, with their values at the right.

<animation grid="10x6">

```anim
votes: column [12 7 15 4 9] at 4,2 bar stroke none fill teal size 4x0.7 gap 0.15 name "Votes" indices
```

---

## Changes

```anim
votes.3: 14
```

+++

```anim
votes: swap 2 3
```

+++

```anim
votes: range 0 1 fill amber
```

+++

```anim
votes: remove 4
```

</animation>

## Feature: Rings and pies

A ring or pie shows a var's or cell's value round a circle, clockwise from the top. It's always round: it takes one size, and a box that isn't square is made square as it's turned on.

<animation grid="14x7">

```anim
done: var 25 name "done" at 3,2 size 2 stroke none ring fill teal-bright track muted
left: var 60 at 7,2 size 2 stroke none pie fill purple-bright track muted
cpu: var 45 at 11,2 size 2 ring fill orange-bright
arr: row [3 8 5 9] at 2,5 size 1.2 gap 0.3 stroke none pie fill pink-bright track muted max 10
```

---

## New values

```anim
done: 75
left: 5
cpu: 100
arr.1: 2
```

+++

```anim
done: +25
left: 0
cpu: highlight outline
arr: swap 0 3
```

---

## A value on the move

```anim
cpu: highlight clear
done: arr.2
```

---

## Changing kind, and back to a box

```anim
done: pie
left: ring
cpu: bar
```

+++

```anim
done: bar
left: corner 0.2
```

+++

```anim
done: ring clear
left: pie clear
```

---

## A wide box turned into a ring is made square

```anim
wide: var 40 at 11,5 size 3x1 track muted
```

+++

```anim
wide: ring fill green-bright
arr: ring
```

</animation>
