import './style.css'
import { products } from './modules/catalog/catalog.data.ts'
import { initCatalogUI } from './modules/catalog/catalog.ui.ts'
import { createCartState } from './modules/cart/cart.state.ts'
import { initCartUI } from './modules/cart/cart.ui.ts'
import { initAuthUI } from './modules/auth/auth.ui.ts'
import { initShowroomUI } from './modules/showroom/showroom.ui.ts'
import { initShellUI } from './modules/shell/shell.ui.ts'
import { createOrdersState } from './modules/orders/orders.state.ts'
import { initOrdersUI } from './modules/orders/orders.ui.ts'
import { initPlantCornerUI } from './modules/plant-corner/plant-corner.ui.ts'

const cart = createCartState(undefined, products)
const cartUI = initCartUI(cart, products, () => ordersUI.openReview())
const ordersUI = initOrdersUI(createOrdersState(), {
  getCartItems: cart.getItems,
  onPlaced: () => {
    cart.clear()
    cartUI.renderCart()
  },
  onCancel: cartUI.openCart,
})
const catalogUI = initCatalogUI(products, addProductToCart)

// Both product entry points share cart feedback and catalog button feedback.
function addProductToCart(id: string) {
  const added = cartUI.addProductToCart(id)
  if (added) catalogUI.showAdded(id)
  return added
}

initAuthUI()
const showroom = initShowroomUI(products, addProductToCart)
const plantCorner = initPlantCornerUI(products, {
  onViewProduct: showroom.viewProduct,
  onAddToCart: addProductToCart,
})
initShellUI()

if (import.meta.hot) import.meta.hot.dispose(() => plantCorner.destroy())
