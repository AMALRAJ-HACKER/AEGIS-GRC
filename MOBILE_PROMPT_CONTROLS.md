# Prompt — Mobile App: Controls Per Framework (Exact Web Port)

Redesign the mobile app controls screen to **exactly match** the AEGIS GRC web `ControlsPage` design (`src/pages/frameworks/ControlsPage.tsx`). Coordinate with the web design system and reuse the same assets, statistics, and component structure.

## Design Direction (Light Mode Only, Identical to Web)
- **Layout:** Single scrollable column (mobile portrait). Mirror the web's exact layout: header with framework name + stats + ComplianceRing, then tabs, search, then data table.
- **Typography:** Inter (system fallbacks), matching web text sizes. Use the web's exact class names where possible: `text-2xl font-bold tracking-tight text-navy`, `text-sm text-slate-500`, `text-[11px]`, `font-medium`, `font-mono`.
- **Colors (light mode only, match web):**
  - Background: `#F7F8FA`, cards: `#FFFFFF`, border: `#E2E8F0`, radius: `12–18px`
  - Brand navy: `#0F2D52`; slate: `#0F2D52`, `#475569`, `#E2E8F0`, `#F7F8FA`
  - Status chips use web tone system: `controlLabel`/`controlTone` mappings
    - `not_started` → amber fill `#FFFBEB` text `#B45309`
    - `implemented` → success green fill `#D1e7dd` text `#059060` (or web equivalent)
    - `in_progress` → sky/blue tone
    - `needs_review` → amber tone
    - `non_compliant` → red fill `#FEF2F2` text `#DC2626`
  - ComplianceRing: navy background track, emerald/amber/red fills, percent label in navy
- **Components to reuse (mirror web exactly):**
  - `Badge` component with `label` and `tone` prop (same as web)
  - `ComplianceRing` component (same chart component, just smaller on mobile)
  - `Card`, `CardBody`, `CardHeader` from `@/components/ui/Card`
  - `Button` from `@/components/ui/Button` (primary, secondary, sm sizes)
  - `EmptyState` from `@/components/ui/States` (with icon, title, message, action)
  - `Spinner` from `@/components/ui/States`
  - `Tabs` from `@/components/ui/Tabs`
  - Icons from `lucide-react`: `ShieldCheck`, `ListChecks`, `ChevronRight`, `Search`, `Filter`
- **Spacing:** Match web exact padding: `px-5`, `py-2.5`, `gap-4`, `grid-cols-[120px_1fr_150px_130px_40px]`, `md:grid-cols-[120px_1fr_150px_130px_40px]`, `md:gap-4`
- **Brand mark:** shield-check in navy rounded tile before “AEGIS GRC” in header (same as web navbar)

## Sections & Copy (mirror web ControlsPage 1:1)

### 1. No Framework Selected ( `/controls` route )
- **Header:** "Controls" h1 + text "Pick an activated framework to review and update its controls."
- **Empty State** (if no frameworks activated):
  - Icon: `ListChecks` size 22
  - Title: "No controls to show yet"
  - Message: "Activate a framework first — its controls will appear here automatically."
  - Action Button: "Browse frameworks" → navigates to `/frameworks`
- **Activated Frameworks Grid** (if frameworks exist):
  - Grid: `grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3`
  - Each framework card: `card flex items-center gap-4 p-5 transition-shadow hover:shadow-soft`
  - Left: `ComplianceRing score={f.score} size={62}`
  - Right: `div min-w-0 flex-1`
    - h3: `truncate text-sm font-bold text-navy` → framework name
    - p text-[11px] text-slate-500 → `{f.implemented}/{f_total} implemented`
    - p text-[11px] text-slate-500 → category
  - ChevronRight icon → links to `/frameworks/{f_id}`
- **No frameworks activated message** is the empty state above.

### 2. Framework Selected ( `/controls?frameworkId=xxx` route )
- **Header section** (match web lines 138-162):
  - flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
  - Left column: 
    - nav mb-1: 
      - Link to "/frameworks" className "hover:text-navy" + ChevronRight size 12 + span text-slate-600 framework name
    - h1: flex items-center gap-2 text-2xl font-bold tracking-tight text-navy
      - ShieldCheck size 22 text-navy
      - framework name
    - p mt-1 text-sm text-slate-500 → "{controls.length} controls · {counts.implemented} implemented"
  - Right column: ComplianceRing score={computed} size={64} label="score"
    - score = Math.round((counts.implemented / controls.length) * 100) or 0 if no controls

- **Tabs** (match web lines 164-175):
  - Tabs component with items: All, Implemented, In progress, Not started, Review, Non-compliant
  - Each has badge with count
  - Active state, onChange sets filter

- **Search** (match web lines 177-185):
  - div relative max-w-sm
  - Search size 15 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500
  - input w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-500 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15
  - placeholder: "Search by code, title or category…"

