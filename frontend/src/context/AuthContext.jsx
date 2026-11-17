import { createContext, useContext, useMemo, useState } from "react"

const SESSION_KEY = "beautytrend_session"
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sessionMode, setSessionMode] = useState(
    () => localStorage.getItem(SESSION_KEY) || "",
  )

  const setSession = (mode) => {
    localStorage.setItem(SESSION_KEY, mode)
    setSessionMode(mode)
  }

  const value = useMemo(
    () => ({
      sessionMode,
      isAuthenticated: sessionMode === "authenticated",
      isDemo: sessionMode === "demo",
      login: () => setSession("authenticated"),
      startDemo: () => setSession("demo"),
      logout: () => {
        localStorage.removeItem(SESSION_KEY)
        setSessionMode("")
      },
    }),
    [sessionMode],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
