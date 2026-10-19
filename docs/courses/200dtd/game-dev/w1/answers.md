# Week 1: Answer Key (Teacher)

> Keep this page out of the student sidebar, or remove it from the public site.

## Lesson 1: Variables

**Predict / Run**

| Snippet | Output |
|---|---|
| 1 | `Pixel` |
| 2 | `8` |
| 3 | `Level: 7` |
| 4 | `Bean scored 120 points` |
| 5 | `true`, then `boolean` |
| 6 | Crash: `TypeError: Assignment to constant variable`. The final `console.log` never runs. |

**Investigate**

1. `let` can be given a new value later; `const` can't. Reassigning a `const` crashes.
2. Name: `const`. Coins collected: `let`. Max lives: `const`. Is alive: `let` (it changes when the player dies).
3. It puts the value of `player` into the string.
4. `typeof` tells us the type of a value: `"string"`, `"number"` or `"boolean"`.
5. JS works out the type from the value itself, just like Python.

**Parsons: Hero Health Check:** `const heroName`, `let health`, `health = health - 25`, `console.log(...)`. Output: `Pixel has 75 health`.

**Bug hunt:** (1) `MonsterHealth` should be `monsterHealth` (ReferenceError). (2) `attackPower` is a `const` that gets reassigned; change it to `let`.

**Stretch:** health goes 100, 65, 30, then -5. Negative health is a problem; fix with an `if` in Lesson 2.

**Exit ticket:** (1) `let` can change, `const` can't. (2) `Score: 15`. (3) No. `"true"` is a string and `true` is a boolean, so `===` gives `false`.

## Lesson 2: Choices and Repeats

**Predict / Run**

| Snippet | Output |
|---|---|
| 1 | `Game over` |
| 2 | `Silver medal` |
| 3 | `false`, then `true` |
| 4 | `Click! The door opens` |
| 5 | `Enemy 1 appears`, `Enemy 2 appears`, `Enemy 3 appears` |
| 6 | `Lives left: 3`, `2`, `1`, then `Game over` |

**Trace table**

| Lap | `i` | `i <= 5`? | Printed |
|---|---|---|---|
| 1 | 1 | yes | 10 |
| 2 | 2 | yes | 20 |
| 3 | 3 | yes | 30 |
| 4 | 4 | yes | 40 |
| 5 | 5 | yes | 50 |
| 6 | 6 | no | (loop ends) |

**Investigate**

1. `"42"` is a string and `42` is a number. The types differ, so `===` is `false`.
2. `lives` would stay at 3 forever, so the loop never ends (an infinite loop) and the page freezes.
3. It stops accidental matches like `"5"` and `5`.
4. When you don't know in advance how many laps you need (until the boss is defeated, until a key is pressed).

**Parsons 4a:** `let lives = 3`, `while (lives > 0) {`, log line, `lives = lives - 1`, `}`, `console.log("Game over")`.

**Parsons 4b:** the `15` check, then `3`, then `5`, then `else`. If `3` came first, 15 would print "Boss" and the legendary monster would never appear.

**Bug hunt:** (1) `if (health = 0)` should be `if (health === 0)`. (2) `i < 3` should be `i <= 3`.

**Functions**

```js
function heal(health, amount) {
    return health + amount
}

function takeDamage(health, damage) {
    const newHealth = health - damage
    if (newHealth < 0) {
        return 0
    }
    return newHealth
}
```

**Monster Parade**

```js
for (let i = 1; i <= 20; i++) {
    if (i % 15 === 0) {
        console.log(`Monster ${i}: LEGENDARY`)
    } else if (i % 3 === 0) {
        console.log(`Monster ${i}: Boss`)
    } else if (i % 5 === 0) {
        console.log(`Monster ${i}: Loot drop`)
    } else {
        console.log(`Monster ${i}: Normal`)
    }
}
```

Bosses: 3, 6, 9, 12, 18 (five of them). Legendary: 15. Loot: 5, 10, 20.

**Exit ticket:** (1) `if (lives === 0) { console.log("Game over") }`. (2) 4 times. (3) `==` converts types before comparing; `===` doesn't.

## Lesson 3: Hello, Kaplay

**Predict:** a green 60 x 60 square whose **top-left corner** is at (100, 100), and a red circle of radius 30 whose **centre** is at (300, 200).

**Investigate**

1. The top-left corner (rectangles use a top-left anchor by default).
2. The centre. Circles are centred on `pos` by default, which is different from rectangles.
3. The square jumps to the top-left of the screen, at (0, 0).
4. The square turns white (the default colour).
5. No. The order of `pos`, `color` and `rect` doesn't matter, because each component is independent.
6. With `anchor("center")` the middle of the square sits on `pos`.

**Loop questions**

1. First ghost: `20 + 0 * 38 = 20`. Second: `20 + 1 * 38 = 58`.
2. It spaces the ghosts out: each lap moves them 38 pixels further right.
3. With 60, the row is wider than the 400 pixel screen after about 7 ghosts, so the rest are off-screen.

**Parsons:** `kaplay(...)`, `loadSprite(...)`, the `for` loop.

**Exit ticket:** (1) The top-left corner. (2) A piece of an object, such as `pos` and `color`. (3) Less typing, fewer mistakes, and easy to change.

## Lesson 4: Make It Move

**Trace table** (200 pixels per second, 60 frames per second, about 3.3 pixels per frame)

| Frame | `x` at start | After `move()` |
|---|---|---|
| 1 | 50 | 53.3 |
| 2 | 53.3 | 56.7 |
| 3 | 56.7 | 60 |
| 60 | about 246.7 | 250 |

**Investigate**

1. 250, so exactly 200 pixels further than where it started: matches `playerSpeed`.
2. 20 is extremely slow (about 3 seconds to move 60 pixels), 2000 is too fast to control.
3. The first number moves it sideways (`x`), the second moves it up and down (`y`). Use a positive second number to move down.
4. `onKeyDown` repeats every frame while held (good for walking). `onKeyPress` happens once (good for jumping or shooting).
5. One place to change; easier to read; avoids typos.

**Parsons:** `kaplay(...)`, `loadBean()`, `const player = add([...])`, `onKeyDown(...)`.

**Modify tasks**

```js
onKeyDown("up", () => {
    player.move(0, -playerSpeed)
})

onKeyDown("down", () => {
    player.move(0, playerSpeed)
})

onKeyDown("a", () => {
    player.move(-playerSpeed, 0)
})
```

For sprint:

```js
onKeyDown("right", () => {
    let currentSpeed = playerSpeed
    if (isKeyDown("shift")) {
        currentSpeed = playerSpeed * 2
    }
    player.move(currentSpeed, 0)
})
```

**Bug hunt:** pressing left and right together cancels out, so the bean doesn't move. Moving diagonally is about 41% faster because both handlers add their full speed. A diagonal move of (200, 200) has length about 283, not 200. A good Level Up discussion: normalise the movement with Pythagoras.

**Exit ticket:** (1) About 60 times per second. (2) `onKeyDown`. (3) Redrawing is Kaplay's job. We just describe where things are, and Kaplay draws them each frame.
