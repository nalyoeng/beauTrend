export default function ComparisonTable({ leader, fastest }) {
  return (
    <section className="surface comparison-status">
      <span className="eyebrow-label">At a glance</span>
      <h2>Market Highlights</h2>
      <div className="market-highlight-row">
        <i>{leader.code}</i>
        <div>
          <span>Highest interest</span>
          <strong>{leader.name}</strong>
          <small>Relative interest index: {leader.score}/100</small>
        </div>
      </div>
      <div className="market-highlight-row">
        <i>{fastest.code}</i>
        <div>
          <span>Fastest growing</span>
          <strong>{fastest.name}</strong>
          <small>Interest increased {fastest.growth}% in this period</small>
        </div>
      </div>
    </section>
  )
}
