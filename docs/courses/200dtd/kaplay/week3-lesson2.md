# Lesson 2: Displaying Data

Last lesson we stored lots of data in arrays and objects. But data on its own is just numbers and words in our code. To be useful in a game, the player needs to **see** it!

In this lesson you'll learn how to build a good **UI** (user interface) for a piece of data. First we'll show **one item**, then we'll make a UI that can show **any item** you give it.

## Warm-Up

Try not to look back at the previous lesson...

1. What's the difference between an **array** and an **object**?

    <response>

2. If `statName`(js) is `"speed"`, what does `card[statName]`(js) give us?

    <response>

3. When would you use `for (let i = 0; i < items.length; i++)`(js) instead of `for...of`(js)?

    <response>


## Learning Goals

- <check> I can build a UI out of several Kaplay objects
- <check> I can group objects together with a **parent** and its **children**
- <check> I can write a function that creates a UI once, and **shows any item** in it
- <check> I can explain why we **update** a UI, rather than making a new one each time
- <check> I can make a UI **data-driven**, using a loop


## The Big Idea: **Data** and **UI**

The **data** is what the game knows. The **UI** is how the player sees it. We'll keep them **separate**: the data lives in an object, and the UI code knows how to show *any* object of that shape.

That means we can change the data, or add new data, **without touching the UI code**.


## **I**nvestigate

### A Card Viewer

We are going to look at a simple game that **shows cards from a deck**. We will take things one step at a time...

Let's create a **card object**:

```js
const card = {
    name:   "Elephant",
    image:  "elephant",
    power:  10,
    speed:  1,
    brains: 8,
}
```

Some of those items of data look easy to display: the **name** can go in a `text(...)` object, the **image** in a `sprite(...)`. But what about all those **stats**?

It might be easiest if we **combine all the stats into a single block of text** which we can then place into a single `text(...)` object:

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

We have one `text(...)`(js) for the name, another for the stats, and a `sprite(...)`(js) for the image.

Look closely at the code - The `text` and `sprite` objects are being added to the `cardFrame` object: `const cardImage = cardFrame.add([...])`(js). Why do you think we have done this?

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

What do you think the screen will show when we call `showCard(...)`(js) **twice**, once for the elephant and once for the cat?

<response>

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

#### But... We Have a Problem!

Try changing the opacity of the `cardFrame`... Change `opacity(1)`(js) to `opacity(0.25)`(js). What happens?

<response>

Why can we still see the **elephant card underneath the cat card**?!

<response>


### A Card That Can Be Updated

We need to **create a card view once** and then be able to **update what it shows** whenever we want. Let's tweak the card creation function:

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

loadBean()
loadSprite("elephant", "assets/images/elephant.png")
loadSprite("cat",      "assets/images/cat.png")

function createCardView() {
    const cardFrame = add([
        rect(300, 400, { radius: 10 }),
        pos(50, 50),
        color(255, 255, 255),
        outline(5, rgb(0, 0, 0)),
        opacity(1),
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
        text("STATS\nSTATS", { size: 28 }),
        pos(150, 290),
        anchor("top"),
        color(0, 0, 0),
    ])

    cardFrame.show = function(card) {
        cardName.text = card.name

        cardImage.use(sprite(card.image))

        let statsText = ""
        statsText += `power:  ${card.power}\n`
        statsText += `speed:  ${card.speed}\n`
        statsText += `brains: ${card.brains}`

        cardStats.text = statsText
    }

    return cardFrame
}

const cardView = createCardView()
cardView.show(elephantCard)
cardView.show(catCard)
```

</web-playground>

What is the purpose of `loadBean()`(js) and why do we add `sprite("bean")`(js) during the card view creation?

<response>

What do you think the `cardFrame.show = function(card) { ... }`(js) code is doing?

<response>

Why do we return the cardFrame object, `return cardFrame`(js)?

<response>

Looking at the final lines of code:

```js
const cardView = createCardView()
cardView.show(elephantCard)
cardView.show(catCard)
```

Can you explain how this has fixed the problem of the two, overlapping cards we had before?

<response>


### Less Repetition

Our `show` function has a weakness. Look at these lines:

```js
statsText += `power:  ${card.power}\n`
statsText += `speed:  ${card.speed}\n`
statsText += `brains: ${card.brains}`
```

1. The three lines are almost identical. What changes from line to line?

    <response>

2. Imagine we add a fourth stat, `luck`, to every card. How many places in the code would we need to change?

    <response>

We already know a better way! Put the **names of the stats** in an **array**, and **loop** through it with `for...of`, using the **lookup with a variable** from last lesson:

```js
const statNames = ["power", "speed", "brains"]

