# BeautyTrend Frontend Consistency and Structure Refactor

## Objective

Refactor the current single-file BeautyTrend prototype into a maintainable, routed JavaScript React application while preserving its current features and major page layouts.

The work is a **consistency cleanup, not a full visual redesign**. It should:

- Make every page feel like one coherent BeautyTrend product.
- Use one minimal font family throughout the application.
- Split the current `App.tsx` and global CSS into focused pages, reusable components, data modules, and export utilities.
- Introduce clean URL routes with React Router.
- Remove Forecasting completely from source code, routing, navigation, types, styles, and entry points.
- Preserve the current landing, authentication prototype, dashboard, trend analysis, market comparison, and professional reports functionality.
- Preserve existing illustrative/sample-data meaning and disclaimer language without adding unsupported Kaggle claims.

## Confirmed Decisions

- Keep the Vite application at the repository root; do **not** create a literal `frontend/` wrapper directory.
- Convert application source files from TypeScript/TSX to JavaScript/JSX.
- Add React Router using `BrowserRouter` and clean URLs.
- Use one font family across the entire application.
- Preserve current content and major layouts while normalizing visual patterns.
- Leave data-source semantics alone; do not introduce a Kaggle-specific claim.
- Forecasting remains removed from the product.
- Preserve the Figma-managed root `vite.config.ts` unless a JavaScript conversion is proven safe and necessary. The requested structure applies primarily to application source files.

## Target Repository Structure

```text
.
├── public/
│   ├── assets/
│   │   └── [local BeautyTrend assets, if any are retained]
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── DataDisclaimer.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Logo.jsx
│   │   │   └── PageHeader.jsx
│   │   ├── dashboard/
│   │   │   ├── MetricCard.jsx
│   │   │   ├── DashboardFilters.jsx
│   │   │   ├── ProductRanking.jsx
│   │   │   └── RecentActivity.jsx
│   │   ├── trends/
│   │   │   ├── TrendLineChart.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── IngredientBadge.jsx
│   │   │   ├── BrandWatch.jsx
│   │   │   └── ProductSignalCard.jsx
│   │   ├── comparison/
│   │   │   ├── MarketSelector.jsx
│   │   │   ├── CountryBarChart.jsx
│   │   │   ├── ComparisonTable.jsx
│   │   │   └── MarketInsightCard.jsx
│   │   └── reports/
│   │       ├── ReportConfigForm.jsx
│   │       ├── ProductSelectionGrid.jsx
│   │       ├── CostInputTable.jsx
│   │       ├── ReportPreviewCard.jsx
│   │       └── FullReportPreview.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── data/
│   │   ├── beautyTrends.js
│   │   ├── marketComparison.js
│   │   └── reportProducts.js
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── AuthPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── TrendAnalysisPage.jsx
│   │   ├── MarketComparisonPage.jsx
│   │   ├── ReportGeneratedPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │   └── reportExport.js
│   ├── styles/
│   │   ├── theme.css
│   │   └── tailwind.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

### Structure Notes

- `DataDisclaimer.jsx` will reuse the current neutral illustrative/sample-data notices. It will not mention Kaggle.
- `ReportGeneratedPage.jsx` remains the report generation and export hub, matching the requested tree.
- `services/reportExport.js` is necessary to keep PDF and Excel generation out of page components.
- `data/` centralizes the current hardcoded prototype datasets without changing their meaning.
- `AuthContext.jsx` centralizes simulated authentication/demo state. It is frontend-only and must not imply production-grade security.
- The Figma-generated `vite.config.ts` remains at root to avoid breaking Figma Make integration.

## Routing Design

Install `react-router-dom` and define these routes in `src/App.jsx`:

| Path | Page | Access |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/login` | `AuthPage` in login mode | Public |
| `/signup` | `AuthPage` in signup mode | Public |
| `/dashboard` | `DashboardPage` | Protected or demo session |
| `/trends` | `TrendAnalysisPage` | Protected or demo session |
| `/comparison` | `MarketComparisonPage` | Protected or demo session |
| `/reports` | `ReportGeneratedPage` | Protected or demo session |
| `*` | `NotFoundPage` | Public |

