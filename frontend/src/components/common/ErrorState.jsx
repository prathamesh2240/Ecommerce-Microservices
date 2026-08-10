import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-rose-50/50 rounded-2xl border border-rose-100 text-center my-8 max-w-md mx-auto">
      <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-4">
        <FiAlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Error Occurred</h3>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
