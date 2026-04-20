

export const Hero = () => {
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image (We make it lighter/transparent to blend with our falling leaves) */}
      <div className="absolute inset-0 w-full h-full mix-blend-overlay opacity-30">
        <img
          src="/images/hero.png"
          alt="Fresh juicy yellow mangoes"
          width="1920"
          height="1080"
          // @ts-ignore custom attribute
          fetchpriority="high"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 sm:px-12 md:px-24 text-center max-w-4xl mx-auto flex flex-col items-center">
        <div className="glass-panel p-10 md:p-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-mango-dark drop-shadow-sm">
            Sun-Kissed & Sweet.
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-dark/80 max-w-2xl text-balance font-medium">
            Experience the premium taste of orchard-fresh, naturally ripened mangoes right at your doorstep.
          </p>
          <a
            href="#shop"
            className="inline-flex items-center justify-center px-10 py-4 bg-mango text-dark font-bold rounded-full text-lg shadow-[0_8px_30px_rgb(255,183,3,0.3)] hover:scale-105 hover:bg-mango-light transition-all active:scale-95 touch-manipulation focus-visible:ring-2"
          >
            Shop Mangoes
          </a>
        </div>
      </div>
    </section>
  );
};
