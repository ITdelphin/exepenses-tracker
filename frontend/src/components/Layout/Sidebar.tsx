import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiHome, FiDollarSign, FiTrendingUp, FiPieChart, FiTarget, FiBarChart2, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiBell, FiCpu } from 'react-icons/fi';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const links = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/expenses', icon: FiDollarSign, label: 'Expenses' },
    { to: '/income', icon: FiTrendingUp, label: 'Income' },
    { to: '/budgets', icon: FiTarget, label: 'Budgets' },
    { to: '/reports', icon: FiBarChart2, label: 'Reports' },
    { to: '/ai-insights', icon: FiCpu, label: 'AI Insights' },
    { to: '/goals', icon: FiPieChart, label: 'Goals' },
    { to: '/notifications', icon: FiBell, label: 'Notifications' },
  ];

  if (user?.role === 'ADMIN') {
    links.push({ to: '/admin', icon: FiUsers, label: 'Admin' });
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">ExpenseTracker</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="mb-4">
            <p className="text-[10px] text-gray-400 font-medium px-4 uppercase tracking-widest mb-2">System Info</p>
            <p className="text-[10px] text-gray-500 px-4 leading-relaxed italic">
              {/* This will be replaced by API call result in a real scenario with a hook */}
              Powered by Rwanda Safe Technologies. Strict Privacy Protocols Active.
            </p>
          </div>
          <div className="flex items-center gap-3 mb-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-xl">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm ring-2 ring-white dark:ring-gray-700">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${user?.role === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-tighter uppercase">{user?.role}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 px-4">
            <NavLink to="/profile" onClick={onClose} className="flex-1 text-center text-[11px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg py-2 transition-all">
              <FiSettings size={14} className="inline mr-1" /> PROFILE
            </NavLink>
            <button onClick={logout} className="flex-1 text-center text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg py-2 transition-all">
              <FiLogOut size={14} className="inline mr-1" /> LOGOUT
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
