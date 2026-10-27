# Lesson 1: Lists & Objects

So far our games have stored single values: a score, a number of lives, a timer. But a card game needs to store **lots** of cards, and every card has a name, a picture and some stats! In this lesson you'll learn two ways of storing lots of data, and use them to build a card viewer.

## Warm-Up

Try not to loop back at the previous lessons...

1. What is **game state**? Give two examples.

    <response>

2. What does `get("hole")`(js) give us back?

    <response>

3. How many times does this loop run?

    ```js
    for (let i = 0; i < 4; i++) {
        console.log(i)
    }
    ```

    <response>


## Learning Goals

- <check> I can store a list of values in an **array**
- <check> I can get an item from an array using its **index**
- <check> I can group related values into an **object**
- <check> I can look up a property using a **variable**
- <check> I can store a deck of cards as an **array of objects**


## The Big Idea: **Arrays** and **Objects**

### Arrays: an ordered list

An **array** stores a list of values, in order. We write it with square brackets:

```js
const statNames = ["speed", "power", "cuteness"]
```

Each item has a position number called an **index**. Indexes start at **0**, not 1!

| Index | `0`       | `1`       | `2`          |
| ----- | --------- | --------- | ------------ |
| Item  | `"speed"` | `"power"` | `"cuteness"` |

```js
console.log(statNames[0])        // "speed"
console.log(statNames.length)    // 3
```

> [!IMPORTANT]
> An array with 3 items has indexes `0`, `1` and `2`. The **last** index is always `length - 1`.

### Objects: a bundle of named values

An **object** groups related values together, each with a **name**. We write it with curly braces:

```js
const card = {
    name: "Cat",
    speed: 8,
    power: 4,
}

console.log(card.name)       // "Cat"
console.log(card.speed)      // 8
```

> [!NOTE]
> A JavaScript **object** is just a bundle of data. It's not the same as a Kaplay **game object**, which has a picture, a position, and so on. Think of it as a card with labelled fields. (Which is exactly what we're about to use it for!)

### Looking up with a variable

Sometimes we don't know which property we want when we write the code. Square brackets let us look up a property using a **variable**:

```js
const statName = "power"

console.log(card.power)         // 4
console.log(card[statName])     // 4, because statName is "power"
```

### Both together

A deck is a **list** of cards, and each card is an **object**. That's an **array of objects**:

```js
const deck = [
    { name: "Cat", speed: 8, power: 4 },
    { name: "Elephant", speed: 3, power: 10 },
]

console.log(deck[1].name)       // "Elephant"
```


## **P**redict then **R**un

For each snippet below, write what you think the code will show, then run it to see if your prediction was correct.

<primm title="Snippet 1" sub-title="">

```js
const statNames = ["speed", "power", "cuteness"]
console.log(statNames[0])
console.log(statNames[2])
```

</primm>

<primm title="Snippet 2" sub-title="">

```js
const statNames = ["speed", "power", "cuteness"]
console.log(statNames.length)
console.log(statNames[statNames.length - 1])
```

</primm>

<primm title="Snippet 3" sub-title="">

```js
const card = { name: "Cat", speed: 8, power: 4 }
console.log(card.name)
console.log(card.speed + card.power)
```

</primm>

<primm title="Snippet 4" sub-title="">

```js
const deck = [
    { name: "Cat", speed: 8 },
    { name: "Elephant", speed: 3 },
]
console.log(deck[1].name)
console.log(deck[0].speed)
```

</primm>

<primm title="Snippet 5" sub-title="">

```js
const card = { name: "Cat", speed: 8, power: 4 }
const statName = "power"
console.log(card[statName])
```

</primm>

<primm title="Snippet 6" sub-title="">

```js
const statNames = ["speed", "power", "cuteness"]
console.log(statNames[3])
```

</primm>


## **I**nvestigate

### Going Past the End

Step through the code below. What happens on the last line? What does this tell us about the end of an array?

```js trace header="false"
const stats = ["speed", "power", "cuteness"]
let statIndex = 0

console.log(stats[statIndex])
statIndex = statIndex + 1
console.log(stats[statIndex])
statIndex = statIndex + 1
console.log(stats[statIndex])
statIndex = statIndex + 1
console.log(stats[statIndex])
```

<response placeholder="Observations...">

### Arrays or Objects?

When would you use an **array**, and when would you use an **object**? Think about a deck of cards versus one single card.

<response>

### A Card Viewer

Now let's put arrays of objects to work. Read this Kaplay program, which shows one card at a time:

