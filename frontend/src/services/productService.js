import api from './api';

/**
 * productService — Product catalog API calls
 *
 * All methods unwrap the backend's ApiResponse<T> wrapper internally,
 * returning the inner data directly to callers.
 *
 * Backend shape: ApiResponse<Page<ProductResponse>> for search
 *                ApiResponse<ProductResponse> for single product
 */
export const productService = {
  /**
   * GET /api/catalog/products/search
   * @param {{ keyword?, brand?, categorySlug?, minPrice?, maxPrice?, page?, size?, sort? }} params
   * @returns {Page<ProductResponse>} — { content, totalPages, totalElements, ... }
   */
  searchProducts: async (params = {}) => {
    const response = await api.get('/api/catalog/products/search', { params });
    // response.data = ApiResponse<Page<ProductResponse>>; unwrap the inner .data
    return response.data?.data ?? response.data;
  },

  /**
   * GET /api/catalog/products/{id}
   * @returns {ProductResponse}
   */
  getProductById: async (id) => {
    const response = await api.get(`/api/catalog/products/${id}`);
    return response.data?.data ?? response.data;
  },

  /**
   * GET /api/catalog/products/slug/{slug}
   * @returns {ProductResponse}
   */
  getProductBySlug: async (slug) => {
    const response = await api.get(`/api/catalog/products/slug/${slug}`);
    return response.data?.data ?? response.data;
  },

  /**
   * POST /api/catalog/products (Admin only)
   * @returns {ProductResponse}
   */
  createProduct: async (productData) => {
    const response = await api.post('/api/catalog/products', productData);
    return response.data?.data ?? response.data;
  },

  /**
   * PUT /api/catalog/products/{id} (Admin only)
   * @returns {ProductResponse}
   */
  updateProduct: async (id, productData) => {
    const response = await api.put(`/api/catalog/products/${id}`, productData);
    return response.data?.data ?? response.data;
  },

  /**
   * DELETE /api/catalog/products/{id} (Admin only)
   */
  deleteProduct: async (id) => {
    const response = await api.delete(`/api/catalog/products/${id}`);
    return response.data;
  },
};
