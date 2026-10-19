# Lesson 1: Variables

<slides>

# Variables

---

## Today

- Declaring: `const` and `let`
- Types: Strings, numbers, booleans
- Showing: `console.log`
- Template literals

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

---

|            | Python          | JS                 |
| ---------- | --------------- | ------------------ |
| Changeable | `coins = 5`     | `let coins = 5`    |
| Fixed      | `MAX = 3`       | `const max = 3`    |
| Show       | `print(...)`    | `console.log(...)` |
| Comment    | `# Comment`     | `// Comment`       |
| Booleans   | `True`, `False` | `true`, `false`    |
| Names      | `my_score`      | `myScore`          |


---

### `let` for values that can change

```js
let health = 100           // can change

health = health - 25       // fine
```

---

### `const` for values that never change

```js
const heroName = "Pixel"   // can't change

heroName = "Nobody"        // CRASH!
```

---

### Start with `const`

### Switch to `let` only if you need to

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

---

## Template Literals

```js
const player = "Bean"
const score = 120

console.log(`${player} scored ${score} points`)
```

Backticks <kbd>`</kbd>, not apostrophes <kbd>'</kbd>!

---

## Predict!

Write your answers in your notebook.

```js
let coins = 5
coins = coins + 3
console.log(coins)
```

```js
const lives = 3
lives = 2
console.log(lives)
```

Note:
Give 2 minutes. Then pair-share. Then run snippets live. Worksheet has all six snippets.

---

## Now run it

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