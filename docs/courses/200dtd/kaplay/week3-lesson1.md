# Lesson 1: Lists & Objects

So far our games have stored single values: a score, a number of lives, a timer. But many games need to store **lots** of data, for example a card game has many cards, and every card has a name, a picture and some stats.

In this lesson you'll learn **two ways of storing lots of data**, and use them to build a card deck viewer.

## Warm-Up

Try not to look back at the previous lessons...

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
    { name: "Cat",      speed: 8, power: 4 },
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
console.log(statNames[3])
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
    { name: "Cat",      speed: 8 },
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
const card = { name: "Cat", speed: 8, power: 4 }

let statName = "power"
console.log(card[statName])
statName = "speed"
console.log(card[statName])
```

</primm>


## **I**nvestigate

### Going Past the End

Step through the code below...

```js trace header="false"
const codes = ["AG", "PW", "ZK", "LQ"]

for (let i = 0; i <= codes.length; i++) {
    console.log(codes[i])
}
```

What is the final output? Why did this happen? What would the fix be?

<response>

### Arrays or Objects?

In the code below, what is `player`(js) and what is `inventory`(js): **array** or **object**?

```js
const player = { name: "Dave", age: 15, hp: 95 }
const inventory = ["sword", "bacon", "coin", "key"]
```
<response>

When would you use an **array**, and when would you use an **object**? Think about a deck of cards versus one single card.

<response>



### A Card Viewer

We are going to look at a simple game that shows cards from a deck. We will take things one step at a time...

Let's create a card object:

```js
const card = {
    name:   "Elephant",
    image:  "elephant",
    power:  10,
    speed:  1,
    brains: 8,
}
```

Some of those things look easy to display - the name can go in a `text(...)` object, the image in a `sprite(...)`. But what about all those stats?

It might be easiest if we combine them into a single block of text which we can then place into a single `text(...)` object:

```js
let statsText = ""
statsText += `power:  ${card.power}\n`
statsText += `speed:  ${card.speed}\n`
statsText += `brains: ${card.brains}`
```

What do you think the `+=`(js) is doing in those lines of code?

<response>

What do you think the `\n`(js) at the end of the lines of text do?

<response>


### Card Viewer Design


<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Look at this Kaplay program, which will show a single card:

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

loadBean()

const cardFrame = add([
    rect(300, 400, { radius: 10 }),
    pos(50, 50),
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
    text("STATS\nSTATS\nSTATS", { size: 28 }),
    pos(150, 290),
    anchor("top"),
    color(0, 0, 0),
])
```

</web-playground>


That's looking pretty good: One `text(...)`(js) for the name, another for the stats, and a `sprite(...)`(js) for the image

But, look closely at the code. The `text` and `sprite` objects are being added to the `cardFrame` object: `const cardImage = cardFrame.add([...])`(js)

Why do you think we have done this?

<response>

> [!TIP]
> In Kaplay, if objects are part of another **parent object**, it is best to add them to it instead of adding them to the scene. That way, if the parent is moved, all the **child objects move too**.


### Displaying a Card

Great! Now we're ready to display the card in the card view:

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

const card = {
    name:   "Elephant",
    image:  "elephant",
    power:  10,
    speed:  1,
    brains: 8,
}

loadSprite(card.image, `assets/images/${card.image}.png`)

const cardFrame = add([
    rect(300, 400, { radius: 10 }),
    pos(50, 50),
    color(255, 255, 255),
    outline(5, rgb(0, 0, 0)),
])

const cardName = cardFrame.add([
    text(card.name, { size: 50 }),
    pos(150, 50),
    anchor("center"),
    color(0, 0, 0),
])

const cardImage = cardFrame.add([
    sprite(card.image),
    pos(150, 180),
    anchor("center"),
    scale(2.5),
])

let statsText = ""
statsText += `power:  ${card.power}\n`
statsText += `speed:  ${card.speed}\n`
statsText += `brains: ${card.brains}`

