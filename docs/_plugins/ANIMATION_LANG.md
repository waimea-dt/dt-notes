# Animation Cheat-Sheet

`<animation>` blocks: a step-by-step animated SVG drawing with a caption per step.

## Block

````markdown
<animation grid="16x9">

# Title (fixed)

Caption for step 1.

```anim
A: rect "A" at 2,3
```

---

## Step 2 heading

```anim
A: move 5,3
```

+++

More caption, shown with this beat.

```anim
A: fill green
```

Note:
Teacher notes (S).

</animation>
````

| Marker | |
|---|---|
| `---` | New step |
| `+++` | New beat (caption and scene) |
| ` ```anim ` | Scene lines |
| `Note:` | Teacher notes, to the end of the step |

Markers go alone on their line. Everything in a beat plays at once.

| Attribute | Default | |
|---|---|---|
| `grid="CxR"` / `grid="fit"` | `16x9` | Grid size / fit the content |
| `debug` | off | Grid numbers, ids, warnings |
| `crop` | off | Nothing drawn outside the grid |
| `autoplay` | off | Plays when on screen |
| `loop` / `loop-bounce` | off | Restart / play back to the start |
| `hold="s"` | `1.5` | Wait between beats while playing |
| `controls="none"` | shown | Hide buttons and progress bar |
| `name="..."` | `# Title` | Name in the VS Code preview's block list |

**Keys:** → `N` `Space` next · ← `P` `Shift+Space` back · `Home` `End` · `A` play · `F` full screen · `S` notes · `?` help · `Esc`

## Grid

- Cells from 1, top-left. `at 3,2` = centre of column 3, row 2. Fractions OK.
- `at` puts a shape's centre on the middle of the square, and anything with parts (rows, grids, numbers, code, Scratch) by its top-left. `anchor top-left` (or any side, corner or `centre`) puts that part of a single shape on that part of the square, and it holds as the shape changes size.
- Points `5,4`, sizes `2x1`, all in cells. A point is x,y (column, row); a place is `[row][column]`, as in code (`G[1][2]`).
- A point can be a shape (`A`: its centre) or a point on its edge: `A.top` `A.bottom` `A.left` `A.right` `A.top-left` `A.top-right` `A.bottom-left` `A.bottom-right`.

## Lines

```anim
A: rect "A" at 2,3         # create: id: type "label" properties
A: move 5,3 fill red       # change
A: delete                  # delete
# a comment ("#" then a space)
M:
    rect "Long command"    # indented more = same command
    at 4,5
R: row [
    5,
    3
] at 2,2                   # a line starting "]" too
```

- Ids: a capital letter, then letters, digits, `_` and `-` (`Arr`, `V1`, `Top_row`). Keywords are lowercase, so any capitalised word is an id.
- One quoted label per line. Properties in any order.
- A type on an existing id replaces the shape.
- Bad lines are skipped and listed under the animation.

## Shapes

| Type | Example | Default |
|---|---|---|
| `rect` | `A: rect "A" at 2,3 size 2x1 corner 0.1` | 1×1 |
| `circle` | `C: circle "C" at 4,3 radius 0.8` · `E: circle at 4,3 size 3x1.5` (an ellipse) | radius 0.5 |
| `diamond` | `D: diamond "x > 3?" at 4,3 size 3x1.5` | 1×1 |
| `polygon` | `P: polygon [0,-1 1,1 -1,1] at 5,4 "P"` (points from `at`, in cells) · `P: [0,-1 1,0 0,1 -1,0]` (new points) | its points' size |
| `text` | `T: text "Hi" at 7,1 anchor left` | |
| `line` / `arrow` | `L: arrow from A to 9,3 "label"` · `L: line from A to B start bar end crow` · `L: line from 2,5 via 6,5 via 6,6 to 10,6 corner 0.3` | |
| `curve` | `C: curve from A to B via 5,1 via 7,3` · `C: curve from A to B bend 0.5` · `C: curve from A to A angle right` (a loop) | loop: up, 1×1 |
| `image(path)` | `P: image(../_assets/x.svg) "Alt" at 3,4 size 2` | 1×1 |
| `icon(name)` | `I: icon(laptop) "Laptop" at 10,2` | 1×1, Lucide |
| `scratch` | `S: scratch "move (10) steps" at 4,3` | its blocks' size (see Scratch) |

