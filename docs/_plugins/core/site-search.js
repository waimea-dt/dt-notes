/**
 * site-search.js - A search box inside the page (used on the 404 page).
 *
 * Usage in markdown:
 *   <site-search></site-search>
 *
 * Hands the query to the sidebar search (Docsify's search plugin), so results
 * appear in the sidebar. While the sidebar is visible results update as you
 * type; pressing Enter or the button also opens the sidebar on small screens.
 * On the 404 page the box starts filled in with words from the missing address.
 */
(function () {
    const { registerPlugin } = window.DocsifyUtils

    function sidebarSearchInput() {
        return document.querySelector('.sidebar .search input[type="search"]')
    }

    function sidebarHidden() {
        const sidebar = document.querySelector('.sidebar')
        return !sidebar || sidebar.getBoundingClientRect().right <= 0
    }

    function runSearch(query, { reveal }) {
        const input = sidebarSearchInput()
        if (!input) return
        input.value = query
        input.dispatchEvent(new Event('input', { bubbles: true }))
        if (reveal && sidebarHidden()) {
            document.querySelector('.sidebar-toggle-button, .sidebar-toggle')?.click()
        }
    }

    // "/web/css/flex-box" -> "flex box"
    function wordsFromPath(path) {
        const last = decodeURIComponent(path || '').replace(/\.md$/, '').replace(/\/+$/, '').split('/').pop() || ''
        return last.replace(/README$/i, '').replace(/[-_]+/g, ' ').trim()
    }

    function build(el, initial) {
        el.innerHTML = `<form class="site-search" role="search">
            <input type="search" placeholder="Search the notes..." aria-label="Search the notes">
            <button type="submit"><i data-lucide="search"></i> Search</button>
        </form>`
        const form = el.querySelector('form')
        const input = form.querySelector('input')
        input.value = initial
        input.addEventListener('input', () => {
            if (!sidebarHidden()) runSearch(input.value.trim(), { reveal: false })
        })
        form.addEventListener('submit', event => {
            event.preventDefault()
            runSearch(input.value.trim(), { reveal: true })
        })
    }

    const docsifySiteSearch = function (hook, vm) {
        hook.doneEach(function () {
            const boxes = document.querySelectorAll('.markdown-section site-search:not([data-ready])')
            if (!boxes.length) return
            const initial = document.querySelector('.markdown-section .not-found') ? wordsFromPath(vm.route.path) : ''
            boxes.forEach(el => {
                el.dataset.ready = ''
                build(el, initial)
            })
            window.DocsifyUtils.createLucideIcons()
        })
    }

    registerPlugin(docsifySiteSearch)
})()
