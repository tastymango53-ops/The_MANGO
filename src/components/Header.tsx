import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../CartContext';
import { clsx } from 'clsx';

export const Header = () => {
  const { cart, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 w-full z-30 transition-colors duration-300",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-mango/20 py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={clsx("text-xl sm:text-2xl font-black tracking-tight", scrolled ? "text-mango-dark" : "text-dark")}>
            MangoWala
          </div>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className={clsx(
            "relative p-3 rounded-full transition-all focus-visible:ring-2 touch-manipulation",
            scrolled ? "bg-mango-light/30 text-mango-dark hover:bg-mango-light" : "bg-white/60 backdrop-blur-sm text-dark hover:bg-white shadow-sm"
          )}
          aria-label="Open Cart"
        >
          <ShoppingBag className="w-6 h-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-leaf text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
              {cartItemsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
