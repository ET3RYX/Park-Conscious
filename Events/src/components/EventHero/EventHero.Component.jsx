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
        amount: event.price || 1499,
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
  const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) : 'TBA';

  const categoriesArr = Array.isArray(event.category) 
    ? event.category 
    : (event.category ? [event.category] : []);

  return (
    <div className="relative w-full overflow-hidden bg-[#040b17]" style={{ minHeight: "32rem" }}>
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={eventImage} 
          alt="event backdrop" 
          className="w-full h-full object-cover opacity-30 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040b17] via-[#040b17]/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#040b17] via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-8 lg:px-24 pt-16 pb-12 flex flex-col lg:flex-row items-center gap-12">
        {/* Poster Image */}
        <div className="w-64 h-96 flex-shrink-0 shadow-[0_0_50px_rgba(30,58,138,0.4)] rounded-2xl overflow-hidden border border-white/5 animate-in zoom-in duration-700">
           <img src={eventImage} alt="event poster" className="w-full h-full object-cover" />
        </div>

        {/* Content Info */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
           <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="bg-sky-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-sky-500/20">{event.status || 'Verified'}</span>
              {categoriesArr.map((cat, i) => (
                <span key={i} className="text-white/40 text-[10px] border border-white/10 px-3 py-1 rounded-full uppercase font-bold tracking-widest">{cat}</span>
              ))}
           </div>

           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">{event.title || event.name}</h1>
           
           <div className="flex flex-col md:flex-row items-center gap-6 text-slate-300 font-medium text-sm">
              <div className="flex items-center gap-2">
                 <Calendar size={18} className="text-sky-500" />
                 <span>{eventDate}</span>
              </div>
              <div className="flex items-center gap-2">
                 <MapPin size={18} className="text-sky-500" />
                 <span>{event.location?.name || event.venue || 'TBA'}</span>
              </div>
           </div>

           <div className="pt-8 flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl backdrop-blur-md">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Single Entry</p>
                 <h2 className="text-3xl font-black text-white">₹{event.price || 0}</h2>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleBooking}
                  disabled={loading}
                  className="bg-sky-600 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl shadow-sky-900/40 active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                  <CreditCard size={18} />
                  {loading ? 'Initiating Cloud Payment...' : 'Secure Booking Now'}
                </button>
                <div className="flex items-center justify-center gap-2 opacity-40">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">PhonePe Unified Gateway</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
