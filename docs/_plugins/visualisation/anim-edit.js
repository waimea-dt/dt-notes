/**
 * anim-edit.js - Part of the animation plugin (animation.js), and of its compiler (createCompiler
 * in anim-compile.js): swap, insert and remove, on a row's / column's / code block's cells and a
 * grid's rows and columns.
 */

;(function () {
  const { CELL, parseProps, offsetFrom, CHOREOGRAPHY: C, LAYOUTS, BARS, cellId, baseOf, cellRange,
    tween, baseShape, LAYOUT_TYPES, LINES, EDIT_WORDS, SHAPES, nounOf, nounList, scriptOf, scriptBlocksIn, blockOnLine } = window.Anim

  // The layouts that can be edited (not LAYOUTS: fixed), for messages
  const EDITABLE_NOUNS = nounList(LAYOUT_TYPES.filter((layout) => !LAYOUTS[layout].fixed).map((layout) => LAYOUTS[layout].noun))

  window.Anim.COMPILER_PARTS.push((cx) => {
    const { shapes, newUid } = cx
    // the other parts' functions, linked once every part is made
    let applyProps, arranged, chunk, fitLines, fly, flyValue, freezeEndsAttachedTo, gridLines, gridPlaceOf,
      holderRef, keptStyle, layoutCells, layoutGrid, noShape, numbered, numberOf, pointOf, readLines, readList, refuseView,
      schedule, setValue, speedOf, syncIndices, transpose, valueIn, valueOf

    // What a swap, insert or remove moves as one (a unit), read from the line at tokens[1] by its
    // arrangement (EDITS: axis): one of a row's / column's / code block's cells; a grid's rows, or
    // (after a view's word, "col") its columns (LAYOUTS: views); or for a swap of two places
    // ("1.2 0.0"), its cells one at a time.
    //   units   each unit's cells, in order; noun, what one is called; base, the first's number
    //   size    how many cells a unit has; fixed, lines that stay put above them (a table's heading)
    //   across  units go side by side (otherwise one under another); next, the token after any word
    //   single  units are single cells of a grid (a swap's places)
    //   range   its units' numbers, for messages
    //   place(token, after)  a unit's position (from 0) as written: a number, or end (after: the
    //           place after the last); undefined if it's neither
    //   missing(k)  the message for a unit k (as written) that isn't there
    //   steps(i, j) how many places apart two units are
    //   headed(k)   whether cell k of a new unit is a heading (LAYOUTS: head)
    //   relay(list) lays the layout out again from its units in this order (ids go with the places)
    const editAxis = (row, tokens) => edits(row).axis(row, tokens)

    // A unit's position from 0, as written: a number from base, or end, of n units
    function unitOf(token, n, base, after) {
      const k = numberOf(token, n, base, after)
      return k === undefined ? undefined : k - base
    }

    // A line's cells, one at a time
    function lineAxis(row) {
      const kind = LAYOUTS[row.layout]
      const base = baseOf(row.layout)
      const units = row.members.map((cell) => shapes.get(cell)).filter(Boolean).map((cell) => [cell])
      return {
        units, noun: kind.item, base, size: 1, fixed: 0, across: kind.across, next: 1, range: cellRange(row, units.length),
        place: (token, after) => unitOf(token, units.length, base, after),
        missing: (k) => `"${cellId(row.id, k)}" isn't a cell of "${row.id}" (its cells are ${cellRange(row, units.length)})`,
        steps: (i, j) => Math.abs(i - j), headed: () => false, relay: (list) => layoutCells(row, list.flat()),
      }
    }

    // A grid's rows, or columns (after their view's word), or for two places its cells
    function gridAxis(grid, tokens) {
      const kind = LAYOUTS[grid.layout]
      const base = baseOf(grid.layout)
      const matrix = gridLines(grid).map((line) => shapes.get(line).members.map((cell) => shapes.get(cell)))
      const across = matrix[0].length
      const fixed = matrix.length - grid.views.row.length
      if (gridPlaceOf(grid, tokens[1])) {
        const units = matrix.flat().map((cell) => [cell])
        const at = (k) => ({ r: Math.floor(k / across), c: k % across })
        return {
          units, noun: kind.item, base, size: 1, fixed: 0, single: true, next: 1,
          place: (token) => { const p = gridPlaceOf(grid, token); return p && p.r * across + p.c },
          steps: (i, j) => Math.abs(at(i).r - at(j).r) + Math.abs(at(i).c - at(j).c), headed: () => false,
          relay: (list) => layoutGrid(grid, chunk(list.flat(), across)),
        }
      }
      // a view's word picks it (col); with none, the one without a word (rows)
      const word = tokens[1]?.kind === 'word' ? tokens[1].lower : null
      const view = Object.values(kind.views).find((v) => v.word && v.word === word) || Object.values(kind.views).find((v) => !v.word)
      const lines = view === kind.views.row // its units are lines, one under another (else columns)
      const units = lines ? matrix.slice(fixed) : transpose(matrix)
      const { noun } = LAYOUTS[view.layout]
      const range = units.length ? `${base} to ${base + units.length - 1}` : 'none'
      return {
        units, noun, base, size: lines ? across : matrix.length, fixed: lines ? fixed : 0, across: !lines, next: view.word ? 2 : 1, range,
        place: (token, after) => unitOf(token, units.length, base, after),
        missing: (k) => `"${grid.id}" has no ${noun} ${k} (its ${noun}s are ${range})`,
        steps: (i, j) => Math.abs(i - j), headed: (k) => !lines && k < fixed,
        relay: (list) => layoutGrid(grid, lines ? [...matrix.slice(0, fixed), ...list] : transpose(list)),
      }
    }

    // What an insert puts into a line: one value, or a var's or cell's (source), at tokens[next]
    function lineInsert(row, axis, tokens, next, example) {
      const source = holderRef(tokens[next]) && !valueOf(tokens[next]) ? structuredClone(holderRef(tokens[next], 'insert')) : undefined
      const value = valueOf(tokens[next]) || (source && valueIn(source))
      if (!value) throw new Error(`"insert" expects a value (a number, "quoted" text or null) or a var, e.g. ${example}`)
      return { values: [value], source, next: next + 1 }
    }

    // What an insert puts into a grid: a row's or column's values in [ ] at tokens[next]
    function gridInsert(grid, axis, tokens, next, example) {
      const { noun, size } = axis
      if (tokens[next]?.value !== '[') throw new Error(`"insert" expects a ${noun}'s values in [ ], e.g. ${example}`)
      const list = readList(tokens, next, `a ${noun}`)
      if (tokens[list.next]?.value !== ']') throw new Error(`the "[" of a ${noun} has no closing "]"`)
      if (list.values.length > size) throw new Error(`a ${noun} of "${grid.id}" has ${size} cells, so it takes at most ${size} values`)
      return { values: list.values, next: list.next + 1 }
    }

    // What edits each arrangement of cells (LAYOUTS: arrange) takes, and how:
    //   axis(row, tokens)  what an edit moves (editAxis)
    //   insert(row, axis, tokens, next, example)  what an insert puts in, read at tokens[next]:
    //                       values, any source (a var or cell copied in), and the token after them
    //   inserts             what goes in, for messages
    //   into     a remove can move the cell's value into a var or cell
    //   keepOne  it keeps at least one cell (its last row or column can't be removed)
    //   swaps(row, base)    how a swap is written, for messages
    //   edits(row, removing)  how an insert or remove is written, for messages
    const EDITS = {
      line: {
        axis: lineAxis, insert: lineInsert, inserts: 'a value', into: true, keepOne: false,
        swaps: (row, base) => `two cell numbers, e.g. "${row.id}: swap ${base} ${base + 3}"`,
        edits: (row, removing) => (removing ? `"${row.id}: remove 2" or "${row.id}: remove end into v1"`
          : LAYOUTS[row.layout].lines ? `"${row.id}: insert "x = 1" at 2" or "${row.id}: insert "x = 1" at end"` : `"${row.id}: insert 7 at 3" or "${row.id}: insert v1 at end"`),
      },
      grid: {
        axis: gridAxis, insert: gridInsert, inserts: 'its values', into: false, keepOne: true,
        swaps: (grid, base) => {
          const ways = Object.values(LAYOUTS[grid.layout].views).map((view) => `"${grid.id}: swap ${view.word ? `${view.word} ` : ''}${base} ${base + 1}"`)
          return `two of a ${LAYOUTS[grid.layout].noun}'s rows, columns or cells, e.g. ${ways.join(', ')} or "${grid.id}: swap 0.0 1.2"`
        },
        edits: (grid, removing) => {
          const col = Object.values(LAYOUTS[grid.layout].views).find((view) => view.word).word
          return removing ? `"${grid.id}: remove 1" or "${grid.id}: remove ${col} end"` : `"${grid.id}: insert [1 2 3] at 1" or "${grid.id}: insert ${col} [1 2 3] at end"`
        },
      },
    }
    const edits = (row) => EDITS[LAYOUTS[row.layout].arrange]

    // A layout whose cells stay as made (LAYOUTS: fixed, a number's digits) takes no swap, insert or remove
    function refuseFixed(row, word) {
      const { fixed, noun, item } = LAYOUTS[row.layout]
      if (fixed) throw new Error(`"${word}" doesn't work on a ${noun}: its ${item}s stay in place (give one a value instead, e.g. "${cellId(row.id, baseOf(row.layout))}: 1")`)
    }

    // "arr: swap 0 3": two cells change places, one arcing over and one under (a column's: to the
    // right and left). Ids go with the places, so afterwards arr.0 is the cell now first; whatever
    // is attached to arr.0 (a pointer) stays there, and highlights go with the cells. A grid's two
    // rows, two columns ("g: swap col 1 3") or two cells ("g: swap 1.2 0.0") swap the same way, each
    // cell with the one in the same place in the other.
    function swapCells(id, row, tokens, meta, warn, word) {
      if (!row) throw noShape(id)
      if (scriptOf(row)) return editScript(id, row, tokens, meta, warn, word)
      if (!row.layout) throw new Error(`"swap" swaps two cells of ${EDITABLE_NOUNS}, and "${id}" isn't one`)
      refuseView(row, 'swap')
      refuseFixed(row, 'swap')
      const axis = editAxis(row, tokens)
      const { base, noun, next } = axis
      const i = axis.place(tokens[next])
      const j = axis.place(tokens[next + 1])
      if (i === undefined || j === undefined) throw new Error(`"swap" expects ${edits(row).swaps(row, base)}`)
      const props = parseProps(tokens, next + 2, 'swap', shapes)
      for (const k of [i, j]) if (k < 0 || k >= axis.units.length) throw new Error(axis.missing(k + base))
      if (i === j) return warn(`a ${noun} swapped with itself stays where it is`)

      // Each bows out to the left of the way it goes (a row's: over going right, under coming back),
      // and the one going over passes in front, so units of several cells (a grid's columns) pass
      // whole rather than through each other. Neighbours just pass each other; further apart, they
      // clear the ones in between.
      const [a, b] = [axis.units[i], axis.units[j]]
      const way = { x: b[0].attach.dx - a[0].attach.dx, y: b[0].attach.dy - a[0].attach.dy }
      const length = Math.hypot(way.x, way.y)
      const most = C.swapLift[axis.steps(i, j) > 1 ? 'far' : 'near'] * Math.max(...[...a, ...b].map((cell) => bowOf(row, cell, way)))
      const lift = Math.min(length / 2, most) // round: a semicircle, flatter for long swaps
      const moves = [[a, b, 1], [b, a, -1]].flatMap(([unit, other, sign]) => unit.map((cell, k) => {
        const moved = structuredClone(cell)
        moved.id = other[k].id
        moved.attach = offsetFrom(id, other[k].attach.dx, other[k].attach.dy)
        const record = tween(meta, moved.uid)
        record.arc = { side: { x: (sign * lift * way.y) / length, y: (-sign * lift * way.x) / length }, along: { x: sign * way.x, y: sign * way.y } }
        if (sign > 0) record.raise = true
        return moved
      }))
      for (const moved of moves) {
        shapes.set(moved.id, moved)
        schedule(meta, moved.uid, props)
      }
    }

    // How far a swapped cell bows out from its row or column, before the lift (LAYOUTS: bow): its
    // size across the way it goes, or a grid cell (a code line, whose box is as wide as the block)
    const BOWS = {
      own: (cell, way) => (Math.abs(way.x) >= Math.abs(way.y) ? cell.h : cell.w),
      cell: () => CELL,
    }
    const bowOf = (row, cell, way) => BOWS[LAYOUTS[row.layout].bow](cell, way)

    // "arr: remove 2" / "arr: remove end" / "arr: insert 7 at 3" / "arr: insert 8 at end": a cell
    // leaves or arrives, sliding out below a row (left of a column) as it fades, and the cells
    // after it close up or open a space. Ids go with the places, as in a swap: after "remove 2",
    // arr.2 is the cell that was arr.3, and what's attached to the last place (now gone) is left
    // where it was. "insert v1 at …" copies a var's or cell's value in; "remove … into v1" moves
    // the cell's value out into one. A grid's rows and columns (editAxis) come and go the same way:
    // "g: insert [1 2 3] at 1", "g: remove col end" (a table's new column: its heading first).
    function editCells(id, row, tokens, meta, warn, word) {
      if (!row) throw noShape(id)
      if (scriptOf(row)) return editScript(id, row, tokens, meta, warn, word)
      const removing = Boolean(LINES[word].takesOut)
      if (!row.layout) throw new Error(`"${word}" ${removing ? 'takes a cell out of' : 'puts a cell into'} ${EDITABLE_NOUNS}, and "${id}" isn't one${removing ? ` (to delete it: "${id}: delete")` : ''}`)
      refuseView(row, word)
      refuseFixed(row, word)
      const axis = editAxis(row, tokens)
      const edit = readEdit(row, axis, tokens, removing, word, warn)
      const slotUnit = moveUnits(row, axis, edit, removing, meta, warn)
      flyEdited(row, axis, edit, slotUnit[0], meta, warn)
      addSlot(row, axis, slotUnit, removing, edit.props, meta)
    }

    // An insert's or remove's operands and props: where (at, a place from 0), and what goes in
    // (values, or a copy of a var's or cell's: source), or the var or cell the removed value goes
    // into (target). A grid's new row or column that's short is filled out with empty cells.
    function readEdit(row, axis, tokens, removing, word, warn) {
      const { id } = row
      const kind = LAYOUTS[row.layout]
      const { units, noun, base } = axis
      const { into, keepOne, insert, inserts } = edits(row)
      const example = edits(row).edits(row, removing)
      if (axis.single) throw new Error(`"${word}" takes a whole row or column of a ${kind.noun}, e.g. ${example}`)
      const n = units.length
      // a number, or end: the last (remove), or after it (insert)
      const place = (token) => axis.place(token, !removing)
      const edit = {}
      let next = axis.next
      if (removing) {
        edit.at = place(tokens[next])
        if (edit.at === undefined) throw new Error(`"remove" expects a ${noun} number or end, e.g. ${example}`)
        next++
        if (tokens[next]?.kind === 'word' && tokens[next].lower === EDIT_WORDS.into) {
          if (!into) throw new Error(`"into" takes one cell's value, so it doesn't go with a ${kind.noun}'s ${noun}`)
          if (!holderRef(tokens[next + 1])) throw new Error(`"into" expects a var or cell, e.g. ${example}`)
          edit.target = holderRef(tokens[next + 1], 'remove into')
          next += 2
        }
      } else {
        const put = insert(row, axis, tokens, next, example)
        Object.assign(edit, { values: put.values, source: put.source })
        next = put.next
        if (tokens[next]?.lower !== 'at' || place(tokens[next + 1]) === undefined) throw new Error(`"insert" expects ${inserts} and where it goes (a ${noun} number or end), e.g. ${example}`)
        edit.at = place(tokens[next + 1])
        next += 2
      }
      edit.props = parseProps(tokens, next, word, shapes)
      const { at, values, source, target, props } = edit
      // keep-style needs a var's or cell's value coming in or going out
      if (props.keepStyle && !source && !target) throw new Error(`"keep-style" goes with a var's or cell's value, e.g. "${id}: ${removing ? 'remove end into v1' : 'insert v1 at 0'} keep-style"`)

      const { range } = axis
      if (removing && !n) throw new Error(`"${id}" has no ${noun}s left to remove`)
      if (removing && (at < 0 || at >= n)) throw new Error(`"${id}" has no ${noun} ${at + base} (its ${noun}s are ${range})`)
      // a grid keeps at least one cell (a table's heading stays, so its rows can all go)
      if (removing && keepOne && n === 1 && !axis.fixed) throw new Error(`"${id}" has only one ${noun}, and a ${kind.noun} needs at least one: to delete it, "${id}: delete"`)
      if (!removing && (at < 0 || at > n)) throw new Error(`"insert … at" goes from ${base} to ${n + base} (or end), and "${id}" has ${n} ${noun}${n === 1 ? '' : 's'}`)
      if (target && target.uid === units[at][0].uid) throw new Error(`"${target.id}" is the cell being removed, so it can't be removed into`)
      if (!removing && values.length < axis.size) {
        warn(`a ${noun} of "${id}" has ${axis.size} cells, so this one is filled out with empty cells`)
        while (values.length < axis.size) values.push({ label: '' })
      }
      return edit
    }

    // An edit's two moves in turn (insert / remove): the second (closing up, or sliding in) starts
    // `then` ms in, when the leaving cell is mostly gone or the arriving one's slot has mostly opened
    const thenOf = (props) => C.then * speedOf(props)

    // Where a cell comes from or goes to: beside the row (LAYOUTS: slide), or its own place
    const asideOf = (row, axis) => (cell) => (!LAYOUTS[row.layout].slide ? { x: 0, y: 0 }
      : axis.across ? { x: 0, y: C.aside * cell.h } : { x: -C.aside * cell.w, y: 0 })

    // The units move: the leaving one goes and the rest close up, or the rest open up and the new
    // one comes in; then the layout is laid out again (ids go with the places), with its views and
    // indices. Returns the unit that left or arrived, which its slot marks.
    function moveUnits(row, axis, { at, values, source, target, props }, removing, meta, warn) {
      const kind = LAYOUTS[row.layout]
      const { units } = axis
      const then = thenOf(props)
      const timing = (uid, after) => schedule(meta, uid, props, { after })
      const aside = asideOf(row, axis)
      const list = units.map((unit) => unit.map((cell) => structuredClone(cell)))
      let slotUnit
      if (removing) {
        units[units.length - 1].forEach((cell) => freezeEndsAttachedTo(cell.id)) // the last place goes
        const [gone] = list.splice(at, 1)
        for (const cell of gone) {
          if (target) tween(meta, cell.uid).exit = 'vanish' // it flies to the target instead (flyEdited)
          else Object.assign(tween(meta, cell.uid), { exit: 'fade', offset: aside(cell) })
          timing(cell.uid, 0)
        }
        list.slice(at).flat().forEach((cell) => timing(cell.uid, then))
        slotUnit = gone
      } else {
        const blank = row.cell || { ...baseShape('rect') }
        const fresh = values.map((value, k) => {
          const cell = { ...structuredClone(blank), ...(source ? keptStyle(props, source) : {}), uid: newUid(), holds: true, hl: null, callout: null }
          if (axis.headed(k)) applyProps(cell, kind.head.look, false, warn, meta) // a table's new heading
          setValue(cell, value)
          return cell
        })
        list.splice(at, 0, fresh)
        list.slice(at + 1).flat().forEach((other) => timing(other.uid, 0))
        for (const cell of fresh) {
          Object.assign(tween(meta, cell.uid), { enter: 'fade', offset: aside(cell) })
          timing(cell.uid, then) // when a flyer brings a var's value (flyEdited), as it arrives
        }
        slotUnit = fresh
      }
      for (const cell of units.flat()) shapes.delete(cell.id)
      if (kind.fit && list.length) {
        // the block widens for a longer line as the others move aside, or narrows once the
        // longest has gone
        const cells = list.flat()
        const widths = new Map(cells.map((cell) => [cell.uid, cell.w]))
        fitLines(cells)
        cells.filter((cell) => widths.get(cell.uid) !== cell.w && !slotUnit.includes(cell)).forEach((cell) => timing(cell.uid, removing ? then : 0))
      }
      axis.relay(list)
      for (const cell of list.flat()) {
        Object.assign(cell, { x: row.x + cell.attach.dx, y: row.y + cell.attach.dy })
        shapes.set(cell.id, cell)
      }
      arranged(row).sync(row, props, meta, warn)
      // the last index comes with the slot, or goes as it closes
      if (numbered(row)) syncIndices(row, props, meta, { add: 0, remove: then })
      return slotUnit
    }

    // A value moved by an insert or remove. remove into: the removed cell itself drops out and
    // glides onto the target, which takes its value as it lands (the target may be another of this
    // row's cells, which may have moved up a place, so it's found by its uid after the layout).
    // insert v1: a copy of the var or cell glides to just outside the opening slot (its look
    // turning into the row's on the way), then the new cell, solid from the start, slides in.
    function flyEdited(row, axis, { source, target, props }, cell, meta, warn) {
      const out = asideOf(row, axis)(cell)
      if (target) {
        const to = [...shapes.values()].find((s) => s.uid === target.uid)
        const hops = [{ x: cell.x, y: cell.y }, { x: cell.x + out.x, y: cell.y + out.y }, pointOf(to)]
        flyValue(meta, cell, to, hops, props, C.arriveOut * speedOf(props), warn)
      }
      if (source) {
        tween(meta, cell.uid).enter = 'appear' // there from the start: the flyer is on it
        const place = { x: row.x + cell.attach.dx, y: row.y + cell.attach.dy }
        fly(meta, source, cell, [pointOf(source), { x: place.x + out.x, y: place.y + out.y }], props, { arrive: thenOf(props), linger: false })
      }
    }

    // A script's edits (SHAPES: script), made on its lines (from 1, as written in its [ ], counting
    // end, else, blank lines and comments): "s: line 3 "…"" replaces line 3, "s: insert "…" at 3"
    // puts lines in before it (or at end), "s: remove 3" takes out the block it starts and
    // "s: swap 2 4" swaps two (a C block goes with the blocks inside it, to its end). Lines go in
    // with the indent of where they go. A lit line (highlight line) keeps its light wherever it
    // goes. Its beat's tween gets the edit's map (script: for each block after it, the block it was
    // before, or null for a new one; edits in one beat compose), so its blocks are seen to move.
    const SCRIPT_NOUNS = nounList(Object.keys(SHAPES).filter((type) => SHAPES[type].script).map((type) => nounOf({ type })))
    const SCRIPT_EDITS = {
      line: { example: (id) => `"${id}: line 2 "move (10) steps""`, edit: replaceLine },
      insert: { example: (id) => `"${id}: insert "say [Hi!]" at 2" (or at end)`, edit: insertLines },
      remove: { example: (id) => `"${id}: remove 2"`, edit: removeBlock },
      swap: { example: (id) => `"${id}: swap 2 3"`, edit: swapBlocks },
    }
    function editScript(id, shape, tokens, meta, warn, word) {
      if (!shape) throw noShape(id)
      if (!scriptOf(shape)) throw new Error(`"${word}" changes the lines of ${SCRIPT_NOUNS}, and "${id}" isn't one`)
      const script = scriptOf(shape)
      const lines = shape.label.split('\n').map((text) => ({ text })) // objects, so a lit one can be followed
      const lit = typeof shape.hl?.line === 'number' ? lines[shape.hl.line - 1] : null
      const before = [...lines]
      const { example, edit } = SCRIPT_EDITS[word]
      const next = edit({ id, script, tokens, lines, warn, example: example(id) })
      const props = parseProps(tokens, next, word, shapes)
      const changed = structuredClone(shape)
      const record = tween(meta, changed.uid)
      const earlier = record.script // undefined: no change to it yet this beat; null: a new script
      applyProps(changed, { label: lines.map((line) => line.text).join('\n') }, false, warn, meta)
      if (lit) changed.hl = { ...changed.hl, line: lines.includes(lit) ? lines.indexOf(lit) + 1 : false }
      const map = blockMap(script, before, lines)
      record.script = earlier === undefined ? map : earlier && map.map((k) => (k === null ? null : earlier[k]))
      shapes.set(id, changed)
      schedule(meta, changed.uid, props)
    }

    // For each block in a script's lines after an edit, the block it was before (null: a new one),
    // known by its first line (the same object, though its text may have changed)
    function blockMap(script, before, after) {
      const blocksIn = (lines) => scriptBlocksIn(script, lines.map((line) => line.text))
      const firstLines = blocksIn(before).map((block) => before[block.at])
      return blocksIn(after).map((block) => {
        const k = firstLines.indexOf(after[block.at])
        return k < 0 ? null : k
      })
    }

    // A line's number as written (from 1, or end; after: the place after the last, for an insert),
    // checked: its place in lines from 0
    function lineAt({ id, lines, example }, token, what, after = false) {
      const k = numberOf(token, lines.length, 1, after)
      if (k === undefined) throw new Error(`${what} expects a line number${after ? ' or end' : ''}, e.g. ${example}`)
      if (k < 1 || k > lines.length + (after ? 1 : 0)) throw new Error(`"${id}" has ${lines.length} line${lines.length === 1 ? '' : 's'}, so there's no line ${k}`)
      return k - 1
    }
    // The block a line starts, as written (removed, swapped: done)
    function blockAt(ask, token, what, done) {
      const { block, problem } = blockOnLine(ask.script, ask.lines.map((line) => line.text), lineAt(ask, token, what) + 1, ask.id, done)
      if (problem) throw new Error(problem)
      return block
    }
    // New lines: one "quoted" line, or several in [ ], each with the indent given; and the token after
    function newLines({ tokens, example }, j, what, indent) {
      if (tokens[j]?.kind === 'str') return { added: [{ text: indent + tokens[j].value }], next: j + 1 }
      if (tokens[j]?.kind !== 'bracket' || tokens[j].value !== '[') throw new Error(`${what} expects a "quoted" line, or lines in [ ], e.g. ${example}`)
      const { values, next } = readLines(tokens, j, { noun: 'script', item: 'line', example })
      return { added: values.map((text) => ({ text: indent + text })), next }
    }
    const indentOf = (line) => line.text.match(/^\s*/)[0]

    // "s: line 3 "…"": keeping its indent (its first new line stays the same line, so a light on it
    // stays)
    function replaceLine(ask) {
      const { lines, tokens } = ask
      const at = lineAt(ask, tokens[1], '"line"')
      const line = lines[at]
      const { added, next } = newLines(ask, 2, '"line"', indentOf(line))
      line.text = added[0].text
      lines.splice(at + 1, 0, ...added.slice(1))
      return next
    }
    // "s: insert "…" at 3": before line 3 (at end: after the last), at the indent of the line before
    // it, one deeper after a line that opens or divides a C block (SCRIPTS: syntax)
    function insertLines(ask) {
      const { lines, tokens, example, script } = ask
      const { opens, middle, indent } = script.syntax
      const end = tokens.findIndex((token, k) => k > 0 && token.kind === 'word' && token.lower === 'at')
      if (end < 0) throw new Error(`"insert" expects where the lines go, e.g. ${example}`)
      const at = lineAt(ask, tokens[end + 1], '"insert … at"', true)
      const before = lines[at - 1]
      const deeper = before && (opens.test(before.text) || middle.test(before.text))
      const { added, next } = newLines(ask, 1, '"insert"', before ? indentOf(before) + (deeper ? indent : '') : '')
      if (next !== end) throw new Error(`"insert" expects its lines, then where they go, e.g. ${example}`)
      lines.splice(at, 0, ...added)
      return end + 2
    }
    // "s: remove 3": the block line 3 starts (a C block's lines, to its end)
    function removeBlock(ask) {
      const { id, lines, tokens } = ask
      const block = blockAt(ask, tokens[1], '"remove"', 'removed')
      if (block.at === 0 && block.to === lines.length - 1) throw new Error(`that would leave "${id}" with no blocks: to delete it, "${id}: delete"`)
      lines.splice(block.at, block.to - block.at + 1)
      return 2
    }
    // "s: swap 2 4": the blocks two lines start change places, each taking the other's indent
    function swapBlocks(ask) {
      const { id, lines, tokens } = ask
      const [a, b] = [blockAt(ask, tokens[1], '"swap"', 'swapped'), blockAt(ask, tokens[2], '"swap"', 'swapped')].sort((x, y) => x.at - y.at)
      if (a.at === b.at) { ask.warn('a block swapped with itself stays where it is'); return 3 }
      if (b.at <= a.to) throw new Error(`line ${b.at + 1} is inside the block on line ${a.at + 1} of "${id}", so they can't swap`)
      const shift = (from, to) => (line) => { if (line.text.startsWith(from)) line.text = to + line.text.slice(from.length) }
      const [first, second] = [lines.slice(a.at, a.to + 1), lines.slice(b.at, b.to + 1)]
      const [ia, ib] = [indentOf(first[0]), indentOf(second[0])]
      first.forEach(shift(ia, ib))
      second.forEach(shift(ib, ia))
      lines.splice(b.at, second.length, ...first)
      lines.splice(a.at, first.length, ...second)
      return 3
    }

    // A slot (a muted outline) marks the space while it opens or closes (drawn only during the
    // beat): left where a unit goes out, closing as the ones after it close up; or opening as they
    // move aside, for the new one to land in. Round the unit's cells' places (a removed unit's from
    // before, a new one's from after the layout), for both moves, start to end (LAYOUTS: slot; none
    // for bars, BARS: slot).
    function addSlot(row, axis, unit, closing, props, meta) {
      const [cell] = unit
      if (!LAYOUTS[row.layout].slot || BARS[cell.bar]?.slot === false) return
      const xs = unit.map((c) => c.attach.dx)
      const ys = unit.map((c) => c.attach.dy)
      const slot = {
        uid: newUid(), ref: row.id, across: axis.across, closing, then: C.then / (1 + C.then),
        dx: (Math.min(...xs) + Math.max(...xs)) / 2, dy: (Math.min(...ys) + Math.max(...ys)) / 2,
        w: Math.max(...xs) - Math.min(...xs) + Math.max(...unit.map((c) => c.w)),
        h: Math.max(...ys) - Math.min(...ys) + Math.max(...unit.map((c) => c.h)),
        corner: cell.corner || 0,
      }
      schedule(meta, slot.uid, props, { dur: speedOf(props) + thenOf(props) })
      meta.slots = [...(meta.slots || []), slot]
    }

    return {
      functions: { },
      verbs: { swap: swapCells, insert: editCells, remove: editCells, line: editScript },
      link: () => {
        ({ applyProps, arranged, chunk, fitLines, fly, flyValue, freezeEndsAttachedTo, gridLines,
          gridPlaceOf, holderRef, keptStyle, layoutCells, layoutGrid, noShape, numbered, numberOf, pointOf, readLines,
          readList, refuseView, schedule, setValue, speedOf, syncIndices, transpose, valueIn, valueOf } = cx)
      },
    }
  })
})()
