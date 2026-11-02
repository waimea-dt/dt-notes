# Lesson 4: Build a Shooter

This week you've learned how to make a ship that **fires**, enemies that **fall** and **explode**, and a game with **lives**, **scenes** and **difficulty**. Today there's no recipe to follow: you're going to **design and build your own shooter**.

## Warm-Up

Try not to look back at the previous lessons...

1. What two things does a collision need, for Kaplay to notice it?

    <response>

2. Why does the game scene start by setting `score` and `lives`?

    <response>

3. How does `offscreen({ destroy: true })`(js) help keep a game running smoothly?

    <response>


## Learning Goals

- <check> I can **design** a shooter with a ship, enemies, bullets and rules
- <check> I can build a game from **scenes**, with state kept in **global** variables
- <check> I can use **helper functions** to keep my code short
- <check> I can **playtest** a game and improve it


## The Brief

Design and build a **shooter** of your own. It could be a spaceship blasting aliens, a gardener zapping bugs, a ghost-hunter, a fish defending the reef... anything where the player **dodges** and **shoots** things.

Here's one made with the code from this week. Yours should look and play differently!

<web-playground data-height="48em" hide-all>

```html load=_assets/kaplay.html
```

```css load=_assets/kaplay.css
```

```js load=_assets/bug-blaster.js
```

</web-playground>

### Your Game Must Have

- <check> A **player** that moves and **shoots**, with bullets that are **cleaned up**
- <check> **At least two kinds of enemy**, that are different in some way, and that **explode** when hit
- <check> A **score** and **lives** on a HUD, and a **game over** when the lives run out
- <check> A **title** scene, a **game** scene and a **game over** scene, with a **fresh start** each time
- <check> A game that gets **harder** as you play
- <check> Your own **theme**: your own pictures, colours, words and speeds

> [!IMPORTANT]
> Make something **you** would want to play! The theme, the look and the feel are your own choices.


## Your Toolkit

Here are the helper functions you have built this week. Copy them into your `main.js`, and then **change them to suit your game**: new pictures, new names, new speeds.

```js
// The state of the game: outside every scene, so every scene can see it
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

// Enemies get faster as the score goes up
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
```

The toolkit needs `loadBean()`(js) and the `beetle` and `star` pictures loaded. You'll need to add the `kaplay({ ... })`(js) setup, your own scenes (`title`, `game`, `gameover`) and a final `go("title")`(js) yourself. You've written them all this week!

Read the toolkit, and answer these questions:

1. If your game had **three** kinds of enemy, which functions would you change? What would you add to the `game` scene?

    <response>

2. `addPlayer()`(js) registers keyboard events. Why is it a problem to call it **twice** in the same scene?

    <response>

3. How would you add a **second weapon** (a bomb on the `B` key)? List the places in the code you'd touch.

    <response>


## Plan First

Before you write any code, plan your game. Write your answers below, then **show your teacher** before you start building.

1. What's your **theme**, and what's your game called?

    <response>

2. **Sketch the screen** on paper: where's the player, what do the **enemies** look like, what do the **bullets** look like? Which pictures from `assets/images` will you use?

    <response>

3. What are your **two kinds of enemy**, and how are they different? How does the game get **harder**?

    <response>

4. How does the player **lose**? Is there any way to **win**?

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

1. <check> **Checkpoint 1: Ship.** The toolkit is in, your ship moves and shoots, and your own pictures are used
2. <check> **Checkpoint 2: Enemies.** Two kinds of enemy fall, and explode when shot, and the score goes up
3. <check> **Checkpoint 3: Danger.** Lives, `loseLife()`(js), and a game over you can restart from
4. <check> **Checkpoint 4: Scenes and difficulty.** Title and game over scenes, and a game that gets harder

> [!TIP]
> Stuck? Think about **where** the problem is. Nothing happens when things touch? Check `area({ isSensor: true })`(js) on **both** objects. Things don't go away? Check the Console for errors, and check `offscreen`(js). A second game starts oddly? Check the state is reset at the start of the `game` scene.


## Playtest

Swap computers with a partner and play each other's game. Don't explain anything: just watch and listen!

Get your partner to note down some feedback for you:

1. Was it **fun**? What was the best bit?

    <response>

2. Was it too **easy** or too **hard**? How long did they last?

    <response>

3. Did you spot any **bugs**, or anything confusing?

    <response>

4. What is **one improvement** you'd make?

    <response>

> [!IMPORTANT]
> Good feedback is **specific**. "It's boring" isn't helpful. "I didn't notice I'd lost a life" is!


## Level Up

Finished early? Pick **at least one** that sounds fun. Or invent your own!

| Challenge                                                             | Hint                                                                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Enemies that **shoot back**                                           | `wait(rand(1, 3), ...)`(js) inside the enemy, adding a bullet that moves **down**, with its own tag |
| **Power-ups** that fall from destroyed enemies                        | `chance(0.2)`(js) in the hit handler, and `onCollide("player", "powerup", ...)`(js)            |
| A **boss** that needs lots of hits                                    | A `health`(js) property, like the tough enemy in Lesson 2                                      |
| **Levels**: a harder wave after 200 points                            | A `let level = 1`(js) variable that goes up as the score does                                  |
| **Sounds** for shooting, explosions and game over                     | `loadSound(...)`(js) and `play(...)`(js)                                                       |
| A **cooldown** on the weapon                                          | A `canShoot`(js) variable and `wait(...)`(js)                                                  |


## Week 5 Check

Before you finish the week, answer these questions on your own.

<quiz>

- # How do we make every bullet move up the screen?

    ---

    - [ ] Write `bullet.move(...)` when we create it
    - [x] `onUpdate("bullet", (bullet) => { bullet.move(0, -bulletSpeed) })`
    - [ ] `onKeyPress("space", ...)`
    - [ ] `loop(1, ...)`

- # Two objects touch, but `onCollide` never runs and there's no error. What should you check first?

    ---

    - [ ] The size of the screen
    - [ ] The speed of the objects
    - [x] That both objects have `area({ isSensor: true })`
    - [ ] That the objects have `anchor("center")`

- # Why do we put `offscreen({ destroy: true })` on bullets?

    ---

    - [ ] So they are invisible
    - [x] So bullets that have left the screen don't pile up and slow the game down
    - [ ] So they move faster
    - [ ] So they can't hit anything

- # A shooter has `lives` and `score` outside the scenes. Why does `scene("game", ...)` set `score = 0` and `lives = 3` at the start?

    ---

    - [ ] Because variables must be set in scenes
    - [x] So that every new game starts fresh
    - [ ] To show them on the HUD
    - [ ] To save the high score

- # Which makes bugs fall faster as the game goes on?

    ---

    - [ ] `{ speed: 150 }`
    - [x] `{ speed: rand(100, 200) + score / 2 }`
    - [ ] `{ speed: rand(100, 200) }`
    - [ ] `{ speed: lives }`

</quiz>
