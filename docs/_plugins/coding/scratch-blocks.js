/**
 * docsify-scratch-blocks.js - Renders Scratch code blocks using the scratchblocks library.
 *
 * Usage in markdown:
 *   ```scratch
 *   when green flag clicked
 *   move (10) steps
 *   say [Hello!] for (2) seconds
 *   ```
 *
 *   ```scratch-inline
 *   when green flag clicked
 *   ```
 *
 * Inline (within text):
 *   Use `when flag clicked`{.language-scratch} for inline blocks.
 *
 * The scratchblocks library is loaded on demand, only on pages that contain Scratch blocks.
 */

;(function () {

    // -------------------------------------------------------------------------
    // Main Processing Function
    // -------------------------------------------------------------------------

    const SCRATCHBLOCKS_URL = 'https://cdn.jsdelivr.net/npm/scratchblocks@3.7.1/build/scratchblocks.min.js'
    const SCRATCH_SELECTOR = 'pre[data-lang="scratch"], pre[data-lang="scratch-inline"], code.language-scratch'

    function processScratchBlocks() {
        if (!document.querySelector(SCRATCH_SELECTOR)) return

        window.DocsifyUtils.loadScript(SCRATCHBLOCKS_URL)
            .then(renderScratchBlocks)
            .catch(error => console.warn('scratchblocks library failed to load', error))
    }

    function renderScratchBlocks() {
        // Render standard scratch blocks
        window.DocsifyUtils.processBlocks('scratch', () => {}, {
            processedClass: 'scratch-processed'
        })

        scratchblocks.renderMatching('pre[data-lang="scratch"]', {
            style: 'scratch3',
        })

        // Render scratch-inline blocks (block style but not inline)
        window.DocsifyUtils.processBlocks('scratch-inline', () => {}, {
            processedClass: 'scratch-processed'
        })

        scratchblocks.renderMatching('pre[data-lang="scratch-inline"]', {
            style: 'scratch3',
            inline: false,
        })

        // Render inline scratch blocks (within text)
        window.DocsifyUtils.processBlocks('scratch-inline-code', () => {}, {
            selector: 'code.language-scratch',
            processedClass: 'scratch-processed'
        })

        scratchblocks.renderMatching('code.language-scratch', {
            style: 'scratch3',
            inline: true,
        })
    }

    // -------------------------------------------------------------------------
    // Plugin Registration
    // -------------------------------------------------------------------------

    const docsifyScratchBlocks = function (hook) {
        hook.doneEach(function () {
            // Small delay to ensure DOM is ready
            setTimeout(processScratchBlocks, 50)
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyScratchBlocks)

})()

