import React from 'react';
import { FiMail, FiPhone, FiCalendar, FiShield, FiEdit2 } from 'react-icons/fi';

/**
 * ProfileAvatar — Circular avatar with initials fallback
 * @param {{ firstName?: string, lastName?: string, email?: string, size?: 'sm'|'md'|'lg' }} props
 */
export const ProfileAvatar = ({ firstName, lastName, email, size = 'md' }) => {
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : firstName
    ? firstName.slice(0, 2).toUpperCase()
    : email?.slice(0, 2).toUpperCase() ?? 'U';

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shrink-0 ${sizeClasses[size]}`}
      aria-label={`Avatar for ${firstName ?? email ?? 'user'}`}
    >
      {initials}
    </div>
  );
};

/**
 * InfoRow — A single labelled information row in the profile card
 */
const InfoRow = ({ icon: Icon, label, value, placeholder = 'Not provided' }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-3.5 h-3.5 text-gray-500" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-semibold truncate ${value ? 'text-gray-800' : 'text-gray-400 italic'}`}>
        {value || placeholder}
      </p>
    </div>
  </div>
);

/**
 * ProfileCard — Displays user profile information in view mode.
 * @param {{ profile: UserResponse, onEdit: () => void }} props
 */
export const ProfileCard = ({ profile, onEdit }) => {
  const fullName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile?.firstName ?? null;

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const roleLabel = profile?.role
    ? profile.role.replace('ROLE_', '').charAt(0) + profile.role.replace('ROLE_', '').slice(1).toLowerCase()
    : 'User';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Profile Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            firstName={profile?.firstName}
            lastName={profile?.lastName}
            email={profile?.email}
            size="md"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {fullName ?? 'Your Profile'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                <FiShield className="w-3 h-3" />
                {roleLabel}
              </span>
              {joinDate && (
                <span className="text-xs text-gray-400">Member since {joinDate}</span>
              )}
            </div>
          </div>
        </div>
        <button
          id="edit-profile-button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Edit profile"
        >
          <FiEdit2 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      {/* Info Rows */}
      <div className="px-6 py-2">
        <InfoRow icon={FiMail} label="Email Address" value={profile?.email} />
        <InfoRow
          icon={FiPhone}
          label="Mobile Number"
          value={profile?.phoneNumber}
          placeholder="Add your phone number"
        />
        <InfoRow
          icon={FiCalendar}
          label="Account Created"
          value={joinDate}
          placeholder="Unknown"
        />
      </div>
    </div>
  );
};
