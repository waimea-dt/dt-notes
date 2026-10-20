# Lesson 1: Variables

You already know Python. JavaScript (JS) is a different language, but many of the ideas are the same. Today you'll learn how JS stores information in **variables**.

## Learning Goals

- [ ] I can **declare** a variable with `const` and `let`
- [ ] I know three **types** of value: string, number and boolean
- [ ] I can **display** a value with `console.log`
- [ ] I can build a message with a **template literal**

## Python vs JavaScript

| Idea                               | Python                         | JavaScript                       |
| ---------------------------------- | ------------------------------ | -------------------------------- |
| Make a variable that can change    | `coins = 5`(python)                    | `let coins = 5`(js)                  |
| Make a variable that never changes | `MAX_LIVES = 3`(python) (just a habit) | `const maxLives = 3`(js) (enforced!) |
| Show something                     | `print(coins)`(python)                 | `console.log(coins)`(js)             |
| Message with values inside         | `f"You have {coins} coins"`(python)    | `` `You have ${coins} coins` ``(js)  |
| Comment                            | `# a comment`(python)                  | `// a comment`(js)                   |
| True and false                     | `True`(python) / `False`(python)               | `true`(js) / `false`(js)                 |
| Naming style                       | `player_score`(python)                 | `playerScore`(js)                    |

> [!TIP]
> The quotes around a template literal are **backticks** (`` ` ``), not apostrophes. The <kbd>`</kbd> key is usually above the <kbd>Tab</kbd> key at the top-left of your keyboard.



## Predict then Run

For each snippet below, write what you think the code will do, then run it to see if your prediction was correct.

<primm title="Snippet 1" sub-title="">

```js
const hero = "Pixel"
console.log(hero)
```

</primm>


<primm title="Snippet 2" sub-title="">

```js
let coins = 5
coins = coins + 3
console.log(coins)
```

</primm>

<primm title="Snippet 3" sub-title="">

```js
const level = 7
console.log("Level: " + level)
```

</primm>

<primm title="Snippet 4" sub-title="">

```js
const player = "Bean"
const score = 120
console.log(`${player} scored ${score} points`)
```

</primm>

<primm title="Snippet 5" sub-title="">

```js
const isAlive = true
console.log(isAlive)
console.log(typeof isAlive)
```

</primm>

<primm title="Snippet 6" sub-title="">

```js
const lives = 3
lives = 2
console.log(lives)
```

</primm>


## Investigate

### 1. Difference between `let` and `const`

Snippet 2 changed the value of `coins`. Snippet 6 tried to change `lives` and **crashed**. What's the difference between `let` and `const`?

```js run
let coins = 5
coins = coins + 3
console.log(coins)
```

```js run
const lives = 3
lives = 2
console.log(lives)
```

<textarea class="response" placeholder="Your answer..."></textarea>

> [!TIP]
> Start with `const`. Only switch to `let` if the value needs to change later.


### 2. When to use `let` and `const`

Which of these should be `const` and which should be `let`? Explain your choices.

| Variable for...               | `const`                 | `let`                   | Reason  |
| ----------------------------- | ----------------------- | ----------------------- | ------- |
| the name of your character    | <input type="checkbox"> | <input type="checkbox"> | <input placeholder="Explain..."> |
| the number of coins collected | <input type="checkbox"> | <input type="checkbox"> | <input placeholder="Explain..."> |
| the maximum number of lives   | <input type="checkbox"> | <input type="checkbox"> | <input placeholder="Explain..."> |
| whether the player is alive   | <input type="checkbox"> | <input type="checkbox"> | <input placeholder="Explain..."> |


### 3. String templates

In Snippet 4, what does `${player}` do?

```js
const player = "Bean"
const score = 120
console.log(`${player} scored ${score} points`)
```

<textarea class="response" placeholder="Your answer..."></textarea>


### 4. The `typeof` command

What does `typeof` tell us?

<textarea class="response" placeholder="Your answer..."></textarea>

Try it on a these different data values...

```js run
console.log(typeof "Kevin")
console.log(typeof 123)
console.log(typeof 3.14159)
console.log(typeof true)
```

### 5. Variable types

JS has no `int` or `str` labels like some languages. How does it know what type a value is?

<textarea class="response" placeholder="Your answer..."></textarea>

Can you explain the output of this code?

```js run
let name = "Eric"
let age = 13
let notes

console.log(typeof name)
console.log(typeof age)
console.log(typeof notes)
```

<textarea class="response" placeholder="Explain..."></textarea>


### 6. Program flow

Put these lines in the right order so the program shows `Pixel has 75 health`.

<drag-drop mode="code" title="Hero Health Check" sub-title="Declare the name before the health. The computer reads top to bottom.">

1.
    ```js
    const heroName = "Pixel"
    ```

2.
    ```js
    let health = 100
    ```

3.
    ```js
    health = health - 25
    ```

4.
    ```js
    console.log(`${heroName} has ${health} health`)
    ```

</drag-drop>


### 7. Trace the code

Step through the code below and see how the values of the variables change. Do you notice anything unusual or unexpected?

```js trace header="false"
let coins = 50
let name = "Jo"
let boss = false

coins = coins + 150
name = name + "an"
boss = true

console.log(coins)
console.log(name)
console.log(boss)
console.log(name + coins)
console.log(name - coins)
console.log(name * coins)
console.log(boss + coins)
console.log(boss - coins)
```

<textarea class="response" placeholder="Observations..."></textarea>


## Modify

### Bug Hunt

This code has **two bugs**. Run it, read the red error message, and fix them one at a time.


```js run
const monsterName = "Glitch"
let monsterHealth = 50

monsterHealth = monsterHealth - 20
console.log(`${monsterName} has ${MonsterHealth} health left`)

const attackPower = 10
attackPower = attackPower * 2
console.log(`Attack power is now ${attackPower}`)
```

> [!IMPORTANT]
> JS cares about capital letters. `score` and `Score` are different variables!


### Tinker

Change the code below so that it:

1. Uses your own hero name
2. Gives the hero a different amount of gold
3. Shows a **fourth** stat of your choice

```js run
const heroName = "Pixel"
const heroLevel = 3
let gold = 40

gold = gold + 15

console.log(`Hero: ${heroName}`)
console.log(`Level: ${heroLevel}`)
console.log(`Gold: ${gold}`)
```


## Make

**Design a character card for a game character of your own.**

Your program must:

- [ ] use `const` for things that never change
- [ ] use `let` for at least one thing that changes
- [ ] include a **string**, a **number** and a **boolean**
- [ ] print the card using template literals


```js run
// Your character card goes here!

```


### Stretch challenge

Your character starts with 100 health and gets hit three times for 35 damage each. Print their health **after each hit**. What happens to the health? Should it be allowed to go below zero? (We'll fix that in Lesson 2!)




## Exit ticket

Without looking back, answer these three questions:

<quiz>

- # What's the output of this code?

    ```js
    const age = 15
    age = age + 1
    console.log(age)
    ```

    ---

    - [x] `Error`
    - [ ] `16`
    - [ ] `15`
    - [ ] `age`

- # What will this code show?

    ```js
    console.log(`Score: ${10 + 5}`)
    ```

    ---

    - [ ] `15`
    - [x] `Score: 15`
    - [ ] `Score: ${10 + 5}`
    - [ ] `Score: 105`

- # The values `"true"`(js) (with quotes) and `true`(js)...

    ---

    - [ ] They are the same value
    - [ ] The computer treats them the same
    - [x] The first is a string, the second a boolean
    - [ ] The first is a boolean, the second a string

</quiz>
