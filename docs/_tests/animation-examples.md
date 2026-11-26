# Animation: Examples

Whole animations, as they would appear in notes. Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Bubble Sort

<animation name="Bubble Sort" grid="12x5">

# Bubble Sort

We start with an unsorted array.

```anim
Arr: row [5 3 8 1] at 3,2 font 2 size 1.5x3 gap 0.5 corner 0.05 fill blue bar stroke none
```

---

## Compare the first pair

Is `5` bigger than `3`?

```anim
Comp: span Arr 0 1 stroke pink-bright name "Compare"
auto
```

+++

Yes it is! So they swap places...

```anim
Arr.0: fill amber glow
then
Arr: swap 0 1
then
Arr.1: fill blue
```

---

## Compare the next pair

Is `5` bigger than `8`?

```anim
Comp: span Arr 1 2
auto
```

+++

No it's not, so they stay in place...

```anim
Arr.2: fill amber glow
then
Arr.2: fill blue
```

---

## Compare the next pair

Is `8` bigger than `1`?

```anim
Comp: span Arr 2 3
auto
```

+++

Yes it is! So they swap places...

```anim
Arr.2: fill amber glow
then
Arr: swap 2 3
then
Arr.3: fill blue
Comp: opacity 0
```

---

## First value done!

The first pass is complete

The largest value, 8, has 'bubbled' to the end

```anim
Arr.3: fill green bounce speed fast
```

---

## Second pass

Back to the start. Is `3` bigger than `5`?

```anim
Comp: span Arr 0 1 speed instant
then
Comp: opacity reset
auto
```

+++

No it's not, so they stay in place...

```anim
Arr.1: fill amber glow
then
Arr.1: fill blue
```

---

## Compare the next pair

Is `5` bigger than `1`?

```anim
Comp: span Arr 1 2
auto
```

+++

Yes it is! So they swap places...

```anim
Arr.1: fill amber glow
then
Arr: swap 1 2
then
Arr.2: fill blue
Comp: opacity 0
```

---

## Second value done!

`8` is already in place, so there's no need to compare with it

`5` has bubbled up next to it

```anim
Arr.2: fill green bounce speed fast
```

---

## Third pass

Is `3` bigger than `1`?

```anim
Comp: span Arr 0 1 speed instant
then
Comp: opacity reset
auto
```

+++

Yes it is! So they swap places...

```anim
Arr.0: fill amber glow
then
Arr: swap 0 1
then
Arr.1: fill blue
Comp: delete
```

---

## Sorted!

`3` is in place, which leaves `1` on its own - so it must be in place too

```anim
Arr.1: fill green bounce speed fast
then
Arr.0: fill green bounce speed fast
```

</animation>

## Travelling Salesperson

<animation name="TSP">

# Travelling Salesperson

Five cities, with a road between every pair. The salesperson starts at **A**.

```anim
A: circle "A" at 3,6
B: circle "B" at 6,2
C: circle "C" at 11,3
D: circle "D" at 13,6
E: circle "E" at 7,7

defaults stroke muted back
Ab: line from A to B
Ac: line from A to C
Ad: line from A to D
Ae: line from A to E
Bc: line from B to C
Bd: line from B to D
Be: line from B to E
Cd: line from C to D
Ce: line from C to E
De: line from D to E

defaults clear
S: icon(user) left-of A gap 0.1 pop front
A: fill blue
```

---

## A to B

The first leg of the route.

```anim
defaults stroke blue weight 2 speed slow
R1: arrow from A to B draw
S: move above B gap 0.1
B: fill blue delay 0.5
```

---

## B to C

```anim
R2: arrow from B to C draw
S: move above C gap 0.1
C: fill blue delay 0.5
```

---

## C to D

```anim
R3: arrow from C to D draw
S: move right-of D gap 0.1
D: fill blue delay 0.5
```

---

## D to E

Every city has now been visited.

```anim
R4: arrow from D to E draw
S: move below E gap 0.1
E: fill blue delay 0.5
```

---

## E back to A

