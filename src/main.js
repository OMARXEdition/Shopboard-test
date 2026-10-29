import './style.css'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const $ = (selector, scope = document) => scope.querySelector(selector)
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector))

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

const filterButtons = $$('.filter-chip')
const productCards = $$('.product-card')
const filterStatus = $('#filter-status')

const applyFilter = (filter, activeButton) => {
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button === activeButton))
  })

  let shown = 0

  productCards.forEach((card) => {
    const matches = filter === 'all' || card.dataset.category === filter
    card.hidden = !matches

    if (!matches) return

    shown += 1
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

  if (filterStatus) {
    filterStatus.textContent = `Showing ${shown} product${shown === 1 ? '' : 's'}.`
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => applyFilter(button.dataset.filter ?? 'all', button))
})

/* --------------------------------------------------------------------------
   Cart counter + toasts
   -------------------------------------------------------------------------- */

const CART_KEY = 'shopboard:cart'
const cartButton = $('#cart-button')
const cartCountElement = $('#cart-count')
const toastRegion = $('#toast-region')

let cartTotal = 0

try {
  const stored = Number.parseInt(window.localStorage.getItem(CART_KEY) ?? '0', 10)
  cartTotal = Number.isFinite(stored) && stored > 0 ? stored : 0
} catch {
  cartTotal = 0
}

const renderCart = () => {
  if (cartCountElement) cartCountElement.textContent = String(cartTotal)

  if (cartButton) {
    const plural = cartTotal === 1 ? 'item' : 'items'
    cartButton.setAttribute('aria-label', `Cart, ${cartTotal} ${plural}`)
  }
}

const saveCart = () => {
  try {
    window.localStorage.setItem(CART_KEY, String(cartTotal))
  } catch {
    // Storage can be unavailable in private mode; the counter still works in memory.
  }
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

renderCart()

if (cartButton) {
  cartButton.addEventListener('click', () => {
    if (cartTotal === 0) {
      showToast('Your cart is empty — add something you love.')
      return
    }

    showToast(`You have ${cartTotal} ${cartTotal === 1 ? 'item' : 'items'} in your cart.`)
  })
}

$$('.product-card .btn-outline').forEach((button) => {
  const originalLabel = button.textContent
  let resetTimer

  button.addEventListener('click', () => {
    const card = button.closest('.product-card')
    const productName = card?.querySelector('.product-name')?.textContent ?? 'this product'

    cartTotal += 1
    renderCart()
    saveCart()
    bumpCart()
    showToast(`Added "${productName}" to your cart.`)

    button.textContent = 'Added ✓'
    button.classList.add('is-added')

    window.clearTimeout(resetTimer)
    resetTimer = window.setTimeout(() => {
      button.textContent = originalLabel
      button.classList.remove('is-added')
    }, 1400)
  })
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
  let score = 0

  if (value.length >= 8) score = 1
  if (value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value)) score = 2
  if (value.length >= 12) score = 3
  if (value.length >= 12 && /[^A-Za-z0-9]/.test(value)) score = 4

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