### Navigation Behavior

- Landing-page “live demo” actions create a frontend demo session and navigate to the relevant protected route.
- Login/signup success creates a frontend authenticated session and redirects to `/dashboard`.
- Logout clears the session and redirects to `/`.
- `ProtectedRoute` accepts authenticated or demo sessions.
- Persist only a small session mode value in `localStorage`, such as `beautytrend_session=demo|authenticated`.
- Clearly treat this as prototype access control, not secure production authentication.
- Sidebar and navbar route links use `NavLink` for consistent active states.
- Forecasting does not appear in the route table, sidebar, landing features, or redirects.

## Dependency Changes

### Add

- `react-router-dom` for routing.
- `lucide-react` for one consistent minimal icon system.
- `recharts` for reusable, accessible chart components where it replaces duplicated inline SVG logic cleanly.

### Keep

- `jspdf`
- `jspdf-autotable`
- `xlsx`
- React, Vite, Tailwind, and existing Figma Make packages.

### Do Not Add

- `axios`, because the application has no API integration.
- A component framework, because the current design can be normalized with local components and design tokens.

### Bundle Improvement

- Dynamically import `jspdf`, `jspdf-autotable`, and `xlsx` inside `reportExport.js` only when a user downloads a report.
- This should remove the current initial-bundle warning or substantially reduce the main application chunk.

## Typography and Visual System

### Single Font

- Use **DM Sans** for headings, body text, controls, labels, and numbers.
- Remove the Playfair Display import and every `font-family: 'Playfair Display'` declaration.
- Create hierarchy with size, weight, line-height, spacing, and color rather than a second font family.

### Shared Tokens in `theme.css`

Define semantic CSS variables for:

- Deep plum brand and darker plum.
- Champagne/gold highlight.
- Soft peach/blush.
- Warm ivory/background.
- White surface.
- Charcoal body text.
- Muted text.
- Success/growth.
- Warning/medium potential.
- Danger/declining.
- Borders, shadows, radii, spacing, and focus rings.

Do not introduce the example `#0C8CE9` blue because it conflicts with established BeautyTrend branding.

### Shared UI Rules

Normalize across every page:

- Page maximum width and horizontal padding.
- Header height and title/subtitle placement.
- Sidebar width, active state, and mobile drawer behavior.
- Card borders, radii, shadows, and internal padding.
- Button heights, icon spacing, disabled states, loading states, and focus states.
- Input, select, checkbox, and search field appearance.
- Section heading hierarchy.
- Status badges: Rising, Stable, Declining, High, Medium, Low.
- Empty states and disclaimer placement.
- Responsive breakpoints and touch targets.

## Component Responsibilities

### Common

- `AppLayout`: shared authenticated/demo shell with sidebar, navbar, content outlet, and footer.
- `Navbar`: current page title, optional subtitle, global search, notifications, and profile menu.
- `Sidebar`: logo, four remaining application links, weekly signal, demo/authenticated user block, and mobile collapse behavior.
- `Footer`: copyright, prototype-mode indicator, and lightweight links. Do not claim real production system status.
- `DataDisclaimer`: shared neutral notice that data is illustrative/search-interest guidance and not guaranteed sales or purchase demand.
- `EmptyState`: reusable no-results state for filters and reports.
- `ProtectedRoute`: checks frontend session context and redirects unauthenticated visitors.
- `Logo`: shared BeautyTrend mark.
- `PageHeader`: consistent heading, subtitle, and optional action slot.

### Dashboard

- Preserve the current friendly dashboard content and filtering flow.
- Extract the three summary cards into `MetricCard`.
- Extract dashboard filters into `DashboardFilters`.
- Extract top trending products into `ProductRanking`.
- Extract current market insight/recent actions into `RecentActivity`.
- Keep product trend information text/icon based; do not restore the removed trending-product photography.

### Trend Analysis

