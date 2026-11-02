export const formatPrice = (price: number) => new Intl.NumberFormat('ar', {
  style: 'currency',
  currency: 'USD',
}).format(price)

