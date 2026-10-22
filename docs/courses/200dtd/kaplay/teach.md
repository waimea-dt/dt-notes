# Game Development with Kaplay


## Developing with JavaScript

<slides>

# JavaScript

It's not too different to Python!

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
| Changeable | `coins = 5`(js) | `let coins = 5`    |
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

