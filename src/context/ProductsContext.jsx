import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fallbackProducts, normalizeProduct } from '../data/products';

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts(fallbackProducts);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('rank', { ascending: true });

    if (err) {
      setError(err.message);
      setProducts(fallbackProducts); // graceful degradation
    } else if (data && data.length) {
      setProducts(data.map(normalizeProduct));
      setError(null);
    } else {
      setProducts(fallbackProducts);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProductById = useCallback(
    (id) => products.find((p) => p.id === id),
    [products]
  );

  const availableProducts = products.filter((p) => p.isAvailable !== false);
  const coffeeProducts = availableProducts.filter((p) => p.category !== 'pastry');
  const pastryProducts = availableProducts.filter((p) => p.category === 'pastry');

  return (
    <ProductsContext.Provider
      value={{
        products,
        availableProducts,
        coffeeProducts,
        pastryProducts,
        loading,
        error,
        getProductById,
        refresh: fetchProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
