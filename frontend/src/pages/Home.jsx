import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiZap, FiBox } from 'react-icons/fi';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { ErrorState } from '../components/common/ErrorState';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.searchProducts({ page: 0, size: 8, sort: 'createdAt,desc' });
      // response structure is ApiResponse<Page<ProductResponse>>
      const content = response.data?.content || [];
      setProducts(content);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '⚡', color: 'from-blue-500 to-indigo-600' },
    { name: 'Fashion & Apparel', slug: 'fashion', icon: '👔', color: 'from-pink-500 to-rose-600' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠', color: 'from-amber-500 to-orange-600' },
    { name: 'Sports & Outdoors', slug: 'sports', icon: '⚽', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-20 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <FiZap className="w-4 h-4 text-amber-400" />
            <span>Powered by Microservices Architecture</span>
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Discover Quality Products at <span className="text-indigo-400">Apex Prices</span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100/80 font-normal max-w-2xl mx-auto">
            Shop high-quality gear delivered directly to your doorstep with real-time stock management and instant checkout.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition transform hover:-translate-y-0.5 flex items-center space-x-2 text-base"
            >
              <span>Explore Products</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <FiTruck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base">Fast Delivery</h4>
            <p className="text-xs text-gray-500">Real-time inventory reservations</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base">JWT Security</h4>
            <p className="text-xs text-gray-500">Gateway-secured API calls</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <FiRefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base">Saga Orchestration</h4>
            <p className="text-xs text-gray-500">Event-driven order fulfillment</p>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Popular Categories</h2>
            <p className="text-sm text-gray-500">Browse items by category</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
            <span>View All</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?categorySlug=${cat.slug}`}
              className={`p-6 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-md hover:shadow-xl transition transform hover:-translate-y-1 group flex flex-col justify-between h-36`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <h3 className="font-bold text-lg leading-snug">{cat.name}</h3>
                <span className="text-xs font-medium opacity-80 group-hover:opacity-100 flex items-center space-x-1">
                  <span>Explore</span>
                  <FiArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
            <p className="text-sm text-gray-500">Explore latest additions in catalog</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
            <span>See More Products</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && <ErrorState message={error} onRetry={fetchFeaturedProducts} />}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <FiBox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No products found in catalog</h3>
            <p className="text-sm text-gray-400 mt-1">Check back later or add new products via Admin UI.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
