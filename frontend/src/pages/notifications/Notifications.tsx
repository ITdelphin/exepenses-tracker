import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiCheckSquare, FiAlertCircle, FiDollarSign, FiTrendingUp, FiTarget } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { notificationAPI } from '../../api/axios';
import { Notification as NotifType } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import EmptyState from '../../components/UI/EmptyState';

const iconMap: Record<string, any> = {
  BUDGET_EXCEEDED: FiAlertCircle,
  BUDGET_WARNING: FiAlertCircle,
  LARGE_EXPENSE: FiDollarSign,
  MONTHLY_SUMMARY: FiTrendingUp,
  GOAL_MILESTONE: FiTarget,
};

const colorMap: Record<string, string> = {
  BUDGET_EXCEEDED: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  BUDGET_WARNING: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  LARGE_EXPENSE: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  MONTHLY_SUMMARY: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  GOAL_MILESTONE: 'text-green-600 bg-green-100 dark:bg-green-900/30',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotifType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.data);
    } catch (err) { toast.error('Failed to load notifications'); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markAsRead = async (id: string) => {
    try { await notificationAPI.markAsRead(id); fetch(); } catch {}
  };

  const markAllAsRead = async () => {
    try { await notificationAPI.markAllAsRead(); fetch(); toast.success('All marked as read'); } catch {}
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Stay updated with your finances</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="btn-secondary flex items-center gap-2 text-sm"><FiCheckSquare size={16} /> Mark All Read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState message="No notifications" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || FiBell;
            const color = colorMap[notif.type] || 'text-gray-600 bg-gray-100 dark:bg-gray-700';
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`card flex items-start gap-4 ${notif.read ? 'opacity-60' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{notif.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-4">{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {!notif.read && (
                  <button onClick={() => markAsRead(notif.id)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg shrink-0">
                    <FiCheck size={16} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
