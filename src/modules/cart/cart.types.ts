import type { Product } from '../catalog/catalog.types.ts'

export interface CartStorage {
  getItem(key: string): string | null | undefined
  setItem?(key: string, value: string): void
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  getItems(): CartItem[]
  getCount(): number
  getTotal(): number
  addItem(id: string): void
  decreaseItem(id: string): void
  removeItem(id: string): void
  clear(): void
}
