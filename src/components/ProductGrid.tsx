import { useProducts } from '../context/ProductContext';
import { Link } from 'react-router-dom';

export const ProductGrid = () => {
  const { products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <section id="shop" className="py-24 px-4 text-center">
        <div className="w-16 h-16 border-4 border-mango border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-dark/60 font-bold">Fetching Fresh Mangoes...</p>
      </section>
    );
  }

  return (
    <section id="shop" className="py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <div className="mb-16 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-mango-dark px-4">Our Premium Selection</h2>
        <p className="text-lg text-dark/70 text-balance max-w-2xl mx-auto font-medium">
          Handpicked varieties from the finest farms, ensuring unparalleled taste and quality.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link 
            key={product.id} 
            to={`/product/${product.id}`}
            className="group flex flex-col bg-white/70 backdrop-blur-lg rounded-[2rem] shadow-lg border border-white/50 hover:bg-mango/20 hover:backdrop-blur-xl hover:shadow-[0_8px_30px_rgb(255,183,3,0.3)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer p-5 sm:p-8 shrink-0"
          >
            <div className="relative aspect-square overflow-hidden bg-white/40 rounded-3xl mb-6 flex justify-center items-center group-hover:bg-transparent transition-colors">
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
              <span className="text-2xl font-black text-leaf-dark mb-4">₹{product.price}<span className="text-base font-semibold text-dark/50">/kg</span></span>
              <p className="text-dark/70 font-medium leading-relaxed line-clamp-3">{product.description}</p>
              <div className="mt-6 w-full py-3 bg-mango text-white rounded-2xl font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                View Details
              </div>
            </div>
          </Link>
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
