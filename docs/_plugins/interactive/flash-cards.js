/**
 * docsify-flash-cards.js - Converts markdown lists into interactive flash cards.
 *
 * Each list item becomes one card, and an <hr> inside the item splits front/back
 * faces. The plugin also adds navigation controls and optional fullscreen mode.
 *
 * Usage in markdown:
 *   <flashcards>
 *   - Front of card 1
 *     ---
 *     Back of card 1
 *   - Front of card 2
 *     ---
 *     Back of card 2
 *   </flashcards>
 *
 * Attributes (playback as on <animation>):
 *   shuffle - if present, cards are shown in a randomised order.
 *   name="..." - the cards' name in the VS Code preview pane's block list (not used on the page)
 *   hold="s" - seconds each side shows while playing (default 3)
 *   autoplay - plays while on screen (pausing, or any move, stops it)
 *   loop     - after the last card's back, plays on from the first card
 *
 * Controls: click to flip a card. While the deck has focus (after a click in it): Up / Down flip,
 * Left / Right move, A plays / pauses, Escape goes back to the first card, and scrolling moves
 * (addWheelStepping). On touch, swipe left / right to move and up / down to flip
 * (DocsifyUtils.addSwipeSupport). Playing shows each card's front, flips it, then moves on; the
 * viewer's own moves stop it, and playing from the last card's back starts at the first card.
 *
 * The VS Code extension (vscode/dt-notes-syntax, preview-pane.js) previews cards with this file,
 * moving them with `preview-show` events and following their `preview-position` ones.
 */
