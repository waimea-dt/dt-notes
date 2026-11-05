# SQLite Course: Hand-off

This file is loaded automatically when you work in this folder. It records what has been decided about the course so far, so the author (Steve) doesn't have to explain it again.

**Rule zero:** Steve edits the files himself. Before changing anything, **read the current file in the repo**. If it differs from anything written here, the repo is right. If you need to change something he has edited, say so and ask first.

The **Kaplay course** (`../kaplay/`) is the model for structure, tone, pacing and format. Read `../kaplay/CLAUDE.md` and a couple of its lessons (e.g. `week3-lesson2.md`, `week4-lesson4.md`) before writing anything here.

---

## 1. What this is

A Year 12 (NZ secondary, Digital Technologies) course on **databases with SQLite, SQL and Python**, assessed against **91892**, *Use advanced techniques to develop a database*.

- **Five teaching weeks** (4 lessons each, **1 hour per lesson**), then a **three-week project**.
- Delivered from Steve's **docsify "DT-Notes" site** under `/courses/200dtd/sqlite/`.
- Students already know some Python (from earlier years) and have just done the Kaplay JavaScript course.
- Progression: SQL basics (in the browser) → building tables → linked tables and JOINs → SQLite from Python (a plain CLI) → a Streamlit UI → the project.
- Students meet OOP **next year**, so keep the Python **procedural**: functions and plain data, **no classes**.

## 2. Status

| Week    | Theme                 | Build                     | Status      |
| ------- | --------------------- | ------------------------- | ----------- |
| 1       | Asking Questions      | Data Detective            | Scaffolded  |
| 2       | Building Tables       | Build a Table             | Scaffolded  |
| 3       | Linking Tables        | Build Linked Tables       | Scaffolded  |
| 4       | SQLite in Python      | Build a CLI App           | Scaffolded  |
| 5       | Apps with Streamlit   | Build a Streamlit App     | Scaffolded  |
| Project | Design & Build a Database App | Student's own     | Scaffolded  |

The structure below has been agreed in outline. **Scaffolded** means the page exists with its section headings only (from the lesson template in section 6), and no content yet. `README.md` and `_sidebar.md` are complete, and their lesson titles are the ones to use. Icons: W1 `search`, W2 `grid-2x2-plus`, W3 `link`, W4 `terminal`, W5 `app-window`, Project `lightbulb`, course `database`. The course logo is `_assets/sqlite-logo.svg`, a copy of the one in `/db/sql/_assets/`: a leading `/` in Markdown image paths is resolved relative to the page's folder, so use paths relative to the course folder. Before building a week, propose a one-page outline of its lessons (one line each for P, R, I, M, M, plus the size budget) and **get a yes from Steve**.

## 3. Key decisions (and why)

- **Linked tables come before Python** (W3, still in the SQL runner). All the SQL is learned in the browser, with in-page PRIMM and no setup. The Python weeks then work with relational data from the start, so query functions include JOINs from day one and W5 reuses them unchanged. It also matches the project, which starts with multi-table design.
  - The risk is three weeks of SQL before anything feels like an app. Keep the weekly builds feeling like *making* something, not doing exercises.
- **No `rich` library.** It would be used for about two lessons and then never again, and `st.dataframe` replaces it in W5. Plain `print()` with f-string padding (`f"{name:<20}"`) is about as short and is a general Python skill. Rich is allowed only as an optional **Level Up** in W4.
- **Keep a plain-Python CLI stage (W4)** before Streamlit. Learning sqlite3 and Streamlit's rerun model at the same time is too much at once.
- **W1 to W4 L2 run entirely in the site; the first GitHub repo is in W4 L3.** Code editors save edits in the browser (section 7), so the W1-W3 builds are done on build pages in the site, with no repo. W4 L1-2 use the in-page Python runner (`:memory:` databases, fake `input()`). From W4 L3 (the menu app needs real `input()` and a real `.db` file), work is local in VS Code, in a repo made from the starter.
  - Caveats (tell students, and design around them):
    - **Saved edits are per browser, per device.** Shared lab PCs, clearing browsing data, or switching devices lose the work. That's acceptable because the weekly builds are standalone.
    - **Changing a block's original code on the page throws away students' saved edits to that block** (`persist.js` only restores a save if the page version is unchanged). Keep the starter code in build pages minimal (e.g. `-- Your CREATE TABLE here`), and avoid editing build pages once students have started.
    - **The teacher can't see the work** (the same as `<response>` answers in Kaplay). If a record is wanted, end each W1-W3 build with "copy your final SQL into ..." (see open items).
