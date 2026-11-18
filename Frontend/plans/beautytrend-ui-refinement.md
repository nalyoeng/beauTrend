# BeautyTrend UI Refinement Plan

## Objective

Refine the existing BeautyTrend prototype without redesigning its established Deep Plum, Champagne, Blush, Ivory, and DM Sans visual system. Improve clarity for non-technical cosmetics sellers, make the Dashboard more useful for discovery, turn Trend Analysis into a distinct multi-product comparison tool, sharpen Market Comparison, simplify Reports, and align the Landing page with the actual product.

The application remains a frontend-only prototype with deterministic illustrative sample data. No backend, live search feed, or predictive model will be introduced.

## Confirmed Product Decisions

- Scope includes all five surfaces: Dashboard, Trend Analysis, Market Comparison, Reports, and Landing.
- Trend Analysis supports a maximum of five products on one chart.
- Trend Analysis requires three to five selected products, matching the intended comparison workflow and preventing a one-product “analysis” that duplicates Dashboard.
- Reports retain the existing illustrative suggested selling-price range.
- Reports remove import-cost inputs, additional-cost inputs, and gross-profit calculations from the page, full preview, PDF, and Excel.
- Use a shared visible sample-data freshness label: `Last updated: October 2026`.
- External reference links in the brief are directional inspiration only; preserve the current BeautyTrend design rather than reproducing another site.

## Current-State Findings

- Dashboard trend rows are already semantic buttons and already open a detail modal.
- The current Dashboard modal has a score, sparkline, and market scores, but does not clearly explain the percentage, identify growing countries, or provide a Cambodia-specific seller opportunity.
- The current local section is a four-market browser and is too close to Market Comparison.
- Trend Analysis currently explores one selected trend against one automatically chosen comparison trend. It has no explicit category/country/multi-product workflow and therefore does not meet its intended role.
- Market Comparison controls are present, but product and time choices do not currently alter the underlying market values. “Most popular” is assigned by array position rather than derived data.
- Reports currently expose a large editable cost table and reproduce cost/profit calculations in the preview, PDF, and Excel.
- Landing has a duplicate Dashboard/tracker feature card and its three-step copy does not match the requested product journey.
- There is no test script; repository verification commands are `pnpm format` and `pnpm build`.

## Shared Sample-Data Model

### Freshness metadata

Add a single exported constant in the trend data layer:

- `sampleDataUpdated = "October 2026"`

Use it on Dashboard and Trend Analysis indicators and wherever freshness is referenced. Keep “illustrative sample data” adjacent to the date so the date cannot be mistaken for a live-data timestamp.

### Trend interpretation fields

Extend each generated cosmetic trend with deterministic, plain-language fields:

- `whyItMatters`: category-aware explanation of why the signal is relevant.
- `cambodiaOpportunity`: cautious, category-aware opportunity for Cambodian sellers.
- `countryGrowth`: five entries for Cambodia, Malaysia, Singapore, Thailand, and South Korea, each with a relative interest score and illustrative period growth value.

Do not imply sales or guaranteed demand. Positive opportunity copy must use language such as “could,” “may,” “consider testing,” and “validate locally.”

### Plain-language change helper

Create one shared formatter/helper used wherever a trend change is presented:

- Rising: `Search interest increased 32% compared with the previous period.`
- Cooling: `Search interest decreased 14% compared with the previous period.`

Continue showing the compact signed value where useful, but pair it with or expose the full explanation in every detail view. Do not describe cooling trends as product failure.

## 1. Dashboard Refinement

### Preserve

- Side-by-side Rising Trends and Cooling Trends panels.
- Category chips and counts.
- Search.
- Small inline sparklines.
- Expand/collapse behavior.
- Modal interaction rather than navigation to Trend Analysis.

### Trend rows

- Keep every row as a full-width `<button>`.
- Preserve category, product name, leading market, sparkline, signed percentage, and affordance icon.
- Replace the ambiguous `90 days` caption under the percentage with concise contextual language such as `vs previous period`.
- Add an accessible label/title that includes the full plain-language change, so compact rows remain scannable without losing meaning.
- Ensure both rising and cooling rows use the same interaction and open the same detail modal.

### Detail modal

Refactor the existing modal into these sections:

1. **Direction and popularity**
   - Rising/Cooling badge.
   - Signed percentage.
   - Full sentence explaining comparison with the previous period.
   - Popularity/trend score with “illustrative relative interest” definition.
