# Lesson 4: Make It Move

Right now your game is a painting. In this lesson you'll make it **react to you**. By the end you'll have the first prototype: **Wander**.

## Warm-up

1. What does `add([sprite("ghost"), pos(50, 50)])` do?
2. Where does a `pos(0, 0)` object appear?
3. Why do we load sprites before we use them?

## Learning goals

- [ ] I can react to key presses with `onKeyDown`
- [ ] I can move an object with `move()`
- [ ] I understand that `onUpdate` runs again and again, every frame
- [ ] I can store speed in a variable so it's easy to change

## How a game works: the loop

A game isn't a single run of code. It's a loop that runs about **60 times a second**. Each lap is called a **frame**.

```
Frame 1: check keys → update things → draw the screen
Frame 2: check keys → update things → draw the screen
Frame 3: ...
```

Kaplay runs that loop for you. You just tell it what should happen:

| Function | When your code runs |
|---|---|
| `onKeyDown("right", ...)` | *Every frame* while the right arrow is held down |
| `onKeyPress("space", ...)` | *Once* when space is first pressed |
| `onUpdate(...)` | *Every frame*, always |

The `() => { ... }` part is the **arrow function** from last lesson: *"Kaplay, run this code when it's time."*

---

## 1. Predict

Read the code. In your notebook, answer:

- What happens when you press the **right** arrow?
- What happens if you **hold it down** for two seconds?
- What happens when you press **left**?

```js
kaplay({ width: 400, height: 300, background: [20, 20, 40] })

loadBean()

const playerSpeed = 200

const player = add([
    sprite("bean"),
    pos(50, 150),
    anchor("center"),
])

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})
```

## 2. Run

> **Important:** Click inside the game once first. Otherwise your keyboard presses won't reach it.

<web-playground data-height="22em">

```html id=kaplay
<script src="https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.js"></script>
```

```css id=kaplay
body {
    margin: 0;
    background: #0f172a;
    display: flex;
    justify-content: center;
}
```

```js id=kaplay
const gemImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABV0lEQVR4nO2XvQ3CMBCFD0SRBgagQpmDigGyAEMwARUTZIgskAFSZYMsQJWSImkoIpnqkInP9p3tCAo+iYbEvuf3/BeAP5FU46Ri2q9TFI8RsQlplJW1URD/e16KlaQv0ctYaH86wu2wM55d7wP0TSsSIYoAi7vYn46kQzZYSrFDLE6NHrneBwAA6JsWAPyReAXMR+0qPheBQlwinBFwLPfhi4RUNrcc4Ywe0V0AsEdiLMMUo6bAPvuyVrqIDzWS2RsLijAisDkgsR+ZxwBgTkr2PkB1luJ9Q8DzUqxwwqSGWpKkA0uIsO0H1ggoEVxbqSVo24yijuMUOAWkiCJqK6ZE+GKQnAMsAaFw7wUsAUsuTbYDughbDPpdgHsrEkXAcWLRK9nPkJW1yruHqsbp/cu7hwo5TYMcoKKQWo+IG+joHyTn7SaqryCyslbVOAVZn4zYb8Ov8wLOT9xyaH0ItQAAAABJRU5ErkJggg=="
const ghostImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAArElEQVR4nGNgGOmAkRxNH7/+/I9Ljp+bnSQziVaMz1JKHMNEK8uJ1YfXheRajA3gCg2cIUBNy/GZR1QU0BJgdQC1fY/P3AEPAYyEgc/3ckqGcPaje+dJlocB5ARJdAggG04OHxcY8CgYdQDRDkBPVKTycQGScgG1AFm5gFZg1AGjDiDoAELNKkrl8ToAphmXIZTKE3QAPQBOB6C7mtp8nIBQSUht+QGPglEwCgCqd07Y6LGzvAAAAABJRU5ErkJggg=="
```

```html depends=kaplay
<!-- Kaplay is already loaded for you. Write your game in the JS tab. -->
```

```js depends=kaplay
kaplay({ width: 400, height: 300, background: [20, 20, 40] })

loadBean()

const playerSpeed = 200

const player = add([
    sprite("bean"),
    pos(50, 150),
    anchor("center"),
])

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})
```

</web-playground>

## 3. Investigate

### 3a. Trace the frames

The bean starts at `x = 50` with `playerSpeed = 200`. The game runs at 60 frames per second, and `move()` is clever: it moves the bean `playerSpeed` pixels **per second**, not per frame.

So each frame the bean moves `200 / 60 ≈ 3.3` pixels. Fill in the table, assuming the right arrow is held down.

| Frame | x position at the start | After `move()` |
|---|---|---|
| 1 | 50 | 53.3 |
| 2 | | |
| 3 | | |
| 60 (after one second) | | |

### 3b. Questions

1. What is the bean's `x` after exactly one second of holding right? Does that match `playerSpeed`?
2. What happens if you change `playerSpeed` to `20`? To `2000`?
3. In `player.move(playerSpeed, 0)`, what do the two numbers mean? Which one would you change to move the bean **down**?
4. What's the difference between `onKeyDown` and `onKeyPress`? When would you use each one?
5. Why is `playerSpeed` stored in a variable at the top, instead of typing `200` in each key handler?

## 4. Parsons Problem

Put the code in an order that works. Remember our rule: **set up, create things, then add the controls**.

<drag-drop mode="code" title="Bean on the Move" sub-title="Set up, create, then control">

1.
    ```js
    kaplay({ width: 400, height: 300 })
    ```

2.
    ```js
    loadBean()
    ```

3.
    ```js
    const player = add([
        sprite("bean"),
        pos(200, 150),
        anchor("center"),
    ])
    ```

