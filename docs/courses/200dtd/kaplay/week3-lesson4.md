# Lesson 4: The Wizard's Help Desk

Time to put it all together! This week you've learned how to store a story as **data**, split a game into **scenes**, and make **choices** that matter. Today you'll turn your story into a polished game: **The Wizard's Help Desk**.

## Warm-Up

Try not to loop back at the previous lessons...

1. A story is an object called `story`, and the id of a node is stored in `nodeId`. How do you get the node?

    <response>

2. Why is `let trust = 0`(js) written **inside** the talk scene, not outside?

    <response>

3. What does `go("ending", { trust: 2 })`(js) do?

    <response>


## Learning Goals

- <check> I can split a game into **files**, and use `import` and `export`
- <check> I can keep my story **data** separate from my **code**
- <check> I can make text appear **one letter at a time**
- <check> I can show a **portrait** for each speaker
- <check> I can build a complete game from **several scenes**


## The Big Idea: **Files and Modules**

Our programs are getting long! Real programs are split into several **files**. In JavaScript, a file that shares code with other files is called a **module**.

For this game, each job gets its own file:

<filetree>

- kaplay-help-desk
    - assets
        - images
    - data
        - story.js
    - scenes
        - title.js
        - talk.js
        - ending.js
    - index.html
    - main.js

</filetree>

A file **shares** something with `export`, and another file **uses** it with `import`:

```js
// data/story.js
export const story = {
    start: { speaker: "Wizard", text: "Welcome!" },
}
```

```js
// scenes/talk.js
import { story } from "../data/story.js"

export function talkScene() {
    // we can use story in here!
}
```

```js
// main.js
import { talkScene } from "./scenes/talk.js"

scene("talk", talkScene)
```

| Part                | What it means                                            |
| ------------------- | -------------------------------------------------------- |
| `export`(js)        | Make this available to other files                       |
| `import { x } from "..."`(js) | Bring in `x` from another file                 |
| `./`                | Start in **this** folder                                 |
| `../`               | Go **up** one folder first                               |
| `.js`               | File names must include the **extension**                |

> [!IMPORTANT]
> Look closely at `scene("talk", talkScene)`(js). There are **no brackets** after `talkScene`. We're handing over the function itself, for Kaplay to run later. If we wrote `talkScene()`(js), we'd run it **now**. Remember `wait(2, destroy(balloon))`(js)?

Modules need two small changes to how the game runs:

1. In `index.html`, the script tag must say `type="module"`:

    ```html
    <script type="module" src="main.js"></script>
    ```

2. The game must be run with a **local web server** (like the live server) and not by double-clicking `index.html`.

### Matching

<drag-drop mode="code" title="What Does It Do?" sub-title="">

1.
    ```js
    export function talkScene() { ... }
    ```

2.
    ```js
    import { talkScene } from "./scenes/talk.js"
    ```

3.
    ```js
    scene("talk", talkScene)
    ```

4.
    ```js
    import { story } from "../data/story.js"
    ```

---

1. Share the talk scene with other files
2. Bring the talk scene into main.js, from the scenes folder
3. Register the scene, handing over the function itself
4. Bring the story into a scene file, from the data folder (one folder up)

</drag-drop>


## The Plan

In The Wizard's Help Desk, you visit a wizard who runs a very unusual IT support desk. The text appears one letter at a time, each speaker has a portrait, and your choices decide how the story ends. Play it a few times and find all **four endings**:

<web-playground data-height="38em" hide-all>

```html load=_assets/kaplay.html
```

```css load=_assets/kaplay.css
```

```js load=_assets/helpdesk.js
```

</web-playground>

> [!NOTE]
> You'll write **your own story**, using your Help Desk story from last lesson. The demo is just an example of what's possible!

Work through the steps below, **testing after every step**. Don't move on until the previous step works.


## Repo Setup

