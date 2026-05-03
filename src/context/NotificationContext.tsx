import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase, getNotifications, markNotificationAsRead } from '../lib/supabase';
import type { AppNotification } from '../lib/supabase';
import { NotificationToast } from '../components/NotificationToast';

type ActiveToast = {
  id: string;
  message: string;
};

type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([]);

  // 1. Fetch initial notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchInitial = async () => {
      const data = await getNotifications(user.id);
      setNotifications(data);
    };

    fetchInitial();
  }, [user]);

  // 2. Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          
          // Add to notification list
          setNotifications((prev) => [newNotif, ...prev]);
          
          // Show toast
          const toastId = Math.random().toString(36).substr(2, 9);
          setActiveToasts((prev) => [...prev, { id: toastId, message: newNotif.message }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationAsRead(id);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id).filter(Boolean) as string[];
    
    // Optimistic update
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    
    // Mark them all in DB concurrently
    await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
  };

  const removeToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
      
      {/* Global Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {activeToasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            message={toast.message}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
