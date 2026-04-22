

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer = ({ onOpenAdmin }: FooterProps) => {
  return (
    <footer className="bg-dark text-offwhite py-12 px-4 sm:px-6 md:px-12 border-t border-dark/10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black text-mango mb-1">MangoWala</h2>
          <p className="text-offwhite/60">Premium D2C Mango Store.</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-offwhite/80 font-medium" aria-label="Footer navigation">
          <a href="#shop" className="hover:text-mango transition-colors focus-visible:ring-2">Shop</a>
          <a href="#about" className="hover:text-mango transition-colors focus-visible:ring-2">Our Story</a>
          <a href="#contact" className="hover:text-mango transition-colors focus-visible:ring-2">Contact</a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-offwhite/10 rounded-full hover:bg-mango hover:text-dark transition-colors focus-visible:ring-2 touch-manipulation"
            aria-label="Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-offwhite/10 rounded-full hover:bg-mango hover:text-dark transition-colors focus-visible:ring-2 touch-manipulation"
            aria-label="Twitter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-offwhite/10 rounded-full hover:bg-mango hover:text-dark transition-colors focus-visible:ring-2 touch-manipulation"
            aria-label="Facebook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-offwhite/10 flex flex-col sm:flex-row justify-center items-center gap-4 relative text-offwhite/50 text-sm text-center">
        <span>&copy; {new Date().getFullYear()} MangoWala. All rights reserved.</span>
        
        {/* Hidden Mango Control Panel trigger */}
        {onOpenAdmin && (
          <button 
            onClick={onOpenAdmin}
            className="sm:absolute right-0 relative sm:mt-0 mt-4 opacity-20 hover:opacity-100 transition-opacity p-2 text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-mango-light rounded-full"
            aria-label="Admin Access"
            title="Secret Control Panel"
          >
            🥭
          </button>
        )}
      </div>
    </footer>
  );
};
