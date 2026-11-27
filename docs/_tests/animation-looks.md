# Animation: Looks

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: Colours

<animation name="Colours" grid="13x11">

```anim
Pal: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2.15,1.15 font 0.4 size 0.7 gap 0.3 corner 0.5
Pal[0]: fill red
Pal[1]: fill orange
Pal[2]: fill amber
Pal[3]: fill yellow
Pal[4]: fill green
Pal[5]: fill teal
Pal[6]: fill cyan
Pal[7]: fill blue
Pal[8]: fill purple
Pal[9]: fill pink
Pal[10]: fill magenta
Pal[11]: fill theme
Br: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2.15,2.15 font 0.4 size 0.7 gap 0.3 corner 0.5
Br[0]: fill red-bright
Br[1]: fill orange-bright
Br[2]: fill amber-bright
Br[3]: fill yellow-bright
Br[4]: fill green-bright
Br[5]: fill teal-bright
Br[6]: fill cyan-bright
Br[7]: fill blue-bright
Br[8]: fill purple-bright
Br[9]: fill pink-bright
Br[10]: fill magenta-bright
Br[11]: fill theme-bright
Mt: row ["red" "orange" "amber" "yellow" "green" "teal" "cyan" "blue" "purple" "pink" "magenta" "theme"] at 2.15,3.15 font 0.4 size 0.7 gap 0.3 corner 0.5
Mt[0]: fill red-muted
Mt[1]: fill orange-muted
Mt[2]: fill amber-muted
Mt[3]: fill yellow-muted
Mt[4]: fill green-muted
Mt[5]: fill teal-muted
Mt[6]: fill cyan-muted
Mt[7]: fill blue-muted
Mt[8]: fill purple-muted
Mt[9]: fill pink-muted
Mt[10]: fill magenta-muted
Mt[11]: fill theme-muted
Lp: text "plain" at 1,1 font 0.45 anchor right
Lb: text "-bright" at 1,2 font 0.45 anchor right
Lm: text "-muted" at 1,3 font 0.45 anchor right
Lrp: text "raw" at 1,4 font 0.45 anchor right
Lrb: text "raw -bright" at 1,5 font 0.45 anchor right
Lrm: text "raw -muted" at 1,6 font 0.45 anchor right
Rp0:  line from  2.00,4 to  2.01,4 stroke red weight 15
Rp1:  line from  3.00,4 to  3.01,4 stroke orange weight 15
Rp2:  line from  4.00,4 to  4.01,4 stroke amber weight 15
Rp3:  line from  5.00,4 to  5.01,4 stroke yellow weight 15
Rp4:  line from  6.00,4 to  6.01,4 stroke green weight 15
Rp5:  line from  7.00,4 to  7.01,4 stroke teal weight 15
Rp6:  line from  8.00,4 to  8.01,4 stroke cyan weight 15
Rp7:  line from  9.00,4 to  9.01,4 stroke blue weight 15
Rp8:  line from 10.00,4 to 10.01,4 stroke purple weight 15
Rp9:  line from 11.00,4 to 11.01,4 stroke pink weight 15
Rp10: line from 12.00,4 to 12.01,4 stroke magenta weight 15
Rp11: line from 13.00,4 to 13.01,4 stroke theme weight 15
Rb0:  line from  2.00,5 to  2.01,5 stroke red-bright weight 15
Rb1:  line from  3.00,5 to  3.01,5 stroke orange-bright weight 15
Rb2:  line from  4.00,5 to  4.01,5 stroke amber-bright weight 15
Rb3:  line from  5.00,5 to  5.01,5 stroke yellow-bright weight 15
Rb4:  line from  6.00,5 to  6.01,5 stroke green-bright weight 15
Rb5:  line from  7.00,5 to  7.01,5 stroke teal-bright weight 15
Rb6:  line from  8.00,5 to  8.01,5 stroke cyan-bright weight 15
Rb7:  line from  9.00,5 to  9.01,5 stroke blue-bright weight 15
Rb8:  line from 10.00,5 to 10.01,5 stroke purple-bright weight 15
Rb9:  line from 11.00,5 to 11.01,5 stroke pink-bright weight 15
Rb10: line from 12.00,5 to 12.01,5 stroke magenta-bright weight 15
Rb11: line from 13.00,5 to 13.01,5 stroke theme-bright weight 15
Rm0:  line from  2.00,6 to  2.01,6 stroke red-muted weight 15
Rm1:  line from  3.00,6 to  3.01,6 stroke orange-muted weight 15
Rm2:  line from  4.00,6 to  4.01,6 stroke amber-muted weight 15
Rm3:  line from  5.00,6 to  5.01,6 stroke yellow-muted weight 15
Rm4:  line from  6.00,6 to  6.01,6 stroke green-muted weight 15
Rm5:  line from  7.00,6 to  7.01,6 stroke teal-muted weight 15
Rm6:  line from  8.00,6 to  8.01,6 stroke cyan-muted weight 15
Rm7:  line from  9.00,6 to  9.01,6 stroke blue-muted weight 15
Rm8:  line from 10.00,6 to 10.01,6 stroke purple-muted weight 15
Rm9:  line from 11.00,6 to 11.01,6 stroke pink-muted weight 15
Rm10: line from 12.00,6 to 12.01,6 stroke magenta-muted weight 15
Rm11: line from 13.00,6 to 13.01,6 stroke theme-muted weight 15
Lo: text "other" at 1,7 font 0.45 anchor right
Lro: text "raw other" at 1,8 font 0.45 anchor right
Oth: row ["none" "bg" "bg-shape" "black" "white" "fg" "muted"] at 2.15,7.15 font 0.4 size 0.7 gap 0.3 corner 0.5
Oth[0]: fill none
Oth[1]: fill bg
Oth[2]: fill bg-shape
Oth[3]: fill black ink white
Oth[4]: fill white ink black
Oth[5]: fill fg ink bg
Oth[6]: fill muted
Ro0: line from 2.00,8 to 2.01,8 stroke none weight 15
Ro1: line from 3.00,8 to 3.01,8 stroke bg weight 15
Ro2: line from 4.00,8 to 4.01,8 stroke bg-shape weight 15
Ro3: line from 5.00,8 to 5.01,8 stroke black weight 15
Ro4: line from 6.00,8 to 6.01,8 stroke white weight 15
Ro5: line from 7.00,8 to 7.01,8 stroke fg weight 15
Ro6: line from 8.00,8 to 8.01,8 stroke muted weight 15
St: rect "stroke" at 3,9.5 size 2x0.8 stroke red weight 2
Cl: rect "ink" at 6,9.5 size 2x0.8 ink amber
Hx: text "#f80" at 9,9.5 ink #f80
Mu: text "muted" at 12,9.5 ink muted
Lha: text "hex alpha" at 1,10.7 font 0.45 anchor right
Hs: rect at 7.5,10.7 size 11x0.25 fill fg stroke none
Ha: rect "#f808" at 3,10.7 size 2x0.8 fill #f808
Hb: rect "#00336644" at 6,10.7 size 2.8x0.8 fill #00336644 stroke #0364 weight 3
Hc: text "#f80c" at 9,10.7 ink #f80c
Hd: circle at 12,10.7 radius 0.4 fill #8af4 stroke #0f08 weight 3
```

