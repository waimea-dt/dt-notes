kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

// The stats that every card has
const statNames = ["speed", "power", "cuteness"]

// The deck: one object for each card
const deck = [
    { name: "Cat",       image: "cat",       speed: 8, power: 4,  cuteness: 9 },
    { name: "Elephant",  image: "elephant",  speed: 3, power: 10, cuteness: 7 },
    { name: "Fish",      image: "fish",      speed: 7, power: 2,  cuteness: 5 },
    { name: "Beetle",    image: "beetle",    speed: 4, power: 5,  cuteness: 3 },
    { name: "Butterfly", image: "butterfly", speed: 6, power: 1,  cuteness: 8 },
    { name: "Ghost",     image: "ghost",     speed: 5, power: 3,  cuteness: 4 },
    { name: "Mushroom",  image: "mushroom",  speed: 1, power: 2,  cuteness: 6 },
    { name: "Skull",     image: "skull",     speed: 2, power: 6,  cuteness: 1 },
]

const totalRounds = 5

// Load every picture named in the deck
for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

// Draws a face-up card at x. If isPlayer is true, the stat rows can be clicked
function drawCard(card, x, isPlayer, chosenStat) {
    const cardFront = add([
        rect(260, 350, { radius: 14 }),
        pos(x, 100),
        color(240, 235, 220),
        outline(4, rgb(31, 16, 42)),
        "card",
    ])

    cardFront.add([
        text(card.name, { size: 28 }),
        pos(130, 30),
        anchor("center"),
        color(31, 16, 42),
    ])

    cardFront.add([
        sprite(card.image),
        pos(130, 120),
        anchor("center"),
        scale(2),
    ])

    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]

        let rowColour = rgb(205, 198, 180)
        if (statName === chosenStat) {
            rowColour = rgb(255, 220, 0)
        }

        const row = cardFront.add([
            rect(220, 32, { radius: 6 }),
            pos(20, 210 + i * 42),
            color(rowColour),
            area(),
            "statRow",
            { statName: statName, isPlayer: isPlayer },
        ])

        row.add([
            text(statName, { size: 20 }),
            pos(12, 16),
            anchor("left"),
            color(31, 16, 42),
        ])

        row.add([
            text(`${card[statName]}`, { size: 20 }),
            pos(208, 16),
            anchor("right"),
            color(31, 16, 42),
        ])
    }
}

// Draws a face-down card at x
function drawCardBack(x) {
    const cardBack = add([
        rect(260, 350, { radius: 14 }),
        pos(x, 100),
        color(100, 70, 140),
        outline(4, rgb(31, 16, 42)),
        "card",
    ])

    cardBack.add([
        text("?", { size: 120 }),
        pos(130, 175),
        anchor("center"),
    ])
}

scene("title", () => {
    add([
        text("Creature Clash", { size: 64 }),
        pos(width() / 2, 120),
        anchor("center"),
    ])

    add([
        text("Pick a stat. The biggest number wins!", { size: 24 }),
        pos(width() / 2, 230),
        anchor("center"),
    ])

    for (let i = 0; i < 5; i++) {
        add([
            sprite(deck[i].image),
            pos(100 + i * 150, 360),
            anchor("center"),
            scale(2),
        ])
    }

    add([
        text("Press SPACE to play", { size: 26 }),
        pos(width() / 2, 520),
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

    const infoLabel = add([
        text("", { size: 24 }),
        pos(30, 20),
    ])

    const messageLabel = add([
        text("", { size: 28 }),
        pos(width() / 2, 520),
        anchor("center"),
    ])

    function dealCards() {
        playerCard = choose(deck)
        computerCard = choose(deck)

        // The computer must not get the same card as the player
        while (computerCard === playerCard) {
            computerCard = choose(deck)
        }

        destroyAll("card")
        drawCard(playerCard, 70, true)
        drawCardBack(470)

        infoLabel.text = `Round ${round} of ${totalRounds}     Wins: ${wins}`
        messageLabel.text = "Pick a stat!"
        messageLabel.color = rgb(255, 255, 255)
        canPick = true
    }

    onHover("statRow", (row) => {
        if (canPick && row.isPlayer) {
            row.color = rgb(255, 240, 150)
        }
    })

    onHoverEnd("statRow", (row) => {
        if (canPick && row.isPlayer) {
            row.color = rgb(205, 198, 180)
        }
    })

    onClick("statRow", (row) => {
        if (!canPick || !row.isPlayer) {
            return
        }
        canPick = false

        const playerValue = playerCard[row.statName]
        const computerValue = computerCard[row.statName]

        destroyAll("card")
        drawCard(playerCard, 70, true, row.statName)
        drawCard(computerCard, 470, false, row.statName)

        if (playerValue > computerValue) {
            wins = wins + 1
            messageLabel.text = `You win! ${playerValue} beats ${computerValue}`
            messageLabel.color = rgb(120, 255, 120)
        } else if (playerValue < computerValue) {
            messageLabel.text = `You lose! ${computerValue} beats ${playerValue}`
            messageLabel.color = rgb(255, 120, 120)
        } else {
            messageLabel.text = `A draw! Both are ${playerValue}`
        }

        wait(2.5, () => {
            if (round === totalRounds) {
                go("results", { wins: wins, rounds: totalRounds })
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
        pos(width() / 2, 170),
        anchor("center"),
    ])

    add([
        text(`You won ${data.wins} of ${data.rounds} rounds`, { size: 32 }),
        pos(width() / 2, 270),
        anchor("center"),
    ])

    let verdict = "Better luck next time!"
    if (data.wins === data.rounds) {
        verdict = "A perfect score!"
    } else if (data.wins > data.rounds / 2) {
        verdict = "Well played!"
    }

    add([
        text(verdict, { size: 28 }),
        pos(width() / 2, 340),
        anchor("center"),
        color(255, 220, 0),
    ])

    add([
        text("Press SPACE to play again", { size: 24 }),
        pos(width() / 2, 450),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")
