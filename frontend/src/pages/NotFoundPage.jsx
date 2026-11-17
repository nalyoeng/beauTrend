import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import Logo from "../components/common/Logo"

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <Logo />
      <span>404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for may have moved or no longer exists.</p>
      <Link className="button button--primary" to="/">
        <ArrowLeft size={15} />
        Back to BeautyTrend
      </Link>
    </main>
  )
}
