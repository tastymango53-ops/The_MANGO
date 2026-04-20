import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface PasswordPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'mango123') {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel w-full max-w-sm overflow-hidden flex flex-col p-8 relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-dark/50 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-mango flex items-center justify-center text-white shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-center mb-2">Admin Access</h3>
        <p className="text-center text-dark/70 mb-6 text-sm">Enter the secret password to manage inventory.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-none outline-none ring-2 bg-white/80 transition-all ${
                error ? 'ring-red-500 animate-shake' : 'ring-black/10 focus:ring-mango'
              }`}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2 text-center">Incorrect password.</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-dark text-mango-light font-bold rounded-xl shadow-md hover:bg-dark/80 transition-transform active:scale-95"
          >
            Unlock Panel
          </button>
        </form>
      </div>
    </div>
  );
};
