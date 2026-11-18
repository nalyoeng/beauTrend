# BeautyTrend Dashboard Trend-Discovery Redesign

## Objective

Redesign `/dashboard` so users immediately see what is rising, what is cooling, and which trends are gaining attention in key Asian markets.

The dashboard should no longer require users to choose a country, category, product, and time period before seeing useful information.

The primary experience becomes:

1. Read today’s trend signals.
2. Browse Rising Trends.
3. Browse Cooling Trends.
4. Discover trends by market.
5. Click any trend card to open a simple detail popup.

This remains a **frontend illustrative prototype**. It must not claim live market data, confirmed sales, customer purchases, or guaranteed demand.

## Confirmed Decisions

- Keep BeautyTrend’s current plum, cream, blush, champagne, rounded-card, and single-font branding.
- Keep the sidebar navigation pattern.
- Remove the large dashboard filter form.
- Remove the Apply Filters button.
- Remove the large single-product dashboard chart.
- Remove the current Trending Product, Market Growth, and Total Searches cards.
- Replace them with four tracker summary cards.
- Keep the navbar keyword search, but show and use it only on `/dashboard`.
- Use category tabs rather than a sector dropdown:
  - All trends
  - Skincare
  - Makeup
  - Ingredients
  - Haircare
- Use two main trend panels:
  - Rising Trends
  - Cooling Trends
- Add a separate Discover by Market section.
- Discover by Market includes exactly:
  - Malaysia
  - Singapore
  - Thailand
  - South Korea
- Clicking a trend opens a centered modal popup.
- Users stay on the Dashboard when viewing trend details.
- Remove the separate Trend Analysis/Trend Explorer page from navigation and routing.
- Preserve Market Comparison and Reports unchanged.
- Do not add product photography.

## Navigation Changes

### Final Sidebar

1. Dashboard
2. Market Comparison
3. Reports

Remove:

- Trend Analysis
- Trend Explorer
- Forecasting

### Route Changes

