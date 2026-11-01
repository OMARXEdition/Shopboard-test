// Persist IDs and quantities, deriving prices from the current catalog.
const CART_KEY = 'shopboard:cart'

export const createCartState = (storage, catalog = []) => {
  const knownProducts = new Map(catalog.map((product) => [product.id, product]))
  const quantities = new Map()
  try {
    // Lazy access keeps importing this module safe outside the browser.
    storage ??= globalThis.localStorage
    const saved = JSON.parse(storage?.getItem(CART_KEY) ?? '[]')
    // Legacy counts cannot identify products; start those carts empty.
    if (Array.isArray(saved)) saved.forEach((item) => {
      if (item && knownProducts.has(item.id) && Number.isSafeInteger(item.quantity) && item.quantity > 0) {
        quantities.set(item.id, item.quantity)
      }
    })
  } catch {
    // Keep an in-memory cart when browser storage is unavailable.
  }

  const save = () => {
    try {
      storage?.setItem(CART_KEY, JSON.stringify(Array.from(quantities, ([id, quantity]) => ({ id, quantity }))))
    } catch {
      // Cart interactions continue even when persistence is blocked.
    }
  }

  const getItems = () => Array.from(quantities, ([id, quantity]) => ({ product: knownProducts.get(id), quantity }))
  return {
    getItems,
    getCount: () => Array.from(quantities.values()).reduce((sum, quantity) => sum + quantity, 0),
    getTotal: () => getItems().reduce((cents, { product, quantity }) => cents + Math.round(product.price * 100) * quantity, 0) / 100,
    addItem: (id) => {
      if (!knownProducts.has(id)) return
      quantities.set(id, (quantities.get(id) ?? 0) + 1)
      save()
    },
    decreaseItem: (id) => {
      const quantity = quantities.get(id)
      if (!quantity) return
      if (quantity === 1) quantities.delete(id)
      else quantities.set(id, quantity - 1)
      save()
    },
    removeItem: (id) => {
      quantities.delete(id)
      save()
    },
    clear: () => {
      quantities.clear()
      save()
    },
  }
}
