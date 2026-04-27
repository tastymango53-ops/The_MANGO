import { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useAuth } from '../context/AuthContext';
import { getProfile, saveOrder, supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, CreditCard, QrCode, CheckCircle,
  Smartphone, MapPin, User, Phone, Truck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { init, send } from '@emailjs/browser';

export function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('mango_checkout_form');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: '', phone: '', address: '', pincode: '' };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'upi' | 'cod'>('upi');
  const [showQR, setShowQR] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Keep localStorage in sync with any form changes
  useEffect(() => { init('B2JhHhac53YyZ7QXt'); }, []);

  useEffect(() => {
    localStorage.setItem('mango_checkout_form', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || profileLoaded) return;
      const profile = await getProfile(user.id);
      if (profile) {
        setFormData({
          name: profile.name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          pincode: profile.pincode || '',
        });
        setProfileLoaded(true);
      }
    };
    loadProfile();
  }, [user]);

  if (!cart) return <div>Loading...</div>;

  const upiId = import.meta.env.VITE_UPI_ID || 'mfurniturewala2007@okicici';

  // Amount formatted to 2 decimal places (required by UPI spec)
  const upiAmount = cartTotal ? parseFloat(cartTotal as any).toFixed(2) : '1.00';
  
  // Standard UPI deeplink — works on mobile with GPay/PhonePe/Paytm
  const upiLink = `upi://pay?pa=mfurniturewala2007@okicici&pn=Mango%20Store&am=${upiAmount}&cu=INR&tn=Mango%20Store%20Order`;

  const gpayLink = `intent://pay?pa=mfurniturewala2007@okicici&pn=Mango%20Store&am=${upiAmount}&cu=INR&tn=Mango%20Store%20Order#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;

  const phonepeLink = `intent://pay?pa=mfurniturewala2007@okicici&pn=Mango%20Store&am=${upiAmount}&cu=INR&tn=Mango%20Store%20Order#Intent;scheme=upi;package=com.phonepe.app;end`;

  const paytmLink = `intent://pay?pa=mfurniturewala2007@okicici&pn=Mango%20Store&am=${upiAmount}&cu=INR&tn=Mango%20Store%20Order#Intent;scheme=upi;package=net.one97.paytm;end`;

  const sendTelegramNotification = async (message: string) => {
    const botToken = "8742663223:AAGc92QDnHgzAiO6G-fUlJ8-T6WQyZqGLQs";
    const chatId = "5898695862";
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML"
        })
      });
    } catch (err) {
      console.error("Telegram failed:", err);
    }
  };

  const sendAdminEmail = async (orderId: string) => {
    try {
      const shortId = orderId.slice(0, 8).toUpperCase();
      const itemsSummary = cart.map((i: any) => `${i.name} x${i.quantity}`).join(', ');
      await send(
        'service_odgq3zg',
        'template_nfh73mo',
        {
          order_id: shortId,
          customer_name: formData.name,
          phone: formData.phone,
          address: `${formData.address}, ${formData.pincode}`,
          items: itemsSummary,
          total: cartTotal,
          payment_type: paymentType.toUpperCase(),
        }
      );
      console.log('Admin email sent');
    } catch (err) {
      console.error('Admin email failed:', err);
    }
  };

  const handleConfirmOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id ?? 'guest';

      const id = await saveOrder({
        customer_id: currentUserId,
        customer_name: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.pincode}`,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight,
        })),
        total: cartTotal,
        payment_type: paymentType,
        status: 'pending',
      });

      if (id) {
        setOrderId(id);
        clearCart();

        const shortId = id.slice(0, 8).toUpperCase();
        const itemsSummary = cart.map(i => `${i.name} x${i.quantity}`).join(', ');
        const message = `🥭 <b>New Order!</b>\n\n<b>Order ID:</b> #${shortId}\n<b>Items:</b> ${itemsSummary}\n<b>Total:</b> ₹${cartTotal}\n<b>Name:</b> ${formData.name}\n<b>Phone:</b> ${formData.phone}\n<b>Address:</b> ${formData.address}, ${formData.pincode}\n<b>Payment:</b> ${paymentType.toUpperCase()}`;

        await sendTelegramNotification(message);
        await sendAdminEmail(id);
      } else {
        alert('Could not save your order. Please try again.');
      }
    } catch (err) {
      console.error('Order failed:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Order Success Screen ──────────────────────────────────────────────────
  if (orderId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-4 py-20 text-center"
      >
        <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-3">Order Placed! 🥭</h1>
        <p className="text-[#1a1a1a]/60 text-lg max-w-sm mb-2">
          Order #{orderId.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-[#1a1a1a]/50 max-w-sm mb-10">
          We'll confirm your order shortly!
        </p>
        {/* Hidden Mobile UPI Button - set to true to restore */}
        {false && paymentType === 'upi' && (
          <div className="mb-6 w-full max-w-xs space-y-3">
            <button
              onClick={() => window.location.href = upiLink}
              className="w-full py-4 bg-[#FF6B00] text-white text-center rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              <Smartphone className="w-5 h-5" />
              Pay ₹{cartTotal ?? 0} via UPI App
            </button>
            <p className="text-xs text-[#1a1a1a]/40 font-bold text-center">
              Opens GPay / PhonePe / Paytm on mobile
            </p>
          </div>
        )}
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => navigate('/orders')} className="px-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
            Track Order
          </button>
          <button onClick={() => navigate('/')} className="px-8 py-4 bg-[#FFD700] text-[#1a1a1a] rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
            Back to Shop
          </button>
        </div>
      </motion.div>
    );
  }

  if (cart?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center gap-4"
      >
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Link to="/" className="text-[#FF6B00] font-bold underline">Back to Shop</Link>
      </motion.div>
    );
  }

  // ── Main Checkout ─────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#FFF8F0] pt-24 pb-20"
    >
      <div className="max-w-2xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-[#FF6B00] font-bold mb-8 hover:gap-3 transition-all">
          <ArrowLeft className="w-5 h-5" /> Back to Shop
        </Link>
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-8">Checkout</h1>

        {/* Delivery Details */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#FF6B00]/10 mb-6">
          <h2 className="text-lg font-black mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6B00]" /> Delivery Details
          </h2>

          {/* Show login prompt only after auth has loaded and user is still null */}
          {!authLoading && !user && (
            <div className="mb-6 p-4 bg-[#FFF8F0] rounded-2xl flex items-center justify-between border border-[#FF6B00]/20">
              <p className="text-sm font-bold text-[#1a1a1a]/60">Login to auto-fill your address</p>
              <Link to="/login" className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-sm font-black hover:scale-105 transition-all">Login</Link>
            </div>
          )}

          {/* Show loading indicator while auth is resolving */}
          {authLoading && (
            <div className="mb-4 flex items-center gap-2 text-[#1a1a1a]/40 text-sm font-bold">
              <span className="w-4 h-4 border-2 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin" />
              Loading your details...
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]/30" />
              <input type="text" placeholder="Full Name" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                autoComplete="name"
                className="w-full pl-12 pr-4 py-3 bg-[#FFF8F0] rounded-2xl border-2 border-transparent focus:border-[#FF6B00] focus:bg-white transition-all outline-none font-bold text-[#1a1a1a]" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]/30" />
              <input type="tel" placeholder="Phone Number" required value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                autoComplete="tel"
                className="w-full pl-12 pr-4 py-3 bg-[#FFF8F0] rounded-2xl border-2 border-transparent focus:border-[#FF6B00] focus:bg-white transition-all outline-none font-bold text-[#1a1a1a]" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-[#1a1a1a]/30" />
              <textarea placeholder="Delivery Address" required value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                autoComplete="street-address" rows={2}
                className="w-full pl-12 pr-4 py-3 bg-[#FFF8F0] rounded-2xl border-2 border-transparent focus:border-[#FF6B00] focus:bg-white transition-all outline-none font-bold text-[#1a1a1a] resize-none" />
            </div>
            <div className="relative">
              <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]/30" />
              <input type="text" inputMode="numeric" placeholder="Pincode" required value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                autoComplete="postal-code"
                className="w-full pl-12 pr-4 py-3 bg-[#FFF8F0] rounded-2xl border-2 border-transparent focus:border-[#FF6B00] focus:bg-white transition-all outline-none font-bold text-[#1a1a1a]" />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#FF6B00]/10 mb-6">
          <h2 className="text-lg font-black mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5">
            {cart?.map((item) => (
              <div key={`${item.id}-${item.selectedWeight}`} className="flex justify-between items-center py-2 border-b border-[#FF6B00]/5 last:border-0">
                <div>
                  <p className="font-black text-[#1a1a1a]">{item.name} × {item.quantity}</p>
                  <p className="text-xs font-bold text-[#FF6B00] uppercase">{item.selectedWeight}kg Pack</p>
                </div>
                <p className="font-bold">₹{(item.price * item.selectedWeight * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-[#FF6B00]/20">
            <span className="font-black text-[#1a1a1a] text-lg">Total</span>
            <span className="text-2xl font-black text-[#FF6B00]">₹{(cartTotal ?? 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#FF6B00]/10 mb-6">
          <h2 className="text-lg font-black mb-5">Payment Method</h2>
          {/* Hidden Selection - set to true to restore */}
          {false && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setPaymentType('upi')}
                className={`py-4 px-4 rounded-2xl font-black flex flex-col items-center gap-2 border-2 transition-all ${paymentType === 'upi' ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-lg scale-[1.02]' : 'bg-[#FFF8F0] text-[#1a1a1a] border-[#FF6B00]/20 hover:border-[#FF6B00]/50'}`}
              >
                <CreditCard className="w-6 h-6" />
                UPI / GPay
              </button>
              <button
                onClick={() => setPaymentType('cod')}
                className={`py-4 px-4 rounded-2xl font-black flex flex-col items-center gap-2 border-2 transition-all ${paymentType === 'cod' ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-lg scale-[1.02]' : 'bg-[#FFF8F0] text-[#1a1a1a] border-[#FF6B00]/20 hover:border-[#FF6B00]/50'}`}
              >
                <Truck className="w-6 h-6" />
                Cash on Delivery
              </button>
            </div>
          )}

          {paymentType === 'upi' && (
            <div className="space-y-3">
              {/* Hidden Payment Options - set to true to restore */}
              {false && (
                <>
                  <button onClick={() => window.location.href = gpayLink} className="block w-full py-4 bg-[#1A73E8] text-white text-center rounded-2xl font-black shadow-lg hover:opacity-90 active:scale-95 transition-all">
                    Pay with GPay
                  </button>

                  <button onClick={() => window.location.href = phonepeLink} className="block w-full py-4 bg-[#5F259F] text-white text-center rounded-2xl font-black shadow-lg hover:opacity-90 active:scale-95 transition-all">
                    Pay with PhonePe
                  </button>

                  <button onClick={() => window.location.href = paytmLink} className="block w-full py-4 bg-[#00BAF2] text-white text-center rounded-2xl font-black shadow-lg hover:opacity-90 active:scale-95 transition-all">
                    Pay with Paytm
                  </button>
                </>
              )}

              <p className="text-xs text-center text-[#1a1a1a]/40 font-bold">
                ⚠️ UPI deep-link only works on mobile. Use QR below on desktop.
              </p>

              {/* Hidden QR Toggle - set to true to restore */}
              {false && (
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="w-full py-3 bg-[#FFF8F0] border-2 border-[#FF6B00]/20 rounded-2xl font-bold text-[#1a1a1a] flex items-center justify-center gap-2 hover:border-[#FF6B00]/50 transition-all"
                >
                  <QrCode className="w-5 h-5 text-[#FF6B00]" />
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </button>
              )}
              {showQR && (
                <div className="flex flex-col items-center py-4">
                  <div className="bg-white p-4 rounded-3xl shadow-inner border-4 border-[#FFD700]/30">
                    <QRCodeSVG value={upiLink} size={200} level="M" />
                  </div>
                  <p className="text-sm text-center mt-3 text-[#1a1a1a]/60 font-bold">
                    Scan with <span className="text-[#FF6B00]">GPay / PhonePe / Paytm</span>
                  </p>
                  <p className="text-xs text-center mt-1 text-[#1a1a1a]/40">
                    Open app → tap <span className="font-bold">Scan QR</span> → point at this code
                  </p>
                  <p className="text-[10px] text-center mt-2 text-[#1a1a1a]/30 font-mono break-all max-w-xs">
                    Pay to: {upiId} · ₹{upiAmount}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmOrder}
          disabled={isSubmitting}
          className="w-full py-5 bg-[#FF6B00] text-white rounded-3xl font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              Placing Order...
            </span>
          ) : (
            `Confirm Order · ₹${(cartTotal ?? 0).toLocaleString()}`
          )}
        </button>

      </div>
    </motion.div>
  );
}
