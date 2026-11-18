import { Search, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import DataDisclaimer from "../components/common/DataDisclaimer"
import TrendLineChart from "../components/trends/TrendLineChart"
import { apiGet, DATA_COUNTRIES } from "../services/api"

const colors = ["#3b1f3a", "#c47c68", "#597b70", "#a47b42", "#7b658f"]

export default function TrendAnalysisPage() {
  const [category, setCategory] = useState("Skincare")
  const [country, setCountry] = useState("South Korea")
  const [categories, setCategories] = useState([])
  const [available, setAvailable] = useState([])
  const [productSearch, setProductSearch] = useState("")
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [selected, setSelected] = useState([])
  const [comparison, setComparison] = useState({ products: [], points: [] })
  const [selectionNote, setSelectionNote] = useState("")
  const [sampleDataUpdated, setSampleDataUpdated] = useState("Loading…")

  useEffect(() => {
    const controller = new AbortController()
    apiGet("/api/countries", {}, { signal: controller.signal }).then((rows) => {
      const latest = rows.find((row) => row.name === country)?.date_to
      if (latest) setSampleDataUpdated(latest)
    }).catch((error) => { if (error.name !== "AbortError") console.error(error) })
    Promise.all([
      apiGet("/api/categories", { country }, { signal: controller.signal }),
    ]).then(([categoryRows]) => {
      const names = categoryRows.map((item) => item.category)
      setCategories(names)
      const activeCategory = names.includes(category) ? category : (names[0] || "")
      if (activeCategory !== category) {
        setCategory(activeCategory)
        setAvailable([])
        setSelected([])
        return
      }
      return apiGet("/api/products", { country, category: activeCategory, limit: 1000, sort: "records" }, { signal: controller.signal }).then((result) => {
        const unique = [...new Set(result.items.map((item) => item.product))]
        setAvailable(unique.map((name) => ({ id: name, name })))
        setSelected(unique.slice(0, 3))
      })
    }).catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Failed to load comparison products", error)
        setAvailable([])
        setSelected([])
      }
    })
    return () => controller.abort()
  }, [country, category])

  useEffect(() => {
    if (!selected.length) { setComparison({ products: [], points: [] }); return undefined }
    const controller = new AbortController()
    Promise.all(selected.map((product) => apiGet("/api/series", { country, product, category, interval: "week" }, { signal: controller.signal })))
      .then((results) => {
        const maxUnits = Math.max(1, ...results.flatMap((result) => result.points.map((point) => point.units_sold || 0)))
        const pointMap = new Map(Array.from({ length: 9 }, (_, index) => [`W${index + 1}`, { period: `W${index + 1}` }]))
        const products = results.map((result, index) => {
          const id = `product-${index}`
          const values = result.points.map((point) => Math.round(((point.units_sold || 0) / maxUnits) * 100))
          values.forEach((value, pointIndex) => { pointMap.get(`W${pointIndex + 1}`)[id] = value })
          return { id, name: result.product, latest: values.at(-1) || 0, change: values.length > 1 ? values.at(-1) - values[0] : 0 }
        })
        setComparison({ products, points: [...pointMap.values()] })
      }).catch((error) => { if (error.name !== "AbortError") console.error("Failed to load product history", error) })
    return () => controller.abort()
  }, [country, category, selected])

  const series = comparison.products.map((product, index) => ({ ...product, color: colors[index % colors.length] }))
  const filteredProducts = available.filter((item) => item.name.toLowerCase().includes(productSearch.trim().toLowerCase()))
  const visibleProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 9)
  const highest = [...series].sort((a, b) => b.latest - a.latest)[0]
  const fastest = [...series].sort((a, b) => b.change - a.change)[0]
  const changeCategory = (nextCategory) => { setCategory(nextCategory); setSelected([]); setSelectionNote(""); setProductSearch(""); setShowAllProducts(false) }
  const toggleProduct = (id) => {
    if (selected.includes(id)) {
      if (selected.length === 3) { setSelectionNote("Choose at least 3 products for a useful comparison."); return }
      setSelected((current) => current.filter((item) => item !== id))
      setSelectionNote("")
      return
    }
    if (selected.length === 5) { setSelectionNote("You can compare up to 5 products at once."); return }
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
              onChange={(event) => { setCountry(event.target.value); setProductSearch(""); setShowAllProducts(false) }}
            >
              {DATA_COUNTRIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="product-compare-picker">
          <legend>Products to compare</legend>
            <label className="product-compare-picker__search">
              <Search size={16} />
              <input
                type="search"
                value={productSearch}
                onChange={(event) => { setProductSearch(event.target.value); setShowAllProducts(false) }}
                placeholder="Search products"
                aria-label="Search products to compare"
              />
            </label>
          <div>
            {visibleProducts.map((trend) => {
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
            {!visibleProducts.length && <p className="product-compare-picker__empty">No products match your search.</p>}
          </div>
          {filteredProducts.length > 9 && (
            <button
              className="product-compare-picker__toggle"
              type="button"
              onClick={() => setShowAllProducts((value) => !value)}
            >
              {showAllProducts ? "Show fewer" : `Show all (${filteredProducts.length})`}
            </button>
          )}
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

      {highest && fastest && (
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
      )}

      <DataDisclaimer>
        All lines, scores, and comparisons are deterministic illustrative sample
        signals. They are not live searches, sales forecasts, or guaranteed
        demand.
      </DataDisclaimer>
    </div>
  )
}