```js
kaplay({
    width: 500, height: 500,
    background: [30, 60, 90]
})

const statNames = ["speed", "power", "cuteness", "spookiness"]

const deck = [
    { name: "Cat", image: "cat", speed: 8, power: 4, cuteness: 9, spookiness: 2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness: 1 },
    { name: "Ghost", image: "ghost", speed: 5, power: 3, cuteness: 4, spookiness: 10 },
]

// Load every picture named in the deck
for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

let cardIndex = 0

const nameLabel = add([
    text("", { size: 40 }),
    pos(width() / 2, 50),
    anchor("center"),
])

const statsLabel = add([
    text("", { size: 28 }),
    pos(120, 280),
])

add([
    text("Press the LEFT and RIGHT arrows", { size: 18 }),
    pos(width() / 2, 470),
    anchor("center"),
    color(150, 170, 200),
])

function showCard() {
    const card = deck[cardIndex]

    nameLabel.text = card.name

    destroyAll("picture")
    add([
        sprite(card.image),
        pos(width() / 2, 160),
        anchor("center"),
        scale(3),
        "picture",
    ])

    let statsText = ""
    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]
        statsText = statsText + `${statName}: ${card[statName]}\n`
    }
    statsLabel.text = statsText
}

showCard()

onKeyPress("right", () => {
    if (cardIndex < deck.length - 1) {
        cardIndex = cardIndex + 1
        showCard()
    }
})

onKeyPress("left", () => {
    if (cardIndex > 0) {
        cardIndex = cardIndex - 1
        showCard()
    }
})
```

What will the screen show **when the game starts**?

<response>

What will it show after you press the **RIGHT arrow** once?

<response>

What will happen when you press the **RIGHT arrow** a **fourth** time?

<response>

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run it and see. Click inside the game first!

<web-playground data-height="38em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 500, height: 500,
    background: [30, 60, 90]
})

const statNames = ["speed", "power", "cuteness", "spookiness"]

const deck = [
    { name: "Cat", image: "cat", speed: 8, power: 4, cuteness: 9, spookiness: 2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness: 1 },
    { name: "Ghost", image: "ghost", speed: 5, power: 3, cuteness: 4, spookiness: 10 },
]

// Load every picture named in the deck
for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

let cardIndex = 0

const nameLabel = add([
    text("", { size: 40 }),
    pos(width() / 2, 50),
    anchor("center"),
])

const statsLabel = add([
    text("", { size: 28 }),
    pos(120, 280),
])

add([
    text("Press the LEFT and RIGHT arrows", { size: 18 }),
    pos(width() / 2, 470),
    anchor("center"),
    color(150, 170, 200),
])

function showCard() {
    const card = deck[cardIndex]

    nameLabel.text = card.name

    destroyAll("picture")
    add([
        sprite(card.image),
        pos(width() / 2, 160),
        anchor("center"),
        scale(3),
        "picture",
    ])

    let statsText = ""
    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]
        statsText = statsText + `${statName}: ${card[statName]}\n`
    }
    statsLabel.text = statsText
}

showCard()

onKeyPress("right", () => {
    if (cardIndex < deck.length - 1) {
        cardIndex = cardIndex + 1
        showCard()
    }
})

onKeyPress("left", () => {
    if (cardIndex > 0) {
        cardIndex = cardIndex - 1
        showCard()
    }
})
```

</web-playground>

### How It Works

1. Why is the `if` check `cardIndex < deck.length - 1`(js) rather than `cardIndex < deck.length`(js)?

    <response>

2. The loop in `showCard()`(js) builds the stats text. How many times does it run? What is `statName` on each lap?

    <response>

3. What's the difference between `card.speed`(js) and `card[statName]`(js)? Why do we need the second one here?

    <response>

4. Why does `showCard()`(js) call `destroyAll("picture")`(js) before adding the new picture?

    <response>

### Next Card, Please

Put the lines in order so that pressing the RIGHT arrow moves to the next card, shows it, and never goes past the end of the deck.

<drag-drop mode="code" title="Next Card" sub-title="Move to the next card first, then show it">

1.
    ```js
    if (cardIndex < deck.length - 1) {
    ```

2.
    ```js
        cardIndex = cardIndex + 1
    ```

3.
    ```js
        showCard()
    ```

4.
    ```js
    }
    ```

</drag-drop>


## **M**odify

### Bug Hunt

This version of the viewer has a couple of bugs. Run it, press the arrow keys, and look at the **Console** if something goes wrong. Can you fix the following?

<web-playground data-height="38em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 500, height: 500,
    background: [30, 60, 90]
})

const statNames = ["speed", "power", "cuteness", "spookiness"]

const deck = [
    { name: "Cat", image: "cat", speed: 8, power: 4, cuteness: 9, spookiness: 2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness: 1 },
    { name: "Ghost", image: "ghost", speed: 5, power: 3, cuteness: 4, spookiness: 10 },
]

for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

let cardIndex = 0

const nameLabel = add([
    text("", { size: 40 }),
    pos(width() / 2, 50),
    anchor("center"),
])

const statsLabel = add([
    text("", { size: 28 }),
    pos(120, 280),
])

function showCard() {
    const card = deck[cardIndex]

    nameLabel.text = card.name

    destroyAll("picture")
    add([
        sprite(card.image),
        pos(width() / 2, 160),
        anchor("center"),
        scale(3),
        "picture",
    ])

    let statsText = ""
    for (let i = 0; i <= statNames.length; i++) {
        const statName = statNames[i]
        statsText = statsText + `${statName}: ${card[statName]}\n`
    }
    statsLabel.text = statsText
}

showCard()

onKeyPress("right", () => {
    if (cardIndex < deck.length) {
        cardIndex = cardIndex + 1
        showCard()
    }
})

onKeyPress("left", () => {
    if (cardIndex > 0) {
        cardIndex = cardIndex - 1
        showCard()
    }
})
```

