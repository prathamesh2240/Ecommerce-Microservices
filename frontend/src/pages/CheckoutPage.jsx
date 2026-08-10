import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiShoppingBag,
  FiShield,
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiAlertCircle,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

export const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.email ? user.email.split('@')[0] : 'John Doe',
    email: user?.email || 'customer@example.com',
    address: '123 Tech Park Way',
    city: 'San Francisco',
    postalCode: '94105',
    country: 'United States',
  });

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-sm text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Customer ID fallback: use logged in user's ID or 1
      const customerId = user?.id ? Number(user.id) : 1;

      // Construct Order Payload based on backend OrderCreateRequest DTO
      const orderPayload = {
        customerId: customerId,
        items: cartItems.map((item) => ({
          sku: item.sku,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      };

      // Call Order Service via API Gateway (POST /api/orders)
      const response = await orderService.createOrder(orderPayload);
      const createdOrder = response.data;

      toast.success(`Order ${createdOrder.orderNumber} placed successfully!`);
      clearCart();

      // Navigate directly to Order Details page to observe Saga execution live
      navigate(`/orders/${createdOrder.orderNumber}`);
    } catch (err) {
      const errMessage = err.message || 'Failed to submit order. Please try again.';
      setError(errMessage);
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex items-center space-x-4">
        <Link to="/cart" className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-600 hover:text-indigo-600 transition">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500">Complete your shipping information and finalize your order</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipping & Customer Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Details */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold border-b border-gray-100 pb-3">
              <FiUser className="w-5 h-5" />
              <span>1. Customer Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold border-b border-gray-100 pb-3">
              <FiMapPin className="w-5 h-5" />
              <span>2. Delivery Address</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold border-b border-gray-100 pb-3">
              <FiCreditCard className="w-5 h-5" />
              <span>3. Saga Choreographed Payment</span>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-2">
              <div className="font-bold flex items-center space-x-2">
                <FiShield className="w-4 h-4 text-indigo-600" />
                <span>Simulated Microservice Payment Gateway</span>
              </div>
              <p>
                When you submit, <strong>Order Service</strong> initiates an event-driven Saga over Kafka.
                Stock will be reserved by <strong>Inventory Service</strong>, followed by payment authorization in <strong>Payment Service</strong>.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 transition flex items-center justify-center space-x-2 text-base"
          >
            {loading ? (
              <span>Submitting Order to Gateway...</span>
            ) : (
              <>
                <FiCheckCircle className="w-5 h-5" />
                <span>Place Order (${cartTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Order Items Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Order Items</h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.sku} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 p-1 shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl || 'https://placehold.co/100x100?text=Item'}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} x ${Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline font-extrabold text-base text-gray-900">
              <span>Total Amount</span>
              <span className="text-2xl font-black text-indigo-600">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
