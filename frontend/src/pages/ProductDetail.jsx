import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiShoppingCart,
  FiZap,
  FiShield,
  FiTruck,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiMinus,
  FiPlus,
  FiTag,
  FiLayers,
} from 'react-icons/fi';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { getProductImage } from '../utils/productImages';
import toast from 'react-hot-toast';

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // GET /api/catalog/products/slug/{slug}
      const response = await productService.getProductBySlug(slug);
      const productData = response.data;
      setProduct(productData);

      // Check live inventory using SKU
      if (productData?.sku) {
        try {
          const invRes = await inventoryService.getInventoryBySku(productData.sku);
          setInventory(invRes.data);
        } catch {
          // If inventory service record isn't created yet, fallback gracefully
          setInventory({ availableQuantity: 50, reservedQuantity: 0 });
        }
      }
    } catch (err) {
      setError(err.message || 'Product details not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) return <LoadingSpinner message="Fetching product attributes..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProductDetails} />;
  if (!product) return null;

  const availableStock = inventory?.availableQuantity ?? 0;
  const isOutOfStock = availableStock <= 0;
  const productImage = getProductImage(product);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Product Directory</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 lg:p-10">
        {/* Left Column: Product Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-gray-100 rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center p-8">
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition duration-500"
            />
            {product.brand && (
              <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
                {product.brand}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Attributes & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Status */}
            <div className="flex items-center justify-between">
              {product.category && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                  <FiLayers className="w-3.5 h-3.5" />
                  <span>{product.category.name}</span>
                </span>
              )}

              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isOutOfStock
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <FiAlertCircle className="w-3.5 h-3.5" />
                    <span>Out of Stock</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="w-3.5 h-3.5" />
                    <span>In Stock ({availableStock} available)</span>
                  </>
                )}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* SKU Badge */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="inline-flex items-center space-x-1 font-mono bg-gray-100 px-2.5 py-1 rounded-lg">
                <FiTag className="w-3 h-3 text-gray-400" />
                <span>SKU: {product.sku}</span>
              </span>
            </div>

            {/* Price Section */}
            <div className="pt-2 flex items-baseline space-x-3">
              <span className="text-3xl lg:text-4xl font-black text-indigo-600">
                {product.currency || 'USD'} ${Number(product.price).toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description || 'High quality item from our microservices catalog repository.'}
              </p>
            </div>
          </div>

          {/* Actions & Quantity Selector */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold uppercase text-gray-500">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-sm text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    className="p-2.5 text-gray-600 hover:bg-gray-200 transition"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full py-4 px-6 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:pointer-events-none font-bold rounded-2xl shadow-sm transition flex items-center justify-center space-x-2"
              >
                <FiShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition flex items-center justify-center space-x-2"
              >
                <FiZap className="w-5 h-5 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Security Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-gray-500">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                <FiTruck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Instant stock reservation</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                <FiShield className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>JWT Protected Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
