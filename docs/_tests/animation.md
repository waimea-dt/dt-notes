# Animation

Step-by-step animated explanations from `<animation>` blocks. Full syntax: `docs/_plugins/visualisation/ANIMATION.md`.

Click an animation to give it focus, then use ← / → to step and `F` for full screen.

## Examples of Use

<animation grid="12x5">

# Bubble Sort: One Pass

We start with an unsorted array.

```anim
arr: row [5 3 8 1] at 5,3 size 0.9 gap 0.1 fill blue
i: text "i" attach below arr.0
```

---

## Compare the first pair

Is `5` bigger than `3`?

```anim
arr.0: highlight spotlight
arr.1: highlight spotlight
```

+++

Yes it is!

```anim
arr.0: fill amber pulse
```

---

## Swap

So they swap places...

```anim
arr: swap 0 1
```

+++

...and `i` moves on.

```anim
arr.0: fill blue highlight clear
arr.1: fill blue highlight clear
i: attach below arr.1
```

Note:
Ask the class to predict the next comparison before advancing.

---

## Compare the next pair

Is `5` bigger than `8`?

```anim
arr.1: highlight spotlight
arr.2: highlight spotlight
```

+++

No it's not

```anim
arr.2: fill amber pulse
```

---

## Swap

So they remain in place...

+++

...and `i` moves on.

```anim
arr.1: fill blue highlight clear
arr.2: fill blue highlight clear
i: attach below arr.2
```

Note:
Ask the class to predict the next comparison before advancing.

---

## Compare the next pair

Is `8` bigger than `1`?

```anim
arr.2: highlight spotlight
arr.3: highlight spotlight
```

+++

Yes it is!

```anim
arr.2: fill amber pulse
```

---

## Swap

So they swap places...

```anim
arr: swap 2 3
```

+++

...and that pass is done.

```anim
arr.2: fill blue highlight clear
arr.3: highlight clear
```

+++

The largest value, 8, has 'bubbled' to the end!

```anim
arr.3: fill green wiggle speed fast
i: delete
```

</animation>


<animation>

# Travelling Salesperson

Five cities, with a road between every pair. The salesperson starts at **A**.

```anim
defaults fill bg stroke fg
a: circle "A" at 3,6
b: circle "B" at 6,2
c: circle "C" at 11,3
d: circle "D" at 13,6
e: circle "E" at 7,7

defaults stroke muted back
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

defaults clear
s: icon(user) left-of a gap 0.1 pop front
a: fill blue
```

---

## A to B

The first leg of the route.

```anim
defaults stroke blue weight 2 speed slow
r1: arrow from a to b draw
s: move above b gap 0.1
b: fill blue delay 0.5
```

---

## B to C

```anim
r2: arrow from b to c draw
s: move above c gap 0.1
c: fill blue delay 0.5
```

---

## C to D

```anim
r3: arrow from c to d draw
s: move right-of d gap 0.1
d: fill blue delay 0.5
```

---

## D to E

Every city has now been visited.

```anim
r4: arrow from d to e draw
s: move below e gap 0.1
e: fill blue delay 0.5
```

---

## E back to A

The salesperson returns home to finish the tour.

```anim
r5: arrow from e to a draw
s: move left-of a gap 0.1
a: fill green delay 0.5
```

+++

```anim
ac: delete
ad: delete
bd: delete
be: delete
ce: delete
auto
```

---

The route is **A → B → C → D → E → A**. Is it the shortest one?

```anim
camera goto a zoom 1.5
auto
```

+++

```anim
camera travel b c d e a delay 0.5
auto
```

+++

```anim
camera reset delay 0.5
```

Note:
Ask: how many different routes are there from A? (4 × 3 × 2 × 1 = 24.)

</animation>


<animation grid="16x8">

# Public-Key Encryption

Alice wants to send Bob a secret message over the internet, where anyone (like Eve) could be listening.

```anim
net: line from 1,5.5 to 15,5.5 dashed stroke muted "the internet" back
alice: icon(user) "Alice" at 2,3 scale 1.5
bob: icon(user) "Bob" at 14,3 scale 1.5
eve: icon(venetian-mask) "Eve" at 8,7 scale 1.2 stroke muted
msg: rect "Hi Bob" at 4,5.5 size 2x0.8 fill blue
```

---

## Bob makes a key pair

Bob creates two matching keys. Anything locked with his **public key** can only be unlocked with his **private key**.

```anim
pub: icon(key-round) "Public" at 12,1.5 stroke green pop
priv: icon(key-round) "Private" at 15.2,1.5 stroke red pop
```

+++

The private key never leaves Bob.

```anim
priv: weight 1.5 speed fast
```

---

## Bob shares his public key

It's public, so Bob gives a copy to anyone who asks: Alice, and Eve too.

```anim
pubA: copy pub move 4,2 via 8,1.3 speed slow
pubE: copy pub move 9.5,7 via 11,4.5 speed slow
```

---

## Alice locks the message

Alice locks her message with **Bob's public key**. It's now scrambled.

```anim
pubA: move above msg speed slow
msg: "x7#q!" fill amber delay 1
lock: icon(lock) attach right-of msg stroke amber pop delay 1
```

+++

Even Alice can't unlock it now: a public key can only lock.

```anim
pubA: move 4,2
```

---

## Sending it

The scrambled message travels across the internet (the lock is attached, so it goes too).

