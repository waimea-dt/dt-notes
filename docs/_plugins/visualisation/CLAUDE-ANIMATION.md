# Animation Engine: Notes for Claude

How the `<animation>` plugin is built, the rules its scene language follows, and where to add things. The author-facing syntax is in `ANIMATION.md`: a minimal reference for humans. Syntax and short examples only, with a `#` comment where a line needs one; no internals, design reasons or timing details.

## Parts

Loaded in this order (`docs/index.html`), sharing `window.Anim`. Each part takes what it needs from `window.Anim` at the top and adds what later parts use at the bottom.

| File | Does |
|---|---|
| `anim-core.js` | Constants, the tables (below), the keyword table, geometry, bounds |
| `anim-parse.js` | Markdown -> source markup (Docsify `beforeEach`); scene lines -> tokens -> props (`parseProps`) |
| `anim-compile.js` | Scene lines -> one snapshot of every shape per beat (`state`), plus how each change plays (`meta`: tweens, flyers, slots) |
| `anim-render.js` | Draws a beat, or a blend between two, into the SVG |
| `animation.js` | The widget: controls, captions, playback, camera, intro |

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
| A shape type | `SHAPES` (props, defaults, outline, label place, inside, noun, band, pre, internal); a boxed one also needs `BODIES` | `anim-core.js`, `anim-render.js` |
| A layout (`row`, `column`, `code`) | `LAYOUTS` (cell type, across, base, name side, lines, fit, typeInTurn, slide, slot, bow, numbers, panel) | `anim-core.js` |
| A look prop (`fill`, `weight` …) | `LOOKS` (field, unit, min, map, hints, quiet, check, default), its word in `KEYWORDS`, and the types in `SHAPES` that take it | `anim-core.js` |
| A verb (`delete`, `swap` …) | `LINES` (`verb: true`, `takes` / `refuses`), then a function in `VERBS` | `anim-core.js`, `anim-compile.js` |
| An entrance or exit (`pop` …) | `ENTRANCES` (`applies`, `unless`, `quiet`), then its frame in `FRAMES` | `anim-core.js`, `anim-render.js` |
| An emphasis (`pulse` …) | `EMPHASES` (`along`, `aliases`), then its frame in `EMPHASIS_FRAMES` | `anim-core.js`, `anim-render.js` |
| A highlight (`outline` …) | `HIGHLIGHT_KINDS` (`off`, `applies`, `refuse`), and an entry in `OVERLAYS` if it's drawn over the shape | `anim-core.js`, `anim-render.js` |
| A kind of bar (a var's value as a pie, a ring …) | `BARS` (`outlines` it fits; its word, written after `bar`, comes from its key), then its drawer in `BAR_DRAWS` (`make`, `draw`); the shape types it fits need `bar`, `max` and `track` in their `takes` | `anim-core.js`, `anim-render.js` |
| A colour, or a variant of every hue (`-bright`, `-muted`) | `COLOURS` (a theme variable); `COLOUR_VARIANTS` (`chroma` or `keep`, and `fillMix`), which adds `<hue>-<variant>` for each hue not in `UNVARIED`. The grammar's colour pattern and the swatch palette in `vscode/dt-notes-syntax/extension.js` list them too | `anim-core.js` |
| Row-edit or moving-value timing | `CHOREOGRAPHY` | `anim-core.js` |

- **Timing:** every change's timing goes through `schedule(meta, uid, props, { dur, after })` in `anim-compile.js`. It takes the longest duration and latest start when a shape changes twice in a beat.
- **Attachments:** `besideOf` (attach, names) or `offsetFrom` (group members, cells, index labels). Test `attach.kind`, never field presence.
- **A var's or row's parts:** build ids with `cellId` / `indexId` / `nameId`. A part has `part: owner.id`, and goes when its owner does.
- **A value on the move:** use `flyValue` (the target takes the value as the flyer lands), or `fly` with `{ arrive, linger }`.
- **Layouts:** test a layout's behaviour through `LAYOUTS[row.layout]`, never its name.
- **Cell numbers:** a layout's cells are numbered from its `base` (code: 1, rows and columns: 0). Positions in `members` are from 0; convert with `baseOf(layout)` wherever a number is read or shown (`cellRange(row, n)`).
- **Code blocks:** `code` is a layout of `codeline` cells (an `internal` SHAPES type, never typed after `id:`). `fitLines` sizes every line to the longest; `fitCode`, run from `settle(meta)` after every line, refits a block that changed. Anything that changes along with others (a refitted line, a panel's box) is timed by `retime(meta, uid, busiest(meta, shapes))`. The panel is drawn from the group's box, which takes in its indices, in a layer under every shape. Highlighting happens only at render (`codeSpans`, Prism's tokens as nested tspans coloured by code.css), so compiling never needs Prism; the `lang` look's `check` warns only when Prism is loaded.
- **Warnings** are given once per line, so a check on each of a row's cells says it once.

For every new word:

1. Add it to the VS Code grammar, `vscode/dt-notes-syntax/syntaxes/anim.tmLanguage.json`, in the right role (see Highlighting).
2. Bump the version in `vscode/dt-notes-syntax/package.json`.
3. Add it to `ANIMATION.md`.
4. Add a test to `docs/_tests/animation.md`: one animation per feature, and a line in the error-test block for each new error.

## Language rules

- **Line shape:** `id: [type | verb] [operands] [props]`. A type or verb goes straight after the colon; props come in any order after it. Lines with no id: `defaults`, `camera`, `pause`, `auto`.
- **Label only what's ambiguous.**
  - A value gets a label when it could belong to more than one prop: numbers (`size 2`, `delay 1`), colours (`fill red`), shape ids (`at b`, `follow l`).
  - A word that can only mean one thing stands alone: `pop`, `dashed`, `front`, `bold`, `mono`, `pulse`, `keep-style`.
  - Enumerations whose words would be ambiguous alone keep their label. For example, `speed normal` (`normal` is also a layer), `ease in`, `align left`.
- **Don't add verbose forms** (no `by fade`, `family mono`). Keep one form per meaning.
- **One spelling per word, British only:** `colour`, `centre`. No US spellings, and avoid new aliases. `wiggle` and `numbered` (for `indices`) are the only ones.
- **Reversed variants** are `<word>-reverse`: `flow-reverse`, `follow-reverse`, `signal-reverse`, `stagger-reverse`.
- **Signed numbers** are relative on a change (`move +2,0`) and absolute when creating.
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
- **Error marks** (`diagnostics.js`) come from the engine itself, not the grammar. The extension loads `anim-core`, `anim-parse` and `anim-compile` from the repo into a Node sandbox (no DOM), so keep those three loadable without a browser. It relies on these engine functions: `findBlocks` (blocks with their tag lines), `splitBlock` (steps and beats, with `sceneLines` mapping each scene line to its block line), `parseAttrs`, `viewBoxFor`, and the `issues` that `compile` returns (`{ error, step, beat, line, message }`). A mark goes on the last quoted word in the message that's on the line, so quote the offending word as typed.
- **To install after a grammar change:** run, from `vscode/dt-notes-syntax/`, `npx --yes @vscode/vsce@3 package --allow-missing-repository --out "$TEMP/dt-notes-syntax.vsix"`. Then `code --install-extension "$TEMP/dt-notes-syntax.vsix" --force`, then reload the window.

## Checking a change

- **Compare before and after:** compile and render every animation on `docs/_tests/animation.md` with the working engine and the committed one, and compare. Load the four `anim-*.js` parts into a Node `vm` context with a small fake DOM: elements recording attributes, style and children, `getComputedStyle` returning a fake `rgb()` per colour, and a stub `lucide`. Render each transition (intro, forwards, backwards) at several moments. Hash the serialised SVG and the compiled `beats` / `errors` / `warnings`, per animation. A refactor should leave every hash the same, and a feature should change only its own animations.
- **Lint:** run ESLint on copies of the files (no project config), with `no-undef` and `no-unused-vars`.
- **Browser runs:** the user's laptop struggles with headless browsers, so keep those to one small run and leave visual checks to the user.
