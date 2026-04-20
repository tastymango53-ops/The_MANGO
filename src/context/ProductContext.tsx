import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts } from '../data';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock?: number;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  removeProduct: (id: string) => void;
  editProduct: (id: string, updatedProduct: Partial<Product>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Load from local storage or fallback to mock data
  useEffect(() => {
    const saved = localStorage.getItem('mango_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts(mockProducts);
    }
  }, []);

  // Save to local storage whenever products change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('mango_products', JSON.stringify(products));
    }
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const editProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p))
    );
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, removeProduct, editProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
