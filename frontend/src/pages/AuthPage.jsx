import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Logo from "../components/common/Logo"
import { useAuth } from "../context/AuthContext"

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup"
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recovery, setRecovery] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const values = new FormData(form)
    if (isSignup && values.get("password") !== values.get("confirm"))
      return setError("Passwords do not match.")
    setError("")
    setLoading(true)
    setTimeout(() => {
      login()
      navigate(location.state?.from || "/dashboard", { replace: true })
    }, 650)
  }

  return (
    <div className="auth-page">
      <aside>
        <Logo light />
        <div>
          <span className="eyebrow-label">Beauty market intelligence</span>
          <h1>Turn beauty signals into your next move.</h1>
          <p>
            Explore Asian markets with a workspace built for practical business
            decisions.
          </p>
        </div>
        <small>Discover trends. Understand markets. Decide with clarity.</small>
      </aside>
      <main>
        <Link className="auth-back" to="/">
          ← Back to home
        </Link>
        <div className="auth-card">
          {recovery ? (
            <>
              <span className="eyebrow-label">Account recovery</span>
              <h2>Recover your account</h2>
              <p>
                This prototype confirms the recovery flow without sending email.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  setRecovery(false)
                  setError("Reset link simulated. You can now log in.")
                }}
              >
                <label>
                  Email Address
                  <input required type="email" placeholder="you@company.com" />
                </label>
                <button className="button button--primary">
                  Send reset link
                </button>
              </form>
            </>
          ) : (
            <>
              <span className="eyebrow-label">
                {isSignup ? "Start exploring" : "Welcome back"}
              </span>
              <h2>
                {isSignup ? "Create your account" : "Log in to BeautyTrend"}
              </h2>
              <p>
                {isSignup
                  ? "Join BeautyTrend and explore the full workspace."
                  : "Continue to your beauty intelligence workspace."}
              </p>
              <form onSubmit={submit}>
                {isSignup && (
                  <label>
                    Full Name
                    <input required name="name" placeholder="e.g. Dara Sok" />
                  </label>
                )}
                <label>
                  Email Address
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                  />
                </label>
                <label>
                  Password
                  <div className="password-field">
                    <input
                      required
                      name="password"
                      minLength="6"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
                {isSignup && (
                  <label>
                    Confirm Password
                    <input
                      required
                      name="confirm"
                      minLength="6"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                    />
                  </label>
                )}
                {!isSignup && (
                  <div className="auth-options">
                    <label>
                      <input type="checkbox" /> Remember me
                    </label>
                    <button type="button" onClick={() => setRecovery(true)}>
                      Forgot password?
                    </button>
                  </div>
                )}
                {error && (
                  <div
                    className={`form-message ${
                      error.startsWith("Reset") ? "form-message--success" : ""
                    }`}
                  >
                    {error}
                  </div>
                )}
                <button className="button button--primary" disabled={loading}>
                  {loading
                    ? "Opening workspace…"
                    : isSignup
                      ? "Create account"
                      : "Log in"}
                </button>
              </form>
            </>
          )}
          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "New to BeautyTrend?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Log in" : "Create an account"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
