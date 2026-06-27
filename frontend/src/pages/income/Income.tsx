import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { incomeAPI, categoryAPI } from '../../api/axios';
import { Income, Category, Pagination } from '../../types';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import EmptyState from '../../components/UI/EmptyState';

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [form, setForm] = useState({ source: '', amount: '', categoryId: '', date: new Date().toISOString().split('T')[0], description: '' });

  const fetchIncomes = async (params?: any) => {
    try {
      const { data } = await incomeAPI.getAll({ search: search || undefined, ...params });
      setIncomes(data.data.incomes);
      setPagination(data.data.pagination);
    } catch (err) { toast.error('Failed to load income'); } finally { setLoading(false); }
  };

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.data.filter((c: Category) => c.type === 'income'))).catch(() => {});
    fetchIncomes();
  }, []);

  useEffect(() => { fetchIncomes(); }, [search]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.source || !form.amount || !form.categoryId) { toast.error('Please fill required fields'); return; }
    try {
      if (editing) {
        await incomeAPI.update(editing.id, form);
        toast.success('Income updated');
      } else {
        await incomeAPI.create(form);
        toast.success('Income added');
      }
      setModalOpen(false);
      setEditing(null);
      resetForm();
      fetchIncomes();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this income?')) return;
    try { await incomeAPI.delete(id); toast.success('Income deleted'); fetchIncomes(); } catch (err) { toast.error('Failed to delete'); }
  };

  const openEdit = (inc: Income) => {
    setEditing(inc);
    setForm({ source: inc.source, amount: inc.amount.toString(), categoryId: inc.categoryId, date: inc.date.split('T')[0], description: inc.description || '' });
    setModalOpen(true);
  };

  const openAdd = () => { setEditing(null); resetForm(); setModalOpen(true); };
  const resetForm = () => setForm({ source: '', amount: '', categoryId: categories[0]?.id || '', date: new Date().toISOString().split('T')[0], description: '' });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your income sources</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start"><FiPlus size={18} /> Add Income</button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder="Search income sources..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {incomes.length === 0 ? (
        <EmptyState message="No income recorded" action={<button onClick={openAdd} className="btn-primary">Add your first income</button>} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-center p-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {incomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{inc.category?.icon || '💰'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{inc.source}</p>
                          {inc.description && <p className="text-xs text-gray-400">{inc.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="text-sm text-gray-600 dark:text-gray-400">{inc.category?.name}</span></td>
                    <td className="p-4"><span className="text-sm text-gray-600 dark:text-gray-400">{new Date(inc.date).toLocaleDateString()}</span></td>
                    <td className="p-4 text-right"><span className="text-sm font-semibold text-green-600">+${inc.amount.toFixed(2)}</span></td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(inc)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleDelete(inc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source *</label>
            <input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="input-field" placeholder="e.g. Salary, Freelance" />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="input-field">
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} placeholder="Optional description" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add'} Income</button>
            <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