</web-playground>

1. <check> There's an extra line at the bottom of the stats that says `undefined: undefined`
2. <check> The game **crashes** when you press the RIGHT arrow on the last card (it should just stay on the last card)

> [!TIP]
> Remember, the last index of an array is `length - 1`. How many times should a loop over `statNames` run?

### Tinker

Here's a working viewer. Complete the tasks one at a time. Test after each change!

<web-playground data-height="38em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 500, height: 500,
    background: [30, 60, 90]
})

const statNames = ["speed", "power", "cuteness", "spookiness"]

const deck = [
    { name: "Cat", image: "cat", speed: 8, power: 4, cuteness: 9, spookiness: 2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness: 1 },
    { name: "Ghost", image: "ghost", speed: 5, power: 3, cuteness: 4, spookiness: 10 },
]

for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

let cardIndex = 0

const nameLabel = add([
    text("", { size: 40 }),
    pos(width() / 2, 50),
    anchor("center"),
])

const statsLabel = add([
    text("", { size: 28 }),
    pos(120, 280),
])

function showCard() {
    const card = deck[cardIndex]

    nameLabel.text = card.name

    destroyAll("picture")
    add([
        sprite(card.image),
        pos(width() / 2, 160),
        anchor("center"),
        scale(3),
        "picture",
    ])

    let statsText = ""
    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]
        statsText = statsText + `${statName}: ${card[statName]}\n`
    }
    statsLabel.text = statsText
}

showCard()

onKeyPress("right", () => {
    if (cardIndex < deck.length - 1) {
        cardIndex = cardIndex + 1
        showCard()
    }
})

onKeyPress("left", () => {
    if (cardIndex > 0) {
        cardIndex = cardIndex - 1
        showCard()
    }
})
```

</web-playground>

Tasks:

1. <check> Add **three more cards** to the deck. Each needs a `name`, an `image` and all four stats
2. <check> Add a **fifth stat** called `luck`. What do you need to change?
3. <check> Show a **card counter**, like `Card 2 of 5`
4. <check> When you press RIGHT on the **last** card, go back to the **first** card

> [!TIP]
> These are the pictures you can use: `apple`, `beetle`, `butterfly`, `cat`, `door`, `egg`, `elephant`, `fish`, `flower`, `ghost`, `grass`, `heart`, `jam`, `key`, `meat`, `mushroom`, `pineapple`, `portal`, `skull`, `smile`, `star`, `steel`, `sword`, `watermelon`


## **M**ake

### Design Your Deck

Time to invent your own cards! Choose a **theme**: creatures, food, dungeon treasure, teachers... anything you can find pictures for.

Your viewer must have:

- <check> At least **6 cards**, each with a name, a picture and its stats
- <check> **Your own stats**, with names that fit your theme (at least 3)
- <check> The **arrow keys** to browse the deck, stopping at each end
- <check> A **card counter**, like `3 of 6`

<web-playground data-height="38em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
// Copy your code from the viewer above here, then make it your own
```

</web-playground>

> [!IMPORTANT]
> Keep your deck! We'll use it in the next few lessons.

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                   | Hint                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Highlight each card's **best stat**                         | A new `let`(js) variable, and an `if`(js) inside the loop to find the biggest number  |
| Play a **sound** when you change card                       | `loadSound("beep", "assets/sounds/beep.wav")`(js) and `play("beep")`(js)              |
| Press **SPACE** to jump to a **random** card                | `onKeyPress("space", ...)`(js) and `randi(deck.length)`(js)                           |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does this code show?

    ```js
    const deck = [
        { name: "Cat", speed: 8 },
        { name: "Fish", speed: 7 },
        { name: "Ghost", speed: 5 },
    ]
    console.log(deck[1].name)
    ```

    ---

    - [ ] `Cat`
    - [x] `Fish`
    - [ ] `Ghost`
    - [ ] `7`

- # What does this code show?

    ```js
    const card = { name: "Cat", speed: 8, power: 4 }
    const stat = "speed"
    console.log(card[stat])
    ```

    ---

    - [ ] `stat`
    - [ ] `speed`
    - [x] `8`
    - [ ] `undefined`

- # An array has 8 items. What is the index of the **last** item?

    ---

    - [ ] `8`
    - [x] `7`
    - [ ] `9`
    - [ ] `1`

</quiz>
