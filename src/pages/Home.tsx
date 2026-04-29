import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { motion } from 'framer-motion';
import { FallingLeaves } from '../components/FallingLeaves';

export function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full"
    >
      {/* Leaf animation wrapper covering Hero + first 50% of Product Section */}
      <FallingLeaves />
      
      {/* Content wrapper with z-10 to stay above leaves */}
      <div className="relative z-10 w-full">
        <Hero />
        {/* Transition gradient div between sections */}
        <div className="w-full h-32 bg-gradient-to-b from-[#fff0e0] to-[#FFF8F0]" />
        <div className="bg-[#FFF8F0] w-full">
          <ProductGrid />
        </div>
      </div>
    </motion.div>
  );
}
