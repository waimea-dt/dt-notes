# Animation: Examples

Whole animations, as they would appear in notes. Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Bubble Sort

<animation name="Bubble Sort" grid="12x5">

# Bubble Sort: One Pass

We start with an unsorted array.

```anim
arr: row [5 3 8 1] at 3,3 font 3 size 1.8 gap 0.2 corner 0.05 fill blue
```

---

## Compare the first pair

Is `5` bigger than `3`?

```anim
comp: span arr 0 1 fill pink-bright name "Compare"
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

```anim
arr.1: fill blue
```

Note:
Ask the class to predict the next comparison before advancing.

---

## Compare the next pair

Is `5` bigger than `8`?

```anim
comp: span arr 1 2
```

+++

No it's not

```anim
arr.2: fill amber pulse
```

+++

So they remain in place...

```anim
arr.2: fill blue
```

Note:
Ask the class to predict the next comparison before advancing.

---

## Compare the next pair

Is `8` bigger than `1`?

```anim
comp: span arr 2 3
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
arr.3: fill blue
comp: delete
```

+++

The largest value, 8, has 'bubbled' to the end!

```anim
arr.3: fill green wiggle speed fast
```

</animation>

## Travelling Salesperson

<animation name="TSP">

# Travelling Salesperson

Five cities, with a road between every pair. The salesperson starts at **A**.

```anim
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

## Public-Key Encryption

<animation name="Public-Key" grid="16x8">

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

## HTTPS: The TLS Handshake

<animation name="TLS Handshake" grid="16x8">

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

## RGB Colours

<animation name="RGB Colours" grid="12x7">

## Three colour values: R, G, B

```anim
defaults corner 0.1 max 255 size 5x1 track black stroke muted colour contrast
r: var 0 name "r" bar at 4,2 fill #f00
g: var 0 name "g" bar at 4,4 fill #0f0
b: var 0 name "b" bar at 4,6 fill #00f
```

+++

Mixed together...

```anim
defaults stroke fg
plus: circle at 8.5,4 size 1 "+"
ra: arrow from 6.5,2.5 to plus stroke red
ga: arrow from 6.5,4.0 to plus stroke green
ba: arrow from 6.5,5.5 to plus stroke blue
```

+++

... to form a colour

```anim
col: rect at 11,4 size 2x5 fill rgb(r g b)    # follows r, g and b
ca: arrow from plus to col
```

---

## Changing the RGB values, changes the colour

```anim
r: 64
```
+++

```anim
r: 128
```
+++

```anim
r: 255
```
+++

```anim
r: 0
g: 255
```
+++

```anim
g: 0
b: 255
```
+++

```anim
g: 255
```
+++

```anim
b: 0
r: 255
```
+++

```anim
g: 0
b: 255
```
+++

```anim
g: 255
```
+++

A value moved in: the colour changes as it lands.

```anim
r: b
g: 0
b: 0
```

</animation>

## Binary and Colours

<animation grid="16x7" name="Binary and Colours">

## Three binary values: R, G, B

```anim
r: binary 0 name "r" at 2,2 powers fill rgb(r 0 0) stroke red decimal   # its fill follows its own value
g: binary 0 name "g" at 2,4 powers fill rgb(0 g 0) stroke green decimal
b: binary 0 name "b" at 2,6 powers fill rgb(0 0 b) stroke blue decimal
```

+++

Mixed together...

```anim
plus: circle at 12.5,4 "+"
ra: arrow from 11,2.5 to plus stroke red
ga: arrow from 11,4.0 to plus stroke green
ba: arrow from 11,5.5 to plus stroke blue
```

+++

... to form a colour

```anim
col: rect at 15,4 size 2x5 fill rgb(r g b) corner 0.1    # follows the three numbers
ca: arrow from plus to col
```

---

## Changing the RGB values, changes the colour

```anim
r: 255
```
+++

```anim
r: 0
g: 255
```
+++

```anim
g: 0
b: 255
```
+++

```anim
r: 255
```

</animation>

## Stagger Rainbow

Columns popping in, recolouring and going, each a beat behind the last, on a loop.

<animation grid="8x8" autoplay name="Colours">

# Colour Test

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

## Space Mission

Backdrop, an arc with a turn and a shrink, the camera riding along, a spinning asteroid, zooming out past the stage's edge.

<animation name="Space Mission" grid="16x12" crop>

# Space Mission

On the launch pad.

```anim
bg: image(../_assets/scratch/stages/space.svg) at 8.5,6.5 size 16x12 back
earth: image(../_assets/scratch/sprites/earth.svg) at 3,10 size 5
moon: image(../_assets/scratch/sprites/moon.svg) at 13.5,3 size 2.5
rocket: image(../_assets/scratch/sprites/rocket1.svg) at 4,7 size 1.5x2.5 angle up pop
```

