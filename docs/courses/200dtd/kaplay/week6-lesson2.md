# Lesson 2: Level Maps

Last lesson, every platform needed its own line of code, and its own `x` and `y` worked out by hand. That's fine for three platforms... but a real level has hundreds of blocks. Today you'll **draw** levels instead, using nothing but text!

## Warm-Up

Try not to look back at the previous lessons...

1. Why does a floor need `body({ isStatic: true })`(js), and not just `body()`(js)?

    <response>

2. Why do we check `player.isGrounded()`(js) before jumping?

    <response>

3. In Week 3, what was an **array**? What was an **object**?

    <response>


## Learning Goals

- <check> I can describe a level as an **array of strings**: a **map**
- <check> I can turn a map into a level with `addLevel(...)`(js)
- <check> I can define what each **character** in a map becomes
- <check> I can **design** a level on paper, and then build it


## The Big Idea: **Level Maps**

A **map** is an array of strings. Each string is one **row** of the level, and each character is one **tile**. A space means "nothing here".

```js
"            ",
"   ##       ",
"@        ## ",
"============",
```

Can you see the level? The `=` is the ground, the `#` are steel blocks, and the `@` is where the player starts.

`addLevel(...)`(js) reads the map, and adds a game object for every character. We tell it how big each tile is, and what each character turns into:

| Code                                 | What it does                                                    |
| ------------------------------------ | --------------------------------------------------------------- |
| `addLevel(map, { ... })`(js)         | Builds a level from a map                                       |
| `tileWidth: 64, tileHeight: 64`(js)  | The size of every tile. Each **column** is 64 pixels wide, and each **row** is 64 pixels tall |
| `tiles: { "#": () => [ ... ] }`(js)  | What each character becomes: a list of **components**, like `add([ ... ])`(js) |
| `level.get("player")[0]`(js)         | Finds the object tagged `"player"` in the level. `get` gives an **array**, so `[0]`(js) is the first one |

> [!NOTE]
> Why is each tile a **function**, `() => [ ... ]`(js)? Because Kaplay calls it **once for every tile**, so every block gets its own, brand new, components. Ten `#` in the map? The function runs ten times.

> [!TIP]
> Our screen is 768 by 576, and the tiles are 64 by 64. So a map that fills the screen is **12 characters wide** and **9 rows tall**.


## **P**redict

The controls from last lesson are done for you, in a function called `addControls(player)`(js). Here's the new code:

```js
const level = addLevel([
    "            ",
    "            ",
    "            ",
    "            ",
    "       ###  ",
    "            ",
    "   ##       ",
    "@        ## ",
    "============",
], {
    tileWidth: 64,
    tileHeight: 64,
    tiles: {
        "=": () => [
            sprite("grass"),
            area(),
            body({ isStatic: true }),
        ],
        "#": () => [
            sprite("steel"),
            area(),
            body({ isStatic: true }),
        ],
        "@": () => [
            sprite("bean"),
            area(),
            body({ jumpForce: 700 }),
            "player",
        ],
    },
})

const player = level.get("player")[0]
addControls(player)
```

Sketch what you think the level will look like. Where does the bean start?

<response>

How many steel blocks will there be?

<response>

The rows and columns are counted from **0**. The first `#` in row 6 is in column 3. Where on the screen will its top-left corner be?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```

```js id=kaplay
kaplay({
    width: 768, height: 576,
    background: [110, 180, 240]
})

loadBean()
loadSprite("grass", "assets/images/grass.png")
loadSprite("steel", "assets/images/steel.png")

setGravity(1600)

const playerSpeed = 300

// Last lesson's controls. Falling off the bottom sends the player back to the start
function addControls(player) {
    const startX = player.pos.x
    const startY = player.pos.y

    onKeyDown("left", () => {
        player.move(-playerSpeed, 0)
        player.flipX = true
    })

    onKeyDown("right", () => {
        player.move(playerSpeed, 0)
        player.flipX = false
    })

    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump()
        }
    })

    onUpdate(() => {
        player.pos.x = clamp(player.pos.x, 0, width() - player.width)

        if (player.pos.y > height()) {
            player.pos.x = startX
            player.pos.y = startY
        }
    })
}
```
</web-playground>

Run the code and compare it with your predictions.

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
const level = addLevel([
    "            ",
    "            ",
    "            ",
    "            ",
    "       ###  ",
    "            ",
    "   ##       ",
    "@        ## ",
    "============",
], {
    tileWidth: 64,
    tileHeight: 64,
    tiles: {
        "=": () => [
            sprite("grass"),
            area(),
            body({ isStatic: true }),
        ],
        "#": () => [
            sprite("steel"),
            area(),
            body({ isStatic: true }),
        ],
        "@": () => [
            sprite("bean"),
            area(),
            body({ jumpForce: 700 }),
            "player",
        ],
    },
})

const player = level.get("player")[0]
addControls(player)
```

</web-playground>


## **I**nvestigate

1. Type a `?`(js) somewhere in the map. What happens? Do you get an error?

    <response>

2. Change `tileWidth`(js) to `32`(js). What happens to the level, and why?

    <response>

3. Why does the `"@"`(js) tile need the `"player"`(js) tag?

    <response>

### Reading a Map

