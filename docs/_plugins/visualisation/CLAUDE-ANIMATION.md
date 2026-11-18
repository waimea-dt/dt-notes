# Animation Engine: Notes for Claude

How the `<animation>` plugin is built, the rules its scene language follows, and where to add things. The author-facing syntax is in `ANIMATION.md` (keep that one for humans: syntax and examples, no internals).

## Parts

Loaded in this order (`docs/index.html`), sharing `window.Anim`. Each part takes what it needs from `window.Anim` at the top and adds what later parts use at the bottom.

| File | Does |
|---|---|
| `anim-core.js` | Constants, the tables (below), the keyword table, geometry, bounds |
| `anim-parse.js` | Markdown -> source markup (Docsify `beforeEach`); scene lines -> tokens -> props (`parseProps`) |
| `anim-compile.js` | Scene lines -> one snapshot of every shape per beat (`state`), plus how each change plays (`meta`: tweens, flyers, slots) |
| `anim-render.js` | Draws a beat, or a blend between two, into the SVG |
| `animation.js` | The widget: controls, captions, playback, camera, intro |

The flow: each beat's lines run in order against a live `shapes` map, and the map is snapshotted after each beat. Render blends snapshot A into B, using the beat's `meta.tweens` (per shape uid: `dur`, `delay`, `ease`, `path`, `enter`, `exit`, `effect`, `offset`, `arc`, `from`).

## Extending

Most features are an entry in a table, with no other code to change. Words, checks and error messages are worked out from these tables.

| To add | Table | File |
|---|---|---|
| A shape type | `SHAPES` (props, defaults, outline, label place, inside); a boxed one also needs `BODIES` | `anim-core.js`, `anim-render.js` |
| A look prop (`fill`, `weight` …) | `LOOKS` (field, unit, min, hints, quiet), its word in `KEYWORDS`, and the types in `SHAPES` that take it | `anim-core.js` |
| A verb (`delete`, `swap` …) | `LINES` (`verb: true`, `takes` / `refuses`), then a function in `VERBS` | `anim-core.js`, `anim-compile.js` |
| An entrance or exit (`pop` …) | `ENTRANCES` (`applies`, `unless`, `quiet`), then its frame in `FRAMES` | `anim-core.js`, `anim-render.js` |
| An emphasis (`pulse` …) | `EMPHASES` (`along`, `aliases`), then its frame in `EMPHASIS_FRAMES` | `anim-core.js`, `anim-render.js` |
| A highlight (`outline` …) | `HIGHLIGHT_KINDS` (`off`, `applies`, `refuse`), and an entry in `OVERLAYS` if it's drawn over the shape | `anim-core.js`, `anim-render.js` |
| Row-edit or moving-value timing | `CHOREOGRAPHY` | `anim-core.js` |

- **Timing:** every change's timing goes through `schedule(meta, uid, props, { dur, after })` in `anim-compile.js`. It takes the longest duration and latest start when a shape changes twice in a beat.
- **Attachments:** `besideOf` (attach, names) or `offsetFrom` (group members, cells, index labels). Test `attach.kind`, never field presence.
- **A var's or row's parts:** build ids with `cellId` / `indexId` / `nameId`. A part has `part: owner.id`, and goes when its owner does.
- **A value on the move:** use `flyValue` (the target takes the value as the flyer lands), or `fly` with `{ arrive, linger }`.

For every new word:

1. Add it to the VS Code grammar, `vscode/anim-syntax/syntaxes/anim.tmLanguage.json`, in the right role (see Highlighting).
2. Bump the version in `vscode/anim-syntax/package.json`.
3. Add it to `ANIMATION.md`.
4. Add a test to `docs/_tests/animation.md`: one animation per feature, and a line in the error-test block for each new error.

## Language rules

- **Line shape:** `id: [type | verb] [operands] [props]`. A type or verb goes straight after the colon; props come in any order after it. Lines with no id: `defaults`, `camera`, `pause`, `auto`.
- **Label only what's ambiguous.**
  - A value gets a label when it could belong to more than one prop: numbers (`size 2`, `delay 1`), colours (`fill red`), shape ids (`at b`, `follow l`).
  - A word that can only mean one thing stands alone: `pop`, `dashed`, `front`, `bold`, `mono`, `pulse`, `keep-style`.
  - Enumerations whose words would be ambiguous alone keep their label. For example, `speed normal` (`normal` is also a layer), `ease in`, `align left`.
