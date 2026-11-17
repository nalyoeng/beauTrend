import { useState } from "react"
import DataDisclaimer from "../components/common/DataDisclaimer"
import ComparisonTable from "../components/comparison/ComparisonTable"
import CountryBarChart from "../components/comparison/CountryBarChart"
import MarketInsightCard from "../components/comparison/MarketInsightCard"
import MarketSelector from "../components/comparison/MarketSelector"
import {
  comparisonProducts,
  getMarketComparison,
  popularMarkets,
} from "../data/marketComparison"

export default function MarketComparisonPage() {
  const [product, setProduct] = useState("Centella Serum")
  const [time, setTime] = useState("Last 6 months")
  const [selected, setSelected] = useState(
    popularMarkets.map((market) => market.name),
  )
  const [expanded, setExpanded] = useState(false)
  const marketData = getMarketComparison(product, time)
  const visible = marketData.filter((market) => selected.includes(market.name))
  const leader = [...visible].sort((a, b) => b.score - a.score)[0]
  const fastest = [...visible].sort((a, b) => b.growth - a.growth)[0]
  const toggle = (name) => {
    if (selected.includes(name) && selected.length === 1) return
    setSelected(
      selected.includes(name)
        ? selected.filter((item) => item !== name)
        : [...selected, name],
    )
  }

  return (
    <div className="page-stack">
      <MarketSelector
        markets={popularMarkets}
        selected={selected}
        onToggle={toggle}
        product={product}
        onProduct={setProduct}
        time={time}
        onTime={setTime}
        products={comparisonProducts}
      />
      <div className="comparison-grid">
        <CountryBarChart
          markets={visible}
          product={product}
          time={time}
          leader={leader.name}
        />
        <ComparisonTable leader={leader} fastest={fastest} />
      </div>
      <MarketInsightCard
        product={product}
        leader={leader.name}
        fastest={fastest.name}
        fastestGrowth={fastest.growth}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
      <DataDisclaimer />
    </div>
  )
}
