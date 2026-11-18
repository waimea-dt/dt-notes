# Animation Cheat-Sheet

`<animation>` blocks: a step-by-step animated SVG drawing with a caption per step.
Code: `anim-core.js` · `anim-parse.js` · `anim-compile.js` · `anim-render.js` · `animation.js` · CSS `_css/visualisation/animation.css` · Tests `_tests/animation.md` · VS Code highlighting `vscode/dt-notes-syntax/`.

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
| `autoplay` | off | Plays when on screen |
| `loop` / `loop-bounce` | off | Restart / play back to the start |
| `hold="s"` | `1.5` | Wait between beats while playing |
| `controls="none"` | shown | Hide buttons and progress bar |

**Keys:** → `N` `Space` next · ← `P` `Shift+Space` back · `Home` `End` · `A` play · `F` full screen · `S` notes · `?` help · `Esc`

## Grid

- Cells from 1, top-left. `at 3,2` = centre of column 3, row 2. Fractions OK.
- Points `5,4`, sizes `2x1`, all in cells.

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
]                          # a line starting "]" too
```

- Ids: letters, digits, `_ - .`, starting with a letter. Not a keyword.
- One quoted label per line. Properties in any order.
- A type on an existing id replaces the shape.
- Bad lines are skipped and listed under the animation.

## Shapes

| Type | Example | Default |
|---|---|---|
| `rect` | `a: rect "A" at 2,3 size 2x1 corner 0.1` | 1×1 |
| `circle` | `c: circle "C" at 4,3 radius 0.8` | radius 0.5 |
| `diamond` | `d: diamond "x > 3?" at 4,3 size 3x1.5` | 1×1 |
| `text` | `t: text "Hi" at 7,1 align left` | |
| `line` / `arrow` | `l: arrow from a to 9,3 "label"` | |
| `curve` | `c: curve from a to b via 5,1 via 7,3` | |
| `image(path)` | `p: image(../_assets/x.svg) "Alt" at 3,4 size 2` | 1×1 |
| `icon(name)` | `i: icon(laptop) "Laptop" at 10,2` | 1×1, Lucide |

- Labels: centred; halfway along a line; under an image / icon.
- Arrowhead: `l: line from a to b arrow`, or `l: arrow` on an existing line. Put it before any `highlight`.
- Curve: a `via` on a shape follows it; a signed via is relative to the point before. `c: via 6,1` re-bends it.
- Image paths work like `![](…)`.

## Properties

| Property | Syntax |
|---|---|
| position | `at 3,2` · `at b` · `x 3` · `y 2` (`move` / `goto` = `at`) |
| placement | `below b` · `above b` · `left-of b` · `right-of b` · `gap 1` |
| line ends | `from 2,3 to b` (an end on a shape follows it) |
| size | `size 2x1` · `size 2` (circle: diameter) · `width 3` · `height 0.5` |
| radius / corner | `radius 0.5` (circle) · `corner 0.2` (rect) |
| colour | `fill blue` · `stroke #f80` · `colour amber` (text and labels) |
| weight | `weight 2` (× normal, `0` hides) |
| line style | `solid` · `dashed` · `dotted` |
| flow | `flow` · `flow-reverse` · `static` (dashed / dotted only) |
| angle / scale | `angle 45` (clockwise) · `scale 1.5` (not lines) |
| font | `font 1.5` · `bold` · `mono` |
| align | `align left` · `centre` · `right` (text) |
| layer | `back` · `normal` · `front` |

**Colours:** `red orange amber yellow green teal cyan blue purple pink magenta theme muted fg bg black white none` · `#hex`

## Relative values

A signed number on a change is relative. When creating, everything is absolute.

```anim
a: move +2,-1        # 2 right, 1 up
a: move +2,3         # 2 right, to row 3
a: width +1          # 1 cell wider
a: size +1           # 1 cell bigger each way
a: angle +90         # a further quarter turn
```

## Moving lines

```anim
l: to 6,5            # one end
l: from a to 9,9     # both ends
l: move +1,+0        # the whole line
c: via 6,1           # a curve's bend
```

## Movement

```anim
a: move 9,3 via 5,1           # an arc through a point
a: move 9,3 via 3,1 via 6,5   # a wave through several
a: travel r1 r2 4,3           # hop by hop (speed per hop)
a: follow l                   # along line / curve l, ending on the shape at its end
a: follow-reverse l           # from its end
```

## Copy, attach, group

```anim
k2: copy key move 8,1          # copy, then move off
lock: attach right-of msg      # rides beside msg
lock: attach msg               # on top of msg
lock: detach
pkt: group [msg lock]          # acts as one
pkt: ungroup
```

- Moving an attached shape detaches it. Moving a group member keeps it in the group.
- A look change on a group (`fill`, `stroke` …) goes to its members.
- Deleting a group deletes its members.

## Rows and columns

```anim
arr: row [5 3 8 1] at 3,4          # cells arr.0 … arr.3
col: column ["A" "B" "C"] at 12,2 gap 0.2
mem: row 8 at 2,6                  # 8 empty cells
arr: swap 0 3                      # two cells change places
arr: insert 7 at 3                 # a space opens, 7 slides in
arr: insert 8 at end               # onto the end
arr: remove 2                      # slides out, the rest close up
arr: remove end                    # off the end
arr.2: fill amber                  # one cell
arr: fill green                    # every cell
arr: delete                        # the whole row
```

