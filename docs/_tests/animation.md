# Animation

Step-by-step animated explanations from `<animation>` blocks. Full syntax: `docs/_plugins/visualisation/ANIMATION.md`.

Click an animation to give it focus, then use ← / → to step and `F` for full screen.

## Bubble Sort

<animation grid="12x5">

# Bubble Sort: One Pass

We start with an unsorted array.

```scene
defaults: fill none fast
a0: rect "5" at 5 3
a1: rect "3" at 6 3
a2: rect "8" at 7 3
a3: rect "1" at 8 3
i: text "i" below a0
```

---

## Compare the first pair

Is `5` bigger than `3`?

```scene
a0: fill amber
a1: fill green
```

---

## Swap

Yes, so they swap places...

```scene
a0: move 6 3 via +0.5 -0.5
a1: move 5 3 via -0.5 +0.5
```

+++

...and `i` moves on.

```scene
a0: fill none
a1: fill none
i: move below a0
```

Note:
Ask the class to predict the next comparison before advancing.

</animation>

## Travelling Salesperson

<animation>

# Travelling Salesperson

Five cities, with a road between every pair. The salesperson starts at **A**.

```scene
defaults: fill bg stroke fg
a: circle "A" at 3 6
b: circle "B" at 6 2
c: circle "C" at 11 3
d: circle "D" at 13 7
e: circle "E" at 7 8

defaults: stroke muted back
ab: line from a to b
ac: line from a to c
ad: line from a to d
ae: line from a to e
bc: line from b to c
bd: line from b to d
be: line from b to e
cd: line from c to d
ce: line from c to e
de: line from d to e

defaults: reset
s: icon(user) above a gap 0.1 pop front
a: fill blue
```

---

## A to B

The first leg of the route.

```scene
defaults: stroke blue width 2 slow
r1: arrow from a to b draw
s: move above b gap 0.1
b: fill blue delay 0.25
```

---

## B to C

```scene
r2: arrow from b to c draw
s: move above c gap 0.1
c: fill blue delay 0.25
```

---

## C to D

```scene
r3: arrow from c to d draw
s: move above d gap 0.1
d: fill blue delay 0.25
```

---

## D to E

Every city has now been visited.

```scene
r4: arrow from d to e draw
s: move above e gap 0.1
e: fill blue delay 0.25
```

---

## E back to A

The salesperson returns home to finish the tour.

```scene
r5: arrow from e to a draw
s: move above a gap 0.1
a: fill green delay 0.25
```

+++

The route is **A → B → C → D → E → A**. Is it the shortest one?

```scene
ac: remove
ad: remove
bd: remove
be: remove
ce: remove
```

Note:
Ask: how many different routes are there from A? (4 × 3 × 2 × 1 = 24.)

</animation>

## Feature Tests

### Shapes, labels and colours

<animation grid="12x4">

```scene
r: rect "rect" at 2 2 size 2 1
c: circle "circle" at 5 2 radius 0.8 fill blue
t: text "text, left" at 8 1 align left stroke theme
b: text "bold, 1.5x" at 8 3 font 1.5 bold
i: icon(laptop) "icon" at 11 2
```

---

## Colour and label changes

Fills tween; labels cross-fade.

```scene
r: fill green "done"
c: fill pink stroke red width 2
t: stroke amber "changed"
i: stroke blue
```

---

## Dashed and thick

```scene
r: dashed width 3
c: size 1
```

</animation>

### Angle and scale

<animation grid="12x5">

## Rotated and scaled

Images, shapes, text and icons can be turned (degrees clockwise, 0 = upright) and scaled.

```scene
mac: image(../_assets/macs/macintosh.svg) at 2 3 size 2 angle -15
r: rect "45°" at 5 2 angle 45
c: rect "wide" at 5 4 size 2 1 angle 90 scale 0.8
t: text "Tilted text" at 8 1 angle 20 font 1.2
cog: icon(cog) at 8 4 scale 1.5
box: rect "B" at 11 3
l: arrow from r to box "edge"
```

---

## Animated

