import test from 'node:test'
import assert from 'node:assert/strict'
import { products } from '../src/data.js'
import { filterProducts, findProduct, formatPrice, categoryLabel, getPasswordStrength } from '../src/logic.js'
import { createCartState } from '../src/state.js'

test('category filtering returns products without mutating the catalog', () => {
  const before = structuredClone(products)
  assert.deepEqual(filterProducts(products, 'accessories').map(p => p.id), ['magflow-station'])
  assert.equal(filterProducts(products).length, 4)
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

test('cart restores, increments, saves, and reloads the existing count format', () => {
  const saved = new Map([['shopboard:cart', '3']])
  const storage = {
    getItem: key => saved.get(key),
    setItem: (key, value) => saved.set(key, value),
  }
  const cart = createCartState(storage)
  assert.equal(cart.getCount(), 3)
  assert.equal(cart.addItem(), 4)
  assert.equal(saved.get('shopboard:cart'), '4')
  assert.equal(createCartState(storage).getCount(), 4)
})

test('cart rejects invalid persisted values and survives storage failures', () => {
  for (const value of ['-2', 'NaN', '4oops', '1.5', 'Infinity', '{}']) {
    assert.equal(createCartState({ getItem: () => value }).getCount(), 0)
  }
  const cart = createCartState({
    getItem() { throw Error('blocked') },
    setItem() { throw Error('quota') },
  })
  assert.equal(cart.getCount(), 0)
  assert.equal(cart.addItem(), 1)
  assert.equal(cart.addItem(), 2)
})