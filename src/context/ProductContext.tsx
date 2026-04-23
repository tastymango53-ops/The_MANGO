import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts } from '../data';
import { fetchProducts, upsertProduct, deleteProduct } from '../lib/supabase';
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
    const dbUpdate: any = { id };
    if (updatedProduct.name) dbUpdate.name = updatedProduct.name;
    if (updatedProduct.price !== undefined) dbUpdate.price = updatedProduct.price;
    if (updatedProduct.image) dbUpdate.image = updatedProduct.image;
    if (updatedProduct.description) dbUpdate.description = updatedProduct.description;
    if (updatedProduct.originStory) dbUpdate.origin_story = updatedProduct.originStory;
    if (updatedProduct.tasteNotes) dbUpdate.taste_notes = updatedProduct.tasteNotes;
    if (updatedProduct.weightOptions) dbUpdate.weight_options = updatedProduct.weightOptions;

    const success = await upsertProduct(dbUpdate);
    if (success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p))
      );
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
