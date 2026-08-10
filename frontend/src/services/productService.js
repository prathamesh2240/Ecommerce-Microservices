import api from './api';

export const productService = {
  searchProducts: async (params = {}) => {
    // GET /api/catalog/products/search
    // Query params: keyword, brand, categorySlug, minPrice, maxPrice, page, size, sort
    const response = await api.get('/api/catalog/products/search', { params });
    return response.data;
  },

  getProductById: async (id) => {
    // GET /api/catalog/products/{id}
    const response = await api.get(`/api/catalog/products/${id}`);
    return response.data;
  },

  getProductBySlug: async (slug) => {
    // GET /api/catalog/products/slug/{slug}
    const response = await api.get(`/api/catalog/products/slug/${slug}`);
    return response.data;
  },

  createProduct: async (productData) => {
    // POST /api/catalog/products (Admin only)
    const response = await api.post('/api/catalog/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    // PUT /api/catalog/products/{id} (Admin only)
    const response = await api.put(`/api/catalog/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    // DELETE /api/catalog/products/{id} (Admin only)
    const response = await api.delete(`/api/catalog/products/${id}`);
    return response.data;
  },
};
