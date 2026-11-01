kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadSprite("door",  "assets/images/door.png")
loadSprite("key",   "assets/images/key.png")
loadSprite("heart", "assets/images/heart.png")
loadSprite("ghost", "assets/images/ghost.png")
loadSprite("star",  "assets/images/star.png")

// The state of the game. It is outside every scene, so every room can see it
let hp = 3
let inventory = []
let heartTaken = false

function resetGame() {
    hp = 3
    inventory = []
    heartTaken = false
}

function drawHud() {
    destroyAll("hud")

    add([
        text(`HP: ${hp}`, { size: 28 }),
        pos(20, 20),
        "hud",
    ])

    add([
        text(`Inventory: ${inventory.join(", ")}`, { size: 22 }),
        pos(20, 60),
        "hud",
    ])
}

function showMessage(message) {
    destroyAll("message")

    add([
        text(message, { size: 28 }),
        pos(width() / 2, 540),
        anchor("center"),
        color(255, 220, 0),
        "message",
    ])
}

// Every room starts the same way
function setupRoom(name, colour) {
    setBackground(colour)
    drawHud()

    add([
        text(name, { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    onClick("door", (door) => {
        if (door.needs && !inventory.includes(door.needs)) {
            showMessage(`The door is locked. You need the ${door.needs}!`)
            return
        }

        go(door.destination)
    })
}

function addDoor(x, y, destination, needs) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination, needs: needs },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}

scene("hall", () => {
    setupRoom("The Hall", rgb(60, 40, 80))

    addDoor(680, 330, "kitchen")
    addDoor(120, 330, "cellar")
    addDoor(400, 230, "attic", "key")
})

scene("kitchen", () => {
    setupRoom("The Kitchen", rgb(40, 80, 60))

    addDoor(120, 330, "hall")

    if (!heartTaken) {
        add([
            sprite("heart"),
            pos(560, 400),
            anchor("center"),
            scale(2),
            area(),
            "heart",
        ])
    }

    onClick("heart", (heart) => {
        heartTaken = true
        hp = hp + 1
        destroy(heart)
        drawHud()
        showMessage("Yum! You feel better. +1 HP")
    })
})

scene("cellar", () => {
    hp = hp - 1
    setupRoom("The Cellar", rgb(30, 30, 50))

    addDoor(120, 330, "hall")

    add([
        sprite("ghost"),
        pos(600, 300),
        anchor("center"),
        scale(2),
    ])

    showMessage("A ghost bites you! -1 HP")

    if (!inventory.includes("key")) {
        add([
            sprite("key"),
            pos(350, 430),
            anchor("center"),
            scale(2),
            area(),
            "key",
        ])
    }

    onClick("key", (key) => {
        inventory.push("key")
        destroy(key)
        drawHud()
        showMessage("You found a key!")
    })

    if (hp <= 0) {
        go("gameover")
    }
})

scene("attic", () => {
    setupRoom("The Attic", rgb(90, 70, 30))

    addDoor(120, 330, "hall")

    add([
        sprite("star"),
        pos(400, 300),
        anchor("center"),
        scale(3),
    ])

    add([
        text("You found the treasure! You win!", { size: 32 }),
        pos(width() / 2, 440),
        anchor("center"),
        color(255, 220, 0),
    ])

    add([
        text("Press SPACE to play again", { size: 22 }),
        pos(width() / 2, 490),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        resetGame()
        go("hall")
    })
})

scene("gameover", () => {
    setBackground(rgb(70, 0, 0))

    add([
        text("Game Over", { size: 64 }),
        pos(width() / 2, 230),
        anchor("center"),
    ])

    add([
        text("Press SPACE to try again", { size: 26 }),
        pos(width() / 2, 340),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        resetGame()
        go("hall")
    })
})

go("hall")
