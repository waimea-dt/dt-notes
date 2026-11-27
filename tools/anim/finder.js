/**
 * finder.js - Shared-shape check for the animation engine: compiles and draws every animation on
 * the test pages with the engine in strict mode and each beat's snapshot deep-frozen, so any change
 * to a shape a past beat shares (one that skips own(): dev/animation/engine.md, "Snapshots share
 * shapes") throws. Lists each place found, with its stack and an animation that reaches it.
 *
 *   node tools/anim/finder.js
 *
 * It only finds what the test pages reach: a new feature needs a test that uses it.
 */

const path = require('path')
const { El, loadEngine, testAnimations, compileSteps } = require('./engine')

const DOCS = path.resolve(__dirname, '../../docs')
const MOMENTS = [0, 0.5, 1]

const Anim = loadEngine(DOCS, { strict: true })
const places = new Map() // message and stack -> animations
for (const { key, steps } of testAnimations(DOCS, Anim)) {
  try {
    const compiled = compileSteps(Anim, steps)
    const renderer = Anim.createRenderer(new El('svg'), Anim.viewBoxFor('', compiled.beats, []), false)
    for (let i = 1; i < compiled.beats.length; i++) {
      const [a, b] = [compiled.beats[i - 1], compiled.beats[i]]
      for (const k of MOMENTS) renderer.render(a.state, b.state, b.meta, () => k, b.state, { forward: true, beatT: k })
    }
  } catch (error) {
    const stack = (error.stack || '').split('\n').filter((line) => /anim-/.test(line)).slice(0, 6).map((line) => line.trim().replace(/^at /, '')).join('\n    < ')
    const place = `${error.message}\n    @ ${stack}`
    places.set(place, [...(places.get(place) || []), key])
  }
}
for (const [place, keys] of places) console.log(`${keys.length}x ${place}\n    e.g. ${keys[0]}\n`)
console.log(places.size ? `${places.size} place${places.size === 1 ? '' : 's'} change${places.size === 1 ? 's' : ''} a shared shape` : 'No changes to shared shapes')
process.exitCode = places.size ? 1 : 0
