// The block preview pane (DT Notes: Preview Block): a webview beside the editor showing the
// <animation>, <slides> or <flashcards> block the cursor is in (or a whole .anim file), built by the
// site's own plugins and CSS, loaded from the repo the file is in. The kinds of block, and how a
// cursor line maps to a beat, slide or card, are in preview-kinds.js.
// It rebuilds as you type and follows the cursor to the place it's in; with "Replay edits" ticked,
// an animation plays into that beat after each edit. With "Sync cursor" ticked, stepping in the
// pane moves the cursor the other way, to the place it lands on. With the cursor outside every
// block it shows a hint. The bar lists the file's blocks (picking one moves the cursor to it) and
// shows the cursor's line.
// Saving one of the pane's site files (a plugin or its CSS) reloads the pane with it.
const vscode = require('vscode')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { engineDirFor, pageOf } = require('./engine')
const { KINDS, TAGS, findBlocks, markdownOf, titleOf } = require('./preview-kinds')

const VIEW_TYPE = 'dtNotes.blockPreview'
const EDIT_WAIT_MS = 300 // after the last keystroke
const FOLLOW_WAIT_MS = 80 // after the cursor moves
const SCROLL = { ms: 300, frameMs: 16 } // the editor's eased scroll to a place stepped to in the pane

