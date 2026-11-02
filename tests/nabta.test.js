import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { products } from '../src/modules/catalog/catalog.data.ts'
import { selectProducts, categoryLabel } from '../src/modules/catalog/catalog.logic.ts'
import { createCartState } from '../src/modules/cart/cart.state.ts'

test('Nabta supports Arabic search combined with category and price sorting', () => {
  const result = selectProducts(products, { search: 'مونستيرا', category: 'indoor', sort: 'price-asc' })
  assert.deepEqual(result.map(product => product.id), ['acoustic-pro'])
  assert.equal(categoryLabel('indoor'), 'نباتات داخلية')
})

test('saved carts keep their legacy identifiers and storage key after rebranding', () => {
  const saved = new Map([['shopboard:cart', JSON.stringify([{ id: 'volt-power', quantity: 2 }])]])
  const cart = createCartState({ getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) }, products)
  assert.equal(cart.getCount(), 2)
  assert.equal(cart.getItems()[0].product.id, 'volt-power')
  cart.addItem('aero-buds')
  assert.deepEqual(JSON.parse(saved.get('shopboard:cart')), [
    { id: 'volt-power', quantity: 2 }, { id: 'aero-buds', quantity: 1 },
  ])
})

test('approved logo is used twice with accessible text and Arabic document direction', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /<html lang="ar" dir="rtl">/)
  assert.equal((html.match(/alt="نبتة — Nabta"/g) ?? []).length, 2)
  assert.equal((html.match(/src="\/src\/assets\/nabta-logo.png"/g) ?? []).length, 2)
  assert.match(html, /family=Aref\+Ruqaa/)
})
