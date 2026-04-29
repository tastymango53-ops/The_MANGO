import { useState } from 'react';
import { CartProvider } from './CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { AppRoutes } from './AppRoutes';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { AdminDashboard } from './pages/AdminDashboard';
import { PasswordPrompt } from './components/PasswordPrompt';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
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
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
