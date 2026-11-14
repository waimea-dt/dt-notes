# Animation Plugin Spec

Status: **first version built.** Plugin: `docs/_plugins/visualisation/animation.js`, CSS: `docs/_css/visualisation/animation.css`, test page: `docs/_tests/animation.md`.

`<animation>` turns Markdown into a step-by-step animated explanation: an SVG drawing that changes between steps, with a caption for each step. It is drawn in the browser, so no video is exported. Its layout follows `<slides>`, so the two feel alike to write.

---

## 1. Block structure

````markdown
<animation grid="16x9">

# Title (stays fixed for the whole animation)

Caption for step 1.

```scene
a: rect "A" at 2 3
```

---

## Step heading

Caption text for this step (any Markdown).

```scene
a: move 5 3
```

+++

More caption text, shown with the second beat.

```scene
a: fill green
```

Note:
Teacher notes (Markdown), to the end of the step.

</animation>
````

| Marker | Meaning |
|---|---|
| `---` | Starts a new **step**. |
| `+++` | Splits a step into **beats** that play one after another. Splits the caption and the scene together: caption text after `+++` appears when that beat plays. |
| ` ```scene ` | The scene commands for a step (or beat). A step may have none, which means a caption-only step. |
| `Note:` | Teacher notes, to the end of the step. |

Marker rules are the same as in `slides.js`: they must be alone on their line, and they are ignored inside code fences (other than the `scene` fence itself).

Within one beat, all changes play **at the same time**.

### Attributes

| Attribute | Default | Meaning |
|---|---|---|
| `grid="CxR"` | `16x9` | Grid size in columns × rows. `grid="fit"` sizes the grid to the area every shape covers across all steps, plus a margin. |
| `debug` | off | Draws numbered rows and columns and each shape's id, and shows warnings (see §9). |

---

## 2. Layout and captions

```
┌───────────────────────────────────────┐
│  Title                                │  the step 1 `#`, fixed
├───────────────────────────────────────┤
│              SVG drawing              │  scaled to the panel width
├───────────────────────────────────────┤
│  Step heading                         │  caption: `##` and text
│  Caption text                         │
├───────────────────────────────────────┤
│  ⏮  ◀  ● ● ◉ ○ ○  ▶   ⏵         ✎  ⛶  │  controls
└───────────────────────────────────────┘
```

- **The drawing is the same size as a slide deck:** the full content width, 16:9 for the default grid, with the same border, corner radius and shadow as `<slides>`. Another grid changes the drawing's shape, not its width.
- **Full screen:** the Full screen button (or `F` when the widget has focus) shows the widget full-screen, with the drawing scaled to fit the screen and the caption and controls below it. `Esc` exits.

- **Captions are HTML, not SVG.** They never use grid coordinates. Text that must point at a shape is a `text` shape in the scene.
- **The caption panel has a fixed height**, set by the tallest caption (measured once on render), so the controls never jump.
- The drawing and the caption share one width and left edge.
- **Caption transitions run at the same time and speed as the drawing's.** Going forward, the old text fades out and drifts left while the new text comes in from the right; going back reverses it.
- **An unchanged heading stays put.** If the next step has the same `##`, or none, only the body text changes.
- Step headings are kept out of the page's table of contents, as slide headings are.

### Controls

- **Rewind** goes straight back to the start (no transition). `Home` does the same once the widget has focus.
- **Back** / **Next** go back and forward one beat. The ← / → arrow keys do the same once the widget has focus.
- The step dots jump to a step **instantly**, with no transition.
- **Play** plays through the remaining beats automatically (it becomes **Pause** while playing).
- **Full screen** / `F` toggles full screen.
- The buttons are the site's shared icon-only buttons (`btn-prev`, `btn-next`, `btn-go`, `btn-notes`, `btn-fullscreen` in `buttons.css`): back, the step dots, next and play on the left; notes and full screen on the right.

---

## 3. Grid and coordinates

