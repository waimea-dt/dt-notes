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

## VS Code extension

`vscode/dt-notes-syntax/` provides highlighting for the anim language. After changing it: bump the version in `package.json`, rebuild and reinstall per its README, then tell me to reload the window.
