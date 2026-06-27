import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiTrash2, FiEdit2, FiStar, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { expenseAPI, categoryAPI } from '../../api/axios';
import { Expense, Category, Pagination } from '../../types';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import EmptyState from '../../components/UI/EmptyState';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const [form, setForm] = useState({ title: '', amount: '', categoryId: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'OTHER', notes: '', description: '', isImportant: false });

  const fetchExpenses = async (params?: any) => {
    try {
      const { data } = await expenseAPI.getAll({ search: search || undefined, category: filterCategory || undefined, ...params });
      setExpenses(data.data.expenses);
      setPagination(data.data.pagination);
    } catch (err) { toast.error('Failed to load expenses'); } finally { setLoading(false); }
  };

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.data)).catch(() => { });
    fetchExpenses();
  }, []);

  useEffect(() => { fetchExpenses(); }, [search, filterCategory]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.categoryId) { toast.error('Please fill required fields'); return; }
    try {
      if (editing) {
        await expenseAPI.update(editing.id, form);
        toast.success('Expense updated');
      } else {
        await expenseAPI.create(form);
        toast.success('Expense added');
      }
      setModalOpen(false);
      setEditing(null);
      resetForm();
      fetchExpenses();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save expense'); }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await expenseAPI.delete(id);
      toast.success('Expense deleted successfully');
      setDeleteConfirm(null);
      fetchExpenses();
    } catch (err) { toast.error('Failed to delete expense'); }
  };

  const handleToggleImportant = async (exp: Expense) => {
    try {
      await expenseAPI.update(exp.id, { isImportant: !exp.isImportant });
      fetchExpenses();
    } catch (err) { toast.error('Failed to update'); }
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setForm({ title: exp.title, amount: exp.amount.toString(), categoryId: exp.categoryId, date: exp.date.split('T')[0], paymentMethod: exp.paymentMethod, notes: exp.notes || '', description: exp.description || '', isImportant: exp.isImportant });
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setModalOpen(true);
  };

  const resetForm = () => {
    setForm({ title: '', amount: '', categoryId: categories[0]?.id || '', date: new Date().toISOString().split('T')[0], paymentMethod: 'OTHER', notes: '', description: '', isImportant: false });
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your expenses</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start"><FiPlus size={18} /> Add Expense</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-field sm:w-48">
          <option value="">All Categories</option>
          {categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <EmptyState message="No expenses found" action={<button onClick={openAdd} className="btn-primary">Add your first expense</button>} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-center p-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{exp.category?.icon || '💳'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            {exp.title}
                            {exp.isImportant && <FiStar size={14} className="text-yellow-500 fill-yellow-500" />}
                          </p>
                          {exp.notes && <p className="text-xs text-gray-400">{exp.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="text-sm text-gray-600 dark:text-gray-400">{exp.category?.name}</span></td>
                    <td className="p-4"><span className="text-sm text-gray-600 dark:text-gray-400">{new Date(exp.date).toLocaleDateString()}</span></td>
                    <td className="p-4 text-right"><span className="text-sm font-semibold text-red-600">-${exp.amount.toFixed(2)}</span></td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(exp)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleToggleImportant(exp)} className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"><FiStar size={16} className={exp.isImportant ? 'fill-yellow-500 text-yellow-500' : ''} /></button>
                        {deleteConfirm === exp.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(exp.id)} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200"><FiX size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(exp.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"><FiTrash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
              <div className="flex gap-2">
                <button disabled={!pagination.hasPrevPage} onClick={() => fetchExpenses({ page: pagination.page - 1 })} className="btn-secondary text-sm py-1.5 px-3">Prev</button>
                <button disabled={!pagination.hasNextPage} onClick={() => fetchExpenses({ page: pagination.page + 1 })} className="btn-secondary text-sm py-1.5 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Expense title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                {categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="input-field">
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_PAYMENT">Mobile Payment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} placeholder="Optional notes" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={form.isImportant} onChange={e => setForm({ ...form, isImportant: e.target.checked })} className="rounded" />
            Mark as important
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add'} Expense</button>
            <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
