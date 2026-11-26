# Animation: Values

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: var

<animation name="Var" grid="12x4">

A box that holds a value: a number, "text" or null (muted).

```anim
defaults corner 0.2
V1: var 67 at 3,2
V2: var "Dog" at 6,2 size 1.6x1
V3: var null at 9,2
```

---

## A new value

```anim
V1: 123
V2: "Cat"
V3: 4
```

+++

```anim
V1: +7                            # signed: relative, = 130
V3: -0.5                          # = 3.5
```

+++

```anim
V1: null
V2: null fill red
```

+++

A cell holds values too.

```anim
R: row [1 2 3] at 4,3.5 size 0.8
R.1: null
```

</animation>

## Feature: Moving values

<animation name="Moving Values" grid="14x7">

```anim
V1: var 7 at 2,6 name "v1" fill teal
V2: var "Dog" at 10,6 size 1.6x1 name "v2"
A: row [1 2 3] at 4,2.5 name "a" indices fill blue
```

---

## Copy into a var or a cell

A copy of `A.0` glides onto `V1`, which takes its value as it lands.

```anim
V1: A.0
```

+++

And back: `A.2` takes v2's value. The copy turns from v2's look into the row's.

```anim
A.2: V2 speed slow
```

---

## insert a var

The space opens while a copy of `V1` glides to just below it, then slides up into it.

```anim
V1: 9
```

+++

```anim
A: insert V1 at 1
```

+++

```anim
A: insert V2 at end speed slow
```

---

## remove into a var

The last cell itself drops out and glides onto `V1`, while the space closes behind it.

```anim
A: remove end into V1
```

+++

```anim
A: remove end into V2 speed slow
```

+++

From the middle: the cells after it close up.

```anim
A: remove 1 into V1
```

---

## exchange vars

New value for v1

```anim
V1: "Egg"
```

+++

Copy to v2

```anim
V2: V1
```

---

## keep-style

A red value keeps its look as it goes in, so it can be followed.

```anim
V1: 5 fill red ink white
```

+++

```anim
A: insert V1 at 0 keep-style
```

+++

```anim
V2: A.0 keep-style
```

+++

Without it, the box keeps its own look.

```anim
A.1: V2
```

</animation>

## Feature: Sums

`+ - * / mod`, with spaces round each, and `( )`: worked out once, when the line runs (as in code).

<animation name="Sums" grid="12x5">

```anim
A: var 7 name "a" at 2,2
B: var 3 name "b" at 5,2
C: var 0 name "c" at 8,2
Arr: row [1 2 3 4] at 2,4 name "arr"
```

---

## c: a + b * 2

```anim
C: A + B * 2
```

+++

```anim
C: A mod B
Arr.3: Arr.0 + Arr.1 * 10
```

+++

Changing `A` leaves `c` as it is.

```anim
A: 100
C: C / 4
```

+++

```anim
B: A - B
```

---

## ( ) first

```anim
C: (A + B) * 2
Arr.0: (Arr.1 + Arr.2) mod 4
```

+++

A negative number in ( ) is a value, not a change: `A: -5` would take 5 off.

```anim
A: (-5)
```

</animation>

## Feature: Values in labels

`{ }` in a label shows a sum's value, kept up to date. Anything else in `{ }` shows as written.

<animation name="Values in Labels" grid="12x5">

```anim
N: var 3 name "n" at 2,2
S: var 4 name "s" at 4,2
T: text "{N} × {S} = {N * S}" at 8,2
Box: rect "sides: {S}" at 8,4 size 3x1
Set: text "{1, 2, 3}" at 3,4
```

---

## New values

The labels change with their values.

```anim
N: 5 speed slow
S: 6
```

</animation>

## Feature: Following values

A number given `{ }` follows what's in it as it changes. A bare var or cell gives its value once.

<animation name="Following Values" grid="12x6">

```anim
Px: var 2 name "px" at 2,1
Turn: var 0 name "turn" at 5,1
W: var 1 name "w" at 8,1
Dot: circle y 4 x {Px} size 0.6 fill amber
Once: circle y 3 x Px size 0.4 fill pink      # Px now: it stays put
Hand: rect at 9,4 height 0.2 angle {Turn * 3} width {W} fill teal
Arr: arrow from 2,5.5 to 11,5.5 show {W / 4}
```

---

## Changing the values

```anim
Px: 10 speed slow
Turn: 60 speed slow
W: 3 speed slow
```

+++

A number given again stops following.

```anim
Dot: x 2
Px: 4
```

</animation>

## Feature: Values that follow

`V: {sum}` keeps a var, cell or number following a sum. A new value stops it.

<animation name="Values that Follow" grid="12x5">

```anim
A: var 3 name "a" at 2,2
B: var 4 name "b" at 4,2
Sum: var {A + B} name "a + b" at 7,2
Twice: binary {A * 2} at 3,4 digits 4 name "a × 2" decimal
Arr: row [0 0] at 10,4 name "arr"
```

---

## A change, and they follow

```anim
A: 5
```

+++

```anim
Arr.0: {B * 10}
B: 1 speed slow
```