2. **Historical interest**
   - Existing larger historical chart/sparkline.
   - Explicit sample period label.
3. **Countries where interest is growing**
   - List or bars from `countryGrowth`, sorted by growth.
   - Show growth percentage and relative interest score separately.
   - Include Cambodia even when it is not the leading market.
4. **Why this trend matters**
   - Use `whyItMatters`.
5. **Potential for Cambodian sellers**
   - Visually distinct Cambodia callout using `cambodiaOpportunity`.
   - Include a reminder to validate local demand, price, competition, and regulations.

Accessibility behavior:

- Preserve Escape and backdrop close.
- Keep `role="dialog"`, `aria-modal`, and labelled title/description.
- Move focus into the modal on open and return focus to the triggering card on close.
- Prevent background scrolling while open.
- Keep the close button visible and keyboard reachable.

### Cambodia opportunity section

Replace the current market-tab browser with a smaller, clearly scoped section:

- Eyebrow: `Cambodia opportunity watch`
- Heading: `Asian beauty trends with potential in Cambodia.`
- Supporting copy states that these are selected Asian signals worth locally validating, not a country comparison.
- Show three or four curated rising products across different categories.
- Each compact item includes product, category, source/leading Asian market, understandable change sentence or compact change plus context, and a short Cambodia relevance line.
- Each item opens the same trend detail modal.
- Remove market tabs and the full list of market-specific results from Dashboard; Market Comparison remains the place for country-to-country analysis.

### Data update indicator

Replace “Sample signals updated weekly” with a visible two-line or segmented indicator:

- `Sample data`
- `Last updated: October 2026`

Use this shared treatment on the Dashboard intro and keep the bottom disclaimer.

## 2. Trend Analysis: Dedicated Multi-Product Comparison

### Purpose

Trend Analysis must answer: “Within one cosmetic category and one country, which selected products are gaining interest fastest?” It must not repeat Dashboard’s rising/cooling feed, individual trend modal, local opportunity cards, brand watch, or related-search discovery.

### Page structure

1. Intro with concise purpose and shared sample-data freshness indicator.
2. Comparison setup surface.
3. Multi-line comparison chart with legend.
4. Key insight card.
5. Sample-data disclaimer.

Remove the current single-trend metric cards, `BrandWatch`, related-search chips, and one-product interpretation layout from this page.

### Comparison setup

Use explicit controlled inputs:

- **Category selector:** Skincare, Makeup, Ingredients, Haircare.
- **Country selector:** Cambodia, Malaysia, Singapore, Thailand, South Korea.
- **Product selector:** checkbox/chip list filtered to the selected category.

Selection rules:

- Default category: Skincare.
- Default country: South Korea, matching the example journey.
- Default products: first three relevant skincare products, with Centella, Niacinamide, and Hyaluronic products preferred when available.
- Require three selected products and allow at most five.
- Prevent deselecting below three and prevent selecting above five.
- Display `3 of 5 selected` style feedback.
- At the limit, leave selected options active and disable only unselected options, with visible helper text explaining the limit.
- Changing category resets selection to three sensible products from the new category.
- Changing country preserves selected products and recomputes all displayed series and insights.

### Comparison data

Create a dedicated comparison-series helper/data module rather than mutating component state with ad hoc values. Given a trend/product and country, return deterministic weekly values based on the existing history plus a stable country/product adjustment. Values must remain within 0–100.

Interface:

```js
getComparisonSeries({ category, country, productIds })
// returns:
{
  points: [{ period: "W1", [productId]: 62, ... }],
  products: [{ id, name, color, latest, change }],
}
```

Use a stable five-color palette derived from the BeautyTrend design tokens, with sufficient visual distinction. Do not rely on color alone: include a legend with product names and latest scores, plus tooltip labels.

### Chart

Replace/adapt the current fixed two-line `TrendLineChart` so it accepts a dynamic `series` array and renders three to five lines.

- Y-axis label/description: illustrative relative interest index, 0–100.
- X-axis: weekly periods.
- Tooltip: product name and score.
- Legend: product name, line swatch, current score.
- Responsive height and horizontally safe mobile behavior.
- Avoid chart animation when reduced motion is requested.

### Key insight

Derive, do not hardcode:

- Highest current-interest product.
- Fastest-growing product over the displayed period.
- Plain-language comparison sentence, e.g. “Centella Serum has the highest current interest in South Korea, while Niacinamide Serum is gaining fastest.”
- Cautious action note explaining that signals are illustrative and should be locally validated.

