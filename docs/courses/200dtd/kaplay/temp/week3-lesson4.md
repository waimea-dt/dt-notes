# Lesson 4: Creature Clash

This week you've learned how to store lots of information as **data**, and how to split a game into **scenes**. Today there's no recipe to follow: you're going to **design and build your own card battle game**, with your own deck, your own stats, and your own rules.

## Warm-Up

Try not to loop back at the previous lessons...

1. What's the difference between an **array** and an **object**?

    <response>

2. How does a scene receive data passed with `go("results", { wins: 3 })`(js)?

    <response>

3. In `playerCard[statName]`(js), why do we use square brackets instead of a dot?

    <response>


## Learning Goals

- <check> I can design a game around **data**: a deck of cards and their stats
- <check> I can build a game from **several scenes**, passing data between them
- <check> I can **change the rules** of a game by changing a little code
- <check> I can **balance** a game by testing it and adjusting the **numbers**
- <check> I can explain which parts of my game are **data** and which are **code**


## The Brief

Design and build a **card battle game** of your own. It could be creatures, fruit, dungeon treasure, teachers, programming languages... anything that has stats you can compare.

Here's one made with the creatures from the starter project. Yours should look and play differently!

<web-playground data-height="38em" hide-all>

```html load=_assets/kaplay.html
```

```css load=_assets/kaplay.css
```

```js load=_assets/clash-mini.js
```

</web-playground>

### Your Game Must Have

- <check> A **theme** of your own, with a name for your game
- <check> A deck of **at least 8 cards**, with pictures from the starter project
- <check> **At least 3 stats** of your own, with names that fit your theme
- <check> **Three scenes**: a title, the battle, and the results
- <check> **At least 3 rounds**, with a score passed to the results scene
- <check> **One rule twist** of your own, explained on screen

> [!IMPORTANT]
> Make something **you** would want to play! Your cards, your stats and your rules are your own choices. The numbers on your cards are what make the game fair... or deliciously unfair!


## Plan First

Before you write any code, plan your game. Write your answers below, then **show your teacher** before you start building.

1. What's your **theme** and what's your game called?

    <response>

2. What are your **stats** (3 to 5)? Why do they suit your theme?

    <response>

3. What are your **8 or more cards**? List each name, its picture and its stats.

    <response>

4. What's your **rule twist**? How will it change a round?

    <response>

5. What will each of your **scenes** show?

    <response>

- <check> My plan has been looked at by my teacher


## Repo Setup

<github repo="waimea-dt/kaplay-starter" title="Kaplay Starter" subtitle="A repo to kick-off your Kaplay games">

1. Create a **new repo** from the **template** repo above
2. Name it after your game
3. **Clone** it to your computer
4. Open the repo in your **code editor**
5. Launch the **live server** to see the game running in a browser
6. Look in the `assets/images` folder to see the pictures you can use for your cards

You'll need to draw your cards on screen. That code is provided for you: copy it into your `main.js`, below your deck. It needs `statNames` and `deck` to exist above it.

```js
// Card drawing helpers for your card battle game
//
// These need two things to be defined ABOVE them in your code:
//   statNames: the list of stat names, such as ["speed", "power"]
//   deck: your array of cards (each card needs a name, an image and a value for every stat)
//
// The card is drawn 260 wide by 350 tall, so it suits a game that is 800 by 600.
// A stat is clickable on a card if you pass true for isPlayer.

// Draws a face-up card at x. If isPlayer is true, the stat rows can be clicked
function drawCard(card, x, isPlayer, chosenStat) {
    add([
        rect(260, 350, { radius: 14 }),
        pos(x, 70),
        color(240, 235, 220),
        outline(4, rgb(31, 16, 42)),
        "card",
    ])

    add([
        text(card.name, { size: 28 }),
        pos(x + 130, 98),
        anchor("center"),
        color(31, 16, 42),
        "card",
    ])

    add([
        sprite(card.image),
        pos(x + 130, 175),
        anchor("center"),
        scale(2),
        "card",
    ])

    for (let i = 0; i < statNames.length; i++) {
        const statName = statNames[i]

        let rowColour = rgb(205, 198, 180)
        if (statName === chosenStat) {
            rowColour = rgb(255, 220, 0)
        }

        const row = add([
            rect(220, 32, { radius: 6 }),
            pos(x + 20, 240 + i * 42),
            color(rowColour),
            area(),
            "statRow",
            "card",
            { statName: statName, isPlayer: isPlayer },
        ])

        row.add([
            text(statName, { size: 20 }),
            pos(12, 16),
            anchor("left"),
            color(31, 16, 42),
        ])

        row.add([
            text(`${card[statName]}`, { size: 20 }),
            pos(208, 16),
            anchor("right"),
            color(31, 16, 42),
        ])
    }
}

// Draws a face-down card at x
function drawCardBack(x) {
    add([
        rect(260, 350, { radius: 14 }),
        pos(x, 70),
        color(100, 70, 140),
        outline(4, rgb(31, 16, 42)),
        "card",
    ])

    add([
        text("?", { size: 120 }),
        pos(x + 130, 245),
        anchor("center"),
        "card",
    ])
}
```

