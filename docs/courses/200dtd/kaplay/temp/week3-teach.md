# Week 3: Data, Scenes & Cards


## Lesson 1: Lists & Objects

<slides>

# Lesson 1: Lists & Objects

Note:
Week 3 is about data. A card game is a great fit: every card is a bundle of values, and a deck is a list of cards

---

## Learning

- Storing lists in **arrays**
- Getting items by **index**
- Grouping values into **objects**
- Looking up properties with a **variable**
- A deck as an **array of objects**

---

## Arrays

```js
const statNames = ["speed", "power", "cuteness"]

console.log(statNames[0])       // "speed"
console.log(statNames.length)   // 3
```

| Index | 0       | 1       | 2          |
| ----- | ------- | ------- | ---------- |
| Item  | `"speed"` | `"power"` | `"cuteness"` |

Indexes start at **0**!

Note:
- Last index is always length - 1
- Ask: what does statNames[3] give? (undefined)

---

## Objects

```js
const card = {
    name: "Cat",
    speed: 8,
    power: 4,
}

console.log(card.name)
```

A bundle of **named** values

Note:
Not the same as a Kaplay game object. It's just a card with labelled fields. They've already been writing objects: `{ size: 28 }`

---

## Looking Up with a Variable

```js
const statName = "power"

console.log(card.power)        // 4
console.log(card[statName])    // 4
```

Square brackets look up a property using a **variable**

Note:
This is the key idea for the whole week. The battle compares playerCard[statName] with computerCard[statName]

---

## A Deck

```js
const deck = [
    { name: "Cat", speed: 8, power: 4 },
    { name: "Elephant", speed: 3, power: 10 },
]

console.log(deck[1].name)
```

A list of cards, each an object

---

## Make: Design Your Deck

- At least **6 cards**
- **Your own stats**, at least 3
- **Arrow keys** to browse, stopping at each end
- A **card counter**

Note:
Students choose a theme. They keep this deck for the rest of the week

</slides>



## Lesson 2: Scenes

<slides>

# Lesson 2: Scenes

Note:
Real games have a title screen, the game itself, a results screen. Scenes let us build each as a separate screen

---

## Learning

- Defining scenes with `scene(...)`
- Switching with `go(...)`
- **Passing data** between scenes
- Where **variables live**

---

## Scenes

```js
scene("title", () => {
    // objects and events for the title screen
})

go("title")
```

A scene is **one screen** of your game

Note:
A scene doesn't start until you go() to it. Always finish with a go() to the first scene

---

## Switching

```js
onKeyPress("space", () => {
    go("gallery")
})
```

Kaplay **throws away** everything from the old scene

Note:
Objects, event handlers and timers all disappear. The new scene runs from the top

---

## Passing Data

```js
go("detail", { card: thumbnail.card })

scene("detail", (data) => {
    // data.card is the card
})
```

Data goes in an **object**

---

## Where Variables Live

```js
let viewedCount = 0    // outside: seen by every scene

scene("detail", () => {
    let temp = 1       // inside: only this scene
})
```

Inside: **this scene only**, created fresh each visit

Outside: **every** scene, and it **keeps** its value

Note:
Big idea of the lesson. The bug hunt hides viewedCount inside one scene so another scene can't find it

---

## Make: Gallery of Your Own

- **Title**, **gallery** and **detail** scenes
- Gallery made with a **loop**
- Detail scene is **passed** the card
- A count of cards viewed that **keeps going**

</slides>



## Lesson 3: Card Battle

<slides>

# Lesson 3: Card Battle

Note:
Now the cards fight. The point to make: very little code is needed once the data is in the right shape

---

## Learning

- Picking **random cards**
- **Comparing** a stat chosen by the player
- Using a **flag** to guard a round
- Tracking **rounds** and **score**
- Passing the result to a **results scene**

---

## A Round

1. **Deal** two different random cards
2. The player **picks a stat**
3. **Compare** that stat on the two cards
4. The winner scores, then the **next round**

---

## Comparing

```js
const playerValue = playerCard[statName]
const computerValue = computerCard[statName]

if (playerValue > computerValue) {
    wins = wins + 1
}
```

Lookups with a **variable**: it's the same code for every stat!

---

## Different Cards

```js
playerCard = choose(deck)
computerCard = choose(deck)

while (computerCard === playerCard) {
    computerCard = choose(deck)
}
```

Keep picking until the cards are **different**

Note:
Revisits while loops from Week 1, and choose() from Week 2

---

## Guard the Round

```js
onClick("statRow", (row) => {
    if (!canPick || !row.isPlayer) {
        return
    }
    canPick = false
    // ... work out who won
})
```

A **flag** stops the player picking twice

Note:
Same idea as gameIsOver in Week 2

---

## Make: Rules Twist

Add **one new rule** of your own...

- Double points on a stat
- Lowest wins on a stat
- A streak bonus
- The computer cheats!

*Explain it on screen*

</slides>



## Lesson 4: Creature Clash

<slides>

# Lesson 4: Creature Clash

Note:
Build day. This is student-led: no steps. They plan first, then build to checkpoints

---

## Learning

- Designing a game around **data**
- Building from **several scenes**
- Changing rules with a little code
- **Balancing** with numbers

---

## The Brief

Your own **card battle game**

- A **theme** and a game name
- **8+ cards**, **3+ stats** of your own
- **Three scenes**, **3+ rounds**
- A **rule twist**, explained on screen

---

## Plan First

- Theme and name
- Stats and why
- Cards and numbers
- Rule twist
- What each scene shows

*Show your teacher before building!*

Note:
Check each plan before they start. The stats on their cards make or break the game

---

## Checkpoints

1. Your **deck**, one card on screen
2. The **battle** works
3. All **three scenes**, play again
4. Your **twist**

---

## Balancing

Is one card too good? Too weak?

Change the **data**, not the code, and test again

Note:
Ask afterwards: which of your changes were data, and which were code?

</slides>
