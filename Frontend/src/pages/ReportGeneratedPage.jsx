import { useState } from "react"
import DataDisclaimer from "../components/common/DataDisclaimer"
import EmptyState from "../components/common/EmptyState"
import FullReportPreview from "../components/reports/FullReportPreview"
import ProductSelectionGrid from "../components/reports/ProductSelectionGrid"
import ReportConfigForm from "../components/reports/ReportConfigForm"
import ReportPreviewCard from "../components/reports/ReportPreviewCard"
import { reportProducts } from "../data/reportProducts"
import { exportCsv, exportPdf } from "../services/reportExport"

const reportType = "Beauty Market Trend & Opportunity Report"
const reportPeriod = "August–October 2026"

export default function ReportGeneratedPage() {
  const [country, setCountry] = useState("Cambodia")
  const [selected, setSelected] = useState(() =>
    reportProducts.slice(0, 3).map((product) => product.name),
  )
  const [generatedReport, setGeneratedReport] = useState(null)
  const [preview, setPreview] = useState(false)
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState("")
  const [dirty, setDirty] = useState(false)

  const markDirty = () => {
    if (generatedReport) setDirty(true)
  }
  const changeCountry = (value) => {
    setCountry(value)
    markDirty()
  }
  const toggleProduct = (name) => {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    )
    markDirty()
  }
  const selectProducts = (next) => {
    setSelected(next)
    markDirty()
  }
  const generate = () => {
    const products = reportProducts.filter((product) =>
      selected.includes(product.name),
    )
    if (!products.length) {
      setNotice("Select at least one product before generating a report.")
      return
    }
    setGeneratedReport({
      reportType,
      country,
      products,
      reportPeriod,
      generatedAt: new Date().toLocaleDateString(),
    })
    setDirty(false)
    setNotice(`Illustrative report generated with ${products.length} products.`)
  }
  const download = async (type) => {
    if (!generatedReport) {
      setNotice("Generate a report before downloading.")
      return
    }
    setLoading(type)
    try {
      if (type === "pdf") await exportPdf(generatedReport)
      else await exportCsv(generatedReport)
      setNotice(
        `${type === "pdf" ? "PDF" : "CSV dataset"} downloaded successfully.`,
      )
    } catch {
      setNotice("The report could not be downloaded. Please try again.")
    } finally {
      setLoading("")
    }
  }

  return (
    <div className="page-stack">
      {notice && (
        <div className="success-notice" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}
      <ReportConfigForm
        reportType={reportType}
        reportPeriod={reportPeriod}
        country={country}
        onCountry={changeCountry}
        onGenerate={generate}
        dirty={dirty}
      />
      <ProductSelectionGrid
        products={reportProducts}
        selected={selected}
        onToggle={toggleProduct}
        onAll={() =>
          selectProducts(reportProducts.map((product) => product.name))
        }
        onClear={() => selectProducts([])}
      />
      {generatedReport ? (
        <ReportPreviewCard
          country={generatedReport.country}
          count={generatedReport.products.length}
          reportType={generatedReport.reportType}
          onPreview={() => setPreview(true)}
          onPdf={() => download("pdf")}
          onCsv={() => download("csv")}
          loading={loading}
        />
      ) : (
        <EmptyState
          title="No report generated yet"
          message="Choose products and generate an illustrative beauty market report."
        />
      )}
      <DataDisclaimer>
        Interest, demand, market comparisons, outlooks, and suggested prices are
        illustrative sample guidance—not live sales, verified supplier pricing,
        or guaranteed forecasts.
      </DataDisclaimer>
      {preview && generatedReport && (
        <FullReportPreview
          report={generatedReport}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  )
}
