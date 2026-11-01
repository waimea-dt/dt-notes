# Lesson 2: Objects

Last lesson we stored a **list** of values in an array. But what if we want to store lots of **details about one thing**, like a card with a name, a picture and some stats? For that, we use an **object**.

In this lesson you'll learn how to build **objects**, and then put them **inside arrays** to make a whole deck of data.

## Warm-Up

Try not to look back at the previous lesson...

1. An array has 6 items. What is the index of the **last** one?

    <response>

2. What does `items.push("key")`(js) do?

    <response>

3. When would you use `for (let i = 0; i < items.length; i++)`(js) instead of `for...of`(js)?

    <response>


## Learning Goals

- <check> I can group related values into an **object**
- <check> I can read, change and add an object's **properties**
- <check> I can look up a property using a **variable**
- <check> I can store a deck of cards as an **array of objects**
- <check> I can loop through an array of objects


## The Big Idea: **Objects**

An **object** groups related values together, each with a **name**. We write it with **curly braces**, `{ ... }`(js), and we access values within using a **dot**, `object.item`(js):

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

We can change a property, or add a new one:

```js
card.speed = 9
card.luck = 3
```

### Looking up with a variable

Sometimes we don't know which property we want when we write the code. **Square brackets** let us look up a property using a **variable**:

```js
console.log(card.power)         // 4

const statName = "power"

console.log(card[statName])     // 4, because statName is "power"
```

### Arrays of objects

A deck is a **list** of cards, and each card is an **object**. That's an **array of objects**:

```js
const deck = [
    { name: "Cat",      speed: 8, power: 4 },
    { name: "Elephant", speed: 3, power: 10 },
    { name: "Ghost",    speed: 1, power: 3 },
]

console.log(deck[1].name)       // "Elephant"
```


## **P**redict then **R**un

For each snippet below, write what you think the code will show, then run it to see if your prediction was correct.

<primm title="Snippet 1" sub-title="">

```js
const card = { name: "Cat", speed: 8, power: 4 }

console.log(card.name)
console.log(card.speed + card.power)
```

</primm>

<primm title="Snippet 2" sub-title="">

```js
const card = { name: "Cat", speed: 8, power: 4 }

card.speed = 9
card.luck = 3

console.log(card.speed)
console.log(card.luck)
```

</primm>

<primm title="Snippet 3" sub-title="">

```js
const card = { name: "Cat", speed: 8, power: 4 }

const statName = "power"
console.log(card[statName])
```

</primm>

<primm title="Snippet 4" sub-title="">

```js
const card = { name: "Cat", speed: 8, power: 4 }

let statName = "power"
console.log(card[statName])

statName = "speed"
console.log(card[statName])
```

</primm>

<primm title="Snippet 5" sub-title="">

```js
const deck = [
    { name: "Cat",      speed: 8 },
    { name: "Elephant", speed: 3 },
    { name: "Fish",     speed: 7 },
]

console.log(deck[1].name)

for (const card of deck) {
    console.log(`${card.name} has speed ${card.speed}`)
}
```

</primm>

<primm title="Snippet 6" sub-title="">

```js
const card = { name: "Cat", speed: 8, power: 4 }

const statName = "power"
console.log(card.statName)
```

</primm>


## **I**nvestigate

### Arrays or Objects?

In the code below, what is `player`(js) and what is `inventory`(js): **array** or **object**?

```js
const player = { name: "Dave", age: 15, hp: 95 }
const inventory = ["sword", "bacon", "coin", "key"]
```

<response>

When would you use an **array**, and when would you use an **object**? Think about a deck of cards versus one single card.

<response>


### Dot or Square Brackets?

Snippet 6 showed `undefined`. Why? What is JavaScript looking for when we write `card.statName`(js), and what do we need to write instead?

<response>


### Looking Up Stats

Run this, then change `statName` to `"speed"`. Then change it to `"brains"`. Which stat does each card show?

```js run
const deck = [
    { name: "Cat",      power: 4,  speed: 8, brains: 5 },
    { name: "Elephant", power: 10, speed: 1, brains: 8 },
    { name: "Fish",     power: 2,  speed: 7, brains: 3 },
]

const statName = "power"

for (const card of deck) {
    console.log(`${card.name}: ${card[statName]}`)
}
```

<response>


## **M**odify

### Bug Hunt

This program works out the value of a player's inventory, and prints the weight of each item. It has **three bugs**. Run it, read the error messages, and fix them one at a time.

```js run
const inventory = [
    { name: "Sword", weight: 5, value: 100 },
    { name: "Bacon", weight: 1, value: 5 },
    { name: "Key",   weight: 0, value: 50 },
]

let totalValue = 0

for (let i = 0; i <= inventory.length; i++) {
    totalValue = totalValue + inventory[i].valu
}

console.log("Total value:", totalValue)

const property = "weight"

for (const item of inventory) {
    console.log(item.name, item.property)
}
```

1. <check> The program **crashes** with an error about `undefined`
2. <check> Once that's fixed, the total value shows as `NaN` (not a number)
3. <check> Once that's fixed, the weights show as `undefined`

> [!TIP]
> Property names have to match **exactly**. And how do you look up a property when its name is stored in a **variable**?

### Tinker

Here's a working inventory. Complete the tasks one at a time. Test after each change!

```js run
const inventory = [
    { name: "Sword", weight: 5, value: 100 },
    { name: "Bacon", weight: 1, value: 5 },
    { name: "Key",   weight: 0, value: 50 },
]

for (const item of inventory) {
    console.log(`${item.name} weighs ${item.weight} and is worth ${item.value}`)
}
```

Tasks:

1. <check> Add a **fourth item** to the inventory
2. <check> Add a new property, `rarity`, to every item, and show it in the output
3. <check> Use `push` to add an item **after** the inventory has been made
4. <check> Only print the items that are worth **more than 20** (hint: an `if` inside the loop)


## **M**ake

### Your Own Data

Time to invent your own data! Choose **something you can make a list of**: a scoreboard, a pet shop, a menu, your favourite games, a team... anything you like.

Your program must have:

- <check> An **array** of **at least 5 objects**
- <check> At least **3 properties** on every object, including at least **2 numbers**
- <check> A `for...of` loop that **prints every item**, nicely
- <check> A way to **find the best** item for a number property (the highest score, the cheapest price...)
- <check> A new item **added** with `push`, and the data printed again

```js run
// Your data and code go here!

```

> [!TIP]
> To find the best item, keep track of the **best item so far** (not just the best number), and replace it whenever you find a better one.

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                          | Hint                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Work out the **average** of a number property                      | Add them all up in a `let`(js), then divide by `items.length`(js)                     |
| **Count** how many items match a condition                         | A `let`(js) counter and an `if`(js) inside your loop                                  |
| Make the "best item" code work for **any property** you choose     | Put the property name in a variable, and look it up with `item[property]`(js)         |


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

- # What does this code do?

    ```js
    card.luck = 3
    ```

    ---

    - [ ] Looks up the `luck` property
    - [x] Adds a `luck` property to the card, with the value 3
    - [ ] Deletes the card
    - [ ] Shows the card

</quiz>
