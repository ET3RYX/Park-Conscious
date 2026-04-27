import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import EventHero from "../components/EventHero/EventHero.Component";
import BookingModal from "../components/Booking/BookingModal.jsx";
import { Info, MapPin, Share2, ShieldCheck, Ticket, CreditCard, Play, X, ZoomIn } from "lucide-react";

/**
 * Inject Cloudinary transformations into a Cloudinary URL.
 * For images: q_auto (auto quality) + f_auto (WebP/AVIF where supported)
 * For videos:  q_auto + f_auto + vc_auto (best codec: VP9/H.265)
 * Falls back to the original URL for non-Cloudinary assets.
 */
const clUrl = (url, type = 'image') => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const transforms = type === 'video'
    ? 'q_auto,f_auto,vc_auto'
    : 'q_auto,f_auto';
  return url.replace('/upload/', `/upload/${transforms}/`);
};

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { url, type }
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
          displayCapacity: data.capacity || 0,
          displayGallery: Array.isArray(data.mediaGallery) ? data.mediaGallery : []
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
      <div className="bg-[#050507] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="bg-[#050507] min-h-screen text-white pb-24 relative">
      <EventHero event={event} onOpenBooking={() => setIsBookingOpen(true)} />

      <div className="container mx-auto px-6 md:px-8 lg:px-24 mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24 relative z-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-24">
          {event.displayDescription && (
            <section className="space-y-10">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Event Details</h2>
              <p className="text-slate-400 text-xl leading-relaxed font-medium max-w-2xl whitespace-pre-wrap">
                {event.displayDescription}
              </p>
            </section>
          )}

          {/* Media Gallery */}
          {event.displayGallery.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Photos &amp; Videos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {event.displayGallery.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-2xl overflow-hidden border border-white/5 bg-white/5 cursor-pointer hover:border-indigo-500/30 transition-all duration-300"
                    onClick={() => item.type !== 'video' && setLightbox(item)}
                  >
                    {item.type === 'video' ? (
                      <video
                        src={clUrl(item.url, 'video')}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <>
                        <img
                          src={clUrl(item.url, 'image')}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-xl" />
                        </div>
                      </>
                    )}
                    {item.type === 'video' && (
                      <span className="absolute top-3 left-3 bg-black/60 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                        <Play size={8} fill="white" /> Video
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500 border-b border-white/5 pb-4">Venue & Location</h2>
            <div className="bg-white/5 border border-white/5 rounded-2xl px-8 py-6 flex items-center gap-6 hover:bg-white/[0.07] transition-all duration-500">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                <MapPin className="text-indigo-400" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-white uppercase tracking-tight truncate">{event.displayLocation}</h3>
                <p className="text-slate-500 font-medium text-sm mt-0.5 truncate">{event.displayAddress || "NCR Corridor, India"}</p>
              </div>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 whitespace-nowrap flex-shrink-0">Verified</span>
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-12">
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 sticky top-32 backdrop-blur-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-12 text-slate-500 text-center">Booking Information</h3>

            <div className="space-y-12">
              <div>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-4">Ticket Availability</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-white tracking-tighter uppercase italic">{event.displayCapacity || "OPEN"}</span>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Capacity</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 overflow-hidden">
                  <div className="bg-white h-full w-full opacity-10" />
                </div>
              </div>

              <div className="pt-8 space-y-6">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert("Experience link secured to clipboard");
                  }}
                  className="w-full flex items-center justify-between px-8 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white text-white hover:text-black transition-all group font-black uppercase tracking-[0.2em] text-[10px]"
                >
                  <span>Share Event Link</span>
                  <Share2 size={14} className="group-hover:rotate-12 transition" />
                </button>

                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-white text-black rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-95 group font-black uppercase tracking-[0.3em] text-[11px]"
                >
                  <Ticket size={20} className="group-hover:scale-110 transition" />
                  {event.displayPrice > 0 ? "Buy Tickets" : "Book Now"}
                </button>

                <p className="text-center text-[9px] text-slate-700 font-black uppercase leading-[1.8] tracking-[0.3em] opacity-80 pt-4">
                  Guaranteed Entry • Non-Refundable Policy • Valid ID Required
                </p>
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

      {/* Lightbox Overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white transition bg-white/10 p-3 rounded-full"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <img
            src={clUrl(lightbox.url, 'image')}
            alt="Gallery"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default DefaultlayoutHoc(EventPage);
