---
icon: material/arrow-decision
---

# Algorithms


```pseudo
// Test function
function test(a, b)
    return a + b
end

// Main program
start
  ask user for a number

  if the number is 0 then
    say the number is zero

  elseif the number < 0 then
    say the number is negative

  else
    say the number is positive

    repeat
      show the number
      subtract 1 from the number
    until number is 0

  endif
end
```

Like this...

```mermaid
graph TD
    A([START])
    B[/ask the user<br>for a number/]
    C{number<br>is...}
    D[/say 'positive'/]
    E[/say 'negative'/]
    F[/say 'zero'/]
    G[/show the number/]
    H[subtract 1<br>from number]
    I{number<br>is 0}
    Z([END])

    A --> B
    B --> C
    C -- more than 0 --> D
    C -- less than 0 --> E
    C -- equal to 0 --> F
    D --> G
    E --> Z
    F --> Z
    G --> H
    H --> I
    I -- yes --> Z
    I -- no --> G

    class B in-out
    class D in-out
    class E in-out
    class F in-out
    class G in-out
```

Heh heh!

```mermaid
flowchart LR

S0[ ]
S1((S1))
S2(((S2)))
S3(((S3)))

S0 --> S1
S1 --A--> S2
S1 --B--> S3
S2 --A--> S1
S2 --B--> S3
S3 --A--> S1
S3 --B--> S3
S3 --C--> S3

class S0 start
```