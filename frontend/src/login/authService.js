// Use the same BASE_URL pattern as the rest of the API
const BASE_URL = import.meta.env.VITE_API_URL || 'https://epistemic-postnasal-reid.ngrok-free.dev/api';
const API_URL = `${BASE_URL}/auth`

export const authService = {
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    return response.json()
  },

  signup: async (username, password) => {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    return response.json()
  },

  // Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  // Save user to localStorage
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user))
  },

  // Logout
  logout: () => {
    localStorage.removeItem("user")
  },
}
