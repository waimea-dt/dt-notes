# Animation: Shapes, Looks and Highlights

Click an animation to give it focus, then use ← / → to step and `F` for full screen.

**Animation tests:** [Blocks](animation.md) · [Examples](animation-examples.md) · **Shapes, Looks and Highlights** · [Movement, Timing and Camera](animation-motion.md) · [Images and Scenes](animation-images.md) · [Data Structures](animation-data.md) · [Code and Scratch](animation-code.md) · [Errors](animation-errors.md)

## Feature: rect

<animation grid="12x4">

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

<animation grid="14x4">

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

<animation grid="12x5">

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

<animation grid="14x6">

```anim
tri: polygon [0,-1 1,1 -1,1] at 3,3 "tri" fill amber
hx: polygon [1,0 0.5,0.87 -0.5,0.87 -1,0 -0.5,-0.87 0.5,-0.87] at 7,3 "hex" fill teal
trap: polygon [0,0 3,0 2.5,1 0.5,1] at 10,2 "trap" corner 0.15
mark: circle at 10,2 size 0.2 fill red front
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
hx: highlight clear
trap: highlight inside corner 0
```

</animation>

## Feature: text

The dotted box is column 6: `align` anchors to its edges.

<animation grid="12x4">

```anim
cell: rect at 6,2 size 1x3 dotted stroke muted fill none back
t1: text "centre" at 6,1
t2: text "align left" at 6,2 align left
t3: text "align right" at 6,3 align right
```

---

## Changed

```anim
t1: "new text" colour amber
```

---

## Placed beside a shape

Aligned text placed beside a shape, attached to it, or moved onto it, is placed by its box, as any shape is.

```anim
b: rect at 10,2 size 3x1 fill none stroke blue
t2: below b
t3: attach above b
```

+++

```anim
b: move 9,3
t2: travel 2,4 b
```

+++

A longer text keeps its aligned edge.

```anim
t2: "align left, longer"
t3: "align right, longer"
```

</animation>

## Feature: Fonts: font, bold, mono

<animation grid="12x4">

```anim
f1: text "font 1" at 3,1
f2: text "font 1.5" at 3,2.2 font 1.5
f3: text "bold" at 8,1 bold
f4: text "mono" at 8,2.2 mono
box: rect "a bold label" at 5.5,3.5 size 3x0.8 bold font 0.8
```

---

## font changes tween

```anim
f1: font 1.5
f2: font 1
```

</animation>

## Feature: sup and sub

<animation grid="12x5">

```anim
t1: text "x<sup>2</sup> + y<sup>2</sup>" at 3,1
t2: text "log<sub>2</sub> N" at 9,1
t3: text "g<sup>a</sup> mod p" at 3,2.5 font 1.5
v: var "2<sup>8</sup>" at 9,2.5 size 2x1
l: arrow from 2,4 to 10,4 "H<sub>2</sub>O"
```

---

## Changed and typed

```anim
t1: "O(N<sup>2</sup>)"
t2: delete typed
v: "1010<sub>2</sub>"
```

+++

```anim
t2: text "a<sub>i</sub> + a<sub>i+1</sub>" at 9,1 typed
t3: font 1 bold
```

---

## Unclosed tags show as written

```anim
t1: "x<sup>2"
```

</animation>

## Feature: b and i

<animation grid="12x5">

```anim
t1: text "x = <b>5</b> (<i>an int</i>)" at 4,1
t2: text "<b>Bold</b> beside x<sup>2</sup>" at 9,1
r: rect "<i>key</i> <b>A</b>" at 3,3 size 3x1
v: var "<b>Cat</b>" at 9,3 size 2x1
l: arrow from 2,4.5 to 10,4.5 "<i>sends</i>"
```

---

## Changed, typed and boxed

```anim
t1: "x = <b>6</b>"
t3: text "<b>typed</b> in <i>turn</i>" at 6,2 typed
r: highlight outline
v: "<i>Dog</i>"
```

</animation>

## Feature: line and arrow

<animation grid="12x8">

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

## Feature: start and end

What's on each end of a line: `none`, `arrow`, `dot`, `crow` or `bar`.

<animation grid="12x6">