```anim
msg: move +8,+0 speed slow
```

+++

Eve copies it as it passes, but her public key can't unlock it. All she sees is `x7#q!`.

```anim
eve: stroke red callout "x7#q! ???" left-of
pubE: shake
```

---

## Bob unlocks it

Only **Bob's private key** can unlock the message.

```anim
eve: callout clear
priv: move lock speed slow front
lock: delete pop delay 1
msg: "Hi Bob" fill green delay 1 pulse
```

+++

His private key goes straight back where it was. It never travelled across the internet.

```anim
priv: move 15.2,1.5 speed slow
```

---

## Why it works

- The **public key** locks, and can be shared with anyone.
- Only the matching **private key** unlocks, and it is never shared.
- So Eve, with the public key and the scrambled message, still can't read it.

Note:
Ask: what would Bob need to do so Alice could also receive secret replies? (Alice makes her own key pair and shares her public key.)

</animation>


<animation grid="16x8">

# HTTPS: The TLS Handshake

The browser wants to visit **https://bank.example**. Before anything private is sent, the two sides agree a secret **session key**, without Eve ever learning it.

```anim
net: line from 1,5.5 to 15,5.5 dashed stroke muted "the internet" back
browser: icon(laptop) "Browser" at 2,3 scale 1.5
server: icon(server) "bank.example" at 14,3 scale 1.5
eve: icon(venetian-mask) "Eve" at 8,7 scale 1.2 stroke muted
```

---

## 1. Client Hello

The browser says hello, listing the encryption methods it supports.

```anim
m1: rect "Hello + options" at 4.5,5.5 size 3x0.8 font 0.8 fill blue pop
```

+++

It's sent in the open. Eve can read it, but there's nothing secret in it.

```anim
m1: move +7,+0 speed slow
```

---

## 2. Server Hello and certificate

The server picks a method and replies with its **certificate**: its **public key**, signed by a certificate authority (CA) that browsers trust. Its **private key** stays on the server.

```anim
m1: delete
pub: icon(key-round) "Public" at 12.3,0.9 stroke green pop
priv: icon(key-round) "Private" at 15.3,0.9 stroke red pop
m2: rect "Certificate" at 11.5,5.5 size 3x0.8 font 0.8 fill teal pop
pubB: icon(key-round) attach above m2 stroke green scale 0.8 pop
```

+++

The public key is attached to the certificate, so it travels with it.

```anim
m2: move -7,+0 speed slow
```

---

## 3. The browser checks the certificate

It checks the CA's signature, the name **bank.example** and the dates. A fake certificate fails here, so Eve can't pretend to be the bank.

```anim
m2: fill green delay 0.25 highlight outline
check: icon(badge-check) attach left-of m2 stroke green pop
```

---

## 4. Key exchange

The browser makes a brand-new random **session key**.

```anim
m2: delete
check: delete
sess: icon(key-round) "Session key" at 4.5,2 stroke amber pop
```

+++

It locks a copy with the **server's public key**...

```anim
pubB: move 4.5,4.3 speed slow
m3: rect "session key" at 4.5,5.5 size 3x0.8 font 0.8 fill amber pop delay 1
lock3: icon(lock) attach right-of m3 stroke amber pop delay 1
```

+++

...and sends it. Eve sees it pass, but only the server's **private key** can unlock it.

```anim
pubB: delete
m3: move +7,+0 speed slow
```

---

## 5. Both sides share the session key

The server unlocks it with its private key. Now both sides have the same session key, and Eve doesn't.

```anim
priv: move lock3 speed slow front
lock3: delete pop delay 1
m3: delete delay 1
ssk: icon(key-round) "Session key" at 10,2 stroke amber pop delay 1.2
```

+++

The public and private keys have done their job. From here on, everything is locked and unlocked with the session key. This is **symmetric encryption**: much faster than public and private keys.

```anim
pub: delete speed slow
priv: delete speed slow
sess: weight 1.5
ssk: weight 1.5
```

---

## 6. An encrypted request

The browser asks for the page...

```anim
req: rect "GET /balance" at 4.5,5.5 size 3x0.8 font 0.8 fill blue pop
```

+++

...locks it with the session key...

```anim
req: "k#2@Lp" fill amber
lk4: icon(lock) attach right-of req stroke amber pop
```

+++

...and sends it. Eve only sees scrambled data.

```anim
req: move +7,+0 speed slow
eve: callout "k#2@Lp ???" left-of
```

---

## 7. An encrypted response

The server unlocks the request with its copy of the session key...

```anim
eve: callout clear
lk4: delete pop
req: "GET /balance" fill blue
```

+++

...and locks its response the same way before sending it back.

```anim
req: delete
res: rect "Zq!7x" at 11.5,5.5 size 3x0.8 font 0.8 fill amber pop
lk5: icon(lock) attach left-of res stroke amber pop
```

+++

```anim
res: move -7,+0 speed slow
```

+++

The browser unlocks it and shows the page.

```anim
lk5: delete pop
res: "Balance: $42" fill green pulse
```

---

## The padlock

That padlock in the address bar means all of this happened: the certificate checked out, and everything since has been encrypted with the session key.

```anim
pad: icon(lock) "https://" above browser stroke green pop
```

- **Public and private keys** are only used to share the session key safely.
- The **session key** (symmetric encryption) does the fast work of locking every request and response.
- The **certificate** proves the server really is bank.example.