If the same product is both highest and fastest, use a grammatically correct combined insight.

## 3. Market Comparison Refinement

### Preserve

- Product selector.
- Time selector.
- Selectable country chips.
- Horizontal bar-chart layout.
- At least one country must remain selected.
- Existing insight-card pattern and overall page structure.

### Functional data profiles

Replace the single shared market array with product-specific market profiles containing:

- `score`: relative interest index, 0–100.
- `growth`: illustrative period growth percentage.
- `status`: plain-language state.

Make time selection affect the displayed score/growth using deterministic period profiles or modifiers for 3, 6, and 12 months. Every selector must visibly change the underlying chart or interpretation.

### Chart explanation

Update heading/subtitle to explain:

- The bars compare the selected product across selected countries.
- The index is an illustrative relative interest score from 0–100.
- `100` means the strongest relative interest in this sample, not 100 people or a purchase rate.

Derive the “highest interest” marker from the maximum visible score rather than row position.

### Highlights

- Rename `What’s trending?` to `Market Highlights`.
- Add two compact derived highlights:
  - Highest-interest market.
  - Fastest-growing market.
- Each highlight shows the country, relevant metric, and a one-sentence explanation.
- Keep the existing wider insight card, but update it from the derived leader/growth data and avoid always claiming Cambodia is growing when the selected profile does not support that claim.

## 4. Reports Simplification

### Configuration

Restructure the main workflow to:

1. `Generate a Beauty Market Report` heading.
2. Report type.
3. Market.
4. Products to include.
5. `Generate Report` button clearly labelled as illustrative.

Reduce report types to a small purposeful set:

- Market Opportunity Report (default).
- Beauty Trend Summary.
- Asian Market Comparison.

Remove category chips from the configuration. Keep product cards as the product selector and show each product’s category, brand/origin, interest score, and illustrative suggested selling-price range. Default to a manageable set of three selected products rather than all products.

### Generation state

Separate draft controls from generated content:

- `draftConfig`: current report type, market, and product selection.
- `generatedReport`: immutable snapshot created by Generate.
- Preview and downloads use `generatedReport`, never partially edited draft state.
- If controls change after generation, show `Changes not included yet — generate again` and keep the last generated report available until regeneration.
- Require at least one selected product.
- Keep loading and success/error feedback for downloads.

### Remove profitability workflow

- Remove `CostInputTable` from the page.
- Remove cost state and cost mutation handlers.
- Remove import cost, additional cost, and gross-profit sections from `FullReportPreview`.
- Remove cost parameters from preview/export component interfaces.
- Remove cost/profit pages and worksheets from PDF and Excel.
- Delete the unused cost component and obsolete cost-table CSS if no imports remain.
- Retain `recommended`/`price` fields in the dataset because they power the approved illustrative suggested-price column.

### Report content

The full preview, PDF, and Excel should present the same conceptual sections:

1. **Emerging beauty trends** — selected products and concise trend direction summaries.
2. **Product popularity** — illustrative interest score, demand label, and suggested selling-price range.
3. **Asian market comparison** — concise sample market signals relevant to the selected market/products.
4. **Business opportunity insights** — cautious product opportunities and local validation steps.
5. **Illustrative outlook and limitations** — directional outlook, no guaranteed forecast, methodology/data limitations.

Update terminology from “business report” where necessary to “beauty market report.” Keep exports functional:

- PDF mirrors the five sections and includes an illustrative-data footer on every page.
- Excel includes sheets such as `Overview`, `Product Trends`, `Market Comparison`, and `Outlook & Limitations`.
- Preserve the suggested-price column in preview, PDF, and Excel and label it illustrative/unverified.
- Export file names remain market-specific.

## 5. Landing Page Alignment

### Feature cards

Replace the duplicate Dashboard/Cosmetic Trend Tracker feature structure with four distinct destinations:

- Dashboard → `/dashboard`
- Trend Analysis → `/trends`
- Market Comparison → `/comparison`
- Reports → `/reports`

Update descriptions so:

- Dashboard is discovery.
- Trend Analysis is same-category multi-product comparison.
- Market Comparison is one product across countries.
- Reports are downloadable illustrative summaries.

Keep demo startup behavior before protected navigation.

### Three-step journey

Use the requested sequence exactly in meaning:

1. Discover beauty trends.
2. Compare Asian markets.
3. Explore business opportunities.

Update the supporting question strip so it does not promise guaranteed sales or make pricing/profitability the primary product promise. Retain the strong headline, but ensure nearby copy says BeautyTrend provides signals and opportunities rather than certainty.

