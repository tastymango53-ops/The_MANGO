import React, { useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import type { Product } from '../data';

interface QuantityModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const QuantityModal: React.FC<QuantityModalProps> = ({ product, onClose, onAddToCart }) => {
  const [customQty, setCustomQty] = useState('');

  const handleAdd = (qty: number) => {
    onAddToCart(product, qty);
    onClose();
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(customQty);
    if (!isNaN(qty) && qty > 0) {
      handleAdd(qty);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-md overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-dark/50 hover:bg-white/40 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pb-4 flex flex-col items-center">
          <div className="w-32 h-32 rounded-[41%_59%_41%_59%_/_51%_60%_40%_49%] bg-mango/10 p-4 mb-6 shadow-inner">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h2 className="text-3xl font-black text-dark mb-2 text-center">{product.name}</h2>
          <p className="text-leaf-dark font-bold text-xl mb-6">₹{product.price} <span className="text-sm text-dark/50 font-medium">per unit</span></p>

          <div className="w-full space-y-3">
            <button 
              onClick={() => handleAdd(6)}
              className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-mango-light/30 border border-mango/20 rounded-2xl transition-all shadow-sm hover:shadow-md group"
            >
              <div className="text-left">
                <span className="block font-bold text-lg text-dark">Half Dozen (6)</span>
                <span className="text-sm text-dark/60">₹{product.price * 6}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-mango-dark group-hover:scale-110 transition-transform shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </button>

            <button 
              onClick={() => handleAdd(12)}
              className="w-full flex items-center justify-between p-4 bg-mango text-dark border border-mango/50 rounded-2xl transition-all shadow-[0_4px_14px_0_rgb(255,183,3,0.39)] hover:shadow-[0_6px_20px_rgba(255,183,3,0.23)] hover:scale-[1.02] group"
            >
              <div className="text-left">
                <span className="block font-black text-lg">1 Dozen (12)</span>
                <span className="text-sm opacity-80 font-semibold text-dark/80">₹{product.price * 12}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-dark group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </button>

            <button 
              onClick={() => handleAdd(24)}
              className="w-full flex items-center justify-between p-4 bg-leaf text-white border border-leaf-dark/20 rounded-2xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group"
            >
              <div className="text-left">
                <span className="block font-bold text-lg">2 Dozen (24)</span>
                <span className="text-sm opacity-90 font-medium">₹{product.price * 24}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </button>
          </div>

          <form onSubmit={handleCustomAdd} className="mt-6 w-full flex gap-3">
            <input 
              type="number" 
              placeholder="Custom quantity..." 
              value={customQty}
              onChange={(e) => setCustomQty(e.target.value)}
              min="1"
              className="flex-1 px-4 py-3 rounded-xl border-none outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-mango bg-white/80"
            />
            <button 
              type="submit"
              disabled={!customQty || parseInt(customQty) < 1}
              className="px-6 py-3 bg-dark text-white font-bold rounded-xl shadow-md hover:bg-dark/80 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
