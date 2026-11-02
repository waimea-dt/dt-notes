# Lesson 1: Shooting

This week you're going to build a classic **shooter**: a ship at the bottom of the screen, bugs falling from the top, and lots of explosions. Today is the first step: a ship that **moves**, and **fires bullets**.

## Warm-Up

Try not to look back at the previous lessons...

1. Why do we keep things like `hp` and `score` **outside** the scenes?

    <response>

2. What does a `loop(2, () => { ... })`(js) do?

    <response>

3. What does `destroy(thing)`(js) do?

    <response>


## Learning Goals

- <check> I can move a ship with the **arrow keys**, and keep it **on the screen**
- <check> I can **create a bullet** each time a key is pressed
- <check> I can make every bullet **move by itself** with `onUpdate("tag", ...)`(js)
- <check> I can **clean up** bullets that have left the screen


## The Big Idea: **Things That Move By Themselves**

A bullet is just a game object, like a mushroom or a balloon. The trick is that we **add a new one** every time the player fires, and we tell **all** the bullets to move, **every frame**.

| Code                                        | What it does                                              |
| ------------------------------------------- | --------------------------------------------------------- |
| `onKeyDown("left", () => { ... })`(js)      | Runs **every frame** while the key is **held down**       |
| `onKeyPress("space", () => { ... })`(js)    | Runs **once**, when the key is **first pressed**          |
| `onUpdate("bullet", (bullet) => { ... })`(js) | Runs every frame, **for every object** tagged `"bullet"` |
| `obj.move(x, y)`(js)                        | Moves an object by `x` and `y` **pixels per second**      |
| `clamp(value, min, max)`(js)                | Keeps a number between `min` and `max`                    |
| `offscreen({ destroy: true })`(js)          | A component: **destroys** the object once it leaves the screen |

> [!NOTE]
> The top of the screen is `y = 0`, and `y` gets bigger as you go **down**. So to move **up**, the `y` speed must be **negative**.

> [!IMPORTANT]
> Without `offscreen({ destroy: true })`(js), bullets fly away into space... but they **never go away**. Thousands of invisible bullets will slow your game right down!


## **P**redict

Here's the start of a shooter. Read the code carefully:

```js
kaplay({
    width: 600, height: 700,
    background: [10, 10, 40]
})

loadBean()
loadSprite("star", "assets/images/star.png")

const playerSpeed = 400
const bulletSpeed = 700

const player = add([
    sprite("bean"),
    pos(width() / 2, height() - 60),
    anchor("center"),
])

onKeyDown("left", () => {
    player.move(-playerSpeed, 0)
})

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})

onUpdate(() => {
    player.pos.x = clamp(player.pos.x, 30, width() - 30)
})

onKeyPress("space", () => {
    add([
        sprite("star"),
        pos(player.pos.x, player.pos.y - 40),
        anchor("center"),
        scale(0.7),
        offscreen({ destroy: true }),
        "bullet",
    ])
})

onUpdate("bullet", (bullet) => {
    bullet.move(0, -bulletSpeed)
})
```

Where will the bullets appear when you press SPACE?

<response>

What would happen if you **held down** the left arrow for a long time? Which line stops the ship leaving the screen?

<response>

What would happen if you pressed SPACE **five times** very quickly?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run the code and compare it with your predictions.

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 600, height: 700,
    background: [10, 10, 40]
})

loadBean()
loadSprite("star", "assets/images/star.png")

const playerSpeed = 400
const bulletSpeed = 700

const player = add([
    sprite("bean"),
    pos(width() / 2, height() - 60),
    anchor("center"),
])

onKeyDown("left", () => {
    player.move(-playerSpeed, 0)
})

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})

onUpdate(() => {
    player.pos.x = clamp(player.pos.x, 30, width() - 30)
})

onKeyPress("space", () => {
    add([
        sprite("star"),
        pos(player.pos.x, player.pos.y - 40),
        anchor("center"),
        scale(0.7),
        offscreen({ destroy: true }),
        "bullet",
    ])
})

onUpdate("bullet", (bullet) => {
    bullet.move(0, -bulletSpeed)
})
```

</web-playground>


## **I**nvestigate

### Count the Bullets

Add a label that **watches** the bullets, just like last week's HUD. Put this code at the **bottom** of the program above:

```js
const countLabel = add([
    text("", { size: 24 }),
    pos(20, 20),
])

