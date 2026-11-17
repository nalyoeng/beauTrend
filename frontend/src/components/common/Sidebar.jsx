import {
  FileText,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Scale,
  TrendingUp,
  X,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Logo from "./Logo"

const items = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/trends", "Trend Analysis", TrendingUp],
  ["/comparison", "Market Comparison", Scale],
  ["/reports", "Reports", FileText],
]

export default function Sidebar({ open, onClose }) {
  const { isDemo, logout } = useAuth()
  const navigate = useNavigate()
  const signOut = () => {
    logout()
    navigate("/")
  }

  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="sidebar__top">
          <Logo light />
          <button
            className="icon-button sidebar__close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <span className="sidebar__label">
          {isDemo ? "Live demo" : "Workspace"}
        </span>
        <nav aria-label="Application">
          {items.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} onClick={onClose}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="weekly-signal">
          <Sparkles size={17} />
          <strong>Weekly signal</strong>
          <p>Centella Serum continues to attract interest in Cambodia.</p>
        </div>
        <div className="sidebar-user">
          <span>{isDemo ? "DE" : "DS"}</span>
          <div>
            <strong>{isDemo ? "Demo workspace" : "Dara Sok"}</strong>
            <small>{isDemo ? "Explore all features" : "Market analyst"}</small>
          </div>
          <button
            onClick={signOut}
            aria-label={isDemo ? "Exit demo" : "Log out"}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
    </>
  )
}
