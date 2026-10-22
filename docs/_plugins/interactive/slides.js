/**
 * docsify-slides.js - Renders <slides>...</slides> blocks as embedded reveal.js presentations.
 * Requires reveal.js (no markdown plugin).
 *
 * How it works: slides are a layout over the page, not a separate document. In beforeEach the
 * slide markers are rewritten into plain HTML wrappers (<section>, <aside>, fragment divs) with
 * the slide markdown left in place, so Docsify compiles the whole page in ONE pass. Every other
 * plugin's beforeEach / afterEach / doneEach therefore treats slide content like page content.
 * This plugin is registered last so those hooks have already run when it finishes the markup
 * (afterEach) and starts reveal.js (doneEach).
 *
 * Usage in markdown (markers must be alone on their line; ignored inside code fences):
 *   <slides>
 *   # Slide One
 *   ---                 start a new slide
 *   # Slide Two
 *   +++ [effect]        start a reveal step, e.g. `+++ fade-up` (`+++ list` steps through list items)
 *   ||| [widths]        three or more lines make columns, e.g. `||| 1fr 2fr` (content before the
 *                       first and after the last marker spans the full width)
 *
 *   Note:               speaker notes (markdown) - everything after it to the end of the slide
 *   Click the deck for focus, then press `s` to open the speaker view.
 *   </slides>
 */

