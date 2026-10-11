import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiTag, FiCheck, FiTruck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/productImages';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency || 'USD',
  }).format(product.price || 0);

  const productImage = getProductImage(product);
  const detailLink = `/product/${product.slug || product.id}`;
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.status === 'INACTIVE';

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
      <div>
        {/* Product Image & Badges */}
        <Link
          to={detailLink}
          className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-6 block"
        >
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
          />
          {product.category && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-md text-[11px] font-bold text-gray-700 shadow-sm flex items-center space-x-1 border border-gray-100">
              <FiTag className="w-3 h-3 text-indigo-600" />
              <span>{product.category.name}</span>
            </span>
          )}
          {product.status && product.status !== 'ACTIVE' && (
            <span className="absolute top-3 right-3 px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[11px] font-bold uppercase">
              {product.status}
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold tracking-wider text-indigo-600 uppercase text-[11px]">
              {product.brand || 'ApexShop'}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <FiCheck className="w-3 h-3 text-emerald-600" />
              In Stock
            </span>
          </div>

          <Link
            to={detailLink}
            className="font-bold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors duration-150 text-sm sm:text-base leading-snug min-h-[2.75rem]"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Amazon-style Delivery Tag */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-2">
            <FiTruck className="w-3 h-3 text-indigo-500 shrink-0" />
            <span><strong className="text-gray-800">FREE Delivery</strong> Tomorrow</span>
          </div>

          <p className="text-[11px] text-gray-400 mt-1 font-mono">SKU: {product.sku}</p>
        </div>
      </div>

      {/* Footer / Price & Add to Cart Action */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
        <div>
          <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {priceFormatted}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={detailLink}
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="View Details"
            aria-label={`View details for ${product.name}`}
          >
            <FiEye className="w-4 h-4" />
          </Link>
          
          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 disabled:bg-gray-200 text-slate-900 rounded-xl font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
          >
            <FiShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
