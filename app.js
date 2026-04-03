/* =========================================================
   FYNANCE — app.js
   State management, rendering, chart logic, interactions
   ========================================================= */

'use strict';

/* ============================
   STATE
   ============================ */
const State = {
  txns:       [],
  role:       'admin',
  theme:      'light',
  view:       'overview',
  sortField:  'date',
  sortDir:    -1,
  editId:     null,
  charts:     {},
  months:     ['Jan', 'Feb', 'Mar', 'Apr'],
};

/* ============================
   DOM REFS
   ============================ */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ============================
   INIT
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  // Load persisted state
  State.txns  = Storage.loadTxns();
  State.role  = Storage.loadRole();
  State.theme = Storage.loadTheme();

  // Apply theme
  applyTheme(State.theme, false);

  // Set current date
  $('currentDate').textContent = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  // Role UI
  $('roleSelect').value = State.role;
  applyRole(State.role);

  // Populate category filter
  populateCatFilter();

  // Event listeners
  bindEvents();

  // Render first view
  switchView('overview');
});

/* ============================
   EVENT BINDINGS
   ============================ */
function bindEvents() {
  // Nav
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Role switcher
  $('roleSelect').addEventListener('change', e => {
    State.role = e.target.value;
    Storage.saveRole(State.role);
    applyRole(State.role);
    render();
  });

  // Month filter
  $('monthFilter').addEventListener('change', render);

  // Export
  $('exportBtn').addEventListener('click', exportCSV);

  // Theme toggle
  $('themeToggle').addEventListener('click', () => {
    const next = State.theme === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
  });

  // Transaction filters
  $('searchInput').addEventListener('input', renderTxns);
  $('typeFilter').addEventListener('change', renderTxns);
  $('catFilter').addEventListener('change', renderTxns);

  // Table sort
  $$('.txn-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const f = th.dataset.sort;
      if (State.sortField === f) State.sortDir *= -1;
      else { State.sortField = f; State.sortDir = -1; }
      $$('.txn-table th').forEach(h => h.classList.remove('active'));
      th.classList.add('active');
      renderTxns();
    });
  });

  // Add transaction button
  $('addTxnBtn').addEventListener('click', () => openModal(null));

  // Modal close
  $('modalClose').addEventListener('click', closeModal);
  $('modalCancel').addEventListener('click', closeModal);
  $('modalSave').addEventListener('click', saveTransaction);
  $('modalOverlay').addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });

  // Keyboard: Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Mobile sidebar
  $('mobileMenuBtn').addEventListener('click', () => {
    $('sidebar').classList.toggle('open');
    $('sidebarOverlay').classList.toggle('open');
  });

  $('sidebarOverlay').addEventListener('click', () => {
    $('sidebar').classList.remove('open');
    $('sidebarOverlay').classList.remove('open');
  });
}

/* ============================
   ROUTING
   ============================ */