```anim
a: circle "a" at 2,2
b: rect "b" at 10,2
l1: line from a to b start arrow end arrow "both"
l2: line from 2,4 to 10,4 start arrow end arrow draw
c1: curve from 2,5 to 10,5 bend 0.6 start arrow end arrow
```

---

## l1: start none end none

Takes the heads off.

```anim
l1: start none end none
```

+++

```anim
l1: end arrow
```

+++

```anim
l1: start arrow
```

---

## l2: start none, l1: end none

One head goes, the other stays.

```anim
l2: start none
l1: end none
```

+++

Both ends follow their shapes, heads and all.

```anim
b: move 9,1
c1: dashed flow
```

---

## Erased

```anim
l2: delete draw
c1: delete draw
```

</animation>

## Feature: dot, crow and bar

<animation grid="14x6">

```anim
cu: rect "Customer" at 3,2 size 3x1
or: rect "Order" at 11,2 size 3x1
it: rect "Item" at 11,5 size 3x1
r1: line from cu to or start bar end crow "places"
r2: line from or to it start bar end crow weight 2
d1: line from 2,4.5 to 7,4.5 start dot end dot "dots"
d2: arrow from 2,5.5 to 7,5.5 start dot
```

---

## Changing a mark crossfades

```anim
r1: end arrow
d1: start crow end bar
d2: end none
```

+++

```anim
r1: end crow
cu: move 3,4
```

</animation>

## Feature: show

How much of a line shows, from its start, as if drawn that far: its end's mark rides on the tip.

<animation grid="12x6">

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

## Feature: curve

<animation grid="12x6">

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

<animation grid="12x6">

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

## Feature: image

<animation grid="12x4">

```anim
mac: image(../_assets/macs/macintosh.svg) "A Mac" at 3,2 size 1.5x2
mac2: image(../_assets/macs/macintosh.svg) at 8,2 size 2 stroke blue dashed
```

---

## Resized

It keeps its proportions inside its box.

```anim
mac: width +1
mac2: size 1
```

</animation>

## Feature: Images

Scratch sprites: placing, sizing, turning, moving along paths, and the extras that work on any shape.

<animation grid="14x7">

## Placed and sized

A box from `size` (or `width` / `height`): the image fits inside it, keeping its proportions.

```anim
cat: image(../_assets/scratch/sprites/cat.svg) "cat" at 2,2 pop
dog: image(../_assets/scratch/sprites/dog.svg) "dog" right-of cat gap 1 size 1.5
fish: image(../_assets/scratch/sprites/fish.svg) at 2,5.5 size 2x1
rocket: image(../_assets/scratch/sprites/rocket1.svg) at 12.5,5 size 1x2 stroke muted dashed
earth: image(../_assets/scratch/sprites/earth.svg) at 10,2 size 1.5
```

---

## Resized

```anim
cat: size 2
dog: width +1
fish: height 2 delay 0.3
rocket: width 2
```

---

## Turned and scaled

```anim
rocket: angle 45
earth: angle +180 scale 1.4 speed slow
fish: angle -20
```

---

## Moving

```anim
cat: move 6,4 via 4,6.5 speed slow
dog: move 7,1.5 ease spring
```

+++

```anim
fish: travel 4,4 6,6 2,5.5
```

---

## Following a path

The bug ends on the earth's centre, then comes back.

```anim
path: curve from cat to earth via 9,6.5 dashed
bug: image(../_assets/scratch/sprites/bug1.svg) at cat size 0.8 front
```

+++

```anim
bug: follow path speed vslow
```

+++

```anim
bug: follow-reverse path speed slow
```

---

## Attached, copied and grouped

```anim
star: image(../_assets/scratch/sprites/star.svg) size 0.7 attach above earth
earth: move 10,4.2 speed slow
```

+++

```anim
bug2: copy bug move 2,2.5 via 4,1
pair: group [cat bug]
pair: move -2,+0
```

---

## Contain and cover

A 4:3 stage in a wide box: `contain` (the default) shows all of it, `cover` fills the box and crops it. Then they swap.

```anim
w1: image(../_assets/scratch/stages/sky.svg) "contain" at 4.5,6 size 4x1.2 stroke muted dashed front
w2: image(../_assets/scratch/stages/sky.svg) "cover" at 10.5,6 size 4x1.2 cover stroke muted dashed front
```

+++

```anim
w1: cover "cover"
w2: contain "contain"
```

