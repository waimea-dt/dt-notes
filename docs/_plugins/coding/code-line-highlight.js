/**
 * docsify-code-line-highlight.js - Adds Prism line highlights to fenced code blocks.
 *
 * Usage in markdown:
 *   ```js [2-3|5|10|1-99]
 *   console.log('hello')
 *   ```
 */

(function () {
    const MARKER_PREFIX = 'PRISMLINEHIGHLIGHT:'
    // Optional blockquote prefix (e.g. "> ") so fences inside callouts match
    const FENCE_REGEX = /^((?:[ \t]*>)*[ \t]*)```([^\s\[]+)\s+\[([^\]\n]+)\]\s*$/gm
    const MARKER_REGEX = new RegExp(
        `<p>${MARKER_PREFIX}([^<]+)</p>\\s*(<pre\\b[^>]*>[\\s\\S]*?<\\/pre>)`,
        'g'
    )

    function normalizeLineSpec(spec) {
        const normalized = spec
            .split('|')
            .map(part => part.trim())
            .filter(Boolean)
            .join(', ')

        return normalized
    }

    function applyLineHighlights(root = document) {
        const highlightLines = window.Prism?.plugins?.lineHighlight?.highlightLines
        if (typeof highlightLines !== 'function') return

        root.querySelectorAll('.markdown-section pre[data-line]').forEach(pre => {
            const mutateDom = highlightLines(pre)
            if (typeof mutateDom === 'function') mutateDom()
        })
    }

    const docsifyPrismLineHighlight = function (hook) {
        hook.beforeEach(function (content) {
            return content.replace(FENCE_REGEX, function (match, prefix, lang, rawSpec) {
                const lines = normalizeLineSpec(rawSpec)
                if (!lines) return match

                const blankLine = prefix.trimEnd()
                return `${prefix}${MARKER_PREFIX}${lines}\n${blankLine}\n${prefix}\`\`\`${lang}`
            })
        })

        hook.afterEach(function (html) {
            return html.replace(MARKER_REGEX, function (_, lines, preBlock) {
                if (/\bdata-line=/.test(preBlock)) return preBlock
                return preBlock.replace(/<pre\b/, `<pre data-line="${lines}"`)
            })
        })

        hook.doneEach(function () {
            applyLineHighlights(document)
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyPrismLineHighlight)
})()