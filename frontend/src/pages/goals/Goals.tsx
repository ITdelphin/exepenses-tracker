import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiTarget } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { goalAPI } from '../../api/axios';
import { Goal } from '../../types';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import EmptyState from '../../components/UI/EmptyState';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', targetAmount: '', currentAmount: '0', deadline: '', category: '' });

  const fetchGoals = async () => {
    try {
      const { data } = await goalAPI.getAll();
      setGoals(data.data);
    } catch (err) { toast.error('Failed to load goals'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.targetAmount) { toast.error('Please fill required fields'); return; }
    try {
      await goalAPI.create({ ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) });
      toast.success('Goal created');
      setModalOpen(false);
      resetForm();
      fetchGoals();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create goal'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
    try { await goalAPI.delete(id); toast.success('Goal deleted'); fetchGoals(); } catch (err) { toast.error('Failed to delete'); }
  };

  const resetForm = () => setForm({ title: '', targetAmount: '', currentAmount: '0', deadline: '', category: '' });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your savings goals</p>
        </div>
        <button onClick={() => { resetForm(); setModalOpen(true); }} className="btn-primary flex items-center gap-2 self-start"><FiPlus size={18} /> Add Goal</button>
      </div>

      {goals.length === 0 ? (
        <EmptyState message="No goals set" action={<button onClick={() => { resetForm(); setModalOpen(true); }} className="btn-primary">Create your first goal</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, i) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <FiTarget className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                      {goal.deadline && <p className="text-xs text-gray-500">Due: {new Date(goal.deadline).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><FiTrash2 size={14} /></button>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}</span>
                    <span className="font-medium text-primary-600">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }} />
                  </div>
                </div>
                {goal.category && <span className="text-xs text-gray-400">Category: {goal.category}</span>}
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Goal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Emergency Fund" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Amount *</label>
              <input type="number" step="0.01" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} className="input-field" placeholder="10000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Amount</label>
              <input type="number" step="0.01" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} className="input-field" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="e.g. Savings" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Create Goal</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