- Cells are numbered **from 1, starting top-left**, and **y goes down**.
- `at 3 2` means **the centre of column 3, row 2**. Fractions are allowed: `at 3.5 2` sits on the line between columns 3 and 4.
- One cell is 80px at the full 1280px width of a 16×9 grid (the same size as a slide). The drawing scales to its panel.
- Changing the grid changes the canvas shape, not the cell size, so shapes look the same size in every animation.
- **Sizes are in cells**, e.g. `size 2 1` or `radius 2`. A radius-2 circle is 4 cells across.
- Positions outside the grid are allowed, e.g. off-screen starts like `at -1 3` (see §6). In `debug` mode they give a warning.

---

## 4. Line syntax

Every line in a `scene` block has the form:

```
<id>: <command and properties>
```

| Form | Meaning |
|---|---|
| `a: rect "A" at 2 3` | A **type word** after the colon **creates** a shape. |
| `a: move 5 3 fill red` | No type word: **changes** an existing shape (animated). |
| `a: circle at 5 3` | A type word on an id that **already exists**: **replaces** that shape (cross-fade). `debug` warns, because this is often a mistake. |
| `a: remove [effect] [speed]` | **Removes** the shape (default: `fade`). |
| `defaults: …` | Sets defaults for shapes created after it (§7). |

The parser reads the words after the colon from left to right. Properties may come in any order.

### Ids

- Letters, digits, `_`, `-` and `.`, starting with a letter: `a`, `box1`, `arr.0`.
- **Reserved** (cannot be used as ids): type words, property keywords, transition words, placement words, layer words (`front`, `back`, `normal`), `remove` and `defaults`.

### Value types

Each token's type can be told from the token itself:

| Type | Examples | Notes |
|---|---|---|
| `num` | `3`, `2.5`, `+1`, `-2` | Signed numbers mean something on a change (§6). |
| `str` | `"Hello world"` | Always the **label** (§5.1). |
| `id` | `a`, `arr.0` | Must be an existing shape. A misspelt id is an error, not a silent no-op. |
| `colour` | `red`, `muted`, `#f80`, `none` | Named colours map to the site's theme variables, so light and dark themes work. |
| `word` | `left`, `centre` | One of a fixed set for that property. |
| resource | `image(_assets/goat.svg)`, `icon(laptop)` | Parentheses: something the shape loads. |
| flag | `bold`, `dashed` | A keyword with no value. |

Commas are treated as spaces, so `at 2, 3` is the same as `at 2 3`.

### Property signatures (overloading)

Each keyword has one or more **signatures**, tried **longest first**, and the first one that matches is used. Overloads must differ in the type of their first value or in how many values they take.

```js
const PROPS = {
  at:     [['num', 'num'], ['placement', 'id'], ['id']],   // `move` and `goto` are aliases
  x:      [['num']],
  y:      [['num']],
  from:   [['num', 'num'], ['id']],
  to:     [['num', 'num'], ['id']],
  size:   [['num', 'num'], ['num']],     // `size 2` = 2 × 2
  radius: [['num']],
  gap:    [['num']],                     // only after a placement
  via:    [['num', 'num'], ['placement', 'id'], ['id']],   // repeatable: curve through these points
  delay:  [['num']],                     // seconds to wait before this line's change starts
  fill:   [['colour']],
  stroke: [['colour']],
  width:  [['num']],                     // stroke thickness, × normal
  font:   [['num']],
  angle:  [['num']],                     // degrees clockwise, 0 = upright
  scale:  [['num']],                     // size multiplier about the centre
  align:  [['word']],                    // left | centre | right (`center` also accepted)
  bold:   [[]],
  dashed: [[]],
}
```

If nothing matches, the error names the expected forms, e.g. *`from` expects `x y` or a shape id: no shape called `ab`*.

---

## 5. Shapes

| Type | Example | Default size | Notes |
|---|---|---|---|
| `rect` | `a: rect "A" at 2 3 size 2 1` | 1 × 1 | |
| `circle` | `c: circle "C" at 4 8 radius 2` | radius 0.5 | |
| `text` | `t: text "Jim" at 7 1 align left` | n/a | A shape with no outline. `align` sets which side of the cell the text is anchored to. |
| `line` | `l: line from a to c "Yes"` | n/a | No single position (§6.3). |
| `arrow` | `p: arrow from 3 5 to 9 3` | n/a | A line with an arrowhead at its `to` end. |
| `image(path)` | `p: image(_assets/goat.svg) at 3 4 size 2 "Goat"` | 1 × 1 | Fits **inside** its box with its proportions kept. Works for SVG, PNG, WebP and other image types. |
| `icon(name)` | `i: icon(laptop) at 10 2` | 1 × 1 | A Lucide icon, in the current text colour. |