<github repo="waimea-dt/kaplay-starter" title="Kaplay Starter" subtitle="A repo to kick-off your Kaplay games">

1. Create a **new repo** from the **template** repo above
2. Name it **kaplay-help-desk**
3. **Clone** it to your computer
4. Open the repo in your **code editor**
5. Download [help-desk-skeleton.zip](_assets/help-desk-skeleton.zip ':ignore'), unzip it, and copy its files into your repo (replace `main.js`)
6. Edit `index.html` so that the script loads `main.js` as a **module**
7. Launch the **live server** to see the game running in a browser


## Step 1: Explore the Skeleton

The skeleton is a small working game. Play it, then **read each file**:

1. Which file registers the scenes? Which function starts the game?

    <response>

2. Where is the story kept? What else is in that file?

    <response>

3. Which scene shows the choice buttons?

    <response>

- <check> The game shows a title screen, then a short conversation, then an ending


## Step 2: Write Your Story

Replace the sample story in `data/story.js` with the story you wrote last lesson.

> [!TIP]
> - Keep the `export`(js) in front of `const story`(js)
> - Every `speaker` needs a picture! Add each one to the `portraits` object, and make sure that picture is loaded in `main.js`
> - The pictures are in the `assets/images` folder, loaded with `loadSprite(...)`(js)

- <check> Your story plays all the way through, using your characters


## Step 3: Trust and Endings

Make the story remember what the player did, just like last lesson:

> [!TIP]
> - Add `let trust = 0`(js) and `let hasCookie = false`(js) (or your own flags) **inside** `talkScene`(js)
> - In `showNode`(js), use `if`(js) to add each node's `trust`, and to set your flags
> - Write a `pickEnding()`(js) function, and call it when a choice leads to a `"verdict"` node
> - Remember to check the **most specific** rule first

- <check> Different choices lead to **at least three different endings**


## Step 4: The Typewriter

Let's make the text appear **one letter at a time**. First, a string method:

```js run
const line = "Wooo! That would be me."

console.log(line.slice(0, 1))
console.log(line.slice(0, 5))
console.log(line.slice(0, line.length))
```

1. What does `line.slice(0, 5)`(js) give us? What do the two numbers mean?

    <response>

2. How could we show the text one letter at a time using `slice`(js) and a counter?

    <response>

Here's the idea. Keep the **whole line** and a **count of letters shown** as state. A timer adds one to the count, and the label shows that many letters:

```js
let fullText = ""
let charCount = 0

loop(0.03, () => {
    if (charCount < fullText.length) {
        charCount = charCount + 1
        lineLabel.text = fullText.slice(0, charCount)
    }
})
```

Add this to your talk scene. Then, in `showNode`(js), instead of setting the label straight away, **start a new line**:

```js
fullText = currentNode.text
charCount = 0
lineLabel.text = ""
```

> [!IMPORTANT]
> The `loop(...)`(js) goes **once**, near the top of the scene, not inside `showNode`(js). Why? What would happen to the speed of the text if every node started **another** loop?

<response>

- <check> Text appears one letter at a time for every node
- <check> Pressing SPACE while text is appearing **finishes the line** straight away (hint: check `charCount < fullText.length`(js) at the top of your SPACE handler, and `return`(js))


## Step 5: Portraits

Show a **picture** of whoever is speaking. The `portraits` object is a **look-up**: give it a speaker's name, and it gives back the name of their picture:

```js
const portraits = {
    Wizard: "skull",
    Ghost: "ghost",
    You: "bean",
}

console.log(portraits["Ghost"])     // "ghost"
```

Add this to `showNode`(js), where the old portrait is removed and a new one is added:

```js
destroyAll("portrait")

add([
    sprite(portraits[currentNode.speaker]),
    pos(width() / 2, 120),
    anchor("center"),
    scale(3),
    "portrait",
])
```

> [!TIP]
> Don't forget `import { story, portraits } from "../data/story.js"`(js) at the top of `talk.js`!

