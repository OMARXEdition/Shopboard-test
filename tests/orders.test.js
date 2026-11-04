import test from 'node:test'
import assert from 'node:assert/strict'
import { createOrderSnapshot } from '../src/modules/orders/orders.logic.ts'
import { createOrdersState } from '../src/modules/orders/orders.state.ts'
import { initOrdersUI } from '../src/modules/orders/orders.ui.ts'

const items = () => [
  { product: { id: 'plant-a', name: 'مونستيرا', price: 19.99 }, quantity: 2 },
  { product: { id: 'plant-b', name: 'بوتس', price: 0.1 }, quantity: 3 },
]
const snapshot = (id = 'NB-1', date = '2026-11-02T12:00:00.000Z') =>
  createOrderSnapshot(items(), id, date)
const storage = () => {
  const values = new Map()
  return {
    values,
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  }
}

test('order snapshots preserve names, quantities and integer-cent prices independently of the catalog', () => {
  const cartItems = items()
  const order = createOrderSnapshot(
    cartItems,
    'NB-1',
    '2026-11-02T12:00:00.000Z',
  )
  assert.equal(order.totalCents, 4028)
  assert.equal(order.currency, 'USD')
  cartItems[0].product.name = 'changed'
  cartItems[0].product.price = 1000
  cartItems[0].quantity = 10
  assert.deepEqual(order.items[0], {
    productId: 'plant-a',
    name: 'مونستيرا',
    unitPriceCents: 1999,
    quantity: 2,
  })
})

test('empty orders and invalid quantities, prices, identities and dates are rejected', () => {
  assert.throws(() => createOrderSnapshot([], 'NB-1', '2026-11-02'))
  for (const quantity of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() =>
      createOrderSnapshot([{ ...items()[0], quantity }], 'NB-1', '2026-11-02'),
    )
  }
  for (const price of [-1, NaN, Infinity, Number.MAX_VALUE]) {
    assert.throws(() =>
      createOrderSnapshot(
        [{ product: { ...items()[0].product, price }, quantity: 1 }],
        'NB-1',
        '2026-11-02',
      ),
    )
  }
  assert.throws(() => createOrderSnapshot(items(), '', '2026-11-02'))
  assert.throws(() => createOrderSnapshot(items(), 'NB-1', 'invalid'))
})

test('orders reload newest first using nabta:orders and duplicate IDs cannot create duplicate orders', () => {
  const store = storage()
  const state = createOrdersState(store)
  const first = snapshot()
  const second = snapshot('NB-2', '2026-11-03T12:00:00.000Z')
  state.saveOrder(second)
  state.saveOrder(first)
  state.saveOrder(first)
  assert.equal(JSON.parse(store.values.get('nabta:orders')).length, 2)
  assert.deepEqual(
    createOrdersState(store)
      .getOrders()
      .map((order) => order.id),
    ['NB-2', 'NB-1'],
  )
  const result = state.getOrders()
  result[0].items[0].name = 'changed'
  assert.equal(state.getOrders()[0].items[0].name, 'مونستيرا')
})

test('invalid saved records are ignored; malformed history is reported without overwriting it', () => {
  const store = storage()
  const valid = snapshot()
  const invalid = [
    null,
    {},
    { ...valid, totalCents: -1 },
    { ...valid, totalCents: 1 },
    { ...valid, currency: 'EUR' },
    { ...valid, items: [] },
  ]
  store.values.set('nabta:orders', JSON.stringify([valid, ...invalid]))
  assert.deepEqual(createOrdersState(store).getOrders(), [valid])
  store.values.set('nabta:orders', '{broken')
  assert.throws(() => createOrdersState(store).getOrders())
  assert.throws(() => createOrdersState(store).saveOrder(snapshot('NB-2')))
  assert.equal(store.values.get('nabta:orders'), '{broken')
})

test('failed persistence and blocked reads report failure without changing saved history', () => {
  const first = snapshot()
  const store = storage()
  createOrdersState(store).saveOrder(first)
  const previous = store.values.get('nabta:orders')
  const failing = createOrdersState({
    getItem: store.getItem,
    setItem() {
      throw Error('quota')
    },
  })
  assert.throws(() => failing.saveOrder(snapshot('NB-2')))
  assert.equal(store.values.get('nabta:orders'), previous)
  assert.throws(() =>
    createOrdersState({
      getItem() {
        throw Error('blocked')
      },
      setItem() {},
    }).saveOrder(first),
  )
})

// Exercise actual UI handlers at the DOM boundary without adding a dependency.
function withOrdersDOM(run) {
  const nodes = new Map()
  const element = () => ({
    children: [],
    listeners: new Map(),
    open: false,
    append(...children) {
      this.children.push(...children)
    },
    replaceChildren(...children) {
      this.children = children
    },
    setAttribute() {},
    focus() {},
    addEventListener(type, handler) {
      this.listeners.set(type, handler)
    },
    showModal() {
      this.open = true
    },
    close() {
      this.open = false
      this.listeners.get('close')?.()
    },
  })
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document')
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
    run(nodes)
  } finally {
    if (previous) Object.defineProperty(globalThis, 'document', previous)
    else delete globalThis.document
  }
}

test('review confirms once, refreshes history, and only clears cart after successful saving', () =>
  withOrdersDOM((nodes) => {
    const state = createOrdersState(storage())
    let cartItems = items()
    let cleared = 0
    const ui = initOrdersUI(state, {
      getCartItems: () => cartItems,
      onPlaced: () => {
        cleared++
        cartItems = []
      },
      onCancel() {},
    })
    ui.openReview()
    assert.equal(nodes.get('#order-review-dialog').open, true)
    const confirm = nodes.get('#order-confirm')
    confirm.listeners.get('click')()
    confirm.listeners.get('click')()
    assert.equal(state.getOrders().length, 1)
    assert.equal(cleared, 1)
    assert.equal(nodes.get('#order-review-dialog').open, false)
    assert.equal(nodes.get('#orders-list').children.length, 1)
    assert.equal(nodes.get('#orders-empty').hidden, true)
    ui.openReview()
    assert.equal(nodes.get('#order-review-dialog').open, false)
  }))

test('save failure keeps review open, allows retry, and leaves cart intact; cancel creates no order', () =>
  withOrdersDOM((nodes) => {
    let fail = true
    let cleared = 0
    let cancelled = 0
    const state = createOrdersState(storage())
    const ui = initOrdersUI(
      {
        getOrders: state.getOrders,
        saveOrder(order) {
          if (fail) throw Error('quota')
          return state.saveOrder(order)
        },
      },
      {
        getCartItems: items,
        onPlaced: () => cleared++,
        onCancel: () => cancelled++,
      },
    )
    ui.openReview()
    const confirm = nodes.get('#order-confirm')
    confirm.listeners.get('click')()
    assert.equal(cleared, 0)
    assert.equal(nodes.get('#order-review-dialog').open, true)
    assert.equal(confirm.disabled, false)
    assert.equal(nodes.get('#order-review-status').hidden, false)
    assert.equal(state.getOrders().length, 0)
    fail = false
    confirm.listeners.get('click')()
    assert.equal(cleared, 1)
    ui.openReview()
    nodes.get('#order-review-cancel').listeners.get('click')()
    assert.equal(cancelled, 1)
    assert.equal(state.getOrders().length, 1)
  }))
