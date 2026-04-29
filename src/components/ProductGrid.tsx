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
        <h2 className="text-orange-500 font-bold text-4xl drop-shadow-sm px-4 mb-4">Our Premium Selection</h2>
        <p className="text-gray-500 text-lg text-balance max-w-2xl mx-auto font-medium">
          Handpicked varieties from the finest farms, ensuring unparalleled taste and quality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product.id} 
            to={`/product/${product.id}`}
            className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-t-transparent hover:border-t-orange-400 cursor-pointer h-full"
          >
            {/* Freshness Badge */}
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Fresh
            </div>

            {/* Price Badge */}
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md z-10">
              ₹{product.price}/kg
            </div>

            {/* Full Bleed Image Container (approx 60% top) */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFF8F0] flex justify-center items-center">
              <img
                src={product.image}
                alt={`Premium ${product.name} mango`}
                loading="lazy"
                className="object-contain w-[80%] h-[80%] group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
              />
            </div>

            {/* Content (Bottom half) */}
            <div className="flex flex-col p-5 flex-grow text-left pb-6">
              <h3 className="text-2xl font-black text-dark mb-1">{product.name}</h3>
              <div className="mb-3">
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full inline-block font-semibold">
                  {product.name}
                </span>
              </div>
              <p className="text-dark/70 font-medium leading-relaxed line-clamp-2 text-sm">{product.description}</p>
            </div>

            {/* Add to Cart CTA Sliding up */}
            <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-center py-3 font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
              View Details
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
