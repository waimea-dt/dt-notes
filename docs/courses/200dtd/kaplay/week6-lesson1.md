# Lesson 1: Gravity & Jumping

So far, everything in our games has floated. Bugs fell because *we* moved them down, every frame. This week, Kaplay does the work: we switch on **gravity**, and things fall, land and **jump** all by themselves. Time to build a platformer!

## Warm-Up

Try not to look back at the previous lessons...

1. What is the difference between `onKeyDown(...)`(js) and `onKeyPress(...)`(js)?

    <response>

2. What does this loop do? `for (let x = 0; x < 300; x = x + 100) { ... }`(js)

    <response>

3. What does `clamp(value, min, max)`(js) do, and why did our ship need it?

    <response>


## Learning Goals

- <check> I can switch on **gravity** with `setGravity(...)`(js)
- <check> I can give objects a **physics body** with `body()`(js), and make floors that **don't fall**
- <check> I can make the player **jump**, but only from the **ground**
- <check> I can tune gravity and jump force to change how a game **feels**


## The Big Idea: **Physics Bodies**

An object with a `body()`(js) obeys **physics**: gravity pulls it down, and it **can't pass through** other bodies. Give the player a body and the floor a body, and the player will land on the floor.

But wait: if the floor has a body, won't gravity pull the floor down too? Yes! Unless we make it **static**. A static body never moves, no matter what.

| Code                                | What it does                                                    |
| ----------------------------------- | --------------------------------------------------------------- |
| `setGravity(1600)`(js)              | Switches gravity on. A bigger number pulls **harder**           |
| `body()`(js)                        | A component: gravity pulls this object, and it **bumps** into other bodies |
| `body({ isStatic: true })`(js)      | A body that **never moves**. Perfect for floors and walls       |
| `body({ jumpForce: 700 })`(js)      | How **hard** this object jumps                                  |
| `player.jump()`(js)                 | Makes the player jump                                           |
| `player.isGrounded()`(js)           | `true`(js) if the player is **standing on** something           |

> [!IMPORTANT]
> A body needs an `area()`(js) too. The area is the object's **shape**: without it, Kaplay can't tell when two things touch.

> [!NOTE]
> Remember: `y` gets bigger going **down** the screen. Gravity pulls `y` **up** (bigger), and a jump pushes it **down** (smaller) for a moment.


## **P**redict

Read the code carefully:

```js
kaplay({
    width: 768, height: 576,
    background: [110, 180, 240]
})

loadBean()
loadSprite("grass", "assets/images/grass.png")

setGravity(1600)

const playerSpeed = 300

// A floor of grass along the bottom, one tile at a time
for (let x = 0; x < width(); x = x + 64) {
    add([
        sprite("grass"),
        pos(x, height() - 64),
        area(),
        body({ isStatic: true }),
    ])
}

const player = add([
    sprite("bean"),
    pos(100, 100),
    area(),
    body({ jumpForce: 700 }),
])

onKeyDown("left", () => {
    player.move(-playerSpeed, 0)
})

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})

onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump()
    }
})
```

What will happen to the bean as soon as the game starts?

<response>

The grass tiles are 64 pixels wide. How many tiles does the loop add to make the floor? (The screen is 768 wide.)

<response>

What do you think will happen if you press SPACE **twice**, very quickly?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run the code and compare it with your predictions.

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 768, height: 576,
    background: [110, 180, 240]
})

loadBean()
loadSprite("grass", "assets/images/grass.png")

setGravity(1600)

const playerSpeed = 300

// A floor of grass along the bottom, one tile at a time
for (let x = 0; x < width(); x = x + 64) {
    add([
        sprite("grass"),
        pos(x, height() - 64),
        area(),
        body({ isStatic: true }),
    ])
}

const player = add([
    sprite("bean"),
    pos(100, 100),
    area(),
    body({ jumpForce: 700 }),
])

onKeyDown("left", () => {
    player.move(-playerSpeed, 0)
})

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})

onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump()
    }
})
```

</web-playground>


## **I**nvestigate

1. Change the floor's `body({ isStatic: true })`(js) to just `body()`(js). What happens, and why?

    <response>

2. Put it back. Now remove the `if (player.isGrounded())`(js) check, so SPACE always jumps. Hold SPACE down, then tap it lots. What kind of game does this feel like?

    <response>

3. Walk the bean off the side of the screen. What happens? What could we do about it?

    <response>

### How Gravity Works

Gravity doesn't move things at a steady speed: it changes the **speed**, a little bit every frame. Step through this pretend jump. The `speed` starts **negative** (going up):

```js trace header="false"
let y = 0
let speed = -700
const gravity = 1600

for (let frame = 1; frame <= 6; frame++) {
    y = y + speed / 10
    speed = speed + gravity / 10
}

