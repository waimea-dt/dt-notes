/**
 * recommendations.js - Enhances lists following marked headings with semantic classes.
 *
 * Identifies recommendation lists marked with <!-- recommendations --> comment at page top.
 * When marker is found, ALL h2 headings and their following ULs are styled as recommendation lists.
 * Additional words in the marker become classes on each generated UL, for example
 * <!-- recommendations media --> adds both "recommendations" and "media".
 * Adds classes to list items based on metadata found in sub-lists, and renders a
 * matching Lucide icon inside a .icons div for non-recommended metadata:
 *   - **Recommended** → adds "recommended" class (no icon, uses a star badge in CSS)
 *   - **Free** / **Paid** → adds "free"/"paid" class + gift/circle-dollar-sign icon
 *   - **Online** / **Desktop** → adds "online"/"desktop" class + globe/monitor icon
 *
 * Usage:
 *   # Page Title
 *   <!-- recommendations media -->
 *
 *   ## Python IDEs
 *   - [Thonny](https://thonny.org/)
 *       - **Recommended**
 *       - **Free**
 */

;(function () {
    'use strict'

    // Metadata keywords, icons, and tooltips (case-insensitive)
    const METADATA = {
        'recommended': { title: 'Recommended' },
        'free':        { icon: 'gift', title: 'Free or free-to-use' },
        'paid':        { icon: 'circle-dollar-sign', title: 'Paid app or service' },
        'online':      { icon: 'globe', title: 'Online app or service' },
        'desktop':     { icon: 'monitor', title: 'Desktop app' },

        'hacking':     { icon: 'square-terminal', title: 'Hacking / computers' },
        'drama':       { icon: 'drama', title: 'Drama' },
        'action':      { icon: 'sport-shoe', title: 'Action / adventure' },
        'adventure':   { icon: 'route', title: 'Adventure' },
        'comedy':      { icon: 'face-grinning', title: 'Comedy' },
        'thriller':    { icon: 'crosshair', title: 'Thriller / exciting' },
        'fantasy':     { icon: 'wand', title: 'Fantasy' },
        'sci-fi':      { icon: 'rocket', title: 'Science Fiction' },
        'horror':      { icon: 'face-angry', title: 'Horror' },
        'war':         { icon: 'swords', title: 'War' },
        'crime':       { icon: 'banknote', title: 'Crime' },
        'spy':         { icon: 'hat-glasses', title: 'Spy' },
        'zombie':      { icon: 'skull', title: 'Zombies' },
        'dystopia':    { icon: 'face-slightly-frowning', title: 'Dystopian' },
        'animated':    { icon: 'pencil-sparkles', title: 'Animated' },
        'mystery':     { icon: 'search', title: 'Mystery' },
        'romance':     { icon: 'heart', title: 'Romance' },
        'biography':   { icon: 'user-round', title: 'Biography' },
        'neo-noir':    { icon: 'moon', title: 'Neo-noir' },
        'history':     { icon: 'history', title: 'History' },
        'society':     { icon: 'user-group', title: 'Society' },
        'philosophy':  { icon: 'circle-question-mark', title: 'Philosophy' },
        'documentary': { icon: 'binoculars', title: 'Documentary' },
        'factual':     { icon: 'info', title: 'Factual' },
        'science':     { icon: 'atom', title: 'Science' },
        'computing':   { icon: 'computer', title: 'Computing' },
    }

    function resolveScope(root) {
        return root && typeof root.querySelectorAll === 'function' ? root : document
    }

    function processRecommendations(root) {
        const scope = resolveScope(root)
        const container = scope === document ? document.querySelector('.markdown-section') : scope

        if (!container) return

        // Check if page has a recommendations marker anywhere near the top
        let markerClasses = null
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_COMMENT,
            null,
            false
        )

        let commentNode
        while ((commentNode = walker.nextNode())) {
            const markerParts = commentNode.nodeValue.trim().split(/\s+/)
            if (markerParts[0] === 'recommendations') {
                markerClasses = markerParts.slice(1)
                break
            }
            // Stop searching after first h2 (marker should be before content)
            if (commentNode.nextElementSibling?.tagName === 'H2') break
        }

        if (!markerClasses) return

        // Process ALL h2 headings in the page
        const selector = scope === document ? '.markdown-section h2' : 'h2'
        const headings = container.querySelectorAll(selector)

        headings.forEach(heading => {
            heading.classList.add('recommendations-heading')

            // Find the next sibling UL
            let nextEl = heading.nextElementSibling
            while (nextEl && nextEl.tagName !== 'UL') {
                nextEl = nextEl.nextElementSibling
            }

            if (!nextEl || nextEl.tagName !== 'UL') return

            // Mark this as a recommendation list and apply any marker variants.
            const recommendationList = nextEl
            recommendationList.classList.add('recommendations', ...markerClasses)

            // Process each top-level LI
            const listItems = Array.from(recommendationList.children).filter(el => el.tagName === 'LI')

            listItems.forEach(li => {
                // Find nested UL within this LI (sub-list with metadata)
                const subList = li.querySelector('ul')
                if (!subList) return

                // Extract metadata from sub-list items that are bold
                const subItems = Array.from(subList.children).filter(el => el.tagName === 'LI')
                const foundClasses = []
                const itemsToRemove = []

                subItems.forEach(subLi => {
                    // Check if this item starts with bold text
                    const firstChild = subLi.firstChild
                    if (!firstChild) return

                    // Check for <strong> or <em><strong> patterns
                    let boldText = null
                    if (firstChild.tagName === 'STRONG') {
                        boldText = firstChild.textContent
                    } else if (firstChild.tagName === 'EM' && firstChild.firstChild?.tagName === 'STRONG') {
                        boldText = firstChild.firstChild.textContent
                    }

                    if (!boldText) return

                    // Normalize and check against keywords
                    const normalized = boldText.toLowerCase().trim()

                    // Check exact matches first
                    if (METADATA[normalized]) {
                        foundClasses.push(normalized)
                        itemsToRemove.push(subLi)
                    }
                })

                // Add all found classes to the parent LI
                foundClasses.forEach(cls => {
                    li.classList.add(cls)
                })

                if (foundClasses.includes('recommended')) {
                    li.title = METADATA.recommended.title
                }

                // Remove metadata items from the sub-list
                itemsToRemove.forEach(subLi => {
                    subLi.remove()
                })

                // If sub-list is now empty, remove it entirely
                if (subList.children.length === 0) {
                    subList.remove()
                }

                addIcons(li, foundClasses)
            })
        })

        if (window.lucide) {
            lucide.createIcons({
                attrs: {
                    class: ['icon', 'no-zoom'],
                    'stroke-width': 2,
                    stroke: 'currentColor',
                },
            })
        }
    }

    function addIcons(li, foundClasses) {
        let icons = li.querySelector(':scope > .icons')
        const metadataWithIcons = foundClasses
            .map(cls => METADATA[cls])
            .filter(metadata => metadata?.icon)

        if (!metadataWithIcons.length) return

        if (!icons) {
            icons = document.createElement('div')
            icons.className = 'icons'
            li.prepend(icons)
        }

        metadataWithIcons.forEach(metadata => {
            if (icons.querySelector(`[data-lucide="${metadata.icon}"]`)) return

            // Lucide replaces the <i> with an <svg>, so the title lives on a wrapper span
            // (SVG "title" attributes don't trigger native tooltips, only <title> elements do)
            const wrap = document.createElement('span')
            if (metadata.title) wrap.title = metadata.title

            const icon = document.createElement('i')
            icon.setAttribute('data-lucide', metadata.icon)
            wrap.appendChild(icon)
            icons.appendChild(wrap)
        })
    }

    const docsifyRecommendations = function (hook) {
        hook.doneEach(function () {
            processRecommendations()
        })

        hook.ready(function () {
            if (window.DocsifyUtils?.onSlidesRendered) {
                window.DocsifyUtils.onSlidesRendered(function (root) {
                    processRecommendations(root)
                })
            }
        })
    }

    if (window.DocsifyUtils?.registerPlugin) {
        window.DocsifyUtils.registerPlugin(docsifyRecommendations)
    } else {
        // Fallback if utils not loaded
        if (window.$docsify) {
            window.$docsify.plugins = [].concat(docsifyRecommendations, window.$docsify.plugins || [])
        }
    }
})()
