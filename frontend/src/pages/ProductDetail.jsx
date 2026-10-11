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
  FiClock,
  FiRefreshCw,
  FiMapPin,
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
  const [inventoryList, setInventoryList] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // GET /api/catalog/products/slug/{slug}
      const productData = await productService.getProductBySlug(slug);
      setProduct(productData);

      // Check live inventory using SKU
      if (productData?.sku) {
        try {
          const invData = await inventoryService.getInventoryBySku(productData.sku);
          setInventoryList(invData);
        } catch {
          setInventoryList(null);
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

  // Compute live available stock across warehouses
  const totalStock = Array.isArray(inventoryList) && inventoryList.length > 0
    ? inventoryList.reduce((sum, item) => sum + (Number(item.availableQuantity) || 0), 0)
    : (inventoryList === null ? 50 : 0); // Default to available if inventory service record not yet bound

  const isOutOfStock = inventoryList !== null && inventoryList.length > 0 && totalStock <= 0;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) return <LoadingSpinner message="Fetching live catalog attributes..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProductDetails} />;
  if (!product) return null;

  const productImage = getProductImage(product);
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency || 'USD',
  }).format(product.price || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 py-2">
        <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-indigo-600 transition">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/products?categorySlug=${product.category.slug}`}
              className="hover:text-indigo-600 transition font-medium"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Product Image (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-gray-100 rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center p-8 group">
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              {product.brand && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
                  {product.brand}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
              <FiCheck className="text-emerald-500" />
              Verified catalog photograph with high-fidelity asset rendering
            </p>
          </div>

          {/* Column 2: Product Information (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Brand & Category */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {product.brand || 'ApexShop Brand'}
              </span>
              {product.category && (
                <span className="text-xs text-gray-500 font-medium">
                  in {product.category.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="border-b border-gray-100 pb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {priceFormatted}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Inclusive of all applicable sales taxes & customs
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                About this item
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description ||
                  'Crafted with premium engineering and materials for long-lasting durability, exceptional utility, and seamless daily operation.'}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Specifications
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <dt className="text-gray-500">SKU Code</dt>
                <dd className="font-mono font-bold text-gray-800">{product.sku}</dd>
                <dt className="text-gray-500">Brand</dt>
                <dd className="font-semibold text-gray-800">{product.brand || 'ApexShop'}</dd>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-semibold text-gray-800">{product.category?.name || 'General'}</dd>
                <dt className="text-gray-500">Catalog Status</dt>
                <dd className="font-semibold text-emerald-600">{product.status || 'ACTIVE'}</dd>
              </dl>
            </div>
          </div>

          {/* Column 3: Amazon-Inspired "Buy Box" (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="text-2xl font-black text-gray-900">
                {priceFormatted}
              </div>

              {/* Delivery Details */}
              <div className="text-xs text-gray-600 space-y-2 pb-3 border-b border-gray-200">
                <div className="flex items-start gap-2">
                  <FiTruck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-gray-900">FREE Delivery</strong> tomorrow. Order within next 4 hours.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Deliver to: United States</span>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-rose-600">
                    <FiAlertCircle className="w-4 h-4" />
                    Currently Out of Stock
                  </span>
                ) : (
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                      <FiCheck className="w-4 h-4 text-emerald-600" />
                      In Stock
                    </span>
                    <p className="text-[11px] text-gray-500">
                      {totalStock} units available at fulfillment warehouse
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden w-full justify-between px-2 py-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm text-gray-900 px-3">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(totalStock, q + 1))}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Increase quantity"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 text-slate-900 font-bold rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl shadow-md shadow-orange-100 transition active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  aria-label={`Buy ${product.name} now`}
                >
                  <FiZap className="w-4 h-4 fill-current" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Trust Details */}
              <div className="pt-3 border-t border-gray-200 text-[11px] text-gray-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Ships from</span>
                  <span className="font-semibold text-gray-800">ApexShop Fulfillment</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold by</span>
                  <span className="font-semibold text-gray-800">{product.brand || 'ApexShop Official'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Returns</span>
                  <span className="font-semibold text-emerald-700">30-day Free Returns</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 pt-2">
                  <FiShield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Secure transaction via Gateway</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