// What every kind needs from the site (paths in docs/): the shared helpers, and the styles pages
// are drawn with. Each kind adds its own plugin and styles (preview-kinds.js).
const SITE = {
  utils: '_plugins/core/utils.js',
  styles: ['_css/core/theme.css', '_css/core/buttons.css', '_css/core/icons.css', '_css/coding/code.css'],
}
// The site page's plugin scripts, in the order it loads them
const SITE_SCRIPT = /<script\b[^>]*\bsrc="(_plugins\/[^"]+\.js)"/g
// The libraries the site's page loads that the plugins use: Lucide (icons), Prism's languages (code
// blocks), the web fonts (text is measured in them) and Docsify's core theme (the --color-mono-*
// scale the site's colours are mixed from)
const LIBRARY = /<(script|link)\b[^>]*?(?:src|href)="(https:\/\/[^"]*(?:\/lucide@|\/prismjs@[^/]+\/components\/|fonts\.googleapis\.com\/css2|\/docsify@[^/]+\/dist\/themes\/core)[^"]*)"/g
// Docsify bundles Prism (its default bundle: the core with markup, css, clike and javascript, which
// the page's languages build on) and marked (its Markdown renderer), so the page doesn't list them
const PRISM_CORE = (components) => components.replace(/components\/[^/]+$/, 'prism.min.js')
const MARKED = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js'

const followable = (document) => ['markdown', 'anim'].includes(document?.languageId) && document.uri.scheme === 'file'
const docsDirOf = (engineDir) => path.resolve(engineDir, '..', '..')
const samePlace = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const fileKey = (file) => path.normalize(file).toLowerCase() // Windows paths differ in case

// The site page's libraries: scripts in page order (Prism's core before its languages) and styles
function librariesOf(page) {
  const scripts = []
  const styles = []
  for (const [, tag, url] of page.matchAll(LIBRARY)) {
    if (tag === 'link') { styles.push(url); continue }
    if (url.includes('/components/') && !scripts.some((s) => s.includes('/components/'))) scripts.push(PRISM_CORE(url))
    scripts.push(url)
  }
  return { scripts: [...scripts, MARKED], styles }
}

// The site's files the pane loads (paths in docs/): the plugins in the page's order, and styles
function siteFilesOf(engineDir, page) {
  const wanted = new Set([SITE.utils, ...Object.values(KINDS).flatMap((kind) => kind.scripts(engineDir))])
  return {
    scripts: [...page.matchAll(SITE_SCRIPT)].map((m) => m[1]).filter((file) => wanted.has(file)),
    styles: [...SITE.styles, ...Object.values(KINDS).flatMap((kind) => kind.styles)],
  }
}

function pageHtml(webview, engineDir, files) {
  const nonce = crypto.randomBytes(16).toString('base64')
  const loaded = Date.now() // in the site's file URLs, so a reload doesn't use cached copies
  const uri = (file) => webview.asWebviewUri(vscode.Uri.file(file))
  const site = (file) => `${uri(path.join(docsDirOf(engineDir), file))}?v=${loaded}`
  const own = (file) => uri(path.join(__dirname, file))
  const { scripts, styles } = librariesOf(fs.readFileSync(pageOf(engineDir), 'utf8'))
  const origins = (urls) => [...new Set(urls.map((url) => new URL(url).origin))].join(' ')
  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} https: data:`,
    `style-src ${webview.cspSource} 'unsafe-inline' ${origins(styles)}`,
    `font-src ${webview.cspSource} https: data:`,
    `script-src 'nonce-${nonce}' ${webview.cspSource} ${origins(scripts)}`,
  ].join('; ')
  const script = (src) => `<script src="${src}"></script>`
  // data-site: the site's own stylesheets, which libraries' are put before (preview-pane-view.js)
  const style = (href, ownStyle) => `<link rel="stylesheet" href="${href}"${ownStyle ? ' data-site' : ''}>`
  const tags = TAGS.map((tag) => `&lt;${tag}&gt;`).join(', ')
  return `<!DOCTYPE html>
<html data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${[...styles.map((href) => style(href)), ...[...files.styles.map(site), own('preview-pane-view.css')].map((href) => style(href, true))].join('\n  ')}
</head>
<body>
  <header class="dtn-preview-bar">
    <span class="dtn-preview-where">
      <span class="dtn-preview-picker"><select class="dtn-preview-blocks" title="The file's blocks: pick one to move the cursor to it"></select></span>
      <span class="dtn-preview-line"></span>
    </span>
    <span class="dtn-preview-options">
      <label title="Stepping here moves the editor's cursor there"><input type="checkbox" class="dtn-preview-sync"> Sync cursor</label>
      <label class="dtn-preview-replays" title="Play into the beat after each edit"><input type="checkbox" class="dtn-preview-replay"> Replay edits</label>
    </span>
  </header>
  <div class="markdown-section"><p class="dtn-preview-empty">Click inside a block to preview it: ${tags}.</p></div>
  <script nonce="${nonce}">window.$docsify = {}</script>
  ${[...scripts, ...files.scripts.map(site), own('preview-pane-view.js')].map(script).join('\n  ')}
</body>
</html>`
}

// In a Markdown file: every block's name (for the pane's list) and, when the cursor is in one, the
// innermost one: its index, tag, Markdown and where the cursor is in it. index is -1 when it's
// outside every block.
function blockAt(lines, cursor, engineDir) {
  const blocks = findBlocks(lines)
  const titles = blocks.map(titleOf)
  const index = blocks.findLastIndex((b) => b.start <= cursor && cursor <= b.end)
  if (index < 0) return { titles, index }
  const block = blocks[index]
  return { titles, index, tag: block.tag, markdown: markdownOf(block), position: KINDS[block.tag].positionAt(block, cursor, engineDir) }
}

// A whole .anim file is one beat's scene
const animFile = (lines, name) => ({
  titles: [`${KINDS.animation.label}: ${name}`],
  index: 0,
  tag: 'animation',
  markdown: ['<animation>', '```anim', ...lines, '```', '</animation>'].join('\n'),
  position: 0,
})

function activate(context, log) {
  // placed: where the pane last put the cursor, to tell its own moves from the user's
  const state = { panel: null, engineDir: null, files: new Set(), shown: null, message: null, timer: 0, scrollTimer: 0, edited: false, byUser: false, placed: null }

  const post = (message) => {
    state.message = message
    state.panel?.webview.postMessage(message)
  }

  function load(engineDir) {
    state.engineDir = engineDir
    const files = siteFilesOf(engineDir, fs.readFileSync(pageOf(engineDir), 'utf8'))
    state.files = new Set([...files.scripts, ...files.styles].map((file) => fileKey(path.join(docsDirOf(engineDir), file))))
    state.panel.webview.html = pageHtml(state.panel.webview, engineDir, files)
  }

  function createPanel(engineDir) {
    state.panel?.dispose()
    const panel = vscode.window.createWebviewPanel(VIEW_TYPE, 'Preview', { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(docsDirOf(engineDir)), vscode.Uri.file(__dirname)],
    })
    state.panel = panel
    panel.onDidDispose(() => { if (state.panel === panel) Object.assign(state, { panel: null, shown: null, message: null }) })
    panel.webview.onDidReceiveMessage((message) => {
      // a (re)loaded page asks for the block it should show
      if (message.type === 'ready' && state.message) panel.webview.postMessage(state.message)
      if (message.type === 'position') moveCursorTo(message.position)
      if (message.type === 'block') moveToBlock(message.index)
    })
    load(engineDir)
  }

  // Shows the block (and place) at the editor's cursor; edited: the change came from typing;
  // byUser: the user moved the cursor or typed, which stops an animation that's playing
  function update(editor, edited, byUser) {
    if (!state.panel || !followable(editor?.document)) return
    const { document } = editor
    const engineDir = engineDirFor(document.uri.fsPath)
    if (!engineDir) return
    if (engineDir !== state.engineDir) return open(editor) // another repo: a new pane
    try {
      const lines = document.getText().split(/\r?\n/)
      const cursor = editor.selection.active.line
      const found = document.languageId === 'anim'
        ? animFile(lines, path.basename(document.fileName))
        : blockAt(lines, cursor, engineDir)
      state.shown = { uri: document.uri.toString(), index: found.index, tag: found.tag }
      state.panel.title = `Preview: ${path.basename(document.fileName)}`
      const bar = { titles: found.titles, index: found.index, line: `line ${cursor + 1}` }
      if (found.index < 0) return post({ type: 'outside', ...bar })
      const kind = KINDS[found.tag]
      post({
        type: 'block',
        ...bar,
        markdown: found.markdown,
        widget: kind.widget,
        replays: Boolean(kind.replays),
        position: found.position,
        play: edited,
        stop: Boolean(byUser),
        base: `${state.panel.webview.asWebviewUri(vscode.Uri.file(path.dirname(document.fileName)))}/`,
      })
    } catch (error) {
      log.appendLine(`block preview: ${error.stack || error}`)
    }
  }

  // Stepping or playing in the pane: the shown block's editor gets its cursor on that place (unless
  // it's already there). Only the bar's line follows: the pane is already there.
  function moveCursorTo(position) {
    const { editor, blocks } = shownEditor()
    const block = blocks?.[state.shown.index]
    if (position == null || block?.tag !== state.shown.tag) return
    const kind = KINDS[block.tag]
    const cursor = editor.selection.active.line
    if (block.start <= cursor && cursor <= block.end && samePlace(kind.positionAt(block, cursor, state.engineDir), position)) return
    state.placed = placeCursor(editor, kind.lineOf(block, position, state.engineDir))
  }

  // The pane's own cursor move: the bar's line, and the last message (for a reloaded page)
  function showLine(editor) {
    const line = `line ${editor.selection.active.line + 1}`
    if (state.message) state.message.line = line
    state.panel.webview.postMessage({ type: 'line', line })
  }

  // Picking a block in the pane's list: the cursor goes to its opening tag, and the pane follows
  function moveToBlock(index) {
    const { editor, blocks } = shownEditor()
    if (blocks?.[index]) placeCursor(editor, blocks[index].start)
  }

  // The shown block's Markdown editor (if it's visible) and that file's blocks
  function shownEditor() {
    const editor = state.shown && vscode.window.visibleTextEditors.find((e) => e.document.uri.toString() === state.shown.uri)
    if (editor?.document.languageId !== 'markdown') return {}
    return { editor, blocks: findBlocks(editor.document.getText().split(/\r?\n/)) }
  }

  function placeCursor(editor, lineNumber) {
    const line = editor.document.lineAt(lineNumber)
    const at = new vscode.Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex)
    editor.selection = new vscode.Selection(at, at)
    scrollTo(editor, line.lineNumber)
    return at
  }

  // Scrolls the editor to centre a line that's out of view, smoothly, so the jump is easy to follow.
  // VS Code's reveal is instant unless the user's editor.smoothScrolling is on, so (without it) the
  // top line is eased there a frame at a time.
  function scrollTo(editor, line) {
    clearTimeout(state.scrollTimer)
    const visible = editor.visibleRanges[0]
    if (!visible || (line >= visible.start.line && line <= visible.end.line)) return
    const reveal = (n, type) => editor.revealRange(new vscode.Range(n, 0, n, 0), type)
    if (vscode.workspace.getConfiguration('editor', editor.document.uri).get('smoothScrolling')) {
      return reveal(line, vscode.TextEditorRevealType.InCenter)
    }
    const from = visible.start.line
    const to = Math.max(0, line - Math.floor((visible.end.line - visible.start.line) / 2))
    const frames = Math.round(SCROLL.ms / SCROLL.frameMs)
    let frame = 0
    const tick = () => {
      frame++
      const t = frame / frames
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2 // ease in and out
      reveal(Math.round(from + (to - from) * eased), vscode.TextEditorRevealType.AtTop)
      if (frame < frames) state.scrollTimer = setTimeout(tick, SCROLL.frameMs)
    }
    tick()
  }

  // One timer for both: an edit waits for typing to stop, a cursor move only briefly
  function later(editor, edited, byUser) {
    if (edited) state.edited = true
    if (byUser) state.byUser = true
    clearTimeout(state.timer)
    state.timer = setTimeout(() => {
      const { edited: wasEdited, byUser: wasUser } = state
      Object.assign(state, { edited: false, byUser: false })
      update(editor, wasEdited, wasUser)
    }, state.edited ? EDIT_WAIT_MS : FOLLOW_WAIT_MS)
  }

  // A cursor move: the pane's own (it put the cursor there) only changes the bar's line
  function cursorMoved(editor) {
    const ours = state.placed && editor.selection.isEmpty && editor.selection.active.isEqual(state.placed)
    state.placed = null
    if (ours) showLine(editor)
    else later(editor, false, true)
  }

  function open(editor) {
    const engineDir = followable(editor?.document) && engineDirFor(editor.document.uri.fsPath)
    if (!engineDir) return vscode.window.showInformationMessage('Open a Markdown or .anim file in the dt-notes repo to preview its blocks.')
    if (state.panel && engineDir === state.engineDir) state.panel.reveal(undefined, true)
    else createPanel(engineDir)
    update(editor, false)
  }

  const editorFor = (document) => vscode.window.visibleTextEditors.find((editor) => editor.document === document)

  context.subscriptions.push(
    vscode.commands.registerCommand('dtNotes.previewBlock', () => open(vscode.window.activeTextEditor)),
    vscode.window.onDidChangeTextEditorSelection(({ textEditor }) => { if (state.panel && followable(textEditor.document)) cursorMoved(textEditor) }),
    vscode.window.onDidChangeActiveTextEditor((editor) => { if (state.panel && followable(editor?.document)) later(editor, false) }),
    vscode.workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
      const editor = state.panel && contentChanges.length && editorFor(document)
      if (editor) later(editor, true, true)
    }),
    // an edited plugin or its CSS (anything the pane loads from the site): reload the pane with it
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (state.panel && state.files.has(fileKey(document.fileName))) load(state.engineDir)
    }),
    { dispose: () => { clearTimeout(state.timer); clearTimeout(state.scrollTimer); state.panel?.dispose() } },
  )
}

module.exports = { activate }
