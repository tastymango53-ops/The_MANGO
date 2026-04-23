import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { motion } from 'framer-motion';

export function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      <ProductGrid />
    </motion.div>
  );
}
