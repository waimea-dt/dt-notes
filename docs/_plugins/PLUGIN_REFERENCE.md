# Plugin Reference for AI Assistants

This site uses Docsify plugins to turn Markdown conventions, fenced code blocks, and custom HTML-like tags into interactive content. When one of these markers appears in a page, interpret its contents using the description below; it is usually widget input, not literal page text. Tags are case-insensitive in the browser, but use the spelling shown here.

## Coding

- ```` ```js run ```` / ```` ```javascript run ````: editable JavaScript runner; ```` ```python run ```` and ```` ```kotlin run ````: corresponding language runners.
- ```` ```python test ````: Python exercise with expected-answer tests and coverage feedback.
- ```` ```python trace ```` / ```` ```kotlin trace ```` / ```` ```js trace ````: step-through variable trace table; `show` reveals all rows, `blank` makes an editable worksheet.
- `<primm language="python|kotlin|js">...</primm>`: Predict-Run-Investigate-Modify-Make coding activity.
- `<web-playground>...</web-playground>`: live HTML/CSS/JS editor and preview; child code fences provide the files.
- ```` ```scratch ... ```` / ```` ```scratch-stage ... ````: render Scratch blocks / a visual Scratch stage.
- ```` ```pseudo ... ````: syntax-highlight pseudocode. Inline code followed by `(python)` (or another language) adds language-specific highlighting.
- `show-indent` on a code fence enables indentation guides; a bracketed line list selects lines. Line numbers/ranges in a fence header enable code-line highlighting.

## Content and page helpers

- `<captioned>![Alt](image) Caption</captioned>`: image with a caption; `<speak>![Character](image) Text</speak>`: speech bubble with an image.
- `<cards>...</cards>`: card grid split at `---`; `<menu>...</menu>`: linked topic-card menu. Each section separated by `---` becomes a card; a link in the card makes the entire card clickable.
- `<img-notes src="...">... </img-notes>`: image with positioned note markers.
- `<response>`, `<value>`, `<check>`: answer-entry, answer-display, and checkable form fields; options such as `placeholder` and `checked` customize them.
- `<videoembed id="YOUTUBE_ID">`, `<videoembed playlist id="PLAYLIST_ID">`, `<videoembed playlist-grid id="ID1,ID2">`: responsive YouTube video or playlist.
- `<github repo="owner/repo">`: repository summary/link panel.
- `<!-- recommendations -->` (optionally `media`): styles the following recommendation list.
- `!!!` / `!!` markers in table headings or cells: highlight selected columns, rows, or cells.
- `[!NOTE]`, `[!TIP]`, `[!WARNING]`, etc. in blockquotes: styled callouts.
- Glossary entries in `_glossary.md` become definition tooltips; `<i data-lucide="icon-name"></i>` inserts a Lucide icon. A few supported emoji are replaced by corresponding icons.

## Navigation: sidebar and home page

- The Docsify sidebar is authored in `docs/_sidebar.md` and in nested folders' `_sidebar.md` files. Use Markdown lists for links; indent child list items to create nested navigation. Docsify discovers these files automatically, and the configured `sidebarDisplayLevel` and `subMaxLevel` control which levels are initially expanded and shown.
- `sidebar-scrollspy.js` highlights the sidebar entry matching the heading currently in view. It works automatically with normal Markdown headings; it does not create sidebar links.
- `sidebar-filter.js` removes table-of-contents entries for headings inside supported plugin widgets, so internal card/slide/quiz headings do not clutter the page sub-sidebar. No special Markdown syntax is needed.
- `theme-toggle.js` adds the light/dark theme button to the sidebar automatically.
- The home page (`docs/README.md`) uses `<menu>...</menu>` for the large topic-card grid. Put each card's content between horizontal rules (`---`); a Markdown link in a card makes the whole card clickable. This is the same `<menu>` plugin described above, not the Docsify navigation sidebar.

## Visualisations

- `<computer type="...">...</computer>`: puts Markdown content inside a computer mockup (desktop, laptop, tablet, mobile, vintage, and related styles).
- `<filetree>...</filetree>`: nested Markdown list rendered as a file/folder tree.
- `<hierarchy>...</hierarchy>` and `<structure>...</structure>`: nested lists rendered as tree / organization diagrams.
- `<sequence>...</sequence>`: numbered steps displayed horizontally or vertically; `<timeline>...</timeline>`: dated list displayed as a timeline.
- `<requests>...</requests>`: client/server request-response sequence diagram.
- ```` ```data ````: binary, decimal, hexadecimal, ASCII, Unicode, pixel, or colour representations.
- ```` ```logic ````: logic gates and truth tables.
- ```` ```cpu-sim ````: TINY-8 CPU assembly program simulation.
- ```` ```memory-sim ```` and ```` ```oop-sim ````: memory and object-oriented programming simulations; `// Step:` or `# Step:` comments divide execution steps.
- The `sim-core` plugin provides shared machinery for visual simulations; it has no separate Markdown tag.

