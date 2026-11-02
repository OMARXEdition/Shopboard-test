import { $, makeElement } from '../../shared/dom.ts'
import { formatPrice } from '../../shared/format-price.ts'
import { findProduct } from '../catalog/catalog.logic.ts'
import type { Product } from '../catalog/catalog.types.ts'
import type { CartState } from './cart.types.ts'

export const initCartUI = (cart: CartState, products: readonly Product[]) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cartButton = $('#cart-button')
  const cartCountElement = $('#cart-count')
  const toastRegion = $('#toast-region')
  const cartItems = $('#cart-items')
  
  const renderCart = () => {
    const cartTotal = cart.getCount()
    if (cartCountElement) cartCountElement.textContent = cartTotal.toLocaleString('ar')
  
    if (cartButton) {
      const plural = 'منتجات'
      cartButton.setAttribute('aria-label', `السلة، ${cartTotal.toLocaleString('ar')} ${plural}`)
    }
    $('#cart-summary').textContent = `الإجمالي: ${cartTotal.toLocaleString('ar')} منتجات · ${formatPrice(cart.getTotal())}`
    $<HTMLButtonElement>('#cart-clear').disabled = cartTotal === 0
    const list = cartItems
    list.replaceChildren()
    $('#cart-empty').hidden = cartTotal !== 0
    cart.getItems().forEach(({ product, quantity }) => {
      const row = makeElement('li', 'cart-item')
      row.dataset.productId = product.id
      const details = makeElement('div', 'cart-item-details')
      details.append(makeElement('h3', '', product.name),
        makeElement('p', '', `${formatPrice(product.price)} للقطعة · ${formatPrice(Math.round(product.price * 100) * quantity / 100)}`))
      const controls = makeElement('div', 'cart-item-controls')
      const action = (text: string, label: string, actionName: string) => {
        const button = makeElement('button', 'cart-action', text)
        button.type = 'button'
        button.setAttribute('aria-label', label)
        button.dataset.cartAction = actionName
        return button
      }
      controls.append(
        action('−', `تقليل كمية ${product.name}`, 'decrease'),
        makeElement('span', 'cart-quantity', `الكمية: ${quantity.toLocaleString('ar')}`),
        action('+', `زيادة كمية ${product.name}`, 'increase'),
        action('إزالة', `إزالة ${product.name}`, 'remove'),
      )
      row.append(details, controls)
      list.append(row)
    })
  }
  
  const bumpCart = () => {
    if (!cartButton || prefersReducedMotion) return
  
    cartButton.classList.remove('is-bumping')
    void cartButton.offsetWidth
    cartButton.classList.add('is-bumping')
  }
  
  const showToast = (message: string) => {
    if (!toastRegion) return
  
    const toast = document.createElement('div')
    toast.className = 'toast'
    toast.textContent = message
    toastRegion.append(toast)
  
    while (toastRegion.children.length > 3) {
      toastRegion.firstElementChild?.remove()
    }
  
    window.setTimeout(() => {
      toast.classList.add('is-leaving')
      window.setTimeout(() => toast.remove(), 250)
    }, 3200)
  }
  
  // Bind once to the stable list; rendering only replaces its children.
  const cartActions = { decrease: cart.decreaseItem, increase: cart.addItem, remove: cart.removeItem }
  cartItems.addEventListener('click', (event) => {
    const button = (event.target instanceof Element ? event.target : null)?.closest<HTMLElement>('button[data-cart-action]')
    if (!button || !cartItems.contains(button)) return
    const productId = button.closest<HTMLElement>('.cart-item')?.dataset.productId
    const actionName = button.dataset.cartAction
    if (!productId || !actionName || !(actionName in cartActions)) return
    const action = cartActions[actionName as keyof typeof cartActions]
    if (!action) return
    action(productId)
    renderCart()
    const nextRow = Array.from(cartItems.querySelectorAll<HTMLElement>('.cart-item')).find((item) => item.dataset.productId === productId)
    const nextButton = nextRow?.querySelector<HTMLElement>(`[data-cart-action="${actionName}"]`)
    const focusTarget = nextButton ?? $('#cart-close')
    focusTarget.focus()
  })
  renderCart()
  
  if (cartButton) {
    cartButton.addEventListener('click', () => {
      $<HTMLDialogElement>('#cart-dialog').showModal()
    })
  }
  
  $('#cart-close').addEventListener('click', () => $<HTMLDialogElement>('#cart-dialog').close())
  $<HTMLButtonElement>('#cart-clear').addEventListener('click', () => {
    cart.clear()
    renderCart()
    $('#cart-close').focus()
  })
  const addProductToCart = (productId: string) => {
    const product = findProduct(products, productId)
    if (!product) return false
    cart.addItem(productId)
    renderCart()
    bumpCart()
    showToast(`أُضيفت «${product.name}» إلى سلّتك.`)
    return true
  }

  return { addProductToCart }
}
