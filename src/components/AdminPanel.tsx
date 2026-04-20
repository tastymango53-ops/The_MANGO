import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { X, Plus, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { products, addProduct, removeProduct } = useProducts();
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image) return;
    
    addProduct({
      name: formData.name,
      price: Number(formData.price),
      image: formData.image,
      description: formData.description,
    });
    
    setFormData({ name: '', price: '', image: '', description: '' });
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-dark">Control Panel</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Mango Inventory</h3>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-4 py-2 bg-leaf text-white rounded-full hover:bg-leaf-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isAdding ? 'Cancel' : 'Add Mango'}
            </button>
          </div>

          {/* Add Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white/50 rounded-2xl border border-white/40 shadow-sm">
              <h4 className="font-semibold mb-4 text-mango-dark">New Mango Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mango Variant Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border-none outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-mango bg-white/80"
                    placeholder="e.g. Sindhri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border-none outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-mango bg-white/80"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input 
                    type="url" 
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border-none outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-mango bg-white/80"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border-none outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-mango bg-white/80"
                    placeholder="Describe the mango..."
                    rows={2}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="mt-6 w-full py-3 bg-mango font-semibold text-dark rounded-xl shadow-md hover:bg-mango-light transition-colors"
              >
                Save Mango
              </button>
            </form>
          )}

          {/* Product List */}
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/30 hover:bg-white/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shadow-inner shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-lg">{product.name}</h5>
                    <p className="text-leaf-dark font-medium">₹{product.price}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeProduct(product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove Mango"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            {products.length === 0 && (
              <p className="text-center text-dark/50 py-8">No mangoes in inventory.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
