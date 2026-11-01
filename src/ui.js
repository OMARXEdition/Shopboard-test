// All storefront DOM reads, rendering, browser events, and animations live here.
export const initUI = ({
  products,
  formatPrice,
  categoryLabel,
  selectProducts,
  findProduct,
  getPasswordStrength,
  cart,
}) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  const $ = (selector, scope = document) => scope.querySelector(selector)
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector))
  
  // Render before attaching reveal, filter, and cart listeners.
  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag)
    element.className = className
    if (text !== undefined) element.textContent = text
    return element
  }
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
      imageWrapper.append(makeElement('span',
        product.originalPrice ? 'badge badge-sale' : 'badge badge-new',
        product.badge))
    }
    const info = makeElement('div', 'product-info')
    info.append(
      makeElement('span', 'product-category', categoryLabel(product.category)),
      makeElement('h3', 'product-name', product.name),
      makeElement('p', 'product-description', product.description),
    )
    const meta = makeElement('div', 'product-meta')
    const price = makeElement('div', 'product-price')
    price.append(makeElement('span', 'current-price', formatPrice(product.price)))
    if (product.originalPrice !== null) {
      price.append(makeElement('span', 'original-price', formatPrice(product.originalPrice)))
    }
    const addButton = makeElement('button', 'btn btn-outline', 'Add to Cart')
    addButton.type = 'button'
    addButton.setAttribute('aria-label', `Add ${product.name} to cart`)
    meta.append(price, addButton)
    info.append(meta)
    card.append(imageWrapper, info)
    catalog.append(card)
  })
  /* --------------------------------------------------------------------------
     Header: sticky shadow, mobile menu, active section
     -------------------------------------------------------------------------- */
  
  const header = $('.site-header')
  const navToggle = $('#nav-toggle')
  const siteNav = $('#primary-nav')
  const navLinks = $$('.nav-link')
  const sections = navLinks
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter(Boolean)
  
  let headerIsScrolled = false
  
  const updateHeader = () => {
    if (!header) return
  
    const isScrolled = window.scrollY > 8
    if (isScrolled === headerIsScrolled) return
  
    headerIsScrolled = isScrolled
    header.classList.toggle('is-scrolled', isScrolled)
  }
  
  const updateActiveNav = () => {
    if (!sections.length) return
  
    const marker = window.scrollY + 140
    let current = sections[0]
  
    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section
    })
  
    navLinks.forEach((link) => {
      const isActive = link.hash === `#${current.id}`
      link.classList.toggle('is-active', isActive)
      if (isActive) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }
  
  let scrollTicking = false
  
  const onScroll = () => {
    if (scrollTicking) return
  
    scrollTicking = true
    window.requestAnimationFrame(() => {
      updateHeader()
      updateActiveNav()
      scrollTicking = false
    })
  }
  
  updateHeader()
  updateActiveNav()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateActiveNav)
  
  if (navToggle && siteNav) {
    const closeNav = ({ returnFocus = false } = {}) => {
      siteNav.classList.remove('is-open')
      navToggle.setAttribute('aria-expanded', 'false')
      navToggle.setAttribute('aria-label', 'Open navigation menu')
  
      if (returnFocus) navToggle.focus()
    }
  
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open')
      navToggle.setAttribute('aria-expanded', String(isOpen))
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu')
    })
  
    navLinks.forEach((link) => link.addEventListener('click', () => closeNav()))
  
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeNav({ returnFocus: true })
      }
    })
  
    window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
      if (event.matches) closeNav()
    })
  }
  
  /* --------------------------------------------------------------------------
     Scroll reveal
     -------------------------------------------------------------------------- */
  
  const revealItems = $$('[data-reveal]')
  
  if (revealItems.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    revealItems.forEach((element, index) => {
      element.classList.add('reveal')
      if (element.classList.contains('product-card')) {
        element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`)
      }
    })
  
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
  
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
  
          // Drop the reveal class once the transition ends so it cannot
          // override hover transforms on product cards.
          window.setTimeout(() => entry.target.classList.remove('reveal'), 900)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
  
    revealItems.forEach((element) => revealObserver.observe(element))
  }
  
  /* --------------------------------------------------------------------------
     Product filters
     -------------------------------------------------------------------------- */
  
  const searchInput = $('#product-search')
  const categorySelect = $('#product-category')
  const sortSelect = $('#product-sort')
  const productCards = $$('.product-card')
  const cardsById = new Map(productCards.map((card) => [card.dataset.productId, card]))
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
      const matches = visibleIds.has(card.dataset.productId)
      card.hidden = !matches
  
      if (!matches) return
  
  
      card.classList.add('is-visible')
  
      if (!prefersReducedMotion) {
        card.animate(
          [
            { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        )
      }
    })

    // Move existing cards to preserve their cart listeners while updating order.
    visibleProducts.forEach((product) => catalog.append(cardsById.get(product.id)))
    $('#products-empty').hidden = shown !== 0
  
    if (filterStatus) {
      filterStatus.textContent = `Showing ${shown} product${shown === 1 ? '' : 's'}.`
    }
  }
  
  searchInput.addEventListener('input', applyFilter)
  categorySelect.addEventListener('change', applyFilter)
  sortSelect.addEventListener('change', applyFilter)
  applyFilter()
  
  /* --------------------------------------------------------------------------
     Cart counter + toasts
     -------------------------------------------------------------------------- */
  
  
  const cartButton = $('#cart-button')
  const cartCountElement = $('#cart-count')
  const toastRegion = $('#toast-region')
  const cartItems = $('#cart-items')
  
  const renderCart = () => {
    const cartTotal = cart.getCount()
    if (cartCountElement) cartCountElement.textContent = String(cartTotal)
  
    if (cartButton) {
      const plural = cartTotal === 1 ? 'item' : 'items'
      cartButton.setAttribute('aria-label', `Cart, ${cartTotal} ${plural}`)
    }
    $('#cart-summary').textContent = `${cartTotal} ${cartTotal === 1 ? 'item' : 'items'} · ${formatPrice(cart.getTotal())}`
    $('#cart-clear').disabled = cartTotal === 0
    const list = cartItems
    list.replaceChildren()
    $('#cart-empty').hidden = cartTotal !== 0
    cart.getItems().forEach(({ product, quantity }) => {
      const row = makeElement('li', 'cart-item')
      row.dataset.productId = product.id
      const details = makeElement('div', 'cart-item-details')
      details.append(makeElement('h3', '', product.name),
        makeElement('p', '', `${formatPrice(product.price)} each · ${formatPrice(Math.round(product.price * 100) * quantity / 100)}`))
      const controls = makeElement('div', 'cart-item-controls')
      const action = (text, label, actionName) => {
        const button = makeElement('button', 'cart-action', text)
        button.type = 'button'
        button.setAttribute('aria-label', label)
        button.dataset.cartAction = actionName
        return button
      }
      controls.append(
        action('−', `Decrease quantity of ${product.name}`, 'decrease'),
        makeElement('span', 'cart-quantity', `Quantity: ${quantity}`),
        action('+', `Increase quantity of ${product.name}`, 'increase'),
        action('Remove', `Remove ${product.name}`, 'remove'),
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
  
  const showToast = (message) => {
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
    const button = event.target.closest('button[data-cart-action]')
    if (!button || !cartItems.contains(button)) return
    const productId = button.closest('.cart-item').dataset.productId
    const actionName = button.dataset.cartAction
    const action = cartActions[actionName]
    if (!action) return
    action(productId)
    renderCart()
    const nextRow = Array.from(cartItems.children).find((item) => item.dataset.productId === productId)
    const nextButton = nextRow?.querySelector(`[data-cart-action="${actionName}"]`)
    const focusTarget = nextButton ?? $('#cart-close')
    focusTarget.focus()
  })
  renderCart()
  
  if (cartButton) {
    cartButton.addEventListener('click', () => {
      $('#cart-dialog').showModal()
    })
  }
  
  $('#cart-close').addEventListener('click', () => $('#cart-dialog').close())
  $('#cart-clear').addEventListener('click', () => {
    cart.clear()
    renderCart()
    $('#cart-close').focus()
  })
  const resetTimers = new WeakMap()
  const addProductToCart = (productId) => {
    const product = findProduct(products, productId)
    if (!product) return
    cart.addItem(productId)
    renderCart()
    bumpCart()
    showToast(`Added "${product.name}" to your cart.`)
    const card = productCards.find((item) => item.dataset.productId === productId)
    const button = card?.querySelector('.btn-outline')
    if (!button) return
    button.textContent = 'Added ✓'
    button.classList.add('is-added')
    window.clearTimeout(resetTimers.get(button))
    resetTimers.set(button, window.setTimeout(() => {
      button.textContent = 'Add to Cart'
      button.classList.remove('is-added')
    }, 1400))
  }
  
  // One listener also handles cards moved by search, filtering, and sorting.
  catalog.addEventListener('click', (event) => {
    const button = event.target.closest('.product-card .btn-outline')
    if (!button || !catalog.contains(button)) return
    addProductToCart(button.closest('.product-card').dataset.productId)
  })
  /* --------------------------------------------------------------------------
     Password visibility + strength meter
     -------------------------------------------------------------------------- */
  
  const passwordInput = $('#password')
  const togglePassword = $('#toggle-password')
  const strengthBar = $('#strength-bar')
  const strengthLabel = $('#strength-label')
  const strengthWords = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  let strengthLevel = 0
  
  const resetPasswordVisibility = () => {
    if (!passwordInput || !togglePassword) return
  
    passwordInput.type = 'password'
    togglePassword.textContent = 'Show'
    togglePassword.setAttribute('aria-pressed', 'false')
    togglePassword.setAttribute('aria-label', 'Show password')
  }
  
  const updateStrength = () => {
    if (!passwordInput) return
  
    const value = passwordInput.value
    const score = getPasswordStrength(value)
  
    if (value.length === 0) {
      strengthLevel = 0
      if (strengthBar) {
        strengthBar.dataset.level = '0'
        strengthBar.style.width = '0%'
      }
      if (strengthLabel) strengthLabel.textContent = '8+ characters, with a letter and a number'
      return
    }
  
    if (score === strengthLevel) return
  
    strengthLevel = score
    if (strengthBar) {
      strengthBar.dataset.level = String(score)
      strengthBar.style.width = `${score * 25}%`
    }
    if (strengthLabel) strengthLabel.textContent = `Password strength: ${strengthWords[score]}`
  }
  
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const shouldShow = passwordInput.type === 'password'
  
      passwordInput.type = shouldShow ? 'text' : 'password'
      togglePassword.textContent = shouldShow ? 'Hide' : 'Show'
      togglePassword.setAttribute('aria-pressed', String(shouldShow))
      togglePassword.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password')
      passwordInput.focus()
    })
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('input', updateStrength)
  }
  
  /* --------------------------------------------------------------------------
     Registration form (native validation + inline feedback)
     -------------------------------------------------------------------------- */
  
  const registerForm = $('#register-form')
  const formStatus = $('#form-status')
  
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault()
  
      if (!registerForm.checkValidity()) {
        registerForm.reportValidity()
        return
      }
  
      const fullName = String(new FormData(registerForm).get('fullName') ?? '').trim()
  
      if (formStatus) {
        formStatus.hidden = false
        formStatus.textContent = `🎉 Welcome to ShopBoard, ${fullName}! Your account has been created.`
        formStatus.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
        })
      }
  
      registerForm.reset()
      resetPasswordVisibility()
      updateStrength()
    })
  
    // Hide the previous success message as soon as the user edits the form again
    registerForm.addEventListener('input', () => {
      if (formStatus) formStatus.hidden = true
    })
  }
  
  // Interactive phone showroom shares the same product objects as the catalog.
  const showroomPicker = $('#showroom-picker')
  const showroomProducts = products
  let showroomIndex = 0
  let showroomDetails = false
  const pickerButtons = []
  const renderShowroom = ({ announce = true } = {}) => {
    const product = showroomProducts[showroomIndex]
    $('#phone-product-image').src = product.image
    $('#phone-product-image').alt = product.alt
    $('#phone-category').textContent = categoryLabel(product.category)
    $('#phone-product-name').textContent = product.name
    $('#phone-product-description').textContent = showroomDetails ? product.features.join(' · ') : product.description
    $('#phone-product-price').textContent = formatPrice(product.price)
    $('#phone-position').textContent = `${String(showroomIndex + 1).padStart(2, '0')} / ${String(showroomProducts.length).padStart(2, '0')}`
    $('#phone-add').setAttribute('aria-label', `Add ${product.name} to bag`)
    $('#phone-overview').setAttribute('aria-pressed', String(!showroomDetails))
    $('#phone-details').setAttribute('aria-pressed', String(showroomDetails))
    pickerButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === showroomIndex)))
    if (announce) $('#phone-announcement').textContent = `${product.name}, ${formatPrice(product.price)}. Product ${showroomIndex + 1} of ${showroomProducts.length}.`
  }
  const changeShowroom = (step) => {
    showroomIndex = (showroomIndex + step + showroomProducts.length) % showroomProducts.length
    renderShowroom()
  }
  if (showroomPicker && showroomProducts.length) {
    showroomProducts.forEach((product, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'showroom-product-choice'
      button.setAttribute('aria-label', `View ${product.name}`)
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
      addProductToCart(showroomProducts[showroomIndex].id)
      $('#phone-announcement').textContent = `${showroomProducts[showroomIndex].name} added to your bag.`
    })
    for (const [selector, details] of [['#phone-overview', false], ['#phone-details', true]]) {
      $(selector).addEventListener('click', () => {
        showroomDetails = details
        renderShowroom({ announce: false })
        $('#phone-announcement').textContent = $('#phone-product-description').textContent
      })
    }
    const swipeArea = $('#phone-swipe')
    let dragStart = null
    swipeArea.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return
      dragStart = { x: event.clientX, y: event.clientY, id: event.pointerId }
      swipeArea.setPointerCapture(event.pointerId)
    })
    swipeArea.addEventListener('pointerup', (event) => {
      if (!dragStart || dragStart.id !== event.pointerId) return
      const dx = event.clientX - dragStart.x
      const dy = event.clientY - dragStart.y
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) changeShowroom(dx < 0 ? 1 : -1)
      dragStart = null
    })
    swipeArea.addEventListener('pointercancel', () => { dragStart = null })
    swipeArea.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        changeShowroom(event.key === 'ArrowRight' ? 1 : -1)
      }
    })
    renderShowroom({ announce: false })
  }
}
