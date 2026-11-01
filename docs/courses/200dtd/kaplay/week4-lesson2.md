# Lesson 2: Hit Points

Last lesson you learned that a variable made **outside** the scenes keeps its value when you move between rooms. That's perfect for the **state of the game**: things the player carries from room to room, like their **health**.

In this lesson you'll add **hit points** (HP) to the house: a ghost in the cellar who bites, a heart in the kitchen that heals, and a game over when you run out.

## Warm-Up

Try not to look back at the previous lessons...

1. What happens to the objects in a scene when you `go(...)`(js) to another scene?

    <response>

2. Where must a variable be declared, if we want to **keep its value** when the scene changes?

    <response>

3. What does `go("hall")`(js) do?

    <response>


## Learning Goals

- <check> I can keep the game's **state** in variables outside the scenes
- <check> I can show the state in a **HUD**, and redraw it when it changes
- <check> I can change the state **when the player enters a room** or **clicks something**
- <check> I can end the game when HP reaches `0`
- <check> I can **reset** the game for another go
- <check> I can use a **function** to avoid repeating the same code in every room


## The Big Idea: **Global State**

The **state of the game** is everything the game needs to remember: the player's HP, what they're carrying, what they've already picked up... We keep it in **global** variables, outside every scene, so every room can read and change it.

| State        | Variable                       | Type    |
| ------------ | ------------------------------ | ------- |
| Health       | `let hp = 3`(js)               | Number  |
| Heart eaten? | `let heartTaken = false`(js)   | Boolean |

But scenes are rebuilt from scratch each time we enter them. So the **HUD** (the display of HP) has to be **redrawn** from the state, every time.

> [!NOTE]
> Behind the code below are two functions you've seen before, done for you: `addDoor(x, y, destination)`(js) from last lesson, and `showMessage(message)`(js), which puts a message at the bottom of the screen.


## **P**redict

Here's the house with HP. It's the longest code so far, but it's mostly rooms you've seen before:

```js
// The state of the game. It is outside every scene, so every room can see it
let hp = 3
let heartTaken = false

function resetGame() {
    hp = 3
    heartTaken = false
}

function drawHud() {
    destroyAll("hud")

    add([
        text(`HP: ${hp}`, { size: 28 }),
        pos(20, 20),
        "hud",
    ])
}

// Every room starts the same way
function setupRoom(name, colour) {
    setBackground(colour)
    drawHud()

    add([
        text(name, { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    onClick("door", (door) => {
        go(door.destination)
    })
}

scene("hall", () => {
    setupRoom("The Hall", rgb(60, 40, 80))

    addDoor(680, 330, "kitchen")
    addDoor(120, 330, "cellar")
})

scene("kitchen", () => {
    setupRoom("The Kitchen", rgb(40, 80, 60))

    addDoor(120, 330, "hall")

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
        drawHud()
        showMessage("Yum! You feel better. +1 HP")
    })
})

scene("cellar", () => {
    hp = hp - 1
    setupRoom("The Cellar", rgb(30, 30, 50))

    addDoor(120, 330, "hall")

    add([
        sprite("ghost"),
        pos(600, 300),
        anchor("center"),
        scale(2),
    ])

    showMessage("A ghost bites you! -1 HP")

    if (hp <= 0) {
        go("gameover")
    }
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

go("hall")
```

What does the HUD say when the game **starts**?

<response>

You walk into the cellar, then back to the hall, then into the cellar again. What does the HUD say?

<response>

What will happen if you keep going into the cellar?

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
loadSprite("heart", "assets/images/heart.png")
loadSprite("ghost", "assets/images/ghost.png")
loadSprite("skull", "assets/images/skull.png")

// Shows a message at the bottom of the screen
function showMessage(message) {
    destroyAll("message")

    add([
        text(message, { size: 28 }),
        pos(width() / 2, 540),
        anchor("center"),
        color(255, 220, 0),
        "message",
    ])
}

function addDoor(x, y, destination) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}
```

</web-playground>

Run it, and walk around the house. Compare it with your predictions - any differences?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// The state of the game. It is outside every scene, so every room can see it
let hp = 3
let heartTaken = false

function resetGame() {
    hp = 3
    heartTaken = false
}

function drawHud() {
    destroyAll("hud")

    add([
        text(`HP: ${hp}`, { size: 28 }),
        pos(20, 20),
        "hud",
    ])
}

// Every room starts the same way
function setupRoom(name, colour) {
    setBackground(colour)
    drawHud()

    add([
        text(name, { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    onClick("door", (door) => {
        go(door.destination)
    })
}

scene("hall", () => {
    setupRoom("The Hall", rgb(60, 40, 80))

    addDoor(680, 330, "kitchen")
    addDoor(120, 330, "cellar")
})

scene("kitchen", () => {
    setupRoom("The Kitchen", rgb(40, 80, 60))

    addDoor(120, 330, "hall")

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
        drawHud()
        showMessage("Yum! You feel better. +1 HP")
    })
})

scene("cellar", () => {
    hp = hp - 1
    setupRoom("The Cellar", rgb(30, 30, 50))

    addDoor(120, 330, "hall")

    add([
        sprite("ghost"),
        pos(600, 300),
        anchor("center"),
        scale(2),
    ])

    showMessage("A ghost bites you! -1 HP")

    if (hp <= 0) {
        go("gameover")
    }
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

go("hall")
```

