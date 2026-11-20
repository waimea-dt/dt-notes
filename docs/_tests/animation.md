# Animation

Step-by-step animated explanations from `<animation>` blocks. Full syntax: `docs/_plugins/ANIMATION_LANG.md`.

Click an animation to give it focus, then use ← / → to step and `F` for full screen. While focused, scrolling steps too (the page scrolls again at either end). On touch, swipe left / right to step. Double click / tap plays or pauses, and doesn't select text.

## Test pages

- [Examples](animation-examples.md)
- [Shapes, Looks and Highlights](animation-shapes.md)
- [Movement, Timing and Camera](animation-motion.md)
- [Data Structures and Code](animation-data.md)
- [Errors](animation-errors.md)

This page tests the block itself: steps and beats, the grid, comments, and playback.

## Feature: Steps, beats and notes

<animation grid="12x3">

# The title stays fixed

Step 1's caption.

```anim
a: rect "a" at 2,2
```

---

## Step 2

`+++` adds a beat: more caption and scene.

```anim
a: move 6,2
```

+++

The second beat.

```anim
a: fill green
```

Note:
Teacher notes for step 2 (press S).

---

## Step 2

Same heading, so only the text changes. No scene.

</animation>

## Feature: Grid: fit

<animation grid="fit">

```anim
a: rect "A" at 3,3
b: rect "B" at 6,3
l: arrow from a to b "fit"
```

</animation>

## Feature: Large Grid

A square 12x12 grid: much taller than the 16x9 default, so check it in full screen (F) too.

<animation grid="12x12">

## Corners and centre

```anim
tl: rect "1,1" at 1,1
tr: rect "12,1" at 12,1
bl: rect "1,12" at 1,12
br: rect "12,12" at 12,12
c: circle "centre" at 6.5,6.5 radius 1.5 fill blue
```

---

## Diagonals

```anim
d1: arrow from tl to br draw
d2: arrow from tr to bl draw
```

</animation>

## Feature: Crop

The same animation twice. Without `crop`, a small margin round the grid leaves room for strokes and outlines on its edge, and shapes off the grid show in it (and, with the camera zoomed out, beyond it). With `crop`, there's no margin and nothing outside the grid is drawn: shapes on the edge are cut, the ball disappears at the edge, and zooming out shows the grid alone.

<animation grid="10x4">

# Without crop

```anim
bg: rect at 5.5,2.5 size 10x4 fill blue-muted stroke none back
edge: rect "edge" at 1,1 stroke amber weight 2
edge: highlight outline
ball: circle at 5,4 radius 0.4 fill pink
```

---

## Off the edge

```anim
ball: move 5,5.5 speed slow
```

---

## Camera in and out

```anim
camera at edge zoom 2.5 speed slow
```

+++

```anim
camera zoom 0.6 speed slow
```

+++

```anim
camera reset
ball: move 5,4
```

</animation>

<animation grid="10x4" crop>

# With crop

```anim
bg: rect at 5.5,2.5 size 10x4 fill blue-muted stroke none back
edge: rect "edge" at 1,1 stroke amber weight 2
edge: highlight outline
ball: circle at 5,4 radius 0.4 fill pink
```

---

## Off the edge

```anim
ball: move 5,5.5 speed slow
```

---

## Camera in and out

```anim
camera at edge zoom 2.5 speed slow
```

+++

```anim
camera zoom 0.6 speed slow
```

+++

```anim
camera reset
ball: move 5,4
```

</animation>

## Feature: Debug

Grid numbers, ids and warnings.

<animation grid="10x3" debug>

```anim
a: rect "a" at 2,2
b: circle "b" at 5,2
far: rect "far" at 12,2
a: fill blue pop
```

</animation>

## Feature: Comments and multi-line commands

`one` and `two` should look the same.

<animation grid="12x3">

```anim
# a whole-line comment
one: rect "one line" at 3,2 size 3x0.8 font 0.8 fill blue corner 0.2   # a comment after a command

two:
    rect "laid out"     # comments still work
    at 9,2
    size 3x0.8

    font 0.8            # and blank lines inside
    fill blue
    corner 0.2

hex: text "C# and #f80" at 6,3 colour #f80   # a hex colour and a "#" in a label are kept
```

---

## Changes too

```anim
two:
    move 9,1
    fill green
one: move 3,1 fill green
```

---

## A whole block indented

Each line is indented the same, so each is its own command.

```anim
    one: fill amber
    two: fill amber
```

</animation>

## Feature: Autoplay and loop

`autoplay loop hold="1"`: plays when on screen, then starts again. Clicking stops it.

<animation autoplay loop hold="1" grid="12x3">

```anim
dot: circle at 2,2 radius 0.4 fill blue
```

---

```anim
dot: move 6,2
```

---

```anim
dot: move 10,2 fill green
```

</animation>

## Feature: Loop-bounce and no controls

`autoplay loop-bounce hold="0.5" controls="none"`: there and back for ever, with no buttons.

<animation autoplay loop-bounce hold="0.5" controls="none" grid="12x3">

```anim
dot: circle at 2,2 radius 0.4 fill pink
```

---

```anim
dot: move 10,2 speed slow
```

</animation>

## Feature: pause

Press `A` to play.

<animation grid="12x3">

```anim
dot: circle at 2,2 radius 0.4 fill blue
```

---

## pause 2

Holds 2 seconds here.

```anim
dot: move 6,2
pause 2
```

---

## pause

Waits here for Next.

```anim
dot: move 10,2
pause
```

---

## Done

```anim
dot: fill green
```

</animation>

## Feature: auto

One click on Next plays the chain; Back undoes it.

<animation grid="12x3">

## Before the chain

```anim
a: rect "a" at 2,2
```

---

## The chain

Right...

```anim
a: move 6,2
auto
```

+++

...over...

```anim
a: move 10,2 via 8,0.8
auto
```

+++

...green.

```anim
a: fill green
```

---

## After the chain

</animation>

## Feature: Intro

The first beat uses `typed`, `pop` and `delay`, so it plays in when it comes into view, and after rewinding.

<animation grid="12x3">

```anim
prompt: text "$ ping example.com" at 2,1 align left mono typed speed slow
srv: rect "server" at 10,2 size 2x1 pop delay 2
```

---

```anim
srv: fill green
```

</animation>


## Source in a code fence

This block must stay as code:

````markdown
<animation>
```anim
a: rect at 2,3
```
</animation>
````
