import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../services/api';

const KPI_CARDS = [
  { key: 'totalRevenue', label: 'Total Revenue', format: (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
  { key: 'totalOrders', label: 'Total Orders', format: (v) => String(v) },
  { key: 'activeCustomers', label: 'Active Customers', format: (v) => String(v) },
  { key: 'lowStockItems', label: 'Low Stock Items', format: (v) => String(v) },
  { key: 'expiredOrNearExpiry', label: 'Expired / Near Expiry', format: (v) => String(v) },
];

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

function EmptyChart({ message = 'No data available' }) {
  return (
    <div className="h-80 flex flex-col items-center justify-center text-surface-400 gap-2">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

const formatDate = (dateStr) => {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .getDashboard()
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-surface-300 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
        {error}
      </div>
    );
  }

  const { kpis, popularCategories, salesByDay, revenueTrend } = data || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Dashboard</h1>
        <p className="text-surface-500 mt-0.5">Analytics overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {KPI_CARDS.map(({ key, label, format }) => (
          <div
            key={key}
            className="bg-white rounded-xl border border-surface-200 shadow-card p-5 transition-shadow duration-250 hover:shadow-md"
          >
            <p className="text-sm font-medium text-surface-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-surface-900">
              {format(kpis?.[key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 shadow-card p-5">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Popular categories</h2>
          {(!popularCategories || popularCategories.length === 0) ? (
            <EmptyChart message="No category sales data yet" />
          ) : (
          <div className="h-80 w-full overflow-hidden" >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={popularCategories || []}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, total }) => name}
                >
                  {(popularCategories || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-surface-200 shadow-card p-5">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Sales by day (last 90 days)</h2>
          {(!salesByDay || salesByDay.length === 0) ? (
            <EmptyChart message="No sales in the last 30 days" />
          ) : (
          <div className="h-80 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={formatDate} interval={4} />
                <YAxis domain={[0, 15000]}tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} labelFormatter={(v) => `Date: ${formatDate(v)}`} />
                <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-card p-5">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Revenue trend</h2>
        {(!revenueTrend || revenueTrend.length === 0) ? (
          <EmptyChart message="No revenue data in the last 90 days" />
        ) : (
        <div className="h-80 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend || []} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={formatDate} />
              <YAxis domain={[0, 15000]} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} labelFormatter={(v) => `Date: ${formatDate(v)}`} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>
    </div>
  );
}