Keep:

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/comparison`
- `/reports`

Remove the rendered `/trends` page.

For compatibility, add:

```jsx
<Route path="/trends" element={<Navigate to="/dashboard" replace />} />
```

### Landing Page

- Replace the existing Trend Analysis landing feature with `Trend Tracker`.
- `Trend Tracker` opens `/dashboard`.
- Do not leave links pointing to `/trends`.

## Dashboard Layout

### Header

Navbar title:

> Dashboard

Subtitle:

> Discover rising and cooling beauty trends across Asia.

Keep:

- Notification control.
- Demo/User profile.
- Global keyword search on Dashboard only.

### Intro Copy

At the beginning of the dashboard content:

Eyebrow:

> BEAUTY INDUSTRY INTELLIGENCE

Heading:

> Discover Beauty Trends

Supporting text:

> See what’s rising, what’s fading, and what’s catching consumers’ attention across Asia.

Optional small badge:

> Sample dashboard

Do not present the sample badge as live or real-time data.

## Summary Cards

Create four compact cards under the intro.

### 1. Today’s Trend Signals

- Value: count of catalog queries where `Math.abs(changePercent) >= 10`.
- Detail: `Strong sample movements today`.

### 2. Rising Trends

- Value: count of currently visible/filter-matching rising queries.
- Detail: `Products and topics gaining attention`.

### 3. Cooling Trends

- Value: count of currently visible/filter-matching stable or declining queries.
- Detail: `Topics losing or holding attention`.

### 4. Markets Tracked

- Value: `4`.
- Detail: `Malaysia, Singapore, Thailand, South Korea`.

The values update when a category tab or keyword search changes, except Markets Tracked, which remains 4.

## Category Tabs

Place tabs between the summary cards and trend tracker:

- All trends
- Skincare
- Makeup
- Ingredients
- Haircare

Tab behavior:

- The active tab filters Rising Trends, Cooling Trends, summary counts, and Discover by Market.
- Search and category tab filters combine.
- Changing tabs resets panel pagination to the first 5 rows.
- Active tab is stored in URL parameter `category`.

### Category Mapping

The catalog keeps detailed sectors but also adds high-level groups:

- `Skincare`
  - Skincare
  - Serum
  - Sunscreen
  - Cleanser
  - Moisturizer
- `Makeup`
  - Makeup
  - Lipstick
- `Ingredients`
  - Ingredient-led queries such as Centella, Niacinamide, Hyaluronic Acid, Vitamin C, Retinol, Tranexamic Acid, Peptides, Ceramides, Snail Mucin, and Propolis.
- `Haircare`
  - Haircare
- `All trends`
  - Every tracked query, including Personal Care.

A query may belong to more than one high-level group, such as:

```js
{
  name: "Centella Serum",
  sector: "Serum",
  groups: ["Skincare", "Ingredients"]
}
```

## Main Trend Tracker

Section heading:

> Trending Now

Supporting text:

> Explore products, ingredients, and routines showing meaningful sample changes.

Desktop layout:

- Rising Trends panel on the left.
- Cooling Trends panel on the right.

Mobile layout:

- Rising Trends first.
- Cooling Trends second.

### Rising Trends Panel

Heading:

> Rising Trends

Description:

> Products and ingredients gaining popularity.

Sort:

1. Highest positive percentage change.
2. Highest popularity score.

Initial rows:

- 5.

See More:

- Add 5 rows per click.
- Change to `Show less` when all matching rows are visible.
- Show less returns to 5.

### Cooling Trends Panel

Heading:

> Cooling Trends

Description:

> Products and ingredients showing slower or declining interest.

Include:

- Stable queries.
- Declining queries.

Sort:

1. Most negative percentage change.
2. Lowest popularity score.

Use the same See More/Show Less behavior as Rising Trends.

## Trend Card Design

Match the information hierarchy of the attached reference without copying its finance styling.

Each trend card contains:

- Query name.
- Direction label:
  - Rising
  - Fast rising
  - Stable
  - Cooling
  - Declining
- Sector and leading market:
  - Example: `Skincare · South Korea`
- Mini six-point sparkline.
- Percentage change:
  - Example: `+32%`
- Metric explanation:
  - `Illustrative interest growth`
  - `Illustrative interest decline`
  - `Illustrative interest change`
- Popularity score:
  - Example: `78/100`
- Details control:
  - Visible text: `View trend details`
  - Plus/arrow icon.

Do not include product images.

### Example Card

```text
Centella Serum
Rising

Skincare · South Korea
+32%
Illustrative interest growth

