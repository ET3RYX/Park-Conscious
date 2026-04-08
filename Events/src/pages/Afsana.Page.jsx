import React, { useState, useEffect } from "react";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/DiscussionAuth.context";
import { Car, X, CheckCircle2, MapPin, Music, Utensils, Camera, Star, AlertCircle, Loader2, CreditCard } from 'lucide-react';

// Parking modal inline - "are you coming with parking?"
const ParkingModal = ({ isOpen, onClose, onConfirm, ticketPrice }) => {
  const [wantsParking, setWantsParking] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (wantsParking === true && !vehicleNumber.trim()) return;
    onConfirm({
      wantsParking: wantsParking === true,
      vehicleNumber: vehicleNumber.trim(),
      addedCost: wantsParking === true ? 299 : 0
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#050507] border border-white/5 rounded-[3rem] p-10 md:p-16 w-full max-w-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative">
        {/* Dynamic Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex items-start justify-between mb-12 relative z-10">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Car size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Booking Extras</h2>
            <p className="text-slate-400 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Reserved transit access: ₹299 Increment</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-700 hover:text-white transition-colors rounded-full bg-white/5 border border-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-10 relative z-10">
          <button
            onClick={() => setWantsParking(true)}
            className={`w-full p-8 rounded-[2rem] border-2 transition-all text-left flex items-center justify-between ${wantsParking === true ? 'border-white bg-white/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
          >
            <div>
              <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${wantsParking === true ? 'text-white' : 'text-slate-500'}`}>Authorized Parking</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Guaranteed Zone Assignment</p>
            </div>
            <span className="text-2xl font-black text-white italic">+₹299</span>
          </button>

          <button
            onClick={() => { setWantsParking(false); setVehicleNumber(""); }}
            className={`w-full p-8 rounded-[2rem] border-2 transition-all text-left border-white/5 bg-white/5 hover:border-white/20 ${wantsParking === false ? 'border-slate-800' : ''}`}
          >
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${wantsParking === false ? 'text-white' : 'text-slate-500'}`}>Independent Transit</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manual spot searching required</p>
          </button>
        </div>

        {wantsParking === true && (
          <div className="mb-10 relative z-10 animate-reveal">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 ml-1">Vehicle Identification</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="PLATE NUMBER"
              className="w-full bg-[#050507] border border-white/5 rounded-2xl px-8 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium uppercase tracking-[0.2em] placeholder:text-slate-500"
            />
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={wantsParking === null || (wantsParking === true && !vehicleNumber.trim())}
          className="w-full bg-white text-black font-black py-6 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-indigo-600 hover:text-white uppercase tracking-[0.3em] text-[11px] relative z-10"
        >
          Secure Entry Channel — ₹{ticketPrice + (wantsParking === true ? 299 : 0)}
        </button>
      </div>
    </div>
  );
};

const AfsanaPage = () => {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prices, setPrices] = useState({ regular: 1499, vip: 2999 });
  const [selectedTicket, setSelectedTicket] = useState("regular");
  const [isParkingModalOpen, setIsParkingModalOpen] = useState(false);

  // Scroll to top automatically
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await backendAxios.get("/api/tickets?eventId=farewell_2024");
        if (response.data?.success) {
          setPrices({
            regular: response.data.event.regularPrice,
            vip: response.data.event.vipPrice
          });
        }
      } catch (err) {
        // Use default prices silently
      }
    };
    fetchPrices();
  }, []);

  const handlePaymentClick = () => {
    if (!name.trim()) return setError("Please enter your name.");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (!phone || phone.length < 10) return setError("Please enter a valid 10-digit phone number.");
    setError("");
    setIsParkingModalOpen(true);
  };

  const processPayment = async (parkingDetails) => {
    const baseAmount = selectedTicket === "vip" ? prices.vip : prices.regular;
    const totalAmount = baseAmount + parkingDetails.addedCost;
    setIsParkingModalOpen(false);
    setLoading(true);
    try {
      const response = await backendAxios.post("/api/pay", {
        name, email,
        amount: totalAmount,
        phone,
        userId: user ? (user.uid || user.id) : name,
        eventId: "farewell_2024",
        parkingIncluded: parkingDetails.wantsParking,
        vehicleNumber: parkingDetails.vehicleNumber
      });
      if (response.data?.success && response.data?.orderId) {
        const loadScript = (src) => new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            setError("Payment SDK failed to load. Please check connection.");
            setLoading(false);
            return;
        }

        const options = {
            key: response.data.key,
            amount: response.data.amount,
            currency: "INR",
            name: "BACKSTAGE",
            description: "Afsana '26 Ticket",
            order_id: response.data.orderId,
            handler: async function (paymentResponse) {
                try {
                    const verifyRes = await backendAxios.post("/api/payment-callback", paymentResponse);
                    if (verifyRes.data?.success) {
                        window.location.href = `/payment-success?txnId=${verifyRes.data.txnId}`;
                    } else {
                        setError("Payment verification failed.");
                        setLoading(false);
                    }
                } catch (err) {
                    setError("Payment verification failed. Please contact support.");
                    setLoading(false);
                }
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: { color: "#4f46e5" },
            modal: {
                ondismiss: function() {
                    setLoading(false);
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function () {
            setError("Payment failed! Please try again.");
            setLoading(false);
        });
        paymentObject.open();

      } else if (response.data?.success && response.data?.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        setError("Failed to initiate payment. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error during payment initiation.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#050507] min-h-screen text-white pt-24 pb-12 font-sans selection:bg-indigo-500/30 relative">
      <div className="container mx-auto px-4 md:px-12 relative z-10">

        {/* Hero Section — Minimalist Editorial */}
        <div className="relative w-full h-80 md:h-[32rem] rounded-[3.5rem] overflow-hidden mb-12 md:mb-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5 flex items-center justify-center bg-[#050507]">
          {/* Breathing Mesh Background */}
          <div className="absolute top-0 right-0 w-full h-full bg-indigo-600/5 blur-[120px] rounded-full animate-mesh pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-6">
            <span className="text-white font-black tracking-[0.4em] uppercase text-[10px] md:text-xs bg-white/5 px-8 py-2.5 rounded-full border border-white/10 backdrop-blur-md">The Grand Finale</span>
            <div className="space-y-2">
              <h1 className="text-6xl sm:text-7xl md:text-[10rem] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 leading-[0.8] animate-reveal pb-2">AFSANA</h1>
              <h1 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-800/20 leading-[0.8] animate-reveal pb-4 -mt-2 md:-mt-6" style={{ animationDelay: '0.3s' }}>'26</h1>
            </div>
            <p className="text-slate-500 font-bold tracking-[0.4em] uppercase text-[10px] md:text-sm mt-8 max-w-2xl border-t border-white/5 pt-6">One Last Celebration • May 25th, 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          {/* Left: Details */}
          <div className="lg:col-span-7 space-y-24">
            <section className="space-y-10">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Manifesto</h2>
              <p className="text-slate-400 text-2xl leading-[1.6] font-medium max-w-2xl italic">
                Celebrate the end of an era with an unforgettable night. One last celebration filled with music, dance, and awards. A cinematic farewell experience built down to the smallest detail.
              </p>
            </section>

            <section className="space-y-10">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Experience Markers</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Star, label: "Red Carpet Entry" },
                  { icon: Music, label: "Sonic Selection" },
                  { icon: Utensils, label: "Culinary Draft" },
                  { icon: Camera, label: "Visual Archiving" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex items-center gap-6 group hover:bg-white/[0.07] transition-all duration-500">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                       <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80">{label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 space-y-6">
                <MapPin className="text-indigo-400" size={24} />
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Venue Details</h4>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest leading-relaxed">Premium Outpost • Delhi NCR</p>
              </div>
              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 space-y-6">
                <Car className="text-indigo-400" size={24} />
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Booking Extras</h4>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest leading-relaxed">Reserve your transit spot during secure check-in.</p>
              </div>
            </section>
          </div>

          {/* Right: Ticket Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 bg-white/5 border border-white/5 rounded-[3.5rem] p-10 md:p-14 shadow-2xl backdrop-blur-3xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-12 text-slate-500 text-center">Entry Configuration</h3>

              <div className="space-y-6 mb-12">
                <div
                  onClick={() => setSelectedTicket("regular")}
                  className={`cursor-pointer p-8 rounded-[2rem] border-2 transition-all flex justify-between items-center ${selectedTicket === "regular" ? "border-white bg-white/5 shadow-2xl" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                >
                  <div className="space-y-1">
                    <h4 className={`font-black text-[11px] uppercase tracking-[0.3em] ${selectedTicket === "regular" ? "text-white" : "text-slate-600"}`}>Regular Access</h4>
                    <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest">General Manifesto</p>
                  </div>
                  <span className="text-3xl font-black text-white italic">₹{prices.regular}</span>
                </div>

                <div
                  onClick={() => setSelectedTicket("vip")}
                  className={`cursor-pointer p-8 rounded-[2rem] border-2 transition-all flex justify-between items-center ${selectedTicket === "vip" ? "border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                >
                  <div className="space-y-1">
                    <h4 className={`font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 ${selectedTicket === "vip" ? "text-indigo-400" : "text-slate-600"}`}>
                      VIP Access
                      {selectedTicket === "vip" && <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Restricted</span>}
                    </h4>
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Backstage + Priority</p>
                  </div>
                  <span className="text-3xl font-black text-white italic">₹{prices.vip}</span>
                </div>
              </div>

              <div className="space-y-8">
                {[
                  { label: "Full Name", type: "text", value: name, setter: setName, placeholder: "Legal Name" },
                  { label: "Email Address", type: "email", value: email, setter: setEmail, placeholder: "name@example.com" },
                  { label: "Phone Number", type: "tel", value: phone, setter: setPhone, placeholder: "10-Digit Contact", maxLength: 10 },
                ].map(({ label, type, value, setter, placeholder, maxLength }) => (
                  <div key={label} className="space-y-3">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      className="w-full bg-[#050507] border border-white/5 rounded-2xl px-8 py-5 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/20 transition-all font-medium text-sm"
                    />
                  </div>
                ))}

                {error && (
                  <div className="p-6 bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-4">
                    <AlertCircle size={20} /> {error}
                  </div>
                )}

                <button
                  onClick={handlePaymentClick}
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-6 rounded-full shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-[0.3em] text-[11px] flex items-center justify-center px-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin shrink-0" size={18} />
                      <span className="flex-1 text-center">Establishing Link...</span>
                      <div className="w-4 shrink-0" />
                    </>
                  ) : (
                    <>
                      <CreditCard className="shrink-0" size={18} />
                      <span className="flex-1 text-center">{`Pay • ₹${selectedTicket === "vip" ? prices.vip : prices.regular}`}</span>
                      <div className="w-4 shrink-0" />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-4 opacity-20 pt-4">
                   <div className="w-12 h-px bg-white"></div>
                   <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white">BACKSTAGE Guarantee</span>
                   <div className="w-12 h-px bg-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ParkingModal
        isOpen={isParkingModalOpen}
        onClose={() => setIsParkingModalOpen(false)}
        onConfirm={processPayment}
        ticketPrice={selectedTicket === "vip" ? prices.vip : prices.regular}
      />
    </div>
  );
};

export default DefaultlayoutHoc(AfsanaPage);
