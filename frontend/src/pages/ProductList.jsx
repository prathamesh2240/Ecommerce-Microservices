import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiBox } from 'react-icons/fi';
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
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const sortParam = searchParams.get('sort') || 'createdAt,desc';

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keyword, setKeyword] = useState(keywordParam);
  const [brand, setBrand] = useState(brandParam);
  const [categorySlug, setCategorySlug] = useState(categoryParam);

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

      const response = await productService.searchProducts(params);
      const pageData = response.data || {};
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
    fetchProducts();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (keyword.trim()) newParams.set('keyword', keyword.trim());
    else newParams.delete('keyword');

    if (brand.trim()) newParams.set('brand', brand.trim());
    else newParams.delete('brand');

    if (categorySlug.trim()) newParams.set('categorySlug', categorySlug.trim());
    else newParams.delete('categorySlug');

    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setBrand('');
    setCategorySlug('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Fashion & Apparel', value: 'fashion' },
    { label: 'Home & Kitchen', value: 'home-kitchen' },
    { label: 'Sports & Outdoors', value: 'sports' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white py-12 px-6 rounded-3xl shadow-xl">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Product Directory</h1>
          <p className="text-indigo-200 text-sm sm:text-base">
            Explore our microservices-powered live catalog with real-time stock allocation
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Search Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name, description..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Brand</label>
            <input
              type="text"
              placeholder="e.g. Google, Apple, Nike"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <FiFilter className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>

            {(keywordParam || categoryParam || brandParam) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition"
                title="Clear Filters"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Found {totalElements} items matching query</span>
          <span>Page {pageParam + 1} of {totalPages}</span>
        </div>
      </div>

      {/* Product Grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={fetchProducts} />}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 space-y-3">
          <FiBox className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-800">No products match your criteria</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing your category/brand filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold text-sm rounded-xl hover:bg-indigo-100 transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination currentPage={pageParam} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};