78/100
View trend details
```

### Trend Colors

- Rising: existing success green and deep plum.
- Stable: champagne/warning brown.
- Cooling/Declining: existing muted danger red.

Trend status must always be stated in text; color cannot be the only indicator.

## Discover by Market

Place below Rising and Cooling panels.

Heading:

> Discover by Market

Supporting text:

> See which beauty topics are gaining attention in each tracked market.

Use four equal market cards on desktop:

1. Malaysia
2. Singapore
3. Thailand
4. South Korea

Each market card contains:

- Market code badge:
  - `MY`
  - `SG`
  - `TH`
  - `KR`
- Market name.
- Leading high-level category.
- Top 3 rising matching queries.
- Query score and direction.
- Short summary:
  - Example: `Serums and lightweight skincare are showing the strongest sample growth.`

Clicking any market query opens the same trend detail modal.

When category/search filtering is active:

- Recalculate each market’s top matching queries.
- If a market has no match, show a compact EmptyState:
  - `No matching sample trends in this market.`

Responsive:

- Desktop: 4 columns.
- Tablet: 2 columns.
- Mobile: 1 column.

## Dashboard Query Catalog

Create:

```text
src/data/dashboardQueries.js
```

Use 72 tracked queries across 9 detailed sectors.

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

Use the phrase:

> All tracked queries

Do not claim these are every possible cosmetic query.

## Query Data Model

```js
{
  id: "centella-serum",
  name: "Centella Serum",
  sector: "Serum",
  groups: ["Skincare", "Ingredients"],
  direction: "rising", // rising | stable | declining
  statusLabel: "Rising",
  changePercent: 32,
  score: 78,
  history: [
    { month: "May", score: 30 },
    { month: "Jun", score: 45 },
    { month: "Jul", score: 60 },
    { month: "Aug", score: 75 },
    { month: "Sep", score: 82 },
    { month: "Oct", score: 90 }
  ],
  leadingMarket: "South Korea",
  marketScores: {
    "Malaysia": 66,
    "Singapore": 72,
    "Thailand": 74,
    "South Korea": 90
  },
  relatedQueries: ["Cica serum", "Soothing serum", "Skin barrier"],
  summary: "Interest in Centella Serum has increased over the observed sample period.",
  businessOpportunity: "Consider monitoring this category for possible opportunities in Cambodia."
}
```

### Data Requirements

- Values are deterministic and committed to source.
- No runtime randomization.
- Every query has:
  - Six months of history.
  - A direction.
  - Percentage change.
  - Popularity score.
  - One leading market.
  - Scores for all four tracked markets.
  - At least 2 related queries.
  - Plain-language summary.
  - Plain-language business opportunity.
- Every high-level category tab has rising and cooling examples.
- Every market has at least 3 rising query examples.

Target direction distribution:

- 45–50 rising.
- 8–12 stable.
- 14–18 declining.

## Trend Detail Modal

Clicking a trend card opens a modal without leaving the Dashboard.

### Modal Header

- Product/query name.
- Sector/category.
- Status badge:
  - Rising
  - Cooling
  - Stable
- Close button.

### Summary

- Popularity score:
  - Example: `78/100`
  - Label: `Illustrative popularity index`
- Percentage change.
- Direction label.
- Leading market.

### Trend History

Title:

> Trend history

Supporting text:

> Illustrative interest index, May–October.

Show a simple six-month line chart:

- May
- Jun
- Jul
- Aug
- Sep
- Oct

Y-axis:

- 0
- 20
- 40
- 60
- 80
- 100

Use:

- Green/plum line for rising.
- Champagne line for stable.
- Muted red line for cooling/declining.

### Explanation

Section:

> What does this trend mean?

Example:

> Interest in Centella Serum has increased over the observed period.

Section:

> Countries showing interest

Show the four market scores:

- Malaysia
- Singapore
- Thailand
- South Korea

Section:

> Business opportunity

Example:

> Consider monitoring this product category for potential opportunities in Cambodia.

Footer notice:

> Sample data – not actual sales

No link to another Trend Analysis page.

### Modal Accessibility

- `role="dialog"`.
- `aria-modal="true"`.
- Move focus to close button.
- Trap Tab/Shift+Tab.
- Close on Escape.
- Close on backdrop click.
- Restore focus to the clicked trend card/details button.
- Lock body scrolling while open.

## Dashboard-Only Global Search

### Visibility

Show the navbar search only when:

```js
location.pathname === "/dashboard"
```

Hide it on:

- `/comparison`
- `/reports`
- `/login`
- `/signup`
- `/`

Keep notifications and profile controls unchanged.

### Search Matching

Search:

- Query name.
- Detailed sector.
- High-level groups.
- Related queries.
- Leading market.

Priority:

1. Exact query-name match.
2. Query name starts with input.
3. Query name contains input.
4. Related query contains input.
5. Group or sector contains input.
6. Market contains input.

### Autocomplete

- Start after 2 typed characters.
- Maximum 6 suggestions.
- Each suggestion shows:
  - Query name.
  - Sector.
  - Direction.
  - Change percentage.
- Support:
  - Arrow Down.
  - Arrow Up.
  - Enter.
  - Escape.
  - Pointer selection.
  - Outside-click dismissal.

### Search Behavior

Selecting an exact suggestion:

- Filters the dashboard.
- Opens that query’s modal.

Submitting an exact or best matching query:

- Filters the dashboard.
- Opens the selected modal.

Submitting a broad keyword such as `serum`:

- Filters all dashboard sections.
- Does not force an unrelated modal.

Clearing search:

- Restores all trend cards.
- Closes any search-opened modal.

## URL State Contract

Use `useSearchParams`.

Example:

```text
/dashboard?q=centella+serum&category=Ingredients&detail=centella-serum
```

Parameters:

- `q`: navbar keyword.
- `category`: active category tab.
- `detail`: open modal query ID.

Rules:

- Omit `category` when `All trends` is selected.
- Closing modal removes only `detail`.
- Clearing search removes `q` and search-selected `detail`.
- Changing category preserves `q` and closes modal only if the selected query no longer matches.
- Browser back/forward restores tab, search, and modal state.
- Unknown detail IDs are ignored safely.
- Unknown category values fall back to All trends.

## Components

### Add

```text
src/components/dashboard/
├── DashboardSummary.jsx
├── TrendCategoryTabs.jsx
├── TrendTrackerBoard.jsx
├── TrendTrackerPanel.jsx
├── TrendCard.jsx
├── TrendSparkline.jsx
├── TrendDetailModal.jsx
├── MarketDiscovery.jsx
└── MarketTrendCard.jsx

