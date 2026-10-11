import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiPackage, FiArrowRight, FiClock, FiAlertCircle } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const OrderHistoryPage = () => {
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const cleanOrderNumber = orderNumberInput.trim();
      // orderService.getOrderByNumber now returns OrderResponse directly
      const orderData = await orderService.getOrderByNumber(cleanOrderNumber);
      if (orderData?.orderNumber) {
        navigate(`/orders/${cleanOrderNumber}`);
      }
    } catch (err) {
      setError(err.message || `Order ${orderNumberInput} not found`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-3 text-center">
        <FiPackage className="w-12 h-12 text-indigo-400 mx-auto" />
        <h1 className="text-3xl font-extrabold">Order Tracker</h1>
        <p className="text-indigo-200 text-sm max-w-md mx-auto">
          Look up live Saga order statuses and view real-time inventory and payment stage confirmations.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Look Up Your Order</h2>

        <form onSubmit={handleSearchOrder} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. ORD-A1B2C3D4"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
          </div>

          <button
            type="submit"
            disabled={loading || !orderNumberInput.trim()}
            className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <span>Track Order</span>
                <FiArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center space-x-3">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