- Ends: `start` / `end`, each `none` `arrow` `dot` `crow` `bar` (`L: end dot`). An `arrow` is a line with `end arrow`.
- Labels take `<sup>` `<sub>` `<b>` `<i>`, one at a time: `T: text "x<sup>2</sup> is <b>big</b>" at 3,1`.
- Via: a corner on a line, a turn on a curve. A signed via is relative to the point before.
- Bend: bows a curve to its left (`bend -0.5`: right). Replaces any via points.
- Loop: `angle` is the way it faces, `size 1.2x0.6` how wide and how far out.
- Image paths work like `![](…)`.

## Properties

| Property | Syntax |
|---|---|
| position | `at 3,2` · `at B` (as it's made) · `move 5,3` · `move B` (once it's there) · `x 3` · `y 2` |
| placement | `below B` · `above B` · `left-of B` · `right-of B` · `gap 1` |
| line ends | `from 2,3 to B` (an end on a shape follows it) · `from A.right to B.left` · `start dot` · `end arrow` |
| size | `size 2x1` · `size 2` (circle: diameter) · `width 3` · `height 0.5` |
| radius / corner | `radius 0.5` (circle: both ways) · `corner 0.2` (rect; line, arrow: rounds its corners) |
| colour | `fill blue` · `stroke #f80` · `ink amber` (text and labels) · `fill rgb(255 128 0)` |
| weight | `weight 2` (× normal, `0` hides) |
| opacity | `opacity 0.5` (`0` hidden … `1` solid; its name and indices too) |
| line style | `solid` · `dashed` · `dotted` |
| show | `show 0.5` (lines: how much, from the start, as if drawn that far) |
| flow | `flow` · `flow-reverse` · `static` (dashed / dotted only) |
| angle / scale | `angle 45` (clockwise, 0 = right) · `angle up` (`right` `down` `left` `up`) · `scale 1.5` (not lines) |
| font | `font 1.5` · `bold` · `regular` (not bold) · `mono` |
| anchor | `anchor left` · `top-left` · `bottom` · `centre` (single shapes: what goes on the square) |
| layer | `back` · `normal` · `front` |
| image fit | `contain` · `cover` (cropped) |

**Colours:** `red orange amber yellow green teal cyan blue purple pink magenta theme muted fg bg bg-shape black white none` · `#hex`

`bg`: the backdrop · `bg-shape`: a shape's default fill.

**Variants** of `red` … `theme`: `-bright` (`red-bright`) · `-muted` (`blue-muted`).

`ink contrast`: black or white text, whichever reads on what's behind it (on a bar, each part).

## Relative values

A signed number on a change is relative.

```anim
A: move +2,-1        # 2 right, 1 up
A: move +2,3         # 2 right, to row 3
A: width +1          # 1 cell wider
A: size +1           # 1 cell bigger each way
A: angle +90         # a further quarter turn
```

## Resetting looks

```anim
A: fill reset        # back as it started
A: style reset       # every look
```

- `reset` goes after `fill` `stroke` `ink` `weight` `font` `bold` `mono` `corner` `opacity`.

## Moving lines

```anim
L: to 6,5            # one end
L: from A to 9,9     # both ends
L: move +1,+0        # the whole line
C: via 6,1           # a curve's bends, a line's corners
```

## Movement

```anim
A: move 9,3 via 5,1           # an arc through a point
A: move 9,3 via 3,1 via 6,5   # a wave through several
A: travel R1 R2 4,3           # hop by hop (speed per hop)
A: follow L                   # along line / curve l
A: follow-reverse L           # from its end
A: angle +90 about 5,5        # round a point, turning with it
A: angle +90 about B          # round b's centre
A: angle +90 about +0,+1      # signed: from its own centre
Hand: angle 210 about Hub     # a line: its free ends go round
Car: angle +180 about 9,6     # a group, as one
```

- `about` goes with an angle. An absolute angle turns from as drawn.
- Not on rows, columns, grids or tables, or a line with both ends on shapes.

## Trails

```anim
A: trail                      # a line where it goes from now on
A: move 9,3 trail             # from where the move starts
A.trail: stroke red solid     # dashed and muted unless styled
A: trail clear
```

- Follows the real path: via, travel, follow, about and a swap's bow. Stays until `trail clear`.
- A cell's trail goes with the cell through swaps, inserts and removes.

## Copy, attach, group

```anim
K2: copy Key move 8,1          # copy, then move off
Lock: attach right-of Msg      # rides beside Msg
Lock: attach Msg               # on top of Msg
Lock: attach Msg.top-right     # on its corner
Lock: detach
Pkt: group [Msg Lock]          # acts as one
Pkt: ungroup
G: arrange right gap 0.5       # in a line, from the first, centres level
G: arrange 30 gap 0            # at an angle (degrees, as angle)
```

