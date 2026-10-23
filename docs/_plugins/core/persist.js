/**
 * persist.js - Saves user-edited answers and code in localStorage so they survive a page refresh.
 *
 * Exposes window.DocsifyPersist for other plugins:
 *   bindField(el, type)           - Persist a textarea / input / checkbox
 *   bindCustom({ el, type, original, read, write }) - Persist a widget with its own state;
 *                                   returns { save } to call after each change.
 *                                   Mark answer elements inside el with data-persist-answer
 *                                   to get the edited highlight outline.
 *   bindEditor(cm, options)       - Persist a CodeMirror editor
 *
 * bindEditor options: { el, type, sub, original, read, write }
 *   el       - Element used to locate the editor on the page (nearest prior heading + index)
 *   type     - Kind of editor, e.g. 'playground', 'python'
 *   sub      - Optional sub-key when one el holds several editors, e.g. 'html'
 *   original - Page version of the code (default: cm.getValue())
 *   read / write - Override how the value is read/written (default: cm.getValue / cm.setValue)
 *
 * Storage key: dtnotes:<route>:<heading-id>-<type>-<index>[-<sub>]
 *   e.g. dtnotes:courses-200dtd-kaplay-week1-lesson1:ghost-parade-playground-1-js
 *   <index> counts same-type elements since the nearest prior heading, so keys survive
 *   edits and additions elsewhere on the page.
 *
 * Behaviour:
 *   - Saved values only restore if the page version they were based on is unchanged.
 *   - Values equal to the page version are not stored.
 *   - Edited elements get the .persist-edited class.
 *   - Editors get a top-right "Reset code" button (with tooltip) when edited.
 *   - A "Clear Answers" button is added to the page when anything is tracked.
 */

