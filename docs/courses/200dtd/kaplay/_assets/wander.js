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

