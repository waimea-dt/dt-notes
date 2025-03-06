# The Stage

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

