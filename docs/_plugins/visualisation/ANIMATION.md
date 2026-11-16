# Animation Cheat-Sheet

`<animation>` blocks: a step-by-step animated SVG drawing with a caption per step.
Plugin `animation.js` · CSS `_css/visualisation/animation.css` · examples `_tests/animation.md`.

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
| `autoplay` | off | Plays once on screen (not for reduced motion; stops for good when someone navigates) |
| `loop` / `loop-bounce` | off | At the end: jump to the start / play backwards to the start |
| `hold="s"` | `1.5` | Wait between beats while playing |
| `controls="none"` | shown | Hide buttons and progress bar (keys still work) |

**Keys** (click the animation first): → `N` `Space` next · ← `P` `Shift+Space` back · `Home` / `End` · `A` play/pause · `F` full screen · `S` notes · `?` shortcuts · `Esc`.

## Grid

- Cells numbered from 1, top-left, y down. `at 3,2` = centre of column 3, row 2. Fractions OK.
- Sizes are in cells. One cell = 80px at full width (same size as a slide).
- Points use a comma (`at 5,4`), sizes an `x` (`size 2x1`). Spaces also work.

## Lines

```
a: rect "A" at 2,3          # create: id, type, label, properties
a: move 5,3 fill red        # change an existing shape
a: remove                   # remove (optionally with an effect and speed)
# a comment line
```

- `#` followed by a space starts a comment, on its own line or after a command (`#f80` is still a colour).
- Properties go in any order. One quoted string per line = the label.
- A type word on an existing id replaces the shape (`debug` warns).
- Ids: letters, digits, `_ - .`, starting with a letter. Keywords can't be ids.
- Bad lines show an inline error (step + line) and are skipped.

## Shapes

| Type | Example | Default size |
|---|---|---|
| `rect` | `a: rect "A" at 2,3 size 2x1 radius 0.1` | 1×1 (radius = corner, in cells) |
| `circle` | `c: circle "C" at 4,3 radius 0.8` | radius 0.5 |
| `text` | `t: text "Hi" at 7,1 align left` | — (colour = `stroke`) |
| `line` / `arrow` | `l: arrow from a to 9,3 "yes"` | — |
| `image(path)` | `p: image(../_assets/x.svg) at 3,4 size 2 "Alt"` | 1×1, fits inside, keeps proportions |
| `icon(name)` | `i: icon(laptop) at 10,2` | 1×1, a Lucide icon |

- Labels: centred in rect / circle, on a line's midpoint, under an image / icon (also its alt text).
- Image paths resolve like `![](…)` on the same page.

## Properties

| Property | Syntax | Notes |
|---|---|---|
| position | `at 3,2` · `at b` · `at below b` | `move` / `goto` = `at`. Also `x 3`, `y 2` |
| placement | `below b` · `above` · `left-of` · `right-of` | Next to b's edge, once (doesn't follow). `gap 1` |
| line ends | `from 2,3 to b` | An end on a shape follows it (stops at its edge) |
| size | `size 2x1` · `size 2` | Circle: `size` = diameter |
| width / height | `width 3` · `height 0.5` | Rect, image, icon |
| radius | `radius 0.5` | Circle radius; rect corners |
| fill / stroke | `fill blue` · `stroke #f80` · `none` | See colours |
| weight | `weight 2` | Stroke thickness × normal; `0` hides it |
| line style | `solid` · `dashed` · `dotted` | Dashed 3w:3w, dotted 1w:1w. Changes cross-fade |
| flow | `flow` · `flow-reverse` · `static` | Dashes march along (dashed / dotted only) |
| angle | `angle 45` | Degrees clockwise, 0 = upright. Not lines |
| scale | `scale 1.5` | About the centre. Not lines |
| font | `font 1.5` · `bold` | × normal size |
| align | `align left` · `centre` · `right` | Text only |
| layer | `back` · `normal` · `front` | Within a layer: creation order |

**Colours:** `red orange amber yellow green teal cyan blue purple pink magenta theme muted fg bg black white none` or `#hex`. Named fills are tinted for readable labels. Defaults: rect/circle fill `bg` stroke `fg`; everything else `fg`.

## Relative values

On a change, a signed number is relative; unsigned is absolute. When creating, everything is absolute.

```
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

```
l: to 6,5            # move one end
l: to +1,+0          # one end, relatively
l: from a to 9,9     # both ends
l: move +1,+0        # shift the whole line
```

No `at`, `x`, `y`, angle, scale or absolute `move` on a line.

## Movement

```
a: move 9,3 via 5,1              # curve through a point (a circular arc)
a: move 9,3 via 3,1 via 6,5      # more points: smooth, sine-like
a: travel r1 r2 4,3 srv          # straight hops through shapes / points
a: follow l                      # along line l, from its start
a: follow-reverse l              # along line l, from its end
```

- `via` / `travel` / `follow` only on an existing shape (not when creating, not on lines).
- Signed `via` points are relative to the start; signed `travel` stops to the stop before.

## Copies, attachments, groups

```
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

## Emphasis, highlights, callouts

```
a: pulse                       # one-off, forwards only
a: shake
a: wobble
a: highlight box               # stays until cleared
a: highlight spotlight         # dims everything not spotlit (several shapes can be)
a: highlight clear
a: callout "Look!"             # speech bubble above the shape
a: callout "Look!" below       # or left-of / right-of
a: callout clear
```

Callouts stay inside the drawing.

## Timing and effects

```
a: move 4,2 speed slow         # instant | vfast | fast | normal | slow | vslow
a: move 4,2 speed 1.5          # or seconds
a: fill red delay 1            # wait 1 s before starting
a: rect at 2,3 pop             # entrance: fade (default) | pop | slide
l: arrow from a to b draw      # a line draws itself in
a: remove pop                  # exits take the same effects
```

- Speeds: instant 0 · vfast 0.25 · fast 0.5 · **normal 1** · slow 2 · vslow 4 s.
- A bare speed word is an error: write `speed slow`.
- A beat lasts until its last change ends. Going back plays it exactly in reverse.

## Beat lines (no id)

```
defaults fill blue speed fast    # applies to lines after it (merges)
defaults clear
pause                            # while playing, wait here for Next
pause 2                          # while playing, hold 2 s here
auto                             # go straight on to the next beat (one click plays a chain)
```

- `defaults` has no colon. No `at` / `via` / `delay` / labels in defaults.
- `pause` / `auto` describe what happens *after* their beat.

## Switching things off

```
a: remove
g: ungroup
a: detach
l: static              # stop flowing
l: solid               # no dashes or dots
a: highlight clear
a: callout clear
defaults clear
```
