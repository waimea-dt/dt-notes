# Animation Cheat-Sheet

`<animation>` blocks: a step-by-step animated SVG drawing with a caption per step.
Plugin `animation.js` (widget and playback) with `anim-core.js` (constants, keywords, geometry), `anim-parse.js`, `anim-compile.js` and `anim-render.js` · CSS `_css/visualisation/animation.css` · examples `_tests/animation.md` · VS Code highlighting: `vscode/anim-syntax/` in the repo root (see its README).

## Block

````markdown
<animation grid="16x9" autoplay loop>

# Title (fixed for the whole animation)

Caption for step 1 (any Markdown).

```anim
a: rect "A" at 2,3
```

---

## Step 2 heading

```anim
a: move 5,3
```

+++

Caption text added when this beat plays.

```anim
a: fill green
```

Note:
Teacher notes (to the end of the step; S shows them).

</animation>
````

| Marker | Meaning |
|---|---|
| `---` | New step |
| `+++` | New beat within a step (caption and scene split together) |
| ` ```anim ` | Scene lines for the step / beat (optional) |
| `Note:` | Teacher notes for the step |

Markers must be alone on their line. Everything in one beat plays at the same time.

| Tag attribute | Default | |
|---|---|---|
| `grid="CxR"` | `16x9` | Grid size; `grid="fit"` fits the content |
| `debug` | off | Grid numbers, shape ids, warnings |
| `autoplay` | off | Plays once on screen, after any intro (not for reduced motion; stops for good when someone navigates) |
| `loop` / `loop-bounce` | off | At the end: jump to the start / play backwards to the start |
| `hold="s"` | `1.5` | Wait between beats while playing |
| `controls="none"` | shown | Hide buttons and progress bar (keys still work) |

**Keys** (click the animation first): → `N` `Space` next · ← `P` `Shift+Space` back · `Home` / `End` · `A` play/pause · `F` full screen · `S` notes · `?` shortcuts · `Esc`.

## Grid

- Cells numbered from 1, top-left, y down. `at 3,2` = centre of column 3, row 2. Fractions OK.
- Sizes are in cells. One cell = 80px at full width (same size as a slide).
- Points use a comma (`at 5,4`), sizes an `x` (`size 2x1`). Spaces also work.

## Lines

```anim
a: rect "A" at 2,3          # create: id, type, label, properties
a: move 5,3 fill red        # change an existing shape
a: remove                   # remove (optionally with an effect and speed)
# a comment line
```

A long command can be laid out one property per line: a line indented more than the line that started the command continues it.

```anim
m1:
    rect "Hello + options"
    at 4.5,5.5
    size 3x0.8
    fill blue      # comments and blank lines are fine inside
    pop
```

- `#` followed by a space starts a comment, on its own line or after a command (`#f80` is still a colour).
- Properties go in any order. One quoted string per command = the label.
- A type word on an existing id replaces the shape (`debug` warns), except `l: arrow` on a line or curve with no `from` / `to`, which adds a head.
- Ids: letters, digits, `_ - .`, starting with a letter. Keywords can't be ids.
- Bad lines show an inline error (step + line) and are skipped.

## Shapes

| Type | Example | Default size |
|---|---|---|
| `rect` | `a: rect "A" at 2,3 size 2x1 corner 0.1` | 1×1 |
| `circle` | `c: circle "C" at 4,3 radius 0.8` | radius 0.5 |
| `diamond` | `d: diamond "x > 3?" at 4,3 size 3x1.5` | 1×1 |
| `text` | `t: text "Hi" at 7,1 align left colour blue` | — |
| `line` / `arrow` | `l: arrow from a to 9,3 "yes"` | — |
| `curve` | `c: curve from a to b via 5,1 via 7,3` | A smooth curve through its via points |
| `image(path)` | `p: image(../_assets/x.svg) at 3,4 size 2 "Alt"` | 1×1, fits inside, keeps proportions |
| `icon(name)` | `i: icon(laptop) at 10,2` | 1×1, a Lucide icon |

- Labels: centred in rect / circle, halfway along a line or curve, under an image / icon (also its alt text).
- `arrow` after a line or curve's other properties gives it a head: `l: line from a to b arrow` draws the same as `l: arrow from a to b`. On an existing line, `l: arrow` adds one (it fades in). Straight after the id with `from` / `to`, `arrow` is the arrow shape. After `highlight` it's the highlight arrow, so put a head before any highlight: `l: line from a to b arrow highlight box`. A head can't be taken off (recreate the line without one).
- A curve bends through its `via` points with the same smooth path as `move … via`. A via on a shape follows it; `above b` etc. is fixed where it is then; a signed via is relative to the point before. `c: via 6,1` on an existing curve replaces its vias (they blend when the count stays the same). `follow` goes along the curve.
- Image paths resolve like `![](…)` on the same page.

## Properties

