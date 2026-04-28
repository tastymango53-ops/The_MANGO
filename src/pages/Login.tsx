import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, updateProfile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Mail, Lock, User, Phone, MapPin, Hash, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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

  // Where to go after login — default to home, or wherever they came from
  const from = (location.state as any)?.from || '/';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange in AuthContext will update `user`, useEffect above will redirect
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

          // Connect pages locally to guarantee address carries over
          localStorage.setItem('mango_checkout_form', JSON.stringify({
            name, phone, address, pincode
          }));

          // If user is immediately confirmed (no email verification), redirect now
          if (authData.session) {
            navigate(from, { replace: true });
          } else {
            setError('Account created! Please check your email to verify, then log in.');
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-32 pb-20 min-h-screen bg-offwhite flex items-center justify-center px-4"
    >
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
              {isLogin ? 'Welcome Back' : 'Join MangoWala'}
            </h1>
            <p className="text-dark/60 font-medium">
              {isLogin ? 'Login to track your delicious orders' : 'Create an account for faster checkout'}
            </p>
          </div>

          {error && (
            <div className={clsx(
              'p-4 rounded-2xl mb-6 text-sm font-bold text-center border animate-in fade-in slide-in-from-top-2',
              error.includes('created') || error.includes('verify')
                ? 'bg-leaf/10 text-leaf-dark border-leaf/20'
                : 'bg-red-50 text-red-600 border-red-100'
            )}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: window.location.origin,
                  queryParams: { access_type: 'offline', prompt: 'consent' }
                }
              });
            }}
            className="w-full mb-6 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">Or continue with email</span>
            </div>
          </div>

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
                    autoComplete="name"
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
                    autoComplete="tel"
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
                autoComplete="email"
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
                autoComplete={isLogin ? 'current-password' : 'new-password'}
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
                    autoComplete="street-address"
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
                    autoComplete="postal-code"
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
                  {isLogin ? 'Login Now' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
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
    </motion.div>
  );
}
