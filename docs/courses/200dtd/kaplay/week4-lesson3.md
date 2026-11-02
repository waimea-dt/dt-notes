# Lesson 3: Inventory

The player can now lose and gain **HP**, but a good adventure also lets you **pick things up**. In this lesson you'll add an **inventory**: a list of items the player is carrying. You'll find a key in the cellar, and use it to unlock the attic.

## Warm-Up

Try not to look back at the previous lessons...

1. Why is the `hp` variable declared **outside** all of the scenes?

    <response>

2. The HUD label uses `onUpdate(...)`(js). What does that let it do?

    <response>

3. What does `items.push("key")`(js) do?

    <response>


## Learning Goals

- <check> I can keep an **inventory** as an **array** in the game's state
- <check> I can add an item with `push`, and check for one with `includes`
- <check> I can build a room **based on the state**: pickups that are already taken don't come back
- <check> I can make a **locked door** that needs an item
- <check> I can show the inventory in the **HUD**


## The Big Idea: **State Decides the Room**

A scene is built from scratch **every time** we enter it. So if the player has already picked up the key, the cellar mustn't build the key again! The scene has to **look at the state** to decide what to build:

```js
if (!inventory.includes("key")) {
    // the key hasn't been picked up yet, so add it to the room
}
```

| Code                                   | What it does                                      |
| -------------------------------------- | ------------------------------------------------- |
| `inventory.push("key")`(js)            | Adds `"key"` to the end of the array              |
| `inventory.includes("key")`(js)        | `true` if the array has `"key"` in it, else `false` |
| `inventory.join(", ")`(js)             | Joins all of the items into one piece of text     |

> [!NOTE]
> The kitchen, the attic and the game over scenes are done for you in the code behind the playgrounds below, along with `hp`(js), `heartTaken`(js) and `showMessage(...)`(js). The pictures `key`, `star` and `sword` are loaded for you too.


## **P**redict

Here's the house with an inventory. Read the code carefully. The `needs` parameter of `addDoor`(js) is new:

```js
// The state of the game, outside every scene. hp and heartTaken are done for you
let inventory = []

function resetGame() {
    hp = 3
    inventory = []
    heartTaken = false
}

function createHud() {
    const hpLabel = add([
        text("", { size: 28 }),
        pos(20, 20),
    ])

    const inventoryLabel = add([
        text("", { size: 28 }),
        pos(600, 20),
    ])

    // The labels watch the state, so they update themselves
    hpLabel.onUpdate(() => {
        hpLabel.text = `HP: ${hp}`
    })

    inventoryLabel.onUpdate(() => {
        inventoryLabel.text = `Inventory:\n ${inventory.join("\n ")}`
    })
}

function addDoor(x, y, destination, needs) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination, needs: needs },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}

function setupRoom(name, colour) {
    setBackground(colour)
    createHud()

    add([
        text(name, { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    onClick("door", (door) => {
        if (door.needs && !inventory.includes(door.needs)) {
            showMessage(`The door is locked. You need the ${door.needs}!`)
            return
        }

        go(door.destination)
    })
}

scene("hall", () => {
    setupRoom("The Hall", rgb(60, 40, 80))

    addDoor(630, 380, "kitchen")
    addDoor(170, 380, "cellar")
    addDoor(400, 230, "attic", "key")
})

scene("cellar", () => {
    hp = hp - 1
    setupRoom("The Cellar", rgb(30, 30, 50))

    addDoor(170, 250, "hall")

    add([
        sprite("ghost"),
        pos(600, 300),
        anchor("center"),
        scale(2),
    ])

    showMessage("A ghost bites you! -1 HP")

    if (!inventory.includes("key")) {
        add([
            sprite("key"),
            pos(350, 430),
            anchor("center"),
            scale(2),
            area(),
            "key",
        ])
    }

    onClick("key", (key) => {
        inventory.push("key")
        destroy(key)
        showMessage("You found a key!")
    })

    if (hp <= 0) {
        go("gameover")
    }
})

go("hall")
```

What does the HUD say after you pick up the key in the cellar?

<response>

What happens if you click the **attic door** in the hall **before** you have the key? And **after**?

<response>

You've picked up the key. Now you walk out of the cellar, and back in again. Will the key still be there? Why, or why not?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```

