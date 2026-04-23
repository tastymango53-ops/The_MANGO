import { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useAuth } from '../context/AuthContext';
import { getProfile, saveOrder } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CreditCard, QrCode, CheckCircle, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'APP' | 'QR' | null>(null);

  // Auto-fill profile
  useEffect(() => {
    if (user) {
      getProfile(user.id).then((profile) => {
        if (profile) {
          setFormData({
            name: profile.name,
            phone: profile.phone,
            address: profile.address,
            pincode: profile.pincode,
          });
        }
      });
    }
  }, [user]);

  if (cart.length === 0 && !isPaid) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/" className="text-mango font-bold underline">Back to Shop</Link>
      </div>
    );
  }

  // Use the actual UPI ID from environment variables, or a fallback if not set
  const upiId = import.meta.env.VITE_UPI_ID || "yourname@bank"; 
  const upiLink = `upi://pay?pa=${upiId}&pn=MangoWala&am=${cartTotal}&cu=INR`;

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    try {
      await saveOrder({
        customer_id: user?.id || 'guest',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight
        })),
        total: cartTotal,
        status: 'Confirmed'
      });
      
      clearCart();
      setIsPaid(true);
    } catch (err) {
      console.error("Failed to save order", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPaid) {
    return (
      <div className="pt-40 pb-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-leaf/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle className="w-16 h-16 text-leaf" />
        </div>
        <h1 className="text-4xl font-black text-dark mb-4">Payment Confirmed! 🥭</h1>
        <p className="text-xl text-dark/60 max-w-md mb-10">
          Your order has been placed successfully. We'll start ripening your mangoes right away!
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="px-8 py-4 bg-dark text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all"
          >
            Track Order
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-mango text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-offwhite min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-mango-dark font-bold">
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-black text-dark">Checkout</h1>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Form Side */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-mango/10">
              <h2 className="text-xl font-black mb-6">Delivery Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-offwhite rounded-2xl border-2 border-transparent">
                  <label className="text-xs font-black text-mango-dark uppercase mb-1 block">Full Name</label>
                  <p className="font-bold text-dark">{formData.name || "N/A"}</p>
                </div>
                <div className="p-4 bg-offwhite rounded-2xl border-2 border-transparent">
                  <label className="text-xs font-black text-mango-dark uppercase mb-1 block">Phone</label>
                  <p className="font-bold text-dark">{formData.phone || "N/A"}</p>
                </div>
                <div className="p-4 bg-offwhite rounded-2xl border-2 border-transparent">
                  <label className="text-xs font-black text-mango-dark uppercase mb-1 block">Shipping Address</label>
                  <p className="font-bold text-dark leading-relaxed">{formData.address || "N/A"}</p>
                  <p className="font-black text-mango-dark mt-1">{formData.pincode}</p>
                </div>
              </div>
              {!user && (
                <p className="mt-4 text-sm font-bold text-mango-dark">
                  * Guest checkout enabled. Log in to save these details.
                </p>
              )}
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-mango/10">
              <h2 className="text-xl font-black mb-6">Order Summary</h2>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedWeight}`} className="flex justify-between items-center py-2 border-b border-mango/5 last:border-0">
                    <div>
                      <p className="font-black text-dark">{item.name} x {item.quantity}</p>
                      <p className="text-xs font-bold text-mango-dark uppercase">{item.selectedWeight}kg Pack</p>
                    </div>
                    <p className="font-bold">₹{(item.price * item.selectedWeight * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Side */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-mango/10 sticky top-28">
              <h2 className="text-xl font-black mb-6 text-center">Payment</h2>
              <div className="text-center mb-8">
                <span className="text-sm font-bold text-dark/50 uppercase tracking-widest">Total Amount</span>
                <div className="text-4xl font-black text-mango-dark">₹{cartTotal.toLocaleString()}</div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setPaymentMode('APP')}
                  className={clsx(
                    "w-full py-4 px-6 rounded-2xl font-black flex items-center justify-between transition-all",
                    paymentMode === 'APP' ? "bg-mango text-white shadow-lg" : "bg-offwhite text-dark hover:bg-mango/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    Pay via UPI App
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => setPaymentMode('QR')}
                  className={clsx(
                    "w-full py-4 px-6 rounded-2xl font-black flex items-center justify-between transition-all",
                    paymentMode === 'QR' ? "bg-mango text-white shadow-lg" : "bg-offwhite text-dark hover:bg-mango/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5" />
                    Show QR Code
                  </div>
                </button>
              </div>

              {paymentMode === 'APP' && (
                <div className="mt-8 animate-in slide-in-from-top-2">
                  <a 
                    href={upiLink}
                    className="block w-full py-4 bg-leaf text-white text-center rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Open GPay / PhonePe / Paytm
                  </a>
                  <p className="text-[10px] text-center mt-3 text-dark/40 uppercase font-black tracking-widest">
                    Best for mobile users
                  </p>
                </div>
              )}

              {paymentMode === 'QR' && (
                <div className="mt-8 flex flex-col items-center animate-in zoom-in-95">
                  <div className="bg-white p-4 rounded-3xl shadow-inner border-4 border-mango/20">
                    <QRCodeSVG value={upiLink} size={180} />
                  </div>
                  <p className="text-[10px] text-center mt-4 text-dark/40 uppercase font-black tracking-widest">
                    Scan using any UPI App
                  </p>
                </div>
              )}

              {paymentMode && (
                <div className="mt-8 pt-8 border-t-2 border-mango/5 border-dashed">
                  <button
                    onClick={handleCompleteOrder}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-mango-dark text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "I Have Paid"}
                  </button>
                  <p className="text-[10px] text-center mt-3 text-dark/40 uppercase font-black tracking-widest leading-tight">
                    By clicking above, you confirm that you have <br/> completed the transaction in your UPI app.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
