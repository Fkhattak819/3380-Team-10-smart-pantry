const API_URL = "http://localhost:5001/api/auth"

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
