# Animation: Data Structures

Click an animation to give it focus, then use ← / → to step and `F` for full screen.

**Animation tests:** [Blocks](animation.md) · [Examples](animation-examples.md) · [Shapes, Looks and Highlights](animation-shapes.md) · [Movement, Timing and Camera](animation-motion.md) · [Images and Scenes](animation-images.md) · **Data Structures** · [Code and Scratch](animation-code.md) · [Errors](animation-errors.md)

## Feature: Rows and columns

<animation grid="12x6">

```anim
arr: row [5 3 8 1] at 2,1.5 fill blue
col: column ["A" "B" "C"] at 10,1.5 size 1.6x0.8 gap 0.2 fill teal corner 0.1
words: row ["cat" "" "dog"] at 2,4 size 1.4x0.8 gap 0.3
mem: row 4 at 7.5,5.3 size 0.8
```

---

## One cell, every cell

```anim
arr.1: fill amber
mem.2: "7"
```

+++

```anim
arr: fill green
```

---

## Placed

`move` places the first cell; `below` the whole row.

```anim
arr: move 3,3 speed slow
```

+++

```anim
words: below col gap 0.5 speed slow
```

---

## delete

```anim
arr: delete pop
```

</animation>

## Feature: swap

<animation grid="12x5">

```anim
arr: row [5, 3, 8, 1] at 2,2 fill blue
i: text "i" attach below arr.0
p: arrow from 1,4.5 to arr.3
col: column ["A" "B" "C"] at 10,1.5 size 1.6x0.8 gap 0.2 fill teal
```

---

## Neighbours

```anim
arr: swap 0 1
```

+++

Further apart, they clear the cells between. `i` and the arrow stay with their places.

```anim
arr: swap 0 3 speed slow
```

---

## A highlight moves with its cell

```anim
arr.1: highlight spotlight
```

+++

```anim
arr: swap 1 2
```

---

## Column

```anim
arr.2: highlight clear
col: swap 0 2 speed slow
```

</animation>

## Feature: insert and remove

<animation grid="12x6">

```anim
arr: row [1, 2, 3, 4, 5] at 2,2 fill blue size 0.9 gap 0.2
i: text "i" attach below arr.2
st: column [4 9] at 10,1.5 size 1.6x0.8 fill teal
```

---

## remove

`arr.2` slides out below, leaving an empty slot, and the cells after it close it up. `i` stays with place 2.

```anim
arr: remove 2
```

+++

The first cell: the rest close up from the left.

```anim
arr: remove 0 speed slow
```

---

## insert

The cells open an empty slot, and 7 slides up into it.

```anim
arr: insert 7 at 1
```

+++

New cells take the row's look as it is now.

```anim
arr: fill green
arr: insert "x" at 0 speed slow
```

---

## At the end

A slot opens on the end for the new cell; a removed one leaves a slot that closes.

```anim
arr: insert 8 at end
st: insert 6 at end
```

+++

```anim
arr: remove end
st: remove end speed slow
```

+++

Emptied, a column can be inserted into again.

```anim
st: remove end
st: remove end delay 0.3
```

+++

```anim
st: insert 1 at end
```

</animation>

## Feature: range

<animation grid="12x4">

```anim
arr: row [5, 3, 8, 1, 9, 2] at 3,2 size 1 gap 0.2 indices
```

---

## A look on some cells

```anim
arr: range 0 2 fill green
```

+++

```anim
arr: range 4 1 fill amber          # either way round
```

+++

```anim
arr: range 3 end fill teal         # end: the last cell
```

---

## Highlights and emphasis, staggered

```anim
arr: range 3 5 highlight outline stagger 0.2
```

+++

```anim
arr: range 1 4 pulse stagger 0.1
```

+++

```anim
arr: range 0 5 highlight clear
```

</animation>

## Feature: span

<animation grid="14x8">

```anim
arr: row [5, 3, 8, 1, 9, 2] at 3,3 size 1 gap 0.2 indices corner 0.05
sorted: span arr 0 2 name "sorted" highlight outline
```

---

## Spans stay on their places

```anim
arr: swap 1 4
```

+++

```anim
sorted: span arr 0 3                      # spanned again: it glides
win: span arr 3 5 fill teal-bright name "window"
```

+++

```anim
win: span arr 2 4                         # a sliding window
```

+++

```anim
win: span arr 3 end                       # end: the last place
```

---

## Highlights, callouts and spotlight on a span

```anim
sorted: highlight spotlight
```

+++

```anim
sorted: highlight clear
win: callout "max?" below
```

---

## Inserts and removes refit it

```anim
win: callout clear
arr: insert 7 at 0
```

+++

```anim
arr: remove end
arr: remove end
```

---

## Columns and code blocks

```anim
col: column [4 8 15 16] at 12,2 gap 0.1 corner 0.05
top: span col 0 1 name "top" stroke teal dotted
c: code ["total = 0" "for n in nums:" "    total += n" "print(total)"] at 2,6.5 lang python numbered
loop: span c 2 3 name "loop" highlight outline
```

