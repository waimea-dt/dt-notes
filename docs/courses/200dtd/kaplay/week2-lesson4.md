# Lesson 4: Whack-a-Bug

Time to put it all together! Over the last three lessons you've learned how to respond to the **mouse**, remember **state**, and use **timers** and **randomness**. Today you'll use all of them to build your second game: **Whack-a-Bug**.

## Warm-Up

Try not to loop back at the previous lessons...

1. What's the difference between `wait(...)`(js) and `loop(...)`(js)?

    <response>

2. Which variable type would you use for `isGameOver`: number, string or boolean?

    <response>

3. How do you make a label show the new value of `score`?

    <response>


## Learning Goals

- <check> I can build a game from **small steps**, testing each one
- <check> I can use a **loop inside a loop** to make a grid
- <check> I can combine **mouse events**, **state** and **timers** in one game
- <check> I can **playtest** a game and suggest improvements


## The Plan

In Whack-a-Bug, bugs pop out of a grid of holes. The player has to squash them before they disappear, scoring as many points as possible before time runs out:

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

> [!NOTE]
> The demo above also has a **friendly ladybird** that costs you points if you squash it. That's one of the **Level Ups**!

Work through the steps below, **testing after every step**. Don't move on until the previous step works.


## Repo Setup

<github repo="waimea-dt/kaplay-starter" title="Kaplay Starter" subtitle="A repo to kick-off your Kaplay games">

1. Create a **new repo** from the **template** repo above
2. Name it **kaplay-whack-a-bug**
3. **Clone** it to your computer
4. Open the repo in your **code editor**
5. Save these two images into the `assets/images` folder (right-click, then *Save image as...*):

    ![Bug](assets/images/bug.png) ![Ladybird](assets/images/ladybird.png)

6. Launch the **live server** to see the game running in a browser


## Step 1: Load the Sprites

In `main.js`, start Kaplay with a screen of **800 x 600** and load the sprites:

```js
kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadSprite("bug", "assets/images/bug.png")
```

- <check> The game runs and shows a blank blue screen


## Step 2: A Grid of Holes

We want **nine holes**, in three rows of three. That's a loop (for the rows) with another loop inside it (for the columns). This is called a **nested loop**:

```js
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
```

Add this to your game, then investigate:

1. How many times does the **inner** loop run in total?

    <response>

2. When `row` is `1` and `col` is `2`, where will the hole be? Work out the `x` and `y`.

    <response>

3. Change the `200` and `150` values. What happens to the grid? Which numbers control the space between holes?

    <response>

- <check> Nine dark holes are shown in a 3 x 3 grid


## Step 3: Bugs Appear!

Every so often, a bug should pop out of a **random hole** and vanish a moment later. You've seen the pieces already in the **Spawn, Then Vanish** problem from last lesson.

