# Lesson 3: Displaying One Item

Last lesson we stored data in objects. But data on its own is just words and numbers in our code. To be useful in a game, the player needs to **see** it!

In this lesson you'll build a **UI** (a user interface) that shows **one card**, and then make it so that same UI can show **any** card you give it.

## Warm-Up

Try not to look back at the previous lessons...

1. What's the difference between an **array** and an **object**?

    <response>

2. If `statName`(js) is `"speed"`, what does `card[statName]`(js) give us?

    <response>

3. What does `card.luck = 3`(js) do?

    <response>


## Learning Goals

- <check> I can build a UI out of several Kaplay objects
- <check> I can group objects together with a **parent** and its **children**
- <check> I can build a UI from the data in an **object**
- <check> I can write a function that creates a UI **once**, and **shows any item** in it


## The Big Idea: **Data** and **UI**

The **data** is what the game knows. The **UI** is how the player sees it. We'll keep them **separate**: the data lives in an object, and the UI code knows how to show *any* object of that shape.


## **I**nvestigate

### A Card Viewer

We are going to look at a simple program that **shows a card**. We will take things one step at a time...

Let's create a **card object**:

```js
const elephantCard = {
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
statsText += `power:  ${elephantCard.power}\n`
statsText += `speed:  ${elephantCard.speed}\n`
statsText += `brains: ${elephantCard.brains}`
```

What do you think the `+=`(js) and the `\n`(js) are doing in those lines of code?

<response>


### Displaying a Card

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```

```js id=kaplay
kaplay({
    width: 700, height: 500,
    background: [30, 60, 90]
})

loadSprite("elephant", "assets/images/elephant.png")
loadSprite("cat",      "assets/images/cat.png")

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
```

</web-playground>

The card object is already made for you in the code below. Run it, and compare the code with what you see:

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
const cardFrame = add([
    rect(300, 400, { radius: 10 }),
    pos(50, 50),
    color(255, 255, 255),
    outline(5, rgb(0, 0, 0)),
])

const cardName = cardFrame.add([
    text(elephantCard.name, { size: 50 }),
    pos(150, 50),
    anchor("center"),
    color(0, 0, 0),
])

const cardImage = cardFrame.add([
    sprite(elephantCard.image),
    pos(150, 180),
    anchor("center"),
    scale(2.5),
])

let statsText = ""
statsText += `power:  ${elephantCard.power}\n`
statsText += `speed:  ${elephantCard.speed}\n`
statsText += `brains: ${elephantCard.brains}`

const cardStats = cardFrame.add([
    text(statsText, { size: 28 }),
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


### A Better Card Viewer

The code above is locked to one card... there is **no way to update the UI to show a different card**.

Let's create a `showCard(...)`(js) **function** that we can call whenever we want, to show **any card**. And let's try using it to show two different cards, the elephant and then the cat.

What do you think the screen will show?

<response>

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
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

Try changing the opacity of the `cardFrame`... Change `opacity(1)`(js) to `opacity(0.25)`(js). What happens? Why can we still see the **elephant card underneath the cat card**?!

<response>


### A Card That Can Be Updated

We need to **create a card view once** and then be able to **update what it shows** whenever we want. Let's tweak the card creation function:

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
loadBean()

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

1. What is the purpose of `loadBean()`(js), and why do we add `sprite("bean")`(js) when the card view is created?

    <response>

2. What do you think the `cardFrame.show = function(card) { ... }`(js) code is doing? Why do we `return cardFrame`(js)?

    <response>

3. Can you explain how this has fixed the problem of the two, overlapping cards we had before?

    <response>


## **M**odify

### Bug Hunt

This card view has some bugs. Run it, read the error messages, and fix them one at a time. Can you fix the following?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
loadBean()

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
        text("STATS\nSTATS", { size: 28 }),
        pos(150, 290),
        anchor("top"),
        color(0, 0, 0),
    ])

    cardFrame.show = function(card) {
        cardName.text = card.name

        let statsText = ""
        statsText += `power:  ${card.powr}\n`
        statsText += `speed:  ${card.speed}\n`
        statsText += `brains: ${card.brains}`

        cardStats.text = statsText
    }

}

const cardView = createCardView()
cardView.show(elephantCard)
cardView.show(catCard)
```

</web-playground>

1. <check> The program **crashes** straight away, with an error about `show`
2. <check> Once that's fixed, the **power** stat says `undefined`
3. <check> Once that's fixed, the card shows the **bean** picture, not the elephant

> [!TIP]
> What does a function give back if it never `return`s anything? And is the property really called `powr`?

### Tinker

Go back to the **working** card view in the previous step, and complete the tasks one at a time. Test after each change!

1. <check> Change how the card **looks**: the colours, the size of the text, the outline
2. <check> Add a `luck` stat: give the cards a `luck` property (like you did in Lesson 2), and show it
3. <check> Give `createCardView` two **parameters**, `x` and `y`, so that we choose where the card goes. Then create a **second** view, and show the cat card in it **next to** the elephant


## **M**ake

### Your Own Item

Now build a UI for **something of your own**. It doesn't have to be a card! It could be a character profile, a pet, a food item, a planet fact file, a team member... anything with a name, a picture and some numbers.

Your UI must have:

- <check> A **create** function that builds the UI **once**, and returns it
- <check> A `show` function on it that **updates** the UI to show an item
- <check> A **name**, a **picture** (from the pictures in the starter project) and **at least 3 stats**
- <check> **Two different items** shown **side by side**, using two views

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// Copy your code from the working card view above here, then make it your own
// (the elephant and cat cards from above are already available)
```

</web-playground>

> [!TIP]
> These are the pictures you can use: `apple`, `beetle`, `butterfly`, `cat`, `door`, `egg`, `elephant`, `fish`, `flower`, `ghost`, `grass`, `heart`, `jam`, `key`, `meat`, `mushroom`, `pineapple`, `portal`, `skull`, `smile`, `star`, `steel`, `sword`, `watermelon`

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                        | Hint                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Make the **frame colour** depend on the item                     | A `color`(js) property in the data, and `cardFrame.color = ...`(js) in `show`         |
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
