# Lesson 4: Build a Haunted House

This week you've learned how to build a game out of **scenes**, and how to keep its **state** (HP and an inventory) in global variables. Today there's no recipe to follow: you're going to **design and build your own adventure game**.

## Warm-Up

Try not to look back at the previous lessons...

1. Why do we keep HP and the inventory **outside** the scenes?

    <response>

2. Why does a room check the **state** before building a pickup, such as the key?

    <response>

3. What does `resetGame()`(js) do, and when is it called?

    <response>


## Learning Goals

- <check> I can **design** a game as a set of rooms, items and rules
- <check> I can build a game from **scenes**, with state kept in **global** variables
- <check> I can use **helper functions** to keep my code short
- <check> I can **playtest** a game and improve it


## The Brief

Design and build an **adventure game** of your own. It could be a haunted house, a spaceship, a castle, a school with a mystery to solve... anything with **places** to explore, **things** to collect, and **a goal**.

Here's one made with the haunted house from this week. Yours should look and play differently!

<web-playground data-height="38em" hide-all>

```html load=_assets/kaplay.html
```

```css load=_assets/kaplay.css
```

```js load=_assets/haunted-house.js
```

</web-playground>

### Your Game Must Have

- <check> **At least 4 rooms**, each with its own name, background and things in it
- <check> **HP** shown on a HUD, at least one **hazard**, at least one **pickup** that gives HP, and a **game over**
- <check> An **inventory**, with at least **two items** and **one locked door** that needs an item
- <check> A **room that wins** the game, and SPACE to **play again** with a fresh start
- <check> Your own **theme**: your own names, colours, pictures and messages

> [!IMPORTANT]
> Make something **you** would want to play! The rooms, the items and the story are your own choices.


## Your Toolkit

