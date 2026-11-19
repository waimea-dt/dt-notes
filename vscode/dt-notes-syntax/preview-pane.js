// The animation preview pane (DT Notes: Preview Animation): a webview beside the editor showing the
// <animation> block the cursor is in (or a whole .anim file), built by the site's own widget, engine
// and CSS, loaded from the repo the file is in (engine.js). It rebuilds as you type, follows the
// cursor to the beat it's in, and (with "Replay edits" ticked) plays into that beat after each edit.
// With "Sync cursor" ticked, stepping in the pane moves the cursor the other way, to the beat it
// lands on.
// Saving an engine file reloads the pane with the new code.
const vscode = require('vscode')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { engineDirFor, loadEngine, pageOf, partsOf, isEngineFile } = require('./engine')

const VIEW_TYPE = 'dtNotes.animationPreview'
const EDIT_WAIT_MS = 300 // after the last keystroke
const FOLLOW_WAIT_MS = 80 // after the cursor moves
const SCROLL = { ms: 300, frameMs: 16 } // the editor's eased scroll to a beat stepped to in the pane

// What the widget needs from the site (paths in docs/): the shared helpers, the widget (after the
// engine's parts, which come from the site's page), and the styles it's drawn with.
const SITE = {
  utils: '_plugins/core/utils.js',
  widget: '_plugins/visualisation/animation.js',
  styles: ['_css/core/theme.css', '_css/core/buttons.css', '_css/coding/code.css', '_css/visualisation/animation.css'],
}
// The libraries the site's page loads that the widget uses: Lucide (icons), Prism's languages (code
// blocks), the web fonts (text is measured in them) and Docsify's core theme (the --color-mono-*
// scale the site's colours are mixed from)
const LIBRARY = /<(script|link)\b[^>]*?(?:src|href)="(https:\/\/[^"]*(?:\/lucide@|\/prismjs@[^/]+\/components\/|fonts\.googleapis\.com\/css2|\/docsify@[^/]+\/dist\/themes\/core)[^"]*)"/g
// Docsify bundles Prism (its default bundle: the core with markup, css, clike and javascript, which
// the page's languages build on) and marked (its Markdown renderer), so the page doesn't list them
const PRISM_CORE = (components) => components.replace(/components\/[^/]+$/, 'prism.min.js')
const MARKED = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js'

const followable = (document) => ['markdown', 'anim'].includes(document?.languageId) && document.uri.scheme === 'file'

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

function pageHtml(webview, engineDir, docsDir) {
  const nonce = crypto.randomBytes(16).toString('base64')
  const loaded = Date.now() // in the site's file URLs, so a reload doesn't use cached copies
  const uri = (file) => webview.asWebviewUri(vscode.Uri.file(file))
  const site = (file) => `${uri(path.join(docsDir, file))}?v=${loaded}`
  const own = (file) => uri(path.join(__dirname, file))
  const { scripts, styles } = librariesOf(fs.readFileSync(pageOf(engineDir), 'utf8'))
  const parts = partsOf(engineDir).map((part) => `_plugins/visualisation/${part}.js`)
  const origins = (urls) => [...new Set(urls.map((url) => new URL(url).origin))].join(' ')
  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} https: data:`,
    `style-src ${webview.cspSource} 'unsafe-inline' ${origins(styles)}`,
    `font-src ${webview.cspSource} https://fonts.gstatic.com`,
    `script-src 'nonce-${nonce}' ${webview.cspSource} ${origins(scripts)}`,
  ].join('; ')
  const script = (src) => `<script src="${src}"></script>`
  const style = (href) => `<link rel="stylesheet" href="${href}">`
  return `<!DOCTYPE html>
<html data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${[...styles, ...SITE.styles.map(site), own('preview-pane-view.css')].map(style).join('\n  ')}
</head>
<body>
  <header class="dtn-preview-bar">
    <span class="dtn-preview-where"></span>
    <span class="dtn-preview-options">
      <label title="Stepping here moves the editor's cursor to that beat"><input type="checkbox" class="dtn-preview-sync"> Sync cursor</label>
      <label title="Play into the beat after each edit"><input type="checkbox" class="dtn-preview-replay"> Replay edits</label>
    </span>
  </header>
  <div class="markdown-section"><p class="dtn-preview-empty">Put the cursor in an &lt;animation&gt; block.</p></div>
  <script nonce="${nonce}">window.$docsify = {}</script>
  ${[...scripts, site(SITE.utils), ...parts.map(site), site(SITE.widget), own('preview-pane-view.js')].map(script).join('\n  ')}
</body>
</html>`
}

