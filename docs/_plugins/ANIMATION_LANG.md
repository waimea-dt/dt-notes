# Animation Cheat-Sheet

`<animation>` blocks: a step-by-step animated SVG drawing with a caption per step.

## Block

````markdown
<animation grid="16x9">

# Title (fixed)

Caption for step 1.

```anim
a: rect "A" at 2,3
```

---

## Step 2 heading

```anim
a: move 5,3
```

+++

More caption, shown with this beat.

```anim
a: fill green
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

**Keys:** → `N` `Space` next · ← `P` `Shift+Space` back · `Home` `End` · `A` play · `F` full screen · `S` notes · `?` help · `Esc`

## Grid

- Cells from 1, top-left. `at 3,2` = centre of column 3, row 2. Fractions OK.
- Points `5,4`, sizes `2x1`, all in cells.
- A point can be a shape (`a`: its centre) or a point on its edge: `a.top` `a.bottom` `a.left` `a.right` `a.top-left` `a.top-right` `a.bottom-left` `a.bottom-right`.

## Lines

```anim
a: rect "A" at 2,3         # create: id: type "label" properties
a: move 5,3 fill red       # change
a: delete                  # delete
# a comment ("#" then a space)
m:
    rect "Long command"    # indented more = same command
    at 4,5
r: row [
    5,
    3
] at 2,2                   # a line starting "]" too
```

- Ids: letters, digits, `_ - .`, starting with a letter. Not a keyword.
- One quoted label per line. Properties in any order.
- A type on an existing id replaces the shape.
- Bad lines are skipped and listed under the animation.

## Shapes

| Type | Example | Default |
|---|---|---|
| `rect` | `a: rect "A" at 2,3 size 2x1 corner 0.1` | 1×1 |
| `circle` | `c: circle "C" at 4,3 radius 0.8` · `e: circle at 4,3 size 3x1.5` (an ellipse) | radius 0.5 |
| `diamond` | `d: diamond "x > 3?" at 4,3 size 3x1.5` | 1×1 |
| `polygon` | `p: polygon [0,-1 1,1 -1,1] at 5,4 "P"` (points from `at`, in cells) · `p: [0,-1 1,0 0,1 -1,0]` (new points) | its points' size |
| `text` | `t: text "Hi" at 7,1 align left` | |
| `line` / `arrow` | `l: arrow from a to 9,3 "label"` · `l: line from a to b start bar end crow` · `l: line from 2,5 via 6,5 via 6,6 to 10,6 corner 0.3` | |
| `curve` | `c: curve from a to b via 5,1 via 7,3` · `c: curve from a to b bend 0.5` · `c: curve from a to a angle right` (a loop) | loop: up, 1×1 |
| `image(path)` | `p: image(../_assets/x.svg) "Alt" at 3,4 size 2` | 1×1 |
| `icon(name)` | `i: icon(laptop) "Laptop" at 10,2` | 1×1, Lucide |
| `scratch` | `s: scratch "move (10) steps" at 4,3` | its blocks' size (see Scratch) |

- Ends: `start` / `end`, each `none` `arrow` `dot` `crow` `bar` (`l: end dot`). An `arrow` is a line with `end arrow`.
- Labels take `<sup>` `<sub>` `<b>` `<i>`, one at a time: `t: text "x<sup>2</sup> is <b>big</b>" at 3,1`.
- Via: a corner on a line, a turn on a curve. A signed via is relative to the point before.
- Bend: bows a curve to its left (`bend -0.5`: right). Replaces any via points.
- Loop: `angle` is the way it faces, `size 1.2x0.6` how wide and how far out.
- Image paths work like `![](…)`.

## Properties

| Property | Syntax |
|---|---|
| position | `at 3,2` · `at b` · `x 3` · `y 2` (`move` / `goto` = `at`) |
| placement | `below b` · `above b` · `left-of b` · `right-of b` · `gap 1` |
| line ends | `from 2,3 to b` (an end on a shape follows it) · `from a.right to b.left` · `start dot` · `end arrow` |
| size | `size 2x1` · `size 2` (circle: diameter) · `width 3` · `height 0.5` |
| radius / corner | `radius 0.5` (circle: both ways) · `corner 0.2` (rect; line, arrow: rounds its corners) |
| colour | `fill blue` · `stroke #f80` · `colour amber` (text and labels) · `fill rgb(255 128 0)` |
| weight | `weight 2` (× normal, `0` hides) |
| opacity | `opacity 0.5` (`0` hidden … `1` solid) |
| line style | `solid` · `dashed` · `dotted` |
| show | `show 0.5` (lines: how much, from the start, as if drawn that far) |
| flow | `flow` · `flow-reverse` · `static` (dashed / dotted only) |
| angle / scale | `angle 45` (clockwise, 0 = right) · `angle up` (`right` `down` `left` `up`) · `scale 1.5` (not lines) |
| font | `font 1.5` · `bold` · `regular` (not bold) · `mono` |
| align | `align left` · `centre` · `right` (text) |
| layer | `back` · `normal` · `front` |
| image fit | `contain` · `cover` (cropped) |

