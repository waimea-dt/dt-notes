# Animation Cheat-Sheet

`<animation>` blocks: a step-by-step animated SVG drawing with a caption per step.
Code: `anim-core.js` · `anim-parse.js` · `anim-compile.js` · `anim-render.js` · `animation.js` · CSS `_css/visualisation/animation.css` · Tests `_tests/animation.md` · VS Code highlighting `vscode/anim-syntax/`.

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
a: remove                  # remove
# a comment ("#" then a space)
m:
    rect "Long command"    # indented more = same command
    at 4,5
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
| font | `font 1.5` · `bold` · `monospace` |
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
a: follow l                   # along line / curve l
a: follow-reverse l           # from its end
```

## Copy, attach, group

```anim
k2: copy key move 8,1          # copy, then move off
lock: attach right-of msg      # rides beside msg
lock: attach msg               # on top of msg
lock: detach
pkt: group msg lock            # acts as one
pkt: ungroup
```

- Moving an attached shape detaches it. Moving a group member keeps it in the group.
- A look change on a group (`fill`, `stroke` …) goes to its members.
- Removing a group removes its members.

## Rows and columns

```anim
arr: row [5 3 8 1] at 3,4          # cells arr.0 … arr.3
col: column ["A" "B" "C"] at 12,2 gap 0.2
arr: swap 0 3                      # two cells change places
arr.2: fill amber                  # one cell
arr: fill green                    # every cell
```

- Values go in `[ ]`: numbers or `"quoted"`, commas optional (`[5, 3, 8]`).
- `size` and `gap` (default 0), plus fill, stroke, font and the other looks, apply to every cell.
- `at` places the first cell. `below b` etc. place the whole row.
- After a swap, ids stay with the places: what's attached to `arr.0` stays put. Highlights move with the cell.

## Stagger

```anim
arr: row [5 3 8 1] at 2,2 pop stagger 0.15 # cells pop in one by one
arr: fill green stagger                    # 0.1 s apart
arr: pulse stagger 0.1
arr: highlight outline stagger 0.2         # one outline per cell, in turn
arr: fill amber stagger-reverse            # last cell first
g: remove pop stagger 0.2                  # group members, in listed order
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
a: remove pop              # exits too
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
a: remove
g: ungroup
a: detach
l: static
l: solid
a: highlight clear
a: callout clear
defaults clear
camera reset
```
