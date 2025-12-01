import { login as apiLogin, signup as apiSignup } from './api.js';

export const authService = {
  login: async (username, password) => {
    return apiLogin(username, password);
  },

  signup: async (username, password) => {
    return apiSignup(username, password);
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