- **Image paths** resolve the same way as Markdown images (`![](…)`) on the same page.
- **Line and arrow ends** given as ids attach to that shape and **follow it** when it moves. Lines start and stop at the shape's edge, not its centre.
- Creation can use `x` / `y` instead of `at`: `a: rect x 2 y 3`.

### Stroke width

`width` sets the thickness of a shape's outline or line, as a **multiple of the normal thickness**: `width 2` is twice as thick and `width 0.5` is half.

- Valid on every shape. For `line` / `arrow` it is the line itself (the arrowhead scales with it). For `rect` / `circle` it is the outline. For `icon` it is the icon's stroke. For `image` it is a border, drawn only when the image has a `stroke` colour.
- `width 0` hides the outline but keeps the shape.
- On `text` it has no effect (`debug` warns).
- It tweens on a change, and follows the signed-number rule: `width +1`.

```
r1: arrow from a to b width 2 stroke blue
a: circle "A" at 3 6 width 0.5
r1: width +1
```

### Angle and scale

`angle <degrees>` rotates a shape about its centre: **0 is upright and positive angles turn clockwise**, so `angle 90` is a quarter turn to the right. `scale <n>` resizes it about its centre: `scale 2` is twice as big, `scale 0.5` half.

- Valid on every shape **except `line` and `arrow`** (their ends set their direction and length).
- The shape's label turns and scales with it.
- Both tween on a change and follow the signed-number rule: `angle +90` turns a further quarter clockwise, `scale +0.5` grows by half.
- An angle tweens the way the numbers go: `angle 270` from 0 turns three-quarters clockwise; `angle -90` (relative) turns a quarter anticlockwise. `angle +360` makes a full spin.
- Line ends attached to the shape meet its real (rotated, scaled) edge, and `above` / `below` / `left-of` / `right-of` use the rotated outline.

```
cog: icon(cog) at 4 3 angle 45 scale 1.5
t: text "Rotated" at 8 2 angle -30
cog: angle +360 slow          a full clockwise spin
```

### 5.1 Labels

- **A bare quoted string is always the label.** There is no `label` keyword.
- **Only one bare string per line.** Any other text-like value uses a keyword or a resource, never quotes.
- The label is centred inside a `rect` or `circle`, is the content of a `text`, sits at the midpoint of a `line` or `arrow`, and goes under an `image` or `icon`.
- For `image` and `icon`, the label is also the **alt text**.
- Changing the label cross-fades it: `a: "Done"`.

---

## 6. Positioning and changes

### 6.1 Absolute and relative values

**When a shape is created**, all numbers are absolute: there is no earlier position to be relative to.

**On a change**, a number **with a sign** (`+` or `-`) is **relative**, and one without is **absolute**:

```
a: move 1 3          absolute
a: move +2 -1        relative: 2 right, 1 up
a: move +2 3         mixed: 2 right, to row 3
a: x 7               column 7, row unchanged
a: x +3              3 right
a: y -2              2 up
a: size +1 +0        1 wider
a: radius +1
a: font +0.5
```

- The rule applies to **every** numeric property on a change, not just positions.
- `+0` means "this axis stays the same".
- One line cannot set the same axis twice (e.g. `move 1 3 x 4`): that is an error.
- A change cannot move a shape to an absolute negative position, because `-1` would be read as relative. `0` is available as "just off the left/top edge". For an off-screen entrance, create the shape off-screen and then move it.

### 6.2 `at`, `move` and `goto`

- `at`, `move` and `goto` are **interchangeable** and accepted anywhere, both when creating and on a change. By convention the examples use `at` when creating and `move` on a change, because that reads naturally.
- The signed-number rule (§6.1) still applies: on creation all numbers are absolute, whichever word is used.

```
a: move 1 3            absolute
a: move b              to the same position as b
a: move below b        relative placement
a: move 1              invalid: needs x and y, or a shape
```

### 6.3 Relative placement

```
<placement> <id> [gap n]
```

