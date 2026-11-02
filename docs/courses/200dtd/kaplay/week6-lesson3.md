# Lesson 3: Pickups & Levels

You can draw a level now... but there's nothing to *do* in it. Today we add the things that make a platformer a game: **coins** to grab, **spikes** to avoid, and an **exit** that takes you to the next level.

## Warm-Up

Try not to look back at the previous lessons...

1. What does each **string** in a level map stand for? What about each **character**?

    <response>

2. For Kaplay to tell us that two things have touched, what do they need?

    <response>

3. Why does a game keep things like `score` and `lives` **outside** its scenes?

    <response>


## Learning Goals

- <check> I can add **pickups** and **hazards** to a map, and react when the player touches them
- <check> I can keep a game's **levels** in an array, and track which one we're on
- <check> I can move to the **next level**, and **win** after the last one
- <check> I can explain why `go("game")`(js) gives us a **fresh** level


## The Big Idea: **Levels Are Data**

A map is an array of strings. So a game with lots of levels has an **array of maps**: a list of lists! A number called `currentLevel`(js) is the **index** of the level we're on.

```js
const levels = [
    [ ... ],   // levels[0]: the first level
    [ ... ],   // levels[1]: the second level
]

let currentLevel = 0
```

The `game` scene builds whichever level `currentLevel`(js) points to. To move on, we add one to `currentLevel`(js) and call `go("game")`(js) again. The old level is thrown away, and the new one is built from its map.

The new tiles are already in the hidden code. They all have a **tag** and a **sensor**:

```js
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
```

| Code                                         | What it does                                                   |
| -------------------------------------------- | -------------------------------------------------------------- |
| `levels[currentLevel]`(js)                   | The map of the level we're on                                  |
| `area({ isSensor: true })`(js)               | On a pickup or hazard: **notice** touching, but don't **block** |
| `onCollide("player", "coin", (player, coin) => { ... })`(js) | Runs when the player touches a coin             |
| `currentLevel >= levels.length`(js)          | `true`(js) when there are **no levels left**                   |
| `loseLife()`(js)                             | Takes a life. If there are lives left, it calls `go("game")`(js) to **restart** the level |

> [!IMPORTANT]
> The player has a `body()`(js), and that's enough for the player. But every coin, spike and exit needs `area({ isSensor: true })`(js). Without it, the bean walks straight through them and **nothing happens**, with no error!

> [!NOTE]
> The `pos(...)`(js) in a tile **nudges** it inside its square. The spike is only 21 pixels tall, so `pos(0, 43)`(js) pushes it down to sit on the floor.


## **P**redict

The tiles, the levels, the HUD, `addControls(player)`(js) and `loseLife()`(js) are all done for you. Here's the new code:

```js
function nextLevel() {
    currentLevel = currentLevel + 1

    if (currentLevel >= levels.length) {
        go("win")
        return
    }

    go("game")
}

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

    onCollide("player", "spike", (player) => {
        destroy(player)
        loseLife()
    })

    onCollide("player", "exit", () => {
        nextLevel()
    })
})

go("game")
```

What happens when the bean touches a coin? What about a spike?

<response>

The game has **two** levels. Trace `nextLevel()`(js) for when the bean reaches the exit on level 1, and then again on level 2. What is `currentLevel`(js) each time, and where does the game go?

<response>

`loseLife()`(js) restarts the level with `go("game")`(js). What do you think will happen to the coins you had already collected in that level?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```

```js id=kaplay
kaplay({
    width: 768, height: 576,
    background: [110, 180, 240]
})

loadBean()
loadSprite("grass",  "assets/images/grass.png")
loadSprite("steel",  "assets/images/steel.png")
loadSprite("coin",   "assets/images/coin.png")
loadSprite("spike",  "assets/images/spike.png")
loadSprite("portal", "assets/images/portal.png")

setGravity(1600)

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