## Database

- `<db-schema>...</db-schema>`: database table/schema diagram; `<db-data>...</db-data>`: rendered table data.
- ```` ```sql run ````: editable SQLite query runner. Use `id=name` on setup blocks and `depends=name` on blocks that need them.
- `<erd>` containing an SQL code fence: generate an entity-relationship diagram from SQL table definitions.

## Interactive learning widgets

- `<slides>...</slides>`: Reveal.js presentation. `---` starts a slide, `+++` starts a reveal step, `|||` makes columns, and `Note:` starts speaker notes.
- `<flashcards>Front --- Back</flashcards>`: interactive flash cards; `<quiz>...</quiz>`: multiple-choice quiz from Markdown lists.
- `<drag-drop>...</drag-drop>`: reorderable answer/code challenge; `<accessibility mode="...">...</accessibility>`: accessibility simulation/audit.
- `<colours>`: colour-scheme designer; `<frequency>text</frequency>`: letter-frequency analysis.
- `<calculator>...</calculator>`: binary arithmetic/bitwise calculator; `<convertor ...>`: number-base conversion; `<modulus ...>`: modulo arithmetic visualiser.
- `<big-o>`: compare algorithm growth; `<big-o-chart>`: plot complexity curves; `<algo-race type="search|sort">`: race search/sort algorithms.
- `<p-np>`: P versus NP concepts/problems; `<tsp>`: travelling-salesperson routes and solvers; `<knapsack>`: 0/1 knapsack; `<bin-packing>`: bin-packing strategies.
- `<hasher>`: SHA-256 demonstration; `<rainbow>`: precomputed password-hash lookup / rainbow-table demonstration.
- `<sub-cipher>`: Caesar or Vigenere cipher; `<sym-asym>`: symmetric/asymmetric encryption comparison; `<diffie-hellman>`: key exchange.
- `<digital-sig>`: digital-signature authenticity/tampering demonstration; `<tls>`: simplified TLS handshake; `<wifi>`: WPA2/WPA3 authentication handshake; `<rolling-code>`: garage-door rolling-code authentication.
- `exchange-core` is shared animation code used by cryptography widgets; it has no standalone tag.

## Site-wide behavior and visual effects

- Core plugins handle theme toggling, sidebar filtering/scroll tracking, tooltips (`data-tooltip="..."`), persistence of supported editable fields, icons, definitions, and scroll reset; these mostly work automatically.
- SVG zoom adds click-to-zoom to SVGs. Mermaid diagrams use normal ```` ```mermaid ```` fences and follow the current theme.
- Easter egg, Matrix, and mouse-trail effects are route/site behavior, not Markdown widgets. Shared `utils` code is infrastructure, not a page tag.

## Interpretation notes

- These are teaching visualisations, not necessarily production implementations or security tools. In particular, cryptography, CPU, and algorithm demos may simplify real systems.
- Some plugins transform ordinary Markdown structures or do not introduce syntax of their own. If a marker is not listed, inspect its plugin file under `docs/_plugins` and its example page under `docs/_tests`.
