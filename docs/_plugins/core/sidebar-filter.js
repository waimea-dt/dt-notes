/**
 * docsify-sidebar-filter.js - Removes sub-sidebar entries for headings inside custom/plugin elements.
 *
 * Many custom plugins (flashcards, sequences, timelines, etc.) include headings inside their blocks.
 * These internal headings should not appear in the page's table-of-contents sidebar.
 *
 * This plugin scans for known plugin containers and removes their heading IDs from the sidebar:
 * once after each page render, and again whenever Docsify rebuilds the sub-sidebar.
 *
 * Usage in markdown:
 *   No custom syntax required. Works automatically with supported plugin blocks.
 */
(function () {
    // Plugin containers whose headings should NOT appear in the sub-sidebar: the raw custom tags,
    // and the elements plugins turn them into
    const EXCLUDED_CONTAINERS = [
        'computer',
        'flashcards',
        'cards',
        'slides',
        'sequence',
        'structure',
        'timeline',
        'hierarchy',
        'filetree',
        'quiz',
        'ul.flash-cards',
        'div.cards-container',
        'div.docsify-slide-deck',
        'ol.sequence',
        'ul.structure',
        'ol.structure',
        'dl.timeline',
        'div.hierarchy-scroll-wrapper',
        'div.computer-screen-content',
        'ul.file-tree',
        'ul.quiz',
    ]
    const EXCLUDED_HEADINGS = EXCLUDED_CONTAINERS
        .map(container => `${container} :is(h1, h2, h3, h4, h5, h6)[id]`)
        .join(', ')

    function getExcludedHeadingIds() {
        const section = document.querySelector('.markdown-section')
        if (!section) return new Set()
        return new Set([...section.querySelectorAll(EXCLUDED_HEADINGS)].map(heading => heading.id))
    }

    // A sub-sidebar link's heading id, from its href (#/page?id=heading)
    function linkedId(link) {
        const query = (link.getAttribute('href') || '').split('?')[1]
        return query ? new URLSearchParams(query).get('id') : null
    }

    function filterSidebar() {
        const sidebar = document.querySelector('.app-sub-sidebar')
        if (!sidebar) return

        const excludedIds = getExcludedHeadingIds()
        if (!excludedIds.size) return

        sidebar.querySelectorAll('li').forEach(li => {
            const link = li.querySelector(':scope > a')
            if (!link || !excludedIds.has(linkedId(link))) return

            // Promote children before removing
            const childList = li.querySelector(':scope > ul')
            if (childList) li.before(...childList.children)
            li.remove()
        })
    }

    const docsifySidebarFilter = function (hook) {
        // Docsify rebuilds the sub-sidebar on its own schedule: filter again (once per frame at
        // most) when it does. Filtering's own removals trigger one more pass, which finds nothing.
        let frame = 0
        const observer = new MutationObserver(() => {
            if (frame) return
            frame = requestAnimationFrame(() => {
                frame = 0
                filterSidebar()
            })
        })

        hook.ready(function () {
            const sidebarNav = document.querySelector('.sidebar-nav')
            if (sidebarNav) observer.observe(sidebarNav, { childList: true, subtree: true })
        })

        hook.doneEach(filterSidebar)
    }

    window.DocsifyUtils.registerPlugin(docsifySidebarFilter, false)
})()
