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
  FiList,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll to add shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) =>
    `relative text-sm font-medium transition-colors duration-150 py-1 ${
      isActive(path)
        ? 'text-indigo-600'
        : 'text-gray-600 hover:text-indigo-600'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 bg-white border-b border-gray-100 transition-shadow duration-200 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      {/* ── Main Navbar Row ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-3 lg:gap-6">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
            aria-label="ApexShop home"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200/60 shrink-0">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hidden sm:block">
              ApexShop
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg relative"
            role="search"
          >
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              id="desktop-search"
              type="search"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-150"
              aria-label="Search products"
            />
          </form>

          {/* Desktop Nav Links */}
          <nav
            className="hidden lg:flex items-center gap-6"
            aria-label="Main navigation"
          >
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/products" className={navLinkClass('/products')}>Products</Link>
            {isAuthenticated() && (
              <Link to="/orders" className={navLinkClass('/orders')}>My Orders</Link>
            )}
            {isAdmin() && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors duration-150"
              >
                <FiShield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Cart */}
            <Link
              to="/cart"
              id="cart-button"
              className="relative p-2.5 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            >
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm animate-scale px-0.5">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth: UserMenu or Login/Register */}
            {isAuthenticated() ? (
              <UserMenu />
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors duration-150"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors duration-150"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} role="search" className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              id="mobile-search"
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-150"
              aria-label="Search products"
            />
          </form>
        </div>
      </div>

      {/* ── Mobile Menu Drawer ─────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-5 space-y-1 shadow-lg"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* Nav Links */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            <FiHome className="w-4 h-4 text-gray-400" />
            Home
          </Link>
          <Link
            to="/products"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            <FiList className="w-4 h-4 text-gray-400" />
            Products
          </Link>

          {isAuthenticated() && (
            <Link
              to="/orders"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <FiPackage className="w-4 h-4 text-gray-400" />
              My Orders
            </Link>
          )}

          {isAdmin() && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <FiShield className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}

          {/* Auth section (mobile) */}
          {!isAuthenticated() && (
            <div className="pt-3 pb-1 flex gap-2">
              <Link
                to="/login"
                className="flex-1 text-center py-2.5 text-sm font-semibold border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
