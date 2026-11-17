export default function PageHeader({
  eyebrow = "BeautyTrend intelligence",
  title,
  subtitle,
  actions,
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow-label">{eyebrow}</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-heading__actions">{actions}</div>}
    </div>
  )
}
