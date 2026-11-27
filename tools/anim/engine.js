/**
 * engine.js - Loads the animation engine (every anim-*.js part docs/index.html lists, in order)
 * into a Node vm context with a small fake DOM, for the checks in this folder. The fake elements
 * record their attributes, inline styles and children, so a drawing can be serialised (ser).
 *
 *   loadEngine(docs, { strict })  window.Anim from a docs folder; strict: in strict mode, with each
 *                                 snapshot's shapes deep-frozen (finder.js)
 */

const fs = require('fs')
const path = require('path')
const vm = require('vm')
const crypto = require('crypto')

class Text {
  constructor(data) { this.data = data; this.nodeType = 3; this.parentNode = null }
  remove() { this.parentNode?.removeChild(this) }
}

class El {
  constructor(tag) {
    this.tagName = tag
    this.attrs = new Map()
    this.children = []
    this.parentNode = null
    this.style = {}
    this.dataset = {}
    this.nodeType = 1
    const classes = () => new Set((this.getAttribute('class') || '').split(' ').filter(Boolean))
    this.classList = {
      add: (name) => this.setAttribute('class', [...classes().add(name)].join(' ')),
      remove() {},
      toggle() {},
      contains: (name) => classes().has(name),
    }
  }
  setAttribute(key, value) { this.attrs.set(key, String(value)) }
  setAttributeNS(ns, key, value) { this.attrs.set(key, String(value)) }
  getAttribute(key) { return this.attrs.has(key) ? this.attrs.get(key) : null }
  hasAttribute(key) { return this.attrs.has(key) }
  removeAttribute(key) { this.attrs.delete(key) }
  toggleAttribute() {}
  removeChild(child) {
    const i = this.children.indexOf(child)
    if (i >= 0) this.children.splice(i, 1)
    child.parentNode = null
  }
  appendChild(child) {
    child.parentNode?.removeChild(child)
    child.parentNode = this
    this.children.push(child)
    return child
  }
  append(...children) { children.forEach((child) => this.appendChild(child)) }
  insertBefore(child, ref) {
    child.parentNode?.removeChild(child)
    child.parentNode = this
    const i = ref ? this.children.indexOf(ref) : -1
    if (i < 0) this.children.push(child)
    else this.children.splice(i, 0, child)
    return child
  }
  remove() { this.parentNode?.removeChild(this) }
  after(node) {
    const parent = this.parentNode
    node.parentNode?.removeChild(node)
    node.parentNode = parent
    parent.children.splice(parent.children.indexOf(this) + 1, 0, node)
  }
  replaceChildren(...children) {
    this.children.forEach((child) => { child.parentNode = null })
    this.children = []
    children.forEach((child) => this.appendChild(child))
  }
  cloneNode(deep) {
    const copy = new El(this.tagName)
    this.attrs.forEach((value, key) => copy.attrs.set(key, value))
    Object.assign(copy.style, this.style)
    if (deep) this.children.forEach((child) => copy.appendChild(child instanceof Text ? new Text(child.data) : child.cloneNode(true)))
    return copy
  }
  contains(node) {
    for (let e = node; e; e = e.parentNode) if (e === this) return true
    return false
  }
  get firstChild() { return this.children[0] || null }
  get childNodes() { return this.children }
  get nextSibling() { return this.parentNode?.children[this.parentNode.children.indexOf(this) + 1] || null }
  get previousSibling() { return this.parentNode?.children[this.parentNode.children.indexOf(this) - 1] || null }
  set textContent(text) { this.replaceChildren(new Text(String(text))) }
  get textContent() { return this.children.map((child) => (child instanceof Text ? child.data : child.textContent)).join('') }
  get innerHTML() { return ser(this) }
  // a canvas: measures text at a fixed width per character, and reads every colour as one pixel
  getContext() {
    return { clearRect() {}, fillRect() {}, getImageData: () => ({ data: [10, 20, 30, 255] }), measureText: (text) => ({ width: 55 * text.length }) }
  }
  animate() { return { cancel() {}, effect: { getTiming: () => ({}) } } }
}

