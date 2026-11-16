# Anim syntax for VS Code

Highlights `<animation>` scene lines (see `../ANIMATION.md`): inside ```` ```anim ```` fences in Markdown, and in `.anim` files.

## Install or update

From this folder:

```bash
npx --yes @vscode/vsce@3 package --allow-missing-repository --out /tmp/anim-syntax.vsix
code --install-extension /tmp/anim-syntax.vsix --force
```

Then run **Developer: Reload Window** in VS Code. Repeat after editing the grammar.

## Files

- `syntaxes/anim.tmLanguage.json`: the anim grammar (`source.anim`)
- `syntaxes/anim-markdown.tmLanguage.json`: injects it into ```` ```anim ```` fences in Markdown
- `language-configuration.json`: `#` comments (Ctrl+/), quote and bracket pairs
- `extension.js`: colour swatches for named colours after `fill` / `stroke` (dark-theme values; picking a colour writes a hex code)
