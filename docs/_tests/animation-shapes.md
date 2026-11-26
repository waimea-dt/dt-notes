# Animation: Shapes and Lines

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: rect

<animation name="Rect" grid="12x4">

```anim
R1: rect "1x1" at 2,2
R2: rect "2x1" at 5,2 size 2x1
R3: rect "corner" at 8.5,2 size 2x1 corner 0.2
R4: rect "pill" at 11,2 size 1.6x0.8 corner 0.4
```

---

## width, height, size

```anim
R1: size 1.5
R2: width 3
R3: height 1.6
R4: corner 0
```

</animation>

## Feature: circle

Two sizes make an ellipse. Lines stop at its edge, turned or not.

<animation name="Circle" grid="14x4">

```anim
C1: circle "0.5" at 2,2
C2: circle "0.8" at 5,2 radius 0.8
C3: circle "size 1.2" at 8.5,2 size 1.2 font 0.7
E1: circle "ellipse" at 12,2 size 3x1.4 fill teal
Hub: rect "hub" at 12,4 size 1x0.6
L1: arrow from Hub to E1
L2: arrow from 9,4 to E1
```

---

## radius, size, width, height

```anim
C1: radius 0.8
C3: size +0.4
C2: width 2.4
E1: angle 30 height 2 highlight outline
```

</animation>

## Feature: diamond

Lines stop at its slanted edges.

<animation name="Diamond" grid="12x5">

```anim
D: diamond "x > 3?" at 4,3 size 3x1.6 fill amber
Yes: rect "yes" at 9,1.5 size 2x0.8 corner 0.2
No: rect "no" at 9,4.5 size 2x0.8 corner 0.2
Ly: arrow from D to Yes
Ln: arrow from D to No
Top: arrow from 4,0.5 to D
C: curve from 1,1 to D.left via 2,3 end arrow
```

---

## Resized and turned

```anim
D: width 2.4 angle 20
```

</animation>

## Feature: polygon

Points in `[ ]`, from where it's placed (in cells). Lines stop at its edges.

<animation name="Polygon" grid="14x6">

```anim
Tri: polygon [0,-1 0,-1 1,1 -1,1] at 3,3 "tri" fill amber
Hx: polygon [1,0 0.5,0.87 -0.5,0.87 -1,0 -0.5,-0.87 0.5,-0.87] at 7,3 "hex" fill teal
Trap: polygon [0,0 3,0 2.5,1 0.5,1] at 10,2 "trap" corner 0.15
Mark: circle at 10,2 size 0.2 fill red front
Arr: polygon [0,0 1,0 0.75,0.25 1.25,0.75 0.75,1.25 0.25,0.75 0,1] at 8,5 fill pink
L1: arrow from 1,5.5 to Tri
L2: arrow from Tri.right to Hx.left
L3: arrow from 13,5 to Trap
```

---

## Moved, turned, stretched, highlighted

`at` and `move` place its 0,0 (the red dot on trap).

```anim
Tri: move +0,-0.5 angle 30
Hx: size 3x1.5 highlight outline
Trap: move 9,4
Mark: move 9,4
```

+++

New points glide to their places.

```anim
Tri: [0,-1 1,0 0,1 -1,0] speed slow
Arr: [0,-0.5 0.5,-0.25 0.75,0.25 0.25,0.5 -0.25,0.5 -0.75,0.25 -0.5,-0.25] fill blue
Hx: highlight clear
Trap: highlight inside corner 0
```

</animation>

## Feature: text

`anchor` says which edge of its cell a text is placed by, as for any shape. The dotted box is column 6: `left` puts the text's left edge on the cell's left edge, `right` its right edge on the cell's right edge, and the default its middle on the cell's middle.

<animation name="Text" grid="11x5">

```anim
Cell: rect at 6,3 size 1x3 dotted stroke muted fill none back
T1: text "centre" at 6,2
T2: text "anchor left" at 6,3 anchor left
T3: text "anchor right" at 6,4 anchor right
```

---

## Its edge holds as it changes

Longer, then shorter: text anchored left grows and shrinks to the right, anchored right to the left, centred both ways.

```anim
T1: "centred, and longer" ink amber
T2: "left, and longer"
T3: "right, and longer"
```

