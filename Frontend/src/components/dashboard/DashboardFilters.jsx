export default function DashboardFilters({ filters, onChange, onApply }) {
  const field = (label, key, options) => (
    <label>
      <span>{label}</span>
      <select
        value={filters[key]}
        onChange={(event) => onChange(key, event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )

  return (
    <section className="surface filter-section">
      <div className="section-heading">
        <div>
          <h2>What would you like to explore?</h2>
          <p>Choose a country, category, product, and time period.</p>
        </div>
      </div>
      <div className="filter-grid">
        {field("Country / Region", "country", [
          "South Korea",
          "Japan",
          "Thailand",
          "Cambodia",
          "Vietnam",
        ])}
        {field("Category", "category", [
          "Serum",
          "Lipstick",
          "Sunscreen",
          "Makeup",
        ])}
        {field("Product", "product", [
          "Centella Serum",
          "Hyaluronic Serum",
          "Niacinamide Serum",
        ])}
        {field("Time Range", "time", [
          "Last 3 months",
          "Last 6 months",
          "Last 12 months",
        ])}
        <button className="button button--primary" onClick={onApply}>
          Apply filters
        </button>
      </div>
    </section>
  )
}
