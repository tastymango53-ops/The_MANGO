import { useEffect, useState } from 'react';
import { ShoppingBag, User } from 'lucide-react';
import { useCart } from '../CartContext';
import { clsx } from 'clsx';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const { cart, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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
            RED ROSE MANGO
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="hidden sm:flex items-center gap-6 mr-2">
            <Link to="/orders" className={clsx("text-sm font-bold transition-colors", scrolled ? "text-mango-dark hover:text-mango" : "text-dark hover:text-mango-dark")}>
              Orders
            </Link>
          </nav>

          {!isLoggedIn ? (
            <button 
              onClick={() => navigate('/login')}
              className={clsx("text-sm font-bold transition-colors px-4 py-2 rounded-full", scrolled ? "bg-mango text-white hover:bg-mango-dark" : "bg-white/80 text-dark hover:bg-white")}
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-end sm:items-start">
                <span className="hidden sm:block text-sm text-gray-700 font-bold truncate max-w-[120px]">
                  {user?.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-red-500 hover:text-red-600 underline">
                  Logout
                </button>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.email?.[0].toUpperCase() || <User className="w-4 h-4" />}
              </div>
            </div>
          )}

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
