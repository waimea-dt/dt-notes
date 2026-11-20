# Animation: Data Structures and Code

Click an animation to give it focus, then use ← / → to step and `F` for full screen.

**Animation tests:** [Blocks](animation.md) · [Examples](animation-examples.md) · [Shapes, Looks and Highlights](animation-shapes.md) · [Movement, Timing and Camera](animation-motion.md) · [Images and Scenes](animation-images.md) · **Data Structures and Code** · [Errors](animation-errors.md)

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
arr: row [5, 3, 8, 1, 9, 2] at 2,4 bar stroke none fill pink-bright size 0.6x3 gap 0.15 indices
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
votes: column [12 7 15 4 9] at 4,1.5 bar stroke none fill teal size 4x0.7 gap 0.15 name "Votes" indices
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

## Feature: code

<animation grid="16x7">

A code block: its lines in [ ] (one per line, the closing "]" lined up with the id), highlighted by Prism. Lines are numbered from 1, like line numbers.

```anim
c: code [
    "total = 0",
    "for n in [5, 3, 8]:",
    "    total += n"
] at 2,2 lang python name "sum.py" numbered
nums: row [5 3 8] at 12,2 name "nums"
total: var 0 at 12,4 name "total"
```

---

## Highlighting a line

```anim
c.2: highlight line
nums.0: fill amber
```

+++

```anim
c.2: highlight clear
c.3: highlight line
total: 5
```

+++

A text can be highlighted too, and a fill on a line works as well.

```anim
note: text "adds each number" at 12,5.5 highlight line
c.3: highlight clear
c.1: fill teal
```

---

## Changing lines

A longer line widens the block.

```anim
c.1: fill none
note: delete
c: insert "print(total)  # 16" at end
```

+++

```anim
c.1: "total = 100" speed slow
```

+++

```anim
c: swap 1 2
```

+++

```anim
c: remove 1
c: font 0.8
```

---

## One line, typed

A single line goes in quotes. Typed, a block's lines type out one after another.

```anim
s: code "console.log(\"Hello, world!\")" lang js at 2,6 typed
```

+++

```anim
s: "console.log(42)"
```

+++

```anim
p: code [
    "def greet(name):",
    "    return f\"Hi {name}\""
] at 10,5.5 lang python typed speed 2
```

+++

```anim
p: delete typed
c: delete
```

</animation>

## Feature: Scratch scripts

<animation grid="16x8">

# Scratch Scripts

A script is as big as its blocks. Shapes placed beside it fit round it.

```anim
s: scratch [
    "when green flag clicked",
    "turn right (15) degrees",
    "say [Hello!] for (2) seconds"
] at 5,3.5 pop
t: text "Flag script" attach below s
a: arrow from 11,3 to s
```

---

## A new script

A change fades the old script out and the new one in, while its box grows to fit.

```anim
s: [
    "when green flag clicked",
    "forever",
    "    turn right (15) degrees",
    "    if <touching (edge v)?> then",
    "        say [Ouch!] for (1) seconds",
    "    end",
    "end"
]
```

+++

The same script with some new values

```anim
s: [
    "when green flag clicked",
    "forever",
    "    turn right (45) degrees",
    "    if <touching (edge v)?> then",
    "        say [Eek!] for (3) seconds",
    "    end",
    "end"
] speed instant
```

+++

One line goes in quotes.

```anim
s: "move (10) steps"
```

---

## Sized and scaled

Given a size, a script fits inside it. Its font makes it bigger or smaller.

```anim
b: rect at 12,5 size 4x3 fill none stroke muted dashed
f: scratch [ "when this sprite clicked" "play sound (Meow v) until done" ] at 12,5 size 4x3
s: font 0.7
```

+++

```anim
f: highlight outline
s: move 4,6 angle -10
```

</animation>

## Feature: Scratch block highlights

<animation grid="14x8">

# Stepping Through a Script

`highlight block N` dims every block but the Nth, like a spotlight. `end` and `else` aren't blocks.

```anim
s: scratch [
    "when green flag clicked",
    "forever",
    "    turn right (15) degrees",
    "    if <mouse down?> then",
    "        say [Ouch!] for (1) seconds",
    "    else",
    "        move (10) steps",
    "    end",
    "end"
] at 4,4

r: rect "TEST" size 2x2 at 9,2 fill pink
```

+++

```anim
s: highlight block 1
```

+++

```anim
s: highlight block 2
```

+++

The light moves from block to block.

```anim
s: highlight block 3
```

+++

```anim
s: highlight block 4
```

+++

```anim
s: highlight block 6
```

---

## Changes and clearing

A highlight stays on through a change to the script.

```anim
s: [
    "when green flag clicked",
    "forever",
    "    turn right (45) degrees",
    "    if <mouse down?> then",
    "        say [Ouch!] for (1) seconds",
    "    else",
    "        move (10) steps",
    "    end",
    "end"
] speed instant
s: highlight block 3
```

+++

```anim
s: highlight clear
```

</animation>
