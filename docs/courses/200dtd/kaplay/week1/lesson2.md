# Lesson 2: Choices and Repeats

Games are all about **decisions** ("is the player still alive?") and **repetition** ("do this for every enemy"). Today you'll learn how JS makes choices with `if` and repeats things with loops.

## Warm-up

Without looking at Lesson 1, answer in your notebook:

1. When would you use `let` instead of `const`?
2. What does `` `Level ${3 + 1}` `` show?
3. What are the three types of value we met last time?

## Learning goals

- [ ] I can make choices with `if`, `else if` and `else`
- [ ] I can compare values with `===`, `<`, `>=` and so on
- [ ] I can combine conditions with `&&` (and), `||` (or) and `!` (not)
- [ ] I can repeat code with `for` and `while` loops
- [ ] I can write a simple function

## Python vs JavaScript

| Idea | Python | JavaScript |
|---|---|---|
| Choices | `if x > 5:` / `elif` / `else:` | `if (x > 5) {` / `else if` / `else {` |
| Equal? | `==` | `===` |
| Not equal? | `!=` | `!==` |
| And / or / not | `and` / `or` / `not` | `&&` / `\|\|` / `!` |
| Counting loop | `for i in range(5):` | `for (let i = 0; i < 5; i++) {` |
| While loop | `while x > 0:` | `while (x > 0) {` |
| Blocks | Indentation | Curly braces `{ }` |
| Function | `def heal(hp):` | `function heal(hp) {` |

> **Tip:** In JS the indentation is just for humans. The `{ }` braces are what the computer reads. Keep your indentation tidy anyway!

---

## 1. Predict

Write your prediction for each snippet in your notebook.

**Snippet 1**

```js
const health = 0

if (health > 0) {
    console.log("Still fighting!")
} else {
    console.log("Game over")
}
```

**Snippet 2**

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

**Snippet 3**

```js
const answer = "42"
console.log(answer === 42)
console.log(answer === "42")
```

**Snippet 4**

```js
const hasKey = true
const doorIsLocked = true

if (hasKey && doorIsLocked) {
    console.log("Click! The door opens")
}
```

**Snippet 5**

```js
for (let i = 1; i <= 3; i++) {
    console.log(`Enemy ${i} appears`)
}
```

**Snippet 6**

```js
let lives = 3

while (lives > 0) {
    console.log(`Lives left: ${lives}`)
    lives = lives - 1
}
console.log("Game over")
```

## 2. Run

<web-playground data-height="26em">

```html id=base
<pre id="output"></pre>
```

```css id=base
body {
    margin: 0;
    padding: 0.75rem;
    background: #0f172a;
    color: #e2e8f0;
    font-family: monospace;
}
```

```js id=base
const outputBox = document.getElementById('output')
const asText = (item) => typeof item === 'object' ? JSON.stringify(item) : String(item)

console.log = (...items) => {
    outputBox.textContent += items.map(asText).join(' ') + '\n'
}

window.addEventListener('error', (event) => {
    outputBox.textContent += 'ERROR: ' + event.message + '\n'
})
```

```js depends=base
console.log("--- Snippet 1 ---")
const health = 0

if (health > 0) {
    console.log("Still fighting!")
} else {
    console.log("Game over")
}

console.log("--- Snippet 2 ---")
const score = 85

if (score >= 100) {
    console.log("Gold medal")
} else if (score >= 50) {
    console.log("Silver medal")
} else {
    console.log("Keep practising")
}

console.log("--- Snippet 3 ---")
const answer = "42"
console.log(answer === 42)
console.log(answer === "42")

console.log("--- Snippet 4 ---")
const hasKey = true
const doorIsLocked = true

if (hasKey && doorIsLocked) {
    console.log("Click! The door opens")
}

console.log("--- Snippet 5 ---")
for (let i = 1; i <= 3; i++) {
    console.log(`Enemy ${i} appears`)
}

console.log("--- Snippet 6 ---")
let lives = 3

while (lives > 0) {
    console.log(`Lives left: ${lives}`)
    lives = lives - 1
}
console.log("Game over")
```

</web-playground>

## 3. Investigate

### 3a. Anatomy of a `for` loop

```js
for (let i = 1; i <= 3; i++) {
    console.log(`Enemy ${i} appears`)
}
```

The brackets hold three parts, separated by semicolons:

| Part | Code | Meaning |
|---|---|---|
| Start | `let i = 1` | Make a counter that starts at 1 |
| Keep going while | `i <= 3` | Check this *before every lap* |
| After each lap | `i++` | Add 1 to the counter (same as `i = i + 1`) |

### 3b. Trace it

Be the computer! Fill in this table for the loop below.

```js
for (let i = 1; i <= 5; i++) {
    console.log(i * 10)
}
```

| Lap | Value of `i` | Is `i <= 5`? | What is printed? |
|---|---|---|---|
| 1 | 1 | yes | 10 |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |

### 3c. Questions