The salesperson returns home to finish the tour.

```anim
R5: arrow from E to A draw
S: move left-of A gap 0.1
A: fill green delay 0.5
```

+++

```anim
Ac: delete
Ad: delete
Bd: delete
Be: delete
Ce: delete
auto
```

---

The route is **A → B → C → D → E → A**. Is it the shortest one?

```anim
camera move A zoom 1.5
auto
```

+++

```anim
camera travel B C D E A delay 0.5
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
Net: line from 1,5.5 to 15,5.5 dashed stroke muted "the internet" back
Alice: icon(user) "Alice" at 2,3 scale 1.5
Bob: icon(user) "Bob" at 14,3 scale 1.5
Eve: icon(venetian-mask) "Eve" at 8,7 scale 1.2 stroke muted
Msg: rect "Hi Bob" at 4,5.5 size 2x0.8 fill blue
```

---

## Bob makes a key pair

Bob creates two matching keys. Anything locked with his **public key** can only be unlocked with his **private key**.

```anim
Pub: icon(key-round) "Public" at 12,1.5 stroke green pop
Priv: icon(key-round) "Private" at 15.2,1.5 stroke red pop
```

+++

The private key never leaves Bob.

```anim
Priv: weight 1.5 speed fast
```

---

## Bob shares his public key

It's public, so Bob gives a copy to anyone who asks: Alice, and Eve too.

```anim
PubA: copy Pub move 4,2 via 8,1.3 speed slow
PubE: copy Pub move 9.5,7 via 11,4.5 speed slow
```

---

## Alice locks the message

Alice locks her message with **Bob's public key**. It's now scrambled.

```anim
PubA: move above Msg speed slow
Msg: "x7#q!" fill amber delay 1
Lock: icon(lock) attach right-of Msg stroke amber pop delay 1
```

+++

Even Alice can't unlock it now: a public key can only lock.

```anim
PubA: move 4,2
```

---

## Sending it

The scrambled message travels across the internet (the lock is attached, so it goes too).

```anim
Msg: move +8,+0 speed slow
```

+++

Eve copies it as it passes, but her public key can't unlock it. All she sees is `x7#q!`.

```anim
Eve: stroke red callout "x7#q! ???" left-of
PubE: shake
```

---

## Bob unlocks it

Only **Bob's private key** can unlock the message.

```anim
Eve: callout clear
Priv: move Lock speed slow front
Lock: delete pop delay 1
Msg: "Hi Bob" fill green delay 1 pulse
```

+++

His private key goes straight back where it was. It never travelled across the internet.

```anim
Priv: move 15.2,1.5 speed slow
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
Net: line from 1,5.5 to 15,5.5 dashed stroke muted "the internet" back
Browser: icon(laptop) "Browser" at 2,3 scale 1.5
Server: icon(server) "bank.example" at 14,3 scale 1.5
Eve: icon(venetian-mask) "Eve" at 8,7 scale 1.2 stroke muted
```

---

## 1. Client Hello

The browser says hello, listing the encryption methods it supports.

```anim
M1: rect "Hello + options" at 4.5,5.5 size 3x0.8 font 0.8 fill blue pop
```

+++

It's sent in the open. Eve can read it, but there's nothing secret in it.

```anim
M1: move +7,+0 speed slow
```

---

## 2. Server Hello and certificate

The server picks a method and replies with its **certificate**: its **public key**, signed by a certificate authority (CA) that browsers trust. Its **private key** stays on the server.

```anim
M1: delete
Pub: icon(key-round) "Public" at 12.3,0.9 stroke green pop
Priv: icon(key-round) "Private" at 15.3,0.9 stroke red pop
M2: rect "Certificate" at 11.5,5.5 size 3x0.8 font 0.8 fill teal pop
PubB: icon(key-round) attach above M2 stroke green scale 0.8 pop
```

+++

The public key is attached to the certificate, so it travels with it.

```anim
M2: move -7,+0 speed slow
```

---

## 3. The browser checks the certificate