**Colours:** `red orange amber yellow green teal cyan blue purple pink magenta theme muted fg bg bg-shape black white none` · `#hex`

`bg`: the backdrop · `bg-shape`: a shape's default fill.

**Variants** of `red` … `theme`: `-bright` (`red-bright`) · `-muted` (`blue-muted`).

`colour contrast`: black or white text, whichever reads on what's behind it (on a bar, each part).

## Relative values

A signed number on a change is relative.

```anim
a: move +2,-1        # 2 right, 1 up
a: move +2,3         # 2 right, to row 3
a: width +1          # 1 cell wider
a: size +1           # 1 cell bigger each way
a: angle +90         # a further quarter turn
```

## Resetting looks

```anim
a: fill reset        # back as it started
a: style reset       # every look
```

- `reset` goes after `fill` `stroke` `colour` `weight` `font` `bold` `mono` `corner` `opacity`.

## Moving lines

```anim
l: to 6,5            # one end
l: from a to 9,9     # both ends
l: move +1,+0        # the whole line
c: via 6,1           # a curve's bends, a line's corners
```

## Movement

```anim
a: move 9,3 via 5,1           # an arc through a point
a: move 9,3 via 3,1 via 6,5   # a wave through several
a: travel r1 r2 4,3           # hop by hop (speed per hop)
a: follow l                   # along line / curve l
a: follow-reverse l           # from its end
a: angle +90 about 5,5        # round a point, turning with it
a: angle +90 about b          # round b's centre
a: angle +90 about +0,+1      # signed: from its own centre
hand: angle 210 about hub     # a line: its free ends go round
car: angle +180 about 9,6     # a group, as one
```

- `about` goes with an angle. An absolute angle turns from as drawn.
- Not on rows, columns, grids or tables, or a line with both ends on shapes.

## Trails

```anim
a: trail                      # a line where it goes from now on
a: move 9,3 trail             # from where the move starts
a.trail: stroke red solid     # dashed and muted unless styled
a: trail clear
```

- Follows the real path: via, travel, follow, about and a swap's bow. Stays until `trail clear`.
- A cell's trail goes with the cell through swaps, inserts and removes.

## Copy, attach, group

```anim
k2: copy key move 8,1          # copy, then move off
lock: attach right-of msg      # rides beside msg
lock: attach msg               # on top of msg
lock: attach msg.top-right     # on its corner
lock: detach
pkt: group [msg lock]          # acts as one
pkt: ungroup
```

- Moving an attached shape detaches it.
- A look or delete on a group goes to its members.

## Rows and columns

