import { useState } from 'react';
import { CartProvider } from './CartContext';
import { ProductProvider } from './context/ProductContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { FallingLeaves } from './components/FallingLeaves';
import { PasswordPrompt } from './components/PasswordPrompt';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  return (
    <ProductProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col font-sans relative">
          <FallingLeaves />
          <Header />
          <main className="flex-1 relative z-10">
            <Hero />
            <ProductGrid />
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
          {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
        </div>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
