kaplay({
    width: 500, height: 600,
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

function createButton(label, x, y) {
    const button = add([
        rect(120, 50, { radius: 8 }),
        pos(x, y),
        anchor("center"),
        color(60, 90, 140),
        area(),
        "button",
    ])

    button.add([
        text(label, { size: 24 }),
        pos(0, 0),
        anchor("center"),
    ])

    button.action = label

    return button
}

const counterLabel = add([
    text("", { size: 24 }),
    pos(width() / 2, 40),
    anchor("center"),
])

const cardView = createCardView(100, 80)

const prevButton = createButton("Prev", 150, 540)
const nextButton = createButton("Next", 350, 540)

onClick("button", (button) => {
    if (button.action === "Next") {
        if (cardIndex < deck.length - 1) {
            cardIndex = cardIndex + 1
        }
    }
    else if (button.action === "Prev") {
        if (cardIndex > 0) {
            cardIndex = cardIndex - 1
        }
    }

    showCurrentCard()
})

let cardIndex = 0

function showCurrentCard() {
    cardView.show(deck[cardIndex])

    counterLabel.text = `Card ${cardIndex + 1} of ${deck.length}`

    prevButton.color = rgb(60, 90, 140)
    nextButton.color = rgb(60, 90, 140)

    if (cardIndex === 0) {
        prevButton.color = rgb(128, 128, 128)
    }
    if (cardIndex === deck.length - 1) {
        nextButton.color = rgb(128, 128, 128)
    }
}

showCurrentCard()
