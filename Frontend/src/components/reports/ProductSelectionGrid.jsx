import EmptyState from "../common/EmptyState"

export default function ProductSelectionGrid({
  products,
  selected,
  onToggle,
  onAll,
  onClear,
}) {
  return (
    <section className="surface">
      <div className="section-heading">
        <div>
          <h2>Product Selection</h2>
          <p>{selected.length} products selected</p>
        </div>
        <div className="inline-actions">
          <button className="text-button" onClick={onAll}>
            Select all
          </button>
          <button className="text-button" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>
      {products.length ? (
        <div className="product-selection-grid">
          {products.map((product) => (
            <button
              className={selected.includes(product.name) ? "active" : ""}
              key={product.name}
              onClick={() => onToggle(product.name)}
            >
              <span className="product-mark" />
              <div>
                <strong>{product.name}</strong>
                <small>
                  {product.brand} · {product.origin}
                </small>
                <em>
                  Interest {product.interest}/100 · Suggested {product.price}
                </em>
              </div>
              <b>{selected.includes(product.name) ? "✓" : "+"}</b>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="No products in these categories" />
      )}
    </section>
  )
}
