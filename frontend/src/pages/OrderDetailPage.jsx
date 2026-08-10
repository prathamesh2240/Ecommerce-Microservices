import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiPackage,
  FiShield,
  FiAlertTriangle,
  FiBox,
} from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';

export const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderDetails = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // GET /api/orders/{orderNumber}
      const response = await orderService.getOrderByNumber(orderNumber);
      setOrder(response.data);
    } catch (err) {
      setError(err.message || `Failed to fetch order details for ${orderNumber}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // Poll every 3 seconds if order status is still pending reservation or pending payment
    const interval = setInterval(() => {
      if (
        order?.orderStatus === 'PENDING_RESERVATION' ||
        order?.orderStatus === 'PENDING_PAYMENT'
      ) {
        fetchOrderDetails(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderNumber, order?.orderStatus]);

  if (loading) return <LoadingSpinner message={`Polling order ${orderNumber} state...`} />;
  if (error) return <ErrorState message={error} onRetry={() => fetchOrderDetails(false)} />;
  if (!order) return null;

  const isConfirmed = order.orderStatus === 'CONFIRMED';
  const isFailed =
    order.orderStatus === 'CANCELLED_NO_STOCK' ||
    order.orderStatus === 'CANCELLED_PAYMENT_FAILED';
  const isPending =
    order.orderStatus === 'PENDING_RESERVATION' ||
    order.orderStatus === 'PENDING_PAYMENT';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <FiCheckCircle className="w-4 h-4 text-emerald-600" />
            <span>CONFIRMED</span>
          </span>
        );
      case 'CANCELLED_NO_STOCK':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <FiAlertTriangle className="w-4 h-4 text-amber-600" />
            <span>CANCELLED (OUT OF STOCK)</span>
          </span>
        );
      case 'CANCELLED_PAYMENT_FAILED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
            <FiXCircle className="w-4 h-4 text-rose-600" />
            <span>CANCELLED (PAYMENT FAILED)</span>
          </span>
        );
      case 'PENDING_RESERVATION':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 animate-pulse">
            <FiClock className="w-4 h-4 text-indigo-600" />
            <span>RESERVING STOCK...</span>
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 animate-pulse">
            <FiClock className="w-4 h-4 text-indigo-600" />
            <span>PROCESSING PAYMENT...</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Tracker</span>
        </Link>

        <button
          onClick={() => fetchOrderDetails(true)}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition shadow-sm"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Saga Status</span>
        </button>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 sm:p-8 space-y-8">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Reference</span>
            <h1 className="text-2xl sm:text-3xl font-mono font-black text-gray-900">{order.orderNumber}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Submitted: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div>{getStatusBadge(order.orderStatus)}</div>
        </div>

        {/* Saga Choreography Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Saga Event Workflow Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Step 1: Order Created */}
            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
                <FiCheckCircle className="w-4 h-4" />
                <span>1. Order Placed</span>
              </div>
              <p className="text-xs text-emerald-900/70">Order entity created in PostgreSQL</p>
            </div>

            {/* Step 2: Inventory Reservation */}
            <div
              className={`p-4 rounded-2xl border space-y-1 ${
                order.orderStatus === 'CANCELLED_NO_STOCK'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : isPending && order.orderStatus === 'PENDING_RESERVATION'
                  ? 'border-indigo-200 bg-indigo-50/50 animate-pulse text-indigo-800'
                  : 'border-emerald-100 bg-emerald-50/50 text-emerald-800'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-xs">
                {order.orderStatus === 'CANCELLED_NO_STOCK' ? (
                  <FiXCircle className="w-4 h-4 text-amber-600" />
                ) : (
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                )}
                <span>2. Stock Reservation</span>
              </div>
              <p className="text-xs opacity-80">
                {order.orderStatus === 'CANCELLED_NO_STOCK'
                  ? 'Insufficient inventory; stock hold rejected'
                  : 'Inventory held by Inventory Service'}
              </p>
            </div>

            {/* Step 3: Payment Settlement */}
            <div
              className={`p-4 rounded-2xl border space-y-1 ${
                order.orderStatus === 'CANCELLED_PAYMENT_FAILED'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : isConfirmed
                  ? 'border-emerald-100 bg-emerald-50/50 text-emerald-800'
                  : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-xs">
                {order.orderStatus === 'CANCELLED_PAYMENT_FAILED' ? (
                  <FiXCircle className="w-4 h-4 text-rose-600" />
                ) : isConfirmed ? (
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FiClock className="w-4 h-4" />
                )}
                <span>3. Payment Settlement</span>
              </div>
              <p className="text-xs opacity-80">
                {isConfirmed
                  ? 'Payment authorized; order completed'
                  : order.orderStatus === 'CANCELLED_PAYMENT_FAILED'
                  ? 'Payment failed; compensating rollback executed'
                  : 'Awaiting payment event'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Items</h3>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {order.items?.map((item) => (
              <div key={item.id || item.sku} className="p-4 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    <FiBox className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block font-mono">{item.sku}</span>
                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">${Number(item.price).toFixed(2)} each</span>
                  <span className="font-extrabold text-gray-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-sm font-extrabold text-gray-700">Total Charged</span>
          <span className="text-2xl font-black text-indigo-600">
            ${Number(order.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
