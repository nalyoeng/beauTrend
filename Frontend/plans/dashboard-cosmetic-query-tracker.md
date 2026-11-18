# BeautyTrend Dashboard Cosmetic Query Tracker

## Objective

Replace the current multi-field dashboard filtering experience with a realistic-looking cosmetic trend tracker inspired by the attached reference.

The redesigned `/dashboard` should let a non-technical beauty business user quickly:

- See which cosmetic queries are rising.
- See which cosmetic queries are cooling down.
- Search a keyword directly from the global navigation.
- Narrow the tracker by cosmetic sector.
- Open a popup with understandable detail for any tracked query.

This remains a **frontend illustrative prototype**, not a live trend-data integration. All trend values must remain clearly labeled as sample signals rather than real sales or purchase demand.

## Confirmed Product Decisions

- Replace most of the current dashboard with the tracker.
- Remove the existing dashboard country/category/product/time filter form.
- Remove the current large dashboard comparison chart.
- Keep a compact three-card summary strip above the tracker.
- Use two reference-inspired columns:
  - `Rising now`
  - `Cooling down`
- Create a broad curated catalog of approximately 72 cosmetic queries.
- Call the catalog **all tracked queries**, not “every query that could exist.”
- Use a centered popup/modal for query details.
- Add one compact cosmetic sector dropdown above the tracker.
- Show the global navigation search only on `/dashboard`.
- Navigation search provides autocomplete suggestions, filters tracker results, and opens the selected query’s detail popup.
- Preserve the existing BeautyTrend plum, blush, champagne, ivory, rounded-card, and one-font visual system.
- Do not add product photography.

## Reference Interpretation

Adapt these patterns from the attached reference image:

- Two balanced tracker panels on desktop.
- Soft tinted panel backgrounds.
- Repeated white query rows.
- Query name and short trend label on the left.
- Small sparkline in the center.
- Percentage change and popularity score on the right.
- Circular plus/details control at the far right.
- Clear green rising and muted red declining states.
- Large `See more` action at the bottom of each panel.

Do not copy the reference’s pale-blue finance styling. Translate the structure into BeautyTrend’s blush, cream, plum, champagne, green, and muted-red palette.

## Dashboard Layout

### 1. Compact Summary Strip

Keep three derived summary cards:

1. **Queries Tracked**
   - Value: total catalog count, expected to be 72.
   - Detail: `Across 9 cosmetic sectors`.
2. **Rising Now**
   - Value: dynamically derived count of positive-trend queries.
   - Detail: `Illustrative trend signals`.
3. **Leading Sector**
   - Value: sector with the highest average popularity score.
   - Detail: average score or strongest query.

Do not include country, product, time, or category dropdowns in this strip.

### 2. Tracker Toolbar

Place above the two tracker panels:

- Section heading: `Cosmetic Query Tracker`
- Supporting text: `Follow the beauty topics people are paying attention to.`
- Compact sector select:
  - All sectors
  - Skincare
  - Serum
  - Sunscreen
  - Makeup
  - Lipstick
  - Cleanser
  - Moisturizer
  - Haircare
  - Personal Care
- Result count: `72 tracked queries` or filtered count.
- Clear-search action when a navigation keyword is active.

The sector selector is the only dashboard filter control.

### 3. Rising Now Panel

Show all positive-trend queries sorted by:

1. Highest percentage change.
2. Highest popularity score as a tie-breaker.

Each row includes:

- Query name.
- Sector.
- `Rising` or `Fast rising`.
- Six-point mini sparkline.
- Positive percentage change.
- Popularity score from 0–100.
- Circular plus/details button.

Initial visible rows: 5.

`See more` behavior:

- Add 5 more rows per click.
- Button becomes `Show less` when all matching rows are visible.
- `Show less` returns to 5.

### 4. Cooling Down Panel

Show stable and declining queries sorted by:

1. Most negative percentage change.
2. Lowest popularity score as a tie-breaker.

