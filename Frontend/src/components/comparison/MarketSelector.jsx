export default function MarketSelector({
  markets,
  selected,
  onToggle,
  product,
  onProduct,
  time,
  onTime,
  products,
}) {
  return (
    <section className="surface market-selector">
      <div className="selector-fields">
        <label>
          <span>Product</span>
          <select value={product} onChange={(event) => onProduct(event.target.value)}>
            {products.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Time</span>
          <select value={time} onChange={(event) => onTime(event.target.value)}>
            {["Last 3 months", "Last 6 months", "Last 12 months"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="section-heading">
        <div><h2>Choose countries</h2><p>Select the markets you want to compare.</p></div>
      </div>
      <div className="market-chips">
        {markets.map((market) => <button className={selected.includes(market.name) ? "active" : ""} key={market.name} onClick={() => onToggle(market.name)}><i>{market.code}</i>{market.name}<span>{selected.includes(market.name) ? "✓" : "+"}</span></button>)}
      </div>
    </section>
  )
}
