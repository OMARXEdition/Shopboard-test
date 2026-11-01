import test from 'node:test'
import assert from 'node:assert/strict'
import { products } from '../src/products.js'
import { filterProducts, selectProducts, findProduct, formatPrice, categoryLabel, getPasswordStrength } from '../src/logic.js'
import { createCartState } from '../src/state.js'

test('search, category, and price sort compose without changing original order', () => {
  const catalog = [
    { id: 'a', name: 'Trail Shoe', category: 'shoes', price: 90 },
    { id: 'b', name: 'Shoe Bag', category: 'bags', price: 15 },
    { id: 'c', name: 'City SHOE', category: 'shoes', price: 40 },
    { id: 'd', name: 'Walking Boot', category: 'shoes', price: 70 },
  ]
  const before = structuredClone(catalog)
  const ids = (options) => selectProducts(catalog, options).map((product) => product.id)
  assert.deepEqual(ids({ search: 'shoe' }), ['a', 'b', 'c'])
  assert.deepEqual(ids({ search: ' SHOE ' }), ['a', 'b', 'c'])
  assert.deepEqual(ids({ search: 'shoe', category: 'shoes', sort: 'price-asc' }), ['c', 'a'])
  assert.deepEqual(ids({ search: 'shoe', category: 'shoes', sort: 'price-desc' }), ['a', 'c'])
  assert.deepEqual(ids({ sort: 'price-asc' }), ['b', 'c', 'd', 'a'])
  assert.deepEqual(ids({ sort: 'price-desc' }), ['a', 'd', 'c', 'b'])
  assert.deepEqual(ids({ sort: 'default' }), ['a', 'b', 'c', 'd'])
  assert.deepEqual(ids({ search: 'shoe', category: 'shoes', sort: 'default' }), ['a', 'c'])
  assert.deepEqual(ids({ search: 'missing' }), [])
  assert.deepEqual(catalog, before)
})

test('category filtering returns products without mutating the catalog', () => {
  const before = structuredClone(products)
  assert.deepEqual(filterProducts(products, 'accessories').map(p => p.id), [
    'magflow-station', 'volt-power', 'link-usb-hub',
  ])
  assert.equal(filterProducts(products).length, 12)
  assert.deepEqual(filterProducts(products, 'missing'), [])
  assert.deepEqual(products, before)
})

test('product lookup handles known and missing IDs', () => {
  assert.equal(findProduct(products, 'magflow-station').price, 69.99)
  assert.equal(findProduct(products, 'missing'), undefined)
  assert.equal(formatPrice(129.5), '$129.50')
  assert.equal(categoryLabel('audio'), 'Audio Gear')
})

test('password scoring keeps the existing levels', () => {
  for (const [password, expected] of [
    ['', 0], ['short', 0], ['abcdefgh', 1],
    ['abcdefg1', 2], ['abcdefghijkl', 3], ['abcdefghijk!', 4],
  ]) assert.equal(getPasswordStrength(password), expected)
})

test('cart merges quantities, calculates totals, removes lines, clears, and reloads', () => {
  const saved = new Map()
  const storage = {
    getItem: key => saved.get(key),
    setItem: (key, value) => saved.set(key, value),
  }
  const cart = createCartState(storage, products)
  cart.addItem('volt-power')
  cart.addItem('volt-power')
  cart.addItem('aero-buds')
  assert.equal(cart.getItems().length, 2)
  assert.equal(cart.getItems()[0].quantity, 2)
  assert.equal(cart.getCount(), 3)
  assert.equal(cart.getTotal(), 169.97)
  const reloaded = createCartState(storage, products)
  assert.equal(reloaded.getCount(), 3)
  assert.equal(reloaded.getTotal(), 169.97)
  cart.decreaseItem('volt-power')
  assert.equal(cart.getCount(), 2)
  assert.equal(cart.getTotal(), 129.98)
  cart.decreaseItem('volt-power')
  assert.equal(cart.getItems().length, 1)
  assert.equal(cart.getTotal(), 89.99)
  cart.removeItem('aero-buds')
  assert.equal(cart.getCount(), 0)
  assert.equal(cart.getTotal(), 0)
  cart.addItem('volt-power')
  cart.addItem('aero-buds')
  cart.removeItem('volt-power')
  assert.equal(cart.getItems()[0].product.id, 'aero-buds')
  cart.clear()
  assert.deepEqual(cart.getItems(), [])
  assert.equal(cart.getCount(), 0)
  assert.equal(cart.getTotal(), 0)
  assert.equal(createCartState(storage, products).getCount(), 0)
  cart.addItem('missing')
  cart.decreaseItem('missing')
  cart.removeItem('missing')
  assert.equal(cart.getCount(), 0)
})

test('every cart change is persisted and restores identical lines, count, and total', () => {
  const saved = new Map()
  let writes = 0
  const storage = {
    getItem: key => saved.get(key),
    setItem: (key, value) => { saved.set(key, value); writes += 1 },
  }
  const cart = createCartState(storage, products)
  const changes = [
    () => cart.addItem('volt-power'),
    () => cart.addItem('volt-power'),
    () => cart.addItem('aero-buds'),
    () => cart.decreaseItem('volt-power'),
    () => cart.decreaseItem('volt-power'),
    () => cart.addItem('volt-power'),
    () => cart.removeItem('aero-buds'),
    () => cart.clear(),
  ]
  changes.forEach((change, index) => {
    change()
    assert.equal(writes, index + 1)
    const restored = createCartState(storage, products)
    assert.deepEqual(restored.getItems(), cart.getItems())
    assert.equal(restored.getCount(), cart.getCount())
    assert.equal(restored.getTotal(), cart.getTotal())
  })
})

test('cart rejects invalid persisted values and survives storage failures', () => {
  for (const value of ['3', '-2', 'NaN', '4oops', '1.5', 'Infinity', '{}', 'null',
    '[{"id":"missing","quantity":2}]', '[{"id":"volt-power","quantity":-1}]',
    '[{"id":"volt-power","quantity":1.5}]']) {
    assert.equal(createCartState({ getItem: () => value }, products).getCount(), 0)
  }
  const cart = createCartState({
    getItem() { throw Error('blocked') },
    setItem() { throw Error('quota') },
  }, products)
  assert.equal(cart.getCount(), 0)
  cart.addItem('volt-power')
  cart.addItem('volt-power')
  assert.equal(cart.getCount(), 2)
  assert.equal(cart.getTotal(), 79.98)
  cart.clear()
  assert.equal(cart.getCount(), 0)
})
