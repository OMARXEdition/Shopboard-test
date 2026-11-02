import test from 'node:test'
import assert from 'node:assert/strict'
import { initPlantCornerUI } from '../src/modules/plant-corner/plant-corner.ui.ts'
import { products } from '../src/modules/catalog/catalog.data.ts'

function harness(t) {
  class Node extends EventTarget {
    value = ''; hidden = false; disabled = false; textContent = ''; children = []
    classList = { toggle() {} }
    append(...items) { this.children.push(...items) }
    setAttribute() {}
    getBoundingClientRect() { return { width: 800, height: 480 } }
    setPointerCapture() { this.captured = true }
    hasPointerCapture() { return this.captured }
    releasePointerCapture() { this.captured = false }
  }
  const nodes = new Map()
  const frames = new Map()
  let frameId = 0
  const intersections = []
  const resizes = []
  const fakeWindow = new EventTarget()
  Object.assign(fakeWindow, {
    devicePixelRatio: 3,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId },
    cancelAnimationFrame: id => frames.delete(id),
  })
  const globals = {
    document: {
      querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, new Node()); return nodes.get(selector) },
      createElement: () => new Node(),
    },
    window: fakeWindow,
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; intersections.push(this) }
      observe() {} disconnect() { this.disconnected = true }
    },
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; resizes.push(this) }
      observe() {} disconnect() { this.disconnected = true }
    },
  }
  const previous = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, value })
  t.after(() => { for (const key of Object.keys(globals)) {
    if (previous[key]) Object.defineProperty(globalThis, key, previous[key])
    else delete globalThis[key]
  } })
  return {
    nodes, frames, intersections, resizes,
    flush: () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(0)) },
    emit: (id, type, fields = {}) => {
      const event = new Event(type, { cancelable: true })
      Object.entries(fields).forEach(([key, value]) => Object.defineProperty(event, key, { value }))
      nodes.get(id).dispatchEvent(event)
    },
    visible: async () => { intersections[0].callback([{ isIntersecting: true }]); await new Promise(resolve => setImmediate(resolve)) },
  }
}
const renderer = () => ({
  updates: [], sizes: [], renders: 0, disposed: 0,
  update(settings, kind) { this.updates.push({ ...settings, kind }) },
  resize(...size) { this.sizes.push(size) },
  render() { this.renders++ },
  dispose() { this.disposed++ },
})

test('engine loads near viewport, renders on demand and updates every selection', async t => {
  const h = harness(t)
  const scene = renderer()
  let loads = 0
  const ui = initPlantCornerUI(products, { onViewProduct: () => true, onAddToCart: () => true }, async () => { loads++; return scene })
  t.after(ui.destroy)
  assert.equal(loads, 0)
  await h.visible(); h.flush()
  assert.equal(loads, 1)
  assert.equal(scene.renders, 1)
  assert.equal(h.frames.size, 0)
  assert.deepEqual(scene.sizes.at(-1), [800, 480, 1.5])
  for (const [id, value] of [['#corner-plant', 'chronos-pulse'], ['#corner-pot', 'terracotta'], ['#corner-wall', 'sage'], ['#corner-size', 'large']]) {
    h.nodes.get(id).value = value; h.emit(id, 'change')
  }
  h.flush()
  assert.deepEqual(scene.updates.at(-1), { productId: 'chronos-pulse', pot: 'terracotta', wall: 'sage', size: 'large', rotation: 0, kind: 'snake' })
  assert.match(h.nodes.get('#corner-summary').textContent, /لسان الحماة/)
  h.resizes[0].callback([]); h.flush()
  assert.equal(scene.renders, 3)
  ui.destroy(); ui.destroy()
  assert.equal(scene.disposed, 1)
  assert.ok(h.resizes[0].disconnected)
  assert.ok(h.intersections[0].disconnected)
})

