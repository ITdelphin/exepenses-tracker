import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiCpu, FiSettings, FiGrid, FiActivity, FiServer, FiCheckCircle } from 'react-icons/fi';
import { adminAPI } from '../../api/axios';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FiActivity },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'categories', label: 'Categories', icon: FiGrid },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footerInfo, setFooterInfo] = useState('');

  useEffect(() => {
    Promise.all([
      adminAPI.getAnalytics(),
      axios.get('/admin/settings'),
      adminAPI.getUsers({ limit: 100 }),
      adminAPI.getCategories()
    ])
      .then(([{ data: analyticsData }, { data: settingsData }, { data: usersData }, { data: categoriesData }]) => {
        setAnalytics(analyticsData.data);
        setSettings(settingsData.data);
        setUsers(usersData.data.users);
        setCategories(categoriesData.data);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Comprehensive system management and control</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm overflow-x-auto w-full sm:w-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-hover">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <FiUsers className="text-blue-600" size={20} />
                  </div>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.totalUsers || 0}</p>
              </div>
              <div className="card-hover">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <FiActivity className="text-green-600" size={20} />
                  </div>
                  <p className="text-sm text-gray-500">Active (7d)</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.activeUsers7Days || 0}</p>
              </div>
              <div className="card-hover">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                    <FiCheckCircle className="text-yellow-600" size={20} />
                  </div>
                  <p className="text-sm text-gray-500">Verified Users</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics?.verifiedUsers || 0}</p>
              </div>
              <div className="card-hover">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <FiCpu className="text-purple-600" size={20} />
                  </div>
                  <p className="text-sm text-gray-500">System Uptime</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(analytics?.uptime / 3600)}h {Math.floor((analytics?.uptime % 3600) / 60)}m
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                  <FiServer size={20} className="text-blue-500" />
                  <h3 className="text-lg font-semibold">Core Infrastructure</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <div>
                      <span className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Database (PostgreSQL)</span>
                      <span className="text-xs text-gray-500">Primary Database Cluster</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800">CONNECTED</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <div>
                      <span className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Authentication Session</span>
                      <span className="text-xs text-gray-500">JWT Token Security</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800">SECURE</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <div>
                      <span className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Overall Status</span>
                      <span className="text-xs text-gray-500">System Health Monitor</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{analytics?.systemStatus || 'Healthy'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Directory</h3>
                <p className="text-sm text-gray-500 mb-2 italic">Admins have zero access to individual transaction data or balances.</p>
              </div>
              <div className="text-sm text-gray-500">Showing {users.length} users</div>
            </div>

            <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Info</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                          }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isVerified
                          ? <span className="text-green-500 flex items-center gap-1 text-sm font-medium"><FiCheckCircle /> Yes</span>
                          : <span className="text-gray-400 text-sm">No</span>
                        }
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Categories</h3>
                <p className="text-sm text-gray-500">Manage global transaction categories available to all users.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat: any) => (
                <div key={cat.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon || '📌'}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{cat.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{cat.type}</p>
                    </div>
                  </div>
                  {cat.isDefault && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">DEFAULT</span>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-gray-500 p-4 col-span-3">No categories found in the system.</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card max-w-2xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Global System Configuration</h3>
            <p className="text-sm text-gray-500 mb-6">These settings affect the global usage of the application.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Public Footer Information
                </label>
                <textarea
                  value={footerInfo}
                  onChange={(e) => setFooterInfo(e.target.value)}
                  className="input h-32"
                  placeholder="Enter footer text, disclaimers, or contact info to display universally..."
                />
                <button
                  onClick={() => handleUpdateSetting('footer_info', footerInfo)}
                  disabled={saving}
                  className="btn btn-primary mt-4 py-2.5 px-6 font-medium shadow-md shadow-blue-500/20"
                >
                  {saving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm">Active System Keys</h4>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 font-mono text-xs text-gray-600 dark:text-gray-400 space-y-2">
                  {settings.map((s, i) => (
                    <div key={i} className="flex justify-between border-b border-gray-200 dark:border-gray-700 last:border-0 pb-2">
                      <span className="font-bold text-gray-800 dark:text-gray-300">{s.key}</span>
                      <span className="truncate max-w-[200px] bg-white dark:bg-gray-900 px-2 rounded">{s.value}</span>
                    </div>
                  ))}
                  {settings.length === 0 && <span>No configurations applied</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

