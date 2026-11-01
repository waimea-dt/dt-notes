# Lesson 1: Arrays

So far our games have stored single values: a score, a number of lives, a timer. But many games need to store **lots** of data, for example a card game has many cards, and a shooter has many enemies.

In this lesson you'll learn how to store **a list of values** in an **array**, and how to loop through it. There's no game today, just data!

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
- <check> I can find how many items an array has, using `length`
- <check> I can add an item to an array with `push`
- <check> I can loop through an array with `for...of`


## The Big Idea: **Arrays**

An **array** stores a list of values, in order. We write it with **square brackets**, `[ ... ]`(js):

```js
const statNames = ["power", "speed", "brains"]
```

Each item has a position number called an **index**. Indexes start at **0**, not 1!

| Index | `0`       | `1`       | `2`        |
| ----- | --------- | --------- | ---------- |
| Item  | `"power"` | `"speed"` | `"brains"` |

We access items inside the array using **square brackets** and the **index**, `array[index]`(js):

```js
console.log(statNames[0])        // "power"
```

> [!TIP]
> An array with 3 items has indexes `0`, `1` and `2`.

We can find out how many items are in an array using `array.length`(js):

```js
console.log(statNames.length)    // 3
```

> [!TIP]
> The **last** index is always `length - 1`(js).

We can add an item to the **end** of an array with `push(...)`(js):

```js
statNames.push("luck")
```

### Looping through an array

If we just want **each item in turn**, we use `for...of`. Each lap, `statName` is the next item:

```js run
for (const statName of statNames) {
    console.log(statName)
}
```

If we also need the **position** of each item, we use the counting loop you already know:

```js run
for (let i = 0; i < statNames.length; i++) {
    console.log(`${i + 1}. ${statNames[i]}`)
}
```

> [!TIP]
> Start with `for...of`. Only switch to the counting loop when you really need the index `i`.


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
console.log(statNames[statNames.length])
console.log(statNames[statNames.length - 1])
```

</primm>

<primm title="Snippet 3" sub-title="">

```js
const items = ["sword", "key"]

items.push("bacon")

console.log(items.length)
console.log(items[2])
```

</primm>

<primm title="Snippet 4" sub-title="">

```js
const fruits = []

fruits.push("apple")
fruits.push("pear")

console.log(fruits.length)
console.log(fruits[1])
```

</primm>

<primm title="Snippet 5" sub-title="">

```js
const items = ["sword", "key", "bacon"]

for (const item of items) {
    console.log(item)
}
```

</primm>

<primm title="Snippet 6" sub-title="">

```js
const items = ["sword", "key", "bacon"]

for (let i = 0; i < items.length; i++) {
    console.log(`${i + 1}. ${items[i]}`)
}
```

</primm>

> [!NOTE]
> In Snippet 4, the array was made with `const`, but we still changed it! `const` stops us **replacing the whole array** with a different one, but we can still **add things to it**.


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

Which loop would you use to print a **numbered list**, like `1. red`, `2. green`...? Why?

    <response>

Which loop is **less likely to go wrong** (remember "Going Past the End")? Why?

    <response>


## **M**odify

### Bug Hunt

This program prints a playlist. It has **three bugs**. Run it, read the error messages, and fix them one at a time.

```js run
const playlist = ["Song A", "Song B", "Song C"]

console.log("Songs:", playlist.length())

for (let i = 1; i <= playlist.length; i++) {
    console.log(`${i}. ${playlist[i]}`)
}

playlist.push = "Song D"
console.log("Last song:", playlist[3])
```

1. <check> The program **crashes** with an error about `length`
2. <check> Once that's fixed, the list starts at `1. Song B`, and ends with `undefined`
3. <check> Once that's fixed, `Song D` is never added

> [!TIP]
> Is `length` something we **do** (a function), or something we **look at** (a variable)? And how do we **call** a function like `push`?

### Tinker

Here's a working playlist. Complete the tasks one at a time. Test after each change!

```js run
const playlist = ["Song A", "Song B", "Song C", "Song D"]

for (const song of playlist) {
    console.log(song)
}
```

Tasks:

1. <check> Add **two more songs** to the end, using `push`
2. <check> Print the **last** song, using `length`
3. <check> Print the list **numbered**, like `1. Song A`


## **M**ake

### My List

Make **a list of your own**: your favourite songs, games, foods, friends... anything you like.

Your program must have:

- <check> An **array** of **at least 6 items**
- <check> The items **printed**, in a numbered list
- <check> **Two more items** added with `push`, and the list printed again
- <check> The **number of items** and the **last item** printed

```js run
// Your list and code go here!

```

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                     | Hint                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Print the list **backwards**                                  | A counting loop that starts at `length - 1`(js) and counts down         |
| Find the **highest** number in an array of numbers            | A `let`(js) for the best so far, and an `if`(js) inside the loop        |
| **Remove** the last item                                      | `pop()`(js)                                                             |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does this code show?

    ```js
    const fruits = ["apple", "pear", "plum"]
    console.log(fruits[1])
    ```

    ---

    - [ ] `apple`
    - [x] `pear`
    - [ ] `plum`
    - [ ] `fruits`

- # An array has 8 items. What is the index of the **last** item?

    ---

    - [ ] `8`
    - [x] `7`
    - [ ] `9`
    - [ ] `1`

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
