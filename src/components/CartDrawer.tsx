import { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { CheckoutForm } from './CheckoutForm';
import { clsx } from 'clsx';

export const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      setIsCheckout(false);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  const handleUpdate = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setUpdatingId(id);
    await updateQuantity(id, newQuantity);
    setUpdatingId(null);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={clsx(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-offwhite shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ overscrollBehavior: 'contain' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-dark/10 bg-white">
          <h2 id="cart-title" className="text-2xl font-bold text-dark flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange" />
            {isCheckout ? "Checkout" : "Your Cart"}
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 -mr-2 bg-transparent text-dark/70 hover:text-dark hover:bg-dark/5 rounded-full transition-colors focus-visible:ring-2 touch-manipulation"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {!isCheckout ? (
            cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <ShoppingBag className="w-16 h-16 text-dark/20" />
                <p className="text-xl text-dark/60 font-medium">Your cart is empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-3 bg-white border-2 border-orange text-orange font-bold rounded-full hover:bg-orange hover:text-white transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-dark/5 shadow-sm">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-contain rounded-xl bg-offwhite/50" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-dark">{item.name}</h3>
                        <p className="text-orange font-semibold">₹{item.price}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 bg-offwhite rounded-full p-1 border border-dark/5">
                          <button
                            onClick={() => handleUpdate(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-white rounded-full transition-colors touch-manipulation"
                            aria-label="Decrease quantity"
                            disabled={updatingId === item.id}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-4 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdate(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-white rounded-full transition-colors touch-manipulation"
                            aria-label="Increase quantity"
                            disabled={updatingId === item.id}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {updatingId === item.id && (
                          <span className="text-sm text-dark/50 animate-pulse font-medium">Saving&hellip;</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <CheckoutForm onBack={() => setIsCheckout(false)} />
          )}
        </div>

        {!isCheckout && cart.length > 0 && (
          <div className="p-6 bg-white border-t border-dark/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-dark/70 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-dark">₹{cartTotal}</span>
            </div>
            <button
              onClick={() => setIsCheckout(true)}
              className="w-full py-4 bg-orange text-white font-bold rounded-xl text-lg shadow-lg hover:bg-orange/90 transition-transform active:scale-95 touch-manipulation focus-visible:ring-2"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};
