# Animation

Step-by-step animated explanations from `<animation>` blocks. Full syntax: `docs/_plugins/visualisation/ANIMATION.md`.

Click an animation to give it focus, then use ← / → to step and `F` for full screen.

## Bubble Sort

<animation grid="12x5">

# Bubble Sort: One Pass

We start with an unsorted array.

```anim
defaults fill blue
a5: rect "5" at 5,3 size 0.9
a3: rect "3" at 6,3 size 0.9
a8: rect "8" at 7,3 size 0.9
a1: rect "1" at 8,3 size 0.9
i: text "i" below a5
```

---

## Compare the first pair

Is `5` bigger than `3`?

```anim
a5: fill amber
a3: fill amber
pair: group a5 a3 highlight spotlight
```

+++

Yes it is!

```anim
a5: fill green pulse
```

---

## Swap

So they swap places...

```anim
a5: move 6,3 via +0.5,-0.5
a3: move 5,3 via -0.5,+0.5
```

+++

...and `i` moves on.

```anim
a5: fill blue
a3: fill none
pair: ungroup
i: move below a5
```

Note:
Ask the class to predict the next comparison before advancing.

</animation>

## Travelling Salesperson

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
b: fill blue delay 0.25 pulse
```

---

## B to C

```anim
r2: arrow from b to c draw
s: move above c gap 0.1
c: fill blue delay 0.25 pulse
```

---

## C to D

```anim
r3: arrow from c to d draw
s: move right-of d gap 0.1
d: fill blue delay 0.25 pulse
```

---

## D to E

Every city has now been visited.

```anim
r4: arrow from d to e draw
s: move below e gap 0.1
e: fill blue delay 0.25 pulse
```

---

## E back to A

The salesperson returns home to finish the tour.

```anim
r5: arrow from e to a draw
s: move left-of a gap 0.1
a: fill green delay 0.25 pulse
```

+++

The route is **A → B → C → D → E → A**. Is it the shortest one?

```anim
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
lock: remove pop delay 1
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

## HTTPS: TLS Handshake

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
m1: remove
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
m2: fill green delay 0.25 highlight box
check: icon(badge-check) attach left-of m2 stroke green pop
```

---

## 4. Key exchange

The browser makes a brand-new random **session key**.

```anim
m2: remove
check: remove
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
pubB: remove
m3: move +7,+0 speed slow
```

---

## 5. Both sides share the session key

The server unlocks it with its private key. Now both sides have the same session key, and Eve doesn't.

```anim
priv: move lock3 speed slow front
lock3: remove pop delay 1
m3: remove delay 1
ssk: icon(key-round) "Session key" at 10,2 stroke amber pop delay 1.2
```

+++

The public and private keys have done their job. From here on, everything is locked and unlocked with the session key. This is **symmetric encryption**: much faster than public and private keys.

```anim
pub: remove speed slow
priv: remove speed slow
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
lk4: remove pop
req: "GET /balance" fill blue
```

+++

...and locks its response the same way before sending it back.

```anim
req: remove
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
lk5: remove pop
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

## Feature Tests

### Shapes, labels and colours

<animation grid="12x4">

```anim
# a whole-line comment
r: rect "rect" at 2,2 size 2x1 corner 0.15 dotted   # a comment after a command
c: circle "circle" at 5,2 radius 0.8 fill blue
t: text "text, left" at 8,1 align left colour theme
b: text "bold, 1.5x" at 8,3 font 1.5 bold
i: icon(laptop) "icon" at 11,2
hx: text "C# code" at 3,4 colour #f80   # a hex colour and a "# " in a label are kept
```

---

## Colour and label changes

Fills tween; labels cross-fade.

```anim
r: fill green "done" solid
c: fill pink stroke red weight 2 colour yellow   # colour: the label
t: colour amber "changed"
i: stroke blue
```

---

## Dashed, thick and rounded

`r: corner 0.5` turns the rounded rect into a pill.

```anim
r: corner 0.5
c: size 1 weight 3
```

</animation>

### Line styles and flow

<animation grid="12x5">

## Solid

