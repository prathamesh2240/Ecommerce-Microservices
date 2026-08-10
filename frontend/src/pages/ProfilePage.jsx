import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiShield, FiClock, FiEdit2, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserById(user.id);
      const data = response.data;
      setProfileData(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setUpdating(true);
      const response = await userService.updateUser(user.id, form);
      const updated = response.data;
      setProfileData(updated);
      updateUserProfile({
        firstName: updated.firstName,
        lastName: updated.lastName,
      });
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching user credentials..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProfile} />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-indigo-500/30 border border-indigo-400/40 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {profileData?.email?.[0]?.toUpperCase() || <FiUser />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">
              {profileData?.firstName ? `${profileData.firstName} ${profileData.lastName || ''}` : 'User Profile'}
            </h1>
            <p className="text-indigo-200 text-xs mt-0.5">{profileData?.email}</p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
          <FiShield className="w-3.5 h-3.5" />
          <span>{profileData?.role || user?.role || 'ROLE_USER'}</span>
        </span>
      </div>

      {/* Account Info Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
            <span>{editMode ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center space-x-2"
              >
                <FiCheck className="w-4 h-4" />
                <span>{updating ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase block">First Name</span>
              <span className="font-bold text-gray-800">{profileData?.firstName || 'Not provided'}</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase block">Last Name</span>
              <span className="font-bold text-gray-800">{profileData?.lastName || 'Not provided'}</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase block">Email Address</span>
              <span className="font-bold text-gray-800 flex items-center space-x-2">
                <FiMail className="w-4 h-4 text-indigo-500" />
                <span>{profileData?.email || user?.email}</span>
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-xs text-gray-400 font-semibold uppercase block">Phone Number</span>
              <span className="font-bold text-gray-800 flex items-center space-x-2">
                <FiPhone className="w-4 h-4 text-indigo-500" />
                <span>{profileData?.phoneNumber || 'Not provided'}</span>
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <FiClock className="w-4 h-4" />
            <span>Account Registered: {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Active'}</span>
          </span>
          <span>User ID: #{profileData?.id || user?.id}</span>
        </div>
      </div>
    </div>
  );
};