(function () {

    const { clamp, shuffleArray, addSwipeSupport, addWheelStepping, preventDoubleClickSelect, playbackOptions, playWhileOnScreen } = window.DocsifyUtils

    const ICONS = {
        FIRST:      'chevron-first', // |< as on <animation>'s restart
        PREVIOUS:   'chevron-left',
        NEXT:       'chevron-right',
        PLAY:       'play',
        PAUSE:      'pause',
        FULLSCREEN: 'expand',
    }

    const HOLD_SECONDS = 3 // each side's time while playing, unless hold="s"

    let cleanupWindowListeners = () => {}

    function processFlashCards() {

        // Docsify re-runs plugins on route changes. Tear down old global listeners first.
        cleanupWindowListeners()
        cleanupWindowListeners = () => {}

        const cleanups = []

        const triggers = document.querySelectorAll('.markdown-section flashcards')

        if (triggers.length === 0) {
            return
        }

        triggers.forEach(function (trigger, triggerIndex) {

            const cardList = trigger.querySelector('ul')

            if (!cardList) {
                return
            }

            cardList.classList.add('flash-cards')

            let cards = [...cardList.children]

            if (cards.length === 0) {
                return
            }

            if (trigger.hasAttribute('shuffle')) {
                cards = shuffleArray(cards)
                cards.forEach((card) => cardList.append(card))
            }

            const numCards = cards.length
            cardList.dataset.cardCount   = numCards
            cardList.dataset.currentCard = 1
            cardList.dataset.finalCard   = 'false'
            cardList.style.setProperty('--card-count', numCards)
            cardList.style.setProperty('--current-card', 1)

            const cardInfo = document.createElement('p')
            cardInfo.textContent = `Card 1 of ${numCards}`
            const cardInstruct = document.createElement('p')
            cardInstruct.textContent = `Move LEFT / RIGHT. Click or UP to flip. A to autoplay`

            const cardNumbered = (num) => cardList.querySelector(`li[data-card-num="${num}"]`)
            const currentNum = () => parseInt(cardList.dataset.currentCard)
            const isRevealed = (num) => Boolean(cardNumbered(num)?.classList.contains('revealed'))

            // The card shown, and its side, as a `preview-position` event for the VS Code preview
            // pane: { card (from 0), back }
            const tellPreview = () => {
                const currentNum = parseInt(cardList.dataset.currentCard)
                const back = Boolean(cardNumbered(currentNum)?.classList.contains('revealed'))
                cardList.dispatchEvent(new CustomEvent('preview-position', { bubbles: true, detail: { position: { card: currentNum - 1, back } } }))
            }

            // tell: whether the preview pane hears of it (not when it asked for it)
            const changeCard = (offset, tell = true) => {
                const currentNum = parseInt(cardList.dataset.currentCard)
                const targetNum  = clamp(currentNum + offset, 1, numCards)

                cardNumbered(currentNum)?.classList.add('hidden')
                cardNumbered(currentNum)?.classList.remove('revealed')
                cardNumbered(targetNum)?.classList.remove('hidden')

                cardList.dataset.currentCard = targetNum
                cardList.style.setProperty('--current-card', targetNum)
                cardInfo.innerHTML = `Card ${targetNum} of ${numCards}`
                cardList.dataset.finalCard = targetNum < numCards ? 'false' : 'true'
                if (tell) tellPreview()
            }

            const revealCurrentCard = () => {
                const currentNum = parseInt(cardList.dataset.currentCard)
                cardNumbered(currentNum)?.classList.toggle('revealed')
                tellPreview()
            }

            // Playing (A or the play button): each side shows for hold="s", then the card flips,
            // then the next card; after the last card's back it stops, or with loop plays on from
            // the first. autoplay plays while on screen. data-playing is set while it plays.
            const playback = playbackOptions(trigger, HOLD_SECONDS)
            let playTimer = 0
            const isPlaying = () => cardList.hasAttribute('data-playing')
            const atEnd = () => currentNum() === numCards && isRevealed(numCards)
            const playStep = () => {
                if (!cardList.isConnected) return pause()
                if (!isRevealed(currentNum())) revealCurrentCard()
                else if (currentNum() < numCards) changeCard(1)
                else if (playback.loop) changeCard(-999)
                else return pause()
                playTimer = setTimeout(playStep, playback.holdMs)
            }
            const play = () => {
                if (atEnd() && !playback.loop) changeCard(-999) // playing from the end starts again
                cardList.toggleAttribute('data-playing', true)
                clearTimeout(playTimer)
                playTimer = setTimeout(playStep, playback.holdMs)
            }
            function pause() {
                clearTimeout(playTimer)
                cardList.toggleAttribute('data-playing', false)
            }
            const autoplay = playback.autoplay ? playWhileOnScreen(cardList, { play, pause }) : null
            cleanups.push(() => { autoplay?.cancel(); pause() })

            // The viewer's own moves stop playing, and autoplay
            const takeOver = () => { autoplay?.cancel(); pause() }
            const byViewer = (fn) => (...args) => { takeOver(); fn(...args) }
            const userChangeCard = byViewer(changeCard)
            const userReveal = byViewer(revealCurrentCard)
            const togglePlay = () => {
                const wasPlaying = isPlaying()
                takeOver()
                if (!wasPlaying) play()
            }

            // The preview pane's `preview-show` event ({ position: { card, back } }): stops playing,
            // and goes to that card, on that side (staying put when it was playing there)
            cardList.addEventListener('preview-show', ({ detail: { position } }) => {
                const wasPlaying = isPlaying()
                takeOver()
                if (wasPlaying && position.card + 1 === currentNum() && position.back === isRevealed(currentNum())) return
                changeCard(position.card + 1 - currentNum(), false)
                cardNumbered(currentNum())?.classList.toggle('revealed', position.back)
            })

            cards.forEach(function (card, i) {

                const divider = card.querySelector('hr')

                if (!divider) {
                    return
                }

                const cardFront = document.createElement('div')
                const cardBack  = document.createElement('div')
                cardFront.classList.add('card-front')
                cardBack.classList.add('card-back')

                let targetFace = cardFront
                // Keep original markdown order while splitting one <li> into front/back card faces.
                ;[...card.childNodes].forEach(function (node) {
                    if (node === divider) {
                        targetFace = cardBack
                    } else {
                        targetFace.append(node)
                    }
                })

                card.innerHTML = ''
                card.append(cardFront, cardBack)
                card.classList.add('flash-card')
                card.dataset.cardNum = i + 1
                if (i > 0) card.classList.add('hidden')



                card.addEventListener('click', userReveal) // only the current card shows
                preventDoubleClickSelect(card)
                addSwipeSupport(card, {
                    left:  () => userChangeCard(1),
                    right: () => userChangeCard(-1),
                    up:    userReveal,
                    down:  userReveal,
                })

                removeLinks(card)
                convertImagesToParaBacks(card)
            })

            addControls(cardList, cardInfo, cardInstruct, userChangeCard, togglePlay)

            // Keys and the wheel act on the deck with focus (clicking a card or a control gives it focus)
            cardList.tabIndex = 0
            cardList.addEventListener('keydown', (e) => {
                if (e.altKey || e.ctrlKey || e.metaKey) return
                switch (e.code) {
                    case 'ArrowUp':
                    case 'ArrowDown':
                        userReveal()
                        break
                    case 'Escape':
                        // Escape should always return to a clean baseline state.
                        exitFullScreen(cardList)
                        userChangeCard(-999)
                        break
                    case 'ArrowRight': userChangeCard(1);  break
                    case 'ArrowLeft':  userChangeCard(-1); break
                    case 'KeyA':       togglePlay();       break
                    default: return
                }
                e.preventDefault()
            })
            addWheelStepping(cardList, {
                next:    () => userChangeCard(1),
                prev:    () => userChangeCard(-1),
                canNext: () => currentNum() < numCards,
                canPrev: () => currentNum() > 1,
            })

            const fullscreenHandler = () => {
                if (!document.fullscreenElement) {
                    exitFullScreen(cardList)
                    userChangeCard(-999)
                }
            }

            window.addEventListener('fullscreenchange', fullscreenHandler)
            cleanups.push(() => window.removeEventListener('fullscreenchange', fullscreenHandler))

            // Move the cardList out of the wrapper before removing the wrapper
            trigger.parentNode.insertBefore(cardList, trigger)
            trigger.remove()
        })

        cleanupWindowListeners = () => cleanups.forEach(fn => fn())
    }


    function removeLinks(card) {
        card.querySelectorAll('a').forEach(function (link) {
            while (link.firstChild) {
                link.parentNode.insertBefore(link.firstChild, link);
            }
            link.remove();
        });
    }

    function convertImagesToParaBacks(card) {
        card.querySelectorAll('p:has(> img)').forEach(function (para) {
            const image = para.querySelector('img')
            para.style.backgroundImage = `url(${image.src})`
            para.classList.add('background-image')
            image.remove()
        })
    }

    function goFullScreen(cardList) {
        cardList.classList.add('zoomed')
        document.documentElement.style.scrollbarWidth = 'none'
        if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    }

    function exitFullScreen(cardList) {
        cardList.classList.remove('zoomed')
        document.documentElement.style.scrollbarWidth = 'thin'
        if (document.fullscreenElement) document.exitFullscreen()
    }

    function addControls(cardList, cardInfo, cardInstruct, changeCard, togglePlay) {
        const controlPanel = document.createElement('div')
        const controls     = document.createElement('p')
        const firstButton  = document.createElement('span')
        const prevButton   = document.createElement('span')
        const nextButton   = document.createElement('span')
        const playButton   = document.createElement('span')
        const zoomButton   = document.createElement('span')

        controlPanel.classList.add('card-control-panel')
        cardInfo.classList.add('card-info')
        cardInstruct.classList.add('card-instructions')
        controls.classList.add('card-controls')
        firstButton.classList.add('control', 'card-first')
        prevButton.classList.add('control', 'card-previous')
        nextButton.classList.add('control', 'card-next')
        playButton.classList.add('control', 'card-play')
        zoomButton.classList.add('control', 'card-zoom')

        cardList.append(controlPanel)
        controlPanel.append(cardInfo, cardInstruct, controls)
        controls.append(firstButton, prevButton, nextButton, playButton, zoomButton)

        firstButton.innerHTML = lucideIcon(ICONS.FIRST)
        prevButton.innerHTML  = lucideIcon(ICONS.PREVIOUS)
        nextButton.innerHTML  = lucideIcon(ICONS.NEXT)
        playButton.innerHTML  = lucideIcon(ICONS.PLAY) + lucideIcon(ICONS.PAUSE) // one shows (CSS: data-playing)
        zoomButton.innerHTML  = lucideIcon(ICONS.FULLSCREEN)

        firstButton.addEventListener('click', () => changeCard(-999))
        prevButton.addEventListener('click',  () => changeCard(-1))
        nextButton.addEventListener('click',  () => changeCard(1))
        playButton.addEventListener('click',  togglePlay)
        zoomButton.addEventListener('click',  () => {
            cardList.classList.contains('zoomed') ? exitFullScreen(cardList) : goFullScreen(cardList)
        })

        controlPanel.addEventListener('mousedown', (e) => { if (e.detail > 1) e.preventDefault() })

        if (window.lucide) {
            lucide.createIcons({
                attrs: {
                    class: ['icon', 'no-zoom'],
                    'stroke-width': 2,
                    stroke: 'currentColor'
                },
            })
        }
    }

    function lucideIcon(name) {
        return `<i data-lucide="${name}"></i> `
    }

    const docsifyFlashCards = function (hook) {
        hook.doneEach(processFlashCards)
    }

    window.DocsifyUtils.registerPlugin(docsifyFlashCards)

})()
