# Lesson 1: Lists & Objects

So far our games have stored single values: a score, a number of lives, a timer. But many games need to store **lots** of data, for example a card game has many cards, and every card has a name, a picture and some stats.

In this lesson you'll learn **two ways of storing lots of data**, and how to **loop through** them. There's no game today, just data!

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
- <check> I can loop through an array with `for...of`


## The Big Idea: **Arrays** and **Objects**

### Arrays: an ordered list

An **array** stores a list of values, in order. We write it with square brackets:

```js
const statNames = ["power", "speed", "brains"]
```

Each item has a position number called an **index**. Indexes start at **0**, not 1!

| Index | `0`       | `1`       | `2`        |
| ----- | --------- | --------- | ---------- |
| Item  | `"power"` | `"speed"` | `"brains"` |

```js
console.log(statNames[0])        // "power"
console.log(statNames.length)    // 3
```

> [!IMPORTANT]
> An array with 3 items has indexes `0`, `1` and `2`. The **last** index is always `length - 1`.

We can add an item to the **end** of an array with `push`:

```js
statNames.push("luck")

console.log(statNames.length)    // 4
```

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

### Looping through an array

There are two ways to loop through an array. If we just want **each item in turn**, we use `for...of`:

```js
for (const statName of statNames) {
    console.log(statName)
}
```

Each lap, `statName` is the next item in the array. There's no counter to manage, so there's less to get wrong!

If we also need the **position** of each item, we use the counting loop you already know:

```js
for (let i = 0; i < statNames.length; i++) {
    console.log(`${i + 1}. ${statNames[i]}`)
}
```

| Loop          | Use it when...                                            |
| ------------- | --------------------------------------------------------- |
| `for...of`    | You want **each item**, and the position doesn't matter   |
| `for (let i ...)` | You need the **index** too, e.g. to number items or place them on screen |

> [!TIP]
> Start with `for...of`. Only switch to the counting loop when you really need `i`.


## **P**redict then **R**un

For each snippet below, write what you think the code will show, then run it to see if your prediction was correct.

<primm title="Snippet 1" sub-title="">

```js
const statNames = ["power", "speed", "brains"]

console.log(statNames[0])
console.log(statNames[2])
console.log(statNames[3])
```

</primm>

<primm title="Snippet 2" sub-title="">

```js
const statNames = ["power", "speed", "brains"]

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

<primm title="Snippet 7" sub-title="">

```js
const items = ["sword", "key"]

items.push("bacon")

for (const item of items) {
    console.log(item)
}

console.log(items.length)
```

</primm>

<primm title="Snippet 8" sub-title="">

```js
const deck = [
    { name: "Cat",      speed: 8 },
    { name: "Elephant", speed: 3 },
    { name: "Fish",     speed: 7 },
]

for (const card of deck) {
    console.log(`${card.name} has speed ${card.speed}`)
}
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

### Two Loops

Here are both kinds of loop, doing the same job. Run it, then answer the questions.

```js run
const colours = ["red", "green", "blue"]

for (const colour of colours) {
    console.log(colour)
}

for (let i = 0; i < colours.length; i++) {
    console.log(colours[i])
}
```

1. What's different about the two loops? What's the same?

    <response>

2. Which loop would you use to print a **numbered list**, like `1. red`, `2. green`...? Why?

    <response>

3. Which loop is **less likely to go wrong** (remember "Going Past the End")? Why?

    <response>

### Finding the Highest

A very common job with data is **finding the best** item. The idea is to keep track of the highest value **so far**, and replace it whenever we find a higher one. Put the lines in order:

<drag-drop mode="code" title="Find the Highest" sub-title="Start with the first score, then check all of them">

1.
    ```js
    let highest = scores[0]
    ```

2.
    ```js
    for (const score of scores) {
    ```

3.
    ```js
        if (score > highest) {
    ```

4.
    ```js
            highest = score
    ```

5.
    ```js
        }
    ```

6.
    ```js
    }
    ```

7.
    ```js
    console.log(highest)
    ```

</drag-drop>

Test your ordering here, then change the scores. What if the highest score is the **first** one? Or the **last** one?

```js run
const scores = [120, 85, 240, 60, 175]

let highest = scores[0]

for (const score of scores) {
    if (score > highest) {
        highest = score
    }
}

console.log(highest)
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

Time to invent your own data! Choose **something you can make a list of**: a scoreboard, a playlist, a pet shop, a menu, your favourite games, a team... anything you like.

Your program must have:

- <check> An **array** of **at least 5 objects**
- <check> At least **3 properties** on every object, including at least **2 numbers**
- <check> A `for...of` loop that **prints every item**, nicely
- <check> A way to **find the best** item for a number property (the highest score, the cheapest price, the longest song...)
- <check> A new item **added** with `push`, and the data printed again

```js run
// Your data and code go here!

```

> [!TIP]
> Use the **Find the Highest** pattern to find your best item. Keep track of the **best item so far**, not just the best number, so you can print its name!

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

- # What does this loop do?

    ```js
    const names = ["Ava", "Ben", "Cy"]

    for (const name of names) {
        console.log(name)
    }
    ```

    ---

    - [ ] Shows the array just once
    - [x] Shows each name, one per line
    - [ ] Shows the numbers 0, 1 and 2
    - [ ] Shows `undefined`

</quiz>