Each row includes:

- Query name.
- Sector.
- `Cooling down`, `Declining`, or `Stable`.
- Six-point mini sparkline.
- Negative or flat percentage change.
- Popularity score from 0–100.
- Circular plus/details button.

Use muted red for declining and champagne/brown for stable.

Use the same See More/Show Less behavior as the rising panel.

### 5. Data Disclaimer

Keep the shared `DataDisclaimer` under the tracker:

> Illustrative cosmetic trend signals. They do not represent confirmed sales, customer purchases, or guaranteed demand.

## Query Detail Popup

Create an accessible centered modal named `TrendDetailModal`.

### Open Behavior

Open the popup when:

- The user clicks a query row.
- The user clicks the circular plus/details button.
- The user selects a navbar autocomplete suggestion.
- The user submits a keyword that has an exact or best matching tracked query.

### Popup Content

Header:

- Query name.
- Sector badge.
- Trend status badge.
- Close button.

Summary area:

- Popularity score: `0–100`.
- Recent percentage change.
- Current direction: Rising, Stable, or Declining.
- Last updated label: `Illustrative sample · updated today`.

Main chart:

- Six-month line chart.
- Month labels.
- Score scale 0–100.
- Use BeautyTrend plum/green for rising.
- Use muted red for declining.
- Use champagne for stable.

Business-friendly details:

- `What is happening?`
  - One short summary sentence.
- `Where is interest strongest?`
  - Top three markets shown as text/code badges.
- `Related queries`
  - Clickable keyword pills.
- `Sector`
  - Sector name and short description.

Actions:

- `Open Trend Analysis`
  - Navigate to `/trends` with route state `{ query: selectedQuery.name }`.
- `Close`

### Popup Accessibility

- Render with `role="dialog"` and `aria-modal="true"`.
- Move focus to the close button on open.
- Trap Tab/Shift+Tab inside the modal.
- Close on Escape.
- Close on backdrop click.
- Restore focus to the row/details button that opened it.
- Prevent background scrolling while open.

## Dashboard-Only Navbar Search

### Visibility

- Render the global keyword search only when `location.pathname === "/dashboard"`.
- Hide it completely on:
  - `/trends`
  - `/comparison`
  - `/reports`
  - public/auth pages

Keep notification and profile controls unchanged.

### Search Data

Search over:

- Query name.
- Sector.
- Related keywords.
- Top markets.

Matching priority:

1. Exact query-name match.
2. Query name starts with input.
3. Query name contains input.
4. Related keyword contains input.
5. Sector contains input.

### Autocomplete

- Start suggestions after 2 typed characters.
- Show at most 6 suggestions.
- Each suggestion shows:
  - Query name.
  - Sector.
  - Direction indicator.
  - Change percentage.
- Keyboard support:
  - Arrow Down/Up changes active suggestion.
  - Enter selects the active suggestion.
  - Escape closes suggestions.
- Clicking outside closes suggestions.

### URL Contract

Use query parameters so search and details support browser back/forward:

```text
/dashboard?q=centella+serum&detail=centella-serum
```

Parameters:

- `q`: active search text.
- `sector`: selected sector slug; omit for all sectors.
- `detail`: selected query ID; opens the popup.

Behavior:

- Selecting a suggestion sets `q` and `detail`.
- Submitting an exact/best match sets `q` and `detail`.
- Submitting a broad term such as `serum` sets only `q` and filters both lists.
- Closing the popup removes only `detail`; the filtered tracker remains.
- Clearing search removes `q` and `detail`.
- Changing sector preserves `q` when possible and resets panel pagination.

## Curated Query Catalog

Create `src/data/dashboardQueries.js`.

The catalog contains 72 query definitions: 8 per sector across 9 sectors.

### Skincare

1. Glass Skin
2. Barrier Repair
3. Snail Mucin
4. Heartleaf Toner
5. Rice Toner
6. Peptide Cream
7. Ceramide Cream
8. Acne Patch