---

## A new value stops it following

```anim
Sum: 0
```

+++

```anim
A: 1
```

</animation>

## Feature: counter

A new value counts its way there.

<animation name="Counter" grid="12x5">

```anim
Score: var 0 name "score" at 3,2 size 2x1
Hp: var 100 at 7,2 size 4x0.6 bar fill green track muted
B: binary 0 at 3,4 digits 4 decimal
I1: icon(laptop) "laptop {Score}" at 10,4
```

---

## Counting

```anim
Score: 25 counter speed slow
Hp: 37 counter speed slow
B: 11 counter speed slow
```

+++

```anim
defaults counter
Score: Score * 4
B: 3
```

</animation>

## Feature: Colours from values

`rgb(R G B)` works a colour out from three values from 0 to 255: numbers, vars and cells (their value now), or sums in `{ }`, which it follows as they change. It goes wherever a colour does: `fill`, `stroke`, `ink` and `track`.

<animation name="Colours from Values" grid="16x7">

```anim
defaults max 255 size 4x0.8 track black stroke muted ink contrast
R: var 255 name "r" bar at 3,1.5 fill #f00
G: var 128 name "g" bar at 3,2.5 fill #0f0
B: var 0 name "b" bar at 3,3.5 fill #00f
defaults clear
Sw: rect "fill and stroke" at 11,2.5 size 4x2.4 fill rgb({R} {G} {B}) stroke rgb(255, {G}, {B}) weight 4 ink contrast
Arr: row [0 128 255] at 2,6 indices
Hx: hex 255 at 7,6 name "hx"
Cell: rect "cells" at 12,6 size 3x1 fill rgb({Arr.2} {Hx} {Arr.0}) ink contrast
```

---

## New values

```anim
R: 0
G: 255
```

+++

```anim
B: 200 speed slow
```

---

## A value on the move: the colour changes as it lands

```anim
B: Arr.0
R: Hx
```

---

## A number's digits, and a cell

```anim
Hx: 0
Arr.2: 64
```

---

## Given a colour again, it stops following

```anim
Sw: stroke fg
```

+++

The fill still follows; the stroke doesn't.

```anim
G: 0
B: 255
```

+++

```anim
Sw: fill rgb({B} 0 {R})
```

</animation>

## Feature: Bars

<animation name="Bars" grid="13x6">

```anim
Arr: row [5, 3, 8, 1, 9, 2] at 2,3 bar stroke none fill pink-bright size 0.6x3 gap 0.15 indices
Hp: var 67 name "health" at 10,2 size 3x0.7 bar fill green-bright track red corner 0.25
```

---

## Swapping bars, a new value, hidden values

```anim
Arr: swap 0 3
Hp: 30
```

+++

```anim
Arr.2: 4
Hp: 100
```

+++

```anim
Arr: ink none
Hp: ink none
```

---

## A value on the move

```anim
T: var 0 at 10,4 size 3x0.5 bar max 9 fill blue name "avg"
```

+++

```anim
T: Arr.3
```

---

## Some cells, a new max, and back to boxes

```anim
Arr: range 0 2 fill amber
Hp: max 200
```

+++

```anim
Arr: bar clear
Hp: track none
```

</animation>

## Feature: Horizontal bars

A column of wide bars is a bar chart: the bars grow from the left, with their values at the right.

<animation name="Horizontal Bars" grid="10x6">

```anim
Votes: column [12 7 15 4 9] at 4,2 bar stroke none fill teal size 4x0.7 gap 0.15 name "Votes" indices
```

---

## Changes

```anim
Votes.3: 14
```

+++

```anim
Votes: swap 2 3
```

+++

```anim
Votes: range 0 1 fill amber
```

+++

```anim
Votes: remove 4
```

</animation>

## Feature: Rings and pies

A ring or pie shows a var's or cell's value round a circle, clockwise from the top. It's always round: it takes one size, and a box that isn't square is made square as it's turned on.

<animation name="Rings & Pies" grid="14x7">

```anim
Done: var 25 name "done" at 3,2 size 2 stroke none ring fill teal-bright track muted
Left: var 60 at 7,2 size 2 stroke none pie fill purple-bright track muted
Cpu: var 45 at 11,2 size 2 ring fill orange-bright
Arr: row [3 8 5 9] at 2,5 size 1.2 gap 0.3 stroke none pie fill pink-bright track muted max 10
```

---

## New values

```anim
Done: 75
Left: 5
Cpu: 100
Arr.1: 2
```

+++

```anim
Done: +25
Left: 0
Cpu: highlight outline
Arr: swap 0 3
```

---

## A value on the move

```anim
Cpu: highlight clear
Done: Arr.2
```

---

## Changing kind, and back to a box

```anim
Done: pie
Left: ring
Cpu: bar
```

+++

```anim
Done: bar
Left: corner 0.2
```

+++

```anim
Done: ring clear
Left: pie clear
```

---

## A wide box turned into a ring is made square

```anim
Wide: var 40 at 11,5 size 3x1 track muted
```

+++

```anim
Wide: ring fill green-bright
Arr: ring
```

</animation>
