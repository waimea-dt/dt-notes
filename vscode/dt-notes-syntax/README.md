# DT Notes Syntax for VS Code

Highlights `<animation>` scene lines (see `docs/_plugins/ANIMATION_LANG.md`): inside ```` ```anim ```` fences in Markdown, and in `.anim` files.

## Install or update

From this folder:

```bash
npx --yes @vscode/vsce@3 package --allow-missing-repository --out /tmp/dt-notes-syntax.vsix
code --install-extension /tmp/dt-notes-syntax.vsix --force
```

Then run **Developer: Reload Window** in VS Code. Repeat after editing the grammar.

## Colours

The colours come from your theme.

In Markdown, the site's plugin blocks (`<animation>`, `<slides>`, `<quiz>`, `<flashcards>` …) get a slightly lighter background, from the opening tag to the closing one. That way a block, and the headings inside it, stand out from the page. The settings:
- `dtNotes.blockBackground`: the colour (any CSS colour, or `""` for none)
- `dtNotes.shadedBlocks`: which tags are shaded. A block is only shaded when its closing tag is on a later line.

In the preview, the tint is `--anim-block-tint` in `preview.css`, and its tag list should match the setting's.

 A relative number (`+2`, `-1`) shows its sign as an operator. To give relative numbers a colour of their own, add a rule to your settings:

```json
"editor.tokenColorCustomizations": {
  "textMateRules": [{ "scope": "constant.numeric.relative", "settings": { "foreground": "#e2ae47" } }]
}
```

## Files

- `syntaxes/anim.tmLanguage.json`: the anim grammar (`source.anim`)
- `syntaxes/anim-markdown.tmLanguage.json`: injects it into ```` ```anim ```` fences in Markdown, and highlights ```` ```markdown ```` / ```` ```md ```` example blocks as Markdown, so ```` ```anim ```` fences inside them are highlighted too
- `language-configuration.json`: `#` comments (Ctrl+/), quote and bracket pairs
- `preview.js`: highlighting in the Markdown preview (which uses highlight.js, not the editor's grammars): ```` ```anim ```` fences, including ones inside ```` ```markdown ```` examples, highlighted from the same grammar with highlight.js class names
- `extension.js`: colour swatches for named colours after `fill` / `stroke` / `colour` (dark-theme values; picking a colour writes a hex code)
- `shading.js`: the background tint on plugin blocks in the editor (tags in code fences don't count); `preview.css` does the same in the preview
- `engine.js`: finds the repo's animation engine (`docs/_plugins/visualisation/`, its parts listed by `docs/index.html`) and loads it into a Node sandbox; shared by the error marks and the preview pane
- `preview-pane.js`: **DT Notes: Preview Animation** (the play button on a Markdown or `.anim` editor's title bar) opens a pane beside the editor showing the `<animation>` block the cursor is in, drawn by the site's own widget, engine and CSS from the repo. It rebuilds as you type and follows the cursor to the beat it's in; with **Replay edits** ticked, it plays into that beat after each edit. With **Sync cursor** ticked, stepping in the pane (Next / Back, the keys, the progress bar) moves the cursor to the beat it lands on, scrolling the editor there smoothly. Saving an engine file (`anim-*.js`, `animation.js`, `animation.css`) reloads the pane. It needs a network connection for Lucide, Prism, marked and the web fonts (from the CDNs the site uses). Captions are plain Markdown: the site's other plugins don't run in the pane
- `preview-pane-view.js`, `preview-pane-view.css`: the pane's page, which runs the plugin's Docsify hooks on the block and sends the widget `anim-show` events
- `diagnostics.js`: error and warning squiggles (and the Problems panel). Each animation is compiled by the real engine, loaded from the repo's `docs/_plugins/visualisation/`, so the marks are exactly the errors the page lists under an animation, plus its warnings. They update as you type. The engine is reloaded when its files are saved. Files outside this repo get no marks; icon names aren't checked.
