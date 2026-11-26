# Animation: Shapes and Lines

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: rect

<animation name="Rect" grid="12x4">

```anim
r1: rect "1x1" at 2,2
r2: rect "2x1" at 5,2 size 2x1
r3: rect "corner" at 8.5,2 size 2x1 corner 0.2
r4: rect "pill" at 11,2 size 1.6x0.8 corner 0.4
```

---

## width, height, size

```anim
r1: size 1.5
r2: width 3
r3: height 1.6
r4: corner 0
```

</animation>

## Feature: circle

Two sizes make an ellipse. Lines stop at its edge, turned or not.

<animation name="Circle" grid="14x4">

```anim
c1: circle "0.5" at 2,2
c2: circle "0.8" at 5,2 radius 0.8
c3: circle "size 1.2" at 8.5,2 size 1.2 font 0.7
e1: circle "ellipse" at 12,2 size 3x1.4 fill teal
hub: rect "hub" at 12,4 size 1x0.6
l1: arrow from hub to e1
l2: arrow from 9,4 to e1
```

---

## radius, size, width, height

```anim
c1: radius 0.8
c3: size +0.4
c2: width 2.4
e1: angle 30 height 2 highlight outline
```

</animation>

## Feature: diamond

Lines stop at its slanted edges.

<animation name="Diamond" grid="12x5">

```anim
d: diamond "x > 3?" at 4,3 size 3x1.6 fill amber
yes: rect "yes" at 9,1.5 size 2x0.8 corner 0.2
no: rect "no" at 9,4.5 size 2x0.8 corner 0.2
ly: arrow from d to yes
ln: arrow from d to no
top: arrow from 4,0.5 to d
c: curve from 1,1 to d.left via 2,3 end arrow
```

---

## Resized and turned

```anim
d: width 2.4 angle 20
```

</animation>

## Feature: polygon

Points in `[ ]`, from where it's placed (in cells). Lines stop at its edges.

<animation name="Polygon" grid="14x6">

```anim
tri: polygon [0,-1 0,-1 1,1 -1,1] at 3,3 "tri" fill amber
hx: polygon [1,0 0.5,0.87 -0.5,0.87 -1,0 -0.5,-0.87 0.5,-0.87] at 7,3 "hex" fill teal
trap: polygon [0,0 3,0 2.5,1 0.5,1] at 10,2 "trap" corner 0.15
mark: circle at 10,2 size 0.2 fill red front
arr: polygon [0,0 1,0 0.75,0.25 1.25,0.75 0.75,1.25 0.25,0.75 0,1] at 8,5 fill pink
l1: arrow from 1,5.5 to tri
l2: arrow from tri.right to hx.left
l3: arrow from 13,5 to trap
```

---

## Moved, turned, stretched, highlighted

`at` and `move` place its 0,0 (the red dot on trap).

```anim
tri: move +0,-0.5 angle 30
hx: size 3x1.5 highlight outline
trap: move 9,4
mark: move 9,4
```

+++

New points glide to their places.

```anim
tri: [0,-1 1,0 0,1 -1,0] speed slow
arr: [0,-0.5 0.5,-0.25 0.75,0.25 0.25,0.5 -0.25,0.5 -0.75,0.25 -0.5,-0.25] fill blue
hx: highlight clear
trap: highlight inside corner 0
```

</animation>

## Feature: text

`align` says which edge of its cell a text is placed by. The dotted box is column 6: `left` puts the text's left edge on the cell's left edge, `right` its right edge on the cell's right edge, and `centre` (the default) its middle on the cell's middle.

<animation name="Text" grid="11x5">

```anim
cell: rect at 6,3 size 1x3 dotted stroke muted fill none back
t1: text "centre" at 6,2
t2: text "align left" at 6,3 align left
t3: text "align right" at 6,4 align right
```

---

## Its edge holds as it changes

Longer, then shorter: left-aligned text grows and shrinks to the right, right-aligned to the left, centred both ways.

```anim
t1: "centred, and longer" ink amber
t2: "left, and longer"
t3: "right, and longer"
```

+++

```anim
t1: "short"
t2: "left"
t3: "right"
```

---

## Beside a shape

Placed beside a shape, a text is placed by its box, as any shape is: centred under and over `b`, whatever its align.