function switchView(view) {
  State.view = view;

  // Nav highlight
  $$('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Show/hide sections
  $$('.view').forEach(el => el.classList.remove('active'));
  const section = document.getElementById('view-' + view);
  if (section) section.classList.add('active');

  // Page title
  const titles = { overview: 'Overview', transactions: 'Transactions', insights: 'Insights' };
  $('pageTitle').textContent = titles[view] || view;

  // Close mobile sidebar
  $('sidebar').classList.remove('open');
  $('sidebarOverlay').classList.remove('open');

  render();
}

function render() {
  const v = State.view;
  if (v === 'overview')     renderOverview();
  if (v === 'transactions') renderTxns();
  if (v === 'insights')     renderInsights();
}

/* ============================
   FILTERS
   ============================ */
function getFiltered() {
  const q = ($('searchInput') || { value: '' }).value.trim().toLowerCase();
  const t = ($('typeFilter')  || { value: 'all' }).value;
  const c = ($('catFilter')   || { value: 'all' }).value;
  const m = $('monthFilter').value;

  return State.txns
    .filter(x =>
      (q === '' || x.desc.toLowerCase().includes(q) || x.cat.toLowerCase().includes(q)) &&
      (t === 'all' || x.type === t) &&
      (c === 'all' || x.cat === c) &&
      (m === 'all' || x.month === m)
    )
    .sort((a, b) => {
      let av = a[State.sortField];
      let bv = b[State.sortField];
      if (State.sortField === 'amount') { av = Number(av); bv = Number(bv); }
      if (av < bv) return State.sortDir;
      if (av > bv) return -State.sortDir;
      return 0;
    });
}

function populateCatFilter() {
  const sel = $('catFilter');
  if (!sel) return;
  const cats = [...new Set(State.txns.map(t => t.cat))].sort();
  sel.innerHTML = '<option value="all">All Categories</option>' +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

/* ============================
   OVERVIEW
   ============================ */
function renderOverview() {
  const filtered = getFiltered();
  const summary  = DataUtils.summarise(filtered);

  renderSummaryCards(summary, filtered);
  renderTrendChart(filtered);
  renderDonutChart(filtered);
  renderBarChart(filtered);
  renderLineChart(filtered);
}

function renderSummaryCards(summary, filtered) {
  const grid = $('summaryGrid');
  if (!grid) return;

  const cards = [
    {
      cls: 'balance',
      icon: '◈',
      label: 'Net Balance',
      value: DataUtils.fmt(summary.balance),
      delta: summary.savingsRate + '% savings rate',
      deltaClass: summary.balance >= 0 ? 'delta-up' : 'delta-down',
    },
    {
      cls: 'income',
      icon: '↑',
      label: 'Total Income',
      value: DataUtils.fmt(summary.income),
      delta: filtered.filter(t => t.type === 'income').length + ' transactions',
      deltaClass: 'delta-up',
    },
    {
      cls: 'expense',
      icon: '↓',
      label: 'Total Expenses',
      value: DataUtils.fmt(summary.expense),
      delta: filtered.filter(t => t.type === 'expense').length + ' transactions',
      deltaClass: 'delta-down',
    },
    {
      cls: 'txn-count',
      icon: '≡',
      label: 'Transactions',
      value: filtered.length,
      delta: 'filtered view',
      deltaClass: '',
    },
  ];

  grid.innerHTML = cards.map(c => `
    <div class="summary-card ${c.cls}">
      <div class="sc-icon">${c.icon}</div>
      <div class="sc-label">${c.label}</div>
      <div class="sc-value">${c.value}</div>
      <div class="sc-delta ${c.deltaClass}">${c.delta}</div>
    </div>
  `).join('');
}

/* ============================
   CHARTS
   ============================ */
function destroyChart(key) {
  if (State.charts[key]) {
    State.charts[key].destroy();
    delete State.charts[key];
  }
}

function chartColors() {
  const dark = document.documentElement.dataset.theme === 'dark';
  return {
    textColor: dark ? '#9a9a8a' : '#9a9a8e',
    gridColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    income:    '#1a7a46',
    expense:   '#b53a2f',
    accent:    '#1a5c38',
    incomeAlpha:  dark ? 'rgba(26,122,70,0.12)' : 'rgba(26,122,70,0.08)',
    accentAlpha:  dark ? 'rgba(26,92,56,0.15)'  : 'rgba(26,92,56,0.08)',
  };
}

function axisDefaults(cc) {
  return {
    x: {
      ticks: { color: cc.textColor, font: { size: 11, family: 'DM Sans' } },
      grid:  { color: cc.gridColor },
      border:{ display: false },
    },
    y: {
      ticks: { color: cc.textColor, font: { size: 11, family: 'DM Sans' } },
      grid:  { color: cc.gridColor },
      border:{ display: false },
    },
  };
}

function renderTrendChart(filtered) {
  const cc        = chartColors();
  const monthData = DataUtils.byMonth(filtered, State.months);
  const balances  = monthData.map(d => d.income - d.expense);

  destroyChart('trend');
  const ctx = $('trendChart');
  if (!ctx) return;

  State.charts.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: State.months,
      datasets: [{
        label: 'Balance',
        data: balances,
        borderColor: cc.accent,
        backgroundColor: cc.accentAlpha,
        tension: 0.42,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: cc.accent,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + DataUtils.fmt(ctx.raw),
          },
        },
      },
      scales: {
        ...axisDefaults(cc),
        y: {
          ...axisDefaults(cc).y,
          ticks: {
            ...axisDefaults(cc).y.ticks,
            callback: v => '₹' + (Math.round(v) / 1000).toFixed(0) + 'k',
          },
        },
      },
    },
  });

  // Legend
  const legend = $('trendLegend');
  if (legend) {
    legend.innerHTML = `
      <div class="legend-item">
        <span class="legend-dot" style="background:${cc.accent}"></span>
        Net balance
      </div>`;
  }
}

