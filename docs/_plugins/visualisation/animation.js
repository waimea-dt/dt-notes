/**
 * animation.js - Renders <animation>...</animation> blocks as step-by-step animated SVG
 * explanations: a drawing that changes between steps, with a Markdown caption for each step.
 *
 * Syntax cheat-sheet: docs/_plugins/ANIMATION_LANG.md
 * Engine notes (the tables, the language rules, how to extend it): docs/_plugins/PLUGIN_ANIMATION.md
 *
 * Usage in markdown (markers must be alone on their line; ignored inside code fences):
 *   <animation grid="16x9" debug>
 *   # Title               the first heading of step 1 stays fixed for the whole animation
 *   Caption text.
 *   ```anim
 *   a: rect "A" at 2,3    id: type, label and properties - creates a shape
 *   ```
 *   ---                   start a new step
 *   ## Step heading
 *   ```anim
 *   a: move 5,3 speed slow  id: properties - changes a shape (animated); `delay 1` waits a second first
 *   ```
 *   +++                   start a new beat (caption text and scene play one after another)
 *   Note:                 teacher notes, to the end of the step
 *   </animation>
 *
 * Controls: buttons, keys (? lists them), touch swipes left / right, a double click / tap to play
 * or pause (DocsifyUtils.addSwipeSupport), and scrolling while focused (addWheelStepping).
 *
 * How it works: like slides.js, beforeEach rewrites the block into plain HTML wrappers with the
 * caption markdown left in place, so Docsify compiles it with the rest of the page and every
 * other plugin processes it too. Scene text is carried in data attributes. In doneEach the
 * scenes are compiled into one state per beat, and the widget replaces the source markup.
 * Registered last, so the other plugins' hooks have already run on the caption HTML.
 *
 * The plugin is split into parts, loaded in this order (index.html) and sharing window.Anim:
 *   anim-core.js     constants, the keyword table, small helpers, geometry and bounds
 *   anim-parse.js    Markdown -> source markup, and scene lines -> tokens and props
 *   anim-compile.js  scene lines -> one snapshot of every shape per beat, plus its tweens
 *   anim-render.js   drawing a beat, or a blend between two, into the SVG
 *   animation.js     the widget: controls, captions, playback and the camera (this file)
 * Each part starts by taking what it needs from window.Anim and ends by adding what later parts use.
 *
 * The VS Code extension (vscode/dt-notes-syntax, preview-pane.js) loads these same files into a
 * preview pane, runs this plugin's hooks itself, sends the widget `preview-show` events and listens
 * for its `preview-position` events (positions are beats).
 */

