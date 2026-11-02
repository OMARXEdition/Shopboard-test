import { $ } from '../../shared/dom.ts'
import { formatPrice } from '../../shared/format-price.ts'
import { categoryLabel } from '../catalog/catalog.logic.ts'
import type { Product } from '../catalog/catalog.types.ts'

export const initShowroomUI = (products: readonly Product[], addProductToCart: (id: string) => boolean) => {
  // Interactive phone showroom shares the same product objects as the catalog.
  const showroomPicker = $('#showroom-picker')
  const showroomProducts = products
  let showroomIndex = 0
  let showroomDetails = false
  const pickerButtons: HTMLButtonElement[] = []
  const renderShowroom = ({ announce = true } = {}) => {
    const product = showroomProducts[showroomIndex]
    $<HTMLImageElement>('#phone-product-image').src = product.image
    $<HTMLImageElement>('#phone-product-image').alt = product.alt
    $('#phone-category').textContent = categoryLabel(product.category)
    $('#phone-product-name').textContent = product.name
    $('#phone-product-description').textContent = showroomDetails ? product.features.join(' · ') : product.description
    $('#phone-product-price').textContent = formatPrice(product.price)
    $('#phone-position').textContent = `${String(showroomIndex + 1).padStart(2, '0')} / ${String(showroomProducts.length).padStart(2, '0')}`
    $('#phone-add').setAttribute('aria-label', `أضف ${product.name} إلى السلة`)
    $('#phone-overview').setAttribute('aria-pressed', String(!showroomDetails))
    $('#phone-details').setAttribute('aria-pressed', String(showroomDetails))
    pickerButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === showroomIndex)))
    if (announce) $('#phone-announcement').textContent = `${product.name}، ${formatPrice(product.price)}. النبتة ${showroomIndex + 1} من ${showroomProducts.length}.`
  }
  const changeShowroom = (step: number) => {
    showroomIndex = (showroomIndex + step + showroomProducts.length) % showroomProducts.length
    renderShowroom()
  }
  if (showroomPicker && showroomProducts.length) {
    showroomProducts.forEach((product, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'showroom-product-choice'
      button.setAttribute('aria-label', `اعرض ${product.name}`)
      const image = document.createElement('img')
      image.src = product.image
      image.alt = ''
      image.loading = 'lazy'
      const label = document.createElement('span')
      label.textContent = categoryLabel(product.category)
      button.append(image, label)
      button.addEventListener('click', () => {
        showroomIndex = index
        renderShowroom()
      })
      pickerButtons.push(button)
      showroomPicker.append(button)
    })
    $('#phone-prev').addEventListener('click', () => changeShowroom(-1))
    $('#phone-next').addEventListener('click', () => changeShowroom(1))
    $('#phone-add').addEventListener('click', () => {
      if (addProductToCart(showroomProducts[showroomIndex].id)) {
        $('#phone-announcement').textContent = `أُضيفت ${showroomProducts[showroomIndex].name} إلى سلّتك.`
      }
    })
    for (const [selector, details] of [['#phone-overview', false], ['#phone-details', true]] as const) {
      $(selector).addEventListener('click', () => {
        showroomDetails = details
        renderShowroom({ announce: false })
        $('#phone-announcement').textContent = $('#phone-product-description').textContent
      })
    }
    const swipeArea = $('#phone-swipe')
    let dragStart: { x: number; y: number; id: number } | null = null
    swipeArea.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return
      dragStart = { x: event.clientX, y: event.clientY, id: event.pointerId }
      swipeArea.setPointerCapture(event.pointerId)
    })
    swipeArea.addEventListener('pointerup', (event) => {
      if (!dragStart || dragStart.id !== event.pointerId) return
      const dx = event.clientX - dragStart.x
      const dy = event.clientY - dragStart.y
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) changeShowroom(dx > 0 ? 1 : -1)
      dragStart = null
    })
    swipeArea.addEventListener('pointercancel', () => { dragStart = null })
    swipeArea.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        changeShowroom(event.key === 'ArrowLeft' ? 1 : -1)
      }
    })
    renderShowroom({ announce: false })
  }
  return {
    viewProduct: (id: string) => {
      const index = showroomProducts.findIndex(product => product.id === id)
      if (index < 0) return false
      showroomIndex = index
      showroomDetails = false
      renderShowroom()
      $('#play').scrollIntoView({ block: 'start', behavior: 'auto' })
      $('#phone-swipe').focus({ preventScroll: true })
      return true
    },
  }
}
