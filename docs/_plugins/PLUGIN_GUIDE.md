# Plugin Guide

This guide is for writing new Docsify plugins in this project.

## Core Rules

- Reuse helpers from window.DocsifyUtils before writing local utility functions.
- Use window.DocsifyUtils.registerPlugin(...) for plugin registration.
- Keep plugin logic in one file per feature under the correct folder.
- Keep CSS in matching folder under docs/_css.
- Mark processed elements to keep doneEach idempotent.

## Preferred Utils

- processBlocks(lang, fn, options): For block scanning and idempotent processing.
- processVisualBlocks(lang, fn, options): For keep/hide/replace visual flows.
- escapeHtml: For untrusted text inserted into HTML.
- parseBoolean / parsePositiveInt: For attribute parsing.
- randomHex / clamp / sleep / generateId and other general helpers.
- loadScript(src) / loadScripts(srcs): Load a heavy CDN library only when a page needs it. Call it after
  finding blocks to process (return early if none), then check the blocks are still connected before using it.

## Structure Pattern

1. Constants and small local helpers at top.
2. Main process function for DOM transformation.
3. Docsify plugin hook registration.
4. Register with window.DocsifyUtils.registerPlugin.

## Style Pattern

- Prefer const and let over var.
- Keep functions short and single purpose.
- Add short comments only where behaviour is not obvious.
- Preserve existing naming conventions in surrounding files.

## Buttons and Icons

- Use the shared button styles in docs/_css/core/buttons.css: a plain `<button>` plus a semantic class (`btn-go`, `btn-next`, `btn-reset`…) gives the site's look, with the icon before any text label (see trace-table.js). Leave the button empty for an icon-only button, and give it an `aria-label`. Add `btn-compact` for half the padding, or `btn-bordered` for the outlined style. New icons go in docs/_css/core/theme.css as `--butt-icon-*` tokens, with matching classes in buttons.css.
- Don't give buttons a `type` attribute: Docsify's core CSS styles `button[type]`, which outranks the zero-specificity `:where(...)` rules in buttons.css.
- Add the `no-zoom` class to generated SVGs (including nested ones, such as icons inside a drawing), or svg-zoom.js makes them click-to-zoom.

## When Adding New Utilities

Add to docs/_plugins/core/utils.js only if the function is general-purpose.
Avoid moving domain-specific parsers/renderers into utils.

Good candidates:
- URL/path helpers
- marker parsing helpers
- generic error rendering
- value conversion helpers used by more than one plugin type

Not good candidates:
- simulation engine logic
- format-specific parsers
- feature-specific rendering code

## Quick Checklist

- Plugin script loaded in docs/index.html
- Matching CSS loaded in docs/index.html
- Test page added under docs/_tests
- Entry added to docs/_tests/_sidebar.md
- No duplicate utility copied from another plugin
- CDN libraries pinned to an exact version (never @latest or unversioned)
- Any window/document listeners or timers stop once the widget leaves the page
