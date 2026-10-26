# Lesson 2: Scenes

Last lesson you showed a conversation on screen. But a real game needs more than one screen: a **title** screen, the **game** itself, an **ending**... In this lesson you'll learn how Kaplay lets you build a game out of separate **scenes**.

## Warm-Up

Try not to loop back at the previous lesson...

1. An array has 4 items. What is the index of the **last** one?

    <response>

2. How would you get the `speaker` from `dialogue[2]`(js)?

    <response>

3. What does this code do?

    ```js
    lineIndex = lineIndex + 1
    ```

    <response>


## Learning Goals

- <check> I can define a **scene** with `scene(...)`(js)
- <check> I can switch scenes with `go(...)`(js)
- <check> I can **pass data** from one scene to the next
- <check> I can explain what happens to **objects** and **variables** when the scene changes
- <check> I can build a game with a **title**, a **game** and an **ending**


## The Big Idea: **Scenes**

A **scene** is one screen of your game, with its own objects and its own code. You **define** scenes, then **go** to them:

| Function                                    | What it does                                           |
| ------------------------------------------- | ------------------------------------------------------ |
| `scene("name", () => { ... })`(js)          | **Defines** a scene. The code inside runs when we go there |
| `go("name")`(js)                            | **Switches** to a scene                                |
| `go("name", { score: 10 })`(js)             | Switches to a scene and **passes it some data**        |
| `scene("name", (data) => { ... })`(js)      | A scene that **receives** the data                     |

<sequence animated="true">

1. ### <i data-lucide="play"></i> Title
    - Name of the game
    - **Press SPACE** to start

2. ### <i data-lucide="messages-square"></i> Talk
    - The conversation
    - Runs until the **last line**

3. ### <i data-lucide="flag"></i> Ending
    - Shows **how it went**
    - **Press SPACE** to play again

</sequence>

When Kaplay switches scene, it **throws away everything** from the old scene: all of its objects, its event handlers (like `onKeyPress`) and its timers. Then it runs the code of the new scene from the top.

> [!IMPORTANT]
> A scene doesn't start until you `go(...)`(js) to it. Always finish your program with a `go(...)`(js) to your first scene.


## **P**redict

Look at this Kaplay program with three scenes:

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

scene("title", () => {
    add([
        text("The Wizard's Help Desk", { size: 36 }),
        pos(width() / 2, 160),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 20 }),
        pos(width() / 2, 240),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("talk")
    })
})

scene("talk", () => {
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
        speakerLabel.text = dialogue[lineIndex].speaker
        lineLabel.text = dialogue[lineIndex].text
    }

    showLine()

    onKeyPress("space", () => {
        if (lineIndex < dialogue.length - 1) {
            lineIndex = lineIndex + 1
            showLine()
        } else {
            go("ending", { lines: dialogue.length })
        }
    })
})

scene("ending", (data) => {
    add([
        text("The End", { size: 48 }),
        pos(width() / 2, 140),
        anchor("center"),
    ])

    add([
        text(`You read ${data.lines} lines`, { size: 24 }),
        pos(width() / 2, 210),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 20 }),
        pos(width() / 2, 280),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")
```

What does the game show when it **starts**?

<response>

What do you think the **ending** screen will say?

<response>

After you press SPACE to **play again** and reach the talk scene a second time, which line will you see first? The first line, or the last? Why?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run the game and play it all the way through, twice. Compare it with your predictions - any differences?

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

scene("title", () => {
    add([
        text("The Wizard's Help Desk", { size: 36 }),
        pos(width() / 2, 160),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 20 }),
        pos(width() / 2, 240),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("talk")
    })
})

scene("talk", () => {
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
        speakerLabel.text = dialogue[lineIndex].speaker
        lineLabel.text = dialogue[lineIndex].text
    }

    showLine()

    onKeyPress("space", () => {
        if (lineIndex < dialogue.length - 1) {
            lineIndex = lineIndex + 1
            showLine()
        } else {
            go("ending", { lines: dialogue.length })
        }
    })
})

scene("ending", (data) => {
    add([
        text("The End", { size: 48 }),
        pos(width() / 2, 140),
        anchor("center"),
    ])

    add([
        text(`You read ${data.lines} lines`, { size: 24 }),
        pos(width() / 2, 210),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 20 }),
        pos(width() / 2, 280),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")
```

</web-playground>


## **I**nvestigate

### Where Variables Live

In the **talk** scene, `let lineIndex = 0`(js) is written **inside** the scene's function. Move that line to **above** the `scene("talk", ...)`(js) line, so it's **outside** any scene, then play the game twice.

1. What changes? 

    <response>

2. Why does it change? (Hint: when does the code inside a scene run?)

    <response>

> [!TIP]
> A variable made **inside** a scene is created fresh every time the scene starts. A variable made **outside** all scenes is created once, and **keeps its value** when scenes change.

### Passing Data

1. In the talk scene we call `go("ending", { lines: dialogue.length })`(js). What is the object `{ lines: dialogue.length }`(js)?

    <response>

2. In the ending scene, how does the code get hold of that number?

    <response>

3. What would the ending say if we changed the call to `go("ending", { lines: 99 })`(js)?

    <response>

### Starting the Game

What do you think would happen if you **deleted** the last line of the program, `go("title")`(js)? Try it!

<response>

### Matching

Match each piece of code to what it does.

<drag-drop mode="code" title="What Does It Do?" sub-title="">

1.
    ```js
    scene("title", () => { ... })
    ```

2.
    ```js
    go("talk")
    ```

3.
    ```js
    go("ending", { lines: 5 })
    ```

4.
    ```js
    scene("ending", (data) => { ... })
    ```

---

1. Define a scene called title
2. Switch to the talk scene
3. Switch to the ending scene, passing it some data
4. A scene that receives some data

</drag-drop>


## **M**odify

### Bug Hunt

This three-scene game has some bugs. Play it, and check the **Console** if something goes wrong. Can you fix the following?

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

scene("title", () => {
    add([
        text("The Wizard's Help Desk", { size: 36 }),
        pos(width() / 2, 160),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 20 }),
        pos(width() / 2, 240),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("Talk")
    })
})

