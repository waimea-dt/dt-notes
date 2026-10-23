# Week 2: Clicks, Counts & State


## Lesson 1: Mouse Events

<slides>

# Lesson 1: Mouse Events

Note:
Last week was the keyboard. This week adds the mouse, game memory (state) and timers

---

## Learning

- Making objects **clickable** with `area()`
- Responding to **clicks** and **hovers**
- Finding the **mouse position**
- **Changing** an object while the game runs

---

## Objects Need an Area

```js
add([
    rect(160, 60),
    pos(200, 150),
    area(),          // I can be clicked!
    "button",        // I'm a "button"
])
```

`area()` gives an object an invisible **hit zone**

Note:
- No area() means no clicks and no hovers (and no collisions later)
- Tags again: the word in quotes

---

## Responding to the Mouse

```js
onClick("button", (btn) => {
    btn.color = rgb(255, 100, 100)
})
```

`btn` is the **exact object** that was clicked

Note:
One handler looks after every object with the tag. Ask: what would btn be with three buttons?

---

## Mouse Functions

| Function       | Runs                          |
| -------------- | ----------------------------- |
| `onClick`      | when an object is clicked     |
| `onHover`      | once, mouse moves **onto** it |
| `onHoverEnd`   | once, mouse moves **off** it  |
| `mousePos()`   | *gives* the mouse position    |

Note:
mousePos() uses the same coordinates as pos(): top-left is (0, 0)

---

## Make: Pop Party

- At least **10 balloons**
- Random positions and colours
- Balloons **pop** when clicked

Note:
Early finishers: hover effects, growing balloons, click anywhere to add a balloon

</slides>



## Lesson 2: Game State

<slides>

# Lesson 2: Game State

Note:
The game needs a memory: score, lives, game over

---

## Learning

- What **game state** is
- Storing state in **variables**
- Showing state with `text()` labels
- Detecting **game over**

---

## What is Game State?

Everything the game needs to **remember right now**

| Game       | Some of its state          |
| ---------- | -------------------------- |
| Pop Party  | score, balloons left       |
| Shooter    | lives, which enemies live  |
| Platformer | level, coins collected     |

Note:
Link back to Lesson 1 of Week 1: numbers, strings, booleans. Ask for the state in a game they play

---

## State in Variables

```js
let score = 0            // number
let lives = 3            // number
let isGameOver = false   // boolean
```

State that **changes** needs `let`

---

## Show It on Screen

```js
const scoreLabel = add([
    text("Score: 0", { size: 28 }),
    pos(20, 20),
])

score = score + 10
scoreLabel.text = `Score: ${score}`
```

Change the **variable** *and* the **label**!

Note:
The classic bug: the variable changes but the label doesn't. It's in the Predict step

---

## Losing Lives

```js
lives = lives - 1
livesLabel.text = `Lives: ${lives}`

if (lives === 0) {
    isGameOver = true
}
```

Update the label **before** checking for game over

---

## Make: Balloon Pop

- **Score** goes up when balloons are popped
- **Lives** go down when balloons escape
- Both shown on screen
- **Game Over** stops the game

</slides>



## Lesson 3: Timers & Randomness

<slides>

# Lesson 3: Timers & Randomness

Note:
So far nothing happens unless the player acts. Real games keep going on their own

---

## Learning

- Running code later with `wait(...)`
- Repeating code with `loop(...)`
- Adding chance: `rand(...)`, `choose(...)`
- Countdown timers

---

## Wait and Loop

```js
wait(2, () => {
    // runs ONCE, after 2 seconds
})

loop(2, () => {
    // runs every 2 seconds
})
```

Note:
- Seconds, NOT milliseconds! wait(2000, ...) is over half an hour
- Another arrow function: "run this later"

---

## Chance

| Code                      | Gives you                    |
| ------------------------- | ---------------------------- |
| `rand(10, 50)`            | a random number from 10 to 50 |
| `choose(["a", "b", "c"])` | one random item from a list   |
| `get("hole")`             | a list of all objects tagged `"hole"` |

```js
const hole = choose(get("hole"))
```

---

## Still There?

```js
wait(2, () => {
    if (balloon.exists()) {
        destroy(balloon)
    }
})
```

`exists()` tells us if an object is **still in the game**

Note:
Kaplay won't crash if it's already gone, but exists() tells you what happened. Popped or escaped?

---

## Countdown

```js
let timeLeft = 15
let isGameOver = false

loop(1, () => {
    if (isGameOver) { return }

    timeLeft = timeLeft - 1
    timeLabel.text = `Time: ${timeLeft}`

    if (timeLeft === 0) {
        isGameOver = true
    }
})
```

Note:
`return` quits the function early: a guard clause. Use it in every loop and click handler once the game is over

---

## Make: Timed Balloons

- **15 second** countdown on screen
- Balloons appear every second, and vanish after two
- **"Time's up!"** when it reaches 0
- No scoring once time is up

</slides>



## Lesson 4: Whack-a-Bug

<slides>

# Lesson 4: Whack-a-Bug

Note:
Build day. Everything from the week in one game. Insist they test after every step

---

## Learning

- Building a game in **small steps**
- Using a **nested loop** to make a grid
- Combining **mouse**, **state** and **timers**
- **Playtesting** and giving feedback

---

## The Game

Bugs pop out of **holes**...

Squash them **before they vanish**...

...and before **time runs out**!

Note:
Show the demo on the Week 2 intro page. Mention the friendly ghost (a Level Up)

---

## The Steps

1. Load the sprites
2. A **grid of holes**
3. Bugs appear in random holes
4. Squash them and **score**
5. **Countdown** and game over

*Test after every step!*

---

## Nested Loops

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

When `row` is `1` and `col` is `2`, where is the hole?

Note:
x = 200 + 2 x 200 = 600, y = 220 + 1 x 150 = 370. The inner loop runs 3 times for every lap of the outer loop

---

## Playtesting

Swap computers with a partner...

- Watch, don't explain
- Was it **fun**? **Fair**?
- Any **bugs**?
- **One** improvement

Note:
Specific feedback: "The bugs vanish before I can click them" beats "It's rubbish"

---

## Level Up

- A friendly **ghost**
- Bugs get **faster**
- **Lives** instead of a timer
- A **high score**

Note:
Finish with the Week 2 Check quiz (about 10 minutes, individually)

</slides>