- Moving an attached shape detaches it.
- A look or delete on a group goes to its members.
- `arrange`: in the group's order, each from the one before as `right-of` would (`gap` 0.25). Takes `speed`, `delay`, `ease`, `stagger`.

## Rows and columns

```anim
Arr: row [5 3 8 1] at 3,4          # cells Arr[0] … Arr[3]
Col: column ["A" "B" "C"] at 12,2 gap 0.2
Mem: row 8 at 2,6                  # 8 empty cells
Arr: swap 0 3                      # two cells change places
Arr: swap 0 end                    # end: the last cell
Arr: insert 7 at 3
Arr: insert 8 at end
Arr: remove 2
Arr: remove end
Arr[2]: fill amber                 # one cell
Arr[0..2]: fill amber              # cells 0 to 2 (a look, highlight, emphasis or callout)
Arr[3..end]: bold                  # cell 3 to the last
Arr: fill green                    # every cell
Arr: delete                        # the whole row
```

- Values in `[ ]`: numbers, `"quoted"` or `null`, commas optional.
- `size`, `gap` and looks apply to every cell. Cell size is set when it's made.
- `at` places it by its top-left. `below B` etc. place the whole row.
- Ids stay with the places: after an edit, `Arr[2]` is whichever cell is now third.
- Cells hold values like a var: `Arr[2]: 7`.
- A range `[from..to]` includes both ends, either way round.
- `swap` `insert` `remove` take `speed`, `delay` and `ease`.

## Spans

```anim
Sorted: span Arr[0..2] name "sorted"   # a box round places 0 to 2
Sorted: highlight outline
Win: span Arr[3..5] fill amber
Win: span Arr[2..4]                    # move it
Tail: span Arr[3..end]                 # place 3 to the last
Sorted: delete
```

- For rows, columns, code blocks, grids and tables. Invisible unless given a `fill` or `stroke`.
- Takes highlights, a callout and a `name`.

## Grids and tables

```anim
G: grid [
    [1, 2, 3, 4],
    [5, 6, 7, 8]
] at 2,2                           # cells G[0][0] … G[1][3] (row, column)
T: table [
    ["A", "B", "C"],               # the headings
    [1, 2, 3],
    [4, 5, 6]
] at 8,2
E: grid 4x3 at 2,6                 # empty: 4 across, 3 down
G[1]: fill amber                   # row 1
G.col[2]: highlight outline        # column 2
G[1][2]: 7                         # a cell
T.head: fill blue                  # the headings (T.head[0] …)
T[0]: bold                         # the first row after them
T.col[1]: fill green               # a column, its heading too
G[0..1][1..2]: fill teal           # a block, corner to corner
S: span G[0..1][0..end]            # rows 0 and 1 (end: the last)
S2: span T[head..end][0]           # a table's column 0, heading too
G[1][0..2]: fill green             # within a row
S3: span G.col[2][0..1]
G: indices                         # rows down the left, columns along the bottom
G: swap 0 1                        # rows
G: swap col 1 end                  # columns
G: swap [1][2] [0][0]              # cells
G: insert [9 9 9 9] at 1           # a row
T: insert col ["D" 7 8] at end     # a column, its heading first
G: remove 0
G: remove col end
```

