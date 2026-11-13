/**
 * mermaid.js - Renders ```mermaid``` blocks as diagrams and keeps them in sync with the
 * site's light/dark toggle.
 *
 * Replaces the third-party docsify-mermaid plugin, whose mermaid.run() promise rejected
 * (uncaught) when a student left the page mid-render. Here each diagram is rendered on
 * its own, results for elements no longer on the page are ignored, and a diagram with
 * a syntax error shows a message in place of the diagram.
 *
 * Mermaid itself is loaded on demand: only pages that contain a diagram download it.
 *
 * Usage in markdown:
 *   ```mermaid
 *   flowchart LR
 *       A --> B
 *   ```
 */
(function () {
    const MERMAID_URL = 'https://unpkg.com/mermaid@11.0.2/dist/mermaid.esm.min.mjs'
    const MERMAID_THEME = { dark: 'dark', light: 'default' }

    const { getTheme, renderErrorBox, registerPlugin } = window.DocsifyUtils

    // Diagram source per element, kept so diagrams can be redrawn when the theme changes
    const sources = new WeakMap()
    let mermaidPromise = null
    let renderCount = 0

    function loadMermaid() {
        if (!mermaidPromise) {
            mermaidPromise = import(MERMAID_URL)
                .then(module => module.default)
                .catch(error => {
                    mermaidPromise = null // allow a retry on the next page visit
                    throw error
                })
        }
        return mermaidPromise
    }

    function configure(mermaid) {
        mermaid.initialize({
            startOnLoad: false,
            theme: MERMAID_THEME[getTheme() === 'light' ? 'light' : 'dark'],
            themeVariables: { fontSize: '18px', fontFamily: 'system-ui, sans-serif' },
        })
    }

    async function renderDiagram(mermaid, el) {
        const id = `mermaid-svg-${++renderCount}`
        try {
            const { svg, bindFunctions } = await mermaid.render(id, sources.get(el))
            if (!el.isConnected) return // page changed while rendering
            el.innerHTML = svg
            bindFunctions?.(el)
        } catch (error) {
            // Mermaid leaves its scratch element in the body when rendering fails
            document.getElementById(`d${id}`)?.remove()
            if (!el.isConnected) return
            renderErrorBox(el, `Mermaid diagram error: ${error?.message || error}`, 'plugin-error mermaid-error')
        }
    }

    async function renderAll(diagrams) {
        if (!diagrams.length) return
        let mermaid
        try {
            mermaid = await loadMermaid()
        } catch (error) {
            console.error('Failed to load Mermaid', error)
            return
        }
        configure(mermaid)
        // One at a time - Mermaid's renderer shares global state between calls
        for (const el of diagrams) {
            if (el.isConnected) await renderDiagram(mermaid, el)
        }
    }

    function currentDiagrams() {
        return [...document.querySelectorAll('.markdown-section .mermaid')].filter(el => sources.has(el))
    }

    window.addEventListener('docsify-theme-change', () => renderAll(currentDiagrams()))

    const docsifyMermaid = function (hook) {
        // Turn ```mermaid``` code blocks into <div class="mermaid"> holding the source
        hook.afterEach(function (html) {
            if (!html.includes('data-lang="mermaid"')) return html
            const template = document.createElement('template')
            template.innerHTML = html
            template.content.querySelectorAll('pre[data-lang="mermaid"]').forEach(pre => {
                const div = document.createElement('div')
                div.className = 'mermaid'
                div.textContent = pre.textContent
                pre.replaceWith(div)
            })
            return template.innerHTML
        })

        hook.doneEach(function () {
            const diagrams = [...document.querySelectorAll('.markdown-section .mermaid')].filter(el => !sources.has(el))
            diagrams.forEach(el => sources.set(el, el.textContent.trim()))
            renderAll(diagrams)
        })
    }

    registerPlugin(docsifyMermaid)
})()
