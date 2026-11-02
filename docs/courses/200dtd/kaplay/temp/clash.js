kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadBean()

const statNames = ["power", "speed", "brains"]

const deck = [
    { name: "Cat",       image: "cat",       power: 4,  speed: 8, brains: 5 },
    { name: "Elephant",  image: "elephant",  power: 10, speed: 1, brains: 8 },
    { name: "Fish",      image: "fish",      power: 2,  speed: 7, brains: 3 },
    { name: "Beetle",    image: "beetle",    power: 5,  speed: 3, brains: 2 },
    { name: "Butterfly", image: "butterfly", power: 1,  speed: 6, brains: 4 },
    { name: "Ghost",     image: "ghost",     power: 3,  speed: 5, brains: 7 },
    { name: "Mushroom",  image: "mushroom",  power: 2,  speed: 1, brains: 6 },
    { name: "Skull",     image: "skull",     power: 6,  speed: 2, brains: 1 },
]

for (const card of deck) {
    loadSprite(card.image, `assets/images/${card.image}.png`)
}

function createCardView(x, y) {
    const cardFrame = add([
        rect(300, 400, { radius: 10 }),
        pos(x, y),
        color(255, 255, 255),
        outline(5, rgb(0, 0, 0)),
    ])

    const cardName = cardFrame.add([
        text("NAME HERE", { size: 50 }),
        pos(150, 50),
        anchor("center"),
        color(0, 0, 0),
    ])

    const cardImage = cardFrame.add([
        sprite("bean"),
        pos(150, 180),
        anchor("center"),
        scale(2.5),
    ])

    const cardStats = cardFrame.add([
        text("STATS", { size: 28 }),
        pos(150, 290),
        anchor("top"),
        color(0, 0, 0),
    ])

    cardFrame.show = function(card) {
        cardName.text = card.name
        cardImage.use(sprite(card.image))

        let statsText = ""
        for (const statName of statNames) {
            statsText += `${statName}: ${card[statName]}\n`
        }
        cardStats.text = statsText
    }

    return cardFrame
}

const totalRounds = 5
scene("title", () => {
    add([
        text("Creature Clash", { size: 64 }),
        pos(width() / 2, 230),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play", { size: 28 }),
        pos(width() / 2, 340),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("battle")
    })
})

scene("battle", () => {
    let round = 1
    let wins = 0
    let canPick = true
    let playerCard = choose(deck)
    let computerCard = choose(deck)

    const playerView = createCardView(60, 50)
    const computerView = createCardView(440, 50)

    const infoLabel = add([
        text("", { size: 24 }),
        pos(30, 10),
    ])

    const messageLabel = add([
        text("", { size: 28 }),
        pos(width() / 2, 570),
        anchor("center"),
    ])

    function dealCards() {
        playerCard = choose(deck)
        computerCard = choose(deck)
        while (computerCard === playerCard) {
            computerCard = choose(deck)
        }

        playerView.show(playerCard)
        computerView.hidden = true

        infoLabel.text = `Round ${round} of ${totalRounds}     Wins: ${wins}`
        messageLabel.text = "Pick a stat!"
        canPick = true
    }

    for (let i = 0; i < statNames.length; i++) {
        const button = add([
            rect(200, 50, { radius: 8 }),
            pos(70 + i * 230, 495),
            color(60, 90, 140),
            area(),
            "statButton",
            { statName: statNames[i] },
        ])

        button.add([
            text(statNames[i], { size: 24 }),
            pos(100, 25),
            anchor("center"),
        ])
    }

    onClick("statButton", (button) => {
        if (!canPick) {
            return
        }
        canPick = false

        computerView.show(computerCard)
        computerView.hidden = false

        const playerValue = playerCard[button.statName]
        const computerValue = computerCard[button.statName]

        if (playerValue > computerValue) {
            wins = wins + 1
            messageLabel.text = `You win! ${playerValue} beats ${computerValue}`
        } else if (playerValue < computerValue) {
            messageLabel.text = `You lose! ${computerValue} beats ${playerValue}`
        } else {
            messageLabel.text = `A draw! Both are ${playerValue}`
        }

        wait(2.5, () => {
            if (round === totalRounds) {
                go("results", { wins: wins })
            } else {
                round = round + 1
                dealCards()
            }
        })
    })

    dealCards()
})

scene("results", (data) => {
    add([
        text("Game Over", { size: 64 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    add([
        text(`You won ${data.wins} of ${totalRounds} rounds`, { size: 36 }),
        pos(width() / 2, 300),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 28 }),
        pos(width() / 2, 400),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")
