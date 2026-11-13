/**
 * docsify-callouts.js - Enhances Docsify callout blocks with icon + title rows.
 *
 * Docsify route caching can occasionally return plain blockquotes instead of
 * .callout nodes. This plugin restores missing callout classes from the page's
 * markdown (captured in beforeEach, so no extra download) and then injects a
 * consistent title row.
 */
(function () {
    const CALLOUT_TITLE_CLASS = 'callout-title'

    const ICONS = {
        NOTE: 'info',
        TIP: 'lightbulb',
        QUESTION: 'circle-help',
        EXAMPLE: 'pointer',
        IMPORTANT: 'circle-alert',
        WARNING: 'triangle-alert',
        ATTENTION: 'bell-ring',
        DANGER: 'skull',
    }

    const LABELS = {
        NOTE: 'Note',
        TIP: 'Tip',
        QUESTION: 'Question',
        EXAMPLE: 'Example',
        IMPORTANT: 'Important',
        WARNING: 'Warning',
        ATTENTION: 'Attention',
        DANGER: 'Danger',
    }

    const TYPES = Object.keys(ICONS)
    const MARKER_LINE_RE = new RegExp(`^\\s*>\\s*\\[!(${TYPES.join('|')})\\]\\s*$`, 'i')
    // Callout markers from the current page's markdown, captured in beforeEach
    let pageCallouts = []

    const { resolveScope } = window.DocsifyUtils

    function normalizeText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim()
    }

    function normalizeMarkdownInline(value) {
        return normalizeText(String(value || '')
            .replace(/`([^`]+)`\([a-z0-9-]+\)/gi, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/_([^_]+)_/g, '$1'))
    }

    function extractSourceCallouts(markdown) {
        const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n')
        const callouts = []

        for (let index = 0; index < lines.length; index += 1) {
            const marker = lines[index].match(MARKER_LINE_RE)
            if (!marker) continue

            const type = marker[1].toUpperCase()
            const body = []

            index += 1
            while (index < lines.length && /^\s*>/.test(lines[index])) {
                body.push(lines[index].replace(/^\s*>\s?/, ''))
                index += 1
            }
            index -= 1

            const text = normalizeMarkdownInline(body.join(' '))
            if (text) callouts.push({ type, text })
        }

        return callouts
    }

    function recoverPlainBlockquotes(root, sourceCallouts) {
        if (!sourceCallouts.length) return

        const scope = resolveScope(root)
        const selector = scope === document
            ? '.markdown-section blockquote:not(.callout)'
            : 'blockquote:not(.callout)'
        const remaining = sourceCallouts.slice()

        scope.querySelectorAll(selector).forEach(function (blockquote) {
            const text = normalizeText(blockquote.textContent)
            if (!text) return

            const matchIndex = remaining.findIndex(function (entry) {
                return text === entry.text || text.startsWith(entry.text) || entry.text.startsWith(text)
            })

            if (matchIndex === -1) return

            const match = remaining.splice(matchIndex, 1)[0]
            blockquote.classList.add('callout', match.type.toLowerCase())
        })
    }

    function addTitles(root) {
        const scope = resolveScope(root)
        const selector = scope === document ? '.markdown-section .callout' : '.callout'

        scope.querySelectorAll(selector).forEach(function (callout) {
            const firstChild = callout.firstElementChild
            if (firstChild && firstChild.classList.contains(CALLOUT_TITLE_CLASS)) return

            const type = TYPES.find(t => callout.classList.contains(t.toLowerCase()))
            if (!type) return

            const title = document.createElement('p')
            title.className = CALLOUT_TITLE_CLASS

            const icon = document.createElement('i')
            icon.setAttribute('data-lucide', ICONS[type])

            title.appendChild(icon)
            title.appendChild(document.createTextNode(LABELS[type]))
            callout.prepend(title)
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

    function runCalloutPass(root) {
        recoverPlainBlockquotes(root || document, pageCallouts)
        addTitles(root)
    }

    const docsifyCallouts = function (hook) {
        hook.beforeEach(function (content) {
            pageCallouts = extractSourceCallouts(content)
            return content
        })

        hook.doneEach(function () {
            runCalloutPass(document)
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyCallouts)
})()
