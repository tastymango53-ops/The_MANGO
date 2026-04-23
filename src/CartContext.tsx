import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from './data';

export interface CartItem extends Product {
  quantity: number;
  selectedWeight: number; // in kg
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, weight: number, quantity: number) => void;
  updateQuantity: (id: string, weight: number, quantity: number) => Promise<void>; 
  removeFromCart: (id: string, weight: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product, weight: number, quantity: number = 1) => {
    setCart((prev) => {
      // Find item with SAME id and SAME weight
      const existing = prev.find((item) => item.id === product.id && item.selectedWeight === weight);
      if (existing) {
        return prev.map((item) =>
          (item.id === product.id && item.selectedWeight === weight) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, selectedWeight: weight, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = async (id: string, weight: number, quantity: number) => {
    // Simulate API delay for optimistic UI/Saving state per prompt
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setCart((prev) =>
          prev.map((item) => 
            (item.id === id && item.selectedWeight === weight) 
              ? { ...item, quantity } 
              : item
          )
        );
        resolve();
      }, 600);
    });
  };

  const removeFromCart = (id: string, weight: number) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.selectedWeight === weight)));
  };

  const clearCart = () => setCart([]);

  // Price calculation: basePrice * weight * quantity
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.selectedWeight * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