+++

```anim
w1: delete
w2: delete
```

---

## Emphasis, highlights and callouts

```anim
cat: pulse
dog: wobble
earth: highlight outline
rocket: highlight inside
fish: callout "Blub!" below
```

---

## Gone

```anim
fish: delete slide
dog: delete pop
pair: delete fade stagger 0.2
```

</animation>

## Feature: icon

<animation grid="12x3">

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

## Feature: Colours

<animation grid="13x11">

```anim
pal: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2,1 font 0.4 size 0.7 gap 0.3 corner 0.5
pal.0: fill red
pal.1: fill orange
pal.2: fill amber
pal.3: fill yellow
pal.4: fill green
pal.5: fill teal
pal.6: fill cyan
pal.7: fill blue
pal.8: fill purple
pal.9: fill pink
pal.10: fill magenta
pal.11: fill theme
br: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2,2 font 0.4 size 0.7 gap 0.3 corner 0.5
br.0: fill red-bright
br.1: fill orange-bright
br.2: fill amber-bright
br.3: fill yellow-bright
br.4: fill green-bright
br.5: fill teal-bright
br.6: fill cyan-bright
br.7: fill blue-bright
br.8: fill purple-bright
br.9: fill pink-bright
br.10: fill magenta-bright
br.11: fill theme-bright
mt: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2,3 font 0.4 size 0.7 gap 0.3 corner 0.5
mt.0: fill red-muted
mt.1: fill orange-muted
mt.2: fill amber-muted
mt.3: fill yellow-muted
mt.4: fill green-muted
mt.5: fill teal-muted
mt.6: fill cyan-muted
mt.7: fill blue-muted
mt.8: fill purple-muted
mt.9: fill pink-muted
mt.10: fill magenta-muted
mt.11: fill theme-muted
lp: text "plain" at 1,1 font 0.45 align right
lb: text "-bright" at 1,2 font 0.45 align right
lm: text "-muted" at 1,3 font 0.45 align right
lrp: text "raw" at 1,4 font 0.45 align right
lrb: text "raw -bright" at 1,5 font 0.45 align right
lrm: text "raw -muted" at 1,6 font 0.45 align right
rp0:  line from  2.00,4 to  2.01,4 stroke red weight 15
rp1:  line from  3.00,4 to  3.01,4 stroke orange weight 15
rp2:  line from  4.00,4 to  4.01,4 stroke amber weight 15
rp3:  line from  5.00,4 to  5.01,4 stroke yellow weight 15
rp4:  line from  6.00,4 to  6.01,4 stroke green weight 15
rp5:  line from  7.00,4 to  7.01,4 stroke teal weight 15
rp6:  line from  8.00,4 to  8.01,4 stroke cyan weight 15
rp7:  line from  9.00,4 to  9.01,4 stroke blue weight 15
rp8:  line from 10.00,4 to 10.01,4 stroke purple weight 15
rp9:  line from 11.00,4 to 11.01,4 stroke pink weight 15
rp10: line from 12.00,4 to 12.01,4 stroke magenta weight 15
rp11: line from 13.00,4 to 13.01,4 stroke theme weight 15
rb0:  line from  2.00,5 to  2.01,5 stroke red-bright weight 15
rb1:  line from  3.00,5 to  3.01,5 stroke orange-bright weight 15
rb2:  line from  4.00,5 to  4.01,5 stroke amber-bright weight 15
rb3:  line from  5.00,5 to  5.01,5 stroke yellow-bright weight 15
rb4:  line from  6.00,5 to  6.01,5 stroke green-bright weight 15
rb5:  line from  7.00,5 to  7.01,5 stroke teal-bright weight 15
rb6:  line from  8.00,5 to  8.01,5 stroke cyan-bright weight 15
rb7:  line from  9.00,5 to  9.01,5 stroke blue-bright weight 15
rb8:  line from 10.00,5 to 10.01,5 stroke purple-bright weight 15
rb9:  line from 11.00,5 to 11.01,5 stroke pink-bright weight 15
rb10: line from 12.00,5 to 12.01,5 stroke magenta-bright weight 15
rb11: line from 13.00,5 to 13.01,5 stroke theme-bright weight 15
rm0:  line from  2.00,6 to  2.01,6 stroke red-muted weight 15
rm1:  line from  3.00,6 to  3.01,6 stroke orange-muted weight 15
rm2:  line from  4.00,6 to  4.01,6 stroke amber-muted weight 15
rm3:  line from  5.00,6 to  5.01,6 stroke yellow-muted weight 15
rm4:  line from  6.00,6 to  6.01,6 stroke green-muted weight 15
rm5:  line from  7.00,6 to  7.01,6 stroke teal-muted weight 15
rm6:  line from  8.00,6 to  8.01,6 stroke cyan-muted weight 15
rm7:  line from  9.00,6 to  9.01,6 stroke blue-muted weight 15
rm8:  line from 10.00,6 to 10.01,6 stroke purple-muted weight 15
rm9:  line from 11.00,6 to 11.01,6 stroke pink-muted weight 15
rm10: line from 12.00,6 to 12.01,6 stroke magenta-muted weight 15
rm11: line from 13.00,6 to 13.01,6 stroke theme-muted weight 15
lo: text "other" at 1,7 font 0.45 align right
lro: text "raw other" at 1,8 font 0.45 align right
oth: row ["none" "bg" "bg-shape" "black" "white" "fg" "muted"] at 2,7 font 0.4 size 0.7 gap 0.3 corner 0.5
oth.0: fill none
oth.1: fill bg
oth.2: fill bg-shape
oth.3: fill black colour white
oth.4: fill white colour black
oth.5: fill fg colour bg
oth.6: fill muted
ro0: line from 2.00,8 to 2.01,8 stroke none weight 15
ro1: line from 3.00,8 to 3.01,8 stroke bg weight 15
ro2: line from 4.00,8 to 4.01,8 stroke bg-shape weight 15
ro3: line from 5.00,8 to 5.01,8 stroke black weight 15
ro4: line from 6.00,8 to 6.01,8 stroke white weight 15
ro5: line from 7.00,8 to 7.01,8 stroke fg weight 15
ro6: line from 8.00,8 to 8.01,8 stroke muted weight 15
st: rect "stroke" at 3,10 size 2x0.8 stroke red weight 2
cl: rect "colour" at 6,10 size 2x0.8 colour amber
hx: text "#f80" at 9,10 colour #f80
mu: text "muted" at 12,10 colour muted
```

