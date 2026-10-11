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
  FiCheck,
  FiTruck,
  FiLock,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/productImages';

export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <FiShoppingCart className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Your ApexShop Cart is empty</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Your shopping basket is waiting for new additions. Explore today's deals, electronics, fashion, and lifestyle gear.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition"
        >
          <span>Continue Shopping</span>
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* ── Breadcrumb / Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-1">
            {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart • Eligible for FREE Express Delivery
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          Deselect all items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Cart Items Column (8 cols) ─────────────────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm divide-y divide-gray-100 p-4 sm:p-6">
            <div className="text-right text-xs text-gray-400 font-bold uppercase tracking-wider pb-2 hidden sm:block">
              Price
            </div>

            {cartItems.map((item) => {
              const itemTotal = Number(item.price) * item.quantity;
              const productImage = item.imageUrl || getProductImage(item);

              return (
                <div
                  key={item.sku}
                  className="py-5 flex flex-col sm:flex-row items-start justify-between gap-4 first:pt-2"
                >
                  {/* Product thumbnail & basic info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-24 h-24 bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 p-2 overflow-hidden">
                      <img
                        src={productImage}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {item.brand && (
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                          {item.brand}
                        </span>
                      )}
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <FiCheck className="w-3 h-3 text-emerald-600" />
                          In Stock
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 font-mono text-[11px]">SKU: {item.sku}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                        <FiTruck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>FREE delivery eligible</span>
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center gap-4 pt-3">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 transition"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-bold text-xs text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 transition"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-gray-300">|</span>

                        <button
                          onClick={() => removeFromCart(item.sku)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price column */}
                  <div className="text-right sm:min-w-[100px] self-end sm:self-start">
                    <span className="font-black text-base sm:text-lg text-slate-900 block">
                      ${itemTotal.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-400 block">
                      ${Number(item.price).toFixed(2)} each
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* ── Amazon-style Order Summary (4 cols) ────────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
                <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your order qualifies for FREE Express Shipping!</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''}):</span>
                <span className="font-bold text-slate-900 text-sm">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-bold text-emerald-600 uppercase">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax:</span>
                <span className="font-semibold text-gray-700">$0.00</span>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-slate-900">Order Total:</span>
                <span className="text-2xl font-black text-slate-900">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <FiLock className="w-4 h-4 text-slate-900" />
              <span>Proceed to Checkout</span>
            </button>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <FiShield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected by 256-bit SSL Gateway Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