A map is just an array of strings, so we can loop through it, like the arrays in Week 3. A string can be looped through too, one **character** at a time. Step through this code:

```js trace header="false"
const map = [
    "    ",
    " ## ",
    "====",
]

let blocks = 0

for (const row of map) {
    for (const tile of row) {
        if (tile !== " ") {
            blocks = blocks + 1
        }
    }
}

console.log(blocks)
```

How many times does the **inner** loop run, in total? Why?

<response>

### Match the Code

<drag-drop mode="code" title="Map Words" sub-title="Drag each description to its code">

1.
    ```js
    "="
    ```

2.
    ```js
    " "
    ```

3.
    ```js
    tileWidth: 64
    ```

4.
    ```js
    "player"
    ```

5.
    ```js
    level.get("player")[0]
    ```

---

1. A character in the map that becomes a grass tile
2. Nothing here: empty sky
3. How wide each column of the map is, in pixels
4. A tag, so we can find this object later
5. Find the player object in the level

</drag-drop>


## **M**odify

### Bug Hunt

This level has **three bugs**. Find and fix them, in order!

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
const level = addLevel([
    "            ",
    "            ",
    "            ",
    "            ",
    "       ###  ",
    "            ",
    "   ##       ",
    "@        ## ",
    "============",
], {
    tileWidth: 64,
    tileHeight: 46,
    tiles: {
        "=": () => [
            sprite("grass"),
            area(),
        ],
        "S": () => [
            sprite("steel"),
            area(),
            body({ isStatic: true }),
        ],
        "@": () => [
            sprite("bean"),
            area(),
            body({ jumpForce: 700 }),
            "player",
        ],
    },
})

const player = level.get("player")[0]
addControls(player)
```

</web-playground>

1. <check> The bean **falls straight through** the grass, again and again
2. <check> The steel platforms are **missing**
3. <check> The level looks **squashed**: the tiles overlap, and there's a big gap at the bottom

> [!TIP]
> Compare each character in the map with the characters in `tiles`(js). And check the sizes!


### Tinker

Go back to the **working** level in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Add a new platform, just by typing in the map
2. <check> Move the bean's **starting position**
3. <check> Build a **staircase** from the floor up to the top-right corner. Can the bean climb it?
4. <check> Add a `"*"`(js) tile that shows a flower, with **only** a `sprite(...)`(js): no area, and no body. (You'll need `loadSprite("flower", "assets/images/flower.png")`(js) at the top.) What happens when the bean walks into a flower?


## **M**ake

### Design a Level

1. **Plan on paper first.** Draw a grid 12 squares wide and 9 squares tall. Draw your level on it, then write the character for each square.
2. Type your map into the code below, and playtest it. Can you reach **everywhere** you meant to?

<web-playground data-height="40em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// TODO: draw your own level. Keep every row 12 characters long!
const level = addLevel([
    "            ",
    "            ",
    "            ",
    "            ",
    "            ",
    "            ",
    "            ",
    "@           ",
    "============",
], {
    tileWidth: 64,
    tileHeight: 64,
    tiles: {
        "=": () => [
            sprite("grass"),
            area(),
            body({ isStatic: true }),
        ],
        "#": () => [
            sprite("steel"),
            area(),
            body({ isStatic: true }),
        ],
        "@": () => [
            sprite("bean"),
            area(),
            body({ jumpForce: 700 }),
            "player",
        ],
        // TODO: at least one new kind of tile
    },
})

const player = level.get("player")[0]
addControls(player)
```

</web-playground>

Your level must have:

- <check> A plan on **paper**, drawn before you typed it in
- <check> Platforms at **three or more** different heights, and every one can be **reached**
- <check> At least one **gap** in the floor to fall through
- <check> At least one **new kind of tile** of your own

> [!WARNING]
> Watch out for **low ceilings**! If there's a block right above the bean's head, the bean will bump into it and can't jump. Leave some sky above every place you need to jump from.


### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                         | Hint                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A **secret passage**: a wall you can walk through | A tile with the same picture as a wall, but **no body**                                    |
| A **detailed** level with smaller tiles           | `tileWidth: 32`(js) and `tileHeight: 32`(js), and add `scale(0.5)`(js) to every tile. Now the map is 24 by 18! |
| An **exit** for the bean to aim for (next lesson, it will work!) | `loadSprite("portal", "assets/images/portal.png")`(js). The portal is smaller than a tile, so give the tile `pos(7, 6)`(js) to put it in the middle |
| **Count** the tiles in your level                 | Loop through the map, like the trace above, and `console.log(...)`(js) the total           |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # In a map, what does each **string** in the array stand for?

    ---

    - [ ] One tile
    - [x] One row of the level
    - [ ] One column of the level
    - [ ] The whole level

- # A map uses `#` for walls, but `tiles` only has `"="` and `"@"`. What happens to the walls?

    ---

    - [ ] The game crashes with an error
    - [ ] They turn into grass
    - [x] They are skipped: there are no walls, and no error
    - [ ] They turn into the player

- # With 64 by 64 tiles, where is the top-left corner of the tile in **row 2**, **column 5**?

    ---

    - [ ] x = 2, y = 5
    - [ ] x = 128, y = 320
    - [x] x = 320, y = 128
    - [ ] x = 64, y = 64

</quiz>
