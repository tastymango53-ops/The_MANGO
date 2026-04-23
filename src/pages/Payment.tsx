import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export function Payment() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  const orderId = searchParams.get('id') || 'unknown';
  
  const upiId = import.meta.env.VITE_UPI_ID || 'yourname@bank';
  const upiLink = `upi://pay?pa=${upiId}&pn=MangoWala&am=${amount}&cu=INR&tn=Mango+Order+${orderId}`;

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Attempt automatic redirect after a short delay
    const timer = setTimeout(() => {
      setIsRedirecting(true);
      window.location.href = upiLink;
    }, 1500);

    return () => clearTimeout(timer);
  }, [upiLink]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#FFF8F0] pt-24 pb-20 px-4 flex flex-col items-center justify-center text-center"
    >
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-xl border border-[#FF6B00]/10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          {isRedirecting ? (
             <CheckCircle className="w-10 h-10 text-green-500" />
          ) : (
             <Loader2 className="w-10 h-10 text-[#FF6B00] animate-spin" />
          )}
        </div>
        
        <h1 className="text-2xl font-black text-[#1a1a1a] mb-2">
          Payment for Order
        </h1>
        <p className="text-[#1a1a1a]/60 font-bold mb-8">
          Amount: <span className="text-2xl text-[#FF6B00]">₹{amount}</span>
        </p>

        <a
          href={upiLink}
          onClick={() => setIsRedirecting(true)}
          className="w-full py-4 bg-[#FF6B00] text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mb-4"
        >
          <Smartphone className="w-5 h-5" />
          Open GPay / PhonePe / Paytm
        </a>
        
        <p className="text-sm text-[#1a1a1a]/50 mb-8">
          If you are not automatically redirected, tap the button above.
        </p>

        <Link to="/" className="inline-flex items-center gap-2 text-[#FF6B00] font-bold hover:gap-3 transition-all">
          <ArrowLeft className="w-5 h-5" /> Return to Store
        </Link>
      </div>
    </motion.div>
  );
}