countLabel.onUpdate(() => {
    countLabel.text = `Bullets: ${get("bullet").length}`
})
```

1. Fire a few bullets. When does the count go **up**? When does it go **down**?

    <response>

2. Delete the `offscreen(...)`(js) line and fire again. What is different? Why does it matter?

    <response>

3. Delete the `onUpdate(...)`(js) that contains `clamp(...)`(js), then hold the left arrow. What happens?

    <response>

### What Does Each Line Do?

<drag-drop mode="code" title="Match the Code" sub-title="Drag the descriptions into the right order">

1.
    ```js
    player.move(-playerSpeed, 0)
    ```

2.
    ```js
    pos(player.pos.x, player.pos.y - 40)
    ```

3.
    ```js
    bullet.move(0, -bulletSpeed)
    ```

4.
    ```js
    "bullet",
    ```

---

1. Move the ship to the left
2. Start the bullet just above the ship
3. Move a bullet up the screen
4. Tag the object so `onUpdate("bullet", ...)` can find it

</drag-drop>


## **M**odify

### Bug Hunt

This ship should move, fire upwards and clean up its bullets. It has **three bugs**. Find and fix them.

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 600, height: 700,
    background: [10, 10, 40]
})

loadBean()
loadSprite("star", "assets/images/star.png")

const playerSpeed = 400
const bulletSpeed = 700

const player = add([
    sprite("bean"),
    pos(width() / 2, height() - 60),
    anchor("center"),
])

onKeyDown("left", () => {
    player.move(playerSpeed, 0)
})

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})

onUpdate(() => {
    player.pos.x = clamp(player.pos.x, 30, width() - 30)
})

onKeyPress("space", () => {
    add([
        sprite("star"),
        pos(player.pos.x, player.pos.y - 40),
        anchor("center"),
        scale(0.7),
        "bullet",
    ])
})

onUpdate("bullet", (bullet) => {
    bullet.move(0, bulletSpeed)
})

const countLabel = add([
    text("", { size: 24 }),
    pos(20, 20),
])

countLabel.onUpdate(() => {
    countLabel.text = `Bullets: ${get("bullet").length}`
})
```

</web-playground>

1. <check> Pressing the **left** arrow moves the ship the **wrong way**
2. <check> The bullets fly **down** the screen
3. <check> The **bullet count** never goes down

> [!TIP]
> Remember: `y` gets **smaller** as you go up the screen.


### Tinker

Go back to the **working** ship in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Make the bullets **twice as fast**
2. <check> Let the ship move **up and down** as well (use `onKeyDown("up", ...)`(js) and `onKeyDown("down", ...)`(js)). Keep it on the screen with another `clamp(...)`(js)
3. <check> Swap the bean for a different picture (load it with `loadSprite(...)`(js) first)
4. <check> Change `onKeyPress("space", ...)`(js) to `onKeyDown("space", ...)`(js). What happens? Is it better or worse?

    <response>


## **M**ake

### Your Own Ship

Time to make a ship of your own! Use the code above as a starting point, but **make it yours**.

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 600, height: 700,
    background: [10, 10, 40]
})

// TODO: load the pictures for your ship and your bullets

// TODO: add your ship, and make it move left and right (but stay on the screen)

// TODO: fire a bullet when the player presses SPACE

// TODO: make every bullet move up, and clean up the ones that leave the screen
```

</web-playground>

Your game must have:

- <check> A ship that moves with the **arrow keys** and **can't leave the screen**
- <check> Bullets that appear at the ship when **SPACE** is pressed
- <check> Bullets that **move up** and are **destroyed** when they leave the screen
- <check> Your own **look**: pictures, colours and speeds

> [!TIP]
> There are lots of pictures in `assets/images/`: a **fish** shooting **watermelons**, or a **ghost** shooting **keys**. Pick something fun!


### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                           | Hint                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| A **cooldown**, so you can only fire 4 times a second | A `let canShoot = true`(js) variable. Set it to `false`(js), then `wait(0.25, ...)`(js) to set it back |
| A **triple shot**                                   | Add three bullets with different `x` values                                                  |
| **Rotate** the ship as it moves                     | `angle(...)`(js) component. Set `player.angle`(js) to a small number while a key is held     |
| **Aim with the mouse**                              | `mousePos().x`(js) gives the mouse's `x`                                                     |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does `offscreen({ destroy: true })` do?

    ---

    - [ ] Makes an object invisible
    - [x] Destroys the object when it leaves the screen
    - [ ] Stops the object moving
    - [ ] Destroys the object after one second

- # Which line makes a bullet move **up** the screen?

    ---

    - [ ] `bullet.move(0, 700)`
    - [x] `bullet.move(0, -700)`
    - [ ] `bullet.move(700, 0)`
    - [ ] `bullet.move(-700, 0)`

- # What is the difference between `onKeyPress` and `onKeyDown`?

    ---

    - [ ] There is no difference
    - [ ] `onKeyPress` is for the mouse
    - [x] `onKeyPress` runs once per press, `onKeyDown` runs every frame while the key is held
    - [ ] `onKeyDown` runs once per press, `onKeyPress` runs every frame while the key is held

</quiz>
