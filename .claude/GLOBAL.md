## Working with Steve

- Criticism is welcome:
    - Tell me when I am wrong or mistaken, or if you think I might be.
    - Tell me if there is a better approach than the one I am taking.
    - Tell me if there is a relevant standard or convention that I appear to be unaware of.
- Be concise:
    - Short summaries are preferred - stick to the point
    - Don't give an extended breakdown unless we are working through the details of a plan.
    - Do not flatter or give compliments unless I ask. Occasional pleasantries are fine.
- Confirm first:
    - Unless specifically instructed to begin a task, don't.
    - State your plan first and get confirmation to begin.
- Clarify ambiguity:
    - Ask pertinent question when requirements are unclear instead of guessing.
    - Briefly note key assumptions before making edits or running major changes.

## Code

- Style:
    - Match the existing style of a file or project when a local convention exists.
- Future-proof:
    - Prioritise maintainability and ease of extension over clever shortcuts.
    - Don't add one-off, hard-coded features when existing structures could be extended.
    - If refactoring would genuinely improve the extensibility of a system, suggest it.
- Focused:
    - Scope edits tightly. Make the smallest change needed.
    - Keep functions small and focused.
    - Avoid touching unrelated code or refactoring unless asked.
    - Keep code DRY with helper functions and reusable pieces.
    - Brief comments only where behaviour is non-obvious.
- JS:
    - `const`/`let`, never `var`.
    - No semi-colons, except as separators in one-liner functions.
    - Cache DOM lookups - avoid selector queries in loops.
- CSS:
    - Modern nested CSS as much as makes sense.
    - Structure / nesting follows the HTML structure.
    - Use existing theme / site custom properties before inventing new values.

## Global Tools

- `eslint`:
    - Installed globally via nvm. Use it.
    - Runs directly in any directory
- `puppeteer`:
    - `NODE_PATH` is exported in `~/.bashrc`, so `require('puppeteer')` works anywhere.

## Testing

- Browser/UI changes:
    - Verify with headless puppeteer.
    - Take screenshots for visual changes.
- No tooling unless asked:
    - Keep test scripts in the scratchpad.
    - Don't add test tooling or dependencies to repos.

## Writing

- Write like Steve:
    - Use a minus sign/hyphen (-), not an em-dash (—).
    - Style should be simple, clear, helpful, friendly (but not cute)
- Short and sweet:
    - Keep reference docs/cheat-sheets terse (one example per line, short comments, no design history).

## Git

- Commits:
    - Keep commits atomic (e.g. one per feature, syntax change or refactor)
    - Make them self-explanatory
    - Split different concerns into separate commits
- Messages
    - Simple changes: One-line commit only
    - Complex changes: Short summary explaining what/why
    - Reference issues in footer


