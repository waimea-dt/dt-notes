// The animation preview pane's page (preview-pane.js makes it). The site's helpers, engine and
// widget are loaded before this; it runs the plugin's Docsify hooks itself on the block the
// extension sends, then tells the widget which beat to show (an `anim-show` event, animation.js),
// and tells the extension where the viewer's own stepping lands (the widget's `anim-beat` event).
;(function () {
  const vscode = acquireVsCodeApi()
  const page = document.querySelector('.markdown-section')
  const where = document.querySelector('.dtn-preview-where')
  const empty = page.innerHTML
  const base = document.head.appendChild(document.createElement('base')) // images resolve from the file's folder

  // The bar's options (both on at first), kept while the pane is open
  const options = { replay: document.querySelector('.dtn-preview-replay'), sync: document.querySelector('.dtn-preview-sync') }
  const saved = { replay: true, sync: true, ...vscode.getState() }
  for (const [name, box] of Object.entries(options)) {
    box.checked = saved[name]
    box.addEventListener('change', () => vscode.setState({ ...vscode.getState(), [name]: box.checked }))
  }

  // Docsify's hooks, as the site's plugins registered them (window.$docsify.plugins)
  const hooks = {}
  const hook = new Proxy({}, { get: (_, name) => (fn) => (hooks[name] ||= []).push(fn) })
  for (const plugin of window.$docsify.plugins || []) plugin(hook, {})
  const pipe = (name, value) => (hooks[name] || []).reduce((v, fn) => fn(v) ?? v, value)
  const DOCSIFY_FLAGS = /\s*\{docsify-ignore(-all)?\}/g // heading flags Docsify takes out itself

  // The site's theme follows VS Code's (light or dark); a change redraws (animation.js)
  function syncTheme() {
    const theme = [...document.body.classList].some((c) => /^vscode-(high-contrast-)?light$/.test(c)) ? 'light' : 'dark'
    if (document.documentElement.dataset.theme === theme) return
    document.documentElement.dataset.theme = theme
    window.dispatchEvent(new Event('docsify-theme-change'))
  }
  new MutationObserver(syncTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] })
  syncTheme()

  let shown = null // the block's markdown
  let beat = 0

  function build(markdown) {
    page.style.minHeight = `${page.offsetHeight}px` // holds the scroll place while it's rebuilt
    try {
      page.innerHTML = pipe('afterEach', marked.parse(pipe('beforeEach', markdown).replace(DOCSIFY_FLAGS, '')))
      ;(hooks.doneEach || []).forEach((fn) => fn())
    } catch (error) {
      window.DocsifyUtils.renderErrorBox(page, `Preview failed: ${error.message}`)
    }
  }

  // The widget is built once the fonts have loaded (animation.js), so this waits for them too
  const show = (to, play) => document.fonts.ready.then(() => {
    page.style.minHeight = ''
    page.querySelector('.animation')?.dispatchEvent(new CustomEvent('anim-show', { detail: { beat: to, play } }))
  })

  window.addEventListener('message', ({ data }) => {
    if (data.type === 'empty') {
      shown = null
      page.innerHTML = empty
      return
    }
    where.textContent = data.where
    base.href = data.base
    const changed = data.markdown !== shown
    if (changed) build(data.markdown)
    shown = data.markdown
    const to = data.beat ?? beat
    if (changed || to !== beat) show(to, changed && data.play && options.replay.checked)
    beat = to
  })

  // Stepping in the pane (buttons, keys, the progress bar) moves the editor's cursor to that beat,
  // with "Sync cursor" ticked
  page.addEventListener('anim-beat', ({ detail }) => {
    beat = detail.beat
    if (options.sync.checked) vscode.postMessage({ type: 'beat', beat })
  })

  vscode.postMessage({ type: 'ready' })
})()
