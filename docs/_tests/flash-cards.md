# Flash Cards

Click to flip; that also gives the deck focus. While focused: ↑ / ↓ flip, ← / → and scrolling move (the page scrolls again at either end), and only that deck responds. On touch, swipe left / right to move and up / down to flip. Double clicking doesn't select text.

## Simple

<flashcards name="Flash Card Test">

- # How many beans make five?

    ---

    - 2 beans
    - A bean
    - A half a bean
    - And a bean and a half


- # Who is this?

    Clue: they are fun!

    ---

    ## Finn and Jake!


- # What code would do this?

    ---

    The keel-mounted rail gun pushed the whole ship backward.

    ```python
    print("Hello!")
    ```


- # What does this code do?

    ```python
    print("Hello!")
    ```

    ---

    The keel-mounted rail gun pushed the whole ship backward.


- # What does **HTML** mean?

    ---

    ## **H**yper**T**ext **M**ark-up **L**anguage

    This is the language of the web:


- # What does **CSS** mean?

    ---

    **C**ascading **S**tyle**S**heet

</flashcards>

## Shuffled

<flashcards name="Shuffle Flash Cards Test" shuffle>

- # Card A

    ---

    Back A

- # Card B

    ---

    Back B

- # Card C

    ---

    Back C

- # Card D

    ---

    Back D

</flashcards>

## Playing

Every deck can play: click it, then press `A` (or the play button) to play or pause. Each side shows for 3s (`hold="s"` changes that): the front, then it flips, then the next card. Any move of your own stops it, and playing from the last card's back starts again from the first card.

This one has `autoplay loop hold="1.5"`: it plays while it's on screen, round and round, until you pause or move.

<flashcards name="Autoplay Loop" autoplay loop hold="1.5">

- # One

    ---

    Back of one

- # Two

    ---

    Back of two

- # Three

    ---

    Back of three

</flashcards>
