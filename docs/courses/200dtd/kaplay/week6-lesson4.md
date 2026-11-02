# Lesson 4: Build a Platformer

This week you've learned how to make things **fall** and **jump**, how to **draw** levels with maps, and how to fill them with **coins**, **spikes** and **exits**. Today there's no recipe to follow: you're going to **design and build your own platformer**.

## Warm-Up

Try not to look back at the previous lessons...

1. Why does a coin need `area({ isSensor: true })`(js), when the player only needs `area()`(js) and `body()`(js)?

    <response>

2. How does the game know which level to build when it calls `go("game")`(js)?

    <response>

3. Why should every place the player jumps from have some **sky** above it?

    <response>


## Learning Goals

- <check> I can **design** platformer levels on paper, and turn them into maps
- <check> I can build a game from **scenes**, with state kept in **global** variables
- <check> I can use **helper functions** and **tiles** to keep my code short
- <check> I can **playtest** levels and improve them


## The Brief

Design and build a **platformer** of your own. It could be a robot collecting batteries, a ghost floating through a haunted castle, a cat stealing fish from the kitchen... anything where the player **runs**, **jumps** and **collects** things.

Here's one made with the code from this week. Yours should look and play differently!

<web-playground data-height="40em" hide-all>

```html load=_assets/kaplay.html
```

```css load=_assets/kaplay.css
```

```js load=_assets/coin-dash.js
```

</web-playground>

### Your Game Must Have

- <check> A **player** that runs and jumps, with gravity and a jump that feel **right** for your game
- <check> At least **three levels**, made from maps, that get **harder**
- <check> Something to **collect**, and at least one **hazard**
- <check> **Lives** on a HUD, lost by hazards and by **falling**, and a **game over**
- <check> A **title** scene, a **game** scene, a **game over** scene and a **win** scene, with a **fresh start** each time
- <check> Your own **theme**: your own pictures, colours, words and tiles

> [!IMPORTANT]
> Make something **you** would want to play! The theme, the look and the feel are your own choices.


## Your Toolkit

Here are the helper functions and tiles you have built this week. Copy them into your `main.js`, and then **change them to suit your game**: new pictures, new tiles, new numbers.

```js
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
]

// The state of the game: outside every scene, so every scene can see it
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
        area(),
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

    const livesLabel = add([
        text("", { size: 28 }),
        pos(width() - 20, 20),
        anchor("topright"),
    ])

    coinsLabel.onUpdate(() => {
        coinsLabel.text = `Coins: ${coins}`
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

    // Only jump from the ground, or the player could fly
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

// Losing a life restarts the level
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
```

The toolkit needs `loadBean()`(js) and the `grass`, `coin`, `spike` and `portal` pictures loaded. You'll need to add the `kaplay({ ... })`(js) setup, your own scenes (`title`, `game`, `gameover`, `win`) and a final `go("title")`(js) yourself. Your `game` scene from Lesson 3 is a great place to start!

Read the toolkit, and answer these questions:

1. You want a **lava** tile, `~`(js), that works just like a spike. What would you add, and where?

    <response>

2. Which **two** lines would you change to make the game feel **floaty**?

    <response>

3. Where would you change the code so that the game has **5 lives**? Why are there two places?

    <response>


## Plan First

Before you write any code, plan your game. Write your answers below, then **show your teacher** before you start building.

1. What's your **theme**, and what's your game called?

    <response>

2. Which pictures from `assets/images` will you use for the player, the tiles, the pickups and the hazards? What **character** will each tile be in your maps?

    <response>

3. **Draw your three levels** on grid paper: 12 squares wide, 9 squares tall. How does each level get **harder**?

    <response>

4. How does the player **lose** a life? How do they **win**?

    <response>

- <check> My plan has been looked at by my teacher


## Repo Setup

<github repo="waimea-dt/kaplay-starter" title="Kaplay Starter" subtitle="A repo to kick-off your Kaplay games">

1. Create a **new repo** from the **template** repo above
2. Name it after your game
3. **Clone** it to your computer
4. Open the repo in your **code editor**
5. Launch the **live server** to see the game running in a browser
6. Look in the `assets/images` folder to see the pictures you can use


## Build

Work through these checkpoints, **testing as you go**. Show your teacher when you reach each one.

1. <check> **Checkpoint 1: Run and jump.** The toolkit is in, your first level is built from its map, and the player runs and jumps with your own gravity and jump force
2. <check> **Checkpoint 2: Things to do.** Pickups to collect, a hazard that costs a life, falling costs a life, and a HUD
3. <check> **Checkpoint 3: Levels.** Three levels, an exit that leads to the next one, and a win
4. <check> **Checkpoint 4: Scenes.** Title, game over and win scenes, with a fresh start every time