- **Don't add verbose forms** (no `by fade`, `family mono`). Keep one form per meaning.
- **One spelling per word, British only:** `colour`, `centre`. No US spellings, and avoid new aliases. `wiggle` is the only one.
- **Reversed variants** are `<word>-reverse`: `flow-reverse`, `follow-reverse`, `signal-reverse`, `stagger-reverse`.
- **Signed numbers** are relative on a change (`move +2,0`) and absolute when creating.
- **Turning things off** uses the word's own off form: `clear`, `delete`, `ungroup`, `detach`, `static`, `solid`, `reset`.
- **Rows and columns:** ids stay with the places. After a swap, insert or remove, `arr.2` is whichever cell is now third.
- **Errors:** a bad line is skipped and listed under the animation. A message names the word as typed (`wordFor`) and gives the fix or an example. "Only takes …" messages come from `LINES`. Only warn (not error) when the line still makes sense.

## Highlighting

The grammar colours three roles, so a reader sees a line's structure at a glance:

| Role | Scope | Words |
|---|---|---|
| Command | `keyword.control` (verbs, beat lines), `storage.type` (a shape type straight after `id:`) | `delete`, `swap`, `insert`, `remove`, `copy`, `group`, `ungroup`, `defaults`, `camera`, `pause`, `auto`; `rect`, `text`, `row`, `var` … |
| Param | `support.type.property-name` | Named params (`at`, `speed`, `fill`, `into`, placements) and standalone ones (`bold`, `mono`, `pop`, `dashed`, `front`, `pulse`, `keep-style`, `arrow` as an arrowhead) |
| Value | `support.constant.property-value`, numbers, colours, strings, ids | `slow`, `left`, `spring`, `outline`, `end`, `clear`, `null` … |

- **Numbers:** a signed number (relative on a change) is `constant.numeric.relative`, with its sign `keyword.operator.sign`. The `x` in a size (`2x0.8`) is `punctuation.separator`, like the comma in `2,1`. The grammar can't tell that a signed number is absolute when creating a shape.
- **Context matters for some words.** `normal` is a value after `speed`, and the layer param elsewhere. `arrow` is a type after `id:`, a value after `highlight`, and a param elsewhere. `clear` / `reset` are params on `defaults` / `camera` lines.
- **The Markdown preview** (`preview.js`) highlights from the same grammar, mapping scopes to highlight.js classes.
- **Error marks** (`diagnostics.js`) come from the engine itself, not the grammar. The extension loads `anim-core`, `anim-parse` and `anim-compile` from the repo into a Node sandbox (no DOM), so keep those three loadable without a browser. It relies on these engine functions: `findBlocks` (blocks with their tag lines), `splitBlock` (steps and beats, with `sceneLines` mapping each scene line to its block line), `parseAttrs`, `viewBoxFor`, and the `issues` that `compile` returns (`{ error, step, beat, line, message }`). A mark goes on the last quoted word in the message that's on the line, so quote the offending word as typed.
- **To install after a grammar change:** run, from `vscode/anim-syntax/`, `npx --yes @vscode/vsce@3 package --allow-missing-repository --out "$TEMP/anim-syntax.vsix"`. Then `code --install-extension "$TEMP/anim-syntax.vsix" --force`, then reload the window.

## Checking a change

- **Compare before and after:** compile and render every animation on `docs/_tests/animation.md` with the working engine and the committed one, and compare. Load the four `anim-*.js` parts into a Node `vm` context with a small fake DOM: elements recording attributes, style and children, `getComputedStyle` returning a fake `rgb()` per colour, and a stub `lucide`. Render each transition (intro, forwards, backwards) at several moments. Hash the serialised SVG and the compiled `beats` / `errors` / `warnings`, per animation. A refactor should leave every hash the same, and a feature should change only its own animations.
- **Lint:** run ESLint on copies of the files (no project config), with `no-undef` and `no-unused-vars`.
- **Browser runs:** the user's laptop struggles with headless browsers, so keep those to one small run and leave visual checks to the user.