| Property | Syntax | Notes |
|---|---|---|
| position | `at 3,2` · `at b` · `at below b` | `move` / `goto` = `at`. Also `x 3`, `y 2` |
| placement | `below b` · `above` · `left-of` · `right-of` | Next to b's edge, once (doesn't follow). `gap 1` |
| line ends | `from 2,3 to b` | An end on a shape follows it (stops at its edge) |
| size | `size 2x1` · `size 2` | Circle: `size` = diameter |
| width / height | `width 3` · `height 0.5` | Rect, image, icon |
| radius | `radius 0.5` | Circles |
| corner | `corner 0.2` | Rect corner radius, in cells (up to half the shorter side: a pill) |
| fill / stroke | `fill blue` · `stroke #f80` · `none` | See colours. No `stroke` on text |
| colour | `colour amber` | A text shape's colour, or any shape's label |
| weight | `weight 2` | Stroke thickness × normal; `0` hides it |
| line style | `solid` · `dashed` · `dotted` | Dashed 4w:4w, dotted 1w:1.5w. Changes cross-fade |
| flow | `flow` · `flow-reverse` · `static` | Dashes march along at a steady 2 cells/s (dashed / dotted only). Changing direction or stopping carries on from where the dashes are |
| angle | `angle 45` | Degrees clockwise, 0 = upright. Not lines |
| scale | `scale 1.5` | About the centre. Not lines |
| font | `font 1.5` · `bold` · `monospace` | × normal size. `monospace`: the site's code font |
| arrowhead | `arrow` | Lines and curves (see Shapes) |
| align | `align left` · `centre` · `right` | Text only |
| layer | `back` · `normal` · `front` | Within a layer: creation order |

**Colours:** `red orange amber yellow green teal cyan blue purple pink magenta theme muted fg bg black white none` or `#hex`. Defaults: rect/circle fill `bg` stroke `fg`; everything else `fg`; text and labels `colour fg`. Fills of named colours are tinted; strokes and `colour` are full strength.

## Relative values

On a change, a signed number is relative; unsigned is absolute. When creating, everything is absolute.

```anim
a: move +2,-1        # 2 right, 1 up
a: move +2,3         # 2 right, to row 3
a: x +3              # 3 right
a: width +1          # 1 cell wider
a: size +1           # 1 cell bigger each way
a: angle +90         # a further quarter turn
```

- Watch out: `size +1x0` is an error (use `width` / `height`). A signed `move` on a change is always relative, so to start off-screen, create the shape there.
- One line can't set the same axis twice (`move 1,3 x 4`).

## Moving lines

```anim
l: to 6,5            # move one end
l: to +1,+0          # one end, relatively
l: from a to 9,9     # both ends
l: move +1,+0        # shift the whole line
c: via 6,1           # a curve's bend (replaces its via points)
```

No `at`, `x`, `y`, angle, scale or absolute `move` on a line or curve. Shifting a curve moves its free via points too (vias on shapes stay on them).

## Movement

```anim
a: move 9,3 via 5,1              # curve through a point (a circular arc)
a: move 9,3 via 3,1 via 6,5      # more points: smooth, sine-like
a: travel r1 r2 4,3 srv          # straight hops through shapes / points
a: follow l                      # along line or curve l, from its start
a: follow-reverse l              # along line or curve l, from its end
```

- `via` / `travel` / `follow` move an existing shape (not when creating, not on lines). On a curve, `via` is its bend instead (see Shapes).
- Signed `via` points are relative to the start; signed `travel` stops to the stop before.
- `travel` eases hop by hop, each hop taking `speed` (4 stops = 4 × speed). `via` and `follow` are one ease.

## Copies, attachments, groups

```anim
k2: copy key move 8,1 via 5,0.5        # the copy starts on the original and moves off
lock: icon(lock) attach right-of msg   # rides beside msg wherever it goes
lock: attach msg                       # on top of msg
lock: detach                           # let go
pkt: group msg lock                    # move / travel / highlight / remove act on all
pkt: ungroup                           # members stay where they are
```

- Moving an attached shape releases it; moving a group member keeps it in the group.
- Removing a group removes its members. Groups can't be copied.
- A line can join a group only if both ends are on shapes.

## Rows and columns

```anim
arr: row 5 3 8 1 at 3,4 fill blue        # cells arr.0 … arr.3, side by side
col: column "A" "B" "C" at 12,2 gap 0.2  # one under another
arr: swap 0 3                            # two cells change places
arr.2: fill amber                        # one cell
arr: fill green                          # every cell
```