console.log(y)
console.log(speed)
```

When does the bean stop going **up**? What would a bigger `gravity` do to the jump?

<response>

### Match the Code

<drag-drop mode="code" title="Physics Words" sub-title="Drag each description to its code">

1.
    ```js
    setGravity(1600)
    ```

2.
    ```js
    body()
    ```

3.
    ```js
    body({ isStatic: true })
    ```

4.
    ```js
    player.isGrounded()
    ```

5.
    ```js
    player.jump()
    ```

---

1. Pulls everything with a body downwards
2. This object falls, and bumps into other bodies
3. This object never moves: a floor or a wall
4. Is the player standing on something?
5. Push the player up into the air

</drag-drop>


## **M**odify

### Bug Hunt

This game has **three bugs**. Find and fix them, in order!

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 768, height: 576,
    background: [110, 180, 240]
})

loadBean()
loadSprite("grass", "assets/images/grass.png")

setGravity(1600)

const playerSpeed = 300

for (let x = 0; x < width(); x = x + 64) {
    add([
        sprite("grass"),
        pos(x, height() - 64),
        area(),
        body(),
    ])
}

const player = add([
    sprite("bean"),
    pos(100, 100),
    area(),
    body({ jumpForce: 70 }),
])

onKeyDown("left", () => {
    player.move(-playerSpeed, 0)
})

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})

onKeyPress("space", () => {
    player.jump()
})
```

</web-playground>

1. <check> The bean **and the whole floor** fall off the bottom of the screen
2. <check> SPACE **hardly does anything**: the bean barely leaves the ground
3. <check> Tapping SPACE quickly lets the bean **climb into the sky**

> [!TIP]
> What kind of body never moves? What is a sensible jump force? And how do we check that the bean is on the ground?


### Tinker

Go back to the **working** game in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Make the game feel **floaty**, like the bean is on the Moon. Which numbers did you change?
2. <check> Now make it feel **snappy**: quick, sharp jumps that land fast
3. <check> Make the bean face the way it's walking, by adding `player.flipX = true`(js) to the left key, and `player.flipX = false`(js) to the right key
4. <check> Add a **steel block** in the middle of the floor that the bean has to jump over. Load `steel` with `loadSprite(...)`(js), and give it `pos(...)`(js), `area()`(js) and a static body

> [!NOTE]
> Game designers call this **game feel**. The same level can feel heavy, floaty, slippery or tight, just by changing a few numbers. There's no right answer: it's a choice!


## **M**ake

### Platform Practice

Build a practice level with platforms at different heights. The `addPlatform(...)`(js) function is done for you: it adds a row of steel blocks.

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 768, height: 576,
    background: [110, 180, 240]
})

loadBean()
loadSprite("steel", "assets/images/steel.png")

// TODO: choose your own gravity
setGravity(1600)

const playerSpeed = 300

// Adds a row of steel blocks, starting at x, y
function addPlatform(x, y, blocks) {
    for (let i = 0; i < blocks; i++) {
        add([
            sprite("steel"),
            pos(x + i * 64, y),
            area(),
            body({ isStatic: true }),
        ])
    }
}

// TODO: a floor along the bottom, with a gap in it
addPlatform(0, height() - 64, 5)

// TODO: at least three platforms at different heights

// TODO: the player, with your own jump force

// TODO: the controls: left, right, and jump only from the ground

// TODO: if the player falls off the bottom, put it back at the start
```

</web-playground>

Your game must have:

- <check> A floor with a **gap** to fall through
- <check> At least **three platforms** at different heights, and the player can **reach** every one
- <check> Your own **gravity** and **jump force**, chosen to make the game feel how you want
- <check> When the player falls off the bottom, it goes **back to the start**

> [!TIP]
> To send the player back, check its position every frame:
> `player.onUpdate(() => { if (player.pos.y > height()) { ... } })`(js). Inside, set `player.pos.x`(js) and `player.pos.y`(js).


### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                         | Hint                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A **double jump**                                 | Add `doubleJump()`(js) to the player, then call `player.doubleJump()`(js) instead of the `if` and `jump()`(js) |
| A **run** button                                  | `if (isKeyDown("shift")) { ... }`(js) inside the left and right keys, with a faster speed  |
| A **Moon mode** key that changes gravity          | `onKeyPress("m", () => { setGravity(400) })`(js). Can you make a key that switches it back? |
| **Stay on screen**                                | `clamp(...)`(js) the player's `x`, like the ship in Week 5                                |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # A floor has `area()` and `body()`. When the game starts, what happens to it?

    ---

    - [ ] Nothing, floors never move
    - [x] Gravity pulls it down, and it falls off the screen
    - [ ] It floats up
    - [ ] The game shows an error

- # Why do we check `player.isGrounded()` before calling `player.jump()`?

    ---

    - [ ] Because `jump()` only works on the ground
    - [x] So the player can't jump again in mid-air and fly away
    - [ ] To make the jump higher
    - [ ] To turn gravity on

- # A game feels too floaty. Which change would help?

    ---

    - [ ] A smaller gravity
    - [x] A bigger gravity
    - [ ] A slower player speed
    - [ ] Removing `area()` from the floor

</quiz>
