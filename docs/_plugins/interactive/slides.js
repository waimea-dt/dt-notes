/**
 * docsify-slides.js - Renders <slides>...</slides> blocks as embedded reveal.js presentations.
 * Requires reveal.js (no markdown plugin): slide markdown is compiled by Docsify in
 * afterEach, so all plugin tags inside slides are processed by their normal doneEach hooks.
 *
 * Usage in markdown:
 *   <slides>
 *   # Slide One
 *   ---
 *   # Slide Two
 *   </slides>
 */

;(function () {
  const { dispatchSlidesRendered } = window.DocsifyUtils
  const stash = {}
  const deckCleanup = new WeakMap()

  function registerDeckCleanup(deck, cleanupFn) {
    if (typeof cleanupFn !== 'function') return
    const list = deckCleanup.get(deck) || []
    list.push(cleanupFn)
    deckCleanup.set(deck, list)
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  // `+++ [effect]` starts a reveal step; `+++ list` reveals each top-level list item separately.
  function applyFragmentMarkers(markdown) {
    const parts = markdown.split(/^\+\+\+[ \t]*(.*?)[ \t]*$/m)
    if (parts.length === 1) return markdown

    // split() with a capture group yields [intro, arg1, body1, arg2, body2, ...]
    let out = parts[0]
    for (let i = 1; i < parts.length; i += 2) {
      const arg = parts[i]
      const classes = arg === 'list' ? 'slides-incremental' : `fragment ${arg}`.trim()
      out += `\n<div class="${classes}">\n\n${parts[i + 1].trim()}\n\n</div>\n`
    }
    return out
  }

  function applyIncrementalLists(deck) {
    deck.querySelectorAll('.slides-incremental > :is(ul, ol) > li').forEach((li) => li.classList.add('fragment'))
  }

  // `|||` lines split the slide into pre-content, equal-width columns and post-content;
  // the first marker may carry widths, e.g. `||| 1fr 2fr`.
  function applyLayoutMarkers(markdown) {
    const parts = markdown.split(/^\|\|\|[ \t]*(.*?)[ \t]*$/m)
    const markerCount = (parts.length - 1) / 2
    if (markerCount < 3) return applyFragmentMarkers(markdown)

    // parts = [pre, arg1, body1, arg2, body2, ...]; the last body is the post-content
    const bodies = parts.filter((_part, i) => i % 2 === 0)
    const [pre, post] = [bodies[0], bodies[bodies.length - 1]]
    const columns = bodies.slice(1, -1)
    const widths = /^[\w.%\s()-]+$/.test(parts[1]) ? parts[1] : ''
    const style = widths ? ` style="--cols: ${widths}"` : ''

    const cells = columns.map((col) => `<div>\n\n${applyFragmentMarkers(col.trim())}\n\n</div>`).join('\n')
    return [
      applyFragmentMarkers(pre.trim()),
      `<div class="slides-columns"${style}>\n${cells}\n</div>`,
      applyFragmentMarkers(post.trim()),
    ].join('\n\n')
  }

  function normaliseSlideMarkdown(slideMarkdown) {
    slideMarkdown = applyLayoutMarkers(slideMarkdown)
    // Keep Mermaid out of Reveal's code-highlighter path.
    return slideMarkdown.replace(/```mermaid\s*\n([\s\S]*?)```/g, function (_match, mermaidCode) {
      const code = (mermaidCode || '').trim()
      const hasInitDirective = /^%%\{\s*init\s*:/m.test(code)
      const slideInitDirective = '%%{init: {"flowchart": {"htmlLabels": false}, "themeVariables": {"fontFamily": "system-ui, sans-serif", "fontSize": "16px"}}}%%\n'
      const preparedCode = hasInitDirective ? code : `${slideInitDirective}${code}`
      return `<div data-slides-mermaid="true">\n${escapeHtml(preparedCode)}\n</div>`
    })
  }

  // Slide headings are not page anchors: drop the ids/anchor links Docsify adds, otherwise
  // they collide with page headings of the same text and the sidebar filter hides those.
  function stripHeadingAnchors(html) {
    const template = document.createElement('template')
    template.innerHTML = html
    template.content.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      heading.removeAttribute('id')
      heading.querySelectorAll(':scope > a.anchor').forEach((anchor) => anchor.replaceWith(...anchor.childNodes))
    })
    return template.innerHTML
  }

  // Slides are compiled by Docsify itself (not Reveal's markdown plugin) so the
  // output is final HTML before any plugin's doneEach hook runs.
  function buildRevealHTML(index, compiler) {
    const slides = stash[index]
      .split(/\n---\n/)
      .map((slide) => `<section>${stripHeadingAnchors(compiler.compile(normaliseSlideMarkdown(slide.trim())))}</section>`)
      .join('\n')

    return `
      <div class="reveal docsify-slide-deck" id="slide-deck-${index}">
        <div class="slides">
          ${slides}
        </div>
      </div>
    `
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

  function setupMermaidForDeck(deck, reveal) {
    const mermaidApi = window.mermaid
    if (!mermaidApi || typeof mermaidApi.run !== 'function') return

    let renderQueue = Promise.resolve()

    const renderSlideMermaid = function (slide) {
      if (!slide) return Promise.resolve()

      const nodes = Array.from(slide.querySelectorAll('[data-slides-mermaid="true"]:not([data-slides-mermaid-rendered="true"])'))
      if (!nodes.length) return Promise.resolve()

      nodes.forEach((node) => {
        node.classList.add('mermaid')
      })

      return mermaidApi.run({ nodes }).then(function () {
        nodes.forEach((node) => {
          node.setAttribute('data-slides-mermaid-rendered', 'true')
        })
      }).catch(function (error) {
        console.error('Failed to render Mermaid in slides.', error)
      }).finally(function () {
        if (typeof reveal.layout === 'function') {
          reveal.layout()
        }
      })
    }

    const renderCurrentSlide = function () {
      renderQueue = renderQueue.then(function () {
        return renderSlideMermaid(reveal.getCurrentSlide())
      })
      return renderQueue
    }

    const onSlideChanged = function () {
      renderCurrentSlide()
    }

    if (typeof reveal.on === 'function') {
      reveal.on('slidechanged', onSlideChanged)
      registerDeckCleanup(deck, function () {
        if (typeof reveal.off === 'function') {
          reveal.off('slidechanged', onSlideChanged)
        }
      })
    }

    renderCurrentSlide()
  }

  function cleanupDeckWatchers() {
    document.querySelectorAll('.reveal.docsify-slide-deck[data-initialized]').forEach((deck) => {
      const cleanups = deckCleanup.get(deck)
      if (!cleanups || !cleanups.length) return
      cleanups.forEach((cleanup) => cleanup())
      deckCleanup.delete(deck)
    })
  }

  function initDecks() {
    document.querySelectorAll('.reveal.docsify-slide-deck:not([data-initialized])').forEach((deck) => {
      deck.setAttribute('data-initialized', 'true')

      const reveal = new Reveal(deck, {
        embedded: true,
        plugins: [],
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
        setupMermaidForDeck(deck, reveal)
        dispatchSlidesRendered(deck)
      })
    })
  }

  var docsifySlides = function (hook, vm) {
    hook.beforeEach(function (content) {
      cleanupDeckWatchers()
      Object.keys(stash).forEach((k) => delete stash[k])

      let index = 0
      return content.replace(
        /<slides>([\s\S]*?)<\/slides>/g,
        function (_match, markdown) {
          stash[index] = markdown
          const placeholder = `<div class="slides-placeholder" data-index="${index}"></div>`
          index++
          return placeholder
        }
      )
    })

    hook.afterEach(function (html) {
      // Compiling headings registers them in the page TOC, so restore it afterwards.
      const toc = [...(vm.compiler.toc || [])]
      const out = html.replace(
        /<div class="slides-placeholder" data-index="(\d+)"><\/div>/g,
        (_match, index) => buildRevealHTML(index, vm.compiler)
      )
      vm.compiler.toc = toc
      return out
    })

    hook.doneEach(initDecks)
  }

  window.DocsifyUtils.registerPlugin(docsifySlides)
})()

