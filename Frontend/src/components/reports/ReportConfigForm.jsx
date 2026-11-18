import { FileText } from "lucide-react"

export default function ReportConfigForm({
  reportType,
  reportPeriod,
  country,
  onCountry,
  onGenerate,
  dirty,
}) {
  return (
    <section className="surface report-config">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Illustrative report builder</span>
          <h2>Generate a Beauty Market Report</h2>
          <p>
            Choose a report focus and target market, then select the products
            you want to include.
          </p>
        </div>
        {dirty && (
          <span className="report-dirty-note">
            Changes not included yet—generate again
          </span>
        )}
      </div>
      <div className="report-form-grid report-form-grid--simple">
        <div className="report-readonly-field">
          <span>Report type</span>
          <strong>{reportType}</strong>
        </div>
        <label>
          <span>Market</span>
          <select
            value={country}
            onChange={(event) => onCountry(event.target.value)}
          >
            {["Cambodia", "Thailand", "Vietnam", "South Korea", "Japan"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </label>
        <div className="report-readonly-field">
          <span>Report period</span>
          <strong>{reportPeriod}</strong>
        </div>
      </div>
      <button
        className="button button--primary report-generate"
        onClick={onGenerate}
      >
        <FileText size={17} /> Generate Report (illustrative)
      </button>
    </section>
  )
}
