# Lesson 2: Scenes

Last lesson you showed a deck of cards on screen. But a real game needs more than one screen: a **title** screen, the **game** itself, a **results** screen... In this lesson you'll learn how Kaplay lets you build a game out of separate **scenes**, and you'll use them to build a card gallery.

## Warm-Up

Try not to loop back at the previous lesson...

1. An array has 6 items. What is the index of the **last** one?

    <response>

2. How would you get the `power` of the card stored in `card`(js)?

    <response>

3. If `statName`(js) is `"speed"`, how do you get that stat from `card`(js)?

    <response>


## Learning Goals

- <check> I can define a **scene** with `scene(...)`(js)
- <check> I can switch scenes with `go(...)`(js)
- <check> I can **pass data** from one scene to the next
- <check> I can explain what happens to **objects** and **variables** when the scene changes
- <check> I can build a game with a **title**, a **gallery** and a **detail** scene


## The Big Idea: **Scenes**

A **scene** is one screen of your game, with its own objects and its own code. You **define** scenes, then **go** to them:

| Function                                    | What it does                                               |
| ------------------------------------------- | ---------------------------------------------------------- |
| `scene("name", () => { ... })`(js)          | **Defines** a scene. The code inside runs when we go there |
| `go("name")`(js)                            | **Switches** to a scene                                    |
| `go("name", { score: 10 })`(js)             | Switches to a scene and **passes it some data**            |
| `scene("name", (data) => { ... })`(js)      | A scene that **receives** the data                         |

<sequence animated="true">

1. ### <i data-lucide="play"></i> Title
    - Name of the game
    - **Press SPACE** to start

2. ### <i data-lucide="layout-grid"></i> Gallery
    - Shows **every card**
    - **Click** a card to see it

3. ### <i data-lucide="credit-card"></i> Detail
    - Shows **one card**, large
    - **Press SPACE** to go back

</sequence>

When Kaplay switches scene, it **throws away everything** from the old scene: all of its objects, its event handlers (like `onKeyPress`) and its timers. Then it runs the code of the new scene from the top.

> [!IMPORTANT]
> A scene doesn't start until you `go(...)`(js) to it. Always finish your program with a `go(...)`(js) to your first scene.


## **P**redict

Look at this Kaplay program with three scenes:

```js
kaplay({
    width: 600, height: 400,
    background: [30, 60, 90]
})

const statNames = ["speed", "power", "cuteness", "spookiness"]

const deck = [
    { name: "Cat", image: "cat", speed: 8, power: 4, cuteness: 9, spookiness: 2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness: 1 },
    { name: "Fish", image: "fish", speed: 7, power: 2, cuteness: 5, spookiness: 2 },
    { name: "Ghost", image: "ghost", speed: 5, power: 3, cuteness: 4, spookiness: 10 },
    { name: "Mushroom", image: "mushroom", speed: 1, power: 2, cuteness: 6, spookiness: 5 },
]

for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

// Outside every scene, so it is kept when the scene changes
let viewedCount = 0

function makeStatsText(card) {
    let statsText = ""
    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]
        statsText = statsText + `${statName}: ${card[statName]}\n`
    }
    return statsText
}

scene("title", () => {
    add([
        text("Card Gallery", { size: 56 }),
        pos(width() / 2, 150),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 24 }),
        pos(width() / 2, 240),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("gallery")
    })
})

scene("gallery", () => {
    add([
        text("Click a card", { size: 32 }),
        pos(width() / 2, 50),
        anchor("center"),
    ])

    add([
        text(`Cards viewed: ${viewedCount}`, { size: 20 }),
        pos(width() / 2, 90),
        anchor("center"),
        color(150, 170, 200),
    ])

    for (let i = 0; i < deck.length; i++) {
        add([
            sprite(deck[i].image),
            pos(70 + i * 115, 220),
            anchor("center"),
            scale(1.5),
            area(),
            "thumbnail",
            { card: deck[i] },
        ])
    }

    onClick("thumbnail", (thumbnail) => {
        go("detail", { card: thumbnail.card })
    })
})

scene("detail", (data) => {
    viewedCount = viewedCount + 1

    add([
        text(data.card.name, { size: 44 }),
        pos(width() / 2, 50),
        anchor("center"),
    ])

    add([
        sprite(data.card.image),
        pos(150, 200),
        anchor("center"),
        scale(3),
    ])

    add([
        text(makeStatsText(data.card), { size: 26 }),
        pos(290, 130),
    ])

    add([
        text("Press SPACE to go back", { size: 20 }),
        pos(width() / 2, 360),
        anchor("center"),
        color(150, 170, 200),
    ])

    onKeyPress("space", () => {
        go("gallery")
    })
})

go("title")
```

