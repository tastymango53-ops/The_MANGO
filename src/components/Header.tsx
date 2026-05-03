import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, User, Bell } from 'lucide-react';
import { useCart } from '../CartContext';
import { clsx } from 'clsx';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = ({ scrolled }: { scrolled: boolean }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative p-3 rounded-full transition-all focus-visible:ring-2 touch-manipulation",
          scrolled ? "bg-mango-light/30 text-mango-dark hover:bg-mango-light" : "bg-white/60 backdrop-blur-sm text-dark hover:bg-white shadow-sm"
        )}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs font-bold text-mango-dark hover:text-mango transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">
                No notifications yet 🥭
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => { if (!n.read && n.id) markAsRead(n.id); }}
                    className={clsx(
                      "p-4 transition-colors",
                      n.read ? "bg-white" : "bg-green-50/50 hover:bg-green-50 cursor-pointer"
                    )}
                  >
                    <p className={clsx("text-sm", n.read ? "text-slate-600" : "text-slate-800 font-medium")}>
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Just now'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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

          {isLoggedIn && <NotificationDropdown scrolled={scrolled} />}

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
