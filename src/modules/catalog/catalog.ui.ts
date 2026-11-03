import { $, $$, makeElement } from '../../shared/dom.ts'
import { formatPrice } from '../../shared/format-price.ts'
import { categoryLabel, selectProducts } from './catalog.logic.ts'
import type { Product } from './catalog.types.ts'

export const initCatalogUI = (
  products: readonly Product[],
  onAddToCart: (id: string) => void,
) => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const catalog = $('.products-grid')
  products.forEach((product) => {
    const card = makeElement('article', 'product-card')
    card.dataset.productId = product.id
    card.dataset.category = product.category
    card.setAttribute('data-reveal', '')
    card.setAttribute('aria-label', product.name)
    const imageWrapper = makeElement('div', 'product-image-wrapper')
    const image = makeElement('img', 'product-image')
    image.src = product.image
    image.alt = product.alt
    image.loading = 'lazy'
    imageWrapper.append(image)
    if (product.badge) {
      imageWrapper.append(
        makeElement(
          'span',
          product.originalPrice ? 'badge badge-sale' : 'badge badge-new',
          product.badge,
        ),
      )
    }
    const info = makeElement('div', 'product-info')
    info.append(
      makeElement('span', 'product-category', categoryLabel(product.category)),
      makeElement('h3', 'product-name', product.name),
      makeElement('p', 'product-description', product.description),
    )
    const meta = makeElement('div', 'product-meta')
    const price = makeElement('div', 'product-price')
    price.append(
      makeElement('span', 'current-price', formatPrice(product.price)),
    )
    if (product.originalPrice !== null) {
      price.append(
        makeElement(
          'span',
          'original-price',
          formatPrice(product.originalPrice),
        ),
      )
    }
    const addButton = makeElement('button', 'btn btn-outline', 'أضف للسلة')
    addButton.type = 'button'
    addButton.setAttribute('aria-label', `أضف ${product.name} إلى السلة`)
    meta.append(price, addButton)
    info.append(meta)
    card.append(imageWrapper, info)
    catalog.append(card)
  })
  const searchInput = $<HTMLInputElement>('#product-search')
  const categorySelect = $<HTMLSelectElement>('#product-category')
  const sortSelect = $<HTMLSelectElement>('#product-sort')
  const productCards = $$('.product-card')
  const cardsById = new Map(
    productCards.map((card) => [card.dataset.productId, card]),
  )
  const filterStatus = $('#filter-status')

  new Set(products.map((product) => product.category)).forEach((category) => {
    const option = document.createElement('option')
    option.value = category
    option.textContent = categoryLabel(category)
    categorySelect.append(option)
  })

  const applyFilter = () => {
    const visibleProducts = selectProducts(products, {
      search: searchInput.value,
      category: categorySelect.value,
      sort: sortSelect.value,
    })
    const visibleIds = new Set(visibleProducts.map((product) => product.id))
    const shown = visibleIds.size

    productCards.forEach((card) => {
      const matches = visibleIds.has(card.dataset.productId ?? '')
      card.hidden = !matches

      if (!matches) return

      card.classList.add('is-visible')

      if (!prefersReducedMotion) {
        card.animate(
          [
            { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        )
      }
    })

    // Move existing cards to preserve their cart listeners while updating order.
    visibleProducts.forEach((product) =>
      catalog.append(cardsById.get(product.id)!),
    )
    $('#products-empty').hidden = shown !== 0

    if (filterStatus) {
      filterStatus.textContent = `عدد النتائج: ${shown.toLocaleString('ar')} من النباتات والمستلزمات`
    }
  }

  searchInput.addEventListener('input', applyFilter)
  categorySelect.addEventListener('change', applyFilter)
  sortSelect.addEventListener('change', applyFilter)
  applyFilter()

  const resetTimers = new WeakMap<Element, number>()
  const showAdded = (productId: string) => {
    const card = productCards.find(
      (item) => item.dataset.productId === productId,
    )
    const button = card?.querySelector('.btn-outline')
    if (!button) return
    button.textContent = 'أُضيفت ✓'
    button.classList.add('is-added')
    window.clearTimeout(resetTimers.get(button))
    resetTimers.set(
      button,
      window.setTimeout(() => {
        button.textContent = 'أضف للسلة'
        button.classList.remove('is-added')
      }, 1400),
    )
  }

  // One listener also handles cards moved by search, filtering, and sorting.
  catalog.addEventListener('click', (event) => {
    const button = (
      event.target instanceof Element ? event.target : null
    )?.closest<HTMLElement>('.product-card .btn-outline')
    if (!button || !catalog.contains(button)) return
    const productId =
      button.closest<HTMLElement>('.product-card')?.dataset.productId
    if (productId) onAddToCart(productId)
  })
  return { showAdded }
}
