import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { mockProducts, Product } from '../data';
import { useCart } from '../CartContext';
import { clsx } from 'clsx';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const found = mockProducts.find((p) => p.id === id);
    if (found) {
      setProduct(found);
      setSelectedWeight(found.weightOptions[0]);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!product) return null;

  const totalPrice = product.price * selectedWeight * quantity;

  const handleAddToCart = () => {
    addToCart(product, selectedWeight, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-mango-dark font-bold mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-mango/10 rounded-[2.5rem] blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-mango/10 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-500"
                width={600}
                height={600}
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-dark mb-2 text-wrap-balance">
                {product.name} Mangoes
              </h1>
              <p className="text-xl text-mango-dark font-bold">Premium Quality Variety</p>
            </div>

            <div className="space-y-8">
              {/* Description & Origin */}
              <div>
                <h3 className="text-lg font-black text-dark mb-3 uppercase tracking-wider">The Story</h3>
                <p className="text-dark/80 leading-relaxed mb-4">{product.originStory}</p>
                <div className="flex flex-wrap gap-2">
                  {product.tasteNotes.map((note) => (
                    <span 
                      key={note} 
                      className="bg-mango/10 text-mango-dark px-4 py-1 rounded-full text-sm font-bold border border-mango/20"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weight Selector */}
              <div>
                <h3 className="text-lg font-black text-dark mb-3 uppercase tracking-wider">Select Weight</h3>
                <div className="flex gap-4">
                  {product.weightOptions.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={clsx(
                        "flex-1 py-3 px-4 rounded-2xl font-black transition-all border-2",
                        selectedWeight === weight 
                          ? "bg-mango text-white border-mango shadow-lg scale-105" 
                          : "bg-white text-dark border-mango/10 hover:border-mango/30"
                      )}
                    >
                      {weight}kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-lg font-black text-dark mb-3 uppercase tracking-wider">Quantity</h3>
                  <div className="flex items-center bg-white border-2 border-mango/10 rounded-2xl p-1 shadow-sm">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2 hover:bg-mango/10 rounded-xl transition-colors text-mango-dark"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center font-black text-xl">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-2 hover:bg-mango/10 rounded-xl transition-colors text-mango-dark"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-black text-dark mb-3 uppercase tracking-wider">Total Price</h3>
                  <div className="text-3xl font-black text-mango-dark">
                    ₹{totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={clsx(
                  "w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95",
                  added 
                    ? "bg-leaf text-white" 
                    : "bg-mango hover:bg-mango-dark text-white"
                )}
              >
                {added ? (
                  <>
                    <Check className="w-6 h-6" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-6 h-6" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
