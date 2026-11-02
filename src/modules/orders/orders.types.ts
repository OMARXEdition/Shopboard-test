import type { Product } from '../catalog/catalog.types.ts'

export interface OrderInputItem {
  product: Pick<Product, 'id' | 'name' | 'price'>
  quantity: number
}

export interface OrderItem {
  productId: string
  name: string
  unitPriceCents: number
  quantity: number
}

export interface Order {
  id: string
  createdAt: string
  currency: 'USD'
  items: OrderItem[]
  totalCents: number
}

export interface OrdersStorage {
  getItem(key: string): string | null | undefined
  setItem(key: string, value: string): void
}

export interface OrdersState {
  getOrders(): Order[]
  saveOrder(order: Order): Order
}
