import type { Product, ProductSelection } from './catalog.types.ts'

const categoryLabels: Record<string, string> = {
  indoor: 'نباتات داخلية',
  outdoor: 'نباتات خارجية',
  flowering: 'نباتات مزهرة',
  succulents: 'صبارات وعصاريات',
  accessories: 'أصص ومستلزمات',
}

export const categoryLabel = (category: string) =>
  categoryLabels[category] ?? category

export const filterProducts = <T extends Product>(
  products: readonly T[],
  category = 'all',
) =>
  products.filter(
    (product) => category === 'all' || product.category === category,
  )

export const selectProducts = <T extends Product>(
  products: readonly T[],
  { search = '', category = 'all', sort = 'default' }: ProductSelection = {},
) => {
  const query = search.trim().toLowerCase()
  // filter() creates a new array, so sorting never changes the source catalog.
  const matches = filterProducts(products, category).filter((product) =>
    product.name.toLowerCase().includes(query),
  )
  if (sort === 'price-asc') matches.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') matches.sort((a, b) => b.price - a.price)
  return matches
}

export const findProduct = (products: readonly Product[], id: string) =>
  products.find((product) => product.id === id)
