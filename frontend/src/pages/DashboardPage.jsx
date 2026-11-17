import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import DataDisclaimer from "../components/common/DataDisclaimer"
import {
  cosmeticTrends,
  formatTrendChange,
  sampleDataUpdated,
  trendCategories,
} from "../data/beautyTrends"

function Sparkline({ values, direction, large = false }) {
  const width = large ? 520 : 126
  const height = large ? 160 : 44
  const padding = large ? 8 : 3
  const min = Math.min(...values) - 4
  const max = Math.max(...values) + 4
  const points = values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2)
      const y =
        height -
        padding -
        ((value - min) / (max - min || 1)) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg
      className={`trend-sparkline trend-sparkline--${direction}`}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function SignalCard({ trend, onOpen }) {
  const rising = trend.signal === "rising"
  return (
    <button
      className="signal-card"
      onClick={(event) => onOpen(trend, event.currentTarget)}
      aria-label={`${trend.name}. ${formatTrendChange(trend)} Open details.`}
    >
      <div className="signal-card__copy">
        <span>{trend.category}</span>
        <strong>{trend.name}</strong>
        <small>
          <MapPin size={11} /> Strongest in {trend.market}
        </small>
      </div>
      <Sparkline values={trend.history} direction={trend.signal} />
      <div className={`signal-change signal-change--${trend.signal}`}>
        {rising ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <strong>{trend.change}</strong>
        <small>
          Interest {rising ? "increased" : "decreased"} vs previous period
        </small>
      </div>
      <span className="signal-card__open" aria-hidden="true">
        <ChevronRight size={17} />
      </span>
    </button>
  )
}

function SignalPanel({ direction, trends, expanded, onToggle, onOpen }) {
  const rising = direction === "rising"
  const Icon = rising ? ArrowUpRight : ArrowDownRight
  const visible = expanded ? trends : trends.slice(0, 4)

  return (
    <section className={`signal-panel signal-panel--${direction}`}>
      <header>
        <div className="signal-panel__icon">
          <Icon size={21} />
        </div>
        <div>
          <span>{rising ? "Momentum building" : "Attention easing"}</span>
          <h2>{rising ? "Rising trends" : "Cooling trends"}</h2>
          <p>
            {rising
              ? "Beauty searches gaining the most attention."
              : "Popular searches showing softer recent interest."}
          </p>
        </div>
        <b>{trends.length} signals</b>
      </header>
      <div className="signal-list">
        {visible.map((trend) => (
          <SignalCard key={trend.id} trend={trend} onOpen={onOpen} />
        ))}
      </div>
      {trends.length > 4 && (
        <button className="signal-panel__more" onClick={onToggle}>
          {expanded ? "Show fewer" : `See all ${trends.length} signals`}
          <ChevronRight size={15} />
        </button>
      )}
    </section>
  )
}

function TrendModal({ trend, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!trend) return undefined
    const onKeyDown = (event) => event.key === "Escape" && onClose()
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [trend, onClose])

  if (!trend) return null
  const rising = trend.signal === "rising"

  return (
    <div className="trend-modal-backdrop" onMouseDown={onClose}>
      <section
        className="trend-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trend-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span className="eyebrow-label">
              {trend.category} · Search trend
            </span>
            <h2 id="trend-modal-title">{trend.name}</h2>
          </div>
          <button
            ref={closeRef}
            className="icon-button"
            onClick={onClose}
            aria-label="Close trend details"
          >
            <X size={19} />
          </button>
        </header>
        <div className="trend-modal__summary">
          <div
            className={`trend-modal__metric trend-modal__metric--${trend.signal}`}
          >
            {rising ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
            <strong>{trend.change}</strong>
            <span>{rising ? "Rising trend" : "Cooling trend"}</span>
            <small>{formatTrendChange(trend)}</small>
          </div>
          <div>
            <span>Trend score</span>
            <strong>{trend.score}/100</strong>
            <small>Illustrative relative interest</small>
          </div>
          <div>
            <span>Leading market</span>
            <strong>{trend.market}</strong>
            <small>Among tracked Asian markets</small>
          </div>
        </div>
        <div className="trend-modal__chart">
          <div>
            <span className="eyebrow-label">9-week direction</span>
            <strong>Search attention over time</strong>
          </div>
          <Sparkline values={trend.history} direction={trend.signal} large />
        </div>
        <div className="trend-modal__grid">
          <div>
            <h3>
              {rising
                ? "Countries where interest is growing"
                : "Countries where interest is easing"}
            </h3>
            {[...trend.countryGrowth]
              .sort((a, b) => b.growth - a.growth)
              .map(({ country, score, growth }) => (
                <div className="market-score" key={country}>
                  <span>{country}</span>
                  <i>
                    <b style={{ width: `${score}%` }} />
                  </i>
                  <strong>
                    {growth > 0 ? "+" : ""}
                    {growth}%
                  </strong>
                </div>
              ))}
            <small className="market-score-note">
              Bars show relative interest; percentages show illustrative period
              change.
            </small>
          </div>
          <aside>
            <Sparkles size={19} />
            <h3>Why this trend matters</h3>
            <p>{trend.whyItMatters}</p>
            <div className="cambodia-modal-opportunity">
              <strong>Potential for Cambodian sellers</strong>
              <p>{trend.cambodiaOpportunity}</p>
            </div>
            <small>
              Validate local demand, pricing, competition, regulations, and
              customer fit before making a stocking decision.
            </small>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default function DashboardPage() {
  const location = useLocation()
  const [category, setCategory] = useState("All trends")
  const [query, setQuery] = useState("")
  const [selectedTrend, setSelectedTrend] = useState(null)
  const triggerRef = useRef(null)
  const [expanded, setExpanded] = useState({ rising: false, cooling: false })

  useEffect(() => {
    if (location.state?.query) setQuery(location.state.query)
  }, [location.state])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return cosmeticTrends.filter(
      (trend) =>
        (category === "All trends" || trend.category === category) &&
        (!normalizedQuery ||
          trend.name.toLowerCase().includes(normalizedQuery) ||
          trend.category.toLowerCase().includes(normalizedQuery) ||
          trend.market.toLowerCase().includes(normalizedQuery)),
    )
  }, [category, query])

  const rising = filtered.filter((trend) => trend.signal === "rising")
  const cooling = filtered.filter((trend) => trend.signal === "cooling")
  const cambodiaTrends = ["Skincare", "Makeup", "Ingredients", "Haircare"]
    .map((item) =>
      cosmeticTrends.find(
        (trend) => trend.category === item && trend.signal === "rising",
      ),
    )
    .filter(Boolean)

  const openTrend = (trend, trigger) => {
    triggerRef.current = trigger
    setSelectedTrend(trend)
  }

  const closeTrend = () => {
    setSelectedTrend(null)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory)
    setExpanded({ rising: false, cooling: false })
  }

  return (
    <div className="page-stack trend-dashboard">
      <section className="trend-dashboard__intro">
        <div>
          <span className="eyebrow-label">Cosmetic trend tracker</span>
          <h2>See what beauty shoppers are searching for now.</h2>
          <p>
            Track early signals across 72 curated cosmetic queries in four
            regional markets, with a Cambodia opportunity lens.
          </p>
        </div>
        <span className="trend-dashboard__updated">
          <i />
          <span>
            <strong>Sample data</strong>
            Last updated: {sampleDataUpdated}
          </span>
        </span>
      </section>

      <section className="trend-controls" aria-label="Trend filters">
        <label className="trend-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a trend, ingredient or market"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </label>
        <div className="trend-tabs" role="tablist" aria-label="Categories">
          {trendCategories.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={category === item}
              className={category === item ? "active" : ""}
              onClick={() => selectCategory(item)}
            >
              {item}
              <span>
                {item === "All trends"
                  ? cosmeticTrends.length
                  : cosmeticTrends.filter((trend) => trend.category === item)
                      .length}
              </span>
            </button>
          ))}
        </div>
      </section>

      {filtered.length ? (
        <div className="signal-grid">
          <SignalPanel
            direction="rising"
            trends={rising}
            expanded={expanded.rising}
            onToggle={() =>
              setExpanded((current) => ({
                ...current,
                rising: !current.rising,
              }))
            }
            onOpen={openTrend}
          />
          <SignalPanel
            direction="cooling"
            trends={cooling}
            expanded={expanded.cooling}
            onToggle={() =>
              setExpanded((current) => ({
                ...current,
                cooling: !current.cooling,
              }))
            }
            onOpen={openTrend}
          />
        </div>
      ) : (
        <section className="trend-empty surface">
          <Search size={25} />
          <h2>No trend signals found</h2>
          <p>Try a broader search or choose another category.</p>
          <button
            className="button button--outline"
            onClick={() => {
              setQuery("")
              setCategory("All trends")
            }}
          >
            Clear filters
          </button>
        </section>
      )}

      <section className="market-discovery surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Cambodia opportunity watch</span>
            <h2>Asian beauty trends with potential in Cambodia.</h2>
            <p>
              A small selection of rising Asian signals worth validating with
              Cambodian customers—not a full market comparison.
            </p>
          </div>
        </div>
        <div className="cambodia-opportunity-grid">
          {cambodiaTrends.map((trend, index) => (
            <button
              key={trend.id}
              onClick={(event) => openTrend(trend, event.currentTarget)}
              aria-label={`${trend.name}. ${formatTrendChange(trend)} Open details.`}
            >
              <span>0{index + 1}</span>
              <div>
                <small>
                  {trend.category} · Signal led by {trend.market}
                </small>
                <strong>{trend.name}</strong>
                <p>{trend.cambodiaOpportunity}</p>
              </div>
              <b>{trend.change}</b>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
      </section>

      <DataDisclaimer>
        Trend scores and changes are illustrative sample data for product
        exploration. They do not represent confirmed sales or guaranteed demand.
      </DataDisclaimer>
      <TrendModal trend={selectedTrend} onClose={closeTrend} />
    </div>
  )
}
