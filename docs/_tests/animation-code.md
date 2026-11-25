# Animation: Code and Scratch

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

## Feature: code

<animation name="Code" grid="16x7">

A code block: its lines in [ ] (one per line, the closing "]" lined up with the id), highlighted by Prism. Lines are numbered from 1, like line numbers.

```anim
c: code [
    "total = 0",
    "for n in [5, 3, 8]:",
    "    total += n"
] at 2,2 lang python name "sum.py" numbered
nums: row [5 3 8] at 12,2 name "nums"
total: var 0 at 12,4 name "total"
```

---

## Highlighting a line

```anim
c.2: highlight line
nums.0: fill amber
```

+++

```anim
c.2: highlight clear
c.3: highlight line
total: 5
```

+++

A text can be highlighted too, and a fill on a line works as well.

```anim
note: text "adds each number" at 12,5.5 highlight line
c.3: highlight clear
c.1: fill teal
```

---

## Changing lines

A longer line widens the block.

```anim
c.1: fill none
note: delete
c: insert "print(total)  # 16" at end
```

+++

```anim
c.1: "total = 100" speed slow
```

+++

```anim
c: swap 1 2
```

+++

```anim
c: remove 1
c: font 0.8
```

---

## One line, typed

A single line goes in quotes. Typed, a block's lines type out one after another.

```anim
s: code "console.log(\"Hello, world!\")" lang js at 2,6 typed
```

+++

```anim
s: "console.log(42)"
```

+++

```anim
p: code [
    "def greet(name):",
    "    return f\"Hi {name}\""
] at 10,5.5 lang python typed speed 2
```

+++

```anim
p: delete typed
c: delete
```

</animation>

## Feature: Scratch scripts

<animation name="Scratch Scripts" grid="16x8">

# Scratch Scripts

A script is as big as its blocks. Shapes placed beside it fit round it.

```anim
s: scratch [
    "when green flag clicked",
    "turn right (15) degrees",
    "say [Hello!] for (2) seconds"
] at 2,2 pop
t: text "Flag script" attach below s
a: arrow from 11,3 to s
```

---

## A new script

A change fades the old script out and the new one in, while its box grows to fit.

```anim
s: [
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
s: line 3 "turn right (45) degrees"
s: line 5 "say [Eek!] for (3) seconds"
```

+++

One line goes in quotes.

```anim
s: "move (10) steps"
```

---

## Sized and scaled

Given a size, a script fits inside it. Its font makes it bigger or smaller.

```anim
b: rect at 13.5,6 size 4x3 fill none stroke muted dashed
f: scratch [ "when this sprite clicked" "play sound (Meow v) until done" ] at 12,5 size 4x3
s: font 0.7
```

+++

```anim
f: highlight outline
s: move 3,5 angle -10
```

</animation>

## Feature: Scratch line highlights

<animation name="Scratch Highlights" grid="14x8">

# Stepping Through a Script

`highlight line N` dims every block but the one on line N, like a spotlight. Lines count from 1, as written.

```anim
s: scratch [
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

r: rect "TEST" size 2x2 at 9,2 fill pink
```

+++

```anim
s: highlight line 1
```

+++

```anim
s: highlight line 2
```

+++

The light moves from block to block.

```anim
s: highlight line 3
```

+++

```anim
s: highlight line 4
```

+++

Line 6 is the else, so the next block is on line 7.

```anim
s: highlight line 7
```

---

## Changes and clearing

A highlight stays on through a change to the script.

```anim
s: [
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
s: highlight line 3
```

+++

```anim
s: highlight clear
```

</animation>

## Feature: Scratch line edits

<animation name="Scratch Edits" grid="14x8">

# Editing a Script

```anim
s: scratch [
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
s: highlight line 3
```

---

## Replace a line

```anim
s: line 3 "turn right (45) degrees"
```

+++

Instant, the new value just replaces the old one.

```anim
s: line 3 "turn right (90) degrees" speed instant
```

+++

```anim
s: highlight clear
```

---

## Insert, swap and remove

Line 6 is the if's end, so this goes inside the if. A lit line keeps its light as the lines round it change.

```anim
s: insert "move (10) steps" at 6
```

+++

```anim
s: swap 3 4
```

+++

```anim
s: highlight clear
```

+++

A C block goes with the blocks inside it.

```anim
s: remove 3
```

+++

Several lines go in [ ]. Line 4 is the forever's end, so they go inside it.

```anim
s: insert [
    "repeat (3)",
    "    play sound (Meow v) until done",
    "end"
] at 4
```

+++

```anim
s: insert [
    "repeat (3)",
] at 3
s: insert [
    "end"
] at 5
```

</animation>
