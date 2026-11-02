import type { Product, ProductSelection } from './types.ts'

// Pure functions: inputs in, results out. No browser or storage access.
export const formatPrice = (price: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(price)

export const categoryLabel = (category: string) => category === 'audio'
  ? 'Audio Gear'
  : category.charAt(0).toUpperCase() + category.slice(1)

export const filterProducts = <T extends Product>(products: readonly T[], category = 'all') =>
  products.filter((product) => category === 'all' || product.category === category)

export const selectProducts = <T extends Product>(products: readonly T[], { search = '', category = 'all', sort = 'default' }: ProductSelection = {}) => {
  const query = search.trim().toLowerCase()
  // filter() creates a new array, so sorting never changes the source catalog.
  const matches = filterProducts(products, category)
    .filter((product) => product.name.toLowerCase().includes(query))
  if (sort === 'price-asc') matches.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') matches.sort((a, b) => b.price - a.price)
  return matches
}

export const findProduct = (products: readonly Product[], id: string) =>
  products.find((product) => product.id === id)

export const getPasswordStrength = (value: string) => {
  if (value.length < 8) return 0
  if (value.length >= 12 && /[^A-Za-z0-9]/.test(value)) return 4
  if (value.length >= 12) return 3
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) return 2
  return 1
}
