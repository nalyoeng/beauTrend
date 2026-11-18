import { useState } from "react"
import { Outlet } from "react-router-dom"
import Footer from "./Footer"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-content">
        <Navbar onMenu={() => setSidebarOpen(true)} />
        <main className="page-container">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
