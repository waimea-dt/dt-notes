# Animation

Step-by-step animated explanations from `<animation>` blocks. Full syntax: `docs/_plugins/visualisation/ANIMATION.md`.

Click an animation to give it focus, then use ← / → to step and `F` for full screen.

## Bubble Sort

<animation grid="12x5">

# Bubble Sort: One Pass

We start with an unsorted array.

```scene
defaults: fill blue
a5: rect "5" at 5 3 size 0.9
a3: rect "3" at 6 3 size 0.9
a8: rect "8" at 7 3 size 0.9
a1: rect "1" at 8 3 size 0.9
i: text "i" below a5
```

---

## Compare the first pair

Is `5` bigger than `3`?

```scene
a5: fill amber
a3: fill amber
```

+++

Yes it is!

```scene
a5: fill green
```

---

## Swap

So they swap places...

```scene
a5: move 6 3 via +0.5 -0.5
a3: move 5 3 via -0.5 +0.5
```

+++

...and `i` moves on.

```scene
a5: fill blue
a3: fill none
i: move below a5
```

Note:
Ask the class to predict the next comparison before advancing.

</animation>

## Travelling Salesperson

<animation>

# Travelling Salesperson

Five cities, with a road between every pair. The salesperson starts at **A**.

```scene
defaults: fill bg stroke fg
a: circle "A" at 3 6
b: circle "B" at 6 2
c: circle "C" at 11 3
d: circle "D" at 13 6
e: circle "E" at 7 7

defaults: stroke muted back
ab: line from a to b
ac: line from a to c
ad: line from a to d
ae: line from a to e
bc: line from b to c
bd: line from b to d
be: line from b to e
cd: line from c to d
ce: line from c to e
de: line from d to e

defaults: reset
s: icon(user) left-of a gap 0.1 pop front
a: fill blue
```

---

## A to B

The first leg of the route.

```scene
defaults: stroke blue width 2 slow
r1: arrow from a to b draw
s: move above b gap 0.1
b: fill blue delay 0.25
```

---

## B to C

```scene
r2: arrow from b to c draw
s: move above c gap 0.1
c: fill blue delay 0.25
```

---

## C to D

```scene
r3: arrow from c to d draw
s: move right-of d gap 0.1
d: fill blue delay 0.25
```

---

## D to E

Every city has now been visited.

```scene
r4: arrow from d to e draw
s: move below e gap 0.1
e: fill blue delay 0.25
```

---

## E back to A

The salesperson returns home to finish the tour.

```scene
r5: arrow from e to a draw
s: move left-of a gap 0.1
a: fill green delay 0.25
```

+++

The route is **A → B → C → D → E → A**. Is it the shortest one?

```scene
ac: remove
ad: remove
bd: remove
be: remove
ce: remove
```

Note:
Ask: how many different routes are there from A? (4 × 3 × 2 × 1 = 24.)

</animation>

## Public-Key Encryption

<animation grid="16x8">

# Public-Key Encryption

Alice wants to send Bob a secret message over the internet, where anyone (like Eve) could be listening.

```scene
net: line from 1 5.5 to 15 5.5 dashed stroke muted "the internet" back
alice: icon(user) "Alice" at 2 3 scale 1.5
bob: icon(user) "Bob" at 14 3 scale 1.5
eve: icon(venetian-mask) "Eve" at 8 7 scale 1.2 stroke muted
msg: rect "Hi Bob" at 4 5.5 size 2 0.8 fill blue
```

---

## Bob makes a key pair

Bob creates two matching keys. Anything locked with his **public key** can only be unlocked with his **private key**.

```scene
pub: icon(key-round) "Public" at 12 1.5 stroke green pop
priv: icon(key-round) "Private" at 15.2 1.5 stroke red pop
```

+++

The private key never leaves Bob.

```scene
priv: width 1.5 fast
// copies of the public key, hidden under the original until Bob shares them
pubA: icon(key-round) at 12 1.5 stroke green instant
pubE: icon(key-round) at 12 1.5 stroke green instant
```

---

## Bob shares his public key

It's public, so Bob gives a copy to anyone who asks: Alice, and Eve too.

```scene
pubA: move 4 2 via 8 1.3 slow
pubE: move 9.5 7 via 11 4.5 slow
```

---

## Alice locks the message

Alice locks her message with **Bob's public key**. It's now scrambled.

```scene
pubA: move above msg slow
msg: "x7#q!" fill amber delay 1
lock: icon(lock) right-of msg stroke amber pop delay 1
```

+++

Even Alice can't unlock it now: a public key can only lock.

```scene
pubA: move 4 2
```

---

## Sending it

The scrambled message travels across the internet.

```scene
msg: move +8 +0 slow
lock: move +8 +0 slow
```

+++

Eve copies it as it passes, but her public key can't unlock it. All she sees is `x7#q!`.

```scene
eve: stroke red
pubE: angle 20 fast
```

---

## Bob unlocks it

Only **Bob's private key** can unlock the message.

```scene
priv: move lock slow front
lock: remove pop delay 1
msg: "Hi Bob" fill green delay 1
```

+++

His private key goes straight back where it was. It never travelled across the internet.

```scene
priv: move 15.2 1.5 slow
```

---

## Why it works

- The **public key** locks, and can be shared with anyone.
- Only the matching **private key** unlocks, and it is never shared.
- So Eve, with the public key and the scrambled message, still can't read it.

Note:
Ask: what would Bob need to do so Alice could also receive secret replies? (Alice makes her own key pair and shares her public key.)

