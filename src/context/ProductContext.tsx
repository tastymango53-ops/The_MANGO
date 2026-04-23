import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts } from '../data';
import { fetchProducts, upsertProduct, updateProduct, deleteProduct } from '../lib/supabase';
import type { ProductDB } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  originStory?: string;
  tasteNotes?: string[];
  weightOptions?: number[];
  stock?: number;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  editProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Helper to map DB snake_case to Frontend camelCase
const mapDBToProduct = (db: ProductDB): Product => ({
  id: db.id,
  name: db.name,
  price: db.price,
  image: db.image,
  description: db.description,
  originStory: db.origin_story,
  tasteNotes: db.taste_notes,
  weightOptions: db.weight_options,
});

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase
  const loadProducts = async () => {
    setIsLoading(true);
    const data = await fetchProducts();
    if (data && data.length > 0) {
      setProducts(data.map(mapDBToProduct));
    } else {
      // Fallback to mock data if DB is empty
      setProducts(mockProducts);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const success = await upsertProduct({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      origin_story: product.originStory,
      taste_notes: product.tasteNotes,
      weight_options: product.weightOptions,
    } as any);

    if (success) loadProducts();
  };

  const removeProduct = async (id: string) => {
    const success = await deleteProduct(id);
    if (success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const editProduct = async (id: string, updatedProduct: Partial<Product>) => {
    const fields: Record<string, any> = {};
    if (updatedProduct.name !== undefined)         fields.name = updatedProduct.name;
    if (updatedProduct.price !== undefined)        fields.price = Number(updatedProduct.price);
    if (updatedProduct.image !== undefined)        fields.image = updatedProduct.image;
    if (updatedProduct.description !== undefined)  fields.description = updatedProduct.description;
    if (updatedProduct.originStory !== undefined)  fields.origin_story = updatedProduct.originStory;
    if (updatedProduct.tasteNotes !== undefined)   fields.taste_notes = updatedProduct.tasteNotes;
    if (updatedProduct.weightOptions !== undefined) fields.weight_options = updatedProduct.weightOptions;

    const success = await updateProduct(id, fields);
    if (success) {
      // Immediately update local state so UI reflects the change without a full reload
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedProduct, price: Number(updatedProduct.price ?? p.price) } : p))
      );
    } else {
      console.error('editProduct: updateProduct returned false — check Supabase RLS policies on the products table');
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, removeProduct, editProduct, isLoading }}>
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
