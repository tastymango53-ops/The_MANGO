import React, { useEffect } from 'react';
import { X } from 'lucide-react';


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
    <div className="bg-[#1B6B2F] text-white px-4 py-3 rounded-xl shadow-xl shadow-green-900/20 flex items-start gap-3 w-80 pointer-events-auto border border-green-800/50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex-1 text-sm font-medium pt-0.5">
        {message}
      </div>
      <button 
        onClick={onDismiss}
        className="flex-shrink-0 text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