```anim
a: circle "A" at 2,2 radius 0.5
b: circle "B" at 10,2 radius 0.5
l: line from a to b weight 2
ring: circle at 6,3.3 radius 0.6 weight 1.5 stroke teal
```

---

## Solid to dashed

The solid line fades into a dashed one.

```anim
l: dashed speed slow
ring: dashed speed slow
```

---

## Dashed to dotted

The dashes fade into dots.

```anim
l: dotted speed slow
```

---

## Flow

`l: flow` sends the dots from A to B; the ring's dashes march round it.

```anim
l: flow
ring: flow
```

---

## Flow reversed

`l: flow-reverse` sends them back from B to A.

```anim
l: flow-reverse
```

---

## Back to solid

`l: solid static speed slow`: the dots fade back into a solid line.

```anim
l: solid static speed slow
ring: solid static speed slow
```

</animation>

### Size, width and height

<animation grid="12x4">

## size

`r: rect at 3,2 size 2x1`

```anim
r: rect "R" at 3,2 size 2x1 corner 0.1
i: icon(laptop) "icon" at 9,2
```

---

## width / height (relative)

`r: width +2` and `i: height +1`

```anim
r: width +2
i: height +1
```

---

## size (absolute)

`r: size 1x1` and `i: size 1`

```anim
r: size 1x1
i: size 1
```

---

## size (relative)

`r: size +1` grows both sides by a cell; `i: size -0.25` shrinks it.

```anim
r: size +1
i: size -0.25
```

</animation>

### Autoplay, loop and pause

Plays by itself once it's on screen, then loops. Clicking anything turns autoplay off; `A` or Play plays by hand.

<animation autoplay loop hold="1" grid="12x3">

## Autoplay

The dot sets off on its own.

```anim
dot: circle at 2,2 radius 0.4 fill blue
```

---

## pause 2

It holds here for 2 seconds (instead of the 1 second `hold`).

```anim
dot: move 6,2 speed slow
pause 2
```

---

## pause

Now it waits until you click Next (which nudges).

```anim
dot: move 10,2 speed slow
pause
```

---

## Then it loops

```anim
dot: fill green
```

</animation>

### Loop-bounce, speed and no controls

`autoplay loop-bounce hold="0.5" controls="none"`: no buttons or progress bar, backwards and forwards for ever. The pink ball moves `vslow` (4 s), the blue one `vfast` (0.25 s).

<animation autoplay loop-bounce hold="0.5" controls="none" grid="12x3">

```anim
ball1: circle at 2,2  size 1 fill pink
ball2: circle at 11,2 size 1 fill blue
```

---

```anim
ball1: goto 11,2 via 5,1.5 via 8,2.5 speed vslow
ball2: goto 2,2  via 8,1.5 via 5,2.5 speed vfast
```

---

```anim
ball1: fill teal   scale 1.3 speed slow
ball2: fill yellow scale 1.3 speed fast
```

</animation>

### auto chains

Not autoplaying: one click on Next plays the whole chain; Back undoes it in one go.

<animation grid="12x3">

## Before the chain

```anim
a: rect "a" at 2,2
```

---

## The chain

First it moves right...

```anim
a: move 6,2
auto
```

+++

...then hops over...

```anim
a: move 10,2 via 8,0.8
auto
```

+++

...then turns green.

```anim
a: fill green
```

---

## After the chain

Back from here returns to the end of the chain; Back again undoes the whole chain.

</animation>

### Copy, attach and group

<animation grid="14x5">

## Start

```anim
key: icon(key-round) "Public key" at 3,1.5 stroke green
msg: rect "msg" at 2,4 size 1.6x0.8 fill amber
```

---

## copy

`key2: copy key move 8,1.5 via 5.5,0.7 speed slow`: the copy flies off from the original.

```anim
key2: copy key move 8,1.5 via 5.5,0.7 speed slow
```

---

## attach

`lock: icon(lock) attach right-of msg`: the lock rides on the message, even round a curve.

```anim
lock: icon(lock) attach right-of msg stroke amber pop
```

+++

```anim
msg: move 9,4 via 6,2.8 speed slow
```

