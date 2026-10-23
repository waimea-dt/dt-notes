# Lesson 1: Mouse Events

Last week you made things move with the **keyboard**. This week we add the **mouse**! By the end of this lesson you'll be able to make a party full of balloons... and pop them.

## Warm-Up

Try not to loop back at last week...

1. Which function runs **every frame** while a key is held down: `onKeyDown`(js) or `onKeyPress`(js)?

    <response>

2. What does `get("mushroom").length`(js) give us?

    <response>

3. What does `destroy(thing)`(js) do?

    <response>


## Learning Goals

- <check> I can make an object **clickable** using `area()`
- <check> I can respond to clicks with `onClick(...)`(js)
- <check> I can respond to the mouse **hovering** with `onHover(...)`(js) and `onHoverEnd(...)`(js)
- <check> I can find the **mouse position** with `mousePos()`(js)
- <check> I can **change** an object's colour while the game is running


## The Big Idea: **Areas** and **Tags**

How does Kaplay know if the mouse is over a game object? It needs to know the **shape** of the object. We give it that by adding the `area()`(js) component. It creates an invisible **hit zone** around the object.

```js
add([
    rect(160, 60),
    pos(200, 150),
    area(),          // I can be clicked!
    "button",        // I'm tagged as a "button"
])
```

Last week we used **tags** to find all the mushrooms. We can also use them to say *"when **any** object with this tag is clicked, run this code"*:

```js
onClick("button", (btn) => {
    // btn is the object that was clicked
})
```

Here are the mouse functions we'll use:

| Function                                  | When your code runs                              |
| ----------------------------------------- | ------------------------------------------------ |
| `onClick("tag", (obj) => { ... })`(js)    | When an object with the tag is **clicked**       |
| `onClick(() => { ... })`(js)              | When the mouse is clicked **anywhere**           |
| `onHover("tag", (obj) => { ... })`(js)    | *Just once* when the mouse moves **onto** an object |
| `onHoverEnd("tag", (obj) => { ... })`(js) | *Just once* when the mouse moves **off** an object  |
| `mousePos()`(js)                          | *Gives* you the current position of the mouse    |

> [!NOTE]
> The `(btn) => { ... }`(js) function receives the **exact object** that was clicked. That means one handler can look after lots of objects, as long as they share a tag.


## **P**redict

Look at this Kaplay program:

```js
kaplay({
    width: 400, height: 300,
    background: [30, 60, 90]
})

add([
    rect(160, 60),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(0, 200, 120),
    area(),
    "button",
])

onClick("button", (btn) => {
    btn.color = rgb(255, 100, 100)
})
```

What will happen when you click **on** the rectangle?

<response>

What will happen if you click **somewhere else** on the screen?

<response>

What will happen if you click the rectangle a **second time**?

<response>


## **R**un

<web-playground hidden>

```html id=kaplay load=_assets/kaplay.html
```

```css id=kaplay load=_assets/kaplay.css
```
</web-playground>

Here is the Kaplay code running in a web view. Compare it with your prediction - any differences?

<web-playground data-height="26em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 300,
    background: [30, 60, 90]
})

add([
    rect(160, 60),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(0, 200, 120),
    area(),
    "button",
])

onClick("button", (btn) => {
    btn.color = rgb(255, 100, 100)
})
```

</web-playground>


## **I**nvestigate

### Clickable?

Delete the `area()`(js) line from the button in the web view above and run it again. What happens when you click? Why?

<response>

### Colours

The button is made green with the `color(0, 200, 120)`(js) **component**. We then change it with `btn.color = rgb(255, 100, 100)`(js). What do you think `rgb(...)`(js) does? How is it different to `color(...)`(js)?

<response>

### Which Object?

In `onClick("button", (btn) => {...})`(js), what does `btn` hold? If there were **three** buttons, all tagged `"button"`, what would `btn` be when you click the second one?

<response>

### Mouse Position

The mouse position is a point with an `x` and a `y`, just like `pos(...)`. Try the **Mouse Spy** below. Move the mouse around the game area.

<web-playground data-height="26em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 300,
    background: [30, 60, 90]
})

const spy = add([
    text("x: 0   y: 0", { size: 24 }),
    pos(20, 20),
])

onUpdate(() => {
    const mouse = mousePos()
    spy.text = `x: ${Math.round(mouse.x)}   y: ${Math.round(mouse.y)}`
})
```

</web-playground>

1. What are `x` and `y` when the mouse is in the **top-left** corner? How about the **bottom-right**?

    <response>

