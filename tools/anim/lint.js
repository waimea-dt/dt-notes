/**
 * lint.js - Lints the animation engine (every anim-*.js part docs/index.html lists, and
 * animation.js) and these tools with ESLint (installed globally), using eslint.config.js here
 * rather than any config the repo might have.
 *
 *   node tools/anim/lint.js
 */

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const REPO = path.resolve(__dirname, '../..')
const parts = fs.readFileSync(path.join(REPO, 'docs/index.html'), 'utf8').match(/_plugins\/visualisation\/anim[\w-]*\.js/g).map((part) => `docs/${part}`)
const tools = fs.readdirSync(__dirname).filter((file) => file.endsWith('.js')).map((file) => `tools/anim/${file}`)
const files = [...parts, 'docs/_plugins/visualisation/animation.js', ...tools]

const result = spawnSync('eslint', ['--no-config-lookup', '--config', path.join(__dirname, 'eslint.config.js'), '--max-warnings', '0', ...files], { cwd: REPO, stdio: 'inherit' })
if (result.error) console.error(`eslint couldn't run (${result.error.message}): it's installed globally, through nvm`)
else if (!result.status) console.log(`${files.length} files lint clean`)
process.exitCode = result.error ? 1 : result.status