Placements: `above`, `below`, `left-of`, `right-of`. The shape is put next to the other shape's edge, centred on it, with a default gap of 0.25 cells.

```
t: text "i" below arr.0
b: rect "tmp" below a gap 1
a: move right-of b
```

The position is worked out **once**, when the line runs. The shape does not follow `b` afterwards. (Only line ends follow shapes.)

### 6.4 Lines

A line has no single position:

```
l: line from 2 3 to 7 8
l: to 6 5              move just one end
l: to +1 +0            move one end, relatively
l: from 1 1 to 9 9     move both ends
l: move +1 +0          shift the whole line (relative values only)
l: move 1 3            invalid
```

- `at`, `x`, `y` and absolute `move` are errors on a line.
- If an end is attached to a shape, setting it to a position **detaches** it. It stays at that position from then on.

### 6.5 Curved moves (`via`)

`via` makes a move follow a smooth curve that passes **through** one or more points on the way:

```
a: move 9 3 via 5 1              one curve through (5, 1)
a: move 9 3 via 3 1 via 6 5      repeat via for more points, in order
s: move above c via 9 1          round a lake on the way to c
a: move 1 3 via +2 -2            on a change, a signed via is relative to where the shape starts
a: move 6 4 via b                through b's centre
a: move 6 4 via above b          through the spot above b
```

- `via` takes the same values as `at`: `x y`, a shape id, or a placement and shape id. It can be repeated.
- The curve is a smooth spline through the start, every via point and the end, and the shape moves along it at an **even speed** (the usual easing applies to the whole journey).
- Only on a line that **moves an existing shape** (`at` / `move` / `goto`, or `x` / `y`). It's an error when creating a shape, on a line without a position change, on lines and arrows, and in `defaults:`.
- Going back retraces the same curve. Line ends attached to the shape follow it along the curve.

### 6.6 Layering

Shapes are drawn in three layers, from bottom to top: `back`, normal, `front`.

- **By default every shape is in the normal layer**, and shapes in the same layer are drawn in the order they are **created**. A later shape covers an earlier one.
- `front` / `back` put a shape in that layer, either when creating it or on a change (`a: front`). `normal` returns it to the default layer.
- Within a layer, creation order is kept: ten roads created with `back` stay in the order they were written.
- Changing layer is instant (no transition).
- `defaults: back` puts every shape created after it in the back layer.

```
a: circle "A" at 3 6
b: circle "B" at 6 2
ab: line from a to b back      drawn under the cities, even though it was created after them
r: arrow from a to b front     drawn over everything in the normal layer
```

`above` / `below` are placement words (§6.3), not layering words.

---

## 7. Defaults

```
defaults: stroke red fill white font 1.5 bold slow
```

- Applies to every shape **created after it**, including in later steps, until the next `defaults:` line.
- Each `defaults:` line **merges** with the current defaults. `defaults: reset` clears them all.
- Never changes shapes that already exist.
- Properties on a shape's own line always win.
- Transition words (§8) are allowed and set the default speed and effect.

---

## 8. Transitions

Transition words are flags and may go on any line:

| Group | Words | Applies to |
|---|---|---|
| **Speed** | `instant`, `fast`, *(normal)*, `slow` | Every change |
| **Effect** | `fade`, `pop`, `draw`, `slide` | Creating and removing only |

```
a: rect at 2 3 pop          scales up from nothing
l: arrow from a to b draw   draws itself from start to end
a: move 7 6 instant
a: move 1 2 slow
a: remove fade
a: remove instant
```

- Suggested durations: `fast` 250 ms, normal 500 ms, `slow` 1000 ms, `instant` 0.
- Default effect: `fade` for creating and removing.
- Moves, resizes and colour changes always tween; only their speed can be set.
- `slide` brings a shape in from, or sends it out to, the nearest edge of the canvas.
- A beat lasts until its last change finishes (delay + duration). The caption transition (§2) uses the beat's normal speed.

### Delays

`delay <seconds>` waits before a line's change starts, so changes within one beat can happen one after another without an extra click:

```
s: move above b slow           the person travels for 1 second...
b: fill green delay 1          ...and the city turns green when they arrive
r1: arrow from a to b draw slow
```

