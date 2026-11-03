import test from 'node:test'
import assert from 'node:assert/strict'
import { initShowroomUI } from '../src/modules/showroom/showroom.ui.ts'
import { products } from '../src/modules/catalog/catalog.data.ts'

test('RTL showroom keyboard and swipe navigation agree with visible arrows', () => {
  // Minimal DOM boundary: exercise the real event handlers and rendered product.
  const nodes = new Map()
  const element = () => ({
    listeners: new Map(),
    setAttribute() {},
    append() {},
    setPointerCapture() {},
    focus() {},
    scrollIntoView() {},
    addEventListener(type, handler) {
      this.listeners.set(type, handler)
    },
  })
  const previousDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document',
  )
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      querySelector(selector) {
        if (!nodes.has(selector)) nodes.set(selector, element())
        return nodes.get(selector)
      },
      createElement: element,
    },
  })
  try {
    const ui = initShowroomUI(products, () => true)
    const swipe = nodes.get('#phone-swipe')
    const name = nodes.get('#phone-product-name')
    const key = (value) =>
      swipe.listeners.get('keydown')({ key: value, preventDefault() {} })
    assert.equal(name.textContent, products[0].name)
    key('ArrowLeft')
    assert.equal(name.textContent, products[1].name)
    key('ArrowRight')
    assert.equal(name.textContent, products[0].name)
    key('ArrowRight')
    assert.equal(name.textContent, products.at(-1).name)
    nodes.get('#phone-next').listeners.get('click')()
    assert.equal(name.textContent, products[0].name)
    const drag = (delta) => {
      swipe.listeners.get('pointerdown')({
        isPrimary: true,
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      })
      swipe.listeners.get('pointerup')({
        clientX: 100 + delta,
        clientY: 100,
        pointerId: 1,
      })
    }
    drag(100)
    assert.equal(name.textContent, products[1].name)
    drag(-100)
    assert.equal(name.textContent, products[0].name)
    assert.equal(ui.viewProduct(products[2].id), true)
    assert.equal(name.textContent, products[2].name)
    assert.equal(ui.viewProduct('missing-id'), false)
    assert.equal(name.textContent, products[2].name)
  } finally {
    if (previousDocument)
      Object.defineProperty(globalThis, 'document', previousDocument)
    else delete globalThis.document
  }
})