---

## Countdown

The camera zooms in on the rocket.

```anim
camera at rocket zoom 2.5 speed slow
```

+++

```anim
rocket: shake
```

---

## Lift off

An arc towards the moon: turning a further 60° (a signed angle on a change is relative) to face it, and shrinking with distance, with the camera following at the same speed.

```anim
rocket: move 11,4 via 5,2 angle +60 scale 0.6 speed vslow
camera at rocket zoom 1.5 speed vslow
```

---

## Asteroid field

The camera pulls back. An asteroid spins (linear, a full turn) as it drifts across, and a second one tumbles past on a wave.

```anim
camera reset speed slow
a1: image(../_assets/scratch/sprites/asteroid.svg) at 15,9 size 1.5 pop
a2: image(../_assets/scratch/sprites/asteroid.svg) at 1,5 size 0.8 angle 30 pop
```

+++

```anim
a1: move 7,9 angle +360 speed vslow ease linear
a2: move 15,6 via 5,3 via 10,8 angle +540 scale 1.5 speed vslow ease linear
```

---

## Landing

The rocket turns upright and settles on the moon, the camera closing in.

```anim
a1: delete
a2: delete
rocket: move 13.5,1.4 angle up scale 0.4 speed slow
camera at moon zoom 3 speed slow
```

+++

```anim
astro: image(../_assets/scratch/sprites/astronaut.svg) at 14.4,2.2 size 0.6 pop
```

+++

```anim
astro: bounce
flag: image(../_assets/scratch/sprites/flag.svg) at 12.7,2.3 size 0.6 pop
```

---

## Visitors

Zoom out past the stage (zoom below 1): the stage shows smaller, and with `crop` nothing outside it is drawn, so the UFO appears at its edge as it flies in, wobbling, and zips round the scene.

```anim
camera at 8.5,6.5 zoom 0.7 speed slow
ufo: image(../_assets/scratch/sprites/ufo.svg) at -2,1 size 2 front
```

+++

```anim
ufo: travel 8,2 14,7 6,10 speed fast
```

+++

```anim
ufo: wobble
ufo: scale 1.6 angle -15 speed fast
```

---

## Home again

```anim
camera reset speed slow
ufo: move 19,-2 scale 0.5 speed slow
earth: angle +90 speed vslow
```

</animation>

## Under the Sea

Sprites over the water backdrop: swimming on waves, a group moving as one, a crab scuttling, a turtle following a hidden curve, and the camera travelling between them.

<animation name="Under the Sea" grid="16x12" crop>

# Under the Sea

```anim
bg: image(../_assets/scratch/stages/water.svg) at 8.5,6.5 size 16x12 back
crab: image(../_assets/scratch/sprites/crab.svg) at 3,11 size 1.5
turtle: image(../_assets/scratch/sprites/turtle.svg) at 13,9 size 2.5
f1: image(../_assets/scratch/sprites/fish.svg) at 2,3 size 1.5 pop
f2: image(../_assets/scratch/sprites/fish.svg) at 3,4.5 size 1 pop delay 0.2
f3: image(../_assets/scratch/sprites/fish.svg) at 1.5,5.5 size 0.8 pop delay 0.4
```

---

## A school of fish

Grouped, they swim as one along a wave, each fish tilting up then down.

```anim
school: group [f1 f2 f3]
school: move 8,3 via 5,1.5 speed slow
f1: angle -10 speed slow
f2: angle -10 speed slow
f3: angle -10 speed slow
```

+++

```anim
school: move 13,5 via 10.5,6.5 speed slow
f1: angle 15 speed slow
f2: angle 15 speed slow
f3: angle 15 speed slow
```

---

## Scuttle

The camera follows the crab along the sea bed.

```anim
camera at crab zoom 2.5 speed slow
```

+++

```anim
crab: move 9,11 speed slow ease linear
camera at crab zoom 2.5 speed slow ease linear
```

+++

```anim
crab: shake
crab: scale 1.3 speed fast
```

---

## The turtle's route

The turtle follows a curve whose line is hidden (`weight 0`).

```anim
camera reset speed slow
route: curve from turtle to 4,7 via 11,4 via 6,3 weight 0
```

+++

```anim
turtle: follow route angle -20 speed vslow
```

---

## Tour

The camera travels between the three, then shows the whole scene.

```anim
camera travel school crab turtle zoom 2 speed slow
```

+++

```anim
camera reset
school: ungroup
f1: move +4,-1 scale 1.4 speed slow
f2: move +2,+2 angle +360 speed slow
f3: delete pop
```

</animation>
