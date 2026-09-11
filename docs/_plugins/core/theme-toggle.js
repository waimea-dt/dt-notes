/**
 * docsify-theme-toggle.js - Light/dark theme toggle button in the sidebar.
 *
 * Toggles a data-theme="light"|"dark" attribute on <html>; theme.css does the
 * actual colour swapping. The choice is persisted in localStorage. The initial
 * theme is applied by a small inline script in index.html <head> (runs before
 * this file loads) so there is no flash of the wrong theme on page load.
 *
 * Usage in markdown:
 *   No markdown syntax. Lifecycle plugin only.
 */
(function () {
    const STORAGE_KEY = 'theme'
    // Icon shown represents the theme a click will switch *to*, not the current one.
    const ICONS = { dark: 'sun', light: 'moon' }
    const LUCIDE_ATTRS = { attrs: { class: ['icon', 'no-zoom'], 'stroke-width': 2, stroke: 'currentColor' } }

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem(STORAGE_KEY, theme)

        const icon = document.getElementById('theme-toggle-icon')
        if (icon) icon.setAttribute('data-lucide', ICONS[theme])

        window.lucide?.createIcons(LUCIDE_ATTRS)
        window.dispatchEvent(new CustomEvent('docsify-theme-change', { detail: { theme } }))
    }

    function insertToggleButton() {
        if (document.getElementById('theme-toggle-button')) return

        const sidebar = document.querySelector('.sidebar')
        if (!sidebar) return

        const button = document.createElement('button')
        button.type = 'button'
        button.id = 'theme-toggle-button'
        button.className = 'theme-toggle-button'
        button.setAttribute('aria-label', 'Toggle light / dark theme')
        button.innerHTML = `<i id="theme-toggle-icon" data-lucide="${ICONS[getTheme()]}"></i>`

        button.addEventListener('click', () => {
            applyTheme(getTheme() === 'dark' ? 'light' : 'dark')
        })

        sidebar.appendChild(button)
        window.lucide?.createIcons(LUCIDE_ATTRS)
    }

    const docsifyThemeToggle = function (hook) {
        hook.mounted(function () {
            insertToggleButton()
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyThemeToggle)
})()
