# Anim syntax for VS Code

Highlights `<animation>` scene lines (see `docs/_plugins/visualisation/ANIMATION.md`): inside ```` ```anim ```` fences in Markdown, and in `.anim` files.

## Install or update

From this folder:

```bash
npx --yes @vscode/vsce@3 package --allow-missing-repository --out /tmp/anim-syntax.vsix
code --install-extension /tmp/anim-syntax.vsix --force
```

Then run **Developer: Reload Window** in VS Code. Repeat after editing the grammar.

## Colours

The colours come from your theme. In Markdown, ```` ```anim ```` fences get a slightly lighter background, in the editor and the preview. Set its colour with the `animSyntax.fenceBackground` setting (any CSS colour, or `""` for none); the preview's tint is `--anim-fence-tint` in `preview.css`.

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
- `shading.js`: the background tint on ```` ```anim ```` fences in the editor (including ones inside ```` ```markdown ```` examples); `preview.css` does the same in the preview
- `diagnostics.js`: error and warning squiggles (and the Problems panel). Each animation is compiled by the real engine, loaded from the repo's `docs/_plugins/visualisation/`, so the marks are exactly the errors the page lists under an animation, plus its warnings. They update as you type. The engine is reloaded when its files are saved. Files outside this repo get no marks; icon names aren't checked.
