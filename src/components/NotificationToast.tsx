import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export const NotificationToast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="relative bg-white border-l-4 border-[#1B6B2F] rounded-2xl shadow-lg shadow-slate-200/50 flex items-start gap-3 w-full max-w-[320px] p-4 pr-10 pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-5 slide-in-from-right-5 fade-in duration-300">
      
      {/* Mango Icon on Left */}
      <div className="flex-shrink-0 text-xl leading-none mt-0.5">
        🥭
      </div>
      
      {/* Message Text */}
      <div className="flex-1 text-[14px] leading-tight text-slate-800 font-medium">
        {message}
      </div>

      {/* Close Button */}
      <button 
        onClick={onDismiss}
        className="absolute top-3 right-3 text-[#1B6B2F]/60 hover:text-[#1B6B2F] p-1 bg-[#1B6B2F]/5 hover:bg-[#1B6B2F]/10 rounded-full transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-1 bg-[#F0A500]"
      />
    </div>
  );
};
