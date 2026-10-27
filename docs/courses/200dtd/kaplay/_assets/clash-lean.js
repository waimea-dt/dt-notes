kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

const statNames = ["speed", "power", "cuteness", "spookiness"]

const deck = [
    { name: "Cat",       image: "cat",       speed: 8, power:  4, cuteness: 9, spookiness:  2 },
    { name: "Elephant",  image: "elephant",  speed: 3, power: 10, cuteness: 7, spookiness:  1 },
    { name: "Fish",      image: "fish",      speed: 7, power:  2, cuteness: 5, spookiness:  2 },
    { name: "Beetle",    image: "beetle",    speed: 4, power:  5, cuteness: 3, spookiness:  6 },
    { name: "Butterfly", image: "butterfly", speed: 6, power:  1, cuteness: 8, spookiness:  1 },
    { name: "Ghost",     image: "ghost",     speed: 5, power:  3, cuteness: 4, spookiness: 10 },
    { name: "Mushroom",  image: "mushroom",  speed: 1, power:  2, cuteness: 6, spookiness:  5 },
    { name: "Skull",     image: "skull",     speed: 2, power:  6, cuteness: 1, spookiness:  9 },
]

for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

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

    function showCard(card, x) {
        const cardArea = add([
            rect(250, 350, { radius: 10 }),
            pos(x, 90),
            color(255, 255, 255),
            outline(6, rgb(0, 0, 0)),
            "card",
        ])

        cardArea.add([
            text(card.name, { size: 32 }),
            pos(125, 40),
            anchor("center"),
            color(0, 0, 0),
        ])

        cardArea.add([
            sprite(card.image),
            pos(125, 140),
            anchor("center"),
            scale(2.5),
        ])

        let cardText = ""
        for (let i = 0; i < statNames.length; i++) {
            const statName = statNames[i]
            const statValue = card[statName]
            const paddedName = statName.padEnd(10)
            cardText = cardText + `${paddedName}  ${statValue}\n`
        }

        cardArea.add([
            text(cardText, { size: 24 }),
            pos(125, 230),
            anchor("top"),
            color(0, 0, 0),
        ])
    }

    function showCardBack(x) {
        const cardArea = add([
            rect(250, 350, { radius: 10 }),
            pos(x, 90),
            color(150, 50, 100),
            outline(6, rgb(0, 0, 0)),
            "cardBack",
        ])

        cardArea.add([
            text("?", { size: 100 }),
            pos(125, 175),
            anchor("center"),
            color(255, 255, 255),
        ])
    }

    function dealCards() {
        playerCard = choose(deck)
        computerCard = choose(deck)
        while (computerCard === playerCard) {
            computerCard = choose(deck)
        }

        destroyAll("card")
        showCard(playerCard, 100)
        showCardBack(450)

        infoLabel.text = `Round ${round} of ${totalRounds}          Wins: ${wins}`
        messageLabel.text = "Pick a stat..."
        messageLabel.color = rgb(200, 200, 200)
        isPicking = true
    }

    const infoLabel = add([
        text("", { size: 24 }),
        pos(width() / 2, 35),
        anchor("center"),
    ])

    const messageLabel = add([
        text("", { size: 24 }),
        pos(width() / 2, 480),
        anchor("center"),
    ])

    for (let i = 0; i < statNames.length; i++) {
        const button = add([
            rect(170, 50, { radius: 8 }),
            pos(30 + i * 190, 520),
            color(60, 90, 140),
            area(),
            "statButton",
            { statName: statNames[i] },
        ])

        button.add([
            text(statNames[i], { size: 22 }),
            pos(85, 25),
            anchor("center"),
        ])
    }

    onClick("statButton", (button) => {
        if (!isPicking) return

        isPicking = false

        button.color = rgb(180, 130, 0)
        showCard(computerCard, 450)

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

