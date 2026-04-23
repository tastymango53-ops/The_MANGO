import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import type { Product } from '../context/ProductContext';
import { X, Plus, Trash2, Pencil, Check, ImageIcon } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

const EMPTY_FORM = { name: '', price: '', image: '', description: '' };

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { products, addProduct, removeProduct, editProduct } = useProducts();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // ── Edit form for an existing product ────────────────────────────────────
  const [editForm, setEditForm] = useState<{
    price: string;
    image: string;
    description: string;
  }>({ price: '', image: '', description: '' });

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      price: String(product.price),
      image: product.image,
      description: product.description,
    });
  };

  const saveEdit = (id: string) => {
    if (!editForm.price) return;
    editProduct(id, {
      price: Number(editForm.price),
      image: editForm.image,
      description: editForm.description,
    });
    setEditingId(null);
  };

  // ── Add new product ───────────────────────────────────────────────────────
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image) return;
    addProduct({
      name: formData.name,
      price: Number(formData.price),
      image: formData.image,
      description: formData.description,
      originStory: '',
      tasteNotes: [],
      weightOptions: [1, 2, 5],
    } as Omit<Product, 'id'>);
    setFormData(EMPTY_FORM);
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-dark">Control Panel</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Mango Inventory</h3>
            <button
              onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-leaf text-white rounded-full hover:bg-leaf-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isAdding ? 'Cancel' : 'Add Mango'}
            </button>
          </div>

          {/* ── Add Form ─────────────────────────────────────────────────── */}
          {isAdding && (
            <form onSubmit={handleAdd} className="mb-8 p-6 bg-white/50 rounded-2xl border border-white/40 shadow-sm">
              <h4 className="font-semibold mb-4 text-mango-dark">New Mango Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mango Variant Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-none outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-mango bg-white/80"
                    placeholder="e.g. Sindhri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price per kg (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-none outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-mango bg-white/80"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

          {/* ── Product List ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white/60 rounded-2xl border border-white/30 overflow-hidden">

                {/* Row header — always visible */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shadow-inner shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h5 className="font-bold text-lg text-dark">{product.name}</h5>
                      <p className="text-leaf-dark font-semibold">₹{product.price}/kg</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit toggle */}
                    <button
                      onClick={() => editingId === product.id ? setEditingId(null) : startEdit(product)}
                      className="p-2 text-mango-dark hover:bg-mango/10 rounded-full transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline edit form — slides in when editing */}
                {editingId === product.id && (
                  <div className="px-4 pb-5 border-t border-mango/10 pt-4 bg-mango/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {/* Price */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-mango-dark mb-1">
                          Price per kg (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl ring-2 ring-mango/30 focus:ring-mango outline-none bg-white text-dark font-bold"
                        />
                      </div>

                      {/* Image URL */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-mango-dark mb-1">
                          <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" />Image URL</span>
                        </label>
                        <input
                          type="url"
                          value={editForm.image}
                          onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl ring-2 ring-mango/30 focus:ring-mango outline-none bg-white text-dark font-bold text-sm"
                          placeholder="https://..."
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-mango-dark mb-1">
                          Description
                        </label>
                        <textarea
                          value={editForm.description}
                          rows={2}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl ring-2 ring-mango/30 focus:ring-mango outline-none bg-white text-dark resize-none"
                        />
                      </div>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => saveEdit(product.id)}
                      className="mt-3 w-full py-2.5 bg-mango hover:bg-mango-dark text-white font-black rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}
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