- Works on any line: creating (the shape appears after the delay), changing, and `remove`.
- If several lines change the same shape in one beat, the longest delay is used.
- A delay is never a default (`defaults: delay 1` is an error), and it is ignored when stepping instantly (dots, rewind, reduced motion).

---

## 9. State, navigation and errors

- **State model:** each beat's state is the previous state plus that beat's changes. The plugin works out every beat's state up front, so going back or jumping (dots) just rebuilds that state, with no undo logic.
- Going **back** plays the beat exactly in reverse at the same speed, delays included: the last change to start is the first to be undone.
- **Errors** (unknown keyword, wrong value type, unknown id, invalid form) appear as a small inline message giving the step and line. The bad line is skipped and the rest of the scene still draws.
- **Warnings** (only with `debug`): replacing an existing id with a new type word; positions outside the grid; a `defaults:` line that changes nothing.

---

## 10. Rendering

- One inline SVG per animation, with `viewBox` set by the grid. No external animation library: CSS transitions and the Web Animations API.
- Colours come from CSS custom properties, so the theme toggle works without re-rendering.
- `doneEach` must not process the same widget twice: mark each processed widget. Timers, key listeners and play loops stop when the widget leaves the page (see `PLUGIN_GUIDE.md`).
- Respect `prefers-reduced-motion`: treat every transition as `instant`, while still changing the caption.

---

## 10a. Details settled while building

- **Colour names:** `red`, `orange`, `amber`, `yellow`, `green`, `teal`, `cyan`, `blue`, `purple`, `pink`, `magenta`, `theme`, `muted`, `fg` (text colour), `bg` (background), `black`, `white`, `none`, or a hex colour. Named colours used as a **fill** are tinted towards the background, so labels on them stay readable in both themes.
- **Default colours:** `rect` and `circle` have fill `bg` (so they cover lines behind them) and stroke `fg`; lines, arrows, text and icons use `fg`; images have no border.
- **Text colour:** a `text` shape's colour is its `stroke` (text has no outline, so the stroke is its ink): `t: text "Hi" at 2 2 stroke blue`. Labels inside other shapes use the text colour.
- **Bare placement:** `t: text "i" below a` is short for `at below a`, as in the examples above.
- **Comments:** a scene line starting with `//` is ignored.
- **Default speed:** a `defaults:` speed applies to every line after it (changes as well as creations), so `defaults: slow` slows a whole sequence.
- **Replacing a shape** keeps lines attached to its id: they attach to the replacement.
- **Line ends** can't be attached to another line.
- **Teacher notes** are shown by a notes button in the controls (only when the animation has notes), under the caption.

---

## 11. Worked example

````markdown
<animation grid="12x5">

# Bubble Sort: One Pass

We start with an unsorted array.

```scene
defaults: fill none fast
a0: rect "5" at 5 3
a1: rect "3" at 6 3
a2: rect "8" at 7 3
a3: rect "1" at 8 3
i: text "i" below a0
```

---

## Compare the first pair

Is `5` bigger than `3`?

```scene
a0: fill amber
a1: fill amber
```

---

## Swap

Yes, so they swap places...

```scene
a0: move 6 3
a1: move 5 3
```

+++

...and `i` moves on.

```scene
a0: fill none
a1: fill none
i: move below a0
```

Note:
Ask the class to predict the next comparison before advancing.

</animation>
````

---

## 12. Later (not in the first version)

- **Bracket shorthand** for common shapes, e.g. `a: ["Hello"] at 2 3` for a rect and `b: ("Goat")` for a circle. Not a copy of Mermaid.
- **Edge anchors:** `from a.right to b.left`.
- **Group helpers:** `row` / `column` to lay out a list of boxes (`arr.0`, `arr.1`, …) from one anchor, plus `swap a b`.
- **Emphasis:** `a: pulse`, which draws attention without changing state.
- **Caption-to-shape links:** a word in the caption that highlights a shape on hover or tap.
- **Side captions:** `caption="right"` on wide screens.
- **Slides integration:** an `<animation>` inside `<slides>`, stepped through by reveal.js fragments.
- **More shapes:** rounded rect, diamond.
- **Inline SVG** so that `fill` / `stroke` can recolour suitable images.
