import { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../context/ProductContext';
import { supabase } from '../../lib/supabase';
import {
  Plus, Pencil, Trash2, RefreshCw, X, Check, Package,
  ToggleLeft, ToggleRight, ImageIcon,
} from 'lucide-react';

// ── Image upload helper ───────────────────────────────────────────────────────
const uploadImage = async (file: File): Promise<string | null> => {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const { error } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });
  if (error) { console.error('Upload error:', error.message); return null; }
  return supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
};

// ── Unit decode/encode ─────────────────────────────────────────────────────────
const encodeOptions = (opts: number[], unit: 'kg' | 'dozen') =>
  unit === 'dozen' ? opts.map((v) => -Math.abs(v)) : opts.map((v) => Math.abs(v));

const decodeOptions = (opts: number[]) => {
  if (!opts || opts.length === 0) return { unit: 'kg' as const, values: [1, 2, 5] };
  return { unit: (opts[0] < 0 ? 'dozen' : 'kg') as 'kg' | 'dozen', values: opts.map((v) => Math.abs(v)) };
};

// ── Image uploader ────────────────────────────────────────────────────────────
function ImageUploader({ images, setImages }: { images: string[]; setImages: (imgs: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setImages([...images, ...urls]);
    setUploading(false);
  };
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Product Photos</label>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 group">
            <img src={url} className="w-20 h-20 object-cover rounded-xl border border-slate-200" alt="" />
            <button
              onClick={() => setImages(images.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer hover:bg-red-600 shadow"
            >×</button>
          </div>
        ))}
        <label className={`w-20 h-20 border-2 border-dashed border-amber-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all ${uploading ? 'opacity-50' : ''}`}>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
          {uploading ? <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" /> : <ImageIcon className="w-5 h-5 text-amber-400" />}
          <span className="text-xs text-amber-500 mt-1 font-semibold">{uploading ? 'Uploading' : 'Add'}</span>
        </label>
      </div>
    </div>
  );
}