Note:
This is the older RSA-style key exchange, as it's the easiest to follow. Modern TLS 1.3 agrees the session key with Diffie-Hellman instead (each side contributes a part, so the session key is never sent at all), but the overall shape is the same: hello, certificate, agree a key, then encrypt everything with it.

</animation>

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

## Feature: rect

<animation grid="12x4">

```anim
r1: rect "1x1" at 2,2
r2: rect "2x1" at 5,2 size 2x1
r3: rect "corner" at 8.5,2 size 2x1 corner 0.2
r4: rect "pill" at 11,2 size 1.6x0.8 corner 0.4
```

---

## width, height, size

```anim
r1: size 1.5
r2: width 3
r3: height 1.6
r4: corner 0
```

</animation>

## Feature: circle

<animation grid="12x3">

```anim
c1: circle "0.5" at 2,2
c2: circle "0.8" at 5,2 radius 0.8
c3: circle "size 1.2" at 8.5,2 size 1.2 font 0.7
```

---

## radius, size

```anim
c1: radius 0.8
c3: size +0.4
```

</animation>

## Feature: diamond

Lines stop at its slanted edges.

<animation grid="12x5">

```anim
d: diamond "x > 3?" at 4,3 size 3x1.6 fill amber
yes: rect "yes" at 9,1.5 size 2x0.8 corner 0.2
no: rect "no" at 9,4.5 size 2x0.8 corner 0.2
ly: arrow from d to yes
ln: arrow from d to no
top: arrow from 4,0.5 to d
c: curve from 1,1 to d via 2,3
```

---

## Resized and turned

```anim
d: width 2.4 angle 20
```

</animation>

## Feature: text

The dotted box is column 6: `align` anchors to its edges.

<animation grid="12x4">

```anim
cell: rect at 6,2 size 1x3 dotted stroke muted fill none back
t1: text "centre" at 6,1
t2: text "align left" at 6,2 align left
t3: text "align right" at 6,3 align right
```

---

## Changed

```anim
t1: "new text" colour amber
```


</animation>

## Feature: Fonts: font, bold, mono

<animation grid="12x4">

```anim
f1: text "font 1" at 3,1
f2: text "font 1.5" at 3,2.2 font 1.5
f3: text "bold" at 8,1 bold
f4: text "mono" at 8,2.2 mono
box: rect "a bold label" at 5.5,3.5 size 3x0.8 bold font 0.8
```

---

## font changes tween

```anim
f1: font 1.5
f2: font 1
```

</animation>

## Feature: line and arrow

<animation grid="12x5">

```anim
a: circle "a" at 2,2
b: rect "b" at 10,2
l1: line from a to b "line"
l2: arrow from 2,4 to 10,4 "arrow"
```

---

## l1: arrow

Adds a head.

```anim
l1: arrow
```

+++

An end on a shape follows it.

```anim
b: move 9,1
```

</animation>

## Feature: curve

<animation grid="12x6">

```anim
a: circle "a" at 2,3
b: circle "b" at 10,3
c1: curve from a to b via 6,1
c2: curve from a to b via 4,5 via 8,4 dashed stroke teal arrow
```

---

## c1: via 6,2

The bend blends to the new point.

```anim
c1: via 6,2 speed slow
```

+++

The ends follow their shapes.

```anim
b: move 10,1
```

</animation>

## Feature: image

<animation grid="12x4">

```anim
mac: image(../_assets/macs/macintosh.svg) "A Mac" at 3,2 size 1.5x2
mac2: image(../_assets/macs/macintosh.svg) at 8,2 size 2 stroke blue dashed
```

---

## Resized

It keeps its proportions inside its box.

```anim
mac: width +1
mac2: size 1
```

</animation>

## Feature: Images

Scratch sprites: placing, sizing, turning, moving along paths, and the extras that work on any shape.

<animation grid="14x7">

## Placed and sized

A box from `size` (or `width` / `height`): the image fits inside it, keeping its proportions.

```anim
cat: image(../_assets/scratch/sprites/cat.svg) "cat" at 2,2 pop
dog: image(../_assets/scratch/sprites/dog.svg) "dog" right-of cat gap 1 size 1.5
fish: image(../_assets/scratch/sprites/fish.svg) at 2,5.5 size 2x1
rocket: image(../_assets/scratch/sprites/rocket1.svg) at 12.5,5 size 1x2 stroke muted dashed
earth: image(../_assets/scratch/sprites/earth.svg) at 10,2 size 1.5
```

---

## Resized

```anim
cat: size 2
dog: width +1
fish: height 2 delay 0.3
rocket: width 2
```

---

## Turned and scaled

```anim
rocket: angle 45
earth: angle +180 scale 1.4 speed slow
fish: angle -20
```

---

## Moving

```anim
cat: move 6,4 via 4,6.5 speed slow
dog: move 7,1.5 ease spring
```

+++

```anim
fish: travel 4,4 6,6 2,5.5
```

---

## Following a path

The bug ends on the earth's centre, then comes back.

```anim
path: curve from cat to earth via 9,6.5 dashed
bug: image(../_assets/scratch/sprites/bug1.svg) at cat size 0.8 front
```

+++

```anim
bug: follow path speed vslow
```

+++

```anim
bug: follow-reverse path speed slow
```

