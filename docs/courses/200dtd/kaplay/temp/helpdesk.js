kaplay({
    width: 600, height: 500,
    background: [30, 60, 90]
})

loadBean()
loadSprite("skull", "assets/images/skull.png")
loadSprite("ghost", "assets/images/ghost.png")

// Which picture goes with which speaker
const portraits = {
    Wizard: "skull",
    Ghost: "ghost",
    You: "bean",
}

// The whole story, as data
const story = {
    start: {
        speaker: "Wizard",
        text: "Welcome to the Help Desk! I'm Skulldo the Wise. Have you tried turning it off and on again?",
        choices: [
            { label: "Yes, three times!", next: "rebooted" },
            { label: "Er... no?", next: "cookie" },
        ],
    },
    rebooted: {
        speaker: "Wizard",
        text: "Wonderful! A customer who follows instructions. That never happens.",
        trust: 1,
        next: "problem",
    },
    cookie: {
        speaker: "Wizard",
        text: "Sigh. Here, take this browser cookie. It's very old, but it might come in handy.",
        cookie: true,
        next: "problem",
    },
    problem: {
        speaker: "You",
        text: "My computer keeps hiding my files and moaning at night. I think something lives in it.",
        next: "ghost",
    },
    ghost: {
        speaker: "Ghost",
        text: "Wooo! That would be me. I'm Gary. The rent in your hard drive is very reasonable.",
        choices: [
            { label: "Gary, you can't live in my computer!", next: "angry" },
            { label: "Hi Gary. Are you... lonely?", next: "kind" },
        ],
    },
    angry: {
        speaker: "Ghost",
        text: "Rude! I was here first. Besides, where else would I go?",
        trust: -1,
        next: "decide",
    },
    kind: {
        speaker: "Ghost",
        text: "Everyone just clicks 'close' on me. Nobody ever stops to chat.",
        trust: 1,
        next: "decide",
    },
    decide: {
        speaker: "Wizard",
        text: "Hmm. I can banish Gary with a spell, or I can find him somewhere nicer to live.",
        choices: [
            { label: "Banish him!", next: "banished" },
            { label: "Find him a new home.", next: "verdict" },
        ],
    },
    banished: {
        speaker: "Wizard",
        text: "Poof! Gary is gone and your files are back. It's a bit too quiet now, though...",
        isEnding: true,
    },
    homeGood: {
        speaker: "Ghost",
        text: "I'm moving into the cookie! It's cosy, it's crumbly, and I've never been happier.",
        isEnding: true,
    },
    homeOkay: {
        speaker: "Ghost",
        text: "The office printer, you say? It's already haunted. Nobody will notice the difference.",
        isEnding: true,
    },
    homeBad: {
        speaker: "Ghost",
        text: "No home? Fine. I'll haunt your toaster. Your toast will never be the same.",
        isEnding: true,
    },
}

scene("title", () => {
    add([
        sprite("skull"),
        pos(width() / 2, 150),
        anchor("center"),
        scale(3),
    ])

    add([
        text("The Wizard's Help Desk", { size: 36 }),
        pos(width() / 2, 300),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 22 }),
        pos(width() / 2, 370),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("talk")
    })
})

scene("talk", () => {
    // Story state: starts fresh each time the scene starts
    let trust = 0
    let hasCookie = false
    let currentNode = story.start

    // Typewriter state
    let fullText = ""
    let charCount = 0

    add([
        rect(560, 260, { radius: 12 }),
        pos(20, 230),
        color(15, 30, 55),
    ])

    const speakerLabel = add([
        text("", { size: 28 }),
        pos(40, 245),
        color(255, 220, 0),
    ])

    const lineLabel = add([
        text("", { size: 22, width: 520 }),
        pos(40, 290),
    ])

    function pickEnding() {
        if (hasCookie && trust >= 1) {
            return "homeGood"
        }
        if (trust >= 1) {
            return "homeOkay"
        }
        return "homeBad"
    }

    function showNode(nodeId) {
        let id = nodeId
        if (id === "verdict") {
            id = pickEnding()
        }

        currentNode = story[id]

        if (currentNode.trust) {
            trust = trust + currentNode.trust
        }
        if (currentNode.cookie) {
            hasCookie = true
        }

        destroyAll("portrait")
        destroyAll("choiceButton")

        add([
            sprite(portraits[currentNode.speaker]),
            pos(width() / 2, 120),
            anchor("center"),
            scale(3),
            "portrait",
        ])

        speakerLabel.text = currentNode.speaker
        fullText = currentNode.text
        charCount = 0
        lineLabel.text = ""

        if (currentNode.choices) {
            for (let i = 0; i < currentNode.choices.length; i++) {
                const choice = currentNode.choices[i]

                const button = add([
                    rect(520, 40, { radius: 8 }),
                    pos(40, 385 + i * 50),
                    color(60, 90, 140),
                    area(),
                    "choiceButton",
                    { goTo: choice.next },
                ])

                button.add([
                    text(choice.label, { size: 20 }),
                    pos(14, 9),
                ])
            }
        }
    }

    // The typewriter: reveal one more letter every 0.03 seconds
    loop(0.03, () => {
        if (charCount < fullText.length) {
            charCount = charCount + 1
            lineLabel.text = fullText.slice(0, charCount)
        }
    })

    onHover("choiceButton", (button) => {
        button.color = rgb(90, 130, 190)
    })

    onHoverEnd("choiceButton", (button) => {
        button.color = rgb(60, 90, 140)
    })

    onClick("choiceButton", (button) => {
        showNode(button.goTo)
    })

    onKeyPress("space", () => {
        // First press: finish typing the line
        if (charCount < fullText.length) {
            charCount = fullText.length
            lineLabel.text = fullText
            return
        }

        // Choices are answered with the mouse
        if (currentNode.choices) {
            return
        }

        if (currentNode.isEnding) {
            go("ending", { trust: trust })
            return
        }

        showNode(currentNode.next)
    })

    showNode("start")
})

scene("ending", (data) => {
    add([
        text("The End", { size: 56 }),
        pos(width() / 2, 160),
        anchor("center"),
    ])

    add([
        text(`Trust earned: ${data.trust}`, { size: 28 }),
        pos(width() / 2, 250),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 22 }),
        pos(width() / 2, 340),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")
