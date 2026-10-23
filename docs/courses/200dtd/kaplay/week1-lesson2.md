# Lesson 2: Choices and Repeats

Games are all about **decisions** ("is the player still alive?") and **repetition** ("do this for every enemy"). Today you'll learn how JS makes choices with `if` and repeats things with loops.

## Warm-Up

Without looking at Lesson 1, answer the following:

1. When would you use `let` instead of `const`?

    <response>

2. What does `` `Level ${3 + 1}` ``(js) show?

    <response>

3. What are the three types of value we met last time?

    <response>


## Learning Goals

- <check> I can make **choices** / **decisions** with `if`, `else if` and `else`
- <check> I can **compare** values with `===`, `<`, `>=` and so on
- <check> I can **combine conditions** with `&&` (and), `||` (or) and `!` (not)
- <check> I can **repeat** code with `for` and `while` loops
- <check> I can write a simple **function**

## Python vs **JavaScript**

| Idea           | Python                                                 | JavaScript                                                |
| -------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| Choices        | `if x > 5:`(python) / `elif`(python) / `else:`(python) | `if (x > 5) {...}`(js) / `else if`(js) / `else {...}`(js) |
| Equal?         | `==`(python)                                           | `===`(js)                                                 |
| Not equal?     | `!=`(python)                                           | `!==`(js)                                                 |
| And / or / not | `and`(python) / `or`(python) / `not`(python)           | `&&`(js) / `\|\|`(js) / `!`(js)                           |
| Counting loop  | `for i in range(5):`(python)                           | `for (let i = 0; i < 5; i++) {...}`(js)                   |
| While loop     | `while x > 0:`(python)                                 | `while (x > 0) {...}`(js)                                |
| Blocks         | Indentation                                            | Curly braces `{...}`(js)                                  |
| Function       | `def heal(hp):`(python)                                | `function heal(hp) {...}`(js)                             |

> [!TIP]
> In JS the indentation is just for humans. The `{...}` braces are what the computer reads. Keep your indentation tidy anyway!




## **P**redict then **R**un

For each snippet, write what you think the code will do, then run it to check.

<primm title="Snippet 1" sub-title="Choose what the hero says">

```js
const health = 0

if (health > 0) {
    console.log("Still fighting!")
} else {
    console.log("Game over")
}
```

</primm>

<primm title="Snippet 2" sub-title="Find the medal for this score">

```js
const score = 85

if (score >= 100) {
    console.log("Gold medal")
} else if (score >= 50) {
    console.log("Silver medal")
} else {
    console.log("Keep practising")
}
```

</primm>

<primm title="Snippet 3" sub-title="Compare the value and its type">

```js
const answer = "42"
console.log(answer === 42)
console.log(answer === "42")
```

</primm>

<primm title="Snippet 4" sub-title="Check whether both conditions are true">

```js
const hasKey = true
const doorIsLocked = true

if (hasKey && doorIsLocked) {
    console.log("Click! The door opens")
}
```

</primm>

<primm title="Snippet 5" sub-title="Count three enemies">

```js
for (let i = 1; i <= 3; i++) {
    console.log(`Enemy ${i} appears`)
}
```

</primm>

<primm title="Snippet 6" sub-title="Watch the lives count down">

```js
let lives = 3

while (lives > 0) {
    console.log(`Lives left: ${lives}`)
    lives = lives - 1
}
console.log("Game over")
```

</primm>



## **I**nvestigate

### 1. Comparisons

Why does Snippet 3 print `false` the first time?

```js
const answer = "42"
console.log(answer === 42)
console.log(answer === "42")
```

<response>

### 2. Controlling Loops

