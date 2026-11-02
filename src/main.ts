import './style.css'
import { products } from './modules/catalog/catalog.data.ts'
import { initCatalogUI } from './modules/catalog/catalog.ui.ts'
import { createCartState } from './modules/cart/cart.state.ts'
import { initCartUI } from './modules/cart/cart.ui.ts'
import { initAuthUI } from './modules/auth/auth.ui.ts'
import { initShowroomUI } from './modules/showroom/showroom.ui.ts'
import { initShellUI } from './modules/shell/shell.ui.ts'

const cart = createCartState(undefined, products)
const cartUI = initCartUI(cart, products)
const catalogUI = initCatalogUI(products, addProductToCart)

// Both product entry points share cart feedback and catalog button feedback.
function addProductToCart(id: string) {
  if (cartUI.addProductToCart(id)) catalogUI.showAdded(id)
}

initAuthUI()
initShowroomUI(products, addProductToCart)
initShellUI()
