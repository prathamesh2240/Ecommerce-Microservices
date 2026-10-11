import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiBox,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiSliders,
} from 'react-icons/fi';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { ErrorState } from '../components/common/ErrorState';
import { Pagination } from '../components/common/Pagination';

export const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const keywordParam = searchParams.get('keyword') || '';
  const categoryParam = searchParams.get('categorySlug') || '';
  const brandParam = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const sortParam = searchParams.get('sort') || 'createdAt,desc';

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter input states
  const [keywordInput, setKeywordInput] = useState(keywordParam);
  const [customMinPrice, setCustomMinPrice] = useState(minPriceParam);
  const [customMaxPrice, setCustomMaxPrice] = useState(maxPriceParam);

  const categories = [
    { label: 'All Departments', value: '' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Fashion & Apparel', value: 'fashion' },
    { label: 'Home & Kitchen', value: 'home-kitchen' },
    { label: 'Sports & Outdoors', value: 'sports' },
    { label: 'Books & Accessories', value: 'books' },
  ];

  const popularBrands = [
    'Apple', 'Sony', 'Logitech', 'Nike', 'Patagonia', 'Breville', 'Instant Pot', 'Bowflex', 'Coleman', 'Prentice Hall', 'Moleskine'
  ];

  const priceRanges = [
    { label: 'All Prices', min: '', max: '' },
    { label: 'Under $25', min: '', max: '25' },
    { label: '$25 to $50', min: '25', max: '50' },
    { label: '$50 to $100', min: '50', max: '100' },
    { label: '$100 & Above', min: '100', max: '' },
  ];

  const sortOptions = [
    { label: 'Featured: Newest Arrivals', value: 'createdAt,desc' },
    { label: 'Price: Low to High', value: 'price,asc' },
    { label: 'Price: High to Low', value: 'price,desc' },
    { label: 'Product Name: A to Z', value: 'name,asc' },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageParam,
        size: 12,
        sort: sortParam,
      };

      if (keywordParam) params.keyword = keywordParam;
      if (categoryParam) params.categorySlug = categoryParam;
      if (brandParam) params.brand = brandParam;
      if (minPriceParam) params.minPrice = minPriceParam;
      if (maxPriceParam) params.maxPrice = maxPriceParam;

      const response = await productService.searchProducts(params);
      const pageData = response || {};
      setProducts(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setKeywordInput(keywordParam);
    setCustomMinPrice(minPriceParam);
    setCustomMaxPrice(maxPriceParam);
    fetchProducts();
  }, [searchParams]);

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ keyword: keywordInput.trim() });
  };

  const handlePriceRangeSubmit = (e) => {
    e.preventDefault();
    updateFilters({
      minPrice: customMinPrice ? customMinPrice.trim() : '',
      maxPrice: customMaxPrice ? customMaxPrice.trim() : '',
    });
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setKeywordInput('');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(
    keywordParam || categoryParam || brandParam || minPriceParam || maxPriceParam
  );

  return (
    <div className="space-y-6 pb-20">
      {/* ── Breadcrumb Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-gray-500 py-1">
        <div className="flex items-center space-x-2">
          <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-gray-800">
            {categoryParam
              ? categories.find(c => c.value === categoryParam)?.label || 'Products'
              : 'All Products'}
          </span>
          {keywordParam && (
            <>
              <span>/</span>
              <span className="text-gray-600 italic">"{keywordParam}"</span>
            </>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm"
        >
          <FiSliders className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      {/* ── Main Split View (Sidebar + Content) ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ── Left Sidebar Filters ─────────────────────────────────── */}
        <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FiFilter className="w-4 h-4 text-amber-500" />
                <span>Filters</span>
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Keyword Search within Directory */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Keyword
              </label>
              <form onSubmit={handleSearchSubmit} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 bg-amber-400 hover:bg-amber-500 rounded-lg text-slate-950 font-bold text-xs"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Departments / Categories */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Department
              </h4>
              <ul className="space-y-1 text-xs">
                {categories.map((cat) => (
                  <li key={cat.value}>
                    <button
                      onClick={() => updateFilters({ categorySlug: cat.value })}
                      className={`w-full text-left py-1.5 px-2 rounded-lg flex items-center justify-between transition cursor-pointer ${
                        categoryParam === cat.value
                          ? 'bg-amber-50 font-bold text-amber-900 border border-amber-200'
                          : 'text-gray-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {categoryParam === cat.value && <FiCheck className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter Presets & Custom Inputs */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Price Range
              </h4>
              <ul className="space-y-1 text-xs">
                {priceRanges.map((range, idx) => {
                  const isSelected = minPriceParam === range.min && maxPriceParam === range.max;
                  return (
                    <li key={idx}>
                      <button
                        onClick={() => updateFilters({ minPrice: range.min, maxPrice: range.max })}
                        className={`w-full text-left py-1.5 px-2 rounded-lg flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 font-bold text-amber-900 border border-amber-200'
                            : 'text-gray-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{range.label}</span>
                        {isSelected && <FiCheck className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Custom Min / Max Price Form */}
              <form onSubmit={handlePriceRangeSubmit} className="pt-2 flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="$ Min"
                  value={customMinPrice}
                  onChange={(e) => setCustomMinPrice(e.target.value)}
                  className="w-16 px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="$ Max"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                  className="w-16 px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Popular Brands Filter */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Brand
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {popularBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => updateFilters({ brand: brandParam === b ? '' : b })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      brandParam.toLowerCase() === b.toLowerCase()
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right Content Results Area (3 cols) ───────────────────── */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Results Toolbar (Results Counter + Sort By) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600">
              <span className="font-bold text-slate-900">
                {totalElements > 0
                  ? `Showing 1 – ${products.length} of ${totalElements} items`
                  : '0 items found'}
              </span>
              {keywordParam && (
                <span className="ml-1 text-slate-500">
                  for <strong className="text-slate-800">"{keywordParam}"</strong>
                </span>
              )}
            </div>

            {/* Amazon-style Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 shrink-0">
                Sort by:
              </label>
              <div className="relative">
                <select
                  value={sortParam}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Active Filters:</span>
              {categoryParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold">
                  <span>Category: {categoryParam}</span>
                  <button onClick={() => updateFilters({ categorySlug: '' })} className="hover:text-amber-950">
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {keywordParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-semibold">
                  <span>Keyword: "{keywordParam}"</span>
                  <button onClick={() => updateFilters({ keyword: '' })} className="hover:text-indigo-950">
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {brandParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold">
                  <span>Brand: {brandParam}</span>
                  <button onClick={() => updateFilters({ brand: '' })} className="hover:text-slate-950">
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(minPriceParam || maxPriceParam) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold">
                  <span>Price: ${minPriceParam || '0'} - ${maxPriceParam || 'Any'}</span>
                  <button onClick={() => updateFilters({ minPrice: '', maxPrice: '' })} className="hover:text-emerald-950">
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid / Loading / Error / Empty States */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {error && <ErrorState message={error} onRetry={fetchProducts} />}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 space-y-4">
              <FiBox className="w-12 h-12 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try broadening your search, resetting price ranges, or removing filters.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pt-6">
                  <Pagination
                    currentPage={pageParam}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
