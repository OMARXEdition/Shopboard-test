export interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice: number | null
  image: string
  alt: string
  badge: string | null
  description: string
  features: string[]
}

export interface ProductSelection {
  search?: string
  category?: string
  sort?: string
}
