# Week 3: Data & Displaying Data


## Lesson 1: Arrays

<slides>

# Lesson 1: Arrays

Note:
Pure data today: no game, no UI. The aim is for arrays to be second nature before we build anything with them

---

## Learning

- Storing lists in **arrays**
- Getting items by **index**
- `length` and `push`
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
- A const array can still be added to: const stops replacing, not changing

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

`for...of` for **each item**. The counting loop when you need the **index**

Note:
Start with for...of. Switch only when the position matters, like numbering a list

---

## Make: My List

- At least **6 items**
- Printed as a **numbered list**
- **Two more** added with `push`
- The **count** and the **last item**

</slides>



## Lesson 2: Objects

<slides>

# Lesson 2: Objects

Note:
Last lesson was lists. Now lots of details about one thing, then lists of those things

---

## Learning

- Grouping values into **objects**
- Reading, changing and adding **properties**
- Looking up with a **variable**
- **Arrays of objects**

---

## Objects

```js
const card = {
    name: "Cat",
    speed: 8,
    power: 4,
}

console.log(card.name)
card.luck = 3
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
console.log(card.statName)     // undefined!
```

Square brackets look up a property using a **variable**

Note:
The key idea for the rest of the week. The bug hunt uses item.property

---

## Array of Objects

```js
const deck = [
    { name: "Cat",      speed: 8 },
    { name: "Elephant", speed: 3 },
]

for (const card of deck) {
    console.log(card.name)
}
```

---

## Make: Your Own Data

- An array of **5+ objects**
- **3+ properties**, 2+ numbers
- Print every item
- **Find the best** item
- `push` a new object

</slides>



## Lesson 3: Displaying One Item

<slides>

# Lesson 3: Displaying One Item

Note:
Data on its own isn't much use. This lesson is about turning it into a UI, and keeping the two separate

---

## Learning

- Building a **UI** from several objects
- **Parents** and **children**
- A view you **create once** and **update**

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

## Make: Your Own Item

- A **create** function and a `show` function
- Name, picture, **3+ stats**
- **Two items** side by side

*It doesn't have to be a card!*

</slides>



## Lesson 4: Displaying the Deck

<slides>

# Lesson 4: Displaying the Deck

Note:
One UI, many items. Index state, buttons, random. Then their own deck

---

## Learning

- Tracking which item with an **index**
- Showing **any item** in the card view
- **Buttons** that change the index
- A **random** pick

---

## Data, UI, State

| Part  | Example                 |
| ----- | ----------------------- |
| Data  | `deck`                  |
| UI    | `cardView.show(...)`    |
| State | `cardIndex`             |

Change the **state**, then call `show`

---

## Buttons from Data

```js
for (const info of buttons) {
    const button = add([
        rect(120, 50),
        pos(info.x, 450),
        area(),
        "button",
        { action: info.action },
    ])
}
```

An **array of objects** becomes a row of buttons

---

## Next, Prev, Random

```js
if (button.action === "next") {
    if (cardIndex < deck.length - 1) {
        cardIndex = cardIndex + 1
    }
}
```

Why `length - 1`?

---

## Make: Your Deck Viewer

- **8+ cards**, your theme
- **Your own stats**, 3+
- **Prev**, **Next** and **Random**
- A **counter**, and a look that suits your theme

</slides>
