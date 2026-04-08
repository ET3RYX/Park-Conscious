import React from "react";
import { MapPin, Calendar, ShieldCheck, Ticket } from "lucide-react";

const EventHero = ({ event, onOpenBooking }) => {

  const eventImage = event.images?.[0] || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';
  const eventDate = event.displayDate ? new Date(event.displayDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) : 'TBA';

  const categoriesArr = Array.isArray(event.category) 
    ? event.category 
    : (event.category ? [event.category] : []);

  return (
    <div className="relative w-full bg-[#050507] border-b border-white/5 py-12 md:py-24 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-8 lg:px-24 flex flex-col md:flex-row items-center gap-10 lg:gap-24 relative z-10">
        {/* Poster Image - Editorial Shadow */}
        <div className="w-64 h-96 flex-shrink-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10 group relative mt-8 md:mt-0">
           <img src={eventImage} alt="event poster" className="w-full h-full object-cover transition-all duration-700 hover:scale-105" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-6">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{event.displayLocation}</span>
           </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 space-y-10 text-center md:text-left">
           <div className="space-y-6">
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                 {categoriesArr.map((cat, i) => (
                   <span key={i} className="text-white text-[10px] bg-white/5 px-4 py-1.5 rounded-full uppercase font-black tracking-widest border border-white/10">{cat}</span>
                 ))}
                 <span className="text-indigo-400 text-[10px] px-4 py-1.5 bg-indigo-500/10 rounded-full uppercase font-black tracking-widest leading-none flex items-center gap-2 border border-indigo-500/20">
                    <ShieldCheck size={12} /> Live Experience
                 </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9] md:leading-[0.8] mb-4 animate-reveal">
                {event.displayTitle}
              </h1>
              
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                 <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-white" />
                    <span>{eventDate}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-white" />
                    <span>{event.displayLocation}</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 pt-4">
              <div className="text-center md:text-left">
                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] mb-3 opacity-60">Ticket Price</p>
                 <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter italic">₹{event.displayPrice}</h2>
              </div>

              <div className="space-y-4 w-full md:w-auto">
                <button 
                  onClick={onOpenBooking}
                  className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-white text-black rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-95 group font-black uppercase tracking-[0.3em] text-[11px]"
                >
                  <Ticket size={20} className="group-hover:scale-110 transition shrink-0" />
                  <span className="flex-1 text-center">{event.displayPrice > 0 ? "Buy Tickets" : "Reserve Ticket"}</span>
                </button>
                <p className="text-center md:text-left text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] opacity-40">
                   Secure Checkout Gateway Integration
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
