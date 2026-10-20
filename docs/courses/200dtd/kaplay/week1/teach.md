# Week 1: Things the Move


<slides>

# Introduction

Note:
Starting with the basics of JavaScript and how data is stored in variables

---

### Python

```python
coins = 5
print(f"You have {coins} coins")
```

### JavaScript

```js
let coins = 5
console.log(`You have ${coins} coins`)
```

Note:
JavaScript is no different to Python - just some syntax differences

---

|            | Python          | JS                 |
| ---------- | --------------- | ------------------ |
| Changeable | `coins = 5`     | `let coins = 5`    |
| Fixed      | `MAX = 3`       | `const max = 3`    |
| Show       | `print(...)`    | `console.log(...)` |
| Comment    | `# Comment`     | `// Comment`       |
| Booleans   | `True`, `False` | `true`, `false`    |
| Names      | `my_score`      | `myScore`          |
| Blocks     | *Indentation*   | `{ ... }`          |

</slides>



<slides>

# Lesson 1: Variables

Note:
Starting with the basics of JavaScript and how data is stored in variables

---

## Learning

- **Declaring** variables: `const` and `let`
- Variable **types**: Strings, numbers, booleans
- **Displaying** variables: `console.log(...)` and **template literals**

---

## Declaring Variables

Declaring a variable = **creating** and **naming** it

JavaScript has *two* ways to do this...

---

### `let` for variables that **can change**

```js
let health = 100           // can change

health = health - 25       // fine
```

---

### `const` for constants that **can't change**

```js
const heroName = "Pixel"   // can't change

heroName = "Nobody"        // CRASH!
```

---

## Start with `const`

### Switch to `let` only if you need to

---

## Assigning Values

Assigning a value to a variable = **storing** data in it

We use the assignment operator: `=`

```js
let name = "Dave"   // Assign String 'Dave' to name
let age = 21        // Assign Number 21 to age
```

---

## Variable Types

| Type    | Example         |
| ------- | --------------- |
| String  | `"Pixel"`       |
| Number  | `120`, `3.5`    |
| Boolean | `true`, `false` |

```js
console.log(typeof 120)    // "number"
console.log(typeof "120")  // "string"
```

Note:
JS has very few primitive types

---

## Displaying Variable Values

Use `console.log(...)` to show values

```js
const name = "Pierre"

console.log(name)      // "Pierre"
```

---

## Template Literals

Can place variables within other text...

```js
const player = "Bean"
const score = 120

console.log(`${player} scored ${score} points`)
```

Note: **Backticks** <kbd>`</kbd>, not apostrophes <kbd>'</kbd>!

---

# PRIMM Tasks

**P**redict, **R**un, **I**nvestigate, **M**odify, **M**ake,

---

## Predict...


```js
let coins = 5
coins = coins + 3
console.log(`Coins: ${coins}`)
```

+++

## Run...

+++


```
Coins: 8
```

Note:
- What is this code going to do - be precise!
- Discuss in pairs


---

## Run...

```js run
let coins = 5
coins = coins + 3
console.log(`Coins: ${coins}`)
```

---

Open the Lesson 1 worksheet.

Do **Predict**, then **Run**, then **Investigate**.

Note:
Circulate. Look for students who predicted that Snippet 6 would print 2. Ask them to explain their thinking.

---

## Parsons Problem

Put the lines in order:

- `console.log(...)`
- `health = health - 25`
- `let health = 100`
- `const heroName = "Pixel"`

Note:
Do this live on the board first, then students try on the worksheet. The computer reads top to bottom.

---

## Bug hunt

```js
let score = 10
console.log(Score)
```

What does the error say?

Note:
ReferenceError: Score is not defined. Case sensitivity. Teach them to READ the red text.

---

## Your turn: character card

Make a card for your own game character.

- a string, a number, a boolean
- at least one `let`
- template literals

Note:
Make step. Pair up. Early finishers do the damage-over-three-hits stretch.

---

## Exit ticket

1. `const` vs `let`?
2. What does `` `Score: ${10 + 5}` `` show?
3. Is `"true"` the same as `true`?

Note:
Collect on paper or have them answer verbally on the way out. Use the answers to plan the lesson 2 starter.



</slides>