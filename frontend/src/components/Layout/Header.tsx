import { FiMenu, FiMoon, FiSun, FiBell } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <button onClick={onMenuClick} className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        <FiMenu size={22} />
      </button>

      <div className="hidden lg:flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Expense Tracker</h1>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggle} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <button onClick={() => navigate('/notifications')} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
          <FiBell size={18} />
        </button>
      </div>
    </header>
  );
}
