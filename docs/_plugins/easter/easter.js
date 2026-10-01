(function () {
    const SECRETS = {
        light: {
            name: 'Light Theme',
            locked: 'Switch to the light theme without the mouse',
            unlocked: 'You found the secret way to switch to the light theme',
            code: ['l', 'i', 'g', 'h', 't'],
            command: 'light',
            message: `Theme applied\nArrrrrrgh, my eyes!`,
            theme: 'light',
            effect: null,
            sound: 'ding.wav',
            icon: 'sun',
            callback: null,
            visible: true,
        },
        dark: {
            name: 'Dark Theme',
            locked: 'Switch to the dark theme without the mouse',
            unlocked: 'You found the secret way to switch to the dark theme',
            code: ['d', 'a', 'r', 'k'],
            command: 'dark',
            message: `Theme applied\nWelcome to the dark side!`,
            theme: 'dark',
            effect: null,
            sound: 'ding.wav',
            icon: 'moon',
            callback: null,
            visible: true,
        },
        candy: {
            name: 'Candy Theme',
            locked: `You'll ♥ this, if you can find it!`,
            unlocked: 'You found the secret candy theme',
            code: ['<', '3'],
            command: '<3',
            message: `Theme applied\nSo soft and squishy!`,
            theme: 'candy',
            effect: null,
            sound: 'tada.wav',
            icon: 'party-popper',
            callback: null,
            visible: true,
        },
        retro: {
            name: 'Retro Theme',
            locked: 'Only elite haxx0rs will find this',
            unlocked: 'You found the secret retro theme',
            code: ['1', '3', '3', '7'],
            command: '1337',
            message: `Theme applied\nWelcome to the 1980s!`,
            theme: 'retro',
            effect: null,
            sound: 'terminal.wav',
            icon: 'computer',
            callback: null,
            visible: true,
        },
        konami: {
            name: 'Mouse Trails',
            locked: `One for the gamer cheats...`,
            unlocked: 'You triggered the secret mouse trails',
            code: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
            command: 'konami',
            message: `Trails enabled!`,
            theme: null,
            effect: 'mouse-trails',
            sound: 'bonus.wav',
            icon: 'mouse-pointer-click',
            callback: null,
            visible: true,
        },
        matrix: {
            name: 'Red Pill',
            locked: `Do you want to know the truth, Neo?`,
            unlocked: 'You took the red pill and saw the Matrix',
            code: ['r', 'e', 'd', 'p', 'i', 'l', 'l'],
            command: 'redpill',
            message: `Fasten your seat belt, Dorothy, 'cause Kansas is going bye-bye`,
            theme: null,
            effect: 'matrix',
            sound: 'red-pill.wav',
            icon: 'pill',
            callback: null,
            visible: true,
        },
        life: {
            name: 'Meaning of Life',
            locked: `What's the answer to the question?`,
            unlocked: `You know the answer, but what's the question?!`,
            code: ['4', '2'],
            command: '42',
            message: `   ____   ___  _   _ _ _____  \n  |  _ \\ / _ \\| \\ | ( )_   _| \n  | | | | | | |  \\| |/  | |   \n  | |_| | |_| | |\\  |   | |   \n _|____/_\\___/|_|_\\_|_ _|_| _ \n|  _ \\ / \\  | \\ | |_ _/ ___| |\n| |_) / _ \\ |  \\| || | |   | |\n|  __/ ___ \\| |\\  || | |___|_|\n|_| /_/   \\_\\_| \\_|___\\____(_)\n\nAnd always have your towel with you!`,
            theme: null,
            effect: null,
            sound: '42.wav',
            icon: 'galaxy',
            callback: doShowAnswer,
            visible: true,
        },
        sudo: {
            name: 'Sudo',
            locked: `You're just a lowly user, for now...`,
            unlocked: 'You tried to gain elevated privileges',
            code: ['s', 'u', 'd', 'o'],
            command: 'sudo',
            message: `Nice try, but...\nYou're not in the sudo list!`,
            theme: null,
            effect: null,
            sound: 'error.wav',
            icon: 'square-terminal',
            callback: doDenied,
            visible: true,
        },
        spin: {
            name: 'Barrel Roll',
            locked: `Spin me right round...`,
            unlocked: 'You spun the page!',
            code: ['3', '6', '0'],
            command: '360',
            message: `Do a barrel roll!`,
            theme: null,
            effect: null,
            sound: 'swoosh.wav',
            icon: 'rotate-cw',
            callback: doSpin,
            visible: true,
        },
        gravity: {
            name: 'Anti-Gravity',
            locked: `It all feels so heavy`,
            unlocked: 'You turned off gravity!',
            code: ['f', 'l', 'o', 'a', 't'],
            command: 'float',
            message: `Light as a feather!`,
            theme: null,
            effect: null,
            sound: 'float.wav',
            icon: 'feather',
            callback: doGravity,
            visible: true,
        },
        reset: {
            name: 'Reset',
            locked: `Reset all your achieves`,
            unlocked: 'Reset everything!',
            code: ['r', 'e', 's', 'e', 't'],
            command: 'reset',
            message: `Reset everything!`,
            theme: null,
            effect: null,
            sound: 'reset.wav',
            icon: null,
            callback: resetAll,
            visible: false,
        },
    }

    const ACHIEVES_KEY = 'achievements'
    const EFFECTS_KEY = 'effects'
    const CONSOLE_KEY = 'console'

    const recentKeys = []
    const MAX_CODE_LENGTH = Math.max(...Object.values(SECRETS).map((secret) => secret.code.length))

    const TAPS_NEEDED = 5
    const MAX_TAP_GAP = 600

    const { applyTheme, getTheme } = window.DocsifyUtils

    function timedBodyClass(className, duration) {
        const body = document.querySelector('body')
        body.classList.add(className)
        setTimeout(() => { body.classList.remove(className) }, duration)
    }

    function resetAll() {
        localStorage.removeItem(ACHIEVES_KEY)
        localStorage.removeItem(EFFECTS_KEY)
        localStorage.removeItem(CONSOLE_KEY)
    }

    function doShowAnswer() {
        displayImage('42.webp', 11000)
    }

    function doDenied() {
        displayImage('denied.png', 2000)
    }

    function doSpin() {
        timedBodyClass('effect-spin-360', 2000)
    }

    function doGravity() {
        timedBodyClass('effect-antigravity', 8000)
    }

    function loadAchievements() {
        try { return JSON.parse(localStorage.getItem(ACHIEVES_KEY)) ?? [] }
        catch { return [] }
    }

    function loadEffects() {
        try { return JSON.parse(localStorage.getItem(EFFECTS_KEY)) ?? [] }
        catch { return [] }
    }

    function hasEffect(effect) {
        return loadEffects().includes(effect)
    }

    function dispatchEffectChange(effect, active) {
        window.dispatchEvent(new CustomEvent('docsify-effect-change', { detail: { effect, active } }))
    }

    function logAchievement(id, enabled) {
        const { name, message } = SECRETS[id]
        if (name && message) {
            console.log(`SECRET: ${name}\n------------------------------\n${enabled ? message : 'Cancelled'}`)
        }
    }

    function saveAchievement(id) {
        let achievements = loadAchievements()
        achievements = [...achievements, id]
        try { localStorage.setItem(ACHIEVES_KEY, JSON.stringify(achievements)) } catch {}
    }

    function saveEffect(id) {
        const { effect } = SECRETS[id]
        if (!effect) return
        let effects = loadEffects()
        effects = [...effects, effect]
        try { localStorage.setItem(EFFECTS_KEY, JSON.stringify(effects)) } catch {}
    }

    function clearEffect(id) {
        const { effect } = SECRETS[id]
        if (!effect) return
        let effects = loadEffects()
        effects = effects.filter(effectId => effectId !== effect)
        try { localStorage.setItem(EFFECTS_KEY, JSON.stringify(effects)) } catch {}
    }

    function handleEffect(id) {
        const { effect } = SECRETS[id]
        if (!effect) return false

        const effects = loadEffects()
        if (!effects.includes(effect)) {
            saveEffect(id)
            dispatchEffectChange(effect, true)
            return true
        }
        else {
            clearEffect(id)
            dispatchEffectChange(effect, false)
            return false
        }
    }

    function handleTheme(id) {
        const { theme } = SECRETS[id]
        if (!theme) return false

        const currentTheme = getTheme()
        if (theme !== currentTheme) {
            applyTheme(theme)
            return true
        }
        else {
            applyTheme('dark')
            return true
        }
    }

    function playSoundFile(filename) {
        if (!filename) return
        const audio = new Audio(`./_assets/sounds/${filename}`)
        audio.play()
    }

    function playSound(id) {
        const { sound } = SECRETS[id]
        if (!sound) return
        playSoundFile(sound)
    }

    function handleCallback(id) {
        const { callback } = SECRETS[id]
        if (!callback) return false
        callback(id)
        return true
    }

    function unlockConsole() {
        localStorage.setItem(CONSOLE_KEY, true)
        playSoundFile('fanfare.wav')
    }

    function consoleIsUnlocked() {
        return localStorage.getItem(CONSOLE_KEY)
    }

    function listenForTaps(element, onUnlock) {
        let tapCount = 0
        let resetTimer = null

        element.addEventListener('click', () => {
            if (consoleIsUnlocked()) return

            tapCount += 1
            element.dataset.taps = tapCount
            clearTimeout(resetTimer)

            if (tapCount >= TAPS_NEEDED) {
                tapCount = 0
                delete element.dataset.taps
                unlockConsole()
                showAchievements()
                return
            }

            resetTimer = setTimeout(() => {
                tapCount = 0
                delete element.dataset.taps
            }, MAX_TAP_GAP)
        })
    }

    function displayImage(filename, duration = 5000) {
        let imageWrapper = document.getElementById('image-overlay-wrapper')
        if (!imageWrapper) {
            imageWrapper = document.createElement('div')
            imageWrapper.id = 'image-overlay-wrapper'
        }
        else {
            imageWrapper.innerHTML = ''
        }
        const body = document.body
        body.append(imageWrapper)

        const image = document.createElement('img')
        image.src = `./_assets/eggs/${filename}`
        image.alt = 'Easter egg!'

        imageWrapper.append(image)

        setTimeout(() => {
            imageWrapper.remove()
        }, duration)
    }

    function showAchievements() {
        let achieveDiv = document.getElementById('achievements')
        if (achieveDiv) achieveDiv.remove()

        achieveDiv = document.createElement('div')
        achieveDiv.id = 'achievements'

        const achieveToggle = document.createElement('label')
        achieveToggle.className = 'achieve-toggle'
        achieveToggle.innerHTML = '<i data-lucide="trophy"></i>'
        listenForTaps(achieveToggle, null)

        const achievePanel = document.createElement('div')
        achievePanel.className = 'achieve-list'

        const achievements = loadAchievements()
        const numPossible = Object.values(SECRETS).filter(item => item.visible).length
        const numAchieved = achievements.length
        const achieveHeading = document.createElement('h4')
        achieveHeading.innerHTML = `
            Secrets Unlocked
            <span>(${numAchieved}/${numPossible})</span>
        `
        achievePanel.append(achieveHeading)

        if (localStorage.getItem(CONSOLE_KEY)) {
            const secretConsole = document.createElement('label')
            secretConsole.className = 'secret-console'

            secretConsoleInput = document.createElement('input')
            secretConsoleInput.placeholder = 'enter command'
            secretConsoleInput.autocapitalize = 'off'
            secretConsoleInput.autocomplete = 'off'
            secretConsoleInput.spellcheck = false

            secretConsoleInput.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter') return
                const match = matchSecretCode(secretConsoleInput.value)
                if (match)
                    handleSecretFound(match)
                else
                    playSoundFile('nope.wav')
                secretConsoleInput.value = ''
            })

            secretConsole.append(secretConsoleInput)
            achievePanel.append(secretConsole)
        }

        const achieveList = document.createElement('ul')
        let listHtml = ''

        for (const id in SECRETS) {
            const { icon, name, locked, unlocked, visible } = SECRETS[id]
            if (visible) {
                const achieved = achievements.includes(id)
                listHtml += `
                    <li
                        class="${achieved ? 'unlocked' : ''}"
                        title="${achieved ? unlocked : locked }"
                    >
                        <i data-lucide="${icon}"></i>
                        ${achieved ? name : 'Not discovered'}
                    </li>
                `
            }
        }
        achieveList.innerHTML = listHtml
        achievePanel.append(achieveList)

        achieveDiv.innerHTML = ''
        achieveDiv.append(achieveToggle)
        achieveDiv.append(achievePanel)

        const main = document.querySelector('.content')
        main.append(achieveDiv)

        window.DocsifyUtils.createLucideIcons()
    }

    function matchSecretCode(text) {
        const normalisedText = text.trim().toLowerCase()

        const match = Object.entries(SECRETS).find(([, secret]) => {
            const textCode = secret.command ?? secret.code.join('')
            return textCode.toLowerCase() === normalisedText
        })

        return match?.[0] ?? null
    }

    function handleSecretFound(id) {
        const achievements = loadAchievements()
        if (!achievements.includes(id)) saveAchievement(id)

        const { effect, theme, callback } = SECRETS[id]
        const noActions = !effect && !theme && !callback
        const effectApplied = handleEffect(id)
        const themeApplied = handleTheme(id)
        const callbackRan = handleCallback(id)

        showAchievements()

        if (noActions || effectApplied || themeApplied || callbackRan) {
            playSound(id)
            logAchievement(id, true)
        }
        else {
            logAchievement(id, false)
            playSoundFile('negative.wav')
        }
    }

    function isTypingInAField(event) {
        const tag = event.target.tagName
        return tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable
    }

    function endsWithCode(code) {
        const recent = recentKeys.slice(-code.length)
        return recent.length === code.length && recent.every((key, i) => key === code[i])
    }

    function setupSecretCodeListener() {
        window.addEventListener('keydown', (event) => {
            if (isTypingInAField(event)) return

            recentKeys.push(event.key.length === 1 ? event.key.toLowerCase() : event.key)
            if (recentKeys.length > MAX_CODE_LENGTH) recentKeys.shift()

            const foundId = Object.keys(SECRETS).find((id) => endsWithCode(SECRETS[id].code))
            if (foundId) handleSecretFound(foundId)
        })
    }

    function docsifyEasterEggs(hook, vm) {
        hook.mounted(function () {
            setupSecretCodeListener()
            showAchievements()
            console.log(`Hello!\nIf you're hunting for secrets, keep going!\nPress some keys...` )
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyEasterEggs)

    // Expose to window for plugins that need to check unlocked effects (e.g. mouse-trail.js)
    window.DocsifyEasterEggs = {
        loadEffects,
        hasEffect,
    }
})()
