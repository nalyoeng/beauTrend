export default function CountryBarChart({ markets, product, time, leader }) {
  return (
    <section className="surface country-bars-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Country popularity · {time}</span>
          <h2>{product} popularity by country</h2>
          <p>
            Illustrative relative interest index from 0–100. A larger bar means
            stronger interest within this product sample—not a number of people
            or purchases.
          </p>
        </div>
      </div>
      <div className="country-bars">
        {markets.map((market) => (
          <div className="country-bar-row" key={market.name}>
            <div>
              <i>{market.code}</i>
              <strong>{market.name}</strong>
              {market.name === leader && <small>Highest interest</small>}
            </div>
            <span>
              <i style={{ width: `${market.score}%` }} />
            </span>
            <b>{market.score}</b>
          </div>
        ))}
      </div>
    </section>
  )
}
