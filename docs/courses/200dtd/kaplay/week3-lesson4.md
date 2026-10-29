# Lesson 4: Creature Clash

This week you've learned to store lots of data, show it in a UI, and deal cards from a deck. Now it's time to turn all of that into a **game**: a card battle called **Creature Clash**!

First we'll learn how to split a game into **scenes** (a title screen, the game, a results screen). Then you'll take the card battle code, plug in **your own deck**, add the scenes, and put your own **twist** on the rules.

## Warm-Up

Try not to look back at the previous lessons...

1. How do you show a card from the `deck` array at index `i`, in a card view called `cardView`?

    <response>

2. What does `choose(deck)`(js) do?

    <response>

3. What does this code give us, if `card` is `{ power: 4, speed: 8 }`?

    ```js
    let total = 0
    for (const statName of ["power", "speed"]) {
        total += card[statName]
    }
    ```

    <response>


## Learning Goals

- <check> I can define **scenes** with `scene(...)`(js) and switch between them with `go(...)`(js)
- <check> I can **pass data** from one scene to the next
- <check> I can explain where a variable can be **seen**, inside or outside a scene
- <check> I can read and understand a **longer program** made of parts I know
- <check> I can adapt a game to use **my own data**, and add my own rule


## The Big Idea: **Scenes**

A game needs more than one screen: a **title** screen, the **game** itself, a **results** screen... A **scene** is one screen of your game, with its own objects and its own code. You **define** scenes, then **go** to them:

| Function                                    | What it does                                               |
| ------------------------------------------- | ---------------------------------------------------------- |
| `scene("name", () => { ... })`(js)          | **Defines** a scene. The code inside runs when we go there |
| `go("name")`(js)                            | **Switches** to a scene                                    |
| `go("name", { score: 10 })`(js)             | Switches to a scene and **passes it some data**            |
| `scene("name", (data) => { ... })`(js)      | A scene that **receives** the data                         |

<sequence animated="true">

1. ### <i data-lucide="play"></i> Title
    - Name of the game
    - **Press SPACE** to start

2. ### <i data-lucide="swords"></i> Battle
    - The game itself
    - Runs for a number of rounds

3. ### <i data-lucide="flag"></i> Results
    - Shows **how it went**
    - **Press SPACE** to play again

</sequence>

When Kaplay switches scene, it **throws away everything** from the old scene: all of its objects, its event handlers (like `onKeyPress`) and its timers. Then it runs the code of the new scene from the top.

> [!IMPORTANT]
> A scene doesn't start until you `go(...)`(js) to it. Always finish your program with a `go(...)`(js) to your first scene.


## **P**redict

Here's a small three-scene game, to test your understanding of scenes. Read it carefully:

```js
kaplay({
    width: 600, height: 400,
    background: [30, 60, 90]
})

scene("title", () => {
    add([
        text("Click Counter", { size: 56 }),
        pos(width() / 2, 150),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 24 }),
        pos(width() / 2, 240),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("game")
    })
})

scene("game", () => {
    let clicks = 0

    add([
        text("Click as fast as you can!", { size: 24 }),
        pos(width() / 2, 80),
        anchor("center"),
    ])

    const clickLabel = add([
        text("Clicks: 0", { size: 48 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    onMousePress(() => {
        clicks = clicks + 1
        clickLabel.text = `Clicks: ${clicks}`
    })

    wait(5, () => {
        go("results", { clicks: clicks })
    })
})

scene("results", (data) => {
    add([
        text("Time's up!", { size: 56 }),
        pos(width() / 2, 130),
        anchor("center"),
    ])

    add([
        text(`You clicked ${data.clicks} times`, { size: 32 }),
        pos(width() / 2, 220),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 24 }),
        pos(width() / 2, 300),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")
```

What does the game show when it **starts**?

<response>

What happens when you press SPACE, and what happens after **5 seconds**?

<response>

Say you click 8 times, and then press SPACE to **play again**. After you click **once** in the new game, what will the label say: `Clicks: 1` or `Clicks: 9`? Why?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run it, and play it twice. Compare it with your predictions - any differences?

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

