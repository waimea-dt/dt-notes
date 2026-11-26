# Animation: Data Structures

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: Rows and columns

<animation name="Rows & Columns" grid="12x6">

```anim
Arr: row [5 3 8 1] at 2,1.5 fill blue
Col: column ["A" "B" "C"] at 10,1.5 size 1.6x0.8 gap 0.2 fill teal corner 0.1
Words: row ["cat" "" "dog"] at 2,4 size 1.4x0.8 gap 0.3
Mem: row 4 at 7.5,5.3 size 0.8
```

---

## One cell, every cell

```anim
Arr[1]: fill amber
Mem[2]: "7"
```

+++

```anim
Arr: fill green
```

---

## Placed

`move` places the first cell; `move Col.bottom gap 0.5` the whole row, beside `Col`.

```anim
Arr: move 3,3 speed slow
```

+++

```anim
Words: move Col.bottom gap 0.5 speed slow
```

---

## delete

```anim
Arr: delete pop
```

</animation>

## Feature: swap

<animation name="Swap" grid="12x5">

```anim
Arr: row [5, 3, 8, 1] at 2,2 fill blue
I: text "i" attach Arr[0].bottom gap 0.25
P: arrow from 1,4.5 to Arr[3]
Col: column ["A" "B" "C"] at 10,1.5 size 1.6x0.8 gap 0.2 fill teal
```

---

## Neighbours

```anim
Arr: swap 0 1
```

+++

Further apart, they clear the cells between. `I` and the arrow stay with their places.

```anim
Arr: swap 0 3 speed slow
```

---

## A highlight moves with its cell

```anim
Arr[1]: highlight spotlight
```

+++

```anim
Arr: swap 1 2
```

---

## Column

```anim
Arr[2]: highlight clear
Col: swap 0 2 speed slow
```

</animation>

## Feature: insert and remove

<animation name="Insert & Remove" grid="12x6">

```anim
Arr: row [1, 2, 3, 4, 5] at 2,2 fill blue size 0.9 gap 0.2
I: text "i" attach Arr[2].bottom gap 0.25
St: column [4 9] at 10,1.5 size 1.6x0.8 fill teal
```

---

## remove

`Arr[2]` slides out below, leaving an empty slot, and the cells after it close it up. `I` stays with place 2.

```anim
Arr: remove 2
```

+++

The first cell: the rest close up from the left.

```anim
Arr: remove 0 speed slow
```

---

## insert

The cells open an empty slot, and 7 slides up into it.

```anim
Arr: insert 7 at 1
```

+++

New cells take the row's look as it is now.

```anim
Arr: fill green
Arr: insert "x" at 0 speed slow
```

---

## At the end

A slot opens on the end for the new cell; a removed one leaves a slot that closes.

```anim
Arr: insert 8 at end
St: insert 6 at end
```

+++

```anim
Arr: remove end
St: remove end speed slow
```

+++

Emptied, a column can be inserted into again.

```anim
St: remove end
St: remove end delay 0.3
```

+++

```anim
St: insert 1 at end
```

</animation>

## Feature: range

<animation name="Range" grid="12x4">

```anim
Arr: row [5, 3, 8, 1, 9, 2] at 3,2 size 1 gap 0.2 indices
```

---

## A look on some cells

```anim
Arr[0..2]: fill green
```

+++

```anim
Arr[4..1]: fill amber              # either way round
```

+++

```anim
Arr[3..end]: fill teal             # end: the last cell
```

---

## Highlights and emphasis, staggered

```anim
Arr[3..5]: highlight outline stagger 0.2
```

+++

```anim
Arr[1..4]: pulse stagger 0.1
```

+++

```anim
Arr[0..5]: highlight clear
```

</animation>

## Feature: span

<animation name="Span" grid="14x8">

```anim
Arr: row [5, 3, 8, 1, 9, 2] at 3,3 size 1 gap 0.2 indices corner 0.05
Sorted: span Arr[0..2] name "sorted" highlight outline
```

---

## Spans stay on their places

```anim
Arr: swap 1 4
```

+++

```anim
Sorted: span Arr[0..3]                    # spanned again: it glides
Win: span Arr[3..5] fill teal-bright name "window"
```

+++

```anim
Win: span Arr[2..4]                       # a sliding window
```

+++

```anim
Win: span Arr[3..end]                     # end: the last place
```

---

## Highlights, callouts and spotlight on a span

```anim
Sorted: highlight spotlight
```

+++

```anim
Sorted: highlight clear
Win: callout "max?" bottom
```

---

## Inserts and removes refit it

```anim
Win: callout clear
Arr: insert 7 at 0
```

+++

```anim
Arr: remove end
Arr: remove end
```

---

## Columns and code blocks