(function () {
    const STORAGE_PREFIX = 'dtnotes:'
    const EDITED_CLASS = 'persist-edited'
    const HOST_CLASS = 'persist-host'
    const HEADING_SELECTOR = 'h1,h2,h3,h4,h5,h6'

    const CLEAR_BUTTON_CLASS = 'persist-clear-all'
    const RESET_BUTTON_CLASS = 'persist-reset-code'
    const CLEAR_BUTTON_TEXT  = 'Clear My Edits'
    const CLEAR_CONFIRM_TEXT = 'Clear all your saved answers, inputs and edited code on this page?'

    // Everything tracked on the current page, so "Clear Answers" can reset it live.
    const registry = new Set()

    const storage = (() => {
        try { return window.localStorage } catch { return null }
    })()

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    function readRecord(storageKey) {
        try { return JSON.parse(storage?.getItem(storageKey)) } catch { return null }
    }

    function writeRecord(storageKey, record) {
        try { storage?.setItem(storageKey, JSON.stringify(record)) } catch { /* quota or privacy mode */ }
    }

    function removeRecord(storageKey) {
        try { storage?.removeItem(storageKey) } catch { /* ignore */ }
    }

    function removeRecordsWithPrefix(prefix) {
        if (!storage) return
        try {
            Object.keys(storage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => storage.removeItem(key))
        } catch { /* ignore */ }
    }

    // -------------------------------------------------------------------------
    // Keys
    // -------------------------------------------------------------------------

    function slugify(text) {
        return String(text).trim().toLowerCase().replace(/\s+/g, '-')
    }

    // Short, stable fingerprint of the page version of a value (djb2)
    function hashValue(value) {
        const text = JSON.stringify(value)
        let hash = 5381
        for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0
        return (hash >>> 0).toString(36)
    }

    function getRouteKey() {
        const raw = location.hash.startsWith('#/') ? location.hash.slice(1) : location.pathname
        let path = raw.split('?')[0]
        try { path = decodeURIComponent(path) } catch { /* keep raw */ }
        return slugify(path.replace(/\.md$/i, '').replace(/^\/+|\/+$/g, '').replace(/\//g, '-')) || 'home'
    }

    // Nearest prior heading id, and 1-based index of el among same-type elements since that
    // heading. el must already carry data-persist-type so the walk below stops at it.
    function locate(el, type) {
        const root = el.closest('.markdown-section') ?? document
        let heading = 'top'
        let index = 0

        for (const node of root.querySelectorAll(`${HEADING_SELECTOR},[data-persist-type="${type}"]`)) {
            if (node === el) break
            if (node.matches(HEADING_SELECTOR)) {
                heading = node.id || slugify(node.textContent)
                index = 0
            } else {
                index++
            }
        }

        return { heading, index: index + 1 }
    }

    function buildKey(el, type, sub) {
        el.dataset.persistType = type
        const { heading, index } = locate(el, type)
        const parts = [heading, type, index, sub].filter(part => part !== undefined && part !== '')
        return `${STORAGE_PREFIX}${getRouteKey()}:${parts.join('-')}`
    }

    // -------------------------------------------------------------------------
    // Tracking
    // -------------------------------------------------------------------------

    function track({ el, type, sub, original, read, write, indicator = el }) {
        const storageKey = buildKey(el, type, sub)
        const base = hashValue(original)
        const isOriginal = value => JSON.stringify(value) === JSON.stringify(original)
        const markEdited = edited => {
            indicator.classList.toggle(EDITED_CLASS, edited)
            updateClearButton()
        }

        const saved = readRecord(storageKey)
        if (saved?.base === base && !isOriginal(saved.value)) {
            write(saved.value)
            markEdited(true)
        } else if (saved) {
            removeRecord(storageKey)
        }

        const save = () => {
            const value = read()
            if (isOriginal(value)) {
                removeRecord(storageKey)
                markEdited(false)
            } else {
                writeRecord(storageKey, { value, base })
                markEdited(true)
            }
        }

        const reset = () => {
            write(original)
            removeRecord(storageKey)
            markEdited(false)
        }

        registry.add({ indicator, reset })
        ensureClearButton(el)
        updateClearButton()

        return { save, reset }
    }

    function bindField(el, type) {
        if (el.dataset.persistBound) return
        el.dataset.persistBound = 'true'

        const isCheckbox = el.type === 'checkbox'
        const { save } = track({
            el,
            type,
            original: isCheckbox ? el.defaultChecked : el.defaultValue,
            read: () => isCheckbox ? el.checked : el.value,
            write: value => { isCheckbox ? (el.checked = value) : (el.value = value) },
        })

        el.addEventListener(isCheckbox ? 'change' : 'input', save)
    }

    function createResetButton(reset) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = RESET_BUTTON_CLASS
        button.dataset.tooltip = 'Reset code'
        button.setAttribute('aria-label', 'Reset code')
        button.innerHTML = '<i data-lucide="list-restart"></i>'
        button.addEventListener('click', reset)
        return button
    }

    function bindEditor(cm, { el, type, sub, original = cm.getValue(), read, write }) {
        const host = cm.getWrapperElement()
        if (host.dataset.persistBound) return
        host.dataset.persistBound = 'true'
        host.classList.add(HOST_CLASS)

        const { save, reset } = track({
            el,
            type,
            sub,
            original,
            indicator: host,
            read: read ?? (() => cm.getValue()),
            write: write ?? (value => {
                cm.setValue(value)
                cm.clearHistory()
            }),
        })

        cm.on('change', save)
        host.append(createResetButton(reset))
        window.DocsifyUtils?.createLucideIcons()
    }

    // -------------------------------------------------------------------------
    // Clear all
    // -------------------------------------------------------------------------

    function clearPage() {
        if (!window.confirm(CLEAR_CONFIRM_TEXT)) return

        removeRecordsWithPrefix(`${STORAGE_PREFIX}${getRouteKey()}:`)
        registry.forEach(entry => {
            if (entry.indicator.isConnected) entry.reset()
            else registry.delete(entry)
        })
    }

    // The button is only shown while something on the page is edited
    function updateClearButton() {
        const button = document.querySelector(`.${CLEAR_BUTTON_CLASS}`)
        if (!button) return
        button.hidden = ![...registry].some(entry =>
            entry.indicator.isConnected && entry.indicator.classList.contains(EDITED_CLASS))
    }

    function ensureClearButton(el) {
        const root = el.closest('.markdown-section')
        if (!root || root.querySelector(`:scope > .${CLEAR_BUTTON_CLASS}`)) return

        const button = document.createElement('button')
        button.type = 'button'
        button.className = CLEAR_BUTTON_CLASS
        button.hidden = true
        button.innerHTML = `<i data-lucide="list-restart"></i><span>${CLEAR_BUTTON_TEXT}</span>`
        button.addEventListener('click', clearPage)
        root.append(button)

        window.DocsifyUtils?.createLucideIcons()
    }

    // For widgets with their own state: returns { save } and calls write() to restore saved state.
    function bindCustom(options) {
        if (options.el.dataset.persistBound) return null
        options.el.dataset.persistBound = 'true'
        return track(options)
    }

    window.DocsifyPersist = Object.freeze({ bindField, bindEditor, bindCustom })
})()
