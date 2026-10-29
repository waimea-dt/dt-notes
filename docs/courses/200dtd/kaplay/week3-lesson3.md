# Lesson 3: Dealing Cards

You can build a UI that shows **one** card, and show any card in it. Now let's work with a whole **deck**! In this lesson you'll use an **array** of cards: to browse through it, and to **deal** random cards into two card views. This is the heart of a card battle game.

## Warm-Up

Try not to look back at the previous lessons...

1. What does the `show` function on a card view do?

    <response>

2. Why do we create a card view **once**, and update it, instead of creating a new one every time?

    <response>

3. What is the **last** index of an array with 8 items?

    <response>


## Learning Goals

- <check> I can use an **index variable** to step through an array of items
- <check> I can show **any item** of an array in a card view
- <check> I can pick a **random** item from an array
- <check> I can use a `while` loop to make sure two picks are **different**
- <check> I can use a **loop** to add up the stats on a card


## The Big Idea: **One UI, Many Items**

We now have three things that work together:

| Part                  | What it is                                   | Example                              |
| --------------------- | -------------------------------------------- | ------------------------------------ |
| The **data**          | An array of objects: the deck                | `deck`(js)                           |
| The **UI**            | A view that can show any card                | `cardView.show(...)`(js)             |
| The **state**         | Which card we're looking at right now        | `cardIndex`(js)                      |

To change what's on screen, we just change the **state** (which card?), and call `show`.

> [!NOTE]
> To keep the code short, the deck of 8 cards, the images, and the `createCardView(x, y)`(js) function from last lesson are all done for you in the hidden code behind the playgrounds below. The only difference is that `createCardView`(js) now has two parameters, `x` and `y`, to say where the card goes. The game is **800 by 600**.


## **P**redict

Here's a **deck viewer**. It uses an array index, just like the dialogue state in Week 2!

```js
let cardIndex = 0

const cardView = createCardView(250, 40)

const counterLabel = add([
    text("", { size: 24 }),
    pos(width() / 2, 480),
    anchor("center"),
])

add([
    text("Press the LEFT and RIGHT arrows", { size: 20 }),
    pos(width() / 2, 540),
    anchor("center"),
    color(150, 170, 200),
])

function showCurrentCard() {
    cardView.show(deck[cardIndex])
    counterLabel.text = `Card ${cardIndex + 1} of ${deck.length}`
}

showCurrentCard()

onKeyPress("right", () => {
    if (cardIndex < deck.length - 1) {
        cardIndex = cardIndex + 1
        showCurrentCard()
    }
})

onKeyPress("left", () => {
    if (cardIndex > 0) {
        cardIndex = cardIndex - 1
        showCurrentCard()
    }
})
```

What will the screen show **when the game starts**?

<response>

What will it show after you press the **RIGHT arrow** twice?

<response>

What will happen if you keep pressing the **RIGHT arrow**, again and again?

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

Run the viewer and use the arrow keys. Click inside the game first! Compare it with your predictions - any differences?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
let cardIndex = 0

const cardView = createCardView(250, 40)

const counterLabel = add([
    text("", { size: 24 }),
    pos(width() / 2, 480),
    anchor("center"),
])

add([
    text("Press the LEFT and RIGHT arrows", { size: 20 }),
    pos(width() / 2, 540),
    anchor("center"),
    color(150, 170, 200),
])

function showCurrentCard() {
    cardView.show(deck[cardIndex])
    counterLabel.text = `Card ${cardIndex + 1} of ${deck.length}`
}

showCurrentCard()

onKeyPress("right", () => {
    if (cardIndex < deck.length - 1) {
        cardIndex = cardIndex + 1
        showCurrentCard()
    }
})

onKeyPress("left", () => {
    if (cardIndex > 0) {
        cardIndex = cardIndex - 1
        showCurrentCard()
    }
})
```

</web-playground>


## **I**nvestigate

### The Viewer

1. What is `cardIndex`(js)? Is it **data**, **UI** or **state**?

    <response>

2. Why is the check `cardIndex < deck.length - 1`(js) rather than `cardIndex < deck.length`(js)?

    <response>

3. `showCurrentCard()`(js) does two things. What are they? Why is it a function?

    <response>

4. Why do we write `cardIndex + 1`(js) in the counter label?

    <response>

### Dealing Two Cards

In a card battle, two **different** random cards are dealt: one for you, and one for the computer. Look at this code:

```js
const playerView = createCardView(60, 40)
const computerView = createCardView(440, 40)

add([
    text("Press SPACE to deal", { size: 24 }),
    pos(width() / 2, 540),
    anchor("center"),
    color(150, 170, 200),
])

function dealCards() {
    const playerCard = choose(deck)
    let computerCard = choose(deck)

    while (computerCard === playerCard) {
        computerCard = choose(deck)
    }

    playerView.show(playerCard)
    computerView.show(computerCard)
}

dealCards()

onKeyPress("space", () => {
    dealCards()
})
```

What will happen each time you press **SPACE**? Is it possible for both cards to be the **same**?

<response>

Run it, and try it a lot of times:

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
const playerView = createCardView(60, 40)
const computerView = createCardView(440, 40)

add([
    text("Press SPACE to deal", { size: 24 }),
    pos(width() / 2, 540),
    anchor("center"),
    color(150, 170, 200),
])

function dealCards() {
    const playerCard = choose(deck)
    let computerCard = choose(deck)

    while (computerCard === playerCard) {
        computerCard = choose(deck)
    }

    playerView.show(playerCard)
    computerView.show(computerCard)
}

dealCards()

onKeyPress("space", () => {
    dealCards()
})
```

