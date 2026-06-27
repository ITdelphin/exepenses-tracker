import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiRefreshCw } from 'react-icons/fi';
import { reportAPI, expenseAPI, incomeAPI } from '../../api/axios';
import { DashboardStats, Expense, Income } from '../../types';
import StatCard from '../../components/UI/StatCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [recentIncomes, setRecentIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportAPI.getDashboard(),
      expenseAPI.getAll({ limit: 5 }),
      incomeAPI.getAll({ limit: 5 }),
    ]).then(([statsRes, expRes, incRes]) => {
      setStats(statsRes.data.data);
      setRecentExpenses(expRes.data.data.expenses || []);
      setRecentIncomes(incRes.data.data.incomes || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  // Generate sample chart data from stats
  const pieData = [
    { name: 'Expenses', value: stats?.monthlyExpenses || 0 },
    { name: 'Savings', value: Math.max(0, stats?.monthlySavings || 0) },
  ];

  const barData = [
    { name: 'Income', amount: stats?.monthlyIncome || 0 },
    { name: 'Expenses', amount: stats?.monthlyExpenses || 0 },
    { name: 'Savings', amount: Math.max(0, stats?.monthlySavings || 0) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your financial overview</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-secondary flex items-center gap-2">
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Income" value={stats?.totalIncome || 0} icon={<FiTrendingUp size={22} className="text-white" />} color="bg-green-500" delay={0} />
        <StatCard title="Total Expenses" value={stats?.totalExpenses || 0} icon={<FiTrendingDown size={22} className="text-white" />} color="bg-red-500" delay={0.1} />
        <StatCard title="Balance" value={stats?.balance || 0} icon={<FiDollarSign size={22} className="text-white" />} color="bg-primary-500" delay={0.2} subtitle={stats && stats.balance >= 0 ? 'Positive' : 'Negative'} />
        <StatCard title="Monthly Savings" value={Math.max(0, stats?.monthlySavings || 0)} icon={<FiPieChart size={22} className="text-white" />} color="bg-purple-500" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Budget Status */}
      {stats?.budgetStatus && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Overall Budget Usage</span>
              <span className="font-medium text-gray-900 dark:text-white">{stats.budgetStatus.usagePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, stats.budgetStatus.usagePercent)}%`, background: stats.budgetStatus.usagePercent > 80 ? '#ef4444' : stats.budgetStatus.usagePercent > 60 ? '#f59e0b' : '#22c55e' }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Spent: ${stats.budgetStatus.totalSpent.toFixed(2)}</span>
              <span className="text-gray-500 dark:text-gray-400">Budget: ${stats.budgetStatus.totalBudget.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {recentExpenses.slice(0, 4).map((exp) => (
              <div key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-sm">{exp.category?.icon || '💳'}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{exp.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-red-600">-${exp.amount.toFixed(2)}</span>
              </div>
            ))}
            {recentExpenses.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No expenses yet</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Income</h3>
          <div className="space-y-3">
            {recentIncomes.slice(0, 4).map((inc) => (
              <div key={inc.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm">{inc.category?.icon || '💰'}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{inc.source}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(inc.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">+${inc.amount.toFixed(2)}</span>
              </div>
            ))}
            {recentIncomes.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No income yet</p>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