```anim
Col: column [4 8 15 16] at 12,2 gap 0.1 corner 0.05
Top: span Col[0..1] name "top" stroke teal dotted
C: code ["total = 0" "for n in nums:" "    total += n" "print(total)"] at 2,6.5 lang python indices
Loop: span C[2..3] name "loop" highlight outline
```

+++

```anim
Arr: delete                                # its spans go with it
Loop: highlight arrow
```

+++

```anim
Top: highlight glow
```

+++

```anim
Loop: highlight spotlight
```

</animation>

## Feature: grid and table

<animation name="Grid & Table" grid="16x9">

```anim
G: grid [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 0, 1, 2]
] at 2,2 gap 0.4 corner 0.1 name "g" indices
T: table [
    ["A", "B", "C"],
    [1, 2, 3],
    [5, 6, 7]
] at 10,2 size 1.2x0.8
```

---

## Rows, columns and cells

```anim
G[1]: fill amber                  # row 1
G.col[2]: highlight outline       # column 2
G[2][3]: 42                       # a cell
```

+++

```anim
T.head: fill blue                 # the headings
T[0]: fill green                  # the first row after them
T.col[1]: highlight outline       # a column, its heading too
```

+++

```anim
G: fill none
G.col[2]: highlight clear
T: fill none
T.col[1]: highlight clear
```

---

## Range and span

```anim
G[0..1][1..2]: fill teal                    # a block: [row][column] to [row][column]
S: span G[2][1..end] stroke red name "tail" # within a row
```

+++

```anim
B: span G[0..1][0..end] highlight outline   # rows 0 to 1
T.col[2][0..1]: fill amber                  # within a column
```

+++

```anim
S: delete
B: span T[head..end][0] stroke pink         # a table's [head][column]
```

---

## Indices, stagger, spotlight and moving values

```anim
T: indices                        # its rows (not the heading) and columns
G.col[3]: pulse stagger 0.1
```

+++

```anim
V: var 0 at 8,7 name "v"
V: G[1][2]
T[1]: highlight spotlight
```

+++

```anim
T[1]: highlight clear
E: grid 3x2 at 2,7 size 0.8       # empty: 3 across, 2 down
E[1][1]: "x"
```

---

## Moving it, and delete

```anim
G: move 3,5 speed slow            # its rows, columns, indices and spans go with it
```

+++

```anim
G: delete pop stagger 0.03
T: delete
```

</animation>

## Feature: grid and table edits

<animation name="Grid & Table Edits" grid="16x9">

```anim
G: grid [[1 2 3] [4 5 6] [7 8 9]] at 2,2 gap 0.4 indices corner 0.1
T: table [["A" "B"] [1 2] [3 4]] at 10,2 size 1.2x0.8 indices
G[1]: highlight outline           # stays on row 1's place
S: span G[0][0..1] fill red      # and a span on its places
```

---

## swap

```anim
G: swap 0 2                       # rows
```

+++

```anim
G: swap col 0 end                 # columns
T: swap col 0 1                   # a heading goes with its column
```

+++

```anim
G: swap [1][1] [0][0]             # two cells
T: swap 0 1
```

---

## insert

```anim
G: insert [10 11 12] at 1         # a row: the rows below open up
```

+++

```anim
G: insert col [0 0 0 0] at end    # a column on the end
T: insert col ["C" 5 6] at 1      # its heading first
```

---

## remove

```anim
G: remove col 0
T: remove 0
```

+++

```anim
G: remove end speed slow
T: remove 0                       # a table's rows can all go
```

+++

```anim
T: insert [7 8 9] at end
```

</animation>

## Feature: name and indices

<animation name="Names & Indices" grid="14x7">

A name sits left of a var or row, above a column. Indices are small and muted: below a row's cells, left of a column's.

```anim
Total: var 0 at 4,1.5 name "total"
Arr: row [5 null 8] at 4,3.5 name "arr" indices
St: column [4 9] at 12,2 name "stack" indices fill teal
```

---

## They move with it

```anim
Total: move 2,6
Arr: move 7,4.5 speed slow
```

+++

```anim
Total: name "sum" top
```

---

## An outline takes them in

```anim
Total: highlight outline
Arr: highlight outline
St: highlight outline
```

+++

```anim
Total: highlight clear
Arr: highlight clear
St: highlight clear
```

---

## Indices stay with the places

```anim
Arr: swap 0 2
```

+++

The last index comes and goes with the slot.

```anim
Arr: insert 3 at end
St: remove end
```

+++

```anim
Arr: remove 0
```

---

## Switching off

```anim
Arr: indices clear
Total: name clear
```

+++

Deleting a row deletes its name and indices.

```anim
St: delete
```

</animation>
