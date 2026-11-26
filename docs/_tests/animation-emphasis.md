# Animation: Emphasis and Highlights

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: Emphasis

One-off effects on a shape that's already there. They don't replay going back.

<animation name="Emphasis" grid="12x3">

```anim
defaults size 1.6x0.8 font 0.6
Pu: rect "pulse" at 2.5,2
Sh: rect "shake" at 4.5,2
Wo: rect "wobble" at 6.5,2
Bn: rect "bounce" at 8.5,2
Gl: rect "glow" at 10.5,2
defaults clear
```

---

```anim
Pu: pulse
```

+++

```anim
Sh: shake
```

+++

```anim
Wo: wobble
```

+++

```anim
Bn: bounce
```

+++

```anim
Gl: glow
```

---

## Several at once, and on a group

```anim
Pu: pulse
Sh: pulse
G: group [Bn Gl]
```

+++

```anim
G: bounce
```

</animation>

## Feature: signal

<animation name="Signal" grid="12x5">

```anim
A: circle "a" at 2,2
B: rect "b" at 10,2
L: arrow from A to B stroke muted
C: curve from A to B via 6,4.5 stroke muted
```

---

## signal

```anim
L: signal
```

+++

```anim
C: signal speed slow
```

---

## signal-reverse

```anim
L: signal-reverse
```

---

## On a group: each of its lines

```anim
G: group [A, B, L, C]
G: signal speed fast
```

</animation>

## Feature: highlight arrow, glow and line

Highlights stay on until `highlight clear`, and go where their shape goes.

<animation name="Arrow, Glow & Line" grid="12x4">

```anim
defaults size 1.6x0.8 font 0.6
Ar: rect "arrow" at 3.5,2
Gl: rect "glow" at 6.5,2
Both: rect "both" at 9.5,2
defaults clear
T: text "a line of text" at 6.5,3.5
```

---

```anim
Ar: highlight arrow
Gl: highlight glow
Both: highlight arrow glow
T: highlight line
```

+++

```anim
Ar: move +0,-0.5
Gl: angle 20
Both: scale 1.4
```

---

## clear

```anim
Ar: highlight clear
Gl: highlight clear
Both: highlight clear
T: highlight clear
```

</animation>

## Feature: highlight outline and inside

The outline follows each shape's own outline (turned and scaled with it); inside sits just within its stroke.

<animation name="Outline & Inside" grid="14x5">

```anim
R: rect "rect" at 2,2 size 2x1
Rc: rect "corner" at 5,2 size 2x1 corner 0.3
C: circle "circle" at 8,2 radius 0.7
D: diamond "diamond" at 11,2 size 2x1.4
T: text "text" at 13.5,2
Tr: rect "turned" at 2.5,4.2 size 2x0.8 angle 20
Th: rect "thick" at 6,4.2 size 2x0.8 weight 3
Sc: circle "scaled" at 9,4.2 radius 0.6 scale 1.5
I: icon(laptop) "icon" at 12,4
```

---

## outline

```anim
R: highlight outline
Rc: highlight outline
C: highlight outline
D: highlight outline
T: highlight outline
Tr: highlight outline
Th: highlight outline
Sc: highlight outline
I: highlight outline
```

+++

```anim
Tr: angle +45
Sc: pulse
```

---

## inside

```anim
R: highlight clear inside
Rc: highlight clear inside
C: highlight clear inside
D: highlight clear inside
T: highlight clear
Tr: highlight clear inside
Th: highlight clear inside
Sc: highlight clear inside
I: highlight clear inside
```

---

## Both

```anim
R: highlight outline
Rc: highlight outline
C: highlight outline
D: highlight outline
Tr: highlight outline
Th: highlight outline
Sc: highlight outline
I: highlight outline
```

</animation>

## Feature: highlight number

A bare `number` takes the next one; `number N` sets where the sequence is. On a row, column or group, a bare one numbers each shape in turn.

<animation name="Highlight Number" grid="14x5">

```anim
defaults size 1.2x0.8 font 0.6
A: rect "a" at 2,1.5
B: rect "b" at 4.5,1.5
C: rect "c" at 7,1.5
D: rect "d" at 9.5,1.5
E: rect "e" at 12,1.5
defaults clear
```

---

## 1, 2, then 5, 6, 7

```anim
A: highlight number
B: highlight number
C: highlight number 5
D: highlight number
E: highlight number
```

---

## A row numbers its cells

```anim
Arr: row [4, 8, 2] at 2,4 highlight number
```

---

## A group, staggered

```anim
P: circle "p" at 10,4 radius 0.4
Q: circle "q" at 12,4 radius 0.4
Pq: group [P, Q]
```

+++

```anim
Pq: highlight number stagger 0.3
```

</animation>

## Feature: highlight spotlight

Everything else dims, including their highlights and callouts.

<animation name="Spotlight" grid="12x3">

```anim
A: rect "a" at 2,2
B: rect "b" at 5,2 highlight outline
C: rect "c" at 8,2 callout "hi"
D: rect "d" at 11,2
```

---

```anim
A: highlight spotlight
```

+++

Several can be spotlit.

```anim
D: highlight spotlight
```

---

## clear

```anim
A: highlight clear
D: highlight clear
```

</animation>

## Feature: Callouts

<animation name="Callouts" grid="12x4">

```anim
A: rect "a" at 6,2.5
Edge: rect "edge" at 11.5,0.5
```

---

```anim
A: callout "Look at this!"
```

+++

```anim
A: callout "Now below" below
```

+++

Long text wraps.

```anim
A: callout "A much longer callout that wraps onto several lines" left-of
```

+++

It stays inside the drawing.

```anim
A: callout clear
Edge: callout "Near the edge"
```

</animation>
