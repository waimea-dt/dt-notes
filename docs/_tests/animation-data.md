# Animation: Data Structures

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

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
