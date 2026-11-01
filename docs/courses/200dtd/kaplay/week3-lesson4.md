# Lesson 4: Displaying the Deck

You can build a UI that shows **one** card, and show any card in it. Now let's work with a whole **deck**! In this lesson you'll make a **deck viewer**: a UI that lets you step through an array of cards with **Prev**, **Next** and **Random** buttons.

## Warm-Up

Try not to look back at the previous lessons...

1. What does the `show` function on a card view do?

    <response>

2. Why do we create a card view **once**, and update it, instead of creating a new one every time?

    <response>

3. What is the **last** index of an array with 8 items?

    <response>


## Learning Goals

- <check> I can use an **index variable** to track which item of an array we're showing
- <check> I can show **any item** of an array in a card view
- <check> I can make **buttons** that change the index
- <check> I can pick a **random** item from an array
- <check> I can build a viewer for **my own deck**


## The Big Idea: **Data**, **UI** and **State**

We now have three things that work together:

| Part                  | What it is                                   | Example                              |
| --------------------- | -------------------------------------------- | ------------------------------------ |
| The **data**          | An array of objects: the deck                | `deck`(js)                           |
| The **UI**            | A view that can show any card                | `cardView.show(...)`(js)             |
| The **state**         | Which card we're looking at right now        | `cardIndex`(js)                      |

To change what's on screen, we change the **state** (which card?), and call `show`. You used the same idea with `lineIndex` and `score` before!

> [!NOTE]
> To keep the code short, the deck of 8 creature cards, the images, and the `createCardView(x, y)`(js) function from last lesson are all done for you in the hidden code behind the playgrounds below. The game is **800 by 600**, and `createCardView`(js) now has two parameters, `x` and `y`, to say where the card goes.


## **P**redict

Here's a **deck viewer**. Read the code carefully:

```js
let cardIndex = 0

const cardView = createCardView(250, 20)

const counterLabel = add([
    text("", { size: 24 }),
    pos(width() / 2, 545),
    anchor("center"),
])

const buttons = [
    { label: "Prev",   x: 190, action: "prev" },
    { label: "Random", x: 340, action: "random" },
    { label: "Next",   x: 490, action: "next" },
]

for (const info of buttons) {
    const button = add([
        rect(120, 50, { radius: 8 }),
        pos(info.x, 450),
        color(60, 90, 140),
        area(),
        "button",
        { action: info.action },
    ])

    button.add([
        text(info.label, { size: 24 }),
        pos(60, 25),
        anchor("center"),
    ])
}

function showCurrentCard() {
    cardView.show(deck[cardIndex])
    counterLabel.text = `Card ${cardIndex + 1} of ${deck.length}`
}

onClick("button", (button) => {
    if (button.action === "next") {
        if (cardIndex < deck.length - 1) {
            cardIndex = cardIndex + 1
        }
    } else if (button.action === "prev") {
        if (cardIndex > 0) {
            cardIndex = cardIndex - 1
        }
    } else if (button.action === "random") {
        cardIndex = randi(deck.length)
    }

    showCurrentCard()
})

showCurrentCard()
```

What will the screen show **when the program starts**?

<response>

What will it show after you click **Next** twice?

<response>

What will happen if you keep clicking **Next**, again and again?

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

loadBean()

const statNames = ["power", "speed", "brains"]

const deck = [
    { name: "Cat",       image: "cat",       power: 4,  speed: 8, brains: 5 },
    { name: "Elephant",  image: "elephant",  power: 10, speed: 1, brains: 8 },
    { name: "Fish",      image: "fish",      power: 2,  speed: 7, brains: 3 },
    { name: "Beetle",    image: "beetle",    power: 5,  speed: 3, brains: 2 },
    { name: "Butterfly", image: "butterfly", power: 1,  speed: 6, brains: 4 },
    { name: "Ghost",     image: "ghost",     power: 3,  speed: 5, brains: 7 },
    { name: "Mushroom",  image: "mushroom",  power: 2,  speed: 1, brains: 6 },
    { name: "Skull",     image: "skull",     power: 6,  speed: 2, brains: 1 },
]

