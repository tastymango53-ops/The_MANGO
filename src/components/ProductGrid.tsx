import { useCart } from '../CartContext';
import { useProducts } from '../context/ProductContext';
import { ShoppingCart } from 'lucide-react';

export const ProductGrid = () => {
  const { addToCart } = useCart();
  const { products } = useProducts();

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
            className="group flex flex-col bg-white/70 backdrop-blur-lg rounded-[2rem] overflow-hidden shadow-lg border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-mango/20 to-mango-light/5 p-6 flex justify-center items-center">
              <img
                src={product.image}
                alt={`Premium ${product.name} mango`}
                width="400"
                height="400"
                loading="lazy"
                className="object-contain w-full h-full group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 drop-shadow-2xl"
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex flex-col items-start mb-4">
                <h3 className="text-2xl font-bold text-dark">{product.name}</h3>
                <span className="text-xl font-black text-leaf-dark">₹{product.price}</span>
              </div>
              <p className="text-dark/70 mb-6 flex-grow font-medium leading-relaxed">{product.description}</p>
              
              <button
                onClick={() => addToCart(product)}
                className="w-full py-4 bg-mango text-dark font-bold rounded-2xl shadow-[0_4px_14px_0_rgb(255,183,3,0.39)] hover:shadow-[0_6px_20px_rgba(255,183,3,0.23)] hover:bg-mango-light hover:-translate-y-0.5 transition-all touch-manipulation focus-visible:ring-2 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center bg-white/50 backdrop-blur-sm p-12 rounded-3xl border border-white/50">
          <p className="text-xl text-dark/60 font-medium">No mangoes available right now. Check back later!</p>
        </div>
      )}
    </section>
  );
};
