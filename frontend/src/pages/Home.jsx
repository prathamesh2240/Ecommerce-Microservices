import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiZap,
  FiBox,
  FiCheckCircle,
  FiHeadphones,
  FiTag,
  FiAward,
} from 'react-icons/fi';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { ErrorState } from '../components/common/ErrorState';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [electronicsProducts, setElectronicsProducts] = useState([]);
  const [homeProducts, setHomeProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Featured Products (latest 8)
      const featRes = await productService.searchProducts({ page: 0, size: 8, sort: 'createdAt,desc' });
      setFeaturedProducts(featRes?.content || []);

      // 2. Fetch Electronics (up to 4)
      const elecRes = await productService.searchProducts({ page: 0, size: 4, categorySlug: 'electronics' });
      setElectronicsProducts(elecRes?.content || []);

      // 3. Fetch Home & Kitchen (up to 4)
      const homeRes = await productService.searchProducts({ page: 0, size: 4, categorySlug: 'home-kitchen' });
      setHomeProducts(homeRes?.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load catalog products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const departmentSpotlights = [
    {
      title: 'Top Tech & Electronics',
      tagline: 'Cutting-edge gadgets & audio',
      categorySlug: 'electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      actionText: 'Shop Tech',
    },
    {
      title: 'Fashion & Everyday Wear',
      tagline: 'Footwear, bags & apparel',
      categorySlug: 'fashion',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      actionText: 'Explore Styles',
    },
    {
      title: 'Home & Kitchen Essentials',
      tagline: 'Premium kitchenware & decor',
      categorySlug: 'home-kitchen',
      image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=80',
      actionText: 'Upgrade Home',
    },
    {
      title: 'Sports & Active Outdoors',
      tagline: 'Gear, fitness & expedition',
      categorySlug: 'sports',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
      actionText: 'Discover Gear',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* ── Hero Retail Banner ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.12),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-300 text-xs font-bold tracking-wide uppercase">
              <FiZap className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Catalog & Warehouse Inventory</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Huge Selection. <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                Everyday Low Prices.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Explore authentic products delivered direct from verified warehouses with instant inventory reservations and secure checkout.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/products"
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition flex items-center gap-2 text-sm cursor-pointer"
              >
                <span>Shop All Products</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?sort=price,asc"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl border border-white/20 transition text-sm cursor-pointer"
              >
                Today's Deals
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative p-2 bg-gradient-to-tr from-amber-400/20 to-indigo-500/20 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&auto=format&fit=crop&q=80"
                alt="Electronics and gadgets showcase"
                className="w-full h-72 object-cover rounded-2xl shadow-inner"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-white/10 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Live Microservices Mesh</p>
                  <p className="text-slate-400 text-[11px]">PostgreSQL • Redis • Kafka Events</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-md text-[11px] border border-emerald-500/30">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Proposition Strip ──────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <FiTruck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Free Next-Day Delivery</h4>
            <p className="text-[11px] text-gray-500">On qualifying prime orders</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Secure Payments</h4>
            <p className="text-[11px] text-gray-500">JWT Gateway protection</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <FiRefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">30-Day Returns</h4>
            <p className="text-[11px] text-gray-500">Hassle-free replacement</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <FiCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Verified Catalog</h4>
            <p className="text-[11px] text-gray-500">Direct warehouse stock</p>
          </div>
        </div>
      </section>

      {/* ── Amazon-style Category Spotlight Quad Cards ──────────────── */}
      <section className="space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>See all categories</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departmentSpotlights.map((spotlight) => (
            <div
              key={spotlight.categorySlug}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {spotlight.title}
                </h3>
                <Link
                  to={`/products?categorySlug=${spotlight.categorySlug}`}
                  className="block aspect-4/3 rounded-xl overflow-hidden bg-slate-100 group"
                >
                  <img
                    src={spotlight.image}
                    alt={spotlight.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <p className="text-xs text-gray-500">
                  {spotlight.tagline}
                </p>
              </div>

              <div className="pt-4 mt-auto">
                <Link
                  to={`/products?categorySlug=${spotlight.categorySlug}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>{spotlight.actionText}</span>
                  <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section: Featured Products Rail ──────────────────────────── */}
      <section className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-gray-500">Hand-picked selections from our active catalog</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All ({featuredProducts.length}+)</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && <ErrorState message={error} onRetry={fetchCatalogData} />}

        {!loading && !error && featuredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <FiBox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No products found in catalog</h3>
            <p className="text-xs text-gray-400 mt-1">Catalog seeding may be in progress.</p>
          </div>
        )}

        {!loading && !error && featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Section: Trending Electronics ────────────────────────────── */}
      {electronicsProducts.length > 0 && (
        <section className="space-y-6 max-w-7xl mx-auto bg-slate-100/70 p-6 rounded-3xl border border-gray-200/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <FiZap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Trending in Electronics & Audio
                </h2>
                <p className="text-xs text-gray-500">Top-rated tech with real-time stock allocation</p>
              </div>
            </div>
            <Link
              to="/products?categorySlug=electronics"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Explore Tech</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {electronicsProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Section: Popular in Home & Living ─────────────────────────── */}
      {homeProducts.length > 0 && (
        <section className="space-y-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Popular in Home & Kitchen
              </h2>
              <p className="text-xs text-gray-500">Premium culinary & lifestyle essentials</p>
            </div>
            <Link
              to="/products?categorySlug=home-kitchen"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Shop Home</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