It checks the CA's signature, the name **bank.example** and the dates. A fake certificate fails here, so Eve can't pretend to be the bank.

```anim
M2: fill green delay 0.25 highlight outline
Check: icon(badge-check) attach left-of M2 stroke green pop
```

---

## 4. Key exchange

The browser makes a brand-new random **session key**.

```anim
M2: delete
Check: delete
Sess: icon(key-round) "Session key" at 4.5,2 stroke amber pop
```

+++

It locks a copy with the **server's public key**...

```anim
PubB: move 4.5,4.3 speed slow
M3: rect "session key" at 4.5,5.5 size 3x0.8 font 0.8 fill amber pop delay 1
Lock3: icon(lock) attach right-of M3 stroke amber pop delay 1
```

+++

...and sends it. Eve sees it pass, but only the server's **private key** can unlock it.

```anim
PubB: delete
M3: move +7,+0 speed slow
```

---

## 5. Both sides share the session key

The server unlocks it with its private key. Now both sides have the same session key, and Eve doesn't.

```anim
Priv: move Lock3 speed slow front
Lock3: delete pop delay 1
M3: delete delay 1
Ssk: icon(key-round) "Session key" at 10,2 stroke amber pop delay 1.2
```

+++

The public and private keys have done their job. From here on, everything is locked and unlocked with the session key. This is **symmetric encryption**: much faster than public and private keys.

```anim
Pub: delete speed slow
Priv: delete speed slow
Sess: weight 1.5
Ssk: weight 1.5
```

---

## 6. An encrypted request

The browser asks for the page...

```anim
Req: rect "GET /balance" at 4.5,5.5 size 3x0.8 font 0.8 fill blue pop
```

+++

...locks it with the session key...

```anim
Req: "k#2@Lp" fill amber
Lk4: icon(lock) attach right-of Req stroke amber pop
```

+++

...and sends it. Eve only sees scrambled data.

```anim
Req: move +7,+0 speed slow
Eve: callout "k#2@Lp ???" left-of
```

---

## 7. An encrypted response

The server unlocks the request with its copy of the session key...

```anim
Eve: callout clear
Lk4: delete pop
Req: "GET /balance" fill blue
```

+++

...and locks its response the same way before sending it back.

```anim
Req: delete
Res: rect "Zq!7x" at 11.5,5.5 size 3x0.8 font 0.8 fill amber pop
Lk5: icon(lock) attach left-of Res stroke amber pop
```

+++

```anim
Res: move -7,+0 speed slow
```

+++

The browser unlocks it and shows the page.

```anim
Lk5: delete pop
Res: "Balance: $42" fill green pulse
```

---

## The padlock

That padlock in the address bar means all of this happened: the certificate checked out, and everything since has been encrypted with the session key.

```anim
Pad: icon(lock) "https://" above Browser stroke green pop
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
defaults corner 0.1 max 255 size 5x1 track black stroke muted ink contrast
R: var 0 name "r" bar at 4,2 fill #f00
G: var 0 name "g" bar at 4,4 fill #0f0
B: var 0 name "b" bar at 4,6 fill #00f
```

+++

Mixed together...

```anim
defaults stroke fg
Plus: circle at 8.5,4 size 1 "+"
Ra: arrow from 6.5,2.5 to Plus stroke red
Ga: arrow from 6.5,4.0 to Plus stroke green
Ba: arrow from 6.5,5.5 to Plus stroke blue
```

+++

... to form a colour

```anim
Col: rect at 11,4 size 2x5 fill rgb({R} {G} {B})    # follows R, G and B
Ca: arrow from Plus to Col
```

---

## Changing the RGB values, changes the colour

```anim
R: 64
```
+++

```anim
R: 128
```
+++

```anim
R: 255
```
+++

```anim
R: 0
G: 255
```
+++

```anim
G: 0
B: 255
```
+++

```anim
G: 255
```
+++

```anim
B: 0
R: 255
```
+++

```anim
G: 0
B: 255
```
+++

```anim
G: 255
```
+++

A value moved in: the colour changes as it lands.

