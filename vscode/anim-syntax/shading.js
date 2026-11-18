// A background tint on ```anim fences in Markdown (from the opening fence to the closing one),
// including ones inside ```markdown / ```md examples, so scene code stands out from the page.
// The colour is the animSyntax.fenceBackground setting ("" turns it off).
const vscode = require('vscode')

const FENCE = /^\s*(`{3,}|~{3,})\s*([\w-]*)/
const EXAMPLES = ['markdown', 'md']
const WAIT_MS = 100

// The line ranges of a document's anim fences. Fences nest one deep: inside a Markdown example,
// a shorter fence is a fence of its own (as in the grammar's injection).
function animRanges(document) {
  const ranges = []
  const open = [] // { marker, info, start }
  for (let n = 0; n < document.lineCount; n++) {
    const m = document.lineAt(n).text.match(FENCE)
    if (!m) continue
    const [, marker, word] = m
    const info = word.toLowerCase()
    const top = open[open.length - 1]
    const closes = top && marker[0] === top.marker[0] && marker.length >= top.marker.length && !info
    if (closes) {
      open.pop()
      if (top.info === 'anim') ranges.push(new vscode.Range(top.start, 0, n, 0))
    } else if (!top || (EXAMPLES.includes(top.info) && marker.length < top.marker.length)) {
      open.push({ marker, info, start: n })
    }
  }
  const last = open.find((fence) => fence.info === 'anim') // unclosed: to the end
  if (last) ranges.push(new vscode.Range(last.start, 0, document.lineCount - 1, 0))
  return ranges
}

function activate(context) {
  let decoration = null
  const makeDecoration = () => {
    decoration?.dispose()
    const colour = vscode.workspace.getConfiguration('animSyntax').get('fenceBackground')
    decoration = colour ? vscode.window.createTextEditorDecorationType({ backgroundColor: colour, isWholeLine: true }) : null
  }
  const shade = (editor) => {
    if (!decoration || editor.document.languageId !== 'markdown') return
    editor.setDecorations(decoration, animRanges(editor.document))
  }
  const shadeAll = () => vscode.window.visibleTextEditors.forEach(shade)

  let timer = 0
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(shadeAll),
    vscode.workspace.onDidChangeTextDocument((event) => {
      clearTimeout(timer)
      timer = setTimeout(() => vscode.window.visibleTextEditors.filter((e) => e.document === event.document).forEach(shade), WAIT_MS)
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration('animSyntax.fenceBackground')) return
      makeDecoration()
      shadeAll()
    }),
    { dispose: () => decoration?.dispose() },
  )
  makeDecoration()
  shadeAll()
}

module.exports = { activate, animRanges }
