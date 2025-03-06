---
icon: material/toy-brick
tags:
  - scratch
---

# Scratch

Here is some:

```scratch { .no-copy }
onkey [Space]
goto (0) (0)
point (45)
show
repeat (10)
    turnCW (30)
endrep
hide
```

Look at that <code class="language-scratch">goto (0) (0)</code> block!

```scratch { .no-copy }
onflag
saysec (Hello) (2)
set (time) (0)
goto (0) (0)
point (45)
if [mouse] then
    goto (100) (100)
    point (0)
    if [touch (edge)] then
        if [or [= (%name%) (Dave)] [> (%time%) [+ (%limit%) (1000)]]] then
            say (Over!)
        endif
        stop
    endif
else
    say (Boo!)
    forever
        play (Whoop)
    endrep
endif
```
Look at that <code class="language-scratch">if [condition] then
endif</code> block!

Look at that <code class="language-scratch">repeat (10)
endrep</code> block!

And that <code class="language-scratch">= (A) (B)</code> block!




