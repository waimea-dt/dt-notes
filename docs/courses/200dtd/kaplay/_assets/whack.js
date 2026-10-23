kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadSprite("bug", "assets/images/beetle.png")
loadSprite("ghost", "assets/images/ghost.png")

const gameSeconds = 30
const spawnDelay = 0.8
const bugLifetime = 0.9

let score = 0
let timeLeft = gameSeconds
let isGameOver = false

const scoreLabel = add([
    text("Score: 0", { size: 32 }),
    pos(30, 20),
])

const timeLabel = add([
    text(`Time: ${gameSeconds}`, { size: 32 }),
    pos(width() - 30, 20),
    anchor("topright"),
])

for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
        add([
            circle(55),
            pos(200 + col * 200, 220 + row * 150),
            color(20, 30, 50),
            "hole",
        ])
    }
}

loop(spawnDelay, () => {
    if (isGameOver) { return }

    const hole = choose(get("hole"))

    let creatureType = "bug"
    if (chance(0.2)) {
        creatureType = "ghost"
    }

    const creature = add([
        sprite(creatureType),
        pos(hole.pos.x, hole.pos.y),
        anchor("center"),
        area(),
        creatureType,
    ])

    wait(bugLifetime, () => {
        if (creature.exists()) {
            destroy(creature)
        }
    })
})

onClick("bug", (bug) => {
    if (isGameOver) { return }

    destroy(bug)
    score = score + 1
    scoreLabel.text = `Score: ${score}`
})

onClick("ghost", (ghost) => {
    if (isGameOver) { return }

    destroy(ghost)
    score = score - 3
    if (score < 0) {
        score = 0
    }
    scoreLabel.text = `Score: ${score}`
})

loop(1, () => {
    if (isGameOver) { return }

    timeLeft = timeLeft - 1
    timeLabel.text = `Time: ${timeLeft}`

    if (timeLeft === 0) {
        isGameOver = true
        add([
            text(`Time's up! Score: ${score}`, { size: 56 }),
            pos(center()),
            anchor("center"),
        ])
    }
})
