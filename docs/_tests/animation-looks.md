# Animation: Looks

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: Colours

<animation name="Colours" grid="13x10">

```anim
pal: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2.15,1.15 font 0.4 size 0.7 gap 0.3 corner 0.5
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
br: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2.15,2.15 font 0.4 size 0.7 gap 0.3 corner 0.5
br.0: fill red-bright
br.1: fill orange-bright
br.2: fill amber-bright
br.3: fill yellow-bright
br.4: fill green-bright
br.5: fill teal-bright
br.6: fill cyan-bright
br.7: fill blue-bright
br.8: fill purple-bright
br.9: fill pink-bright
br.10: fill magenta-bright
br.11: fill theme-bright
mt: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2.15,3.15 font 0.4 size 0.7 gap 0.3 corner 0.5
mt.0: fill red-muted
mt.1: fill orange-muted
mt.2: fill amber-muted
mt.3: fill yellow-muted
mt.4: fill green-muted
mt.5: fill teal-muted
mt.6: fill cyan-muted
mt.7: fill blue-muted
mt.8: fill purple-muted
mt.9: fill pink-muted
mt.10: fill magenta-muted
mt.11: fill theme-muted
lp: text "plain" at 1,1 font 0.45 align right
lb: text "-bright" at 1,2 font 0.45 align right
lm: text "-muted" at 1,3 font 0.45 align right
lrp: text "raw" at 1,4 font 0.45 align right
lrb: text "raw -bright" at 1,5 font 0.45 align right
lrm: text "raw -muted" at 1,6 font 0.45 align right
rp0:  line from  2.00,4 to  2.01,4 stroke red weight 15
rp1:  line from  3.00,4 to  3.01,4 stroke orange weight 15
rp2:  line from  4.00,4 to  4.01,4 stroke amber weight 15
rp3:  line from  5.00,4 to  5.01,4 stroke yellow weight 15
rp4:  line from  6.00,4 to  6.01,4 stroke green weight 15
rp5:  line from  7.00,4 to  7.01,4 stroke teal weight 15
rp6:  line from  8.00,4 to  8.01,4 stroke cyan weight 15
rp7:  line from  9.00,4 to  9.01,4 stroke blue weight 15
rp8:  line from 10.00,4 to 10.01,4 stroke purple weight 15
rp9:  line from 11.00,4 to 11.01,4 stroke pink weight 15
rp10: line from 12.00,4 to 12.01,4 stroke magenta weight 15
rp11: line from 13.00,4 to 13.01,4 stroke theme weight 15
rb0:  line from  2.00,5 to  2.01,5 stroke red-bright weight 15
rb1:  line from  3.00,5 to  3.01,5 stroke orange-bright weight 15
rb2:  line from  4.00,5 to  4.01,5 stroke amber-bright weight 15
rb3:  line from  5.00,5 to  5.01,5 stroke yellow-bright weight 15
rb4:  line from  6.00,5 to  6.01,5 stroke green-bright weight 15
rb5:  line from  7.00,5 to  7.01,5 stroke teal-bright weight 15
rb6:  line from  8.00,5 to  8.01,5 stroke cyan-bright weight 15
rb7:  line from  9.00,5 to  9.01,5 stroke blue-bright weight 15
rb8:  line from 10.00,5 to 10.01,5 stroke purple-bright weight 15
rb9:  line from 11.00,5 to 11.01,5 stroke pink-bright weight 15
rb10: line from 12.00,5 to 12.01,5 stroke magenta-bright weight 15
rb11: line from 13.00,5 to 13.01,5 stroke theme-bright weight 15
rm0:  line from  2.00,6 to  2.01,6 stroke red-muted weight 15
rm1:  line from  3.00,6 to  3.01,6 stroke orange-muted weight 15
rm2:  line from  4.00,6 to  4.01,6 stroke amber-muted weight 15
rm3:  line from  5.00,6 to  5.01,6 stroke yellow-muted weight 15
rm4:  line from  6.00,6 to  6.01,6 stroke green-muted weight 15
rm5:  line from  7.00,6 to  7.01,6 stroke teal-muted weight 15
rm6:  line from  8.00,6 to  8.01,6 stroke cyan-muted weight 15
rm7:  line from  9.00,6 to  9.01,6 stroke blue-muted weight 15
rm8:  line from 10.00,6 to 10.01,6 stroke purple-muted weight 15
rm9:  line from 11.00,6 to 11.01,6 stroke pink-muted weight 15
rm10: line from 12.00,6 to 12.01,6 stroke magenta-muted weight 15
rm11: line from 13.00,6 to 13.01,6 stroke theme-muted weight 15
lo: text "other" at 1,7 font 0.45 align right
lro: text "raw other" at 1,8 font 0.45 align right
oth: row ["none" "bg" "bg-shape" "black" "white" "fg" "muted"] at 2.15,7.15 font 0.4 size 0.7 gap 0.3 corner 0.5
oth.0: fill none
oth.1: fill bg
oth.2: fill bg-shape
oth.3: fill black ink white
oth.4: fill white ink black
oth.5: fill fg ink bg
oth.6: fill muted
ro0: line from 2.00,8 to 2.01,8 stroke none weight 15
ro1: line from 3.00,8 to 3.01,8 stroke bg weight 15
ro2: line from 4.00,8 to 4.01,8 stroke bg-shape weight 15
ro3: line from 5.00,8 to 5.01,8 stroke black weight 15
ro4: line from 6.00,8 to 6.01,8 stroke white weight 15
ro5: line from 7.00,8 to 7.01,8 stroke fg weight 15
ro6: line from 8.00,8 to 8.01,8 stroke muted weight 15
st: rect "stroke" at 3,9.5 size 2x0.8 stroke red weight 2
cl: rect "ink" at 6,9.5 size 2x0.8 ink amber
hx: text "#f80" at 9,9.5 ink #f80
mu: text "muted" at 12,9.5 ink muted
```

