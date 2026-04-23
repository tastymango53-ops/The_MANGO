import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, updateProfile } from '../lib/supabase';
import { ShoppingBag, Mail, Lock, User, Phone, MapPin, Hash, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(-1); // Go back to previous page
      } else {
        // Signup
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: name }
          }
        });
        
        if (authError) throw authError;

        if (authData.user) {
          // Save profile to customers table
          await updateProfile(authData.user.id, {
            name,
            email,
            phone,
            address,
            pincode
          });
        }
        
        setError("Account created! Please check your email for verification.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-mango/10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-mango/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-leaf/10 rounded-full blur-3xl" />

          <div className="text-center mb-8 relative">
            <div className="inline-flex p-4 bg-mango/10 rounded-3xl mb-4">
              <ShoppingBag className="w-8 h-8 text-mango-dark" />
            </div>
            <h1 className="text-3xl font-black text-dark mb-2">
              {isLogin ? "Welcome Back" : "Join MangoWala"}
            </h1>
            <p className="text-dark/60 font-medium">
              {isLogin ? "Login to track your delicious orders" : "Create an account for faster checkout"}
            </p>
          </div>

          {error && (
            <div className={clsx(
              "p-4 rounded-2xl mb-6 text-sm font-bold text-center border animate-in fade-in slide-in-from-top-2",
              error.includes("created") ? "bg-leaf/10 text-leaf-dark border-leaf/20" : "bg-red-50 text-red-600 border-red-100"
            )}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/30" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-offwhite rounded-2xl border-2 border-transparent focus:border-mango focus:bg-white transition-all outline-none font-bold text-dark"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/30" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-offwhite rounded-2xl border-2 border-transparent focus:border-mango focus:bg-white transition-all outline-none font-bold text-dark"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/30" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-offwhite rounded-2xl border-2 border-transparent focus:border-mango focus:bg-white transition-all outline-none font-bold text-dark"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/30" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-offwhite rounded-2xl border-2 border-transparent focus:border-mango focus:bg-white transition-all outline-none font-bold text-dark"
              />
            </div>

            {!isLogin && (
              <>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-dark/30" />
                  <textarea
                    placeholder="Delivery Address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full pl-12 pr-4 py-4 bg-offwhite rounded-2xl border-2 border-transparent focus:border-mango focus:bg-white transition-all outline-none font-bold text-dark resize-none"
                  />
                </div>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/30" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Pincode"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-offwhite rounded-2xl border-2 border-transparent focus:border-mango focus:bg-white transition-all outline-none font-bold text-dark"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-mango hover:bg-mango-dark text-white rounded-2xl font-black text-lg shadow-xl shadow-mango/20 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Login Now" : "Create Account"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-dark/60 font-bold hover:text-mango-dark transition-colors"
            >
              {isLogin ? (
                <>New to MangoWala? <span className="text-mango">Sign Up</span></>
              ) : (
                <>Already have an account? <span className="text-mango">Login</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