---

## Changes tween

```anim
st: fill green stroke blue
cl: colour pink
hx: colour teal
```

+++

Variants on fills, strokes and text.

```anim
st: fill green-muted stroke blue-bright
cl: colour pink-muted
hx: colour teal-bright
pal: stroke black colour black
br: stroke black colour black
mt: stroke black colour black
oth: stroke black colour black
oth.3: colour white
```

</animation>

## Feature: contrast

`colour contrast`: black or white text, whichever reads on what's behind it. On a bar, the part of the label over the bar is picked against the bar.

<animation grid="14x7">

```anim
defaults colour contrast size 2.4x1
c1: rect "black" at 2,1.5 fill black
c2: rect "white" at 5,1.5 fill white
c3: rect "yellow" at 8,1.5 fill #ff0
c4: rect "blue" at 11,1.5 fill #00f
defaults clear
t: text "on the page" at 1,3.2 align left colour contrast
h: var 50 at 7,3.2 size 6x1 bar fill #f00 track black colour contrast font 1.4
v: var 50 at 13,4 size 1x4 bar fill #ff0 track #004 colour contrast
p: var 40 at 3,5.5 size 2 pie fill #ff0 track #000 colour contrast
r: var 60 at 7,5.5 size 2 ring fill #ff0 track #000 colour contrast
```

---

## The fill changes and the text follows

```anim
c1: fill white
c2: fill black
c3: fill #008
c4: fill #8ff
h: 20
v: 20
p: 75
```

+++

Across the label, slowly.

```anim
h: 90 speed vslow
v: 90 speed vslow
```

+++

```anim
c3: colour amber
h: colour fg
```

</animation>

## Feature: weight

<animation grid="12x4">

```anim
w1: line from 1,1 to 5,1 weight 0.5
w2: line from 1,2 to 5,2
w3: line from 1,3 to 5,3 weight 2
w4: line from 1,4 to 5,4 weight 4
r1: rect "weight 3" at 8,2 size 2x1 weight 3
r2: rect "weight 0" at 8,3.5 size 2x1 weight 0 fill blue
```

