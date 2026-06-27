import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiDollarSign, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import { adminAPI } from '../../api/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface Analytics {
  totalUsers: number;
  totalExpensesAmount: number;
  totalExpensesCount: number;
  totalIncomeAmount: number;
  totalIncomeCount: number;
  activeUsers30Days: number;
  categoryBreakdown: { category: string; total: number; count: number }[];
}

export default function Admin() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const categoryData = analytics?.categoryBreakdown?.map(c => ({ name: c.category, value: c.total })) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">System analytics and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><FiUsers className="text-blue-600" size={20} /></div>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalUsers || 0}</p>
          <p className="text-xs text-gray-400">{analytics?.activeUsers30Days || 0} active this month</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center"><FiDollarSign className="text-red-600" size={20} /></div>
            <p className="text-sm text-gray-500">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-red-600">${(analytics?.totalExpensesAmount || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-400">{analytics?.totalExpensesCount || 0} transactions</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"><FiTrendingUp className="text-green-600" size={20} /></div>
            <p className="text-sm text-gray-500">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-green-600">${(analytics?.totalIncomeAmount || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-400">{analytics?.totalIncomeCount || 0} transactions</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"><FiPieChart className="text-purple-600" size={20} /></div>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoryData.length}</p>
        </div>
      </div>

      {/* Category Breakdown Chart */}
      {categoryData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Spending Breakdown</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {categoryData.map((c: any, i: number) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{c.name}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">${c.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!analytics && (
        <div className="card text-center py-12">
          <p className="text-gray-500">Connect to a database to see analytics</p>
        </div>
      )}
    </motion.div>
  );
}
