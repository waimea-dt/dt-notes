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

- <check> I can run code **once after a delay** with `wait(...)`(js)
- <check> I can run code **again and again** with `loop(...)`(js)
- <check> I can make **random choices** with `rand(...)`(js) and `choose(...)`(js)
- <check> I can make a **countdown timer**
- <check> I can use `exists()`(js) to find out if an object is **still in the game**


## The Big Idea: **Time** and **Chance**

Kaplay has built-in **timers**. You tell it *how long to wait* and *what to do* when the time is up:

| Function                     | What it does                                  |
| ---------------------------- | --------------------------------------------- |
| `wait(2, () => { ... })`(js) | Runs the code **once**, after **2 seconds**   |
| `loop(2, () => { ... })`(js) | Runs the code **repeatedly, every 2 seconds** |

> [!WARNING]
> Kaplay timers use **seconds**, not milliseconds. `wait(2, ...)`(js) waits for 2 seconds. If you write `wait(2000, ...)`(js) you'll be waiting for over half an hour!

### Randomness

And some ways to add a bit of **chance**:

| Function                               | What it does                                    |
| -------------------------------------- | ----------------------------------------------- |
| `rand(10, 50)`(js)                     | A **random number** between 10 and 50           |
| `choose(["red", "green", "blue"])`(js) | Picks **one** item from a list, at random       |
| `get("hole")`(js)                      | A list of **all** objects with the tag `"hole"` |

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

Look at this Kaplay program. A function (`() => { ... }`(js)) is passed to `loop()`(js) and `wait()`(js). Kaplay runs each function later, at the right moment:

```js
kaplay({
    width: 400, height: 600,
    background: [30, 60, 90]
})

loadSprite("ghost", "assets/images/ghost.png")

loop(1, () => {
    add([
        sprite("ghost"),
        pos(rand(50, width() - 50), rand(50, height() - 50)),
        anchor("center")
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

Fill in what you think the **screen will show** at each time:

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

<web-playground data-height="40em" js-only>

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
        pos(
            rand(50, width() - 50),
            rand(50, height() - 50)
        ),
        anchor("center")
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

Were your predications correct? Any differences?

<response>


## **I**nvestigate

### Wait vs Loop

What's the difference between `wait(...)`(js) and `loop(...)`(js)? When would you use each in a game?

<response>

### Matching

Match each piece of code to what it does.

<drag-drop mode="code" title="What Does It Do?" sub-title="">

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

5.
    ```js
    choose(get("ghost"))
    ```

---

1. Run code once, after 2s
2. Run code every 2s
3. Random number, 0 to 100
4. Pick random item from list
5. Pick random object tagged "ghost"

</drag-drop>

### Random Object

What does `choose(get("tag"))`(js) do? What sort of things could this be used for in a game?

<response>


## **M**odify

### Bug Hunt

This game should add a new balloon every second, and each balloon should vanish after 2.5 seconds. It has **two bugs**. Find and fix them.

<web-playground data-height="40em" js-only>

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
        pos(
            rand(40, width() - 40),
            rand(40, height() - 40)
        ),
        color(255, 100, 100),
        area(),
        "balloon",
    ])

    wait(2.5, destroy(balloon))
})

onClick("balloon", (balloon) => {
    destroy(balloon)
})
```

</web-playground>

> [!TIP]
> Just like with `loop(...)`(js) above, `wait(...)`(js) wants a **function** to run later. Is `destroy(balloon)`(js) a function, or is it the **result** of running one?


### Tinker

Here's a working balloon spawner. Complete the tasks one at a time. Test after each change!

<web-playground data-height="40em" js-only>

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
        pos(
            rand(40, width() - 40),
            rand(40, height() - 40)
        ),
        color(255, 100, 100),
        area(),
        "balloon",
    ])

    wait(2.5, () => {
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
2. <check> Make each balloon last a **random amount of time** (hint: `rand(...)`(js) can go inside `wait(...)`(js))
3. <check> Make each balloon's colour **random** (hint: `choose(...)`(js) can pick from a list of colours, such as `[rgb(255, 100, 100), rgb(100, 255, 100)]`(js))
4. <check> Count the balloons that **escape** (vanish without being popped) and show the total in a label. (hint: if `balloon.exists()`(js) is still `true` when the `wait(...)`(js) finishes, nobody popped it!)


## **M**ake

### Timed Balloons

Using any of the **Balloons** code above, create a full game:

<web-playground data-height="44em" js-only>

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
let gameIsOver = false

const scoreLabel = add([
    text("Score: 0", { size: 28 }),
    pos(20, 20),
])

const timeLabel = add([
    text("Time: 15", { size: 28 }),
    pos(width() - 20, 20),
    anchor("topright"),
])

// TODO: loop() every second to count down, update the label, and end the game at 0

// TODO: loop() to add balloons (but not when the game is over)

// TODO: onClick() to pop balloons and add to the score (but not when the game is over)

```

</web-playground>

Your game must have:

- <check> A 15 second **countdown timer**, shown on screen
- <check> A **score** that goes up when balloons are popped
- <check> When the time reaches **0**:
    - No more balloons appear
    - **"Time's up!"** is shown
    - The player **can't** score

> [!TIP]
> Use an `gameIsOver` variable, just like last lesson. Any `loop(...)`(js) or `onClick(...)`(js) function can then check it first and `return`(js) to quit early:
>
> ```js [2]
> loop(1, () => {
>     if (gameIsOver) { return }
>     // ... the rest of the code
> })
> ```


### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                           | Hint                                                       |
| --------------------------------------------------- | ---------------------------------------------------------- |
| A **bonus balloon** that adds 5 seconds             | Another tag, and `timeLeft = timeLeft + 5`(js)             |
| **Randomly** make a balloon golden (1 in 5 chance)  | `chance(0.2)`(js) is `true` about 1 time in 5              |


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

- # Why do we use `if (gameIsOver) { return }` at the top of a function?

    ---

    - [ ] To make the game faster
    - [x] To stop the rest of the function running when the game is over
    - [ ] To restart the game
    - [ ] To show the Game Over message

</quiz>