- **Data Table** (match web lines 187-223):
  - If visible.length === 0: EmptyState
    - icon: ListChecks size 22 stroke currentColor
    - title: "No controls match"
    - message: "Adjust the filters or search term to see more controls."
  - If controls exist: Card with hidden grid header and list
    - **Header row** (hidden on mobile, shown on md+):
      - hidden grid-cols-[120px_1fr_150px_130px_40px] gap-4 border-b border-line bg-slate-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:grid
      - spans: Control, Title, Category, Status, ·
    - **Control list** (ul divide-y divide-line):
      - Each visible control as li key={c.controlId}
      - Link to `/frameworks/{frameworkId}/controls/{c.controlId}`
        - grid grid-cols-1 items-center gap-2 px-5 py-3.5 transition-colors hover:bg-slate-50 md:grid-cols-[120px_1fr_150px_130px_40px] md:gap-4
        - span font-mono text-xs font-semibold text-navy → c.controlCode
        - span min-w-0:
          - span block truncate text-sm font-medium text-navy → c.title
          - span block text-[11px] text-slate-500 md:hidden → c.category (mobile only)
        - span hidden truncate text-xs text-slate-500 md:block → c.category (desktop)
        - span: Badge label={controlLabel(c.status)} tone={controlTone(c.status)}
        - ChevronRight size 15 hidden text-slate-500 md:block
    - Empty state if no visible controls after filtering

### 3. Add Control Flow
- **FAB** (bottom-right) on framework control screen: + icon, navy, slides in
  - onClick: navigates to new control screen or opens drawer
- **Add Control Drawer** (bottom sheet modal):
  - Title: "Add control"
  - Text input: Control title (required)
  - Text area: Control description
  - Dropdown: Framework section (if applicable)
  - Status selector: radio buttons or tabs matching status labels
  - "Save" (primary navy) and "Cancel" (secondary)
  - Scroll-up slides smoothly; tap outside dismisses

### 4. Control Status Mapping (exact web tone)
- `not_started` → Badge: amber fill `#FFFBEB` text `#B45309` (or web equivalent `controlTone('not_started')`)
- `implemented` → Badge: green fill `#D1e7dd` text `#059060` (or web equivalent)
- `in_progress` → Badge: sky/blue tone
- `needs_review` → Badge: amber/yellow tone
- `non_compliant` → Badge: red fill `#FEF2F2` text `#DC2626` (or web equivalent)

### 5. Empty States
- **No frameworks activated** (header section):
  - Same as section 1 empty state
- **No controls match** (after filters/search):
  - EmptyState: ListChecks icon, title "No controls match", message "Adjust the filters or search term to see more controls."
- **No controls for framework** (when frameworkId exists but controls empty):
  - Same pattern, may differ in message

## Motion & Interactions (mirror web)
- Tabs switch with smooth height animation and tab indicator
- Table rows fade-in staggered or on scroll
- Hover states: row bg-slate-50, link transition-colors
- ComplianceRing animate on score update
- FAB slide-in/out on screen navigate
- Respect **Reduce Motion** → disable all non-essential animations

## Accessibility & UX (mirror web)
- Focus visible on all interactive elements (match web focus rings)
- Heading hierarchy: h1 for framework name, h2/h3 for sections
- Touch targets ≥44pt; list items have adequate tap target
- Status chip aria-label: describe status
- Search input has proper label/placeholder
- Links have clear hover/focus states
- Keyboard navigable through tabs and list items

## QA Checklist (match web exactly)
- ✅ Framework grid on `/controls` matches web grid layout and card styling
- ✅ Header on framework-selected route matches web: nav, h1 with shield, stats p, ComplianceRing
- ✅ Tabs: All/Implemented/In progress/Not started/Review/Non-compliant with correct badges
- ✅ Search input placeholder "Search by code, title or category…" and filters work
- ✅ Data table columns: Control (code), Title, Category, Status, (actions)
- ✅ Each row links to correct control detail page: `/frameworks/{id}/controls/{controlId}`
- ✅ Status badges use exact web tone colors (controlLabel/controlTone)
- ✅ Empty states match web: icon, title, message, action button
- ✅ No dark-mode elements; color-scheme: light
- ✅ Matches web spacing (`grid-cols-[120px_1fr_150px_130px_40px]`, `px-5`, `py-2.5`, `text-[11px]`)
- ✅ Footer/navbar persists; "Back" navigation returns to framework list
- ✅ Reduce Motion respects reduced-prefers-color-scheme

## Assets & Data
- Reuse web's exact class names and component imports where possible
- Use same Lucide icons: ShieldCheck, ListChecks, ChevronRight, Search, Filter, Plus
- Framework data: controlCode, title, category, status, assessmentId, controlId
- Status counts: implemented, in_progress, not_started, needs_review, non_compliant
- Compliance score: Math.round((implemented / total) * 100)

## Screens

### Screen A: Controls Home (no framework)
```
/controls → shows framework grid or "No controls to show yet"
```

### Screen B: Framework Controls
```
/frameworks/{frameworkId}/controls → shows header + tabs + search + data table
```
Example: `/frameworks/1/controls` → "GDPR · 99 controls · 23 implemented"

### Screen C: Add Control (from FAB or + button)
- Drawer/modal with title, description, status, Save/Cancel

