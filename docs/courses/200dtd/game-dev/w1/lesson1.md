# Lesson 1: Variables

You already know Python. JavaScript (JS) is a different language, but many of the ideas are the same. Today you'll learn how JS stores information in **variables**.

## Learning goals

- [ ] I can make a variable with `const` and `let`
- [ ] I know three types of value: string, number and boolean
- [ ] I can show a value with `console.log`
- [ ] I can build a message with a template literal

## Python vs JavaScript

| Idea                               | Python                         | JavaScript                       |
| ---------------------------------- | ------------------------------ | -------------------------------- |
| Make a variable that can change    | `coins = 5`                    | `let coins = 5`                  |
| Make a variable that never changes | `MAX_LIVES = 3` (just a habit) | `const maxLives = 3` (enforced!) |
| Show something                     | `print(coins)`                 | `console.log(coins)`             |
| Message with values inside         | `f"You have {coins} coins"`    | `` `You have ${coins} coins` ``  |
| Comment                            | `# a comment`                  | `// a comment`                   |
| True and false                     | `True` / `False`               | `true` / `false`                 |
| Naming style                       | `player_score`                 | `playerScore`                    |

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

Answer these in your notebook.

1. Snippet 2 changed the value of `coins`. Snippet 6 tried to change `lives` and **crashed**. What's the difference between `let` and `const`?

2. Which of these should be `const` and which should be `let`? Explain your choices.
    - the name of your character
    - the number of coins you've collected
    - the maximum number of lives
    - whether the player is alive

3. In Snippet 4, what does `${player}` do?

4. What does `typeof` tell us? Try it on a string, a number and a boolean.

5. JS has no `int` or `str` labels like some languages. How does it know what type a value is?

Here are the three types you'll use the most:

| Type    | Example        | Used for                               |
| ------- | -------------- | -------------------------------------- |
| String  | `"Pixel"`      | Names, messages, anything in quotes    |
| Number  | `120` or `3.5` | Scores, positions, speeds              |
| Boolean | `true`         | Yes/no questions: is the player alive? |

> [!TIP]
> Start with `const`. Only switch to `let` if the value needs to change later.

## Re-Order

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

> [!EXAMPLE]
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

---

## Exit ticket

Without looking back, answer these three questions:

1. What's the difference between `const` and `let`?

2. What will `` console.log(`Score: ${10 + 5}`) `` show?

3. Is `"true"` (with quotes) the same type as `true`? Why or why not?