```js id=kaplay
kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadSprite("door",  "assets/images/door.png")
loadSprite("key",   "assets/images/key.png")
loadSprite("heart", "assets/images/heart.png")
loadSprite("ghost", "assets/images/ghost.png")
loadSprite("star",  "assets/images/star.png")
loadSprite("sword", "assets/images/sword.png")

let hp = 3
let heartTaken = false

function showMessage(message) {
    destroyAll("message")

    add([
        text(message, { size: 28 }),
        pos(width() / 2, 540),
        anchor("center"),
        color(255, 220, 0),
        opacity(1),
        lifespan(2, { fade: 0.5 }),
        "message",
    ])
}

scene("kitchen", () => {
    setupRoom("The Kitchen", rgb(40, 80, 60))

    addDoor(170, 250, "hall")

    if (!heartTaken) {
        add([
            sprite("heart"),
            pos(560, 400),
            anchor("center"),
            scale(2),
            area(),
            "heart",
        ])
    }

    onClick("heart", (heart) => {
        heartTaken = true
        hp = hp + 1
        destroy(heart)
        showMessage("Yum! You feel better. +1 HP")
    })
})

scene("attic", () => {
    setupRoom("The Attic", rgb(90, 70, 30))

    addDoor(170, 250, "hall")

    add([
        sprite("star"),
        pos(400, 300),
        anchor("center"),
        scale(3),
    ])

    add([
        text("You found the treasure! You win!", { size: 32 }),
        pos(width() / 2, 440),
        anchor("center"),
        color(255, 220, 0),
    ])

    add([
        text("Press SPACE to play again", { size: 22 }),
        pos(width() / 2, 490),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        resetGame()
        go("hall")
    })
})

scene("gameover", () => {
    setBackground(rgb(70, 0, 0))

    add([
        text("Game Over", { size: 64 }),
        pos(width() / 2, 230),
        anchor("center"),
    ])

    add([
        text("Press SPACE to try again", { size: 26 }),
        pos(width() / 2, 340),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        resetGame()
        go("hall")
    })
})
```

</web-playground>

Run it, and explore. Compare it with your predictions - any differences?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// The state of the game, outside every scene. hp and heartTaken are done for you
let inventory = []

function resetGame() {
    hp = 3
    inventory = []
    heartTaken = false
}

function createHud() {
    const hpLabel = add([
        text("", { size: 28 }),
        pos(20, 20),
    ])

    const inventoryLabel = add([
        text("", { size: 28 }),
        pos(600, 20),
    ])

    // The labels watch the state, so they update themselves
    hpLabel.onUpdate(() => {
        hpLabel.text = `HP: ${hp}`
    })

    inventoryLabel.onUpdate(() => {
        inventoryLabel.text = `Inventory:\n ${inventory.join("\n ")}`
    })
}

function addDoor(x, y, destination, needs) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination, needs: needs },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}