---

```anim
w1: weight 4
w4: weight 0.5
```

</animation>

## Feature: opacity

<animation grid="12x4">

```anim
r1: rect "1" at 2,2 fill blue
r2: rect "0.6" at 4,2 fill blue opacity 0.6
r3: rect "0.3" at 6,2 fill blue opacity 0.3
l: arrow from 8,1 to 11,1 opacity 0.5
t: text "faded" at 9.5,2 opacity 0.4
arr: row [5 3 8] at 8,3
```

---

## Changes tween

```anim
r1: opacity 0.2
r3: opacity +0.7
l: opacity 1
arr: opacity 0.3 stagger
```

+++

```anim
r1: opacity reset
arr.1: opacity 1
t: style reset
```

+++

A spotlight dims the rest on top of their own opacity.

```anim
r2: highlight spotlight
```

</animation>

## Feature: Line styles

Style changes cross-fade.

<animation grid="12x3">

## solid

```anim
l: line from 1,2 to 7,2 weight 2
hoop: circle at 10,2 radius 0.7 weight 1.5 stroke teal
```

---

## dashed

```anim
l: dashed speed slow
hoop: dashed speed slow
```

---

## dotted

```anim
l: dotted speed slow
hoop: dotted speed slow
```

---

## solid

```anim
l: solid speed slow
hoop: solid speed slow
```

</animation>

## Feature: flow

<animation grid="12x3">

```anim
a: circle "A" at 2,2
b: circle "B" at 7,2
l: line from a to b dotted weight 2
hoop: circle at 10,2 radius 0.7 dashed weight 1.5 stroke teal
```

---

## flow

```anim
l: flow
hoop: flow
```

---

## flow-reverse

```anim
l: flow-reverse
hoop: flow-reverse
```

---

## static

```anim
l: static
hoop: static
```

</animation>

## Feature: angle and scale

The arrow stays on the turning rect's edge.

<animation grid="12x5">

```anim
mac: image(../_assets/macs/macintosh.svg) at 2,3 size 2 angle -15
r: rect "45°" at 5,2 angle 45
w: rect "wide" at 5,4 size 2x1 angle 90 scale 0.8
t: text "Tilted" at 8,1 angle 20 font 1.2
cog: icon(cog) at 8,4 scale 1.5
box: rect "B" at 11,3
l: arrow from r to box
```

---

## Animated

```anim
cog: angle +360 speed slow
mac: angle 0 scale 1.3 speed slow
r: angle +90 speed slow
t: angle 0 scale 1.3
w: scale 0.5
```

---

## Directions

`angle up` / `right` / `down` / `left`: a sprite drawn facing right, as at angle 0, faces each way in turn.

```anim
rk: image(../_assets/scratch/sprites/rocket1.svg) at 10.5,1.2 size 1.2 angle up pop
```

+++

```anim
rk: angle right
```

+++

```anim
rk: angle down
```

+++

```anim
rk: angle left
```

---

## The short way

Two full turns (`angle +720`), then `angle up` turns the short way, a quarter turn from facing left, not back through two and a half turns.

```anim
rk: angle +720 speed slow
```

+++

```anim
rk: angle up
```

</animation>

## Feature: Layers

<animation grid="10x3">

## back, normal, front

```anim
a: rect "normal" at 4,2 size 3x1 fill blue
b: circle at 3,2 radius 1 fill amber back
c: circle at 6,2 radius 1 fill pink front
```

---

## Swapped

```anim
b: front
c: back
```

</animation>

## Feature: Emphasis

<animation grid="12x3">

```anim
defaults size 1.6x0.8 font 0.6
pu: rect "pulse" at 2,2
sh: rect "shake" at 4,2
wo: rect "wobble" at 6,2
bn: rect "bounce" at 8,2
gl: rect "glow" at 10,2
defaults clear
```

---

```anim
pu: pulse
```

+++

```anim
sh: shake
```

+++

```anim
wo: wobble
```

+++

```anim
bn: bounce
```

+++

```anim
gl: glow
```


</animation>

## Feature: signal

<animation grid="12x5">

```anim
a: circle "a" at 2,2
b: rect "b" at 10,2
l: arrow from a to b stroke muted
c: curve from a to b via 6,4.5 stroke muted
```