```anim
arr: row [5 3 8 1] at 3,4          # cells arr.0 … arr.3
col: column ["A" "B" "C"] at 12,2 gap 0.2
mem: row 8 at 2,6                  # 8 empty cells
arr: swap 0 3                      # two cells change places
arr: swap 0 end                    # end: the last cell
arr: insert 7 at 3
arr: insert 8 at end
arr: remove 2
arr: remove end
arr.2: fill amber                  # one cell
arr: range 0 2 fill amber          # cells 0 to 2 (a look, highlight, emphasis or callout)
arr: range 3 end bold              # cell 3 to the last
arr: fill green                    # every cell
arr: delete                        # the whole row
```

- Values in `[ ]`: numbers, `"quoted"` or `null`, commas optional.
- `size`, `gap` and looks apply to every cell. Cell size is set when it's made.
- `at` places the first cell by its top-left. `below b` etc. place the whole row.
- Ids stay with the places: after an edit, `arr.2` is whichever cell is now third.
- Cells hold values like a var: `arr.2: 7`.
- `swap` `insert` `remove` take `speed`, `delay` and `ease`.

## Spans

```anim
sorted: span arr 0 2 name "sorted"     # a box round places 0 to 2
sorted: highlight outline
win: span arr 3 5 fill amber
win: span arr 2 4                      # move it
tail: span arr 3 end                   # place 3 to the last
sorted: delete
```

- For rows, columns, code blocks, grids and tables. Invisible unless given a `fill` or `stroke`.
- Takes highlights, a callout and a `name`.

## Grids and tables

```anim
g: grid [
    [1, 2, 3, 4],
    [5, 6, 7, 8]
] at 2,2                           # cells g.0.0 … g.1.3 (row.column)
t: table [
    ["A", "B", "C"],               # the headings
    [1, 2, 3],
    [4, 5, 6]
] at 8,2
e: grid 4x3 at 2,6                 # empty: 4 across, 3 down
g.1: fill amber                    # row 1
g.col.2: highlight outline         # column 2
g.1.2: 7                           # a cell
t.head: fill blue                  # the headings (t.head.0 …)
t.0: bold                          # the first row after them
t.col.1: fill green                # a column, its heading too
g: range 0.1 1.2 fill teal         # a block, corner to corner
s: span g 0.0 1.end                # rows 0 and 1 (end: the last)
s2: span t head.0 end.0            # a table's column 0, heading too
g.1: range 0 2 fill green          # within a row
s3: span g.col.2 0 1
g: indices                         # rows down the left, columns along the bottom
g: swap 0 1                        # rows
g: swap col 1 end                  # columns
g: swap 1.2 0.0                    # cells
g: insert [9 9 9 9] at 1           # a row
t: insert col ["D" 7 8] at end     # a column, its heading first
g: remove 0
g: remove col end
```

