const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim()

export const API_URL = configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5000" : "")

export function getAuthToken() {
  return localStorage.getItem("tsa_token")
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("tsa_token", token)
  } else {
    localStorage.removeItem("tsa_token")
  }
}

export async function apiFetch(path, options = {}) {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData
  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = "Request failed"
    try {
      const data = await response.json()
      message = data?.message || message
    } catch {
      message = await response.text()
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
