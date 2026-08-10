import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
  FiBox,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <FiShoppingCart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Your shopping cart is empty</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            You haven't added any products to your cart yet. Explore our directory and find awesome deals.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition"
        >
          <span>Browse Products</span>
          <FiArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-500">{cartItems.length} unique item(s) in your basket</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.sku}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 p-2 overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://placehold.co/150x150?text=Product'}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">SKU: {item.sku}</p>
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    {item.currency || 'USD'} ${Number(item.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                    className="p-2 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-bold text-sm text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                    className="p-2 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-base text-gray-900 block">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.sku)}
                  className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Remove item"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 pt-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="font-semibold text-gray-700">$0.00</span>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-base font-extrabold text-gray-900">Total</span>
              <span className="text-2xl font-black text-indigo-600">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition flex items-center justify-center space-x-2 text-base"
          >
            <span>Proceed to Checkout</span>
            <FiArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs text-gray-400 justify-center">
            <FiShield className="w-4 h-4 text-emerald-500" />
            <span>Secured via API Gateway & Saga Event Bus</span>
          </div>
        </div>
      </div>
    </div>
  );
};
