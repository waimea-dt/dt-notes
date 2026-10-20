# Rolling Code Plugin Tests

## Default

<rolling-code>

---

## Custom Counter Start

<rolling-code counter="123">

---

## Narrow Window

<rolling-code counter="123" window="4">

---

## Small Drift (Still Valid)

<rolling-code counter="123" window="8" drift="2">

---

## Large Drift (Rejected)

<rolling-code counter="123" window="8" drift="20">

---

## With Intercept View

<rolling-code counter="250" window="10" intercept>