---

## Attached, copied and grouped

```anim
star: image(../_assets/scratch/sprites/star.svg) size 0.7 attach above earth
earth: move 10,4.2 speed slow
```

+++

```anim
bug2: copy bug move 2,2.5 via 4,1
pair: group [cat bug]
pair: move -2,+0
```

---

## Emphasis, highlights and callouts

```anim
cat: pulse
dog: wobble
earth: highlight outline
rocket: highlight inside
fish: callout "Blub!" below
```

---

## Gone

```anim
fish: delete slide
dog: delete pop
pair: delete fade stagger 0.2
```

</animation>

## Feature: icon

<animation grid="12x3">

```anim
i1: icon(laptop) "laptop" at 2,1.5
i2: icon(server) "server" at 5,1.5 stroke blue
i3: icon(lock) at 8,1.5 size 1.5 stroke amber weight 1.5
```

---

```anim
i1: stroke green scale 1.3
```

</animation>

## Feature: Colours

<animation grid="12x4">

```anim
pal: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 1,1 font 0.4
pal.0: fill red
pal.1: fill orange
pal.2: fill amber
pal.3: fill yellow
pal.4: fill green
pal.5: fill teal
pal.6: fill cyan
pal.7: fill blue
pal.8: fill purple
pal.9: fill pink
pal.10: fill magenta
pal.11: fill theme
st: rect "stroke" at 2,3 size 2x0.8 stroke red weight 2
cl: rect "colour" at 5,3 size 2x0.8 colour amber
hx: text "#f80" at 8,3 colour #f80
mu: text "muted" at 11,3 colour muted
```

---

## Changes tween

```anim
st: fill green stroke blue
cl: colour pink
hx: colour teal
```

</animation>

## Feature: weight

<animation grid="12x4">

```anim
w1: line from 1,1 to 5,1 weight 0.5
w2: line from 1,2 to 5,2
w3: line from 1,3 to 5,3 weight 2
w4: line from 1,4 to 5,4 weight 4
r1: rect "weight 3" at 8,2 size 2x1 weight 3
r2: rect "weight 0" at 8,3.5 size 2x1 weight 0 fill blue
```

---

```anim
w1: weight 4
w4: weight 0.5
```

</animation>

## Feature: Line styles

Style changes cross-fade.

<animation grid="12x3">

## solid

```anim
l: line from 1,2 to 7,2 weight 2
ring: circle at 10,2 radius 0.7 weight 1.5 stroke teal
```

---

## dashed

```anim
l: dashed speed slow
ring: dashed speed slow
```

---

## dotted

```anim
l: dotted speed slow
ring: dotted speed slow
```

---

## solid

```anim
l: solid speed slow
ring: solid speed slow
```

</animation>

## Feature: flow

<animation grid="12x3">

```anim
a: circle "A" at 2,2
b: circle "B" at 7,2
l: line from a to b dotted weight 2
ring: circle at 10,2 radius 0.7 dashed weight 1.5 stroke teal
```

---

## flow

```anim
l: flow
ring: flow
```

---

## flow-reverse

```anim
l: flow-reverse
ring: flow-reverse
```

---

## static

```anim
l: static
ring: static
```

</animation>

## Feature: angle and scale

The arrow stays on the turning rect's edge.

<animation grid="12x5">

```anim
mac: image(../_assets/macs/macintosh.svg) at 2,3 size 2 angle -15
r: rect "45°" at 5,2 angle 45
w: rect "wide" at 5,4 size 2x1 angle 90 scale 0.8
t: text "Tilted" at 8,1 angle 20 font 1.2
cog: icon(cog) at 8,4 scale 1.5
box: rect "B" at 11,3
l: arrow from r to box
```

---

## Animated

```anim
cog: angle +360 speed slow
mac: angle 0 scale 1.3 speed slow
r: angle +90 speed slow
t: angle 0 scale 1.3
w: scale 0.5
```

</animation>

## Feature: Layers

<animation grid="10x3">

## back, normal, front

```anim
a: rect "normal" at 4,2 size 3x1 fill blue
b: circle at 3,2 radius 1 fill amber back
c: circle at 6,2 radius 1 fill pink front
```

---

## Swapped

```anim
b: front
c: back
```

</animation>

## Feature: Position and placement

<animation grid="12x5">

```anim
a: rect "a" at 6,3
up: circle "above" above a font 0.5
down: circle "below" below a font 0.5
lt: circle "left-of" left-of a font 0.5
rt: circle "gap 1" right-of a gap 1 font 0.5
on: circle at a radius 0.15 fill amber front
```

---

## x, y and at

```anim
rt: x 11
up: y 1
on: at lt
```


</animation>

## Feature: Relative values

<animation grid="12x5">

```anim
r: rect "r" at 3,2
```

---

## move +2,+1

```anim
r: move +2,+1
```

---

## x +3

```anim
r: x +3
```

---

## width +1, size +0.5, angle +45

```anim
r: width +1
```

+++

```anim
r: size +0.5
```

+++

```anim
r: angle +45
```

</animation>

## Feature: Moving lines

<animation grid="12x5">

```anim
a: rect "a" at 2,1
b: rect "b" at 10,1
p: arrow from a to b
l: line from 2,4 to 6,4 "l" stroke pink
```

---

## l: to +4,-1

One end.

```anim
l: to +4,-1
```

---

