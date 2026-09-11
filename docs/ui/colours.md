# Colour Palettes

## What is a Colour Scheme?

A **colour scheme** is a carefully chosen set of colours used throughout a design project. Good colour schemes:

- Create visual harmony and balance
- Establish mood and atmosphere
- Improve readability and accessibility
- Connect with a brand's identity
- Guide user attention to important details

### Primary and Accent Colours

Most modern websites stick to a simple colour palette:

<cards size="narrow">

**Primary colour**

The main brand colour, used for headers, navigation, and key UI elements

---

**Accent colour**

A contrasting colour used sparingly for buttons, links, and important highlights

---

**Neutrals**

Black, white, and shades of grey for text and backgrounds

---

**Shades**

Lighter and darker variations of the primary colour for depth and variety

</cards>


> [!TIP]
> The **accent colour** should **contrast** with the primary colour to draw attention. Complementary colours (opposites on the colour wheel) work well.


## Colour Selection Help

> [!TIP]
> Try the DT Notes [Colour Picker Tool](/ui/colour-pick.md) to explore colours on a simulated website UI

See the [Colour Tools](/tools/des-colour.md) list for some great websites and tools to help you choose colours, and check out these videos for help with colour:

<videoembed playlist-grid id="7PRSqUwAuis,mq8LYj6kRyE,_2LLXnUdUIc,DjA0oiMI3ME,C1rQQ_YpgcI"></videoembed>


## Accessibility Considerations

Always ensure sufficient **contrast** between text and background:
- **4.5:1 ratio** minimum for normal text
- **3:1 ratio** minimum for large text

Test your colours with accessibility checkers (you can find these in browser **developer tools**) and also on the [Accessibility Tools](/tools/des-access.md) page.

### Example of Poor Contrast

In this example, the colour palette has poor contrast between text and background colours, resulting in poor accessibility for users with vision impairments...

<accessibility mode="contrast" header="false" theme="lowcontrast">

```html
<header>
    <h1>Riverside Art College</h1>
    <nav aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#courses">Courses</a>
        <a href="#support">Support</a>
    </nav>
</header>

<main>
    <h2>Course Overview</h2>
    <p>Choose a pathway and check practical tasks for this week.</p>

    <section>
        <h3>Highlights</h3>
        <ul>
            <li><a href="#design">Design Studio</a></li>
            <li><a href="#code">Creative Coding</a></li>
            <li><a href="#media">Digital Media</a></li>
        </ul>
    </section>

    <form>
        <h3>Search Courses</h3>
        <label for="course-search">Name</label>
        <input id="course-search" type="text" placeholder="e.g. Digital Design">
        <button type="submit">Search</button>
    </form>
</main>
```

</accessibility>


### Example of Excellent Contrast

In this example, the colours have been chosen so that they provide excellent contrast between text and backgrounds...

<accessibility mode="contrast" header="false" theme="blue">

```html
<header>
    <h1>Riverside Art College</h1>
    <nav aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#courses">Courses</a>
        <a href="#support">Support</a>
    </nav>
</header>

<main>
    <h2>Course Overview</h2>
    <p>Choose a pathway and check practical tasks for this week.</p>

    <section>
        <h3>Highlights</h3>
        <ul>
            <li><a href="#design">Design Studio</a></li>
            <li><a href="#code">Creative Coding</a></li>
            <li><a href="#media">Digital Media</a></li>
        </ul>
    </section>

    <form>
        <h3>Search Courses</h3>
        <label for="course-search">Name</label>
        <input id="course-search" type="text" placeholder="e.g. Digital Design">
        <button type="submit">Search</button>
    </form>
</main>
```

</accessibility>


### Impact on Users with Colour-Blindness

A small but significant number of your users will have colour-blindness of some sort. Your colour choices can really impact these users - colours that might have good contrast with normal vision can have very low contrast for colour-blind users...

<accessibility mode="colour-blind" header="false" theme="colourful2">

```html
<header>
    <h1>Riverside Art College</h1>
    <nav aria-label="Main navigation">
        <a href="#home">Home</a>
        <a href="#courses">Courses</a>
        <a href="#support">Support</a>
    </nav>
</header>

<main>
    <h2>Course Overview</h2>
    <p>Choose a pathway and check practical tasks for this week.</p>

    <section>
        <h3>Highlights</h3>
        <ul>
            <li><a href="#design">Design Studio</a></li>
            <li><a href="#code">Creative Coding</a></li>
            <li><a href="#media">Digital Media</a></li>
        </ul>
    </section>

    <img src="web/accessibility/_assets/spectrum.png" alt="Spectrum">
</main>
```

</accessibility>