</web-playground>

1. What does `choose(deck)`(js) do?

    <response>

2. What is the `while`(js) loop for? Try **deleting** it. What happens, if you press SPACE enough times?

    <response>

3. Why is `computerCard`(js) declared with `let`(js), but `playerCard`(js) with `const`(js)?

    <response>


## **M**odify

### Bug Hunt

This version of the deck viewer has some bugs. Run it, press the arrow keys, and look at the **Console** if something goes wrong. Can you fix the following?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
let cardIndex = 0

const cardView = createCardView(250, 40)

const counterLabel = add([
    text("", { size: 24 }),
    pos(width() / 2, 480),
    anchor("center"),
])

add([
    text("Press the LEFT and RIGHT arrows", { size: 20 }),
    pos(width() / 2, 540),
    anchor("center"),
    color(150, 170, 200),
])

function showCurrentCard() {
    counterLabel.text = `Card ${cardIndex} of ${deck.length}`
}

showCurrentCard()

onKeyPress("right", () => {
    if (cardIndex < deck.length) {
        cardIndex = cardIndex + 1
        showCurrentCard()
    }
})

onKeyPress("left", () => {
    if (cardIndex > 0) {
        cardIndex = cardIndex - 1
        showCurrentCard()
    }
})
```

</web-playground>

1. <check> The card **never changes**: it always says `NAME HERE`
2. <check> The counter starts at `Card 0 of 8`
3. <check> The game **crashes** when you press the RIGHT arrow on the last card

> [!TIP]
> Fix them one at a time. Compare the code with the working viewer above.

### Tinker

Here's the card dealer again. Complete the tasks one at a time. Test after each change!

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
const playerView = createCardView(60, 40)
const computerView = createCardView(440, 40)

add([
    text("Press SPACE to deal", { size: 24 }),
    pos(width() / 2, 540),
    anchor("center"),
    color(150, 170, 200),
])

let playerCard = choose(deck)
let computerCard = choose(deck)

function dealCards() {
    playerCard = choose(deck)
    computerCard = choose(deck)

    while (computerCard === playerCard) {
        computerCard = choose(deck)
    }

    playerView.show(playerCard)
    computerView.show(computerCard)
}

dealCards()

onKeyPress("space", () => {
    dealCards()
})
```

</web-playground>

Tasks:

1. <check> After dealing, show a label that says who has more **power**: `You win!`, `You lose!` or `A draw!`
2. <check> Make it work for **any stat**: press **1**, **2** or **3** to compare `power`, `speed` or `brains`
3. <check> Show the two numbers being compared, like `power: 4 vs 10`

> [!TIP]
> Use the **lookup with a variable** from Lesson 1: `playerCard[statName]`(js). And `onKeyPress("1", ...)`(js) can listen for the number keys.


## **M**ake

### Your Deck

This is where you create **your own deck**. You'll use it in the next lesson to build your own card battle game, so make it a good one!

Choose a theme: creatures, fruit, dungeon treasure, teachers, programming languages... anything you can find pictures for. The starter code below deals two cards from the creature deck. Make it **yours**.

Your dealer must have:

- <check> **Your own deck** of **at least 8 cards**, with pictures from the starter project
- <check> **Your own stats**: at least 3, with names that suit your theme, stored in `statNames`(js)
- <check> Two **different** random cards dealt when you press SPACE
- <check> A **total** for each card (all of its stats added up, using a **loop**), and a label showing who has the **higher total**

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js load=_assets/deck-start.js
```

</web-playground>

> [!IMPORTANT]
> Keep your deck! We'll use it in the next lesson.

> [!TIP]
> To add up a card's stats, make a `let total = 0`(js), then loop through `statNames`(js) and add `card[statName]`(js) each time.

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                          | Hint                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Add **arrow key browsing** to your dealer, to flick through the deck | A `cardIndex`(js) variable, and the viewer code from this lesson              |
| Show the **name of the best stat** on each card                    | The **Find the Highest** pattern from Lesson 1, looping through `statNames`(js) |
| Play a **sound** when cards are dealt                              | `loadSound("beep", "assets/sounds/beep.wav")`(js) and `play("beep")`(js)        |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does `cardView.show(deck[cardIndex])` do?

    ---

    - [ ] Adds a new card to the deck
    - [x] Updates the card view to show the card at `cardIndex`
    - [ ] Deletes the card at `cardIndex`
    - [ ] Makes the deck bigger

- # Why does the dealer have this loop?

    ```js
    while (computerCard === playerCard) {
        computerCard = choose(deck)
    }
    ```

    ---

    - [ ] To deal more cards
    - [x] To make sure the computer doesn't get the same card as the player
    - [ ] To count the cards
    - [ ] To shuffle the deck

- # The deck has 8 cards. Which of these is **not** a valid `cardIndex`?

    ---

    - [ ] `0`
    - [ ] `7`
    - [x] `8`
    - [ ] `3`

</quiz>
