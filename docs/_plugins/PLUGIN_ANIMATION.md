# Animation Engine: Notes for Claude

How the `<animation>` plugin is built, the rules its scene language follows, and where to add things. The author-facing syntax is in `ANIMATION_LANG.md`: a minimal reference for humans. Syntax and short examples only, with a `#` comment where a line needs one; no internals, design reasons or timing details.

## Parts

Loaded in this order (`docs/index.html`), sharing `window.Anim`. Each part takes what it needs from `window.Anim` at the top and adds what later parts use at the bottom.

| File | Does |
|---|---|
| `anim-core.js` | Constants, the tables (below), the keyword table, geometry, bounds |
| `anim-parse.js` | Markdown -> source markup (Docsify `beforeEach`); scene lines -> tokens -> props (`parseProps`) |
| `anim-compile.js` | Scene lines -> one snapshot of every shape per beat (`state`), plus how each change plays (`meta`: tweens, flyers, slots). The compiler's core: props, positions and routes, groups, timing (`schedule`), `runLine`, the camera |
| `anim-layout.js` | Compiler part: rows, columns, code blocks, grids and tables; their views, spans, ranges, names and indices |
| `anim-values.js` | Compiler part: the values vars and cells hold, and flyers |
| `anim-edit.js` | Compiler part: swap, insert and remove |
| `anim-render.js` | Draws a beat, or a blend between two, into the SVG |
| `animation.js` | The widget: controls, captions, playback, camera, intro |

**Compiler parts:** `createCompiler` (anim-compile.js) holds the shared state and core functions. Each part file pushes a factory onto `COMPILER_PARTS`: given `cx` (the state: `shapes`, `defaults`, `newUid`, `context`, and the core's functions), it returns `functions` (added to `cx`), `verbs` (merged into `VERBS`) and `link`, which fills in the other parts' functions it uses (its `let` list) once every part is made. A new part goes in `docs/index.html` after `anim-compile.js`; the VS Code extension reads the parts from there. Keep `defaults` the same object (change it in place) and make uids with `newUid()`.

**Widget input** all goes through the `user*` functions in `animation.js` (`userNext`, `userBack`, `userJump`, `userPlay`): buttons, keys, the progress bar, and gestures from `DocsifyUtils.addSwipeSupport` (touch swipe left / right, double click / tap to play), and scrolling while focused (`DocsifyUtils.addWheelStepping`, which gives the page its scrolling back at either end). `GESTURE_IGNORE` keeps gestures off the controls, notes and help. A new input calls these, so autoplay and `pause` waits stay right.

The flow: each beat's lines run in order against a live `shapes` map, and the map is snapshotted after each beat. Render blends snapshot A into B, using the beat's `meta.tweens` (per shape uid: `dur`, `delay`, `ease`, `path`, `enter`, `exit`, `effect`, `offset`, `arc`, `from`, `lands`).

## Extending

**The rule: build every feature by using and extending the engine's structures, never by working around them.** This is not a style preference. The user should never have to ask whether a change follows it, so check your own work against it before you say a feature is done.

Most features are an entry in a table, with no other code to change. Words, checks and error messages are worked out from these tables.

- **Find the structure first.** Before writing any code, find the table, function or path that already does this kind of thing (the "To add" table below, `schedule`, `parseProps`, `applyProps`, `resolveAttachments`, `flyValue`, `cellId` …) and go through it.
- **Extend it if it doesn't quite fit.** Add a field to the table (documented in the table's comment), widen a function's arguments, or add a table if a new kind of thing has several variants (for example `BARS` and `BAR_DRAWS` for bar kinds). Don't write a parallel path next to it.
- **No one-offs.** Never special-case a type, layout or word by name (`type === 'codeline'`, `layout === 'code'`). When something behaves differently, give it a field in its table and read the field.
- **No hand-kept lists or magic strings.** A list of allowed props belongs in `LINES` (`takes` / `refuses` / `refuse`), not in a local array checked by hand. A value's meaning comes from its table (`BARS[kind]`, `LOOKS[key].map`), not from comparing against a literal like `'on'`.
- **No inline tuning numbers.** Numbers that tune how things look or move go in `CHOREOGRAPHY`, the table entry, or a named, commented constant. Defaults go in the table too (`LOOKS: default`, `SHAPES: defaults`).
- **Errors and messages come from the shared paths.** Use `parseProps`, `LINES` and `wordFor`, so a message names the word as it was typed. If you find yourself digging through the tokens to rebuild a message, the feature is probably on the wrong path (a verb parsed as a prop, say).
- **Message wording:** lists of things come from their tables (`LAYOUT_NOUNS`, `nounList`), never written out, so they stay right as entries are added. An example that ends a message goes after a comma (`, e.g. "…"`); one in the middle goes in brackets. Use `noShape(id)` and `replaced(id, warn)` for those messages, and `effectOf` / `layerOf` / `inTurn` for a line's effect and layer.
- **No word literals:** compare against a table's flag or a named word (`EDIT_WORDS.end`, `isGroup`, `GROUP`, `LINES[word].takesOut`, `SHAPES[type].bends`), not a string.
- **Plan for the next variant.** If a feature will plausibly get siblings (another kind of bar, layout or highlight), make the first one an entry in a table, so the next is an entry too.

