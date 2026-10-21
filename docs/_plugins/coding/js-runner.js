/**
 * docsify-js-runner.js - Makes ```js run blocks editable and runnable in the browser.
 * Code runs in a throwaway Web Worker, so no external service or library is needed,
 * the page can't be touched by the code, and infinite loops are stopped by a timeout.
 *
 * Usage in markdown:
 *   ```js run
 *   console.log("Hello, world!")
 *   ```
 *
 * Features:
 *   - ```js run and ```javascript run fences
 *   - Editable CodeMirror editor (falls back to a plain code block)
 *   - console.log / info / warn / error output, plus uncaught errors
 *   - Top-level await supported
 *   - 5 second timeout for runaway code
 */

(function () {
    const RUNNER_CLASS = 'js-run'
    const TIMEOUT_MS = 5000

    // Runs inside the worker. Streams console output back as messages.
    const WORKER_SOURCE = `
        const send = (type, text) => postMessage({ type, text })
        const show = value => {
            if (typeof value === 'string') return value
            if (value instanceof Error) return value.stack || String(value)
            try { return JSON.stringify(value, null, 2) ?? String(value) }
            catch { return String(value) }
        }
        const makeLogger = type => (...args) => send(type, args.map(show).join(' '))
        console.log = makeLogger('log')
        console.info = makeLogger('log')
        console.warn = makeLogger('warn')
        console.error = makeLogger('error')

        onmessage = async event => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            try {
                await new AsyncFunction(event.data)()
            } catch (error) {
                send('error', error instanceof Error ? error.name + ': ' + error.message : String(error))
            }
            postMessage({ type: 'done' })
        }
    `

    function createWorker() {
        const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }))
        const worker = new Worker(url)
        URL.revokeObjectURL(url)
        return worker
    }

    function appendLine(outputCode, type, text) {
        const line = document.createElement('span')
        line.className = `js-run-line js-run-${type}`
        line.textContent = text + '\n'
        outputCode.appendChild(line)
    }

    // Runs code, streaming lines to the callbacks. Returns a function that cancels the run.
    function runCode(code, { onLine, onFinish }) {
        const worker = createWorker()
        let isFinished = false

        const finish = message => {
            if (isFinished) return
            isFinished = true
            clearTimeout(timer)
            worker.terminate()
            if (message) onLine('error', message)
            onFinish()
        }

        const timer = setTimeout(() => finish(`Stopped: code ran for more than ${TIMEOUT_MS / 1000} seconds`), TIMEOUT_MS)

        worker.onmessage = ({ data }) => data.type === 'done' ? finish() : onLine(data.type, data.text)
        worker.onerror = event => {
            event.preventDefault()
            finish(event.message)
        }
        worker.postMessage(code)

        return () => finish()
    }

    function createEditor(container, pre, code) {
        if (!window.CodeMirror) return () => code.textContent

        const original = code.textContent.replace(/\n$/, '')
        const editor = CodeMirror(editorEl => pre.parentNode.insertBefore(editorEl, pre), {
            value: original,
            mode: 'javascript',
            theme: 'material-darker',
            lineNumbers: false,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit:        4,
            tabSize:           4,
            indentWithTabs: false,
            viewportMargin: Infinity,
            styleActiveLine: true,
        })
        pre.style.display = 'none'

        window.DocsifyPersist?.bindEditor(editor, { el: container, type: 'js', original })
        return () => editor.getValue()
    }

    function buildControls() {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'js-run-button'
        button.textContent = 'Run'

        const output = document.createElement('div')
        output.className = 'js-run-output'
        output.hidden = true
        output.innerHTML = '<pre><code></code></pre>'

        return { button, output, outputCode: output.querySelector('code') }
    }

    function initJsRunnerBlock(container) {
        const pre = container.querySelector('pre')
        const code = pre?.querySelector('code')
        if (!code) return

        const getCode = createEditor(container, pre, code)
        const { button, output, outputCode } = buildControls()
        container.append(button, output)

        let cancelRun = null

        const stopRun = () => {
            cancelRun?.()
            cancelRun = null
            button.disabled = false
            button.textContent = 'Run'
        }

        button.addEventListener('click', () => {
            if (cancelRun) return stopRun()

            outputCode.textContent = ''
            output.hidden = false
            button.textContent = 'Stop'
            cancelRun = runCode(getCode(), {
                onLine: (type, text) => appendLine(outputCode, type, text),
                onFinish: () => {
                    cancelRun = null
                    button.textContent = 'Run'
                    if (!outputCode.textContent) output.hidden = true
                },
            })
        })
    }

    function initJsRunnerBlocks(root = document) {
        window.DocsifyUtils.processBlocks('js-run', initJsRunnerBlock, {
            root,
            selector: `.${RUNNER_CLASS}`,
            processedClass: 'js-run-processed',
        })
    }

    const docsifyJsRunner = function (hook) {
        hook.beforeEach(function (content) {
            return content.replace(
                /^([ \t]*)```(?:js|javascript)\s+run[ \t]*\r?\n([\s\S]*?)^\1```[ \t]*\r?$/gm,
                (match, indent, body) => {
                    const codeLines = body.replace(/\r?\n$/, '').split(/\r?\n/)
                    const indentedBody = codeLines
                        .map(line => {
                            const codeLine = line.startsWith(indent) ? line.slice(indent.length) : line
                            return codeLine ? `${indent}${codeLine}` : ''
                        })
                        .join('\n')

                    return `${indent}<div class="${RUNNER_CLASS}">\n\n${indent}\`\`\`js\n${indentedBody}\n${indent}\`\`\`\n\n${indent}</div>`
                }
            )
        })

        hook.doneEach(function () {
            initJsRunnerBlocks(document)
        })
    }

    window.docsifyJsRunner = window.docsifyJsRunner || {}
    window.docsifyJsRunner.init = initJsRunnerBlocks

    window.DocsifyUtils.registerPlugin(docsifyJsRunner)
})()
