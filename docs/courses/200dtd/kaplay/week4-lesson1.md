# Lesson 1: Rooms

So far each of our programs has been a single screen. But many games have lots of **places**: the rooms of a haunted house, the levels of a platformer, the title screen and the game over screen...

In Kaplay each place is a **scene**. In this lesson you'll learn how to make scenes, how to **move** between them, and what happens to your **variables** when you do.

## Warm-Up

Try not to look back at the previous lessons...

1. How do you add an item to the end of an array?

    <response>

2. What does `deck[2]`(js) give us?

    <response>

3. What is a Kaplay **tag**, and what is it used for?

    <response>


## Learning Goals

- <check> I can define a **scene** with `scene(...)`(js)
- <check> I can switch scenes with `go(...)`(js)
- <check> I can make **doors** that lead between rooms
- <check> I can explain what happens to **objects** when the scene changes
- <check> I can explain where a variable can be **seen**: inside or outside a scene


## The Big Idea: **Scenes**

A **scene** is one screen of your game, with its own objects and its own code. You **define** scenes, then **go** to them:

| Function                            | What it does                                               |
| ----------------------------------- | ---------------------------------------------------------- |
| `scene("name", () => { ... })`(js)  | **Defines** a scene. The code inside runs when we go there |
| `go("name")`(js)                    | **Switches** to a scene                                    |

When Kaplay switches scene, it **throws away everything** from the old scene: all of its objects, its event handlers (like `onClick`) and its timers. Then it runs the code of the new scene from the top.

> [!IMPORTANT]
> A scene doesn't start until you `go(...)`(js) to it. Always finish your program with a `go(...)`(js) to your first scene.


## **P**redict

Here's a tiny haunted house with two rooms. Read the code carefully:

```js
kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadSprite("door", "assets/images/door.png")

let visits = 0

function addDoor(x, y, destination) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}

scene("hall", () => {
    visits = visits + 1
    setBackground(rgb(60, 40, 80))

    add([
        text("The Hall", { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    add([
        text(`Visits to the hall: ${visits}`, { size: 22 }),
        pos(20, 20),
    ])

    addDoor(630, 380, "kitchen")

    onClick("door", (door) => {
        go(door.destination)
    })
})

scene("kitchen", () => {
    setBackground(rgb(40, 80, 60))

    add([
        text("The Kitchen", { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    addDoor(170, 250, "hall")

    onClick("door", (door) => {
        go(door.destination)
    })
})

go("hall")
```

What will the screen show **when the program starts**?

<response>

You click the door to the kitchen, then click the door back to the hall. What will the **visits** label say now? Why?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Run it, and walk between the rooms a few times. Compare it with your predictions - any differences?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadSprite("door", "assets/images/door.png")

let visits = 0

function addDoor(x, y, destination) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}