for (const card of deck) {
    loadSprite(card.image, `assets/images/${card.image}.png`)
}

function createCardView(x, y) {
    const cardFrame = add([
        rect(300, 400, { radius: 10 }),
        pos(x, y),
        color(255, 255, 255),
        outline(5, rgb(0, 0, 0)),
    ])

    const cardName = cardFrame.add([
        text("NAME HERE", { size: 50 }),
        pos(150, 50),
        anchor("center"),
        color(0, 0, 0),
    ])

    const cardImage = cardFrame.add([
        sprite("bean"),
        pos(150, 180),
        anchor("center"),
        scale(2.5),
    ])

    const cardStats = cardFrame.add([
        text("STATS", { size: 28 }),
        pos(150, 290),
        anchor("top"),
        color(0, 0, 0),
    ])

    cardFrame.show = function(card) {
        cardName.text = card.name
        cardImage.use(sprite(card.image))

        let statsText = ""
        for (const statName of statNames) {
            statsText += `${statName}: ${card[statName]}\n`
        }
        cardStats.text = statsText
    }

    return cardFrame
}
```

</web-playground>

Run the viewer and click the buttons. Compare it with your predictions - any differences?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
let cardIndex = 0

const cardView = createCardView(250, 20)

const counterLabel = add([
    text("", { size: 24 }),
    pos(width() / 2, 545),
    anchor("center"),
])

const buttons = [
    { label: "Prev",   x: 190, action: "prev" },
    { label: "Random", x: 340, action: "random" },
    { label: "Next",   x: 490, action: "next" },
]

for (const info of buttons) {
    const button = add([
        rect(120, 50, { radius: 8 }),
        pos(info.x, 450),
        color(60, 90, 140),
        area(),
        "button",
        { action: info.action },
    ])

    button.add([
        text(info.label, { size: 24 }),
        pos(60, 25),
        anchor("center"),
    ])
}

function showCurrentCard() {
    cardView.show(deck[cardIndex])
    counterLabel.text = `Card ${cardIndex + 1} of ${deck.length}`
}

onClick("button", (button) => {
    if (button.action === "next") {
        if (cardIndex < deck.length - 1) {
            cardIndex = cardIndex + 1
        }
    } else if (button.action === "prev") {
        if (cardIndex > 0) {
            cardIndex = cardIndex - 1
        }
    } else if (button.action === "random") {
        cardIndex = randi(deck.length)
    }

    showCurrentCard()
})

showCurrentCard()
```

</web-playground>


## **I**nvestigate

1. What is `cardIndex`(js)? Is it **data**, **UI** or **state**?

    <response>

2. Why is the check `cardIndex < deck.length - 1`(js) rather than `cardIndex < deck.length`(js)?

    <response>

3. The buttons are made from an **array of objects**, with a `for...of` loop. What does each object in `buttons`(js) describe? Why is `{ action: info.action }`(js) added to each button?

    <response>

4. What range of numbers does `randi(deck.length)`(js) give? (Hint: try it!)

    <response>

### Less Repetition

Last lesson, the `show` function had three nearly identical lines for the stats. In the viewer, it's been improved, using the `statNames` array from Lesson 1:

```js
const statNames = ["power", "speed", "brains"]

// ...inside the show function:
let statsText = ""
for (const statName of statNames) {
    statsText += `${statName}: ${card[statName]}\n`
}
```

If we added a fourth stat, `luck`, to every card, what would we need to change? Would the `show` function need to change? Why is that useful?

<response>


## **M**odify

### Bug Hunt

This version of the viewer has some bugs. Run it, click the buttons, and look at the **Console** if something goes wrong. Can you fix the following?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
let cardIndex = 0

const cardView = createCardView(250, 20)

const counterLabel = add([
    text("", { size: 24 }),
    pos(width() / 2, 545),
    anchor("center"),
])

const buttons = [
    { label: "Prev",   x: 190, action: "prev" },
    { label: "Random", x: 340, action: "random" },
    { label: "Next",   x: 490, action: "next" },
]