**Only when it's truly unavoidable:** if a special case really can't be expressed through the structures, keep it as small as possible, comment it in place with the reason, and tell the user about it when you hand the change over.

**Before you finish, review your own diff** and fix anything it turns up:
- `===` against a type, layout, kind or keyword name
- string literals that stand for a table's values
- local arrays of prop names
- numbers not taken from a table or named constant
- code that duplicates something an existing function does
- a new feature with no table entry, or a table whose comment doesn't explain the new field

In your summary, say that you checked, and name any exception you kept.

| To add | Table | File |
|---|---|---|
| A shape type | `SHAPES` (props, defaults, outline, label place, inside, noun, band, pre, internal, script, lines, anchor); a boxed one also needs `BODIES` | `anim-core.js`, `anim-render.js` |
| A kind of script (`scratch`: a shape drawn by a library from its text) | `SCRIPTS` (library, ready, render, syntax, scale), then a `SHAPES` type with `script` naming it | `anim-core.js` |
| A kind of part (name, index, view, span) | `PARTS` (outline, bound) | `anim-core.js` |
| A layout (`row`, `column`, `code`, `grid`, `table`, `binary`) | `LAYOUTS` (cell type, across, reverse, base, name side, lines, fit, typeInTurn, slide, slot, bow, numbers, panel, index, arrange, views, head, radix, power, decimal, fixed, props) | `anim-core.js` |
| A way of numbering a layout's places (beside `indices`) | `NUMBERINGS` (part, field, label), its word in `KEYWORDS`, and its field (where it goes) in the `LAYOUTS` that take it | `anim-core.js` |
| A new arrangement of a layout's cells (beside `line` and `grid`) | `ARRANGE` (create, ids, lay, sync, between, cells, marks) and `EDITS` (axis, insert, into, keepOne, messages) | `anim-layout.js`, `anim-edit.js` |
| A look prop (`fill`, `weight` …) | `LOOKS` (field, unit, min, map, hints, quiet, check, default), its word in `KEYWORDS`, and the types in `SHAPES` that take it | `anim-core.js` |
| A verb (`delete`, `swap` …) | `LINES` (`verb: true`, `on`, `takes` / `refuses`), then a function in `VERBS` | `anim-core.js`, `anim-compile.js` |
| An entrance or exit (`pop` …) | `ENTRANCES` (`applies`, `unless`, `quiet`), then its frame in `FRAMES` | `anim-core.js`, `anim-render.js` |
| An emphasis (`pulse` …) | `EMPHASES` (`along`, `aliases`), then its frame in `EMPHASIS_FRAMES` | `anim-core.js`, `anim-render.js` |
| A highlight (`outline` …) | `HIGHLIGHT_KINDS` (`off`, `valued`, `next`, `bare`, `applies`, `refuse`, `check`), and an entry in `OVERLAYS` if it's drawn over the shape | `anim-core.js`, `anim-render.js` |
| A kind of bar (`bar`, `ring`, `pie`) | `BARS` (`outlines` it fits, `slot`, `round`; its key is its word), then its drawer in `BAR_DRAWS` (`make`, `draw`, `label`); the shape types it fits need `bar`, `max` and `track` in their `takes` | `anim-core.js`, `anim-render.js` |
| A colour, or a variant of every hue (`-bright`, `-muted`) | `COLOURS` (a theme variable); `COLOUR_VARIANTS` (`chroma` or `keep`, and `fillMix`), which adds `<hue>-<variant>` for each hue not in `UNVARIED`. The grammar's colour pattern and the swatch palette in `vscode/dt-notes-syntax/extension.js` list them too | `anim-core.js` |
| Row-edit or moving-value timing | `CHOREOGRAPHY` | `anim-core.js` |

