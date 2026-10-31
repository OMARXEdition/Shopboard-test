import './style.css'
import { products } from './data.js'
import {
  formatPrice,
  categoryLabel,
  filterProducts,
  findProduct,
  getPasswordStrength,
} from './logic.js'
import { createCartState } from './state.js'
import { initUI } from './ui.js'

// Connect the catalog, pure operations, state, and user interface.
const cart = createCartState()

initUI({
  products,
  formatPrice,
  categoryLabel,
  filterProducts,
  findProduct,
  getPasswordStrength,
  getCartCount: cart.getCount,
  onAddToCart: (productId) => {
    if (findProduct(products, productId)) cart.addItem()
  },
})