for (const info of buttons) {
    const button = add([
        rect(120, 50, { radius: 8 }),
        pos(info.x, 450),
        color(60, 90, 140),
        area(),
        "button",
        { action: info.action },
    ])

    button.add([
        text(info.label, { size: 24 }),
        pos(60, 25),
        anchor("center"),
    ])
}

function showCurrentCard() {
    counterLabel.text = `Card ${cardIndex + 1} of ${deck.length}`
}

onClick("button", (button) => {
    if (button.action === "next") {
        if (cardIndex < deck.length) {
            cardIndex = cardIndex + 1
        }
    } else if (button.action === "prev") {
        if (cardIndex > 0) {
            cardIndex = cardIndex - 1
        }
    } else if (button.action === "rand") {
        cardIndex = randi(deck.length)
    }

    showCurrentCard()
})

showCurrentCard()
```

</web-playground>

1. <check> The card **never changes**: it always says `NAME HERE`
2. <check> The **Random** button does nothing
3. <check> The game **crashes** when you click **Next** on the last card

> [!TIP]
> Fix them one at a time. Compare the code with the working viewer above. Strings have to match **exactly**!

### Tinker

Go back to the **working** viewer in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> When you click **Next** on the **last** card, go back to the **first** card (and the same for **Prev** on the first card)
2. <check> Make **Random** never pick the **same** card that is already showing (hint: a `while` loop)
3. <check> Add a **fourth button**, `First`, that jumps to the first card


## **M**ake

### Your Deck Viewer

Create **your own deck** and show it in a viewer. Choose a theme: creatures, fruit, dungeon treasure, teachers, programming languages... anything you can find pictures for.

Your viewer must have:

- <check> **Your own deck** of **at least 8 cards**, with pictures from the starter project
- <check> **Your own stats**: at least 3, with names that suit your theme, stored in `statNames`(js)
- <check> **Prev**, **Next** and **Random** buttons that work
- <check> A **card counter**, like `Card 3 of 8`
- <check> A look that suits your theme: your own **colours** and **sizes**

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js load=_assets/deck-viewer.js
```

</web-playground>

> [!TIP]
> The starter code above has the creature deck. Replace it with **your** cards: every card needs a `name`, an `image`, and a value for **every** stat in `statNames`. You can use any of these pictures: `apple`, `beetle`, `butterfly`, `cat`, `door`, `egg`, `elephant`, `fish`, `flower`, `ghost`, `grass`, `heart`, `jam`, `key`, `meat`, `mushroom`, `pineapple`, `portal`, `skull`, `smile`, `star`, `steel`, `sword`, `watermelon`

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                          | Hint                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| A **Favourite** button that marks a card with a star               | A `favourite`(js) property on each card, toggled with `!`(js), and a `star` picture |
| **Arrow keys** as well as buttons                                  | `onKeyPress("right", ...)`(js)                                                  |
| Play a **sound** when you change card                              | `loadSound("beep", "assets/sounds/beep.wav")`(js) and `play("beep")`(js)        |
| Show the card's **best stat** in gold                              | The **Find the Highest** idea from the Lesson 1 Level Ups                       |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does `cardView.show(deck[cardIndex])` do?

    ---

    - [ ] Adds a new card to the deck
    - [x] Updates the card view to show the card at `cardIndex`
    - [ ] Deletes the card at `cardIndex`
    - [ ] Makes the deck bigger

- # The deck has 8 cards. Which of these is **not** a valid `cardIndex`?

    ---

    - [ ] `0`
    - [ ] `7`
    - [x] `8`
    - [ ] `3`

- # You add a `luck` stat to every card, and to `statNames`. What else do you need to change?

    ---

    - [x] Nothing: the `show` function loops through `statNames`
    - [ ] The `show` function
    - [ ] The buttons
    - [ ] The deck length

</quiz>


## Check Yourself

Before you finish the week, make sure you can say "yes" to all of these:

- <check> I can store a list in an **array** and a bundle of values in an **object**
- <check> I can loop through an array with `for...of`
- <check> I can build a **UI** that can show any item of data
- <check> I can use an **index** to move through an array
- <check> I can change what a program shows by changing its **data**
