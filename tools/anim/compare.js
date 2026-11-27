/**
 * compare.js - Before / after check for the animation engine: compiles and draws every animation
 * on the test pages (docs/_tests/animation*.md) with a committed engine and the working one, and
 * lists those whose compiled beats, errors and warnings, or drawn SVG differ.
 *
 *   node tools/anim/compare.js          # working tree against HEAD
 *   node tools/anim/compare.js 7515b98  # against another commit
 *
 * Each animation is drawn intro, forwards and backwards, every part of every beat at 0, 1/4, 1/2,
 * 3/4 and 1, then each beat as it is, with one renderer (so a pass's skipped shapes are covered).
 * A refactor should change nothing; a feature only its own animations.
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')
const { El, ser, loadEngine, testAnimations, compileSteps } = require('./engine')

const REPO = path.resolve(__dirname, '../..')
const MOMENTS = [0, 0.25, 0.5, 0.75, 1]

// The engine's Maps and Sets come from another realm (the vm), so they're found by their tag
const tagOf = (value) => Object.prototype.toString.call(value)
const replacer = (key, value) => (tagOf(value) === '[object Map]' || tagOf(value) === '[object Set]' ? [...value] : value === Infinity ? 'Infinity' : value)
const hash = (text) => crypto.createHash('md5').update(text).digest('hex')

// Every frame of an animation as drawn, as text
function framesOf(Anim, compiled) {
  const svg = new El('svg')
  const renderer = Anim.createRenderer(svg, Anim.viewBoxFor('', compiled.beats, []), false)
  const frames = []
  const empty = new Map()
  compiled.beats.forEach((beat, i) => {
    const parts = [...beat.chain, beat]
    parts.forEach((part, j) => {
      const a = j ? parts[j - 1].state : i ? compiled.beats[i - 1].state : empty
      for (const forward of [true, false]) {
        for (const k of MOMENTS) {
          renderer.render(a, part.state, part.meta, () => k, forward ? part.state : a, { forward, beatT: k })
          frames.push(ser(svg))
        }
      }
    })
    renderer.render(beat.state, beat.state, { tweens: new Map() }, () => 1, beat.state)
    frames.push(ser(svg))
  })
  return frames
}

// Each test animation's hashes: compiled (c) and drawn (r)
function hashes(docs) {
  const Anim = loadEngine(docs)
  return new Map(testAnimations(docs, Anim).map(({ key, steps }) => {
    const compiled = compileSteps(Anim, steps)
    return [key, { c: hash(JSON.stringify([compiled.beats, compiled.errors, compiled.warnings], replacer)), r: hash(framesOf(Anim, compiled).join('\n')) }]
  }))
}

const ref = process.argv[2] || 'HEAD'
const base = fs.mkdtempSync(path.join(os.tmpdir(), 'anim-compare-'))
try {
  execSync(`git archive ${ref} docs | tar -x -C "${base}"`, { cwd: REPO, stdio: ['ignore', 'ignore', 'inherit'] })
  const [before, after] = [hashes(path.join(base, 'docs')), hashes(path.join(REPO, 'docs'))]
  let differ = 0
  for (const [key, b] of before) {
    const a = after.get(key)
    if (!a) { console.log(`missing   ${key}`); differ++; continue }
    if (a.c === b.c && a.r === b.r) continue
    console.log(`differs   ${key} (${[a.c !== b.c && 'compiled', a.r !== b.r && 'drawn'].filter(Boolean).join(', ')})`)
    differ++
  }
  for (const key of after.keys()) if (!before.has(key)) console.log(`new       ${key}`)
  console.log(`${before.size} animations against ${ref}, ${differ} differ`)
} finally {
  fs.rmSync(base, { recursive: true, force: true })
}