// ...inside the show function:
let statsText = ""
for (const statName of statNames) {
    statsText += `${statName}: ${card[statName]}\n`
}
```

Try it out. The `statNames` array and the loop are both in the code below.

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

const statNames = ["power", "speed", "brains"]

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

loadBean()
loadSprite("elephant", "assets/images/elephant.png")
loadSprite("cat",      "assets/images/cat.png")

function createCardView() {
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

const cardView = createCardView()
cardView.show(elephantCard)
```

</web-playground>

Now add a `luck` stat to the **elephant card** and to `statNames`. Does the card show it? Do you need to change the UI code?

<response>

> [!IMPORTANT]
> This is the big payoff of keeping **data** and **UI** separate. The UI code knows how to show *a* card, whatever stats it has. To add a stat, we change the **data**.


## **M**odify

### Bug Hunt

This card view has some bugs. Run it, read the error messages, and fix them one at a time. Can you fix the following?

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

const statNames = ["power", "speed", "brains"]

const elephantCard = {
    name:   "Elephant",
    image:  "elephant",
    power:  10,
    speed:  1,
    brains: 8,
}

loadBean()
loadSprite("elephant", "assets/images/elephant.png")

function createCardView() {
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
        text("STATS", { size: 28 }),
        pos(150, 290),
        anchor("top"),
        color(0, 0, 0),
    ])

    cardFrame.show = function(card) {
        cardName.text = card.name

        let statsText = ""
        for (const statName of statNames) {
            statsText += `${statName}: ${card.statName}\n`
        }

        cardStats.text = statsText
    }
}

const cardView = createCardView()
cardView.show(elephantCard)
```

</web-playground>

1. <check> The program **crashes** straight away, with an error about `show`
2. <check> Once that's fixed, every stat shows as `undefined`
3. <check> Once that's fixed, the card shows the **bean** picture, not the elephant

> [!TIP]
> What does a function give back if it never `return`s anything? And remember how we look up a property using a **variable**...

### Tinker

Here's a working card view. Complete the tasks one at a time. Test after each change!

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 700, height: 500,
    background: [30, 60, 90]
})

const statNames = ["power", "speed", "brains"]

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

loadBean()
loadSprite("elephant", "assets/images/elephant.png")
loadSprite("cat",      "assets/images/cat.png")

function createCardView() {
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

const cardView = createCardView()
cardView.show(elephantCard)
```

</web-playground>

Tasks:

1. <check> Change how the card **looks**: the colours, the size of the text, the outline
2. <check> Add a `luck` stat to the cards and to `statNames`, and check that it shows
3. <check> Give `createCardView` two **parameters**, `x` and `y`, so that we choose where the card goes. Then create a **second** view, and show the cat card in it **next to** the elephant


## **M**ake

### Your Own Item

Now build a UI for **something of your own**. It doesn't have to be a card! It could be a character profile, a pet, a food item, a planet fact file, a team member... anything with a name, a picture and some numbers.

Your UI must have:

- <check> A **create** function that builds the UI **once**, and returns it
- <check> A `show` function on it that **updates** the UI to show any item
- <check> A **name**, a **picture** (from the pictures in the starter project) and **at least 3 stats**, with the stat names stored in an **array** and shown using a **loop**
- <check> **Two different items** shown **side by side**, using two views

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
// Copy your code from the card view above here, then make it your own
```

</web-playground>

> [!TIP]
> These are the pictures you can use: `apple`, `beetle`, `butterfly`, `cat`, `door`, `egg`, `elephant`, `fish`, `flower`, `ghost`, `grass`, `heart`, `jam`, `key`, `meat`, `mushroom`, `pineapple`, `portal`, `skull`, `smile`, `star`, `steel`, `sword`, `watermelon`

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                        | Hint                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Make the **frame colour** depend on the item                     | A `color`(js) property in the data, and `cardFrame.color = ...`(js) in `show`         |
| Highlight each item's **best stat** in gold                      | Find the highest stat in a loop, then build the text with a special marker            |
| Make a **nicer frame**, with a header bar and a shadow           | More objects added to `cardFrame`(js), with different `pos`(js) and `color`(js)       |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # Why do we add the name, picture and stats to the `cardFrame` as **children**?

    ---

    - [ ] To make them run faster
    - [x] So they move together with the frame, and are removed together
    - [ ] Because Kaplay requires it
    - [ ] So they can't be seen

- # Why do we create the card view **once** and then call `show` to change it?

    ---

    - [ ] Because creating objects is not allowed
    - [x] Otherwise each new card would be drawn on top of the old ones
    - [ ] To make the card bigger
    - [ ] It makes the code shorter

- # What does `cardFrame.show = function(card) { ... }` do?

    ---

    - [ ] Shows the card straight away
    - [ ] Deletes the card
    - [x] Gives the frame a function that updates it to show a card
    - [ ] Makes a new frame

</quiz>
