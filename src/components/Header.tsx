import { useEffect, useState } from 'react';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '../CartContext';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { cart, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  // Placeholder for auth state, will be updated when AuthContext is ready
  const [isLoggedIn] = useState(false);

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
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className={clsx("text-xl sm:text-2xl font-black tracking-tight", scrolled ? "text-mango-dark" : "text-dark")}>
            MangoWala
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <nav className="hidden sm:flex items-center gap-6 mr-2">
            <Link to="/orders" className={clsx("text-sm font-bold transition-colors", scrolled ? "text-mango-dark hover:text-mango" : "text-dark hover:text-mango-dark")}>
              Orders
            </Link>
            {!isLoggedIn ? (
              <Link to="/login" className={clsx("text-sm font-bold transition-colors", scrolled ? "text-mango-dark hover:text-mango" : "text-dark hover:text-mango-dark")}>
                Login
              </Link>
            ) : (
              <button className={clsx("text-sm font-bold transition-colors", scrolled ? "text-mango-dark hover:text-mango" : "text-dark hover:text-mango-dark")}>
                Logout
              </button>
            )}
          </nav>

          <Link to="/login" className="sm:hidden p-2 rounded-full text-dark hover:bg-mango-light/30">
            <User className="w-6 h-6" />
          </Link>

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
      </div>
    </header>
  );
};
