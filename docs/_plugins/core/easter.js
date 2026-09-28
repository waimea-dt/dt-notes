(function () {
    const SECRET_CODES = {
        'konami': {
            'trigger': ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
            'callback': goRetro,
        },
        'sudo': {
            'trigger': ['s', 'u', 'd', 'o'],
            'callback': goSudo,
        },
        'life': {
            'trigger': ['4', '2'],
            'callback': goLife,
        },
    }

    let triggeredCode = null
    let codeProgress = 0

    function goRetro() {
        console.log(`Let's go retro!`)
        DocsifyUtils.applyTheme('retro')
    }

    function goSudo() {
        console.group('SUDO REQUEST')
        console.log(`Nice try, but...\nYou're not in the sudo list`)
        console.groupEnd()
    }

    function goLife() {
        console.group('REMEMBER...')
        console.log('   ____   ___  _   _ _ _____  \n  |  _ \\ / _ \\| \\ | ( )_   _| \n  | | | | | | |  \\| |/  | |   \n  | |_| | |_| | |\\  |   | |   \n _|____/_\\___/|_|_\\_|_ _|_| _ \n|  _ \\ / \\  | \\ | |_ _/ ___| |\n| |_) / _ \\ |  \\| || | |   | |\n|  __/ ___ \\| |\\  || | |___|_|\n|_| /_/   \\_\\_| \\_|___\\____(_)\n\nAnd always have your towel with you!')
        console.groupEnd()
    }

    function setupKonamiCodeListener(callback) {
        window.addEventListener('keydown', (event) => {
            const pressedKey = event.key.length === 1 ? event.key.toLowerCase() : event.key

            if (!triggeredCode) {
                for (const [code, config] of Object.entries(SECRET_CODES)) {
                    if (pressedKey === config.trigger[0]) {
                        triggeredCode = config
                        codeProgress = 1
                        break
                    }
                }
                return
            }

            if (pressedKey === triggeredCode.trigger[codeProgress]) {
                codeProgress++
                if (codeProgress === triggeredCode.trigger.length) {
                    triggeredCode.callback()
                    triggeredCode = null
                }
            }
            else {
                triggeredCode = null
            }

        })
    }

    function docsifyEasterEggs(hook, vm) {
        hook.mounted(function () {
            setupKonamiCodeListener(goRetro)
        })
    }

    window.DocsifyUtils.registerPlugin(docsifyEasterEggs)
})()
