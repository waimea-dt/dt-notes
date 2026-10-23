# Lesson 2: Game State

Last lesson you popped balloons, but the game had no memory. It didn't know how many you'd popped, or whether you were winning! In this lesson you'll learn how a game **remembers** things using **state**.

## Warm-Up

Try not to loop back at the previous lesson...

1. What does the `area()` component do?

    <response>

2. What is `btn` in `onClick("button", (btn) => {...})`(js)?

    <response>

3. What is the difference between `onHover`(js) and `onHoverEnd`(js)?

    <response>


## Learning Goals

- <check> I can explain what **game state** is
- <check> I can store state in **variables** (`score`, `lives`, etc.)
- <check> I can show state on screen using the `text()` component
- <check> I can **update** a text label when the state changes
- <check> I can detect **game over** and stop the game


## The Big Idea: **Game State**

**Game state** is everything a game needs to remember right now. Every game has some:

| Game              | Some of its state                                    |
| ----------------- | ---------------------------------------------------- |
| Pop Party         | How many balloons are left? What's the score?        |
| Space shooter     | How many lives? Which enemies are alive?             |
| Platformer        | Which level? How many coins collected?               |
| Dialogue game     | Which line are we on? Did the player take the key?   |

We store state in **variables**, using the data types you met in Lesson 1:

| State          | Variable                   | Type    |
| -------------- | -------------------------- | ------- |
| Score          | `let score = 0`(js)        | Number  |
| Lives          | `let lives = 3`(js)        | Number  |
| Is it all over? | `let isGameOver = false`(js) | Boolean |
| Player name    | `const playerName = "Pat"`(js) | String  |

> [!TIP]
> State that **changes** needs `let`. State that never changes, like a maximum number of lives, can be `const`.

### Showing State: the `text()` component

To put words on the screen we use the `text()`(js) component. To **change** the words later, we set its `.text` property:

```js
const scoreLabel = add([
    text("Score: 0", { size: 28 }),
    pos(20, 20),
])

scoreLabel.text = "Score: 50"
```

> [!IMPORTANT]
> A label doesn't update by itself! Changing the `score` variable changes the **state**. You also have to change the **label** to show it. Always do both.


## **P**redict

Look at this Kaplay program:

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

let score = 0

const scoreLabel = add([
    text("Score: 0", { size: 28 }),
    pos(20, 20),
])

for (let i = 0; i < 8; i++) {
    add([
        circle(25),
        pos(rand(40, width() - 40), rand(100, height() - 40)),
        color(255, 100, 100),
        area(),
        "balloon",
    ])
}

onClick("balloon", (balloon) => {
    destroy(balloon)
    score = score + 10
    scoreLabel.text = `Score: ${score}`
})
```

What will the score label show after you pop **three** balloons?

<response>

What would happen if we deleted the line `scoreLabel.text = ...`(js)? Would the `score` variable still change? Would the screen show it?

<response>


## **R**un

<web-playground hidden>

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

</web-playground>

Run the code and compare it with your predictions. Then try deleting the `scoreLabel.text = ...`(js) line to test your second prediction.

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

let score = 0

const scoreLabel = add([
    text("Score: 0", { size: 28 }),
    pos(20, 20),
])

for (let i = 0; i < 8; i++) {
    add([
        circle(25),
        pos(rand(40, width() - 40), rand(100, height() - 40)),
        color(255, 100, 100),
        area(),
        "balloon",
    ])
}

onClick("balloon", (balloon) => {
    destroy(balloon)
    score = score + 10
    scoreLabel.text = `Score: ${score}`
})
```

</web-playground>


## **I**nvestigate

### Two Things Change

When a balloon is popped, **three** things happen in the handler. Match each line to its job:

<drag-drop mode="code" title="What Does Each Line Do?" sub-title="Drag the descriptions into the right order">

1.
    ```js
    destroy(balloon)
    ```

2.
    ```js
    score = score + 10
    ```

3.
    ```js
    scoreLabel.text = `Score: ${score}`
    ```

---

1. Remove the balloon from the game
2. Change the state (the number in memory)
3. Update the screen so the player can see the change

</drag-drop>

### Trace the State