scene("hall", () => {
    visits = visits + 1
    setBackground(rgb(60, 40, 80))

    add([
        text("The Hall", { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    add([
        text(`Visits to the hall: ${visits}`, { size: 22 }),
        pos(20, 20),
    ])

    addDoor(630, 380, "kitchen")

    onClick("door", (door) => {
        go(door.destination)
    })
})

scene("kitchen", () => {
    setBackground(rgb(40, 80, 60))

    add([
        text("The Kitchen", { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    addDoor(170, 250, "hall")

    onClick("door", (door) => {
        go(door.destination)
    })
})

go("hall")
```

</web-playground>


## **I**nvestigate

### Where Variables Live

`visits` is declared **outside** the scenes. Try moving the line `let visits = 0`(js) **inside** the hall scene, at the top, then walk to the kitchen and back.

1. What does the label say now? Why?

    <response>

> [!TIP]
> A variable made **inside** a scene is created fresh every time the scene starts, and can't be seen by other scenes. A variable made **outside** all scenes can be seen by every scene, and **keeps its value** when scenes change. We'll use this a lot: the **state of the game** will live outside the scenes!

### Rooms and Events

2. Both scenes have their own `onClick("door", ...)`(js). What do you think would happen if we **deleted** it from the kitchen? (Try it!)

    <response>

3. The `addDoor(...)`(js) function is used in both rooms. What are its parameters for? Why is it a function?

    <response>


## **M**odify

### Bug Hunt

This house has some bugs. Run it, click the doors, and check the **Console** if something goes wrong. Can you fix the following?

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
kaplay({
    width: 800, height: 600,
    background: [30, 60, 90]
})

loadSprite("door", "assets/images/door.png")

let visits = 0

function addDoor(x, y, destination) {
    add([
        sprite("door"),
        pos(x, y),
        anchor("center"),
        scale(1.5),
        area(),
        "door",
        { destination: destination },
    ])

    add([
        text(destination, { size: 20 }),
        pos(x, y + 70),
        anchor("center"),
    ])
}

scene("hall", () => {
    visits = visits + 1
    setBackground(rgb(60, 40, 80))

    add([
        text("The Hall", { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    add([
        text(`Visits to the hall: ${visits}`, { size: 22 }),
        pos(20, 20),
    ])

    addDoor(630, 380, "Kitchen")

    onClick("door", (door) => {
        go(door.destination)
    })
})

scene("kitchen", () => {
    setBackground(rgb(40, 80, 60))

    add([
        text("The Kitchen", { size: 44 }),
        pos(width() / 2, 60),
        anchor("center"),
    ])

    addDoor(170, 250, "hall")
})
```

</web-playground>

1. <check> The screen is **blank** when the program starts
2. <check> Once that's fixed, clicking the door gives an error about a **scene that can't be found**
3. <check> Once that's fixed, the door in the kitchen **does nothing**

> [!TIP]
> Scene names have to match **exactly**, including capital letters. And remember what Kaplay throws away when the scene changes...

### Tinker

Go back to the **working** house in the Run step, and complete the tasks one at a time. Test after each change!

1. <check> Add a **third room**, the cellar, with its own name and background colour
2. <check> Add doors so you can walk **kitchen to cellar**, and back
3. <check> Show **visits** in the kitchen too, using a second variable


## **M**ake

### Your House

Build a **haunted house of your own**. Choose the rooms, the colours and the names.

Your house must have:

- <check> **At least 3 rooms**, each with its own **name** and **background colour**
- <check> **Doors** between them, so you can walk **both ways**
- <check> Something of **your own** in each room: a picture, or some text

<web-playground data-height="44em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
// Copy your code from the house above here, then make it your own
```

</web-playground>

> [!TIP]
> These are some pictures you could use: `apple`, `egg`, `flower`, `ghost`, `grass`, `heart`, `jam`, `key`, `meat`, `portal`, `skull`, `star`, `steel`, `sword`, `watermelon`

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                                  | Hint                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| Show a **description** of each room                        | More `text(...)`(js) objects in each scene                     |
| Play a **sound** when you go through a door                | `loadSound("beep", "assets/sounds/beep.wav")`(js) and `play("beep")`(js) |
| A door that leads to a **random** room                     | `choose(["kitchen", "cellar"])`(js)                            |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does `go("kitchen")` do?

    ---

    - [ ] Defines a scene called kitchen
    - [x] Switches to the scene called kitchen
    - [ ] Makes a kitchen object
    - [ ] Starts the game

- # What happens to the objects in the hall when you `go("kitchen")`?

    ---

    - [ ] They stay on screen
    - [x] They are all thrown away
    - [ ] They are hidden, then come back
    - [ ] They move to the kitchen

- # A variable is declared **outside** all of the scenes. What happens to its value when you change scene?

    ---

    - [x] It keeps its value
    - [ ] It goes back to its starting value
    - [ ] It is deleted
    - [ ] Only the next scene can see it

</quiz>
