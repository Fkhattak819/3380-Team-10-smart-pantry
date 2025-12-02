import { useState } from "react"
import { authService } from "../services/authService";

const LoginForm = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState("login") // 'login' or 'signup'
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Use authService instead of duplicating fetch logic
      const data = mode === "login" 
        ? await authService.login(username, password)
        : await authService.signup(username, password)

      if (data.error) {
        setError(data.error || "An error occurred")
        return
      }

      // Success - call the callback with user data
      onLoginSuccess({
        userId: data.userId,
        username: data.username,
      })
    } catch (err) {
      setError("Connection failed. Make sure the backend is accessible.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-12 w-full max-w-lg">
        <h1 className="text-4xl font-bold text-slate-900 text-center mb-10">
          {mode === "login" ? "Login" : "Sign Up"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-base font-medium text-slate-700 mb-3">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="At least 5 characters"
              disabled={loading}
              className="w-full px-5 py-3.5 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-slate-700 mb-3">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 5 characters"
              disabled={loading}
              className="w-full px-5 py-3.5 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded text-base">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-5 py-4 bg-emerald-500 text-white rounded-xl font-semibold text-base hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-200 text-center">
          <p className="text-base text-slate-600">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login")
                setError("")
                setUsername("")
                setPassword("")
              }}
              className="ml-2 text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