Here are the helper functions you have built over the last three lessons. Copy them into your `main.js`: they need `hp`, `inventory` and `heartTaken` (rename or remove what you don't need), and the `door` picture loaded.

```js
// The state of the game: outside every scene, so every room can see it
let hp = 3
let inventory = []
let heartTaken = false

function resetGame() {
    hp = 3
    inventory = []
    heartTaken = false
}

function createHud() {
    const hpLabel = add([
        text("", { size: 28 }),
        pos(20, 20),
    ])

    const inventoryLabel = add([
        text("", { size: 28 }),
        pos(600, 20),
    ])

    // The labels watch the state, so they update themselves
    hpLabel.onUpdate(() => {
        hpLabel.text = `HP: ${hp}`
    })

    inventoryLabel.onUpdate(() => {
        inventoryLabel.text = `Inventory:\n ${inventory.join("\n ")}`
    })
}

function showMessage(message) {
    destroyAll("message")

    add([
        text(message, { size: 28 }),
        pos(width() / 2, 540),
        anchor("center"),
        color(255, 220, 0),
        opacity(1),
        lifespan(2, { fade: 0.5 }),
        "message",
    ])
}

// Every room starts the same way
function setupRoom(name, colour) {
    setBackground(colour)
    createHud()

    add([
        text(name, { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    onClick("door", (door) => {
        if (door.needs && !inventory.includes(door.needs)) {
            showMessage(`The door is locked. You need the ${door.needs}!`)
            return
        }

        go(door.destination)
    })
}

function addDoor(x, y, destination, needs) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination, needs: needs },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}
```

Read the toolkit, and answer these questions:

1. Which functions would you change, if your game had **no** hearts, but had a **magic potion** that heals?

    <response>

2. The `setupRoom(...)`(js) function sets up the **doors**. What would happen if a room forgot to call it?

    <response>

3. How would you add a **new item** to the game? List all of the places in the code that you'd need to touch.

    <response>


## Plan First

Before you write any code, plan your game. Write your answers below, then **show your teacher** before you start building.

1. What's your **theme**, and what's your game called?

    <response>

2. **Draw a map** on paper: a box for each room, with arrows for the doors. Mark where the **hazards**, **pickups**, **items** and **locked doors** are. What's the **goal**?

    <response>

3. How does the player **win**? How can they **lose**?

    <response>

- <check> My plan has been looked at by my teacher


## Repo Setup

<github repo="waimea-dt/kaplay-starter" title="Kaplay Starter" subtitle="A repo to kick-off your Kaplay games">

1. Create a **new repo** from the **template** repo above
2. Name it after your game
3. **Clone** it to your computer
4. Open the repo in your **code editor**
5. Launch the **live server** to see the game running in a browser
6. Look in the `assets/images` folder to see the pictures you can use


## Build

Work through these checkpoints, **testing as you go**. Show your teacher when you reach each one.

1. <check> **Checkpoint 1: Two rooms.** The toolkit is in, and you can walk between two rooms
2. <check> **Checkpoint 2: All your rooms.** Every room exists, and you can walk around the whole map
3. <check> **Checkpoint 3: Danger.** HP, a hazard, a pickup, and game over, with a fresh restart
4. <check> **Checkpoint 4: Items and locks.** Items, an inventory, a locked door, and a winning room

> [!TIP]
> Stuck? Think about **where** the problem is. A room that's wrong? The **state** (a global variable)? The **toolkit**? Check the **Console** for errors. Scene names have to match **exactly**, and anything the player picks up needs the state check, so it doesn't come back.


## Playtest

Swap computers with a partner and play each other's game. Don't explain anything: just watch and listen!

Get your partner to note down some feedback for you:

1. Was it **fun**? What was the best bit?

    <response>

2. Was it too **easy** or too **hard**? Where did they get stuck?

    <response>

3. Did you spot any **bugs**, or anything confusing?

    <response>

4. What is **one improvement** you'd make?

    <response>

> [!IMPORTANT]
> Good feedback is **specific**. "It's boring" isn't helpful. "I didn't know I needed the key" is!


## Level Up

Finished early? Pick **at least one** that sounds fun. Or invent your own!

| Challenge                                                          | Hint                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| A **title** scene before the first room                            | Another `scene(...)`(js), and SPACE to `go(...)`(js) to the first room          |
| Describe the rooms as **data**, and build the scenes in a **loop** | An **array of objects** with a name and colour, and a `for...of`(js) loop       |
| **Random events**, like a ghost that sometimes appears             | `chance(0.3)`(js) when you enter a room                                         |
| **Sounds** for pickups, doors and damage                           | `loadSound(...)`(js) and `play(...)`(js), using `beep` and `boop`               |
| A **timer**: you must escape before time runs out                  | A global variable, and `loop(1, ...)`(js)                                       |


## Week 4 Check

Before you finish the week, answer these questions on your own.

<quiz>

- # What happens to the objects in a room when you `go(...)` to another scene?

    ---

    - [ ] They stay on screen
    - [x] They are all thrown away
    - [ ] They are hidden
    - [ ] They move to the new scene

- # A variable is declared **inside** the hall scene. Can the cellar scene use it?

    ---

    - [ ] Yes, all variables can be used everywhere
    - [x] No, it only exists inside the hall scene
    - [ ] Yes, but only if it's a `const`
    - [ ] Yes, after you press SPACE

- # What does this code do?

    ```js
    if (!inventory.includes("key")) {
        // build the key
    }
    ```

    ---

    - [ ] Adds a key to the inventory
    - [x] Builds the key only if the player doesn't already have it
    - [ ] Deletes the key
    - [ ] Checks if the door is locked

- # What is the **state** of a game?

    ---

    - [ ] The colours it uses
    - [x] Everything it needs to remember, such as HP and what you're carrying
    - [ ] The name of the game
    - [ ] The scene that's showing

- # Why does each room call `createHud()`(js)?

    ---

    - [ ] To make the game slower
    - [x] Because each scene starts empty, so the HUD must be built again. Its labels then keep themselves up to date
    - [ ] Because HUDs can't be changed
    - [ ] To change the HP

- # What does `resetGame()` do?

    ---

    - [ ] Restarts the computer
    - [x] Puts the global state back to how it was at the start of a new game
    - [ ] Goes to the first room
    - [ ] Deletes the scenes

</quiz>


## Check Yourself

Before you finish the week, make sure you can say "yes" to all of these:

- <check> I can build a game from several **scenes**, and move between them with `go(...)`(js)
- <check> I can keep **state** in global variables, outside the scenes
- <check> I can build a scene **based on the state**
- <check> I can use **helper functions** to avoid repeating code
- <check> I can change how a game plays by changing its **state** and **rules**
