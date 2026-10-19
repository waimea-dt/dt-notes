# JavaScript Runner

## Output

```js run
console.log("Hello, player one!")
console.log("Score:", 9000, "- it's over 9000!")
```

## Objects and Arrays

```js run
const party = ["Mage", "Rogue", "Healer"]
console.log(party)
console.log({ name: "Steve", level: 21 })
```

## Loops

```js run
for (let level = 1; level <= 5; level++) {
    console.log(`Level ${level}: ${"#".repeat(level)}`)
}
```

## Warnings and Errors

```js run
console.warn("Battery low: only 1% left")
console.error("Boss fight failed")
```

## Uncaught Error

```js run
const boss = undefined
console.log(boss.health)
```

## Async

```js run
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

console.log("Loading...")
await sleep(1000)
console.log("Done!")
```

## Infinite Loop (stopped after 5 seconds)

```js run
while (true) {}
```
