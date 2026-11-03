import type { Order, OrderInputItem, OrderItem } from './orders.types.ts'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isOrderItem = (value: unknown): value is OrderItem =>
  isRecord(value) &&
  typeof value.productId === 'string' &&
  value.productId.trim().length > 0 &&
  typeof value.name === 'string' &&
  value.name.trim().length > 0 &&
  typeof value.unitPriceCents === 'number' &&
  Number.isSafeInteger(value.unitPriceCents) &&
  value.unitPriceCents >= 0 &&
  typeof value.quantity === 'number' &&
  Number.isSafeInteger(value.quantity) &&
  value.quantity > 0

export const calculateOrderTotal = (items: readonly OrderItem[]): number => {
  if (!items.length || !items.every(isOrderItem))
    throw new Error('Invalid order items')
  const total = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  )
  if (!Number.isSafeInteger(total))
    throw new Error('Order total exceeds the supported range')
  return total
}

export const isOrder = (value: unknown): value is Order => {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    typeof value.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    value.currency !== 'USD' ||
    !Array.isArray(value.items) ||
    !value.items.every(isOrderItem)
  )
    return false
  try {
    return value.totalCents === calculateOrderTotal(value.items)
  } catch {
    return false
  }
}

// Copy names and prices so history is independent of future cart/catalog edits.
export const createOrderSnapshot = (
  cartItems: readonly OrderInputItem[],
  id: string,
  createdAt: string,
): Order => {
  const items = cartItems.map(({ product, quantity }) => ({
    productId: product.id,
    name: product.name,
    unitPriceCents: Math.round(product.price * 100),
    quantity,
  }))
  if (
    cartItems.some(
      ({ product }) => !Number.isFinite(product.price) || product.price < 0,
    )
  )
    throw new Error('Invalid product price')
  const order: Order = {
    id,
    createdAt,
    currency: 'USD',
    items,
    totalCents: calculateOrderTotal(items),
  }
  if (!isOrder(order)) throw new Error('Invalid order')
  return order
}
