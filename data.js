/* =========================================================
   FYNANCE — data.js
   Mock transaction data, category config, and data helpers
   ========================================================= */

'use strict';

// ---- Category config ----
const CATEGORIES = {
  Food:          { color: '#2e7d52', bg: '#e8f5ee' },
  Transport:     { color: '#1565c0', bg: '#e3f0fc' },
  Entertainment: { color: '#6a1b9a', bg: '#f3e8fb' },
  Shopping:      { color: '#e65100', bg: '#fdeee6' },
  Utilities:     { color: '#00838f', bg: '#e0f5f7' },
  Health:        { color: '#c62828', bg: '#fce8e8' },
  Salary:        { color: '#1a5c38', bg: '#e8f2ec' },
  Freelance:     { color: '#4527a0', bg: '#ede8fc' },
  Other:         { color: '#546e7a', bg: '#eceff1' },
};

// ---- Seed transactions ----
const SEED_TRANSACTIONS = [
  // January
  { id: 1,  date: '2024-01-05', desc: 'Salary — January',       cat: 'Salary',        type: 'income',  amount: 85000, month: 'Jan' },
  { id: 2,  date: '2024-01-08', desc: 'Swiggy Order',            cat: 'Food',          type: 'expense', amount: 650,   month: 'Jan' },
  { id: 3,  date: '2024-01-10', desc: 'Metro Card Recharge',     cat: 'Transport',     type: 'expense', amount: 500,   month: 'Jan' },
  { id: 4,  date: '2024-01-12', desc: 'Electricity Bill',        cat: 'Utilities',     type: 'expense', amount: 2200,  month: 'Jan' },
  { id: 5,  date: '2024-01-18', desc: 'Freelance Project A',     cat: 'Freelance',     type: 'income',  amount: 15000, month: 'Jan' },
  { id: 6,  date: '2024-01-20', desc: 'Amazon Shopping',         cat: 'Shopping',      type: 'expense', amount: 3400,  month: 'Jan' },
  { id: 7,  date: '2024-01-22', desc: 'Movie Tickets',           cat: 'Entertainment', type: 'expense', amount: 800,   month: 'Jan' },
  { id: 8,  date: '2024-01-25', desc: 'Pharmacy',                cat: 'Health',        type: 'expense', amount: 1200,  month: 'Jan' },
  { id: 9,  date: '2024-01-28', desc: 'Zomato — Dinner',         cat: 'Food',          type: 'expense', amount: 1100,  month: 'Jan' },
  { id: 10, date: '2024-01-30', desc: 'Grocery — BigBasket',     cat: 'Food',          type: 'expense', amount: 2400,  month: 'Jan' },

  // February
  { id: 11, date: '2024-02-01', desc: 'Salary — February',       cat: 'Salary',        type: 'income',  amount: 85000, month: 'Feb' },
  { id: 12, date: '2024-02-04', desc: 'Gym Membership',          cat: 'Health',        type: 'expense', amount: 2000,  month: 'Feb' },
  { id: 13, date: '2024-02-07', desc: 'Cab to Airport',          cat: 'Transport',     type: 'expense', amount: 1800,  month: 'Feb' },
  { id: 14, date: '2024-02-10', desc: 'Grocery — Zepto',         cat: 'Food',          type: 'expense', amount: 3200,  month: 'Feb' },
  { id: 15, date: '2024-02-14', desc: 'Netflix + Hotstar',       cat: 'Entertainment', type: 'expense', amount: 1200,  month: 'Feb' },
  { id: 16, date: '2024-02-16', desc: 'Freelance Project B',     cat: 'Freelance',     type: 'income',  amount: 22000, month: 'Feb' },
  { id: 17, date: '2024-02-18', desc: 'Clothing — Myntra',       cat: 'Shopping',      type: 'expense', amount: 4500,  month: 'Feb' },
  { id: 18, date: '2024-02-24', desc: 'Internet Bill',           cat: 'Utilities',     type: 'expense', amount: 1199,  month: 'Feb' },
  { id: 19, date: '2024-02-26', desc: 'Doctor Visit',            cat: 'Health',        type: 'expense', amount: 700,   month: 'Feb' },
  { id: 20, date: '2024-02-28', desc: 'Fuel Refill',             cat: 'Transport',     type: 'expense', amount: 2800,  month: 'Feb' },

  // March
  { id: 21, date: '2024-03-01', desc: 'Salary — March',          cat: 'Salary',        type: 'income',  amount: 85000, month: 'Mar' },
  { id: 22, date: '2024-03-05', desc: 'Barbeque Nation Dinner',  cat: 'Food',          type: 'expense', amount: 2800,  month: 'Mar' },
  { id: 23, date: '2024-03-08', desc: 'Fuel Refill',             cat: 'Transport',     type: 'expense', amount: 3500,  month: 'Mar' },
  { id: 24, date: '2024-03-12', desc: 'Concert Tickets',         cat: 'Entertainment', type: 'expense', amount: 5000,  month: 'Mar' },
  { id: 25, date: '2024-03-15', desc: 'Design Gig — Client C',   cat: 'Freelance',     type: 'income',  amount: 18000, month: 'Mar' },
  { id: 26, date: '2024-03-19', desc: 'Sony Headphones',         cat: 'Shopping',      type: 'expense', amount: 8000,  month: 'Mar' },
  { id: 27, date: '2024-03-22', desc: 'Dentist Visit',           cat: 'Health',        type: 'expense', amount: 800,   month: 'Mar' },
  { id: 28, date: '2024-03-24', desc: 'Water Purifier Service',  cat: 'Utilities',     type: 'expense', amount: 600,   month: 'Mar' },
  { id: 29, date: '2024-03-27', desc: 'Grocery — DMart',         cat: 'Food',          type: 'expense', amount: 1900,  month: 'Mar' },
  { id: 30, date: '2024-03-29', desc: 'Ola Ride — Monthly',      cat: 'Transport',     type: 'expense', amount: 1200,  month: 'Mar' },

  // April
  { id: 31, date: '2024-04-01', desc: 'Salary — April',          cat: 'Salary',        type: 'income',  amount: 85000, month: 'Apr' },
  { id: 32, date: '2024-04-03', desc: 'Swiggy Breakfast',        cat: 'Food',          type: 'expense', amount: 420,   month: 'Apr' },
  { id: 33, date: '2024-04-06', desc: 'Ola Ride',                cat: 'Transport',     type: 'expense', amount: 350,   month: 'Apr' },
  { id: 34, date: '2024-04-08', desc: 'Spotify + Prime Bundle',  cat: 'Entertainment', type: 'expense', amount: 399,   month: 'Apr' },
  { id: 35, date: '2024-04-10', desc: 'Web Dev Project',         cat: 'Freelance',     type: 'income',  amount: 30000, month: 'Apr' },
  { id: 36, date: '2024-04-12', desc: 'Noise Smartwatch',        cat: 'Shopping',      type: 'expense', amount: 5500,  month: 'Apr' },
  { id: 37, date: '2024-04-15', desc: 'Medicines',               cat: 'Health',        type: 'expense', amount: 950,   month: 'Apr' },
  { id: 38, date: '2024-04-18', desc: 'Mobile Bill',             cat: 'Utilities',     type: 'expense', amount: 699,   month: 'Apr' },
  { id: 39, date: '2024-04-22', desc: 'Dining Out',              cat: 'Food',          type: 'expense', amount: 1800,  month: 'Apr' },
  { id: 40, date: '2024-04-26', desc: 'Grocery Run',             cat: 'Food',          type: 'expense', amount: 2200,  month: 'Apr' },
];