### Serum

1. Centella Serum
2. Niacinamide Serum
3. Hyaluronic Acid Serum
4. Vitamin C Serum
5. Retinol Serum
6. Tranexamic Acid Serum
7. Peptide Serum
8. Propolis Serum

### Sunscreen

1. SPF50 Sunscreen
2. Korean Sunscreen
3. Sun Stick
4. Mineral Sunscreen
5. Tone-Up Sunscreen
6. Watery Sunscreen
7. Sunscreen Serum
8. Acne-Safe Sunscreen

### Makeup

1. Cushion Foundation
2. Cream Blush
3. Mascara
4. Brow Pencil
5. Setting Spray
6. Loose Powder
7. Concealer
8. Makeup Primer

### Lipstick

1. Lip Tint
2. Glossy Lip Tint
3. Matte Lipstick
4. Blur Lip
5. Lip Oil
6. Lip Liner
7. Velvet Lip
8. Long-Wear Lipstick

### Cleanser

1. Cleansing Balm
2. Cleansing Oil
3. Facial Cleanser
4. Low-pH Cleanser
5. Micellar Water
6. Foam Cleanser
7. Powder Wash
8. Enzyme Cleanser

### Moisturizer

1. Gel Moisturizer
2. Barrier Cream
3. Cica Cream
4. Sleeping Mask
5. Lightweight Moisturizer
6. Oil-Free Moisturizer
7. Snail Cream
8. Panthenol Cream

### Haircare

1. Rosemary Oil
2. Scalp Serum
3. Hair Mask
4. Anti-Hair-Loss Shampoo
5. Bond Repair
6. Leave-In Conditioner
7. Hair Tonic
8. Heat Protectant

### Personal Care

1. Body Sunscreen
2. Body Lotion
3. Deodorant
4. Body Scrub
5. Hand Cream
6. Feminine Wash
7. Body Mist
8. Lip Balm

## Query Data Model

Each query record must have:

```js
{
  id: "centella-serum",
  name: "Centella Serum",
  sector: "Serum",
  direction: "rising", // rising | stable | declining
  statusLabel: "Fast rising",
  changePercent: 28.4,
  score: 92,
  history: [
    { month: "May", score: 48 },
    { month: "Jun", score: 55 },
    { month: "Jul", score: 63 },
    { month: "Aug", score: 72 },
    { month: "Sep", score: 83 },
    { month: "Oct", score: 92 }
  ],
  topMarkets: ["South Korea", "Thailand", "Cambodia"],
  relatedQueries: ["Cica serum", "Skin1004", "Soothing serum"],
  summary: "Interest is increasing as shoppers look for soothing and barrier-support skincare.",
  sectorDescription: "Serums focused on concentrated skincare ingredients and targeted concerns."
}
```

### Stable Sample Generation

Use deterministic records committed to source control.

Do not:

- Generate random values at runtime.
- Change values after refresh.
- Claim the values are live.

It is acceptable to use a deterministic helper in the data file to build repeated fields from explicit query definitions, but every visible query name and its direction must be defined in source.

Target distribution:

- Approximately 45–50 rising queries.
- Approximately 8–12 stable queries.
- Approximately 14–18 declining queries.

Ensure every sector has both rising and cooling examples so sector filtering never creates a misleading empty column without a valid explanation.

## Component Changes

### Add

```text
src/
├── components/
│   └── dashboard/
│       ├── DashboardSummary.jsx
│       ├── TrendTrackerBoard.jsx
│       ├── TrendTrackerPanel.jsx
│       ├── TrendQueryCard.jsx
│       ├── TrendSparkline.jsx
│       ├── TrendDetailModal.jsx
│       └── SectorSelect.jsx
└── data/
    └── dashboardQueries.js
```

### Update

