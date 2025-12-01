import { useState } from "react"
import "./auth.css";
import { authService } from "./authService";

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
    <div className="login-container">
      <div className="login-card">
        <h1>{mode === "login" ? "Login" : "Sign Up"}</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="At least 5 characters"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 5 characters"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="toggle-mode">
          <p>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login")
                setError("")
                setUsername("")
                setPassword("")
              }}
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
