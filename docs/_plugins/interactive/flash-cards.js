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
 * Attributes:
 *   shuffle - if present, cards are shown in a randomised order.
 *
 * Controls: click to flip a card. While the deck has focus (after a click in it): Up / Down flip,
 * Left / Right move, Escape goes back to the first card, and scrolling moves (addWheelStepping).
 * On touch, swipe left / right to move and up / down to flip (DocsifyUtils.addSwipeSupport).
 *
 * The VS Code extension (vscode/dt-notes-syntax, preview-pane.js) previews cards with this file,
 * moving them with `preview-show` events and following their `preview-position` ones.
 */
(function () {

    const { clamp, shuffleArray, addSwipeSupport, addWheelStepping, preventDoubleClickSelect } = window.DocsifyUtils

    const ICONS = {
        FIRST:      'chevrons-left',
        PREVIOUS:   'chevron-left',
        NEXT:       'chevron-right',
        FULLSCREEN: 'expand',
    }

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
            cardInstruct.textContent = `Move LEFT / RIGHT. Click or UP to flip`

            const cardNumbered = (num) => cardList.querySelector(`li[data-card-num="${num}"]`)

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

            // The preview pane's `preview-show` event ({ position: { card, back } }): that card,
            // on that side
            cardList.addEventListener('preview-show', ({ detail: { position } }) => {
                changeCard(position.card + 1 - parseInt(cardList.dataset.currentCard), false)
                cardNumbered(parseInt(cardList.dataset.currentCard))?.classList.toggle('revealed', position.back)
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



                card.addEventListener('click', () => {
                    card.classList.toggle('revealed')
                    tellPreview()
                })
                preventDoubleClickSelect(card)
                addSwipeSupport(card, {
                    left:  () => changeCard(1),
                    right: () => changeCard(-1),
                    up:    revealCurrentCard,
                    down:  revealCurrentCard,
                })

                removeLinks(card)
                convertImagesToParaBacks(card)
            })

            addControls(cardList, cardInfo, cardInstruct, changeCard)

            // Keys and the wheel act on the deck with focus (clicking a card or a control gives it focus)
            cardList.tabIndex = 0
            cardList.addEventListener('keydown', (e) => {
                switch (e.code) {
                    case 'ArrowUp':
                    case 'ArrowDown':
                        revealCurrentCard()
                        break
                    case 'Escape':
                        // Escape should always return to a clean baseline state.
                        exitFullScreen(cardList)
                        changeCard(-999)
                        break
                    case 'ArrowRight': changeCard(1);  break
                    case 'ArrowLeft':  changeCard(-1); break
                    default: return
                }
                e.preventDefault()
            })
            addWheelStepping(cardList, {
                next:    () => changeCard(1),
                prev:    () => changeCard(-1),
                canNext: () => parseInt(cardList.dataset.currentCard) < numCards,
                canPrev: () => parseInt(cardList.dataset.currentCard) > 1,
            })

            const fullscreenHandler = () => {
                if (!document.fullscreenElement) {
                    exitFullScreen(cardList)
                    changeCard(-999)
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

    function addControls(cardList, cardInfo, cardInstruct, changeCard) {
        const controlPanel = document.createElement('div')
        const controls     = document.createElement('p')
        const firstButton  = document.createElement('span')
        const prevButton   = document.createElement('span')
        const nextButton   = document.createElement('span')
        const zoomButton   = document.createElement('span')

        controlPanel.classList.add('card-control-panel')
        cardInfo.classList.add('card-info')
        cardInstruct.classList.add('card-instructions')
        controls.classList.add('card-controls')
        firstButton.classList.add('control', 'card-first')
        prevButton.classList.add('control', 'card-previous')
        nextButton.classList.add('control', 'card-next')
        zoomButton.classList.add('control', 'card-zoom')

        cardList.append(controlPanel)
        controlPanel.append(cardInfo, cardInstruct, controls)
        controls.append(firstButton, prevButton, nextButton, zoomButton)

        firstButton.innerHTML = lucideIcon(ICONS.FIRST)
        prevButton.innerHTML  = lucideIcon(ICONS.PREVIOUS)
        nextButton.innerHTML  = lucideIcon(ICONS.NEXT)
        zoomButton.innerHTML  = lucideIcon(ICONS.FULLSCREEN)

        firstButton.addEventListener('click', () => changeCard(-999))
        prevButton.addEventListener('click',  () => changeCard(-1))
        nextButton.addEventListener('click',  () => changeCard(1))
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