scene("title", () => {
    add([
        text("Click Counter", { size: 56 }),
        pos(width() / 2, 150),
        anchor("center"),
    ])

    add([
        text("Press SPACE to start", { size: 24 }),
        pos(width() / 2, 240),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("game")
    })
})

scene("game", () => {
    let clicks = 0

    add([
        text("Click as fast as you can!", { size: 24 }),
        pos(width() / 2, 80),
        anchor("center"),
    ])

    const clickLabel = add([
        text("Clicks: 0", { size: 48 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    onMousePress(() => {
        clicks = clicks + 1
        clickLabel.text = `Clicks: ${clicks}`
    })

    wait(5, () => {
        go("results", { clicks: clicks })
    })
})

scene("results", (data) => {
    add([
        text("Time's up!", { size: 56 }),
        pos(width() / 2, 130),
        anchor("center"),
    ])

    add([
        text(`You clicked ${data.clicks} times`, { size: 32 }),
        pos(width() / 2, 220),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 24 }),
        pos(width() / 2, 300),
        anchor("center"),
        color(255, 220, 0),
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

`clicks` is declared **inside** the game scene. Try moving the line `let clicks = 0`(js) to the **top** of the program, **outside** all of the scenes, then play the game twice.

1. What changes?

    <response>

2. Why does it change? (Hint: when does the code inside a scene run?)

    <response>

> [!TIP]
> A variable made **inside** a scene is created fresh every time the scene starts, and can't be seen by other scenes. A variable made **outside** all scenes can be seen by every scene, and **keeps its value** when scenes change. To send a value to just the next scene, pass it with `go(...)`(js).

### Passing Data

1. What is `{ clicks: clicks }`(js) in the call `go("results", { clicks: clicks })`(js)?

    <response>

2. How does the results scene get hold of the number of clicks?

    <response>

3. What do you think would happen if we changed the call to just `go("results")`(js)? Try it!

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
    go("game")
    ```

3.
    ```js
    go("results", { clicks: 8 })
    ```

4.
    ```js
    scene("results", (data) => { ... })
    ```

---

1. Define a scene called title
2. Switch to the game scene
3. Switch to the results scene, passing it some data
4. A scene that receives some data

</drag-drop>


## The Card Battle

Now for the game. Below is the **card battle**, on a **single screen**. It doesn't have any scenes yet, and it ends with a message instead of a results screen. That's **your job**!

But first, read it. You've seen almost all of it before: the deck and `createCardView(x, y)`(js) from last lesson are at the top, and the dealing code comes from the dealer.

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js load=_assets/battle-start.js
```

</web-playground>

Play a few games, reading the code as you go. Then answer these questions:

1. Which parts of this code did you write in Lessons 1 to 3?

    <response>

2. What do `computerView.hidden = true`(js) and `computerView.hidden = false`(js) do? Why is the computer's card hidden at first?

    <response>

3. `canPick`(js) is a **boolean** flag. What does it stop the player doing? (Remember `gameIsOver` from Week 2.)

    <response>

4. The stat buttons are made with a loop, and each gets `{ statName: statNames[i] }`(js). Where does `button.statName`(js) get used? Why does this loop use the counting kind of loop, not `for...of`?

    <response>

5. How does `playerCard[button.statName]`(js) work? What is it, if `button.statName`(js) is `"speed"`?

    <response>

6. What happens after the last round? What's **missing** from a proper ending?

    <response>


## **M**odify

### Repo Setup

<github repo="waimea-dt/kaplay-starter" title="Kaplay Starter" subtitle="A repo to kick-off your Kaplay games">

1. Create a **new repo** from the **template** repo above
2. Name it after your game
3. **Clone** it to your computer
4. Open the repo in your **code editor**
5. Launch the **live server** to see the game running in a browser

Your `main.js` needs three things, **in this order**:

1. Your code from Lesson 3: the `kaplay(...)`(js) setup, `statNames`(js), your **deck**, the sprite loading, and `createCardView(x, y)`(js)
2. A line `const totalRounds = 5`(js)
3. The battle code below

```js
let round = 1
let wins = 0
let canPick = true
let playerCard = choose(deck)
let computerCard = choose(deck)

const playerView = createCardView(60, 50)
const computerView = createCardView(440, 50)

const infoLabel = add([
    text("", { size: 24 }),
    pos(30, 10),
])

const messageLabel = add([
    text("", { size: 28 }),
    pos(width() / 2, 570),
    anchor("center"),
])

function dealCards() {
    playerCard = choose(deck)
    computerCard = choose(deck)
    while (computerCard === playerCard) {
        computerCard = choose(deck)
    }

    playerView.show(playerCard)
    computerView.hidden = true

    infoLabel.text = `Round ${round} of ${totalRounds}     Wins: ${wins}`
    messageLabel.text = "Pick a stat!"
    canPick = true
}

for (let i = 0; i < statNames.length; i++) {
    const button = add([
        rect(200, 50, { radius: 8 }),
        pos(70 + i * 230, 495),
        color(60, 90, 140),
        area(),
        "statButton",
        { statName: statNames[i] },
    ])

    button.add([
        text(statNames[i], { size: 24 }),
        pos(100, 25),
        anchor("center"),
    ])
}

onClick("statButton", (button) => {
    if (!canPick) {
        return
    }
    canPick = false

    computerView.show(computerCard)
    computerView.hidden = false

    const playerValue = playerCard[button.statName]
    const computerValue = computerCard[button.statName]

    if (playerValue > computerValue) {
        wins = wins + 1
        messageLabel.text = `You win! ${playerValue} beats ${computerValue}`
    } else if (playerValue < computerValue) {
        messageLabel.text = `You lose! ${computerValue} beats ${playerValue}`
    } else {
        messageLabel.text = `A draw! Both are ${playerValue}`
    }

    wait(2.5, () => {
        if (round === totalRounds) {
            messageLabel.text = `Game over! You won ${wins} of ${totalRounds} rounds`
        } else {
            round = round + 1
            dealCards()
        }
    })
})

dealCards()
```

### Step 1: Get It Running

Paste the code in and **play it**, with your own deck.

> [!TIP]
> The battle code makes one button for each stat. If you have more than 3 stats, the buttons might not fit. Change the **width** of the buttons and the **gap** between them (the `200` and `230` values).

- <check> The game runs with **your own deck**, and plays all the way through


### Step 2: A Battle Scene

Wrap the game in a **battle scene**:

> [!TIP]
> - Wrap the battle code (everything **after** `createCardView`(js) and `totalRounds`(js)) in `scene("battle", () => { ... })`(js)
> - End your program with `go("battle")`(js)
> - The deck and `createCardView`(js) stay **outside** the scene. Why? (Hint: what is created fresh every time a scene starts?)

- <check> The game still plays all the way through, now inside a scene


### Step 3: A Title Scene

Add a `title` scene, that comes **before** the battle:

> [!TIP]
> - Show the **name** of your game, and a message to press SPACE
> - Add a picture or two (use `sprite(...)`(js) with an image from your deck)
> - Pressing SPACE goes to the battle scene
> - The program should now **start** at the title scene

- <check> The game starts with your title, and SPACE starts the battle


### Step 4: A Results Scene

Add a `results` scene, that comes **after** the battle:

> [!TIP]
> - At the end of the last round, **go** to the results scene instead of showing the message. Pass it the number of wins: `go("results", { wins: wins })`(js)
> - Show the wins, and the number of rounds, using the data passed in
> - SPACE goes back to the title scene
> - Check that playing again **starts fresh**: where are `round`(js) and `wins`(js) declared?

- <check> The results scene shows the wins, and you can **play again**


## **M**ake

### Your Twist

The game works... but is it **yours** yet? Make these changes:

- <check> **One rule twist** of your own invention, **explained on screen** (see ideas below)
- <check> A **title** and **results** screen that suit your **theme**: your own words, pictures and a different message for different scores
- <check> A **balanced** deck: play it a lot, and change the **numbers** until no card is too good or too weak

> [!TIP]
> Some rule twist ideas, or invent your own:
> - **Double points** for winning on one particular stat
> - **Lowest wins** for one stat (like a race, where the smaller time is better)
> - A **streak bonus** for winning two rounds in a row
> - A draw gives a point to **both** sides
> - The computer sometimes **cheats** (hint: `chance(0.2)`(js))

## Playtest and Balance

Swap computers with a partner and play each other's game a few times. Don't explain anything: just watch and listen!

Get your partner to note down some feedback for you:

1. Was the game **fun**? What was the best bit?

    <response>

2. Is any card **too good** (it wins almost every time) or **too weak**?

    <response>

3. Did you spot any **bugs**, or anything confusing?

    <response>

4. What is **one improvement** you'd make?

    <response>

> [!IMPORTANT]
> **Balancing** a game means changing its **numbers** until it plays fairly. If one card wins too often, you don't need new code: change the **data** and test again!

Now make your improvements. Which changes were **data** changes, and which were **code** changes?

<response>


## Level Up

Finished early? Pick **at least one** that sounds fun. Or invent your own!

| Challenge                                                          | Hint                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Keep a **high score** that lasts until you refresh the page        | A `let highScore = 0`(js) **outside** the scenes, updated in the results scene  |
| Add **sounds** for wins and losses                                 | `loadSound(...)`(js) and `play(...)`(js), using `beep` and `boop`               |
| Colour the message **green** for a win and **red** for a loss      | `messageLabel.color = rgb(...)`(js)                                             |
| Make the stat buttons **change colour** when the mouse is over them | `onHover("statButton", ...)`(js) and `onHoverEnd(...)`(js)                     |
| Let the computer **pick the stat** on alternate rounds             | A boolean flag for whose turn it is, and `choose(statNames)`(js)                |


## Week 3 Check

Before you finish the week, answer these questions on your own.

<quiz>

- # What does this code show?

    ```js
    const deck = [
        { name: "Cat", speed: 8 },
        { name: "Fish", speed: 7 },
        { name: "Ghost", speed: 5 },
    ]
    console.log(deck[2].name)
    ```

    ---

    - [ ] `Fish`
    - [x] `Ghost`
    - [ ] `5`
    - [ ] `undefined`

- # What does this code show?

    ```js
    const card = { power: 4, speed: 8, brains: 5 }
    let total = 0

    for (const statName of ["power", "speed", "brains"]) {
        total += card[statName]
    }

    console.log(total)
    ```

    ---

    - [ ] `4`
    - [ ] `8`
    - [x] `17`
    - [ ] `undefined`

- # The battle scene calls `go("results", { wins: 3 })`. How does the results scene show the wins?

    ---

    - [ ] With `wins`
    - [ ] It can't
    - [x] The scene function takes `data`, and uses `data.wins`
    - [ ] With `go("wins")`

- # A variable is declared **inside** the battle scene. Which scenes can use it?

    ---

    - [ ] All of them
    - [x] Only the battle scene
    - [ ] Only the title scene
    - [ ] Only the results scene

- # What does `cardView.show(card)` do?

    ---

    - [ ] Creates a new card view
    - [x] Updates the existing card view to show `card`
    - [ ] Deletes the card
    - [ ] Moves the card

- # Which of these is **data**, rather than code?

    ---

    - [ ] `while (computerCard === playerCard) { ... }`
    - [ ] `go("results", { wins: wins })`
    - [x] `{ name: "Cat", image: "cat", power: 4, speed: 8, brains: 5 }`
    - [ ] `onClick("statButton", (button) => { ... })`

</quiz>


## Check Yourself

Before you finish the week, make sure you can say "yes" to all of these:

- <check> I can store a list in an **array** and a bundle of values in an **object**
- <check> I can loop through an array with `for...of`
- <check> I can build a **UI** that can show any item of data
- <check> I can build a game from several **scenes**, passing data between them
- <check> I can change how a game plays by changing its **data**