function renderDonutChart(filtered) {
  const cc      = chartColors();
  const catData = DataUtils.byCategory(filtered).slice(0, 6);
  const cats    = catData.map(d => d.cat);
  const vals    = catData.map(d => d.total);
  const clrs    = cats.map(c => (CATEGORIES[c] || CATEGORIES.Other).color);
  const total   = vals.reduce((a, b) => a + b, 0);

  destroyChart('donut');
  const ctx = $('donutChart');
  if (!ctx) return;

  State.charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data: vals, backgroundColor: clrs, borderWidth: 0, hoverOffset: 5 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + DataUtils.fmt(ctx.raw) } },
      },
    },
  });

  const legend = $('donutLegend');
  if (legend) {
    legend.innerHTML = catData.map((d, i) => `
      <div class="dl-item">
        <span class="dl-left">
          <span class="dl-dot" style="background:${clrs[i]}"></span>${d.cat}
        </span>
        <span class="dl-pct">${total > 0 ? Math.round((d.total / total) * 100) : 0}%</span>
      </div>
    `).join('');
  }
}

function renderBarChart(filtered) {
  const cc        = chartColors();
  const monthData = DataUtils.byMonth(filtered, State.months);

  destroyChart('bar');
  const ctx = $('barChart');
  if (!ctx) return;

  State.charts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: State.months,
      datasets: [
        {
          label: 'Income',
          data: monthData.map(d => d.income),
          backgroundColor: 'rgba(26,122,70,0.75)',
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: monthData.map(d => d.expense),
          backgroundColor: 'rgba(181,58,47,0.7)',
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + DataUtils.fmt(ctx.raw) } },
      },
      scales: {
        ...axisDefaults(cc),
        y: {
          ...axisDefaults(cc).y,
          ticks: {
            ...axisDefaults(cc).y.ticks,
            callback: v => '₹' + (Math.round(v) / 1000).toFixed(0) + 'k',
          },
        },
        x: { ...axisDefaults(cc).x, ticks: { ...axisDefaults(cc).x.ticks, autoSkip: false } },
      },
    },
  });
}

function renderLineChart(filtered) {
  const cc      = chartColors();
  const daily   = DataUtils.dailySpend(filtered, 14);

  destroyChart('line');
  const ctx = $('lineChart');
  if (!ctx) return;

  State.charts.line = new Chart(ctx, {
    type: 'line',
    data: {
      labels: daily.map(d => d.date),
      datasets: [{
        label: 'Spending',
        data: daily.map(d => d.spend),
        borderColor: '#1565c0',
        backgroundColor: 'rgba(21,101,192,0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#1565c0',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + DataUtils.fmt(ctx.raw) } },
      },
      scales: {
        ...axisDefaults(cc),
        y: {
          ...axisDefaults(cc).y,
          ticks: {
            ...axisDefaults(cc).y.ticks,
            callback: v => '₹' + (Math.round(v) / 1000).toFixed(1) + 'k',
          },
        },
        x: {
          ...axisDefaults(cc).x,
          ticks: { ...axisDefaults(cc).x.ticks, maxRotation: 45 },
        },
      },
    },
  });
}

/* ============================
   TRANSACTIONS VIEW
   ============================ */
