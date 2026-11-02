import { isOrder } from './orders.logic.ts'
import type { Order, OrdersState, OrdersStorage } from './orders.types.ts'

const ORDERS_KEY = 'nabta:orders'

export const createOrdersState = (storage?: OrdersStorage): OrdersState => {
  const getStorage = (): OrdersStorage => {
    const available = storage ?? globalThis.localStorage
    if (!available) throw new Error('Order storage is unavailable')
    return available
  }

  const readOrders = (store: OrdersStorage): Order[] => {
    const saved: unknown = JSON.parse(store.getItem(ORDERS_KEY) ?? '[]')
    if (!Array.isArray(saved)) throw new Error('Invalid order history')
    const seen = new Set<string>()
    return saved.filter(isOrder).filter(order => {
      if (seen.has(order.id)) return false
      seen.add(order.id)
      return true
    }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }

  return {
    getOrders: () => readOrders(getStorage()),
    saveOrder: (order) => {
      if (!isOrder(order)) throw new Error('Invalid order')
      const store = getStorage()
      // Read current history before each write; never replace it after a read failure.
      const orders = readOrders(store)
      const existing = orders.find(saved => saved.id === order.id)
      if (existing) return existing
      store.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]))
      return order
    },
  }
}
