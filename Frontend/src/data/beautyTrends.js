const catalog = {
  Skincare: [
    "Centella Serum",
    "Barrier repair cream",
    "Rice water toner",
    "Snail mucin essence",
    "Milky hydrating toner",
    "Glass skin routine",
    "Cica sleeping mask",
    "Low pH cleanser",
    "Niacinamide Serum",
    "Hyaluronic Acid Serum",
    "Ceramide moisturizer",
    "Hydrogel face mask",
    "Bakuchiol night cream",
    "Propolis glow serum",
    "Cleansing balm",
    "Microbiome skincare",
    "Collagen sheet mask",
    "Vitamin C essence",
  ],
  Makeup: [
    "Blurred lip tint",
    "Skin tint cushion",
    "Jelly blush",
    "Brown tubing mascara",
    "Glass lip gloss",
    "Soft matte cushion",
    "Under-eye brightener",
    "Cream contour stick",
    "Waterproof brow gel",
    "Tone-up makeup base",
    "Lavender setting powder",
    "Lip mud",
    "Dewy highlighter balm",
    "Graphic eyeliner",
    "Monochrome makeup",
    "Velvet lip cream",
    "Color correcting palette",
    "Powder blush",
  ],
  Ingredients: [
    "PDRN skincare",
    "Exosome serum",
    "Heartleaf extract",
    "Mugwort essence",
    "Tranexamic acid",
    "Ectoin moisturizer",
    "Azelaic acid",
    "Salmon DNA facial",
    "Fermented rice extract",
    "Peptide complex",
    "Niacinamide",
    "Centella asiatica",
    "Ceramide complex",
    "Glutathione skincare",
    "Hyaluronic acid",
    "Yuzu extract",
    "Retinal serum",
    "Probiotic skincare",
  ],
  Haircare: [
    "Scalp cooling tonic",
    "Hair perfume mist",
    "Rosemary scalp oil",
    "Bond repair treatment",
    "Glossing hair mask",
    "Anti-humidity spray",
    "Rice water shampoo",
    "Scalp exfoliating scrub",
    "Leave-in hair milk",
    "Hair growth serum",
    "Camellia hair oil",
    "Silk bonnet routine",
    "Root volume powder",
    "Heatless curls",
    "Purple toning mask",
    "Keratin water treatment",
    "Scalp microbiome care",
    "Solid shampoo bar",
  ],
}

const markets = ["Malaysia", "Singapore", "Thailand", "South Korea"]
export const comparisonMarkets = ["Cambodia", ...markets]
export const sampleDataUpdated = "October 2026"
const risingSeeds = [61, 65, 68, 72, 76, 80, 84, 88, 92]
const coolingSeeds = [70, 68, 65, 61, 58, 54, 50, 47, 43]

const categoryMeaning = {
  Skincare:
    "This signal reflects growing interest in routines that support hydration, comfort, and visible skin health.",
  Makeup:
    "This signal points to a format or finish shoppers may be actively looking for in new color-cosmetic launches.",
  Ingredients:
    "Ingredient-led searches can reveal what benefits beauty shoppers are researching before choosing a product.",
  Haircare:
    "This signal reflects changing interest in scalp health, hair repair, and easy at-home care routines.",
}

const cambodiaMeaning = {
  Skincare:
    "Consider testing lightweight formats, clear benefit-led education, and travel sizes suited to Cambodia’s warm climate.",
  Makeup:
    "Consider a small test range with humid-weather wear claims and shades validated with Cambodian customers.",
  Ingredients:
    "Use simple Khmer-friendly education and test whether the claimed benefit matches a locally understood skin concern.",
  Haircare:
    "Test a focused assortment and validate texture, fragrance, and routine fit with Cambodian customers before scaling.",
}

export function formatTrendChange(trend) {
  const amount = trend.change.replace(/[+-]/, "")
  return `Search interest ${
    trend.signal === "rising" ? "increased" : "decreased"
  } ${amount} compared with the previous period.`
}