</web-playground>


## **I**nvestigate

1. Why is `hp`(js) declared **outside** the scenes? What would go wrong if it was declared inside the hall scene?

    <response>

2. In the cellar, `hp = hp - 1`(js) comes **before** `setupRoom(...)`(js). Try swapping them. What happens to the HUD, and why?

    <response>

3. What is `heartTaken`(js) for? What would happen if the heart scene never set it to `true`?

    <response>

4. The `setupRoom(...)`(js) function is called in every room. What would the code look like without it?

    <response>


## **M**odify

### Bug Hunt

This house has some bugs. Run it, walk around, and look carefully at what happens. Can you fix the following?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// The state of the game. It is outside every scene, so every room can see it
let hp = 3
let heartTaken = false

function resetGame() {
    hp = 3
    heartTaken = false
}

function drawHud() {
    destroyAll("hud")

    add([
        text(`HP: ${hp}`, { size: 28 }),
        pos(20, 20),
        "hud",
    ])
}

// Every room starts the same way
function setupRoom(name, colour) {
    setBackground(colour)
    drawHud()

    add([
        text(name, { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    onClick("door", (door) => {
        go(door.destination)
    })
}

scene("hall", () => {
    setupRoom("The Hall", rgb(60, 40, 80))

    addDoor(680, 330, "kitchen")
    addDoor(120, 330, "cellar")
})

scene("kitchen", () => {
    setupRoom("The Kitchen", rgb(40, 80, 60))

    addDoor(120, 330, "hall")

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
        hp = hp + 1
        destroy(heart)
        drawHud()
        showMessage("Yum! You feel better. +1 HP")
    })
})

scene("cellar", () => {
    setupRoom("The Cellar", rgb(30, 30, 50))
    hp = hp - 1

    addDoor(120, 330, "hall")

    add([
        sprite("ghost"),
        pos(600, 300),
        anchor("center"),
        scale(2),
    ])

    showMessage("A ghost bites you! -1 HP")

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

go("hall")
```

</web-playground>

1. <check> In the cellar, the HUD shows the **old** HP, until you move rooms
2. <check> The **heart** can be eaten **again and again**, every time you visit the kitchen
3. <check> **Nothing happens** when HP reaches `0`: you can keep going into the negatives

> [!TIP]
> Think about **when** things happen. What order should they be in? And what **remembers** that the heart has been eaten?

### Tinker

Go back to the **working** house in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Make the ghost's bite cost **2 HP**
2. <check> Put a **skull** in the hall (the picture is already loaded) that costs **1 HP** when you click it
3. <check> Show **"Careful!"** at the bottom of the screen when the player is down to **1 HP**


## **M**ake

### Dangerous House

Add **danger** to the house you built last lesson.

Your house must have:

- <check> An **HP** value, shown on a **HUD** in every room
- <check> At least **one hazard** that costs HP
- <check> At least **one pickup** that gives HP, which can only be used **once**
- <check> A **game over** scene when HP reaches `0`, and SPACE to **try again** with a fresh start

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// Copy your house from Lesson 1 and the helper functions from above here, then add danger!
```

</web-playground>

> [!TIP]
> The helper functions you need are in the code above: `resetGame()`(js), `drawHud()`(js) and `setupRoom(...)`(js). `addDoor(...)`(js) is in Lesson 1. And here is `showMessage(...)`(js), which was done for you:
>
> ```js
> function showMessage(message) {
>     destroyAll("message")
>
>     add([
>         text(message, { size: 28 }),
>         pos(width() / 2, 540),
>         anchor("center"),
>         color(255, 220, 0),
>         "message",
>     ])
> }
> ```

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                  | Hint                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| A **random** amount of damage in the cellar                | `hp = hp - randi(1, 3)`(js)                                               |
| A **maximum** HP, so hearts can't heal beyond it           | An `if`(js) after healing: `if (hp > 5) { hp = 5 }`(js)                   |
| Show the player's **HP as hearts**, one picture per HP     | A `for`(js) loop in `drawHud`(js), adding a `heart` sprite each lap       |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # Why is `hp` declared outside all of the scenes?

    ---

    - [ ] So it can't be changed
    - [x] So every room can see it, and it keeps its value between rooms
    - [ ] Because scenes can't have variables
    - [ ] So it runs faster

- # `drawHud()` starts with `destroyAll("hud")`. Why?

    ---

    - [ ] To end the game
    - [x] To remove the old HUD, so the new one isn't drawn on top of it
    - [ ] To delete the HP
    - [ ] To hide the heart

- # What is `resetGame()` for?

    ---

    - [ ] To go back to the hall
    - [x] To put the state back to how it was at the start of a new game
    - [ ] To restart Kaplay
    - [ ] To make HP bigger

</quiz>
