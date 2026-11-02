# Lesson 2: Enemies & Collisions

Last lesson you built a ship that fires bullets... into an empty sky! Today the **bugs** arrive. You'll make them fall from the top of the screen, and you'll make things **blow up** when a bullet hits them.

## Warm-Up

Try not to look back at the previous lessons...

1. Why do the bullets need a **tag**?

    <response>

2. What does `offscreen({ destroy: true })`(js) do?

    <response>

3. What does `rand(100, 200)`(js) give us?

    <response>


## Learning Goals

- <check> I can **spawn enemies** at random positions with `loop(...)`(js)
- <check> I can give each enemy its **own speed**, using a custom property
- <check> I can detect a **collision** with `onCollide(...)`(js)
- <check> I can make an **explosion** with `addKaboom(...)`(js)
- <check> I can **score points** when something is hit


## The Big Idea: **Collisions**

Kaplay can tell you when two objects **touch**. You say *which tags* to watch, and what to do when they meet:

```js
onCollide("bullet", "enemy", (bullet, enemy) => {
    // bullet is the bullet that hit, enemy is the enemy it hit
})
```

The two objects are passed in, in the **same order** as the tags.

| Code                              | What it does                                                  |
| --------------------------------- | ------------------------------------------------------------- |
| `area({ isSensor: true })`(js)    | A hit zone that **detects** touching, but doesn't push things |
| `onCollide("a", "b", (a, b) => { ... })`(js) | Runs **once**, when an `"a"` first touches a `"b"` |
| `addKaboom(pos)`(js)              | An **explosion** at a position                                |
| `{ speed: rand(100, 200) }`(js)   | Our own **property**, added to an object. Every enemy gets its own value |

> [!IMPORTANT]
> Both objects need `area({ isSensor: true })`(js), or Kaplay will **never tell you** about the collision. There's no error: nothing just happens!

Last week's doors had our own properties too: `{ destination: destination, needs: needs }`(js). Each bug will carry its own `speed` in the same way.


## **P**redict

The ship from last lesson is done for you in a function called `addPlayer()`(js). Here's the new code:

```js
createHud()
addPlayer()

function addEnemy() {
    add([
        sprite("beetle"),
        pos(rand(40, width() - 40), -40),
        anchor("center"),
        area({ isSensor: true }),
        "enemy",
        { speed: rand(100, 200) },
    ])
}

loop(1, () => {
    addEnemy()
})

onUpdate("enemy", (enemy) => {
    enemy.move(0, enemy.speed)

    if (enemy.pos.y > height() + 40) {
        destroy(enemy)
    }
})

onCollide("bullet", "enemy", (bullet, enemy) => {
    addKaboom(enemy.pos)
    destroy(bullet)
    destroy(enemy)
    score = score + 10
})
```

How often does a new bug appear, and where does it start?

<response>

Will all of the bugs fall at the same speed? How do you know?

<response>

List **everything** that happens when a bullet hits a bug.

<response>

What happens to a bug that you **don't** hit?

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
loadSprite("beetle",    "assets/images/beetle.png")
loadSprite("butterfly", "assets/images/butterfly.png")
loadSprite("star",      "assets/images/star.png")

let score = 0

const playerSpeed = 400
const bulletSpeed = 700

