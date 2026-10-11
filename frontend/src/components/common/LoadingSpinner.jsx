import React from 'react';

/**
 * LoadingSpinner — Page-level and inline loading indicator.
 *
 * @param {{ label?: string, message?: string, fullScreen?: boolean }} props
 * `message` and `label` are both accepted for backwards compatibility.
 * `message` takes precedence over `label`.
 */
export const LoadingSpinner = ({ fullScreen = false, label = 'Loading...', message }) => {
  // `message` prop takes precedence; `label` is kept for backwards compat
  const displayLabel = message || label;

  const spinner = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      {displayLabel && (
        <p className="text-gray-600 font-medium text-sm animate-pulse">{displayLabel}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};
