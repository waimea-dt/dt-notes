# Week 1: Things the Move


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

