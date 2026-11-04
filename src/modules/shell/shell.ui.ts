import { $, $$ } from '../../shared/dom.ts'

// Page-wide navigation and reveal effects run after catalog cards are rendered.
export const initShellUI = () => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const header = $('.site-header')
  const navToggle = $('#nav-toggle')
  const siteNav = $('#primary-nav')
  const navLinks = $$<HTMLAnchorElement>('.nav-link')
  const sections = navLinks
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter((section): section is HTMLElement => section !== null)

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
      navToggle.setAttribute('aria-label', 'فتح القائمة')

      if (returnFocus) navToggle.focus()
    }

    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open')
      navToggle.setAttribute('aria-expanded', String(isOpen))
      navToggle.setAttribute(
        'aria-label',
        isOpen ? 'إغلاق القائمة' : 'فتح القائمة',
      )
    })

    navLinks.forEach((link) => link.addEventListener('click', () => closeNav()))

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeNav({ returnFocus: true })
      }
    })

    window
      .matchMedia('(min-width: 768px)')
      .addEventListener('change', (event) => {
        if (event.matches) closeNav()
      })
  }

  /* --------------------------------------------------------------------------
     Scroll reveal
     -------------------------------------------------------------------------- */

  const revealItems = $$('[data-reveal]')

  if (
    revealItems.length &&
    'IntersectionObserver' in window &&
    !prefersReducedMotion
  ) {
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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    revealItems.forEach((element) => revealObserver.observe(element))
  }
}
