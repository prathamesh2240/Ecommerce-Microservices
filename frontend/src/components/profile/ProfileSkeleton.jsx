import React from 'react';

/**
 * ProfileSkeleton — Skeleton loader for the profile page.
 * Matches the profile page layout (sidebar + main content).
 */
export const ProfileSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
    {/* Sidebar skeleton */}
    <div className="w-full lg:w-56 shrink-0">
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Main content skeleton */}
    <div className="flex-1 space-y-4">
      {/* Profile card skeleton */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-5 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded-lg w-48" />
            <div className="h-4 bg-gray-100 rounded-lg w-32" />
          </div>
          <div className="h-9 bg-gray-100 rounded-xl w-28" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50">
              <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary skeleton */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="h-5 bg-gray-200 rounded-lg w-36 mb-4" />
        <div className="h-16 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
);
