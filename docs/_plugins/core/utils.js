/**
 * utils.js - Shared utility library for all Docsify plugins
 *
 * Provides small helper functions that would otherwise be copy-pasted across
 * multiple plugin files. Load this before any other plugin script.
 *
 * Access via window.DocsifyUtils (or destructure at the top of each plugin IIFE).
 *
 * Functions:
 *   escapeHtml(str)                     - Escape HTML special characters
 *   clamp(val, min, max)                - Clamp a number to a range
 *   rand(min, max)                       - Return a random number in a range
 *   randInt(min, max)                    - Return a random integer in [min, max)
 *   randomHex(length, segments, sep)    - Random uppercase hex string helper
 *   padDigits(digits, blockSize)        - Left pad digit string to block size
 *   isAbsoluteUrl(path)                 - Check if URL is absolute/data URI
 *   resolveSourcePath(src)              - Resolve docs-root relative source path
 *   isSvgImage(img)                     - Detect IMG nodes that point to SVG
 *   createLucideIcons(options)          - Render Lucide icon placeholders
 *   hexToRgb(hex)                       - Convert #RRGGBB to {r,g,b}
 *   rgbToHex(r,g,b)                     - Convert RGB channels to #RRGGBB
 *   extractMarker(text, marker)         - Remove marker prefix and report match
 *   extractTrailingMarker(text, marker) - Remove marker suffix and report match
 *   renderErrorBox(container, msg, cls) - Render a standard inline error box
 *   processBlocks(lang, fn, options)    - Iterate docsify language blocks safely
 *   processVisualBlocks(lang, fn, opts) - Process visual blocks with mode flags
 *   randomItem(arr)                     - Return a random item from an array
 *   createShuffledIndexes(length)       - Create shuffled indexes for a range
 *   shuffleArray(arr)                   - Fisher-Yates shuffle (returns new array)
 *   sleep(ms)                           - Promise that resolves after ms milliseconds
 *   getTheme(defaultTheme)              - Read the current site theme
 *   setTheme(theme, defaultTheme)       - Set the document theme attribute
 *   persistTheme(theme, key)             - Store the selected theme
 *   themeIcons                          - Lucide icons used by theme toggle
 *   setThemeIcon(theme, icon)            - Register an icon for a theme
 *   updateThemeToggleIcon(theme)         - Update and render the theme icon
 *   dispatchThemeChange(theme)           - Notify plugins of a theme change
 *   applyTheme(theme, options)           - Set, persist, and broadcast a theme
 *   parseBoolean(value, fallback)       - Parse 'true'/'false' attribute string
 *   parsePositiveInt(value, fallback)   - Parse a positive integer attribute string
 *   generateId(prefix)                  - Generate a short random ID
 *   dispatchSlidesRendered(root)        - Dispatch shared slide-render event
 *   onSlidesRendered(callback)          - Listen for shared slide-render event
 *   registerPlugin(fn, prepend)         - Register a Docsify plugin function
 *   parseHeaderConfig(el, defaults)     - Parse header/title/sub-title attributes from a plugin element
 */
