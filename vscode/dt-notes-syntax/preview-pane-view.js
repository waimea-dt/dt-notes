// The block preview pane's page (preview-pane.js makes it). The site's helpers and plugins are
// loaded before this; it runs their Docsify hooks itself on the block the extension sends, then
// tells the built widget where to be (a `preview-show` event: { position, play }), and tells the
// extension where the viewer's own stepping goes (the widget's `preview-position` event).
;(function () {
  const vscode = acquireVsCodeApi()
  const page = document.querySelector('.markdown-section')
  const picker = document.querySelector('.dtn-preview-blocks')
  const cursorLine = document.querySelector('.dtn-preview-line')
  const empty = page.innerHTML
  const base = document.head.appendChild(document.createElement('base')) // images resolve from the file's folder

  // The bar's options (both on at first), kept while the pane is open
  const options = { replay: document.querySelector('.dtn-preview-replay'), sync: document.querySelector('.dtn-preview-sync') }
  const saved = { replay: true, sync: true, ...vscode.getState() }
  for (const [name, box] of Object.entries(options)) {
    box.checked = saved[name]
    box.addEventListener('change', () => vscode.setState({ ...vscode.getState(), [name]: box.checked }))
  }
  const replays = document.querySelector('.dtn-preview-replays')

  // Libraries' stylesheets go before the site's, so the site's restyle them (as loadStyle does on
  // the site, where it finds them by their relative _css/ paths, which the pane's aren't)
  const firstSiteStyle = document.querySelector('link[data-site]')
  new MutationObserver((changes) => {
    for (const { addedNodes } of changes) {
      for (const node of addedNodes) {
        const afterSite = firstSiteStyle.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
        if (afterSite && node.matches?.('link[rel="stylesheet"]:not([data-site])')) document.head.insertBefore(node, firstSiteStyle)
      }
    }
  }).observe(document.head, { childList: true })

  // Docsify's hooks, as the site's plugins registered them (window.$docsify.plugins)
  const hooks = {}
  const hook = new Proxy({}, { get: (_, name) => (fn) => (hooks[name] ||= []).push(fn) })
  for (const plugin of window.$docsify.plugins || []) plugin(hook, {})
  const pipe = (name, value) => (hooks[name] || []).reduce((v, fn) => fn(v) ?? v, value)
  const DOCSIFY_FLAGS = /\s*\{docsify-ignore(-all)?\}/g // heading flags Docsify takes out itself

  // The site's theme follows VS Code's (light or dark); plugins redraw on the site's theme event
  function syncTheme() {
    const theme = [...document.body.classList].some((c) => /^vscode-(high-contrast-)?light$/.test(c)) ? 'light' : 'dark'
    if (document.documentElement.dataset.theme === theme) return
    document.documentElement.dataset.theme = theme
    window.dispatchEvent(new Event('docsify-theme-change'))
  }
  new MutationObserver(syncTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] })
  syncTheme()

  let shown = null // the block's markdown
  let widget = '' // the built widget's selector
  let position = null
  const samePlace = (a, b) => JSON.stringify(a) === JSON.stringify(b)

  // The bar's list of the file's blocks, rebuilt only when their names change. Outside every block
  // (index -1) it shows a placeholder.
  const placeholder = new Option('Choose a block', -1)
  placeholder.disabled = placeholder.hidden = true
  let titles = []
  function listBlocks(next, index) {
    if (!samePlace(next, titles)) {
      titles = next
      picker.replaceChildren(placeholder, ...titles.map((title, i) => new Option(title, i)))
    }
    picker.value = index
    picker.disabled = titles.length < 2 && index >= 0
    picker.parentElement.classList.toggle('dtn-preview-fixed', picker.disabled)
    picker.parentElement.hidden = !titles.length
  }
  picker.addEventListener('change', () => vscode.postMessage({ type: 'block', index: Number(picker.value) }))

  function build(markdown) {
    page.style.minHeight = `${page.offsetHeight}px` // holds the scroll place while it's rebuilt
    try {
      page.innerHTML = pipe('afterEach', marked.parse(pipe('beforeEach', markdown).replace(DOCSIFY_FLAGS, '')))
      ;(hooks.doneEach || []).forEach((fn) => fn())
    } catch (error) {
      window.DocsifyUtils.renderErrorBox(page, `Preview failed: ${error.message}`)
    }
  }

  // Plugins build once the fonts have loaded (animation.js), so this waits for them too
  const show = (to, play) => document.fonts.ready.then(() => {
    page.style.minHeight = ''
    page.querySelector(widget)?.dispatchEvent(new CustomEvent('preview-show', { detail: { position: to, play } }))
  })

  window.addEventListener('message', ({ data }) => {
    cursorLine.textContent = data.line
    if (data.type === 'line') return // the pane's own cursor move: only the line changes
    listBlocks(data.titles, data.index)
    // outside every block: the hint, until the cursor is in one again
    if (data.type === 'outside') {
      shown = position = null
      page.innerHTML = empty
      return
    }
    base.href = data.base
    widget = data.widget
    replays.hidden = !data.replays
    const changed = data.markdown !== shown
    if (changed) build(data.markdown)
    shown = data.markdown
    const to = data.position ?? position
    // the user moving the cursor or typing stops a widget that's playing (data-playing), even
    // where the pane already is
    const stop = data.stop && page.querySelector(`${widget}[data-playing]`)
    if (to != null && (changed || stop || !samePlace(to, position))) show(to, changed && data.play && options.replay.checked)
    position = to
  })

  // Stepping or playing in the pane (buttons, keys, the progress bar) moves the editor's cursor
  // there, with "Sync cursor" ticked
  page.addEventListener('preview-position', ({ detail }) => {
    if (samePlace(detail.position, position)) return
    position = detail.position
    if (options.sync.checked) vscode.postMessage({ type: 'position', position })
  })

  vscode.postMessage({ type: 'ready' })
})()