## Component and File Strategy

Expected primary edits:

- `src/data/beautyTrends.js`
- `src/data/marketComparison.js`
- `src/data/reportProducts.js`
- `src/pages/DashboardPage.jsx`
- `src/pages/TrendAnalysisPage.jsx`
- `src/pages/MarketComparisonPage.jsx`
- `src/pages/ReportGeneratedPage.jsx`
- `src/pages/LandingPage.jsx`
- `src/components/trends/TrendLineChart.jsx` or a renamed dynamic comparison chart
- `src/components/comparison/CountryBarChart.jsx`
- `src/components/comparison/ComparisonTable.jsx`
- `src/components/comparison/MarketInsightCard.jsx`
- `src/components/reports/ReportConfigForm.jsx`
- `src/components/reports/ProductSelectionGrid.jsx`
- `src/components/reports/FullReportPreview.jsx`
- `src/components/reports/ReportPreviewCard.jsx`
- `src/services/reportExport.js`
- `src/styles/theme.css`

Expected deletion if fully unused:

- `src/components/reports/CostInputTable.jsx`

Potentially retire unused single-trend components after import review:

- `src/components/trends/BrandWatch.jsx`
- `src/components/trends/FilterPanel.jsx`
- `src/components/trends/IngredientBadge.jsx`

Do not delete these merely because Trend Analysis changes; first verify that no other route imports them.

Prefer focused reusable helpers over a new global state layer. Keep page state local and keep serializable route state support where it already exists.

## Responsive and Accessibility Requirements

- All controls retain visible labels; do not rely on placeholders.
- Buttons, chips, and selectable cards expose selected/disabled state through native attributes or ARIA.
- Charts include accessible summaries because visual lines/bars alone are insufficient.
- Modal focus is managed and restored.
- Keyboard users can select trend rows, products, countries, report actions, and modal controls.
- Mobile layouts stack selectors and insight cards without horizontal page overflow.
- Dynamic chart legends may wrap; product names must remain readable.
- Color is never the only indicator for Rising/Cooling or chart identity.
- Respect the existing reduced-motion behavior.

## Edge Cases

- Dashboard search with no results retains the current clear-filter recovery.
- Dashboard modal handles both rising and cooling trends with correct increase/decrease grammar.
- Trend Analysis cannot fall below three or exceed five products.
- Trend Analysis category changes never retain products from another category.
- Market Comparison cannot have zero selected markets.
- Highest/fastest market derivation handles ties deterministically.
- Reports cannot generate or export with zero products.
- Report draft changes after generation cannot silently alter an existing preview/export.
- Export errors retain concise retry feedback.
- Empty product/category lists render an explanatory empty state rather than a blank chart.

## Verification

### Repository checks

- Run `pnpm format`.
- Run `pnpm build`.
- Do not start another development server; use the already supervised Make preview.

### Manual functional checks

Dashboard:

- Open rising and cooling items and verify all five modal content areas.
- Verify percentage grammar for positive and negative changes.
- Verify Escape, backdrop, close button, scroll lock, and focus return.
- Verify Cambodia opportunity cards open the same modal.
- Verify freshness label and mobile layout.

Trend Analysis:

- Reproduce the example flow: Skincare → South Korea → Centella, Niacinamide, Hyaluronic.
- Verify three lines, legend, tooltip values, and derived insight.
- Verify category reset, country recomputation, minimum three, maximum five, and limit feedback.
- Verify chart and legend at desktop and mobile widths.

Market Comparison:

- Change product and time and confirm chart, leader, fastest-growth highlight, and insight all update.
- Toggle countries and confirm leader derivation remains correct.
- Confirm one country cannot be removed.
- Confirm index explanation is visible.

Reports:

- Select products, generate, preview, download PDF, and download Excel.
- Confirm suggested prices remain.
- Confirm no cost/profit UI or export fields remain.
- Change a draft control and verify the regeneration notice.
- Inspect generated PDF sections and Excel worksheet names/content.

Landing:

- Verify each feature card opens the correct protected demo route after starting demo mode.
- Verify the three-step copy and non-guarantee language.

### Final review

- Search for stale cost/profit imports, props, CSS, and export fields.
- Search for old `What’s trending?`, ambiguous percentage captions, and duplicate Trend Analysis discovery content.
- Confirm every displayed metric is labelled as an illustrative score, percentage, suggested price, or sample signal.
