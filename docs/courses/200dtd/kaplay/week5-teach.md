# Week 5: Fly, Shoot, Explode


## Lesson 1: Shooting

<slides>

# Lesson 1: Shooting

Note:
Today the ship moves and fires. No enemies yet. The idea: a bullet is just an object that we add on a key press and move every frame

---

## Learning

- Moving a ship with the **arrow keys**
- Keeping it **on the screen**
- **Bullets** that move by themselves
- **Cleaning up**

---

## Move the Ship

```js
onKeyDown("left", () => {
    player.move(-playerSpeed, 0)
})

onUpdate(() => {
    player.pos.x = clamp(player.pos.x, 30, width() - 30)
})
```

`clamp` keeps a number **between** two limits

Note:
onKeyDown runs every frame while held. Ask what happens with no clamp

---

## Fire!

```js
onKeyPress("space", () => {
    add([
        sprite("star"),
        pos(player.pos.x, player.pos.y - 40),
        offscreen({ destroy: true }),
        "bullet",
    ])
})

onUpdate("bullet", (bullet) => {
    bullet.move(0, -bulletSpeed)
})
```

**Add** one on a key press, **move** them all every frame

Note:
y gets smaller going up, so the speed is negative. offscreen with destroy stops the bullets piling up. Show the bullet counter in the Investigate step

---

## Make: Your Own Ship

- Moves and **stays on the screen**
- **SPACE** fires
- Bullets go up and **clean up**
- Your own **look**

</slides>



## Lesson 2: Enemies & Collisions

<slides>

# Lesson 2: Enemies & Collisions

Note:
The bugs arrive. The big new idea is the collision, and the gotcha that both objects need isSensor

---

## Learning

- **Spawning** enemies
- Each with its **own speed**
- **Collisions**
- **Explosions** and **score**

---

## Enemies

```js
add([
    sprite("beetle"),
    pos(rand(40, width() - 40), -40),
    area({ isSensor: true }),
    "enemy",
    { speed: rand(100, 200) },
])
```

Our own **property**: `enemy.speed`

Note:
Same trick as the door in week 4 with destination and needs. Each bug carries its own value

---

## Collisions

```js
onCollide("bullet", "enemy", (bullet, enemy) => {
    addKaboom(enemy.pos)
    destroy(bullet)
    destroy(enemy)
    score = score + 10
})
```

The objects arrive in the **same order** as the tags

---

## The Gotcha

Both need

```js
area({ isSensor: true })
```

**No error** if it's missing: nothing just happens

Note:
This is the first thing to check when a collision does nothing. Demo it live by deleting it from the enemy

---

## Make: Pest Control

- **Random** places, own speeds
- **Two kinds** of enemy
- **Explosion** and **score**
- Nothing piling up

</slides>



## Lesson 3: Lives & Difficulty

<slides>

# Lesson 3: Lives & Difficulty

Note:
Everything in this lesson is week 4 again, in a new costume: global state, a HUD that watches it, and scenes

---

## Learning

- **Lives** in the state
- **One function** to lose a life
- A **fresh start** each game
- A game that gets **harder**

---

## One Place to Lose a Life

```js
function loseLife() {
    lives = lives - 1
    shake(12)

    if (lives <= 0) {
        go("gameover")
    }
}
```

Called when a bug **hits** the ship, and when one **gets past**

---

## Fresh Start

```js
scene("game", () => {
    score = 0
    lives = 3
    // ...
})
```

Without this, game two begins with the numbers from game one

Note:
It is the same as resetGame in the haunted house, just done at the start of the scene

---

## Harder and Harder

```js
{ speed: rand(100, 200) + score / 2 }
```

The **state** changes the **game**

Note:
Use the trace in the Investigate step. Ask what a good difficulty curve feels like

---

## Make: Danger!

- **Lives** on the HUD
- **Game over** and a fresh restart
- Enemies that get **harder**

</slides>



## Lesson 4: Build a Shooter

<slides>

# Lesson 4: Build a Shooter

Note:
Another student-led lesson. Show the demo game, then let them plan. Check every plan before they build

---

## The Brief

Your own **shooter**

- Moves and **shoots**
- **Two kinds** of enemy, with explosions
- **Score** and **lives**
- **Title**, game and game over **scenes**
- Gets **harder**
- Your own **theme**

---

## Plan First

- Theme and name
- A **sketch** of the screen
- Your **enemies**
- How you **lose**

*Show your teacher before building!*

Note:
A small, finished game beats a big, unfinished one

---

## Checkpoints

1. **Ship**: moves and shoots
2. **Enemies**: two kinds, explosions
3. **Danger**: lives and game over
4. **Scenes and difficulty**

---

## Playtesting

Swap computers with a partner...

- Watch, don't explain
- How long did they **last**?
- Any **bugs**?

</slides>
