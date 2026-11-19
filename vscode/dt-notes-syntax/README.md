# DT Notes for VS Code

Editing help for DT Notes pages: highlighting, error marks and a live preview for the site's `<animation>`, `<slides>` and `<flashcards>` blocks. It works in Markdown files and `.anim` files inside the dt-notes repo.

## Features

### Live block preview

Click the play button in a Markdown or `.anim` editor's title bar (or run **DT Notes: Preview Block**). A pane opens beside the editor showing the block the cursor is in, drawn by the site's own plugins and CSS.

- **Updates as you type**, with no page reload.
- **Follows the cursor** to the beat, slide or card (front or back) it's in. In an animation inside a slide, it shows the animation.
- **Sync cursor** (on by default): stepping in the pane moves the cursor there, scrolling the editor smoothly.
- **Replay edits** (animations, on by default): after each edit, plays into the beat you changed.
- Follows VS Code's light or dark theme.

Flash cards show in written order (`shuffle` is ignored) so they match the file. Other plugins don't run in the pane, so their blocks show as plain Markdown. It needs a network connection: reveal.js, Prism, Lucide, marked and the fonts load from the site's CDNs.

### Animation scenes

In ```` ```anim ```` fences and `.anim` files:

- **Highlighting** of scene lines, also in VS Code's Markdown preview (see `docs/_plugins/ANIMATION_LANG.md` for the language).
- **Error marks:** each animation is compiled by the site's engine as you type, so the squiggles (and the Problems panel) show exactly the errors the page would list, plus its warnings.
- **Colour swatches** beside named colours (`fill red`). Picking a colour in the swatch writes a hex code.
- `#` comments with **Ctrl+/**.

### Block shading

The site's plugin blocks (`<animation>`, `<slides>`, `<quiz>` …) get a slightly lighter background, from the opening tag to the closing one, in the editor and the Markdown preview.

## Settings

- `dtNotes.blockBackground`: the shading colour (any CSS colour, or `""` for none).
- `dtNotes.shadedBlocks`: which tags are shaded.

To give relative numbers (`+2`, `-1`) a colour of their own:

```json
"editor.tokenColorCustomizations": {
  "textMateRules": [{ "scope": "constant.numeric.relative", "settings": { "foreground": "#e2ae47" } }]
}
```

## Install or update

From `vscode/dt-notes-syntax/`:

```bash
npx --yes @vscode/vsce@3 package --allow-missing-repository --out "$TEMP/dt-notes-syntax.vsix"
code --install-extension "$TEMP/dt-notes-syntax.vsix" --force
```

Then run **Developer: Reload Window**. To update after changing the extension, bump `version` in `package.json` and run the same two commands.

Changes to the site's plugins don't need a reinstall: the error marks reload the engine when its files are saved, and the preview pane reloads when a file it uses is saved.

## Files

- `extension.js`: starts each feature, and the colour swatches
- `syntaxes/`: the anim grammar, and its injection into Markdown (including ```` ```anim ```` fences inside ```` ```markdown ```` examples)
- `language-configuration.json`: comments, quote and bracket pairs
- `preview.js`, `preview.css`: highlighting and shading in VS Code's Markdown preview
- `shading.js`: block shading in the editor
- `engine.js`: finds and loads the repo's animation engine (its parts listed by `docs/index.html`)
- `diagnostics.js`: the error marks
- `preview-pane.js`: the block preview pane
- `preview-kinds.js`: what the pane can show: each block's tag, the site files it needs, and how a cursor line maps to a place in it and back. A new kind is an entry here, plus the `preview-show` / `preview-position` events in its plugin
- `preview-pane-view.js`, `preview-pane-view.css`: the pane's page
- `icon.png`: the site's `docs/_assets/macs/macintosh.svg` at 256px (VS Code needs a PNG)
