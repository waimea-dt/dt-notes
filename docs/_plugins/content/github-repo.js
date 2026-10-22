/**
 * github-repo.js - Converts <github> tags into GitHub repository link panels.
 *
 * Usage in markdown:
 *   <github repo="waimea-dt/kaplay-starter" title="Kaplay Starter" subtitle="A starter project to kick off your Kaplay games">
 *
 * Attributes:
 *   repo     - owner/name of the repository (required)
 *   title    - heading text (defaults to the repo name)
 *   subtitle - description text (optional)
 *
 * No closing tag needed!
 *
 * Becomes:
 *   <div class="github-repo">
 *     <a href="https://github.com/REPO" target="_blank" rel="noopener">
 *       <h4>TITLE</h4>
 *       <p>SUBTITLE</p>
 *     </a>
 *   </div>
 */

;(function () {
    'use strict'

    const GITHUB_URL = 'https://github.com/'

    function resolveScope(root) {
        return root && typeof root.querySelectorAll === 'function' ? root : document
    }

    function buildPanel(tag) {
        const repo = (tag.getAttribute('repo') || '').trim()
        if (!repo) return null

        const title = tag.getAttribute('title') || repo.split('/').pop()
        const subtitle = tag.getAttribute('subtitle')

        const panel = document.createElement('div')
        panel.className = 'github-repo'

        const link = document.createElement('a')
        link.href = GITHUB_URL + repo
        link.target = '_blank'
        link.rel = 'noopener'

        const heading = document.createElement('h4')
        heading.textContent = title
        link.appendChild(heading)

        if (subtitle) {
            const text = document.createElement('p')
            text.textContent = subtitle
            link.appendChild(text)
        }

        panel.appendChild(link)
        return panel
    }

    function processGithubTags(root) {
        const scope = resolveScope(root)
        const selector = scope === document ? '.markdown-section github' : 'github'

        scope.querySelectorAll(selector).forEach(tag => {
            const panel = buildPanel(tag)
            if (panel) tag.replaceWith(panel)
        })
    }

    const docsifyGithubRepo = function (hook) {
        hook.afterEach(html => window.DocsifyUtils.closeSingleTags(html, 'github'))
        hook.doneEach(() => processGithubTags())
    }

    window.DocsifyUtils.registerPlugin(docsifyGithubRepo)
})()
