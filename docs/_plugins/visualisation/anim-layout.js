/**
 * anim-layout.js - Part of the animation plugin (animation.js), and of its compiler (createCompiler
 * in anim-compile.js): rows, columns, code blocks, grids and tables. Making them and laying out
 * their cells, their views (a grid's rows and columns), spans and ranges, names and indices.
 */

;(function () {
  const { CELL, placeBeside, attachPos, unionBounds, parseProps, bounds, parseAs, NUMBER, besideOf,
    offsetFrom, CHOREOGRAPHY: C, kindOf, LAYOUTS, FONT, textWidth, BARS, mergeBoxes, cellId, indexId,
    markId, NUMBERINGS, nameId, decimalId, LAYOUT_PROPS, LAYOUT_TYPES, article, viewKey, viewId, headId, baseOf, cellRange, pick, tween, baseShape, CELL_STYLE, digitLooks, EDIT_WORDS, REF,
    LAYOUT_NOUNS, nounList, LAYOUT_NAMES, GROUP, wordFor, PARTS } = window.Anim

  window.Anim.COMPILER_PARTS.push((cx) => {
    const { shapes, defaults, newUid } = cx
    // the other parts' functions, linked once every part is made
    let applyDefaults, applyProps, applyStagger, bound, busiest, delayOf, digitsFor, effectOf, followedValue, followValue, holderRef, inTurn,
      layerOf, linkText, numberEach, partsOf, removeShape, replaced, retime, schedule, setValue, speedOf,
      takeBareNumber, valueIn, valueOf, warnEffect

    // A cell's number as written after a verb ("swap 0 3", "range 3 end"): a whole number, or end,
    // the last cell (after: the place after it, where an insert goes on the end). Undefined if it's
    // neither.
    function placeOf(row, token, { after = false } = {}) {
      return numberOf(token, row.members.length, baseOf(row.layout), after)
    }

    // The same, for one of n things numbered from base
    function numberOf(token, n, base, after = false) {
      if (token?.kind === 'word' && token.value === EDIT_WORDS.end) return base + n - (after ? 0 : 1)
      return parseAs('index', token)
    }

    // A list cut into lists of n; and lists of lists turned the other way (lines <-> columns)
    const chunk = (list, n) => Array.from({ length: list.length / n }, (_, k) => list.slice(k * n, (k + 1) * n))
    const transpose = (lists) => lists[0].map((_, k) => lists.map((list) => list[k]))

    // A grid's lines from the top, as views: its heading (if it has one), then its rows
    const gridLines = (grid) => [...(grid.heading ? [grid.heading] : []), ...grid.views.row]

    // A place in a grid (LAYOUTS: views), "[row][column]" ("[1][2]", "[end][0]", a table's
    // "[head][3]"), as its line from the top (gridLines) and its column, both from 0. Undefined if it
    // isn't one; an error if the grid has no such row or column.
    function gridPlaceOf(grid, token) {
      const parts = token?.kind === 'word' ? token.value.match(/^\[([^\]]*)\]\[([^\]]*)\]$/)?.slice(1) || [] : []
      if (parts.length !== 2) return undefined
      const kind = LAYOUTS[grid.layout]
      const base = baseOf(grid.layout)
      const lines = gridLines(grid)
      const across = shapes.get(lines[0]).members.length
      const offset = grid.heading ? 1 : 0 // a table's rows come after its heading
      const number = (part, n) => (part === EDIT_WORDS.end ? n - 1 : /^\d+$/.test(part) ? Number(part) - base : undefined)
      const r = kind.head && parts[0] === kind.head.word ? 0 : number(parts[0], grid.views.row.length) + offset
      const c = number(parts[1], across)
      if (Number.isNaN(r) || c === undefined) return undefined
      const rows = grid.views.row.length ? `${base} to ${base + grid.views.row.length - 1}` : 'none'
      if (r < 0 || r >= lines.length) throw new Error(`"${grid.id}" has no row ${parts[0]} (its rows are ${rows}${grid.heading ? `, and its heading is ${kind.head.word}` : ''})`)
      if (c < 0 || c >= across) throw new Error(`"${grid.id}" has no column ${parts[1]} (its columns are ${base} to ${base + across - 1})`)
      return { r, c }
    }

    // Two places in a layout, written after a verb at tokens[i] and [i + 1] (a row's "0 2" or
    // "3 end", a grid's "[1][2] [3][4]"), either way round: the cells between them (a grid's: the block
    // they're the corners of), in order, and the places, lowest first (as a span keeps them).
    // `example` is the line as it might be written, for the message when they're missing.
    function cellsBetween(row, tokens, i, word, example) {
      const { from, to } = arranged(row).between(row, tokens.slice(i, i + 2), word, example)
      return { from, to, cells: placedCells(row, { from, to }) }
    }

    // A line's two places: numbers (or end), lowest first
    function lineBetween(row, tokens, word, example) {
      const base = baseOf(row.layout)
      const [a, b] = tokens.map((token) => placeOf(row, token))
      if (a === undefined || b === undefined) throw new Error(`"${word}" expects two cell numbers, e.g. ${example(base, base + 2)}`)
      const n = row.members.length
      for (const k of [a, b]) {
        if (k < base || k >= base + n) throw new Error(`"${row.id}" has no cell ${k} (its cells are ${cellRange(row, n)})`)
      }
      return a <= b ? { from: a, to: b } : { from: b, to: a }
    }

    // A grid's two places: the corners of a block, as its top-left and bottom-right
    function gridBetween(grid, tokens, word, example) {
      const [a, b] = tokens.map((token) => gridPlaceOf(grid, token))
      if (!a || !b) throw new Error(`"${word}" expects two of a ${LAYOUTS[grid.layout].noun}'s cells, as [row][column], e.g. ${example('[0][0]', '[1][2]')}`)
      return { from: { r: Math.min(a.r, b.r), c: Math.min(a.c, b.c) }, to: { r: Math.max(a.r, b.r), c: Math.max(a.c, b.c) } }
    }

    // The cells at some places of a layout (as cellsBetween gives them), in order. Places past the
    // end (after a remove) are left out.
    function placedCells(row, places) {
      return arranged(row).cells(row, places).map((cell) => shapes.get(cell)).filter(Boolean)
    }

    // The ids at a line's places, from one number to another; at a grid's, in the block between
    // two corners
    const lineCells = (row, { from, to }) => row.members.slice(from - baseOf(row.layout), to - baseOf(row.layout) + 1)
    const gridCells = (grid, { from, to }) => gridLines(grid).slice(from.r, to.r + 1).flatMap((line) => shapes.get(line).members.slice(from.c, to.c + 1))

    // Where a shape is laid out relative to `frame`, from their offset attachments: a cell in its
    // row, or a grid's cell in one of its rows or columns (both laid out in the grid). Each is
    // followed up to the first shape they're both laid out in.
    function offsetIn(shape, frame) {
      const chain = (start) => {
        const out = new Map()
        let dx = 0
        let dy = 0
        for (let s = start, depth = 0; s && depth < 16; depth++) {
          out.set(s.id, { dx, dy })
          if (s.attach?.kind !== 'offset') break
          dx += s.attach.dx
          dy += s.attach.dy
          s = shapes.get(s.attach.ref)
        }
        return out
      }
      const mine = chain(shape)
      for (const [id, d] of chain(frame)) {
        const m = mine.get(id)
        if (m) return { x: m.dx - d.dx, y: m.dy - d.dy }
      }
      return { x: shape.x - frame.x, y: shape.y - frame.y }
    }

    // A range of a layout's places, written in its id with .. ("Arr[0..2]", "G[1][0..2]",
    // "G.col[2][0..1]", "G[0..1][1..2]", "G[0..1]": whole rows, "T[head..end][0]"): the outermost
    // layout (or a view the path names, G.col[2]) that the [ ] groups after it belong to, and its
    // cells and places between the ends, as cellsBetween gives them. A group with no .. is one place.
    // Undefined if no layout is named.
    function rangeOf(ref, use) {
      const groups = ref.match(/(?:\[[^\][]*\])*$/)[0].match(/[^\][]+(?=\])/g) || []
      let id = ref.slice(0, ref.length - ref.match(/(?:\[[^\][]*\])*$/)[0].length)
      while (!shapes.get(id)?.layout && groups.length) id += `[${groups.shift()}]`
      const row = shapes.get(id)
      if (!row?.layout) return undefined
      const kind = arranged(row)
      if (!groups.length) throw new Error(`"${id}" needs some of its places in [ ], e.g. "${kind.rangeExample(id)}"`)
      if (groups.length > kind.axes) throw new Error(`"${ref}" isn't a range of "${id}"'s places, e.g. "${kind.rangeExample(id)}"`)
      const ends = groups.map((group) => { const [a, b = a] = group.split('..'); return [a.trim(), b.trim()] })
      return { row, ...cellsBetween(row, kind.corners(ends), 0, use, () => `"${kind.rangeExample(id)}"`) }
    }

    // "Arr[0..3]: fill red": a change to some of a row's / column's cells, each changed as if on
    // its own line (stagger: in cell order). Only a look, highlights, emphasis and callouts: the cells
    // stay in the row (LINES: range).
    function changeRange({ row, cells }, tokens, meta, warn) {
      const props = parseProps(tokens, 0, 'range', shapes)
      const own = { ...props }
      delete own.stagger
      withRowMax(row, own)
      if (takeBareNumber(own)) numberEach(cells, own, meta, warn)
      for (const cell of cells) {
        const changed = structuredClone(cell)
        applyProps(changed, own, false, warn, meta)
        shapes.set(changed.id, changed)
        schedule(meta, changed.uid, props)
      }
      applyStagger(row, cells.map((cell) => [cell.uid]), props, meta, warn)
    }

    // "S: span Arr[0..2]": a box round some of a row's / column's / code block's places (SHAPES: span),
    // as one shape for highlights, a callout and a name. It's a part of the row (it goes when the
    // row does) and stays on its places through swaps, inserts and removes (fitSpans). Spanning an
    // existing span again moves it to the new places, gliding there.
    function makeSpan(id, existing, tokens, meta, warn) {
      const example = `e.g. "${id}: span Arr[0..2]"`
      const ref = tokens[1]?.kind === 'word' ? tokens[1].value : ''
      const range = REF.test(ref) ? rangeOf(ref, 'span') : undefined
      const named = ref.replace(/\[.*$/, '')
      if (!range) throw new Error(`"span" expects some of the places of ${LAYOUT_NOUNS}, ${example}${!ref ? '' : shapes.has(named) ? `, and "${named}" isn't one` : `: no shape called "${named}"`}`)
      const { row, from, to } = range
      const rowId = row.id
      const props = parseProps(tokens, 2, 'span', shapes)
      if (rowId === id) throw new Error('a span needs an id of its own')
      const respan = existing?.type === 'span'
      if (existing && !respan) {
        replaced(id, warn)
        removeShape(existing, props, meta, warn)
      }
      const shape = respan ? structuredClone(existing) : { ...baseShape('span'), id, uid: newUid() }
      shape.span = { of: rowId, from, to }
      Object.assign(shape, { part: rowId, role: 'span' })
      checkParts(shape, props)
      if (!respan) applyDefaults(shape)
      fitSpan(shape)
      applyProps(shape, props, !respan && id, warn, meta)
      shapes.set(id, shape)
      const record = schedule(meta, shape.uid, props)
      if (!respan) record.enter = effectOf(props)
      else if (props.effect) warn(`"${props.effect}" only applies when a shape is created or deleted`)
      updateParts(shape, props, meta, warn)
    }

    // A span's box: round its places in its row (each cell's offset in the row and its size), and
    // the cells it covers (for a spotlight). Places past the row's end (after a remove) are left out.
    function fitSpan(span) {
      const row = shapes.get(span.span.of)
      const cells = placedCells(row, span.span)
      span.covers = cells.map((cell) => cell.id)
      const pad = C.spanPad * CELL
      // each cell's box at its place, measured from the row's first cell (bounds: aligned code lines too)
      const box = cells.length ? mergeBoxes(cells.map((cell) => bounds({ ...cell, ...offsetIn(cell, row) }, shapes)))
        : { x0: 0, y0: 0, x1: 0, y1: 0 }
      const dx = (box.x0 + box.x1) / 2
      const dy = (box.y0 + box.y1) / 2
      Object.assign(span, { w: cells.length ? box.x1 - box.x0 + 2 * pad : 0, h: cells.length ? box.y1 - box.y0 + 2 * pad : 0 })
      span.attach = offsetFrom(row.id, dx, dy)
      Object.assign(span, { x: row.x + dx, y: row.y + dy })
    }

    // After every line: each span refitted to its places, as its row's cells move (in the time its
    // busiest cell takes this beat)
    function fitSpans(meta) {
      for (const span of shapes.values()) {
        if (!span.span || !shapes.has(span.span.of)) continue
        const before = [span.w, span.h, span.attach.dx, span.attach.dy].join()
        fitSpan(span)
        if (meta && [span.w, span.h, span.attach.dx, span.attach.dy].join() !== before) {
          retime(meta, span.uid, busiest(meta, shapes.get(span.span.of).members.map((cell) => shapes.get(cell)).filter(Boolean)))
        }
      }
    }

    // "bar" on a row's / column's cells with no max (given, or a default): a full bar is its biggest
    // value now, the same for every cell. Adds it to `look`; `values` are the cells' values (default:
    // the row's cells).
    function withRowMax(row, look, values = row.members.map((id) => shapes.get(id)).filter(Boolean)) {
      if (!BARS[look.bar ?? defaults.bar] || look.max || defaults.max) return
      const biggest = Math.max(...values.map((value) => (value.nil ? NaN : parseFloat(value.label))).filter(Number.isFinite))
      if (biggest > 0) look.max = { v: biggest, rel: false }
    }

    // A var's / row's / column's name tag, and a row's / column's cell numbers (indices), are text
    // shapes that go with it: attached, so they move with it, and removed with it (`part`). The
    // name is "id.name" (left of a var or row, above a column, unless a side is given); indices are
    // "id.index.0", … (smaller and muted, below a row's cells, left of a column's), fixed in the row
    // at the places, so they stay put through a swap and while cells slide in and out, and the last
    // one comes as a slot opens on the end and goes as one closes.
    function checkParts(shape, props) {
      if (props.name && !shape.var && !shape.layout && !shape.span) throw new Error(`"name" is for ${nounList(['var', ...LAYOUT_NAMES, 'span'])}`)
      if (props.indices !== undefined && !shape.layout) throw new Error(`"indices" is for ${LAYOUT_NOUNS}`)
      if (props.indices !== undefined && bound(shape)) throw new Error(`a grid's indices number all its rows and columns, so they go on the whole grid: "${shape.part}: indices"`)
      // props only some layouts take (LAYOUTS: props)
      for (const key of LAYOUT_PROPS) {
        if (props[key] === undefined || LAYOUTS[shape.layout]?.props?.includes(key)) continue
        throw new Error(`"${wordFor(key)}" is for ${nounList(LAYOUT_TYPES.filter((layout) => LAYOUTS[layout].props?.includes(key)).map((layout) => LAYOUTS[layout].noun))}`)
      }
    }

    // A grid's row or column (a view) belongs to its grid, so it can't be deleted or edited on its own
    function refuseView(shape, word) {
      if (bound(shape)) throw new Error(`"${shape.id}" is part of "${shape.part}", so "${word}" doesn't work on it on its own`)
    }

    // opacity: the line's (a group's is taken out of props for its members: restyleMembers)
    function updateParts(shape, props, meta, warn, opacity = props.opacity) {
      if (props.name) setName(shape, props.name, props, meta, warn)
      // a part shown or hidden by its word ("indices", "decimal clear"): whether it was given
      const shown = (key) => {
        if (props[key] === undefined) return false
        const word = wordFor(key)
        if (shape[key] === props[key]) warn(props[key] ? `"${shape.id}" already shows its ${word}` : `"${shape.id}" isn't showing its ${word}`)
        shape[key] = props[key]
        return true
      }
      if (Object.keys(NUMBERINGS).map(shown).some(Boolean)) syncIndices(shape, props, meta)
      if (shown('decimal')) setTag(shape, decimalId(shape.id), 'decimal', decimalTag(shape), props, meta, warn)
      if (opacity !== undefined) fadeParts(shape, opacity, props, meta, warn)
    }

    // "Arr: opacity 0" (or reset): its name, indices and other tags (PARTS: fades) fade with it,
    // each given the same opacity, in the line's time
    function fadeParts(owner, opacity, props, meta, warn) {
      for (const part of partsOf(owner).filter((p) => PARTS[p.role]?.fades)) {
        const changed = structuredClone(part)
        applyProps(changed, { opacity }, false, warn, meta)
        shapes.set(changed.id, changed)
        schedule(meta, changed.uid, props)
      }
    }

    // The side a name goes, unless given: its layout's (LAYOUTS: name), a span's by its row's layout
    // (LAYOUTS: spanName), or left of a var
    function nameSide(owner) {
      if (owner.span) return LAYOUTS[shapes.get(owner.span.of)?.layout]?.spanName || 'top'
      return LAYOUTS[owner.layout]?.name || 'left'
    }

    function setName(owner, name, props, meta, warn) {
      const id = nameId(owner.id)
      const old = shapes.get(id)
      if (name.none && !old) return warn(`"${owner.id}" has no name to clear`)
      const side = name.side || old?.attach?.anchor || nameSide(owner)
      setTag(owner, id, 'name', name.none ? null : { text: name.text, side, gap: NAME_GAP }, props, meta, warn)
    }
    const NAME_GAP = 0.2 // in cells, between a name and its owner

    // A text beside its owner (a part with this role): its name, a number's decimal. tag: its text,
    // side and gap (in cells); none, it goes. Its text is a label like any other, so a "{ }" in it
    // follows values (linkText).
    function setTag(owner, id, role, tag, props, meta, warn) {
      const old = shapes.get(id)
      if (!tag) {
        if (!old) return
        shapes.delete(id)
        tween(meta, old.uid).exit = 'fade'
        schedule(meta, old.uid, props)
        return
      }
      const text = old ? structuredClone(old) : { ...baseShape('text'), id, uid: newUid(), font: TAG_FONT, layer: owner.layer, part: owner.id, role }
      text.label = tag.text
      linkText(text, warn)
      if (tag.anchor) text.anchor = tag.anchor
      text.attach = besideOf(owner.id, tag.side, tag.gap * CELL)
      Object.assign(text, attachPos(text, owner, text.attach))
      shapes.set(id, text)
      if (!old) tween(meta, text.uid).enter = 'fade'
      schedule(meta, text.uid, props)
    }
    const TAG_FONT = 1.2 // a name's and a decimal's font

    // A number's value written out (LAYOUTS: decimal), beside it while shown ("B: decimal"): a
    // label following the number, kept up to date (and counting) as links are (fitLinks)
    const decimalTag = (row) => (row.decimal ? { text: LAYOUTS[row.layout].decimal.label(row.id), ...LAYOUTS[row.layout].decimal } : null)

    // After every line, a number's place values follow its digits, in the time the digits take this
    // beat: each mark of a numbering with a lit look (NUMBERINGS: powers) takes it while its digit
    // isn't 0 (its decimal is a label following it: decimalTag)
    function fitNumbers(meta) {
      for (const row of shapes.values()) {
        if (!LAYOUTS[row.layout]?.radix) continue
        const digits = row.members.map((cell) => shapes.get(cell))
        for (const numbering of Object.values(NUMBERINGS).filter((n) => n.lit)) {
          digits.forEach((digit, k) => {
            const mark = digit && shapes.get(markId(row.id, numbering, k + baseOf(row.layout)))
            if (!mark) return
            const look = digit.label === '0' ? pick(MARK_LOOK, Object.keys(numbering.lit)) : numbering.lit
            if (Object.entries(look).every(([key, value]) => mark[key] === value)) return
            Object.assign(mark, look)
            retime(meta, mark.uid, busiest(meta, [digit]))
          })
        }
      }
    }

    // How a numbering's marks look (unless lit: fitNumbers)
    const MARK_LOOK = { font: 0.88, ink: 'muted' }

    // Whether a layout shows any of its numberings (NUMBERINGS)
    const numbered = (row) => Object.keys(NUMBERINGS).some((key) => row[key])

    // Adds or removes a layout's numbers (each of NUMBERINGS it shows: indices …) so it has one per
    // cell (none of one it doesn't show), new ones fading in `add` ms in and old ones out `remove` ms in.
    function syncIndices(row, props, meta, timing = {}) {
      for (const [key, numbering] of Object.entries(NUMBERINGS)) syncNumbering(row, key, numbering, props, meta, timing)
    }
    function syncNumbering(row, key, numbering, props, meta, { add = 0, remove = 0 }) {
      const marks = row[key] ? indexMarks(row, numbering) : []
      const { numbers } = LAYOUTS[row.layout]
      const kept = new Set()
      for (const mark of marks) {
        const id = markId(row.id, numbering, mark.key)
        kept.add(id)
        const old = shapes.get(id)
        // Fixed in the row beside its place (not on the cell), so it stays with the place while a
        // cell slides in or out of it; at the back, so a sliding cell passes over it
        const text = old || { ...baseShape('text'), id, uid: newUid(), label: mark.label, ...MARK_LOOK, layer: 'back', part: row.id, role: numbering.part }
        if (numbers) text.font = 0.88 * mark.of.font // line numbers keep to the code's size
        const place = { ...mark.of, ...offsetIn(mark.of, row) }
        place.x += row.x
        place.y += row.y
        const p = placeBeside(text, place, mark.index.side, mark.index.gap * CELL)
        text.attach = offsetFrom(row.id, p.x - row.x, p.y - row.y)
        Object.assign(text, p)
        if (old) continue
        shapes.set(id, text)
        tween(meta, text.uid).enter = 'fade'
        schedule(meta, text.uid, props, { after: add })
      }
      // the ones with nothing left to number (or all of them, with indices clear)
      for (const old of partsOf(row, numbering.part).filter((s) => !kept.has(s.id))) {
        shapes.delete(old.id)
        tween(meta, old.uid).exit = 'fade'
        schedule(meta, old.uid, props, { after: remove })
      }
    }

    // What a layout's numbers (a numbering: NUMBERINGS) go beside, in order: each with its id's last
    // part (key), its label, the shape it goes beside (of) and where (LAYOUTS: the numbering's
    // field). A row's / column's cells, or a grid's rows and columns (LAYOUTS: views; a table's
    // heading isn't numbered).
    const indexMarks = (row, numbering) => arranged(row).marks(row, numbering)

    // Marks for some shapes of a layout, in order (ids), numbered from its base: key(k) gives each
    // one's key from its number, and index where it goes (none: it isn't numbered so)
    function marksFor(row, ids, key, index, numbering) {
      if (!index) return []
      const base = baseOf(row.layout)
      return ids.map((id, k) => ({ key: key(k + base), label: String(numbering.label(k + base, LAYOUTS[row.layout])), of: shapes.get(id), index }))
    }
    const lineMarks = (row, numbering) => marksFor(row, row.members, (k) => k, LAYOUTS[row.layout][numbering.field], numbering)
    const gridMarks = (grid, numbering) => Object.entries(LAYOUTS[grid.layout].views)
      .flatMap(([name, view]) => marksFor(grid, grid.views[name], (k) => viewKey(view, k), view[numbering.field], numbering))

    // "Arr: row [5 3 8 1] at 2,3": a layout made by its arrangement (ARRANGE)
    function createLayout(id, layout, tokens, existing, meta, warn) {
      return ARRANGE[LAYOUTS[layout].arrange].create(id, layout, tokens, existing, meta, warn)
    }

    // A row (side by side) or column (one under another) of rect cells, ids "id.0", "id.1", …: a
    // group placed by its first cell. The values go in [ ] straight after the type (numbers or
    // quoted text, commas optional), or a bare count makes that many empty cells; size, gap and
    // the look apply to every cell. A code block's are lines (LAYOUTS: lines).
    function createLine(id, layout, tokens, existing, meta, warn) {
      if (LAYOUTS[layout].lines) return createLines(id, layout, tokens, existing, meta, warn)
      if (LAYOUTS[layout].radix) return createNumber(id, layout, tokens, existing, meta, warn)
      const example = `e.g. "${id}: ${layout} [5 3 8 1] at 2,3" (words in quotes: ["A" "B"]), or a number of empty cells: "${id}: ${layout} 4 at 2,3"`
      const count = tokens[1]?.kind === 'word' && NUMBER.test(tokens[1].value) ? tokens[1].value : null
      if (count !== null && !/^\d+$/.test(count)) throw new Error(`a ${layout}'s number of cells is a whole number, e.g. "${id}: ${layout} 4", not "${count}"`)
      if (count !== null && +count < 1) throw new Error(`a ${layout} needs at least one cell`)
      if (count === null && (tokens[1]?.kind !== 'bracket' || tokens[1].value !== '[')) throw new Error(`a ${layout}'s values go in [ ] straight after "${layout}", ${example}`)
      let values = count === null ? [] : Array.from({ length: +count }, () => ({ label: '' }))
      let j = 1
      if (count === null) ({ values, next: j } = readList(tokens, 1, `a ${layout}`))
      if (count === null && tokens[j]?.value !== ']') throw new Error(`the "[" of a ${layout} has no closing "]"`)
      if (!values.length) throw new Error(`a ${layout} needs at least one value, ${example}`)
      const props = parseProps(tokens, j + 1, 'layout', shapes, id)
      if (props.label !== undefined) throw new Error(count === null ? `a ${layout}'s values all go inside its [ ]` : `a ${layout} of ${count} empty cells has no labels: give its values in [ ] instead`)
      makeLayout(id, layout, values, props, existing, meta, warn)
    }

    // A layout of lines (LAYOUTS: lines), "c: code "print(x)" lang python at 2,1", or its lines in
    // [ ]: a column of code lines, C[1], C[2], … (numbered from 1), each as wide as the longest (fitCode).
    function createLines(id, layout, tokens, existing, meta, warn) {
      const { noun, item } = LAYOUTS[layout]
      const example = `e.g. "${id}: ${layout} "print(x)" lang python at 2,1", or its ${item}s in [ ]: "${id}: ${layout} ["x = 1" "print(x)"] at 2,1"`
      let values = []
      let j = 1
      if (tokens[1]?.kind === 'str') {
        values.push({ label: tokens[1].value })
        j = 2
      } else {
        if (tokens[1]?.kind !== 'bracket' || tokens[1].value !== '[') throw new Error(`a ${noun}'s ${item}s go in quotes straight after "${layout}", ${example}`)
        const lines = readLines(tokens, 1, { noun, item, example })
        values = lines.values.map((label) => ({ label }))
        j = lines.next
      }
      const props = parseProps(tokens, j, 'layout', shapes, id)
      if (props.label !== undefined) throw new Error(`a ${noun} takes one "quoted" ${item}, or its ${item}s in [ ], ${example}`)
      const sized = ['size', 'width', 'height'].find((key) => props[key])
      if (sized) throw new Error(`a ${noun} is as big as its ${item}s, so it takes no "${sized}" (use font to make it bigger or smaller)`)
      makeLayout(id, layout, values, props, existing, meta, warn)
    }

    // A number (LAYOUTS: radix), "B: binary 67 at 2,3 digits 8", or a var's or cell's value
    // ("B: binary V1"): a row of its digits, lowest first (B[0]) and numbered from the right, as many
    // as its digits (LAYOUTS: digits)
    function createNumber(id, layout, tokens, existing, meta, warn) {
      const { noun, digits } = LAYOUTS[layout]
      const example = `e.g. "${id}: ${layout} 67 at 2,3", or a var's value: "${id}: ${layout} V1 at 2,3"`
      const source = !valueOf(tokens[1]) && holderRef(tokens[1]) ? holderRef(tokens[1], `make ${article(noun)} ${noun} from`) : undefined
      const followed = followedValue(id, tokens[1], id) // "B: binary {A}"
      const value = valueOf(tokens[1]) || followed || (source && valueIn(source))
      if (!value) throw new Error(`a ${noun}'s value goes straight after "${layout}", ${example}`)
      const props = parseProps(tokens, 2, 'layout', shapes, id)
      if (props.label !== undefined) throw new Error(`a ${noun} holds one value, straight after "${layout}", ${example}`)
      const given = props[digits.prop]
      const count = given ? given.v : digits.default
      if (given && (given.rel || !Number.isInteger(count) || count < 1 || count > digits.max)) throw new Error(`"${wordFor(digits.prop)}" is a whole number from 1 to ${digits.max}`)
      makeLayout(id, layout, digitsFor(layout, value, count, warn).map((label) => ({ label })), props, existing, meta, warn)
      if (followed) followValue(shapes.get(id), followed, warn)
    }

    // "Quoted" lines in [ ] from the "[" at tokens[j] (a code block's, a script's): the lines, and
    // the token after its "]". noun, item and example name them in messages.
    function readLines(tokens, j, { noun, item, example }) {
      const values = []
      for (j++; j < tokens.length && tokens[j].kind !== 'bracket'; j++) {
        if (tokens[j].kind !== 'str') throw new Error(`a ${noun}'s ${item}s are "quoted" text, not "${tokens[j].value ?? tokens[j].name}" (is a "]" missing?)`)
        values.push(tokens[j].value)
      }
      if (tokens[j]?.value !== ']') throw new Error(`the "[" of a ${noun} has no closing "]"`)
      if (!values.length) throw new Error(`a ${noun} needs at least one ${item}, ${example}`)
      return { values, next: j + 1 }
    }

    // Values in [ ] from the "[" at tokens[j] (numbers, "quoted" text or null, commas optional), as
    // in "row [5 3 8]": the values, and where the list stops (its "]", if it has one). `what` names
    // what they're for in messages ("a row").
    function readList(tokens, j, what) {
      const values = []
      for (j++; j < tokens.length && tokens[j].kind !== 'bracket'; j++) {
        const value = valueOf(tokens[j])
        if (!value) throw new Error(`${what}'s values are numbers, "quoted" text or null, not "${tokens[j].value ?? tokens[j].name}" (is a "]" missing?)`)
        values.push(value)
      }
      return { values, next: j }
    }

    // A grid or table (LAYOUTS: views): its rows of values in [ ], each in [ ] like a row's
    // ("G: grid [[1 2 3] [4 5 6]]", commas optional), or a number of empty cells across and down
    // ("G: grid 4x3"). Shorter rows are filled out with empty cells. A table's first row is its
    // headings.
    function createGrid(id, layout, tokens, existing, meta, warn) {
      const { noun } = LAYOUTS[layout]
      const example = `e.g. "${id}: ${layout} [[1 2 3] [4 5 6]] at 2,2" (words in quotes: ["A" "B"]), or a number of empty cells across and down: "${id}: ${layout} 4x3 at 2,2"`
      const count = (token) => (token?.kind === 'word' && /^\d+$/.test(token.value) ? +token.value : null)
      const rows = []
      let j
      if (count(tokens[1]) !== null) {
        const [across, down] = [count(tokens[1]), count(tokens[2])]
        if (down === null) throw new Error(`a ${noun}'s number of cells is across x down, e.g. "${id}: ${layout} 4x3"`)
        if (!across || !down) throw new Error(`a ${noun} needs at least one cell`)
        for (let r = 0; r < down; r++) rows.push(Array.from({ length: across }, () => ({ label: '' })))
        j = 3
      } else {
        if (tokens[1]?.kind !== 'bracket' || tokens[1].value !== '[') throw new Error(`a ${noun}'s rows go in [ ] straight after "${layout}", ${example}`)
        for (j = 2; tokens[j]?.value === '['; j++) {
          const list = readList(tokens, j, `a ${noun}`)
          const { values } = list
          j = list.next
          if (tokens[j]?.value !== ']') throw new Error(`a row of a ${noun} has no closing "]"`)
          if (!values.length) throw new Error(`a row of a ${noun} needs at least one value, ${example}`)
          rows.push(values)
        }
        if (tokens[j]?.value !== ']') throw new Error(tokens[j] ? `a ${noun}'s rows each go in [ ], ${example}` : `the "[" of a ${noun} has no closing "]"`)
        if (!rows.length) throw new Error(`a ${noun} needs at least one row, ${example}`)
        j++
      }
      const across = Math.max(...rows.map((values) => values.length))
      if (rows.some((values) => values.length < across)) warn(`the rows of "${id}" aren't all ${across} long, so the short ones are filled out with empty cells`)
      for (const values of rows) while (values.length < across) values.push({ label: '' })
      const props = parseProps(tokens, j, 'layout', shapes, id)
      if (props.label !== undefined) throw new Error(`a ${noun}'s values all go inside its [ ]`)
      makeLayout(id, layout, rows, props, existing, meta, warn)
    }

    // The ids of a grid with some lines (its heading, if it has one, then its rows) and columns: its
    // views' (LAYOUTS: views, by name), its heading's, its lines' from the top, and each cell's,
    // cell(line, column). Ids go with the places, so they're the same after any edit.
    function gridNames(id, layout, lines, across) {
      const kind = LAYOUTS[layout]
      const base = baseOf(layout)
      const heading = kind.head ? headId(id, kind.head) : null
      const ids = (view, n) => Array.from({ length: n }, (_, k) => viewId(id, view, k + base))
      const views = { row: ids(kind.views.row, lines - (heading ? 1 : 0)), col: ids(kind.views.col, across) }
      const lineIds = [...(heading ? [heading] : []), ...views.row]
      return { heading, views, lineIds, cell: (r, c) => cellId(lineIds[r], c + base) }
    }

    // Lays a grid's cells (matrix: its lines from the top, each a list of cells) out from its first
    // one, naming them by their places: each column as wide as its widest cell and each line as tall
    // as its tallest, `gap` apart. Sets the grid's members and its views' ids.
    function layoutGrid(grid, matrix) {
      const names = gridNames(grid.id, grid.layout, matrix.length, matrix[0].length)
      const widths = matrix[0].map((_, c) => Math.max(...matrix.map((line) => line[c].w)))
      const heights = matrix.map((line) => Math.max(...line.map((cell) => cell.h)))
      const start = (sizes, n) => sizes.slice(0, n).reduce((sum, size) => sum + size + grid.gap, 0) + (sizes[n] - sizes[0]) / 2 + fromEdge(sizes[0])
      matrix.forEach((line, r) => line.forEach((cell, c) => {
        cell.id = names.cell(r, c)
        cell.attach = offsetFrom(grid.id, start(widths, c), start(heights, r))
      }))
      Object.assign(grid, { members: matrix.flat().map((cell) => cell.id), views: names.views, heading: names.heading })
    }

    // A grid's rows and columns (and a table's heading): groups of its cells (LAYOUTS: views) that
    // don't own them, so a look, highlight, range or span works on one as on a row or column. Each
    // is part of the grid, laid out in it at its first cell, and covers its cells (a spotlight or
    // glow on it lights them). Made, refitted (in the time its cells take) or removed to match the
    // grid's lines and columns, after it's made and after every edit.
    function syncViews(grid, props, meta, warn) {
      const kind = LAYOUTS[grid.layout]
      const base = baseOf(grid.layout)
      const lines = gridLines(grid)
      const across = grid.members.length / lines.length
      const wanted = [
        ...lines.map((line) => [line, kind.views.row.layout, Array.from({ length: across }, (_, c) => cellId(line, c + base))]),
        ...grid.views.col.map((col, c) => [col, kind.views.col.layout, lines.map((line) => cellId(line, c + base))]),
      ]
      for (const [id, layout, members] of wanted) {
        const old = shapes.get(id)
        const cells = members.map((cell) => shapes.get(cell))
        const first = cells[0]
        const b = unionBounds(cells, shapes)
        const view = old ? structuredClone(old) : { ...baseShape(GROUP), id, uid: newUid(), layout, part: grid.id, role: 'view' }
        Object.assign(view, {
          members, covers: members, attach: offsetFrom(grid.id, first.attach.dx, first.attach.dy), x: first.x, y: first.y,
          w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2 - first.x, cy: (b.y0 + b.y1) / 2 - first.y,
        })
        shapes.set(id, view)
        if (!old) schedule(meta, view.uid, props).enter = 'fade'
        else if (JSON.stringify([old.members, old.attach]) !== JSON.stringify([view.members, view.attach])) retime(meta, view.uid, busiest(meta, cells))
      }
      const keep = new Set(wanted.map(([id]) => id))
      for (const view of partsOf(grid, 'view').filter((s) => !keep.has(s.id))) removeShape(view, props, meta, warn)
    }

    // A layout's cells' ids from its values: flat, its values in order (a line's are a list, a
    // grid's its lines from the top, each a list); ids, each cell's; views, the ids of what it lays
    // them out in (a grid's lines and columns); headings, how many of the first cells are headings
    // (LAYOUTS: head)
    const lineIds = (id, layout, values) => ({ flat: values, ids: values.map((_, k) => cellId(id, k + baseOf(layout))), views: [], headings: 0 })
    function gridIds(id, layout, values) {
      const names = gridNames(id, layout, values.length, values[0].length)
      return {
        flat: values.flat(), ids: values.flatMap((line, r) => line.map((_, c) => names.cell(r, c))),
        views: [...names.lineIds, ...names.views.col], headings: names.heading ? values[0].length : 0,
      }
    }

    // How each arrangement of a layout's cells (LAYOUTS: arrange) is made, laid out and read:
    //   create(id, layout, tokens, existing, meta, warn)  reads a new one's values and makes it
    //   ids(id, layout, values)  its cells' ids from its values (lineIds, gridIds)
    //   lay(frame, cells, values)  lays new cells out from the first (ids, offsets), and sets the
    //                              layout's members (frame: its id, layout and gap)
    //   relay(row, cells)  lays its cells out again, in order, as they are now (relayLayout)
    //   sync(row, props, meta, warn)  after it's made or edited: a grid's views
    //   between(row, tokens, word, example)  two places written after a verb, lowest first
    //   cells(row, places)  the ids at some places
    //   marks(row, numbering)  what its numbers go beside (indexMarks)
    //   axes  how many [ ] groups a range of its places has (rangeOf): a line's [from..to], a grid's
    //         [rows][columns]
    //   corners(ends)  a range's two ends (each group's [from, to]; a grid with one group: whole rows)
    //                  as the tokens between reads
    //   rangeExample(id)  a range written out, for messages
    const wordToken = (value) => ({ kind: 'word', value })
    const ARRANGE = {
      line: {
        create: createLine, ids: lineIds, lay: (frame, cells) => layoutCells(frame, cells), relay: layoutCells, sync: () => {},
        between: lineBetween, cells: lineCells, marks: lineMarks,
        axes: 1, corners: ([[a, b]]) => [wordToken(a), wordToken(b)], rangeExample: (id) => `${id}[0..2]`,
      },
      grid: {
        create: createGrid, ids: gridIds, lay: (frame, cells, values) => layoutGrid(frame, chunk(cells, values[0].length)), sync: syncViews,
        relay: (grid, cells) => layoutGrid(grid, chunk(cells, cells.length / gridLines(grid).length)),
        between: gridBetween, cells: gridCells, marks: gridMarks,
        axes: 2, corners: ([rows, cols = [0, EDIT_WORDS.end]]) => [0, 1].map((k) => wordToken(`[${rows[k]}][${cols[k]}]`)), rangeExample: (id) => `${id}[0..1][1..2]`,
      },
    }
    // A layout's arrangement (ARRANGE)
    const arranged = (row) => ARRANGE[LAYOUTS[row.layout].arrange]

    // Makes a row / column / code block from its cells' values (a grid / table: its rows of values)
    // and the line's props.
    function makeLayout(id, layout, values, props, existing, meta, warn) {
      checkParts({ layout }, props)
      if (existing) {
        replaced(id, warn)
        removeShape(existing, props, meta, warn)
      }
      const kind = LAYOUTS[layout]
      const arrangement = ARRANGE[kind.arrange]
      const { flat, ids, views, headings } = arrangement.ids(id, layout, values)
      for (const taken of [...ids, ...views]) {
        if (!shapes.has(taken)) continue
        warn(`"${taken}" already exists, so it is replaced by ${views.includes(taken) ? 'a row or column' : 'a cell'} of "${id}"`)
        removeShape(shapes.get(taken), props, meta, warn)
      }

      // The cells, laid out from the first one (at 0,0 for now)
      const gap = props.gap ? props.gap.v * CELL : 0
      const look = pick(props, ['size', 'width', 'height', ...CELL_STYLE])
      withRowMax(null, look, flat)
      const cells = flat.map((value, k) => {
        // a number's cells are its digits (LAYOUTS: radix)
        const cell = { ...baseShape(kind.cell), id: ids[k], uid: newUid(), holds: true, ...(kind.radix && { digit: layout }), x: 0, y: 0 }
        applyDefaults(cell)
        // a digit's own looks come after the defaults, so only its line's override them
        if (kind.radix) Object.assign(cell, kind.digits.look, { start: { ...cell.start, ...kind.digits.look }, auto: digitLooks(layout) })
        applyProps(cell, look, id, warn, meta) // made with its layout: its looks can follow the layout's value
        setValue(cell, value)
        cell.layer = layerOf(props)
        return cell
      })
      // a blank cell in the row's look, for cells added later (insert)
      const blank = { ...structuredClone(cells[0]), label: '', nil: false }
      delete blank.id
      delete blank.uid
      // a table's headings start with their own look (LAYOUTS: head)
      cells.slice(0, headings).forEach((cell) => applyProps(cell, kind.head.look, false, warn, meta))
      if (kind.fit) fitLines(cells)
      const frame = { id, layout, gap }
      arrangement.lay(frame, cells, values)
      cells.forEach((cell) => Object.assign(cell, { x: cell.attach.dx, y: cell.attach.dy }))
      if (takeBareNumber(props)) numberEach(cells, props, meta, warn)
      const b = unionBounds(cells, shapes)
      const row = {
        ...baseShape(GROUP), id, uid: newUid(), layout, members: ids, gap, cell: blank, ...(kind.radix && { holds: true }),
        w: b.x1 - b.x0, h: b.y1 - b.y0, cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2,
      }
      Object.assign(row, pick(frame, ['views', 'heading'])) // a grid's
      applyProps(row, pick(props, ['at', 'x', 'y', 'highlight', 'callout']), id, warn, meta)
      shapes.set(id, row)
      schedule(meta, row.uid, props).enter = 'fade'
      for (const cell of cells) {
        Object.assign(cell, { x: row.x + cell.attach.dx, y: row.y + cell.attach.dy })
        shapes.set(cell.id, cell)
        schedule(meta, cell.uid, props).enter = effectOf(props)
      }
      arrangement.sync(row, props, meta, warn)
      if (props.effect) warnEffect(cells[0], props.effect, warn)
      updateParts(row, props, meta, warn)
      if (LAYOUTS[layout].typeInTurn && inTurn(props)) typeInTurn(row, cells, partsOf(row), props, meta)
      applyStagger(row, cells.map((cell) => [cell.uid]), { ...props, at: null, x: null, y: null }, meta, warn) // placing it isn't a move
    }

    // A layout's cells laid out again where their sizes have changed (a round bar squares them), each
    // moving to its new place with the line (ARRANGE: relay)
    function relayLayout(row, props, meta, warn) {
      const cells = row.members.map((id) => shapes.get(id)).filter(Boolean)
      const before = cells.map((cell) => [cell.attach.dx, cell.attach.dy].join())
      arranged(row).relay(row, cells)
      if (cells.every((cell, k) => [cell.attach.dx, cell.attach.dy].join() === before[k])) return
      cells.forEach((cell) => Object.assign(cell, { x: row.x + cell.attach.dx, y: row.y + cell.attach.dy }))
      arranged(row).sync(row, props, meta, warn)
      if (numbered(row)) syncIndices(row, props, meta)
    }

    // A layout is placed (at) by the grid square its first cell starts in: the offset from the
    // square's middle (the layout's place) to the middle of a cell `size` long whose start edge (left
    // or top) is the square's. 0 for a one-square cell.
    const fromEdge = (size) => (size - CELL) / 2

    // Lays a row's / column's cells out in order from its first cell: ids id.0, id.1, … and their
    // offsets in it, the cell at its start (left / top) starting in its place's square (fromEdge).
    // Reversed (LAYOUTS: reverse), the first is last along, and the last is at the start.
    function layoutCells(row, cells) {
      const { across, reverse } = LAYOUTS[row.layout]
      const lead = reverse ? cells[cells.length - 1] : cells[0]
      let offset = 0
      const offsets = cells.map((cell, k) => {
        const before = cells[k - 1]
        if (before) offset += (across ? (before.w + cell.w) / 2 : (before.h + cell.h) / 2) + (row.gap || 0)
        return offset
      })
      cells.forEach((cell, k) => {
        const along = reverse ? offset - offsets[k] : offsets[k]
        cell.id = cellId(row.id, k + baseOf(row.layout))
        cell.attach = offsetFrom(row.id, (across ? along : 0) + fromEdge(lead.w), (across ? 0 : along) + fromEdge(lead.h))
      })
      row.members = cells.map((cell) => cell.id)
    }

    // A fitted layout's cells (LAYOUTS: fit) all take the size of the biggest, so a fill or highlight
    // makes even bands: a code line's text's width (spaces kept) plus a margin each side, and its
    // height (SHAPES: pre). Changed in place.
    function fitLines(cells) {
      const size = (cell) => FONT * cell.font
      const pre = (cell) => kindOf(cell).pre
      const w = Math.max(...cells.map((cell) => textWidth(cell.label, size(cell), cell.bold, cell.mono, true) + 2 * pre(cell).pad * size(cell)))
      const h = Math.max(...cells.map((cell) => pre(cell).height * size(cell)))
      for (const cell of cells) Object.assign(cell, { w, h })
    }

    // After every line: a code block whose lines have changed (a longer line, a new font, a line
    // inserted or removed) is refitted, its lines resized and moved to match, in the time its
    // busiest line takes this beat. Its line numbers move with them.
    function fitCode(meta) {
      for (const row of shapes.values()) {
        if (!LAYOUTS[row.layout]?.fit || !row.members.length) continue
        const cells = row.members.map((id) => shapes.get(id)).filter(Boolean)
        const before = cells.map((cell) => [cell.w, cell.h, cell.attach.dx, cell.attach.dy].join())
        fitLines(cells)
        layoutCells(row, cells)
        const changed = cells.filter((cell, k) => [cell.w, cell.h, cell.attach.dx, cell.attach.dy].join() !== before[k])
        if (!changed.length) continue
        const timing = busiest(meta, cells)
        changed.forEach((cell) => retime(meta, cell.uid, timing))
        if (numbered(row)) {
          syncIndices(row, {}, meta)
          for (let k = 0; k < cells.length; k++) {
            const index = shapes.get(indexId(row.id, k + baseOf(row.layout)))
            if (index) retime(meta, index.uid, timing)
          }
        }
      }
    }

    // typed on a code block: its panel, name and line numbers (`parts`) fade in quickly, then its
    // lines type out one after another, in the line's time (each line's share by its length, so the
    // typing keeps an even pace). Deleted (`leaving`), the lines untype the same way, then the rest
    // fades.
    function typeInTurn(row, cells, parts, props, meta, leaving = false) {
      const total = speedOf(props)
      const fade = C.panelFade * total
      const chars = cells.map((cell) => [...cell.label].length)
      const all = chars.reduce((a, b) => a + b, 0) || 1
      const start = delayOf(props)
      let after = leaving ? 0 : fade
      cells.forEach((cell, k) => {
        const record = tween(meta, cell.uid)
        record.dur = (total * chars[k]) / all
        record.delay = start + after
        after += record.dur
      })
      for (const shape of [row, ...parts]) Object.assign(tween(meta, shape.uid), { dur: fade, delay: start + (leaving ? total : 0) })
    }

    return {
      functions: { arranged, cellsBetween, changeRange, checkParts, chunk, createLayout, fitCode, fitLines, fitNumbers, fitSpans, gridLines,
        gridPlaceOf, layoutCells, layoutGrid, numbered, numberOf, placeOf, readLines, readList, refuseView, relayLayout, syncIndices, transpose,
        rangeOf, typeInTurn, updateParts, withRowMax },
      verbs: { span: makeSpan },
      link: () => {
        ({ applyDefaults, applyProps, applyStagger, bound, busiest, delayOf, digitsFor, effectOf, followedValue, followValue, holderRef,
          inTurn, layerOf, linkText, numberEach, partsOf, removeShape, replaced, retime, schedule, setValue,
          speedOf, takeBareNumber, valueIn, valueOf, warnEffect } = cx)
      },
    }
  })
})()
