const KEY = "sooqly_cart_v1"

export function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

export function saveCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function clearCart() {
  localStorage.removeItem(KEY)
}
