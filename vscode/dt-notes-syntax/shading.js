// A background tint on the site's plugin blocks in Markdown (<animation>…</animation>, <slides>,
// <quiz>, <flashcards> …), from the opening tag's line to the closing tag's, so a block and the
// headings inside it stand out from the page around it. A block is shaded when it spans lines; tags
// in code fences (examples) don't count. Settings: dtNotes.blockBackground (the colour, "" for
// none) and dtNotes.shadedBlocks (the tag names).
const vscode = require('vscode')

const FENCE = /^\s*(`{3,}|~{3,})(.*)$/
const OPEN = /^\s*<([a-z][\w-]*)(?=[\s>])/i
const CLOSE = /<\/([a-z][\w-]*)\s*>/gi
const WAIT_MS = 100

// The line ranges of a document's blocks with these tag names. Blocks may nest (an animation in a
// slide); an unclosed block isn't shaded.
function blockRanges(document, tags) {
  const wanted = new Set(tags.map((tag) => tag.toLowerCase()))
  const ranges = []
  const open = [] // { tag, start }
  let fence = null
  for (let n = 0; n < document.lineCount; n++) {
    const text = document.lineAt(n).text
    const f = text.match(FENCE)
    if (f && !fence) { fence = f[1]; continue }
    if (fence) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) fence = null
      continue
    }
    const opening = text.match(OPEN)
    if (opening && wanted.has(opening[1].toLowerCase())) open.push({ tag: opening[1].toLowerCase(), start: n })
    for (const [, name] of text.matchAll(CLOSE)) {
      const tag = name.toLowerCase()
      const k = open.map((block) => block.tag).lastIndexOf(tag)
      if (k < 0) continue
      const [block] = open.splice(k, 1)
      if (block.start < n) ranges.push(new vscode.Range(block.start, 0, n, 0)) // one line: not a block
    }
  }
  return ranges
}

// log: the extension's output channel (View > Output > DT Notes Syntax), which records what's shaded
function activate(context, log) {
  const config = () => vscode.workspace.getConfiguration('dtNotes')
  let decoration = null
  const makeDecoration = () => {
    decoration?.dispose()
    const colour = config().get('blockBackground')
    decoration = colour ? vscode.window.createTextEditorDecorationType({ backgroundColor: colour, isWholeLine: true }) : null
    log?.appendLine(`block shading: ${colour ? `tint ${colour}` : 'off (dtNotes.blockBackground is empty)'}`)
  }
  const counts = new Map() // file -> blocks shaded, logged when it changes
  const shade = (editor) => {
    if (!decoration || editor?.document.languageId !== 'markdown') return
    const ranges = blockRanges(editor.document, config().get('shadedBlocks') || [])
    editor.setDecorations(decoration, ranges)
    const file = editor.document.uri.fsPath
    if (counts.get(file) !== ranges.length) {
      counts.set(file, ranges.length)
      log?.appendLine(`block shading: ${ranges.length} block${ranges.length === 1 ? '' : 's'} in ${file}`)
    }
  }
  const shadeAll = () => vscode.window.visibleTextEditors.forEach(shade)
  const shadeDocument = (document) => vscode.window.visibleTextEditors.filter((e) => e.document === document).forEach(shade)

  // Editors can be on screen before or after the extension starts, and come and go: shade on
  // every way one can appear, and once more shortly after starting
  let timer = 0
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(shadeAll),
    vscode.window.onDidChangeActiveTextEditor(shade),
    vscode.workspace.onDidOpenTextDocument((document) => setTimeout(() => shadeDocument(document), WAIT_MS)),
    vscode.workspace.onDidChangeTextDocument((event) => {
      clearTimeout(timer)
      timer = setTimeout(() => shadeDocument(event.document), WAIT_MS)
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('dtNotes.blockBackground')) makeDecoration()
      if (event.affectsConfiguration('dtNotes')) shadeAll()
    }),
    { dispose: () => decoration?.dispose() },
  )
  makeDecoration()
  shadeAll()
  setTimeout(shadeAll, 1000)
}

module.exports = { activate, blockRanges }