1. Why does Snippet 3 print `false` the first time?
2. In Snippet 6, what would happen if we **forgot** the line `lives = lives - 1`? (Don't run it! Explain it.)
3. `===` checks the value **and** the type. Why is that useful?
4. When would you use a `while` loop instead of a `for` loop?

> **Rule of thumb:** Use `===` and `!==` every time. Avoid `==`. It's too relaxed about types and causes surprises.

## 4. Parsons Problems

### 4a. Countdown

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

### 4b. Boss checker

Monster number `i` is checked like this: **legendary** if divisible by 15, otherwise **boss** if divisible by 3, otherwise **loot** if divisible by 5, otherwise **normal**.

<drag-drop mode="code" title="Who's Behind the Door?" sub-title="Does the order of the checks matter? Try it!">

1.
    ```js
    if (i % 15 === 0) {
        console.log(`Monster ${i}: LEGENDARY`)
    }
    ```

2.
    ```js
    else if (i % 3 === 0) {
        console.log(`Monster ${i}: Boss`)
    }
    ```

3.
    ```js
    else if (i % 5 === 0) {
        console.log(`Monster ${i}: Loot drop`)
    }
    ```

4.
    ```js
    else {
        console.log(`Monster ${i}: Normal`)
    }
    ```

</drag-drop>

> **Think about it:** What would go wrong if the `i % 3` check came *before* the `i % 15` check?

## 5. Modify

### 5a. Bug hunt

This code runs without crashing, but it does the **wrong thing**. Read what it's *supposed* to do, run it, and fix the two bugs.

*It should say the hero is defeated when health is 0, and then list **three** enemies.*

<web-playground data-height="18em">

```html id=base
<pre id="output"></pre>
```

```css id=base
body {
    margin: 0;
    padding: 0.75rem;
    background: #0f172a;
    color: #e2e8f0;
    font-family: monospace;
}
```

```js id=base
const outputBox = document.getElementById('output')
const asText = (item) => typeof item === 'object' ? JSON.stringify(item) : String(item)

console.log = (...items) => {
    outputBox.textContent += items.map(asText).join(' ') + '\n'
}

window.addEventListener('error', (event) => {
    outputBox.textContent += 'ERROR: ' + event.message + '\n'
})
```

```js depends=base
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

</web-playground>

### 5b. Functions

A **function** is a named chunk of code you can use again and again.

```js
function takeDamage(health, damage) {
    return health - damage
}

console.log(takeDamage(100, 35))
```

Try it, then:

1. Add a function called `heal` that adds to health
2. Make `takeDamage` return `0` instead of a negative number (hint: use `if`)

<web-playground data-height="18em">

```html id=base
<pre id="output"></pre>
```

```css id=base
body {
    margin: 0;
    padding: 0.75rem;
    background: #0f172a;
    color: #e2e8f0;
    font-family: monospace;
}
```

```js id=base
const outputBox = document.getElementById('output')
const asText = (item) => typeof item === 'object' ? JSON.stringify(item) : String(item)

console.log = (...items) => {
    outputBox.textContent += items.map(asText).join(' ') + '\n'
}

window.addEventListener('error', (event) => {
    outputBox.textContent += 'ERROR: ' + event.message + '\n'
})
```

```js depends=base
function takeDamage(health, damage) {
    return health - damage
}

console.log(takeDamage(100, 35))
console.log(takeDamage(20, 35))
```

</web-playground>

> **Sneak preview:** Kaplay uses functions all the time, often written in a shorter style called an **arrow function**: `() => { ... }`. It's a function without a name that Kaplay calls for us at the right moment. We'll use them from Lesson 3.

## 6. Make: Monster Parade

Write a program that loops through monsters numbered 1 to 20 and prints:

- `LEGENDARY` if the number is divisible by 15
- `Boss` if it's divisible by 3
- `Loot drop` if it's divisible by 5
- `Normal` otherwise

> **Hint:** `%` gives the remainder after dividing. `9 % 3` is `0`, so 9 is divisible by 3.

<web-playground data-height="20em">

```html id=base
<pre id="output"></pre>
```

```css id=base
body {
    margin: 0;
    padding: 0.75rem;
    background: #0f172a;
    color: #e2e8f0;
    font-family: monospace;
}
```

```js id=base
const outputBox = document.getElementById('output')
const asText = (item) => typeof item === 'object' ? JSON.stringify(item) : String(item)

console.log = (...items) => {
    outputBox.textContent += items.map(asText).join(' ') + '\n'
}

window.addEventListener('error', (event) => {
    outputBox.textContent += 'ERROR: ' + event.message + '\n'
})
```

```js depends=base
// Monster Parade: your code goes here

for (let i = 1; i <= 20; i++) {
    // TODO: use if / else if / else
}
```

</web-playground>

### Stretch challenges

- Count how many bosses you meet and print the total at the end (you'll need a `let`)
- Use a `while` loop to keep fighting a monster until its health reaches zero
- Wrap your parade in a function that takes the number of monsters as an input

---

## Exit ticket

1. Write an `if` statement that prints "Game over" when `lives` is `0`.
2. How many times does `for (let i = 0; i < 4; i++)` run its code?
3. Why is `===` better than `==`?
