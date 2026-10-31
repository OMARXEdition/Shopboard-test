// Pure functions: inputs in, results out. No browser or storage access.
export const formatPrice = (price) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(price)

export const categoryLabel = (category) => category === 'audio'
  ? 'Audio Gear'
  : category.charAt(0).toUpperCase() + category.slice(1)

export const filterProducts = (products, category = 'all') =>
  products.filter((product) => category === 'all' || product.category === category)

export const findProduct = (products, id) =>
  products.find((product) => product.id === id)

export const getPasswordStrength = (value) => {
  if (value.length < 8) return 0
  if (value.length >= 12 && /[^A-Za-z0-9]/.test(value)) return 4
  if (value.length >= 12) return 3
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) return 2
  return 1
}