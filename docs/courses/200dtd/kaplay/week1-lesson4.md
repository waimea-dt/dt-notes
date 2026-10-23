# Lesson 4: Make It Move

Right now your game is static and lifeless. In this lesson you'll make it **react to you**. By the end you'll have the first prototype: **Wander**.

## Warm-Up

Try not to loop back at the previous lessons...

1. What does `add([sprite("ghost"), pos(50, 50)])`(js) do?

    <response>

2. Where does a `pos(0, 0)`(js) object appear?

    <response>

3. Why do we load sprites before we use them?

    <response>


## Learning Goals

- <check> I can react to **key presses** with `onKeyDown(...)`(js)
- <check> I can **move** an object with `move(...)`(js)
- <check> I understand that `onUpdate(...)`(js) runs **every frame**, over and over
- <check> I can store **speed** in a variable so it's easy to change

## The Big Idea: **The Game Loop**

A game isn't a single run of code. It's a loop that runs about **60 times a second**. Each lap is called a **frame**.

Typically, a single frame involves:

<sequence animated="true">

1. ### <i data-lucide="keyboard"></i> Check Inputs
    - **Keys** pressed / held / released
    - **Mouse** moved / clicked

2. ### <i data-lucide="iteration-cw"></i> Update Things
    - Apply **forces** / **speeds**
    - Update **positions**
    - Check for **collisions**

3. ### <i data-lucide="wallpaper"></i> Draw the Screen
    - Draw **background**
    - Draw **sprites** / **shapes** / **text**
    - Play **sounds**

</sequence>


Kaplay runs that main game loop for you. You just tell it what should happen by defining **event handler** functions:

| Function                                   | When your code runs                        |
| ------------------------------------------ | ------------------------------------------ |
| `onUpdate(() => { ... })`(js)              | Runs *every frame*, always                 |
| `onKeyPress("space", () => { ... })`(js)   | Runs *just once* when key is first pressed |
| `onKeyDown("space", () => { ... })`(js)    | Runs *every frame* while key held down     |
| `onKeyRelease("space", () => { ... })`(js) | Runs *just once* when key is released      |

> [!NOTE]
> The `() => { ... }`(js) part is called an **arrow function**, mentioned last lesson. This is a nameless function that runs when the appropriate action takes place.


## **P**redict

Look at this Kaplay program:

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

loadBean()

const playerSpeed = 240

const player = add([
    sprite("bean"),
    pos(50, 250),
    anchor("center"),
])

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})
```

> [!NOTE]
> The `player.move(...)`(js) function takes two arguments: **x speed** and **y speed** in **pixels per second**. So:
> - `player.move(100, 0)`(js) - move the player **rightwards** (x speed is positive 100)
> - `player.move(0, -50)`(js) - would move the player **upwards**, slowly (y speed is negative 50)

What will happen when you press the **right** arrow?

<response>

What will happen when you press the **left** arrow?

<response>

What will happen if you **hold down** the right arrow for **two seconds**?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```

</web-playground>

Here is the Kaplay code running in a web view. Compare it with your prediction - any differences?

> [!IMPORTANT]
> **Click inside the game** once first, otherwise your keyboard presses won't reach it.

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

loadBean()

const playerSpeed = 240

const player = add([
    sprite("bean"),
    pos(50, 250),
    anchor("center"),
])

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})
```

</web-playground>


## **I**nvestigate

### Trace the Frames

The game runs at 60 frames per second, and `move(...)`(js) is clever: it moves the bean `playerSpeed` **pixels per second**, not per frame.

With `playerSpeed = 240`(js), each frame the bean moves `240 / 60 = 4`(js) pixels.

The bean starts at `x = 50`(js). Fill in the table, assuming the right arrow is held down...

| Frame         | `x`(js) at start | `x`(js) after `move(...)`(js) |
| ------------- | :--------------: | :---------------------------: |
| 1             |        50        |              54               |
| 2             |        54        |            <value>            |
| 3             |     <value>      |            <value>            |
| 60 (after 1s) |     <value>      |            <value>            |


### Different Speeds

What happens if you change `playerSpeed` to `24`? Or to `2400`?

<response>

### Different Directions

What values would you pass to `player.move(...)`(js) to move the bean **down**? How about **diagonally up and right**?

<response>

### Key Actions

What's the difference between `onKeyDown` and `onKeyPress`? When would you use each one?

<response>

### Speed Variable

Why is `playerSpeed` stored in a variable at the top, instead of typing `240` directly in each key handler function?

<response>



## **M**odify

Start with this code and complete the tasks one at a time. Test after each change!

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

loadBean()

const playerSpeed = 120

const player = add([
    sprite("bean"),
    pos(200, 250),
    anchor("center"),
])

onKeyDown("left", () => {
    player.move(-playerSpeed, 0)
})

onKeyDown("right", () => {
    player.move(playerSpeed, 0)
})
```

