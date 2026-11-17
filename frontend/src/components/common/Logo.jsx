import { Link } from "react-router-dom"

export default function Logo({ light = false }) {
  return (
    <Link className={`brand-logo ${light ? "brand-logo--light" : ""}`} to="/">
      <img src="/assets/beautytrend-logo.png" alt="BeautyTrend" />
    </Link>
  )
}