- Values go in `[ ]`: numbers or `"quoted"`, commas optional (`[5, 3, 8]`). A bare whole number makes that many empty cells.
- `size` and `gap` (default 0), plus fill, stroke, font and the other looks, apply to every cell.
- `at` places the first cell. `below b` etc. place the whole row.
- After a swap, insert or remove, ids stay with the places: what's attached to `arr.0` stays put, and `arr.2` is whichever cell is now third. Highlights move with the cell.
- Cells come and go below a row, left of a column. New cells take the row's look (as changed by `arr: fill …`). `insert … at` goes from 0 to the length, or `end`. A row can be emptied and inserted into again.
- A muted outline (a slot) shows the space while it plays: left behind as a cell goes, closing as the rest close up; or opening as cells move aside, for the new one to land in. At the end, one opens or closes on the end.
- Cells hold values like a var: `arr.2: 7`, `arr.2: "x"`, `arr.2: null`, and `null` in `[ ]`.
- `swap` `insert` `remove` take `speed`, `delay` and `ease`. Insert and remove are two moves in turn (out then close up, or open up then in), so they take about 1.6 × the speed.

## Variables

```anim
v1: var 67 at 5,3                  # a box holding a value
v2: var "Dog" at 5,5
v3: var null at 8,3                # null shows muted, in italics
v1: 123                            # a new value
v2: "Cat"
v1: null
```

- A var is a rect (size, fill and the rest work), whose value goes straight after `var`.

## Moving values

```anim
v1: a.1                            # a copy of a.1 glides onto v1, which takes its value
a.2: v2                            # and back: vars and cells both ways
a: insert v1 at 3                  # a copy of v1 glides to the opening slot and slides in
a: insert v2 at end
a: remove end into v2              # the last cell glides onto v2, the slot closes
a: remove 1 into v1                # from the middle: the rest close up
```

- Values are copied: v1 keeps its own, and changing it later doesn't change the cell.
- The copy's look turns into the target's on the way: the value moves, the box keeps its look. It takes the line's `speed`, `delay` and `ease`.
- `keep-style` (on any of these, or `defaults keep-style`): the value takes its fill, stroke and colour with it, to track it (`a: insert v1 at 3 keep-style`). Not its size or highlights. `a: fill …` resets a row.

## Names and indices

```anim
v1: var 0 at 5,3 name "total"      # left of a var or row, above a column
arr: row [5 3 8] at 3,4 name "arr" indices
v1: name "sum" above               # rename, or another side
v1: name clear
arr: indices                       # show them (or numbered); indices clear hides them
```

- For vars, rows and columns. Both are text shapes that move with their owner and go when it's deleted: `v1.name`, `arr.index.0` … (style them like any shape, e.g. `arr.name: bold`).
- `highlight outline` goes round the whole thing, name and indices too (to pick out the data, highlight cells or change colours).
- Indices (small, muted) sit below a row's cells, left of a column's. They stay with the places through a swap, and the last one comes and goes with insert and remove.

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

- Lines count from 1. Leading spaces are kept. `at` is the left edge.
- `lang`: `python` `js` `java` `kotlin` `c` `cpp` `csharp` `sql` `css` `markup` `json` `yaml` (none: plain).
- Otherwise like a column.

## Stagger

```anim
arr: row [5 3 8 1] at 2,2 pop stagger 0.15 # cells pop in one by one
arr: fill green stagger                    # 0.1 s apart
arr: pulse stagger 0.1
arr: highlight outline stagger 0.2         # one outline per cell, in turn
arr: fill amber stagger-reverse            # last cell first
g: delete pop stagger 0.2                  # group members, in listed order
```

- Rows, columns and groups. Order: cell number / the order in `group`.
- After any `delay`. Not on moves (the members move together). Also `defaults stagger 0.1`.

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

One-off; they don't replay going back. `signal` is for lines (on a group: each of its lines).

## Highlights and callouts

```anim
a: highlight outline       # follows the shape, just outside it (not lines)
a: highlight inside        # just inside its stroke (not text, lines or groups)
t: highlight line          # a band behind a text or a code line (c.2)
a: highlight arrow
a: highlight glow
a: highlight number        # the next number: 1, then 2, …
a: highlight number 5      # 5 (the next bare one is 6)
arr: highlight number      # a row / column / group: numbers each of its shapes in turn
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
- Intro: a first beat with `pop`, `slide`, `draw`, `typed` or `delay` plays in when the animation comes into view.

## Beat lines (no id, no colon)

```anim
defaults fill blue speed fast    # for the lines after it
defaults clear
pause                            # while playing: wait for Next
pause 2                          # while playing: hold 2 s
auto                             # go straight on to the next beat
```

## Camera (no id, no colon)

```anim
camera at 4,3 zoom 2
camera at a zoom 3 speed slow
camera move +2,0
camera zoom +1
camera travel b c d
camera reset
```

Takes `at` `x` `y` `travel` `zoom` `reset` `speed` `delay` `ease`. Stays until changed.

## Switching off

```anim
a: delete
g: ungroup
a: detach
l: static
l: solid
a: highlight clear
a: callout clear
defaults clear
camera reset
```
