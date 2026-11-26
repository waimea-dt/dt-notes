# Animation: Timing and Effects

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: speed

<animation name="Speed" grid="12x7">

```anim
defaults radius 0.3 fill blue
s1: circle at 3,1
s2: circle at 3,2
s3: circle at 3,3
s4: circle at 3,4
s5: circle at 3,5
s6: circle at 3,6
s7: circle at 3,7
defaults clear
t1: text "instant" at 1.5,1 font 0.6
t2: text "vfast" at 1.5,2 font 0.6
t3: text "fast" at 1.5,3 font 0.6
t4: text "normal" at 1.5,4 font 0.6
t5: text "slow" at 1.5,5 font 0.6
t6: text "vslow" at 1.5,6 font 0.6
t7: text "3 s" at 1.5,7 font 0.6
```

---

```anim
s1: move 11,1 speed instant
s2: move 11,2 speed vfast
s3: move 11,3 speed fast
s4: move 11,4 speed normal
s5: move 11,5 speed slow
s6: move 11,6 speed vslow
s7: move 11,7 speed 3
```

</animation>

## Feature: delay

<animation name="Delay" grid="12x3">

```anim
a: rect "0" at 3,2
b: rect "1 s" at 6,2
c: rect "2 s" at 9,2
```

---

```anim
a: fill green
b: fill green delay 1
c: fill green delay 2
```

</animation>

## Feature: ease

<animation name="Ease" grid="12x6">

```anim
defaults radius 0.3 fill blue
e1: circle at 3,1
e2: circle at 3,2
e3: circle at 3,3
e4: circle at 3,4
e5: circle at 3,5
defaults clear
t1: text "in-out" at 1.5,1 font 0.6
t2: text "linear" at 1.5,2 font 0.6
t3: text "in" at 1.5,3 font 0.6
t4: text "out" at 1.5,4 font 0.6
t5: text "spring" at 1.5,5 font 0.6
```

---

```anim
e1: move 11,1 speed slow ease in-out
e2: move 11,2 speed slow ease linear
e3: move 11,3 speed slow ease in
e4: move 11,4 speed slow ease out
e5: move 11,5 speed slow ease spring
```

---

## spring on pop, and on the camera

```anim
b: rect "spring" at 7,3 size 2x1 fill pink pop ease spring
camera move b zoom 1.5 ease spring
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
no: rect "none" at 2,2
fd: rect "fade" at 5,2 fade delay 1
pp: rect "pop" at 8,2 pop delay 2
sl: circle "slide" at 11,2 slide delay 3
dr: arrow from 1,3.5 to 11,3.5 draw delay 4
```

---

## Exits

```anim
no: delete
fd: delete fade delay 1
pp: delete pop delay 2
sl: delete slide delay 3
dr: delete draw delay 4
```

</animation>

## Feature: typed

<animation name="Typed" grid="12x3">

```anim
prompt: text "$" at 2,1 mono ink yellow
```

+++

```anim
t1: text "ls -la" at 3,1 align left mono typed speed slow
```

+++

```anim
t2: text "Hello, world!" at 2,2 align left bold mono typed speed slow delay 2
```

---

## As an exit it un-types

```anim
t2: delete typed
```

</animation>

## Feature: stagger

<animation name="Stagger" grid="12x5">

```anim
arr: row [5, 3, 8, 1, 9, 2] at 3,2 size 1 gap 0.3 fill blue corner 0.3 pop stagger 0.15
```

---

## stagger

```anim
arr: fill green stagger
```

+++

```anim
arr: pulse stagger 0.1
```

---

## stagger-reverse, after a delay

```anim
arr: fill amber stagger-reverse 0.2 delay 0.5
```

---

## One highlight per cell

```anim
arr: highlight arrow stagger 0.2
```

+++

```anim
arr: highlight clear stagger 0.1
```

+++

```anim
arr: highlight number stagger 0.4
```

---

## A group, in listed order

```anim
a: rect "a" at 3,4
b: circle "b" at 6,4
c: rect "c" at 9,4
g: group [c, a, b]
```

+++

```anim
g: fill pink stagger 0.3
```

+++

```anim
g: delete pop stagger 0.2
```

</animation>

## Feature: repeat

<animation name="Repeat" grid="12x5">

```anim
r: rect "r" at 2,2 size 1.4x0.8
s: rect "s" at 5,2 size 1.4x0.8
hub: circle at 10,2.5 radius 0.1 fill fg
hand: arrow from 10,2.5 to 10,1.3 weight 2
c: circle "c" at 2,4 radius 0.4
```

---

## repeat 3

Three turns of +30 in a row.

```anim
r: angle +30 repeat 3
```

+++

Everything on the line repeats: relative changes add up, the fill changes in the first round.

```anim
s: fill red x +1 width -0.5 angle -10 repeat 2 speed slow
```

+++

The beat's other lines carry on.

```anim
r: angle -90 repeat 3 speed fast
c: move 6,4 speed slow
```

---

## repeat forever

Goes round until you move on.

```anim
hand: angle +360 about hub repeat forever speed slow ease linear
c: pulse repeat forever
```

---

## Stopped

```anim
hand: stroke teal
```

</animation>

## Feature: defaults

<animation name="Defaults" grid="12x4">

```anim
defaults fill blue size 2x1
a: rect "a" at 2,1.5
b: rect "b" at 5,1.5
defaults clear
c: rect "c" at 8,1.5
```

---

## defaults speed slow ease spring

```anim
defaults speed slow ease spring
a: move 2,3
b: move 5,3
c: move 8,3
```

---

## defaults flow-reverse, static

The top line flows right to left; the bottom one is still.

```anim
defaults clear
defaults dashed flow-reverse
l1: line from 1,0.5 to 11,0.5
defaults static
l2: line from 1,3.7 to 11,3.7
```

</animation>

## Feature: pause

Press `A` to play.

<animation name="Pause" grid="12x3">

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

<animation name="Auto" grid="12x3">

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

## Feature: then

The lines after `then` start once those before it have finished, all in one beat. Back undoes the whole beat. `pause` waits after it all.

<animation name="Then" grid="12x4">

```anim
a: rect "a" at 2,2 pop
then
b: circle "b" at 6,2 pop
then 0.5
l: arrow from a to b draw
```

---

## The same shape, in turn

```anim
a: move 2,3.5
then
a: move 10,3.5 fill amber
b: pulse
then
a: move 10,1 fill green
camera move a zoom 1.5
pause 1
```

---

## Back as it was

```anim
camera reset
a: move 2,2 fill bg-shape
```

</animation>
