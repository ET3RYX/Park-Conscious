import React, { useState, useEffect } from "react";
import axios from "axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import collegeFarewellImg from "../assets/college_farewell.png";

const FarewellTicketsPage = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prices, setPrices] = useState({ regular: 1499, vip: 2999 });

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


  const handlePayment = async (amount) => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/pay", {
        name: "Farewell Attendee",
        amount: amount,
        phone: phone
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
    <div className="bg-darkBackground-900 min-h-screen text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12">
        {/* Header Section */}
        <div className="relative w-full h-64 md:h-96 rounded-[3rem] overflow-hidden mb-12 shadow-2xl border border-white/5">
          <img 
            src={collegeFarewellImg} 
            alt="College Farewell" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darkBackground-900 via-darkBackground-900/40 to-transparent flex flex-col justify-end p-8 md:p-16">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white">College Farewell '24</h1>
            <p className="text-vibrantBlue font-bold tracking-widest uppercase text-sm md:text-lg mt-2">The Grand Finale • May 25th, 2024</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-premier-400 rounded-full"></span>
                About the Event
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Celebrate the end of an era with an unforgettable night. We're bringing together the graduating class for one last celebration filled with music, dance, and awards. Expect a premium dinner, networking with alumni, and a cinematic farewell experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-vibrantBlue rounded-full"></span>
                Event Highlights
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <li className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-premier-400 rounded-full"></div> Red Carpet Entry
                </li>
                <li className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-vibrantBlue rounded-full"></div> Live DJ & Band
                </li>
                <li className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-premier-400 rounded-full"></div> 5-Course Dinner
                </li>
                <li className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-vibrantBlue rounded-full"></div> Photo Booths
                </li>
              </ul>
            </section>
          </div>

          {/* Right Column: Ticket Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Booking Details</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-gray-400">Regular Entry</span>
                  <span className="text-2xl font-black">₹{prices.regular}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-white/5">
                  <span className="text-gray-400">VIP Access</span>
                  <span className="text-2xl font-black text-premier-400">₹{prices.vip}</span>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number (Required for Payment)</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your 10-digit number"
                    className="w-full bg-darkBackground-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-premier-400 focus:ring-1 focus:ring-premier-400 transition"
                  />
                  {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </div>
                
                <button 
                  onClick={() => handlePayment(prices.regular)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-vibrantBlue to-premier-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-premier-700/30 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? "PROCESSING..." : `BOOK TICKETS NOW (₹${prices.regular})`}
                </button>
                <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-widest">Powered by PhonePe & Park Conscious</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(FarewellTicketsPage);
