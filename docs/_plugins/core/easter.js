(function () {
    const SECRETS = {
        light: {
            name: 'Light Theme',
            locked: 'Switch to the light theme without the mouse',
            unlocked: 'You found the secret way to switch to the light theme',
            code: ['l', 'i', 'g', 'h', 't'],
            message: `Theme unlocked!\nArrrrrrgh, my eyes!`,
            theme: 'light',
            effect: null,
            sound: 'ding.wav',
            icon: 'sun',
            callback: null,
        },
        dark: {
            name: 'Dark Theme',
            locked: 'Switch to the dark theme without the mouse',
            unlocked: 'You found the secret way to switch to the dark theme',
            code: ['d', 'a', 'r', 'k'],
            message: `Theme unlocked!\nWelcome to the dark side!`,
            theme: 'dark',
            effect: null,
            sound: 'ding.wav',
            icon: 'moon',
            callback: null,
        },
        candy: {
            name: 'Candy Theme',
            locked: `You'll ♥ this, if you can find it!`,
            unlocked: 'You found the secret candy theme',
            code: ['<', '3'],
            message: `Theme unlocked!\nSo soft and squishy!`,
            theme: 'candy',
            effect: null,
            sound: 'tada.wav',
            icon: 'party-popper',
            callback: null,
        },
        retro: {
            name: 'Retro Theme',
            locked: 'Only elite haxx0rs will find this',
            unlocked: 'You found the secret retro theme',
            code: ['1', '3', '3', '7'],
            message: `Theme unlocked!\nWelcome to the 1980s!`,
            theme: 'retro',
            effect: null,
            sound: 'terminal.wav',
            icon: 'square-terminal',
            callback: null,
        },
        konami: {
            name: 'Mouse Trails',
            locked: `One for the gamer cheats...`,
            unlocked: 'You triggered the secret mouse trails',
            code: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
            message: `Icons unlocked!`,
            theme: null,
            effect: 'mouse-trails',
            sound: 'bonus.wav',
            icon: 'mouse-pointer-click',
            callback: null,
        },
        sudo: {
            name: 'Sudo',
            locked: `You're just a lowly user, for now...`,
            unlocked: 'You tried to gain elevated privileges',
            code: ['s', 'u', 'd', 'o'],
            message: `Nice try, but...\nYou're not in the sudo list!`,
            theme: null,
            effect: null,
            sound: 'error.wav',
            icon: 'crown',
            callback: null,
        },
        spin: {
            name: 'Barrel Roll',
            locked: `Spin me right round...`,
            unlocked: 'You spun the page!',
            code: ['3', '6', '0'],
            message: `Do a barrel roll!`,
            theme: null,
            effect: null,
            sound: 'swoosh.wav',
            icon: 'rotate-cw',
            callback: doSpin,
        },
        life: {
            name: 'Meaning of Life',
            locked: `What's the anser to the question?`,
            unlocked: 'You know the answer to the question',
            code: ['4', '2'],
            message: `   ____   ___  _   _ _ _____  \n  |  _ \\ / _ \\| \\ | ( )_   _| \n  | | | | | | |  \\| |/  | |   \n  | |_| | |_| | |\\  |   | |   \n _|____/_\\___/|_|_\\_|_ _|_| _ \n|  _ \\ / \\  | \\ | |_ _/ ___| |\n| |_) / _ \\ |  \\| || | |   | |\n|  __/ ___ \\| |\\  || | |___|_|\n|_| /_/   \\_\\_| \\_|___\\____(_)\n\nAnd always have your towel with you!`,
            theme: null,
            effect: null,
            sound: '42.wav',
            icon: 'galaxy',
            callback: null,
        },
    }

    const ACHIEVES_KEY = 'achievements'
    const EFFECTS_KEY = 'effects'

    const recentKeys = []
    const MAX_CODE_LENGTH = Math.max(...Object.values(SECRETS).map((secret) => secret.code.length))

    const { applyTheme, getTheme } = window.DocsifyUtils

    function doSpin() {
        const body = document.querySelector('body')
        body.classList.add('spin-360')
        setTimeout(() => {
            body.classList.remove('spin-360')
        }, 2000)
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

    function logAchievement(id) {
        const { name, message } = SECRETS[id]
        if (name && message) {
            console.group(name)
            console.log(message)
            console.groupEnd()
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
        if (!effect) return true

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
        if (!theme) return true

        const currentTheme = getTheme()
        if (theme !== currentTheme) {
            applyTheme(theme)
            return true
        }
        else {
            applyTheme('dark')
            return false
        }
    }

    function playSound(id) {
        const { sound } = SECRETS[id]
        if (!sound) return
        const audio = new Audio(`./_assets/sounds/${sound}`)
        audio.play()
    }

    function runCallback(id) {
        const { callback } = SECRETS[id]
        if (!callback) return
        callback(id)
    }

    function showAchievements() {
        let achieveDiv = document.getElementById('achievements')
        if (achieveDiv) achieveDiv.remove()

        achieveDiv = document.createElement('div')
        achieveDiv.id = 'achievements'

        const toggle = document.createElement('label')
        toggle.className = 'achieve-toggle'
        toggle.innerHTML = '<i data-lucide="trophy"></i>'

        const list = document.createElement('div')
        list.className = 'achieve-list'

        const achievements = loadAchievements()
        const numPossible = Object.keys(SECRETS).length
        const numAchieved = achievements.length
        let itemHtml = `
            <h4>
                Secrets Unlocked
                <span>(${numAchieved}/${numPossible})</span>
            </h4>
            <ul>
        `

        for (const id in SECRETS) {
            const { icon, name, locked, unlocked } = SECRETS[id]
            const achieved = achievements.includes(id)
            itemHtml += `
                <li
                    class="${achieved ? 'unlocked' : ''}"
                    title="${achieved ? unlocked : locked }"
                >
                    <i data-lucide="${icon}"></i>
                    ${achieved ? name : 'Not discovered'}
                </li>
            `
        }
        itemHtml += '</ul>'
        list.innerHTML = itemHtml

        achieveDiv.innerHTML = ''
        achieveDiv.append(toggle)
        achieveDiv.append(list)

        const main = document.querySelector('main')
        main.append(achieveDiv)

        window.DocsifyUtils.createLucideIcons()
    }

    function handleSecretFound(id) {
        const achievements = loadAchievements()
        if (!achievements.includes(id)) saveAchievement(id)
        showAchievements()

        const effectApplied = handleEffect(id)
        const themeApplied = handleTheme(id)
        if (effectApplied || themeApplied) {
            playSound(id)
            logAchievement(id)
        }

        runCallback(id)
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