---

## Changes tween

```anim
st: fill green stroke blue
cl: ink pink
hx: ink teal
```

+++

Variants on fills, strokes and text.

```anim
st: fill green-muted stroke blue-bright
cl: ink pink-muted
hx: ink teal-bright
pal: stroke black ink black
br: stroke black ink black
mt: stroke black ink black
oth: stroke black ink black
oth.3: ink white
```

</animation>

## Feature: contrast

`ink contrast`: black or white text, whichever reads on what's behind it. On a bar, the part of the label over the bar is picked against the bar.

<animation name="Contrast" grid="14x7">

```anim
defaults ink contrast size 2.4x1
c1: rect "black" at 2,1.5 fill black
c2: rect "white" at 5,1.5 fill white
c3: rect "yellow" at 8,1.5 fill #ff0
c4: rect "blue" at 11,1.5 fill #00f
defaults clear
t: text "on the page" at 1,3.2 align left ink contrast
h: var 50 at 7,3.2 size 6x1 bar fill #f00 track black ink contrast font 1.4
v: var 50 at 13,4 size 1x4 bar fill #ff0 track #004 ink contrast
p: var 40 at 3,5.5 size 2 pie fill #ff0 track #000 ink contrast
r: var 60 at 7,5.5 size 2 ring fill #ff0 track #000 ink contrast
```

---

## The fill changes and the text follows

```anim
c1: fill white
c2: fill black
c3: fill #008
c4: fill #8ff
h: 20
v: 20
p: 75
```

+++

Across the label, slowly.

```anim
h: 90 speed vslow
v: 90 speed vslow
```

+++

```anim
c3: ink amber
h: ink fg
```

</animation>

## Feature: Strokes: weight, line styles and flow

`weight` is a multiple of the normal thickness (`0` hides it). Style changes cross-fade; `flow` marches a dashed or dotted stroke along.

<animation name="Strokes" grid="13x5">

```anim
w1: line from 1,1 to 5,1 weight 0.5
w2: line from 1,2 to 5,2
w3: line from 1,3 to 5,3 weight 2
w4: line from 1,4 to 5,4 weight 4
r: rect "weight 0" at 3,5 size 2.4x0.8 weight 0 fill blue
l: line from 7,1.5 to 12,1.5 weight 2
hoop: circle at 9.5,3.5 radius 0.9 weight 1.5 stroke teal
```

---

## weight

Changes tween.

```anim
w1: weight 4
w4: weight 0.5
r: weight 2
```

---

## dashed, then dotted

```anim
l: dashed speed slow
hoop: dashed speed slow
```

+++

```anim
l: dotted speed slow
hoop: dotted speed slow
```

---

## flow

```anim
l: flow
hoop: flow
```

+++

```anim
l: flow-reverse
hoop: flow-reverse
```

+++

```anim
l: static
hoop: static
```

---

## solid

```anim
l: solid speed slow
hoop: solid speed slow
```

</animation>

## Feature: opacity

<animation name="Opacity" grid="12x4">

```anim
r1: rect "1" at 2,2 fill blue
r2: rect "0.6" at 4,2 fill blue opacity 0.6
r3: rect "0.3" at 6,2 fill blue opacity 0.3
l: arrow from 8,1 to 11,1 opacity 0.5
t: text "faded" at 9.5,2 opacity 0.4
arr: row [5 3 8] at 8,3
```

---

## Changes tween

```anim
r1: opacity 0.2
r3: opacity +0.7
l: opacity 1
arr: opacity 0.3 stagger
```

+++

```anim
r1: opacity reset
arr.1: opacity 1
t: style reset
```

+++

A spotlight dims the rest on top of their own opacity.