- <check> Each speaker has the right portrait


## Step 6: Title and Ending

Finish off the game:

> [!TIP]
> - Change the title scene to show **your** game's name and a picture
> - Pass something to the ending scene, like `go("ending", { trust: trust })`(js)
> - In `ending.js`, change `endingScene()`(js) to `endingScene(data)`(js) and show what it was told
> - Make sure playing again **starts a fresh game**

- <check> The title screen has the name of your game
- <check> The ending screen shows something from the story
- <check> You can **play again** and the story starts fresh


## Playtest

Swap computers with a partner and play each other's game for a few minutes. Don't explain anything: just watch and listen!

Get your partner to note down some feedback for you:

1. Was the story **fun**? What was the best bit?

    <response>

2. Did the **choices** feel like they mattered?

    <response>

3. Did you spot any **bugs**, or anything confusing?

    <response>

4. What is **one improvement** you'd make?

    <response>

> [!IMPORTANT]
> Good feedback is **specific**. "It's boring" isn't helpful. "I couldn't tell which choice was the kind one" is!


## Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                          | Hint                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Choices only appear **after** the text has finished typing         | Create the buttons when `charCount` reaches `fullText.length`(js)         |
| Make buttons **change colour** when the mouse is over them         | `onHover("choiceButton", ...)`(js) and `onHoverEnd(...)`(js)              |
| A choice that only appears if the player **has the cookie**        | A `needsCookie: true`(js) property on the choice, and an `if` in the loop |
| Show the **trust score** on screen                                 | A new label, updated in `showNode`(js)                                    |
| A different **background colour** for each scene                   | `setBackground(rgb(...))`(js)                                             |


## Week 3 Check

Before you finish the week, answer these questions on your own.

<quiz>

- # What does this code show?

    ```js
    const dialogue = [
        { speaker: "Wizard", text: "Hi" },
        { speaker: "Ghost", text: "Boo" },
        { speaker: "You", text: "Eek" },
    ]
    console.log(dialogue[2].speaker)
    ```

    ---

    - [ ] `Ghost`
    - [ ] `Eek`
    - [x] `You`
    - [ ] `undefined`

- # What does this code show?

    ```js
    const story = { start: { text: "Hello" }, end: { text: "Bye" } }
    const nodeId = "end"
    console.log(story[nodeId].text)
    ```

    ---

    - [ ] `Hello`
    - [x] `Bye`
    - [ ] `end`
    - [ ] `undefined`

- # The talk scene calls `go("ending", { trust: 2 })`. How does the ending scene show the trust?

    ---

    - [ ] It can't
    - [ ] With `trust`
    - [x] The scene function takes `data`, and uses `data.trust`
    - [ ] With `go("trust")`

- # Why is `let trust = 0` written inside the talk scene's function?

    ---

    - [ ] Because it has to be a constant
    - [x] So it starts again from 0 every time the scene starts
    - [ ] So other scenes can see it
    - [ ] It makes the game faster

- # What does `export function talkScene() { ... }` do?

    ---

    - [ ] Runs the talk scene
    - [x] Makes `talkScene` available to be imported by other files
    - [ ] Deletes the function
    - [ ] Copies the function to a new file

- # `fullText` is `"Boo!"` and `charCount` is `2`. What is `fullText.slice(0, charCount)`?

    ---

    - [ ] `"Boo!"`
    - [ ] `"B"`
    - [x] `"Bo"`
    - [ ] `"oo"`

</quiz>


## Check Yourself

Before you finish the week, make sure you can say "yes" to all of these:

- <check> I can store a list in an **array** and a bundle of values in an **object**
- <check> I can build a game from several **scenes**, passing data between them
- <check> I can store a **story as data** and show choices from it
- <check> I can use **flags** like `trust` to change the ending
- <check> I can split a game into **files** with `import` and `export`
