import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.sku === product.sku);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        toast.success(`Updated ${product.name} quantity in cart (${updated[existingIndex].quantity})`);
        return updated;
      } else {
        toast.success(`Added ${product.name} to cart`);
        return [
          ...prevItems,
          {
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            currency: product.currency || 'USD',
            imageUrl: product.imageUrl || product.thumbnailUrl,
            brand: product.brand,
            quantity: quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (sku) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.sku === sku);
      if (item) toast.info(`Removed ${item.name} from cart`);
      return prev.filter((i) => i.sku !== sku);
    });
  };

  const updateQuantity = (sku, quantity) => {
    if (quantity <= 0) {
      removeFromCart(sku);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
