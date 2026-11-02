# Kaplay Course: Hand-off

Save this as `CLAUDE.md` in the kaplay course folder (or the DT-Notes repo root) so it is loaded automatically. It captures everything decided so far, so the author (Steve) doesn't have to re-explain it.

**Rule zero:** Steve edits the files himself. Before changing anything, **read the current file in the repo**. Where it differs from anything below, the repo wins. If you need to change something he has edited, say so and ask.

---

## 1. What this is

A Year 12 (NZ secondary, Digital Technologies) course on **making games with vanilla JavaScript and Kaplay v4000**. Students have some Python and web dev experience.

- **Six teaching weeks** (4 lessons each, **1 hour per lesson**), then a **four-week project**.
- Delivered from Steve's **docsify "DT-Notes" site** under `/courses/200dtd/kaplay/`.
- Students make their own repo from the template **`waimea-dt/kaplay-starter`**.
- Pinned library: **Kaplay `4000.0.0-alpha.27.1`**, vendored in the starter as `lib/kaplay.js`. Never use a different version or CDN.
- Breadth of mechanics is a goal (exploration, clicker, data/UI, adventure, shooter, platformer), not a focus on the usual runners and platformers.
- Students move to OOP **next year**, so this course is **declarative: no classes, no `this`, no inheritance**.

## 2. Status

