import { ArrowRight, TrendingUp } from "lucide-react"

export default function RecentActivity({ onOpen }) {
  return (
    <section className="insight-card">
      <span className="insight-card__icon">
        <TrendingUp size={22} />
      </span>
      <span className="eyebrow-label">Market insight</span>
      <h2>Centella Serum is trending in South Korea.</h2>
      <p>
        Illustrative interest increased by 72% compared with the previous
        period.
      </p>
      <button className="button button--secondary" onClick={onOpen}>
        Learn more <ArrowRight size={15} />
      </button>
    </section>
  )
}
