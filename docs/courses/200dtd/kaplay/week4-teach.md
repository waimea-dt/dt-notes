# Week 4: Scenes & Game State


## Lesson 1: Rooms

<slides>

# Lesson 1: Rooms

Note:
Until now every program was one screen. Games have places. A scene is one place. Today: making scenes, moving between them, and what happens to variables

---

## Learning

- Defining scenes with `scene(...)`
- Switching with `go(...)`
- **Doors** between rooms
- Where **variables live**

---

## Scenes

```js
scene("hall", () => {
    // objects and events for the hall
})

go("hall")
```

A scene is **one screen** of your game

Note:
A scene doesn't start until you go() to it. Always finish with a go() to the first scene

---

## Switching

```js
onClick("door", (door) => {
    go(door.destination)
})
```

Kaplay **throws away** everything from the old scene

Note:
Objects, event handlers and timers all disappear. That's why every room has its own onClick

---

## Where Variables Live

```js
let visits = 0           // outside: seen by every scene

scene("hall", () => {
    let temp = 1         // inside: only this scene
})
```

**Inside**: this scene only, created fresh each visit

**Outside**: every scene, and it **keeps** its value

Note:
The big idea. The game's state will live outside the scenes

---

## Make: Your House

- **3+ rooms**, own names and colours
- **Doors** both ways
- Something of **your own** in each room

</slides>



## Lesson 2: Hit Points

<slides>

# Lesson 2: Hit Points

Note:
Global state in action: health that follows the player from room to room

---

## Learning

- **State** in global variables
- A **HUD** drawn from the state
- Hazards, pickups, **game over**
- **Resetting** the game

---

## Global State

```js
let hp = 3
let heartTaken = false
```

Everything the game needs to **remember**

Note:
Types again: a number and a boolean

---

## Redraw from State

```js
function drawHud() {
    destroyAll("hud")

    add([
        text(`HP: ${hp}`, { size: 28 }),
        pos(20, 20),
        "hud",
    ])
}
```

Each scene starts **empty**, so the HUD is built again

---

## Order Matters

```js
scene("cellar", () => {
    hp = hp - 1                  // change the state first
    setupRoom("The Cellar", ...) // then draw it
```

Swap them and the HUD shows the **old** HP

Note:
It's one of the bug hunt bugs. Ask what the HUD shows if setupRoom comes first

---

## Make: Dangerous House

- An **HP** HUD in every room
- A **hazard**
- A **pickup**, usable **once**
- **Game over** and a fresh restart

</slides>



## Lesson 3: Inventory

<slides>

# Lesson 3: Inventory

Note:
A list of things the player is carrying: arrays again, in a game

---

## Learning

- An **inventory** array
- `push` and `includes`
- Rooms built from the **state**
- **Locked doors**

---

## State Decides the Room

```js
if (!inventory.includes("key")) {
    // build the key
}
```

A scene is rebuilt **every visit**, so it must look at the state

Note:
Otherwise the key comes back every time you enter the cellar

---

## Locked Doors

```js
addDoor(400, 230, "attic", "key")

onClick("door", (door) => {
    if (door.needs && !inventory.includes(door.needs)) {
        showMessage("The door is locked!")
        return
    }

    go(door.destination)
})
```

A door with no `needs` is `undefined`, which counts as **false**

---

## Make: Items and Locks

- **Two items**
- Items that **don't come back**
- A **locked door**
- The inventory on the HUD
- A **winning** room

</slides>



## Lesson 4: Build a Haunted House

<slides>

# Lesson 4: Build a Haunted House

Note:
Build day. Student-led: they plan first, then build to checkpoints using the toolkit

---

## Learning

- Designing a game from rooms, items and rules
- Scenes and **global state**
- **Helper functions**
- **Playtesting**

---

## The Brief

Your own **adventure game**

- **4+ rooms**
- **HP**, a hazard, a pickup, game over
- An **inventory** and a **locked door**
- A **winning** room
- Your own **theme**

---

## Plan First

- Theme and name
- A **map** on paper
- How to **win** and **lose**

*Show your teacher before building!*

Note:
Check each map before they start. A small, finished game beats a big, unfinished one

---

## Checkpoints

1. **Two rooms**, toolkit in
2. **All rooms**
3. **Danger**
4. **Items and locks**

---

## Playtesting

Swap computers with a partner...

- Watch, don't explain
- Where did they get **stuck**?
- Any **bugs**?

</slides>
