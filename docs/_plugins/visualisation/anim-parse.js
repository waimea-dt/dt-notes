/**
 * anim-parse.js - Part of the animation plugin (animation.js): rewriting <animation> blocks in
 * the Markdown into source markup (beforeEach), and reading scene lines into tokens and props.
 */

;(function () {
  const { escapeHtml, HIGHLIGHTS, CALLOUT_SIDES, PLACEMENTS, ALIGNS, COLOURS, SPEEDS, EASES, RESERVED,
    KEYWORDS, SHAPE_TYPES, LAYOUT_TYPES, LINE_STARTS } = window.Anim

  // ---------------------------------------------------------------------------
  // Markdown -> source markup (beforeEach)
  // ---------------------------------------------------------------------------

  const FENCE = /^[ \t]*(`{3,}|~{3,})(.*)$/
  const OPEN_TAG = /^[ \t]*<animation\b([^>]*)>[ \t]*$/i
  const CLOSE_TAG = /^[ \t]*<\/animation>[ \t]*$/i
  const MARKERS = { step: /^---[ \t]*$/, beat: /^\+\+\+[ \t]*$/, note: /^Note:[ \t]*$/ }
  const SOURCE_END = '<!-- /animation -->'
  const SOURCE_BLOCK = /<div class="anim-source"[\s\S]*?<!-- \/animation -->/g
  const HEADING_ANCHOR = /<(h[1-6]) id="[^"]*" tabindex="-1"><a href="[^"]*" data-id="[^"]*" class="anchor">([\s\S]*?)<\/a><\/\1>/g

  // Calls visit(line, inCode, fenceInfo) for each line; fence lines and lines inside a fence are code.
  function scanLines(lines, visit) {
    let fence = null
    let info = ''
    lines.forEach((line) => {
      const match = line.match(FENCE)
      const wasInFence = Boolean(fence)
      const opening = match && !fence
      const closing = match && fence && match[1][0] === fence[0] && match[1].length >= fence.length && !match[2].trim()
      if (opening) { fence = match[1]; info = match[2].trim() }
      visit(line, wasInFence || Boolean(match), { opening, closing, inside: wasInFence && !closing, info })
      if (closing) fence = null
    })
  }

  // Splits lines at whole-line markers outside code: n markers give n + 1 chunks of lines.
  function splitAtMarker(lines, marker) {
    const chunks = [[]]
    scanLines(lines, (line, inCode) => {
      if (!inCode && marker.test(line)) chunks.push([])
      else chunks[chunks.length - 1].push(line)
    })
    return chunks
  }

  // Removes ```anim fences from a beat, returning the caption lines and the scene text.
  function extractScene(lines) {
    const caption = []
    const scene = []
    let inScene = false
    scanLines(lines, (line, _inCode, fence) => {
      if (fence.opening && fence.info === 'anim') { inScene = true; return }
      if (inScene && fence.closing) { inScene = false; return }
      if (inScene) scene.push(line)
      else caption.push(line)
    })
    return { caption, scene: scene.join('\n') }
  }

  // Step headings are not page headings: keep them out of the sidebar's sub-menu.
  function excludeHeadingsFromToc(lines) {
    const out = []
    scanLines(lines, (line, inCode) => {
      out.push(!inCode && /^#{1,6}[ \t]+\S/.test(line) ? `${line.trimEnd()} {docsify-ignore}` : line)
    })
    return out
  }

  const wrap = (open, body, close) => `${open}\n\n${body}\n\n${close}`
  const attr = (value) => encodeURIComponent(value)

  // Tag attributes: bare flags (debug, autoplay, loop, loop-bounce) and name="value" pairs
  // (grid, hold, controls).
  function parseAttrs(attrs) {
    const out = {}
    for (const m of attrs.matchAll(/([\w-]+)(?:\s*=\s*["']([^"']*)["'])?/g)) out[m[1].toLowerCase()] = m[2] ?? true
    return out
  }

  function buildSource(attrs, lines) {
    const opts = parseAttrs(attrs)
    const grid = typeof opts.grid === 'string' ? opts.grid : ''
    const debug = 'debug' in opts
    const playback = {
      autoplay: 'autoplay' in opts,
      loop: 'loop-bounce' in opts ? 'bounce' : 'loop' in opts ? 'loop' : null,
      hold: opts.hold ?? null,
      controls: opts.controls ?? null,
    }
    const images = new Set()

    const steps = splitAtMarker(lines, MARKERS.step).map((stepLines) => {
      const [content, ...notes] = splitAtMarker(stepLines, MARKERS.note)
      const beats = splitAtMarker(content, MARKERS.beat).map((beatLines) => {
        const { caption, scene } = extractScene(beatLines)
        for (const match of scene.matchAll(/\bimage\(([^)]*)\)/g)) images.add(match[1].trim())
        return wrap(`<div class="anim-src-beat" data-scene="${attr(scene)}">`, excludeHeadingsFromToc(caption).join('\n').trim(), '</div>')
      })
      const notesBlock = notes.length ? wrap('<div class="anim-src-notes">', notes.flat().join('\n').trim(), '</div>') : ''
      return wrap('<div class="anim-src-step">', [...beats, notesBlock].filter(Boolean).join('\n\n'), '</div>')
    })

    // Images go through Docsify as Markdown images, so their paths resolve exactly as ![](…) does.
    const paths = [...images].filter(Boolean)
    const assets = paths.length
      ? wrap(`<div class="anim-src-assets" data-paths="${attr(JSON.stringify(paths))}">`, paths.map((p) => `![](${p})`).join('\n\n'), '</div>')
      : ''

    const open = `<div class="anim-source" data-grid="${escapeHtml(grid)}" data-playback="${attr(JSON.stringify(playback))}"${debug ? ' data-debug' : ''}>`
    return `\n\n${wrap(open, [...steps, assets].filter(Boolean).join('\n\n'), '</div>')}\n${SOURCE_END}\n\n`
  }

  // Rewrites every <animation> block that is outside a code fence.
  function rewriteBlocks(markdown) {
    const lines = markdown.split('\n')
    const out = []
    let block = null
    scanLines(lines, (line, inCode) => {
      if (block) {
        if (!inCode && CLOSE_TAG.test(line)) {
          out.push(buildSource(block.attrs, block.lines))
          block = null
        } else {
          block.lines.push(line)
        }
        return
      }
      const open = !inCode && line.match(OPEN_TAG)
      if (open) block = { attrs: open[1], lines: [] }
      else out.push(line)
    })
    if (block) out.push(buildSource(block.attrs, block.lines)) // unclosed: run to the end of the page
    return out.join('\n')
  }

  // Animation headings are not page anchors: drop the ids/anchor links Docsify adds.
  function stripHeadingAnchors(html) {
    return html.replace(SOURCE_BLOCK, (block) => block.replace(HEADING_ANCHOR, '<$1>$2</$1>'))
  }

  // ---------------------------------------------------------------------------
  // Scene parsing
  // ---------------------------------------------------------------------------

  const TOKEN = /"((?:[^"\\]|\\.)*)"|([A-Za-z][\w-]*)\(([^)]*)\)|("[^"]*$)|([[\]])|([^\s,[\]]+)/g
  const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)$/
  const ID = /^[A-Za-z][\w.-]*$/
  const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

  function tokenize(text) {
    const tokens = []
    for (const m of text.matchAll(TOKEN)) {
      if (m[1] !== undefined) tokens.push({ kind: 'str', value: m[1].replace(/\\(.)/g, '$1') })
      else if (m[2] !== undefined) tokens.push({ kind: 'res', name: m[2].toLowerCase(), arg: m[3].trim() })
      else if (m[4] !== undefined) throw new Error('a label is missing its closing quote')
      else if (m[5] !== undefined) tokens.push({ kind: 'bracket', value: m[5] }) // a row's / column's [values]
      else {
        // "2x1" (a size) is two numbers
        const pair = m[6].match(/^([+-]?(?:\d+\.?\d*|\.\d+))[x×]([+-]?(?:\d+\.?\d*|\.\d+))$/i)
        const words = pair ? [pair[1], pair[2]] : [m[6]]
        words.forEach((word) => tokens.push({ kind: 'word', value: word, lower: word.toLowerCase() }))
      }
    }
    return tokens
  }

  function parseAs(type, token, shapes) {
    if (type === 'str') return token?.kind === 'str' ? token.value : undefined
    if (!token || token.kind !== 'word') return undefined
    const word = token.lower
    switch (type) {
      case 'highlight': return HIGHLIGHTS.includes(word) ? word : undefined
      case 'number': return word === 'number' ? word : undefined
      case 'side': return CALLOUT_SIDES[word]
      case 'clear': return word === 'clear' ? word : undefined
      case 'num': return NUMBER.test(word) ? { v: parseFloat(word), rel: /^[+-]/.test(word) } : undefined
      case 'index': return /^\d+$/.test(word) ? Number(word) : undefined // a row's / column's cell number
      case 'id': return shapes.has(token.value) ? token.value : undefined
      case 'placement': return PLACEMENTS.includes(word) ? word : undefined
      case 'align': return ALIGNS[word]
      case 'colour': return COLOURS[word] !== undefined || HEX.test(word) ? word : undefined
      case 'speed': return word in SPEEDS ? SPEEDS[word] : NUMBER.test(word) && !/^[+-]/.test(word) ? parseFloat(word) * 1000 : undefined
      case 'ease': return word in EASES ? word : undefined
    }
    return undefined
  }

  // Tries each value list in turn (longest first) at tokens[i]; returns the first that fits.
  function matchSigs(sigs, tokens, i, shapes) {
    for (const sig of sigs) {
      const values = sig.map((type, k) => parseAs(type, tokens[i + k], shapes))
      if (values.every((v) => v !== undefined)) return { values, sig, next: i + sig.length }
    }
    return null
  }

  // The values after a keyword: one match of its sigs, or one or more of its list.
  function matchKeyword(entry, word, tokens, i, shapes) {
    const build = (m) => (entry.build ? entry.build(m.values, m.sig) : m.values[0])
    if (entry.list) {
      const items = []
      for (let m; (m = matchSigs(entry.list, tokens, i, shapes)); i = m.next) items.push(build(m))
      if (items.length) return { value: items, next: i }
    } else {
      const m = matchSigs(entry.sigs, tokens, i, shapes)
      if (m) return { value: build(m), next: m.next }
    }
    const next = tokens[i]
    const missing = next?.kind === 'word' && ID.test(next.value) && !RESERVED.has(next.lower) && !COLOURS[next.lower]
      && [...(entry.sigs || []), ...(entry.list || [])].some((sig) => sig.includes('id'))
    throw new Error(`"${word}" expects ${entry.help}${missing ? `: no shape called "${next.value}"` : ''}`)
  }

  // Reads the properties and flags of one line (everything after the id and any type word).
  function parseProps(tokens, i, mode, shapes) {
    const props = {}
    const set = (key, value, what = key) => {
      if (key in props) throw new Error(key === 'label' ? 'only one label (quoted text) per line' : `"${what}" is given twice`)
      props[key] = value
    }

    while (i < tokens.length) {
      const token = tokens[i]
      if (token.kind === 'str') { set('label', token.value); i++; continue }
      if (token.kind === 'res') throw new Error(`"${token.name}(…)" must come straight after the id`)
      if (token.kind === 'bracket') throw new Error('[ ] only holds a row\'s or column\'s values, straight after "row" / "column"')
      const word = token.lower
      const entry = KEYWORDS[word]
      if (!entry || (entry.modes && !entry.modes.includes(mode))) {
        if (SHAPE_TYPES.includes(word) || LAYOUT_TYPES.includes(word) || LINE_STARTS.includes(word)) throw new Error(`"${word}" must come straight after the id`)
        if (word === 'keep-style') throw new Error('"keep-style" goes on a value being copied or moved: "v1: a.1", "insert v1 at …" or "remove … into v1"')
        throw new Error(`unknown word "${token.value}"`)
      }
      if (entry.error) throw new Error(entry.error)
      const { value, next } = matchKeyword(entry, word, tokens, i + 1, shapes)
      if (entry.repeat) props[entry.key] = [...(props[entry.key] || []), value]
      else set(entry.key, value, entry.what || word)
      i = next
    }

    // in a row / column, gap is the space between its cells
    if (props.gap && mode !== 'layout' && props.at?.kind !== 'place' && !props.attach) throw new Error('"gap" only works with above / below / left-of / right-of, or attach (or between the cells of a row / column)')
    if (props.at && (props.x || props.y)) throw new Error('the position is given twice (at/move and x/y)')
    return props
  }

  Object.assign(window.Anim, { HEX, ID, NUMBER, parseAs, parseProps, rewriteBlocks,
    stripHeadingAnchors, tokenize })
})()
