# Reveal.js Slides

Normal docs content here...

## Full Feature Test

<slides>

# Arrays... Your First Chest of Loot

Store items in order, retrieve them by index.

---

## Accessing Items

```js
const loot = ['sword', 'shield', 'potion']
console.log(loot[0]) // 'sword' - zero-indexed!
```

---

## Looping Through Loot

Use a `for...of` loop to grab everything.

---

## Incremental List

+++ list

- **Bold** item one
- Item two with `code`
- Item three

---

## Reveal Steps

Always visible.

+++

### Step One

First paragraph.

+++ fade-up

### Step Two

Second paragraph, with an effect.

---

## Columns

Content before.

|||

Left column:

- One
- **Two**

|||

![](../_assets/macs/macintosh.svg)

|||

Content after.

---

## Weighted Columns

||| 1fr 2fr

Narrow.

|||

Wide, with steps:

+++

Step A

+++

Step B

|||

---

# Red!
<!-- .slide: data-background="#f003" -->

Testing

---

![](_assets/ui-demo.png)

---


```mermaid
graph TD
A(Forest) --> B[/Another/]
A --> C[End]
  subgraph section
  B
  C
  end
```

---

![](../_assets/macs/macintosh.svg)

---

<speak>

![](../_assets/macs/macintosh.svg)

Hello, Human!

</speak>

---

<excalidraw src="_assets/test.excalidraw" alt="Excalidraw test scene"></excalidraw>

---

<videoembed id="62xlzGs8LXA"></videoembed>


---

| A   | B   | C     |
| --- | --- | ----- |
| One | Two | Three |

---

<timeline>

- 1967: Steve
- 1978: Jemma
- 2011: Eva Rose
- 2017: Finn Henry

</timeline>


---

```js [0|2-3|5|10|0]
hook.doneEach(function () {
    const placeholders = document.querySelectorAll('.slides-placeholder')
    if (!placeholders.length) return

    placeholders.forEach((placeholder) => {
        const index = placeholder.getAttribute('data-index')
        placeholder.outerHTML = buildRevealHTML(index)
    })

    initDecks()
})
```

</slides>


Back to normal docs...

## Simple Test

<slides>

# Arrays... Your First Chest of Loot

Store items in order, retrieve them by index.

---

# Accessing Items

```js
const loot = ['sword', 'shield', 'potion']
console.log(loot[0]) // 'sword' â€” zero-indexed!
```

---

# Looping Through Loot

Use a `for...of` loop to grab everything.

</slides>

Back to normal docs...
