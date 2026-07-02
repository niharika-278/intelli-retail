import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import BentoGrid from '../components/BentoGrid';
import BentoCard from '../components/BentoCard';
import StatCard from '../components/StatCard';

const KPI_CARDS = [
  { key: 'totalRevenue', label: 'Total Revenue', format: (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, variant: 'coral' },
  { key: 'totalOrders', label: 'Total Orders', format: (v) => String(v), variant: 'neon' },
  { key: 'activeCustomers', label: 'Active Customers', format: (v) => String(v), variant: 'violet' },
  { key: 'lowStockItems', label: 'Low Stock Items', format: (v) => String(v), variant: 'sun' },
  { key: 'expiredOrNearExpiry', label: 'Expired / Near Expiry', format: (v) => String(v), variant: 'pink' },
];

const COLORS = ['#10B981','#8B5CF6', '#F97316', '#EAB308','#06D6A0', '#06B6D4', '#EF4444', '#3E6BC9'];

function EmptyChart({ message = 'No data available', dark = false }) {
  return (
    <div className={`h-80 flex flex-col items-center justify-center gap-2 ${dark ? 'text-white/40' : 'text-ink/40'}`}>
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
        <div className="w-10 h-10 border-2 border-ink/20 border-t-violet rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <BentoCard span="full" variant="coral" className="!col-span-full">
        <p className="font-medium">{error}</p>
      </BentoCard>
    );
  }

  const { kpis, popularCategories, salesByDay, revenueTrend } = data || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-bento-lg"
    >
      <BentoGrid>
        <BentoCard span="full" variant="ink" emphasis className="!col-span-full">
          <h1 className="font-display text-3xl md:text-3xl font-bold tracking-tight">Today&apos;s pulse</h1>
          <p className="mt-1 opacity-70">Analytics overview for your retail operation</p>
        </BentoCard>
      </BentoGrid>

      <BentoGrid>
        {KPI_CARDS.map(({ key, label, format, variant }) => (
          <StatCard
            key={key}
            label={label}
            value={kpis?.[key] ?? 0}
            format={format}
            variant={variant}
            animateNumber={typeof kpis?.[key] === 'number'}
          />
        ))}
      </BentoGrid>

      <BentoGrid>
        <BentoCard span="3x2" variant="lightpink" className="min-h-[360px]">
          <h2 className="font-display text-2xl font-bold mb-4 p-4">Popular categories</h2>
          {(!popularCategories || popularCategories.length === 0) ? (
            <EmptyChart message="No category sales data yet" dark />
          ) : (
            <div className="h-72 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularCategories || []}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name }) => name}
                  >
                    {(popularCategories || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </BentoCard>

        <BentoCard span="2x2" variant="cyan" className="min-h-[360px]">
          <h2 className="font-display text-2xl font-bold mb-4 p-4">Sales (Last 90 days)</h2>
          {(!salesByDay || salesByDay.length === 0) ? (
            <EmptyChart message="No sales in the last 30 days" />
          ) : (
            <div className="h-72 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByDay || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={formatDate} interval={4} />
                  <YAxis domain={[0, 2500]} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} labelFormatter={(v) => `Date: ${formatDate(v)}`} />
                  <Bar dataKey="amount" fill="#0FAD72" radius={[4, 4, 0, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </BentoCard>
      </BentoGrid>

      <BentoGrid>
        <BentoCard span="full" variant="ink" className="!col-span-full min-h-[360px]">
          <h2 className="font-display text-3xl font-bold mb-5 p-6">Revenue trend</h2>
          {(!revenueTrend || revenueTrend.length === 0) ? (
            <EmptyChart message="No revenue data in the last 90 days" dark />
          ) : (
            <div className="h-72 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend || []} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.88)' }} tickFormatter={formatDate} />
                  <YAxis domain={[0, 2500]} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '14px', border: 'none', opacity: 0.9}}
                    labelStyle={{ color: "#4a5c7a",fontWeight: 500}}
                    itemStyle={{ color: "#4a5c7a"}}
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                    labelFormatter={(v) => `Date: ${formatDate(v)}`}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#B8FF3C" strokeWidth={2.3} dot={{ r: 3.2, fill: '#B8FF3C' }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </BentoCard>
      </BentoGrid>
    </motion.div>
  );
}
