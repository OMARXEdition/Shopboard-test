import './style.css'

// Handle registration form submission with friendly user feedback
const registerForm = document.querySelector('#register-form')

if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault()

    // Native validation check (just in case)
    if (!registerForm.checkValidity()) {
      registerForm.reportValidity()
      return
    }

    const formData = new FormData(registerForm)
    const fullName = formData.get('fullName')
    const accountType = formData.get('accountType')

    alert(`🎉 Success! Welcome to ShopBoard, ${fullName}! Your ${accountType} account has been registered.`)
    registerForm.reset()
  })
}

// Handle Add to Cart button clicks
const addToCartButtons = document.querySelectorAll('.product-card button')
addToCartButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const card = event.target.closest('.product-card')
    const productName = card?.querySelector('.product-name')?.textContent ?? 'Product'
    alert(`🛒 Added "${productName}" to your cart!`)
  })
})
