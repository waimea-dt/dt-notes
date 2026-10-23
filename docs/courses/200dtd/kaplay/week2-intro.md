# Week 2: Clicks, Counts & State

This week you'll learn how to respond to the **mouse**, how a game **remembers** things like the score and lives, and how to use **timers** and **randomness** to make a game that keeps going on its own.


| Lesson | Title                                                              | You will learn                                                                          |
| ------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1      | [Mouse Events](/courses/200dtd/kaplay/week2-lesson1.md)            | `area()`, `onClick`, `onHover`, `mousePos()`, changing colours                          |
| 2      | [Game State](/courses/200dtd/kaplay/week2-lesson2.md)              | Score and lives variables, `text()` labels, updating labels, game over                  |
| 3      | [Timers & Randomness](/courses/200dtd/kaplay/week2-lesson3.md)     | `wait`, `loop`, `rand`, `choose`, `get`, countdown timers                               |
| 4      | [Whack-a-Bug](/courses/200dtd/kaplay/week2-lesson4.md)             | Nested loops, building a game step by step, playtesting                                 |


By the end of the week you will have a working game: Whack-a-Bug. Bugs will pop out of holes in the ground, and you'll need to squash them before they vanish, and before time runs out!

<web-playground data-height="38em" hide-all>

```html id=kaplay
<script src="https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.js"></script>
```

```css id=kaplay
body {
    background: black;
    height: 100vh;
    display: grid;
    place-items: center;
}
```

```js
kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadSprite("bug", "assets/images/bug.png")
loadSprite("ladybird", "assets/images/ladybird.png")

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
        creatureType = "ladybird"
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

onClick("ladybird", (ladybird) => {
    if (isGameOver) { return }

    destroy(ladybird)
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
```

</web-playground>