const tiles = {
    "=": () => [sprite("grass"), area(), body({ isStatic: true })],
    "#": () => [sprite("steel"), area(), body({ isStatic: true })],
    "$": () => [sprite("coin"), pos(18, 15), area({ isSensor: true }), "coin"],
    "^": () => [sprite("spike"), pos(0, 43), area({ isSensor: true }), "spike"],
    ">": () => [sprite("portal"), pos(7, 6), area({ isSensor: true }), "exit"],
    "@": () => [sprite("bean"), area(), body({ jumpForce: 700 }), "player"],
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
    onKeyDown("left", () => {
        player.move(-playerSpeed, 0)
        player.flipX = true
    })

    onKeyDown("right", () => {
        player.move(playerSpeed, 0)
        player.flipX = false
    })

    onKeyPress("space", () => {
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

function endScene(title, message) {
    add([
        text(title, { size: 64 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    add([
        text(message, { size: 28 }),
        pos(width() / 2, 300),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        resetGame()
        go("game")
    })
}

scene("gameover", () => {
    endScene("Game Over", "Press SPACE to try again")
})

scene("win", () => {
    endScene("You win!", `You found ${coins} coins. Press SPACE to play again`)
})
```
</web-playground>

Run the code and compare it with your predictions.

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
function nextLevel() {
    currentLevel = currentLevel + 1

    if (currentLevel >= levels.length) {
        go("win")
        return
    }

    go("game")
}

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

    onCollide("player", "spike", (player) => {
        destroy(player)
        loseLife()
    })

    onCollide("player", "exit", () => {
        nextLevel()
    })
})

go("game")
```

</web-playground>


## **I**nvestigate

1. On level 2, collect a coin, then touch the spikes. What happens to the coins in the level? What happens to your **coin count**? Is that fair? How could you make it fairer?

    <response>

2. Delete `destroy(player)`(js) from the spike collision. Now jump and land right in the **middle** of the two spikes. How many lives do you lose? Why does destroying the player first fix this?

    <response>

3. Why must `currentLevel`(js) be made **outside** the `game` scene, and not inside it?

    <response>

### Level by Level

Step through this code. It pretends the player has reached three exits in a row:

```js trace header="false"
const levels = ["Meadow", "Cave", "Castle"]
let currentLevel = 0

for (let exits = 1; exits <= 3; exits++) {
    currentLevel = currentLevel + 1

    if (currentLevel >= levels.length) {
        console.log("You win!")
    } else {
        console.log(`Welcome to the ${levels[currentLevel]}`)
    }
}
```

There are **3** levels. Why do we check `>=`(js) and not `>`(js)?

<response>

### Through the Portal

<drag-drop mode="code" title="Next Level" sub-title="Drag the descriptions into the right order">

1.
    ```js
    onCollide("player", "exit", ...)
    ```

2.
    ```js
    currentLevel = currentLevel + 1
    ```

3.
    ```js
    if (currentLevel >= levels.length)
    ```

4.
    ```js
    go("game")
    ```

5.
    ```js
    addLevel(levels[currentLevel], ...)
    ```

---

1. The player touches the portal
2. Move on to the next level number
3. Check if there are any levels left
4. Throw away the old level, and start the scene again
5. Build the new level from its map

</drag-drop>


## **M**odify

### Bug Hunt

This game has **three bugs**. Find and fix them, in order!

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
function nextLevel() {
    currentLevel = currentLevel + 1

    if (currentLevel > levels.length) {
        go("win")
        return
    }

    go("game")
}

scene("game", () => {
    currentLevel = 0

    const level = addLevel(levels[currentLevel], {
        tileWidth: 64,
        tileHeight: 64,
        tiles: tiles,
    })

    const player = level.get("player")[0]

    createHud()
    addControls(player)

    onCollide("player", "coins", (player, coin) => {
        destroy(coin)
        coins = coins + 1
    })

    onCollide("player", "spike", (player) => {
        destroy(player)
        loseLife()
    })

    onCollide("player", "exit", () => {
        nextLevel()
    })
})

go("game")
```

</web-playground>

1. <check> The bean walks **straight through** the coins
2. <check> Going through the portal puts you **back on level 1**, every time
3. <check> After the last level, a blue **error screen** says *Cannot read properties of undefined*, instead of "You win!"

> [!TIP]
> For the last bug: something is `undefined`. There are two levels, `levels[0]`(js) and `levels[1]`(js). What is `levels[2]`(js)?


### Tinker

Go back to the **working** game in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Make every coin worth **5**
2. <check> Make the bean do a little **hop** when it grabs a coin, with `player.jump(300)`(js)
3. <check> Make the game **start on level 2**. (Hint: what should `currentLevel`(js) be, just before `go("game")`(js)?)
4. <check> **Hard mode**: touching a spike sends you all the way back to **level 1**


## **M**ake

### More Levels

Add **your own levels** to the game. `levels`(js) is an array, so you can add a new map to the end with `levels.push(...)`(js), just like the inventory in Week 4.

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// TODO: plan two new levels on paper, then add them here. Keep every row 12 characters long!
levels.push([
    "            ",
    "            ",
    "            ",
    "            ",
    "            ",
    "            ",
    "            ",
    "@          >",
    "============",
])

function nextLevel() {
    currentLevel = currentLevel + 1

    if (currentLevel >= levels.length) {
        go("win")
        return
    }

    go("game")
}

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

    onCollide("player", "spike", (player) => {
        destroy(player)
        loseLife()
    })

    // TODO: only go to the next level if every coin in this level has been collected
    onCollide("player", "exit", () => {
        nextLevel()
    })
})

go("game")
```

</web-playground>

Your game must have:

- <check> **Two new levels** of your own, planned on paper first
- <check> Levels that get **harder** as you go, and every one can be **finished** (playtest them!)
- <check> An exit that only works once **every coin** in the level has been collected

> [!TIP]
> The tiles are **children** of the level, so to count the coins that are left, use `get("coin", { recursive: true }).length`(js). If it's more than `0`(js), `return`(js) before calling `nextLevel()`(js).


### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                         | Hint                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A **heart** that gives an extra life              | `loadSprite("heart", ...)`(js), a new tile in `tiles`(js) with a sensor and a tag, and an `onCollide(...)`(js) |
| A **bounce pad** that throws the bean up high     | A `mushroom` tile with a sensor. When the player touches it: `player.jump(1200)`(js)       |
| A message when the exit is **locked**             | Look back at `showMessage(...)`(js) from the Haunted House in Week 4                       |
| A **fair** coin count                             | Remember how many coins you had when the level started, and put that back in `loseLife()`(js) |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # The bean walks through a coin, and nothing happens. There's no error. What is the most likely reason?

    ---

    - [ ] The coin is too small
    - [x] The coin has no `area({ isSensor: true })`, or its tag doesn't match the `onCollide`
    - [ ] The player has no `body()`
    - [ ] `coins` is not a number

- # A game has 4 levels, and `currentLevel` has just gone up to 4. What should happen?

    ---

    - [ ] Load `levels[4]`
    - [ ] Go back to level 1
    - [x] Go to the win scene, because there are no levels left
    - [ ] Nothing

- # Why does `go("game")` give us a fresh level?

    ---

    - [ ] Because it deletes the `levels` array
    - [x] Because it throws away every object in the old scene, and the scene builds the level again from its map
    - [ ] Because it resets every variable
    - [ ] Because it reloads the web page

</quiz>