// The block to show in a Markdown file: the one the cursor is in, else the one shown last (when
// it's the same file), else the nearest above the cursor. beat: the beat the cursor is in, or null.
function blockAt(Anim, lines, cursor, previous) {
  const blocks = Anim.findBlocks(lines)
  if (!blocks.length) return null
  let index = blocks.findIndex((b) => b.start <= cursor && cursor <= b.end)
  const inside = index >= 0
  if (!inside) index = previous ?? Math.max(0, blocks.findLastIndex((b) => b.start < cursor))
  const block = blocks[Math.min(index, blocks.length - 1)]
  const markdown = [`<animation${block.attrs}>`, ...block.lines, '</animation>'].join('\n')
  return { index, line: block.start, markdown, beat: inside ? beatAt(Anim, block, cursor) : null }
}

// The beat a document line of a block is in: how many beats the block's lines up to it make
const countBeats = (steps) => steps.reduce((n, step) => n + step.beats.length, 0)
const beatAt = (Anim, block, line) => countBeats(Anim.splitBlock(block.lines.slice(0, line - block.start))) - 1

// The document line to put the cursor on for a beat: its first scene line, or else the first line
// that's in it (a beat with only a caption)
function lineOfBeat(Anim, block, beat) {
  const scene = Anim.splitBlock(block.lines).flatMap((step) => step.beats)[beat]?.sceneLines[0]
  if (scene != null) return block.start + 1 + scene
  for (let line = block.start; line <= block.start + block.lines.length; line++) {
    if (beatAt(Anim, block, line) >= beat) return line
  }
  return block.start
}

// A whole .anim file is one beat's scene
const animFile = (lines) => ({ index: 0, line: 0, markdown: ['<animation>', '```anim', ...lines, '```', '</animation>'].join('\n'), beat: 0 })