```anim
t1: delete
cell: delete
b: rect "b" at 6,3 size 4x0.8 dotted stroke muted fill none
t2: below b
t3: attach above b
```

+++

Attached, `t3` goes with `b`; `t2` was only placed, so it stays.

```anim
b: move 6,2.4
```

+++

Placed, `t2` keeps its left edge as it grows. Attached, `t3` stays centred over `b`, as anything attached beside a shape does.

```anim
t2: "left, and longer"
t3: "right, and longer"
```

</animation>

## Feature: icon

<animation name="Icon" grid="12x3">

```anim
i1: icon(laptop) "laptop" at 2,1.5
i2: icon(server) "server" at 5,1.5 stroke blue
i3: icon(lock) at 8,1.5 size 1.5 stroke amber weight 1.5
```

---

```anim
i1: stroke green scale 1.3
```

</animation>

## Feature: image

An image fits inside its box (`size`, `width`, `height`), keeping its proportions. Its label goes below it, and a stroke shows the box.

<animation name="Image" grid="14x7">

```anim
mac: image(../_assets/macs/macintosh.svg) "A Mac" at 3.5,2.5 size 2
cat: image(../_assets/scratch/sprites/cat.svg) "cat" at 7.5,2.5 size 2
rk: image(../_assets/scratch/sprites/rocket1.svg) at 11.5,2.5 size 2 stroke muted dashed
```

---

## Resized

It keeps its proportions in its new box.

```anim
mac: width +1
cat: size 1.2
rk: width 1
```

---

## contain and cover

A 4:3 stage in a wide box: `contain` (the default) shows all of it, `cover` fills the box, cropped.

```anim
w1: image(../_assets/scratch/stages/sky.svg) "contain" at 4.5,5.5 size 5x1.2 stroke muted dashed
w2: image(../_assets/scratch/stages/sky.svg) "cover" at 10.5,5.5 size 5x1.2 cover stroke muted dashed
```

+++

```anim
w1: cover "cover"
w2: contain "contain"
```

</animation>

A backdrop: a 4:3 Scratch stage behind a 16x9 grid. `cover` fills the grid (cropped top and bottom), `back` puts it behind everything, and `crop` draws nothing outside the grid.

<animation name="Image Backdrop" grid="16x9" crop>

```anim
bg: image(../_assets/scratch/stages/sky.svg) at 8.5,5 size 16x9 cover back
cloud: image(../_assets/scratch/sprites/cloud.svg) at 8.5,3.5 size 3 front
bird: image(../_assets/scratch/sprites/bird.svg) at 2.5,6 size 1.5
```

---

## In front of the backdrop, behind the cloud

```anim
bird: move 14.5,4 via 8.5,2.5 speed slow
```

+++

Zoomed out, nothing shows past the grid's edge.

```anim
camera zoom 0.7 speed slow
```

+++

```anim
camera reset
```

</animation>

## Feature: Replacing a shape

A type on an existing id replaces the shape (with a warning): the new one fades in as the old fades out, and lines on it stay on it.

<animation name="Replacing a Shape" grid="12x4">

```anim
a: rect "a" at 3,2
b: circle "b" at 9.5,2
l: arrow from a to b "line"
```

---

## A new type

```anim
a: circle "a" at 3,2 fill amber
```

+++

```anim
b: diamond "b" at 9.5,2 size 2x1.4
```

+++

A line replaced by a curve.

```anim
l: curve from a to b bend 1 end arrow "line"
```

</animation>

## Feature: line and arrow

<animation name="Line & Arrow" grid="12x8">

```anim
a: circle "a" at 2,2
b: rect "b" at 10,2
l1: line from a to b "line"
l2: arrow from 2,4 to 10,4 "arrow"
l3: line from 2,5 via 6,5 via 6,6 to 10,6 draw
l4: line from 2,7 via 6,7 via 6,8 to 10,8 dotted "bend"
```

---

## l1: end arrow

Adds a head.

```anim
l1: end arrow
```

+++

An end on a shape follows it.

```anim
b: move 9,1
```

---

## l3: via 4,7 via 8,5

A line's via points are corners, and glide to their new places.

```anim
l3: via 4,7 via 8,5 speed slow
```

