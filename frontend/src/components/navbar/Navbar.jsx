import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingCart,
  FiSearch,
  FiShield,
  FiMenu,
  FiX,
  FiShoppingBag,
  FiHome,
  FiPackage,
  FiMapPin,
  FiChevronDown,
  FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { UserMenu } from './UserMenu';

export const Navbar = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('keyword', searchQuery.trim());
    }
    if (selectedCategory) {
      params.set('categorySlug', selectedCategory);
    }
    navigate(`/products?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Fashion & Apparel', value: 'fashion' },
    { label: 'Home & Kitchen', value: 'home-kitchen' },
    { label: 'Sports & Outdoors', value: 'sports' },
    { label: 'Books & Accessories', value: 'books' },
  ];

  const subNavLinks = [
    { label: "Today's Deals", to: "/products?sort=price,asc" },
    { label: "Electronics", to: "/products?categorySlug=electronics" },
    { label: "Fashion", to: "/products?categorySlug=fashion" },
    { label: "Home & Kitchen", to: "/products?categorySlug=home-kitchen" },
    { label: "Sports & Outdoors", to: "/products?categorySlug=sports" },
    { label: "Books", to: "/products?categorySlug=books" },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-slate-900 text-white transition-shadow duration-200 ${scrolled ? 'shadow-lg' : ''}`}>
      {/* ── Tier 1: Main Header Row ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-2 sm:gap-4 lg:gap-6">
          
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 py-1 px-1.5 rounded-lg hover:ring-1 hover:ring-white/20 transition focus:outline-none"
            aria-label="ApexShop Home"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight leading-none text-white">
                Apex<span className="text-amber-400">Shop</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Retail Store</span>
            </div>
          </Link>

          {/* Delivery Location Widget (Desktop) */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:ring-1 hover:ring-white/20 transition cursor-pointer text-xs text-slate-300">
            <FiMapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] text-slate-400">Deliver to</span>
              <span className="font-bold text-white">United States</span>
            </div>
          </div>

          {/* Amazon-style Integrated Search Bar (Desktop & Tablet) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex flex-1 max-w-2xl relative rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400"
            role="search"
          >
            {/* Category Dropdown */}
            <div className="relative bg-slate-100 text-slate-800 border-r border-slate-300 text-xs font-semibold shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-full pl-3 pr-7 py-2.5 bg-transparent appearance-none cursor-pointer focus:outline-none text-xs"
                aria-label="Select search category"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value} className="text-slate-800">
                    {c.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 w-3 h-3 pointer-events-none" />
            </div>

            {/* Input Box */}
            <input
              id="desktop-search"
              type="search"
              placeholder="Search products, brands, electronics, apparel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white text-slate-900 text-sm focus:outline-none placeholder:text-slate-400"
              aria-label="Search products"
            />

            {/* Amber Search Button */}
            <button
              type="submit"
              className="px-5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 flex items-center justify-center transition cursor-pointer"
              aria-label="Submit search"
            >
              <FiSearch className="w-4 h-4 font-bold" />
            </button>
          </form>

          {/* Right Header Navigation Items */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">
            
            {/* Returns & Orders */}
            {isAuthenticated() ? (
              <Link
                to="/orders"
                className="hidden md:flex flex-col text-left px-2.5 py-1.5 rounded-lg hover:ring-1 hover:ring-white/20 transition text-xs leading-tight"
              >
                <span className="text-[10px] text-slate-400">Returns</span>
                <span className="font-bold text-white">& Orders</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex flex-col text-left px-2.5 py-1.5 rounded-lg hover:ring-1 hover:ring-white/20 transition text-xs leading-tight"
              >
                <span className="text-[10px] text-slate-400">Returns</span>
                <span className="font-bold text-white">& Orders</span>
              </Link>
            )}

            {/* Account / User */}
            {isAuthenticated() ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex flex-col text-left px-2 py-1.5 rounded-lg hover:ring-1 hover:ring-white/20 transition text-xs leading-tight"
                >
                  <span className="text-[10px] text-slate-400">Hello, Sign In</span>
                  <span className="font-bold text-white flex items-center gap-0.5">
                    Account & Lists
                    <FiChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                </Link>
              </div>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              id="cart-button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:ring-1 hover:ring-white/20 transition relative group"
              aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            >
              <div className="relative">
                <FiShoppingCart className="w-6 h-6 text-white group-hover:text-amber-400 transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-[11px] h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-md animate-scale">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="font-bold text-xs text-white hidden sm:inline-block pt-1">
                Cart
              </span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="sm:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearchSubmit} role="search" className="flex rounded-xl overflow-hidden shadow-sm">
            <input
              id="mobile-search"
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 bg-white text-slate-900 text-xs focus:outline-none"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="px-4 bg-amber-400 text-slate-950 flex items-center justify-center"
              aria-label="Search"
            >
              <FiSearch className="w-4 h-4 font-bold" />
            </button>
          </form>
        </div>
      </div>

      {/* ── Tier 2: Sub-navigation Category Bar ──────────────────────── */}
      <div className="bg-slate-800 border-t border-slate-700/60 text-xs text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-10 gap-4 overflow-x-auto scrollbar-none">
          {/* All Button */}
          <Link
            to="/products"
            className="flex items-center gap-1.5 font-bold text-white px-2 py-1 rounded hover:ring-1 hover:ring-white/20 shrink-0"
          >
            <FiMenu className="w-4 h-4" />
            <span>All Departments</span>
          </Link>

          {/* Quick department links */}
          {subNavLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="whitespace-nowrap px-2 py-1 rounded hover:ring-1 hover:ring-white/20 transition text-slate-300 hover:text-white shrink-0"
            >
              {item.label}
            </Link>
          ))}

          {isAdmin() && (
            <Link
              to="/admin"
              className="ml-auto flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded hover:bg-amber-400/20 shrink-0"
            >
              <FiShield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Mobile Menu Drawer ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-slate-800 border-t border-slate-700 p-4 space-y-2 animate-dropdownIn">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700"
          >
            <FiHome className="w-4 h-4 text-amber-400" />
            Home
          </Link>
          <Link
            to="/products"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700"
          >
            <FiShoppingBag className="w-4 h-4 text-amber-400" />
            All Products
          </Link>

          <div className="pt-2 border-t border-slate-700">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
              Shop by Department
            </p>
            {categories.filter(c => c.value).map(c => (
              <Link
                key={c.value}
                to={`/products?categorySlug=${c.value}`}
                className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 text-xs"
              >
                {c.label}
              </Link>
            ))}
          </div>

          {isAuthenticated() && (
            <Link
              to="/orders"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 border-t border-slate-700"
            >
              <FiPackage className="w-4 h-4 text-amber-400" />
              My Orders
            </Link>
          )}

          {!isAuthenticated() && (
            <div className="pt-3 border-t border-slate-700 flex gap-2">
              <Link
                to="/login"
                className="flex-1 text-center py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold text-xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center py-2 bg-amber-400 hover:bg-amber-500 rounded-lg text-slate-950 font-bold text-xs"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
