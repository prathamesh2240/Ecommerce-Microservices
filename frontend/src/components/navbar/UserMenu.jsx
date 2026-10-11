import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

/**
 * UserMenu — Professional avatar + dropdown for authenticated users.
 * Displays the user's initials avatar, first name, and a dropdown menu
 * that closes when clicking outside or pressing Escape.
 */
export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  // Derive display name: prefer firstName, fall back to email prefix
  const displayName = user?.firstName
    ? user.firstName
    : user?.email?.split('@')[0] ?? 'Account';

  // Avatar initials: first char of firstName + first char of lastName, or first 2 chars of email
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName
    ? user.firstName.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  const menuItems = [
    { to: '/profile', icon: FiUser, label: 'View Profile' },
    { to: '/orders', icon: FiPackage, label: 'My Orders' },
    { to: '/profile', icon: FiHeart, label: 'Wishlist', soon: true },
    { to: '/profile', icon: FiMapPin, label: 'Saved Addresses' },
    { to: '/profile', icon: FiSettings, label: 'Account Settings', soon: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        id="user-menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User account menu"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
          {initials}
        </div>
        {/* Name (hidden on very small screens) */}
        <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[90px] truncate">
          {displayName}
        </span>
        <FiChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          id="user-menu-dropdown"
          className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/80 overflow-hidden z-50 user-menu-dropdown"
          role="menu"
          aria-label="User menu"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            {menuItems.map(({ to, icon: Icon, label, soon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-100"
              >
                <Icon className="w-4 h-4 shrink-0 text-gray-400" />
                <span className="flex-1">{label}</span>
                {soon && (
                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Divider + Logout */}
          <div className="border-t border-gray-100 py-1.5">
            <button
              onClick={handleLogout}
              role="menuitem"
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors duration-100"
            >
              <FiLogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