const cardStats = cardFrame.add([
    text(statsText, { size: 28 }),
    pos(150, 290),
    anchor("top"),
    color(0, 0, 0),
])
```

</web-playground>


### A Better Card Viewer

The code above shows a single card when it is first run, but it is locked to that one card... there is **no way to update the UI to show a different card**.

Let's create a `showCard(...)`(js) **function** that we can call whenever we want, to show **any card**. And let's try using it to show two different cards:


<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

const elephantCard = {
    name:   "Elephant",
    image:  "elephant",
    power:  10,
    speed:  1,
    brains: 8,
}

loadSprite("elephant", "assets/images/elephant.png")

function showCard(card) {
    const cardFrame = add([
        rect(300, 400, { radius: 10 }),
        pos(50, 50),
        color(255, 255, 255),
        outline(5, rgb(0, 0, 0)),
    ])

    const cardName = cardFrame.add([
        text(card.name, { size: 50 }),
        pos(150, 50),
        anchor("center"),
        color(0, 0, 0),
    ])

    const cardImage = cardFrame.add([
        sprite(card.image),
        pos(150, 180),
        anchor("center"),
        scale(2.5),
    ])

    let statsText = ""
    statsText += `power:  ${card.power}\n`
    statsText += `speed:  ${card.speed}\n`
    statsText += `brains: ${card.brains}`

    const cardStats = cardFrame.add([
        text(statsText, { size: 28 }),
        pos(150, 290),
        anchor("top"),
        color(0, 0, 0),
    ])
}

showCard(elephantCard)
```

</web-playground>

Nice! That works: we can now just call `showCard(...)`(js), giving it a **card object**, and it shows it.


### Showing Multiple Cards

Let's try using `showCard(...)`(js) to **show two different cards**:


<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

const elephantCard = {
    name:   "Elephant",
    image:  "elephant",
    power:  10,
    speed:  1,
    brains: 8,
}

const catCard = {
    name:   "Cat",
    image:  "cat",
    power:  4,
    speed:  8,
    brains: 5,
}

loadSprite("elephant", "assets/images/elephant.png")
loadSprite("cat",      "assets/images/cat.png")

function showCard(card) {
    const cardFrame = add([
        rect(300, 400, { radius: 10 }),
        pos(50, 50),
        color(255, 255, 255),
        outline(5, rgb(0, 0, 0)),
        opacity(1),
    ])

    const cardName = cardFrame.add([
        text(card.name, { size: 50 }),
        pos(150, 50),
        anchor("center"),
        color(0, 0, 0),
    ])

    const cardImage = cardFrame.add([
        sprite(card.image),
        pos(150, 180),
        anchor("center"),
        scale(2.5),
    ])

    let statsText = ""
    statsText += `power:  ${card.power}\n`
    statsText += `speed:  ${card.speed}\n`
    statsText += `brains: ${card.brains}`

    const cardStats = cardFrame.add([
        text(statsText, { size: 28 }),
        pos(150, 290),
        anchor("top"),
        color(0, 0, 0),
    ])
}

showCard(elephantCard)
showCard(catCard)
```

</web-playground>

Amazing! Look at that - the last card we asked to show was the **cat** one, and there it is!

#### A Problem!

Try changing the opacity of the `cardFrame`... Change `opacity(1)`(js) to `opacity(0.25)`(js). What happens?

<response>

Why can we still see the **elephant card underneath the cat card**?!

<response>


### A Card Deck Viewer

Look at this next Kaplay program, which shows random cards from a deck:

Run it and see. Click inside the game first!

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

const statNames = ["power", "speed"]

const deck = [
    { name: "Cat",      power:  4, speed:  6 },
    { name: "Elephant", power: 10, speed:  1 },
    { name: "Ghost",    power:  2, speed: 10 },
]

loadSprite(card.image, `assets/images/${card.image}.png`)

let currentCard = choose(deck)

add([
    text("Press SPACE...", { size: 18 }),
    pos(200, 370),
    anchor("center"),
    color(150, 170, 200),
])

function showCard(card) {
    const cardFrame = add([
        rect(280, 360, { radius: 10 }),
        pos(60, 60),
        color(255, 255, 255),
        outline(5, rgb(0, 0, 0)),
        "card",
    ])

    const nameLabel = cardFrame.add([
        text(card.name, { size: 50 }),
        pos(140, 50),
        anchor("center"),
        color(0, 0, 0),
    ])

    const statsLabel = cardFrame.add([
        text("", { size: 28 }),
        pos(140, 150),
        anchor("top"),
        color(0, 0, 0),
    ])

    let statsText = ""
    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]
        const statValue = card[statName]
        statsText += `${statName}: ${statValue}\n`
    }
    statsLabel.text = statsText
}

showCard(currentCard)

onKeyPress("space", () => {
    currentCard = choose(deck)
    destroyAll("card")
    showCard(currentCard)
})
```

