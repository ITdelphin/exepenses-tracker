import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiShield, FiTrash2, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/axios';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({ name });
      updateUser(data.data);
      toast.success('Profile updated');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update'); } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) { toast.error('Please fill all fields'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to change password'); } finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('This action is irreversible. Delete your account?')) return;
    if (!confirm('Are you absolutely sure?')) return;
    try {
      await authAPI.deleteAccount();
      toast.success('Account deleted');
      logout();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Info */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${user?.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Update Profile */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiUser /> Profile Information</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2"><FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiLock /> Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" placeholder="Min. 6 characters" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">Change Password</button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 dark:border-red-900">
        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2"><FiTrash2 /> Danger Zone</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button onClick={handleDeleteAccount} className="btn-danger">Delete Account</button>
      </div>
    </motion.div>
  );
}