;(function () {
  const { escapeHtml, viewBoxFor, compile, warnOutsideGrid, PLAY_PAUSE, svgEl, createRenderer,
    reducedMotion, CAPTION_MS, ease, easeFn, lerp, pointOnHops, clamp01, rewriteBlocks, stripHeadingAnchors, ENTRANCES } = window.Anim

  // ---------------------------------------------------------------------------
  // Widget
  // ---------------------------------------------------------------------------

  // What changes as it plays is shown with data- and aria- attributes and inline styles, never
  // classes, `hidden` / `disabled` or added and removed nodes: with the site's :has() rules, any of
  // those restyles the whole page, which stalls the frame a step starts or ends on.
  const { addSwipeSupport, addWheelStepping, preventDoubleClickSelect } = window.DocsifyUtils
  // Gestures on these are left alone: the controls have their own clicks, and notes / help hold
  // text to select
  const GESTURE_IGNORE = 'a, button, input, textarea, select, [contenteditable], .CodeMirror, ' +
    '.anim-controls, .anim-progress, .anim-notes, .anim-help'

  const setFlag = (el, name, on) => el.toggleAttribute(`data-${name}`, on)
  const setDisabled = (button, on) => button.setAttribute('aria-disabled', String(on))

  // Transparent icon buttons styled like reveal.js's controls (animation.css): chevrons are drawn in
  // CSS, other icons use the shared --butt-icon-* masks. No type attribute: Docsify's core CSS
  // styles button[type].
  function createButton(className, label, key) {
    const button = document.createElement('button')
    button.className = `anim-ctrl ${className}`
    setButtonLabel(button, label, key)
    return button
  }

  // The tooltip names the button's key, e.g. "Next (Right)"
  function setButtonLabel(button, label, key) {
    button.setAttribute('aria-label', label)
    button.setAttribute('aria-keyshortcuts', key.replace(/^(Left|Right)$/, 'Arrow$1'))
    button.title = `${label} (${key})`
  }

  // The keyboard shortcuts summary (?), styled like reveal.js's help overlay.
  function buildHelp(widget) {
    const rows = [
      ['→ , N , Space', 'Next step'],
      ['← , P , Shift Space', 'Previous step'],
      ['Home', 'Back to the start'],
      ['End', 'Last step'],
      ['A', 'Play / pause'],
      ['F', 'Full screen'],
      ['S', 'Speaker notes'],
      ['?', 'Show or hide these shortcuts'],
      ['Esc', 'Close this / exit full screen'],
      ['Swipe ← / →', 'Next / previous step (touch)'],
      ['Scroll ↓ / ↑', 'Next / previous step (when focused)'],
      ['Double click / tap', 'Play / pause'],
    ]
    const help = widget.appendChild(document.createElement('div'))
    help.className = 'anim-help'
    help.hidden = true
    const close = help.appendChild(document.createElement('button'))
    close.className = 'anim-help-close'
    close.textContent = 'Esc'
    close.setAttribute('aria-label', 'Close keyboard shortcuts')
    close.addEventListener('click', () => { help.hidden = true; widget.focus() })
    const inner = help.appendChild(document.createElement('div'))
    inner.className = 'anim-help-inner'
    const title = inner.appendChild(document.createElement('div'))
    title.className = 'anim-help-title'
    title.textContent = 'Shortcuts'
    const table = inner.appendChild(document.createElement('table'))
    table.innerHTML = `<thead><tr><th>Key</th><th>Action</th></tr></thead><tbody>${rows
      .map(([key, action]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(action)}</td></tr>`).join('')}</tbody>`
    return help
  }

  // Reads the compiled caption markup back out of the source element.
  function readSource(source) {
    const assets = new Map()
    const assetBlock = source.querySelector(':scope > .anim-src-assets')
    if (assetBlock) {
      const paths = JSON.parse(decodeURIComponent(assetBlock.dataset.paths || '%5B%5D'))
      const imgs = [...assetBlock.querySelectorAll('img')]
      paths.forEach((path, i) => imgs[i] && assets.set(path, imgs[i].getAttribute('src')))
    }

    const steps = [...source.querySelectorAll(':scope > .anim-src-step')].map((stepEl) => ({
      beats: [...stepEl.querySelectorAll(':scope > .anim-src-beat')].map((beatEl) => ({
        scene: decodeURIComponent(beatEl.dataset.scene || ''),
        caption: beatEl,
      })),
      notes: stepEl.querySelector(':scope > .anim-src-notes'),
    }))

    // The first heading of step 1 is the fixed title (if it's an h1); each step's leading heading is its heading.
    let title = null
    const firstCaption = steps[0]?.beats[0]?.caption
    if (firstCaption?.firstElementChild?.tagName === 'H1') title = firstCaption.firstElementChild
    title?.remove()
    steps.forEach((step) => {
      const first = step.beats[0]?.caption.firstElementChild
      step.heading = first && /^H[1-6]$/.test(first.tagName) ? first : null
      step.heading?.remove()
    })
    return { steps, title, assets }
  }

  function buildWidget(source) {
    const { steps, title, assets } = readSource(source)
    const debug = source.hasAttribute('data-debug')
    const grid = source.dataset.grid
    const fixedGrid = grid !== 'fit' && viewBoxFor(grid, [], [])
    const centre = fixedGrid && { x: fixedGrid.x + fixedGrid.w / 2, y: fixedGrid.y + fixedGrid.h / 2 }
    const { beats, errors, warnings } = compile(steps, { assets, centre })
    const viewBox = viewBoxFor(source.dataset.grid, beats, warnings)
    if (debug) warnOutsideGrid(beats, viewBox, warnings)

    // Playback options from the tag: autoplay, loop / loop-bounce, hold="s", controls="none"
    const opts = JSON.parse(decodeURIComponent(source.dataset.playback || '%7B%7D'))
    const positive = (value, name, fallback) => {
      if (value == null || value === true) return fallback
      const n = parseFloat(value)
      if (Number.isFinite(n) && n > 0) return n
      warnings.push(`${name}="${value}" isn't a positive number, so ${fallback} is used`)
      return fallback
    }
    const holdMs = (opts.hold === '0' ? 0 : positive(opts.hold, 'hold', PLAY_PAUSE / 1000)) * 1000
    if (opts.controls != null && opts.controls !== 'none') warnings.push(`controls="${opts.controls}" isn't "none", so the controls are shown`)

    const widget = document.createElement('div')
    widget.className = 'animation'
    setFlag(widget, 'untouched', true) // until the first interaction (see CSS)
    widget.tabIndex = 0
    widget.setAttribute('role', 'region')
    widget.setAttribute('aria-label', title ? `Animation: ${title.textContent.trim()}` : 'Animation')

    if (title) {
      const titleBar = widget.appendChild(document.createElement('div'))
      titleBar.className = 'anim-title'
      titleBar.append(...title.childNodes)
    }

    const stage = widget.appendChild(document.createElement('div'))
    stage.className = 'anim-stage'
    const svg = stage.appendChild(svgEl('svg', { class: 'no-zoom', viewBox: `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`, role: 'img' }))
    if (title) svg.setAttribute('aria-label', title.textContent.trim())

    // Captions: one page per step, stacked in one grid cell so the panel keeps the tallest height.
    const caption = widget.appendChild(document.createElement('div'))
    caption.className = 'anim-caption'
    caption.setAttribute('aria-live', 'polite')
    caption.title = 'F, Full screen\nS, Speaker notes\n?, Help' // the keys with no button
    const pages = steps.map((step) => {
      const page = caption.appendChild(document.createElement('div'))
      page.className = 'anim-page'
      const heading = page.appendChild(document.createElement('div'))
      heading.className = 'anim-heading'
      if (step.heading) heading.append(step.heading)
      const body = page.appendChild(document.createElement('div'))
      body.className = 'anim-body'
      const parts = step.beats.map(({ caption: beatEl }) => {
        const part = body.appendChild(document.createElement('div'))
        part.className = 'anim-part'
        part.append(...beatEl.childNodes)
        return part
      })
      return { page, heading, body, parts, headingText: step.heading?.textContent.trim() || '' }
    })
    if (!pages.some((p) => p.headingText || p.parts.some((part) => part.textContent.trim() || part.children.length))) caption.hidden = true

    // Controls, like reveal.js's: rewind, back, play and next floating in the bottom-right corner
    // over the content, and a progress bar (every step and beat) along the bottom edge. Notes (S),
    // full screen (F) and the shortcuts summary (?) are keyboard-only.
    const controls = widget.appendChild(document.createElement('div'))
    controls.className = 'anim-controls'
    const rewind = controls.appendChild(createButton('anim-rewind anim-chevron', 'Restart', 'Home'))
    rewind.appendChild(document.createElement('span')).className = 'anim-chevron-bar'
    const prev = controls.appendChild(createButton('anim-prev anim-chevron', 'Previous', 'Left'))
    const play = controls.appendChild(createButton('anim-play anim-chevron', 'Play', 'A'))
    play.appendChild(document.createElement('span')).className = 'anim-chevron-bar'
    play.appendChild(document.createElement('span')).className = 'anim-chevron-bar anim-pause-bar'
    const next = controls.appendChild(createButton('anim-next anim-chevron', 'Next', 'Right'))
    const hasNotes = steps.some((step) => step.notes)

    const progress = widget.appendChild(document.createElement('div'))
    progress.className = 'anim-progress'
    progress.setAttribute('role', 'progressbar')
    progress.setAttribute('aria-label', 'Progress')
    progress.setAttribute('aria-valuemin', '0')
    progress.setAttribute('aria-valuemax', String(Math.max(0, beats.length - 1)))
    const progressBar = progress.appendChild(document.createElement('span'))

    const notesPanel = widget.appendChild(document.createElement('div'))
    notesPanel.className = 'anim-notes'
    notesPanel.hidden = true
    // One page of notes per step, the current one shown. A step's note nodes go straight into its
    // page (no whitespace-only text), so a step without notes leaves its page :empty.
    const notes = hasNotes ? steps.map((step) => {
      const page = notesPanel.appendChild(document.createElement('div'))
      page.append(...[...(step.notes?.childNodes || [])].filter((node) => node.nodeType !== Node.TEXT_NODE || node.textContent.trim()))
      return page
    }) : []

    const messages = [...errors.map((m) => ['error', m]), ...(debug ? warnings.map((m) => ['warning', m]) : [])]
    if (messages.length) {
      const list = widget.appendChild(document.createElement('ul'))
      list.className = 'anim-messages'
      messages.forEach(([kind, message]) => {
        const item = list.appendChild(document.createElement('li'))
        item.className = `anim-${kind}`
        item.textContent = message
      })
    }

    if (debug) widget.classList.add('anim-debug')
    if (opts.controls === 'none') widget.classList.add('anim-no-controls')
    source.replaceWith(widget)

    // -------------------------------------------------------------------------
    // Playback
    // -------------------------------------------------------------------------

    // The camera's view: the part of the drawing the SVG shows. Callouts and slides use it, so it is
    // one object, updated in place.
    const view = { ...viewBox }
    const renderer = createRenderer(svg, view, debug)

    // A beat's camera as a viewBox: zoomed about its centre, and kept inside the drawing when zoomed in.
    function cameraView(camera) {
      const zoom = camera?.zoom || 1
      const w = viewBox.w / zoom
      const h = viewBox.h / zoom
      let cx = camera?.x ?? viewBox.x + viewBox.w / 2
      let cy = camera?.y ?? viewBox.y + viewBox.h / 2
      if (zoom >= 1) {
        cx = Math.min(viewBox.x + viewBox.w - w / 2, Math.max(viewBox.x + w / 2, cx))
        cy = Math.min(viewBox.y + viewBox.h - h / 2, Math.max(viewBox.y + h / 2, cy))
      }
      return { x: cx - w / 2, y: cy - h / 2, w, h }
    }

    function setView(v) {
      Object.assign(view, v)
      // Only when it changes: setting it, even to the same value, makes the browser redraw everything
      const box = `${v.x} ${v.y} ${v.w} ${v.h}`
      if (svg.getAttribute('viewBox') !== box) svg.setAttribute('viewBox', box)
    }
    const empty = new Map()
    const emptyMeta = { tweens: new Map() }
    const last = beats.length - 1
    let current = 0
    let running = null // { finish }
    let playing = false
    let playTimer = 0
    let playDir = 1 // -1 while a loop-bounce plays backwards
    let waitingForClick = false // playing, but stopped at a `pause` until Next
    let navId = 0 // bumped by every navigation, so older auto chains and play steps stop

    // Where the viewer's own stepping is going, as a `preview-position` event ({ position: the
    // beat }) sent as each move sets off: the VS Code preview pane moves the editor's cursor there
    const announceBeat = () => widget.dispatchEvent(new CustomEvent('preview-position', { bubbles: true, detail: { position: current } }))
    const BY_VIEWER = { announce: true }

    function showStatic(index) {
      const state = beats[index]?.state || empty
      setView(cameraView(beats[index]?.camera))
      renderer.render(state, state, emptyMeta, () => 1, state)
    }

    function updateControls() {
      const step = beats[current]?.step ?? 0
      setDisabled(prev, current === 0)
      setDisabled(rewind, current === 0)
      setDisabled(next, current >= beats.length - 1)
      progressBar.style.transform = `scaleX(${beats.length > 1 ? current / (beats.length - 1) : 1})`
      progress.setAttribute('aria-valuenow', String(current))
      progress.setAttribute('aria-valuetext', `Step ${step + 1} of ${steps.length}`)
      notes.forEach((page, i) => { page.style.display = i === step ? '' : 'none' })
    }

    // A caption slide or fade. While it runs the element has its own compositor layer, so the
    // browser moves the text without repainting it, and the diagram's frames aren't held up.
    function animateEl(el, frames, ms, options = {}) {
      if (!ms || !el.animate) return null
      el.style.willChange = 'transform, opacity'
      const anim = el.animate(frames, { duration: ms, easing: 'ease-in-out', ...options })
      afterCaption(anim, () => { el.style.willChange = '' })
      return anim
    }

    // What to undo once a caption animation is over (flags, styles, a held last frame). It waits
    // until the diagram stops moving, so the caption's changes all land on the frame it stops.
    let tidyUps = []
    function afterCaption(anim, fn) {
      let done = false
      tidyUps.push({ anim, fn: () => { if (!done) { done = true; fn() } } })
    }
    function tidyCaptions() {
      const list = tidyUps
      tidyUps = []
      for (const { anim, fn } of list) {
        if (anim.playState === 'finished' || anim.playState === 'idle') fn()
        else { anim.addEventListener('finish', fn); anim.addEventListener('cancel', fn) } // still going
      }
    }

    function showCaption(from, to, animate) {
      const a = beats[from] || beats[0]
      const b = beats[to] || beats[0]
      if (!a || !b) return
      tidyCaptions() // the last change's, before this one starts
      const ms = animate && !reducedMotion() ? CAPTION_MS : 0
      const forward = to > from
      const pageA = pages[a.step]
      const pageB = pages[b.step]
      pages.forEach((p, i) => setFlag(p.page, 'active', i === b.step))
      pageB.parts.forEach((part, i) => setFlag(part, 'shown', i <= b.beat))

      if (a.step !== b.step) {
        const sameHeading = pageA.headingText === pageB.headingText
        const shift = forward ? '1.5em' : '-1.5em'
        const inTarget = sameHeading ? pageB.body : pageB.page
        animateEl(inTarget, [{ opacity: 0, transform: `translateX(${shift})` }, { opacity: 1, transform: 'none' }], ms)
        if (ms) {
          // The outgoing page stays visible while it fades out.
          const outTarget = sameHeading ? pageA.body : pageA.page
          setFlag(pageA.page, 'leaving', true)
          if (sameHeading) pageA.heading.style.visibility = 'hidden'
          const out = animateEl(outTarget, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${forward ? '-1.5em' : '1.5em'})` }], ms, { fill: 'forwards' })
          afterCaption(out, () => {
            setFlag(pageA.page, 'leaving', false)
            pageA.heading.style.visibility = ''
            out.cancel()
          })
        }
      } else if (a.beat !== b.beat) {
        const part = pageB.parts[Math.max(a.beat, b.beat)]
        if (forward) animateEl(part, [{ opacity: 0 }, { opacity: 1 }], ms)
        else if (ms) {
          setFlag(part, 'leaving', true)
          const out = animateEl(part, [{ opacity: 1 }, { opacity: 0 }], ms, { fill: 'forwards' })
          afterCaption(out, () => { setFlag(part, 'leaving', false); out.cancel() })
        }
      }
    }

    // Moves to beat `to`: neighbouring beats animate (backwards plays in reverse), jumps are instant.
    // announce: say where it's going (preview-position) as it sets off, for the viewer's own stepping.
    function goTo(to, { animate = true, announce = false } = {}) {
      to = Math.max(0, Math.min(beats.length - 1, to))
      introPending = false // moving on before it played: no intro (until back at the start)
      if (running) running.finish()
      const from = current
      if (to === from) return Promise.resolve()
      current = to
      updateControls()
      if (announce) announceBeat()
      showCaption(from, to, animate && Math.abs(to - from) === 1)

      if (!animate || Math.abs(to - from) !== 1 || reducedMotion()) {
        showStatic(to)
        return Promise.resolve()
      }

      const k = Math.max(from, to)
      return transition(beats[k - 1].state, beats[k].state, beats[k].meta, to > from,
        cameraView(beats[k - 1].camera), cameraView(beats[k].camera), to)
    }

    // Animates from state A to state B (B's beat supplies `meta`), forwards or backwards, then
    // shows beat `to` as it is. Used between beats, and for the intro (from nothing to beat 1).
    function transition(A, B, meta, forward, viewA, viewB, to) {
      const final = forward ? B : A
      // Each shape's change runs from its delay to delay + duration; backwards is the exact reverse.
      const durOf = (uid) => meta.tweens.get(uid)?.dur ?? 0
      const delayOf = (uid) => meta.tweens.get(uid)?.delay ?? 0
      const uids = meta.tweens.keys()
      const total = Math.max(0, ...[...uids].map((uid) => delayOf(uid) + durOf(uid)))
      const forwardT = (uid, time) => {
        const d = durOf(uid)
        const after = time - delayOf(uid)
        return d ? Math.min(1, Math.max(0, after / d)) : after >= 0 ? 1 : 0
      }
      const start = performance.now()
      // `camera travel`: the view's centre eases from stop to stop, an equal share of the time each
      // (stops the edge of the drawing holds back are where the view really goes); its size eases
      // over the whole route. `raw` is the camera's un-eased progress.
      const route = meta.tweens.get('camera')?.path
      const stops = route?.map(cameraView).map((v) => ({ x: v.x + v.w / 2, y: v.y + v.h / 2 }))
      const cameraEase = easeFn(meta.tweens.get('camera')?.ease)
      const viewAt = (raw) => {
        const t = cameraEase(raw)
        const w = lerp(viewA.w, viewB.w, t)
        const h = lerp(viewA.h, viewB.h, t)
        if (!stops) return { x: lerp(viewA.x, viewB.x, t), y: lerp(viewA.y, viewB.y, t), w, h }
        const c = pointOnHops(stops, raw, cameraEase)
        return { x: c.x - w / 2, y: c.y - h / 2, w, h }
      }

      return new Promise((resolve) => {
        let frame = 0
        const draw = (elapsed) => {
          const progress = (uid) => (forward ? forwardT(uid, elapsed) : forwardT(uid, total - elapsed))
          const done = total ? Math.min(1, elapsed / total) : 1
          const beatT = ease(forward ? done : 1 - done)
          setView(viewAt(clamp01(progress('camera'))))
          renderer.render(A, B, meta, progress, final, { forward, beatT })
        }
        const finish = () => {
          cancelAnimationFrame(frame)
          running = null
          showStatic(to)
          tidyCaptions() // the diagram is still now
          resolve()
        }
        const tick = () => {
          if (!widget.isConnected) { running = null; return resolve() }
          const elapsed = performance.now() - start
          if (elapsed >= total) return finish()
          draw(elapsed)
          frame = requestAnimationFrame(tick)
        }
        running = { finish }
        draw(0)
        frame = requestAnimationFrame(tick)
      })
    }

    // How long to wait after arriving at a beat while playing: its `pause` (Infinity = until Next),
    // or the hold.
    const holdAfter = (index) => {
      const pause = beats[index]?.meta.pause
      return pause === 'click' ? Infinity : pause ?? holdMs
    }
    const atEnd = (dir) => (dir > 0 ? current >= last : current <= 0)

    // One step, following `auto` chains: arriving at a beat marked `auto` goes straight on in the
    // same direction, so one click plays a chain forwards and one click undoes it.
    function step(dir, { announce = false } = {}) {
      const token = ++navId
      const go = () => {
        const target = current + dir
        if (target < 0 || target > last) return Promise.resolve()
        return goTo(target, { announce }).then(() => {
          if (token === navId && beats[current].meta.auto && !atEnd(dir)) return go()
        })
      }
      return go()
    }

    // Jumps straight to a beat; arriving back at the start plays the intro again.
    function jump(index, { announce = false } = {}) {
      const token = ++navId
      return goTo(index, { animate: false, announce }).then(() => (token === navId && index === 0 ? playIntro() : null))
    }

    // The intro: when the first beat chooses an entrance (typed, pop, draw, slide) or a delay, it
    // plays in from nothing, the first time the animation comes into view and again after going
    // back to the start, instead of only ever being shown finished. Plain fades don't (every
    // animation would fade in as it scrolls into view), nor for viewers who prefer reduced motion.
    const hasIntro = !reducedMotion() && [...(beats[0]?.meta.tweens.values() || [])]
      .some((tw) => (tw.enter && !ENTRANCES[tw.enter]?.quiet) || tw.delay > 0)
    let introPending = hasIntro && 'IntersectionObserver' in window // drawn empty until it plays
    let intro = null // the intro's promise while it plays
    function playIntro() {
      introPending = false
      if (!hasIntro || current !== 0 || reducedMotion()) return Promise.resolve()
      if (running) running.finish()
      const view = cameraView(beats[0].camera)
      intro = transition(empty, beats[0].state, beats[0].meta, true, view, view, 0)
      return intro.finally(() => { intro = null })
    }
    if (introPending) {
      const introObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return
        introObserver.disconnect()
        if (introPending) playIntro()
      }, { threshold: 0.3 })
      introObserver.observe(widget)
    }

    function setWaiting(on) {
      waitingForClick = on
      setFlag(widget, 'waiting', on)
    }

    function stopPlaying() {
      playing = false
      setWaiting(false)
      clearTimeout(playTimer)
      setFlag(widget, 'playing', false)
      setButtonLabel(play, 'Play', 'A')
    }

    function schedule(ms) {
      clearTimeout(playTimer)
      if (ms === Infinity) return setWaiting(true)
      playTimer = setTimeout(playNext, ms)
    }

    // Playing ends at the last beat, unless the tag says loop (jump back to the start) or
    // loop-bounce (play backwards to the start, then forwards again).
    function finished() {
      autoplayWanted = false
      stopPlaying()
    }

    function playNext() {
      if (!playing || !widget.isConnected) return stopPlaying()
      setWaiting(false)
      if (atEnd(playDir)) {
        if (opts.loop === 'loop' && last > 0) {
          playDir = 1
          return startOver()
        }
        if (opts.loop === 'bounce' && last > 0) playDir = -playDir
        else return finished()
      }
      const token = ++navId
      goTo(current + playDir).then(() => {
        if (!playing || token !== navId) return
        if (beats[current].meta.auto && !atEnd(playDir)) return playNext() // straight on
        if (atEnd(playDir) && !opts.loop) return finished()
        schedule(holdAfter(current))
      })
    }

    function startPlaying({ waiting = false, holdFirst = false } = {}) {
      playing = true
      setFlag(widget, 'playing', true)
      setButtonLabel(play, 'Pause', 'A')
      if (waiting) return schedule(Infinity)
      // autoplay: show where it starts first (after the intro, if it's playing)
      if (holdFirst) return (intro || Promise.resolve()).then(() => { if (playing) schedule(holdAfter(current)) })
      if (opts.loop !== 'bounce') playDir = 1
      if (!opts.loop && current >= last) return startOver()
      playNext()
    }

    // While playing: back to the start (playing the intro, if any), then hold there before going on.
    function startOver() {
      clearTimeout(playTimer)
      jump(0).then(() => { if (playing && current === 0) schedule(holdAfter(0)) })
    }

    // Autoplay: only while the animation is on screen and the tab is visible (resuming where it
    // left off), never for viewers who prefer reduced motion. Any user navigation turns it off.
    let autoplayWanted = Boolean(opts.autoplay) && !reducedMotion()
    let onScreen = false
    let suspendedWaiting = false
    function updateAutoplay() {
      if (!widget.isConnected) {
        observer?.disconnect()
        document.removeEventListener('visibilitychange', updateAutoplay)
        return
      }
      const visible = onScreen && !document.hidden
      if (visible && autoplayWanted && !playing) startPlaying({ waiting: suspendedWaiting, holdFirst: !suspendedWaiting })
      else if (!visible && playing && autoplayWanted) {
        suspendedWaiting = waitingForClick
        stopPlaying()
      }
    }
    const observer = autoplayWanted && 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; updateAutoplay() }, { threshold: 0.5 })
      : null
    if (autoplayWanted) {
      if (observer) observer.observe(widget)
      else onScreen = true
      document.addEventListener('visibilitychange', updateAutoplay)
    }

    // User actions turn autoplay off; Next at a `pause` carries on playing instead.
    const userStop = () => {
      autoplayWanted = false
      suspendedWaiting = false
      stopPlaying()
    }
    const userNext = () => {
      if (playing && waitingForClick) return playNext()
      userStop()
      step(1, BY_VIEWER)
    }
    const userBack = () => { userStop(); step(-1, BY_VIEWER) }
    const userJump = (index) => { userStop(); jump(index, BY_VIEWER) }
    const userPlay = () => (playing ? userStop() : startPlaying())

    function toggleFullscreen() {
      if (document.fullscreenElement === widget) document.exitFullscreen?.()
      else widget.requestFullscreen?.().catch(() => {})
    }

    // aria-disabled (not disabled) still lets a click through
    const isEnabled = (button) => button.getAttribute('aria-disabled') !== 'true'
    const onPress = (button, fn) => button.addEventListener('click', () => { if (isEnabled(button)) fn() })
    onPress(rewind, () => userJump(0))
    onPress(prev, userBack)
    onPress(next, userNext)
    onPress(play, userPlay)
    // The next/play nudge stops at the first interaction, as reveal.js's controls tutorial does
    const touched = () => setFlag(widget, 'untouched', false)
    controls.addEventListener('click', touched)
    widget.addEventListener('keydown', touched)

    // Clicking the progress bar jumps to that point (as in reveal.js)
    progress.addEventListener('click', (event) => {
      touched()
      const rect = progress.getBoundingClientRect()
      const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      userJump(Math.round(fraction * last))
    })
    const toggleNotes = () => { if (hasNotes) notesPanel.hidden = !notesPanel.hidden }
    const help = buildHelp(widget)

    // Touch: swipe left / right for next / back; a double tap or double click plays / pauses
    const gesture = (fn) => () => { touched(); fn() }
    addSwipeSupport(widget, { left: gesture(userNext), right: gesture(userBack), doubleTap: gesture(userPlay) }, GESTURE_IGNORE)
    preventDoubleClickSelect(widget, GESTURE_IGNORE)
    // While focused, scrolling steps (the page scrolls again at either end)
    addWheelStepping(widget, {
      next: gesture(userNext),
      prev: gesture(userBack),
      canNext: () => isEnabled(next),
      canPrev: () => isEnabled(prev),
    })

    // Keys, as on slides: → N Space next, ← P Shift+Space back, Home / End, A (play), F, S, ? and Esc.
    widget.addEventListener('keydown', (event) => {
      if (event.target.closest('input, textarea, select, [contenteditable], .CodeMirror')) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const nextKey = key === 'ArrowRight' || key === 'n' || (key === ' ' && !event.shiftKey)
      const backKey = key === 'ArrowLeft' || key === 'p' || (key === ' ' && event.shiftKey)
      if (key === 'Escape' && !help.hidden) help.hidden = true
      else if (key === '?') help.hidden = !help.hidden
      else if (nextKey) userNext()
      else if (backKey) userBack()
      else if (key === 'Home') userJump(0)
      else if (key === 'End') userJump(last)
      else if (key === 'f') toggleFullscreen()
      else if (key === 's') toggleNotes()
      else if (key === 'a') userPlay()
      else return
      event.preventDefault()
    })

    // A `preview-show` event ({ position: a beat, play }) goes to a beat: the VS Code preview pane
    // sends it to follow the editor's cursor. With play, it plays into the beat from the one
    // before (or the intro, for the first), so an edited beat is seen moving.
    widget.addEventListener('preview-show', ({ detail: { position, play } }) => {
      userStop()
      const to = Math.max(0, Math.min(last, position))
      if (!play || to === 0) return jump(to)
      const token = ++navId
      goTo(to - 1, { animate: false }).then(() => { if (token === navId) goTo(to) })
    })

    // A theme change redraws, with the colours (theme variables) re-resolved (anim-render.js)
    const onThemeChange = () => {
      if (!widget.isConnected) return window.removeEventListener('docsify-theme-change', onThemeChange)
      if (!running) showStatic(introPending ? -1 : current)
    }
    window.addEventListener('docsify-theme-change', onThemeChange)

    showStatic(introPending ? -1 : 0) // -1: nothing, until the intro plays
    showCaption(0, 0, false)
    updateControls()
  }

  function buildAll() {
    document.querySelectorAll('.markdown-section .anim-source:not([data-anim-built])').forEach((source) => {
      source.setAttribute('data-anim-built', 'true')
      try {
        buildWidget(source)
      } catch (error) {
        console.error('animation: failed to build', error)
        window.DocsifyUtils.renderErrorBox(source, `Animation failed to build: ${error.message}`)
      }
    })
  }

  // Built once the page's web fonts have loaded, so text is measured in the font it's drawn in
  function initAnimations() {
    if (document.fonts?.status === 'loading') document.fonts.ready.then(buildAll)
    else buildAll()
  }

  const docsifyAnimation = function (hook) {
    hook.beforeEach(rewriteBlocks)
    hook.afterEach(stripHeadingAnchors)
    hook.doneEach(initAnimations)
  }

  // Appended so every other plugin's hooks have processed the caption HTML first (as slides.js).
  window.DocsifyUtils.registerPlugin(docsifyAnimation, false)
})()