> [!NOTE]
> Everything else is up to you. You've already written all of the pieces in the last three lessons: the deck (Lesson 1), the scenes (Lesson 2), and the battle (Lesson 3). Use your notes and the earlier lessons for reference.


## Build

Work through these checkpoints, **testing as you go**. Show your teacher when you reach each one.

1. <check> **Checkpoint 1: Your deck.** Your cards and stats are in your code, and one of your cards is drawn on screen
2. <check> **Checkpoint 2: The battle.** Two cards are dealt, you pick a stat, and the winner is decided
3. <check> **Checkpoint 3: The whole game.** The title, battle and results scenes all work, and you can **play again**
4. <check> **Checkpoint 4: Your twist.** Your rule twist works and is explained to the player

> [!TIP]
> Stuck? Think about **where** the problem is. Is it a problem with your **data** (a typo in a card, a missing stat)? Or with your **code**? Check the **Console** for errors. Property names have to match **exactly**, and every card needs a value for **every** stat.


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
| Keep a **high score** that lasts until you refresh the page        | A `let highScore = 0`(js) **outside** the scenes                                |
| Add **sounds** for wins and losses                                 | `loadSound(...)`(js) and `play(...)`(js), using `beep` and `boop`               |
| Make stat rows **change colour** when the mouse is over them       | `onHover("statRow", ...)`(js) and `onHoverEnd(...)`(js)                         |
| A **card gallery** scene, like Lesson 2, to browse the deck        | A `gallery` scene, thumbnails made with a loop, and `go(...)`(js) with data     |
| Let the **computer pick the stat** on alternate rounds             | A boolean flag for whose turn it is, and `choose(statNames)`(js)                |
| A **different ending** for different scores                        | `if`(js) / `else if`(js) in the results scene, using `data.wins`(js)            |


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
    const card = { name: "Cat", speed: 8, power: 4 }
    const stat = "power"
    console.log(card[stat])
    ```

    ---

    - [ ] `power`
    - [ ] `8`
    - [x] `4`
    - [ ] `undefined`

- # The battle scene calls `go("results", { wins: 3, rounds: 5 })`. How does the results scene show the wins?

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

- # Why does this game use a `canPick` flag?

    ---

    - [ ] To make the cards pretty
    - [x] To stop the player picking a stat twice in one round
    - [ ] To count the rounds
    - [ ] To choose random cards

- # Which of these is **data**, rather than code?

    ---

    - [ ] `while (computerCard === playerCard) { ... }`
    - [ ] `go("results", { wins: wins })`
    - [x] `{ name: "Cat", image: "cat", speed: 8, power: 4 }`
    - [ ] `onClick("statRow", (row) => { ... })`

</quiz>


## Check Yourself

Before you finish the week, make sure you can say "yes" to all of these:

- <check> I can store a list in an **array** and a bundle of values in an **object**
- <check> I can look up a property using a **variable**, with square brackets
- <check> I can build a game from several **scenes**, passing data between them
- <check> I know where a variable can be **seen**: inside a scene or outside
- <check> I can change how a game plays by changing its **data**
