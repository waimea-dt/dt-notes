# Lesson 3: Card Battle

You have a deck of cards, and you can move between scenes. Now let's make the cards **fight**! In this lesson you'll build the battle: deal two cards, compare a stat, and keep score over several rounds.

## Warm-Up

Try not to loop back at the previous lessons...

1. How do you pass a card to the next scene?

    <response>

2. A variable is declared inside one scene. Can another scene use it?

    <response>

3. If `statName`(js) is `"power"`, what does `card[statName]`(js) give us?

    <response>


## Learning Goals

- <check> I can pick **random cards** from a deck
- <check> I can **compare** two cards using a stat chosen by the player
- <check> I can use a **flag** to stop the player acting twice in a round
- <check> I can track **rounds** and a **score**
- <check> I can pass the result to a **results scene**


## The Big Idea: **Data Does the Work**

Look at how little code a battle needs, once the data is in the right shape. Each round:

1. **Deal** two different random cards
2. The player **picks a stat**
3. We **compare** that stat on the two cards, with `if`
4. The winner scores, and we move to the **next round**

The comparison is just a lookup with a variable, like in Lesson 1:

```js
const playerValue = playerCard[statName]
const computerValue = computerCard[statName]

if (playerValue > computerValue) {
    // the player wins!
}
```

And we already know about picking at random from Week 2:

```js
const playerCard = choose(deck)
```

> [!NOTE]
> The deck, and the functions that draw the cards on screen (`drawCard(...)`(js) and `drawCardBack(...)`(js)), are already done for you in the code below. The game is **800 by 600**, and the deck has 8 creature cards, with four stats each: `speed`, `power`, `cuteness` and `spookiness`.


## **P**redict

Here's the **battle** scene. Read it carefully. It's the longest piece of code so far, but you've seen all of the parts before!

```js
scene("battle", () => {
    let round = 1
    let wins = 0
    let canPick = true
    let playerCard = choose(deck)
    let computerCard = choose(deck)

    const infoLabel = add([
        text("", { size: 24 }),
        pos(30, 20),
    ])

    const messageLabel = add([
        text("", { size: 28 }),
        pos(width() / 2, 480),
        anchor("center"),
    ])

    function dealCards() {
        playerCard = choose(deck)
        computerCard = choose(deck)

        while (computerCard === playerCard) {
            computerCard = choose(deck)
        }

        destroyAll("card")
        drawCard(playerCard, 70, true)
        drawCardBack(470)

        infoLabel.text = `Round ${round} of ${totalRounds}     Wins: ${wins}`
        messageLabel.text = "Pick a stat!"
        canPick = true
    }

    onClick("statRow", (row) => {
        if (!canPick || !row.isPlayer) {
            return
        }
        canPick = false

        const playerValue = playerCard[row.statName]
        const computerValue = computerCard[row.statName]

        destroyAll("card")
        drawCard(playerCard, 70, true, row.statName)
        drawCard(computerCard, 470, false, row.statName)

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
                go("results", { wins: wins, rounds: totalRounds })
            } else {
                round = round + 1
                dealCards()
            }
        })
    })

    dealCards()
})
```

When a round starts, what does the screen show? Which card is face-up, and which is face-down?

<response>

You click `power`. Your card's power is **4** and the computer's is **6**. What does the message say, and what happens to `wins`?

<response>

What happens after the **fifth** round? Where does the information about the score go?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```

```js id=kaplay
kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

// The stats that every card has
const statNames = ["speed", "power", "cuteness", "spookiness"]

// The deck: one object for each card
const deck = [
    { name: "Cat", image: "cat", speed: 8, power: 4, cuteness: 9, spookiness: 2 },
    { name: "Elephant", image: "elephant", speed: 3, power: 10, cuteness: 7, spookiness: 1 },
    { name: "Fish", image: "fish", speed: 7, power: 2, cuteness: 5, spookiness: 2 },
    { name: "Beetle", image: "beetle", speed: 4, power: 5, cuteness: 3, spookiness: 6 },
    { name: "Butterfly", image: "butterfly", speed: 6, power: 1, cuteness: 8, spookiness: 1 },
    { name: "Ghost", image: "ghost", speed: 5, power: 3, cuteness: 4, spookiness: 10 },
    { name: "Mushroom", image: "mushroom", speed: 1, power: 2, cuteness: 6, spookiness: 5 },
    { name: "Skull", image: "skull", speed: 2, power: 6, cuteness: 1, spookiness: 9 },
]

// Load every picture named in the deck
for (let i = 0; i < deck.length; i++) {
    loadSprite(deck[i].image, `assets/images/${deck[i].image}.png`)
}

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