| Week | Theme (sidebar name) | Game | Status |
| ---- | -------------------- | ---- | ------ |
| 1 | Things that Move | Wander | Done (Steve's, reviewed) |
| 2 | Clicks, Counts & State | Whack-a-Bug | Done (Steve has edited it) |
| 3 | Game Data & Progress (names differ, see section 10) | Creature Deck viewer | Done |
| 4 | Scenes & Game State | Haunted House | Done |
| 5 | Fly, Shoot, Explode | Bug Blaster (shooter) | Done |
| 6 | Gravity, Physics & Platforms | Coin Dash (platformer) | **Next to build** |
| Project | Design & Create a Game | Student's own | Not started |

Weeks 1 and 2 were built earlier; Steve later changed some tasks. Treat his versions as the reference for tone and format.

## 3. File layout

All under `courses/200dtd/kaplay/`:

```
README.md                  home page (<menu> cards per week)
_sidebar.md                sidebar (week > lessons), plus a "Teaching Slides" list
_assets/                   kaplay.html, kaplay.css, and one game file per week (e.g. haunted-house.js, bug-blaster.js)
weekN-intro.md             overview table + the finished game in a <web-playground hide-all>
weekN-lesson1..4.md        student worksheets
weekN-teach.md             reveal.js slides, one <slides> block per lesson
project-*.md               project pages (intro, design, dev, testing, teach)
```

Each week ships as a zip with this layout (`kaplay/…`), CRLF line endings. **Steve merges the sidebar and README entries himself**; propose the text, don't assume it's merged.

Docsify plugin syntax is documented in `PLUGIN_REFERENCE.md` in the DT-Notes repo. Read it. The ones used heavily: `<primm>` (rarely), `<response>`, `<check>`, `<quiz>`, `<drag-drop mode="code">`, `<web-playground>`, `js trace`, `<slides>`, `<github>`, `> [!NOTE|TIP|IMPORTANT|WARNING]` callouts, and inline code followed by `(js)`.

## 4. The lesson template

Every worksheet follows PRIMM, in this order and with these headings:

1. `# Lesson N: Title` and a 2-3 sentence hook
2. `## Warm-Up`: 3 questions recalling **earlier** lessons, each followed by `<response>`
3. `## Learning Goals`: 4-5 `- <check>` items
4. `## The Big Idea: **…**`: a short explanation, one reference table of functions, callouts
5. `## **P**redict`: a code listing (plain fence) and 2-4 `<response>` prompts
6. `## **R**un`: a hidden playground that loads `_assets/kaplay.html` and `.css` (and often a `js id=kaplay` base), then the visible `js-only` playground with the same code
7. `## **I**nvestigate`: questions, `js trace`, a `<drag-drop mode="code">` matching/ordering task
8. `## **M**odify`: `### Bug Hunt` (2-3 planted bugs, listed as `<check>`s in the order the student will meet them, with a TIP) and `### Tinker` (4 numbered tasks on working code)
9. `## **M**ake`: requirements as `<check>`s plus a playground starter with `// TODO:` comments, then `### Level Up` (table of challenge | hint)
10. `## Exit Ticket`: a `<quiz>` of 3 questions (the lesson-4 version is a "Week N Check" of about 5)

**Lesson 4 of every week is student-led**: a brief, a "must have" checklist, a copy-paste toolkit of the week's helper functions, Plan First, Repo Setup (`<github>`), Build (4 checkpoints), Playtest (partner feedback questions), Level Up, Week Check. The final **Make must be student-led**, not a recipe.

### Size budgets (measured from Week 2, enforced since Week 3 was found to be overbuilt)

Per lesson, aim for: about **100-125 lines of code** in total, about **1,000 words of prose**, **4 playgrounds or fewer**, **8-10 `<response>`s or fewer**, **one new idea per lesson**. Week 4 and 5 lessons sit at roughly 320-670 lines of Markdown. Steve's reaction to oversized lessons was "each lesson has enough for two hours": **cut, don't add**.

### Slides (`weekN-teach.md`)

One `<slides>` block per lesson, 5-8 slides, **brief overviews** only: title with `Note:` teacher notes, Learning, one slide per key idea with a small code sample, and Make. `---` separates slides.

## 5. Teaching and code style (Steve's standing preferences)

- **No semicolons** in any JavaScript or TypeScript. Prefer `const`, modern ES, template literals.
- **Clarity over cleverness.** Code a junior can follow. Explicit over implicit. Early returns and guard clauses. Small single-purpose functions. Descriptive names; booleans read as questions (`isValid`). Comments explain *why*, only where needed.
- Prefer `if (x > y) { y = x }` to `Math.max`, and standard-library features before anything else.
- **Declarative, no OOP.** Objects are plain data (`{ name, power }`) and custom properties on game objects (`{ speed: rand(100, 200) }`).
- Student-facing writing is for **secondary school kids**: short sentences, plain words, friendly. Examples should have a **nerdy theme** (games, tech, ghosts, bugs) and subtle, clever humour, never cringe.
- Use **only images from the starter repo** (`assets/images/`): apple, beetle, butterfly, cat, door, egg, elephant, fish, flower, ghost, grass, heart, jam, key, meat, mushroom, pineapple, portal, skull, smile, star, steel, sword, watermelon (plus `loadBean()`). Don't invent asset names.
- When in doubt, **ask Steve before assuming a requirement**, but for a clear request just start.

## 6. Course design decisions to preserve

- **Code in the lessons must be the same style across weeks.** Reuse these patterns on purpose (they are a through-line):
  - **Global state outside scenes** (`let hp`, `let inventory`, `let score`, `let lives`); scenes are rebuilt on every `go()`, so a scene must check the state before building pickups (`if (!inventory.includes("key")) { … }`) and reset state at the start of a game.
  - **Self-updating HUD** (Week 4 onward): `createHud()` adds labels with `text("")` and gives each `label.onUpdate(() => { label.text = … })`. Never `destroyAll("hud")` and re-add. This is the idiomatic Kaplay way and removes the "stale HUD" bug class.
  - **Week 3 card view** keeps Steve's push-style `createCardView(x, y)` with a `.show(card)` method. He chose it deliberately. Week 4 explains the contrast ("push or pull?").
  - **Helper functions with parameters** (`addDoor(x, y, destination, needs)`, `addBullet(x, y)`, `addEnemy()`, `loseLife()`), with objects carrying custom properties (`{ destination, needs }`, `{ speed }`).
  - **Tag-based events**: `onClick("tag", (obj) => …)`, `onUpdate("tag", (obj) => …)`, `onCollide("a", "b", (a, b) => …)`.
  - A final `go("firstScene")` as the last line of a scene-based program.
- **Hidden base playgrounds**: a `js id=kaplay` block holds the setup, `loadSprite`s and helper functions that earlier lessons built, so the visible code shows only what is new. Visible blocks use ` ```js depends=kaplay `. Blocks that stand alone call `kaplay({ … })` themselves.
- Finished games live in `_assets/<name>.js` and are shown in the intro with `<web-playground hide-all>` and `load=_assets/<name>.js`.
- **Bug hunts** are hand-built to have a *chain of symptoms*, and each one must be **verified to show exactly the symptom listed** (several symptom descriptions had to be corrected after testing).
- **Week 5 deliberately reuses Week 4's scenes, global state and HUD**; Week 6 should reuse them too (see section 9).

## 7. Kaplay v4000 (alpha.27.1) gotchas, all verified by running them

1. **Collisions need `area({ isSensor: true })` on both objects** (or both having `body()`). `area()` alone gives *no* `onCollide`, with no error. Clicks (`onClick`) still work with plain `area()`. Check Weeks 1-2 for any `onCollide` that uses plain `area()`.
2. **Tagless `onClick(() => …)` never fires.** Use `onMousePress` for "click anywhere". `onClick("tag", fn)` is fine.
3. `get("tag")` does not find **children** unless you pass `{ recursive: true }`.
4. `loop(t, fn)` **runs `fn` once immediately**, then every `t` seconds. Times are in **seconds** (`wait(2000, …)` waits half an hour: a good bug-hunt).
5. `lifespan(time, { fade })` needs `opacity()` on the same object.
6. `offscreen({ destroy: true })` removes objects that leave the screen; it is taught every time bullets exist.
7. `randi(1, 3)` gives 1 or 2 (upper bound excluded).
8. `go()` discards all objects, event handlers and timers of the old scene. Globals persist.
9. `stay()` exists but is **not taught** (hidden rule); each scene builds its own HUD.
10. `addKaboom(pos)`, `shake(n)`, `clamp`, `chance`, `choose`, `rand`, `randi`, `destroyAll`, `setBackground`, `.use(sprite(name))` all work.
11. **`file://` blocks sprite loading.** Students need Live Server or `python -m http.server`; all docs say so.
12. The typings are in the npm package `kaplay@4000.0.0-alpha.27.1` (`dist/doc.d.ts`). Use them to check an API exists before teaching it. **Don't trust memory of older Kaplay/Kaboom APIs.**

## 8. How we test (do this for every week)

The previous session verified everything in a real headless browser. Recreate it:

1. `git clone https://github.com/waimea-dt/kaplay-starter` into a `starter/` folder.
2. Serve it locally; use `kaplay-test-harness.py` (included beside this file): `pip install playwright && playwright install chromium`.
3. **Finished game**: copy `_assets/<game>.js` over `main.js` and script a playthrough (every path to win, lose and restart). Wait on **Kaplay's own clock** (`time()`), not wall-clock sleeps. Read game state via page-level `let` globals (`await page.evaluate("hp")`). Click objects by computing screen positions from `get("tag", { recursive: true })`.
4. **Every code block in every lesson**: extract the `js` fence of each `<web-playground>`, prepend the `js id=kaplay` base if present, and run it, failing on page errors. (Blocks that are only `// TODO` comments, or are a `load=` file, give a harmless "no clock" report.)
5. **Every bug hunt**: confirm each listed symptom really happens in the buggy code, and that the fix removes it.
6. **Tinker tasks and Level Up hints**: spot-check that the suggested code works.
7. Check the output: CRLF endings, no semicolons in code, only starter images, `(js)` after inline code.

If a test fails, fix the *lesson*, not just the test.

## 9. What's next

### Week 6: Gravity, Physics & Platforms ("Coin Dash")

Original plan (Steve approved the shape):

| Lesson | Focus |
| ------ | ----- |
| 1 | **Physics**: `setGravity`, `body()`, `isGrounded()`, jumping. Predict/tweak gravity and jump force; "floaty vs snappy" and game feel. |
| 2 | **Level maps**: `addLevel()` with an array of strings, tile definitions. Students edit characters to design their own map; arrays as data, design on paper first. |
| 3 | **Pickups and hazards**: coins, spikes, goals; `onCollide` with tags; level progression with an array of level maps and a `currentLevel` index. |
| 4 | **Build** (student-led): their own platformer levels, swap maps and playtest. |

Prototype "Coin Dash": collect coins, avoid spikes, reach the exit. Level Up ideas: double jump, moving platforms, a patrolling enemy, a speedrun timer, a level-select scene.

Notes for the build:
- **Verify the physics API in v4000 before writing** (gravity, `body()`, `isGrounded`, `addLevel` options may differ from older Kaplay). Remember gotcha 1 (collisions with `body()` objects behave differently from sensors).
- Reuse Week 4/5 patterns: global state (`currentLevel`, `coins`), `createHud()` that watches, scenes for title/game/gameover/win, `loseLife()`-style helper.
- Level maps are arrays of strings (a Week 3 callback: arrays and `for...of`). Keep tiles to a few characters.
- Also needed: `week6-intro.md`, `week6-lesson1..4.md`, `week6-teach.md`, `_assets/coin-dash.js`, sidebar lesson labels (currently blank), README notes (I wrote a guess).

### Project (four weeks)

Brief: design and build an **original game that combines at least two mechanics from the course**, has **at least two scenes**, tracks **game state**, and can be won or lost. Sidebar pages exist: `project-intro.md`, `project-design.md`, `project-dev.md`, `project-testing.md`, `project-teach.md`.

| Week | Focus | Checkpoint |
| ---- | ----- | ---------- |
| P1 | Design and core mechanic | One-page design doc approved; core mechanic playable by the end of the week (paper prototype, then smallest possible version) |
| P2 | Build out | Start, play and end scenes; peer playtest #1 with a feedback sheet |
| P3 | Content and bug-fixing | Feature freeze at the end of the week; peer playtest #2; structured debugging log |
| P4 | Polish and showcase | Sound, juice, instructions; final submission, gallery/arcade day, reflection write-up |

Support ideas: scope cards (Must/Should/Could), a **mechanic menu** pointing back to each week's code, a "stuck protocol" (read the error, check the console, ask three classmates, then the teacher), stretch ideas for strong students. Assessment: working game, design doc, playtest feedback log, reflection.

## 10. Open items for Steve

- **Names disagree:** Week 3 is "Game Data & Progress" (sidebar), "Game Data & User Interface" (README) and "Data & Displaying Data" (`week3-intro.md` H1). Week 4's sidebar says "Scenes"/"Haunted House" for lessons 1 and 4, but the files say "Rooms"/"Build a Haunted House". Week 6 is "Gravity & Physics" in the sidebar and "Gravity, Physics & Platforms" in the README.
- Weeks 1-2: check any `onCollide` use against gotcha 1.
- The README Week 5/6/Project notes were written by the assistant as guesses; the Week 5 game label was changed from "Space Invaders-ish" to "Bug Blaster".

## 11. How to work with Steve

- He prefers **simple, direct** communication; start working when the request is clear, and ask one short question if it's truly ambiguous.
- He reviews outlines well: for a new week, propose a one-page outline per lesson (one line each for P, R, I, M, M, plus the size budget) and **get a yes** before building.
- He pushes back when material is too busy or when a pattern isn't idiomatic. He wants to **lean in to the Kaplay way** where it teaches well, with consistency across weeks where it doesn't conflict.
- Deliver weeks as a zip in the layout above, and say plainly what was tested and what wasn't.