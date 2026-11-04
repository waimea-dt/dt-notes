kaplay({
    width: 768, height: 576,
    background: [30, 60, 90]
})

loadBean()
loadSprite("grass",  "assets/images/grass.png")
loadSprite("steel",  "assets/images/steel.png")
loadSprite("coin",   "assets/images/coin.png")
loadSprite("spike",  "assets/images/spike.png")
loadSprite("portal", "assets/images/portal.png")

setGravity(1600)

// Each level is a map: one string per row, one character per tile
const levels = [
    [
        "            ",
        "            ",
        "            ",
        "            ",
        "        $   ",
        "      ===   ",
        "  $         ",
        "@ ==    $  >",
        "============",
    ],
    [
        "            ",
        "            ",
        "         $ >",
        "        ####",
        "     $      ",
        "    ##      ",
        " $        $ ",
        "@#      ^^  ",
        "====####====",
    ],
    [
        "            ",
        " $         >",
        "###     ####",
        "            ",
        "     ##     ",
        "            ",
        "   ==    $  ",
        "@        ^  ",
        "==    ======",
    ],
]

// The state of the game. It is outside every scene, so every scene can see it
let currentLevel = 0
let coins = 0
let lives = 3

const playerSpeed = 300

function resetGame() {
    currentLevel = 0
    coins = 0
    lives = 3
}

// What each character in a map turns into
const tiles = {
    "=": () => [
        sprite("grass"),
        area(),
        body({ isStatic: true }),
    ],
    "#": () => [
        sprite("steel"),
        area(),
        body({ isStatic: true }),
    ],
    "$": () => [
        sprite("coin"),
        pos(18, 15),
        area({ isSensor: true }),
        "coin",
    ],
    "^": () => [
        sprite("spike"),
        pos(0, 43),
        area({ isSensor: true }),
        "spike",
    ],
    ">": () => [
        sprite("portal"),
        pos(7, 6),
        area({ isSensor: true }),
        "exit",
    ],
    "@": () => [
        sprite("bean"),
        // area(),
        area({ shape: new Circle(vec2(30, 27), 26) }),
        // area({
        //     shape: new Polygon([
        //         vec2(-15, -25), vec2(15, -25),   // top
        //         vec2(25, -15),  vec2(25, 15),    // right
        //         vec2(15, 25),   vec2(-15, 25),   // bottom (flat)
        //         vec2(-25, 15),  vec2(-25, -15),  // left
        //     ]),
        // }),
        body({ jumpForce: 700 }),
        "player",
    ],
}

// The labels watch the state, so they update themselves
function createHud() {
    const coinsLabel = add([
        text("", { size: 28 }),
        pos(20, 20),
    ])

    const levelLabel = add([
        text("", { size: 28 }),
        pos(width() / 2, 20),
        anchor("top"),
    ])

    const livesLabel = add([
        text("", { size: 28 }),
        pos(width() - 20, 20),
        anchor("topright"),
    ])

    coinsLabel.onUpdate(() => {
        coinsLabel.text = `Coins: ${coins}`
    })

    levelLabel.onUpdate(() => {
        levelLabel.text = `Level ${currentLevel + 1}`
    })

    livesLabel.onUpdate(() => {
        livesLabel.text = `Lives: ${lives}`
    })
}

function addControls(player) {
    player.onUpdate(() => {
        if (player.isGrounded()) {
            player.vel.x = 0
        }
    })

    onKeyDown(["a", "left"], () => {
        player.move(-playerSpeed, 0)
        player.flipX = true
    })

    onKeyDown(["d", "right"], () => {
        player.move(playerSpeed, 0)
        player.flipX = false
    })

    // Only jump from the ground, or the bean could fly
    onKeyPress(["w", "up", "space"], () => {
        if (player.isGrounded()) {
            player.jump()
        }
    })

    onUpdate(() => {
        player.pos.x = clamp(player.pos.x, 0, width() - player.width)

        // Falling off the bottom of the screen costs a life
        if (player.pos.y > height()) {
            loseLife()
        }
    })
}

// Losing a life restarts the level, so it is rebuilt with all its coins
function loseLife() {
    lives = lives - 1
    shake(12)

    if (lives <= 0) {
        go("gameover")
        return
    }

    go("game")
}

function nextLevel() {
    currentLevel = currentLevel + 1

    if (currentLevel >= levels.length) {
        go("win")
        return
    }

    go("game")
}

scene("title", () => {
    add([
        text("Coin Dash", { size: 64 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 28 }),
        pos(width() / 2, 310),
        anchor("center"),
        color(255, 220, 0),
    ])

    add([
        text("Arrow keys to move, SPACE to jump", { size: 20 }),
        pos(width() / 2, 370),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        resetGame()
        go("game")
    })
})

scene("game", () => {
    const level = addLevel(levels[currentLevel], {
        tileWidth: 64,
        tileHeight: 64,
        tiles: tiles,
    })

    const player = level.get("player")[0]

    createHud()
    addControls(player)

    onCollide("player", "coin", (player, coin) => {
        destroy(coin)
        coins = coins + 1
    })

    // Destroy the player first, so touching two spikes at once only costs one life
    onCollide("player", "spike", (player) => {
        destroy(player)
        loseLife()
    })

    onCollide("player", "exit", () => {
        nextLevel()
    })
})

scene("gameover", () => {
    add([
        text("Game Over", { size: 64 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    add([
        text(`You reached level ${currentLevel + 1}`, { size: 32 }),
        pos(width() / 2, 290),
        anchor("center"),
    ])

    add([
        text("Press SPACE to try again", { size: 26 }),
        pos(width() / 2, 380),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        resetGame()
        go("game")
    })
})

scene("win", () => {
    add([
        text("You win!", { size: 64 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    add([
        text(`Coins: ${coins}`, { size: 32 }),
        pos(width() / 2, 290),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 26 }),
        pos(width() / 2, 380),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        resetGame()
        go("game")
    })
})

go("title")
