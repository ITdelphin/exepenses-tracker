import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ message = 'No data found', action }: { message?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <FiInbox size={28} className="text-gray-400" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
