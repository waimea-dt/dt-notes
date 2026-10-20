/**
 * docsify-form-fields.js - Single-tag shortcuts for common answer fields.
 *
 * Usage in markdown (no closing tag needed, `<tag/>` and `<tag></tag>` also work):
 *   <response>                          -> <textarea class="response" placeholder="Your answer..."></textarea>
 *   <response placeholder="Explain">    -> custom placeholder
 *   <value>                             -> <input class="value">
 *   <check>                             -> <input type="checkbox">
 *   <check checked>                     -> <input type="checkbox" checked>
 *
 * Tags inside code blocks / inline code are left alone (they are escaped by then).
 */

(function () {
    const { escapeHtml } = window.DocsifyUtils
    const DEFAULT_PLACEHOLDER = 'Your answer...'

    const FIELDS = {
        response: attrs => `<textarea class="response" placeholder="${escapeHtml(attrs.placeholder ?? DEFAULT_PLACEHOLDER)}"></textarea>`,
        value: () => '<input class="value">',
        check: attrs => `<input type="checkbox"${'checked' in attrs ? ' checked' : ''}>`
    }

    const TAG_PATTERN = new RegExp(`<(${Object.keys(FIELDS).join('|')})((?:\\s(?:"[^"]*"|'[^']*'|[^>"'])*?)?)\\s*\\/?>(?:\\s*<\\/\\1>)?`, 'g')
    const ATTR_PATTERN = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g

    function parseAttrs(text) {
        const attrs = {}
        for (const [, name, dq, sq, bare] of text.matchAll(ATTR_PATTERN)) {
            attrs[name.toLowerCase()] = dq ?? sq ?? bare ?? ''
        }
        return attrs
    }

    function replaceFields(html) {
        return html.replace(TAG_PATTERN, (_, tag, attrText) => FIELDS[tag](parseAttrs(attrText)))
    }

    const docsifyFormFields = function (hook) {
        hook.afterEach(replaceFields)
    }

    window.DocsifyUtils.registerPlugin(docsifyFormFields)
})()
