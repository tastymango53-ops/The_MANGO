import { useState } from 'react';
import { useCart } from '../CartContext';
import { useProducts } from '../context/ProductContext';
import { QuantityModal } from './QuantityModal';
import type { Product } from '../CartContext';

export const ProductGrid = () => {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <section id="shop" className="py-24 px-6 md:px-12 max-w-7xl mx-auto drop-shadow-xl">
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-mango-dark">Our Premium Selection</h2>
        <p className="text-lg text-dark/70 text-balance max-w-2xl mx-auto font-medium">
          Handpicked varieties from the finest farms, ensuring unparalleled taste and quality.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <article 
            key={product.id} 
            onClick={() => setSelectedProduct(product)}
            className="group flex flex-col bg-white/70 backdrop-blur-lg rounded-[41%_59%_41%_59%_/_51%_60%_40%_49%] shadow-xl border-4 border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer p-8 pb-12"
          >
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-mango/20 to-mango-light/5 rounded-full mb-6 flex justify-center items-center group-hover:bg-mango/30 transition-colors">
              <img
                src={product.image}
                alt={`Premium ${product.name} mango`}
                width="400"
                height="400"
                loading="lazy"
                className="object-contain w-3/4 h-3/4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-2xl"
              />
            </div>
            <div className="flex flex-col flex-grow items-center text-center">
              <h3 className="text-3xl font-black text-dark mb-2">{product.name}</h3>
              <span className="text-2xl font-black text-leaf-dark mb-4">₹{product.price}</span>
              <p className="text-dark/70 font-medium leading-relaxed line-clamp-3">{product.description}</p>
            </div>
          </article>
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center bg-white/50 backdrop-blur-sm p-12 rounded-3xl border border-white/50">
          <p className="text-xl text-dark/60 font-medium">No mangoes available right now. Check back later!</p>
        </div>
      )}

      {selectedProduct && (
        <QuantityModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={addToCart} 
        />
      )}
    </section>
  );
};
