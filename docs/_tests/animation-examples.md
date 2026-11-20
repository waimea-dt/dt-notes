# Animation: Examples

Whole animations, as they would appear in notes. Click an animation to give it focus, then use ← / → to step and `F` for full screen.

**Animation tests:** [Blocks](animation.md) · **Examples** · [Shapes, Looks and Highlights](animation-shapes.md) · [Movement, Timing and Camera](animation-motion.md) · [Images and Scenes](animation-images.md) · [Data Structures and Code](animation-data.md) · [Errors](animation-errors.md)

## Bubble Sort

<animation grid="12x5">

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

<animation>

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

## HTTPS: The TLS Handshake

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
