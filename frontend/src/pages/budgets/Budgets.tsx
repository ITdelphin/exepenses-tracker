import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { budgetAPI, categoryAPI } from '../../api/axios';
import { Budget, Category } from '../../types';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import EmptyState from '../../components/UI/EmptyState';

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), limit: '', categoryId: '' });

  const fetchBudgets = async () => {
    try {
      const [budgetRes, catRes] = await Promise.all([budgetAPI.getAll(), categoryAPI.getAll()]);
      setBudgets(budgetRes.data.data);
      setCategories(catRes.data.data.filter((c: Category) => c.type === 'expense' || !c.type));
    } catch (err) { toast.error('Failed to load budgets'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.limit || !form.categoryId) { toast.error('Please fill required fields'); return; }
    try {
      if (editing) {
        await budgetAPI.update(editing.id, { limit: form.limit });
        toast.success('Budget updated');
      } else {
        await budgetAPI.create(form);
        toast.success('Budget created');
      }
      setModalOpen(false);
      setEditing(null);
      fetchBudgets();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save budget'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    try { await budgetAPI.delete(id); toast.success('Budget deleted'); fetchBudgets(); } catch (err) { toast.error('Failed to delete'); }
  };

  const openAdd = () => { setEditing(null); setForm({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), limit: '', categoryId: categories[0]?.id || '' }); setModalOpen(true); };
  const openEdit = (b: Budget) => { setEditing(b); setForm({ month: b.month, year: b.year, limit: b.limit.toString(), categoryId: b.categoryId || '' }); setModalOpen(true); };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set and manage your monthly budgets</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start"><FiPlus size={18} /> Create Budget</button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState message="No budgets set" action={<button onClick={openAdd} className="btn-primary">Create your first budget</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget, i) => {
            const usagePercent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            const remaining = Math.max(0, budget.limit - budget.spent);
            return (
              <motion.div key={budget.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{budget.category?.icon || '📊'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{budget.category?.name || 'Overall'}</h3>
                      <p className="text-xs text-gray-500">{budget.month}/{budget.year}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(budget)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(budget.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><FiTrash2 size={14} /></button>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                    <span className={`font-medium ${usagePercent > 80 ? 'text-red-600' : usagePercent > 60 ? 'text-yellow-600' : 'text-green-600'}`}>{usagePercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, usagePercent)}%`, background: usagePercent > 80 ? '#ef4444' : usagePercent > 60 ? '#f59e0b' : '#22c55e' }} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Remaining: ${remaining.toFixed(2)}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Budget' : 'Create Budget'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                  <select value={form.month} onChange={e => setForm({ ...form, month: parseInt(e.target.value) })} className="input-field">
                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <select value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} className="input-field">
                    {[new Date().getFullYear(), new Date().getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Limit ($)</label>
            <input type="number" step="0.01" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} className="input-field" placeholder="1000.00" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'} Budget</button>
            <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