src/data/
└── dashboardQueries.js
```

### Update

#### `src/pages/DashboardPage.jsx`

- Remove old filter state.
- Remove `DashboardFilters`.
- Remove current large `TrendLineChart`.
- Remove `ProductRanking`.
- Remove `RecentActivity`.
- Read URL search state.
- Derive filtered catalog, summaries, rising/cooling lists, and market lists.
- Render modal from `detail`.

#### `src/components/common/Navbar.jsx`

- Gate global search to Dashboard.
- Import/query the catalog.
- Add autocomplete.
- Update Dashboard URL parameters.
- Add mobile expandable search.

#### `src/components/common/Sidebar.jsx`

- Remove Trend Analysis navigation item.
- Keep:
  - Dashboard
  - Market Comparison
  - Reports

#### `src/App.jsx`

- Remove lazy import and rendered route for `TrendAnalysisPage`.
- Redirect `/trends` to `/dashboard`.

#### `src/pages/LandingPage.jsx`

- Replace Trend Analysis card with Trend Tracker.
- Open `/dashboard`.

#### `src/styles/theme.css`

- Add tracker, tabs, trend cards, autocomplete, modal, market cards, and mobile search styles.
- Remove unused dashboard filter, ranking, recent insight, and old trend-page styles when no longer referenced.

### Remove

If no remaining imports:

- `src/pages/TrendAnalysisPage.jsx`
- `src/components/dashboard/DashboardFilters.jsx`
- `src/components/dashboard/ProductRanking.jsx`
- `src/components/dashboard/RecentActivity.jsx`
- `src/components/trends/BrandWatch.jsx`
- `src/components/trends/FilterPanel.jsx`
- `src/components/trends/IngredientBadge.jsx`

Keep or move the reusable Recharts chart:

- Convert `TrendLineChart.jsx` into a dashboard-focused detail chart, or
- Replace it with `TrendDetailChart.jsx` under `components/dashboard/`.

Delete `src/data/beautyTrends.js` if no remaining page uses it.

## Lightweight Trend Sparklines

Do not render a Recharts instance in every trend card.

Create `TrendSparkline.jsx` using a small SVG:

- Accept six scores.
- Normalize to view-box coordinates.
- Draw a polyline.
- Add optional soft area fill.
- Mark the latest point.
- Use direction color.
- Provide accessible summary text:
  - `Centella Serum rose from 30 to 90 between May and October.`

Use Recharts only for the larger modal history chart.

## Pagination and State

Local Dashboard state:

- `risingVisibleCount = 5`
- `coolingVisibleCount = 5`
- Last modal trigger element for focus restoration.
- Mobile search expanded/collapsed state belongs in Navbar.

Reset visible counts when:

- `q` changes.
- `category` changes.

Do not paginate market cards; each market always shows top 3 matching rising queries.

## Empty and Edge States

### No Search Results

Use shared `EmptyState`:

Heading:

> No tracked query matches “{q}”

Text:

> Try a broader keyword such as serum, sunscreen, lipstick, skincare, or haircare.

Action:

> Clear search

### One Empty Trend Panel

Keep both columns.

Empty copy:

> No rising sample trends match this view.

or:

> No cooling sample trends match this view.

### Empty Market Card

Copy:

> No matching sample trends in this market.

### Invalid URL State

- Ignore invalid `detail`.
- Fall back to All trends for invalid `category`.
- Trim empty `q`.
- Never crash because of stale URL parameters.

## Responsive Behavior

### Desktop

- Four summary cards.
- Two equal trend panels.
- Four market cards.
- Centered modal.

### Tablet

- Two summary cards per row.
- Rising/Cooling stay side by side when possible.
- Market cards use two columns.

### Mobile

- Summary cards stack or use two columns.
- Category tabs scroll horizontally.
- Rising and Cooling stack.
- Trend card rearranges:
  - Header: name, status, details.
  - Body: market/sector.
  - Footer: sparkline, percentage, score.
- Navbar shows a dashboard search icon.
- Search expands into a full-width row below the mobile header.
- Detail modal becomes full-screen or a full-height bottom sheet.
- Market cards stack.

## Accessibility

- Category tabs use proper tab semantics or an accessible button group.
- Trend cards are single interactive buttons or have one non-nested details control.
- Use `aria-label="View details for Centella Serum"`.
- Autocomplete uses combobox/listbox/option semantics.
- Sparkline includes accessible trend summary.
- Status always includes text.
- Modal traps/restores focus.
- See More button names its panel.
- Mobile search has an accessible open/close label.
- Respect `prefers-reduced-motion`.

## Data Disclaimer

Use:

> Illustrative sample signals only. Not actual sales or purchase demand.

Place:

- Under the Dashboard tracker.
- In the detail modal footer.

Do not use:

- Live trend.
- Real-time demand.
- Purchase intent.
- Confirmed customer demand.

## Verification

### Commands

1. `pnpm format`
2. `pnpm build`

Do not start another development server.

### Functional Checks

- Dashboard opens without the old filter form.
- Apply Filters button is gone.
- Old large dashboard chart is gone.
- Four summary cards derive from catalog/filter state.
- All five category tabs work.
- Rising and Cooling lists sort correctly.
- See More/Show Less work independently.
- Every trend card opens the modal.
- Modal displays product, status, score, chart, markets, interpretation, and opportunity.
- Modal closes by close button, Escape, and backdrop.
- Focus is trapped and restored.
- Discover by Market shows exactly Malaysia, Singapore, Thailand, and South Korea.
- Each market lists top 3 matching rising trends.
- Market trend clicks open the modal.
- Navbar search appears only on Dashboard.
- Autocomplete supports keyboard and pointer input.
- Exact search opens modal.
- Broad search filters without forcing modal.
- Search/category/detail survive browser back/forward.
- `/trends` redirects to `/dashboard`.
- No landing or sidebar links point to `/trends`.
- Market Comparison and Reports remain functional.

### Data Checks

- Exactly 72 tracked queries.
- 8 queries in each detailed sector.
- Every query has six history points.
- Every query has four market scores.
- Every query has at least two related queries.
- Every category tab has rising and cooling examples.
- Every market has at least three rising examples.
- No runtime random values.

### Visual Checks

At desktop:

- The tracker structure resembles the attached reference.
- Information hierarchy is more important than decorative graphics.
- Query name, status, change, and score are scannable within seconds.
- Purple and cream branding remains unchanged.

At mobile:

- No horizontal page overflow.
- Tabs remain usable.
- Search expands correctly.
- Modal fits the viewport.
- Trend cards remain readable.

### Source Audit

Confirm:

- No `DashboardFilters` import.
- No Trend Analysis sidebar item.
- No rendered `/trends` page.
- No unused old dashboard filter/chart/ranking styles.
- Search is gated to `/dashboard`.
- No product images were added.
- No unsupported live-data language appears.

## Acceptance Criteria

- Users see popular trends immediately without selecting a product first.
- Dashboard is organized around Rising Trends, Cooling Trends, and Discover by Market.
- Four clear summary cards explain the current sample tracker.
- Trend cards are interactive and open a detail modal.
- The modal answers what is happening, where interest exists, and what the business implication may be.
- Navbar search works only on Dashboard.
- Category tabs filter the full tracker.
- The separate Trend Analysis/Trend Explorer page is removed.
- Discover by Market uses Malaysia, Singapore, Thailand, and South Korea only.
- Existing Market Comparison, Reports, auth, landing, and core branding continue to work.
- `pnpm format` and `pnpm build` pass.
