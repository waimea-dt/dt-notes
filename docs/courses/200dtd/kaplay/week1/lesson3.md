# Lesson 3: Hello, Kaplay

Time to stop printing words and start drawing pictures! **Kaplay** is a JavaScript library that does the hard work of making games: drawing, sound, keyboard, collisions and more. You just describe what you want.

## Warm-Up

Try not to loop back at the previous lessons...

1. Write a `for` loop that prints the numbers 1 to 5.

    ```js run
    // Print the numbers 1 to 5


    ```

2. What's the difference between `=` and `===`?

    <response>

3. What does `i++` do?

    <response>


## Learning Goals

- <check> I can start a **Kaplay** game with `kaplay()`
- <check> I understand **screen coordinates** (and why `y` goes *down*)
- <check> I can **add** things with `add([...])` and components like `rect()`, `pos()` and `color()`
- <check> I can load and show a **sprite**
- <check> I can use a `for` loop to **add lots of things** at once


## The Big Idea: Components

In Kaplay, everything on screen is a **game object**. You make one by giving `add()` a **list of components**. Each component adds one ability or one property.

```js
add([
    rect(60, 60),        // I'm a 60 by 60 rectangle
    pos(100, 100),       // I live at x=100, y=100
    color(0, 200, 120),  // I'm green
])
```

Think of it like building a character sheet: pick the traits you want.

| Component            | What it does                               | Example                |
| -------------------- | ------------------------------------------ | ---------------------- |
| `rect(w, h)`(js)     | Draws a rectangle                          | `rect(60, 40)`(js)     |
| `circle(radius)`(js) | Draws a circle                             | `circle(25)`(js)       |
| `sprite(name)`(js)   | Draws a picture                            | `sprite("bean")`(js)   |
| `text(words)`(js)    | Shows words                                | `text("Hello!")`(js)   |
| `pos(x, y)`(js)      | Sets the position                          | `pos(200, 150)`(js)    |
| `color(r, g, b)`(js) | Sets the colour (0 to 255 each)            | `color(255, 0, 0)`(js) |
| `anchor(point)`(js)  | Which part of the object sits on `pos`(js) | `anchor("center")`(js) |

## Where is `(0, 0)`?

In maths class, `y`(js) goes **up**.

On a **screen**, `y`(js) goes **down**!


```
(0,0) ----------> x gets bigger
  |
  |
  v
y gets bigger
```

So `pos(100, 50)`(js) means *100 across, 50 down*, measured from the **top-left** corner.

> [!TIP]
> Helper functions:`width()`(js) gives the width of the game screen and `height()`(js) gives the height. `pos(width() / 2, height() / 2)`(js) is always the centre of the screen.


## Predict

*DON'T PEEK AT THE RUN PART BEFORE YOU DO THIS!*

Look at this code:

```js
kaplay({
    width: 400, height: 500,
    background: [20, 20, 40]
})

add([
    rect(60, 60),
    pos(100, 100),
    color(0, 200, 120),
])

add([
    circle(30),
    pos(300, 400),
    color(255, 100, 100),
])
```

Predict what you think things will appear on a 400 pixel wide by 500 pixel high screen. Be specific - you might find it easier to sketch it out on paper.

<response>

> [!TIP]
> **Colours** are defined using three values for the primary light colours: **red**, **green** and **blue**. Each value can be from **0 to 255**. The values set how much of each primary colour is mixed to form the final colour (using [additive colour mixing](https://rmit.pressbooks.pub/colourtheory1/chapter/additive-and-subtractive-colour-systems/)).
>
> So:
> - `color(0, 0, 0)`(js) would be **black**
> - `color(255, 255, 255)`(js) would be **white**
> - `color(255, 0, 0)`(js) would be **bright red**
> - `color(0, 100, 0)`(js) would be **dark green**


## Run

<web-playground hidden>

```html id=kaplay
<script src="https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.js"></script>
```

```css id=kaplay
body {
    background: black;
    height: 100vh;
    display: grid;
    place-items: center;
}
```
</web-playground>

Here is the Kaplay code running in a web view. Compare it with your prediction - any differences?

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [20, 20, 40]
})

