# Lesson 1: Lists & Objects

So far our games have stored single values: a score, a number of lives, a timer. But a story is made of **lots** of lines of dialogue! In this lesson you'll learn two ways of storing lots of data, and use them to show a conversation on screen.

## Warm-Up

Try not to loop back at the previous lesson...

1. What is **game state**? Give two examples.

    <response>

2. What does `if (gameIsOver) { return }`(js) do at the top of a function?

    <response>

3. What does `get("hole")`(js) give us back?

    <response>


## Learning Goals

- <check> I can store a list of values in an **array**
- <check> I can get an item from an array using its **index**
- <check> I can group related values into an **object**
- <check> I can store a conversation as an **array of objects**
- <check> I can use an **index variable** to step through the lines of a conversation


## The Big Idea: **Arrays** and **Objects**

### Arrays: an ordered list

An **array** stores a list of values, in order. We write it with square brackets:

```js
const colours = ["red", "green", "blue"]
```

Each item has a position number called an **index**. Indexes start at **0**, not 1!

| Index | `0`     | `1`       | `2`      |
| ----- | ------- | --------- | -------- |
| Item  | `"red"` | `"green"` | `"blue"` |

```js
console.log(colours[0])        // "red"
console.log(colours.length)    // 3
```

> [!IMPORTANT]
> An array with 3 items has indexes `0`, `1` and `2`. The **last** index is always `length - 1`.

### Objects: a bundle of named values

An **object** groups related values together, each with a **name**. We write it with curly braces:

```js
const wizard = {
    name: "Shroomwick",
    level: 12,
    isWise: true,
}

console.log(wizard.name)       // "Shroomwick"
```

> [!NOTE]
> A JavaScript **object** is just a bundle of data. It's not the same as a Kaplay **game object**, which has a picture, a position, and so on. Think of it as a card with labelled fields.

### Both together

A conversation is a **list** of lines, and each line is an **object** with a speaker and some text. That's an **array of objects**:

```js
const dialogue = [
    { speaker: "Wizard", text: "Welcome to the Help Desk!" },
    { speaker: "You", text: "My computer is haunted." },
]

console.log(dialogue[1].speaker)     // "You"
```


## **P**redict then **R**un

For each snippet below, write what you think the code will show, then run it to see if your prediction was correct.

<primm title="Snippet 1" sub-title="">

```js
const colours = ["red", "green", "blue"]
console.log(colours[0])
console.log(colours[2])
```

</primm>

<primm title="Snippet 2" sub-title="">

```js
const colours = ["red", "green", "blue"]
console.log(colours.length)
console.log(colours[colours.length - 1])
```

</primm>

<primm title="Snippet 3" sub-title="">

```js
const wizard = { name: "Shroomwick", level: 12, isWise: true }
console.log(wizard.name)
console.log(wizard.level + 1)
```

</primm>

<primm title="Snippet 4" sub-title="">

```js
const line = { speaker: "Ghost", text: "Wooo!" }
console.log(`${line.speaker} says: ${line.text}`)
```

</primm>

<primm title="Snippet 5" sub-title="">

```js
const dialogue = [
    { speaker: "Wizard", text: "Welcome!" },
    { speaker: "You", text: "Hello!" },
]
console.log(dialogue[1].speaker)
console.log(dialogue[0].text)
```

</primm>

<primm title="Snippet 6" sub-title="">

```js
const colours = ["red", "green", "blue"]
console.log(colours[3])
```

</primm>


## **I**nvestigate

### Going Past the End

Step through the code below. What happens on the last line? What does this tell us about the end of an array?

```js trace header="false"
const lines = ["Hello", "How can I help?", "Goodbye"]
let lineIndex = 0

console.log(lines[lineIndex])
lineIndex = lineIndex + 1
console.log(lines[lineIndex])
lineIndex = lineIndex + 1
console.log(lines[lineIndex])
lineIndex = lineIndex + 1
console.log(lines[lineIndex])
```

