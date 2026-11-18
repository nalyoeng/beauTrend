import { useEffect, useMemo, useState } from "react"
import DataDisclaimer from "../components/common/DataDisclaimer"
import ComparisonTable from "../components/comparison/ComparisonTable"
import CountryBarChart from "../components/comparison/CountryBarChart"
import MarketInsightCard from "../components/comparison/MarketInsightCard"
import MarketSelector from "../components/comparison/MarketSelector"
import { apiGet, DATA_COUNTRIES } from "../services/api"

const codeByCountry = { "South Korea": "KR", Malaysia: "MY", Singapore: "SG", Thailand: "TH" }
const periods = { "Last 3 months": 3, "Last 6 months": 6, "Last 12 months": 12 }

export default function MarketComparisonPage() {
  const [markets, setMarkets] = useState([])
  const [products, setProducts] = useState([])
  const [categoryByProduct, setCategoryByProduct] = useState({})
  const [product, setProduct] = useState("")
  const [time, setTime] = useState("Last 6 months")
  const [selected, setSelected] = useState([])
  const [marketData, setMarketData] = useState([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      apiGet("/api/countries", {}, { signal: controller.signal }),
      apiGet("/api/products", { limit: 1000 }, { signal: controller.signal }),
    ]).then(([countryRows, result]) => {
      const availableMarkets = (countryRows || []).filter((row) => DATA_COUNTRIES.includes(row.name)).map((row) => ({ name: row.name, code: codeByCountry[row.name] }))
      const names = [...new Set(result.items.map((item) => item.product))]
      const productCategories = {}
      result.items.forEach((item) => { if (!productCategories[item.product]) productCategories[item.product] = item.category })
      setMarkets(availableMarkets)
      setSelected(availableMarkets.map((item) => item.name))
      setProducts(names)
      setCategoryByProduct(productCategories)
      setProduct((current) => names.includes(current) ? current : (names[0] || ""))
    }).catch((error) => { if (error.name !== "AbortError") console.error("Failed to load market comparison options", error) })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!product) { setMarketData([]); return undefined }
    const controller = new AbortController()
    apiGet("/api/market-comparison", { product, category: categoryByProduct[product], months: periods[time] }, { signal: controller.signal })
      .then((result) => setMarketData(result.markets || []))
      .catch((error) => { if (error.name !== "AbortError") { console.error("Failed to load market comparison", error); setMarketData([]) } })
    return () => controller.abort()
  }, [product, time, categoryByProduct])

  const visible = useMemo(() => marketData.filter((market) => selected.includes(market.name)), [marketData, selected])
  const leader = [...visible].sort((a, b) => b.score - a.score)[0]
  const fastest = [...visible].sort((a, b) => b.growth - a.growth)[0]
  const toggle = (name) => {
    if (selected.includes(name) && selected.length === 1) return
    setSelected(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name])
  }

  return (
    <div className="page-stack">
      <MarketSelector
        markets={markets}
        selected={selected}
        onToggle={toggle}
        product={product}
        onProduct={setProduct}
        time={time}
        onTime={setTime}
        products={products}
      />
      {leader && fastest && <>
        <div className="comparison-grid">
          <CountryBarChart markets={visible} product={product} time={time} leader={leader.name} />
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
      </>}
      <DataDisclaimer />
    </div>
  )
}
