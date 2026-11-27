# Animation: Code and Scratch

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: code

<animation name="Code" grid="16x7">

A code block: its lines in [ ] (one per line, the closing "]" lined up with the id), highlighted by Prism. Lines are numbered from 1, like line numbers.

```anim
C: code [
    "total = 0",
    "for n in [5, 3, 8]:",
    "    total += n"
] at 2,2 lang python name "sum.py" indices
Nums: row [5 3 8] at 12,2 name "nums"
Total: var 0 at 12,4 name "total"
```

---

## Highlighting a line

```anim
C[2]: highlight line
Nums[0]: fill amber
```

+++

```anim
C[2]: highlight clear
C[3]: highlight line
Total: 5
```

+++

A text can be highlighted too, and a fill on a line works as well.

```anim
Note: text "adds each number" at 12,5.5 highlight line
C[3]: highlight clear
C[1]: fill teal
```

---

## One line, typed

A single line goes in quotes. Typed, a block's lines type out one after another.

```anim
C[1]: fill none
Note: delete
S: code "console.log(\"Hello, world!\")" lang js at 2,6 typed
```

+++

```anim
S: "console.log(42)"
```

+++

```anim
P: code [
    "def greet(name):",
    "    return f\"Hi {name}\""
] at 10,5.5 lang python typed speed 2
```

+++

```anim
P: delete typed
C: delete
```

</animation>

## Feature: code edits

Edits play as a Scratch script's do: room is made, then a new line slides in from the right; a gone line slides out to the right, then the rest close up; swapped lines go straight to their places. The block holds its place by its first line's square as it widens and narrows.

<animation name="Code Edits" grid="16x8">

```anim
C: code [
    "a = 1",
    "b = 2",
    "c = a + b"
] at 2,2 lang python name "calc.py" indices
```

---

## Insert: at the start, in the middle, at the end

```anim
C: insert "# add two numbers" at 1
then
C: insert "print(a, b)" at 4
then
C: insert "print(c)" at end
```

---

## Replace: shorter, then longer (the block widens)

```anim
C[2]: "a = 10"
then
C[6]: "print(f\"c is {c}\")  # a longer line"
```

---

## Move: swap neighbours, a lit line, far apart

```anim
C: swap 4 5
```

+++

The light goes with its line.

```anim
C[2]: highlight line
C: swap 2 3
then
C: swap 1 6
then
C: swap 6 1
```

---

## Remove: the start, the middle, the end (the block narrows)

```anim
C[3]: highlight clear
C: remove 1
then
C: remove 3
then
C: remove end
```

---

## Together, slowly, and a new font

```anim
C: insert "import math" at 1 speed slow
C: insert "print(math.pi)" at end speed slow
```

+++

```anim
C: font 1.5
then
C: font 2
```

</animation>

## Feature: Scratch scripts

<animation name="Scratch Scripts" grid="16x8">

# Scratch Scripts

A script is as big as its blocks. Shapes placed beside it fit round it.

```anim
S: scratch [
    "when green flag clicked",
    "turn right (15) degrees",
    "say [Hello!] for (2) seconds"
] at 2,2 pop
T: text "Flag script" attach S.bottom gap 0.25
A: arrow from 11,3 to S
```

---

## A new script

A change fades the old script out and the new one in, while its box grows to fit.

```anim
S: [
    "when green flag clicked",
    "forever",
    "    turn right (15) degrees",
    "    if <touching (edge v)?> then",
    "        say [Ouch!] for (1) seconds",
    "    end",
    "end"
]
```

+++

The same script with some new values

```anim
S[3]: "turn right (45) degrees"
S[5]: "say [Eek!] for (3) seconds"
```

+++

One line goes in quotes.

```anim
S: "move (10) steps"
```

---

## Sized and scaled

Given a size, a script fits inside it. Its font makes it bigger or smaller.

```anim
B: rect at 13.5,6 size 4x3 fill none stroke muted dashed
F: scratch [ "when this sprite clicked" "play sound (Meow v) until done" ] at 12,5 size 4x3
S: font 0.7
```

+++

```anim
F: highlight outline
S: move 3,5 angle -10
```

</animation>

## Feature: Scratch line highlights

<animation name="Scratch Highlights" grid="14x8">

# Stepping Through a Script

`S[N]: highlight line` dims every block but the one on line N, like a spotlight. Lines count from 1, as written.

```anim
S: scratch [
    "when green flag clicked",
    "forever",
    "    turn right (15) degrees",
    "    if <mouse down?> then",
    "        say [Ouch!] for (1) seconds",
    "    else",
    "        move (10) steps",
    "    end",
    "end"
] at 2,2

R: rect "TEST" size 2x2 at 9,2 fill pink
```

+++

```anim
S[1]: highlight line
```

+++

```anim
S[2]: highlight line
```

+++

The light moves from block to block.

```anim
S[3]: highlight line
```

+++

```anim
S[4]: highlight line
```

+++

Line 6 is the else, so the next block is on line 7.

```anim
S[7]: highlight line
```

---

## Changes and clearing

A highlight stays on through a change to the script.

```anim
S: [
    "when green flag clicked",
    "forever",
    "    turn right (45) degrees",
    "    if <mouse down?> then",
    "        say [Ouch!] for (1) seconds",
    "    else",
    "        move (10) steps",
    "    end",
    "end"
] speed instant
S[3]: highlight line
```

+++

```anim
S: highlight clear
```

</animation>

## Feature: Scratch line edits

<animation name="Scratch Edits" grid="14x8">

# Editing a Script

```anim
S: scratch [
    "when green flag clicked",
    "repeat (10)",
    "    turn right (15) degrees",
    "    if <mouse down?> then",
    "        say [Ouch!] for (1) seconds",
    "    end",
    "end",
    "say [Yay!]",
] at 2,1.5
```

+++

Lines are numbered from 1, as written, `end` lines too.

```anim
S[3]: highlight line
```

---

## Replace a line

```anim
S[3]: "turn right (45) degrees"
```

+++

Instant, the new value just replaces the old one.

```anim
S[3]: "turn right (90) degrees" speed instant
```

+++

```anim
S: highlight clear
```

---

## Insert, swap and remove

Line 6 is the if's end, so this goes inside the if. A lit line keeps its light as the lines round it change.

```anim
S: insert "move (10) steps" at 6
```

+++

```anim
S: swap 3 4
```

+++

```anim
S: highlight clear
```

+++

A C block goes with the blocks inside it.

```anim
S: remove 3
```

+++

Several lines go in [ ]. Line 4 is the forever's end, so they go inside it.

```anim
S: insert [
    "repeat (3)",
    "    play sound (Meow v) until done",
    "end"
] at 4
```

+++

```anim
S: insert [
    "repeat (3)",
] at 3
S: insert [
    "end"
] at 5
```

</animation>