---

## signal

```anim
l: signal
```

+++

```anim
c: signal speed slow
```

---

## signal-reverse

```anim
l: signal-reverse
```

---

## On a group: each of its lines

```anim
g: group [a, b, l, c]
g: signal speed fast
```

</animation>

## Feature: Highlights

<animation grid="12x3">

```anim
defaults size 1.6x0.8 font 0.6
bx: rect "outline" at 2,2
ar: rect "arrow" at 5,2
hg: rect "glow" at 8,2
nu: rect "number" at 11,2
defaults clear
```

---

```anim
bx: highlight outline
ar: highlight arrow
hg: highlight glow
nu: highlight number 1
```

+++

```anim
nu: highlight number 2
```

---

## clear

```anim
bx: highlight clear
ar: highlight clear
hg: highlight clear
nu: highlight clear
```

</animation>

## Feature: Numbers

A bare `number` takes the next one; `number N` sets where the sequence is. On a row, column or group, a bare one numbers each shape in turn.

<animation grid="14x5">

```anim
defaults size 1.2x0.8 font 0.6
a: rect "a" at 2,1.5
b: rect "b" at 4.5,1.5
c: rect "c" at 7,1.5
d: rect "d" at 9.5,1.5
e: rect "e" at 12,1.5
defaults clear
```

---

## 1, 2, then 5, 6, 7

```anim
a: highlight number
b: highlight number
c: highlight number 5
d: highlight number
e: highlight number
```

---

## A row numbers its cells

```anim
arr: row [4, 8, 2] at 2,4 highlight number
```

---

## A group, staggered

```anim
p: circle "p" at 10,4 radius 0.4
q: circle "q" at 12,4 radius 0.4
pq: group [p, q]
```

+++

```anim
pq: highlight number stagger 0.3
```

</animation>

## Feature: Outline and inside

The outline follows each shape's own outline (turned and scaled with it); inside sits just within its stroke.

<animation grid="14x5">

```anim
r: rect "rect" at 2,2 size 2x1
rc: rect "corner" at 5,2 size 2x1 corner 0.3
c: circle "circle" at 8,2 radius 0.7
d: diamond "diamond" at 11,2 size 2x1.4
t: text "text" at 13.5,2
tr: rect "turned" at 2.5,4.2 size 2x0.8 angle 20
th: rect "thick" at 6,4.2 size 2x0.8 weight 3
sc: circle "scaled" at 9,4.2 radius 0.6 scale 1.5
i: icon(laptop) "icon" at 12,4
```

---

## outline

```anim
r: highlight outline
rc: highlight outline
c: highlight outline
d: highlight outline
t: highlight outline
tr: highlight outline
th: highlight outline
sc: highlight outline
i: highlight outline
```

+++

```anim
tr: angle +45
sc: pulse
```

---

## inside

```anim
r: highlight clear inside
rc: highlight clear inside
c: highlight clear inside
d: highlight clear inside
t: highlight clear
tr: highlight clear inside
th: highlight clear inside
sc: highlight clear inside
i: highlight clear inside
```

---

## Both

```anim
r: highlight outline
rc: highlight outline
c: highlight outline
d: highlight outline
tr: highlight outline
th: highlight outline
sc: highlight outline
i: highlight outline
```

</animation>

## Feature: Spotlight

Everything else dims, including their highlights and callouts.

<animation grid="12x3">

```anim
a: rect "a" at 2,2
b: rect "b" at 5,2 highlight outline
c: rect "c" at 8,2 callout "hi"
d: rect "d" at 11,2
```

---

```anim
a: highlight spotlight
```

+++

Several can be spotlit.

```anim
d: highlight spotlight
```

---

## clear

```anim
a: highlight clear
d: highlight clear
```

</animation>

## Feature: Callouts

<animation grid="12x4">

```anim
a: rect "a" at 6,2.5
edge: rect "edge" at 11.5,0.5
```

---

```anim
a: callout "Look at this!"
```

+++

```anim
a: callout "Now below" below
```

+++

Long text wraps.

```anim
a: callout "A much longer callout that wraps onto several lines" left-of
```

+++

It stays inside the drawing.

```anim
a: callout clear
edge: callout "Near the edge"
```

</animation>