</web-playground>

Run the game and play it through a couple of times. Compare it with your predictions - any differences?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
const totalRounds = 5

scene("title", () => {
    add([
        text("Creature Clash", { size: 64 }),
        pos(width() / 2, 220),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play", { size: 26 }),
        pos(width() / 2, 330),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("battle")
    })
})

scene("battle", () => {
    let round = 1
    let wins = 0
    let canPick = true
    let playerCard = choose(deck)
    let computerCard = choose(deck)

    const infoLabel = add([
        text("", { size: 24 }),
        pos(30, 20),
    ])

    const messageLabel = add([
        text("", { size: 28 }),
        pos(width() / 2, 480),
        anchor("center"),
    ])

    function dealCards() {
        playerCard = choose(deck)
        computerCard = choose(deck)

        while (computerCard === playerCard) {
            computerCard = choose(deck)
        }

        destroyAll("card")
        drawCard(playerCard, 70, true)
        drawCardBack(470)

        infoLabel.text = `Round ${round} of ${totalRounds}     Wins: ${wins}`
        messageLabel.text = "Pick a stat!"
        canPick = true
    }

    onClick("statRow", (row) => {
        if (!canPick || !row.isPlayer) {
            return
        }
        canPick = false

        const playerValue = playerCard[row.statName]
        const computerValue = computerCard[row.statName]

        destroyAll("card")
        drawCard(playerCard, 70, true, row.statName)
        drawCard(computerCard, 470, false, row.statName)

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
                go("results", { wins: wins, rounds: totalRounds })
            } else {
                round = round + 1
                dealCards()
            }
        })
    })

    dealCards()
})

