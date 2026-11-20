# Animation: Images and Scenes

Click an animation to give it focus, then use ← / → (or scroll) to step and `F` for full screen.

**Animation tests:** [Blocks](animation.md) · [Examples](animation-examples.md) · [Shapes, Looks and Highlights](animation-shapes.md) · [Movement, Timing and Camera](animation-motion.md) · **Images and Scenes** · [Data Structures and Code](animation-data.md) · [Errors](animation-errors.md)

Scratch stages as full backdrops (`back` layer, 480×360 on a 16x12 grid, `crop`ped so nothing shows outside the stage), with sprites moving, turning and scaling on top, and the camera zooming in, out and panning across the scene.

## Feature: Space mission

Backdrop, an arc with a turn and a shrink, the camera riding along, a spinning asteroid, zooming out past the stage's edge.

<animation grid="16x12" crop>

# Space Mission

On the launch pad.

```anim
bg: image(../_assets/scratch/stages/space.svg) at 8.5,6.5 size 16x12 back
earth: image(../_assets/scratch/sprites/earth.svg) at 3,10 size 5
moon: image(../_assets/scratch/sprites/moon.svg) at 13.5,3 size 2.5
rocket: image(../_assets/scratch/sprites/rocket1.svg) at 4,7 size 1.5x2.5 angle up pop
```

---

## Countdown

The camera zooms in on the rocket.

```anim
camera at rocket zoom 2.5 speed slow
```

+++

```anim
rocket: shake
```

---

## Lift off

An arc towards the moon: turning a further 60° (a signed angle on a change is relative) to face it, and shrinking with distance, with the camera following at the same speed.

```anim
rocket: move 11,4 via 5,2 angle +60 scale 0.6 speed vslow
camera at rocket zoom 1.5 speed vslow
```

---

## Asteroid field

The camera pulls back. An asteroid spins (linear, a full turn) as it drifts across, and a second one tumbles past on a wave.

```anim
camera reset speed slow
a1: image(../_assets/scratch/sprites/asteroid.svg) at 15,9 size 1.5 pop
a2: image(../_assets/scratch/sprites/asteroid.svg) at 1,5 size 0.8 angle 30 pop
```

+++

```anim
a1: move 7,9 angle +360 speed vslow ease linear
a2: move 15,6 via 5,3 via 10,8 angle +540 scale 1.5 speed vslow ease linear
```

---

## Landing

The rocket turns upright and settles on the moon, the camera closing in.

```anim
a1: delete
a2: delete
rocket: move 13.5,1.4 angle up scale 0.4 speed slow
camera at moon zoom 3 speed slow
```

+++

```anim
astro: image(../_assets/scratch/sprites/astronaut.svg) at 14.4,2.2 size 0.6 pop
```

+++

```anim
astro: bounce
flag: image(../_assets/scratch/sprites/flag.svg) at 12.7,2.3 size 0.6 pop
```

---

## Visitors

Zoom out past the stage (zoom below 1): the stage shows smaller, and with `crop` nothing outside it is drawn, so the UFO appears at its edge as it flies in, wobbling, and zips round the scene.

```anim
camera at 8.5,6.5 zoom 0.7 speed slow
ufo: image(../_assets/scratch/sprites/ufo.svg) at -2,1 size 2 front
```

+++

```anim
ufo: travel 8,2 14,7 6,10 speed fast
```

+++

```anim
ufo: wobble
ufo: scale 1.6 angle -15 speed fast
```

---

## Home again

```anim
camera reset speed slow
ufo: move 19,-2 scale 0.5 speed slow
earth: angle +90 speed vslow
```

</animation>

## Feature: Under the sea

Sprites over the water backdrop: swimming on waves, a group moving as one, a crab scuttling, a turtle following a hidden curve, and the camera travelling between them.

<animation grid="16x12" crop>

# Under the Sea

```anim
bg: image(../_assets/scratch/stages/water.svg) at 8.5,6.5 size 16x12 back
crab: image(../_assets/scratch/sprites/crab.svg) at 3,11 size 1.5
turtle: image(../_assets/scratch/sprites/turtle.svg) at 13,9 size 2.5
f1: image(../_assets/scratch/sprites/fish.svg) at 2,3 size 1.5 pop
f2: image(../_assets/scratch/sprites/fish.svg) at 3,4.5 size 1 pop delay 0.2
f3: image(../_assets/scratch/sprites/fish.svg) at 1.5,5.5 size 0.8 pop delay 0.4
```

---

## A school of fish

Grouped, they swim as one along a wave, each fish tilting up then down.

```anim
school: group [f1 f2 f3]
school: move 8,3 via 5,1.5 speed slow
f1: angle -10 speed slow
f2: angle -10 speed slow
f3: angle -10 speed slow
```

+++

```anim
school: move 13,5 via 10.5,6.5 speed slow
f1: angle 15 speed slow
f2: angle 15 speed slow
f3: angle 15 speed slow
```

---

## Scuttle

The camera follows the crab along the sea bed.

```anim
camera at crab zoom 2.5 speed slow
```

+++

```anim
crab: move 9,11 speed slow ease linear
camera at crab zoom 2.5 speed slow ease linear
```

+++

```anim
crab: shake
crab: scale 1.3 speed fast
```

---

## The turtle's route

The turtle follows a curve whose line is hidden (`weight 0`).

```anim
camera reset speed slow
route: curve from turtle to 4,7 via 11,4 via 6,3 weight 0
```

+++

```anim
turtle: follow route angle -20 speed vslow
```

---

## Tour

The camera travels between the three, then shows the whole scene.

```anim
camera travel school crab turtle zoom 2 speed slow
```

+++

```anim
camera reset
school: ungroup
f1: move +4,-1 scale 1.4 speed slow
f2: move +2,+2 angle +360 speed slow
f3: delete pop
```

</animation>

## Feature: Layers in the sky

Layers on images, on a 16x9 grid: the 4:3 backdrop at the back with `cover`, so it fills the grid (cropped top and bottom), a bird in the normal layer, and clouds in front of it (`front`) so it flies behind them. Plays by itself when on screen, and loops.

<animation grid="16x9" crop autoplay loop hold="0.5">

# Layers in the Sky

```anim
bg: image(../_assets/scratch/stages/sky.svg) at 8.5,5 size 16x9 cover back
c1: image(../_assets/scratch/sprites/cloud.svg) at 6,3 size 3 front
c2: image(../_assets/scratch/sprites/cloud.svg) at 12,5 size 2.5 front
bird: image(../_assets/scratch/sprites/bird.svg) at 1,5 size 1.5
```

---

## Flying through

The bird flies on a wave, behind both clouds, as they drift.

```anim
bird: move 15,4 via 5,2 via 10,6 speed vslow ease linear
c1: move +2,0 speed vslow ease linear
c2: move -2,0 speed vslow ease linear
```

---

## Close up

```anim
camera at bird zoom 3 speed slow
```

+++

```anim
bird: wobble
bird: angle -30 scale 1.3 speed fast
```

---

## Back round

The camera pans with the bird as it heads back.

```anim
bird: move 3,8 angle 0 scale 1 speed slow
camera at bird zoom 1.5 speed slow
```

+++

```anim
camera reset speed slow
bird: move 1,5 speed slow
c1: move 6,3 speed slow
c2: move 12,5 speed slow
```

</animation>