The cog spins, the Mac turns upright and grows, and the arrow stays on the rotating rect's edge.

```scene
cog: angle +360 slow
mac: angle 0 scale 1.3 slow
r: angle +90 slow
t: angle 0 scale 1.3
```

---

## Back the other way

`angle -90` (relative) turns a quarter anticlockwise; `scale 0.5` halves.

```scene
r: angle -90
c: scale 0.5
cog: angle -360 slow
```

</animation>

### Curved moves

<animation grid="12x5" debug>

## Start

```scene
a: circle "a" at 2 4 radius 0.4 fill blue
b: rect "b" at 6 3
c: circle "c" at 2 2 radius 0.4 fill pink
l: line from a to c dashed
```

---

## One via point

`a: move 10 4 via 6 1` curves over the top of `b`.

```scene
a: move 10 4 via 6 1 slow
```

---

## Several via points

`c: move 10 2 via 4 5 via 8 0.5` — an S-bend, at an even speed. The dashed line follows both ends.

```scene
c: move 10 2 via 4 5 via 8 0.5 slow
```

---

## Via a shape, and relative

`a` loops through the spot below `b`; `c` goes `via -2 +2` (relative to where it starts).

```scene
a: move 2 4 via below b slow
c: move 2 2 via -2 +2 slow
```

</animation>

### Curved-move errors

<animation grid="8x2" debug>

```scene
a: rect at 2 1
b: rect at 4 1 via 5 2
a: fill blue via 3 2
l: line from a to 6 1 via 3 2
defaults: via 2 2
a: move 6 1 via zz
```

</animation>

### Images, relative moves and line ends

<animation grid="12x5" debug>

## Starting positions

The debug grid shows rows, columns and ids.

```scene
mac: image(../_assets/macs/macintosh.svg) "A Mac" at 3 2 size 2
box: rect "box" at 9 2
l: line from 2 5 to 6 5 "line"
p: arrow from mac to box
```

---

## Relative moves

`box: move +1 +2`, `mac: x +3`.

```scene
box: move +1 +2
mac: x +3
```

---

## One end of a line

`l: to +4 -1` moves only the end; the arrow follows `box`.

```scene
l: to +4 -1
box: y -1
```

---

## Shift a whole line

```scene
l: move +0 -1
p: to 11 1
```

</animation>

### Effects and speeds

<animation grid="12x3">

## Effects

Each shape enters with a different effect.

```scene
f: rect "fade" at 2 2
```

---

```scene
p: rect "pop" at 5 2 pop
d: arrow from 1 3 to 11 3 draw slow
s: circle "slide" at 9 2 slide
```

+++

Second beat: removal effects.

```scene
f: remove pop
p: remove fast
s: remove slide
```

---

## Instant and slow

```scene
d: remove instant
sl: rect "slow" at 2 2
```

+++

```scene
sl: move 11 2 slow
```

</animation>

### Layering

<animation grid="10x3">

## Back, normal and front

```scene
a: rect "normal" at 4 2 size 3 1 fill blue
b: circle at 3 2 radius 1 fill amber back
c: circle at 6 2 radius 1 fill pink front
```

---

## Change layer

`b: front` and `c: back`.

```scene
b: front
c: back
```

</animation>

### Fit grid and a caption-only step

<animation grid="fit">

```scene
a: rect "A" at 3 3
b: rect "B" at 6 3
l: arrow from a to b "fit"
```

---

## Same heading

This step has no scene.

---

## Same heading

The heading stays put; only this text changes.

</animation>

### Errors

Bad lines are listed under the animation and skipped; the rest still draws.

<animation grid="8x3" debug>

```scene
a: rect "A" at 2 2
b: rect at 9 9
c: blob at 3 3
a: wibble 3
d: line from a to zz
e: rect "x" "y" at 4 2
f: circle at 5 2 size 1 2
g: rect at 6 2 x 3
defaults: fill none
defaults: fill none
remove: rect at 1 1
```

</animation>

### Source in a code fence

This block must stay as code:

````markdown
<animation>
```scene
a: rect at 2 3
```
</animation>
````
