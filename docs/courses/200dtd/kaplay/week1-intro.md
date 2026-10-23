# Week 1: Things That Move

This week you'll learn the basics of the **JavaScript** language, look at the **Kaplay** game library, and then use them to put things on the screen and make them move.


| Lesson | Title                                                           | You will learn                                                                         |
| ------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1      | [Variables](/courses/200dtd/kaplay/week1-lesson1.md)            | `const`, `let`, strings, numbers, booleans, `console.log`, template literals           |
| 2      | [Choices and Repeats](/courses/200dtd/kaplay/week1-lesson2.md)  | `if` / `else`, comparing values, `for` and `while` loops, functions                    |
| 3      | [Hello, Kaplay](/courses/200dtd/kaplay/week1-lesson3.md)        | Starting Kaplay, coordinates, `add([...])`, sprites, adding lots of things with a loop |
| 4      | [Moving Things](/courses/200dtd/kaplay/week1-lesson4.md) | Keyboard input, `onUpdate`, speed variables, how the game loop works                   |


By the end of the week you will have a small working game: Wander. You will wander around a haunted room, picking up mushrooms while a row of ghosts watches from the top of the screen.

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

loadBean()
loadSprite("ghost", "assets/images/ghost.png")
loadSprite("mushroom", "assets/images/mushroom.png")

const playerSpeed = 200
const playerMargin = 30

let ghostSpeed = 10
const numGhosts = 8
const ghostMargin = 80

const numMushrooms = 12
const mushroomMargin = 50

const ghostSpacing = (width() - 2 * ghostMargin) / (numGhosts - 1)

for (let i = 0; i < numGhosts; i++) {
    add([
        sprite("ghost"),
        pos(ghostMargin + i * ghostSpacing, ghostMargin),
        anchor("center"),
        "ghost",
    ])
}

for (let i = 0; i < numMushrooms; i++) {
    add([
        sprite("mushroom"),
        pos(
            rand(mushroomMargin, width() - mushroomMargin),
            rand(mushroomMargin + ghostMargin * 2, height() - mushroomMargin)
        ),
        anchor("center"),
        "mushroom",
    ])
}

const count = add([
    text("Mushrooms left: ???"),
    pos(width() / 2, height() - 25),
    anchor("center"),
])

const player = add([
    sprite("bean"),
    pos(width() / 2, height() / 2),
    anchor("center"),
])

onKeyDown(["left",  "a"], () => { player.move(-playerSpeed, 0); player.flipX = true })
onKeyDown(["right", "d"], () => { player.move(playerSpeed, 0);  player.flipX = false })
onKeyDown(["up",    "w"], () => { player.move(0, -playerSpeed) })
onKeyDown(["down",  "s"], () => { player.move(0, playerSpeed) })

onUpdate(() => {
    if (player.pos.x < playerMargin)            { player.pos.x = playerMargin }
    if (player.pos.x > width() - playerMargin)  { player.pos.x = width() - playerMargin }
    if (player.pos.y < playerMargin)            { player.pos.y = playerMargin }
    if (player.pos.y > height() - playerMargin) { player.pos.y = height() - playerMargin }

    const mushroomCount = get("mushroom").length
    if (mushroomCount === 0) {
        count.text = "You collected them all!"
    }
    else {
        count.text = `Mushrooms left: ${mushroomCount}`
    }
})

onUpdate("mushroom", (mushroom) => {
    if (player.pos.dist(mushroom.pos) < 30) {
        destroy(mushroom)
    }
})

onUpdate("ghost", (ghost) => {
    ghost.move(0, ghostSpeed)

    if (ghost.pos.y > ghostMargin + 30 || ghost.pos.y < ghostMargin) {
        ghostSpeed = -ghostSpeed
    }
})

```

</web-playground>

