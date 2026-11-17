import { Download, Eye, LoaderCircle } from "lucide-react"

export default function ReportPreviewCard({
  country,
  count,
  reportType,
  onPreview,
  onPdf,
  onCsv,
  loading,
}) {
  return (
    <section className="surface report-ready">
      <div>
        <span className="eyebrow-label">Report ready</span>
        <h2>
          {country} {reportType}
        </h2>
        <p>{count} products · Suggested prices included · Generated today</p>
      </div>
      <div className="report-actions">
        <button className="button button--outline" onClick={onPreview}>
          <Eye size={16} /> View Full Report
        </button>
        <button
          className="button button--outline"
          onClick={onPdf}
          disabled={loading}
        >
          {loading === "pdf" ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Download size={16} />
          )}{" "}
          Download PDF
        </button>
        <button
          className="button button--primary"
          onClick={onCsv}
          disabled={loading}
        >
          {loading === "csv" ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Download size={16} />
          )}{" "}
          Download CSV
        </button>
      </div>
    </section>
  )
}
