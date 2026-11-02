# Week 6: Gravity, Physics & Platforms


## Lesson 1: Gravity & Jumping

<slides>

# Lesson 1: Gravity & Jumping

Note:
Kaplay does the moving now. The big idea is the physics body, and the static body that gravity can't pull down

---

## Learning

- Switching on **gravity**
- **Physics bodies**
- Floors that **don't fall**
- **Jumping**, and game feel

---

## Bodies

```js
setGravity(1600)

add([
    sprite("grass"),
    pos(x, height() - 64),
    area(),
    body({ isStatic: true }),
])
```

A **static** body never moves

Note:
Ask what happens without isStatic. The floor falls too. The area is the shape, the body is the physics

---

## Jump!

```js
onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump()
    }
})
```

Only from the **ground**

Note:
Without the check, tapping SPACE climbs into the sky. jumpForce goes in body({ jumpForce: 700 })

---

## Game Feel

| Gravity | Jump force | Feels...  |
| ------- | ---------- | --------- |
| 400     | 400        | Floaty    |
| 1600    | 700        | Just right? |
| 3000    | 1000       | Snappy    |

Note:
There's no right answer. Get them to try both extremes in the Tinker step

---

## Make: Platform Practice

- A floor with a **gap**
- **Three** platforms, all **reachable**
- Your own **gravity** and **jump**
- Fall off: back to the **start**

</slides>



## Lesson 2: Level Maps

<slides>

# Lesson 2: Level Maps

Note:
Draw levels as text. A map is an array of strings, which connects back to Week 3

---

## Learning

- A level as an **array of strings**
- `addLevel(...)`
- **Tiles**
- Design on **paper** first

---

## A Map

```js
const level = addLevel([
    "            ",
    "   ##       ",
    "@        ## ",
    "============",
], {
    tileWidth: 64,
    tileHeight: 64,
    tiles: { ... },
})
```

One **string** per row, one **character** per tile

Note:
12 characters wide and 9 rows tall fills the 768 by 576 screen. Rows and columns count from 0

---

## Tiles

```js
tiles: {
    "#": () => [
        sprite("steel"),
        area(),
        body({ isStatic: true }),
    ],
}
```

Each character becomes a list of **components**

Note:
It's a function so that every tile gets new components. An unknown character is skipped, with no error

---

## Finding the Player

```js
const player = level.get("player")[0]
```

`get` gives an **array**, so `[0]` is the first one

---

## Make: Design a Level

- Plan it on **paper**
- **Three** heights, all **reachable**
- A **gap** in the floor
- A **new tile** of your own

Note:
Warn them about low ceilings: a block right above the player stops the jump

</slides>



## Lesson 3: Pickups & Levels

<slides>

# Lesson 3: Pickups & Levels

Note:
Coins, spikes and exits, and an array of levels. Reuses the global state, HUD and loseLife from Weeks 4 and 5

---

## Learning

- **Pickups** and **hazards**
- An **array of levels**
- `currentLevel`
- **Winning**

---

## Sensors

```js
"$": () => [
    sprite("coin"),
    pos(18, 15),
    area({ isSensor: true }),
    "coin",
],
```

The player has a body. Pickups need a **sensor**

Note:
Without isSensor the bean walks straight through, and there's no error. The pos nudges the tile inside its square

---

## Touching

```js
onCollide("player", "coin", (player, coin) => {
    destroy(coin)
    coins = coins + 1
})

onCollide("player", "spike", (player) => {
    destroy(player)
    loseLife()
})
```

Note:
destroy(player) first, so landing on two spikes only costs one life. Show this in the Investigate step

---

## Next Level

```js
function nextLevel() {
    currentLevel = currentLevel + 1

    if (currentLevel >= levels.length) {
        go("win")
        return
    }

    go("game")
}
```

`go("game")` builds `levels[currentLevel]`

Note:
Why >= and not >? The last index is length minus 1

---

## Make: More Levels

- **Two new levels**, with `levels.push(...)`
- They get **harder**
- The exit only opens when **every coin** is collected

</slides>



## Lesson 4: Build a Platformer

<slides>

# Lesson 4: Build a Platformer

Note:
Student-led. Plan first, then four checkpoints. Insist on paper level designs before typing

---

## The Brief

Your own **platformer**:

- Run, jump, and a feel that's **right**
- **Three levels** that get harder
- Something to **collect**, and a **hazard**
- **Lives**, and four **scenes**
- Your own **theme**

---

## Checkpoints

1. **Run and jump**
2. **Things to do**
3. **Levels**
4. **Scenes**

Note:
Check the plan before they start. Common problems: missing isSensor, a tag that doesn't match, a character not in tiles, low ceilings

---

## Level Swap

Maps are **data**: swap a level with a partner!

Note:
Their level, your tiles and your jump. Does it still work? A good way to see why the numbers matter

---

## Going Further

- **Double jump**, **bounce pads**, **enemies**
- A **speedrun** timer
- A **scrolling camera** for big levels

Note:
The scrolling camera is in the Level Up section: wider maps, setCamPos, fixed() on the HUD, and walls at each end

</slides>
