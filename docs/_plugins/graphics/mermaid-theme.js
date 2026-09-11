/**
 * docsify-mermaid-theme.js - Keeps Mermaid diagrams in sync with the site's light/dark toggle.
 *
 * docsify-mermaid replaces each ```mermaid``` block's DOM content with rendered SVG,
 * destroying the original source, so it's captured per page via hook.beforeEach and
 * used to regenerate diagrams when theme-toggle.js dispatches 'docsify-theme-change'.
 *
 * Usage in markdown:
 *   No markdown syntax. Lifecycle plugin only.
 */
(function () {
    const MERMAID_THEME = { dark: 'dark', light: 'default' }
    const MERMAID_SOURCE_PATTERN = /```mermaid\s*\n([\s\S]*?)```/g

    // Raw source for the current page's mermaid diagrams, captured from markdown
    // since docsify-mermaid replaces each block's DOM content with rendered SVG.
    let mermaidSources = []

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    }

    function reRenderMermaid() {
        if (!window.mermaid || mermaidSources.length === 0) return

        const theme = getTheme()
        window.mermaid.initialize({
            startOnLoad: false,
            theme: MERMAID_THEME[theme],
            themeVariables: { fontSize: '18px', fontFamily: 'system-ui, sans-serif' }
        })

        document.querySelectorAll('.mermaid').forEach((el, i) => {
            const source = mermaidSources[i]
            if (source == null) return

            window.mermaid.render(`mermaid-svg-${Date.now()}-${i}`, source)
                .then(({ svg }) => { el.innerHTML = svg })
                .catch(() => {})
        })
    }

    window.addEventListener('docsify-theme-change', reRenderMermaid)

    const docsifyMermaidTheme = function (hook) {
        hook.beforeEach(function (content, next) {
            mermaidSources = []
            let match
            while ((match = MERMAID_SOURCE_PATTERN.exec(content)) !== null) {
                mermaidSources.push(match[1].trim())
            }
            next(content)
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyMermaidTheme)
})()
