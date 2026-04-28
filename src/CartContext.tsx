import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Product } from './data';
import { supabase } from './lib/supabase';

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

const CART_KEY  = 'mangowala_cart';
const OWNER_KEY = 'mangowala_cart_owner';

/** Load cart only if it belongs to the current user (or no user = guest) */
function loadCart(userId: string | null): CartItem[] {
  try {
    const owner     = localStorage.getItem(OWNER_KEY);
    const savedCart = localStorage.getItem(CART_KEY);
    // If there's a saved cart, it must belong to the current user
    if (savedCart && (owner === userId || (!owner && !userId))) {
      return JSON.parse(savedCart);
    }
  } catch { /* ignore */ }
  return [];
}

function saveCart(items: CartItem[], userId: string | null) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  if (userId) {
    localStorage.setItem(OWNER_KEY, userId);
  } else {
    localStorage.removeItem(OWNER_KEY);
  }
}

function wipeCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(OWNER_KEY);
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Start with empty cart; we'll hydrate after we know the current user
  const [cart, setCart]       = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // ── Step 1: Resolve current user, then load correct cart ──────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setCurrentUserId(uid);
      setCart(loadCart(uid));
      setHydrated(true);
    });

    // ── Step 2: Listen for auth changes → clear cart on user switch ──────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUid = session?.user?.id ?? null;

      if (event === 'SIGNED_OUT') {
        wipeCart();
        setCart([]);
        setCurrentUserId(null);
      }

      if (event === 'SIGNED_IN') {
        const previousUid = currentUserId;
        // If a different user signed in, wipe the old cart
        if (previousUid && previousUid !== newUid) {
          wipeCart();
          setCart([]);
        } else {
          // Same user or fresh login — load their saved cart
          setCart(loadCart(newUid));
        }
        setCurrentUserId(newUid);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 3: Persist cart whenever it changes (after hydration) ────────────
  useEffect(() => {
    if (!hydrated) return;
    saveCart(cart, currentUserId);
  }, [cart, currentUserId, hydrated]);

  // ── Cart actions ──────────────────────────────────────────────────────────
  const addToCart = useCallback((product: Product, weight: number, quantity: number = 1) => {
    setCart((prev) => {
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
  }, []);

  const updateQuantity = useCallback(async (id: string, weight: number, quantity: number) => {
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
  }, []);

  const removeFromCart = useCallback((id: string, weight: number) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.selectedWeight === weight)));
  }, []);

  const clearCart = useCallback(() => {
    wipeCart();
    setCart([]);
  }, []);

  const cartTotal = cart.reduce(
    (total, item) => total + (item.price * Math.abs(item.selectedWeight) * item.quantity),
    0
  );

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