+++

```anim
arr: delete                                # its spans go with it
loop: highlight arrow
```

+++

```anim
top: highlight glow
```

+++

```anim
loop: highlight spotlight
```

</animation>

## Feature: grid and table

<animation grid="16x9">

```anim
g: grid [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 0, 1, 2]
] at 2,2 gap 0.4 corner 0.1 name "g" indices
t: table [
    ["A", "B", "C"],
    [1, 2, 3],
    [5, 6, 7]
] at 10,2 size 1.2x0.8
```

---

## Rows, columns and cells

```anim
g.1: fill amber                   # row 1
g.col.2: highlight outline        # column 2
g.2.3: 42                         # a cell
```

+++

```anim
t.head: fill blue                 # the headings
t.0: fill green                   # the first row after them
t.col.1: highlight outline        # a column, its heading too
```

+++

```anim
g: fill none
g.col.2: highlight clear
t: fill none
t.col.1: highlight clear
```

---

## Range and span

```anim
g: range 0.1 1.2 fill teal                  # a block: row.column to row.column
s: span g.2 1 end stroke red name "tail"    # within a row
```

+++

```anim
b: span g 0.0 1.end highlight outline       # rows 0 to 1
t.col.2: range 0 1 fill amber               # within a column
```

+++

```anim
s: delete
b: span t head.0 end.0 stroke pink          # a table's head.column
```

---

## Indices, stagger, spotlight and moving values

```anim
t: indices                        # its rows (not the heading) and columns
g.col.3: pulse stagger 0.1
```

+++

```anim
v: var 0 at 8,7 name "v"
v: g.1.2
t.1: highlight spotlight
```

+++

```anim
t.1: highlight clear
e: grid 3x2 at 2,7 size 0.8       # empty: 3 across, 2 down
e.1.1: "x"
```

---

## Moving it, and delete

```anim
g: move 3,5 speed slow            # its rows, columns, indices and spans go with it
```

+++

```anim
g: delete pop stagger 0.03
t: delete
```

</animation>

## Feature: grid and table edits

<animation grid="16x9">

```anim
g: grid [[1 2 3] [4 5 6] [7 8 9]] at 2,2 gap 0.4 indices corner 0.1
t: table [["A" "B"] [1 2] [3 4]] at 10,2 size 1.2x0.8 indices
g.1: highlight outline            # stays on row 1's place
s: span g 0.0 0.1 fill red      # and a span on its places
```

---

## swap

```anim
g: swap 0 2                       # rows
```

+++

```anim
g: swap col 0 end                 # columns
t: swap col 0 1                   # a heading goes with its column
```

+++

```anim
g: swap 1.1 0.0                   # two cells
t: swap 0 1
```

---

## insert

```anim
g: insert [10 11 12] at 1         # a row: the rows below open up
```

+++

```anim
g: insert col [0 0 0 0] at end    # a column on the end
t: insert col ["C" 5 6] at 1      # its heading first
```

---

## remove

```anim
g: remove col 0
t: remove 0
```

+++

```anim
g: remove end speed slow
t: remove 0                       # a table's rows can all go
```

+++

```anim
t: insert [7 8 9] at end
```

</animation>

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

## Feature: name and indices

<animation grid="14x7">

A name sits left of a var or row, above a column. Indices are small and muted: below a row's cells, left of a column's.

```anim
total: var 0 at 4,1.5 name "total"
arr: row [5 null 8] at 4,3.5 name "arr" indices
st: column [4 9] at 12,2 name "stack" indices fill teal
```

---

## They move with it

```anim
total: move 2,6
arr: move 7,4.5 speed slow
```

+++

```anim
total: name "sum" above
```

---

## An outline takes them in

```anim
total: highlight outline
arr: highlight outline
st: highlight outline
```

+++

```anim
total: highlight clear
arr: highlight clear
st: highlight clear
```

---

## Indices stay with the places

```anim
arr: swap 0 2
```

+++

The last index comes and goes with the slot.

```anim
arr: insert 3 at end
st: remove end
```

+++

```anim
arr: remove 0
```

---

## Switching off

```anim
arr: indices clear
total: name clear
```

+++

Deleting a row deletes its name and indices.

