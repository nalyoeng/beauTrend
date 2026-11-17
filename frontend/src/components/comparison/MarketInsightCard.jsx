import { ArrowRight, Lightbulb } from "lucide-react"

export default function MarketInsightCard({
  product,
  leader,
  fastest,
  fastestGrowth,
  expanded,
  onToggle,
}) {
  return (
    <section className="insight-card insight-card--wide">
      <span className="insight-card__icon">
        <Lightbulb size={22} />
      </span>
      <span className="eyebrow-label">Market Insights</span>
      <h2>
        {product} has the highest relative interest in {leader}, while {fastest}{" "}
        is gaining fastest.
      </h2>
      <p>
        Search interest in {fastest} increased {fastestGrowth}% in this sample
        period. This may be worth monitoring alongside local customer feedback.
      </p>
      {expanded && (
        <div className="expanded-note">
          Compare local pricing, customer feedback, and availability before
          making a business decision.
        </div>
      )}
      <button className="button button--secondary" onClick={onToggle}>
        {expanded ? "Hide details" : "Explore this trend"}{" "}
        <ArrowRight size={15} />
      </button>
    </section>
  )
}
