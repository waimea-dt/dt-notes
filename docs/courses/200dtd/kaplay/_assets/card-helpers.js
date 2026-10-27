// Card drawing helpers for your card battle game
//
// These need two things to be defined ABOVE them in your code:
//   statNames: the list of stat names, such as ["speed", "power"]
//   deck: your array of cards (each card needs a name, an image and a value for every stat)
//
// The card is drawn 260 wide by 350 tall, so it suits a game that is 800 by 600.
// A stat is clickable on a card if you pass true for isPlayer.

// Draws a face-up card at x. If isPlayer is true, the stat rows can be clicked
function drawCard(card, x, isPlayer, chosenStat) {
    add([
        rect(260, 350, { radius: 14 }),
        pos(x, 70),
        color(240, 235, 220),
        outline(4, rgb(31, 16, 42)),
        "card",
    ])

    add([
        text(card.name, { size: 28 }),
        pos(x + 130, 98),
        anchor("center"),
        color(31, 16, 42),
        "card",
    ])

    add([
        sprite(card.image),
        pos(x + 130, 175),
        anchor("center"),
        scale(2),
        "card",
    ])

    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]

        let rowColour = rgb(205, 198, 180)
        if (statName === chosenStat) {
            rowColour = rgb(255, 220, 0)
        }

        const row = add([
            rect(220, 32, { radius: 6 }),
            pos(x + 20, 240 + i * 42),
            color(rowColour),
            area(),
            "statRow",
            "card",
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
    add([
        rect(260, 350, { radius: 14 }),
        pos(x, 70),
        color(100, 70, 140),
        outline(4, rgb(31, 16, 42)),
        "card",
    ])

    add([
        text("?", { size: 120 }),
        pos(x + 130, 245),
        anchor("center"),
        "card",
    ])
}