## l: move +0,+1

The whole line.

```anim
l: move +0,+1
```

---

## p: from 2,3 to b

```anim
p: from 2,3 to b
```

</animation>

## Feature: Curved moves

<animation grid="12x5">

```anim
a: circle "a" at 2,4 radius 0.4 fill blue
b: rect "b" at 6,3
c: circle "c" at 2,2.5 radius 0.4 fill pink
```

---

## One via

An arc over `b`.

```anim
a: move 8,4 via 5,1 speed slow
```

---

## Several vias

A wave, at an even speed.

```anim
c: move 10,2.5 via 4,4 via 6,2.5 via 8,1 speed slow
```

---

## Via a shape, and relative

```anim
a: move 2,4 via below b speed slow
c: move 2,2.5 via -2,+2 speed slow
```

</animation>

## Feature: travel

Hop by hop; each hop takes the speed.

<animation grid="14x4">

```anim
pc: icon(laptop) "PC" at 1.5,2
r1: circle "R1" at 4.5,1.5 radius 0.45
r2: circle "R2" at 7.5,3 radius 0.45
r3: circle "R3" at 10.5,1.5 radius 0.45
srv: icon(server) "Server" at 13,2
defaults stroke muted back
l1: line from pc to r1
l2: line from r1 to r2
l3: line from r2 to r3
l4: line from r3 to srv
defaults clear
pkt: rect at 1.5,2 size 0.5x0.35 fill amber front
```

---

```anim
pkt: travel r1 r2 r3 srv
```

</animation>

## Feature: follow

<animation grid="12x5">

```anim
a: circle "a" at 2,3
b: circle "b" at 10,3
l: line from a to b
c: curve from a to b via 6,1 dashed
dot: circle at 2,3 radius 0.2 fill amber front
```

---

## follow l

Ends on b's centre, not at the line's end on b's edge.

```anim
dot: follow l speed slow
```

---

## follow-reverse c

Back along the curve, ending on a's centre.

```anim
dot: follow-reverse c speed slow
```

---

## A free end

```anim
f: arrow from a to 6,4.6
```

+++

Ends at the arrow's tip: there's no shape there.

```anim
dot: follow f speed slow
```

</animation>

## Feature: copy

The copy starts on the original and moves off.

<animation grid="12x3">

```anim
key: icon(key-round) "key" at 2,2 stroke green
```

---

```anim
k2: copy key move 6,2 via 4,1 speed slow
```

+++

```anim
k3: copy k2 move 10,2 stroke amber
```

</animation>

## Feature: attach and detach

<animation grid="12x5">

```anim
msg: rect "msg" at 2,4 size 1.6x0.8 fill amber
```

---

## attach right-of msg

```anim
lock: icon(lock) attach right-of msg stroke amber pop
```

+++

It rides along, even round a curve.

```anim
msg: move 9,4 via 6,2.5 speed slow
```

---

## detach

```anim
lock: detach
```

+++

```anim
msg: move 3,4 speed slow
```

---

## attach msg

On top.

```anim
lock: attach msg
```

</animation>

## Feature: group and ungroup

<animation grid="12x4">

```anim
a: rect "a" at 2,2
b: circle "b" at 5,3
l: arrow from a to b
```

---

## group

```anim
g: group [a, b, l] highlight outline
```

+++

Acts as one.

```anim
g: move +5,+0 speed slow
```

+++

```anim
g: pulse
```

---

## ungroup

The members stay where they are.

```anim
g: ungroup
```

+++

```anim
a: move 2,2
```

---

## Removing a group removes its members

```anim
g2: group [a, b]
```

+++

```anim
g2: delete pop
```

</animation>

## Feature: Rows and columns

<animation grid="12x6">

```anim
arr: row [5 3 8 1] at 2,1.5 fill blue
col: column ["A" "B" "C"] at 10,1.5 size 1.6x0.8 gap 0.2 fill teal corner 0.1
words: row ["cat" "" "dog"] at 2,4 size 1.4x0.8 gap 0.3
mem: row 4 at 7.5,5.3 size 0.8
```

---

## One cell, every cell

```anim
arr.1: fill amber
mem.2: "7"
```

+++

```anim
arr: fill green
```

---

## Placed

`move` places the first cell; `below` the whole row.

```anim
arr: move 3,3 speed slow
```

+++

```anim
words: below col gap 0.5 speed slow
```

---

## delete

```anim
arr: delete pop
```

</animation>

## Feature: swap

<animation grid="12x5">

```anim
arr: row [5, 3, 8, 1] at 2,2 fill blue
i: text "i" attach below arr.0
p: arrow from 1,4.5 to arr.3
col: column ["A" "B" "C"] at 10,1.5 size 1.6x0.8 gap 0.2 fill teal
```

---

## Neighbours

```anim
arr: swap 0 1
```

+++

Further apart, they clear the cells between. `i` and the arrow stay with their places.

```anim
arr: swap 0 3 speed slow
```

---

## A highlight moves with its cell

```anim
arr.1: highlight spotlight
```

+++

```anim
arr: swap 1 2
```

---

## Column

```anim
arr.2: highlight clear
col: swap 0 2 speed slow
```

</animation>

## Feature: insert and remove

<animation grid="12x6">

