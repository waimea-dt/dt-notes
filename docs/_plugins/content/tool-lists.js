/**
 * tool-lists.js - Enhances lists following marked headings with semantic classes.
 *
 * Identifies tool/resource lists marked with <!-- tool-lists --> comment at page top.
 * When marker is found, ALL h2 headings and their following ULs are styled as tool lists.
 * Adds classes to list items based on metadata found in sub-lists, and renders a
 * matching Lucide icon inside a .icons div for non-recommended metadata:
 *   - **Recommended** → adds "recommended" class (no icon, uses a star badge in CSS)
 *   - **Free** / **Paid** → adds "free"/"paid" class + gift/circle-dollar-sign icon
 *   - **Online** / **Desktop** → adds "online"/"desktop" class + globe/monitor icon
 *
 * Usage:
 *   # Page Title
 *   <!-- tool-lists -->
 *
 *   ## Python IDEs
 *   - [Thonny](https://thonny.org/)
 *       - **Recommended**
 *       - **Free**
 */

;(function () {
    'use strict'

    // Metadata keywords that should become classes (case-insensitive)
    const METADATA_KEYWORDS = {
        'recommended': 'recommended',
        'free': 'free',
        'paid': 'paid',
        'online': 'online',
        'desktop': 'desktop',
    }

    // Lucide icon names for metadata classes (recommended has no icon)
    const METADATA_ICONS = {
        'free': 'gift',
        'paid': 'circle-dollar-sign',
        'online': 'globe',
        'desktop': 'monitor',
    }

    // Mouse-over titles for metadata icons
    const METADATA_TITLES = {
        'free': 'Free or free-to-use',
        'paid': 'Paid app or service',
        'online': 'Online app or service',
        'desktop': 'Desktop app',
    }

    function resolveScope(root) {
        return root && typeof root.querySelectorAll === 'function' ? root : document
    }

    function processToolLists(root) {
        const scope = resolveScope(root)
        const container = scope === document ? document.querySelector('.markdown-section') : scope

        if (!container) return

        // Check if page has <!-- tool-lists --> marker anywhere near the top
        let hasToolListsMarker = false
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_COMMENT,
            null,
            false
        )

        let commentNode
        while ((commentNode = walker.nextNode())) {
            if (commentNode.nodeValue.trim() === 'tool-lists') {
                hasToolListsMarker = true
                break
            }
            // Stop searching after first h2 (marker should be before content)
            if (commentNode.nextElementSibling?.tagName === 'H2') break
        }

        if (!hasToolListsMarker) return

        // Process ALL h2 headings in the page
        const selector = scope === document ? '.markdown-section h2' : 'h2'
        const headings = container.querySelectorAll(selector)

        headings.forEach(heading => {
            heading.classList.add('tools-heading')

            // Find the next sibling UL
            let nextEl = heading.nextElementSibling
            while (nextEl && nextEl.tagName !== 'UL') {
                nextEl = nextEl.nextElementSibling
            }

            if (!nextEl || nextEl.tagName !== 'UL') return

            // Mark this as a tool list
            const toolList = nextEl
            toolList.classList.add('tool-list')

            // Process each top-level LI
            const listItems = Array.from(toolList.children).filter(el => el.tagName === 'LI')

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
                    if (METADATA_KEYWORDS[normalized]) {
                        foundClasses.push(METADATA_KEYWORDS[normalized])
                        itemsToRemove.push(subLi)
                    }
                })

                // Add all found classes to the parent LI
                foundClasses.forEach(cls => {
                    li.classList.add(cls)
                })

                if (foundClasses.includes('recommended')) {
                    li.title = 'Recommended'
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
        const iconNames = foundClasses
            .map(cls => METADATA_ICONS[cls])
            .filter(Boolean)

        if (!iconNames.length) return

        let icons = li.querySelector(':scope > .icons')
        if (!icons) {
            icons = document.createElement('div')
            icons.className = 'icons'
            li.prepend(icons)
        }

        iconNames.forEach(name => {
            if (icons.querySelector(`[data-lucide="${name}"]`)) return

            // Lucide replaces the <i> with an <svg>, so the title lives on a wrapper span
            // (SVG "title" attributes don't trigger native tooltips, only <title> elements do)
            const title = METADATA_TITLES[foundClasses.find(cls => METADATA_ICONS[cls] === name)]
            const wrap = document.createElement('span')
            if (title) wrap.title = title

            const icon = document.createElement('i')
            icon.setAttribute('data-lucide', name)
            wrap.appendChild(icon)
            icons.appendChild(wrap)
        })
    }

    const docsifyToolLists = function (hook) {
        hook.doneEach(function () {
            processToolLists()
        })

        hook.ready(function () {
            if (window.DocsifyUtils?.onSlidesRendered) {
                window.DocsifyUtils.onSlidesRendered(function (root) {
                    processToolLists(root)
                })
            }
        })
    }

    if (window.DocsifyUtils?.registerPlugin) {
        window.DocsifyUtils.registerPlugin(docsifyToolLists)
    } else {
        // Fallback if utils not loaded
        if (window.$docsify) {
            window.$docsify.plugins = [].concat(docsifyToolLists, window.$docsify.plugins || [])
        }
    }
})()