+++

```anim
T1: "short"
T2: "left"
T3: "right"
```

---

## Beside a shape

Placed beside a shape, a text is placed by its box, as any shape is: centred under and over `B`, whatever its anchor.

```anim
T1: delete
Cell: delete
B: rect "b" at 6,3 size 4x0.8 dotted stroke muted fill none
T2: move B.bottom gap 0.25
T3: attach B.top gap 0.25
```

+++

Attached, `T3` goes with `B`; `T2` was only placed, so it stays.

```anim
B: move 6,2.4
```

+++

Placed, `T2` keeps its left edge as it grows. Attached, `T3` stays centred over `B`, as anything attached beside a shape does.

```anim
T2: "left, and longer"
T3: "right, and longer"
```

</animation>

## Feature: icon

<animation name="Icon" grid="12x3">

```anim
I1: icon(laptop) "laptop" at 2,1.5
I2: icon(server) "server" at 5,1.5 stroke blue
I3: icon(lock) at 8,1.5 size 1.5 stroke amber weight 1.5
```

---

```anim
I1: stroke green scale 1.3
```

</animation>

## Feature: image

An image fits inside its box (`size`, `width`, `height`), keeping its proportions. Its label goes below it, and a stroke shows the box.

<animation name="Image" grid="14x7">

```anim
Mac: image(../_assets/macs/macintosh.svg) "A Mac" at 3.5,2.5 size 2
Cat: image(../_assets/scratch/sprites/cat.svg) "cat" at 7.5,2.5 size 2
Rk: image(../_assets/scratch/sprites/rocket1.svg) at 11.5,2.5 size 2 stroke muted dashed
```

---

## Resized

It keeps its proportions in its new box.

```anim
Mac: width +1
Cat: size 1.2
Rk: width 1
```

---

## contain and cover

A 4:3 stage in a wide box: `contain` (the default) shows all of it, `cover` fills the box, cropped.

```anim
W1: image(../_assets/scratch/stages/sky.svg) "contain" at 4.5,5.5 size 5x1.2 stroke muted dashed
W2: image(../_assets/scratch/stages/sky.svg) "cover" at 10.5,5.5 size 5x1.2 cover stroke muted dashed
```

+++

```anim
W1: cover "cover"
W2: contain "contain"
```

</animation>

A backdrop: a 4:3 Scratch stage behind a 16x9 grid. `cover` fills the grid (cropped top and bottom), `back` puts it behind everything, and `crop` draws nothing outside the grid.

<animation name="Image Backdrop" grid="16x9" crop>

```anim
Bg: image(../_assets/scratch/stages/sky.svg) at 8.5,5 size 16x9 cover back
Cloud: image(../_assets/scratch/sprites/cloud.svg) at 8.5,3.5 size 3 front
Bird: image(../_assets/scratch/sprites/bird.svg) at 2.5,6 size 1.5
```

---

## In front of the backdrop, behind the cloud

```anim
Bird: move 14.5,4 via 8.5,2.5 speed slow
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
A: rect "a" at 3,2
B: circle "b" at 9.5,2
L: arrow from A to B "line"
```

---

## A new type

```anim
A: circle "a" at 3,2 fill amber
```

+++

```anim
B: diamond "b" at 9.5,2 size 2x1.4
```

+++

A line replaced by a curve.

```anim
L: curve from A to B bend 1 end arrow "line"
```

</animation>

## Feature: line and arrow

<animation name="Line & Arrow" grid="12x8">

```anim
A: circle "a" at 2,2
B: rect "b" at 10,2
L1: line from A to B "line"
L2: arrow from 2,4 to 10,4 "arrow"
L3: line from 2,5 via 6,5 via 6,6 to 10,6 draw
L4: line from 2,7 via 6,7 via 6,8 to 10,8 dotted "bend"
```

---

## l1: end arrow

Adds a head.

```anim
L1: end arrow
```

+++

An end on a shape follows it.

```anim
B: move 9,1
```

---

## l3: via 4,7 via 8,5

A line's via points are corners, and glide to their new places.

```anim
L3: via 4,7 via 8,5 speed slow
```

+++

```anim
L3: signal
```