- Preserve current category selection, brand/product watch, market filtering, historical chart, related keywords, and sample-data labels.
- `FilterPanel` owns query, category, market, and date-range controls.
- `BrandWatch` owns ranked brand/product rows and selected item state.
- `TrendLineChart` receives normalized series data and labels through props.
- `IngredientBadge` provides reusable filter/status pills.

### Market Comparison

- Preserve the simplified five-market experience.
- `MarketSelector` owns add/remove country chips plus product and time selection.
- `CountryBarChart` renders the current horizontal popularity bars.
- `ComparisonTable` renders the plain-language “What’s trending?” rows rather than a technical grid.
- `MarketInsightCard` owns “What this means” and Cambodia opportunity messaging.

### Reports

- Preserve report type, country, category, product selection, editable cost inputs, full preview, PDF download, and Excel download.
- `ReportConfigForm` owns report type, target country, categories, and generation action.
- `ProductSelectionGrid` owns filtered product selection and select-all/clear behavior.
- `CostInputTable` owns import/additional cost edits and calculated estimated profit.
- `ReportPreviewCard` presents the generated report summary and download actions.
- `FullReportPreview` owns the six-section document preview.
- `reportExport.js` owns PDF/Excel construction and file downloads.
- Keep the complete selected product list; do not limit generated exports to five products.
- Continue distinguishing sample trend data, estimated demand, suggested prices, user-entered costs, and verified/actual market data.

## State and Data Flow

### Authentication

- `AuthContext` exposes:
  - `sessionMode`
  - `isAuthenticated`
  - `isDemo`
  - `login()`
  - `startDemo()`
  - `logout()`
- `AuthPage` handles local validation, password visibility, loading feedback, password matching, and simulated recovery.

### Page State

- Keep filter state local to each page unless it must persist between routes.
- Pass only serializable route state when a landing feature opens a specific page.
- Do not add global state management.

### Data

- Move constants out of components:
  - Brand/product trend records to `beautyTrends.js`.
  - Country comparison records to `marketComparison.js`.
  - Report products, price assumptions, and recommendations to `reportProducts.js`.
- Export immutable arrays/objects and derive filtered views in components.

### Reports

- Keep user-entered cost state in `ReportGeneratedPage`.
- Pass selected products and costs to preview and export functions.
- Export functions return success/failure results so the UI can show a notice.
- Disable downloads when no products are selected.
- Catch export errors and show a concise retry message.

## CSS Migration

1. Create `src/styles/tailwind.css`:
   - Google Fonts import for DM Sans.
   - `@import 'tailwindcss';`
   - Minimal base-layer reset and font assignment.
2. Create `src/styles/theme.css`:
   - BeautyTrend tokens.
   - Shared layout/component classes.
   - Focus-visible, motion, and accessibility rules.
3. Import both files from `main.jsx`.
4. Remove `src/index.css` after all used styles are migrated.
5. Delete obsolete styles for:
   - Forecasting.
   - Removed product-image trend cards.
   - Superseded one-off component variants.
6. Prefer Tailwind utilities for straightforward layout and spacing.
7. Use named shared classes only for repeated or complex visual patterns such as charts, document previews, and responsive shell behavior.

## Conversion from TypeScript to JavaScript

- Rename:
  - `src/App.tsx` → `src/App.jsx`
  - `src/main.tsx` → `src/main.jsx`
- Remove TypeScript-only syntax:
  - Type aliases.
  - Generic annotations.
  - Typed props.
  - `as const`, casts, and typed event signatures.
- Preserve runtime behavior with prop defaults and defensive guards.
- Keep `vite.config.ts` and `tsconfig.json` because they are part of the Figma-managed build configuration.
- Update `index.html` to reference `/src/main.jsx`.

## Implementation Sequence

