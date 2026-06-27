import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { reportAPI } from '../../api/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [period, setPeriod] = useState('monthly');

  const generateReport = async (p: string) => {
    setLoading(true);
    setPeriod(p);
    try {
      const { data } = await reportAPI.generate({ type: p, period: p });
      setReport(data.data);
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generateReport('monthly'); }, []);

  const chartData = report?.dailyData ? report.dailyData.map((d: any) => ({ ...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })) : [];
  const topCatData = report?.topCategories?.map((c: any) => ({ name: c.categoryName, value: c.total })) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Generate financial reports</p>
        </div>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button key={p} onClick={() => generateReport(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner size="lg" /> : report ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-hover">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">${(report.totalIncome || 0).toFixed(2)}</p>
            </div>
            <div className="card-hover">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">${(report.totalExpenses || 0).toFixed(2)}</p>
            </div>
            <div className="card-hover">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Savings</p>
              <p className={`text-2xl font-bold ${(report.savings || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>${(report.savings || 0).toFixed(2)}</p>
            </div>
            <div className="card-hover">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.transactionCount || 0}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense Trend</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-500 text-center py-8">No trend data available</p>}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h3>
              {topCatData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={topCatData} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {topCatData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-500 text-center py-8">No category data available</p>}
            </div>
          </div>

          {/* Budget Usage */}
          {report.budgetUsage?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Usage</h3>
              <div className="space-y-4">
                {report.budgetUsage.map((b: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{b.categoryName}</span>
                      <span className="text-gray-500">${b.spent.toFixed(2)} / ${b.limit.toFixed(2)} ({b.usagePercent.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, b.usagePercent)}%`, background: b.usagePercent > 80 ? '#ef4444' : b.usagePercent > 60 ? '#f59e0b' : '#22c55e' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2"><FiDownload size={16} /> Export PDF</button>
            <button className="btn-secondary flex items-center gap-2"><FiDownload size={16} /> Export CSV</button>
            <button className="btn-secondary flex items-center gap-2"><FiFileText size={16} /> Export Excel</button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
