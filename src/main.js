import './style.css'
import { products } from './products.js'
import {
  formatPrice,
  categoryLabel,
  selectProducts,
  findProduct,
  getPasswordStrength,
} from './logic.js'
import { createCartState } from './state.js'
import { initUI } from './ui.js'

// Connect the catalog, pure operations, state, and user interface.
const cart = createCartState(undefined, products)

initUI({
  products,
  formatPrice,
  categoryLabel,
  selectProducts,
  findProduct,
  getPasswordStrength,
  cart,
})