</web-playground>

What does the screen show **when the game starts**?

<response>

What does it show after you press **SPACE**?

<response>

Why does it sometimes look like the **card doesn't change**?

<response>


## **M**odify

### Always Different

Here is the card viewer from before. We want to update it so that pressing SPACE will always show a **different card**. Can you update the `onKeyPress(...)`(js) function to do this?

> [!TIP]
> You will need to **keep picking** a new card **until it is different** from the current one - you'll need a **loop**

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 400,
    background: [30, 60, 90]
})

const statNames = ["power", "speed"]

const deck = [
    { name: "Cat",      power:  4, speed:  6 },
    { name: "Elephant", power: 10, speed:  1 },
    { name: "Ghost",    power:  2, speed: 10 },
]

let currentCard = choose(deck)

const nameLabel = add([
    text("", { size: 60 }),
    pos(200, 100),
    anchor("center"),
])

const statsLabel = add([
    text("", { size: 28 }),
    pos(200, 200),
    anchor("top"),
])

add([
    text("Press SPACE...", { size: 18 }),
    pos(200, 370),
    anchor("center"),
    color(150, 170, 200),
])

function showCard(card) {
    nameLabel.text = card.name

    let statsText = ""
    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]
        const statValue = card[statName]
        statsText += `${statName}: ${statValue}\n`
    }
    statsLabel.text = statsText
}

showCard(currentCard)

onKeyPress("space", () => {
    currentCard = choose(deck)
    showCard(currentCard)
})
```

</web-playground>


## **M**ake

### Deck with Images

Time to make a deck viewer that is a bit more visual, with images and more stats. That means you will need to extend the data you are storing for each card. Your deck might look something like:

```js
const deck = [
    { name: "Cat",      image: "cat",      speed: 8, power:  4, cuteness: 9, spookiness:  2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness:  1 },
    { name: "Ghost",    image: "ghost",    speed: 5, power:  3, cuteness: 4, spookiness: 10 },
]
```

You will need to load all of the images from the `assets/images/` folder when the program first starts:

```js
for (let i = 0; i < deck.length; i++) {
    const cardImage = deck[i].image
    loadSprite(cardImage, `assets/images/${cardImage}.png`)
}
```

To show the card image, you will need to add a sprite to the UI:

```js
const card add([
    sprite(card.image),
    pos(width() / 2, 160),
    anchor("center"),
    scale(3),
    "picture",
])

 to update `showCard(...)`js to include a sprite:

```js
destroyAll("picture")
add([
    sprite(card.image),
    pos(width() / 2, 160),
    anchor("center"),
    scale(3),
    "picture",
])
```

> [!IMPORTANT]
> Kaplay has no way to
Your viewer must have:

- <check> At least **6 cards**, each with a name, a picture and its stats
- <check> At least **4 stats** per card
- <check> The **arrow keys** to browse the deck, stopping at each end
- <check> A **card counter**, like `3 of 6`

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
// Copy your code from the viewer above here, then make it your own
```

</web-playground>














### Tinker

Here's a working viewer. Complete the tasks one at a time. Test after each change!

<web-playground data-height="44em" js-only>

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
