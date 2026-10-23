# Lesson 3: Timers & Randomness

So far, nothing happens in our games unless the player does something. Real games **keep going** on their own: enemies appear, time runs out, things happen by chance. In this lesson you'll use **timers** and **randomness** to bring a game to life.

## Warm-Up

Try not to loop back at the previous lessons...

1. We change a `score` variable, but the label on the screen doesn't change. What have we forgotten to do?

    <response>

2. What type of variable would you use to track whether the game is over?

    <response>

3. What would `rand(0, width())`(js) give us?

    <response>


## Learning Goals

- <check> I can run code **once** after a delay with `wait(...)`(js)
- <check> I can run code **again and again** with `loop(...)`(js)
- <check> I can make **random choices** with `rand(...)`(js) and `choose(...)`(js)
- <check> I can make a **countdown timer**
- <check> I can use `exists()`(js) to find out if an object is **still in the game**


## The Big Idea: **Time** and **Chance**

Kaplay has built-in **timers**. You tell it *how long to wait* and *what to do* when the time is up:

| Function                    | What it does                                  |
| --------------------------- | --------------------------------------------- |
| `wait(2, () => { ... })`(js) | Runs the code **once**, after **2 seconds**  |
| `loop(2, () => { ... })`(js) | Runs the code **every 2 seconds**, over and over |

> [!WARNING]
> Kaplay timers use **seconds**, not milliseconds. `wait(2, ...)`(js) waits for 2 seconds. If you write `wait(2000, ...)`(js) you'll be waiting for over half an hour!

And some ways to add a bit of **chance**:

| Function                          | What it does                                   |
| --------------------------------- | ---------------------------------------------- |
| `rand(10, 50)`(js)                | A random number between 10 and 50              |
| `choose(["red", "green", "blue"])`(js) | Picks **one** item from a list, at random |
| `get("hole")`(js)                 | A list of **all** objects with the tag `"hole"` |

> [!TIP]
> `get("hole")`(js) gives us a list. Put it inside `choose(...)`(js) and we get a **random hole**: `choose(get("hole"))`(js)

### Does it still exist?

When a `wait(...)`(js) finishes, the object it was created for might be **gone already**. For example, the player may have popped the balloon. The `exists()`(js) function tells us whether an object is **still in the game**:

```js
wait(2, () => {
    if (balloon.exists()) {
        // Nobody popped it. It's still here after 2 seconds!
        destroy(balloon)
    }
})
```

> [!NOTE]
> Kaplay is forgiving. Destroying something that's already gone won't crash your game. But `exists()`(js) is the way to find out **what happened** to an object: was it popped, or did it escape? We'll make use of this soon.


## **P**redict

Look at this Kaplay program. A function (`() => { ... }`) is passed to `loop` and `wait`. Kaplay runs it later, at the right moment:

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

loadSprite("ghost", "assets/images/ghost.png")

loop(1, () => {
    add([
        sprite("ghost"),
        pos(rand(0, width() - 52), rand(0, height() - 60)),
    ])
})

wait(5, () => {
    add([
        text("Boo!", { size: 64 }),
        pos(center()),
        anchor("center"),
    ])
})
```

Fill in what you think the screen will show at each time:

| Time         | What is on the screen? |
| ------------ | ---------------------- |
| After 0.5 s  | <response>             |
| After 3.5 s  | <response>             |
| After 5.5 s  | <response>             |
| After 10 s   | <response>             |


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run the code and watch it for 10 seconds. Compare it with your prediction - any differences?

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

loadSprite("ghost", "assets/images/ghost.png")

loop(1, () => {
    add([
        sprite("ghost"),
        pos(rand(0, width() - 52), rand(0, height() - 60)),
    ])
})

wait(5, () => {
    add([
        text("Boo!", { size: 64 }),
        pos(center()),
        anchor("center"),
    ])
})
```

</web-playground>


## **I**nvestigate

### Wait vs Loop

What's the difference between `wait(...)`(js) and `loop(...)`(js)? When would you use each in a game?

<response>

### Matching

Match each piece of code to what it does.

<drag-drop mode="code" title="What Does It Do?" sub-title="Drag the descriptions into the right order">

1.
    ```js
    wait(2, () => { ... })
    ```

2.
    ```js
    loop(2, () => { ... })
    ```

3.
    ```js
    rand(0, 100)
    ```

4.
    ```js
    choose(["a", "b", "c"])
    ```

---

1. Runs some code once, after two seconds
2. Runs some code every two seconds
3. Gives a random number between 0 and 100
4. Picks one item from a list at random

</drag-drop>

### Countdown

A countdown timer is just a variable that gets smaller each second. Step through this code, pretending that each line runs one second apart.

```js trace header="false"
let timeLeft = 3

timeLeft = timeLeft - 1
timeLeft = timeLeft - 1
timeLeft = timeLeft - 1

console.log(timeLeft)
```