- Rows and columns count from 0. A table's `T[0]` is the first row after its headings.
- A range is `G[rows][columns]` (`G[0..1]`: whole rows). A cell in a swap is `[row][column]`. Each is a number or `end` (a table's row can be `head`).
- `size`, `gap`, looks, `name` and `indices` go on the whole grid.
- A row or column takes looks, highlights, emphasis, callouts, `stagger`, ranges, `span` and a `name`.
- Ids stay with the places, as in a row.

## Variables

```anim
V1: var 67 at 5,3
V2: var "Dog" at 5,5
V3: var null at 8,3
V1: 123                            # a new value
V1: +1                             # relative ("+1" is text)
V2: "Cat"
V1: null
```

- A var is a rect: size, fill and the other looks work.

## Bars

```anim
Arr: row [5 3 8 1 9] at 2,6 bar stroke none fill pink size 0.5x3 gap 0.1
Hp: var 67 name "health" at 2,1 size 5x0.5 bar fill green track red
Hp: 30
Hp: max 200                        # a full bar's value
Arr: bar clear                     # plain boxes again
Done: var 25 at 3,2 size 2 ring fill teal track muted
Left: var 60 at 7,2 size 2 pie fill purple track muted
Done: ring clear
```

- For vars and cells. `fill` is the bar, `track` the rest (default `none`).
- `max`: 100, or a row's / column's biggest value.
- `bar` fills up a tall box, across a wide one. Its value goes in the middle with a track, otherwise at the end.
- `ring` and `pie` are round: one `size`, no `width` / `height`. A box that isn't square is made square.

## Colours from values

```anim
Sw: rect at 8,3 fill rgb({R} {G} {B})  # red, green, blue (0-255): follows vars R, G, B
Sw: stroke rgb({Arr[0]}, 255, {N * 2}) # cells, numbers (binary, hex, denary) and sums
R: 200                                 # Sw changes with R
R: binary 0 at 2,2 fill rgb({R} 0 0)   # a number following its own value
Sw: fill rgb(R 0 0)                    # no { }: R's value now
Sw: fill red                           # stops following
```

- For `fill`, `stroke`, `ink` and `track`. Values outside 0-255 are held in range.

## Sums

```anim
C: A + B * 2                       # worked out once, as in code
Arr[3]: Arr[0] mod 4               # + - * / mod, spaces round each
B: V1 * 2                          # a number's value too
C: (A + B) * 2                     # ( ) first
A: (-5)                            # a negative value (A: -5 takes 5 off)
```

## Values in labels

```anim
T: text "{N} × {S} = {N * S}" at 8,2   # kept up to date
T: text "{1, 2, 3}" at 8,3             # not a sum: shows as written
```

- Not in values, code or Scratch.

## Following values

```anim
Dot: circle y 4 x {Px}             # x follows Px (in cells)
Hand: rect at 9,4 angle {Turn * 3} # a sum
Snap: circle y 3 x Px              # no { }: Px's value now
Hand: angle 0                      # a number again: stops following
W: var 2 at 2,2 width {W} height 1 # its own value
Sum: var {A + B} at 5,2            # a value: vars, cells and numbers
Sum: 0                             # a new value: stops following
```

- `{ }` follows as values change; a bare var or cell is its value now.
- For values, and `x` `y` `width` `height` `radius` `corner` `weight` `font` `angle` `scale` `opacity` `show`.

## Counting

```anim
Score: 25 counter                  # counts its way there
B: 11 counter                      # a number's digits too
defaults counter
```

- A label's `{ }` that follows a counting value counts along with it, as does a number's `decimal`.

## Moving values

```anim
V1: A[1]                           # a copy of A[1]'s value moves onto V1
A[2]: V2                           # vars and cells both ways
A: insert V1 at 3
A: insert V2 at end
A: remove end into V2
A: remove 1 into V1
```

- Values are copied. Takes `speed`, `delay` and `ease`.
- `keep-style` (or `defaults keep-style`): the value takes its fill, stroke and ink with it.

## Names and indices

```anim
V1: var 0 at 5,3 name "total"
Arr: row [5 3 8] at 3,4 name "arr" indices
V1: name "sum" above               # rename, or another side
V1: name clear
Arr: indices
Arr: indices clear
```

- For vars, rows, columns, grids and tables.
- Text shapes you can style: `V1.name`, `Arr.index[0]`, `G.index[1]`, `G.index.col[2]` (e.g. `Arr.name: bold`).

## Numbers

```anim
B: binary 123 at 2,2               # 8 bits, B[0] (rightmost) … B[7]
H: hex 123 at 2,2                  # 2 digits, 0-9 then A-F
D: denary 123 at 2,2               # 3 digits
N: binary V1 at 2,4 digits 4       # a var's value, 4 bits
B: binary 123 at 2,2 indices powers decimal  # bit numbers, place values, "= 123"
B[0]: 1                            # one bit
H[0]: 0xF                          # one hex digit (or H[0]: 15)
B: 67                              # a new value
B: +1
B: V1                              # a var's or cell's value (and V1: B)
B: flip                            # every bit (binary only)
B[0..3]: flip                      # bits 0 to 3
B[4]: flip                         # one bit
B: powers clear                    # or decimal clear, indices clear
```

- `digits` (when made): binary 8 (max 32), hex 2 (max 8), denary 3 (max 10).
- Values are numbers: denary, `0x7B` (hex) or `0b1111011` (binary), any case. One that doesn't fit wraps round.
- 0s are muted; a digit given an `ink` keeps it until `ink reset`.
- No swap, insert or remove; no `decimal` on denary. Otherwise like a row.

## Code

```anim
S: code "print(\"Hi\")" lang python at 2,1   # one line
C: code [
    "total = 0",
    "for n in nums:",
    "    total += n"
] at 2,3 lang python name "sum.py" indices   # lines C[1] … C[3]
C[2]: highlight line               # highlight clear
C[1]: "total = 100"
S: "print(42)"                     # a one-line block
C: insert "print(total)" at end
C: remove 1
C: swap 1 2
C: font 0.8
C: code [ … ] at 2,3 typed         # lines type in turn
```

- Lines count from 1.
- `lang`: `python` `js` `java` `kotlin` `c` `cpp` `csharp` `sql` `css` `markup` `json` `yaml`.
- Otherwise like a column.

## Scratch

```anim
S: scratch [
    "when green flag clicked",
    "forever",
    "    turn right (15) degrees",
    "end"
] at 4,3                           # as big as its blocks
S: scratch "move (10) steps" at 4,3  # one line
S: [ "when green flag clicked" "move (10) steps" ]   # a new script
S: font 0.8
F: scratch [ … ] at 12,5 size 4x3  # fitted in the box
S[3]: highlight line               # the others dim
S[3]: "turn right (45) degrees"    # replace line 3
S: insert "move (10) steps" at 6   # before line 6, or at end; several in [ ]
S: remove 3                        # the block on line 3
S: swap 2 4
```

- [scratchblocks](https://scratchblocks.github.io) syntax.
- Lines count from 1 as written, including end, else and blank lines.
- One shape: a line `S[3]` takes only a new line or `highlight line`. No `typed`.

## Stagger

```anim
Arr: row [5 3 8 1] at 2,2 pop stagger 0.15 # cells pop in one by one
Arr: fill green stagger                    # 0.1 s apart
Arr: pulse stagger 0.1
Arr: highlight outline stagger 0.2         # one outline per cell, in turn
Arr: fill amber stagger-reverse            # last cell first
G: delete pop stagger 0.2                  # group members, in listed order
```

- Rows, columns and groups. Not on moves. Also `defaults stagger 0.1`.

## Emphasis

```anim
A: pulse
A: shake
A: wobble
A: bounce
A: glow
L: signal            # a blip along a line / curve
L: signal-reverse
```

Don't replay going back. `signal` is for lines.

## Highlights and callouts

```anim
A: highlight outline       # not lines
A: highlight inside        # not text, lines or groups
T: highlight line          # text or a code line
S[3]: highlight line       # a scratch script's line
A: highlight arrow
A: highlight glow
A: highlight number        # the next number: 1, then 2, …
A: highlight number 5      # 5 (the next bare one is 6)
Arr: highlight number      # numbers each cell / member
A: highlight spotlight     # dims everything else
A: highlight outline arrow # several
A: highlight clear
A: callout "Look!"         # above
A: callout "Look!" below   # or left-of / right-of
A: callout clear
```

## Timing and effects

```anim
A: move 4,2 speed slow     # instant vfast fast normal slow vslow, or seconds
A: fill red delay 1        # seconds
A: move 9,2 ease linear    # in-out (default) linear in out spring
A: rect at 2,3 pop         # fade (default) pop slide typed
L: arrow from A to B draw  # lines
T: text "$ ls" at 2,1 typed
A: delete pop              # exits too
A: angle +30 repeat 3      # the change 3 times in a row (the beat's other lines carry on)
C: pulse repeat forever    # until you move on
```

- Speeds: instant 0 · vfast 0.25 · fast 0.5 · **normal 1** · slow 2 · vslow 4 s.
- A first beat with an effect or `delay` plays when it comes into view.
- `repeat N`: everything on the line, each round at its `speed`. Relative changes add up; absolute ones happen in the first round. Not with via, travel, follow, attach, trail or a new value.
- `repeat forever`: only an emphasis or whole turns (`angle +360`, `about` a fixed point).

## Beat lines (no id, no colon)

```anim
defaults fill blue speed fast    # for the lines after it
defaults clear
pause                            # while playing: wait for Next
pause 2                          # while playing: hold 2 s
auto                             # go straight on to the next beat
then                             # the lines after start when those before finish
then 0.5                         # 0.5 s after that
```

- `then` splits a beat into parts that play in turn: still one beat for Next and Back. `pause` and `auto` come after the last part.

## Camera (no id, no colon)

```anim
camera move 4,3 zoom 2
camera move A zoom 3 speed slow
camera move +2,0
camera zoom +1
camera travel B C D
camera reset
```

Takes `move` `x` `y` `travel` `zoom` `reset` `speed` `delay` `ease`.

## Switching off

```anim
A: delete
G: ungroup
A: detach
A: trail clear
L: end none
L: static
L: solid
A: highlight clear
A: callout clear
defaults clear
camera reset
```
