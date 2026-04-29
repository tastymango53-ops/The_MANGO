export const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] py-24 flex items-center justify-center overflow-hidden bg-[#fff0e0]">
      
      {/* Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-8 items-center">
        
        {/* LEFT COLUMN - Features (01, 02) */}
        <div className="flex flex-col gap-8 lg:gap-14 order-2 lg:order-1 mt-12 lg:mt-0 lg:pr-12">
          
          <div className="glass-panel p-8 md:p-10 rounded-[2rem] bg-[#1a1525]/90 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFD700] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-[#FF6B00] text-3xl font-bold mb-6 block">01</span>
            <p className="text-white/90 font-medium leading-relaxed text-lg">
              True Ownership Full control of your farm exports through D2C tracking
            </p>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-[2rem] bg-[#1a1525]/90 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFD700] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-[#FF6B00] text-3xl font-bold mb-6 block">02</span>
            <p className="text-white/90 font-medium leading-relaxed text-lg">
              Professional Infrastructure Enterprise-grade shipping with cold-chain benefits
            </p>
          </div>

        </div>

        {/* CENTER COLUMN - Single Stacked PNG with Warm Glow */}
        <div className="relative flex flex-col items-center justify-center order-1 lg:order-2 h-[600px] lg:h-[800px] w-full">
          {/* Intense Warm Glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[600px] md:h-[600px] blur-[80px] md:blur-[120px] rounded-full opacity-60 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #FFD700 0%, #FF6B00 50%, transparent 80%)'
            }}
          />
          
          {/* Single Stacked Mango Image */}
          <div className="relative w-full h-full flex items-center justify-center animate-float z-10 transition-transform duration-700">
            {/* 
              USER TWEAK: Replace this with your exact image path once uploaded.
            */}
            <img 
              src="/images/stacked_mangoes_nobg.png" 
              alt="Stacked Premium Mangoes"
              className="w-auto h-[90%] md:h-full max-h-[700px] object-contain"
              style={{ 
                filter: 'drop-shadow(0 40px 80px rgba(180, 80, 0, 0.4)) drop-shadow(0 0 100px rgba(255, 180, 0, 0.15))' 
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN - Headline & Features (03, 04) */}
        <div className="flex flex-col gap-8 lg:gap-14 order-3 lg:order-3 mt-12 lg:mt-0 lg:pl-12">
          
          <div className="text-left mb-4 px-4 sm:px-0">
            <h1 className="text-4xl xs:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight text-[#1a1525] leading-[1.1]">
              Why<br/>
              Choose<br/>
              MangoWala?
            </h1>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-[2rem] bg-[#1a1525]/90 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFD700] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-[#FF6B00] text-3xl font-bold mb-6 block">03</span>
            <p className="text-white/90 font-medium leading-relaxed text-lg">
              Multiple Revenue Streams Diverse monetization options for orchard farmers
            </p>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-[2rem] bg-[#1a1525]/90 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFD700] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-[#FF6B00] text-3xl font-bold mb-6 block">04</span>
            <p className="text-white/90 font-medium leading-relaxed text-lg">
              Future-Proof Technology Built on scalable, secure supply chain infrastructure
            </p>
          </div>

        </div>

      </div>
      
      {/* Orange Glow Bleed */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};
