import { useState } from "react"
import { authService } from "../services/authService";
import SmartPantryImage from "../assets/SmartPantry.png";
import FruitPatternImage from "../assets/fruitpattern.png";

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
    <div className="min-h-screen flex relative">
      {/* KitchenSync Logo - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-2xl font-bold text-green-400">KitchenSync</h1>
      </div>

      {/* Left Half - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
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
                Email address
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email"
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

      {/* Right Half - Fruit Pattern Overlay */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-400 relative overflow-hidden">
        {/* Fruit Pattern Background Overlay - stretched to cover entire area */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${FruitPatternImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.8
          }}
        ></div>
        
        {/* Semi-transparent green overlay to maintain green tint */}
        <div className="absolute inset-0 bg-green-400/30 z-0"></div>
        
        {/* Main Image - Peeking from bottom right corner like reference image */}
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