- `src/pages/DashboardPage.jsx`
  - Remove current filter state.
  - Remove `DashboardFilters`.
  - Remove large `TrendLineChart`.
  - Remove current `ProductRanking` and `RecentActivity` sections.
  - Read dashboard state from `useSearchParams`.
  - Derive summary metrics, rising list, cooling list, and selected popup query.
- `src/components/common/Navbar.jsx`
  - Show search only on `/dashboard`.
  - Import/query the dashboard catalog.
  - Add autocomplete and keyboard interaction.
  - Set dashboard URL search parameters.
- `src/styles/theme.css`
  - Remove obsolete dashboard filter/grid/ranking styles if unused elsewhere.
  - Add tracker panel, query row, sparkline, autocomplete, modal, sector selector, and responsive styles.
- `src/components/common/DataDisclaimer.jsx`
  - No API change required.

### Remove if No Longer Used

- `src/components/dashboard/DashboardFilters.jsx`
- `src/components/dashboard/ProductRanking.jsx`
- `src/components/dashboard/RecentActivity.jsx`

Keep `MetricCard.jsx` only if `DashboardSummary.jsx` composes it. Otherwise replace it with the summary component and delete the unused file.

## Lightweight Sparkline Implementation

Use a small inline SVG component for query row sparklines rather than rendering 72 Recharts instances.

`TrendSparkline` responsibilities:

- Accept six numeric values.
- Normalize points to the SVG view box.
- Draw a single polyline.
- Optional soft area fill.
- Use direction color:
  - Rising: green/plum.
  - Stable: champagne.
  - Declining: muted red.
- Mark the latest point.
- Include an accessible label such as:
  - `Centella Serum trend rose from 48 to 92 over six months`.

Use Recharts only inside the detail popup where a larger chart benefits from axes and tooltips.

## Derived State and Data Flow

`DashboardPage` should:

1. Load `dashboardQueries`.
2. Read `q`, `sector`, and `detail` from `useSearchParams`.
3. Filter by selected sector.
4. Apply keyword matching.
5. Split into:
   - `risingQueries`
   - `coolingQueries`
6. Sort each list.
7. Compute summary values from the currently sector-filtered catalog, not only visible pagination.
8. Pass rows to `TrendTrackerBoard`.
9. Resolve `detail` to a query and render `TrendDetailModal`.

Local UI state:

- `risingVisibleCount`, initially 5.
- `coolingVisibleCount`, initially 5.
- References to the last details trigger for focus restoration.

Reset both visible counts to 5 when `q` or `sector` changes.

## Empty and Edge States

### No Search Results

If no query matches:

- Show the shared `EmptyState` across the tracker area.
- Title: `No tracked query matches “{q}”`.
- Message: `Try a broader keyword such as serum, sunscreen, lipstick, or skincare.`
- Action: `Clear search`.

### One Empty Direction Column

If a valid sector/search has only rising or only cooling results:

- Keep the two-column structure.
- Show a compact empty state in the empty panel.
- Explain that no sample signals currently match that direction.

### Invalid URL Parameters

- Unknown sector: fall back to `All sectors`.
- Unknown detail ID: remove or ignore `detail`; do not crash.
- Empty `q`: treat as no search.

### Search on Other Routes

- Do not render the search input.
- Do not redirect searches from Trends, Comparison, or Reports.
- If a user navigates away with dashboard query parameters, normal routing should discard them.

### Catalog Semantics

- Display `All tracked queries`, not `All possible cosmetic queries`.
- Avoid claims such as `live`, `real-time`, `actual demand`, or `purchase intent`.
- Use `Popularity score`, `Illustrative change`, and `Sample trend`.

## Responsive Behavior

Desktop:

- Two equal tracker columns.
- Query row has five regions: title, sparkline, percentage, score, details button.

Tablet:

- Keep two columns while space permits.
- Reduce sparkline width and move sector beneath query name.

Mobile:

- Stack `Rising now` above `Cooling down`.
- Query card uses:
  - Top row: name, direction, details button.
  - Bottom row: sparkline, change, score.
