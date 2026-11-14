/**
 * coming-soon.js - Marks a page (or section) that hasn't been written yet.
 *
 * Usage in markdown:
 *   <coming-soon></coming-soon>
 *
 *   <coming-soon>Notes for this topic will be added in Term 2.</coming-soon>
 *
 * Renders a "Coming soon" box with a construction icon. Text inside the tag
 * replaces the default message. Delete the tag once the page has content.
 */
(function () {
    const DEFAULT_MESSAGE = "We're still building this page - check back soon!"

    const { escapeHtml, registerPlugin } = window.DocsifyUtils

    function render(message) {
        return `<div class="coming-soon" role="note">
            <i data-lucide="construction"></i>
            <p class="coming-soon-title">Under Construction - Coming Soon!</p>
            <p class="coming-soon-message">${message || escapeHtml(DEFAULT_MESSAGE)}</p>
        </div>`
    }

    const docsifyComingSoon = function (hook) {
        hook.afterEach(function (html) {
            if (!html.includes('<coming-soon')) return html
            return html.replace(/<coming-soon>([\s\S]*?)<\/coming-soon>/g, (_, text) => render(text.trim()))
        })
    }

    registerPlugin(docsifyComingSoon)
})()
