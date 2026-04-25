import React, { useEffect, useState } from "react";
import { useAuth } from "../context/DiscussionAuth.context";
import { backendAxios } from "../axios";
import { Ticket, Calendar, MapPin, SearchX } from "lucide-react";
import DefaultlayoutHoc from "../layout/Default.layout";
import { Link } from "react-router-dom";

const MyBookingsPage = () => {
   const { user } = useAuth();
   const [bookings, setBookings] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!user) {
         setLoading(false);
         return;
      }

      const fetchBookings = async () => {
         try {
            const id = user.uid || user.id;
            if (!id) return setLoading(false);
            const { data } = await backendAxios.get(`/api/bookings/${id}`);
            setBookings(Array.isArray(data) ? data : []);
         } catch (err) {
            console.error("Error fetching bookings:", err);
         } finally {
            setLoading(false);
         }
      };

      fetchBookings();
   }, [user]);

   if (loading) {
      return (
         <div className="bg-darkBackground-900 min-h-screen text-white flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-vibrantBlue border-r-transparent animate-spin"></div>
         </div>
      );
   }

   if (!user) {
      return (
         <div className="bg-darkBackground-900 min-h-screen text-white flex flex-col items-center justify-center p-8 text-center pt-24 pb-32">
            <Ticket size={80} className="text-gray-700 mb-8" />
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Access Denied</h1>
            <p className="text-gray-400 font-medium max-w-md">You must be logged in to view your tickets and booking history.</p>
            <p className="text-gray-500 font-medium text-xs mt-4">Please log in using the button in the navigation bar at the top right.</p>
         </div>
      );
   }

   return (
      <div className="bg-[#050507] min-h-screen text-white pb-32">
         <div className="container mx-auto px-8 lg:px-24 pt-24">
            <div className="mb-16">
               <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic">The <span className="text-indigo-400">Wallet</span></h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs">Your curated collection of active event credentials.</p>
            </div>

            {bookings.length === 0 ? (
               <div className="bg-white/5 border border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-12 md:p-24 flex flex-col items-center justify-center text-center backdrop-blur-xl">
                  <Ticket size={80} className="text-white/10 mb-8" />
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Vault is Empty</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] max-w-sm leading-relaxed">It looks like you haven't secured entry to any upcoming experiences yet.</p>
                  <Link to="/" className="mt-12 bg-white text-black hover:bg-indigo-600 hover:text-white uppercase tracking-[0.3em] font-black text-[11px] px-12 py-4 rounded-full transition-all shadow-2xl active:scale-95">Explore Experiences</Link>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                  {bookings.map((booking, idx) => (
                     <div key={booking._id || idx} className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative hover:-translate-y-2 transition-all duration-700 group">
                        {booking.event?.image && (
                           <div className="w-full h-56 bg-[#050507] relative overflow-hidden">
                              <img src={booking.event.image} alt={booking.event.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100" />
                              <div className="absolute top-6 right-6 bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full">
                                 {booking.status}
                              </div>
                           </div>
                        )}

                        <div className={`p-6 md:p-10 flex-1 flex flex-col ${!booking.event?.image ? "pt-12 md:pt-16" : ""}`}>
                           {!booking.event?.image && (
                              <div className="mb-8 flex justify-between items-center">
                                 <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full">
                                    {booking.status}
                                 </div>
                              </div>
                           )}

                           <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.85] italic">
                              {booking.event?.title || "Classified Event"}
                           </h3>

                           <div className="space-y-5 mb-10 flex-1">
                              <div className="flex items-center gap-4 text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                                 <Calendar size={14} className="text-white" />
                                 <span>{new Date(booking.event?.date || booking.event?.createdAt || booking.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-4 text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                                 <MapPin size={14} className="text-white" />
                                 <span className="truncate">{(typeof booking.event?.location === 'string' ? booking.event.location : booking.event?.location?.name || booking.event?.locationName || booking.event?.venue) || "Venue Restricted"}</span>
                              </div>
                           </div>

                           <div className="mt-auto border-t border-white/5 pt-8 border-dashed flex justify-between items-end">
                              <div>
                                 <p className="text-[9px] uppercase font-black tracking-[0.4em] text-slate-400 mb-2">Ticket Price</p>
                                 <span className="font-black text-2xl text-white italic">₹{booking.amount}</span>
                              </div>
                              <div className="text-right flex flex-col items-end gap-3">
                                 <p className="text-[9px] uppercase font-black tracking-[0.4em] text-slate-400 mb-2">Scan to Enter</p>
                                 <div className="bg-white p-2 rounded-2xl shadow-2xl">
                                    <img
                                       src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(booking.ticketId || booking.transactionId)}&ecc=L&margin=0`}
                                       alt="Verify QR"
                                       width={64}
                                       height={64}
                                       className="rounded-lg"
                                    />
                                 </div>
                                 <span className="font-black text-[9px] text-slate-500 tracking-[0.3em] uppercase">#{String(booking.ticketId || booking.transactionId || booking._id || "000000").slice(-6)}</span>
                              </div>
                           </div>
                        </div>

                        {/* Ticket cutouts aesthetic */}
                        <div className="absolute top-[224px] -left-4 w-8 h-8 bg-[#050507] rounded-full border border-white/5 z-10 shadow-inner" style={{ transform: booking.event?.image ? "" : "translateY(-180px)" }}></div>
                        <div className="absolute top-[224px] -right-4 w-8 h-8 bg-[#050507] rounded-full border border-white/5 z-10 shadow-inner" style={{ transform: booking.event?.image ? "" : "translateY(-180px)" }}></div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};


export default DefaultlayoutHoc(MyBookingsPage);