> [!TIP]
> - Use `loop(...)`(js) to do this every **0.8 seconds**
> - `choose(get("hole"))`(js) picks a random hole
> - Add the bug at the hole's position: `pos(hole.pos.x, hole.pos.y)`(js)
> - Give the bug `area()`(js) and the tag `"bug"`
> - Use `wait(...)`(js) to destroy it after **0.9 seconds** (use `exists()`(js) to check the player hasn't squashed it already)

- <check> Bugs pop up in random holes and disappear again


## Step 4: Squash Them!

Add a **score**, and make the bugs squashable:

> [!TIP]
> - Create a `let score = 0`(js) variable and a **label** to show it
> - Use `onClick("bug", ...)`(js) to destroy the bug and add 1 to the score
> - Remember to **update the label**!

- <check> Squashing a bug adds one to the score on screen


## Step 5: Beat the Clock

Add a **30 second countdown** and a **Game Over** message:

> [!TIP]
> - You'll need `let timeLeft = 30`(js) and `let isGameOver = false`(js)
> - Use another `loop(1, ...)`(js) to count down and update a **time label**
> - When `timeLeft` reaches `0`, set `isGameOver` to `true` and show **"Time's up!"** with the score
> - Add `if (isGameOver) { return }`(js) to your **spawning loop** and your **click handler**, so nothing happens after time's up

- <check> A countdown is shown on screen
- <check> Bugs stop appearing when time is up
- <check> Squashing bugs doesn't change the score after time is up


## Playtest

Swap computers with a partner and play each other's game for a few minutes. Don't explain anything: just watch and listen!

Give your partner feedback:

1. Was it **fun**? What was the best bit?

    <response>

2. Was it too **easy** or too **hard**? Why?

    <response>

3. Did you spot any **bugs**, or anything confusing?

    <response>

4. What is **one improvement** you'd make?

    <response>

> [!IMPORTANT]
> Good feedback is **specific**. "It's rubbish" isn't helpful. "The bugs vanish before I can click them" is!


## Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                  | Hint                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| A **friendly ladybird** that loses points when squashed    | `ladybird.png`, another tag, and `chance(0.2)`(js)           |
| Bugs appear **faster over time**                           | Store the delay in a `let`(js) variable                      |
| **Lives** instead of a timer: lose one when a bug escapes  | If `exists()`(js) is still `true` when the `wait(...)`(js) ends, it escaped |
| Keep a **high score**                                      | A new `let highScore = 0`(js) variable                       |
| A **combo** bonus for squashing bugs quickly in a row      | `time()`(js) gives the seconds since the game started        |
| An **explosion** when a bug is squashed                    | `addKaboom(bug.pos)`(js)                                     |


## Week 2 Check

Before you finish the week, answer these questions on your own.

<quiz>

- # What will the screen show after the code runs and the player clicks the square **twice**?

    ```js
    let clicks = 0
    const label = add([ text("Clicks: 0"), pos(20, 20) ])
    const square = add([ rect(80, 80), pos(100, 100), area(), "square" ])

    onClick("square", () => {
        clicks = clicks + 1
        label.text = `Clicks: ${clicks}`
    })
    ```

    ---

    - [ ] `Clicks: 0`
    - [ ] `Clicks: 1`
    - [x] `Clicks: 2`
    - [ ] `Clicks: ${clicks}`

- # The square in that code is not clickable. Why?

    ```js
    add([ rect(80, 80), pos(100, 100), "square" ])

    onClick("square", () => {
        console.log("Clicked!")
    })
    ```

    ---

    - [ ] The tag is wrong
    - [x] It is missing the `area()` component
    - [ ] `onClick` can't be used with rectangles
    - [ ] It is missing `color()`

- # What are `score` and `lives` after this code runs?

    ```js
    let score = 0
    let lives = 3

    score = score + 5
    lives = lives - 1
    score = score + 5
    ```

    ---

    - [ ] `score` is 5 and `lives` is 3
    - [ ] `score` is 10 and `lives` is 3
    - [x] `score` is 10 and `lives` is 2
    - [ ] `score` is 5 and `lives` is 2

- # What does this code do?

    ```js
    loop(2, () => {
        add([ circle(20), pos(rand(0, width()), rand(0, height())) ])
    })
    ```

    ---

    - [ ] Adds one circle after 2 seconds
    - [x] Adds a circle at a random position every 2 seconds
    - [ ] Adds two circles at the same time
    - [ ] Adds a circle at a random position every 2 milliseconds

- # What is `exists()` used for here?

    ```js
    wait(1, () => {
        if (bug.exists()) {
            destroy(bug)
        }
    })
    ```

    ---

    - [ ] To make the bug appear
    - [x] To check the bug is still in the game (it might have been squashed already)
    - [ ] To make the game faster
    - [ ] To stop the timer

- # You updated `score`, but the screen still shows the old score. What did you forget?

    ---

    - [ ] To use `const` instead of `let`
    - [x] To update the label's `.text`
    - [ ] To use a `loop`
    - [ ] To add `area()` to the label

</quiz>


## Check Yourself

Before you finish the week, make sure you can say "yes" to all of these:

- <check> I can make an object **clickable** and respond to **clicks** and **hovers**
- <check> I can store **state** in variables and show it with a `text()` label
- <check> I can use `wait(...)`(js) and `loop(...)`(js) to make things happen **over time**
- <check> I can use `rand(...)`(js) and `choose(...)`(js) to add **chance**
- <check> I can build a game one **small step** at a time
