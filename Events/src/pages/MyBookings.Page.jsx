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
    <div className="bg-darkBackground-900 min-h-screen text-white pb-32">
       <div className="container mx-auto px-8 lg:px-24 pt-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2"><span className="text-premier-500">My</span> Tickets</h1>
          <p className="text-gray-400 font-medium mb-12">Manage your upcoming events and past experiences.</p>

          {bookings.length === 0 ? (
             <div className="bg-white/5 border border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                <SearchX size={64} className="text-gray-700 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-3">No bookings yet</h2>
                <p className="text-gray-400 font-medium">It looks like you haven't bought tickets to any events yet.</p>
                <Link to="/" className="mt-8 bg-premier-600 hover:bg-premier-500 uppercase tracking-widest font-black text-[10px] px-8 py-3 rounded-full transition shadow-xl shadow-premier-900/20">Find an Event</Link>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {bookings.map((booking, idx) => (
                   <div key={booking._id || idx} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative hover:-translate-y-1 transition duration-500">
                      {booking.event?.image && (
                         <div className="w-full h-48 bg-darkBackground-800 relative">
                            <img src={booking.event.image} alt={booking.event.title} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute top-4 right-4 bg-lime-500/20 backdrop-blur-md border border-lime-500 text-lime-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                               {booking.status}
                            </div>
                         </div>
                      )}
                      
                      <div className={`p-8 flex-1 flex flex-col ${!booking.event?.image ? "pt-12" : ""}`}>
                         {!booking.event?.image && (
                            <div className="mb-6 flex justify-between items-center">
                               <div className="bg-lime-500/20 backdrop-blur-md border border-lime-500 text-lime-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                  {booking.status}
                               </div>
                            </div>
                         )}

                         <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
                            {booking.event?.title || "Unknown Event"}
                         </h3>
                         
                         <div className="space-y-4 mb-8 flex-1">
                            <div className="flex items-center gap-3 text-gray-400 font-medium text-xs">
                               <Calendar size={14} className="text-premier-500" />
                                <span>{new Date(booking.event?.date || booking.event?.createdAt || booking.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 font-medium text-xs">
                               <MapPin size={14} className="text-premier-500" />
                               <span className="truncate">{booking.event?.location || "TBA"}</span>
                            </div>
                         </div>

                         <div className="mt-auto border-t border-white/10 pt-6 border-dashed flex justify-between items-end">
                            <div>
                               <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Paid</p>
                               <span className="font-black text-lg text-white">₹{booking.amount}</span>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                               <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Ticket / QR</p>
                               <div className="bg-white p-1.5 rounded-lg shadow-lg">
                                 <img
                                   src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(booking.ticketId || booking.transactionId)}&ecc=L&margin=0`}
                                   alt="Verify QR"
                                   width={64}
                                   height={64}
                                 />
                               </div>
                               <span className="font-black text-[10px] text-gray-300 tracking-wider">#{(booking.ticketId || booking.transactionId || booking._id).slice(-6)}</span>
                            </div>
                         </div>
                      </div>

                      {/* Ticket cutouts aesthetic */}
                      <div className="absolute top-48 -left-3 w-6 h-6 bg-darkBackground-900 rounded-full border-r border-white/10 z-10" style={{ transform: booking.event?.image ? "" : "translateY(-140px)" }}></div>
                      <div className="absolute top-48 -right-3 w-6 h-6 bg-darkBackground-900 rounded-full border-l border-white/10 z-10" style={{ transform: booking.event?.image ? "" : "translateY(-140px)" }}></div>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

export default DefaultlayoutHoc(MyBookingsPage);