const marketNotes = {
  Malaysia:
    "Hydration, barrier care and heat-friendly textures are attracting attention.",
  Singapore:
    "High-performance ingredients and lightweight, humid-climate formats lead.",
  Thailand:
    "Long-wear color, cooling care and brightening searches show momentum.",
  "South Korea":
    "Ingredient-led innovation and new sensorial formats are emerging fastest.",
}

export const cosmeticTrends = Object.entries(catalog).flatMap(
  ([category, names], categoryIndex) =>
    names.map((name, index) => {
      const rising = index < 9
      const market = markets[(index + categoryIndex) % markets.length]
      const shift = ((index * 3 + categoryIndex * 5) % 13) + 7
      const base = rising ? risingSeeds : coolingSeeds
      const history = base.map((value, point) =>
        Math.max(
          20,
          Math.min(98, value + ((index + point + categoryIndex) % 5) - 2),
        ),
      )

      return {
        id: `${category.toLowerCase()}-${index + 1}`,
        name,
        category,
        signal: rising ? "rising" : "cooling",
        change: `${rising ? "+" : "-"}${shift}%`,
        score: history.at(-1),
        market,
        history,
        whyItMatters: categoryMeaning[category],
        cambodiaOpportunity: cambodiaMeaning[category],
        summary: rising
          ? `${name} is gaining search attention, led by shoppers in ${market}.`
          : `${name} remains relevant, but recent search attention is easing from its previous peak.`,
        marketScores: markets.map((country, marketIndex) => ({
          country,
          score: Math.max(
            38,
            Math.min(
              96,
              history.at(-1) -
                ((marketIndex - markets.indexOf(market) + 4) % 4) * 7,
            ),
          ),
        })),
        countryGrowth: comparisonMarkets.map((country, marketIndex) => {
          const distance =
            (marketIndex - comparisonMarkets.indexOf(market) + 5) % 5
          return {
            country,
            score: Math.max(36, Math.min(98, history.at(-1) - distance * 6)),
            growth: rising
              ? Math.max(4, shift - distance * 2)
              : -Math.max(1, Math.round(shift / 3) - distance),
          }
        }),
      }
    }),
)

export const trendCategories = ["All trends", ...Object.keys(catalog)]

export const trendMarkets = markets.map((name) => ({
  name,
  code:
    name === "South Korea"
      ? "KR"
      : name === "Malaysia"
        ? "MY"
        : name === "Singapore"
          ? "SG"
          : "TH",
  note: marketNotes[name],
}))

const countryOffsets = {
  Cambodia: -4,
  Malaysia: 1,
  Singapore: 4,
  Thailand: 2,
  "South Korea": 7,
}

export function getComparisonSeries({ country, productIds }) {
  const products = productIds
    .map((id) => cosmeticTrends.find((trend) => trend.id === id))
    .filter(Boolean)
    .map((trend, productIndex) => {
      const countrySignal = trend.countryGrowth.find(
        (item) => item.country === country,
      )
      const values = trend.history.map((value, pointIndex) =>
        Math.max(
          0,
          Math.min(
            100,
            value +
              countryOffsets[country] +
              ((productIndex + pointIndex) % 3) -
              1,
          ),
        ),
      )
      return {
        id: trend.id,
        name: trend.name,
        latest: values.at(-1),
        change: values.at(-1) - values[0],
        countryGrowth: countrySignal?.growth || 0,
        values,
      }
    })

  return {
    products,
    points: Array.from({ length: 9 }, (_, index) => ({
      period: `W${index + 1}`,
      ...Object.fromEntries(
        products.map((product) => [product.id, product.values[index]]),
      ),
    })),
  }
}

// Kept for report and comparison surfaces that use the existing sample ranking.
export const dashboardProducts = [
  ["Centella Serum", "92%", "Fast rising"],
  ["Hyaluronic Serum", "68%", "Rising in Korea"],
  ["Niacinamide Serum", "54%", "Rising in Korea"],
]
