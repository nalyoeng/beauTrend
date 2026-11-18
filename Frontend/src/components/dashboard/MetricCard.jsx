export default function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  featured = false,
}) {
  return (
    <article
      className={`metric-card ${featured ? "metric-card--featured" : ""}`}
    >
      <span className="metric-card__icon">
        <Icon size={19} />
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}
