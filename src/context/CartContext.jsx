import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

function loadCart() {
  try {
    const saved = localStorage.getItem('aroma-cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadFavorites() {
  try {
    const saved = localStorage.getItem('aroma-favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    localStorage.setItem('aroma-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('aroma-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const addToCart = (product, quantity = 1, size = 'Medium', notes = '') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity, size, notes }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size === size))
    );
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const isFavorite = (productId) => favorites.has(productId);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cartItems.reduce((sum, item) => {
    const sizeExtra = item.product.sizes?.[item.size] || 0;
    return sum + (item.product.price + sizeExtra) * item.quantity;
  }, 0);

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
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
