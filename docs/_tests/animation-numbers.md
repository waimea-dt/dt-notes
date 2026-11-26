# Animation: Numbers

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: binary

<animation name="Binary" grid="14x8">

A row of bits, numbered from the right: b.0 is the lowest.

```anim
b: binary 123 at 3,2 indices powers decimal name "b"
v: var 125 at 3,5 name "v"
b1: binary 666 digits 12 at 1,7 indices powers decimal
```

---

## A bit, or a new value

```anim
b.0: 0                            # = 122
b.7: 1                            # = 250
```

+++

```anim
b: 0b01000011 speed slow          # 67: only the bits that change crossfade
```

---

## flip

```anim
b: flip stagger                   # every bit, from b.0
```

+++

```anim
b: flip 0 3                       # the low four
b.7: flip
```

+++

```anim
b: 300                            # too big for 8 bits: it wraps round to 44
```

+++

```anim
b: +1                             # signed: relative, = 45
```

+++

```anim
b: -50                            # below 0: it wraps round to 251
```

---

## Moving values

```anim
b: v                              # v's value glides onto the bits
```

+++

```anim
w: var 0 at 6,5 name "w"
w: b                              # and back off them
```

+++

```anim
n: binary v at 9,5 digits 4 decimal  # a var's value, in 4 bits (wraps round to 13)
```

---

## Looks, range, span and switching off

```anim
b: range 4 7 fill blue            # the high four
s: span b 0 3 stroke amber
b: powers clear
b: decimal clear
```

+++

```anim
b: colour blue                    # 0s are muted until given a colour
b.6: bold
```

+++

```anim
b: colour reset                   # back as it started: 0s muted again
b.5: fill red font 1
```

+++

```anim
b: style reset                    # every look back as it started (b.6 not bold)
```

+++

```anim
b: highlight outline
n: delete
```

</animation>

## Feature: hex and denary

<animation name="Hex & Denary" grid="14x7">

Numbers in base 16 and base 10: like binary, with digits 0-9, then A-F.

```anim
h: hex 123 at 3,2 digits 4 name "h" powers decimal  # 007B = 123
d: denary 123 at 3,5 name "d" indices powers         # 3 digits by default

```

---

## A digit, or a new value

```anim
h.0: 0xF                          # = 127 (or h.0: 15)
d.2: 9                            # = 923

```

+++

```anim
h.1: +1                           # 8: a digit adds in its base, = 143
h: 0xffff speed slow              # = 65535 (either case)
d: +100                           # wraps round to 23

```

+++

```anim
d: h                              # h's value glides over: 65535 wraps round to 535
```

</animation>

## Feature: hex over binary

<animation name="Hex over Binary" grid="20x7">

Hex digits 4 squares wide, one over each nibble: `at` places a layout by the top-left of its first cell.

```anim
h: hex 0xCAFE at 3,2 digits 4 size 4x1 name "hex" powers indices decimal
b: binary 0xCAFE at 3,5 digits 16 name "bin" indices powers decimal
```

---

```anim
b: range  0  3 fill blue
h.0: fill blue

b: range  4  7 fill cyan   delay 0.5
h.1:           fill cyan   delay 0.5

b: range  8 11 fill green  delay 1.0
h.2:           fill green  delay 1.0

b: range 12 15 fill yellow delay 1.5
h.3:           fill yellow delay 1.5
```

---

```anim
b: 0x1234 speed slow              # 0001 0010 0011 0100
h: b                              # = 1234
```

</animation>