```anim
arr: row [1, 2, 3, 4, 5] at 2,2 fill blue size 0.9 gap 0.2
i: text "i" attach below arr.2
st: column [4 9] at 10,1.5 size 1.6x0.8 fill teal
```

---

## remove

`arr.2` slides out below, leaving an empty slot, and the cells after it close it up. `i` stays with place 2.

```anim
arr: remove 2
```

+++

The first cell: the rest close up from the left.

```anim
arr: remove 0 speed slow
```

---

## insert

The cells open an empty slot, and 7 slides up into it.

```anim
arr: insert 7 at 1
```

+++

New cells take the row's look as it is now.

```anim
arr: fill green
arr: insert "x" at 0 speed slow
```

---

## At the end

A slot opens on the end for the new cell; a removed one leaves a slot that closes.

```anim
arr: insert 8 at end
st: insert 6 at end
```

+++

```anim
arr: remove end
st: remove end speed slow
```

+++

Emptied, a column can be inserted into again.

```anim
st: remove end
st: remove end delay 0.3
```

+++

```anim
st: insert 1 at end
```

</animation>

## Feature: var

<animation grid="12x4">

A box that holds a value: a number, "text" or null (muted).

```anim
defaults corner 0.2
v1: var 67 at 3,2
v2: var "Dog" at 6,2 size 1.6x1
v3: var null at 9,2
```

---

## A new value

```anim
v1: 123
v2: "Cat"
v3: 4
```

+++

```anim
v1: null
v2: null fill red
```

+++

A cell holds values too.

```anim
r: row [1 2 3] at 4,3.5 size 0.8
r.1: null
```

</animation>

## Feature: Moving values

<animation grid="14x7">

```anim
v1: var 7 at 2,6 name "v1" fill teal
v2: var "Dog" at 10,6 size 1.6x1 name "v2"
a: row [1 2 3] at 4,2.5 name "a" indices fill blue
```

---

## Copy into a var or a cell

A copy of `a.0` glides onto `v1`, which takes its value as it lands.

```anim
v1: a.0
```

+++

And back: `a.2` takes v2's value. The copy turns from v2's look into the row's.

```anim
a.2: v2 speed slow
```

---

## insert a var

The space opens while a copy of `v1` glides to just below it, then slides up into it.

```anim
v1: 9
```

+++

```anim
a: insert v1 at 1
```

+++

```anim
a: insert v2 at end speed slow
```

---

## remove into a var

The last cell itself drops out and glides onto `v1`, while the space closes behind it.

```anim
a: remove end into v1
```

+++

```anim
a: remove end into v2 speed slow
```

+++

From the middle: the cells after it close up.

```anim
a: remove 1 into v1
```

---

## exchange vars

New value for v1

```anim
v1: "Egg"
```

+++

Copy to v2

```anim
v2: v1
```

---

## keep-style

A red value keeps its look as it goes in, so it can be followed.

```anim
v1: 5 fill red colour white
```

+++

```anim
a: insert v1 at 0 keep-style
```

+++

```anim
v2: a.0 keep-style
```

+++

Without it, the box keeps its own look.

```anim
a.1: v2
```

</animation>

## Feature: name and indices

<animation grid="14x7">

A name sits left of a var or row, above a column. Indices are small and muted: below a row's cells, left of a column's.

```anim
total: var 0 at 4,1.5 name "total"
arr: row [5 null 8] at 4,3.5 name "arr" indices
st: column [4 9] at 12,2 name "stack" indices fill teal
```

---

## They move with it

```anim
total: move 2,6
arr: move 7,4.5 speed slow
```

+++

```anim
total: name "sum" above
```

---

## An outline takes them in

```anim
total: highlight outline
arr: highlight outline
st: highlight outline
```

+++

```anim
total: highlight clear
arr: highlight clear
st: highlight clear
```

---

## Indices stay with the places

```anim
arr: swap 0 2
```

+++

The last index comes and goes with the slot.

```anim
arr: insert 3 at end
st: remove end
```

+++

```anim
arr: remove 0
```

---

## Switching off

```anim
arr: indices clear
total: name clear
```

+++

Deleting a row deletes its name and indices.

```anim
st: delete
```

</animation>

## Feature: code

<animation grid="16x7">

A code block: its lines in [ ] (one per line, the closing "]" lined up with the id), highlighted by Prism. Lines are numbered from 1, like line numbers.

```anim
c: code [
    "total = 0",
    "for n in [5, 3, 8]:",
    "    total += n"
] at 2,2 lang python name "sum.py" numbered
nums: row [5 3 8] at 12,2 name "nums"
total: var 0 at 12,4 name "total"
```

---

## Highlighting a line

```anim
c.2: highlight line
nums.0: fill amber
```

+++

```anim
c.2: highlight clear
c.3: highlight line
total: 5
```

+++

A text can be highlighted too, and a fill on a line works as well.

```anim
note: text "adds each number" at 12,5.5 highlight line
c.3: highlight clear
c.1: fill teal
```

---

## Changing lines

A longer line widens the block.

```anim
c.1: fill none
note: delete
c: insert "print(total)  # 16" at end
```

+++

```anim
c.1: "total = 100" speed slow
```

+++

```anim
c: swap 1 2
```

+++

```anim
c: remove 1
c: font 0.8
```

---

## One line, typed

A single line goes in quotes. Typed, a block's lines type out one after another.

```anim
s: code "console.log(\"Hello, world!\")" lang js at 2,6 typed
```

