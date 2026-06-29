import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCpu, FiShield } from 'react-icons/fi';
import { adminAPI } from '../../api/axios';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Admin() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footerInfo, setFooterInfo] = useState('');

  useEffect(() => {
    Promise.all([
      adminAPI.getAnalytics(),
      axios.get('/admin/settings')
    ])
      .then(([{ data: analyticsData }, { data: settingsData }]) => {
        setAnalytics(analyticsData.data);
        setSettings(settingsData.data);
        const footer = settingsData.data.find((s: any) => s.key === 'footer_info');
        if (footer) setFooterInfo(footer.value);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateSetting = async (key: string, value: string) => {
    setSaving(true);
    try {
      await axios.put('/admin/settings', { key, value });
      toast.success('Setting updated successfully');
    } catch (error) {
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Control Panel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users and monitor system health</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... (keep stats cards) */}
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><FiUsers className="text-blue-600" size={20} /></div>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalUsers || 0}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"><FiUsers className="text-green-600" size={20} /></div>
            <p className="text-sm text-gray-500">Active (7d)</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.activeUsers7Days || 0}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center"><FiUsers className="text-yellow-600" size={20} /></div>
            <p className="text-sm text-gray-500">Verified Users</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.verifiedUsers || 0}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"><FiCpu className="text-purple-600" size={20} /></div>
            <p className="text-sm text-gray-500">Uptime</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.floor(analytics?.uptime / 3600)}h {Math.floor((analytics?.uptime % 3600) / 60)}m</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Global System Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Public Footer Info
              </label>
              <textarea
                value={footerInfo}
                onChange={(e) => setFooterInfo(e.target.value)}
                className="input h-24"
                placeholder="Enter footer text for all users..."
              />
              <button
                onClick={() => handleUpdateSetting('footer_info', footerInfo)}
                disabled={saving}
                className="btn btn-primary mt-3 w-full"
              >
                {saving ? 'Saving...' : 'Update Footer Information'}
              </button>
            </div>
          </div>
        </div>

        {/* Infrastructure */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Core Infrastructure</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database (Supabase)</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">CONNECTED</span>
            </div>
            {/* ... */}
          </div>
        </div>
      </div>

      {/* User Management (simplified list as requested) */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Directory</h3>
        <p className="text-sm text-gray-500 mb-4 italic">Note: Admins have zero access to individual transaction data or balances.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">User</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">System Role</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Activity</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 dark:border-gray-800/50">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">DN</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Delphin Ngarambe</p>
                      <p className="text-xs text-gray-500">delphinngarambe@gmail.com</p>
                    </div>
                  </div>
                </td>
                <td className="py-4"><span className="badge badge-primary">ADMIN</span></td>
                <td className="py-4 text-xs text-green-500">Online Now</td>
              </tr>
              {/* More users would go here */}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
