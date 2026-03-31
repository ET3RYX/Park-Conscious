import React, { useState } from "react";
import { backendAxios } from "../../axios";
import { MapPin, Calendar, CreditCard, ShieldCheck } from "lucide-react";

const EventHero = ({ event }) => {
  const [loading, setLoading] = useState(false);

  // PhonePe Payment Flow
  const handleBooking = async () => {
    setLoading(true);
    try {
      const { data } = await backendAxios.post("/api/pay", {
        amount: event.displayPrice || 0,
        phone: "9999999999", // Placeholder phone
        orderId: event._id,
      });

      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert("Payment gateway redirect failed. Error: " + (data.message || 'Unknown'));
      }
    } catch (err) {
      console.error("Booking Error:", err);
      alert("System Overload: Unable to initiate PhonePe transaction. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const eventImage = event.images?.[0] || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';
  const eventDate = event.displayDate ? new Date(event.displayDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) : 'TBA';

  const categoriesArr = Array.isArray(event.category) 
    ? event.category 
    : (event.category ? [event.category] : []);

  return (
    <div className="relative w-full bg-[#040b17] border-b border-white/5">
      <div className="container mx-auto px-8 lg:px-24 pt-24 pb-16 flex flex-col md:flex-row items-center gap-12">
        {/* Poster Image */}
        <div className="w-56 h-80 flex-shrink-0 shadow-2xl rounded-2xl overflow-hidden border border-white/10 group relative">
           <img src={eventImage} alt="event poster" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{event.displayLocation}</span>
           </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 space-y-8">
           <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                 {categoriesArr.map((cat, i) => (
                   <span key={i} className="text-sky-500 text-[10px] bg-sky-500/10 px-3 py-1 rounded-full uppercase font-black tracking-widest border border-sky-500/20">{cat}</span>
                 ))}
                 <span className="text-slate-500 text-[10px] px-3 py-1 bg-white/5 rounded-full uppercase font-black tracking-widest leading-none flex items-center">Live Experience</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">{event.displayTitle}</h1>
              
              <div className="flex flex-col md:flex-row items-center gap-8 text-slate-400 font-bold text-xs uppercase tracking-widest">
                 <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-sky-500" />
                    <span>{eventDate}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-sky-500" />
                    <span>{event.displayLocation}</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
              <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-2xl">
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5 opacity-60">Entry Fee</p>
                 <h2 className="text-3xl font-black text-white leading-none">₹{event.displayPrice}</h2>
              </div>

              <div className="space-y-3 w-full md:w-auto">
                <button 
                  onClick={handleBooking}
                  disabled={loading}
                  className="w-full md:w-auto bg-sky-600 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl shadow-sky-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <CreditCard size={16} />
                  {loading ? 'Processing...' : 'Book Tickets'}
                </button>
                <div className="flex items-center justify-center lg:justify-start gap-2 opacity-30">
                  <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Verified Secure Checkout</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
