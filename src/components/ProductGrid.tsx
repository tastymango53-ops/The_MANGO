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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {products.map((product) => (
          <Link 
            key={product.id} 
            to={`/product/${product.id}`}
            className="group relative rounded-3xl overflow-hidden bg-[#FFFBF5] border border-orange-100 border-t-2 border-t-amber-400 shadow-[0_4px_24px_rgba(251,146,60,0.12)] hover:shadow-[0_8px_32px_rgba(251,146,60,0.25)] hover:-translate-y-2 transition-all duration-300 flex flex-col"
          >
            {/* Full Bleed Image */}
            <div 
              className="relative h-56 w-full overflow-hidden"
              style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)' }}
            >
              <img
                src={product.image}
                alt={`Premium ${product.name} mango`}
                loading="lazy"
                className="object-cover object-center w-full h-full group-hover:scale-[1.08] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-amber-950/40 to-transparent" />
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-1">
              
              {/* Price */}
              <div className="mb-2">
                <span className="text-2xl font-black text-orange-500">₹{product.price}</span>
                <span className="text-sm text-gray-400 font-normal">/kg</span>
              </div>
              
              {/* Product Name */}
              <h3 className="font-serif text-xl font-bold text-gray-900">{product.name}</h3>
              
              {/* Decorative Divider */}
              <div className="w-8 h-0.5 bg-orange-300 my-2" />
              
              {/* Description */}
              <p className="text-sm text-gray-500 italic line-clamp-2">{product.description}</p>
              
              {/* Fresh Badge */}
              <div className="mt-4 mb-4">
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                  Farm Fresh
                </span>
              </div>

              {/* View Details Button */}
              <div className="mt-auto w-full py-3 rounded-2xl font-semibold text-sm text-center bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 hover:from-orange-500 hover:to-amber-600 transition-all duration-200">
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