function setupRoom(name, colour) {
    setBackground(colour)
    createHud()

    add([
        text(name, { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    onClick("door", (door) => {
        if (door.needs && !inventory.includes(door.needs)) {
            showMessage(`The door is locked. You need the ${door.needs}!`)
            return
        }

        go(door.destination)
    })
}

scene("hall", () => {
    setupRoom("The Hall", rgb(60, 40, 80))

    addDoor(630, 380, "kitchen")
    addDoor(170, 380, "cellar")
    addDoor(400, 230, "attic", "key")
})

scene("cellar", () => {
    hp = hp - 1
    setupRoom("The Cellar", rgb(30, 30, 50))

    addDoor(170, 250, "hall")

    add([
        sprite("ghost"),
        pos(600, 300),
        anchor("center"),
        scale(2),
    ])

    showMessage("A ghost bites you! -1 HP")

    if (!inventory.includes("key")) {
        add([
            sprite("key"),
            pos(350, 430),
            anchor("center"),
            scale(2),
            area(),
            "key",
        ])
    }

    onClick("key", (key) => {
        inventory.push("key")
        destroy(key)
        showMessage("You found a key!")
    })

    if (hp <= 0) {
        go("gameover")
    }
})

go("hall")
```

</web-playground>


## **I**nvestigate

1. What do `inventory.push("key")`(js) and `inventory.includes("key")`(js) do? Which one **changes** the state?

    <response>

2. Try **deleting** the `if (!inventory.includes("key"))`(js) check in the cellar (keep the code inside it). What happens when you visit the cellar a second time? Why?

    <response>

3. `addDoor(...)`(js) has a fourth parameter, `needs`. Most doors don't pass it, so it is `undefined`. How does `door.needs && !inventory.includes(door.needs)`(js) deal with that?

    <response>

4. `resetGame()`(js) now includes `inventory = []`(js). What would happen after winning, then playing again, if it didn't?

    <response>


## **M**odify

### Bug Hunt

This house has some bugs. Run it, explore, and look carefully at what happens. Can you fix the following?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// The state of the game, outside every scene. hp and heartTaken are done for you
let inventory = []

function resetGame() {
    hp = 3
    heartTaken = false
}

function createHud() {
    const hpLabel = add([
        text("", { size: 28 }),
        pos(20, 20),
    ])

    const inventoryLabel = add([
        text("", { size: 28 }),
        pos(600, 20),
    ])

    // The labels watch the state, so they update themselves
    hpLabel.onUpdate(() => {
        hpLabel.text = `HP: ${hp}`
    })

    inventoryLabel.onUpdate(() => {
        inventoryLabel.text = `Inventory:\n ${inventory.join("\n ")}`
    })
}

function addDoor(x, y, destination, needs) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination, needs: needs },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}

function setupRoom(name, colour) {
    setBackground(colour)
    createHud()

    add([
        text(name, { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    onClick("door", (door) => {
        if (door.needs && inventory.includes(door.needs)) {
            showMessage(`The door is locked. You need the ${door.needs}!`)
            return
        }

        go(door.destination)
    })
}

scene("hall", () => {
    setupRoom("The Hall", rgb(60, 40, 80))

    addDoor(630, 380, "kitchen")
    addDoor(170, 380, "cellar")
    addDoor(400, 230, "attic", "key")
})

scene("cellar", () => {
    hp = hp - 1
    setupRoom("The Cellar", rgb(30, 30, 50))

    addDoor(170, 250, "hall")

    add([
        sprite("ghost"),
        pos(600, 300),
        anchor("center"),
        scale(2),
    ])

    showMessage("A ghost bites you! -1 HP")

    add([
        sprite("key"),
        pos(350, 430),
        anchor("center"),
        scale(2),
        area(),
        "key",
    ])

    onClick("key", (key) => {
        inventory.push("key")
        destroy(key)
        showMessage("You found a key!")
    })

    if (hp <= 0) {
        go("gameover")
    }
})

go("hall")
```

</web-playground>

1. <check> The **key** appears again every time you enter the cellar, even after you've picked it up
2. <check> The **attic door** opens **without** the key (and is locked once you have it!)
3. <check> After winning and playing again, you **still have the key**

> [!TIP]
> Read the code that **builds** the cellar, the code that **checks** the door, and the code that **resets** the game. What should each one be looking at?

### Tinker

Go back to the **working** house in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Show **`(nothing)`** under `Inventory:` in the HUD when the inventory is **empty** (hint: `inventory.length === 0`(js))
2. <check> Add a **sword** to the hall that can be picked up (and doesn't come back after it's picked up)
3. <check> Make the **cellar door** need the sword, so the player must collect it first


## **M**ake

### Items and Locks

Add **items** to the house you've been building.

Your house must have:

- <check> **At least two items** to pick up, each with its own picture
- <check> Items that **don't come back** once they've been picked up
- <check> **At least one locked door** that needs an item
- <check> The **inventory** shown on the HUD
- <check> A room that **wins** the game, and SPACE to play again with a fresh start

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// Copy your house from Lesson 2 and the new helper functions from above here, then add items and locks!
```

</web-playground>

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                          | Hint                                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| A door that needs **two** items                                    | Two `needs`(js) parameters, or an **array** of needs                         |
| An item that is **used up** when you open the door                 | Remove it from the array with `inventory.splice(...)`(js)                    |
| A **hint** message when the player picks something up              | `showMessage(...)`(js) with a clue about where to use it                     |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does `inventory.includes("key")` give us?

    ---

    - [ ] The number of keys
    - [x] `true` if the inventory has a key in it, otherwise `false`
    - [ ] The key itself
    - [ ] It adds a key

- # Why does the cellar check `if (!inventory.includes("key"))` before building the key?

    ---

    - [ ] To make the key bigger
    - [x] So a key that's already been picked up isn't built again
    - [ ] To stop the key being clicked
    - [ ] To add the key to the inventory

- # Where is the state of the game kept, so that every room can see it?

    ---

    - [ ] Inside each scene
    - [x] In global variables, outside all of the scenes
    - [ ] In the door objects
    - [ ] In the HUD

</quiz>