```anim
R: B
G: 0
B: 0
```

</animation>

## Binary and Colours

<animation grid="16x7" name="Binary and Colours">

## Three binary values: R, G, B

```anim
R: binary 0 name "r" at 2,2 powers fill rgb({R} 0 0) stroke red decimal   # its fill follows its own value
G: binary 0 name "g" at 2,4 powers fill rgb(0 {G} 0) stroke green decimal
B: binary 0 name "b" at 2,6 powers fill rgb(0 0 {B}) stroke blue decimal
```

+++

Mixed together...

```anim
Plus: circle at 12.5,4 "+"
Ra: arrow from 11,2.5 to Plus stroke red
Ga: arrow from 11,4.0 to Plus stroke green
Ba: arrow from 11,5.5 to Plus stroke blue
```

+++

... to form a colour

```anim
Col: rect at 15,4 size 2x5 fill rgb({R} {G} {B}) corner 0.1    # follows the three numbers
Ca: arrow from Plus to Col
```

---

## Changing the RGB values, changes the colour

```anim
R: 255
```
+++

```anim
R: 0
G: 255
```
+++

```anim
G: 0
B: 255
```
+++

```anim
R: 255
```

</animation>

## Stagger Rainbow

Columns popping in, recolouring and going, each a beat behind the last, on a loop.

<animation grid="8x8" autoplay name="Colours">

# Colour Test

```anim
C1: column 6 at 2,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15
C2: column 6 at 3,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 1
C3: column 6 at 4,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 2
C4: column 6 at 5,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 3
C5: column 6 at 6,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 4
C6: column 6 at 7,2 size 0.8 gap 0.2 corner 0.5 pop stagger 0.15 delay 5
auto
```

+++

```anim
C1: fill red    stagger 0.15
C2: fill orange stagger 0.15 delay 1
C3: fill yellow stagger 0.15 delay 2
C4: fill green  stagger 0.15 delay 3
C5: fill cyan   stagger 0.15 delay 4
C6: fill purple stagger 0.15 delay 5
auto
```

+++

```anim
C1: fill green  stagger-reverse 0.15
C2: fill cyan   stagger-reverse 0.15 delay 1
C3: fill purple stagger-reverse 0.15 delay 2
C4: fill red    stagger-reverse 0.15 delay 3
C5: fill orange stagger-reverse 0.15 delay 4
C6: fill yellow stagger-reverse 0.15 delay 5
auto
```

+++

```anim
C1: delete stagger 0.15
C2: delete stagger 0.15 delay 1
C3: delete stagger 0.15 delay 2
C4: delete stagger 0.15 delay 3
C5: delete stagger 0.15 delay 4
C6: delete stagger 0.15 delay 5
auto
```

</animation>

## Space Mission

Backdrop, an arc with a turn and a shrink, the camera riding along, a spinning asteroid, zooming out past the stage's edge.

<animation name="Space Mission" grid="16x12" crop>

# Space Mission

On the launch pad.

```anim
Bg: image(../_assets/scratch/stages/space.svg) at 8.5,6.5 size 16x12 back
Earth: image(../_assets/scratch/sprites/earth.svg) at 3,10 size 5
Moon: image(../_assets/scratch/sprites/moon.svg) at 13.5,3 size 2.5
Rocket: image(../_assets/scratch/sprites/rocket1.svg) at 4,7 size 1.5x2.5 angle up pop
```

---

## Countdown

The camera zooms in on the rocket.

```anim
camera move Rocket zoom 2.5 speed slow
```

+++

```anim
Rocket: shake
```

---

## Lift off

An arc towards the moon: turning a further 60° (a signed angle on a change is relative) to face it, and shrinking with distance, with the camera following at the same speed.

```anim
Rocket: move 11,4 via 5,2 angle +60 scale 0.6 speed vslow
camera move Rocket zoom 1.5 speed vslow
```

---

## Asteroid field

The camera pulls back. An asteroid spins (linear, a full turn) as it drifts across, and a second one tumbles past on a wave.

