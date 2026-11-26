# Animation: Timing and Effects

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: speed

<animation name="Speed" grid="12x7">

```anim
defaults radius 0.3 fill blue
S1: circle at 3,1
S2: circle at 3,2
S3: circle at 3,3
S4: circle at 3,4
S5: circle at 3,5
S6: circle at 3,6
S7: circle at 3,7
defaults clear
T1: text "instant" at 1.5,1 font 0.6
T2: text "vfast" at 1.5,2 font 0.6
T3: text "fast" at 1.5,3 font 0.6
T4: text "normal" at 1.5,4 font 0.6
T5: text "slow" at 1.5,5 font 0.6
T6: text "vslow" at 1.5,6 font 0.6
T7: text "3 s" at 1.5,7 font 0.6
```

---

```anim
S1: move 11,1 speed instant
S2: move 11,2 speed vfast
S3: move 11,3 speed fast
S4: move 11,4 speed normal
S5: move 11,5 speed slow
S6: move 11,6 speed vslow
S7: move 11,7 speed 3
```

</animation>

## Feature: delay

<animation name="Delay" grid="12x3">

```anim
A: rect "0" at 3,2
B: rect "1 s" at 6,2
C: rect "2 s" at 9,2
```

---

```anim
A: fill green
B: fill green delay 1
C: fill green delay 2
```

</animation>

## Feature: ease

<animation name="Ease" grid="12x6">

```anim
defaults radius 0.3 fill blue
E1: circle at 3,1
E2: circle at 3,2
E3: circle at 3,3
E4: circle at 3,4
E5: circle at 3,5
defaults clear
T1: text "in-out" at 1.5,1 font 0.6
T2: text "linear" at 1.5,2 font 0.6
T3: text "in" at 1.5,3 font 0.6
T4: text "out" at 1.5,4 font 0.6
T5: text "spring" at 1.5,5 font 0.6
```

---

```anim
E1: move 11,1 speed slow ease in-out
E2: move 11,2 speed slow ease linear
E3: move 11,3 speed slow ease in
E4: move 11,4 speed slow ease out
E5: move 11,5 speed slow ease spring
```

---

## spring on pop, and on the camera

```anim
B: rect "spring" at 7,3 size 2x1 fill pink pop ease spring
camera move B zoom 1.5 ease spring
```

+++

```anim
camera reset ease out
```

</animation>

## Feature: Entrance and exit effects

<animation name="Entrances & Exits" grid="12x4">

## Entrances

+++

```anim
No: rect "none" at 2,2
Fd: rect "fade" at 5,2 fade delay 1
Pp: rect "pop" at 8,2 pop delay 2
Sl: circle "slide" at 11,2 slide delay 3
Dr: arrow from 1,3.5 to 11,3.5 draw delay 4
```

---

## Exits

```anim
No: delete
Fd: delete fade delay 1
Pp: delete pop delay 2
Sl: delete slide delay 3
Dr: delete draw delay 4
```

</animation>

## Feature: typed

<animation name="Typed" grid="12x3">

```anim
Prompt: text "$" at 2,1 mono ink yellow
```

+++

```anim
T1: text "ls -la" at 3,1 anchor left mono typed speed slow
```

+++

```anim
T2: text "Hello, world!" at 2,2 anchor left bold mono typed speed slow delay 2
```

---

## As an exit it un-types

```anim
T2: delete typed
```

</animation>

## Feature: stagger

<animation name="Stagger" grid="12x5">

```anim
Arr: row [5, 3, 8, 1, 9, 2] at 3,2 size 1 gap 0.3 fill blue corner 0.3 pop stagger 0.15
```

---

## stagger

```anim
Arr: fill green stagger
```

+++

```anim
Arr: pulse stagger 0.1
```

---

## stagger-reverse, after a delay

```anim
Arr: fill amber stagger-reverse 0.2 delay 0.5
```

---

## One highlight per cell

```anim
Arr: highlight arrow stagger 0.2
```

+++

```anim
Arr: highlight clear stagger 0.1
```

+++

```anim
Arr: highlight number stagger 0.4
```

---

## A group, in listed order

```anim
A: rect "a" at 3,4
B: circle "b" at 6,4
C: rect "c" at 9,4
G: group [C, A, B]
```

+++

```anim
G: fill pink stagger 0.3
```

+++

```anim
G: delete pop stagger 0.2
```

</animation>

## Feature: repeat

<animation name="Repeat" grid="12x5">

```anim
R: rect "r" at 2,2 size 1.4x0.8
S: rect "s" at 5,2 size 1.4x0.8
Hub: circle at 10,2.5 radius 0.1 fill fg
Hand: arrow from 10,2.5 to 10,1.3 weight 2
C: circle "c" at 2,4 radius 0.4
```

---

## repeat 3

Three turns of +30 in a row.

```anim
R: angle +30 repeat 3
```

+++

Everything on the line repeats: relative changes add up, the fill changes in the first round.

```anim
S: fill red x +1 width -0.5 angle -10 repeat 2 speed slow
```

+++

The beat's other lines carry on.

```anim
R: angle -90 repeat 3 speed fast
C: move 6,4 speed slow
```

---

## repeat forever

Goes round until you move on.

```anim
Hand: angle +360 about Hub repeat forever speed slow ease linear
C: pulse repeat forever
```

---

## Stopped

```anim
Hand: stroke teal
```

</animation>

## Feature: defaults

<animation name="Defaults" grid="12x4">

```anim
defaults fill blue size 2x1
A: rect "a" at 2,1.5
B: rect "b" at 5,1.5
defaults clear
C: rect "c" at 8,1.5
```

---

## defaults speed slow ease spring

```anim
defaults speed slow ease spring
A: move 2,3
B: move 5,3
C: move 8,3
```

---

## defaults flow-reverse, static

The top line flows right to left; the bottom one is still.

```anim
defaults clear
defaults dashed flow-reverse
L1: line from 1,0.5 to 11,0.5
defaults static
L2: line from 1,3.7 to 11,3.7
```

</animation>

## Feature: pause

Press `A` to play.

<animation name="Pause" grid="12x3">

```anim
Dot: circle at 2,2 radius 0.4 fill blue
```

---

## pause 2

Holds 2 seconds here.

```anim
Dot: move 6,2
pause 2
```

---

## pause

Waits here for Next.

```anim
Dot: move 10,2
pause
```

---

## Done

```anim
Dot: fill green
```

</animation>

## Feature: auto

One click on Next plays the chain; Back undoes it.

<animation name="Auto" grid="12x3">

## Before the chain

```anim
A: rect "a" at 2,2
```

---

## The chain

Right...

```anim
A: move 6,2
auto
```

+++

...over...

```anim
A: move 10,2 via 8,0.8
auto
```

+++

...green.

```anim
A: fill green
```

---

## After the chain

</animation>

## Feature: then

The lines after `then` start once those before it have finished, all in one beat. Back undoes the whole beat. `pause` waits after it all.

<animation name="Then" grid="12x4">

```anim
A: rect "a" at 2,2 pop
then
B: circle "b" at 6,2 pop
then 0.5
L: arrow from A to B draw
```

---

## The same shape, in turn

```anim
A: move 2,3.5
then
A: move 10,3.5 fill amber
B: pulse
then
A: move 10,1 fill green
camera move A zoom 1.5
pause 1
```

---

## Back as it was

```anim
camera reset
A: move 2,2 fill bg-shape
```

</animation>