function renderTxns() {
  const filtered = getFiltered();
  const body     = $('txnBody');
  const empty    = $('txnEmpty');
  const count    = $('tableCount');

  if (!body) return;

  if (filtered.length === 0) {
    body.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    if (count) count.textContent = 'No results';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (count) count.textContent = `Showing ${filtered.length} of ${State.txns.length} transactions`;

  const isAdmin = State.role === 'admin';

  body.innerHTML = filtered.map(t => {
    const cat = CATEGORIES[t.cat] || CATEGORIES.Other;
    return `
      <tr>
        <td><span class="txn-date">${t.date}</span></td>
        <td><span class="txn-desc">${escHtml(t.desc)}</span></td>
        <td class="hide-sm">
          <span class="cat-pill" style="background:${cat.bg};color:${cat.color};">${t.cat}</span>
        </td>
        <td class="hide-sm">
          <span class="type-badge ${t.type}">${t.type === 'income' ? '↑' : '↓'} ${t.type}</span>
        </td>
        <td class="${t.type === 'income' ? 'amount-income' : 'amount-expense'}">
          ${DataUtils.fmtSigned(t.amount, t.type)}
        </td>
        ${isAdmin ? `<td class="admin-only hide-sm">
          <button class="btn-edit" onclick="openModal(${t.id})">Edit</button>
        </td>` : ''}
      </tr>
    `;
  }).join('');
}

/* ============================
   INSIGHTS VIEW
   ============================ */
function renderInsights() {
  const filtered = getFiltered();
  const summary  = DataUtils.summarise(filtered);
  const catData  = DataUtils.byCategory(filtered);

  const topCat      = catData[0] || null;
  const monthData   = DataUtils.byMonth(filtered, State.months);
  const monthExp    = monthData.map(d => d.expense);
  const maxMonthIdx = monthExp.indexOf(Math.max(...monthExp));
  const avgExpTxn   = filtered.filter(t => t.type === 'expense').length > 0
    ? Math.round(summary.expense / filtered.filter(t => t.type === 'expense').length) : 0;

  const grid = $('insightsGrid');
  if (!grid) return;

  const cards = [
    {
      label: 'Top Spending Category',
      value: topCat ? topCat.cat : '—',
      sub:   topCat ? DataUtils.fmt(topCat.total) + ' total spent' : 'No data',
      color: topCat ? (CATEGORIES[topCat.cat] || CATEGORIES.Other).color : null,
      delay: 0.05,
    },
    {
      label: 'Savings Rate',
      value: summary.savingsRate + '%',
      sub:   summary.savingsRate >= 30
        ? 'Excellent! Above target'
        : summary.savingsRate >= 10
          ? 'Good — room to improve'
          : 'Below 10% — review expenses',
      color: summary.savingsRate >= 30 ? '#1a7a46' : summary.savingsRate >= 10 ? '#c07a00' : '#b53a2f',
      bar:   Math.min(summary.savingsRate, 100),
      delay: 0.10,
    },
    {
      label: 'Heaviest Spending Month',
      value: State.months[maxMonthIdx] || '—',
      sub:   monthExp[maxMonthIdx] > 0 ? DataUtils.fmt(monthExp[maxMonthIdx]) + ' in expenses' : 'No data',
      delay: 0.15,
    },
    {
      label: 'Avg Expense Transaction',
      value: avgExpTxn > 0 ? DataUtils.fmt(avgExpTxn) : '—',
      sub:   'per expense entry',
      delay: 0.20,
    },
    {
      label: 'Net Cash Flow',
      value: DataUtils.fmt(summary.balance),
      sub:   summary.balance >= 0 ? 'Positive cash flow ↑' : 'Negative cash flow ↓',
      color: summary.balance >= 0 ? '#1a7a46' : '#b53a2f',
      delay: 0.25,
    },
    {
      label: 'Total Transactions',
      value: filtered.length,
      sub:   filtered.filter(t => t.type === 'income').length + ' income · ' +
             filtered.filter(t => t.type === 'expense').length + ' expense',
      delay: 0.30,
    },
  ];

  grid.innerHTML = cards.map(c => `
    <div class="insight-card" style="animation-delay:${c.delay}s">
      <div class="ic-label">${c.label}</div>
      <div class="ic-value" style="${c.color ? 'color:' + c.color : ''}">${c.value}</div>
      <div class="ic-sub">${c.sub}</div>
      ${c.bar !== undefined ? `
        <div class="savings-track">
          <div class="savings-fill" style="width:${c.bar}%"></div>
        </div>` : ''}
    </div>
  `).join('');

  renderCompareChart(filtered);
  renderHorizChart(filtered);
}

function renderCompareChart(filtered) {
  const cc        = chartColors();
  const monthData = DataUtils.byMonth(filtered, State.months);

  destroyChart('compare');
  const ctx = $('compareChart');
  if (!ctx) return;

  State.charts.compare = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: State.months,
      datasets: [
        {
          label: 'Income',
          data: monthData.map(d => d.income),
          backgroundColor: 'rgba(26,122,70,0.75)',
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: monthData.map(d => d.expense),
          backgroundColor: 'rgba(181,58,47,0.7)',
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + DataUtils.fmt(ctx.raw) } },
      },
      scales: {
        ...axisDefaults(cc),
        y: {
          ...axisDefaults(cc).y,
          ticks: {
            ...axisDefaults(cc).y.ticks,
            callback: v => '₹' + (Math.round(v) / 1000).toFixed(0) + 'k',
          },
        },
      },
    },
  });
}

