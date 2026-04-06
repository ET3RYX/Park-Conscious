import React, { useState, useEffect } from "react";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/DiscussionAuth.context";
import { Car, X, CheckCircle2, MapPin, Music, Utensils, Camera, Star } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-[#0D0D12] border border-white/10 rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="w-12 h-12 bg-vibrantBlue/10 rounded-2xl flex items-center justify-center mb-4 border border-vibrantBlue/20">
              <Car size={24} className="text-vibrantBlue" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Coming by Car?</h2>
            <p className="text-gray-500 text-sm mt-1">Add reserved parking for ₹299 extra.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setWantsParking(true)}
            className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${wantsParking === true ? 'border-vibrantBlue bg-vibrantBlue/10' : 'border-white/5 hover:border-white/20'}`}
          >
            <div>
              <p className={`font-bold ${wantsParking === true ? 'text-vibrantBlue' : 'text-gray-200'}`}>Yes, add parking</p>
              <p className="text-xs text-gray-500 mt-0.5">Guaranteed spot, no stress</p>
            </div>
            <span className="font-black text-white">+₹299</span>
          </button>

          <button
            onClick={() => { setWantsParking(false); setVehicleNumber(""); }}
            className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${wantsParking === false ? 'border-gray-600 bg-white/5' : 'border-white/5 hover:border-white/20'}`}
          >
            <p className={`font-bold ${wantsParking === false ? 'text-white' : 'text-gray-400'}`}>No thanks, I'll manage</p>
          </button>
        </div>

        {wantsParking === true && (
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Vehicle Number</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g. DL 01 AB 1234"
              className="w-full bg-[#16161C] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-vibrantBlue/50 transition-all uppercase tracking-widest"
            />
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={wantsParking === null || (wantsParking === true && !vehicleNumber.trim())}
          className="w-full bg-gradient-to-r from-vibrantBlue to-indigo-500 text-white font-black py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90 uppercase tracking-wider text-sm"
        >
          Confirm & Proceed to Payment — ₹{ticketPrice + (wantsParking === true ? 299 : 0)}
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
      if (response.data?.success && response.data?.redirectUrl) {
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
    <div className="bg-darkBackground-900 min-h-screen text-white pt-24 pb-12 font-sans selection:bg-vibrantBlue/30">
      <div className="container mx-auto px-4 md:px-12">

        {/* Hero Section — Purple/Gold Gradient */}
        <div className="relative w-full h-80 md:h-[28rem] rounded-[3rem] overflow-hidden mb-8 md:mb-16 shadow-2xl shadow-premier-900/20 border border-white/5 flex items-center justify-center bg-gradient-to-tr from-[#0a0410] via-[#1a0b2e] to-[#2d0f54]">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-vibrantBlue/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-premier-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-4">
            <span className="text-vibrantBlue font-bold tracking-[0.3em] uppercase text-xs md:text-base bg-vibrantBlue/10 px-6 py-2 rounded-full border border-vibrantBlue/20 backdrop-blur-md">The Grand Finale</span>
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 pb-2">AFSANA '26</h1>
            <p className="text-gray-300 font-medium tracking-widest uppercase text-xs md:text-lg mt-4 max-w-2xl">One Last Celebration • May 25th, 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-7 space-y-16 mt-4">
            <section>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-white">
                <span className="w-1.5 h-8 bg-premier-400 rounded-full"></span>
                About Afsana
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed font-light">
                Celebrate the end of an era with an unforgettable night. We're bringing together the graduating class for one last celebration filled with music, dance, and awards. Expect a premium dinner, networking with alumni, and a cinematic farewell experience built down to the smallest detail.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-white">
                <span className="w-1.5 h-8 bg-vibrantBlue rounded-full"></span>
                Event Highlights
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 font-medium">
                {[
                  { icon: Star, label: "Red Carpet Entry", color: "premier" },
                  { icon: Music, label: "Live DJ & Band", color: "blue" },
                  { icon: Utensils, label: "5-Course Dinner", color: "premier" },
                  { icon: Camera, label: "Polaroid Photo Booths", color: "blue" },
                ].map(({ icon: Icon, label, color }) => (
                  <li key={label} className={`bg-[#121216] p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-${color === 'premier' ? 'premier-500' : 'vibrantBlue'}/30 transition-colors`}>
                    <Icon size={18} className={color === 'premier' ? 'text-premier-400' : 'text-vibrantBlue'} />
                    {label}
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#121216] p-8 rounded-3xl border border-white/5 space-y-3">
                <MapPin className="text-premier-400" size={22} />
                <h4 className="font-bold text-lg text-white">Venue</h4>
                <p className="text-gray-500 text-sm">Premium Banquet Hall, Delhi NCR</p>
              </div>
              <div className="bg-[#121216] p-8 rounded-3xl border border-white/5 space-y-3">
                <Car className="text-vibrantBlue" size={22} />
                <h4 className="font-bold text-lg text-white">Parking Available</h4>
                <p className="text-gray-500 text-sm">Reserve your spot during booking for just ₹299 extra.</p>
              </div>
            </section>
          </div>

          {/* Right: Ticket Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-[#0D0D12] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-8 text-white">Select Tickets</h3>

              <div className="space-y-4 mb-8">
                <div
                  onClick={() => setSelectedTicket("regular")}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex justify-between items-center ${selectedTicket === "regular" ? "border-vibrantBlue bg-vibrantBlue/5" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                >
                  <div>
                    <h4 className={`font-bold text-lg ${selectedTicket === "regular" ? "text-vibrantBlue" : "text-gray-300"}`}>Regular Entry</h4>
                    <p className="text-xs text-gray-500 mt-1">General Admission</p>
                  </div>
                  <span className="text-2xl font-black text-white">₹{prices.regular}</span>
                </div>

                <div
                  onClick={() => setSelectedTicket("vip")}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex justify-between items-center ${selectedTicket === "vip" ? "border-premier-400 bg-premier-400/5" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                >
                  <div>
                    <h4 className={`font-bold text-lg flex items-center gap-2 ${selectedTicket === "vip" ? "text-premier-400" : "text-gray-300"}`}>
                      VIP Access
                      {selectedTicket === "vip" && <span className="text-[10px] bg-premier-400 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">Premium</span>}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Backstage Access + Red Carpet</p>
                  </div>
                  <span className="text-2xl font-black text-white">₹{prices.vip}</span>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Full Name", type: "text", value: name, setter: setName, placeholder: "Enter your name" },
                  { label: "Email Address", type: "email", value: email, setter: setEmail, placeholder: "name@example.com" },
                  { label: "Phone Number", type: "tel", value: phone, setter: setPhone, placeholder: "10-digit number", maxLength: 10 },
                ].map(({ label, type, value, setter, placeholder, maxLength }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      maxLength={maxLength}
                      className="w-full bg-[#16161C] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-vibrantBlue/50 focus:bg-[#1A1A24] transition-colors"
                    />
                  </div>
                ))}

                {error && <p className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}

                <button
                  onClick={handlePaymentClick}
                  disabled={loading}
                  className={`w-full font-black py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 tracking-wider uppercase text-sm ${selectedTicket === "vip" ? "bg-gradient-to-r from-premier-400 to-[#F2994A] text-black shadow-premier-500/20 hover:shadow-premier-500/40" : "bg-gradient-to-r from-vibrantBlue to-indigo-500 text-white shadow-vibrantBlue/20 hover:shadow-vibrantBlue/40"}`}
                >
                  {loading ? "Redirecting to payment..." : `Pay ₹${selectedTicket === "vip" ? prices.vip : prices.regular} Securely`}
                </button>
                <p className="text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 mt-2">
                  <span className="w-4 h-px bg-gray-800"></span>
                  Powered by Park Conscious
                  <span className="w-4 h-px bg-gray-800"></span>
                </p>
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