</animation>

## Feature Tests

### Shapes, labels and colours

<animation grid="12x4">

```scene
r: rect "rect" at 2 2 size 2 1
c: circle "circle" at 5 2 radius 0.8 fill blue
t: text "text, left" at 8 1 align left stroke theme
b: text "bold, 1.5x" at 8 3 font 1.5 bold
i: icon(laptop) "icon" at 11 2
```

---

## Colour and label changes

Fills tween; labels cross-fade.

```scene
r: fill green "done"
c: fill pink stroke red width 2
t: stroke amber "changed"
i: stroke blue
```

---

## Dashed and thick

```scene
r: dashed width 3
c: size 1
```

</animation>

### Angle and scale

<animation grid="12x5">

## Rotated and scaled

Images, shapes, text and icons can be turned (degrees clockwise, 0 = upright) and scaled.

```scene
mac: image(../_assets/macs/macintosh.svg) at 2 3 size 2 angle -15
r: rect "45°" at 5 2 angle 45
c: rect "wide" at 5 4 size 2 1 angle 90 scale 0.8
t: text "Tilted text" at 8 1 angle 20 font 1.2
cog: icon(cog) at 8 4 scale 1.5
box: rect "B" at 11 3
l: arrow from r to box "edge"
```

---

## Animated

The cog spins, the Mac turns upright and grows, and the arrow stays on the rotating rect's edge.

```scene
cog: angle +360 slow
mac: angle 0 scale 1.3 slow
r: angle +90 slow
t: angle 0 scale 1.3
```

---

## Back the other way

`angle -90` (relative) turns a quarter anticlockwise; `scale 0.5` halves.

```scene
r: angle -90
c: scale 0.5
cog: angle -360 slow
```

</animation>

### Curved moves

<animation grid="12x5" debug>

## Start

```scene
a: circle "a" at 2 4 radius 0.4 fill blue
b: rect "b" at 6 3
c: circle "c" at 2 2.5 radius 0.4 fill pink
l: line from a to c dashed
```

---

## One via point

`a: move 8 4 via 5 1` — a semicircle over `b` (the via point is centred, half the distance away).

```scene
a: move 8 4 via 5 1 slow
```

---

## Several via points

`c: move 10 2.5 via 4 4 via 6 2.5 via 8 1` — zig-zag via points give a sine-like wave, at an even speed. The dashed line follows both ends.

```scene
c: move 10 2.5 via 4 4 via 6 2.5 via 8 1 slow
```

---

## Via a shape, and relative

`a` loops through the spot below `b`; `c` goes `via -2 +2` (relative to where it starts).

```scene
a: move 2 4 via below b slow
c: move 2 2.5 via -2 +2 slow
```

</animation>

### Curved-move errors

<animation grid="8x2" debug>

```scene
a: rect at 2 1
b: rect at 4 1 via 5 2
a: fill blue via 3 2
l: line from a to 6 1 via 3 2
defaults: via 2 2
a: move 6 1 via zz
```

</animation>

### Images, relative moves and line ends

<animation grid="12x5" debug>

## Starting positions

The debug grid shows rows, columns and ids.

```scene
mac: image(../_assets/macs/macintosh.svg) "A Mac" at 3 2 size 2
box: rect "box" at 9 2
l: line from 2 5 to 6 5 "line"
p: arrow from mac to box
```

---

## Relative moves

`box: move +1 +2`, `mac: x +3`.

```scene
box: move +1 +2
mac: x +3
```

---

## One end of a line

`l: to +4 -1` moves only the end; the arrow follows `box`.

```scene
l: to +4 -1
box: y -1
```

---

## Shift a whole line

```scene
l: move +0 -1
p: to 11 1
```

</animation>

### Effects and speeds

<animation grid="12x3">

## Effects

Each shape enters with a different effect.

```scene
f: rect "fade" at 2 2
```

---

```scene
p: rect "pop" at 5 2 pop
d: arrow from 1 3 to 11 3 draw slow
s: circle "slide" at 9 2 slide
```

+++

Second beat: removal effects.

```scene
f: remove pop
p: remove fast
s: remove slide
```

---

## Instant and slow

```scene
d: remove instant
sl: rect "slow" at 2 2
```

+++

```scene
sl: move 11 2 slow
```

</animation>

### Layering

<animation grid="10x3">

## Back, normal and front

```scene
a: rect "normal" at 4 2 size 3 1 fill blue
b: circle at 3 2 radius 1 fill amber back
c: circle at 6 2 radius 1 fill pink front
```

---

## Change layer

`b: front` and `c: back`.

```scene
b: front
c: back
```

</animation>

### Fit grid and a caption-only step

<animation grid="fit">

```scene
a: rect "A" at 3 3
b: rect "B" at 6 3
l: arrow from a to b "fit"
```

---

## Same heading

This step has no scene.

---

## Same heading

The heading stays put; only this text changes.

</animation>

### Errors

Bad lines are listed under the animation and skipped; the rest still draws.

<animation grid="8x3" debug>

```scene
a: rect "A" at 2 2
b: rect at 9 9
c: blob at 3 3
a: wibble 3
d: line from a to zz
e: rect "x" "y" at 4 2
f: circle at 5 2 size 1 2
g: rect at 6 2 x 3
defaults: fill none
defaults: fill none
remove: rect at 1 1
```

</animation>

### Source in a code fence

This block must stay as code:

````markdown
<animation>
```scene
a: rect at 2 3
```
</animation>
````
