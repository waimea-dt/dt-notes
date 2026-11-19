# dt-notes

Docsify site in `docs/`. Work directly on `main`.

## Plugin conventions

Shared with Copilot - follow them:

@../.github/copilot-instructions.md

## Testing

Serve `docs/` with `python3 -m http.server` and drive the relevant `docs/_tests/` page with headless puppeteer: check for page errors, plus screenshots for visual changes.

## Animation plugin

`<animation>` blocks with scene language in ```` ```anim ```` fences.

- `docs/_plugins/ANIMATION_LANG.md` - syntax cheat-sheet. Keep it terse: one example per line with `#` comments, no design history.
- `docs/_plugins/PLUGIN_ANIMATION.md` - engine guide: how it's built, language rules, where to add things. Read before changing the plugin.
- Code: `docs/_plugins/visualisation/` (`anim-core.js`, `anim-parse.js`, `anim-compile.js`, `anim-render.js`, `animation.js`). CSS: `docs/_css/visualisation/animation.css`.
- Tests: `docs/_tests/animation*.md` (menu page `animation.md`). Step every animation on the changed test pages.
- Syntax design: one way to do each thing, natural reading (e.g. `colour`, no `stroke` alias; side-first placement words; `speed <word|seconds>`).

## Next steps (temporary - animation performance handover, Nov 2026)

Remove this section once the work is done.

**Done** (commits `0b88d9e`..`f56d5d4`): colours resolved once per page in one batch; text measured on a canvas (cached at one size, re-resolved on theme change, waits for web fonts); playback state shown with `data-` / `aria-` attributes and inline styles; label text changed in place (text node `.data`). Load of `animation-shapes` went 3.8s -> 0.23s; full restyles while stepping `animation-motion` 84 -> 13 over 43 steps.

**The cause of the remaining hitches:** on this site, these restyle the whole page (~2,400 elements, 55-125ms on a long page) because of `:has()` rules:
- any class change, `hidden`, `disabled`
- adding, removing or moving any node, including `textContent` (it replaces the text node)

Cheap (~70 elements): inline styles, `data-*` / `aria-*` / `title` attributes, a text node's `.data`. All changes in one frame share one restyle, so a frame is only cheap if none of its changes are expensive.

**Rules that cause it** (each one alone; found by bisecting the 110 site `:has()` rules):
- `body:has(.mouse-trail-root) .content, … *` - `_css/easter/mouse-trail.css`
- `&:has(.focus)` - `_css/visualisation/file-trees.css`
- `&:has(svg, img, figure)` - `_css/visualisation/timelines.css`
- `&:has(pre, code)` (x2) - `_css/interactive/drag-drop.css`
- `:is(td, th):has(input)` - `_css/interactive/trace-table.css`

No common selector pattern found, so fixing them one by one may not hold against future rules.

**Options:**
1. **Part 3 (animation):** make every node an animation uses when it's built, and hide unused ones with `display: none` instead of adding / removing them in `render` (`makeNode`, the removal loop, overlays, slots, ghosts, bars, signals). Layer reordering (`order()`, a swap's `raise`) still moves nodes, so may keep one restyle at its start and end. Also: typing still rebuilds a label once as it starts and stops.
2. **Site CSS:** rewrite the six rules (e.g. mouse trail toggles a class on `body` from its JS). Helps every plugin, not just animations.

**How it was measured** (scripts were in the scratchpad, not kept):
- Puppeteer + `page.tracing` with `devtools.timeline`: `UpdateLayoutTree` events' `args.elementCount` (>500 = full restyle) in the time after each Next click (marked with `performance.mark`).
- Add `disabled-by-default-devtools.timeline.invalidationTracking` to see which node and selector caused an invalidation.
- Frames with node changes: a `MutationObserver` (`childList`, `subtree`) on the SVG, counted per `requestAnimationFrame`.
- Before/after drawings: serialise each SVG at its first and last beat (End key, reduced motion on) on every test page, sort attributes per tag, and compare.

## VS Code extension

`vscode/dt-notes-syntax/` provides highlighting for the anim language. After changing it: bump the version in `package.json`, rebuild and reinstall per its README, then tell me to reload the window.
