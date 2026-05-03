import { useState } from 'react';
import { CartProvider } from './CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/Header';
import { AppRoutes } from './AppRoutes';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { AdminDashboard } from './pages/AdminDashboard';
import { PasswordPrompt } from './components/PasswordPrompt';
import { usePushNotifications } from './hooks/usePushNotifications';

/** Inner component so it can safely use AuthContext hooks */
function AppInner() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const { user } = useAuth();

  // Silently register push notifications for logged-in users
  usePushNotifications(user?.id);

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <Header />
      <main className="flex-1 relative z-10">
        <AppRoutes />
      </main>
      <div className="relative z-10 bg-offwhite">
        <Footer onOpenAdmin={() => setIsPromptOpen(true)} />
      </div>
      <CartDrawer />
      {isPromptOpen && (
        <PasswordPrompt
          onSuccess={() => { setIsPromptOpen(false); setIsAdminOpen(true); }}
          onCancel={() => setIsPromptOpen(false)}
        />
      )}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <AdminDashboard onClose={() => setIsAdminOpen(false)} />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProductProvider>
          <CartProvider>
            <AppInner />
          </CartProvider>
        </ProductProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
