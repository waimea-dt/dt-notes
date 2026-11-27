# Animation: Numbers

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: binary

<animation name="Binary" grid="14x8">

A row of bits, numbered from the right: b.0 is the lowest.

```anim
B: binary 123 at 3,2 indices powers decimal name "b"
V: var 125 at 3,5 name "v"
B1: binary 666 digits 12 at 1,7 indices powers decimal
```

---

## A bit, or a new value

```anim
B[0]: 0                           # = 122
B[7]: 1                           # = 250
```

+++

```anim
B: 0b01000011 speed slow          # 67: only the bits that change crossfade
```

---

## flip

```anim
B: flip stagger                   # every bit, from B[0]
```

+++

```anim
B[0..3]: flip                     # the low four
B[7]: flip
```

+++

```anim
B: 300                            # too big for 8 bits: it wraps round to 44
```

+++

```anim
B: +1                             # signed: relative, = 45
```

+++

```anim
B: -50                            # below 0: it wraps round to 251
```

---

## Moving values

```anim
B: V                              # v's value glides onto the bits
```

+++

```anim
W: var 0 at 6,5 name "w"
W: B                              # and back off them
```

+++

```anim
N: binary V at 9,5 digits 4 decimal  # a var's value, in 4 bits (wraps round to 13)
```

---

## Looks, range, span and switching off

```anim
B[4..7]: fill blue                # the high four
S: span B[0..3] stroke amber
B: powers clear
B: decimal clear
```

+++

```anim
B: ink blue                    # 0s are muted until given an ink
B[6]: bold
```

+++

```anim
B: ink reset                   # back as it started: 0s muted again
B[5]: fill red font 1
```

+++

```anim
B: style reset                    # every look back as it started (B[6] not bold)
```

+++

```anim
B: highlight outline
N: delete
```

</animation>

## Feature: hex and denary

<animation name="Hex & Denary" grid="14x7">

Numbers in base 16 and base 10: like binary, with digits 0-9, then A-F.

```anim
H: hex 123 at 3,2 digits 4 name "h" powers decimal  # 007B = 123
D: denary 123 at 3,5 name "d" indices powers         # 3 digits by default
P: denary 45 at 11,5 frame none stroke muted         # no frame, muted digit strokes

```

---

## A digit, or a new value

```anim
H[0]: 0xF                         # = 127 (or H[0]: 15)
D[2]: 9                           # = 923

```

+++

```anim
H[1]: +1                          # 8: a digit adds in its base, = 143
H: 0xffff speed slow              # = 65535 (either case)
D: +100                           # wraps round to 23

```

+++

```anim
D: H                              # h's value glides over: 65535 wraps round to 535
```

</animation>

## Feature: hex over binary

<animation name="Hex over Binary" grid="20x7">

Hex digits 4 squares wide, one over each nibble: `at` places a layout by the top-left of its first cell.

```anim
H: hex 0xCAFE at 3,2 digits 4 size 4x1 name "hex" powers indices decimal
B: binary 0xCAFE at 3,5 digits 16 name "bin" indices powers decimal
```

---

```anim
B[0..3]: fill blue
H[0]: fill blue

B[4..7]: fill cyan   delay 0.5
H[1]:           fill cyan   delay 0.5

B[8..11]: fill green  delay 1.0
H[2]:           fill green  delay 1.0

B[12..15]: fill yellow delay 1.5
H[3]:           fill yellow delay 1.5
```

---

```anim
B: 0x1234 speed slow              # 0001 0010 0011 0100
H: B                              # = 1234
```

</animation>
