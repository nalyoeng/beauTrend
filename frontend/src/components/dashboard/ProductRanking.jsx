import { ArrowUpRight } from "lucide-react"
import { dashboardProducts } from "../../data/beautyTrends"

export default function ProductRanking({ onOpen }) {
  return (
    <section className="surface product-ranking">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">What people are searching</span>
          <h2>Top Trending Products</h2>
        </div>
        <button className="text-button" onClick={onOpen}>
          See all
        </button>
      </div>
      {dashboardProducts.map(([name, score, status], index) => (
        <button className="ranking-row" key={name} onClick={onOpen}>
          <span>{index + 1}</span>
          <div>
            <strong>{name}</strong>
            <small>{status}</small>
          </div>
          <b>
            <ArrowUpRight size={13} /> {score}
          </b>
        </button>
      ))}
    </section>
  )
}
