# Lesson 3: Hello, Kaplay

Time to stop printing words and start drawing pictures! **Kaplay** is a JavaScript library that does the hard work of making games: drawing, sound, keyboard, collisions and more. You just describe what you want.

## Warm-up

1. Write a `for` loop that prints the numbers 1 to 5.
2. What's the difference between `=` and `===`?
3. What does `i++` do?

## Learning goals

- [ ] I can start a Kaplay game with `kaplay()`
- [ ] I understand screen coordinates (and why `y` goes *down*)
- [ ] I can add things with `add([...])` and components like `rect()`, `pos()` and `color()`
- [ ] I can load and show a sprite
- [ ] I can use a `for` loop to add lots of things at once

## The big idea: components

In Kaplay, everything on screen is a **game object**. You make one by giving `add()` a **list of components**. Each component adds one ability or one property.

```js
add([
    rect(60, 60),        // I'm a 60 by 60 rectangle
    pos(100, 100),       // I live at x=100, y=100
    color(0, 200, 120),  // I'm green
])
```

Think of it like building a character sheet: pick the traits you want.

| Component | What it does | Example |
|---|---|---|
| `rect(w, h)` | Draws a rectangle | `rect(60, 40)` |
| `circle(radius)` | Draws a circle | `circle(25)` |
| `sprite(name)` | Draws a picture | `sprite("bean")` |
| `text(words)` | Shows words | `text("Hello!")` |
| `pos(x, y)` | Sets the position | `pos(200, 150)` |
| `color(r, g, b)` | Sets the colour (0 to 255 each) | `color(255, 0, 0)` |
| `anchor(point)` | Which part of the object sits on `pos` | `anchor("center")` |

## Where is `(0, 0)`?

In maths class, `y` goes **up**. On a screen, `y` goes **down**!

```
(0,0) ----------> x gets bigger
  |
  |
  v
y gets bigger
```

So `pos(100, 50)` means *100 across, 50 down*, measured from the **top-left** corner.

> **Handy helpers:** `width()` gives the width of the game screen and `height()` gives the height. `pos(width() / 2, height() / 2)` is always the middle.

---

## 1. Predict

Look at this code. In your notebook, sketch where you think things will appear on a 400 by 300 screen.

```js
kaplay({ width: 400, height: 300, background: [20, 20, 40] })

add([
    rect(60, 60),
    pos(100, 100),
    color(0, 200, 120),
])

add([
    circle(30),
    pos(300, 200),
    color(255, 100, 100),
])
```

## 2. Run

Press **Run** and compare it with your sketch.

<web-playground max-js>

```html id=kaplay
<script src="https://unpkg.com/kaplay@4000.0.0-alpha.27.1/dist/kaplay.js"></script>
```

```js id=kaplay
const gemImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABV0lEQVR4nO2XvQ3CMBCFD0SRBgagQpmDigGyAEMwARUTZIgskAFSZYMsQJWSImkoIpnqkInP9p3tCAo+iYbEvuf3/BeAP5FU46Ri2q9TFI8RsQlplJW1URD/e16KlaQv0ctYaH86wu2wM55d7wP0TSsSIYoAi7vYn46kQzZYSrFDLE6NHrneBwAA6JsWAPyReAXMR+0qPheBQlwinBFwLPfhi4RUNrcc4Ywe0V0AsEdiLMMUo6bAPvuyVrqIDzWS2RsLijAisDkgsR+ZxwBgTkr2PkB1luJ9Q8DzUqxwwqSGWpKkA0uIsO0H1ggoEVxbqSVo24yijuMUOAWkiCJqK6ZE+GKQnAMsAaFw7wUsAUsuTbYDughbDPpdgHsrEkXAcWLRK9nPkJW1yruHqsbp/cu7hwo5TYMcoKKQWo+IG+joHyTn7SaqryCyslbVOAVZn4zYb8Ov8wLOT9xyaH0ItQAAAABJRU5ErkJggg=="
const ghostImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAArElEQVR4nGNgGOmAkRxNH7/+/I9Ljp+bnSQziVaMz1JKHMNEK8uJ1YfXheRajA3gCg2cIUBNy/GZR1QU0BJgdQC1fY/P3AEPAYyEgc/3ckqGcPaje+dJlocB5ARJdAggG04OHxcY8CgYdQDRDkBPVKTycQGScgG1AFm5gFZg1AGjDiDoAELNKkrl8ToAphmXIZTKE3QAPQBOB6C7mtp8nIBQSUht+QGPglEwCgCqd07Y6LGzvAAAAABJRU5ErkJggg=="
```