// An element and everything in it as text: attributes and set styles sorted, text nodes quoted
function ser(node) {
  if (node instanceof Text) return `"${node.data}"`
  const attrs = [...node.attrs].sort().map(([key, value]) => `${key}=${value}`).join(' ')
  const style = Object.entries(node.style).filter(([, value]) => value !== '' && value != null).sort().map(([key, value]) => `${key}:${value}`).join(';')
  return `<${node.tagName} ${attrs} {${style}}>${node.children.map(ser).join('')}</>`
}

// A computed colour for any CSS colour: made up, but the same for the same text
const rgbOf = (css) => {
  const h = crypto.createHash('md5').update(String(css)).digest()
  return `rgb(${h[0]}, ${h[1]}, ${h[2]})`
}

// Freezes plain data all the way down (strict: a snapshot's shapes)
function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const key in value) freezeDeep(value[key])
  return value
}

// The anim-*.js parts docs/index.html loads, in order
const partsOf = (docs) => fs.readFileSync(path.join(docs, 'index.html'), 'utf8').match(/_plugins\/visualisation\/anim[\w-]*\.js/g)

function loadEngine(docs, { strict = false } = {}) {
  const document = {
    createElementNS: (ns, tag) => new El(tag), createElement: (tag) => new El(tag), createTextNode: (data) => new Text(data),
    body: null, fonts: null, querySelectorAll: () => [],
  }
  const window = {
    document, CSS: { supports: () => true }, matchMedia: () => ({ matches: false }), addEventListener() {},
    lucide: { icons: new Proxy({}, { get: () => [] }), createElement: () => new El('svg') },
    DocsifyUtils: { escapeHtml: (s) => String(s), registerPlugin() {}, addSwipeSupport() {}, addWheelStepping() {}, preventDoubleClickSelect() {}, generateId: (p) => p },
    getComputedStyle: (el) => ({ fill: rgbOf(el.style.fill), fontStyle: 'normal', fontWeight: '400', fontFamily: 'f' }),
    Node: { TEXT_NODE: 3 }, structuredClone, performance, console, freezeDeep,
  }
  window.window = window
  const context = vm.createContext(window)
  for (const part of partsOf(docs)) {
    let code = fs.readFileSync(path.join(docs, part), 'utf8')
    if (strict) {
      // a write to a frozen shape throws, and compile passes it on rather than listing it as a line's error
      code = `"use strict";${code}`
        .replace('TAKEN.add(shape)', 'TAKEN.add(freezeDeep(shape))')
        .replace('          } catch (error) {\n', '          } catch (error) {\n            if (error instanceof TypeError) throw error\n')
    }
    vm.runInContext(code, context, { filename: part })
  }
  return context.Anim
}

// Every animation on the test pages (docs/_tests/animation*.md): { key: "page.md:line", steps }
function testAnimations(docs, Anim) {
  const dir = path.join(docs, '_tests')
  return fs.readdirSync(dir).filter((file) => /^animation.*\.md$/.test(file)).flatMap((page) => {
    const lines = fs.readFileSync(path.join(dir, page), 'utf8').split('\n')
    return Anim.findBlocks(lines).map((block) => ({
      key: `${page}:${block.start + 1}`,
      steps: Anim.splitBlock(block.lines).map(({ beats }) => ({ beats: beats.map((beat) => ({ scene: beat.scene })) })),
    }))
  })
}

// Compiles one animation as the widget does (assets must be a Map, or image(...) lines fail)
const compileSteps = (Anim, steps) => Anim.compile(steps, { assets: new Map(), centre: { x: 640, y: 360 } })

module.exports = { El, Text, ser, loadEngine, testAnimations, compileSteps }