<response placeholder="Observations...">

### Arrays or Objects?

When would you use an **array**, and when would you use an **object**? Think about a list of high scores versus the details of one character.

<response>

### A Conversation on Screen

Now let's put arrays of objects to work. Read this Kaplay program:

```js
kaplay({
    width: 600, height: 400,
    background: [30, 60, 90]
})

const dialogue = [
    { speaker: "Wizard", text: "Welcome to the Help Desk!" },
    { speaker: "You", text: "My computer is haunted." },
    { speaker: "Wizard", text: "Have you tried turning it off and on again?" },
]

let lineIndex = 0

const speakerLabel = add([
    text("", { size: 28 }),
    pos(40, 120),
    color(255, 220, 0),
])

const lineLabel = add([
    text("", { size: 24, width: 520 }),
    pos(40, 170),
])

add([
    text("Press SPACE", { size: 18 }),
    pos(40, 350),
    color(150, 170, 200),
])

function showLine() {
    speakerLabel.text = dialogue[lineIndex].speaker
    lineLabel.text = dialogue[lineIndex].text
}

showLine()

onKeyPress("space", () => {
    if (lineIndex < dialogue.length - 1) {
        lineIndex = lineIndex + 1
        showLine()
    }
})
```

What will the screen show **when the game starts**?

<response>

What will it show after you press **SPACE** twice?

<response>

What will happen when you press **SPACE** a **fourth** time?

<response>

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run it and see. Click inside the game first!

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 600, height: 400,
    background: [30, 60, 90]
})

const dialogue = [
    { speaker: "Wizard", text: "Welcome to the Help Desk!" },
    { speaker: "You", text: "My computer is haunted." },
    { speaker: "Wizard", text: "Have you tried turning it off and on again?" },
]

let lineIndex = 0

const speakerLabel = add([
    text("", { size: 28 }),
    pos(40, 120),
    color(255, 220, 0),
])

const lineLabel = add([
    text("", { size: 24, width: 520 }),
    pos(40, 170),
])

add([
    text("Press SPACE", { size: 18 }),
    pos(40, 350),
    color(150, 170, 200),
])

function showLine() {
    speakerLabel.text = dialogue[lineIndex].speaker
    lineLabel.text = dialogue[lineIndex].text
}

showLine()

onKeyPress("space", () => {
    if (lineIndex < dialogue.length - 1) {
        lineIndex = lineIndex + 1
        showLine()
    }
})
```

</web-playground>

### How It Works

1. Why is the `if` check `lineIndex < dialogue.length - 1`(js) rather than `lineIndex < dialogue.length`(js)?

    <response>

2. The `showLine()`(js) function is called in **two** places. Why is it better to have a function than to copy and paste the two lines of code?

    <response>

3. `lineIndex` is a piece of **game state**. What does it keep track of?

    <response>

### Advance the Dialogue

Put the lines in order so that pressing SPACE moves to the next line, shows it, and never goes past the end.

<drag-drop mode="code" title="Next Line, Please" sub-title="Move to the next line first, then show it">

1.
    ```js
    if (lineIndex < dialogue.length - 1) {
    ```

2.
    ```js
        lineIndex = lineIndex + 1
    ```

3.
    ```js
        showLine()
    ```

4.
    ```js
    }
    ```

</drag-drop>


## **M**odify

### Bug Hunt

This version of the program has a couple of bugs. Run it, press SPACE, and look at the **Console** if something goes wrong. Can you fix the following?

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 600, height: 400,
    background: [30, 60, 90]
})

const dialogue = [
    { speaker: "Wizard", text: "Welcome to the Help Desk!" },
    { speaker: "You", text: "My computer is haunted." },
    { speaker: "Wizard", text: "Have you tried turning it off and on again?" },
]

let lineIndex = 0

const speakerLabel = add([
    text("", { size: 28 }),
    pos(40, 120),
    color(255, 220, 0),
])

const lineLabel = add([
    text("", { size: 24, width: 520 }),
    pos(40, 170),
])

function showLine() {
    speakerLabel.text = dialogue[lineIndex].spaker
    lineLabel.text = dialogue[lineIndex].text
}

showLine()

onKeyPress("space", () => {
    if (lineIndex <= dialogue.length) {
        lineIndex = lineIndex + 1
        showLine()
    }
})
```