function activate(context, log) {
  const state = { panel: null, docsDir: null, engineDir: null, shown: null, message: null, timer: 0, scrollTimer: 0, edited: false }

  const post = (message) => {
    state.message = message
    state.panel?.webview.postMessage(message)
  }

  function load(engineDir) {
    state.engineDir = engineDir
    state.panel.webview.html = pageHtml(state.panel.webview, engineDir, state.docsDir)
  }

  function createPanel(engineDir) {
    state.panel?.dispose()
    state.docsDir = path.resolve(engineDir, '..', '..')
    const panel = vscode.window.createWebviewPanel(VIEW_TYPE, 'Animation', { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(state.docsDir), vscode.Uri.file(__dirname)],
    })
    state.panel = panel
    panel.onDidDispose(() => { if (state.panel === panel) Object.assign(state, { panel: null, shown: null, message: null }) })
    panel.webview.onDidReceiveMessage((message) => {
      // a (re)loaded page asks for the block it should show
      if (message.type === 'ready' && state.message) panel.webview.postMessage(state.message)
      if (message.type === 'beat') moveCursorTo(message.beat)
    })
    load(engineDir)
  }

  // Shows the block (and beat) at the editor's cursor; edited: the change came from typing
  function update(editor, edited) {
    if (!state.panel || !followable(editor?.document)) return
    const { document } = editor
    const engineDir = engineDirFor(document.uri.fsPath)
    if (!engineDir) return
    if (path.resolve(engineDir, '..', '..') !== state.docsDir) return open(editor) // another repo: a new pane
    try {
      const lines = document.getText().split(/\r?\n/)
      const cursor = editor.selection.active.line
      const sameFile = state.shown?.uri === document.uri.toString()
      const found = document.languageId === 'anim' ? animFile(lines) : blockAt(loadEngine(engineDir), lines, cursor, sameFile ? state.shown.index : null)
      if (!found) return post({ type: 'empty' })
      state.shown = { uri: document.uri.toString(), index: found.index }
      state.panel.title = `Animation: ${path.basename(document.fileName)}`
      const base = `${state.panel.webview.asWebviewUri(vscode.Uri.file(path.dirname(document.fileName)))}/`
      const where = `${path.basename(document.fileName)}, line ${found.line + 1}`
      post({ type: 'block', markdown: found.markdown, beat: found.beat, play: edited, base, where })
    } catch (error) {
      log.appendLine(`animation preview: ${error.stack || error}`)
    }
  }

  // Stepping in the pane: the shown block's editor gets its cursor on that beat (unless it's
  // already in it). The cursor move comes back through update, which finds the pane already there.
  function moveCursorTo(beat) {
    const editor = state.shown && vscode.window.visibleTextEditors.find((e) => e.document.uri.toString() === state.shown.uri)
    if (!editor || editor.document.languageId !== 'markdown') return
    const engineDir = engineDirFor(editor.document.uri.fsPath)
    if (!engineDir) return
    const Anim = loadEngine(engineDir)
    const block = Anim.findBlocks(editor.document.getText().split(/\r?\n/))[state.shown.index]
    if (!block) return
    const cursor = editor.selection.active.line
    if (block.start <= cursor && cursor <= block.end && beatAt(Anim, block, cursor) === beat) return
    const line = editor.document.lineAt(lineOfBeat(Anim, block, beat))
    const at = new vscode.Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex)
    editor.selection = new vscode.Selection(at, at)
    scrollTo(editor, line.lineNumber)
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
  function later(editor, edited) {
    if (edited) state.edited = true
    clearTimeout(state.timer)
    state.timer = setTimeout(() => {
      const wasEdited = state.edited
      state.edited = false
      update(editor, wasEdited)
    }, state.edited ? EDIT_WAIT_MS : FOLLOW_WAIT_MS)
  }

  function open(editor) {
    const engineDir = followable(editor?.document) && engineDirFor(editor.document.uri.fsPath)
    if (!engineDir) return vscode.window.showInformationMessage('Open a Markdown or .anim file in the dt-notes repo to preview its animations.')
    if (state.panel && path.resolve(engineDir, '..', '..') === state.docsDir) state.panel.reveal(undefined, true)
    else createPanel(engineDir)
    update(editor, false)
  }

  const editorFor = (document) => vscode.window.visibleTextEditors.find((editor) => editor.document === document)

  context.subscriptions.push(
    vscode.commands.registerCommand('dtNotes.previewAnimation', () => open(vscode.window.activeTextEditor)),
    vscode.window.onDidChangeTextEditorSelection(({ textEditor }) => { if (state.panel && followable(textEditor.document)) later(textEditor, false) }),
    vscode.window.onDidChangeActiveTextEditor((editor) => { if (state.panel && followable(editor?.document)) later(editor, false) }),
    vscode.workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
      const editor = state.panel && contentChanges.length && editorFor(document)
      if (editor) later(editor, true)
    }),
    // an edited engine, widget or its CSS: reload the pane with it
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (state.panel && isEngineFile(document.fileName)) load(state.engineDir)
    }),
    { dispose: () => { clearTimeout(state.timer); clearTimeout(state.scrollTimer); state.panel?.dispose() } },
  )
}

module.exports = { activate }
