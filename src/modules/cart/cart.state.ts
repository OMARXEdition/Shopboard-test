import type { Product } from '../catalog/catalog.types.ts'
import type { CartState, CartStorage } from './cart.types.ts'

// Persist IDs and quantities, deriving prices from the current catalog.
const CART_KEY = 'shopboard:cart'

export const createCartState = (storage?: CartStorage, catalog: readonly Product[] = []): CartState => {
  const knownProducts = new Map(catalog.map((product) => [product.id, product]))
  const quantities = new Map<string, number>()
  try {
    // Lazy access keeps importing this module safe outside the browser.
    storage ??= globalThis.localStorage
    const saved: unknown = JSON.parse(storage?.getItem(CART_KEY) ?? '[]')
    // Legacy counts cannot identify products; start those carts empty.
    if (Array.isArray(saved)) saved.forEach((item) => {
      if (item && typeof item === 'object' && 'id' in item && typeof item.id === 'string'
        && 'quantity' in item && typeof item.quantity === 'number'
        && knownProducts.has(item.id) && Number.isSafeInteger(item.quantity) && item.quantity > 0) {
        quantities.set(item.id, item.quantity)
      }
    })
  } catch {
    // Keep an in-memory cart when browser storage is unavailable.
  }

  const save = () => {
    try {
      storage?.setItem?.(CART_KEY, JSON.stringify(Array.from(quantities, ([id, quantity]) => ({ id, quantity }))))
    } catch {
      // Cart interactions continue even when persistence is blocked.
    }
  }

  const getItems = () => Array.from(quantities).flatMap(([id, quantity]) => {
    const product = knownProducts.get(id)
    return product ? [{ product, quantity }] : []
  })
  return {
    getItems,
    getCount: () => Array.from(quantities.values()).reduce((sum, quantity) => sum + quantity, 0),
    getTotal: () => getItems().reduce((cents, { product, quantity }) => cents + Math.round(product.price * 100) * quantity, 0) / 100,
    addItem: (id: string) => {
      if (!knownProducts.has(id)) return
      quantities.set(id, (quantities.get(id) ?? 0) + 1)
      save()
    },
    decreaseItem: (id: string) => {
      const quantity = quantities.get(id)
      if (!quantity) return
      if (quantity === 1) quantities.delete(id)
      else quantities.set(id, quantity - 1)
      save()
    },
    removeItem: (id: string) => {
      quantities.delete(id)
      save()
    },
    clear: () => {
      quantities.clear()
      save()
    },
  }
}
