export const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] py-24 flex items-center justify-center overflow-hidden">
      
      {/* Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center">
        
        {/* LEFT COLUMN - Features */}
        <div className="flex flex-col gap-6 lg:gap-12 order-2 lg:order-1 mt-12 lg:mt-0">
          
          <div className="glass-panel p-8 md:p-10 rounded-3xl bg-white/40 border border-white/50 shadow-[0_8px_30px_rgb(255,183,3,0.15)] hover:shadow-[0_8px_30px_rgb(255,183,3,0.3)] transition-all duration-300 hover:-translate-y-1">
            <span className="text-3xl font-black text-mango-dark mb-4 block">01</span>
            <p className="text-dark/80 font-bold leading-relaxed text-lg">
              Handpicked Quality<br/>
              <span className="font-medium text-dark/70 text-base block mt-2">
                Straight from the finest Ratnagiri orchards to ensure perfect ripeness.
              </span>
            </p>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 border border-white/50 shadow-[0_8px_30px_rgb(255,183,3,0.15)] hover:shadow-[0_8px_30px_rgb(255,183,3,0.3)] transition-all duration-300 hover:-translate-y-1 lg:ml-8">
            <span className="text-3xl font-black text-mango-dark mb-4 block">03</span>
            <p className="text-dark/80 font-bold leading-relaxed text-lg">
              100% Organic<br/>
              <span className="font-medium text-dark/70 text-base block mt-2">
                Naturally ripened without harmful chemicals or artificial treatments.
              </span>
            </p>
          </div>

        </div>

        {/* CENTER COLUMN - Glowing Stacked Mangoes */}
        <div className="relative flex flex-col items-center justify-center order-1 lg:order-2 h-[500px] lg:h-[600px] w-full">
          {/* Glowing Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-mango/40 blur-[100px] rounded-full animate-pulse" />
          
          {/* Stack Container */}
          <div className="relative w-full max-w-[300px] h-full flex flex-col items-center justify-center animate-float">
            
            <img 
              src="/images/alphonso.png" 
              alt="Premium Alphonso"
              className="absolute top-[10%] w-[220px] md:w-[280px] drop-shadow-2xl z-10 transition-transform duration-700 hover:scale-110 hover:rotate-6 cursor-pointer"
              style={{ filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.25))' }}
            />
            
            <img 
              src="/images/kesar.png" 
              alt="Premium Kesar"
              className="absolute top-[35%] w-[250px] md:w-[320px] drop-shadow-2xl z-20 transition-transform duration-700 hover:scale-110 hover:-rotate-3 cursor-pointer"
              style={{ filter: 'drop-shadow(0 30px 25px rgba(0,0,0,0.35))' }}
            />
            
            <img 
              src="/images/dasheri.png" 
              alt="Premium Dasheri"
              className="absolute top-[60%] w-[240px] md:w-[300px] drop-shadow-2xl z-30 transition-transform duration-700 hover:scale-110 hover:rotate-3 cursor-pointer"
              style={{ filter: 'drop-shadow(0 40px 30px rgba(0,0,0,0.4))' }}
            />

          </div>
        </div>

        {/* RIGHT COLUMN - Headline & Features */}
        <div className="flex flex-col gap-6 lg:gap-12 order-3 lg:order-3 mt-12 lg:mt-0">
          
          <div className="text-center lg:text-left lg:mr-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight text-dark drop-shadow-sm leading-none">
              Why<br/>
              <span className="text-mango-dark">Choose<br/>MangoWala?</span>
            </h1>
            <a href="#shop" className="inline-block mt-4 text-mango-dark font-bold text-lg hover:underline underline-offset-4 decoration-2">
              Explore Our Harvest →
            </a>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-3xl bg-white/40 border border-white/50 shadow-[0_8px_30px_rgb(255,183,3,0.15)] hover:shadow-[0_8px_30px_rgb(255,183,3,0.3)] transition-all duration-300 hover:-translate-y-1">
            <span className="text-3xl font-black text-mango-dark mb-4 block">02</span>
            <p className="text-dark/80 font-bold leading-relaxed text-lg">
              Farm to Doorstep<br/>
              <span className="font-medium text-dark/70 text-base block mt-2">
                Express delivery ensures your mangos arrive at peak freshness.
              </span>
            </p>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-3xl bg-white/30 border border-white/50 shadow-[0_8px_30px_rgb(255,183,3,0.15)] hover:shadow-[0_8px_30px_rgb(255,183,3,0.3)] transition-all duration-300 hover:-translate-y-1 lg:ml-8">
            <span className="text-3xl font-black text-mango-dark mb-4 block">04</span>
            <p className="text-dark/80 font-bold leading-relaxed text-lg">
              Incredible Taste<br/>
              <span className="font-medium text-dark/70 text-base block mt-2">
                Guaranteed the sweetest, juiciest varieties of the season.
              </span>
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