;(function () {
    'use strict'

    // -------------------------------------------------------------------------
    // HTML
    // -------------------------------------------------------------------------

    /**
     * Escape HTML special characters to prevent XSS when inserting untrusted
     * content into innerHTML.
     */
    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
    }

    // -------------------------------------------------------------------------
    // Numbers
    // -------------------------------------------------------------------------

    /**
     * Clamp `val` to the range [min, max] (inclusive).
     */
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max)
    }

    /**
     * Return a random number in the range [min, max).
     */
    function rand(min, max) {
        return (Math.random() * (max - min)) + min
    }

    /**
     * Return a random integer in the range [min, max).
     */
    function randInt(min, max) {
        return Math.floor(rand(min, max))
    }

    /**
     * Generate random uppercase hex characters.
     * @param {number} length - Characters per segment.
     * @param {number} segments - Number of segments to generate.
     * @param {string} separator - Separator inserted between segments.
     */
    function randomHex(length, segments = 1, separator = '') {
        const chars = 'ABCDEF0123456789'
        const segCount = Math.max(1, Number.isFinite(segments) ? Math.floor(segments) : 1)
        const segLen = Math.max(1, Number.isFinite(length) ? Math.floor(length) : 1)
        return Array.from({ length: segCount }, () =>
            Array.from({ length: segLen }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
        ).join(separator)
    }

    // -------------------------------------------------------------------------
    // Formatting
    // -------------------------------------------------------------------------

    /**
     * Left pad a digit string so its length is a multiple of blockSize.
     */
    function padDigits(digits, blockSize) {
        return String(digits).padStart(blockSize * Math.ceil(String(digits).length / blockSize), '0')
    }

    // -------------------------------------------------------------------------
    // URL and path
    // -------------------------------------------------------------------------

    /**
     * Check whether a path is an absolute URL or data URI.
     */
    function isAbsoluteUrl(path) {
        const value = String(path || '')
        return /^(https?:)?\/\//i.test(value) || value.startsWith('data:')
    }

    /**
     * Resolve source path relative to docs root unless already absolute.
     */
    function resolveSourcePath(src) {
        const clean = String(src || '').trim()
        if (!clean) return ''
        if (isAbsoluteUrl(clean)) return clean
        return clean.replace(/^\//, '')
    }

    // -------------------------------------------------------------------------
    // Media
    // -------------------------------------------------------------------------

    /**
     * Detect IMG elements that point to SVG resources.
     */
    function isSvgImage(img) {
        if (!img || img.tagName !== 'IMG') return false
        const src = (img.getAttribute('src') || '').toLowerCase()
        return src.endsWith('.svg') || src.startsWith('data:image/svg+xml')
    }

    // -------------------------------------------------------------------------
    // Icons
    // -------------------------------------------------------------------------

    /**
     * Render Lucide icon placeholders using the site's standard attributes.
     */
    function createLucideIcons(options = {}) {
        if (!window.lucide?.createIcons) return

        window.lucide.createIcons({
            attrs: {
                class: ['icon', 'no-zoom'],
                'stroke-width': 2,
                stroke: 'currentColor',
            },
            ...options,
        })
    }

    // -------------------------------------------------------------------------
    // Colours
    // -------------------------------------------------------------------------

    /**
     * Convert hex colour (#RRGGBB) to RGB channels.
     */
    function hexToRgb(hex) {
        const clean = String(hex || '').replace('#', '')
        return {
            r: parseInt(clean.substring(0, 2), 16),
            g: parseInt(clean.substring(2, 4), 16),
            b: parseInt(clean.substring(4, 6), 16)
        }
    }

    /**
     * Convert RGB channels to hex colour (#RRGGBB).
     */
    function rgbToHex(r, g, b) {
        const toHex = (n) => {
            const clamped = clamp(Math.round(n), 0, 255)
            const hex = clamped.toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }
        return '#' + toHex(r) + toHex(g) + toHex(b)
    }

    // -------------------------------------------------------------------------
    // Text markers
    // -------------------------------------------------------------------------

    /**
     * Remove marker prefix from text and report whether marker was found.
     */
    function extractMarker(text, marker = '!! ') {
        const value = String(text || '')
        const hasMarker = value.startsWith(marker)
        return {
            hasMarker,
            cleanText: hasMarker ? value.slice(marker.length) : value
        }
    }

    /**
     * Remove marker suffix from text and report whether marker was found.
     */
    function extractTrailingMarker(text, marker = '!!') {
        const value = String(text ?? '').trim()
        const hasMarker = value.endsWith(marker)
        return {
            hasMarker,
            cleanText: hasMarker ? value.slice(0, -marker.length).trim() : value
        }
    }

    // -------------------------------------------------------------------------
    // Error rendering
    // -------------------------------------------------------------------------

    /**
     * Clear container and render a simple error box.
     */
    function renderErrorBox(container, message, className = 'plugin-error') {
        if (!container) return null
        container.innerHTML = ''
        const error = document.createElement('div')
        error.className = className
        error.textContent = String(message || '')
        container.appendChild(error)
        return error
    }

    // -------------------------------------------------------------------------
    // Block processing
    // -------------------------------------------------------------------------

    /**
     * Process blocks for a language in an idempotent way.
     *
     * Defaults to docsify language blocks: pre[data-lang="{lang}"].
     *
     * @param {string} lang
     * @param {(el: Element) => void} fn
     * @param {{
     *   root?: ParentNode,
     *   selector?: string,
     *   processedClass?: string,
     *   markProcessed?: boolean
     * }} options
     * @returns {Element[]} processed elements
     */
    function processBlocks(lang, fn, options = {}) {
        const root = options.root || document
        const selector = options.selector || `pre[data-lang="${lang}"]`
        const markProcessed = options.markProcessed !== false
        const processedClass = options.processedClass || `${String(lang).replace(/[^a-z0-9-]+/gi, '-')}-processed`
        const query = markProcessed ? `${selector}:not(.${processedClass})` : selector
        const elements = Array.from(root.querySelectorAll(query))

        elements.forEach(el => {
            if (markProcessed) {
                el.classList.add(processedClass)
            }
            fn(el)
        })

        return elements
    }

    /**
     * Process visual blocks with explicit post-processing mode.
     *
     * Modes:
     *   - keep: keep source block unchanged
     *   - hide: hide source block after callback
     *   - replace: replace source block with callback result (Node or HTML string)
     *
     * @param {string} lang
     * @param {(el: Element) => (Node|string|void|null)} fn
     * @param {{
     *   mode?: 'keep'|'hide'|'replace',
     *   root?: ParentNode,
     *   selector?: string,
     *   processedClass?: string,
     *   markProcessed?: boolean
     * }} options
     * @returns {Element[]} processed elements
     */
    function processVisualBlocks(lang, fn, options = {}) {
        const mode = options.mode || 'keep'

        return processBlocks(lang, (el) => {
            const result = fn(el)

            if (mode === 'hide') {
                el.style.display = 'none'
                return
            }

            if (mode === 'replace' && result != null) {
                if (result instanceof Node) {
                    el.parentNode?.replaceChild(result, el)
                    return
                }

                if (typeof result === 'string') {
                    const wrapper = document.createElement('div')
                    wrapper.innerHTML = result
                    const replacement = wrapper.firstElementChild
                    if (replacement) {
                        el.parentNode?.replaceChild(replacement, el)
                    }
                }
            }
        }, options)
    }

    // -------------------------------------------------------------------------
    // Arrays
    // -------------------------------------------------------------------------

    /**
     * Return a random item from an array.
     */
    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)]
    }

    /**
     * Create a shuffled array of indexes from zero to `length - 1`.
     */
    function createShuffledIndexes(length) {
        return shuffleArray(Array.from({ length }, (_, index) => index))
    }

    /**
     * Fisher-Yates shuffle. Returns a new array; does not mutate the original.
     */
    function shuffleArray(array) {
        const copy = [...array]
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[copy[i], copy[j]] = [copy[j], copy[i]]
        }
        return copy
    }

    // -------------------------------------------------------------------------
    // Async
    // -------------------------------------------------------------------------

    /**
     * Return a Promise that resolves after `ms` milliseconds.
     */
    function sleep(ms = 0) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    // -------------------------------------------------------------------------
    // Theme
    // -------------------------------------------------------------------------

    const themeIcons = {
        dark: 'sun',
        light: 'moon',
        candy: 'party-popper',
        retro: 'square-terminal',
    }

    /**
     * Read the current site theme, defaulting to dark.
     */
    function getTheme(defaultTheme = 'dark') {
        const theme = document.documentElement.getAttribute('data-theme')?.trim()
        return theme || defaultTheme
    }

    /**
     * Set the site's theme attribute and return the normalised theme name.
     */
    function setTheme(theme, defaultTheme = 'dark') {
        const nextTheme = typeof theme === 'string' && theme.trim() ? theme.trim() : defaultTheme
        document.documentElement.setAttribute('data-theme', nextTheme)
        return nextTheme
    }

    /**
     * Persist the selected theme.
     */
    function persistTheme(theme, storageKey = 'theme') {
        localStorage.setItem(storageKey, theme)
    }

    /**
     * Register the Lucide icon used by the theme toggle for a theme.
     */
    function setThemeIcon(theme, icon) {
        if (typeof theme !== 'string' || !theme.trim()) return
        if (typeof icon !== 'string' || !icon.trim()) return
        themeIcons[theme.trim()] = icon.trim()
    }

    /**
     * Update and render the theme toggle icon, when the toggle exists.
     */
    function updateThemeToggleIcon(theme) {
        const icon = document.getElementById('theme-toggle-icon')
        if (!icon) return

        icon.setAttribute('data-lucide', themeIcons[theme] || themeIcons.dark)
        createLucideIcons()
    }

    /**
     * Notify plugins that the site theme changed.
     */
    function dispatchThemeChange(theme, eventName = 'docsify-theme-change') {
        window.dispatchEvent(new CustomEvent(eventName, { detail: { theme } }))
    }

    /**
     * Set, persist, and broadcast a theme change.
     */
    function applyTheme(theme, options = {}) {
        if (theme == null) return
        const nextTheme = setTheme(theme)
        persistTheme(nextTheme, options.storageKey)
        updateThemeToggleIcon(nextTheme)
        dispatchThemeChange(nextTheme, options.eventName)
        return nextTheme
    }

    // -------------------------------------------------------------------------
    // Attribute parsing
    // -------------------------------------------------------------------------

    /**
     * Parse a boolean-valued HTML attribute string.
     * 'true' → true, 'false' → false, null/missing → fallback.
     */
    function parseBoolean(value, fallback = true) {
        if (value == null) return fallback
        if (value === 'true') return true
        if (value === 'false') return false
        return fallback
    }

    /**
     * Parse a positive integer attribute string with a fallback.
     * Returns fallback if the string is missing, non-numeric, or ≤ 0.
     */
    function parsePositiveInt(value, fallback) {
        const parsed = parseInt(value ?? '', 10)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
    }

    /**
     * Parse header configuration from a plugin element's attributes.
     * Reads: header (bool), title (string or null), sub-title / subtitle (string or null).
     * Removes the 'title' attribute from the element when present to avoid browser tooltips.
     *
     * @param {Element} el
     * @param {{ show?: boolean }} defaults
     * @returns {{ show: boolean, title: string|null, subtitle: string|null }}
     */
    function parseHeaderConfig(el, defaults = {}) {
        const show = parseBoolean(el.getAttribute('header'), defaults.show !== false)
        const title = el.getAttribute('title') ?? null
        const subtitle = el.getAttribute('sub-title') ?? el.getAttribute('subtitle') ?? null
        if (title != null) el.removeAttribute('title')
        return { show, title, subtitle }
    }

    // -------------------------------------------------------------------------
    // ID generation
    // -------------------------------------------------------------------------

    /**
     * Generate a short random ID, e.g. "my-widget-k7f2x9abc".
     */
    function generateId(prefix = 'id') {
        return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
    }

    // -------------------------------------------------------------------------
    // Slide event helpers
    // -------------------------------------------------------------------------

    /**
     * Dispatch the shared slide-rendered event with the owning deck root.
     */
    function dispatchSlidesRendered(root) {
        document.dispatchEvent(new CustomEvent('docsify-slides:rendered', {
            detail: { root }
        }))
    }

    /**
     * Listen for the shared slide-rendered event.
     * Returns an unsubscribe function.
     */
    function onSlidesRendered(callback) {
        const handler = function (event) {
            callback(event?.detail?.root || document, event)
        }

        document.addEventListener('docsify-slides:rendered', handler)

        return function unsubscribe() {
            document.removeEventListener('docsify-slides:rendered', handler)
        }
    }

    // -------------------------------------------------------------------------
    // Plugin registration
    // -------------------------------------------------------------------------

    /**
     * Register a Docsify plugin function.
     *
     * @param {Function} fn       - The plugin function (receives hook, vm).
     * @param {boolean}  prepend  - If true (default), run before existing plugins.
     *                              If false, run after (append to the end).
     */
    function registerPlugin(fn, prepend = true) {
        const plugins = window.$docsify.plugins || []
        window.$docsify.plugins = prepend ? [fn, ...plugins] : [...plugins, fn]
    }

    // -------------------------------------------------------------------------
    // Export
    // -------------------------------------------------------------------------

    const docsifyUtils = Object.freeze({
        escapeHtml,
        clamp,
        rand,
        randInt,
        randomHex,
        padDigits,
        isAbsoluteUrl,
        resolveSourcePath,
        isSvgImage,
        createLucideIcons,
        hexToRgb,
        rgbToHex,
        extractMarker,
        extractTrailingMarker,
        renderErrorBox,
        processBlocks,
        processVisualBlocks,
        randomItem,
        createShuffledIndexes,
        shuffleArray,
        sleep,
        getTheme,
        setTheme,
        persistTheme,
        themeIcons,
        setThemeIcon,
        updateThemeToggleIcon,
        dispatchThemeChange,
        applyTheme,
        parseBoolean,
        parsePositiveInt,
        generateId,
        dispatchSlidesRendered,
        onSlidesRendered,
        registerPlugin,
        parseHeaderConfig,
    })

    window.DocsifyUtils = docsifyUtils
})()