What would we need to **check** after each second, to know when the game is over?

<response>

### Spawn, Then Vanish

A bug appears in a random hole, then disappears again after a second. Put the code in order.

<drag-drop mode="code" title="Appear and Vanish" sub-title="Choose a hole, add the bug, then schedule its disappearance">

1.
    ```js
    const hole = choose(get("hole"))
    ```

2.
    ```js
    const bug = add([
        sprite("bug"),
        pos(hole.pos.x, hole.pos.y),
        anchor("center"),
        "bug",
    ])
    ```

3.
    ```js
    wait(1, () => {
        if (bug.exists()) {
            destroy(bug)
        }
    })
    ```

</drag-drop>


## **M**odify

### Bug Hunt

This game should add a new balloon every second, and each balloon should vanish after two seconds. It has **two bugs**. Find and fix them.

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

loop(1000, () => {
    const balloon = add([
        circle(25),
        pos(rand(40, width() - 40), rand(40, height() - 40)),
        color(255, 100, 100),
        area(),
        "balloon",
    ])

    wait(2, destroy(balloon))
})

onClick("balloon", (balloon) => {
    destroy(balloon)
})
```

</web-playground>

> [!TIP]
> `wait(...)`(js) wants a **function** to run later. Is `destroy(balloon)`(js) a function, or the **result** of running one?

### Tinker

Here's a working balloon spawner. Complete the tasks one at a time. Test after each change!

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

loop(1, () => {
    const balloon = add([
        circle(25),
        pos(rand(40, width() - 40), rand(40, height() - 40)),
        color(255, 100, 100),
        area(),
        "balloon",
    ])

    wait(2, () => {
        if (balloon.exists()) {
            destroy(balloon)
        }
    })
})

onClick("balloon", (balloon) => {
    destroy(balloon)
})
```

</web-playground>

Tasks:

1. <check> Make balloons appear **twice as fast**
2. <check> Make each balloon's colour **random** (hint: `choose(...)`(js) can pick from a list of colours, such as `[rgb(255, 100, 100), rgb(100, 255, 100)]`(js))
3. <check> Make each balloon **last longer** or **shorter** by random (hint: `rand(...)`(js) can go inside `wait(...)`(js))
4. <check> Count the balloons that **escape** (vanish without being popped) and show the total in a label. (hint: if `balloon.exists()`(js) is still `true` when the `wait(...)`(js) finishes, nobody popped it!)


## **M**ake

### Timed Balloons

Add a **countdown timer** to the balloon game. Your game must have:

- <check> A **15 second** countdown shown on screen
- <check> A **score** that goes up when balloons are popped
- <check> When the time reaches **0**, no more balloons appear, and **"Time's up!"** is shown
- <check> The player **can't** score once time is up

> [!TIP]
> Use an `isGameOver` variable, just like last lesson. Each `loop(...)`(js) function can check it first and use `return`(js) to quit early:
>
> ```js
> loop(1, () => {
>     if (isGameOver) { return }
>     // ... the rest of the code
> })
> ```

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
let timeLeft = 15
let isGameOver = false

const scoreLabel = add([
    text("Score: 0", { size: 28 }),
    pos(20, 20),
])

const timeLabel = add([
    text("Time: 15", { size: 28 }),
    pos(width() - 20, 20),
    anchor("topright"),
])

// TODO: loop every second to count down, update the label, and end the game at 0

// TODO: loop to add balloons (but not when the game is over)

// TODO: onClick to pop balloons and add to the score (but not when the game is over)

```

</web-playground>

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                           | Hint                                                       |
| --------------------------------------------------- | ---------------------------------------------------------- |
| Balloons appear **faster and faster**               | Store the delay in a `let`(js) variable                    |
| A **bonus balloon** that adds 5 seconds             | Another tag, and `timeLeft = timeLeft + 5`(js)             |
| **Randomly** make a balloon golden (1 in 5 chance)  | `chance(0.2)`(js) is `true` about 1 time in 5              |
| **Restart** the game when the player presses space  | `onKeyPress("space", ...)`(js) and `go(...)`(js)           |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # How often does this code run?

    ```js
    loop(3, () => {
        console.log("Tick")
    })
    ```

    ---

    - [ ] Once, after 3 seconds
    - [x] Every 3 seconds
    - [ ] 3 times per second
    - [ ] Every 3 milliseconds

- # What does `choose(["red", "green", "blue"])` give us?

    ---

    - [ ] All three colours
    - [ ] Always `"red"`
    - [x] One of the colours, picked at random
    - [ ] A random number between 0 and 3

- # Why do we use `if (isGameOver) { return }` at the top of a function?

    ---

    - [ ] To make the game faster
    - [x] To stop the rest of the function running when the game is over
    - [ ] To restart the game
    - [ ] To show the Game Over message

</quiz>