scene("talk", () => {
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
        speakerLabel.text = dialogue[lineIndex].speaker
        lineLabel.text = dialogue[lineIndex].text
    }

    showLine()

    onKeyPress("space", () => {
        if (lineIndex < dialogue.length - 1) {
            lineIndex = lineIndex + 1
            showLine()
        } else {
            go("ending", dialogue.length)
        }
    })
})

scene("ending", (data) => {
    add([
        text("The End", { size: 48 }),
        pos(width() / 2, 140),
        anchor("center"),
    ])

    add([
        text(`You read ${data.lines} lines`, { size: 24 }),
        pos(width() / 2, 210),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 20 }),
        pos(width() / 2, 280),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")
```

</web-playground>

1. <check> Pressing SPACE on the title screen **does nothing** (and there's an error)
2. <check> The ending says **"You read undefined lines"**
3. <check> Playing a **second time** starts on the **last line** of the conversation

> [!TIP]
> Scene names have to match **exactly**. And data passed to a scene needs to be an **object**, with a **name** for each value.

### Tinker

Using the working game from the **Run** step above, complete the tasks one at a time:

1. <check> Give each scene a different **background colour** (hint: `setBackground(rgb(...))`(js) at the top of each scene)
2. <check> Make the **mouse click** advance the conversation, as well as SPACE (hint: `onMousePress(() => { ... })`(js))
3. <check> Pass **more data** to the ending, such as the speaker of the last line, and show it


## **M**ake

### Three-Scene Story

Turn your conversation from last lesson into a proper game with three scenes.

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
// Copy your conversation code from last lesson here, then split it into scenes
```

</web-playground>

Your game must have:

- <check> A **title** scene with the name of your game and a "press SPACE" message
- <check> A **talk** scene with **at least 6 lines** of dialogue
- <check> An **ending** scene that shows something it was **told by the talk scene**
- <check> Pressing SPACE on the ending takes you **back to the title**
- <check> Playing again always **starts at the first line**

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                  | Hint                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| A **credits** scene after the ending                       | Another `scene(...)`(js) and `go(...)`(js)                            |
| Wait a second **before** the ending appears                | `wait(1, () => { go("ending") })`(js)                                 |
| Make the title text **flash**                              | `loop(...)`(js) and the `opacity(...)`(js) component                  |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does `go("talk")` do?

    ---

    - [ ] Defines a scene called talk
    - [x] Switches to the scene called talk
    - [ ] Makes a character talk
    - [ ] Starts the game

- # The talk scene calls `go("ending", { mood: "happy" })`. How does the ending scene get the mood?

    ---

    - [ ] It can't
    - [ ] `mood` is available everywhere
    - [x] The scene function is written as `(data) => { ... }` and uses `data.mood`
    - [ ] By calling `go("mood")`

- # A variable is declared **inside** a scene's function. What happens to it when you leave and return to that scene?

    ---

    - [ ] It keeps its old value
    - [x] It is created again from scratch
    - [ ] It's deleted forever
    - [ ] It turns into a constant

</quiz>