1. Add routing/icon/chart dependencies.
2. Create `styles/tailwind.css` and `styles/theme.css` with the single-font token system.
3. Extract static data into `src/data/`.
4. Add `AuthContext` and clean route/session behavior.
5. Build common layout components.
6. Extract Landing and Auth pages.
7. Extract Dashboard components/page.
8. Extract Trend Analysis components/page.
9. Extract Market Comparison components/page.
10. Extract Reports components/page and move export logic to `reportExport.js`.
11. Add `NotFoundPage`.
12. Wire all routes in `App.jsx`.
13. Remove the old monolithic `App.tsx`, old `main.tsx`, and `index.css`.
14. Remove all remaining Forecasting code and styles.
15. Perform a consistency and accessibility pass.
16. Format and verify.

## Edge Cases and Failure Handling

- Unauthenticated direct access to protected routes redirects to `/login`.
- Demo session survives refresh through local storage.
- Unknown routes render `NotFoundPage` with a clear return action.
- Country/product/category filters with no results render `EmptyState`.
- At least one country remains selected in comparison.
- Report generation requires at least one product.
- Category changes cannot leave stale selected products silently; the UI shows the selected count and retains only valid choices when filters are applied.
- Numeric cost inputs clamp invalid/negative values to zero.
- Estimated profit never displays below zero unless the UI explicitly presents a loss state.
- PDF/Excel export errors are caught and surfaced.
- Report export dependencies load only when needed; buttons show loading and prevent duplicate downloads.
- Profile and notification menus close on navigation, outside click, and Escape.
- Mobile sidebar closes after route selection.
- Respect `prefers-reduced-motion`.

## Accessibility Requirements

- Semantic landmarks and heading order on every page.
- Visible keyboard focus using shared focus-ring tokens.
- Labels associated with every form control.
- Icon-only controls have accessible names.
- Active navigation uses both visual treatment and `aria-current`.
- Charts include concise textual summaries and accessible labels.
- Color is not the only signal for demand/trend status.
- Modal report preview traps focus, closes on Escape, and restores focus to its trigger.
- Buttons and controls meet touch target expectations.

## Verification Strategy

### Required Commands

Run the repository-prescribed commands:

1. `pnpm format`
2. `pnpm build`

Do not start another development server; use the existing Figma Make preview server.

### Functional Route Checks

Verify:

- `/` renders the landing page.
- Landing feature cards open the correct demo routes.
- `/login` and `/signup` validate and redirect correctly.
- Protected routes redirect without a session.
- Demo/authenticated sessions can visit all four app routes.
- Sidebar active states match the URL.
- Logout returns to the landing page.
- Browser back/forward navigation works.
- A direct refresh on each clean URL works in the Figma preview environment.
- Unknown URLs render the not-found page.

### Feature Checks

- Dashboard filters and summary cards update.
- Trend category, brand, market, date, and related-keyword interactions work.
- Country comparison selection and bars update.
- Report categories and products can be selected/cleared.
- Cost edits recalculate estimated profit.
- Full report preview displays every selected product.
- PDF generation includes all required report sections.
- Excel export contains separate Market Overview, Product Opportunities, and Price Analysis sheets.
- Downloads are disabled or explained when selection is empty.

### Visual Checks

At desktop and mobile widths verify:

- One font family is used everywhere.
- Sidebar/navbar/footer are consistent.
- Page spacing and card styles are consistent.
- No Forecasting navigation, page, code path, or stale styles remain.
- No removed trending-product imagery reappears on the dashboard.
- No horizontal overflow occurs outside intentionally scrollable report tables/charts.
- Focus, hover, selected, disabled, loading, success, and empty states are visible.

## Acceptance Criteria

- The application is no longer implemented as one monolithic page file.
- All application source is JavaScript JSX.
- Clean React Router URLs work for public and protected pages.
- The current visible feature set remains functional: Landing, Auth, Dashboard, Trend Analysis, Market Comparison, and Reports.
- Forecasting is fully removed.
- The visual system is consistent across pages without materially redesigning their content.
- DM Sans is the only font family.
- Reusable shared components replace duplicated shell, card, filter, badge, disclaimer, and empty-state markup.
- Report PDF and Excel exports continue to work with complete selected-product data.
- Sample/estimated data remains clearly distinguished from actual sales or verified prices.
- `pnpm format` and `pnpm build` complete successfully.
