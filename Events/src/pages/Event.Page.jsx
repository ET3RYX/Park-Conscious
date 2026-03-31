import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import EventHero from "../components/EventHero/EventHero.Component";
import { Info, MapPin, Share2, ShieldCheck, Ticket } from "lucide-react";

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data } = await backendAxios.get(`/api/events/${id}`);
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
        // Fallback to home if not found
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

      <div className="container mx-auto px-8 lg:px-24 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
               <Info className="text-sky-500" size={24} /> About the Event
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              {event.description || "No description provided for this premium experience."}
            </p>
          </section>

          <section className="space-y-6">
             <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
               <MapPin className="text-sky-500" size={24} /> Host Venue Details
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center">
               <div className="w-full md:w-48 h-48 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                  <MapPin className="text-slate-700" size={64} />
               </div>
               <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white uppercase">{event.location?.name || event.venue}</h3>
                  <p className="text-slate-500 font-medium">{event.location?.address || "Location verification in progress."}</p>
                  <div className="pt-4">
                     <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full">Official Venue Partner</span>
                  </div>
               </div>
            </div>
          </section>

          {/* Social Proof Placeholder */}
          <section className="bg-gradient-to-r from-sky-600/10 to-transparent border-l-4 border-sky-500 p-8 rounded-r-2xl">
             <div className="flex items-center gap-4">
                <ShieldCheck className="text-emerald-500" size={32} />
                <div>
                   <h4 className="font-bold text-white uppercase tracking-tight">Verified by Park Conscious</h4>
                   <p className="text-slate-500 text-xs font-medium">This event is officially registered and utilizes the secure Unified Checkout Protocol.</p>
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-24">
              <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Ticket className="text-sky-500" size={20} /> Access Control
              </h3>
              
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Available Capacity</p>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                       <div className="bg-sky-500 h-full w-[85%]" />
                    </div>
                    <p className="text-right text-[10px] font-bold text-sky-500 mt-1 uppercase tracking-widest">85% Remaining</p>
                 </div>

                 <div className="pt-4 space-y-4">
                    <button className="w-full flex items-center justify-between px-6 py-4 bg-slate-800 border border-white/5 rounded-xl hover:border-sky-500/50 transition">
                       <span className="text-xs font-bold text-white uppercase tracking-widest">Share Event</span>
                       <Share2 size={16} className="text-slate-500" />
                    </button>
                    <p className="text-center text-[9px] text-slate-600 font-medium uppercase leading-relaxed">
                       Tickets are non-refundable but can be transferred via the Park Conscious app.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(EventPage);