+++

```anim
l3: signal
```

---

## l5: arrow via corners

Ends on shapes meet the edge towards the nearest corner.

```anim
l5: arrow from a to b via 2,0.5 via 11,0.5 via 11,2 draw
```

+++

```anim
b: move 9,3
```

---

## corner 0.5

Rounds the corners, as on a rect. A tight corner gets as much as fits.

```anim
l4: corner 0.5 end arrow flow
l5: corner 0.5 speed slow
```

</animation>

## Feature: curve

<animation name="Curve" grid="12x6">

```anim
a: circle "a" at 2,3
b: circle "b" at 10,3
c1: curve from a to b via 6,1
c2: curve from a to b via 4,5 via 8,4 dashed stroke teal end arrow
c3: curve from b to b angle right end arrow "A"
c4: curve from b to b angle down size 1.5 end arrow "B"
```

---

## c1: via 6,2

The bend blends to the new point.

```anim
c1: via 6,2 speed slow
```

+++

The ends follow their shapes.

```anim
b: move 9,3
```

+++

```anim
b: move 9,4
```

</animation>

## Feature: loop

<animation name="Loop" grid="12x6">

```anim
s1: circle "S1" at 3,3
s2: circle "S2" at 9,3
t1: curve from s1 to s1 end arrow "0"
t2: curve from s1 to s1 angle left end arrow "1"
t3: curve from s2 to s2 angle 45 size 1.2x0.6 end arrow "0"
t4: curve from s1 to s2 bend 0.6 end arrow "1"
t5: curve from s2 to s1 bend 0.6 end arrow "0"
```

---

## Loops follow their shape

```anim
s1: move 4,4
s2: move 8,2
```

+++

They turn and grow.

```anim
t1: angle down size 1.2 speed slow
t3: angle right speed slow size 1.5
```

+++

```anim
t2: signal
```

---

## t4: bend 1.5

A bend bows to the left of the way the curve goes (negative: right), and blends. A signed change is relative: t5 goes from 0.6 to -1.5.

```anim
t4: bend 1.8 speed slow
t5: bend -1.5 speed slow
```

</animation>

## Feature: Line ends

What's on each end of a line, `start` and `end`: `none`, `arrow`, `dot`, `crow` or `bar`.

<animation name="Line Ends" grid="14x7">

```anim
cu: rect "Customer" at 3,1.5 size 3x1
or: rect "Order" at 12,1.5 size 3x1
r1: line from cu to or start bar end crow "places"
m1: line from 2,3.5 to 6,3.5 start arrow end arrow "arrow"
m2: line from 9,3.5 to 13,3.5 start dot end dot "dot"
m3: line from 2,5 to 6,5 start crow end crow "crow"
m4: line from 9,5 to 13,5 start bar end bar "bar"
c1: curve from 3,6.5 to 12,6.5 bend 0.6 start arrow end arrow
```

---

## none

One end, then the other.

```anim
m1: start none
m2: end none
```

+++

```anim
m1: end none
m2: start none
```

---

## Changing a mark crossfades

```anim
m1: start arrow end dot
m3: end arrow
m4: start crow
r1: end arrow
```

+++

Ends on shapes follow them, marks and all.

```anim
cu: move 3,2.5 speed slow
c1: dashed flow
```

---

## Drawn in and erased

The end's mark rides on the tip.

```anim
m1: delete draw
c1: delete draw
```

+++

```anim
m1: line from 2,3.5 to 6,3.5 start dot end arrow draw speed slow
```

</animation>

## Feature: show

How much of a line shows, from its start, as if drawn that far: its end's mark rides on the tip.

<animation name="Show" grid="12x6">

```anim
a: circle "a" at 2,2
b: rect "b" at 10,2
l1: arrow from a to b show 0.5 "half"
l2: line from 2,4 via 6,4 via 6,5 to 10,5 show 0 start dot end arrow
c: curve from 2,5.5 to 10,5.5 bend -0.6 show 0.25 dashed flow
```

---

## Growing and shrinking

```anim
l1: show 1 speed slow
l2: show 0.6 speed slow ease linear
c: show +0.5
```

+++

```anim
l2: show 1
b: move 9,1
l1: show 0.2
```

</animation>
