kaplay({
    width: 600, height: 700,
    background: [10, 10, 40]
})

loadBean()
loadSprite("beetle", "assets/images/beetle.png")
loadSprite("star",   "assets/images/star.png")

// The state of the game. It is outside every scene, so every scene can see it
let score = 0
let lives = 3
let highScore = 0

const playerSpeed = 400
const bulletSpeed = 700

// The labels watch the state, so they update themselves
function createHud() {
    const scoreLabel = add([
        text("", { size: 28 }),
        pos(20, 20),
    ])

    const livesLabel = add([
        text("", { size: 28 }),
        pos(width() - 20, 20),
        anchor("topright"),
    ])

    scoreLabel.onUpdate(() => {
        scoreLabel.text = `Score: ${score}`
    })

    livesLabel.onUpdate(() => {
        livesLabel.text = `Lives: ${lives}`
    })
}

function addBullet(x, y) {
    add([
        sprite("star"),
        pos(x, y),
        anchor("center"),
        scale(0.7),
        area({ isSensor: true }),
        offscreen({ destroy: true }),
        "bullet",
    ])
}

// The ship, its controls and its bullets
function addPlayer() {
    const player = add([
        sprite("bean"),
        pos(width() / 2, height() - 60),
        anchor("center"),
        area({ isSensor: true }),
        "player",
    ])

    onKeyDown("left", () => {
        player.move(-playerSpeed, 0)
    })

    onKeyDown("right", () => {
        player.move(playerSpeed, 0)
    })

    onKeyPress("space", () => {
        addBullet(player.pos.x, player.pos.y - 40)
    })

    onUpdate(() => {
        player.pos.x = clamp(player.pos.x, 30, width() - 30)
    })

    onUpdate("bullet", (bullet) => {
        bullet.move(0, -bulletSpeed)
    })
}

// Bugs get faster as the score goes up
function addEnemy() {
    add([
        sprite("beetle"),
        pos(rand(40, width() - 40), -40),
        anchor("center"),
        area({ isSensor: true }),
        "enemy",
        { speed: rand(100, 200) + score / 2 },
    ])
}

function loseLife() {
    lives = lives - 1
    shake(12)

    if (lives <= 0) {
        go("gameover")
    }
}

scene("title", () => {
    add([
        text("Bug Blaster", { size: 64 }),
        pos(width() / 2, 250),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 28 }),
        pos(width() / 2, 360),
        anchor("center"),
        color(255, 220, 0),
    ])

    add([
        text("Arrow keys to move, SPACE to shoot", { size: 20 }),
        pos(width() / 2, 420),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("game")
    })
})

scene("game", () => {
    score = 0
    lives = 3

    createHud()
    addPlayer()

    loop(1, () => {
        addEnemy()
    })

    onUpdate("enemy", (enemy) => {
        enemy.move(0, enemy.speed)

        if (enemy.pos.y > height() + 40) {
            destroy(enemy)
            loseLife()
        }
    })

    onCollide("bullet", "enemy", (bullet, enemy) => {
        addKaboom(enemy.pos)
        destroy(bullet)
        destroy(enemy)
        score = score + 10
    })

    onCollide("player", "enemy", (player, enemy) => {
        destroy(enemy)
        loseLife()
    })
})

scene("gameover", () => {
    if (score > highScore) {
        highScore = score
    }

    add([
        text("Game Over", { size: 64 }),
        pos(width() / 2, 230),
        anchor("center"),
    ])

    add([
        text(`Score: ${score}   Best: ${highScore}`, { size: 32 }),
        pos(width() / 2, 330),
        anchor("center"),
    ])

    add([
        text("Press SPACE to try again", { size: 26 }),
        pos(width() / 2, 420),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("game")
    })
})

go("title")