- **Timing:** every change's timing goes through `schedule(meta, uid, props, { dur, after })` in `anim-compile.js`. It takes the longest duration and latest start when a shape changes twice in a beat.
- **Attachments:** `besideOf` (attach, names) or `offsetFrom` (group members, cells, index labels). Test `attach.kind`, never field presence.
- **A var's or row's parts:** build ids with `cellId` / `indexId` / `nameId`. A part has `part: owner.id` and a `role` (`PARTS`: name, index, view, span), goes when its owner does, and is found with `partsOf(owner, role)`, never by its id. What a role does (an outline takes it in, it's `bound` to its owner) is a field in `PARTS`. A span is a part of its row too, with its own id. `fitSpans` refits it to its places in `settle`, and `covers` lists the cells it's round (a spotlight lights them).
- **A value on the move:** use `flyValue` (the target takes the value as the flyer lands), or `fly` with `{ arrive, linger }`.
- **Layouts:** test a layout's behaviour through `LAYOUTS[row.layout]`, never its name.
- **Cell numbers:** a layout's cells are numbered from its `base` (code: 1, rows and columns: 0). Positions in `members` are from 0; convert with `baseOf(layout)` wherever a number is read or shown (`cellRange(row, n)`). Read a cell number written after a verb with `placeOf` (a number or `end`), and two of them (a row's `0 2`, a grid's `1.2 3.4`) with `cellsBetween`, which gives the cells and the places a span keeps; `placedCells` turns places back into cells.
- **Grids and tables** (`LAYOUTS: views`): the grid owns every cell (its `members`, row by row, each attached at an offset from it). Its rows and columns, and a table's heading, are views: groups with a row or column layout, `role: 'view'` (`PARTS: bound`), `part` the grid and `covers` its cells, which don't own their members. So looks, highlights, range, span and stagger work on a view through the same paths as on a row, and a view can't be moved, deleted, grouped or edited on its own (`refuseView`). The grid keeps the views' ids (`views.row`, `views.col`, `heading`); `gridLines` lists them from the top. Ids are built with `viewId` / `headId` (`g.1`, `g.col.2`, `t.head`), cells with `cellId` on those (`g.1.2`). `gridNames` gives a grid's ids by place, `layoutGrid` places and names its cells, and `syncViews` makes, refits or removes its views to match (after it's made and after every edit).
- **Arrangements:** a layout's `arrange` (`line` or `grid`) picks its entry in `ARRANGE` (how it's made, laid out and read) and `EDITS` (how it's edited). Use `arranged(row)` / `edits(row)` rather than testing for one.
- **Row edits:** `editAxis` says what a swap, insert or remove moves as one (a unit: a row's cell, a grid's row or column, or a grid's cell for a swap of two places), how its numbers are read, and how to lay the layout out again (`relay`). `swapCells` and `editCells` work on units, so a new kind of layout needs an axis, not a new edit.
- **Where a shape is:** its `x, y` is the point it's placed by: its centre, the middle of the grid square a layout's first cell starts in (`fromEdge`: its top-left is the square's), or the edge of its cell an aligned shape (`align`) or one with a corner (`SHAPES: anchor`) is placed by. `centreShift` gives its box's centre from there (worked out from its size as it is, so that edge holds still as it grows), `boxCentre` that centre, and `placeFor(shape, p)` the point that puts its centre at `p`. Anything that places a shape by a centre (beside a shape, on it, a route's stops) goes through `placeFor`, never assigning a centre to `x, y`.
- **Offsets in a layout:** measure a cell's place in its row (or a grid's row or column) with `offsetIn(cell, frame)`, never `cell.attach.dx` (a grid's cells are attached to the grid, not to its views).
- **Indices:** each of `NUMBERINGS` (indices …) is a text per place, ids from `markId` (`arr.index.2`). `indexMarks(row, numbering)` lists what a layout's numbers go beside (a row's cells; a grid's views), each on the side its `LAYOUTS` field (the numbering's `field`) gives; a layout without that field isn't numbered so. `syncIndices` adds, moves and removes every numbering's texts to match; `numbered(row)` says whether it shows any.
- **Numbers** (`LAYOUTS: radix`: `binary`, `hex`, `denary`, sharing `NUMBER` and `NUMBER_DIGITS`): a reversed row (`reverse`, so `b.0` is the rightmost and `at` places the leftmost) whose cells are digits (`cell.digit`, the layout; `setValue` refuses anything else with `checkDigit`). The row `holds` its value: `valueIn` works it out from the digits (`wholeOf`), `digitsFor` splits one into them (wrapping round), and `setNumber` gives the digits that change, so `b: 67`, flyers to and from it (`flyValue`, shown as a box round it by `standIn` / `pointOf`), `insert b` and `remove … into b` go through the usual value paths. Digits are symbols (`digitSymbol` / `symbolDigit`: 0-9, then A-F); a bare word that's one (`h.0: F`) is a value before a name (`symbolValue`). `flip` (`flipDigits`) is a verb, for layouts with `flip`. Digits start with `digits.look` (after the defaults) and take `digits.looks` from their value (0s muted): `cell.auto` lists the looks still taken from it (`digitLooks`), read by the renderer's `lookOf` (with the value shown, which swaps halfway through a crossfade). A look given to the digit leaves the list; its reset puts it back. `fixed` refuses edits (`refuseFixed`). Its value written out is a part (`setTag`, as a name is), refreshed after each line by `fitNumbers`, which also lights each place value (`NUMBERINGS: lit`) while its digit isn't 0. Props only some layouts take are listed in their `props` (`LAYOUT_PROPS`), and `checkParts` refuses them elsewhere.
- **Code blocks:** `code` is a layout of `codeline` cells (an `internal` SHAPES type, never typed after `id:`). `fitLines` sizes every line to the longest; `fitCode`, run from `settle(meta)` after every line, refits a block that changed. Anything that changes along with others (a refitted line, a panel's box) is timed by `retime(meta, uid, busiest(meta, shapes))`. The panel is drawn from the group's box, which takes in its indices, in a layer under every shape. Highlighting happens only at render (`codeSpans`, Prism's tokens as nested tspans coloured by code.css), so compiling never needs Prism; the `lang` look's `check` warns only when Prism is loaded.
- **Scripts** (`SHAPES: script`, drawn by `SCRIPTS`): the script is the shape's label, so a change fades like a label's. `fitScript` (in `applyProps`, before placing) sizes the shape to its script with `scriptSize` unless it's been given a size. `scriptSize` measures the drawn script when its library has loaded and estimates it as plain text otherwise (as `textWidth` does), so compiling never needs the library. The widget (`prepareWidget`) loads any library a compiled animation's scripts need (`scriptLibraries`), then compiles again; if it can't load, the scripts are drawn as text (`drawScript`). `render` also gives the script's blocks' elements in order (scratchblocks' views are made to keep the element each draws, by the library's shared setup, `DocsifyScratchBlocks.setUp` in `scratch-blocks.js`, which also zebra-stripes every drawing), which `highlight line N` (`dimBlocks`) uses to dim the others. Lines are numbered as written; `scriptBlocksIn` finds the blocks in them with the entry's `syntax` (which lines aren't blocks, which open, divide and close a C block), and `blockOnLine` the one a line starts, so compiling can check and edit lines without the library. Script edits (`line`, and `insert` / `remove` / `swap` on a script: `editScript` and `SCRIPT_EDITS` in `anim-edit.js`) work on its lines, then set its label. The `line` verb is a verb only on a script (`LINES: on`); elsewhere `line` makes a line. Each edit puts a map of the script's blocks (for each one after it, the one it was, or null) in its beat's tween (`script`; a new script sets it null, and edits in one beat compose). Render (`scriptStep`, `drawScript`, `moveBlocks`) shows A's drawing over B's and moves each block's own parts (gathered in a group when it's drawn, `scriptDrawing`) by the map: in turn: gone blocks fade out, then the blocks make room or close up (kept ones slide, changed ones crossfade from old to new (the dip marks the change), and a C block whose inside changed morphs, its outline's numbers and its parts' translations blending (`blockMorph`, `blendValues`; set back as drawn afterwards, `unmorph`), or if its shape can't morph, swaps halfway (`scriptReshape`), all in `CHOREOGRAPHY: scriptRoom` of the time), then new ones fade in, moving with their neighbour and sliding in from (or out to) the right by a cell (`scriptAside`); with no map it crossfades. Each drawing is placed from the shape's anchored edge (`edgeOf`), so it holds still while the box grows.
- **Round bars** (`BARS: round`, `roundBar`): the shape is made square as one is turned on, takes one size (`LOOKS: side` refused), and is drawn round by the renderer (`cornerOf`, blended by `v.round`), not by changing its `corner`. The bar look is applied before `size` (`LOOKS: early`). A row whose cells change size is laid out again (`relayLayout`, `ARRANGE: relay`).
- **Opacity:** a look like any other (`LOOKS: opacity`, `min`/`max`, in `STYLE`), multiplied into the shape's group opacity at render, with the spotlight's dimming on top.
- **Warnings** are given once per line, so a check on each of a row's cells says it once.

For every new word:

1. Add it to the VS Code grammar, `vscode/dt-notes-syntax/syntaxes/anim.tmLanguage.json`, in the right role (see Highlighting).
2. Bump the version in `vscode/dt-notes-syntax/package.json`.
3. Add it to `ANIMATION_LANG.md`.
4. Add a test to the test page for its topic: one animation per feature, in the cheat-sheet's order, and a line in the error-test block (`animation-errors.md`) for each new error. The pages, listed on `docs/_tests/animation.md`:
   - `animation.md`: the block itself (steps and beats, the grid, comments, playback)
   - `animation-examples.md`: whole example animations
   - `animation-shapes.md`: shapes, looks (colours, line styles, layers …), emphasis and highlights
   - `animation-motion.md`: placing and moving, copy / attach / group, timing and effects, the camera
   - `animation-data.md`: rows and columns, range, spans, grids and tables, vars and moving values, bars
   - `animation-code.md`: code blocks, Scratch scripts

   A new page also goes in the menu on `animation.md`, the links at the top of each page, and `docs/_tests/_sidebar.md`.

## Language rules

- **Line shape:** `id: [type | verb] [operands] [props]`. A type or verb goes straight after the colon; props come in any order after it. Lines with no id: `defaults`, `camera`, `pause`, `auto`.
- **Label only what's ambiguous.**
  - A value gets a label when it could belong to more than one prop: numbers (`size 2`, `delay 1`), colours (`fill red`), shape ids (`at b`, `follow l`).
  - A word that can only mean one thing stands alone: `pop`, `dashed`, `front`, `bold`, `mono`, `pulse`, `keep-style`.
  - Enumerations whose words would be ambiguous alone keep their label. For example, `speed normal` (`normal` is also a layer), `ease in`, `align left`.
- **Don't add verbose forms** (no `by fade`, `family mono`). Keep one form per meaning.
- **One spelling per word, British only:** `colour`, `centre`. No US spellings, and avoid new aliases. `wiggle` and `numbered` (for `indices`) are the only ones.
- **Reversed variants** are `<word>-reverse`: `flow-reverse`, `follow-reverse`, `signal-reverse`, `stagger-reverse`.
- **Signed numbers** are relative on a change (`move +2,0`) and absolute when creating. That includes a value (`v: +1`, `b: -5`: `addTo`), so a signed value given as text is quoted.
- **Reset** puts looks back as a shape started: `applyDefaults` records `shape.start` (its `STYLE` looks), and `fill reset` (`resettable` keywords) or `style reset` (`resetLook`) take them from it. `clear` is for taking something away (a highlight, a name); `reset` is for going back.
- **Angles** are clockwise degrees from as drawn, which faces right (as Scratch sprites do). Direction words (`angle up`, `DIRECTIONS`) are absolute but turn the short way (`numberValue`'s `turn`); numbers turn exactly as written, so `angle +360` spins.
- **Turning things off** uses the word's own off form: `clear`, `delete`, `ungroup`, `detach`, `static`, `solid`, `reset`.
- **Rows and columns:** ids stay with the places. After a swap, insert or remove, `arr.2` is whichever cell is now third.
- **Errors:** a bad line is skipped and listed under the animation. A message names the word as typed (`wordFor`) and gives the fix or an example. "Only takes …" messages come from `LINES`. Only warn (not error) when the line still makes sense.

## Highlighting

The grammar colours three roles, so a reader sees a line's structure at a glance:

| Role | Scope | Words |
|---|---|---|
| Command | `keyword.control` (verbs, actions, beat lines), `storage.type` (a shape type straight after `id:`) | `delete`, `swap`, `insert`, `remove`, `copy`, `group`, `ungroup`, `detach`, `clear` (everywhere: `highlight clear`, `callout clear`, `defaults clear` …), `defaults`, `camera`, `pause`, `auto`, `reset` (`camera reset`); `rect`, `text`, `row`, `var` … |
| Param | `support.type.property-name` | Named params (`at`, `speed`, `fill`, `into`, placements) and standalone ones (`bold`, `mono`, `pop`, `dashed`, `static`, `front`, `pulse`, `keep-style`, `arrow` as an arrowhead) |
| Value | `support.constant.property-value`, numbers, colours, strings, ids | `slow`, `left`, `spring`, `outline` … |
| Literal | `constant.language` with `variable.other.constant` inside it | `end` and `null`: words that stand in for a value, as a number does. The inner scope makes themes that colour `constant.language` like an error (Catppuccin: red) show them as constants instead (peach, like numbers) |

- **Numbers:** a signed number (relative on a change) is `constant.numeric.relative`, with its sign `keyword.operator.sign`. The `x` in a size (`2x0.8`) is `punctuation.separator`, like the comma in `2,1`. The grammar can't tell that a signed number is absolute when creating a shape.
- **Context matters for some words.** `normal` is a value after `speed`, and the layer param elsewhere. `arrow` is a type after `id:`, a value after `highlight`, and a param elsewhere. Actions are commands wherever they appear: `clear`, `reset`, `detach`.
- **The Markdown preview** (`preview.js`) highlights from the same grammar, mapping scopes to highlight.js classes.
- **Error marks** (`diagnostics.js`) come from the engine itself, not the grammar. The extension loads every `anim-*.js` part that `docs/index.html` lists, in order, from the repo into a Node sandbox (no DOM), so keep them loadable without a browser (nothing touches the DOM until it's called). It relies on these engine functions: `findBlocks` (blocks with their tag lines), `splitBlock` (steps and beats, with `sceneLines` mapping each scene line to its block line), `parseAttrs`, `viewBoxFor`, and the `issues` that `compile` returns (`{ error, step, beat, line, message }`). A mark goes on the last quoted word in the message that's on the line, so quote the offending word as typed.
- **The preview pane** (`preview-pane.js`, `preview-kinds.js`, `preview-pane-view.js`) loads `utils.js`, the parts and `animation.js` from the repo into a webview, runs the plugin's Docsify hooks itself (captions through marked, no other plugins) and moves the widget with a `preview-show` event (`{ position: beat, play }`). The widget sends a `preview-position` event (`{ position: beat }`) as each move of the viewer's own stepping sets off (`goTo`'s `announce`), and the pane moves the editor's cursor there. Slides and flash cards take the same two events. Keep the widget buildable from its hooks alone, and keep both events working.
- **To install after a grammar change:** run, from `vscode/dt-notes-syntax/`, `npx --yes @vscode/vsce@3 package --allow-missing-repository --out "$TEMP/dt-notes-syntax.vsix"`. Then `code --install-extension "$TEMP/dt-notes-syntax.vsix" --force`, then reload the window.

## Checking a change

- **Compare before and after:** compile and render every animation on the test pages (`docs/_tests/animation*.md`) with the working engine and the committed one, and compare. Load the four `anim-*.js` parts into a Node `vm` context with a small fake DOM: elements recording attributes, style and children, `getComputedStyle` returning a fake `rgb()` per colour, and a stub `lucide`. Render each transition (intro, forwards, backwards) at several moments. Hash the serialised SVG and the compiled `beats` / `errors` / `warnings`, per animation. A refactor should leave every hash the same, and a feature should change only its own animations.
- **Lint:** run ESLint on copies of the files (no project config), with `no-undef` and `no-unused-vars`.
- **Browser runs:** the user's laptop struggles with headless browsers, so keep those to one small run and leave visual checks to the user.