What does the game show when it **starts**?

<response>

You click on a card, then press SPACE to go back to the gallery. What will the **Cards viewed** label say now?

<response>

After you view **three** cards, what will it say?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run the game and look at a few cards. Compare it with your predictions - any differences?

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 600, height: 400,
    background: [30, 60, 90]
})

const statNames = ["speed", "power", "cuteness", "spookiness"]

const deck = [
    { name: "Cat", image: "cat", speed: 8, power: 4, cuteness: 9, spookiness: 2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness: 1 },
    { name: "Fish", image: "fish", speed: 7, power: 2, cuteness: 5, spookiness: 2 },
    { name: "Ghost", image: "ghost", speed: 5, power: 3, cuteness: 4, spookiness: 10 },
    { name: "Mushroom", image: "mushroom", speed: 1, power: 2, cuteness: 6, spookiness: 5 },
]

for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

// Outside every scene, so it is kept when the scene changes
let viewedCount = 0

function makeStatsText(card) {
    let statsText = ""
    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]
        statsText = statsText + `${statName}: ${card[statName]}\n`
    }
    return statsText
}

scene("title", () => {
    add([
        text("Card Gallery", { size: 56 }),
        pos(width() / 2, 150),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 24 }),
        pos(width() / 2, 240),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("gallery")
    })
})

scene("gallery", () => {
    add([
        text("Click a card", { size: 32 }),
        pos(width() / 2, 50),
        anchor("center"),
    ])

    add([
        text(`Cards viewed: ${viewedCount}`, { size: 20 }),
        pos(width() / 2, 90),
        anchor("center"),
        color(150, 170, 200),
    ])

    for (let i = 0; i < deck.length; i++) {
        add([
            sprite(deck[i].image),
            pos(70 + i * 115, 220),
            anchor("center"),
            scale(1.5),
            area(),
            "thumbnail",
            { card: deck[i] },
        ])
    }

    onClick("thumbnail", (thumbnail) => {
        go("detail", { card: thumbnail.card })
    })
})

scene("detail", (data) => {
    viewedCount = viewedCount + 1

    add([
        text(data.card.name, { size: 44 }),
        pos(width() / 2, 50),
        anchor("center"),
    ])

    add([
        sprite(data.card.image),
        pos(150, 200),
        anchor("center"),
        scale(3),
    ])

    add([
        text(makeStatsText(data.card), { size: 26 }),
        pos(290, 130),
    ])

    add([
        text("Press SPACE to go back", { size: 20 }),
        pos(width() / 2, 360),
        anchor("center"),
        color(150, 170, 200),
    ])

    onKeyPress("space", () => {
        go("gallery")
    })
})

go("title")
```

</web-playground>


## **I**nvestigate

### Passing a Card

1. Each thumbnail is made with `{ card: deck[i] }`(js) in its component list. What does that do?

    <response>

2. In the gallery we call `go("detail", { card: thumbnail.card })`(js). How does the detail scene get hold of the card?

    <response>

3. What would the detail scene show if we changed the call to `go("detail", { card: deck[0] })`(js)?

    <response>

### Where Variables Live

`viewedCount` is declared **outside** all of the scenes. Try moving the line `let viewedCount = 0`(js) **inside** the gallery scene, then play the game.

1. What happens? 

    <response>

2. Why does it happen? (Hint: which scenes can see a variable made inside the gallery scene?)

    <response>

> [!TIP]
> A variable made **inside** a scene exists only in that scene, and is created fresh every time the scene starts. A variable made **outside** all scenes can be seen by every scene, and **keeps its value** when scenes change. To send a value to just the next scene, pass it with `go(...)`(js).

### Starting the Game

What do you think would happen if you **deleted** the last line of the program, `go("title")`(js)? Try it!

<response>

### Matching

Match each piece of code to what it does.

<drag-drop mode="code" title="What Does It Do?" sub-title="">

1.
    ```js
    scene("gallery", () => { ... })
    ```

2.
    ```js
    go("detail")
    ```

3.
    ```js
    go("detail", { card: deck[2] })
    ```

4.
    ```js
    scene("detail", (data) => { ... })
    ```

---

1. Define a scene called gallery
2. Switch to the detail scene
3. Switch to the detail scene, passing it a card
4. A scene that receives some data

</drag-drop>


## **M**odify

### Bug Hunt

This three-scene gallery has some bugs. Try to view a card, and check the **Console** if something goes wrong. Can you fix the following?

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 600, height: 400,
    background: [30, 60, 90]
})

const statNames = ["speed", "power", "cuteness", "spookiness"]

const deck = [
    { name: "Cat", image: "cat", speed: 8, power: 4, cuteness: 9, spookiness: 2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness: 1 },
    { name: "Fish", image: "fish", speed: 7, power: 2, cuteness: 5, spookiness: 2 },
    { name: "Ghost", image: "ghost", speed: 5, power: 3, cuteness: 4, spookiness: 10 },
    { name: "Mushroom", image: "mushroom", speed: 1, power: 2, cuteness: 6, spookiness: 5 },
]

for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

function makeStatsText(card) {
    let statsText = ""
    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]
        statsText = statsText + `${statName}: ${card[statName]}\n`
    }
    return statsText
}

scene("gallery", () => {
    let viewedCount = 0

    add([
        text("Click a card", { size: 32 }),
        pos(width() / 2, 50),
        anchor("center"),
    ])

    add([
        text(`Cards viewed: ${viewedCount}`, { size: 20 }),
        pos(width() / 2, 90),
        anchor("center"),
        color(150, 170, 200),
    ])

    for (let i = 0; i < deck.length; i++) {
        add([
            sprite(deck[i].image),
            pos(70 + i * 115, 220),
            anchor("center"),
            scale(1.5),
            area(),
            "thumbnail",
            { card: deck[i] },
        ])
    }

    onClick("thumbnail", (thumbnail) => {
        go("Detail", thumbnail.card)
    })
})

scene("detail", (data) => {
    viewedCount = viewedCount + 1

    add([
        text(data.card.name, { size: 44 }),
        pos(width() / 2, 50),
        anchor("center"),
    ])

    add([
        sprite(data.card.image),
        pos(150, 200),
        anchor("center"),
        scale(3),
    ])

    add([
        text(makeStatsText(data.card), { size: 26 }),
        pos(290, 130),
    ])

    add([
        text("Press SPACE to go back", { size: 20 }),
        pos(width() / 2, 360),
        anchor("center"),
        color(150, 170, 200),
    ])

    onKeyPress("space", () => {
        go("gallery")
    })
})

go("gallery")
```