function createHud() {
    const scoreLabel = add([
        text("", { size: 28 }),
        pos(20, 20),
    ])

    scoreLabel.onUpdate(() => {
        scoreLabel.text = `Score: ${score}`
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

// Last lesson's ship, with its controls and bullets
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
```
</web-playground>

Run the code and compare it with your predictions.

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
createHud()
addPlayer()

function addEnemy() {
    add([
        sprite("beetle"),
        pos(rand(40, width() - 40), -40),
        anchor("center"),
        area({ isSensor: true }),
        "enemy",
        { speed: rand(100, 200) },
    ])
}

loop(1, () => {
    addEnemy()
})

onUpdate("enemy", (enemy) => {
    enemy.move(0, enemy.speed)

    if (enemy.pos.y > height() + 40) {
        destroy(enemy)
    }
})

onCollide("bullet", "enemy", (bullet, enemy) => {
    addKaboom(enemy.pos)
    destroy(bullet)
    destroy(enemy)
    score = score + 10
})
```

</web-playground>


## **I**nvestigate

1. Delete the line `destroy(bullet)`(js) and shoot a bug. What does the bullet do now? Can you think of a game where that would be a good idea?

    <response>

2. Delete `area({ isSensor: true })`(js) from the **enemy** only. Does the game give you an error? What happens when a bullet reaches a bug?

    <response>

3. Why does each bug need its own `speed` property? What if we just wrote `enemy.move(0, 150)`(js) instead?

    <response>

### What Happens in a Hit?

<drag-drop mode="code" title="Match the Code" sub-title="Drag the descriptions into the right order">

1.
    ```js
    addKaboom(enemy.pos)
    ```

2.
    ```js
    destroy(bullet)
    ```

3.
    ```js
    destroy(enemy)
    ```

4.
    ```js
    score = score + 10
    ```

---

1. Explosion where the bug was
2. Remove the bullet from the game
3. Remove the bug from the game
4. Change the state of the game

</drag-drop>


## **M**odify

### Bug Hunt

Ironically, this game has **three bugs** of its own. Find and fix them. Fix them in order!

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
createHud()
addPlayer()

function addEnemy() {
    add([
        sprite("beetle"),
        pos(rand(40, width() - 40), -40),
        anchor("center"),
        "enemy",
        { speed: rand(100, 200) },
    ])
}

loop(1000, () => {
    addEnemy()
})

onUpdate("enemy", (enemy) => {
    enemy.move(0, enemy.speed)

    if (enemy.pos.y > height() + 40) {
        destroy(enemy)
    }
})

onCollide("bullet", "enemy", (bullet, enemy) => {
    addKaboom(enemy.pos)
    destroy(bullet)
    destroy(enemy)
    score = 10
})
```

</web-playground>

1. <check> Only **one bug** appears, and then no more (for a very long time...)
2. <check> Bullets **fly straight through** the bugs
3. <check> The score gets stuck at **10**

> [!TIP]
> Look back at last week's Lesson 3 about timers. Which units does `loop(...)`(js) use?


### Tinker

Go back to the **working** game in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Make the bugs appear **twice as fast**
2. <check> Make the bugs fall faster, and with a **wider range** of speeds
3. <check> Use `sprite(choose(["beetle", "butterfly"]))`(js) to get **two kinds** of enemy
4. <check> Give each enemy a `points`(js) property next to `speed`(js), and use it in `score = score + enemy.points`(js). Make one kind worth more!


## **M**ake

### Pest Control

Build the **enemies** for your own shooter. The ship is done for you, but you can replace it with your own code from last lesson.

<web-playground data-height="48em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
createHud()
addPlayer()

// TODO: a function that adds an enemy at a random position at the top

// TODO: a loop() that adds enemies

// TODO: make the enemies move, and destroy them when they leave the screen

// TODO: onCollide() for bullets and enemies, with an explosion and a score
```

</web-playground>

Your game must have:

- <check> Enemies that appear at **random places** along the top, each with its **own speed**
- <check> **At least two kinds** of enemy that are different in some way (picture, speed, points...)
- <check> An **explosion** and a **score** when an enemy is shot
- <check> Enemies that **don't pile up** off the bottom of the screen

> [!TIP]
> Add the pictures you need with `loadSprite(...)`(js) at the top of your code. Remember that `loadBean()`, `beetle`, `butterfly` and `star` are already loaded for you.


### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                         | Hint                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A **tough** enemy that needs 3 hits               | A `health: 3`(js) property. In the hit handler: `enemy.health = enemy.health - 1`(js), and `destroy`(js) it only when it reaches `0`(js) |
| Enemies that **wobble** from side to side         | `enemy.move(rand(-50, 50), enemy.speed)`(js)                                               |
| Enemies that arrive from the **sides**            | A different starting `pos(...)`(js), and move them with an `x` speed                       |
| A **screen shake** when you hit something         | `shake(5)`(js)                                                                             |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # A bullet should destroy a bug, but nothing happens when they touch, and there's no error. What is the most likely reason?

    ---

    - [ ] The bug is too fast
    - [x] One of them is missing `area({ isSensor: true })`
    - [ ] `addKaboom` is missing
    - [ ] The tags are in capital letters

- # In `onCollide("bullet", "enemy", (bullet, enemy) => { ... })`, what is `enemy`?

    ---

    - [ ] The text "enemy"
    - [ ] The first enemy ever created
    - [x] The enemy that was hit
    - [ ] The number of enemies

- # What does `{ speed: rand(100, 200) }` do when it is added to an object?

    ---

    - [ ] Makes the object move at speed 100
    - [x] Gives that object its own `speed` property, with a random value
    - [ ] Gives every object the same speed
    - [ ] Nothing, it isn't a component

</quiz>
