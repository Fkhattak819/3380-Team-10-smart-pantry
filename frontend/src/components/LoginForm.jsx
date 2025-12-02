import { useState } from "react"
import { authService } from "../services/authService";
import SmartPantryImage from "../assets/SmartPantry.png";

// Login/Signup form - using hooks
const LoginForm = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState("login") // login or signup
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let data;
      
      if (mode === "signup") {
        // Create account first
        const signupData = await authService.signup(username, password)
        
        if (signupData.error) {
          setError(signupData.error || "An error occurred")
          setLoading(false)
          return
        }
        
        // Wait a sec for database to finish
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Auto login after signup
        data = await authService.login(username, password)
        
        if (data.error) {
          setError(data.error || "Account created but login failed. Please try logging in.")
          setLoading(false)
          return
        }
      } else {
        // Just login
        data = await authService.login(username, password)
      }

      if (data.error) {
        setError(data.error || "An error occurred")
        setLoading(false)
        return
      }

      // Get user data from response
      const userData = {
        userId: data.userId || data.user_id || data.id,
        username: data.username || data.userName || username,
      };
      onLoginSuccess(userData)
    } catch (err) {
      setError("Connection failed. Make sure the backend is accessible.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative">
      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-2xl font-bold text-green-400">KitchenSync</h1>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-slate-900">
              Welcome
            </h2>
          </div>
          <p className="text-base text-slate-600 mb-8">
            Please enter your details
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-4 py-3 bg-green-400 text-white rounded-lg font-semibold text-base hover:bg-green-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? "Loading..." : mode === "login" ? "Sign in" : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login")
                  setError("")
                  setUsername("")
                  setPassword("")
                }}
                className="ml-2 text-blue-600 font-semibold hover:text-blue-700 hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-l from-green-400 to-white relative overflow-hidden">
        <img 
          src={SmartPantryImage} 
          alt="SmartPantry" 
          className="absolute z-20"
          style={{
            width: '20000px',
            height: '20000px',
            bottom: '-09900px',
            right: '-200px',
            transform: 'rotate(-15deg)',
            filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))',
            objectFit: 'contain',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  )
}

export default LoginForm