</web-playground>

1. <check> Clicking a card gives an error saying the **scene can't be found**
2. <check> Once that's fixed, there's an error saying `viewedCount` is **not defined**
3. <check> Once that's fixed, the detail scene **crashes** with an error about `undefined`

> [!TIP]
> Scene names have to match **exactly**. Think about where `viewedCount` needs to live so that **both** scenes can see it. And data passed to a scene needs to be an **object**, with a **name** for each value.

### Tinker

Using the working gallery from the **Run** step above, complete the tasks one at a time:

1. <check> Give each scene a different **background colour** (hint: `setBackground(rgb(...))`(js) at the top of each scene)
2. <check> Make a thumbnail **grow** when the mouse is over it (hint: `onHover("thumbnail", ...)`(js), `onHoverEnd(...)`(js) and `scale`)
3. <check> Show the **card number**, like `Card 3 of 5`, in the detail scene. You'll need to pass **more data** (hint: put the number in the object you pass with `go(...)`(js))


## **M**ake

### Gallery of Your Own

Build a three-scene gallery for **the deck you designed last lesson**.

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
// Copy your deck code from last lesson here, then build your scenes
```

</web-playground>

Your game must have:

- <check> A **title** scene with the name of your game and a "press SPACE" message
- <check> A **gallery** scene with **every card** in your deck, made with a **loop**
- <check> A **detail** scene showing one card's name, picture and **stats**, passed from the gallery
- <check> A **count** of cards viewed, shown in the gallery, that **keeps going** as you view more cards
- <check> Pressing SPACE on a detail takes you **back to the gallery**

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                  | Hint                                                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| Press **LEFT** and **RIGHT** in the detail scene to change card | Pass the card's **index** to the detail scene                        |
| Show a **tick** on cards you have already viewed           | A `viewed`(js) array, `viewed.push(...)`(js) and `viewed.includes(...)`(js) |
| Play a **sound** when you click a card                     | `loadSound(...)`(js) and `play(...)`(js)                                   |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does `go("detail", { card: myCard })` do?

    ---

    - [ ] Defines a scene called detail
    - [x] Switches to the detail scene, passing it the card
    - [ ] Makes a new card
    - [ ] Starts the game

- # The detail scene is written as `scene("detail", (data) => { ... })`. How does it get the card?

    ---

    - [ ] It can't
    - [ ] With `card`
    - [x] With `data.card`
    - [ ] With `go("card")`

- # A variable is declared **inside** the gallery scene. Can the detail scene use it?

    ---

    - [ ] Yes, all variables can be used everywhere
    - [x] No, it only exists inside the gallery scene
    - [ ] Yes, but only if it's a `const`
    - [ ] Yes, after pressing SPACE

</quiz>