</web-playground>

1. <check> The **speaker's name** doesn't show properly
2. <check> The game **crashes** when you press SPACE on the last line (it should just stay on the last line)

> [!TIP]
> Property names have to match **exactly**, including spelling and capital letters.

### Tinker

Here's a working conversation. Complete the tasks one at a time. Test after each change!

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 600, height: 400,
    background: [30, 60, 90]
})

const dialogue = [
    { speaker: "Wizard", text: "Welcome to the Help Desk!" },
    { speaker: "You", text: "My computer is haunted." },
    { speaker: "Wizard", text: "Have you tried turning it off and on again?" },
]

let lineIndex = 0

const speakerLabel = add([
    text("", { size: 28 }),
    pos(40, 120),
    color(255, 220, 0),
])

const lineLabel = add([
    text("", { size: 24, width: 520 }),
    pos(40, 170),
])

const hintLabel = add([
    text("Press SPACE", { size: 18 }),
    pos(40, 350),
    color(150, 170, 200),
])

function showLine() {
    speakerLabel.text = dialogue[lineIndex].speaker
    lineLabel.text = dialogue[lineIndex].text
}

showLine()

onKeyPress("space", () => {
    if (lineIndex < dialogue.length - 1) {
        lineIndex = lineIndex + 1
        showLine()
    }
})
```

</web-playground>

Tasks:

1. <check> Add **three more lines** to the conversation
2. <check> Make the speaker's name **green** when it's `"You"`, and **yellow** for everyone else (hint: `speakerLabel.color = rgb(...)`(js) and an `if` in `showLine()`(js))
3. <check> When the **last line** is showing, change the hint text to `"The End"`
4. <check> Press the **left arrow** to go **back** a line (but never before the first line!)


## **M**ake

### Talk to the Wizard

Write your own conversation between **two or more characters**. Make it funny, spooky or silly. Our story will be about a wizard who runs a help desk, but it could be about anything!

Your program must have:

- <check> At least **6 lines** of dialogue, stored in an **array of objects**
- <check> At least **two different speakers**
- <check> SPACE moves to the next line, and **stops** at the end
- <check> Each speaker's name shown in a **different colour**

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
// Copy your code from the game above here
```

</web-playground>

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                         | Hint                                                         |
| ------------------------------------------------- | ------------------------------------------------------------ |
| Click the mouse to advance, as well as SPACE      | `onMousePress(() => { ... })`(js)                            |
| Show a **line counter**, like `3 / 6`             | A new label, `lineIndex + 1`(js) and `dialogue.length`(js)   |
| Show a **picture** for each speaker               | `loadSprite(...)`(js), `sprite(...)`(js) and an `if` in `showLine()`(js) |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does this code show?

    ```js
    const fruits = ["apple", "pear", "plum"]
    console.log(fruits[1])
    ```

    ---

    - [ ] `apple`
    - [x] `pear`
    - [ ] `plum`
    - [ ] `fruits`

- # How do you get the text `"Hi"` out of this object?

    ```js
    const line = { speaker: "Wizard", text: "Hi" }
    ```

    ---

    - [ ] `line[text]`
    - [ ] `text.line`
    - [x] `line.text`
    - [ ] `line.Hi`

- # An array has 5 items. What is the index of the **last** item?

    ---

    - [ ] `5`
    - [x] `4`
    - [ ] `6`
    - [ ] `1`

</quiz>
