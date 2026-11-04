export type ToastType = 'success' | 'error' | 'info'

export function showToast(message: string, type: ToastType = 'info'): void {
  const region = document.querySelector('#toast-region')
  if (!region) return

  const toast = document.createElement('div')
  toast.className = `toast toast--${type}`
  toast.textContent = message
  region.append(toast)

  while (region.children.length > 3) {
    region.firstElementChild?.remove()
  }

  window.setTimeout(() => {
    toast.classList.add('is-leaving')
    window.setTimeout(() => toast.remove(), 250)
  }, 3200)
}
