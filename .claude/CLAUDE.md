# dt-notes

Docsify site in `docs/`. Work directly on `main`.

## Plugin conventions

Shared with Copilot - follow them:

@../.github/copilot-instructions.md

## Testing

Drive the relevant `docs/_tests/` page with headless puppeteer: check for page errors, plus screenshots for visual changes.

Serve `docs/` from inside the puppeteer script (Node's `http` module, closed in a `finally`), so the server dies with the script. Don't start a separate `python -m http.server`: `python` here is the WindowsApps alias, which starts the real interpreter as another process, so `kill $!` / `Stop-Process` miss it and the server is left running.

## Animation plugin

`<animation>` blocks with scene language in ```` ```anim ```` fences.

- `dev/animation/language.md` - syntax cheat-sheet. Keep it terse: one example per line with `#` comments, no design history.
- `dev/animation/engine.md` - engine guide: how it's built, language rules, where to add things. Read before changing the plugin.
- Code: `docs/_plugins/visualisation/` (`anim-core.js`, `anim-parse.js`, `anim-compile.js`, `anim-render.js`, `animation.js`). CSS: `docs/_css/visualisation/animation.css`.
- Tests: `docs/_tests/animation*.md` (menu page `animation.md`). Step every animation on the changed test pages.
- Checks: `node tools/anim/compare.js` (before / after against HEAD), `node tools/anim/finder.js` (changes to shapes past beats share) and `node tools/anim/lint.js`. Run all three after an engine change.
- Syntax design: one way to do each thing, natural reading (e.g. `ink` for text colour, no aliases; side-first placement words; `speed <word|seconds>`).

## VS Code extension

`vscode/dt-notes-syntax/` provides highlighting for the anim language. After changing it: bump the version in `package.json`, rebuild and reinstall per its README, then tell me to reload the window.
