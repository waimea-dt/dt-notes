# Week 1: Things that Move


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



## Lesson 2: Choices & Repeats

<slides>

# Lesson 2: Choices & Repeats

Note:
Games are all about decisions ("is the player still alive?") and repetition ("do this for every enemy")

---

## Learning

- **Choices**: `if` / `else if` / `else`
- **Comparing** values and **combining** conditions
- **Repeating** code with `for` and `while` loops
- Writing simple **functions**

---

## Making Choices

```js
const health = 0

if (health > 0) {
    console.log("Still fighting!")
} else {
    console.log("Game over")
}
```

Note:
- No colon, no indentation rule: curly braces instead
- Keep the indentation tidy anyway

---

## Comparing

| Question    | JavaScript   |
| ----------- | ------------ |
| Equal?      | `===`        |
| Not equal?  | `!==`        |
| Bigger?     | `>`  `>=`    |
| Smaller?    | `<`  `<=`    |
| And / Or / Not | `&&`  `\|\|`  `!` |

Note:
- Always use === and !==, never ==
- "42" === 42 is false: the types differ

---

## Careful!

```js
if (health = 0) {   // Oops!
```

**One** `=` **sets** a value

**Three** `===` **asks** a question

Note:
The classic bug. They will hit it in the bug hunt

---

## Loops: `for`

```js
for (let i = 1; i <= 3; i++) {
    console.log(`Enemy ${i} appears`)
}
```

1. **Start:** `let i = 1`
2. **Keep going while:** `i <= 3`
3. **After each lap:** `i++`

Note:
Compare with `for i in range(1, 4)` in Python

---

## Loops: `while`

```js
let lives = 3

while (lives > 0) {
    console.log(`Lives left: ${lives}`)
    lives = lives - 1
}
```

Note:
- Use when you don't know how many laps in advance
- What if we forgot the last line? (infinite loop!)

---

## Functions

```js
function takeDamage(health, damage) {
    return health - damage
}

console.log(takeDamage(100, 35))
```

Note:
Brief intro only. Arrow functions `() => { ... }` appear in Lesson 4 and Kaplay uses them everywhere

---

## Make: Monster Parade

Loop through monsters 1 to 20...

- Divisible by 15: **LEGENDARY**
- Divisible by 3: **Boss**
- Divisible by 5: **Loot drop**
- Otherwise: **Normal**

Note:
Hint at % (remainder). Early finishers count the bosses

</slides>



## Lesson 3: Hello, Kaplay

<slides>

# Lesson 3: Hello, Kaplay

Note:
First Kaplay lesson: pictures at last! Keep the theory short and get them tinkering

---

## Learning

- Starting a game with `kaplay()`
- Screen **coordinates**
- **Objects** and **components**: `add([...])`
- Loading and showing **sprites**
- Adding lots of objects with a **loop**

---

## What is Kaplay?

A JavaScript **library** for making 2D games

You describe **what** you want

Kaplay takes care of **how**

---

## Objects & Components

```js
add([
    rect(60, 60),        // 60 by 60 rectangle
    pos(100, 100),       // at x=100, y=100
    color(0, 200, 120),  // green
])
```

A **list of components** describing one game object

Note:
Character sheet analogy: pick the traits you want

---

## Where is (0, 0)?

```
(0,0) ----------> x
  |
  |
  v
  y
```

**Top-left**. And `y` goes **down**!

Note:
Contrast with maths graphs. Mention width() and height()

---

## Predict!

```js
add([
    rect(60, 60),
    pos(100, 100),
    color(0, 200, 120),
])

add([
    circle(30),
    pos(300, 400),
    color(255, 100, 100),
])
```

Where do they appear?

Note:
Rectangle anchored at top-left, circle at its centre

---

## Sprites

```js
loadSprite("ghost", "assets/images/ghost.png")

add([
    sprite("ghost"),
    pos(40, 40),
    anchor("center"),
])
```

**Load** first, **use** second

---

## Loops + `add`

```js
for (let i = 0; i < 10; i++) {
    add([
        sprite("ghost"),
        pos(50, 50 + i * 45),
        anchor("center"),
    ])
}
```

What is the `y` of the **third** ghost?

Note:
Trace i = 0, 1, 2 on the board: 50, 95, 140

---

## Make: Ghost Parade

Pick a pattern and use a **loop**

Row, column, diagonal, rainbow, grid...

</slides>



## Lesson 4: Moving Things

<slides>

# Lesson 4: Moving Things

Note:
Prototype day: Wander is their first finished game. Aim to start Make by about 35 minutes in

---

## Learning

- Responding to **key presses**
- **Moving** objects
- The **game loop** and `onUpdate`
- Storing **speed** in a variable

---

## The Game Loop

About **60 times a second**...

1. **Check inputs**: keys, mouse
2. **Update things**: speeds, positions, collisions
3. **Draw the screen**

Note:
Flipbook analogy. Each lap is one frame

---

## Event Handlers

| Function       | Runs                          |
| -------------- | ----------------------------- |
| `onUpdate`     | every frame, always           |
| `onKeyDown`    | every frame while key is held |
| `onKeyPress`   | once, when first pressed      |
| `onKeyRelease` | once, when released           |

Note:
Which one for walking? Which for jumping or shooting (later)?

---

## Predict!

```js
const playerSpeed = 240

const player = add([
    sprite("bean"),
    pos(50, 250),
    anchor("center"),
])

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})
```

What if you hold right for two seconds?

Note:
Remind them to click inside the game first so it can hear the keyboard

---

## Arrow Functions

```js
onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})
```

`() => { ... }` means...

*"Kaplay, run this when it's time"*

---

## Frames and Speed

`move()` uses **pixels per second**

Speed 240 and 60 frames a second...

240 / 60 = **4 pixels per frame**

Note:
Fill in the first few rows of the trace table together

---

## Make: Wander

- Player moves with the keyboard
- Mushrooms scattered at random
- Mushrooms vanish when touched
- A row of ghosts watches on...

Note:
Show the distance check, and explain tags. Students use the starter repo

---

## Touching?

```js
onUpdate("mushroom", (mushroom) => {
    if (player.pos.dist(mushroom.pos) < 30) {
        destroy(mushroom)
    }
})
```

Runs for **every mushroom**, **every frame**

Note:
Pythagoras: dist is the straight-line gap between two points. Real collisions come in a later week

</slides>
