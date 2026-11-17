export const popularMarkets = [
  { name: "South Korea", code: "KR" },
  { name: "Thailand", code: "TH" },
  { name: "Vietnam", code: "VN" },
  { name: "Japan", code: "JP" },
  { name: "Cambodia", code: "KH" },
]

export const comparisonProducts = [
  "Centella Serum",
  "Hyaluronic Serum",
  "Niacinamide Serum",
  "Glossy Lip Tint",
  "Sunscreen SPF50+",
]

const baseScores = [92, 81, 74, 68, 61]
const baseGrowth = [8, 14, 12, 5, 11]
const timeFactors = {
  "Last 3 months": { score: 0, growth: 1.25 },
  "Last 6 months": { score: -2, growth: 1 },
  "Last 12 months": { score: -5, growth: 0.75 },
}

export function getMarketComparison(product, time) {
  const productIndex = Math.max(0, comparisonProducts.indexOf(product))
  const factor = timeFactors[time] || timeFactors["Last 6 months"]

  return popularMarkets.map((market, marketIndex) => {
    const rotatedIndex = (marketIndex + productIndex) % popularMarkets.length
    const score = Math.max(
      35,
      Math.min(
        98,
        baseScores[rotatedIndex] +
          factor.score +
          ((productIndex + marketIndex) % 3) * 2,
      ),
    )
    const growth = Math.max(
      1,
      Math.round(
        (baseGrowth[(marketIndex + productIndex * 2) % baseGrowth.length] +
          (productIndex % 3)) *
          factor.growth,
      ),
    )

    return {
      ...market,
      score,
      growth,
      status: growth >= 14 ? "Fast rising" : growth >= 9 ? "Growing" : "Stable",
    }
  })
}
