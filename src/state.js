// Cart count and persistence. Storage can be injected for testing.
const CART_KEY = 'shopboard:cart'

export const createCartState = (storage) => {
  let count = 0
  try {
    // Lazy access keeps importing this module safe outside the browser.
    storage ??= globalThis.localStorage
    const saved = Number(storage?.getItem(CART_KEY) ?? 0)
    count = Number.isSafeInteger(saved) && saved > 0 ? saved : 0
  } catch {
    // Keep an in-memory cart when browser storage is unavailable.
  }

  const save = () => {
    try {
      storage?.setItem(CART_KEY, String(count))
    } catch {
      // Cart interactions continue even when persistence is blocked.
    }
  }

  return {
    getCount: () => count,
    addItem: () => {
      count += 1
      save()
      return count
    },
  }
}