In Snippet 6, what would happen if we **forgot** the line `lives = lives - 1`? (Don't run it! Explain it.)

```js
let lives = 3

while (lives > 0) {
    console.log(`Lives left: ${lives}`)
    lives = lives - 1
}
console.log("Game over")
```

<response>


### 3. Equality

`===` checks the value **and** the type. Why is that useful?

<response>

> [!TIP]
> Use `===` and `!==` every time. Avoid `==`. It's too relaxed about types and causes surprises.


### 4. Types of Loops

When would you use a `while` loop instead of a `for` loop?

<response>


### 5. Anatomy of a `for` Loop

```js
for (let i = 1; i <= 5; i++) {
    console.log(i)
}
```

The brackets hold three parts, separated by semicolons:

| Part             | Code            | Meaning                                        |
| ---------------- | --------------- | ---------------------------------------------- |
| Start            | `let i = 1`(js) | Make a counter that starts at 1                |
| Keep going while | `i <= 5`(js)    | Check this *before every lap*                  |
| After each lap   | `i++`(js)       | Add 1 to the counter (same as `i = i + 1`(js)) |


Be the computer! Fill in this table for the loop below (the first lap has been done for you):

```js
for (let i = 1; i <= 5; i++) {
    console.log(i)
}
```

| Lap | Value of `i`(js) | Is `i <= 5`(js)? | Output  |
| :-: | :--------------: | :--------------: | :-----: |
|  1  |        1         | <check checked>  |    1    |
|  2  |     <value>      |     <check>      | <value> |
|  3  |     <value>      |     <check>      | <value> |
|  4  |     <value>      |     <check>      | <value> |
|  5  |     <value>      |     <check>      | <value> |
|  6  |     <value>      |     <check>      | <value> |


### 6. Countdown

Put the lines in order so the program prints **Lives left: 3**, then **2**, then **1**, then **Game over**.

<drag-drop mode="code" title="Countdown to Game Over" sub-title="Watch the order of the last two lines inside the loop">

1.
    ```js
    let lives = 3
    ```

2.
    ```js
    while (lives > 0) {
    ```

3.
    ```js
        console.log(`Lives left: ${lives}`)
    ```

4.
    ```js
        lives = lives - 1
    ```

5.
    ```js
    }
    ```

6.
    ```js
    console.log("Game over")
    ```

</drag-drop>


### 7. Speeding Fine

This system issues fines for speeding in an urban **50kph** zone. The fines are as follows:
- **$500** if speed is **more than 75kph**
- **$100** if speed is **more than 60kph, up to 75kph**
- **warning** if speed is **more than 50kph, up to 60kph**
- **nothing** otherwise

<drag-drop mode="code" title="Speeding" sub-title="Does the order of the checks matter? Try it!">

1.
    ```js
    if (speed > 75) {
        console.log('$500 fine')
    }
    ```

2.
    ```js
    else if (speed > 60) {
        console.log('$100 fine')
    }
    ```

3.
    ```js
    else if (speed > 50) {
        console.log('Warning')
    }
    ```

4.
    ```js
    else {
        console.log('Ok')
    }
    ```

</drag-drop>

**Think about it**: What would go wrong if the `speed > 50`(js) check came *before* the `speed > 75`(js) check?

<response>



## **M**odify

### Bug Hunt

This code runs without crashing, but it does the **wrong thing**. Read what it's *supposed* to do, run it, and fix the two bugs.

*It should say the hero is defeated when health is 0, and then list **three** enemies.*

```js run
let health = 0

if (health = 0) {
    console.log("The hero is defeated!")
} else {
    console.log("The hero fights on!")
}

for (let i = 1; i < 3; i++) {
    console.log(`Enemy ${i}`)
}
```


### Functions

A **function** is a named chunk of code you can use again and again.

```js run
function takeDamage(health, damage) {
    const newHealth = health - damage
    return newHealth
}

let health = 100

health = takeDamage(health, 35)
console.log(health)

health = takeDamage(health, 75)
console.log(health)
```

Try it, then:

1. Add a function called `heal` that adds to health
2. Make `takeDamage` return `0` if health becomes negative (hint: use `if`)


> [!NOTE]
> Kaplay uses functions all the time, often written in a shorter style called an **arrow function**: `() => { ... }`(js). It's a function without a name that Kaplay calls for us at the right moment. We'll use them from Lesson 4.


## **M**ake

### Monster Parade

Write a program that loops through monsters numbered 1 to 20 and prints:

- `LEGENDARY` if the number is divisible by 15
- `Boss` if it's divisible by 3
- `Loot drop` if it's divisible by 5
- `Normal` otherwise

> [!TIP]
> `%` gives the remainder after dividing. `9 % 3` is `0`, so 9 is divisible by 3.

```js run
// Monster Parade: your code goes here

for (let i = 1; i <= 20; i++) {
    // TODO: use if / else if / else
}
```


### Stretch challenges

- Count how many bosses you meet and print the total at the end (you'll need a `let`)
- Use a `while` loop to keep fighting a monster until its health reaches zero
- Wrap your parade in a function that takes the number of monsters as an input




## Exit ticket

Without looking back, answer these three questions:

<quiz>

- # What will this code print?

    ```js
    const lives = 0
    if (lives === 0) {
        console.log("Game over")
    }
    ```

    ---

    - [x] `Game over`
    - [ ] `0`
    - [ ] Nothing
    - [ ] `Error`

- # How many times will this loop run?

    ```js
    for (let i = 0; i < 4; i++) {
        console.log(i)
    }
    ```

    ---

    - [ ] 3
    - [x] 4
    - [ ] 5
    - [ ] Forever

- # Why use `===` instead of `==`?

    ---

    - [x] It checks both value and type
    - [ ] It makes the code run faster
    - [ ] It changes a value
    - [ ] It checks only the type

</quiz>