- **Do venv / `pip install -r requirements.txt` setup in W4 L3's repo setup** (the starter's `requirements.txt` includes `streamlit`). Otherwise the first package install would land in W5 alongside the rerun model.
- **Gaming is the running example in the lessons**: a `games` table (e.g. name, genre, year, rating, hours played), which gains a `studios` table (one-to-many) in W3. Nerdy, easy to read, plenty to query.
- **Weekly builds use a standalone database each week** (Steve's decision), not one database that grows. Each build is self-contained, as in Kaplay, so a missed week doesn't break the next one. **Extension tasks** (Level Up) give stronger students more to do.
  - Builds offer a **choice of topics** with the same shape: games/studios, music/genres (or artists/albums), movies/studios, books/authors, and so on. In W4 and W5 students pick one of the provided databases (`schema.sql` + `seed.sql` for each topic). In W2 and W3 they can pick a provided topic or invent their own.
  - Topics are paired as **parent / child** so they work for one-to-many in W3 onwards. Keep every provided topic to a similar size and shape, so one set of instructions fits all of them.
- **Code pattern from W4 on (the through-line, like Kaplay's helper functions and HUD):** all SQL lives in small **query functions** (`get_all_games()`, `find_games(genre)`, `add_game(name, genre, studio_id)`). Queries are **always parameterised** with `?`, never f-strings. UI code (the CLI menu, later Streamlit) only calls those functions. Within W5, the lesson is "the UI changed, the query functions didn't": students bring the W4 functions across for the same topic, or the W5 build gives them a ready-made `db.py`. This is also the structure the project uses (a `db.py` module).
- **Link to the existing reference notes** in `/db/` ("more detail here") instead of copying them. See section 7.

## 4. Course outline

### Week 1: **Asking Questions** (SELECT), in the `sql run` runner

Uses a hidden `id=seed` block with about 20 games, so there's no setup and students start querying straight away.

| L | Title | Focus | PRIMM highlights |
|---|-------|-------|------------------|
| 1 | Tables & SELECT | Tables, rows, columns, primary key. `SELECT` columns, `*`, `ORDER BY`, `LIMIT` ("top 5") | Predict which rows/columns come back. Drag-drop the clause order. Bug hunt: misspelt column, ORDER BY before FROM |
| 2 | Filtering with WHERE | `=`, `<`, `>`, `AND`/`OR`, `LIKE` with `%`, quotes around text | Predict the row count. Bug hunt: missing quotes, `=` where `LIKE` was needed, AND/OR logic slip |
| 3 | Counting & Summaries | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `AS`, `GROUP BY` | "Which genre has the most hours played?" Investigate why `GROUP BY` changes the row count |
| 4 | **Build: Data Detective** | Student-led. A new, bigger dataset (e.g. an arcade's high-score log) with a "case file" of questions to answer with queries. Then they write 5 questions of their own and swap with a partner | Week 1 Check quiz |

### Week 2: **Building Tables** (CREATE, INSERT, UPDATE, DELETE), in the runner

| L | Title | Focus | PRIMM highlights |
|---|-------|-------|------------------|
| 1 | CREATE TABLE | Data types (`INTEGER`, `TEXT`, `REAL`), `PRIMARY KEY`, `NOT NULL`, `DEFAULT`. Show the result with `<erd>` / `<db-schema>` | Predict which type suits which field. Bug hunt: wrong types, a missing comma |
| 2 | INSERT | Single and multi-row inserts, letting the id fill itself in, constraint errors | Investigate what happens when you break `NOT NULL`. Tinker: add rows, then query them with W1 skills |
| 3 | UPDATE & DELETE | `UPDATE ... SET ... WHERE`, `DELETE ... WHERE`. Habit: run a SELECT with the same WHERE first | Bug hunt: a forgotten `WHERE` updates **every** row (the memorable one) |
| 4 | **Build: Build a Table** | Pick a topic (from the list or their own) and plan the fields on paper. On an in-site build page (see the build-page pattern in section 7), write a CREATE block, an INSERT block (10+ rows) and query blocks (6+ useful queries) | Week 2 Check |

### Week 3: **Linking Tables** (foreign keys and JOINs), in the runner

| L | Title | Focus | PRIMM highlights |
|---|-------|-------|------------------|
| 1 | Foreign Keys | Repeated data is a problem (a light touch of normalisation). Split `games` into `games` + `studios`, `REFERENCES`, one-to-many, ERDs with `<erd>`, `PRAGMA foreign_keys = ON` | Predict which insert fails. Investigate an orphan row with FKs off vs on |
| 2 | JOIN | `JOIN ... ON`, `table.column`, table aliases, JOIN + WHERE / ORDER BY | Drag-drop to match the ON clause to the keys. Bug hunt: ambiguous `name`, wrong ON column (too many rows) |
| 3 | More JOINs | JOIN + `GROUP BY` ("games per studio"), `LEFT JOIN` via Investigate ("where did the studio with no games go?"). Many-to-many link tables as a Level Up / project preview | Predict the row counts for JOIN vs LEFT JOIN |
| 4 | **Build: Build Linked Tables** | On an in-site build page: a fresh parent/child pair of tables (a provided topic or their own), with a CREATE block including a FK, seed data, an `<erd>` of their design, and joined queries. Extension: a many-to-many link table | Week 3 Check |

### Week 4: **SQLite in Python** (L1-2 in the page; local VS Code from L3; plain `print` / `input`)

| L | Title | Focus | PRIMM highlights |
|---|-------|-------|------------------|
| 1 | Connect & Query | In the page: `sqlite3.connect(":memory:")`, `execute`, `fetchall`, rows as tuples, looping over results (including a JOIN). Setup SQL lives in a hidden block | Predict what `print(rows)` shows. Investigate `fetchone` vs `fetchall` |
| 2 | Parameters & Changing Data | In the page: `?` placeholders, search driven by (faked) `input()`, INSERT/UPDATE/DELETE from Python, `commit()`. **Why not f-strings**: SQL injection / Bobby Tables (`/db/sql/_assets/xkcd-sql.png`). Introduces the query-function pattern | Bug hunt: `(genre)` instead of `(genre,)`, f-string injection. (The "no `commit()` so the data vanishes" bug needs a real file, so it moves to L3) |
| 3 | A Menu App | **Repo setup** (starter template, venv, `pip install -r requirements.txt`, `build_db.py` makes `data.db`). `while True` menu loop, `if/elif`, f-string padded tables, validating input, adding a child row by showing the parents and picking an id | Predict the menu flow. Bug hunt: no `commit()`, so additions vanish when the program restarts; inserting a studio *name* where its id should go. Level Up: `rich` |
| 4 | **Build: CLI App** | A menu app over a **provided** 2-table topic database (they choose the topic): list (joined), search, add, update, delete. Extensions: stats from `GROUP BY`, sorting options, `rich` | Week 4 Check |

Week 4 is the densest week. If it overruns, move the "pick a parent" pattern to W5 L2, where it becomes a `selectbox`.

### Week 5: **Apps with Streamlit**

| L | Title | Focus | PRIMM highlights |
|---|-------|-------|------------------|
| 1 | Hello Streamlit | `streamlit run app.py`, `st.title` / `st.write` / `st.dataframe` showing a query result. **Key mental model: the whole script reruns top to bottom on every interaction** | Predict what happens to a counter variable when a button is clicked (it resets) |
| 2 | Widgets & Filters | `text_input`, `selectbox`, `slider` feeding parameterised queries. A selectbox filled from the parent table (`format_func` to show names, return ids) | Tinker: add a filter, add a sort option |
| 3 | Forms & Changing Data | `st.form` + `st.form_submit_button` → INSERT, `st.success` / `st.error`, simple validation, edit/delete chosen from a selectbox | Bug hunt: a button-driven insert that misbehaves on rerun, missing validation |
| 4 | **Build: Streamlit Front End** | A Streamlit UI over a provided topic database. Students who pick their W4 topic reuse their own query functions unchanged; anyone else starts from a provided `db.py`. Extensions: summary stats with `st.metric`, a second page of data, edit/delete | Week 5 Check |

Keep Streamlit small: no `session_state`, caching, multipage apps or pandas in the teaching weeks (Level Up / project only, if at all). `st.dataframe` accepts a list of dicts (`[dict(row) for row in rows]` with `sqlite3.Row`), so pandas isn't needed.

### Project (3 weeks): **Design & Build a Database App** (91892)

The brief: a database-backed Streamlit app for a purpose of the student's choice, with **at least 3 tables** and foreign keys (ideally including a link table), JOIN queries, full CRUD through the UI, input validation, and realistic test data.

| Week | Focus | Checkpoint |
|------|-------|------------|
| P1 | Design | Purpose and users, ERD, normalisation check, `schema.sql` + seed data (Mockaroo, see `/tools/db-gen.md`), key queries tested in the runner or SQLite Studio |
| P2 | Build | `db.py` query functions + Streamlit pages (view/search, add, edit/delete). Peer test #1 |
| P3 | Test & Refine | Test plan (valid / boundary / invalid input, FK integrity), fixes, polish, reflection and evidence |

Pages mirror Kaplay: `project-intro.md`, `project-design.md`, `project-dev.md`, `project-testing.md`, `project-teach.md`. Support ideas carried over from Kaplay: Must/Should/Could scope cards, a "concept menu" pointing back to each week, a "stuck protocol". **Check the 91892 standard and its clarifications** before writing the project pages, so the evidence students collect matches what's assessed.

## 5. File layout

All files go under `docs/courses/200dtd/sqlite/`, mirroring Kaplay:

```
CLAUDE.md                  this file
README.md                  home page (<menu> cards per week + a PRIMM table, like kaplay/README.md)
_sidebar.md                breadcrumb header, week > lessons menu, "Teaching Slides" list (copy kaplay/_sidebar.md's format)
_assets/                   seed .sql files, finished example apps (.py), fallback databases
weekN-intro.md             overview table (Lesson | Title | You will learn) + a preview of the finished build
weekN-lesson1..4.md        student worksheets
weekN-teach.md             reveal.js slides, one <slides> block per lesson
project-*.md               project pages
```

- Use **CRLF** line endings to match the rest of the repo.
- **Steve merges the sidebar and README entries himself**: propose the text, and don't assume it has been merged.
- The course card in `../README.md` links to `/courses/200dtd/sqlite/` (fixed 2026-11-05).
- **Starter template repo** (Steve is creating it; suggested name `waimea-dt/sqlite-starter`). As in Kaplay, students make a **new repo from the template for each build** (the "Repo Setup" section of lesson 4). It is **first needed in W4 L3** (W1-W4 L2 run in the site; see section 3). It's used for the W4 and W5 builds and the project. Suggested contents:
  - `schema.sql`, `seed.sql`, `queries.sql` (with comment headers)
  - `requirements.txt` (`streamlit`) and a `.gitignore` (`.venv/`, `*.db`, `__pycache__/`)
  - `build_db.py`: runs `schema.sql` + `seed.sql` into `data.db` with `executescript`
  - `topics/` (or `data/`): the provided topic databases for the W4/W5 builds (games/studios, music, movies, books, ...), each as `schema.sql` + `seed.sql` of a similar size and shape
  - Agree the final contents with Steve before writing lessons that depend on them.

## 6. The lesson template

The template is the **same as Kaplay** (full details are in `../kaplay/CLAUDE.md` section 4):

1. `# Lesson N: Title` + a 2-3 sentence hook
2. `## Warm-Up`: 3 retrieval questions on **earlier** lessons, each with `<response>`
3. `## Learning Goals`: 4-5 `- <check>` items
4. `## The Big Idea: **…**`: a short explanation, one reference table, callouts
5. `## **P**redict` / `## **R**un`
6. `## **I**nvestigate`: questions, drag-drop, traces
7. `## **M**odify`: `### Bug Hunt` (2-3 planted bugs as `<check>`s, in the order the student will meet them, + a TIP) and `### Tinker` (4 tasks)
8. `## **M**ake`: requirements as `<check>`s + a starter with `-- TODO:` / `# TODO:` comments, then `### Level Up` (table: Challenge | Hint)
9. `## Exit Ticket`: a 3-question `<quiz>` (lesson 4 has a "Week N Check" of about 5)

**Lesson 4 is always student-led**: the brief, a "must have" checklist, a toolkit (copy-paste queries/functions from the week), Plan First, Repo Setup (`<github>`), Build (checkpoints), Test with a partner, Level Up, Week Check. It is **not a recipe**. W1-W3 builds happen in the page, so they have no Repo Setup: replace it with a short note that their work saves in this browser on this device.

**Size budgets** (Steve's main complaint about early Kaplay drafts was "each lesson has enough for two hours", so **cut, don't add**): about 100-125 lines of code in total, about 1,000 words of prose, 4 runnable blocks or fewer, 8-10 `<response>`s or fewer, **one new idea per lesson**.

**Slides** (`weekN-teach.md`): one `<slides>` block per lesson, 5-8 slides: a title with `Note:` teacher notes, Learning, one slide per key idea with a small code sample, then Make.

## 7. Site tooling for this course

Plugin syntax is in `docs/_plugins/PLUGIN_REFERENCE.md`. Example pages are in `docs/_tests/` (`sql.md`, `erd.md`).

- **SQL runner** (`docs/_plugins/database/sql-runner.js`, Codapi `sqlite` sandbox):
  - ` ```sql run ` gives an editable, runnable block.
  - ` ```sql id=seed depends=setup ` (no `run`) is a **hidden** setup block.
  - ` ```sql run depends=seed ` runs the hidden chain first, then the visible query.
  - The visible form is ` ```sql run id=x depends=y ` (in that order). Ids are word characters only.
  - Each run starts from a **fresh database** built from the depends chain. Nothing persists between blocks or page loads.
  - **Edits are saved in the browser** (localStorage, via `DocsifyPersist.bindEditor` in `core/persist.js`) and come back after a reload, with a "Reset code" button. That's true of every code editor on the site: SQL runner, `<erd>`, Python runner, `python test`'s tests panel, JS, Kotlin and the web playground (the SQL runner, ERD and `python test` were added on 2026-11-05 and tested in a browser). Saves are per browser and per device (see the caveats in section 3).
  - **Build-page pattern (for the W2/W3 builds; tested 2026-11-05):** chain *visible*, editable blocks so students write the whole database themselves:

    ````
    ```sql run id=schema
    -- Your CREATE TABLE here
    ```

    ```sql run id=seed depends=schema
    -- Your INSERTs here
    ```

    ```sql run depends=seed
    -- Your query here
    ```
    ````

    Edits to `schema` and `seed` feed every block that depends on them, both straight away and after a reload (tested in a headless browser). Several query blocks can all use `depends=seed`.
  - SQL statements end with `;` (the "no semicolons" rule is for JavaScript only).
- `<erd>` wrapping an SQL `CREATE TABLE` fence draws an ERD. `<db-schema>` / `<db-data>` render schema and data tables.
- **Python runner**: ` ```python run ` (Codapi, `coding/python-runner.js`) and ` ```python trace `. `python-test.js` uses Pyodide v0.25.
  - **Tested by Steve (2026-11-05):** `sqlite3` works in the `python run` sandbox (SQLite 3.42.0). `:memory:` databases, `CREATE` / `INSERT` with `?` parameters, `commit()`, `JOIN`, and `PRAGMA foreign_keys = ON` (it raises `IntegrityError`) all work.
  - **Writing a file database fails**: `sqlite3.connect("test.db")` produced no output and no visible error. So in-page Python examples must use `sqlite3.connect(":memory:")`, with the setup SQL in a hidden block (see below) or at the top of the visible block. Real `data.db` files are only for students' local repos.
  - **Hidden blocks**: ` ```python id=NAME ` is hidden, and ` ```python run depends=NAME ` adds that hidden code to the start of the visible block when it runs. Each visible block can use only **one** hidden block: unlike the SQL runner, hidden blocks can't depend on each other, and there's no `run id=` form. So one hidden block per page usually holds the database setup *and* any fake input together.
  - **`input()` raises `EOFError`** in the page runner (there's no stdin), and the plugin has no way to feed in input. **Decision: fake it in a hidden block with plain-text output** (Steve chose this over styled HTML output or a plugin change):

    ```python
    _answers = iter(["Puzzle", "3"])

    def input(prompt=""):
        answer = next(_answers)
        print(f"{prompt}▸ {answer}")
        return answer
    ```

    The `▸` marks what the "user typed". The answers are fixed, so students can't type their own in the page; for that (e.g. trying a SQL injection), they run the code locally.
  - So W4 L1-2 can do Predict/Run in the page. The menu app (L3), the build (L4) and all of W5 (Streamlit) run locally.
- The other widgets are the same as in Kaplay: `<response>`, `<check>`, `<quiz>`, `<drag-drop>` (ordering SQL clauses is a natural fit), `<slides>`, `<github>`, `> [!NOTE|TIP|IMPORTANT|WARNING]` callouts, Lucide icons, and inline code followed by `(sql)` or `(python)`.
- **Existing reference notes to link to** (don't duplicate them): `/db/db.md`, `/db/normal.md`, `/db/relationship.md`, `/db/crud.md`, `/db/sql/` (cheatsheet, create, foreign, linking, insert, select-simple / where / order / summary / join / values, update, delete, injection). Tool lists: `/tools/db-edit.md` (SQLite Studio is recommended), `/tools/db-design.md` (DrawSQL), `/tools/db-gen.md` (Mockaroo), `/tools/db-online.md`.

## 8. Style

- Student-facing writing is for **secondary school students**: short sentences, plain words, friendly. Examples should have a **nerdy theme** (games, tech, monsters, bugs) and subtle, clever humour, never cringe.
- **Clarity over cleverness.** Code a junior can follow: explicit over implicit, early returns and guard clauses, small single-purpose functions, descriptive names, booleans that read as questions (`is_valid`), and comments that explain *why*, only where needed. Prefer the standard library.
- **SQL**: UPPERCASE keywords, `snake_case` plural table names (`games`, `studios`), `id` primary keys, `<singular>_id` foreign keys (`studio_id`), one clause per line for anything non-trivial, aligned columns in `CREATE TABLE` (as in `docs/_tests/sql.md`).
- **Python**: PEP 8, f-strings for output, **parameterised queries only**, no classes, no pandas. Keep the connection handling consistent across all lessons. Pick one pattern and use it everywhere: e.g. a `get_connection()` helper that turns on `PRAGMA foreign_keys` and sets `row_factory = sqlite3.Row`.
- Patterns should be **the same across weeks** on purpose. Students should recognise W4's query functions in W5.

## 9. Gotchas to design lessons around (verify each one by running it)

1. **`PRAGMA foreign_keys = ON` is per connection** and off by default. Without it, FK constraints are silently ignored. This makes a good W3 Investigate and needs to be in every Python connection helper.
2. **No `commit()` → changes vanish** when the program ends. This is the classic W4 bug hunt. `with sqlite3.connect(...) as conn:` commits or rolls back, but it does **not** close the connection.
3. **One-item parameters need a tuple**: `(genre,)`, not `(genre)`.
4. **UPDATE / DELETE without WHERE** hits every row.
5. SQLite's `LIKE` is case-insensitive for ASCII, but `=` is case-sensitive. A good Predict question.
6. SQLite is loosely typed: it will store `'abc'` in an `INTEGER` column. Worth one Investigate question in W2; don't overdo it.
7. `INTEGER PRIMARY KEY` already auto-numbers. `AUTOINCREMENT` only stops ids from being reused. Choose one and use it consistently. The existing `/db/` notes and `_tests/sql.md` use `AUTOINCREMENT`.
8. **Streamlit reruns the whole script** on every widget interaction, so ordinary variables reset. Put inserts behind `st.form` submits, not loose buttons that interact with other state.
9. `AVG` gives decimals, so use `ROUND(AVG(x), 1)` for readable output.
10. Each SQL runner block starts from a fresh database (see section 7), so "my INSERT disappeared" is expected behaviour in the browser. Explain it in W2 L2.

## 10. How we test (do this for every week)

- **Every `sql run` block**: run it with its full depends chain, and fail on SQL errors (apart from planted bugs). Check the hidden seed data produces the outputs the lesson describes (row counts, "top" answers, Data Detective answers).
- **Every bug hunt**: confirm each listed symptom really happens in the order listed, and that the fix removes it. Kaplay found several wrong symptom descriptions this way.
- **Every Python / Streamlit listing**: run it against the starter repo in a clean venv (`python file.py`, `streamlit run app.py`). For Streamlit, at least confirm the app starts without errors and that the main interaction works.
- **Output checks**: CRLF endings, size budgets, inline code tagged `(sql)` / `(python)`, links to `/db/` pages resolve.
- If a test fails, fix the *lesson*, not just the test. Say plainly what was tested and what wasn't.

## 11. Open items for Steve

### Resolved

- `sqlite3` in the Python runner: works for `:memory:` only. Hidden blocks work, and `input()` is faked (section 7).
- Course card link: fixed.
- Builds: standalone each week, with extension tasks, and a choice of topics (section 3).
- Running example: gaming (`games` + `studios`) in the lessons.
- Code editors save edits: done for every runner (section 7).
- Where work happens: in the site until W4 L2; first repo in W4 L3 (section 3).

### Decide before writing Week 1

1. **The lesson dataset.** The exact `games` columns and about 20 rows, plus the `studios` table that W3 splits out (W1 needs to be designed so that split makes sense in W3: e.g. a studio name repeated across games, with a typo in one of them). Every week's examples, bug hunts and quiz answers depend on this.
2. **The Data Detective dataset** (W1 L4): its theme, tables and the case-file questions.
3. **Student devices.** Mostly their own laptops (in-site saving is fine), or shared lab PCs (in-site W1-W3 builds are fragile)?
4. **A record of in-site builds.** Nothing, or "copy your final SQL into the assignment/class doc" at the end of each W1-W3 build?
5. **SQL conventions.** `INTEGER PRIMARY KEY` vs `AUTOINCREMENT` (the existing `/db/` notes use `AUTOINCREMENT`), and whether every statement ends with `;`.

### Decide before Week 4

6. **The starter repo**: its name and contents (section 5), and the list of provided build topics with their fields (all one parent/child shape).
7. **The local setup on school machines**: Python version, whether venvs and `pip install streamlit` work on the school network, and which tool students use to view a `.db` file (SQLite Studio, as listed in `/tools/db-edit.md`, or a VS Code extension).
8. **The connection pattern**: tuples first and then `sqlite3.Row` (needed for `st.dataframe`), or `Row` from the start, plus what `get_connection()` looks like. Both W4 and W5 depend on it.

### Decide before the project

9. **The 91892 mapping**: which evidence students collect (design, ERD, testing, reflection), the minimum scope (3 tables? a link table required?), and whether the UI must be Streamlit or a CLI is allowed.

### Can be proposed by the agent when building (Steve approves the outline)

- Week and lesson titles for the sidebar, Lucide icons, intro-page previews (an SQL week has no "finished game" to show, so perhaps a sample query result or an ERD), and slides, which follow the Kaplay format by default.

## 12. How to work with Steve

- He prefers **simple, direct** communication. Start working when a request is clear, and ask one short question if it's truly ambiguous.
- For each new week, propose the lesson outline and **get a yes** before building.
- He pushes back on material that's too busy, and on tools or patterns that don't earn their place (that's why `rich` was dropped). Keep things lean and consistent across weeks.