```html depends=kaplay
<!-- Kaplay is already loaded for you. Write your game in the JS tab. -->
```

```js depends=kaplay
kaplay({
    background: [20, 20, 40]
})

add([
    rect(60, 60),
    pos(100, 100),
    color(0, 200, 120),
])

add([
    circle(30),
    pos(300, 200),
    color(255, 100, 100),
])
```

</web-playground>

## 3. Investigate

Answer these in your notebook. You can experiment in the playground above.

1. The green square is at `pos(100, 100)`. Which corner of the square sits at that point?
2. The circle is at `pos(300, 200)`. Which part of the circle sits at that point? Is it the same part as the square?
3. What happens if you **delete** the `pos(...)` line from the square?
4. What happens if you delete the `color(...)` line?
5. What's the order of the components? Does it matter if you swap `pos` and `color`?
6. What do you think `anchor("center")` will do? Try adding it to the square.

## 4. Modify: sprites

A **sprite** is a picture. We load it first, then use it with `sprite("name")`.

```js
loadBean()                          // loads Kaplay's built-in bean
loadSprite("ghost", ghostImage)     // loads our own picture and names it "ghost"

add([
    sprite("bean"),
    pos(200, 150),
    anchor("center"),
])
```

> **In your starter project**, pictures live in `assets/images/`, so you'd write `loadSprite("ghost", "assets/images/ghost.png")`. In this playground the picture is stored in a variable called `ghostImage` for you.

Your tasks:

1. Add a ghost in each corner of the screen
2. Put the bean in the exact centre using `width()` and `height()`
3. Change the background colour

<web-playground max-js>

```html depends=kaplay
<!-- Kaplay is already loaded for you. Write your game in the JS tab. -->
```

```js depends=kaplay
kaplay({
    background: [20, 20, 40]
})

loadBean()
loadSprite("ghost", ghostImage)

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

</web-playground>

## 5. Loops for the win

Imagine adding ten ghosts by copy-pasting ten `add()` blocks. Yikes! Remember loops?

```js
for (let i = 0; i < 10; i++) {
    add([
        sprite("ghost"),
        pos(20 + i * 38, 40),
        anchor("center"),
    ])
}
```

### Parsons Problem

Order these chunks so the game shows a row of ghosts.

<drag-drop mode="code" title="Ghost Row" sub-title="Start the engine, load the picture, then draw!">

1.
    ```js
    kaplay({ width: 400, height: 300 })
    ```

2.
    ```js
    loadSprite("ghost", ghostImage)
    ```

3.
    ```js
    for (let i = 0; i < 10; i++) {
        add([
            sprite("ghost"),
            pos(20 + i * 38, 40),
            anchor("center"),
        ])
    }
    ```

</drag-drop>

### Investigate the loop

1. In the first lap `i` is `0`. What is the `x` position of the first ghost? And the second?
2. What does `i * 38` do?
3. Change `38` to `60`. What happens to the row? Why might some ghosts go off the screen?

## 6. Make: Ghost Parade

Design a pattern using loops. Pick **one** to start:

- A row of ghosts across the **top**
- A column of ghosts down the **left**
- A diagonal line of ghosts
- Alternating colours of rectangles like a rainbow

<web-playground max-js>

```html depends=kaplay
<!-- Kaplay is already loaded for you. Write your game in the JS tab. -->
```

```js depends=kaplay
kaplay({ width: 400, height: 300, background: [20, 20, 40] })

loadBean()
loadSprite("ghost", ghostImage)

// Your pattern goes here!

```

</web-playground>

### Stretch challenges

- Put a loop **inside** a loop to make a full grid of ghosts
- Use `rand(min, max)` for a random `x` and `y`, so the ghosts scatter!
- Make each ghost a slightly different colour (hint: `color(i * 25, 100, 200)`)

---

## Exit ticket

1. Where is the point `(0, 0)` on the screen?
2. What's a component? Give two examples.
3. Why use a loop instead of copying `add()` ten times?