+++

```anim
s: "console.log(42)"
```

+++

```anim
p: code [
    "def greet(name):",
    "    return f\"Hi {name}\""
] at 10,5.5 lang python typed speed 2
```

+++

```anim
p: delete typed
c: delete
```

</animation>

## Feature: Emphasis

<animation grid="12x3">

```anim
defaults size 1.6x0.8 font 0.6
pu: rect "pulse" at 2,2
sh: rect "shake" at 4,2
wo: rect "wobble" at 6,2
bn: rect "bounce" at 8,2
gl: rect "glow" at 10,2
defaults clear
```

---

```anim
pu: pulse
```

+++

```anim
sh: shake
```

+++

```anim
wo: wobble
```

+++

```anim
bn: bounce
```

+++

```anim
gl: glow
```


</animation>

## Feature: signal

<animation grid="12x5">

```anim
a: circle "a" at 2,2
b: rect "b" at 10,2
l: arrow from a to b stroke muted
c: curve from a to b via 6,4.5 stroke muted
```

---

## signal

```anim
l: signal
```

+++

```anim
c: signal speed slow
```

---

## signal-reverse

```anim
l: signal-reverse
```

---

## On a group: each of its lines

```anim
g: group [a, b, l, c]
g: signal speed fast
```

</animation>

## Feature: Highlights

<animation grid="12x3">

```anim
defaults size 1.6x0.8 font 0.6
bx: rect "outline" at 2,2
ar: rect "arrow" at 5,2
hg: rect "glow" at 8,2
nu: rect "number" at 11,2
defaults clear
```

---

```anim
bx: highlight outline
ar: highlight arrow
hg: highlight glow
nu: highlight number 1
```

+++

```anim
nu: highlight number 2
```

---

## clear

```anim
bx: highlight clear
ar: highlight clear
hg: highlight clear
nu: highlight clear
```

</animation>

## Feature: Numbers

A bare `number` takes the next one; `number N` sets where the sequence is. On a row, column or group, a bare one numbers each shape in turn.

<animation grid="14x5">

```anim
defaults size 1.2x0.8 font 0.6
a: rect "a" at 2,1.5
b: rect "b" at 4.5,1.5
c: rect "c" at 7,1.5
d: rect "d" at 9.5,1.5
e: rect "e" at 12,1.5
defaults clear
```

---

## 1, 2, then 5, 6, 7

```anim
a: highlight number
b: highlight number
c: highlight number 5
d: highlight number
e: highlight number
```

---

## A row numbers its cells

```anim
arr: row [4, 8, 2] at 2,4 highlight number
```

---

## A group, staggered

```anim
p: circle "p" at 10,4 radius 0.4
q: circle "q" at 12,4 radius 0.4
pq: group [p, q]
```

+++

```anim
pq: highlight number stagger 0.3
```

</animation>

## Feature: Outline and inside

The outline follows each shape's own outline (turned and scaled with it); inside sits just within its stroke.

<animation grid="14x5">

```anim
r: rect "rect" at 2,2 size 2x1
rc: rect "corner" at 5,2 size 2x1 corner 0.3
c: circle "circle" at 8,2 radius 0.7
d: diamond "diamond" at 11,2 size 2x1.4
t: text "text" at 13.5,2
tr: rect "turned" at 2.5,4.2 size 2x0.8 angle 20
th: rect "thick" at 6,4.2 size 2x0.8 weight 3
sc: circle "scaled" at 9,4.2 radius 0.6 scale 1.5
i: icon(laptop) "icon" at 12,4
```

---

## outline

```anim
r: highlight outline
rc: highlight outline
c: highlight outline
d: highlight outline
t: highlight outline
tr: highlight outline
th: highlight outline
sc: highlight outline
i: highlight outline
```

+++

```anim
tr: angle +45
sc: pulse
```

---

## inside

```anim
r: highlight clear inside
rc: highlight clear inside
c: highlight clear inside
d: highlight clear inside
t: highlight clear
tr: highlight clear inside
th: highlight clear inside
sc: highlight clear inside
i: highlight clear inside
```

---

## Both

```anim
r: highlight outline
rc: highlight outline
c: highlight outline
d: highlight outline
tr: highlight outline
th: highlight outline
sc: highlight outline
i: highlight outline
```

</animation>

## Feature: Spotlight

Everything else dims, including their highlights and callouts.

<animation grid="12x3">

```anim
a: rect "a" at 2,2
b: rect "b" at 5,2 highlight outline
c: rect "c" at 8,2 callout "hi"
d: rect "d" at 11,2
```

---

```anim
a: highlight spotlight
```

+++

Several can be spotlit.

```anim
d: highlight spotlight
```

---

## clear

```anim
a: highlight clear
d: highlight clear
```

</animation>

## Feature: Callouts

<animation grid="12x4">

```anim
a: rect "a" at 6,2.5
edge: rect "edge" at 11.5,0.5
```

---

```anim
a: callout "Look at this!"
```

+++

```anim
a: callout "Now below" below
```

+++

Long text wraps.

```anim
a: callout "A much longer callout that wraps onto several lines" left-of
```

+++

It stays inside the drawing.

```anim
a: callout clear
edge: callout "Near the edge"
```

</animation>

## Feature: speed