- Rows and columns count from 0. A table's `t.0` is the first row after its headings.
- A place is `row.column`: a number or `end` (a table's row can be `head`).
- `size`, `gap`, looks, `name` and `indices` go on the whole grid.
- A row or column takes looks, highlights, emphasis, callouts, `stagger`, `range`, `span` and a `name`.
- Ids stay with the places, as in a row.

## Numbers

```anim
b: binary 123 at 2,2               # 8 bits, b.0 (rightmost) … b.7
h: hex 123 at 2,2                  # 2 digits, 0-9 then A-F
d: denary 123 at 2,2               # 3 digits
n: binary v1 at 2,4 digits 4       # a var's value, 4 bits
b: binary 123 at 2,2 indices powers decimal  # bit numbers, place values, "= 123"
b.0: 1                             # one bit
h.0: F                             # one hex digit
b: 67                              # a new value
b: +1
b: v1                              # a var's or cell's value (and v1: b)
b: flip                            # every bit (binary only)
b: flip 0 3                        # bits 0 to 3
b.4: flip                          # one bit
b: powers clear                    # or decimal clear, indices clear
```

- `at` places the leftmost digit. `digits` (when made): binary 8 (max 32), hex 2 (max 8), denary 3 (max 10).
- Values are written in denary. One that doesn't fit wraps round.
- 0s are muted; a digit given a `colour` keeps it until `colour reset`.
- No swap, insert or remove; no `decimal` on denary. Otherwise like a row.

## Variables

```anim
v1: var 67 at 5,3
v2: var "Dog" at 5,5
v3: var null at 8,3
v1: 123                            # a new value
v1: +1                             # relative ("+1" is text)
v2: "Cat"
v1: null
```

- A var is a rect: size, fill and the other looks work.

## Bars

```anim
arr: row [5 3 8 1 9] at 2,6 bar stroke none fill pink size 0.5x3 gap 0.1
hp: var 67 name "health" at 2,1 size 5x0.5 bar fill green track red
hp: 30
hp: max 200                        # a full bar's value
arr: bar clear                     # plain boxes again
done: var 25 at 3,2 size 2 ring fill teal track muted
left: var 60 at 7,2 size 2 pie fill purple track muted
done: ring clear
```

- For vars and cells. `fill` is the bar, `track` the rest (default `none`).
- `max`: 100, or a row's / column's biggest value.
- `bar` fills up a tall box, across a wide one. Its value goes in the middle with a track, otherwise at the end.
- `ring` and `pie` are round: one `size`, no `width` / `height`. A box that isn't square is made square.

## Colours from values

```anim
sw: rect at 8,3 fill rgb(r g b)    # red, green, blue (0-255): follows vars r, g, b
sw: stroke rgb(arr.0, 255, n)      # cells, numbers (binary, hex, denary) and plain numbers
r: 200                             # sw changes with r
r: binary 0 at 2,2 fill rgb(r 0 0) # a number following its own value
sw: fill red                       # stops following
```

- For `fill`, `stroke`, `colour` and `track`. Values outside 0-255 are held in range.

## Sums

```anim
c: a + b * 2                       # worked out once, as in code
arr.3: arr.0 mod 4                 # + - * / mod, spaces round each
b: v1 * 2                          # a number's value too
```

## Values in labels

```anim
t: text "{n} × {s} = {n * s}" at 8,2   # kept up to date
t: text "{1, 2, 3}" at 8,3             # not a sum: shows as written
```

- Not in values, code or Scratch.

## Following values

```anim
dot: circle y 4 x px               # x follows px (in cells)
hand: rect at 9,4 angle {turn * 3} # a sum in { }
hand: angle 0                      # a number again: stops following
w: var 2 at 2,2 width w height 1   # its own value
```

- For `x` `y` `width` `height` `radius` `corner` `weight` `font` `angle` `scale` `opacity` `show`.

## Counting

```anim
score: 25 counter                  # counts its way there
b: 11 counter                      # a number's digits too
defaults counter
```

- A label's `{ }` that follows a counting value counts along with it, as does a number's `decimal`.

## Moving values

```anim
v1: a.1                            # a copy of a.1's value moves onto v1
a.2: v2                            # vars and cells both ways
a: insert v1 at 3
a: insert v2 at end
a: remove end into v2
a: remove 1 into v1
```

- Values are copied. Takes `speed`, `delay` and `ease`.
- `keep-style` (or `defaults keep-style`): the value takes its fill, stroke and colour with it.

## Names and indices

```anim
v1: var 0 at 5,3 name "total"
arr: row [5 3 8] at 3,4 name "arr" indices
v1: name "sum" above               # rename, or another side
v1: name clear
arr: indices                       # or numbered
arr: indices clear
```

- For vars, rows, columns, grids and tables.
- Text shapes you can style: `v1.name`, `arr.index.0`, `g.index.1`, `g.index.col.2` (e.g. `arr.name: bold`).

## Code

```anim
s: code "print(\"Hi\")" lang python at 2,1   # one line
c: code [
    "total = 0",
    "for n in nums:",
    "    total += n"
] at 2,3 lang python name "sum.py" numbered  # lines c.1 … c.3
c.2: highlight line                # highlight clear
c.1: "total = 100"
s: "print(42)"                     # a one-line block
c: insert "print(total)" at end
c: remove 1
c: swap 1 2
c: font 0.8
c: code [ … ] at 2,3 typed         # lines type in turn
```

- Lines count from 1. `at` is the left edge.
- `lang`: `python` `js` `java` `kotlin` `c` `cpp` `csharp` `sql` `css` `markup` `json` `yaml`.
- Otherwise like a column.

## Scratch

```anim
s: scratch [
    "when green flag clicked",
    "forever",
    "    turn right (15) degrees",
    "end"
] at 4,3                           # as big as its blocks
s: scratch "move (10) steps" at 4,3  # one line
s: [ "when green flag clicked" "move (10) steps" ]   # a new script
s: font 0.8
f: scratch [ … ] at 12,5 size 4x3  # fitted in the box
s: highlight line 3                # the others dim
s: line 3 "turn right (45) degrees"  # replace line 3
s: insert "move (10) steps" at 6   # before line 6, or at end; several in [ ]
s: remove 3                        # the block on line 3
s: swap 2 4
```

- [scratchblocks](https://scratchblocks.github.io) syntax. `at` is the top-left.
- Lines count from 1 as written, including end, else and blank lines.
- One shape: no line ids or `typed`.

## Stagger

```anim
arr: row [5 3 8 1] at 2,2 pop stagger 0.15 # cells pop in one by one
arr: fill green stagger                    # 0.1 s apart
arr: pulse stagger 0.1
arr: highlight outline stagger 0.2         # one outline per cell, in turn
arr: fill amber stagger-reverse            # last cell first
g: delete pop stagger 0.2                  # group members, in listed order
```

- Rows, columns and groups. Not on moves. Also `defaults stagger 0.1`.

## Emphasis

```anim
a: pulse
a: shake
a: wobble            # or wiggle
a: bounce
a: glow
l: signal            # a blip along a line / curve
l: signal-reverse
```

Don't replay going back. `signal` is for lines.

## Highlights and callouts

```anim
a: highlight outline       # not lines
a: highlight inside        # not text, lines or groups
t: highlight line          # text or a code line
s: highlight line 3        # a scratch script's line
a: highlight arrow
a: highlight glow
a: highlight number        # the next number: 1, then 2, …
a: highlight number 5      # 5 (the next bare one is 6)
arr: highlight number      # numbers each cell / member
a: highlight spotlight     # dims everything else
a: highlight outline arrow # several
a: highlight clear
a: callout "Look!"         # above
a: callout "Look!" below   # or left-of / right-of
a: callout clear
```

## Timing and effects

```anim
a: move 4,2 speed slow     # instant vfast fast normal slow vslow, or seconds
a: fill red delay 1        # seconds
a: move 9,2 ease linear    # in-out (default) linear in out spring
a: rect at 2,3 pop         # fade (default) pop slide typed
l: arrow from a to b draw  # lines
t: text "$ ls" at 2,1 typed
a: delete pop              # exits too
```

- Speeds: instant 0 · vfast 0.25 · fast 0.5 · **normal 1** · slow 2 · vslow 4 s.
- A first beat with an effect or `delay` plays when it comes into view.

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
camera at 4,3 zoom 2
camera at a zoom 3 speed slow
camera move +2,0
camera zoom +1
camera travel b c d
camera reset
```

Takes `at` `x` `y` `travel` `zoom` `reset` `speed` `delay` `ease`.

## Switching off

```anim
a: delete
g: ungroup
a: detach
a: trail clear
l: end none
l: static
l: solid
a: highlight clear
a: callout clear
defaults clear
camera reset
```