// ── Unit + Options Editor ─────────────────────────────────────────────────────
function OptionsEditor({
  unit, options, optionInput,
  onUnitChange, onOptionsChange, onOptionInputChange,
}: {
  unit: 'kg' | 'dozen'; options: number[]; optionInput: string;
  onUnitChange: (u: 'kg' | 'dozen') => void;
  onOptionsChange: (opts: number[]) => void;
  onOptionInputChange: (v: string) => void;
}) {
  const addOption = () => {
    const v = parseFloat(optionInput);
    if (!isNaN(v) && v > 0 && !options.includes(v)) {
      onOptionsChange([...options, v].sort((a, b) => a - b));
      onOptionInputChange('');
    }
  };
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Sell In</p>
        <div className="flex gap-2">
          {(['kg', 'dozen'] as const).map((u) => (
            <button
              key={u}
              onClick={() => { onUnitChange(u); onOptionsChange(u === 'kg' ? [1, 2, 5] : [1, 2, 3]); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                unit === u ? (u === 'kg' ? 'bg-amber-500 text-white' : 'bg-orange-500 text-white') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {unit === u ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Available Options</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {options.map((opt, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
              {opt} {unit}
              <button onClick={() => onOptionsChange(options.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 cursor-pointer ml-0.5">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number" min="0.5" step="0.5"
            placeholder={`Add ${unit} option`}
            value={optionInput}
            onChange={(e) => onOptionInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOption()}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
          />
          <button onClick={addOption} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 cursor-pointer transition-colors">+ Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onEdit, onDelete }: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}) {
  const decoded = decodeOptions(product.weightOptions || []);
  const imgUrl = (product as any).images?.[0] || product.image;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-44 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🥭</span>
          </div>
        )}
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Stock badge */}
        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold ${product.stock !== 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {product.stock !== 0 ? '● In Stock' : '● Out'}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-black text-slate-800 text-base leading-tight">{product.name}</h3>
        <p className="text-amber-600 font-black text-lg mt-1">₹{product.price}<span className="text-xs font-semibold text-slate-400">/{decoded.unit}</span></p>
        <div className="flex flex-wrap gap-1 mt-2">
          {decoded.values.map((v) => (
            <span key={v} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{v}{decoded.unit === 'dozen' ? ' doz' : 'kg'}</span>
          ))}
        </div>
        {product.description && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
      </div>

      {/* Quick Edit Bar */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold cursor-pointer transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />Edit
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-xs font-bold cursor-pointer transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Product Form Modal ────────────────────────────────────────────────────────
function ProductFormModal({
  title, form, images, unit, options, optionInput, isSaving,
  onFormChange, onImagesChange, onUnitChange, onOptionsChange, onOptionInputChange,
  onSave, onClose,
}: {
  title: string;
  form: { name: string; price: string; description: string };
  images: string[]; unit: 'kg' | 'dozen'; options: number[]; optionInput: string; isSaving: boolean;
  onFormChange: (f: { name: string; price: string; description: string }) => void;
  onImagesChange: (imgs: string[]) => void;
  onUnitChange: (u: 'kg' | 'dozen') => void;
  onOptionsChange: (opts: number[]) => void;
  onOptionInputChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
            <h2 className="text-lg font-black text-slate-800">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  placeholder="e.g. Alphonso Mango"
                  value={form.name}
                  onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Price (₹)</label>
                <input
                  type="number" placeholder={`Per ${unit}`}
                  value={form.price}
                  onChange={(e) => onFormChange({ ...form, price: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  placeholder="Short description"
                  value={form.description}
                  onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
            </div>

            <ImageUploader images={images} setImages={onImagesChange} />
            <OptionsEditor
              unit={unit} options={options} optionInput={optionInput}
              onUnitChange={onUnitChange} onOptionsChange={onOptionsChange} onOptionInputChange={onOptionInputChange}
            />
          </div>
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={onSave} disabled={isSaving || !form.name || !form.price}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-amber-200"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isSaving ? 'Saving…' : 'Save Product'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold cursor-pointer transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main InventoryPage ────────────────────────────────────────────────────────
export function InventoryPage() {
  const { products, addProduct, removeProduct, editProduct, isLoading } = useProducts();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add form state
  const [newForm, setNewForm] = useState({ name: '', price: '', description: '' });
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newUnit, setNewUnit] = useState<'kg' | 'dozen'>('kg');
  const [newOptions, setNewOptions] = useState<number[]>([1, 2, 5]);
  const [newOptionInput, setNewOptionInput] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '' });
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editUnit, setEditUnit] = useState<'kg' | 'dozen'>('kg');
  const [editOptions, setEditOptions] = useState<number[]>([1, 2, 5]);
  const [editOptionInput, setEditOptionInput] = useState('');

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, price: String(product.price), description: product.description || '' });
    setEditImages((product as any).images || (product.image ? [product.image] : []));
    const decoded = decodeOptions(product.weightOptions || []);
    setEditUnit(decoded.unit);
    setEditOptions(decoded.values);
    setEditOptionInput('');
  };

  const handleSaveNew = async () => {
    if (!newForm.name || !newForm.price) return;
    setIsSaving(true);
    try {
      await addProduct({
        name: newForm.name, price: Number(newForm.price),
        image: newImages[0] || '', description: newForm.description,
        weightOptions: encodeOptions(newOptions, newUnit),
      });
      setNewForm({ name: '', price: '', description: '' });
      setNewImages([]); setNewUnit('kg'); setNewOptions([1, 2, 5]); setNewOptionInput('');
      setShowAddModal(false);
    } finally { setIsSaving(false); }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct || !editForm.price) return;
    setIsSaving(true);
    try {
      await editProduct(editingProduct.id, {
        name: editForm.name, price: Number(editForm.price),
        image: editImages[0] || '', description: editForm.description,
        weightOptions: encodeOptions(editOptions, editUnit),
      });
      setEditingProduct(null);
    } finally { setIsSaving(false); }
  };

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
        {[1,2,3,4,5,6].map((i) => <div key={i} className="h-64 bg-slate-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Inventory</h1>
          <p className="text-slate-400 text-sm mt-0.5">{products.length} products in catalogue</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md shadow-amber-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />Add Product
        </button>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-amber-300" />
          </div>
          <p className="font-bold text-slate-600 text-lg">No products yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-6">Add your first mango product to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 cursor-pointer transition-colors"
          >
            + Add First Product
          </button>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={startEdit} onDelete={removeProduct} />
          ))}
        </div>
      )}

      {/* FAB (mobile) */}
      <button
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xl shadow-amber-300 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <ProductFormModal
          title="Add New Product"
          form={newForm} images={newImages} unit={newUnit} options={newOptions} optionInput={newOptionInput} isSaving={isSaving}
          onFormChange={setNewForm} onImagesChange={setNewImages}
          onUnitChange={setNewUnit} onOptionsChange={setNewOptions} onOptionInputChange={setNewOptionInput}
          onSave={handleSaveNew} onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <ProductFormModal
          title={`Edit: ${editingProduct.name}`}
          form={editForm} images={editImages} unit={editUnit} options={editOptions} optionInput={editOptionInput} isSaving={isSaving}
          onFormChange={setEditForm} onImagesChange={setEditImages}
          onUnitChange={setEditUnit} onOptionsChange={setEditOptions} onOptionInputChange={setEditOptionInput}
          onSave={handleSaveEdit} onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
