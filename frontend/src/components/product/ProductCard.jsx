import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiTag } from 'react-icons/fi';
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

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Product Image & Badges */}
        <Link to={detailLink} className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-6 block">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
          {product.category && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center space-x-1 border border-gray-100">
              <FiTag className="w-3 h-3 text-indigo-600" />
              <span>{product.category.name}</span>
            </span>
          )}
          {product.status && product.status !== 'ACTIVE' && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold uppercase">
              {product.status}
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs font-extrabold tracking-wider text-indigo-600 uppercase mb-1.5">
            {product.brand || 'Brand'}
          </p>
          <Link
            to={detailLink}
            className="font-bold text-gray-900 line-clamp-2 hover:text-indigo-600 transition duration-200 text-base leading-snug"
          >
            {product.name}
          </Link>
          <p className="text-xs text-gray-400 mt-2 font-mono">SKU: {product.sku}</p>
        </div>
      </div>

      {/* Footer / Price & Actions */}
      <div className="p-6 pt-0 mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
        <div>
          <span className="text-2xl font-black text-gray-900">{priceFormatted}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={detailLink}
            className="p-2.5 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="View Details"
          >
            <FiEye className="w-5 h-5" />
          </Link>
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.status === 'OUT_OF_STOCK' || product.status === 'INACTIVE'}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition active:scale-95"
            title="Add to Cart"
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
