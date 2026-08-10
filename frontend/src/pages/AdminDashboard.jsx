import React, { useState, useEffect } from 'react';
import { FiShield, FiUsers, FiBox, FiPlus, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    brand: '',
    description: '',
    price: '',
    currency: 'USD',
    imageUrl: '',
    categoryId: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const prodRes = await productService.searchProducts({ page: 0, size: 20 });
      setProducts(prodRes.data?.content || []);

      try {
        const userRes = await userService.getAllUsers();
        setUsers(userRes.data || []);
      } catch {
        setUsers([]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct({
        ...newProduct,
        price: Number(newProduct.price),
      });
      toast.success(`Product ${newProduct.name} created!`);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted from catalog');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1 w-fit">
            <FiShield className="w-3.5 h-3.5" />
            <span>ROLE_ADMIN Verified</span>
          </span>
          <h1 className="text-3xl font-extrabold">Admin Management Console</h1>
        </div>

        <button
          onClick={fetchData}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
          title="Refresh Data"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 space-x-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiBox className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiUsers className="w-4 h-4" />
          <span>Registered Users ({users.length})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading administration metrics..." />
      ) : (
        <>
          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Catalog Directory</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">Price</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4 font-mono text-xs font-bold text-indigo-600">{p.sku}</td>
                        <td className="p-4 font-bold text-gray-900">{p.name}</td>
                        <td className="p-4 text-xs">{p.brand || '-'}</td>
                        <td className="p-4 font-bold">${Number(p.price).toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">User Registry</h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="p-4 font-mono text-xs text-gray-400">#{u.id}</td>
                        <td className="p-4 font-bold text-gray-900">
                          {u.firstName ? `${u.firstName} ${u.lastName || ''}` : 'User'}
                        </td>
                        <td className="p-4 text-xs">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Create New Catalog Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">SKU</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PIXEL-9"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Google Pixel 9 Pro"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="Google"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="999.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Product description..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