---

## Changes tween

```anim
St: fill green stroke blue
Cl: ink pink
Hx: ink teal
```

+++

Variants on fills, strokes and text.

```anim
St: fill green-muted stroke blue-bright
Cl: ink pink-muted
Hx: ink teal-bright
Pal: stroke black ink black
Br: stroke black ink black
Mt: stroke black ink black
Oth: stroke black ink black
Oth[3]: ink white
```

</animation>

## Feature: contrast

`ink contrast`: black or white text, whichever reads on what's behind it. On a bar, the part of the label over the bar is picked against the bar.

<animation name="Contrast" grid="14x7">

```anim
defaults ink contrast size 2.4x1
C1: rect "black" at 2,1.5 fill black
C2: rect "white" at 5,1.5 fill white
C3: rect "yellow" at 8,1.5 fill #ff0
C4: rect "blue" at 11,1.5 fill #00f
defaults clear
T: text "on the page" at 1,3.2 anchor left ink contrast
H: var 50 at 7,3.2 size 6x1 bar fill #f00 track black ink contrast font 1.4
V: var 50 at 13,4 size 1x4 bar fill #ff0 track #004 ink contrast
P: var 40 at 3,5.5 size 2 pie fill #ff0 track #000 ink contrast
R: var 60 at 7,5.5 size 2 ring fill #ff0 track #000 ink contrast
```