add([
    rect(60, 60),
    pos(100, 100),
    color(0, 200, 120),
])

add([
    circle(30),
    pos(300, 400),
    color(255, 100, 100),
])
```

</web-playground>



## Investigate

### Positioning

The green square uses `pos(100, 100)`(js). Which corner of the square sits at that point?

<response>

The circle is at `pos(300, 400)`(js). Which part of the circle sits at that point? Is it the same part as the square?

<response>

What happens if you **delete** the `pos(...)`(js) line from the square? How about for the circle?

<response>

### Colours

What happens if you delete the `color(...)`(js) line?

<response>

### Component Order

What's the order of the components? Does it matter if you swap `pos`(js) and `color`?

<response>

### Anchoring

What do you think `anchor("center")`(js) will do? Try adding it to the square.

<response>


## Modify

### Sprites

A **sprite** is a picture. We load it first, then use it with `sprite("name")`.

```js
loadBean()                                      // loads Kaplay's built-in bean
loadSprite("ghost", "assets/images/ghost.png")  // loads an image and names it "ghost"

add([
    sprite("bean"),
    pos(200, 150),
    anchor("center"),
])

add([
    sprite("ghost"),
    pos(40, 40),
    anchor("center"),
])
```

> [!NOTE]
> In your Kaplay projects, we have a folder called `assets` and inside that we place images in an `images` folder, sounds in a `sounds` folder, etc. So that is why you'd write `loadSprite("ghost", "assets/images/ghost.png")`(js)


### Surrounded by Ghosts

Your tasks:

1. Add a ghost in each corner of the screen
2. Put the bean in the exact centre using `width()`(js) and `height()`(js)
3. Change the background colour

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [20, 20, 40]
})

loadBean()
loadSprite("ghost", "assets/images/ghost.png")

add([
    sprite("bean"),
    pos(200, 150),
    anchor("center"),
])

add([
    sprite("ghost"),
    pos(50, 50),
    anchor("center"),
])
```

</web-playground>


## Make

### Loops for the Win

Imagine adding ten ghosts by copy-pasting ten `add()`(js) blocks. Yikes! Remember **loops**?

```js
for (let i = 0; i < 10; i++) {
    add([
        sprite("ghost"),
        pos(50, 50 + i * 45),
        anchor("center"),
    ])
}
```

1. In the first lap `i` is `0`. What is the `y` position of the first ghost? How about the second? And the third?

    <response>

2. What does `i * 45` do?

    <response>

3. If we change `45` to `60`, what happens to the ghosts? Why might some ghosts go off the screen?

    <response>


### Ghost Parade

Design a pattern using loops. Pick **one** to start:

- A row of ghosts across the **top**
- A column of ghosts down the **left**
- A diagonal line of ghosts
- Alternating colours of rectangles like a rainbow

<web-playground data-height="32em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js depends=kaplay
kaplay({
    width: 400, height: 500,
    background: [20, 20, 40]
})

loadBean()
loadSprite("ghost", "assets/images/ghost.png")

// Your pattern goes here!

```

</web-playground>


### Stretch Challenges

- Put a loop **inside** a loop ('**nested**' loops) to make a full grid of ghosts
- Use `rand(min, max)` for a random `x` and `y`, so the ghosts scatter!
- Make each rectangle a slightly different colour (hint: `color(i * 25, 100, 200)`)




## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # Where is the point `(0, 0)` on the screen?

    ---

    - [x] The top-left corner
    - [ ] The bottom-left corner
    - [ ] The centre
    - [ ] The top-right corner

- # What does `add([...])`(js) do in Kaplay?

    ---

    - [ ] Starts up the game
    - [ ] Gives a game object an ability or property
    - [ ] Colours a point on the screen
    - [x] Creates a new game object (shape, sprite, etc.)

- # What is a component in Kaplay?

    ---

    - [ ] A complete game
    - [x] It gives a game object an ability or property
    - [ ] A point on the screen
    - [ ] A JavaScript variable

- # Why use a loop to add ten ghosts?

    ---

    - [ ] It makes each ghost move
    - [ ] It loads the ghost picture
    - [x] It repeats the same instructions without copy/pasting them
    - [ ] It changes the screen size

</quiz>
