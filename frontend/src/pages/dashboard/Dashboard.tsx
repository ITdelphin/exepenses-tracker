import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiPlus, FiRefreshCw, FiCalendar, FiInbox } from 'react-icons/fi';
import { reportAPI, expenseAPI } from '../../api/axios';
import { DashboardStats, Expense } from '../../types';
import StatCard from '../../components/UI/StatCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface TrendData {
  month: string;
  year: number;
  income: number;
  expenses: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ categoryName: string; total: number }[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportAPI.getDashboard(),
      reportAPI.getTrends(),
      expenseAPI.getSummary(),
      expenseAPI.getAll({ limit: 5 }),
    ]).then(([statsRes, trendsRes, summaryRes, expRes]) => {
      setStats(statsRes.data.data);
      setTrends(trendsRes.data.data || []);
      setCategoryBreakdown(summaryRes.data.data?.categoryBreakdown || []);
      setRecentExpenses(expRes.data.data.expenses || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
          <FiInbox size={36} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No data yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">Start tracking your expenses and income to see insights here.</p>
        <button onClick={() => navigate('/expenses')} className="btn-primary">Add Expense</button>
      </div>
    );
  }

  const netWorth = stats.balance;
  const savingsRate = stats.monthlyIncome > 0 ? ((stats.monthlySavings / stats.monthlyIncome) * 100) : 0;

  const pieData = [
    { name: 'Expenses', value: stats.monthlyExpenses || 0 },
    { name: 'Savings', value: Math.max(0, stats.monthlySavings || 0) },
  ];

  const barData = [
    { name: 'Income', amount: stats.monthlyIncome || 0 },
    { name: 'Expenses', amount: stats.monthlyExpenses || 0 },
    { name: 'Savings', amount: Math.max(0, stats.monthlySavings || 0) },
  ];

  const latestTrend = trends.length > 0 ? trends[trends.length - 1] : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/expenses?add=true')} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <FiPlus size={16} /> Add Expense
          </button>
          <button onClick={() => navigate('/income?add=true')} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
            <FiPlus size={16} /> Add Income
          </button>
          <button onClick={() => window.location.reload()} className="btn-secondary p-2">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Net Worth Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary-100 text-sm font-medium flex items-center gap-2">
              <FiCalendar size={14} /> Net Worth
            </p>
            <p className="text-3xl sm:text-4xl font-bold mt-1">
              ${Math.abs(netWorth).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-primary-100 text-sm mt-1">
              {netWorth >= 0 ? 'You are in good financial standing' : 'You are in debt'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${netWorth >= 0 ? 'bg-green-300' : 'bg-red-300'}`} />
            <span className="text-sm font-semibold">{netWorth >= 0 ? 'POSITIVE' : 'NEGATIVE'}</span>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Income" value={stats.totalIncome || 0} icon={<FiTrendingUp size={22} className="text-white" />} color="bg-green-500" delay={0} />
        <StatCard title="Total Expenses" value={stats.totalExpenses || 0} icon={<FiTrendingDown size={22} className="text-white" />} color="bg-red-500" delay={0.1} />
        <StatCard title="Balance" value={netWorth || 0} icon={<FiDollarSign size={22} className="text-white" />} color="bg-primary-500" delay={0.2} subtitle={netWorth >= 0 ? 'Positive' : 'Negative'} />
        <StatCard title="Monthly Savings" value={Math.max(0, stats.monthlySavings || 0)} icon={<FiPieChart size={22} className="text-white" />} color="bg-purple-500" delay={0.3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar */}
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

        {/* Savings Rate Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending Breakdown</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {stats.monthlyIncome > 0 && (
            <div className="text-center mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Savings Rate: <span className={`font-bold ${savingsRate >= 20 ? 'text-green-500' : savingsRate > 0 ? 'text-yellow-500' : 'text-red-500'}`}>{savingsRate.toFixed(1)}%</span>
                {savingsRate >= 20 ? ' (Excellent!)' : savingsRate > 0 ? ' (Room for improvement)' : ' (Not saving!)'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly Trends Line Chart */}
      {trends.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Category Breakdown & Budget Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {categoryBreakdown.map((cat, i) => (
                <div key={cat.categoryName} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{cat.categoryName}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">${cat.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Budget Status */}
        {stats.budgetStatus && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Overall Budget Usage</span>
                <span className={`font-bold ${stats.budgetStatus.usagePercent > 80 ? 'text-red-500' : stats.budgetStatus.usagePercent > 60 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {stats.budgetStatus.usagePercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, stats.budgetStatus.usagePercent)}%`,
                    background: stats.budgetStatus.usagePercent > 80
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : stats.budgetStatus.usagePercent > 60
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                      : 'linear-gradient(90deg, #22c55e, #16a34a)'
                  }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Spent: ${stats.budgetStatus.totalSpent.toFixed(2)}</span>
                <span className="text-gray-500 dark:text-gray-400">Budget: ${stats.budgetStatus.totalBudget.toFixed(2)}</span>
              </div>
              {stats.budgetStatus.remaining > 0 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  ${stats.budgetStatus.remaining.toFixed(2)} remaining
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Expenses</h3>
            <button onClick={() => navigate('/expenses')} className="text-xs text-primary-600 hover:text-primary-700 font-semibold">View All</button>
          </div>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Insights</h3>
          </div>
          <div className="space-y-4">
            {latestTrend && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-1">{latestTrend.month} {latestTrend.year}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
                  <span className="text-sm font-bold text-green-600">+${latestTrend.income.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
                  <span className="text-sm font-bold text-red-600">-${latestTrend.expenses.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net</span>
                  <span className={`text-sm font-bold ${(latestTrend.income - latestTrend.expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(latestTrend.income - latestTrend.expenses).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/reports')} className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                <p className="text-xs font-bold text-primary-600">Reports</p>
              </button>
              <button onClick={() => navigate('/budgets')} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <p className="text-xs font-bold text-green-600">Budgets</p>
              </button>
              <button onClick={() => navigate('/goals')} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                <p className="text-xs font-bold text-purple-600">Goals</p>
              </button>
              <button onClick={() => navigate('/ai-insights')} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                <p className="text-xs font-bold text-indigo-600">AI Insights</p>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
