/**
 * Matrix effect on selected routes
 */
;(function () {
    'use strict'

    const { randInt } = window.DocsifyUtils

    // const MATRIX_ROUTES = ['/mac']
    const MATRIX_ROUTES = []
    const MATRIX_EFFECT = 'matrix'

    const MATRIX_CLASS = 'matrix-item'
    const HEAD_CLASS = 'matrix-head'
    const ROOT_CLASS = 'matrix-root'

    const GLYPHS = Array.from(
        'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:.=*+-<>¦|'
    )

    const CELL_SIZE = 20 // px: column width, row height and font size
    const TICK_INTERVAL = 50 // ms: how often every stream may move down a row
    const NEW_STREAM_CHANCE = 0.6 // chance per tick of starting a new stream
    const MAX_STREAMS_PER_COLUMN = 1 // average, not a hard limit per column
    const MIN_STREAM_LENGTH = 12 // rows
    const MIN_SLOWDOWN = 2 // fastest streams move once every 2 ticks
    const MAX_SLOWDOWN = 5 // slowest streams move once every 5 ticks

    let matrixRoot = null
    let tickTimer = null
    let isListening = false
    let matrixCells = new Map() // "column,row" -> the glyph currently in that cell
    let matrixStreams = []
    let activationToken = 0
    let currentRoutePath = '/'

    function isMatrixRoute(path) {
        const cleanedPath = String(path || '/').replace(/\/+$/, '')
        return MATRIX_ROUTES.includes(cleanedPath || '/')
    }

    function isMatrixEnabled(path) {
        if (isMatrixRoute(path)) return true
        return Boolean(window.DocsifyEasterEggs?.hasEffect(MATRIX_EFFECT))
    }

    function onEffectChange(event) {
        if (event.detail?.effect !== MATRIX_EFFECT) return
        if (isMatrixEnabled(currentRoutePath)) {
            void activate()
        }
        else {
            deactivate()
        }
    }

    function createMatrixRoot() {
        if (matrixRoot && document.body.contains(matrixRoot)) return matrixRoot

        const root = document.createElement('div')
        root.className = ROOT_CLASS
        document.body.appendChild(root)

        matrixRoot = root
        return root
    }

    function getColumnCount() {
        return Math.max(1, Math.floor(window.innerWidth / CELL_SIZE))
    }

    function getRowCount() {
        return Math.max(1, Math.ceil(window.innerHeight / CELL_SIZE))
    }

    function pickGlyph() {
        return GLYPHS[randInt(0, GLYPHS.length - 1)]
    }

    function getCellKey(column, row) {
        return `${column},${row}`
    }

    function removeGlyph(glyph) {
        glyph.remove()

        // A newer glyph may have taken over this cell, so only clear it if it's still ours
        const cellKey = glyph.dataset.cell
        if (matrixCells.get(cellKey) === glyph) {
            matrixCells.delete(cellKey)
        }
    }

    function spawnGlyph(column, row) {
        if (!matrixRoot) return null

        // Replace any fading glyph in this cell so two never overlap
        const cellKey = getCellKey(column, row)
        const existingGlyph = matrixCells.get(cellKey)
        if (existingGlyph) removeGlyph(existingGlyph)

        const glyph = document.createElement('span')
        glyph.className = MATRIX_CLASS
        glyph.dataset.cell = cellKey
        glyph.textContent = pickGlyph()
        glyph.style.setProperty('--x', `${column * CELL_SIZE}px`)
        glyph.style.setProperty('--y', `${row * CELL_SIZE}px`)
        glyph.style.setProperty('--size', `${CELL_SIZE}px`)

        // CSS fades the glyph out; we only tidy up once it has finished
        glyph.addEventListener('animationend', () => removeGlyph(glyph), { once: true })

        matrixRoot.appendChild(glyph)
        matrixCells.set(cellKey, glyph)
        return glyph
    }

    function maybeStartStream() {
        const columnCount = getColumnCount()

        if (matrixStreams.length >= columnCount * MAX_STREAMS_PER_COLUMN) return
        if (Math.random() > NEW_STREAM_CHANCE) return

        matrixStreams.push({
            column: randInt(0, columnCount - 1),
            row: 0,
            stepsLeft: randInt(MIN_STREAM_LENGTH, getRowCount()),
            slowdown: randInt(MIN_SLOWDOWN, MAX_SLOWDOWN),
            ticksUntilStep: 0,
            head: null, // the newest glyph, which gets the glow
        })
    }

    function advanceStream(stream) {
        stream.ticksUntilStep -= 1
        if (stream.ticksUntilStep > 0) return

        stream.ticksUntilStep = stream.slowdown

        // The old head becomes an ordinary trail glyph
        stream.head?.classList.remove(HEAD_CLASS)

        stream.head = spawnGlyph(stream.column, stream.row)
        stream.head?.classList.add(HEAD_CLASS)

        stream.row += 1
        stream.stepsLeft -= 1
    }

    function endStream(stream) {
        // Otherwise the last glyph would stay white while it fades out
        stream.head?.classList.remove(HEAD_CLASS)
    }

    function isStreamFinished(stream) {
        return stream.stepsLeft <= 0 || stream.row >= getRowCount()
    }

    function tick() {
        // Browsers pause animations in background tabs, so don't queue up glyphs
        if (document.hidden) return

        maybeStartStream()
        matrixStreams.forEach(advanceStream)

        matrixStreams.filter(isStreamFinished).forEach(endStream)
        matrixStreams = matrixStreams.filter((stream) => !isStreamFinished(stream))
    }

    function startTicking() {
        if (tickTimer !== null) return
        tickTimer = setInterval(tick, TICK_INTERVAL)
    }

    function stopTicking() {
        clearInterval(tickTimer)
        tickTimer = null
    }

    async function activate() {
        if (isListening) return

        const token = ++activationToken
        if (token !== activationToken || isListening) return

        isListening = true
        createMatrixRoot()
        startTicking()
    }

    function deactivate() {
        activationToken += 1

        if (!isListening && !matrixRoot) return
        isListening = false

        stopTicking()
        matrixCells.clear()
        matrixStreams = []

        if (matrixRoot) {
            matrixRoot.remove()
            matrixRoot = null
        }
    }

    function docsifyMatrix(hook, vm) {
        hook.doneEach(function () {
            currentRoutePath = vm?.route?.path

            if (isMatrixEnabled(currentRoutePath)) {
                void activate()
                return
            }

            deactivate()
        })

        hook.init(function () {
            window.addEventListener('docsify-effect-change', onEffectChange)
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyMatrix)
})()