/**
 * docsify-theme-toggle.js - Light/dark theme toggle button in the sidebar.
 *
 * Toggles the data-theme attribute on <html>; theme.css does the
 * actual colour swapping. The choice is persisted in localStorage. The initial
 * theme is applied by a small inline script in index.html <head> (runs before
 * this file loads) so there is no flash of the wrong theme on page load.
 *
 * Usage in markdown:
 *   No markdown syntax. Lifecycle plugin only.
 */
(function () {
    const { applyTheme, getTheme, updateThemeToggleIcon } = window.DocsifyUtils

    function insertToggleButton() {
        if (document.getElementById('theme-toggle-button')) return

        const sidebar = document.querySelector('.sidebar')
        if (!sidebar) return

        const button = document.createElement('button')
        button.type = 'button'
        button.id = 'theme-toggle-button'
        button.className = 'theme-toggle-button'
        button.setAttribute('aria-label', 'Toggle light / dark theme')
        button.innerHTML = '<i id="theme-toggle-icon"></i>'

        button.addEventListener('click', () => {
            applyTheme(getTheme() === 'dark' ? 'light' : 'dark')
        })

        sidebar.appendChild(button)
        updateThemeToggleIcon(getTheme())
    }

    const docsifyThemeToggle = function (hook) {
        hook.mounted(function () {
            insertToggleButton()
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyThemeToggle)
})()