- Values go straight after `row` / `column`: numbers, or quoted text (`""` is an empty cell).
- Cells are rects numbered from 0. `size` (default 1×1), `gap` (default 0: the cells touch) and the look (`fill stroke colour weight font bold monospace corner dashed …`) apply to every cell. The cell size can't change later.
- `at` / `move` / `x` / `y` place the **first** cell; `below b` etc. put the whole row beside b. It's a group: `move`, `travel`, `highlight`, emphasis and `remove` act on all its cells.
- `swap i j`: in a row one cell arcs over and the other under (a column's pass right and left); further apart, they clear the cells between. Takes `speed`, `delay` and `ease`.
- Ids go with the places: after `swap 0 3`, `arr.0` is the cell now first. Whatever is attached to `arr.0` (`i: text "i" attach below arr.0`) or ends on it stays at that place; a cell's own highlights and callout move with it.

## Emphasis, highlights, callouts

```anim
a: pulse                       # one-off, forwards only
a: shake
a: wobble                      # or wiggle
a: bounce                      # hops up like a dropped ball
a: glow                        # brightens with a soft glow
l: signal                      # a glowing blip runs along line / arrow / curve l
l: signal-reverse              # from its end back to its start
a: highlight box               # stays until cleared
a: highlight spotlight         # dims everything not spotlit (several shapes can be)
a: highlight arrow             # block arrow pointing in from the top-right
a: highlight glow              # glows in the highlight colour until cleared (bare "glow" is the one-off)
a: highlight number 2          # numbered disc on the top-left corner
a: highlight box arrow         # several at once
a: highlight clear             # clears them all
a: callout "Look!"             # speech bubble above the shape
a: callout "Look!" below       # or left-of / right-of
a: callout clear
```

- `signal` only goes on lines, arrows and curves (on a group: each of its lines). It runs at an even pace over the `speed`, and like the other emphasis words plays forwards only.
- Emphasis words go on their own, not after `highlight`: `a: glow highlight box` is a one-off glow plus a box, but `a: highlight box glow` is a box plus a lasting glow.
- Spotlight: shapes outside it dim to 20%, and so do their highlights and callouts.
- Callouts stay inside the drawing, and their text wraps at about 24 characters.

## Timing and effects

```anim
a: move 4,2 speed slow         # instant | vfast | fast | normal | slow | vslow
a: move 4,2 speed 1.5          # or seconds
a: fill red delay 1            # wait 1 s before starting
a: move 9,2 ease linear        # in-out (default) | linear | in | out | spring
a: rect at 2,3 pop             # entrance: fade (default) | pop | slide | typed
l: arrow from a to b draw      # a line draws itself in
t: text "$ ls" at 2,1 monospace typed   # types out one character at a time
a: remove pop                  # exits take the same effects
```

- **Intro:** if the first beat uses `typed`, `pop`, `draw`, `slide` or a `delay`, it plays in from nothing when the animation first comes into view, and again after going back to the start (⏮, Home, or a `loop`). The drawing stays empty until then. A first beat with only plain fades is just shown, as is everything for viewers who prefer reduced motion.
- `typed` types a shape's text out at an even pace over the `speed` (the shape fades in quickly first); as an exit it un-types. Shapes with no text fade.
- Speeds: instant 0 · vfast 0.25 · fast 0.5 · **normal 1** · slow 2 · vslow 4 s.
- `ease`: **in-out** starts and ends gently · `linear` an even pace · `in` speeds up · `out` slows down · `spring` overshoots and settles (a `pop` springs past full size). Works on any change, entrance or exit, `travel` (each hop), `swap`, `camera` and `defaults` (`defaults ease spring`).
- A bare speed word is an error: write `speed slow`.
- A beat lasts until its last change ends. Going back plays it exactly in reverse.

## Beat lines (no id)

```anim
defaults fill blue speed fast    # applies to lines after it (merges)
defaults clear
pause                            # while playing, wait here for Next
pause 2                          # while playing, hold 2 s here
auto                             # go straight on to the next beat (one click plays a chain)
```

- `defaults` has no colon. No `at` / `via` / `delay` / labels in defaults.
- `pause` / `auto` describe what happens *after* their beat.

## Camera (beat line, no id)

```anim
camera at 4,3 zoom 2             # centre on 4,3, twice as close (goto / move = at)
camera at a zoom 3 speed slow    # centre on where a is now (doesn't follow it)
camera zoom 1.5                  # zoom about the current centre
camera move +2,0                 # pan 2 cells right (relative, like shapes)
camera zoom +1                   # one step closer
camera travel b c d              # pan hop by hop through the stops (ids and/or x,y)
camera reset                     # back to the whole drawing
```

- Takes `at` / `x` / `y`, `travel`, `zoom`, `reset`, `speed`, `delay` and `ease`. No colon.
- `travel` can't go with `at` / `x` / `y`. Each hop eases on its own and takes `speed`, so 3 stops take 3 × speed.
- Stays until changed (later steps keep it). Going back plays it in reverse; jumps cut.
- Zoomed in (`zoom` ≥ 1), the view stays inside the drawing; `zoom 0.5` zooms out.

## Switching things off

```anim
a: remove
g: ungroup
a: detach
l: static              # stop flowing
l: solid               # no dashes or dots
a: highlight clear
a: callout clear
defaults clear
camera reset
```