---

## group

`pkt: group msg lock`, then moving the group moves both.

```anim
pkt: group msg lock highlight box
```

+++

```anim
pkt: move 11,2.5 speed slow
```

+++

`pkt: remove pop` removes the group and its members.

```anim
pkt: remove pop
```

</animation>

### Travel and follow

<animation grid="14x5">

## A small network

```anim
pc: icon(laptop) "PC" at 1.5,2.5
r1: circle "R1" at 4.5,1.5 radius 0.45
r2: circle "R2" at 7.5,3.5 radius 0.45
r3: circle "R3" at 10.5,1.5 radius 0.45
srv: icon(server) "Server" at 13,2.5
defaults stroke muted back
l1: line from pc to r1
l2: line from r1 to r2
l3: line from r2 to r3
l4: line from r3 to srv
l5: line from r1 to r3 dashed
defaults clear
pkt: rect at 1.5,2.5 size 0.5x0.35 fill amber front
```

---

## travel

`pkt: travel r1 r2 r3 srv speed slow`: hop by hop through the routers.

```anim
pkt: travel r1 r2 r3 srv speed slow
```

---

## follow

`ack: follow-reverse l5`: back along the dashed shortcut from R3 to R1.

```anim
ack: rect "ack" at 10.5,1.5 size 0.8x0.4 fill green font 0.7 front
```

+++

```anim
ack: follow-reverse l5 speed slow
```

</animation>

### Highlights and callouts

<animation grid="12x4">

## Start

```anim
a: rect "A" at 4,2
b: circle "B" at 7,2 radius 0.5
c: rect "C" at 10,2
```

---

## pulse, shake, box and wobble

```anim
a: pulse
b: shake
c: highlight box
```

+++

`c: wobble`

```anim
c: wobble
```

---

## spotlight (two shapes)

Everything else dims.

```anim
a: highlight spotlight
c: highlight spotlight
```

---

## callout

```anim
b: callout "Look at this!"
a: callout "Left side" left-of
```

+++

```anim
b: callout "Now below" below
```

---

## clear

`highlight clear` and `callout clear` put everything back.

```anim
a: highlight clear callout clear
b: callout clear
c: highlight clear
```

</animation>

### Multi-line layout

A line indented more than the line that started a command continues it, so long commands can be laid out one property per line. `one` and `two` should look the same.

<animation grid="12x3">

```anim
one: rect "one line" at 3,2 size 3x0.8 font 0.8 fill blue corner 0.2

two:
    rect "laid out"     # comments still work
    at 9,2
    size 3x0.8

    font 0.8            # and blank lines inside
    fill blue
    corner 0.2
```

---

## Changes too

```anim
two:
    move 9,1
    fill green
    speed slow
one: move 3,1 fill green speed slow
```

---

## A whole block indented

Every line here is indented by the same amount, so each is its own command.

```anim
    one: fill amber
    two: fill amber
```

</animation>

### Angle and scale

<animation grid="12x5">

## Rotated and scaled

Images, shapes, text and icons can be turned (degrees clockwise, 0 = upright) and scaled.

```anim
mac: image(../_assets/macs/macintosh.svg) at 2,3 size 2 angle -15
r: rect "45°" at 5,2 angle 45
c: rect "wide" at 5,4 size 2x1 angle 90 scale 0.8
t: text "Tilted text" at 8,1 angle 20 font 1.2
cog: icon(cog) at 8,4 scale 1.5
box: rect "B" at 11,3
l: arrow from r to box "edge"
```

---

## Animated

The cog spins, the Mac turns upright and grows, and the arrow stays on the rotating rect's edge.

```anim
cog: angle +360 speed slow
mac: angle 0 scale 1.3 speed slow
r: angle +90 speed slow
t: angle 0 scale 1.3
```

---

## Back the other way

`angle -90` (relative) turns a quarter anticlockwise; `scale 0.5` halves.

```anim
r: angle -90
c: scale 0.5
cog: angle -360 speed slow
```

</animation>

### Curved moves

<animation grid="12x5" debug>

## Start

