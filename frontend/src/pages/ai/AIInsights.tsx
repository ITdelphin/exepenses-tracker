import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiTrendingUp, FiAlertTriangle, FiAlertCircle, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { aiAPI } from '../../api/axios';
import { AIAnalysis } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AIInsights() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await aiAPI.getSummary();
      setAnalysis(data.data);
    } catch (err) {
      console.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalysis(); }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  if (!analysis) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
        <div className="card text-center py-12">
          <FiCpu size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500">Add more transactions to unlock AI-powered insights</p>
          <button onClick={fetchAnalysis} className="btn-primary mt-4"><FiRefreshCw size={16} className="inline mr-2" /> Retry</button>
        </div>
      </motion.div>
    );
  }

  const categoryData = analysis.topCategories?.map(c => ({ name: c.category, amount: c.amount })) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Smart analysis of your financial habits</p>
        </div>
        <button onClick={fetchAnalysis} className="btn-secondary flex items-center gap-2"><FiRefreshCw size={16} /> Refresh</button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-hover">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Monthly Spending</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${analysis.avgMonthlySpending.toFixed(2)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Monthly Income</p>
          <p className="text-2xl font-bold text-green-600">${analysis.avgMonthlyIncome.toFixed(2)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Savings Rate</p>
          <p className={`text-2xl font-bold ${analysis.savingsRate >= 20 ? 'text-green-600' : analysis.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>{analysis.savingsRate.toFixed(1)}%</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next Month Prediction</p>
          <p className="text-2xl font-bold text-primary-600">${analysis.predictedNextMonth.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-8">No category data</p>}
        </div>

        {/* Insights */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiAlertCircle className="text-yellow-500" /> Insights</h3>
          <ul className="space-y-3">
            {analysis.insights?.map((insight, i) => (
              <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <FiTrendingUp className="text-primary-500 mt-0.5 shrink-0" size={16} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiDollarSign className="text-green-500" /> Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <FiAlertCircle className="text-green-500 mt-0.5 shrink-0" size={16} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unusual Transactions */}
      {analysis.unusualTransactions?.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiAlertTriangle className="text-red-500" /> Unusual Transactions Detected</h3>
          <div className="space-y-2">
            {analysis.unusualTransactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</p>
                  <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} - {t.category?.name}</p>
                </div>
                <span className="text-sm font-semibold text-red-600">${t.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
