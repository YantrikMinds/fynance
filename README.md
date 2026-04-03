# Fynance — Personal Finance Dashboard

A clean, feature-rich finance dashboard built with vanilla HTML, CSS, and JavaScript.
No build tools, no frameworks, no dependencies to install — just open and run.

![Fynance Dashboard Preview](https://via.placeholder.com/900x500?text=Fynance+Finance+Dashboard)

---

## Quick Start

```bash
# Clone or download the project
git clone https://github.com/yourusername/fynance-dashboard

# Open directly in browser — no server needed
open index.html
```

Or just double-click `index.html`. That's it.

---

## Project Structure

```
fynance-dashboard/
├── index.html     # App shell — layout, views, modal markup
├── style.css      # All styles — design system, components, responsive
├── data.js        # Mock data, category config, storage & data helpers
├── app.js         # App logic — state, routing, charts, interactions
└── README.md      # This file
```

---

## Features

### Dashboard Overview
- **4 Summary Cards** — Net Balance, Total Income, Total Expenses, Transaction Count
- **Balance Trend Chart** — Line chart showing monthly net cash flow
- **Spending Breakdown** — Donut chart by spending category with percentages
- **Income vs Expenses** — Grouped bar chart per month
- **Daily Spending** — Line chart for last 14 days of expense activity

### Transactions
- Full transaction table with Date, Description, Category, Type, Amount
- **Search** — real-time filter by description or category name
- **Filter** by transaction type (income/expense) and category
- **Sort** by Date, Category, or Amount (click column headers)
- **Add / Edit transactions** (Admin role only)
- Row count and filter status shown in table footer

### Insights
- Top Spending Category with total amount
- Savings Rate with visual progress bar and contextual advice
- Heaviest Spending Month
- Average Expense Transaction value
- Net Cash Flow with direction indicator
- Total transaction breakdown (income vs expense count)
- Monthly Comparison bar chart
- Horizontal Category Breakdown chart

### Role-Based UI
| Feature              | Admin | Viewer |
|----------------------|-------|--------|
| View all data        | ✅    | ✅     |
| Add transaction      | ✅    | ❌     |
| Edit transaction     | ✅    | ❌     |
| Export CSV           | ✅    | ✅     |
| Switch role          | ✅    | ✅     |

Switch roles using the dropdown in the bottom left sidebar.

### Additional Features
- **Dark Mode** — click the moon/sun icon in the top bar; preference saved
- **Data Persistence** — all transactions and settings saved to `localStorage`
- **CSV Export** — exports filtered transactions with one click
- **Toast Notifications** — success/error feedback for all actions
- **Month Filter** — filter entire dashboard by selected month
- **Responsive Design** — works on mobile, tablet, and desktop
- **Empty State Handling** — friendly message when no data matches filters
- **Keyboard Support** — Escape closes modal

---

## State Management

All state lives in a single `State` object in `app.js`:

```js
const State = {
  txns:      [],      // Transaction array (loaded from localStorage)
  role:      'admin', // Current user role
  theme:     'light', // UI theme
  view:      'overview',
  sortField: 'date',
  sortDir:   -1,
  editId:    null,
  charts:    {},      // Chart.js instances (for cleanup)
  months:    ['Jan', 'Feb', 'Mar', 'Apr'],
};
```

Persistence is handled by `Storage` in `data.js`, which wraps `localStorage` with safe JSON serialisation.

Data transforms (filtering, summarising, category grouping) are pure functions in `DataUtils` — easy to test and replace.

---

## Design Decisions

- **Font pairing**: DM Serif Display (headings, numbers) + DM Sans (body, labels) — professional and readable
- **Color system**: CSS custom properties for all colors — single source of truth for light/dark mode
- **Accent color**: Forest green (#1a5c38) — evokes growth, stability, money
- **No build step**: vanilla JS + Chart.js via CDN — zero configuration, instant deployment
- **Chart cleanup**: all Chart.js instances stored in `State.charts` and destroyed before re-render to prevent canvas conflicts

---

## Deployment

### Netlify (recommended)
1. Push to GitHub
2. Connect repo to [netlify.com](https://netlify.com)
3. Deploy settings: Build command = *(empty)*, Publish directory = `.`

### GitHub Pages
1. Push to GitHub
2. Go to Settings → Pages → Deploy from branch → main

### Vercel
```bash
npx vercel --prod
```

---

## Tech Stack

| Tool       | Purpose                          |
|------------|----------------------------------|
| HTML5      | Semantic structure               |
| CSS3       | Design system, animations, grid  |
| JavaScript | App logic, state, DOM            |
| Chart.js   | 5 chart types via CDN            |
| Google Fonts | DM Serif Display + DM Sans     |
| localStorage | Client-side persistence        |

---

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Author

Built as a frontend assignment submission — demonstrating UI/UX design thinking, component architecture, state management, and responsive development with clean vanilla code.