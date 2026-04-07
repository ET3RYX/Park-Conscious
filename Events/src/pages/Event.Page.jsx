import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import EventHero from "../components/EventHero/EventHero.Component";
import BookingModal from "../components/Booking/BookingModal.jsx";
import { Info, MapPin, Share2, ShieldCheck, Ticket, CreditCard } from "lucide-react";

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data } = await backendAxios.get(`/api/events/${id}`);
        
        // Normalize inconsistent database fields
        const normalized = {
          ...data,
          displayTitle: data.title || data.name || "Untitled Experience",
          displayPrice: data.price ?? 0,
          displayDate: data.date || data.createdAt,
          displayLocation: data.location?.name || data.locationName || data.venue || "TBA",
          displayAddress: data.location?.address || data.locationAddress || "",
          displayDescription: data.description || "",
          displayCapacity: data.capacity || 0
        };

        setEvent(normalized);
      } catch (err) {
        console.error("Error fetching event:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040b17] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-sky-500 border-r-transparent animate-spin"></div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="bg-[#040b17] min-h-screen text-white pb-24">
      <EventHero event={event} />

      <div className="container mx-auto px-8 lg:px-24 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          {event.displayDescription && (
            <section className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/50">About the Event</h2>
              <p className="text-slate-300 text-lg leading-relaxed font-medium">
                {event.displayDescription}
              </p>
            </section>
          )}

          <section className="space-y-6">
             <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/50">Location & Venue</h2>
             <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col md:flex-row gap-10 items-center">
                <div className="w-full md:w-32 h-32 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/5 flex-shrink-0">
                   <MapPin className="text-sky-500/40" size={40} />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                   <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{event.displayLocation}</h3>
                   <p className="text-slate-400 font-medium text-sm">{event.displayAddress || "Delhi NCR, India"}</p>
                   <div className="pt-4">
                      <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 px-4 py-1.5 rounded-full border border-sky-500/10">Official Venue Partner</span>
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 sticky top-24">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-white">Event Logistics</h3>
              
              <div className="space-y-8">
                 <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Event Capacity</p>
                    <div className="flex items-center justify-between">
                       <span className="text-2xl font-black text-white">{event.displayCapacity || "Live"}</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Limit</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                       <div className="bg-sky-500 h-full w-full opacity-20" />
                    </div>
                 </div>

                 <div className="pt-6 space-y-4">
                    <button 
                      onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard.writeText(url);
                        alert("Link copied to clipboard");
                      }}
                      className="w-full flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group"
                    >
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Share Event</span>
                       <Share2 size={14} className="text-slate-500 group-hover:text-sky-500 transition" />
                    </button>
                     <p className="text-center text-[8px] text-slate-600 font-black uppercase leading-relaxed tracking-widest opacity-60">
                        Secure QR Entry • Non-Refundable • Transferable
                     </p>

                     <button 
                       onClick={() => setIsBookingOpen(true)}
                       className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-2xl hover:opacity-90 transition shadow-xl shadow-sky-900/20 active:scale-95 group mt-6 font-black uppercase tracking-widest text-[10px]"
                     >
                        <CreditCard size={18} className="group-hover:rotate-12 transition-transform" />
                        {event.displayPrice > 0 ? "Book Tickets Now" : "Register For Free"}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        setIsOpen={setIsBookingOpen} 
        event={event} 
      />
    </div>
  );
};

export default DefaultlayoutHoc(EventPage);