</web-playground>

Tasks:

1. <check> Add **up and down** controls (remember: `y` goes **down** the screen!)
2. <check> Make the **W**, **A**, **S** and **D** keys work too (see tip below)
3. <check> Make the bean faster, then slower. What feels right?
4. <check> **Sprint key**: make the bean move faster while **Shift** is held.
    *(hint: you can update `playerSpeed` when the Shift key is pressed / released)*

> [!TIP]
> The `onKeyDown(...)`(js), `onKeyPress(...)`(js) and `onKeyRelease(...)`(js) functions can all respond to **multiple keys**. Put the keys into a list: `["up", "w"]`(js) and pass this as the first argument:
>
> ```js
> onKeyDown(["up", "w"], () => {...})
> ```


### Bug hunt

Press **left and right at the same time** and hold them. What happens? Why?

<response>

Now press **up and right together**. Is the bean's speed the same as moving in a straight line? (Measure it: how long does it take to cross the screen?)

<response>

We'll look at *why* this happens and what we can do about it another day (a mathematician might call it the **Pythagoras problem**!)



## **M**ake

Time for your first game!

### Wander Game

You are going to make a simple game where the player wanders about the screen, picking up mushrooms, whilst a bunch of ghosts watch them:

<web-playground data-height="38em" hide-all>

```html depends=kaplay
```

```css depends=kaplay
```

```js load=_assets/wander.js
```

</web-playground>


### Repo Setup

<github repo="waimea-dt/kaplay-starter" title="Kaplay Starter" subtitle="A repo to kick-off your Kaplay games">

1. Create a **new repo** from the **template** repo above
2. Name it **kaplay-wander-game**
3. **Clone** it to your computer
4. Open the repo it in your **code editor**
5. Launch the **live server** to see the game running in a browser

> [!IMPORTANT]
> You can't just open the `index.html` file by double-clicking it. The page needs to be served up by a web server so that the images, etc. can be loaded correctly by Kaplay. In **VS Code**, the **Live Server** extension launches a small server with a single click.

### Create the Game

Your game must have:

- <check> A **row of ghosts** across the top of the screen (from Lesson 3)
- <check> A **player** (the bean) controlled with the **arrow keys**
- <check> At least **8 mushrooms** scattered at **random** positions (see tip below)
- <check> **Mushrooms disappear** when the player touches them

> [!TIP]
> We can use the `rand(from, to)`(js) function to generate random numbers in a range. So a random `x` position would be `rand(0, width())`(js)


#### How to Make Objects Disappear

We haven't met collisions yet (that's coming in a later week), so for now we'll measure the **distance** between the player and each mushroom. If it's small enough, they're touching.

```js
// Runs every frame for every object tagged "mushroom"
onUpdate("mushroom", (mushroom) => {
    if (player.pos.dist(mushroom.pos) < 30) {
        destroy(mushroom)
    }
})
```

> [!TIP]
> We can find the distance between two objects using `object.pos.dist(otherObject)`(js)

For this to work, each mushroom needs the **tag** `"mushroom"` in its component list. A tag is just a word in quotes:

```js [5]
add([
    sprite("mushroom"),
    pos(...),
    anchor("center"),
    "mushroom",
])
```

## Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                        | Hint                                                |
| ------------------------------------------------ | --------------------------------------------------- |
| **Stop the bean walking off** the screen         | `if (player.pos.x < 0) { player.pos.x = 0 }`(js)    |
| Flip the bean to **face the way it's going**     | `player.flipX = true`(js)                           |
| Show **"Mushrooms left: 8"** on screen           | `text()` component and `get("mushroom").length`(js) |
| Make the ghosts **drift up and down**            | `onUpdate` and `ghost.move(...)`(js)                |
| **Win message** when all mushrooms are collected | `if (get("mushroom").length === 0)`(js)             |



## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # About how often does `onUpdate` run?

    ---

    - [ ] Once when the game starts
    - [ ] Once per key press
    - [x] Every frame, about 60 times per second
    - [ ] Once per second

- # Which input handler repeats while a key is held?

    ---

    - [x] `onKeyDown`
    - [ ] `onKeyPress`
    - [ ] `onUpdate`
    - [ ] `move`

- # Why change an object's position to move it?

    ---

    - [ ] Kaplay cannot draw objects more than once
    - [ ] Position only changes when the game starts
    - [x] Kaplay updates and draws objects each frame
    - [ ] It prevents the keyboard from working

</quiz>


## Check Yourself

Before you finish the week, make sure you can say "yes" to all of these:

- <check> I can **declare a variable** with `const` or `let`
- <check> I can write an `if` / `else` code **branch**
- <check> I can write a `for` **loop**
- <check> I can **add objects** to the screen with `add([...])`
- <check> I can make objects **move** with the **keyboard**
- <check> I can find and read an **error message in the console**
