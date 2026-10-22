# Week 1: Things the Move


## Introduction

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


## Overview of PRIMM

<slides>

# PRIMM

### **P**redict, **R**un, **I**nvestigate, **M**odify, **M**ake

---

## **PRIMM** is a framework for learning programming

It is based on good research and evidence of effectiveness

---

## **P**redict...

Look at some existing code and **write a prediction** of what you think it will do

Note:
- Aims to reinforce reading and understanding code
- Reveals issues with learners early one
- Low risk - no ownership of code

---

## **P**redict...

```js
let coins = 5
coins = coins + 3
console.log(`Coins: ${coins}`)
```

+++

I predict this will... **show the number 8**

Note:
- What is this code going to do - be precise!
- Discuss in pairs

---

## **R**un...

**Run the code** your were looking at to see if it matches your predictions

Note:
- Validates mental model of code
- Code is supplied, so no risk of errors

---

## **R**un...

```js
let coins = 5
coins = coins + 3
console.log(`Coins: ${coins}`)
```

+++

`Coins: 8`

+++

Reflection... **The output showed the word 'Coins' too, not just the value 8**

Note:
- Matches prediction
- Exactly?!

---

## **I**nvestigate...

**Look deeper** into the code and how it works via various exercises

Note:
- Deepens understanding
- Acquire vocabulary

---

## **I**nvestigate...

|||

Trace this code...

```js
let hp = 100
hp = hp - 50 // Ouch!
console.log(hp)
hp = hp + 25 // Heal
console.log(hp)
```

|||

+++

| Line | `hp` | Output |
| :--: | :--: | :----: |
|  1   | 100  |  ---   |
|  2   |  50  |  ---   |
|  3   |  50  |   50   |
|  4   |  75  |  ---   |
|  5   |  75  |   75   |

|||

Note:
- Might also rearrange code into correct order, debug code, etc.

---

## **M**odify...

Make **changes** to some existing code: modify values, logic, etc.

Note:
- Safe, low-risk for students - not their code
- Shifts to being their code
- Grows confidence

---

## **M**odify...

Fix this bug...

```js run
let score = 10
console.log(Score)
```

Note:
- What does the error say?
- ReferenceError: Score is not defined
- Case sensitivity
- READ the red text!

---

## **M**ake

Create a **new program** from scratch using the knowledge you have gained

Note:
- Pair up...?
- Early finishers do stretch tasks

</slides>


## Lesson 1: JS vs Python, variables, etc.

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


</slides>



## Lesson 2:

<slides>

# Lesson 2:

</slides>




## Lesson 3:

<slides>

# Lesson 3:

</slides>




## Lesson 4:

<slides>

# Lesson 4:

</slides>




## Lesson 5:

<slides>

# Lesson 5:

</slides>