<animation grid="12x7">

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
s4: move 11,4
s5: move 11,5 speed slow
s6: move 11,6 speed vslow
s7: move 11,7 speed 3
```

</animation>

## Feature: delay

<animation grid="12x3">

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

## Feature: stagger

<animation grid="12x5">

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

<animation grid="8x8" autoplay>

```anim
c1: column 6 at 2,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15
c2: column 6 at 3,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 1
c3: column 6 at 4,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 2
c4: column 6 at 5,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 3
c5: column 6 at 6,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 4
c6: column 6 at 7,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 5
auto
```

+++

```anim
c1: fill red    stagger 0.15
c2: fill orange stagger 0.15 delay 1
c3: fill yellow stagger 0.15 delay 2
c4: fill green  stagger 0.15 delay 3
c5: fill cyan   stagger 0.15 delay 4
c6: fill purple stagger 0.15 delay 5
auto
```

+++

```anim
c1: fill green  stagger-reverse 0.15
c2: fill cyan   stagger-reverse 0.15 delay 1
c3: fill purple stagger-reverse 0.15 delay 2
c4: fill red    stagger-reverse 0.15 delay 3
c5: fill orange stagger-reverse 0.15 delay 4
c6: fill yellow stagger-reverse 0.15 delay 5
auto
```

+++

```anim
c1: delete stagger 0.15
c2: delete stagger 0.15 delay 1
c3: delete stagger 0.15 delay 2
c4: delete stagger 0.15 delay 3
c5: delete stagger 0.15 delay 4
c6: delete stagger 0.15 delay 5
auto
```

</animation>

## Feature: ease

<animation grid="12x6">

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
e1: move 11,1 speed slow
e2: move 11,2 speed slow ease linear
e3: move 11,3 speed slow ease in
e4: move 11,4 speed slow ease out
e5: move 11,5 speed slow ease spring
```

---

## spring on pop, and on the camera

```anim
b: rect "spring" at 7,3 size 2x1 fill pink pop ease spring
camera at b zoom 1.5 ease spring
```

+++

```anim
camera reset ease out
```

</animation>

## Feature: Entrance and exit effects

<animation grid="12x4">

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

<animation grid="12x3">

```anim
prompt: text "$" at 2,1 mono colour yellow
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

## Feature: defaults

<animation grid="12x4">

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

## Feature: Camera

<animation grid="12x6">

```anim
a: rect "a" at 2,2 fill red
b: circle "b" at 10,5 fill blue
l: arrow from a to b
```

---

## at a zoom 3

```anim
camera at a zoom 3
```

---

## at 6,3.5 zoom 2

```anim
camera at 6,3.5 zoom 2 speed slow
```

---

## reset

```anim
camera reset
```

---

## zoom 0.8 move +1,+0

Zoomed out and nudged.

```anim
camera zoom 0.8 move +1,+0
```

+++

```anim
camera reset speed fast
```

</animation>

## Feature: Camera travel

<animation grid="12x6">

```anim
a: circle "a" at 2,2
b: circle "b" at 10,2
c: circle "c" at 10,5
d: circle "d" at 2,5
```

---

```anim
camera at a zoom 3
```

+++

```anim
camera travel b c d
```

+++

```anim
camera reset speed slow
```

</animation>

## Feature: range

<animation grid="12x4">

```anim
arr: row [5, 3, 8, 1, 9, 2] at 3,2 size 1 gap 0.2 indices
```

---

## A look on some cells

```anim
arr: range 0 2 fill green
```

+++

```anim
arr: range 4 1 fill amber          # either way round
```

---

## Highlights and emphasis, staggered

```anim
arr: range 3 5 highlight outline stagger 0.2
```

+++

```anim
arr: range 1 4 pulse stagger 0.1
```

+++

```anim
arr: range 0 5 highlight clear
```

</animation>

## Feature: Bars

<animation grid="13x6">

```anim
arr: row [5, 3, 8, 1, 9, 2] at 2,4 bar stroke none fill pink size 0.6x3 gap 0.15 indices
hp: var 67 name "health" at 10,2 size 3x0.7 bar fill green track red corner 0.25
```

---

## Swapping bars, a new value, hidden values

```anim
arr: swap 0 3
hp: 30
```

+++

```anim
arr.2: 4
hp: 100
```

+++

```anim
arr: colour none
hp: colour none
```

---

## A value on the move

```anim
t: var 0 at 10,4 size 3x0.5 bar max 9 fill blue name "avg"
```

+++

```anim
t: arr.3
```

---

## Some cells, a new max, and back to boxes

```anim
arr: range 0 2 fill amber
hp: max 200
```

+++

```anim
arr: bar clear
hp: track none
```

</animation>

## Feature: Horizontal bars

A column of wide bars is a bar chart: the bars grow from the left, with their values at the right.

<animation grid="10x6">

```anim
votes: column [12 7 15 4 9] at 4,1.5 bar stroke none fill teal size 4x0.7 gap 0.15 name "Votes" indices
```

---

## Changes

```anim
votes.3: 14
```

+++

```anim
votes: swap 2 3
```

+++

```anim
votes: range 0 1 fill amber
```

+++

```anim
votes: remove 4
```

</animation>

## Errors

Bad lines are listed under the animation and skipped; the rest still draws.

See [here](animation-errors.md)

### Source in a code fence

This block must stay as code:

````markdown
<animation>
```anim
a: rect at 2,3
```
</animation>
````