test('rotation buttons and horizontal drag clamp view while vertical touch scrolling is preserved', async t => {
  const h = harness(t); const scene = renderer()
  const ui = initPlantCornerUI(products, { onViewProduct: () => true, onAddToCart: () => true }, async () => scene)
  t.after(ui.destroy)
  await h.visible(); h.flush()
  for (let i = 0; i < 10; i++) h.emit('#corner-right', 'click')
  h.flush()
  assert.equal(scene.updates.at(-1).rotation, 22)
  h.emit('#corner-reset', 'click'); h.flush()
  h.emit('#corner-viewport', 'pointerdown', { pointerId: 1, clientX: 50, clientY: 50, button: 0, isPrimary: true })
  h.emit('#corner-viewport', 'pointermove', { pointerId: 1, clientX: 52, clientY: 150 })
  h.flush()
  assert.equal(scene.updates.at(-1).rotation, 0)
  h.emit('#corner-viewport', 'pointerdown', { pointerId: 2, clientX: 50, clientY: 50, button: 0, isPrimary: true })
  h.emit('#corner-viewport', 'pointermove', { pointerId: 2, clientX: -150, clientY: 52 })
  h.emit('#corner-viewport', 'pointerup', { pointerId: 2 })
  h.flush()
  assert.equal(scene.updates.at(-1).rotation, -22)
})

test('loading/WebGL failure keeps correct product controls usable and confirms only successful cart actions', async t => {
  const h = harness(t); const ids = []
  let succeed = false
  const ui = initPlantCornerUI(products, {
    onViewProduct: id => { ids.push(['view', id]); return true },
    onAddToCart: id => { ids.push(['cart', id]); return succeed },
  }, async () => { throw Error('WebGL unavailable') })
  t.after(ui.destroy)
  await h.visible()
  assert.equal(h.nodes.get('#corner-fallback').hidden, false)
  assert.equal(h.nodes.get('#corner-retry').hidden, false)
  h.nodes.get('#corner-plant').value = 'chronos-pulse'; h.emit('#corner-plant', 'change')
  h.emit('#corner-view', 'click'); h.emit('#corner-add', 'click')
  assert.deepEqual(ids, [['view', 'chronos-pulse'], ['cart', 'chronos-pulse']])
  assert.doesNotMatch(h.nodes.get('#corner-action-status').textContent, /أُضيفت/)
  succeed = true; h.emit('#corner-add', 'click')
  assert.match(h.nodes.get('#corner-action-status').textContent, /أُضيفت/)
})

test('late engine resolution after destruction disposes renderer and schedules no rendering', async t => {
  const h = harness(t); const scene = renderer()
  let finish
  const ui = initPlantCornerUI(products, { onViewProduct: () => true, onAddToCart: () => true }, () => new Promise(resolve => { finish = resolve }))
  h.intersections[0].callback([{ isIntersecting: true }])
  ui.destroy()
  finish(scene)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(scene.disposed, 1)
  assert.equal(h.frames.size, 0)
})

test('retry recovers from failed loading and WebGL context loss keeps shopping available', async t => {
  const h = harness(t); const scene = renderer()
  let calls = 0
  const ui = initPlantCornerUI(products, { onViewProduct: () => true, onAddToCart: () => true }, async () => {
    if (++calls === 1) throw Error('network')
    return scene
  })
  t.after(ui.destroy)
  await h.visible()
  h.emit('#corner-retry', 'click')
  await new Promise(resolve => setImmediate(resolve)); h.flush()
  assert.equal(scene.renders, 1)
  assert.equal(h.nodes.get('#corner-fallback').hidden, true)
  h.emit('#corner-canvas', 'webglcontextlost')
  assert.equal(scene.disposed, 1)
  assert.equal(h.nodes.get('#corner-fallback').hidden, false)
  assert.equal(h.nodes.get('#corner-add').disabled, false)
  assert.equal(h.nodes.get('#corner-right').disabled, true)
  ui.destroy()
  const before = calls
  h.emit('#corner-retry', 'click')
  assert.equal(calls, before)
})
