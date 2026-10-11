/**
 * getProductImage — Resolves the display image for a product.
 *
 * Priority:
 * 1. `imageUrl` from the product (backend-defined, trusted)
 * 2. Name/SKU-based local image matching (for demo seed data)
 * 3. Default placeholder
 */
export const getProductImage = (product) => {
  if (!product) return '/images/products/pixel-9-pro.png';

  // Priority 1: Use imageUrl if it's an absolute or root-relative URL
  if (product.imageUrl && (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/'))) {
    return product.imageUrl;
  }

  // Priority 2: Match by SKU/name for local demo product images
  const sku = (product.sku || '').toUpperCase();
  const name = (product.name || '').toLowerCase();

  if (sku.includes('MACBOOK') || name.includes('macbook')) {
    return '/images/products/macbook-pro.png';
  }
  if (sku.includes('SONY') || sku.includes('XM5') || name.includes('sony') || name.includes('headphone')) {
    return '/images/products/sony-xm5.png';
  }
  if (sku.includes('WATCH') || name.includes('apple watch') || name.includes('ultra')) {
    return '/images/products/apple-watch-ultra.png';
  }
  if (sku.includes('NIKE') || sku.includes('PEGASUS') || name.includes('shoe') || name.includes('nike')) {
    return '/images/products/nike-air-zoom.png';
  }
  if (sku.includes('ESPRESSO') || name.includes('espresso') || name.includes('coffee') || name.includes('breville')) {
    return '/images/products/espresso-master.png';
  }
  if (sku.includes('PIXEL') || name.includes('pixel')) {
    return '/images/products/pixel-9-pro.png';
  }

  // Priority 3: Default
  return '/images/products/pixel-9-pro.png';
};
