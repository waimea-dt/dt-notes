/**
 * recommendations.js - Enhances lists following marked headings with semantic classes.
 *
 * Identifies recommendation lists marked with <!-- recommendations --> comment at page top.
 * When marker is found, ALL h2 headings and their following ULs are styled as recommendation lists.
 * Additional words in the marker become classes on each generated UL, for example
 * <!-- recommendations media --> adds both "recommendations" and "media".
 * Adds classes to list items based on metadata found in sub-lists, and renders a
 * matching Lucide icon inside a .icons div for non-recommended metadata:
 *   - **Recommended** → adds "recommended" class + star icon (also uses a star badge in CSS)
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
        'recommended': { icon: 'star', title: 'Recommended' },

        'free':        { icon: 'gift',                   title: 'Free App' },
        'paid':        { icon: 'circle-dollar-sign',     title: 'Paid App' },
        'online':      { icon: 'globe',                  title: 'Online App' },
        'desktop':     { icon: 'monitor',                title: 'Desktop App' },

        'hacking':     { icon: 'square-terminal',        title: 'Hacking' },
        'drama':       { icon: 'drama',                  title: 'Drama' },
        'action':      { icon: 'sport-shoe',             title: 'Action' },
        'adventure':   { icon: 'signpost-big',           title: 'Adventure' },
        'comedy':      { icon: 'face-grinning',          title: 'Comedy' },
        'thriller':    { icon: 'crosshair',              title: 'Thriller' },
        'fantasy':     { icon: 'wand',                   title: 'Fantasy' },
        'sci-fi':      { icon: 'bot',                    title: 'Sci-Fi' },
        'space':       { icon: 'rocket',                 title: 'Space' },
        'horror':      { icon: 'face-angry',             title: 'Horror' },
        'war':         { icon: 'swords',                 title: 'War' },
        'crime':       { icon: 'banknote',               title: 'Crime' },
        'spy':         { icon: 'hat-glasses',            title: 'Spy' },
        'zombie':      { icon: 'skull',                  title: 'Zombies' },
        'dystopia':    { icon: 'face-slightly-frowning', title: 'Dystopian' },
        'animated':    { icon: 'pencil-sparkles',        title: 'Animated' },
        'mystery':     { icon: 'search',                 title: 'Mystery' },
        'nature':      { icon: 'leaf',                   title: 'Nature' },
        'romance':     { icon: 'heart',                  title: 'Romance' },
        'biography':   { icon: 'user-round',             title: 'Biography' },
        'history':     { icon: 'history',                title: 'History' },
        'society':     { icon: 'user-group',             title: 'Society' },
        'philosophy':  { icon: 'lightbulb',              title: 'Philosophy' },
        'factual':     { icon: 'info',                   title: 'Factual' },
        'science':     { icon: 'atom',                   title: 'Science' },
        'gaming':      { icon: 'gamepad-2',              title: 'Gaming' },
        'computing':   { icon: 'computer',               title: 'Computing' },
    }

    function resolveScope(root) {
        return root && typeof root.querySelectorAll === 'function' ? root : document
    }

    function addMetadataFilter(container, metadataValues) {
        container.querySelectorAll('.recommendations-filter').forEach(filter => filter.remove())

        const firstHeading = container.querySelector('h1')
        if (!firstHeading || metadataValues.size === 0) return

        const recommendationItems = Array.from(container.querySelectorAll('.recommendations > li'))

        const details = document.createElement('details')
        details.open = false
        details.classList.add('recommendations-filter')
        details.innerHTML = '<summary>Filter</summary>'

        const filterContainer = document.createElement('div')
        filterContainer.className = 'recommendations-filter-list'

        const offLabel = document.createElement('label')
        const offInput = document.createElement('input')
        const offIconWrapper = document.createElement('span')
        const offIcon = document.createElement('i')

        offInput.type = 'radio'
        offInput.name = 'recommendations-filter'
        offInput.value = 'all'
        offInput.checked = true
        offIconWrapper.className = 'recommendations-filter-icon'
        offIconWrapper.setAttribute('aria-hidden', 'true')
        offIcon.setAttribute('data-lucide', 'circle-off')
        offIconWrapper.append(offIcon)
        offLabel.append(offInput, offIconWrapper, 'Off')
        appendFilterCount(offLabel, recommendationItems.length)
        filterContainer.append(offLabel)

        Array.from(metadataValues)
            .sort((first, second) => METADATA[first].title.localeCompare(METADATA[second].title))
            .forEach(genre => {
                const label = document.createElement('label')
                const input = document.createElement('input')
                const icon = document.createElement('i')
                const iconName = METADATA[genre].icon

                input.type = 'radio'
                input.name = 'recommendations-filter'
                input.value = genre
                label.append(input)

                if (iconName) {
                    const iconWrapper = document.createElement('span')
                    iconWrapper.className = 'recommendations-filter-icon'
                    iconWrapper.setAttribute('aria-hidden', 'true')
                    icon.setAttribute('data-lucide', iconName)
                    iconWrapper.append(icon)
                    label.append(iconWrapper)
                }

                label.append(METADATA[genre].title)
                const genreCount = recommendationItems.filter(item => item.classList.contains(genre)).length
                appendFilterCount(label, genreCount)
                filterContainer.append(label)
            })

        details.append(filterContainer)
        firstHeading.parentElement.insertBefore(details, firstHeading.nextSibling)
    }

    function appendFilterCount(label, count) {
        const countSpan = document.createElement('span')
        countSpan.className = 'recommendations-filter-count'
        countSpan.textContent = `(${count})`
        label.append(countSpan)
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

        const metadataValues = new Set()

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
                    metadataValues.add(cls)
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

        addMetadataFilter(container, metadataValues)

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
            .filter(cls => cls !== 'recommended')
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
