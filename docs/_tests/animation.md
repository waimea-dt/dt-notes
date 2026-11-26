# Animation

Step-by-step animated explanations from `<animation>` blocks. Full syntax: `docs/_plugins/ANIMATION_LANG.md`.

Click an animation to give it focus, then use ← / → to step and `F` for full screen. While focused, scrolling steps too (the page scrolls again at either end). On touch, swipe left / right to step. Double click / tap plays or pauses, and doesn't select text.

This page tests the block itself: steps and beats, the grid and its attributes, comments, and playback. The other test pages are in the sidebar.

## Feature: Steps, beats and notes

<animation name="Steps, Beats & Notes" grid="12x3">

# The title stays fixed

Step 1's caption.

```anim
A: rect "a" at 2,2
```

---

## Step 2

`+++` adds a beat: more caption and scene.

```anim
A: move 6,2
```

+++

The second beat.

```anim
A: fill green
```

Note:
Teacher notes for step 2 (press S).

---

## Step 2

Same heading, so only the text changes. No scene.

</animation>

## Feature: Large grid

A square 12x12 grid: much taller than the 16x9 default, so check it in full screen (F) too.

<animation name="Large Grid" grid="12x12">

## Corners and centre

```anim
Tl: rect "1,1" at 1,1
Tr: rect "12,1" at 12,1
Bl: rect "1,12" at 1,12
Br: rect "12,12" at 12,12
C: circle "centre" at 6.5,6.5 radius 1.5 fill blue
```

---

## Diagonals

```anim
D1: arrow from Tl to Br draw
D2: arrow from Tr to Bl draw
```

</animation>

## Feature: Grid: fit

<animation name="Grid Fit" grid="fit">

```anim
A: rect "A" at 3,3
B: rect "B" at 6,3
L: arrow from A to B "fit"
```

</animation>

## Feature: Crop

The same animation twice. Without `crop`, a small margin round the grid leaves room for strokes and outlines on its edge, and shapes off the grid show in it (and, with the camera zoomed out, beyond it). With `crop`, there's no margin and nothing outside the grid is drawn: shapes on the edge are cut, the ball disappears at the edge, and zooming out shows the grid alone.

<animation name="Without Crop" grid="10x4">

# Without crop

```anim
Bg: rect at 5.5,2.5 size 10x4 fill blue-muted stroke none back
Edge: rect "edge" at 1,1 stroke amber weight 2
Edge: highlight outline
Ball: circle at 5,4 radius 0.4 fill pink
```

---

## Off the edge

```anim
Ball: move 5,5.5 speed slow
```

---

## Camera in and out

```anim
camera move Edge zoom 2.5 speed slow
```

+++

```anim
camera zoom 0.6 speed slow
```

+++

```anim
camera reset
Ball: move 5,4
```

</animation>

<animation name="With Crop" grid="10x4" crop>

# With crop

```anim
Bg: rect at 5.5,2.5 size 10x4 fill blue-muted stroke none back
Edge: rect "edge" at 1,1 stroke amber weight 2
Edge: highlight outline
Ball: circle at 5,4 radius 0.4 fill pink
```

---

## Off the edge

```anim
Ball: move 5,5.5 speed slow
```

---

## Camera in and out

```anim
camera move Edge zoom 2.5 speed slow
```

+++

```anim
camera zoom 0.6 speed slow
```

+++

```anim
camera reset
Ball: move 5,4
```

</animation>

## Feature: Debug

Grid numbers, ids and warnings.

<animation name="Debug" grid="10x3" debug>

```anim
A: rect "a" at 2,2
B: circle "b" at 5,2
Far: rect "far" at 12,2
A: fill blue pop
```

</animation>

## Feature: Comments and multi-line commands

`one` and `two` should look the same.

<animation name="Comments & Multi-line" grid="12x3">

```anim
# a whole-line comment
One: rect "one line" at 3,2 size 3x0.8 font 0.8 fill blue corner 0.2   # a comment after a command

Two:
    rect "laid out"     # comments still work
    at 9,2
    size 3x0.8

    font 0.8            # and blank lines inside
    fill blue
    corner 0.2

Hx: text "C# and #f80" at 6,3 ink #f80    # a hex colour and a "#" in a label are kept
```

---

## Changes too

```anim
Two:
    move 9,1
    fill green
One: move 3,1 fill green
```

---

## A whole block indented

Each line is indented the same, so each is its own command.

```anim
    One: fill amber
    Two: fill amber
```

</animation>

## Feature: Still

One beat: a still picture, with no buttons or progress bar.

<animation name="Still" grid="12x3">

```anim
A: rect "A" at 3,2
B: circle "B" at 9,2
L: arrow from A to B
```

</animation>

## Feature: Autoplay and loop

`autoplay loop hold="1"`: plays when on screen, then starts again. Clicking stops it.

<animation name="Autoplay & Loop" autoplay loop hold="1" grid="12x3">

```anim
Dot: circle at 2,2 radius 0.4 fill blue
```

---

```anim
Dot: move 6,2
```

---

```anim
Dot: move 10,2 fill green
```

</animation>

## Feature: Loop-bounce and no controls

`autoplay loop-bounce hold="0.5" controls="none"`: there and back for ever, with no buttons.

<animation name="Loop-bounce, No Controls" autoplay loop-bounce hold="0.5" controls="none" grid="12x3">

```anim
Dot: circle at 2,2 radius 0.4 fill pink
```

---

```anim
Dot: move 10,2 speed slow
```

</animation>

## Feature: Intro

The first beat uses `typed`, `pop` and `delay`, so it plays in when it comes into view, and after rewinding.

<animation name="Intro" grid="12x3">

```anim
Prompt: text "$ ping example.com" at 2,1 anchor left mono typed speed slow
Srv: rect "server" at 10,2 size 2x1 pop delay 2
```

---

```anim
Srv: fill green
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