function renderHorizChart(filtered) {
  const cc      = chartColors();
  const catData = DataUtils.byCategory(filtered);
  const cats    = catData.map(d => d.cat);
  const vals    = catData.map(d => d.total);
  const clrs    = cats.map(c => (CATEGORIES[c] || CATEGORIES.Other).color);

  destroyChart('horiz');
  const ctx = $('horizChart');
  if (!ctx) return;

  State.charts.horiz = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [{
        data: vals,
        backgroundColor: clrs,
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + DataUtils.fmt(ctx.raw) } },
      },
      scales: {
        ...axisDefaults(cc),
        x: {
          ...axisDefaults(cc).x,
          ticks: {
            ...axisDefaults(cc).x.ticks,
            callback: v => '₹' + (Math.round(v) / 1000).toFixed(0) + 'k',
          },
        },
        y: { ...axisDefaults(cc).y, grid: { display: false } },
      },
    },
  });
}

/* ============================
   MODAL
   ============================ */
function openModal(id = null) {
  State.editId = id;
  $('modalTitle').textContent = id ? 'Edit Transaction' : 'Add Transaction';

  if (id) {
    const t = State.txns.find(x => x.id === id);
    if (!t) return;
    $('fDate').value   = t.date;
    $('fAmount').value = t.amount;
    $('fDesc').value   = t.desc;
    $('fCat').value    = t.cat;
    $('fType').value   = t.type;
  } else {
    $('fDate').value   = new Date().toISOString().slice(0, 10);
    $('fAmount').value = '';
    $('fDesc').value   = '';
    $('fCat').value    = 'Food';
    $('fType').value   = 'expense';
  }

  $('modalOverlay').classList.add('open');
  setTimeout(() => $('fDesc').focus(), 80);
}

function closeModal() {
  $('modalOverlay').classList.remove('open');
  State.editId = null;
}

function saveTransaction() {
  const date   = $('fDate').value;
  const amount = parseFloat($('fAmount').value);
  const desc   = $('fDesc').value.trim();
  const cat    = $('fCat').value;
  const type   = $('fType').value;

  // Validation
  if (!date || !amount || amount <= 0 || !desc) {
    showToast('Please fill in all fields correctly.', 'error');
    return;
  }

  const month = DataUtils.getMonth(date);

  if (State.editId) {
    const idx = State.txns.findIndex(t => t.id === State.editId);
    if (idx !== -1) {
      State.txns[idx] = { ...State.txns[idx], date, amount, desc, cat, type, month };
    }
  } else {
    State.txns.push({ id: DataUtils.nextId(State.txns), date, amount, desc, cat, type, month });
    populateCatFilter();
  }

  Storage.saveTxns(State.txns);
  closeModal();
  render();
  showToast(State.editId ? 'Transaction updated.' : 'Transaction added.');
}

/* ============================
   ROLE MANAGEMENT
   ============================ */
function applyRole(role) {
  const isAdmin = role === 'admin';
  $$('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  const badge = $('roleBadge');
  if (badge) {
    badge.textContent = isAdmin ? 'Admin' : 'Viewer';
    badge.className   = 'role-badge' + (isAdmin ? '' : ' viewer');
  }
}

/* ============================
   THEME
   ============================ */
function applyTheme(theme, save) {
  State.theme = theme;
  document.documentElement.dataset.theme = theme;

  const sun  = $('iconSun');
  const moon = $('iconMoon');
  if (sun)  sun.style.display  = theme === 'light' ? 'block' : 'none';
  if (moon) moon.style.display = theme === 'dark'  ? 'block' : 'none';

  if (save) {
    Storage.saveTheme(theme);
    // Re-render charts with updated colors
    if (State.view === 'overview')     renderOverview();
    if (State.view === 'insights')     renderInsights();
  }
}

/* ============================
   EXPORT
   ============================ */
function exportCSV() {
  const filtered = getFiltered();
  const headers  = ['Date', 'Description', 'Category', 'Type', 'Amount (₹)'];
  const rows     = filtered.map(t => [t.date, `"${t.desc}"`, t.cat, t.type, t.amount]);

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `fynance_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${filtered.length} transactions.`);
}

/* ============================
   TOAST NOTIFICATIONS
   ============================ */
function showToast(msg, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    Object.assign(container.style, {
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: '999', display: 'flex', flexDirection: 'column', gap: '10px',
    });
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  Object.assign(toast.style, {
    background: type === 'error' ? '#b53a2f' : '#1a5c38',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    opacity: '0',
    transform: 'translateY(8px)',
    transition: 'all 0.2s ease',
  });
  toast.textContent = msg;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

/* ============================
   UTILS
   ============================ */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}