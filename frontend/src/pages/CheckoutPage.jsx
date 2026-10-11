import React, { useState, useEffect, useCallback } from 'react';
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
  FiPlus,
  FiCheck,
  FiHome,
  FiBriefcase
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { addressService } from '../services/addressService';
import { AddressModal } from '../components/address/AddressModal';
import toast from 'react-hot-toast';

export const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Address Selection State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Modal State for adding address during checkout
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const fetchAddresses = useCallback(async (autoSelectNewId = null) => {
    try {
      setLoadingAddresses(true);
      const data = await addressService.getMyAddresses();
      const addrList = Array.isArray(data) ? data : [];
      setAddresses(addrList);

      if (autoSelectNewId) {
        setSelectedAddressId(autoSelectNewId);
      } else if (addrList.length > 0) {
        // Auto-select default or first address if nothing currently selected or valid
        setSelectedAddressId((prevId) => {
          const currentExists = addrList.some((a) => a.id === prevId);
          if (currentExists) return prevId;
          const defaultAddr = addrList.find((a) => a.isDefault);
          return defaultAddr ? defaultAddr.id : addrList[0].id;
        });
      } else {
        setSelectedAddressId(null);
      }
    } catch {
      // Non-blocking error handling
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAddNewAddress = async (formData) => {
    try {
      setIsSavingAddress(true);
      const newAddress = await addressService.createAddress(formData);
      toast.success('Address added and selected!');
      setIsAddressModalOpen(false);
      await fetchAddresses(newAddress?.id);
    } catch (err) {
      throw err;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (addresses.length === 0 || !selectedAddressId) {
      const msg = 'Please select or add a delivery address to proceed.';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Customer ID from authenticated user context
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

      // Order Service initiates Saga
      const createdOrder = await orderService.createOrder(orderPayload);

      toast.success(`Order ${createdOrder?.orderNumber} placed successfully!`);
      clearCart();

      // Navigate to live Saga order tracking page
      navigate(`/orders/${createdOrder?.orderNumber}`);
    } catch (err) {
      const errMessage = err.message || 'Failed to submit order. Please try again.';
      setError(errMessage);
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

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

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/cart" className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-600 hover:text-indigo-600 transition">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500">Select delivery address and finalize your order</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Checkout Sections */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Account Info */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold border-b border-gray-100 pb-3">
              <FiUser className="w-5 h-5" />
              <span>1. Customer Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Account Name
                </span>
                <p className="text-sm font-bold text-gray-800">
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
                    : user?.email?.split('@')[0] ?? 'Apex Customer'}
                </p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Email Address
                </span>
                <p className="text-sm font-bold text-gray-800">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address Selection */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold">
                <FiMapPin className="w-5 h-5" />
                <span>2. Delivery Address</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Selection List */}
            {loadingAddresses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-gray-50 border border-gray-100 rounded-2xl p-4" />
                ))}
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <label
                      key={addr.id}
                      className={`relative flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="selectedAddress"
                              value={addr.id}
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                              {addr.addressType === 'WORK' ? <FiBriefcase className="w-3 h-3" /> : <FiHome className="w-3 h-3" />}
                              {addr.addressType}
                            </span>
                          </div>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-gray-900">{addr.fullName}</p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                        </p>
                        <p className="text-xs text-gray-700 font-medium mt-1">
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">📱 +91 {addr.phoneNumber}</p>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-2 border-t border-indigo-100 flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>Delivering to this address</span>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              /* No Saved Addresses */
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl p-6 space-y-3">
                <FiMapPin className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">No delivery address found</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Please add a delivery address to complete your order checkout.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            )}
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
            disabled={loading || addresses.length === 0}
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

        {/* Right Column: Order Summary */}
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

          {/* Delivery Target Preview */}
          {selectedAddress && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1">
              <span className="text-gray-400 uppercase tracking-wider font-bold text-[10px]">
                Delivering to
              </span>
              <p className="font-bold text-gray-800 truncate">{selectedAddress.fullName}</p>
              <p className="text-gray-500 truncate">
                {selectedAddress.addressLine1}, {selectedAddress.city} — {selectedAddress.pincode}
              </p>
            </div>
          )}

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

      {/* Add Address Modal in Checkout */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSubmit={handleAddNewAddress}
        isSaving={isSavingAddress}
        title="Add Delivery Address"
      />
    </div>
  );
};