Step through the code below. It pretends that the player has popped some balloons and lost some lives. What are `score` and `lives` at the end?

```js trace header="false"
let score = 0
let lives = 3

score = score + 10
score = score + 10
lives = lives - 1
score = score + 10
lives = lives - 1

console.log(`Score: ${score}, Lives: ${lives}`)
```

<response placeholder="Observations...">

### State Detective

Imagine a **Flappy Bird** game. What **state** would it need to remember? Think about numbers, booleans and strings.

<response>

### Order Matters

When the player loses a life, we need to: take one off `lives`, update the label, **then** check for game over. Put the lines in order.

<drag-drop mode="code" title="Lose a Life" sub-title="Take a life, update the label, then check for game over">

1.
    ```js
    lives = lives - 1
    ```

2.
    ```js
    livesLabel.text = `Lives: ${lives}`
    ```

3.
    ```js
    if (lives === 0) {
        isGameOver = true
    }
    ```

</drag-drop>


## **M**odify

### Escaping Balloons

In this version the balloons **float upwards**. If a balloon floats off the top of the screen, the player **loses a life**. Run it and let a few balloons escape (don't click them!). What do you notice?

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

let score = 0
let lives = 3
let isGameOver = false

const scoreLabel = add([
    text("Score: 0", { size: 28 }),
    pos(20, 20),
])

const livesLabel = add([
    text("Lives: 3", { size: 28 }),
    pos(width() - 20, 20),
    anchor("topright"),
])

for (let i = 0; i < 8; i++) {
    add([
        circle(25),
        pos(rand(40, width() - 40), rand(300, height() + 300)),
        color(255, 100, 100),
        area(),
        "balloon",
    ])
}

onClick("balloon", (balloon) => {
    destroy(balloon)
    score = score + 10
    scoreLabel.text = `Score: ${score}`
})

onUpdate("balloon", (balloon) => {
    balloon.move(0, -60)

    if (balloon.pos.y < -25) {
        destroy(balloon)
        lives = lives - 1
    }
})
```

</web-playground>

Tasks:

1. <check> The **lives label never changes**! Fix this so it shows the correct number of lives
2. <check> When `lives` reaches `0`, set `isGameOver` to `true` and show a big **"Game Over"** message in the middle of the screen
3. <check> After the game is over, the player can still pop balloons and score points. Use `isGameOver`(js) to **stop** this (hint: `if (isGameOver) { return }`(js) at the top of the click handler)
4. <check> Make popping balloons worth **more points** for balloons higher up the screen

> [!TIP]
> To place text in the middle of the screen, use `pos(center())`(js) and `anchor("center")`(js).


## **M**ake

### Balloon Pop

Take the **Escaping Balloons** code and turn it into a proper game. Your game must have:

- <check> A **score** that goes up when balloons are popped
- <check> **Lives** that go down when balloons escape
- <check> **Both** shown on screen and always correct
- <check> A **Game Over** message that stops the game

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                 | Hint                                              |
| --------------------------------------------------------- | ------------------------------------------------- |
| Keep a **high score** that lasts until you refresh the page | A new `let highScore = 0`(js) variable          |
| **Gold balloons** worth 50 points                         | Another tag, and `color(255, 215, 0)`(js)         |
| Balloons get **faster** as your score goes up             | Store the speed in a `let`(js) variable           |
| Lose a life if you **click and miss**                     | `onClick(() => {...})`(js) with no tag            |
| Show **"You win!"** if the score reaches 200              | `if (score >= 200) {...}`(js)                     |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What is game state?

    ---

    - [ ] The colours used in a game
    - [x] Everything the game needs to remember right now
    - [ ] The name of the game
    - [ ] How fast the game runs

- # The code `score = score + 10`(js) just ran. What does the label on screen show?

    ---

    - [ ] The new score, straight away
    - [x] Nothing has changed, unless we also update the label's `text`
    - [ ] An error
    - [ ] Zero

- # What is the value of `lives` at the end of this code?

    ```js
    let lives = 3
    lives = lives - 1
    lives = lives - 1
    ```

    ---

    - [ ] `3`
    - [ ] `2`
    - [x] `1`
    - [ ] `0`

</quiz>
