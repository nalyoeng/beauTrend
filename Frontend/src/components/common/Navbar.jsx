import { Bell, ChevronDown, Menu, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const titles = {
  "/dashboard": [
    "Dashboard",
    "Explore the latest cosmetics trends across Asia",
  ],
  "/trends": [
    "Trend Analysis",
    "Explore product momentum, markets, and related searches",
  ],
  "/comparison": [
    "Market Comparison",
    "See which countries are interested in your product",
  ],
  "/reports": [
    "Reports & Business Insights",
    "Generate reports and evaluate business opportunities",
  ],
}

export default function Navbar({ onMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDemo, logout } = useAuth()
  const [query, setQuery] = useState("")
  const [menu, setMenu] = useState("")
  const menuRef = useRef(null)
  const [title, subtitle] = titles[location.pathname] || [
    "BeautyTrend",
    "Beauty market intelligence",
  ]

  useEffect(() => setMenu(""), [location.pathname])
  useEffect(() => {
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenu("")
    }
    const escape = (event) => event.key === "Escape" && setMenu("")
    document.addEventListener("pointerdown", close)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", close)
      document.removeEventListener("keydown", escape)
    }
  }, [])

  const search = (event) => {
    event.preventDefault()
    if (query.trim()) navigate("/dashboard", { state: { query: query.trim() } })
  }

  return (
    <header className="navbar">
      <div className="navbar__title">
        <button
          className="icon-button navbar__menu"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>
        <div>
          <span>BeautyTrend intelligence</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="navbar__actions" ref={menuRef}>
        <form className="global-search" onSubmit={search}>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product (e.g. Serum, Lipstick...)"
            aria-label="Search products"
          />
        </form>
        <button
          className="icon-button notification-button"
          onClick={() =>
            setMenu(menu === "notifications" ? "" : "notifications")
          }
          aria-label="Notifications"
        >
          <Bell size={19} />
          <i />
        </button>
        <button
          className="profile-button"
          onClick={() => setMenu(menu === "profile" ? "" : "profile")}
        >
          <span>{isDemo ? "DE" : "DS"}</span>
          <div>
            <strong>{isDemo ? "Demo User" : "Dara Sok"}</strong>
            <small>{isDemo ? "Preview mode" : "Market analyst"}</small>
          </div>
          <ChevronDown size={14} />
        </button>
        {menu === "notifications" && (
          <div className="navbar-popover navbar-popover--notifications">
            <strong>Latest signals</strong>
            <p>Centella Serum interest increased in Cambodia.</p>
            <p>Your business report is ready.</p>
          </div>
        )}
        {menu === "profile" && (
          <div className="navbar-popover">
            <strong>{isDemo ? "Demo User" : "Dara Sok"}</strong>
            <span>
              {isDemo ? "Interactive preview" : "dara@beautytrend.co"}
            </span>
            <button
              onClick={() => {
                logout()
                navigate("/")
              }}
            >
              {isDemo ? "Exit demo" : "Log out"}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