---

## l5: arrow via corners

Ends on shapes meet the edge towards the nearest corner.

```anim
L5: arrow from A to B via 2,0.5 via 11,0.5 via 11,2 draw
```

+++

```anim
B: move 9,3
```

---

## corner 0.5

Rounds the corners, as on a rect. A tight corner gets as much as fits.

```anim
L4: corner 0.5 end arrow flow
L5: corner 0.5 speed slow
```

</animation>

## Feature: curve

<animation name="Curve" grid="12x6">

```anim
A: circle "a" at 2,3
B: circle "b" at 10,3
C1: curve from A to B via 6,1
C2: curve from A to B via 4,5 via 8,4 dashed stroke teal end arrow
C3: curve from B to B angle right end arrow "A"
C4: curve from B to B angle down size 1.5 end arrow "B"
```

---

## c1: via 6,2

The bend blends to the new point.

```anim
C1: via 6,2 speed slow
```

+++

The ends follow their shapes.

```anim
B: move 9,3
```

+++

```anim
B: move 9,4
```

</animation>

## Feature: loop

<animation name="Loop" grid="12x6">

```anim
S1: circle "S1" at 3,3
S2: circle "S2" at 9,3
T1: curve from S1 to S1 end arrow "0"
T2: curve from S1 to S1 angle left end arrow "1"
T3: curve from S2 to S2 angle 45 size 1.2x0.6 end arrow "0"
T4: curve from S1 to S2 bend 0.6 end arrow "1"
T5: curve from S2 to S1 bend 0.6 end arrow "0"
```

---

## Loops follow their shape

```anim
S1: move 4,4
S2: move 8,2
```

+++

They turn and grow.

```anim
T1: angle down size 1.2 speed slow
T3: angle right speed slow size 1.5
```

+++

```anim
T2: signal
```

---

## t4: bend 1.5

A bend bows to the left of the way the curve goes (negative: right), and blends. A signed change is relative: t5 goes from 0.6 to -1.5.

```anim
T4: bend 1.8 speed slow
T5: bend -1.5 speed slow
```

</animation>

## Feature: Line ends

What's on each end of a line, `start` and `end`: `none`, `arrow`, `dot`, `crow` or `bar`.

<animation name="Line Ends" grid="14x7">

```anim
Cu: rect "Customer" at 3,1.5 size 3x1
Or: rect "Order" at 12,1.5 size 3x1
R1: line from Cu to Or start bar end crow "places"
M1: line from 2,3.5 to 6,3.5 start arrow end arrow "arrow"
M2: line from 9,3.5 to 13,3.5 start dot end dot "dot"
M3: line from 2,5 to 6,5 start crow end crow "crow"
M4: line from 9,5 to 13,5 start bar end bar "bar"
C1: curve from 3,6.5 to 12,6.5 bend 0.6 start arrow end arrow
```

---

## none

One end, then the other.

```anim
M1: start none
M2: end none
```

+++

```anim
M1: end none
M2: start none
```

---

## Changing a mark crossfades

```anim
M1: start arrow end dot
M3: end arrow
M4: start crow
R1: end arrow
```

+++

Ends on shapes follow them, marks and all.

```anim
Cu: move 3,2.5 speed slow
C1: dashed flow
```

---

## Drawn in and erased

The end's mark rides on the tip.

```anim
M1: delete draw
C1: delete draw
```

+++

```anim
M1: line from 2,3.5 to 6,3.5 start dot end arrow draw speed slow
```

</animation>

## Feature: show

How much of a line shows, from its start, as if drawn that far: its end's mark rides on the tip.

<animation name="Show" grid="12x6">

```anim
A: circle "a" at 2,2
B: rect "b" at 10,2
L1: arrow from A to B show 0.5 "half"
L2: line from 2,4 via 6,4 via 6,5 to 10,5 show 0 start dot end arrow
C: curve from 2,5.5 to 10,5.5 bend -0.6 show 0.25 dashed flow
```

---

## Growing and shrinking

```anim
L1: show 1 speed slow
L2: show 0.6 speed slow ease linear
C: show +0.5
```

+++

```anim
L2: show 1
B: move 9,1
L1: show 0.2
```

</animation>