```anim
a: circle "a" at 2,4 radius 0.4 fill blue
b: rect "b" at 6,3
c: circle "c" at 2,2.5 radius 0.4 fill pink
l: line from a to c dashed
```

---

## One via point

`a: move 8,4 via 5,1` — a semicircle over `b` (the via point is centred, half the distance away).

```anim
a: move 8,4 via 5,1 speed slow
```

---

## Several via points

`c: move 10,2.5 via 4,4 via 6,2.5 via 8,1` — zig-zag via points give a sine-like wave, at an even speed. The dashed line follows both ends.

```anim
c: move 10,2.5 via 4,4 via 6,2.5 via 8,1 speed slow
```

---

## Via a shape, and relative

`a` loops through the spot below `b`; `c` goes `via -2,+2` (relative to where it starts).

```anim
a: move 2,4 via below b speed slow
c: move 2,2.5 via -2,+2 speed slow
```

</animation>

### Curved-move errors

<animation grid="8x2" debug>

```anim
a: rect at 2,1
b: rect at 4,1 via 5,2
a: fill blue via 3,2
l: line from a to 6,1 via 3,2
defaults via 2,2
a: move 6,1 via zz
```

</animation>

### Images, relative moves and line ends

<animation grid="12x5" debug>

## Starting positions

The debug grid shows rows, columns and ids.

```anim
mac: image(../_assets/macs/macintosh.svg) "A Mac" at 3,2 size 2
box: rect "box" at 9,2
l: line from 2,5 to 6,5 "line"
p: arrow from mac to box
```

---

## Relative moves

`box: move +1,+2`, `mac: x +3`.

```anim
box: move +1,+2
mac: x +3
```

---

## One end of a line

`l: to +4,-1` moves only the end; the arrow follows `box`.

```anim
l: to +4,-1
box: y -1
```

---

## Shift a whole line

```anim
l: move +0,-1
p: to 11,1
```

</animation>

### Effects and speeds

<animation grid="12x3">

## Effects

Each shape enters with a different effect.

```anim
f: rect "fade" at 2,2
```

---

```anim
p: rect "pop" at 5,2 pop
d: arrow from 1,3 to 11,3 draw speed slow
s: circle "slide" at 9,2 slide
```

+++

Second beat: removal effects.

```anim
f: remove pop
p: remove speed fast
s: remove slide
```

---

## Instant and slow

```anim
d: remove speed instant
sl: rect "slow" at 2,2
```

+++

```anim
sl: move 11,2 speed slow
```

</animation>

### Layering

<animation grid="10x3">

## Back, normal and front

```anim
a: rect "normal" at 4,2 size 3x1 fill blue
b: circle at 3,2 radius 1 fill amber back
c: circle at 6,2 radius 1 fill pink front
```

---

## Change layer

`b: front` and `c: back`.

```anim
b: front
c: back
```

</animation>

### Fit grid and a caption-only step

<animation grid="fit">

```anim
a: rect "A" at 3,3
b: rect "B" at 6,3
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

<animation grid="8x3" debug hold="fast" controls="hidden">

```anim
pause -1
auto now
defaults: fill red
sp: rect at 1,2 slow
sq: rect at 2,2 speed -1
st: text "x" at 3,2 stroke red
rr: rect at 4,2 radius 0.2
dw: rect at 5,1 draw
sl: line from 1,1 to 2,1 slide
fl: line from 1,3 to 3,3 dashed flow
fl: solid
at2: circle attach dw gap 1
cp: copy zz
hl: rect at 3,1 highlight sparkle
a: rect "A" at 2,2
b: rect at 9,9
c: blob at 3,3
a: wibble 3
d: line from a to zz
e: rect "x" "y" at 4,2
f: circle at 5,2 size 1x2
g: rect at 6,2 x 3
h: rect at 7,2
h: size +1x0
k: circle at 1,1 width 2
defaults fill none
defaults fill none
remove: rect at 1,1
```

</animation>

### Source in a code fence

This block must stay as code:

````markdown
<animation>
```anim
a: rect at 2,3
```
</animation>
````