```anim
r2: highlight spotlight
```

---

## Names and indices fade with their owner

```anim
r2: highlight clear
arr: name "arr" indices opacity reset
```

+++

```anim
arr: opacity 0.1
```

+++

```anim
arr: opacity reset
```

</animation>

## Feature: angle and scale

The arrow stays on the turning rect's edge.

<animation name="Angle & Scale" grid="12x5">

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

---

## Directions

`angle up` / `right` / `down` / `left`: a sprite drawn facing right, as at angle 0, faces each way in turn.

```anim
rk: image(../_assets/scratch/sprites/rocket1.svg) at 10.5,1.2 size 1.2 angle up pop
```

+++

```anim
rk: angle right
```

+++

```anim
rk: angle down
```

+++

```anim
rk: angle left
```

---

## The short way

Two full turns (`angle +720`), then `angle up` turns the short way, a quarter turn from facing left, not back through two and a half turns.

```anim
rk: angle +720 speed slow
```

+++

```anim
rk: angle up
```

</animation>

## Feature: Layers

<animation name="Layers" grid="10x3">

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

## Feature: Fonts: font, bold, regular and mono

On text and on any shape's label.

<animation name="Fonts" grid="12x4">

```anim
f1: text "font 1" at 3.5,1
f2: text "font 1.5" at 3.5,2.2 font 1.5
f3: text "bold" at 9.5,1 bold
f4: text "mono" at 9.5,2.2 mono
box: rect "a bold label" at 6.5,3.5 size 3x0.8 bold font 0.8
```

---

## font changes tween

```anim
f1: font 1.5
f2: font 1
box: font 1
```

---

## regular, and bold again

`regular` is not bold.

```anim
f3: regular
box: regular mono
```

+++

```anim
f3: bold
f4: regular
box: bold
```

</animation>

## Feature: Text marks: sup, sub, b and i

Tags in any label: text, shapes, values and lines.

<animation name="Text Marks" grid="12x6">

```anim
t1: text "x<sup>2</sup> + y<sup>2</sup>" at 3.5,1
t2: text "log<sub>2</sub> N" at 9.5,1
t3: text "x = <b>5</b> (<i>an int</i>)" at 3.5,2.3
t4: text "<b>Bold</b> beside x<sup>2</sup>" at 9.5,2.3
r: rect "<i>key</i> <b>A</b>" at 3.5,3.8 size 3x1
v: var "2<sup>8</sup>" at 9.5,3.8 size 2x1
l: arrow from 2,5.3 to 11,5.3 "H<sub>2</sub>O"
```

---

## Changed and typed

```anim
t1: "O(N<sup>2</sup>)"
t3: "x = <b>6</b>"
v: "1010<sub>2</sub>"
t2: delete typed
```

+++

```anim
t2: text "a<sub>i</sub> + a<sub>i+1</sub>" at 9.5,1 typed
r: highlight outline
```

---

## Unclosed tags show as written

```anim
t1: "x<sup>2"
t3: "<b>bold"
r: highlight clear
```

</animation>

## Feature: Relative values

A signed number on a change is relative to what the look is now. (Signed moves: Placing and Moving.)

<animation name="Relative Values" grid="12x4">

```anim
r: rect "r" at 2.5,2
c: circle "c" at 5.5,2
t: text "text" at 8.5,2
l: line from 10.5,1 to 10.5,3
```

---

## size, width and height

```anim
r: width +1
c: size +0.6
```

+++

```anim
r: height -0.4
```

---

## corner and weight

```anim
r: corner +0.3
c: weight +2
l: weight +3
```

---

## font, angle and scale

```anim
t: font +0.5
r: angle +45
c: scale +0.4
```

+++

They add up.

```anim
r: angle +45
t: font -0.8
```

---

## opacity

```anim
c: opacity -0.6
l: opacity -0.5
```

</animation>

## Feature: Resetting looks

`reset` puts a look back as the shape started: its type's look, with any defaults it was made with. A look given on its making line is a change like any other, so it goes too.

<animation name="Resetting Looks" grid="12x4">

```anim
defaults fill blue font 1.2
a: rect "a" at 3,2
defaults clear
b: rect "b" at 6.5,2 fill amber weight 3 corner 0.3
t: text "text" at 10,2 ink teal bold
```

---

## Changed

```anim
a: fill red stroke green weight 2
b: fill pink dashed opacity 0.5
t: ink pink mono font 1.6
```

---

## fill reset, ink reset

`a`'s fill goes back to blue (its defaults); `b`'s amber goes.

```anim
a: fill reset
b: fill reset
t: ink reset
```

+++

```anim
a: weight reset
b: corner reset
t: font reset
```

---

## style reset

Every look back as it started.

```anim
a: style reset
b: style reset
t: style reset
```

</animation>
