import './style.css'
import { products } from './products.ts'
import {
  formatPrice,
  categoryLabel,
  selectProducts,
  findProduct,
  getPasswordStrength,
} from './logic.ts'
import { createCartState } from './state.ts'
import { initUI } from './ui.ts'

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