```anim
st: delete
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


## Feature: binary

<animation grid="14x8">

A row of bits, numbered from the right: b.0 is the lowest.

```anim
b: binary 123 at 3,2 indices powers decimal name "b"
v: var 125 at 3,5 name "v"
b1: binary 666 digits 12 at 1,7 indices powers decimal
```

---

## A bit, or a new value

```anim
b.0: 0                            # = 122
b.7: 1                            # = 250
```

+++

```anim
b: 67 speed slow                  # only the bits that change crossfade
```

---

## flip

```anim
b: flip stagger                   # every bit, from b.0
```

+++

```anim
b: flip 0 3                       # the low four
b.7: flip
```

+++

```anim
b: 300                            # too big for 8 bits: it wraps round to 44
```

+++

```anim
b: +1                             # signed: relative, = 45
```

+++

```anim
b: -50                            # below 0: it wraps round to 251
```

---

## Moving values

```anim
b: v                              # v's value glides onto the bits
```

+++

```anim
w: var 0 at 6,5 name "w"
w: b                              # and back off them
```

+++

```anim
n: binary v at 9,5 digits 4 decimal  # a var's value, in 4 bits (wraps round to 13)
```

---

## Looks, range, span and switching off

```anim
b: range 4 7 fill blue            # the high four
s: span b 0 3 stroke amber
b: powers clear
b: decimal clear
```

+++

```anim
b: colour blue                    # 0s are muted until given a colour
b.6: bold
```

+++

```anim
b: colour reset                   # back as it started: 0s muted again
b.5: fill red font 1
```

+++

```anim
b: style reset                    # every look back as it started (b.6 not bold)
```

+++

```anim
b: highlight outline
n: delete
```

</animation>

## Feature: hex and denary

<animation grid="14x7">

Numbers in base 16 and base 10: like binary, with digits 0-9, then A-F.

```anim
h: hex 123 at 3,2 digits 4 name "h" powers decimal  # 007B = 123
d: denary 123 at 3,5 name "d" indices powers         # 3 digits by default

```

---

## A digit, or a new value

```anim
h.0: f                            # = 127 (any case, shown upper)
d.2: 9                            # = 923

```

+++

```anim
h.1: +1                           # 8: a digit adds in its base, = 143
h: 65535 speed slow               # FFFF
d: +100                           # wraps round to 23

```

+++

```anim
d: h                              # h's value glides over: 65535 wraps round to 535
```

</animation>

## Feature: hex over binary

<animation grid="20x7">

Hex digits 4 squares wide, one over each nibble: `at` places a layout by the top-left of its first cell.

```anim
h: hex 51966 at 3,2 digits 4 size 4x1 name "hex" powers indices decimal   # CAFE
b: binary 51966 at 3,5 digits 16 name "bin" indices powers decimal
```

---

```anim
b: range  0  3 fill blue
h.0: fill blue

b: range  4  7 fill cyan   delay 0.5
h.1:           fill cyan   delay 0.5

b: range  8 11 fill green  delay 1.0
h.2:           fill green  delay 1.0

b: range 12 15 fill yellow delay 1.5
h.3:           fill yellow delay 1.5
```

---

```anim
b: 4660 speed slow                # 0001 0010 0011 0100
h: b                              # = 1234
```

</animation>


## Demo: RGB Colours

<animation grid="12x7">

## Three colour values: R, G, B

```anim
defaults corner 0.1 max 255 size 5x1 track black stroke muted
r: var 0 name "r" bar at 4,2 fill #f00
g: var 0 name "g" bar at 4,4 fill #0f0
b: var 0 name "b" bar at 4,6 fill #00f
```

+++

Mixed together...

```anim
defaults stroke fg
plus: circle at 8.5,4 "+"
ra: arrow from 6.5,2.5 to plus stroke red
ga: arrow from 6.5,4.0 to plus stroke green
ba: arrow from 6.5,5.5 to plus stroke blue
```

+++

... to form a colour

```anim
col: rect at 11,4 size 2x5 fill #000
ca: arrow from plus to col
```

---

## Changing the RGB values, changes the colour

```anim
r: 0
g: 0
b: 0
col: fill #000
```
+++

```anim
r: 64
col: fill #400
```
+++

```anim
r: 128
col: fill #800
```
+++

```anim
r: 255
col: fill #f00
```
+++

```anim
r: 0
g: 255
col: fill #0f0
```
+++

```anim
g: 0
b: 255
col: fill #00f
```
+++

```anim
g: 255
col: fill #0ff
```
+++

```anim
b: 0
r: 255
col: fill #ff0
```
+++

```anim
g: 0
b: 255
col: fill #f0f
```
+++

```anim
g: 255
col: fill #fff
```

</animation>

## Demo: Binary and Colours

<animation grid="16x7">

## Three binary values: R, G, B

```anim
r: binary 0 name "r" at 2,2 powers fill black stroke red decimal
g: binary 0 name "g" at 2,4 powers fill black stroke green decimal
b: binary 0 name "b" at 2,6 powers fill black stroke blue decimal
```

+++

Mixed together...

```anim
plus: circle at 12.5,4 "+"
ra: arrow from 11,2.5 to plus stroke red
ga: arrow from 11,4.0 to plus stroke green
ba: arrow from 11,5.5 to plus stroke blue
```

+++

... to form a colour

```anim
col: rect at 15,4 size 2x5 fill black corner 0.1
ca: arrow from plus to col
```

---

## Changing the RGB values, changes the colour

```anim
r: 255 fill #f00
col: fill #f00
```
+++

```anim
r: 0 fill #000
g: 255 fill #0f0
col: fill #0f0
```
+++

```anim
g: 0 fill #000
b: 255 fill #00f
col: fill #00f
```
+++


</animation>

