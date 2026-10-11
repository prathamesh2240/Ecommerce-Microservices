import React from 'react';
import {
  FiUser,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiSettings,
} from 'react-icons/fi';

const sidebarItems = [
  { id: 'overview', label: 'My Profile', icon: FiUser },
  { id: 'orders', label: 'My Orders', icon: FiPackage },
  { id: 'wishlist', label: 'Wishlist', icon: FiHeart, soon: true },
  { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin },
  { id: 'settings', label: 'Account Settings', icon: FiSettings, soon: true },
];

/**
 * ProfileSidebar — Left navigation panel for the profile area.
 * @param {{ activeSection: string, onSectionChange: (id: string) => void }} props
 */
export const ProfileSidebar = ({ activeSection, onSectionChange }) => {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <nav aria-label="Profile navigation">
        <ul className="space-y-0.5">
          {sidebarItems.map(({ id, label, icon: Icon, soon }) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <button
                  onClick={() => !soon && onSectionChange(id)}
                  disabled={soon}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : soon
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-indigo-600' : soon ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {soon && (
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