;(function () {
  const deckCleanup = new WeakMap()

  function registerDeckCleanup(deck, cleanupFn) {
    if (typeof cleanupFn !== 'function') return
    const list = deckCleanup.get(deck) || []
    list.push(cleanupFn)
    deckCleanup.set(deck, list)
  }

  const FENCE = /^[ \t]*(`{3,}|~{3,})(.*)$/
  const MARKERS = {
    slide: /^---[ \t]*$/,
    note: /^Note:[ \t]*$/,
    step: /^\+\+\+[ \t]*(.*?)[ \t]*$/,
    column: /^\|\|\|[ \t]*(.*?)[ \t]*$/,
  }
  const DECK_END = '<!-- /slides-deck -->'
  const DECK_BLOCK = /<div class="reveal docsify-slide-deck"[\s\S]*?<!-- \/slides-deck -->/g
  const HEADING_ANCHOR = /<(h[1-6]) id="[^"]*" tabindex="-1"><a href="[^"]*" data-id="[^"]*" class="anchor">([\s\S]*?)<\/a><\/\1>/g

  // Calls visit(line, inCode) for each line; fence lines and lines inside a fenced block are code.
  function scanLines(markdown, visit) {
    let fence = null
    markdown.split('\n').forEach((line) => {
      const match = line.match(FENCE)
      const wasInFence = Boolean(fence)
      if (match && !fence) fence = match[1]
      else if (match && match[1][0] === fence[0] && match[1].length >= fence.length && !match[2].trim()) fence = null
      visit(line, wasInFence || Boolean(match))
    })
  }

  // Splits at whole-line markers outside code: n markers give n + 1 trimmed chunks, and `args`
  // holds each marker's argument (capture group 1).
  function splitAtMarkers(markdown, marker) {
    const chunks = [[]]
    const args = []
    scanLines(markdown, (line, inCode) => {
      const match = inCode ? null : line.match(marker)
      if (!match) return chunks[chunks.length - 1].push(line)
      args.push(match[1] || '')
      chunks.push([])
    })
    return { chunks: chunks.map((lines) => lines.join('\n').trim()), args }
  }

  // HTML wrappers need blank lines around the markdown so Docsify still compiles what is inside.
  function wrapBlock(open, body, close) {
    return `${open}\n\n${body}\n\n${close}`
  }

  const joinBlocks = (blocks) => blocks.filter(Boolean).join('\n\n')

  // Slide headings are not page headings: keep them out of the sidebar's sub-menu.
  function excludeHeadingsFromToc(markdown) {
    const lines = []
    scanLines(markdown, (line, inCode) => {
      lines.push(!inCode && /^#{1,6}[ \t]+\S/.test(line) ? `${line.trimEnd()} {docsify-ignore}` : line)
    })
    return lines.join('\n')
  }

  // `+++ [effect]` starts a reveal step; `+++ list` reveals each top-level list item separately.
  function applyStepMarkers(markdown) {
    const { chunks, args } = splitAtMarkers(markdown, MARKERS.step)
    return joinBlocks(
      chunks.map((chunk, i) => {
        if (i === 0) return chunk
        const classes = args[i - 1] === 'list' ? 'slides-incremental' : `fragment ${args[i - 1]}`.trim()
        return wrapBlock(`<div class="${classes}">`, chunk, '</div>')
      })
    )
  }

  function applyIncrementalLists(deck) {
    deck.querySelectorAll('.slides-incremental > :is(ul, ol) > li').forEach((li) => li.classList.add('fragment'))
  }

  // `|||` lines split the slide into pre-content, equal-width columns and post-content;
  // the first marker may carry widths, e.g. `||| 1fr 2fr`.
  function applyColumnMarkers(markdown) {
    const { chunks, args } = splitAtMarkers(markdown, MARKERS.column)
    if (args.length < 3) return applyStepMarkers(markdown)

    const [pre, ...rest] = chunks
    const post = rest.pop()
    const style = /^[\w.%\s()-]+$/.test(args[0]) ? ` style="--cols: ${args[0]}"` : ''
    const cells = rest.map((column) => wrapBlock('<div>', applyStepMarkers(column), '</div>'))

    return joinBlocks([
      applyStepMarkers(pre),
      wrapBlock(`<div class="slides-columns"${style}>`, joinBlocks(cells), '</div>'),
      applyStepMarkers(post),
    ])
  }

  function buildSlide(slideMarkdown) {
    const [content, ...notes] = splitAtMarkers(slideMarkdown, MARKERS.note).chunks
    const notesBlock = joinBlocks(notes)
    return joinBlocks([
      '<section>',
      excludeHeadingsFromToc(applyColumnMarkers(content)),
      notesBlock && wrapBlock('<aside class="notes">', notesBlock, '</aside>'),
      '</section>',
    ])
  }

  function buildDeck(markdown, index) {
    const slides = splitAtMarkers(markdown, MARKERS.slide).chunks.map(buildSlide)
    return `\n\n<div class="reveal docsify-slide-deck" id="slide-deck-${index}">\n<div class="slides">\n\n${joinBlocks(slides)}\n\n</div>\n</div>\n${DECK_END}\n\n`
  }

  // Slide headings are not page anchors: drop the ids/anchor links Docsify adds, otherwise
  // they collide with page headings of the same text.
  function stripDeckHeadingAnchors(html) {
    return html.replace(DECK_BLOCK, (deck) => deck.replace(HEADING_ANCHOR, '<$1>$2</$1>'))
  }

  function watchDeckLayout(deck, reveal) {
    const slidesRoot = deck.querySelector('.slides')
    if (!slidesRoot || typeof reveal?.layout !== 'function') return

    let rafId = 0
    const scheduleLayout = function () {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(function () {
        rafId = 0
        reveal.layout()
      })
    }

    // Catch late content growth (images/async plugin hydration).
    scheduleLayout()
    setTimeout(scheduleLayout, 80)
    setTimeout(scheduleLayout, 220)

    const mutationObserver = new MutationObserver(function () {
      scheduleLayout()
    })
    mutationObserver.observe(slidesRoot, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    })

    const loadHandler = function (event) {
      const target = event.target
      if (!target || !(target instanceof Element)) return
      if (target.matches('img, svg, video, iframe, canvas')) {
        scheduleLayout()
      }
    }
    deck.addEventListener('load', loadHandler, true)

    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(function () {
        scheduleLayout()
      })
      resizeObserver.observe(slidesRoot)
    }

    const cleanup = function () {
      if (rafId) cancelAnimationFrame(rafId)
      mutationObserver.disconnect()
      if (resizeObserver) resizeObserver.disconnect()
      deck.removeEventListener('load', loadHandler, true)
    }

    registerDeckCleanup(deck, cleanup)
  }

  function cleanupDeckWatchers() {
    document.querySelectorAll('.reveal.docsify-slide-deck[data-initialized]').forEach((deck) => {
      const cleanups = deckCleanup.get(deck)
      if (!cleanups || !cleanups.length) return
      cleanups.forEach((cleanup) => cleanup())
      deckCleanup.delete(deck)
    })
  }

  // Reveal's notes plugin keeps one speaker window (and one deck) per plugin instance, and every
  // instance answers the window's remote-control messages. So all decks share a single instance,
  // which is re-pointed at whichever deck asks for the speaker view (`s`).
  const NOTES_WINDOW_NAME = 'reveal.js - Notes'
  const sharedNotes = typeof RevealNotes === 'undefined' ? null : RevealNotes()
  let notesDeck = null

  function openSpeakerView(reveal) {
    if (notesDeck && notesDeck !== reveal) window.open('', NOTES_WINDOW_NAME)?.close()
    notesDeck = reveal
    sharedNotes.init(reveal)
    sharedNotes.open()
  }

  // The speaker window syncs navigation back with bare `{method: 'setState'}` messages, which every
  // deck's own Reveal message listener would act on. Decks disable that listener (`postMessage: false`)
  // and this one forwards the messages to the connected deck only.
  function onSpeakerViewMessage(event) {
    if (!notesDeck || typeof event.data !== 'string' || !event.data.startsWith('{"method":"setState"')) return
    try {
      const { args } = JSON.parse(event.data)
      notesDeck.setState(args[0])
    } catch (_error) {}
  }

  window.addEventListener('message', onSpeakerViewMessage)

  const speakerViewPlugin = {
    id: 'docsify-slides-notes',
    init: (reveal) => reveal.addKeyBinding({ keyCode: 83, key: 'S', description: 'Speaker notes' }, () => openSpeakerView(reveal)),
  }

  // The speaker view loads `config.url` in preview iframes (with `receiver` appended). That URL
  // reopens this page and shows only the one deck, full-window (see slides.css).
  const receiverParams = new URLSearchParams(window.location.search)
  const isReceiver = receiverParams.has('receiver')
  const receiverDeckId = `slide-deck-${receiverParams.get('slides-deck')}`

  function getReceiverUrl(deck) {
    const params = new URLSearchParams({
      'slides-page': window.location.hash,
      'slides-deck': deck.id.replace('slide-deck-', ''),
    })
    return `${window.location.origin}${window.location.pathname}?${params}`
  }

  // CodeMirror editors built while their slide was display:none render blank until refreshed.
  function refreshEditors(slide) {
    slide?.querySelectorAll('.CodeMirror').forEach((el) => el.CodeMirror?.refresh())
  }

  function initDecks() {
    if (isReceiver) document.documentElement.classList.add('slides-receiver')

    document.querySelectorAll('.reveal.docsify-slide-deck:not([data-initialized])').forEach((deck) => {
      if (isReceiver && deck.id !== receiverDeckId) return
      deck.setAttribute('data-initialized', 'true')

      const reveal = new Reveal(deck, {
        embedded: true,
        url: getReceiverUrl(deck),
        postMessage: isReceiver,
        plugins: sharedNotes ? [speakerViewPlugin] : [],
        keyboardCondition: 'focused',
        controls: true,
        progress: true,
        center: true,
        transition: 'slide',
        backgroundTransition: 'fade',
        margin: 0.04,
        width: 1280,
        height: 720,
        mouseWheel: false,
        // view: 'scroll',
      })

      reveal.initialize().then(function () {
        applyIncrementalLists(deck)
        reveal.sync()
        watchDeckLayout(deck, reveal)
        deck.setAttribute('data-slides-ready', 'true')
        refreshEditors(reveal.getCurrentSlide())
        reveal.on('slidechanged', (event) => refreshEditors(event.currentSlide))
      })
    })
  }

  const docsifySlides = function (hook) {
    hook.beforeEach(function (content) {
      cleanupDeckWatchers()

      let index = 0
      return content.replace(/<slides>([\s\S]*?)<\/slides>/g, (_match, markdown) => buildDeck(markdown, index++))
    })

    hook.afterEach(stripDeckHeadingAnchors)

    hook.doneEach(initDecks)
  }

  // Appended (not prepended) so every other plugin's hooks run before this one's: their
  // beforeEach rewrites (e.g. ```js run fences) are in place before the markup is built, and
  // their afterEach transforms have already processed the slide HTML.
  window.DocsifyUtils.registerPlugin(docsifySlides, false)
})()

