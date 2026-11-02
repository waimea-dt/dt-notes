# Lesson 3: Lives & Difficulty

Right now your bugs are harmless: they fall off the bottom and nothing happens. A real game needs **danger** and **a way to lose**. In this lesson you'll add **lives**, a **game over**, and a game that gets **harder** the better you play.

## Warm-Up

Try not to look back at the previous lessons...

1. What does the `isSensor` option do in `area({ isSensor: true })`(js)?

    <response>

2. In `onCollide("bullet", "enemy", (bullet, enemy) => { ... })`(js), what is `enemy`?

    <response>

3. Why do we keep `score` and `lives` **outside** the scenes?

    <response>


## Learning Goals

- <check> I can keep the player's **lives** in state, and show them on the HUD
- <check> I can put the code for losing a life in **one function**
- <check> I can **reset** the state each time a game starts
- <check> I can make a game **harder** as the score goes up


## The Big Idea: **State Drives the Game**

You already know the pattern from last week's haunted house: **global state**, a **HUD** that watches it, and **scenes** that use it. A shooter is the same. The new part is that the state now makes the game **harder**:

| State   | What it controls                                         |
| ------- | -------------------------------------------------------- |
| `lives` | When the game is **over**                                |
| `score` | How **fast** the bugs fall: `rand(100, 200) + score / 2`(js) |

Losing a life happens in **two places**: a bug hits the ship, or a bug gets past it. Rather than writing the same code twice, we put it in **one function** and call it from both:

```js
function loseLife() {
    lives = lives - 1
    shake(12)

    if (lives <= 0) {
        go("gameover")
    }
}
```

> [!IMPORTANT]
> Each game must start **fresh**. The first lines of `scene("game", ...)`(js) set `score = 0`(js) and `lives = 3`(js), so every new game begins the same way.


## **P**redict

The title scene and game over scene are done for you, along with the ship from last lesson. Here is the game scene:

```js
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
```

In what **two ways** can the player lose a life?

<response>

You've scored **200** points. About how fast is a new bug falling, compared to a bug at the start of the game?

<response>

What would the player see if you **removed** the line `lives = 3`(js)? Think about the **second** game you play.

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```

```js id=kaplay
kaplay({
    width: 600, height: 700,
    background: [10, 10, 40]
})

loadBean()
loadSprite("beetle", "assets/images/beetle.png")
loadSprite("star",   "assets/images/star.png")

// The state of the game
let score = 0
let lives = 3
let highScore = 0

const playerSpeed = 400
const bulletSpeed = 700

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

// The ship, with its controls and bullets
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

    onKeyPress("space", () => {
        go("game")
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
```
</web-playground>

Run the game and compare it with your predictions. Play until you lose, then play again.

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
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
```

</web-playground>


## **I**nvestigate

### Trace the Difficulty

Step through the code. It works out the speed of a new bug as the score climbs:

```js trace header="false"
let score = 0
let speed = 150 + score / 2
console.log(`Start: ${speed}`)

score = score + 100
speed = 150 + score / 2
console.log(`After 100 points: ${speed}`)

score = score + 300
speed = 150 + score / 2
console.log(`After 400 points: ${speed}`)
```

How much faster are the bugs after 400 points? Is that too hard, too easy, or about right?

<response placeholder="Observations...">

### Why a Function?

1. `loseLife()`(js) is called from **two** places. What would be annoying about having the same three lines in both places?

    <response>

2. Which line in `loseLife()`(js) ends the game? What does `go("gameover")`(js) do to the bugs and bullets on the screen?

    <response>

### Starting Fresh

The first lines of the game scene have got mixed up. Put them in the order that makes sense.

<drag-drop mode="code" title="Start a New Game" sub-title="">

1.
    ```js
    score = 0
    ```

2.
    ```js
    lives = 3
    ```

3.
    ```js
    createHud()
    ```

4.
    ```js
    addPlayer()
    ```

</drag-drop>


## **M**odify

### Bug Hunt

This game has **three bugs**. Find and fix them.

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
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

    if (lives < 0) {
        go("gameover")
    }
}

scene("game", () => {
    score = 0

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
    })
})
```

</web-playground>

1. <check> Crashing into a bug **doesn't cost a life**
2. <check> The game **doesn't end** until the lives reach `-1`
3. <check> The **second** game you play starts with the **wrong number of lives**

> [!TIP]
> For the last one, think about the **state** at the start of a new game. What should it be? Is anything setting it?


### Tinker

Go back to the **working** game in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Start with **5 lives**. How many lines did you have to change?
2. <check> Make the game get harder **faster**
3. <check> Change `loseLife()`(js) to `loseLife(amount)`(js) so it takes away `amount` lives. Make a bug that gets past you cost **2** lives, but one that hits the ship cost **1**
4. <check> Add a third label to the HUD that shows `Best: ${highScore}`(js)


## **M**ake

### Danger!

Add danger to **your own** shooter. The title and game over scenes are done for you, but change them to suit your game.

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// TODO: createHud(), showing the score and lives

// TODO: addEnemy(), with a speed that depends on the score

// TODO: loseLife(), which ends the game when lives run out

scene("game", () => {
    // TODO: start a fresh game, then add the HUD, the ship and the enemies

    // TODO: enemies that get past the ship, or hit it, cost a life

    // TODO: bullets destroy enemies, with an explosion and some score
})
```

</web-playground>

Your game must have:

- <check> **Lives** shown on the screen, that go down when the ship is **hit** or an enemy **gets past**
- <check> A **game over** when the lives run out
- <check> A **fresh start** every time you play again
- <check> Enemies that get **harder** as the score goes up

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                          | Hint                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| A **heart** falls from the sky and gives a life    | A new tag, and `onCollide("player", "heart", ...)`(js). Don't forget `area({ isSensor: true })`(js) |
| A **bomb** that destroys every bug (press `B`)     | `destroyAll("enemy")`(js), and an explosion for each: `for (const enemy of get("enemy"))`(js) |
| A moment of **safety** after the ship is hit       | A `let isSafe = false`(js) variable, and `wait(1, ...)`(js) to turn it off                    |
| A **bigger boom** as the game gets harder          | `shake(score / 20)`(js)                                                                       |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # Why does the game scene start with `score = 0` and `lives = 3`?

    ---

    - [ ] To make the game faster
    - [x] So every new game starts fresh, instead of with the numbers from the last game
    - [ ] Because variables must be set inside scenes
    - [ ] To show the score on the HUD

- # A new bug is given the speed `rand(100, 200) + score / 2`. What happens as the score goes up?

    ---

    - [ ] Nothing, the bugs always fall at the same speed
    - [ ] The bugs get slower
    - [x] New bugs fall faster
    - [ ] Bugs appear more often

- # Why do we put the code for losing a life in a function called `loseLife()`?

    ---

    - [ ] Functions run faster
    - [x] It's needed in two places, so we write it once and call it from both
    - [ ] Kaplay requires it
    - [ ] So the HUD can update

</quiz>