> [!TIP]
> Stuck? Think about **where** the problem is. The player walks through something? Check it has `area({ isSensor: true })`(js), and that its tag matches the `onCollide(...)`(js). A tile is missing? Check its character is in `tiles`(js). The player can't jump? Check for a block just above its head!


## Playtest

### Level Swap

Maps are just **data**, so they're easy to share! Give your partner one of your maps (only the strings), and paste it into their game as a new level. Does your level still work with their tiles and their jump?

### Play Each Other's Game

Swap computers with a partner and play each other's game. Don't explain anything: just watch and listen!

Get your partner to note down some feedback for you:

1. Was it **fun**? Which level was the best?

    <response>

2. Was the jumping **floaty**, **snappy** or just right? Was any jump **impossible**, or **too easy**?

    <response>

3. Did you spot any **bugs**, or anything confusing?

    <response>

4. What is **one improvement** you'd make?

    <response>

> [!IMPORTANT]
> Good feedback is **specific**. "Level 2 is hard" isn't helpful. "I couldn't tell the spikes from the grass" is!


## Level Up

Finished early? Pick **at least one** that sounds fun. Or invent your own!

| Challenge                                                    | Hint                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| A **double jump**                                            | `doubleJump()`(js) on the player, and `player.doubleJump()`(js) on SPACE                      |
| A **bounce pad**                                             | A tile with a sensor and a tag. When the player touches it: `player.jump(1200)`(js)           |
| A **patrolling enemy**                                       | A tile with a sensor and a `{ speed: 100 }`(js) property. `onUpdate("enemy", ...)`(js) moves it, and turns it around (`enemy.speed = -enemy.speed`(js)) every couple of seconds with `loop(...)`(js) |
| A **speedrun timer**                                         | A `let timer = 0`(js) global, `timer = timer + dt()`(js) in an `onUpdate`(js), and a HUD label   |
| A **level select** scene                                     | Number keys that set `currentLevel`(js) and then `go("game")`(js)                             |
| **Sounds** for jumping, coins and losing a life              | `loadSound(...)`(js) and `play(...)`(js)                                                      |

### Bigger Levels: A Scrolling Camera

So far, every level fits on one screen. Real platformers **scroll**: the camera follows the player through a level much bigger than the screen. It takes four changes:

1. **Make wider maps.** Rows can be longer than 12 characters, as long as every row in a map is the **same** length.
2. **Make the camera follow the player.** In the `game` scene:

    ```js
    onUpdate(() => {
        const cameraX = clamp(player.pos.x, width() / 2, level.levelWidth() - width() / 2)
        setCamPos(cameraX, height() / 2)
    })
    ```

    The `clamp(...)`(js) stops the camera showing the empty space past the ends of the level.
3. **Keep the HUD on the screen.** Add `fixed()`(js) to every HUD label, or they'll scroll away with the level!
4. **Fix the edges.** The `clamp(...)`(js) in `addControls(...)`(js) keeps the player on the *screen*, which is now too small. Delete it, and put a **wall** of blocks at each end of your maps instead.


## Week 6 Check

Before you finish the week, answer these questions on your own.

<quiz>

- # What does `body({ isStatic: true })` do?

    ---

    - [ ] Makes the object fall faster
    - [x] Makes a body that never moves, like a floor or a wall
    - [ ] Stops the object being drawn
    - [ ] Makes the object a sensor

- # The player can jump again and again in mid-air. What is missing?

    ---

    - [ ] `setGravity(...)`
    - [ ] `body({ jumpForce: 700 })`
    - [x] An `if (player.isGrounded())` check before `player.jump()`
    - [ ] `area()`

- # A map has the row `"@  ##  $  >"`. What is in column 4?

    ---

    - [ ] The player
    - [x] A `#` tile
    - [ ] Nothing
    - [ ] A coin

- # Why is `currentLevel` made outside the `game` scene?

    ---

    - [ ] So it is a constant
    - [x] So it isn't reset every time `go("game")` rebuilds the scene
    - [ ] Because scenes can't have variables
    - [ ] So the HUD can't see it

- # The player touches two spikes in the same moment, and loses two lives. How do we fix it?

    ---

    - [ ] Only use one spike in each level
    - [ ] Remove `area({ isSensor: true })` from the spikes
    - [x] `destroy(player)` before calling `loseLife()`, so the second spike can't hit it
    - [ ] Call `loseLife()` twice

</quiz>