4.
    ```js
    onKeyDown("right", () => {
        player.move(200, 0)
    })
    ```

</drag-drop>

## 5. Modify

Start with this code and complete the tasks one at a time. Test after each change!

<web-playground data-height="24em">

```html id=kaplay
<script src="https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.js"></script>
```

```css id=kaplay
body {
    margin: 0;
    background: #0f172a;
    display: flex;
    justify-content: center;
}
```

```js id=kaplay
const gemImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABV0lEQVR4nO2XvQ3CMBCFD0SRBgagQpmDigGyAEMwARUTZIgskAFSZYMsQJWSImkoIpnqkInP9p3tCAo+iYbEvuf3/BeAP5FU46Ri2q9TFI8RsQlplJW1URD/e16KlaQv0ctYaH86wu2wM55d7wP0TSsSIYoAi7vYn46kQzZYSrFDLE6NHrneBwAA6JsWAPyReAXMR+0qPheBQlwinBFwLPfhi4RUNrcc4Ywe0V0AsEdiLMMUo6bAPvuyVrqIDzWS2RsLijAisDkgsR+ZxwBgTkr2PkB1luJ9Q8DzUqxwwqSGWpKkA0uIsO0H1ggoEVxbqSVo24yijuMUOAWkiCJqK6ZE+GKQnAMsAaFw7wUsAUsuTbYDughbDPpdgHsrEkXAcWLRK9nPkJW1yruHqsbp/cu7hwo5TYMcoKKQWo+IG+joHyTn7SaqryCyslbVOAVZn4zYb8Ov8wLOT9xyaH0ItQAAAABJRU5ErkJggg=="
const ghostImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAArElEQVR4nGNgGOmAkRxNH7/+/I9Ljp+bnSQziVaMz1JKHMNEK8uJ1YfXheRajA3gCg2cIUBNy/GZR1QU0BJgdQC1fY/P3AEPAYyEgc/3ckqGcPaje+dJlocB5ARJdAggG04OHxcY8CgYdQDRDkBPVKTycQGScgG1AFm5gFZg1AGjDiDoAELNKkrl8ToAphmXIZTKE3QAPQBOB6C7mtp8nIBQSUht+QGPglEwCgCqd07Y6LGzvAAAAABJRU5ErkJggg=="
```

```html depends=kaplay
<!-- Kaplay is already loaded for you. Write your game in the JS tab. -->
```

```js depends=kaplay
kaplay({ width: 400, height: 300, background: [20, 20, 40] })

loadBean()

const playerSpeed = 200

const player = add([
    sprite("bean"),
    pos(200, 150),
    anchor("center"),
])

onKeyDown("left", () => {
    player.move(-playerSpeed, 0)
})

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})
```

</web-playground>

Tasks:

1. [ ] Add `up` and `down` controls (remember: `y` goes **down** the screen!)
2. [ ] Make the **W**, **A**, **S** and **D** keys work too
3. [ ] Make the bean faster, then slower. What feels right?
4. [ ] **Sprint key:** make the bean move faster while **Shift** is held (hint: `isKeyDown("shift")`, plus an `if` inside your handler)

### Bug hunt

Press left and right at the same time and hold them. What happens? Why?

Now press **up and right together**. Is the bean's speed the same as moving in a straight line? (Measure it: how long does it take to cross the screen?) We'll look at *why* this happens another day. A mathematician might call it the **Pythagoras problem**.

---

## 6. Make: Wander

Time for your first prototype! Open your **starter project** (download it from the [Week 1 overview](/kaplay/week1/README.md)) and finish `main.js`.

Your game must have:

- [ ] A row of ghosts across the top of the screen (from Lesson 3)
- [ ] A player (the bean) controlled with the arrow keys
- [ ] At least 8 gems scattered at random positions
- [ ] Gems disappear when the player touches them

### How to make gems disappear

We haven't met collisions yet (that's coming in Week 4), so for now we'll measure the **distance** between the player and each gem. If it's small enough, they're touching.

```js
// Runs every frame for every object tagged "gem"
onUpdate("gem", (gem) => {
    if (player.pos.dist(gem.pos) < 30) {
        destroy(gem)
    }
})
```

For this to work, each gem needs the **tag** `"gem"` in its component list. A tag is just a word in quotes:

```js
add([
    sprite("gem"),
    pos(rand(40, width() - 40), rand(100, height() - 40)),
    anchor("center"),
    "gem",
])
```

### Make-it-work checklist

- [ ] `loadSprite` for `"gem"` and `"ghost"` is at the top
- [ ] The player is stored in a `const` called `player`
- [ ] The gems are made with a loop
- [ ] `onUpdate("gem", ...)` checks the distance
- [ ] Speed is stored in a variable, not typed everywhere

## 7. Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge | Hint |
|---|---|
| Stop the bean walking off the screen | `if (player.pos.x < 0) { player.pos.x = 0 }` |
| Flip the bean to face the way it's going | `player.flipX = true` |
| Show **"Gems left: 8"** on screen | `text()` component and `get("gem").length` |
| Make the ghosts drift left and right | `onUpdate` and `ghost.move(...)` |
| Win message when all gems are collected | `if (get("gem").length === 0)` |

---

## Exit ticket

1. How many times per second does `onUpdate` run?
2. Which is used for holding a key down: `onKeyDown` or `onKeyPress`?
3. Why do we move the player by changing its position, rather than redrawing it?

## Check yourself

Before you finish the week, make sure you can say "yes" to all of these:

- [ ] I can declare a variable with `const` or `let`
- [ ] I can write an `if` / `else` and a `for` loop
- [ ] I can add something to the screen with `add([...])`
- [ ] I can make something move with the keyboard
- [ ] I can find and read an error message in the console
