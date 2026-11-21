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
 * Inline (within text), via inline-highlight.js:
 *   Use `when flag clicked`(scratch) for inline blocks.
 *
 * The scratchblocks library is loaded on demand, only on pages that contain Scratch blocks.
 *
 * Every drawing is zebra-striped, like Scratch Addons: a block is drawn in a richer, deeper
 * colour (.sb3-zebra) unless it's straight inside such a block of its own colour (in a C block's
 * mouth or an input), so nested blocks of one colour alternate, deeper outside. The library is set up for this once (DocsifyScratchBlocks.setUp), which the
 * animation plugin's Scratch scripts use too (anim-core.js: SCRIPTS).
 */

;(function () {

    // -------------------------------------------------------------------------
    // Library Setup (shared with the animation plugin)
    // -------------------------------------------------------------------------

    // Once, when scratchblocks has loaded: its styles; its blocks keep the element each draws (el),
    // so a block can be found in a drawing (its views keep only sizes); and every drawing is
    // zebra-striped as it's made. Drawing is otherwise unchanged.
    let setUpDone = false

    function setUp(lib) {
        if (setUpDone) return
        setUpDone = true
        lib.appendStyles()
        const view = lib.newView(lib.parse('move (1) steps'), { style: 'scratch3' })
        const blockView = Object.getPrototypeOf(view.scripts[0].blocks[0])
        const draw = blockView.draw
        blockView.draw = function (...args) { return (this.el = draw.apply(this, args)) }
        const documentView = Object.getPrototypeOf(view)
        const render = documentView.render
        documentView.render = function (...args) {
            const svg = render.apply(this, args)
            this.scripts.forEach(script => stripeScript(script, null))
            return svg
        }
    }

    // A block is deeper unless the block it's straight inside (its C block, or the block whose
    // input it's in) has its colour and is deeper itself
    const ZEBRA_CLASS = 'sb3-zebra'

    function stripeScript(script, parent) {
        script.blocks.forEach(block => stripeBlock(block, parent))
    }

    function stripeBlock(block, parent) {
        block.zebra = !(parent && parent.zebra && parent.info.category === block.info.category)
        block.el?.firstElementChild?.classList.toggle(ZEBRA_CLASS, block.zebra)
        for (const child of block.children) {
            if (child.isBlock) stripeBlock(child, block)
            else if (child.blocks) stripeScript(child, block)
        }
    }

    // -------------------------------------------------------------------------
    // Main Processing Function
    // -------------------------------------------------------------------------

    const SCRATCH_SELECTOR = 'pre[data-lang="scratch"], pre[data-lang="scratch-inline"], code.language-scratch'

    function processScratchBlocks() {
        if (!document.querySelector(SCRATCH_SELECTOR)) return

        window.DocsifyUtils.loadLibrary('scratchblocks')
            .then(renderScratchBlocks)
            .catch(error => console.warn('scratchblocks library failed to load', error))
    }

    function renderScratchBlocks() {
        setUp(window.scratchblocks)

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

    window.DocsifyScratchBlocks = { setUp }

})()

