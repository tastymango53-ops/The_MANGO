import { useEffect, useState } from 'react';

// A simple Mango Leaf SVG path
const LEAF_SVG = (
  <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0 C70 30, 90 60, 50 100 C10 60, 30 30, 50 0 Z" />
  </svg>
);

interface Leaf {
  id: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: number;
  rotation: number;
  opacity: number;
}

export const FallingLeaves = () => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    // Generate some random leaves
    const newLeaves: Leaf[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${10 + Math.random() * 15}s`,
      animationDelay: `-${Math.random() * 15}s`, // Start staggered
      size: 20 + Math.random() * 30, // 20px to 50px
      rotation: Math.random() * 360,
      opacity: 0.3 + Math.random() * 0.5,
    }));
    setLeaves(newLeaves);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-[150vh] pointer-events-none z-0 overflow-hidden">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute top-[-100px] text-leaf animate-fall"
          style={{
            left: leaf.left,
            animationDuration: leaf.animationDuration,
            animationDelay: leaf.animationDelay,
            opacity: leaf.opacity,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            willChange: 'transform',
          }}
        >
          <div 
            className="w-full h-full animate-sway"
            style={{
              animationDuration: `${3 + Math.random() * 4}s`,
              transform: `rotate(${leaf.rotation}deg) translateZ(0)`,
              willChange: 'transform',
            }}
          >
            {LEAF_SVG}
          </div>
        </div>
      ))}
    </div>
  );
};