---

## The fill changes and the text follows

```anim
C1: fill white
C2: fill black
C3: fill #008
C4: fill #8ff
H: 20
V: 20
P: 75
```

+++

Across the label, slowly.

```anim
H: 90 speed vslow
V: 90 speed vslow
```

+++

```anim
C3: ink amber
H: ink fg
```

</animation>

## Feature: Strokes: weight, line styles and flow

`weight` is a multiple of the normal thickness (`0` hides it). Style changes cross-fade; `flow` marches a dashed or dotted stroke along.

<animation name="Strokes" grid="13x5">

```anim
W1: line from 1,1 to 5,1 weight 0.5
W2: line from 1,2 to 5,2
W3: line from 1,3 to 5,3 weight 2
W4: line from 1,4 to 5,4 weight 4
R: rect "weight 0" at 3,5 size 2.4x0.8 weight 0 fill blue
L: line from 7,1.5 to 12,1.5 weight 2
Hoop: circle at 9.5,3.5 radius 0.9 weight 1.5 stroke teal
```

---

## weight

Changes tween.

```anim
W1: weight 4
W4: weight 0.5
R: weight 2
```

---

## dashed, then dotted

```anim
L: dashed speed slow
Hoop: dashed speed slow
```

+++

```anim
L: dotted speed slow
Hoop: dotted speed slow
```

---

## flow

```anim
L: flow
Hoop: flow
```

+++

```anim
L: flow-reverse
Hoop: flow-reverse
```

+++

```anim
L: static
Hoop: static
```

---

## solid

```anim
L: solid speed slow
Hoop: solid speed slow
```

</animation>

## Feature: opacity

<animation name="Opacity" grid="12x4">

```anim
R1: rect "1" at 2,2 fill blue
R2: rect "0.6" at 4,2 fill blue opacity 0.6
R3: rect "0.3" at 6,2 fill blue opacity 0.3
L: arrow from 8,1 to 11,1 opacity 0.5
T: text "faded" at 9.5,2 opacity 0.4
Arr: row [5 3 8] at 8,3
```

---

## Changes tween

```anim
R1: opacity 0.2
R3: opacity +0.7
L: opacity 1
Arr: opacity 0.3 stagger
```

+++

```anim
R1: opacity reset
Arr[1]: opacity 1
T: style reset
```

+++

A spotlight dims the rest on top of their own opacity.

```anim
R2: highlight spotlight
```

---

## Names and indices fade with their owner

```anim
R2: highlight clear
Arr: name "arr" indices opacity reset
```

+++

```anim
Arr: opacity 0.1
```

+++

```anim
Arr: opacity reset
```

</animation>

## Feature: angle and scale

The arrow stays on the turning rect's edge.

<animation name="Angle & Scale" grid="12x5">

```anim
Mac: image(../_assets/macs/macintosh.svg) at 2,3 size 2 angle -15
R: rect "45°" at 5,2 angle 45
W: rect "wide" at 5,4 size 2x1 angle 90 scale 0.8
T: text "Tilted" at 8,1 angle 20 font 1.2
Cog: icon(cog) at 8,4 scale 1.5
Box: rect "B" at 11,3
L: arrow from R to Box
```

---

## Animated

```anim
Cog: angle +360 speed slow
Mac: angle 0 scale 1.3 speed slow
R: angle +90 speed slow
T: angle 0 scale 1.3
W: scale 0.5
```

---

## Directions

`angle up` / `right` / `down` / `left`: a sprite drawn facing right, as at angle 0, faces each way in turn.

```anim
Rk: image(../_assets/scratch/sprites/rocket1.svg) at 10.5,1.2 size 1.2 angle up pop
```

+++

```anim
Rk: angle right
```

+++

```anim
Rk: angle down
```

+++

```anim
Rk: angle left
```

---

## The short way

Two full turns (`angle +720`), then `angle up` turns the short way, a quarter turn from facing left, not back through two and a half turns.