2. Why is it handy that `mousePos()`(js) uses the same coordinates as `pos(...)`(js)?

    <response>

### Putting it in order

Put these chunks of code in the right order to make a button that turns yellow when the mouse hovers over it.

<drag-drop mode="code" title="Hover Button" sub-title="Set up, create the button, then react to the mouse">

1.
    ```js
    kaplay({ width: 400, height: 300 })
    ```

2.
    ```js
    const button = add([
        rect(160, 60),
        pos(120, 120),
        color(0, 200, 120),
        area(),
        "button",
    ])
    ```

3.
    ```js
    onHover("button", (btn) => {
        btn.color = rgb(255, 220, 0)
    })
    ```

</drag-drop>


## **M**odify

### Bug Hunt

This panel of buttons should turn **red** when you click them. It has **two bugs**. Find and fix them.

<web-playground data-height="26em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 300,
    background: [30, 60, 90]
})

add([
    rect(100, 100),
    pos(50, 100),
    color(0, 200, 120),
    area(),
    "button",
])

add([
    rect(100, 100),
    pos(150, 100),
    color(0, 200, 120),
    "button",
])

add([
    rect(100, 100),
    pos(250, 100),
    color(0, 200, 120),
    area(),
    "button",
])

onClick("btn", (button) => {
    button.color = rgb(255, 100, 100)
})
```

</web-playground>

> [!TIP]
> Tags have to match **exactly**, including capital letters.

### Tinker

Start with this code and complete the tasks one at a time. Test after each change!

<web-playground data-height="26em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 300,
    background: [30, 60, 90]
})

add([
    rect(160, 60),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(0, 200, 120),
    area(),
    "button",
])

onHover("button", (btn) => {
    btn.color = rgb(255, 220, 0)
})
```

</web-playground>

Tasks:

1. <check> The button **stays yellow** after the mouse leaves. Use `onHoverEnd(...)`(js) to turn it **green** again
2. <check> Make the mouse pointer change shape over the button: `setCursor("pointer")`(js) when hovering, and `setCursor("default")`(js) when not
3. <check> Make the button **disappear** when clicked (hint: `destroy(...)`(js))
4. <check> Use a `for` **loop** to make **three** buttons in a row, instead of one


## **M**ake

### Pop Party

Time for your first mouse-powered game! You are going to make a simple game where the player pops **balloons**.

Your game must have:

- <check> At least **10 balloons** (circles) at **random** positions
- <check> Each balloon a **random colour**
- <check> Balloons **disappear** when clicked

> [!TIP]
> A random colour needs three random numbers: `color(rand(100, 255), rand(100, 255), rand(100, 255))`(js)

<web-playground data-height="30em" js-only>

```html depends=kaplay
```

```css depends=kaplay
```

```js
kaplay({
    width: 400, height: 500,
    background: [30, 60, 90]
})

// TODO: use a for loop to add 10 balloons (circles with area() and a "balloon" tag)

// TODO: use onClick to pop a balloon when it is clicked

```

</web-playground>

### Level Up

Finished early? Try these. Pick the ones that sound fun.

| Challenge                                          | Hint                                                         |
| -------------------------------------------------- | ------------------------------------------------------------ |
| Balloons **change colour** when hovered            | `onHover(...)`(js) and `onHoverEnd(...)`(js)                 |
| Balloons **grow** a little each time they're hovered | `balloon.radius = balloon.radius + 5`(js)                  |
| A balloon is **replaced** by a new one when popped | Add a new balloon in your `onClick`(js) function             |
| Show **"Balloons left: 10"** on screen             | `text()` component, `get("balloon").length`(js) and `onUpdate(...)`(js) |
| Click **anywhere** to add a new balloon            | `onClick(() => {...})`(js) and `mousePos()`(js)              |


## Exit Ticket

Without looking back, answer these three questions:

<quiz>

- # What does an object need before it can be clicked?

    ---

    - [ ] A `sprite()` component
    - [ ] A `color()` component
    - [x] An `area()` component
    - [ ] A `pos()` component

- # Which one runs just once, when the mouse moves onto an object?

    ---

    - [ ] `onClick`
    - [x] `onHover`
    - [ ] `onHoverEnd`
    - [ ] `mousePos`

- # In `onClick("balloon", (balloon) => {...})`, what is `balloon`?

    ---

    - [ ] The text "balloon"
    - [ ] The first balloon that was created
    - [x] The balloon object that was clicked
    - [ ] The number of balloons

</quiz>
