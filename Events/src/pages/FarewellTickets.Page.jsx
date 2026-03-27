import React, { useState, useEffect } from "react";
import axios from "axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import { useAuth } from "../context/DiscussionAuth.context";
import ParkingOfferModal from "../components/ParkingOfferModal/ParkingOfferModal";

const FarewellTicketsPage = () => {
  const { user } = useAuth();
  
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [prices, setPrices]   = useState({ regular: 1499, vip: 2999 });
  const [selectedTicket, setSelectedTicket] = useState("regular");
  const [isParkingModalOpen, setIsParkingModalOpen] = useState(false);

  // Pre-fill user data if they are logged in
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get("/api/tickets?eventId=farewell_2024");
        if (response.data && response.data.success) {
          setPrices({
            regular: response.data.event.regularPrice,
            vip: response.data.event.vipPrice
          });
        }
      } catch (err) {
        console.error("Failed to fetch live prices, using defaults.", err);
      }
    };
    fetchPrices();
  }, []);

  const handlePaymentClick = () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setError("");
    setIsParkingModalOpen(true);
  };

  const processPayment = async (parkingDetails) => {
    const baseAmount = selectedTicket === "vip" ? prices.vip : prices.regular;
    const totalAmount = baseAmount + parkingDetails.addedCost;

    setIsParkingModalOpen(false);
    setLoading(true);

    try {
      const response = await axios.post("/api/pay", {
        name: name,
        email: email, 
        amount: totalAmount,
        phone: phone,
        parkingIncluded: parkingDetails.wantsParking,
        vehicleNumber: parkingDetails.vehicleNumber
      });

      if (response.data && response.data.success && response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        setError("Failed to initiate payment. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Server error during payment initiation.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-darkBackground-900 min-h-screen text-white pt-24 pb-12 font-sans selection:bg-vibrantBlue/30">
      <div className="container mx-auto px-4 md:px-12">
        {/* Aesthetic Gradient Hero Section */}
        <div className="relative w-full h-80 md:h-[28rem] rounded-[3rem] overflow-hidden mb-16 shadow-2xl shadow-premier-900/20 border border-white/5 flex items-center justify-center bg-gradient-to-tr from-[#0a0410] via-[#1a0b2e] to-[#2d0f54]">
          {/* Decorative glowing orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-vibrantBlue/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-premier-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <span className="text-vibrantBlue font-bold tracking-[0.3em] uppercase text-sm md:text-base bg-vibrantBlue/10 px-6 py-2 rounded-full border border-vibrantBlue/20 backdrop-blur-md">The Grand Finale</span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 pb-2">AFSANA '26</h1>
            <p className="text-gray-300 font-medium tracking-widest uppercase text-sm md:text-lg mt-4 max-w-2xl">One Last Celebration • May 25th, 2026</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Details */}
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
                <li className="bg-[#121216] p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-premier-500/30 transition-colors">
                  <div className="w-3 h-3 bg-premier-400 rounded-full shadow-[0_0_10px_rgba(202,138,4,0.5)]"></div> Red Carpet Entry
                </li>
                <li className="bg-[#121216] p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-vibrantBlue/30 transition-colors">
                  <div className="w-3 h-3 bg-vibrantBlue rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div> Live DJ & Band
                </li>
                <li className="bg-[#121216] p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-premier-500/30 transition-colors">
                  <div className="w-3 h-3 bg-premier-400 rounded-full shadow-[0_0_10px_rgba(202,138,4,0.5)]"></div> 5-Course Dinner
                </li>
                <li className="bg-[#121216] p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-vibrantBlue/30 transition-colors">
                  <div className="w-3 h-3 bg-vibrantBlue rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div> Polaroid Photo Booths
                </li>
              </ul>
            </section>
          </div>

          {/* Right Column: Ticket Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-[#0D0D12] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl">
              <h3 className="text-2xl font-bold mb-8 text-white">Select Tickets</h3>
              
              {/* Ticket Selection Toggle */}
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

              {/* Booking Form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#16161C] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-vibrantBlue/50 focus:bg-[#1A1A24] transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#16161C] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-vibrantBlue/50 focus:bg-[#1A1A24] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Phone Number <span className="opacity-50">(For Payment)</span></label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="w-full bg-[#16161C] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-vibrantBlue/50 focus:bg-[#1A1A24] transition-colors tracking-widest"
                  />
                </div>
                
                {error && <p className="text-red-400 text-sm mt-2 font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}
                
                <button 
                  onClick={handlePaymentClick}
                  disabled={loading}
                  className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 tracking-wider uppercase ${selectedTicket === "vip" ? "bg-gradient-to-r from-premier-400 to-[#F2994A] shadow-premier-500/20 hover:shadow-premier-500/40 text-black" : "bg-gradient-to-r from-vibrantBlue to-indigo-500 shadow-vibrantBlue/20 hover:shadow-vibrantBlue/40"}`}
                >
                  {loading ? "Initializing Secure Checkout..." : `PAY ₹${selectedTicket === "vip" ? prices.vip : prices.regular} SECURELY`}
                </button>
                <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2">
                  <span className="w-4 h-px bg-gray-700"></span>
                  Secured by PhonePe
                  <span className="w-4 h-px bg-gray-700"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ParkingOfferModal 
        isOpen={isParkingModalOpen} 
        closeModal={() => setIsParkingModalOpen(false)} 
        onConfirm={processPayment}
        ticketPrice={selectedTicket === "vip" ? prices.vip : prices.regular}
      />
    </div>
  );
};

export default DefaultlayoutHoc(FarewellTicketsPage);
