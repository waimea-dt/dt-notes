kaplay({
    width: 800, height: 640,
    background: [30, 60, 90]
})

const deck = [
    { name: "Cat",       image: "cat",       speed: 8, power:  4, brains:  6 },
    { name: "Elephant",  image: "elephant",  speed: 1, power: 10, brains:  8 },
    { name: "Fish",      image: "fish",      speed: 7, power:  3, brains:  1 },
    { name: "Beetle",    image: "beetle",    speed: 6, power:  6, brains:  6 },
    { name: "Butterfly", image: "butterfly", speed: 8, power:  1, brains:  3 },
    { name: "Ghost",     image: "ghost",     speed: 2, power:  2, brains:  4 },
    { name: "Mushroom",  image: "mushroom",  speed: 0, power:  3, brains:  1 },
    { name: "Skull",     image: "skull",     speed: 2, power:  9, brains:  0 }
]

for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}
loadBean()

const totalRounds = 5

scene("title", () => {
    add([
        text("Creature Clash", { size: 64 }),
        pos(width() / 2, 250),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start...", { size: 32 }),
        pos(width() / 2, 350),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("battle")
    })
})


scene("battle", () => {
    let round = 1
    let wins = 0
    let isPicking = true

    let playerCard   = choose(deck)
    let computerCard = choose(deck)

    function createCardView(x) {
        const cardFrame = add([
            rect(300, 400, { radius: 10 }),
            pos(x, 70),
            color(255, 255, 255),
            outline(5, rgb(0, 0, 0)),
            opacity(1),
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
            text("STATS\nSTATS\nSTATS\nSTATS", { size: 28 }),
            pos(150, 290),
            anchor("top"),
            color(0, 0, 0),
        ])

        const cardMystery = cardFrame.add([
            text("?", { size: 100 }),
            pos(150, 200),
            anchor("center"),
            color(255, 255, 255),
        ])

        cardFrame.show = function(card) {
            cardFrame.color = rgb(255, 255, 255)
            cardName.opacity = 1
            cardImage.opacity = 1
            cardStats.opacity = 1
            cardMystery.opacity = 0

            cardName.text = card.name

            cardImage.use(sprite(card.image))

            let statsText = ""
            statsText += `power:   ${card.power}\n`
            statsText += `speed:   ${card.speed}\n`
            statsText += `brains:  ${card.brains}`
            cardStats.text = statsText
        }

        cardFrame.showBack = function(card) {
            cardFrame.color = rgb(150, 50, 100)
            cardName.opacity = 0
            cardImage.opacity = 0
            cardStats.opacity = 0
            cardMystery.opacity = 1
        }

        return cardFrame
    }

    function dealCards() {
        playerCard = choose(deck)
        computerCard = choose(deck)
        while (computerCard === playerCard) {
            computerCard = choose(deck)
        }

        playerCardView.show(playerCard)
        compCardView.showBack()

        infoLabel.text = `Round ${round} of ${totalRounds}          Wins: ${wins}`
        messageLabel.text = "Pick a stat..."
        messageLabel.color = rgb(200, 200, 200)
        isPicking = true
    }

    const playerCardView = createCardView(75)
    const compCardView = createCardView(425)

    const infoLabel = add([
        text("", { size: 24 }),
        pos(width() / 2, 35),
        anchor("center"),
    ])

    const messageLabel = add([
        text("", { size: 24 }),
        pos(width() / 2, 520),
        anchor("center"),
    ])

    const statNames = ["power", "speed", "brains"]
    for (let i = 0; i < statNames.length; i++) {
        const button = add([
            rect(170, 50, { radius: 8 }),
            pos(200 + i * 200, 585),
            color(60, 90, 140),
            anchor("center"),
            area(),
            "statButton",
            { statName: statNames[i] },
        ])

        button.add([
            text(statNames[i], { size: 22 }),
            pos(0, 0),
            anchor("center"),
        ])
    }

    onClick("statButton", (button) => {
        if (!isPicking) return

        isPicking = false

        button.color = rgb(180, 130, 0)
        compCardView.show(computerCard)

        const playerValue   = playerCard[button.statName]
        const computerValue = computerCard[button.statName]

        if (playerValue > computerValue) {
            messageLabel.text = "You WIN!"
            messageLabel.color = rgb(150, 255, 150)
            wins = wins + 1
        }
        else if (playerValue < computerValue) {
            messageLabel.text = "You LOSE!"
            messageLabel.color = rgb(255, 150, 150)
        }
        else {
            messageLabel.text = "It's a DRAW!"
        }

        wait(2.5, () => {
            button.color = rgb(60, 90, 140)

            if (round === totalRounds) {
                go("results", { wins: wins })
            }
            else {
                round = round + 1
                dealCards()
            }
        })
    })

    onHover("statButton", (button) => {
        if (!isPicking) return
        button.color = rgb(75, 110, 175)
    })

    onHoverEnd("statButton", (button) => {
        if (!isPicking) return
        button.color = rgb(60, 90, 140)
    })

    dealCards()
})


scene("results", (data) => {
    add([
        text(`You won ${data.wins} of ${totalRounds} rounds`, { size: 40 }),
        pos(width() / 2, 250),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again...", { size: 32 }),
        pos(width() / 2, 350),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")

