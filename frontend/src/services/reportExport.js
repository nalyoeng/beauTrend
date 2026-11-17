import { getMarketComparison } from "../data/marketComparison.js"

function fileName(country, extension) {
  return `BeautyTrend-${country}-Trend-Opportunity-Report.${extension}`
}

const chartColors = [
  [59, 31, 58],
  [196, 124, 104],
  [89, 123, 112],
  [164, 123, 66],
  [123, 101, 143],
]

export async function exportPdf({
  reportType,
  country,
  products,
  generatedAt,
  reportPeriod,
}) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])
  const autoTable = autoTableModule.default
  const doc = new jsPDF()
  const ranked = [...products].sort((a, b) => b.interest - a.interest)
  const top = ranked[0]
  const fastestProduct = [...products].sort((a, b) => b.growth - a.growth)[0]
  const marketRows = getMarketComparison(top.name, "Last 3 months")
  const leader = [...marketRows].sort((a, b) => b.score - a.score)[0]
  const fastestMarket = [...marketRows].sort((a, b) => b.growth - a.growth)[0]
  const categories = [...new Set(products.map((product) => product.category))]

  const header = (section, page) => {
    doc.setFillColor(59, 31, 58)
    doc.rect(0, 0, 210, 24, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text("BeautyTrend", 14, 15)
    doc.setFontSize(8)
    doc.text(`BEAUTY INDUSTRY INTELLIGENCE · ${page}/7`, 196, 15, {
      align: "right",
    })
    doc.setTextColor(59, 31, 58)
    doc.setFontSize(18)
    doc.text(section, 14, 39)
  }
  const footer = () => {
    doc.setFontSize(7)
    doc.setTextColor(120, 105, 114)
    doc.text(
      "Illustrative sample signals and prices—not live sales, verified demand, or guaranteed outcomes.",
      14,
      289,
    )
  }
  const addPage = (section, page) => {
    if (page > 1) doc.addPage()
    header(section, page)
  }

  addPage(reportType, 1)
  doc.setTextColor(75, 66, 71)
  doc.setFontSize(10)
  doc.text(
    `${country} Market · Asian Beauty Trends\nReport period: ${reportPeriod}\nGenerated: ${generatedAt}\nCategories: ${categories.join(", ")}`,
    14,
    54,
  )
  autoTable(doc, {
    startY: 83,
    head: [["Products analyzed", "Markets compared", "Target market"]],
    body: [[products.length, marketRows.length, country]],
    theme: "grid",
    headStyles: { fillColor: [216, 185, 138], textColor: [59, 31, 58] },
    styles: { halign: "center", cellPadding: 7 },
  })
  doc.setTextColor(59, 31, 58)
  doc.setFontSize(13)
  doc.text("01 · Executive Summary", 14, 132)
  doc.setTextColor(75, 66, 71)
  doc.setFontSize(9)
  doc.text(
    `This report highlights emerging cosmetic trends across selected Asian markets and identifies products that may present potential opportunities for ${country} cosmetics sellers. ${top.name} has the highest relative interest among the selected products.`,
    14,
    145,
    { maxWidth: 180 },
  )
  footer()

  addPage("02 · Emerging Beauty Trends", 2)
  autoTable(doc, {
    startY: 48,
    head: [
      [
        "Product",
        "Status",
        "Category",
        "Origin",
        "Interest",
        "Growth",
        "Suggested price",
      ],
    ],
    body: ranked.map((product) => [
      product.name,
      product.trendStatus,
      product.category,
      product.origin,
      `${product.interest}/100`,
      `${product.growth > 0 ? "+" : ""}${product.growth}%`,
      product.price,
    ]),
    styles: { fontSize: 7.5, cellPadding: 3 },
    headStyles: { fillColor: [91, 52, 81] },
    alternateRowStyles: { fillColor: [250, 245, 247] },
  })
  footer()

  addPage("03 · Product Trend Analysis", 3)
  doc.setTextColor(75, 66, 71)
  doc.setFontSize(8)
  doc.text(
    "Illustrative relative interest index across seven sample periods.",
    14,
    49,
  )
  const chart = { x: 18, y: 62, width: 174, height: 82 }
  doc.setDrawColor(232, 225, 220)
  ;[25, 50, 75].forEach((value) => {
    const y = chart.y + chart.height - (value / 100) * chart.height
    doc.line(chart.x, y, chart.x + chart.width, y)
  })
  products.forEach((product, productIndex) => {
    const color = chartColors[productIndex % chartColors.length]
    doc.setDrawColor(...color)
    doc.setLineWidth(0.8)
    product.history.slice(1).forEach((value, pointIndex) => {
      const previous = product.history[pointIndex]
      const x1 =
        chart.x + (pointIndex / (product.history.length - 1)) * chart.width
      const x2 =
        chart.x +
        ((pointIndex + 1) / (product.history.length - 1)) * chart.width
      const y1 = chart.y + chart.height - (previous / 100) * chart.height
      const y2 = chart.y + chart.height - (value / 100) * chart.height
      doc.line(x1, y1, x2, y2)
    })
    doc.setTextColor(...color)
    doc.setFontSize(7)
    doc.text(product.name, 18 + productIndex * 36, 154, { maxWidth: 34 })
  })
  doc.setFillColor(250, 245, 247)
  doc.roundedRect(14, 174, 182, 42, 3, 3, "F")
  doc.setTextColor(156, 118, 87)
  doc.setFontSize(8)
  doc.text("TOP TREND TAKEAWAY", 19, 186)
  doc.setTextColor(59, 31, 58)
  doc.setFontSize(10)
  doc.text(
    `${top.name} has the highest current interest at ${top.interest}/100, while ${fastestProduct.name} shows the strongest sample growth.`,
    19,
    198,
    { maxWidth: 170 },
  )
  footer()

  addPage("04 · Asian Market Comparison", 4)
  autoTable(doc, {
    startY: 48,
    head: [["Rank", "Market", "Interest index", "Sample growth", "Status"]],
    body: [...marketRows]
      .sort((a, b) => b.score - a.score)
      .map((market, index) => [
        index + 1,
        market.name,
        `${market.score}/100`,
        `+${market.growth}%`,
        market.status,
      ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [91, 52, 81] },
  })
  doc.setFillColor(250, 245, 247)
  doc.roundedRect(14, 145, 182, 42, 3, 3, "F")
  doc.setTextColor(156, 118, 87)
  doc.setFontSize(8)
  doc.text("MARKET INSIGHTS", 19, 157)
  doc.setTextColor(59, 31, 58)
  doc.setFontSize(10)
  doc.text(
    `${leader.name} has the highest relative interest, while ${fastestMarket.name} shows the fastest growth in this sample.`,
    19,
    169,
    { maxWidth: 170 },
  )
  footer()

  addPage("05 · Cambodia Business Opportunities", 5)
  doc.setFontSize(10)
  doc.setTextColor(65, 58, 62)
  const opportunities = [
    `Monitor growing interest in ${top.name} and related ${top.category.toLowerCase()} searches.`,
    "Explore clear product positioning for Cambodian cosmetics customers.",
    "Start with a small assortment and compare customer feedback with local competitors.",
    "Validate supplier quality, regulations, and current retail prices before scaling.",
  ]
  opportunities.forEach((item, index) => {
    doc.setFillColor(index % 2 ? 250 : 247, 243, 240)
    doc.roundedRect(14, 51 + index * 39, 182, 30, 3, 3, "F")
    doc.setTextColor(59, 31, 58)
    doc.text(`${index + 1}`, 21, 69 + index * 39)
    doc.setTextColor(65, 58, 62)
    doc.text(item, 33, 62 + index * 39, { maxWidth: 155 })
  })
  footer()

  addPage("06 · Suggested Price Reference", 6)
  autoTable(doc, {
    startY: 48,
    head: [["Product", "Suggested retail price", "Currency"]],
    body: ranked.map((product) => [product.name, product.price, "USD"]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [91, 52, 81] },
    alternateRowStyles: { fillColor: [250, 245, 247] },
  })
  doc.setTextColor(75, 66, 71)
  doc.setFontSize(8)
  doc.text(
    "Illustrative guidance only—not verified supplier quotations or current market prices.",
    14,
    doc.lastAutoTable.finalY + 13,
  )
  footer()

  addPage("07 · Data Limitations", 7)
  doc.setFillColor(250, 245, 247)
  doc.roundedRect(14, 49, 182, 48, 3, 3, "F")
  doc.setTextColor(65, 58, 62)
  doc.setFontSize(9)
  doc.text(
    "All trend scores, growth percentages, comparisons, and suggested prices in this prototype are illustrative sample signals. They do not represent actual sales, verified consumer demand, or guaranteed purchasing behavior.",
    20,
    63,
    { maxWidth: 168 },
  )
  doc.text(
    "• Search-interest signals may not become purchases.\n• Scores and rankings are deterministic demonstration data.\n• Suggested prices require local and supplier verification.\n• Customer preferences, competition, and regulations can change.",
    18,
    119,
    { lineHeightFactor: 1.8 },
  )
  footer()
  doc.save(fileName(country, "pdf"))
}

function escapeCsv(value) {
  const text = String(value ?? "")
  return `"${text.replaceAll('"', '""')}"`
}

export function buildCsv({ country, products, reportPeriod, generatedAt }) {
  const headers = [
    "Report Period",
    "Generated",
    "Target Market",
    "Product",
    "Category",
    "Origin",
    "Trend Status",
    "Interest Score",
    "Interest Change %",
    "Compared Country",
    "Country Interest Index",
    "Country Growth %",
    "Suggested Price Range",
    "Currency",
    "Data Note",
  ]
  const rows = products.flatMap((product) =>
    getMarketComparison(product.name, "Last 3 months").map((market) => [
      reportPeriod,
      generatedAt,
      country,
      product.name,
      product.category,
      product.origin,
      product.trendStatus,
      product.interest,
      product.growth,
      market.name,
      market.score,
      market.growth,
      product.price,
      "USD",
      "Illustrative sample data; not verified demand or pricing.",
    ]),
  )
  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n")
}

export function exportCsv(report) {
  const blob = new Blob([buildCsv(report)], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName(report.country, "csv")
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