- Search remains hidden under the current mobile navbar rule unless a dashboard search button opens a full-width search field.
- For dashboard mobile, add a search icon button that expands the keyword input below the header.
- Detail popup becomes a full-height bottom sheet/full-screen dialog.

## Visual Styling

Use existing theme variables only.

Tracker panels:

- Rising panel: very light blush/ivory gradient.
- Cooling panel: soft cream/pink-gray gradient.
- Thin borders.
- Soft shadow.
- Large rounded corners.

Query rows:

- White/ivory surface.
- 10–12px radius.
- Thin subtle border.
- Clear hover and keyboard focus.
- No product images.

Trend colors:

- Rising: existing success green and plum.
- Declining: existing muted danger red.
- Stable: champagne/warning brown.

Popup:

- White surface.
- Plum heading.
- Champagne highlights.
- Soft blush chart area.
- No technical terms such as confidence interval, regression, or algorithm.

## Accessibility

- Query rows are buttons or contain one clearly named details button, not nested interactive controls.
- Details control label: `View details for {query name}`.
- Sector select has a visible label.
- Autocomplete uses combobox/listbox semantics:
  - `role="combobox"`
  - `aria-expanded`
  - `aria-controls`
  - `aria-activedescendant`
- Suggestion rows use `role="option"`.
- Sparkline has an accessible text description.
- Trend direction is conveyed with text and icon, not color alone.
- See More buttons announce the target panel.
- Modal follows the focus/keyboard rules above.
- Respect `prefers-reduced-motion`.

## Verification

### Commands

Run:

1. `pnpm format`
2. `pnpm build`

Do not start another development server.

### Functional Checks

- `/dashboard` renders without the old filter form.
- The large old dashboard chart is removed.
- Three summary values derive from the query catalog.
- Rising and cooling lists sort correctly.
- Sector dropdown filters both lists.
- See More adds rows independently per panel.
- Show Less resets each panel.
- Clicking any query opens its popup.
- Escape, close button, and backdrop close the popup.
- Modal focus is trapped and restored.
- Related keyword pills update dashboard search and selected detail.
- `Open Trend Analysis` navigates to `/trends` with the query.
- Navbar search appears only on `/dashboard`.
- Navbar autocomplete matches name, related keywords, sector, and markets.
- Keyboard autocomplete behavior works.
- Selecting a suggestion filters the tracker and opens the popup.
- Broad search filters without forcing a wrong exact match.
- Back/forward navigation restores search and popup state.
- No-result and one-empty-column states render correctly.

### Visual Checks

At 1536px desktop:

- Two tracker panels are balanced and resemble the reference structure.
- Five initial rows fit without crowding.
- Query names, change values, and scores are quickly scannable.
- Details controls align consistently.
- BeautyTrend branding remains intact.

At tablet and mobile:

- No horizontal page overflow.
- Rows remain readable.
- Mobile search can expand from the navbar.
- Popup becomes appropriately full-screen/bottom-sheet style.

### Source Audit

Confirm:

- No imports or uses of `DashboardFilters`.
- No stale dashboard filter/grid CSS remains unless used elsewhere.
- Navbar search is gated to `/dashboard`.
- Exactly 72 tracked query definitions exist.
- Every sector has rising and cooling examples.
- No runtime randomization is used.
- No product images are introduced.

## Acceptance Criteria

- The dashboard no longer asks users to fill four filter slots.
- The dashboard’s primary experience is a query tracker inspired by the attachment.
- All 72 curated cosmetic queries are searchable and browsable.
- Rising and cooling trends are clearly separated.
- Every query opens a business-friendly detail popup.
- A sector dropdown filters the tracker.
- The navigation search works only on the dashboard.
- Autocomplete search filters and opens matching query details.
- The dashboard uses only illustrative sample trend language.
- Existing Trends, Market Comparison, Reports, authentication, and routing behavior remain unchanged.
- `pnpm format` and `pnpm build` pass.
