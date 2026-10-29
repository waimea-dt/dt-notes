# Week 3: Data, UI & Scenes


## Lesson 1: Lists & Objects

<slides>

# Lesson 1: Lists & Objects

Note:
Pure data today: no game, no UI. The aim is for arrays and objects to be second nature before we build anything with them

---

## Learning

- Storing lists in **arrays**
- Getting items by **index**
- Grouping values into **objects**
- Looking up properties with a **variable**
- Looping with `for...of`

---

## Arrays

```js
const statNames = ["power", "speed", "brains"]

console.log(statNames[0])       // "power"
console.log(statNames.length)   // 3

statNames.push("luck")
```

Indexes start at **0**!

Note:
- Last index is always length - 1
- Ask: what does statNames[3] give? (undefined)

---

## Objects

```js
const card = {
    name: "Cat",
    speed: 8,
    power: 4,
}

console.log(card.name)
```

A bundle of **named** values

Note:
Not the same as a Kaplay game object. It's just a card with labelled fields. They've already been writing objects: `{ size: 28 }`

---

## Looking Up with a Variable

```js
const statName = "power"

console.log(card.power)        // 4
console.log(card[statName])    // 4
```

Square brackets look up a property using a **variable**

Note:
The key idea for the whole week. Bug hunt: `item.property` gives undefined

---

## Two Loops

```js
for (const statName of statNames) {
    console.log(statName)
}

for (let i = 0; i < statNames.length; i++) {
    console.log(`${i + 1}. ${statNames[i]}`)
}
```

`for...of` for **each item**. Counting loop when you need the **index**

---

## Make: Your Own Data

- An array of **5+ objects**
- **3+ properties**, 2+ numbers
- Print every item with `for...of`
- **Find the best** item
- `push` a new item

</slides>



## Lesson 2: Displaying Data

<slides>

# Lesson 2: Displaying Data

Note:
Data on its own isn't much use. This lesson is about turning it into a UI, and keeping the two separate

---

## Learning

- Building a **UI** from several objects
- **Parents** and **children**
- A view you **create once** and **update**
- A **data-driven** UI

---

## Data vs UI

- The **data** is what the game knows
- The **UI** is how the player sees it

Keep them **separate**: the UI code knows how to show *any* item

---

## Parents and Children

```js
const cardName = cardFrame.add([
    text("NAME HERE", { size: 50 }),
    pos(150, 50),
    anchor("center"),
])
```

Move the frame, and the children **move too**

Note:
Children's positions are relative to the parent. They are also removed with the parent

---

## Create Once, Update Many

```js
const cardView = createCardView()

cardView.show(elephantCard)
cardView.show(catCard)
```

Otherwise each new card is drawn **on top of the old one**

Note:
Students discover the overlap problem themselves in the Investigate step

---

## Data-Driven

```js
let statsText = ""
for (const statName of statNames) {
    statsText += `${statName}: ${card[statName]}\n`
}
```

Add a stat by changing the **data**, not the UI

---

## Make: Your Own Item

- A **create** function and a `show` function
- Name, picture, **3+ stats** in an array
- **Two items** side by side

*It doesn't have to be a card!*

</slides>



## Lesson 3: Dealing Cards

<slides>

# Lesson 3: Dealing Cards

Note:
One UI, many items. This lesson sets up the battle: browsing a deck by index, and dealing two different random cards

---

## Learning

- Stepping through an array with an **index**
- Showing **any item** in a card view
- **Random** picks
- Making two picks **different**

---

## Data, UI, State

| Part  | Example                 |
| ----- | ----------------------- |
| Data  | `deck`                  |
| UI    | `cardView.show(...)`    |
| State | `cardIndex`             |

Change the **state**, then call `show`

---

## Browsing

```js
onKeyPress("right", () => {
    if (cardIndex < deck.length - 1) {
        cardIndex = cardIndex + 1
        showCurrentCard()
    }
})
```

Why `length - 1`?

---

## Dealing

```js
const playerCard = choose(deck)
let computerCard = choose(deck)

while (computerCard === playerCard) {
    computerCard = choose(deck)
}
```

Keep picking until the cards are **different**

Note:
Revisits while loops from Week 1 and choose() from Week 2

---

## Make: Your Deck

- **8+ cards**, your theme
- **Your own stats**, 3+
- Two **different** cards dealt
- A **total** for each card, using a loop

*You'll use this deck in Lesson 4!*

</slides>



## Lesson 4: Creature Clash

<slides>

# Lesson 4: Creature Clash

Note:
Scenes first, then the card battle. The last part is mostly modify: they get most of the battle code and make it their own

---

## Learning

- **Scenes** and `go(...)`
- **Passing data** between scenes
- Where variables live
- Adapting a game to **your own data**

---

## Scenes

```js
scene("title", () => {
    // objects and events for the title screen
})

go("title")
```

A scene is **one screen** of your game

Note:
A scene doesn't start until you go() to it. Kaplay throws away everything from the old scene

---

## Passing Data

```js
go("results", { wins: wins })

scene("results", (data) => {
    // data.wins
})
```

Data goes in an **object**

---

## Where Variables Live

```js
scene("game", () => {
    let clicks = 0     // fresh every visit
})
```

**Inside** a scene: this scene only, created fresh each time

**Outside** every scene: seen by all, and **keeps** its value

Note:
Predict step: play again, then click once. Does the label say 1 or 9?

---

## The Card Battle

You get **most of the code**:

- Your deck and `createCardView`
- Dealing, buttons, comparing, rounds

You **add**: scenes, your deck, a twist

---

## Build Steps

1. Get it **running** with your deck
2. A **battle** scene
3. A **title** scene
4. A **results** scene
5. Your **twist**, then **balance** the numbers

*Test after every step!*

Note:
Finish with playtesting and the Week 3 Check quiz. Ask afterwards: which changes were data, and which were code?

</slides>
