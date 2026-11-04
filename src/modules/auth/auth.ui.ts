import { $ } from '../../shared/dom.ts'
import { getPasswordStrength } from './auth.logic.ts'

export const initAuthUI = () => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const passwordInput = $<HTMLInputElement>('#password')
  const togglePassword = $('#toggle-password')
  const strengthBar = $('#strength-bar')
  const strengthLabel = $('#strength-label')
  const strengthWords = ['قصيرة جدًا', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية']
  let strengthLevel = 0

  const resetPasswordVisibility = () => {
    if (!passwordInput || !togglePassword) return

    passwordInput.type = 'password'
    togglePassword.textContent = 'إظهار'
    togglePassword.setAttribute('aria-pressed', 'false')
    togglePassword.setAttribute('aria-label', 'إظهار كلمة المرور')
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
      if (strengthLabel)
        strengthLabel.textContent =
          '٨ أحرف على الأقل، تتضمن حرفًا إنجليزيًا ورقمًا'
      return
    }

    if (score === strengthLevel) return

    strengthLevel = score
    if (strengthBar) {
      strengthBar.dataset.level = String(score)
      strengthBar.style.width = `${score * 25}%`
    }
    if (strengthLabel)
      strengthLabel.textContent = `قوة كلمة المرور: ${strengthWords[score]}`
  }

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const shouldShow = passwordInput.type === 'password'

      passwordInput.type = shouldShow ? 'text' : 'password'
      togglePassword.textContent = shouldShow ? 'إخفاء' : 'إظهار'
      togglePassword.setAttribute('aria-pressed', String(shouldShow))
      togglePassword.setAttribute(
        'aria-label',
        shouldShow ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور',
      )
      passwordInput.focus()
    })
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', updateStrength)
  }

  /* --------------------------------------------------------------------------
     Registration form (native validation + inline feedback)
     -------------------------------------------------------------------------- */

  const registerForm = $<HTMLFormElement>('#register-form')
  const formStatus = $('#form-status')

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault()

      if (!registerForm.checkValidity()) {
        registerForm.reportValidity()
        return
      }

      const fullName = String(
        new FormData(registerForm).get('fullName') ?? '',
      ).trim()

      if (formStatus) {
        formStatus.hidden = false
        formStatus.textContent = `أهلًا ${fullName} في مجتمع نبتة! تم استلام تسجيلك التجريبي.`
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
}
