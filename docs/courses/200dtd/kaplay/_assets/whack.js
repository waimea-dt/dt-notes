kaplay({
    width: 600, height: 600,
    background: [30, 60, 90]
})

loadSprite("bug", "assets/images/beetle.png")
loadSprite("ghost", "assets/images/ghost.png")

const gameSeconds = 30
let spawnDelay = 1.5
const bugLifetime = 0.75

let score = 0
let timeLeft = gameSeconds
let gameIsOver = false

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
            pos(150 + col * 150, 175 + row * 150),
            color(20, 30, 50),
            "hole",
        ])
    }
}

loop(spawnDelay, () => {
    if (gameIsOver) { return }

    const hole = choose(get("hole"))

    let creatureType = chance(0.2) ? "ghost" : "bug"

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

    spawnDelay -= 0.1
})

onClick("bug", (bug) => {
    if (gameIsOver) { return }

    addKaboom(bug.pos)
    destroy(bug)
    score = score + 1
    scoreLabel.text = `Score: ${score}`
})

onClick("ghost", (ghost) => {
    if (gameIsOver) { return }

    addKaboom(ghost.pos)
    destroy(ghost)
    score = score - 5
    if (score < 0) {
        score = 0
    }
    scoreLabel.text = `Score: ${score}`
})

loop(1, () => {
    if (gameIsOver) { return }

    timeLeft = timeLeft - 1
    timeLabel.text = `Time: ${timeLeft}`

    if (timeLeft === 0) {
        gameIsOver = true
        add([
            text(`Time's up!\nScore: ${score}`, { size: 56 }),
            pos(center()),
            anchor("center"),
        ])
    }
})
