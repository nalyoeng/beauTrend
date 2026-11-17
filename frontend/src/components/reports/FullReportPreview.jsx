import { X } from "lucide-react"
import { useEffect, useRef } from "react"
import { getMarketComparison } from "../../data/marketComparison"
import Logo from "../common/Logo"

const chartColors = ["#3b1f3a", "#c47c68", "#597b70", "#a47b42", "#7b658f"]

function ProductTrendChart({ products }) {
  const width = 680
  const height = 190
  const padding = 14
  const pointsFor = (values) =>
    values
      .map((value, index) => {
        const x =
          padding + (index / (values.length - 1)) * (width - padding * 2)
        const y = height - padding - (value / 100) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(" ")

  return (
    <div
      className="report-trend-chart"
      role="img"
      aria-label={`Historical illustrative interest for ${products.map((product) => product.name).join(", ")}`}
    >
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[25, 50, 75].map((value) => (
          <line
            key={value}
            x1="0"
            x2={width}
            y1={height - (value / 100) * height}
            y2={height - (value / 100) * height}
          />
        ))}
        {products.map((product, index) => (
          <polyline
            key={product.name}
            points={pointsFor(product.history)}
            style={{ stroke: chartColors[index % chartColors.length] }}
          />
        ))}
      </svg>
      <div>
        {products.map((product, index) => (
          <span key={product.name}>
            <i
              style={{ background: chartColors[index % chartColors.length] }}
            />
            {product.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function FullReportPreview({ report, onClose }) {
  const { products, country, reportType, generatedAt, reportPeriod } = report
  const closeRef = useRef(null)
  const ranked = [...products].sort((a, b) => b.interest - a.interest)
  const top = ranked[0]
  const marketRows = getMarketComparison(top.name, "Last 3 months")
  const leader = [...marketRows].sort((a, b) => b.score - a.score)[0]
  const fastest = [...marketRows].sort((a, b) => b.growth - a.growth)[0]
  const categories = [...new Set(products.map((product) => product.category))]

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = "hidden"
    const escape = (event) => event.key === "Escape" && onClose()
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("keydown", escape)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="report-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Full beauty market report"
    >
      <div className="report-preview">
        <header>
          <Logo />
          <button
            ref={closeRef}
            className="icon-button"
            onClick={onClose}
            aria-label="Close report"
          >
            <X size={20} />
          </button>
        </header>
        <main>
          <section className="report-page report-cover">
            <Logo />
            <span className="eyebrow-label">Beauty industry intelligence</span>
            <small>Illustrative report</small>
            <h1>{reportType}</h1>
            <p>
              {country} Market · Asian Beauty Trends
              <br />
              Report period: {reportPeriod}
            </p>
            <div className="report-meta">
              <span>
                Products analyzed<b>{products.length}</b>
              </span>
              <span>
                Markets compared<b>{marketRows.length}</b>
              </span>
              <span>
                Categories<b>{categories.join(", ")}</b>
              </span>
              <span>
                Generated<b>{generatedAt}</b>
              </span>
            </div>
            <span className="eyebrow-label">01 · Executive Summary</span>
            <h2>Beauty signals worth exploring</h2>
            <p>
              This report highlights emerging cosmetic trends across selected
              Asian markets and identifies products that may present potential
              opportunities for {country} cosmetics sellers. {top.name} has the
              highest relative interest among the selected products.
            </p>
          </section>

          <section className="report-page">
            <span className="eyebrow-label">02 · Emerging Beauty Trends</span>
            <h2>Products gaining attention</h2>
            <div className="report-trend-cards">
              {ranked.map((product) => (
                <article key={product.name}>
                  <div>
                    <span>{product.trendStatus}</span>
                    <h3>{product.name}</h3>
                    <small>
                      {product.category} · {product.origin}
                    </small>
                  </div>
                  <strong>
                    {product.growth > 0 ? "+" : ""}
                    {product.growth}%<small>Sample interest change</small>
                  </strong>
                  <p>Suggested retail price: {product.price}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="report-page">
            <span className="eyebrow-label">03 · Product Trend Analysis</span>
            <h2>Historical interest comparison</h2>
            <p>
              Illustrative relative interest index across seven sample periods.
            </p>
            <ProductTrendChart products={products} />
            <div className="report-takeaway">
              <span>Top Trend Takeaway</span>
              <h3>
                {top.name} has the highest current interest score at{" "}
                {top.interest}/100, while{" "}
                {[...products].sort((a, b) => b.growth - a.growth)[0].name}{" "}
                shows the strongest sample growth.
              </h3>
            </div>
          </section>

          <section className="report-page">
            <span className="eyebrow-label">04 · Asian Market Comparison</span>
            <h2>{top.name} relative interest by market</h2>
            <p>
              Illustrative relative interest index from 0–100 for the leading
              selected product.
            </p>
            <div className="report-market-bars">
              {marketRows
                .sort((a, b) => b.score - a.score)
                .map((market) => (
                  <div key={market.name}>
                    <span>{market.name}</span>
                    <i>
                      <b style={{ width: `${market.score}%` }} />
                    </i>
                    <strong>{market.score}</strong>
                  </div>
                ))}
            </div>
            <div className="report-takeaway">
              <span>Market Insights</span>
              <h3>
                {leader.name} has the highest relative interest, while{" "}
                {fastest.name} shows the fastest growth in this sample.
              </h3>
            </div>
          </section>

          <section className="report-page">
            <span className="eyebrow-label">
              05 · Cambodia Business Opportunities
            </span>
            <h2>Opportunities worth validating locally</h2>
            <ul className="report-opportunity-list">
              <li>
                Monitor growing interest in {top.name} and related{" "}
                {top.category.toLowerCase()} searches.
              </li>
              <li>
                Explore clear product positioning for Cambodian cosmetics
                customers.
              </li>
              <li>
                Start with a small assortment and compare customer feedback
                against local competitors.
              </li>
              <li>
                Validate supplier quality, regulations, and current retail
                prices before scaling.
              </li>
            </ul>
          </section>

          <section className="report-page">
            <span className="eyebrow-label">
              06 · Suggested Price Reference
            </span>
            <h2>Illustrative retail price guidance</h2>
            <div className="report-price-reference">
              <div>
                <b>Product</b>
                <b>Suggested price</b>
                <b>Currency</b>
              </div>
              {ranked.map((product) => (
                <div key={product.name}>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                  <span>USD</span>
                </div>
              ))}
            </div>
            <p>
              Suggested retail prices are illustrative guidance, not verified
              supplier quotations or current market prices.
            </p>
          </section>

          <section className="report-page">
            <span className="eyebrow-label">07 · Data Limitations</span>
            <h2>How to use this report responsibly</h2>
            <div className="final-report-answer">
              <p>
                All trend scores, growth percentages, comparisons, and suggested
                prices in this prototype are illustrative sample signals. They
                do not represent actual sales, verified consumer demand, or
                guaranteed purchasing behavior.
              </p>
            </div>
            <ul>
              <li>Search-interest signals may not become purchases.</li>
              <li>Scores and rankings are deterministic demonstration data.</li>
              <li>Suggested prices require local and supplier verification.</li>
              <li>
                Customer preferences, competition, and regulations can change.
              </li>
            </ul>
            <p>BeautyTrend · Prototype Report · Pages 1–7</p>
          </section>
        </main>
      </div>
    </div>
  )
}
