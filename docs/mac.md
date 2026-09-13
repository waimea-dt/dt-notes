<computer type="mac">

&nbsp;

</computer>


<script>
    const START_DELAY = 200
    const LINE_PAUSE = 100
    const CHAR_PAUSE = 4

    const jokes = [
        "There are only two hard things in computer science... </h1><h1> Cache invalidation, naming things, and off-by-one errors",
        "To understand recursion... </h1><h1> You must first understand recursion",
        "I would tell you a UDP joke... </h1><h1> But you might not get it!",
        "There are 10 types of people in the world... </h1><h1> Those who understand binary, and those who don't",
        "An SQL query walks into a bar, walks up to two tables, and asks: 'Can I join you?'",
        "My code doesn't have bugs... </h1><h1> It just develops random features",
        "My code works perfectly... </h1><h1> Until someone uses it!",
        "Programming is 10% writing code and 90% figuring out why it doesn't work",
        "There's no place like 127.0.0.1",
        "How do robots eat pizza? </h1><h1> One byte at a time!",
        "What type of cryptography do pigs use? </h1><h1> Invisible oink!",
        "How do dolphins compute? </h1><h1> They use a Central Porpoising Unit!",
        "What type of cryptography did Vikings use? </h1><h1> Norse code!",
        "<code>['hip', 'hip']</code> </h1><h1> Hip hip array!",
        "Two bits walked into an expensive cafe, but were thrown out... </h1><h1> They didn't have enough for a byte",
        "Counting in binary... </h1><h1> It's as easy as 01 10 11",
        "ASCII codes... </h1><h1> As easy as 65 66 67",
        "Why don't elephants use desktop computers? </h1><h1> They are scared of the mouse",
        "How does a computer scientist organise her bath toys? </h1><h1> Bubble sort",
        "Computers make mistakes... </h1><h1> But they're very fast, very accurate mistakes!",
        "How many programmers does it take to change a light bulb? </h1><h1> None, it's a hardware problem",
        "The programmer got stuck in the shower... </h1><h1> The shampoo bottle said: Lather, Rinse, Repeat",
        "Why do coders use dark themes? </h1><h1> Because bugs are attracted to the light",
        "What do you call a group of eight hobbits? </h1><h1> A hobbyte",
        "Why do web developers wear glasses? </h1><h1> To improve their site",
        "My team had a debate on what the best looping variable name is... </h1><h1> i won",
        "Never ask a SQL dev to help you move furniture... </h1><h1> They drop tables",
        "I got really angry and smashed my keyboard... </h1><h1> I completely lost CTRL",
        "I have a joke about computers... </h1><h1> But it's not PC",
        "I teased a Linux user... </h1><h1> They retreated back into their shell.",
        "Artificial intelligence is no match for my natural stupidity",
        "Teachers: in the real world, you can't just Google everything </h1><h1> Programmers: lol",
        "What goes from 0 to 100 really fast? </h1><h1> Binary",
        "Why do number jokes not work in Octal? </h1><h1> Because 7 10 11",
        "There are 10 types of people in the world... </h1><h1> Those who understand ternary, those who don't, and those who thought this was a binary joke",
    ]

    words = [
        'ALGORITHM', 'PSEUDOCODE', 'FLOWCHART', 'SYNTAX', 'COMMENT', 'VARIABLE', 'CONSTANT', 'BIT',
        'BYTE', 'BOOLEAN', 'CHAR', 'STRING', 'CONCATENATE', 'NULL', 'LITERAL', 'MUTABLE',
        'IMMUTABLE', 'SEQUENCE', 'CONDITION', 'BRANCH', 'SELECTION', 'ITERATION', 'LOOP', 'RECURSION',
        'BOOLEAN', 'LOGIC', 'FUNCTION', 'PARAMETER', 'ARGUMENT', 'RETURN', 'ARRAY', 'LIST',
        'RECORD', 'FIELD', 'STACK', 'QUEUE', 'HASH', 'LINEAR', 'BUBBLESORT', 'COMPLEXITY',
        'TRACTABILITY', 'INTRACTABILITY', 'HEURISTIC', 'DECOMPOSITION', 'ABSTRACTION', 'OOP', 'PROGRAMMING', 'CLASS',
        'OBJECT', 'PROPERTY', 'METHOD', 'CONSTRUCTOR', 'ENCAPSULATION', 'INHERITANCE', 'POLYMORPHISM', 'INTERFACE',
        'BUG', 'DEBUGGING', 'BREAKPOINT', 'TESTING', 'TRACE', 'DOCUMENTATION', 'REFACTORING', 'VALIDATION',
        'ACCESSIBILITY', 'USABILITY', 'REQUIREMENTS', 'SPECIFICATION', 'STAKEHOLDER', 'SPRINT', 'PROTOTYPE', 'REPOSITORY',
        'GITHUB', 'TRANSLATE', 'COMPILER', 'INTERPRETER', 'PALETTE', 'WIREFRAME', 'GUI', 'BIT',
        'BINARY', 'DENARY', 'DECIMAL', 'HEXADECIMAL', 'ASCII', 'UNICODE', 'PIXEL', 'RESOLUTION',
        'BITMAP', 'VECTOR', 'GRAPHIC', 'COMPRESSION', 'LOSSLESS', 'LOSSY', 'METADATA', 'ASSEMBLY',
        'CACHE', 'BUFFER', 'AUTHENTICATION', 'PASSWORD', 'ENCRYPTION', 'DECRYPTION', 'SYMMETRIC', 'ASYMMETRIC',
        'PUBLIC', 'PRIVATE', 'CERTIFICATE', 'DIGITAL', 'SIGNATURE', 'CIPHER', 'CRYPTOGRAPHY', 'MALWARE',
        'VIRUS', 'BRUTEFORCE', 'PHISHING', 'HTML', 'CSS', 'JAVASCRIPT', 'TAG', 'SELECTOR',
        'DOM', 'JSON', 'HYPERLINK', 'FRONTEND', 'BACKEND', 'CLIENT', 'SERVER', 'BROWSER',
        'ROUTE', 'ROUTING', 'TEMPLATE', 'COOKIE', 'DATABASE', 'RELATIONAL', 'TABLE', 'ROW',
        'COLUMN', 'PRIMARY', 'FOREIGN', 'INDEX', 'NORMALISATION', 'QUERY', 'SQL', 'CRUD',
        'INTERNET', 'ARPANET', 'ETHERNET', 'WIFI', 'HTTP', 'HTTPS', 'SSL', 'TLS',
        'URL', 'PACKET', 'PORT', 'ROUTER', 'MODEM', 'FIREWALL', 'BANDWIDTH', 'SSD',
        'HDD', 'USB', 'MOTHERBOARD', 'INPUT', 'OUTPUT', 'PERIPHERAL', 'ANDROID', 'MACOS',
        'LINUX', 'APPLICATION', 'SOFTWARE', 'LIBRARY', 'MODULE', 'PACKAGE', 'FILE', 'FOLDER',
        'DIRECTORY', 'ROOT', 'PYTHON',
    ]

    const hangmanStages = [
        [
            `______ `,
            `|/     `,
            `|      `,
            `|      `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|      `,
            `|      `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|      `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|    | `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    o `,
            `|   /| `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|   /|\\`,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|   /|\\`,
            `|   /  `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|   /|\\`,
            `|   / \\`,
            `|______`
        ],
    ]

    const hangmanWin = [
        `______ `,
        `|/   | `,
        `|      `,
        `|   \\O/`,
        `|    | `,
        `|___/_\\`,
    ]

    let name = 'Human'

    let playingHangman = false
    let hangmanWon = false
    let hangmanLost = false
    let wordToGuess = ''
    let wordSoFar = ''
    let guesses = []
    let guessFeedback = ''
    let hangProgress = 0

    setTimeout(showBoot, 1000)

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    async function typeHtml(display, html, characterDelay = CHAR_PAUSE) {
        const template = document.createElement('template')
        template.innerHTML = html

        async function typeNode(node, parent) {
            if (node.nodeType === Node.TEXT_NODE) {
                for (const character of node.textContent) {
                    parent.append(character)
                    await wait(characterDelay)
                }
                return
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return

            const element = node.cloneNode(false)
            parent.appendChild(element)

            for (const child of node.childNodes) {
                await typeNode(child, element)
            }
        }

        for (const node of template.content.childNodes) {
            await typeNode(node, display)
        }
    }

    async function showTextPage(htmlLines) {
        const display = document.querySelector('.computer-screen-content')
        display.innerHTML = ''

        await wait(LINE_PAUSE)

        for (const html of htmlLines) {
            await typeHtml(display, html)
            await wait(LINE_PAUSE)
        }
    }

    async function showBoot() {
        await showTextPage([
            `<img
                style="width: 10%; height: auto; padding-top: 7.5em;"
                src="./_assets/macs/happy-mac-icon.png"
            >`,
        ])

        setTimeout(showSmile, 1000)
    }

    async function showSmile() {
        await showTextPage([
            `<img
                src="./_assets/macs/face.svg"
            >`,
        ])

        setTimeout(showGreeting, 2000)
    }

    async function showGreeting() {
        await showTextPage([
            `<h1>Hello, ${name}!</h1>`,
            `<p>I'm a <strong>Macintosh</strong> computer from <strong>1984</strong>. Back then I was pretty ripped...`,
            `<ul>
                <li style="margin-block: 0;"><strong>8MHz</strong> CPU (single core)
                <li style="margin-block: 0;"><strong>128kB</strong> RAM
                <li style="margin-block: 0;"><strong>400kB</strong> 3.5inch floppy drive (OS / storage)
                <li style="margin-block: 0;"><strong>9" greyscale</strong> display (512×342 pixels)
                <li style="margin-block: 0;"><strong>Graphical user interface (GUI)</strong>
                <li style="margin-block: 0;"><strong>Mouse</strong> to work with the GUI (one button)
            </ul>`,
            `<p>Impressed?`,
            ``,
            `<p>
                So, what's your name?
                <input type="text" id="username">
            </p>`,
        ])

        const nameInput = document.getElementById('username')
        nameInput.focus()
        nameInput.addEventListener('change', () => {
            if (nameInput.value && nameInput.value.trim().length > 0) {
                name = nameInput.value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                showOptions()
            }
        })
    }

    async function showOptions() {
        await showTextPage([
            `<h1>So, ${name}...</h1>`,
            `<p>How can I help you?`,
            `<ol style="list-style-type: upper-alpha;">
                <li>I can tell you a <strong>nerdy joke</strong>
                <li>I can play a <strong>game of nerdy Hangman</strong>
                <li>I can show you a <strong>video about me</strong>
            </ol>`,
            `<p>Pick A, B or C <input type="text" size="1" id="choice">`
        ])

        const choiceInput = document.getElementById('choice')
        choiceInput.focus()
        choiceInput.addEventListener('change', () => {
            const choice = choiceInput.value.trim().toUpperCase()
            if (choice.length === 1 && choice >= 'A' && choice <= 'C') {
                if (choice == 'A') showJoke()
                if (choice == 'B') playHangman()
                if (choice == 'C') showVideo()
            }
        })
    }

    async function showVideo() {
        await showTextPage([
            `<iframe
                style="width: 100%; aspect-ratio: 16/9; border-radius: 0.5rem; overflow: hidden; border: 2px solid #111; filter: grayscale(100%) sepia(0%);"
                src="https://www.youtube.com/embed/-5zeJyQ31rM?si=Nu5kt3cATnkyfKBp"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
            ></iframe>`,
            `<button id="back">Back</button>`,
        ])

        const backButton = document.getElementById('back')
        backButton.focus()
        backButton.addEventListener('click', showOptions)
    }

    async function showJoke() {
        const joke = jokes[Math.floor(Math.random() * jokes.length)]
        await showTextPage([
            `<p>Ok, ${name}, here is a joke...</h1>`,
            ``,
            `<h1>${joke}</h1>`,
            `<p>`,
            `<p>Ha! Ha ha! Ha ha ha!`,
            `<p>I'm so funny!`,
            `<p>`,
            `<button id="back">Back</button>`,
        ])

        const backButton = document.getElementById('back')
        backButton.focus()
        backButton.addEventListener('click', showOptions)
    }

    function resetHangman() {
        playingHangman = false
        hangmanWon = false
        hangmanLost = false
        guesses = []
        hangProgress = 0
        wordToGuess = ''
        wordSoFar = ''
        guessFeedback = ''
    }

    async function playHangman() {
        if (!playingHangman) {
            resetHangman()
            wordToGuess = words[Math.floor(Math.random() * words.length)].split('')
            wordSoFar = Array(wordToGuess.length).fill('_')
            playingHangman = true
        }

        let hangmanText = wordSoFar.join(' ')
        const guessesText = guesses.length > 0 ? guesses.sort().join(' ') : 'none'
        let hangmanStage = hangmanStages[hangProgress].join('\n')
        const mistakesText = `${hangProgress} / ${hangmanStages.length - 1}`

        let promptText = ''
        let inputHtml = 'Your guess, A-Z... <input type="text" size="1" id="guess">'

        if (guessFeedback.length > 0) {
            promptText = guessFeedback
            guessFeedback = ''
        }

        if (hangmanWon) {
            promptText = '<strong>You guessed the word!</strong>'
            inputHtml = '<button id="back">Back</button>'
            hangmanStage = hangmanWin.join('\n')
        }

        if (hangmanLost) {
            promptText = 'Oh no, <strong>you were hanged!</strong>'
            inputHtml = '<button id="back">Back</button>'
            hangmanText = wordToGuess.join(' ')
        }

        await showTextPage([
            `<h1>Hangman with ${name} the Human</h1>`,
            `<p>`,
            `<h1 style="text-align: center;">${hangmanText}</h1>`,
            `<div style="display: flex; gap: 1rem; width: 100%; justify-content: space-evenly; align-items: center;">
                <div>
                    <p style="margin-top: 0;">${promptText}
                    <p style="margin-bottom: 0;"><em>
                        Mistakes: ${mistakesText}<br>
                        Letters used:<br>
                        ${guessesText}
                    </em>
                </div>
                <pre style="text-align: center; margin: 0;">${hangmanStage}</pre>
            </div>`,
            `<p>`,
            `<p>${inputHtml}`,
        ])

        const backButton = document.getElementById('back')
        if (backButton) {
            backButton.focus()
            backButton.addEventListener('click', () => {
                resetHangman()
                showOptions()
            })
        }

        const guessInput = document.getElementById('guess')
        if (guessInput) {
            guessInput.focus()
            guessInput.addEventListener('change', () => {
                const guess = guessInput.value.trim().toUpperCase()

                if (guess.length === 0) return

                if (guess.length === 1 && guess >= 'A' && guess <= 'Z') {
                    if (guesses.includes(guess)) {
                        guessFeedback = `Whoops! You already tried '${guess}'...`
                        playHangman()
                        return
                    }

                    guesses.push(guess)

                    if (wordToGuess.includes(guess)) {
                        guessFeedback = `Yes! '${guess}' <strong>is</strong> in the word`

                        const updatedWordSoFar = wordToGuess.map((char, index) => {
                            return char === guess ? char : wordSoFar[index];
                        })
                        wordSoFar = updatedWordSoFar

                        if (!wordSoFar.includes('_')) {
                            hangmanWon = true
                        }
                    }
                    else {
                        guessFeedback = `No! '${guess}' is <strong>not</strong> in the word`
                        hangProgress++

                        if (hangProgress === hangmanStages.length - 1) {
                            hangmanLost = true
                        }
                    }

                    playHangman()
                }
            })
        }
    }
</script>