```anim
camera reset speed slow
A1: image(../_assets/scratch/sprites/asteroid.svg) at 15,9 size 1.5 pop
A2: image(../_assets/scratch/sprites/asteroid.svg) at 1,5 size 0.8 angle 30 pop
```

+++

```anim
A1: move 7,9 angle +360 speed vslow ease linear
A2: move 15,6 via 5,3 via 10,8 angle +540 scale 1.5 speed vslow ease linear
```

---

## Landing

The rocket turns upright and settles on the moon, the camera closing in.

```anim
A1: delete
A2: delete
Rocket: move 13.5,1.4 angle up scale 0.4 speed slow
camera move Moon zoom 3 speed slow
```

+++

```anim
Astro: image(../_assets/scratch/sprites/astronaut.svg) at 14.4,2.2 size 0.6 pop
```

+++

```anim
Astro: bounce
Flag: image(../_assets/scratch/sprites/flag.svg) at 12.7,2.3 size 0.6 pop
```

---

## Visitors

Zoom out past the stage (zoom below 1): the stage shows smaller, and with `crop` nothing outside it is drawn, so the UFO appears at its edge as it flies in, wobbling, and zips round the scene.

```anim
camera move 8.5,6.5 zoom 0.7 speed slow
Ufo: image(../_assets/scratch/sprites/ufo.svg) at -2,1 size 2 front
```

+++

```anim
Ufo: travel 8,2 14,7 6,10 speed fast
```

+++

```anim
Ufo: wobble
Ufo: scale 1.6 angle -15 speed fast
```

---

## Home again

```anim
camera reset speed slow
Ufo: move 19,-2 scale 0.5 speed slow
Earth: angle +90 speed vslow
```

</animation>

## Under the Sea

Sprites over the water backdrop: swimming on waves, a group moving as one, a crab scuttling, a turtle following a hidden curve, and the camera travelling between them.

<animation name="Under the Sea" grid="16x12" crop>

# Under the Sea

```anim
Bg: image(../_assets/scratch/stages/water.svg) at 8.5,6.5 size 16x12 back
Crab: image(../_assets/scratch/sprites/crab.svg) at 3,11 size 1.5
Turtle: image(../_assets/scratch/sprites/turtle.svg) at 13,9 size 2.5
F1: image(../_assets/scratch/sprites/fish.svg) at 2,3 size 1.5 pop
F2: image(../_assets/scratch/sprites/fish.svg) at 3,4.5 size 1 pop delay 0.2
F3: image(../_assets/scratch/sprites/fish.svg) at 1.5,5.5 size 0.8 pop delay 0.4
```

---

## A school of fish

Grouped, they swim as one along a wave, each fish tilting up then down.

```anim
School: group [F1 F2 F3]
School: move 8,3 via 5,1.5 speed slow
F1: angle -10 speed slow
F2: angle -10 speed slow
F3: angle -10 speed slow
```

+++

```anim
School: move 13,5 via 10.5,6.5 speed slow
F1: angle 15 speed slow
F2: angle 15 speed slow
F3: angle 15 speed slow
```

---

## Scuttle

The camera follows the crab along the sea bed.

```anim
camera move Crab zoom 2.5 speed slow
```

+++

```anim
Crab: move 9,11 speed slow ease linear
camera move Crab zoom 2.5 speed slow ease linear
```

+++

```anim
Crab: shake
Crab: scale 1.3 speed fast
```

---

## The turtle's route

The turtle follows a curve whose line is hidden (`weight 0`).

```anim
camera reset speed slow
Route: curve from Turtle to 4,7 via 11,4 via 6,3 weight 0
```

+++

```anim
Turtle: follow Route angle -20 speed vslow
```

---

## Tour

The camera travels between the three, then shows the whole scene.

```anim
camera travel School Crab Turtle zoom 2 speed slow
```

+++

```anim
camera reset
School: ungroup
F1: move +4,-1 scale 1.4 speed slow
F2: move +2,+2 angle +360 speed slow
F3: delete pop
```

</animation>