```anim
Rk: angle +720 speed slow
```

+++

```anim
Rk: angle up
```

</animation>

## Feature: Layers

<animation name="Layers" grid="10x3">

## back, normal, front

```anim
A: rect "normal" at 4,2 size 3x1 fill blue
B: circle at 3,2 radius 1 fill amber back
C: circle at 6,2 radius 1 fill pink front
```

---

## Swapped

```anim
B: front
C: back
```

</animation>

## Feature: Fonts: font, bold, regular and mono

On text and on any shape's label.

<animation name="Fonts" grid="12x4">

```anim
F1: text "font 1" at 3.5,1
F2: text "font 1.5" at 3.5,2.2 font 1.5
F3: text "bold" at 9.5,1 bold
F4: text "mono" at 9.5,2.2 mono
Box: rect "a bold label" at 6.5,3.5 size 3x0.8 bold font 0.8
```

---

## font changes tween

```anim
F1: font 1.5
F2: font 1
Box: font 1
```

---

## regular, and bold again

`regular` is not bold.

```anim
F3: regular
Box: regular mono
```

+++

```anim
F3: bold
F4: regular
Box: bold
```

</animation>

## Feature: Text marks: sup, sub, b and i

Tags in any label: text, shapes, values and lines.

<animation name="Text Marks" grid="12x6">

```anim
T1: text "x<sup>2</sup> + y<sup>2</sup>" at 3.5,1
T2: text "log<sub>2</sub> N" at 9.5,1
T3: text "x = <b>5</b> (<i>an int</i>)" at 3.5,2.3
T4: text "<b>Bold</b> beside x<sup>2</sup>" at 9.5,2.3
R: rect "<i>key</i> <b>A</b>" at 3.5,3.8 size 3x1
V: var "2<sup>8</sup>" at 9.5,3.8 size 2x1
L: arrow from 2,5.3 to 11,5.3 "H<sub>2</sub>O"
```

---

## Changed and typed

```anim
T1: "O(N<sup>2</sup>)"
T3: "x = <b>6</b>"
V: "1010<sub>2</sub>"
T2: delete typed
```

+++

```anim
T2: text "a<sub>i</sub> + a<sub>i+1</sub>" at 9.5,1 typed
R: highlight outline
```

---

## Unclosed tags show as written

```anim
T1: "x<sup>2"
T3: "<b>bold"
R: highlight clear
```

</animation>

## Feature: Relative values

A signed number on a change is relative to what the look is now. (Signed moves: Placing and Moving.)

<animation name="Relative Values" grid="12x4">

```anim
R: rect "r" at 2.5,2
C: circle "c" at 5.5,2
T: text "text" at 8.5,2
L: line from 10.5,1 to 10.5,3
```

---

## size, width and height

```anim
R: width +1
C: size +0.6
```

+++

```anim
R: height -0.4
```

---

## corner and weight

```anim
R: corner +0.3
C: weight +2
L: weight +3
```

---

## font, angle and scale

```anim
T: font +0.5
R: angle +45
C: scale +0.4
```

+++

They add up.

```anim
R: angle +45
T: font -0.8
```

---

## opacity

```anim
C: opacity -0.6
L: opacity -0.5
```

</animation>

## Feature: Resetting looks

`reset` puts a look back as the shape started: its type's look, with any defaults it was made with. A look given on its making line is a change like any other, so it goes too.

<animation name="Resetting Looks" grid="12x4">

```anim
defaults fill blue font 1.2
A: rect "a" at 3,2
defaults clear
B: rect "b" at 6.5,2 fill amber weight 3 corner 0.3
T: text "text" at 10,2 ink teal bold
```

---

## Changed

```anim
A: fill red stroke green weight 2
B: fill pink dashed opacity 0.5
T: ink pink mono font 1.6
```

---

## fill reset, ink reset

`A`'s fill goes back to blue (its defaults); `B`'s amber goes.

```anim
A: fill reset
B: fill reset
T: ink reset
```

+++

```anim
A: weight reset
B: corner reset
T: font reset
```

---

## style reset

Every look back as it started.

```anim
A: style reset
B: style reset
T: style reset
```

</animation>