// ---- Storage helpers ----
const Storage = {
  KEYS: { txns: 'fynance_txns', role: 'fynance_role', theme: 'fynance_theme' },

  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },

  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },

  loadTxns() {
    return this.get(this.KEYS.txns) || SEED_TRANSACTIONS;
  },

  saveTxns(txns) {
    this.set(this.KEYS.txns, txns);
  },

  loadRole()  { return this.get(this.KEYS.role) || 'admin'; },
  saveRole(r) { this.set(this.KEYS.role, r); },

  loadTheme()  { return this.get(this.KEYS.theme) || 'light'; },
  saveTheme(t) { this.set(this.KEYS.theme, t); },
};

// ---- Data helpers ----
const DataUtils = {
  fmt(n) {
    return '₹' + Math.abs(Math.round(n)).toLocaleString('en-IN');
  },

  fmtSigned(amount, type) {
    return (type === 'income' ? '+ ' : '− ') + this.fmt(amount);
  },

  getMonth(dateStr) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[new Date(dateStr).getMonth()];
  },

  summarise(txns) {
    const income  = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
    return { income, expense, balance, savingsRate, count: txns.length };
  },

  byCategory(txns) {
    const map = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      map[t.cat] = (map[t.cat] || 0) + t.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, total]) => ({ cat, total }));
  },

  byMonth(txns, months) {
    return months.map(m => {
      const mt = txns.filter(t => t.month === m);
      return {
        month: m,
        income:  mt.filter(t => t.type === 'income').reduce((s, t)  => s + t.amount, 0),
        expense: mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
  },

  dailySpend(txns, days = 14) {
    const all = [...new Set(txns.map(t => t.date))].sort().slice(-days);
    return all.map(d => ({
      date:  d.slice(5),
      spend: txns.filter(t => t.date === d && t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }));
  },

  nextId(txns) {
    return txns.length ? Math.max(...txns.map(t => t.id)) + 1 : 1;
  },
};