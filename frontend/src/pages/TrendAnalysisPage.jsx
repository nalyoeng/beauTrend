import { Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import DataDisclaimer from "../components/common/DataDisclaimer"
import TrendLineChart from "../components/trends/TrendLineChart"
import {
  comparisonMarkets,
  cosmeticTrends,
  getComparisonSeries,
  sampleDataUpdated,
} from "../data/beautyTrends"

const categories = ["Skincare", "Makeup", "Ingredients", "Haircare"]
const colors = ["#3b1f3a", "#c47c68", "#597b70", "#a47b42", "#7b658f"]

function defaultsFor(category) {
  const categoryTrends = cosmeticTrends.filter(
    (trend) => trend.category === category,
  )
  if (category === "Skincare") {
    const preferred = [
      "Centella Serum",
      "Niacinamide Serum",
      "Hyaluronic Acid Serum",
    ]
    return preferred.map(
      (name) => categoryTrends.find((trend) => trend.name === name).id,
    )
  }
  return categoryTrends.slice(0, 3).map((trend) => trend.id)
}

export default function TrendAnalysisPage() {
  const [category, setCategory] = useState("Skincare")
  const [country, setCountry] = useState("South Korea")
  const [selected, setSelected] = useState(() => defaultsFor("Skincare"))
  const [selectionNote, setSelectionNote] = useState("")

  const available = useMemo(
    () => cosmeticTrends.filter((trend) => trend.category === category),
    [category],
  )
  const comparison = useMemo(
    () => getComparisonSeries({ country, productIds: selected }),
    [country, selected],
  )
  const series = comparison.products.map((product, index) => ({
    ...product,
    color: colors[index],
  }))
  const highest = [...series].sort((a, b) => b.latest - a.latest)[0]
  const fastest = [...series].sort((a, b) => b.change - a.change)[0]

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory)
    setSelected(defaultsFor(nextCategory))
    setSelectionNote("")
  }

  const toggleProduct = (id) => {
    if (selected.includes(id)) {
      if (selected.length === 3) {
        setSelectionNote("Choose at least 3 products for a useful comparison.")
        return
      }
      setSelected((current) => current.filter((item) => item !== id))
      setSelectionNote("")
      return
    }
    if (selected.length === 5) {
      setSelectionNote("You can compare up to 5 products at once.")
      return
    }
    setSelected((current) => [...current, id])
    setSelectionNote("")
  }

  return (
    <div className="page-stack trend-analysis-page">
      <section className="trend-analysis-hero">
        <div>
          <span className="eyebrow-label">Multi-product comparison</span>
          <h2>Compare cosmetic trends within one market.</h2>
          <p>
            Choose one category, one country, and 3–5 products to see how their
            illustrative search-interest signals move together.
          </p>
        </div>
        <span className="trend-analysis-hero__status">
          <i />
          <span>
            <strong>Sample data</strong>
            Last updated: {sampleDataUpdated}
          </span>
        </span>
      </section>

      <section className="surface comparison-setup">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Comparison setup</span>
            <h2>Choose what you want to compare</h2>
            <p>Products always stay within the selected cosmetic category.</p>
          </div>
          <b>{selected.length} of 5 selected</b>
        </div>
        <div className="comparison-setup__selectors">
          <label>
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => changeCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Country</span>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              {comparisonMarkets.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="product-compare-picker">
          <legend>Products to compare</legend>
          <div>
            {available.map((trend) => {
              const checked = selected.includes(trend.id)
              const disabled = !checked && selected.length === 5
              return (
                <label
                  className={checked ? "active" : ""}
                  key={trend.id}
                  aria-disabled={disabled}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleProduct(trend.id)}
                  />
                  <span>{trend.name}</span>
                  <b>{checked ? "Selected" : "Add"}</b>
                </label>
              )
            })}
          </div>
        </fieldset>
        <p className="selection-help" role="status">
          {selectionNote ||
            "Select at least 3 and no more than 5 products to keep the chart readable."}
        </p>
      </section>

      <section className="surface multi-trend-chart">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">9-week comparison · {country}</span>
            <h2>{category} interest over time</h2>
            <p>
              Relative interest index from 0–100. A higher value means stronger
              interest within this illustrative sample.
            </p>
          </div>
        </div>
        <TrendLineChart data={comparison.points} series={series} />
        <div className="trend-chart-legend" aria-label="Chart legend">
          {series.map((product) => (
            <div key={product.id}>
              <i style={{ background: product.color }} />
              <span>{product.name}</span>
              <strong>{product.latest}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="trend-comparison-insight">
        <Sparkles size={21} />
        <div>
          <span className="eyebrow-label">Top Trend Takeaway</span>
          <h2>
            {highest.id === fastest.id
              ? `${highest.name} has both the highest current interest and the strongest momentum in ${country}.`
              : `${highest.name} has the highest current interest in ${country}, while ${fastest.name} is gaining fastest.`}
          </h2>
          <p>
            Use this comparison to identify products worth further research,
            then validate local demand, pricing, competition, and customer fit.
          </p>
        </div>
      </section>

      <DataDisclaimer>
        All lines, scores, and comparisons are deterministic illustrative sample
        signals. They are not live searches, sales forecasts, or guaranteed
        demand.
      </DataDisclaimer>
    </div>
  )
}