scene("results", (data) => {
    add([
        text("Game Over", { size: 64 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    add([
        text(`You won ${data.wins} of ${data.rounds} rounds`, { size: 32 }),
        pos(width() / 2, 300),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 24 }),
        pos(width() / 2, 400),
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

### Comparing Cards

Here's the comparison from the battle, with two cards in the console. Predict what it will show, then run it:

```js run
const cat = { name: "Cat", speed: 8, power: 4 }
const elephant = { name: "Elephant", speed: 3, power: 10 }
const statName = "power"

console.log(cat[statName])
console.log(elephant[statName])
console.log(cat[statName] > elephant[statName])
```

Change `statName` to `"speed"` and run it again. Who wins now?

<response>

### How It Works

1. What is the `while`(js) loop in `dealCards()`(js) for? What would happen without it?

    <response>

2. `canPick`(js) is a **boolean** flag. What is it for? What do you think would happen if we **removed** the `if (!canPick ...)`(js) check, and clicked on stats several times during the 2.5 second pause?

    <response>

3. Why does the game use `wait(2.5, ...)`(js) after a stat is picked?

    <response>

4. In `onClick("statRow", (row) => { ... })`(js), where does `row.statName`(js) come from? (Hint: look at the `drawCard`(js) function: it's in the hidden code, but you've seen something like it before in Lesson 2!)

    <response>

### Counting Rounds

Step through this code, which pretends the player has played three rounds. What are `round` and `wins` at the end?

```js trace header="false"
let round = 1
let wins = 0

// Round 1: the player wins
wins = wins + 1
round = round + 1

// Round 2: the player loses
round = round + 1

// Round 3: the player wins
wins = wins + 1
round = round + 1

console.log(`Round ${round}, wins: ${wins}`)
```

<response placeholder="Observations...">

### Next Round or Results?

At the end of each round, the game either moves to the **next round**, or goes to the **results** scene. Put the lines in order.

<drag-drop mode="code" title="What Next?" sub-title="Add one to the round before dealing the next cards">

1.
    ```js
    if (round === totalRounds) {
    ```

2.
    ```js
        go("results", { wins: wins, rounds: totalRounds })
    ```

3.
    ```js
    } else {
    ```

4.
    ```js
        round = round + 1
    ```

5.
    ```js
        dealCards()
    ```

6.
    ```js
    }
    ```

</drag-drop>


## **M**odify

### Bug Hunt

This version of the battle has some bugs. Play a few rounds, and look carefully at what happens. Can you fix the following?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
const totalRounds = 5

scene("title", () => {
    add([
        text("Creature Clash", { size: 64 }),
        pos(width() / 2, 220),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play", { size: 26 }),
        pos(width() / 2, 330),
        anchor("center"),
        color(255, 220, 0),
    ])

    onKeyPress("space", () => {
        go("battle")
    })
})

scene("battle", () => {
    let round = 1
    let wins = 0
    let canPick = true
    let playerCard = choose(deck)
    let computerCard = choose(deck)

    const infoLabel = add([
        text("", { size: 24 }),
        pos(30, 20),
    ])

    const messageLabel = add([
        text("", { size: 28 }),
        pos(width() / 2, 480),
        anchor("center"),
    ])

    function dealCards() {
        playerCard = choose(deck)
        computerCard = choose(deck)

        destroyAll("card")
        drawCard(playerCard, 70, true)
        drawCardBack(470)

        infoLabel.text = `Round ${round} of ${totalRounds}     Wins: ${wins}`
        messageLabel.text = "Pick a stat!"
        canPick = true
    }

    onClick("statRow", (row) => {
        if (!canPick || !row.isPlayer) {
            return
        }
        canPick = false

        const playerValue = playerCard[row.statName]
        const computerValue = computerCard[row.statName]

        destroyAll("card")
        drawCard(playerCard, 70, true, row.statName)
        drawCard(computerCard, 470, false, row.statName)

        if (playerValue < computerValue) {
            wins = wins + 1
            messageLabel.text = `You win! ${playerValue} beats ${computerValue}`
        } else if (playerValue > computerValue) {
            messageLabel.text = `You lose! ${computerValue} beats ${playerValue}`
        } else {
            messageLabel.text = `A draw! Both are ${playerValue}`
        }

        wait(2.5, () => {
            if (round === totalRounds) {
                go("results", wins)
            } else {
                round = round + 1
                dealCards()
            }
        })
    })

    dealCards()
})

scene("results", (data) => {
    add([
        text("Game Over", { size: 64 }),
        pos(width() / 2, 200),
        anchor("center"),
    ])

    add([
        text(`You won ${data.wins} of ${data.rounds} rounds`, { size: 32 }),
        pos(width() / 2, 300),
        anchor("center"),
    ])

    add([
        text("Press SPACE to play again", { size: 24 }),
        pos(width() / 2, 400),
        anchor("center"),
    ])

    onKeyPress("space", () => {
        go("title")
    })
})

go("title")
```

</web-playground>

1. <check> The game says **"You win!"** when the player's number is **smaller**
2. <check> Sometimes the computer's card turns out to be the **same card** as the player's (play a few rounds to spot it)
3. <check> The results scene says **`undefined of undefined rounds`**

### Tinker

Using the working game from the **Run** step above, complete the tasks one at a time:

1. <check> Change the game to **3 rounds**, then **7** rounds
2. <check> Count the player's **losses** as well as wins, and show them in the info label
3. <check> Make the result message **green** for a win and **red** for a loss (hint: `messageLabel.color = rgb(...)`(js))


## **M**ake

### Rules Twist

The basic game is fun, but **you** get to decide the rules! Add **one new rule** of your own invention to the battle.

> [!TIP]
> Some ideas, or invent your own:
> - **Double points** for winning on one particular stat
> - **Lowest wins** for one stat (like a race, where the smaller time is better)
> - A **streak bonus** for winning two rounds in a row
> - A draw gives a point to **both** sides
> - The computer sometimes **cheats** (hint: `chance(0.2)`(js))

Your game must have:

- <check> **One new rule** that changes how a round is scored
- <check> The rule **explained on screen**, so the player knows about it
- <check> The title, battle and results scenes still **working**

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// Copy your code from the working game above here, then add your rule
```

</web-playground>

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                    | Hint                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Keep a **high score** that lasts until you refresh the page | A `let highScore = 0`(js) **outside** the scenes, updated in the results scene   |
| Play a **sound** for a win and a loss                        | `loadSound(...)`(js) and `play(...)`(js), using `beep` and `boop` from the sounds folder |
| Make the cards **change colour** when you hover over a stat  | `onHover("statRow", ...)`(js) and `onHoverEnd(...)`(js)                          |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # `row.statName` is `"power"`. What does `playerCard[row.statName]` give?

    ---

    - [ ] The text `"power"`
    - [x] The player card's power number
    - [ ] The computer card's power number
    - [ ] `undefined`

- # Why does `dealCards()` have this loop?

    ```js
    while (computerCard === playerCard) {
        computerCard = choose(deck)
    }
    ```

    ---

    - [ ] To deal more cards
    - [x] To make sure the computer doesn't get the same card as the player
    - [ ] To count the rounds
    - [ ] To shuffle the deck

- # The battle scene calls `go("results", { wins: wins, rounds: totalRounds })`. How does the results scene show the number of wins?

    ---

    - [ ] With `wins`
    - [ ] With `results.wins`
    - [x] With `data.wins`
    - [ ] It can't

</quiz>
