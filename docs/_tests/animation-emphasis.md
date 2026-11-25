# Animation: Emphasis and Highlights

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: Emphasis

One-off effects on a shape that's already there. They don't replay going back.

<animation name="Emphasis" grid="12x3">

```anim
defaults size 1.6x0.8 font 0.6
pu: rect "pulse" at 2.5,2
sh: rect "shake" at 4.5,2
wo: rect "wobble" at 6.5,2
bn: rect "bounce" at 8.5,2
gl: rect "glow" at 10.5,2
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

`wiggle` is the same.

```anim
wo: wiggle
```

+++

```anim
bn: bounce
```

+++

```anim
gl: glow
```

---

## Several at once, and on a group

```anim
pu: pulse
sh: pulse
g: group [bn gl]
```

+++

```anim
g: bounce
```

</animation>

## Feature: signal

<animation name="Signal" grid="12x5">

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

## Feature: highlight arrow, glow and line

Highlights stay on until `highlight clear`, and go where their shape goes.

<animation name="Arrow, Glow & Line" grid="12x4">

```anim
defaults size 1.6x0.8 font 0.6
ar: rect "arrow" at 3.5,2
gl: rect "glow" at 6.5,2
both: rect "both" at 9.5,2
defaults clear
t: text "a line of text" at 6.5,3.5
```

---

```anim
ar: highlight arrow
gl: highlight glow
both: highlight arrow glow
t: highlight line
```

+++

```anim
ar: move +0,-0.5
gl: angle 20
both: scale 1.4
```

---

## clear

```anim
ar: highlight clear
gl: highlight clear
both: highlight clear
t: highlight clear
```

</animation>

## Feature: highlight outline and inside

The outline follows each shape's own outline (turned and scaled with it); inside sits just within its stroke.

<animation name="Outline & Inside" grid="14x5">

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

## Feature: highlight number

A bare `number` takes the next one; `number N` sets where the sequence is. On a row, column or group, a bare one numbers each shape in turn.

<animation name="Highlight Number" grid="14x5">

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

## Feature: highlight spotlight

Everything else dims, including their highlights and callouts.

<animation name="Spotlight" grid="12x3">

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

<animation name="Callouts" grid="12x4">

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
