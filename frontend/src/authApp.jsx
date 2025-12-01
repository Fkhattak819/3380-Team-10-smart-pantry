import { Component } from "react"
import LoginForm from "./login/LoginForm"
import App from "./App"
import { authService } from "./login/authService"

class authApp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: authService.getUser(),
      isLoading: true,
    }
  }

  componentDidMount() {
    // Check if user is already logged in
    const user = authService.getUser()
    this.setState({ user, isLoading: false })
  }

  handleLoginSuccess = (user) => {
    authService.setUser(user)
    this.setState({ user })
  }

  handleLogout = () => {
    authService.logout()
    this.setState({ user: null })
  }

  render() {
    const { user, isLoading } = this.state

    if (isLoading) {
      return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
    }

    if (!user) {
      return <LoginForm onLoginSuccess={this.handleLoginSuccess} />
    }

    // User is logged in - render the main app
    return <App user={user} onLogout={this.handleLogout} />
  }
}

export default authApp
