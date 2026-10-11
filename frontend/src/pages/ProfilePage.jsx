import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPackage,
  FiArrowRight,
  FiRefreshCw,
  FiAlertCircle,
  FiLogIn,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

import { ProfileSidebar } from '../components/profile/ProfileSidebar';
import { ProfileCard } from '../components/profile/ProfileCard';
import { EditProfileForm } from '../components/profile/EditProfileForm';
import { AddressSection } from '../components/profile/AddressCard';
import { ProfileSkeleton } from '../components/profile/ProfileSkeleton';

// ── Order Summary Widget ────────────────────────────────────────────────────────
const OrderSummaryWidget = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <h3 className="text-base font-bold text-gray-900">My Orders</h3>
      <p className="text-xs text-gray-500 mt-0.5">Track and manage your recent purchases</p>
    </div>
    <div className="px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <FiPackage className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Order History</p>
          <p className="text-xs text-gray-400">Search and track your orders</p>
        </div>
      </div>
      <Link
        to="/orders"
        className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors duration-150"
        id="view-orders-link"
      >
        View Orders
        <FiArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </div>
);

// ── Profile Error State ────────────────────────────────────────────────────────
const ProfileErrorState = ({ error, onRetry }) => {
  const navigate = useNavigate();

  const isSessionError =
    error?.toLowerCase().includes('session') ||
    error?.toLowerCase().includes('expired') ||
    error?.toLowerCase().includes('unauthorized') ||
    error?.toLowerCase().includes('login');

  if (isSessionError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mb-4">
          <FiLogIn className="w-7 h-7 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Session Expired</h3>
        <p className="text-sm text-gray-500 mb-6">
          Your session has expired. Please sign in again to view your profile.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mb-4">
        <FiAlertCircle className="w-7 h-7 text-rose-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Profile</h3>
      <p className="text-sm text-gray-500 mb-6">
        {error || "We couldn't load your profile. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

// ── Main Profile Page ──────────────────────────────────────────────────────────
export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // ── Fetch Profile ────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use /me endpoint — ID comes from gateway header, never from client
      const data = await userService.getMyProfile();
      setProfileData(data);
    } catch (err) {
      setError(err.message || 'Failed to load your profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Save Profile ─────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    const updated = await userService.updateMyProfile(formData);
    setProfileData(updated);
    // Sync first name into the auth context so the navbar updates immediately
    updateUserProfile({
      firstName: updated.firstName,
      lastName: updated.lastName,
    });
    toast.success('Profile updated successfully!');
    setEditMode(false);
  };

  // ── Section Content Renderer ─────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-4">
            {/* Profile Info Card — View or Edit mode */}
            {editMode ? (
              <EditProfileForm
                profile={profileData}
                onSave={handleSave}
                onCancel={() => setEditMode(false)}
              />
            ) : (
              <ProfileCard
                profile={profileData}
                onEdit={() => setEditMode(true)}
              />
            )}

            {/* Order Summary Widget */}
            <OrderSummaryWidget />
          </div>
        );

      case 'addresses':
        return <AddressSection />;

      case 'orders':
        // This triggers navigation to /orders via sidebar
        return <OrderSummaryWidget />;

      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile, orders, and preferences
        </p>
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <ProfileErrorState error={error} onRetry={fetchProfile} />
      ) : (
        <>
          {/* ── Desktop: Sidebar + Content ───────────────────────────── */}
          <div className="hidden lg:flex gap-6 items-start">
            {/* Sidebar */}
            <div className="w-56 shrink-0 bg-white border border-gray-100 rounded-2xl p-3">
              {/* Mini profile summary at top of sidebar */}
              <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-gray-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {profileData?.firstName && profileData?.lastName
                    ? `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase()
                    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profileData?.firstName
                      ? `${profileData.firstName} ${profileData.lastName ?? ''}`
                      : user?.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{profileData?.email ?? user?.email}</p>
                </div>
              </div>
              <ProfileSidebar
                activeSection={activeSection}
                onSectionChange={(section) => {
                  if (section === 'orders') {
                    // Navigate to orders page directly
                    window.location.href = '/orders';
                    return;
                  }
                  setActiveSection(section);
                  setEditMode(false);
                }}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {renderSection()}
            </div>
          </div>

          {/* ── Mobile: Stacked Layout ───────────────────────────────── */}
          <div className="lg:hidden space-y-4">
            {/* Mobile Profile Header */}
            {!editMode && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {profileData?.firstName && profileData?.lastName
                    ? `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase()
                    : user?.email?.slice(0, 2).toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900 truncate">
                    {profileData?.firstName
                      ? `${profileData.firstName} ${profileData.lastName ?? ''}`
                      : 'Your Profile'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{profileData?.email ?? user?.email}</p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="text-xs font-semibold text-indigo-600 border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors shrink-0"
                >
                  Edit
                </button>
              </div>
            )}

            {/* Mobile Edit Form or Profile Info */}
            {editMode ? (
              <EditProfileForm
                profile={profileData}
                onSave={handleSave}
                onCancel={() => setEditMode(false)}
              />
            ) : (
              <>
                {/* Profile Details Card (mobile) */}
                <ProfileCard
                  profile={profileData}
                  onEdit={() => setEditMode(true)}
                />

                {/* Order Summary */}
                <OrderSummaryWidget />

                {/* Address Section */}
                <AddressSection />

                {/* Mobile Sidebar Nav */}
                <div className="bg-white border border-gray-100 rounded-2xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                    Account
                  </p>
                  <ProfileSidebar
                    activeSection={activeSection}
                    onSectionChange={(section) => {
                      if (section === 'orders') {
                        window.location.href = '/orders';
                        return;
                      }
                      setActiveSection(section);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
