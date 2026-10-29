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














