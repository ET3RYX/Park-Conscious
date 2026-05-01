import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";
import BookingModal from "../components/Booking/BookingModal.jsx";
import { 
  MapPin, Ticket, X, 
  Calendar, Clock, Users, ArrowUpRight, Share2
} from "lucide-react";

/**
 * Inject Cloudinary transformations into a Cloudinary URL.
 */
const clUrl = (url, type = 'image') => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const transforms = type === 'video' ? 'q_auto,f_auto,vc_auto' : 'q_auto,f_auto';
  return url.replace('/upload/', `/upload/${transforms}/`);
};

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const { data } = await backendAxios.get(`/api/events/${id}`);

        const normalized = {
          ...data,
          displayTitle: data.title || data.name || "Untitled",
          displayDate: data.date || data.createdAt,
          displayLocation: data.location?.name || data.locationName || data.venue || "TBA",
          displayAddress: data.location?.address || data.locationAddress || "",
          displayDescription: data.description || "",
          hosts: Array.isArray(data.hosts) ? data.hosts : [],
          ticketTiers: Array.isArray(data.ticketTiers) ? data.ticketTiers : [],
          mediaGallery: Array.isArray(data.mediaGallery) ? data.mediaGallery : []
        };

        setEvent(normalized);
        if (normalized.ticketTiers.length > 0) {
          setSelectedTier(normalized.ticketTiers[0]);
        }
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

  if (loading || !event) {
    return <div className="bg-[#050507] min-h-screen" />;
  }

  const dateObj = new Date(event.displayDate);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  
  // Format the time display: Use user-defined startTime or fallback to Date object
  const timeStr = event.startTime 
    ? (() => {
        const [h, m] = event.startTime.split(':');
        const hours = parseInt(h);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${h12}:${m} ${suffix}`;
      })()
    : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const hostsList = Array.isArray(event.hosts) ? event.hosts : [];

  return (
    <div className="bg-[#050507] min-h-screen text-white font-['Inter'] pb-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-32 pt-24 lg:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Poster & Action */}
          <div className="lg:col-span-5 space-y-12">
            <div className="sticky top-12 space-y-12">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <img 
                  src={clUrl(event.images?.[0] || event.image)} 
                  className="w-full object-cover" 
                  alt={event.displayTitle}
                />
              </div>

              {/* Booking Information Card */}
              <div className="bg-[#0A0A0C] border border-white/5 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                <div className="text-center">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Booking Information</h3>
                </div>

                <div className="space-y-4 px-2">
                  {event.ticketTiers && event.ticketTiers.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Select Ticket Tier</p>
                      <div className="space-y-3">
                        {event.ticketTiers.map((tier, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTier(tier)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                              selectedTier?.name === tier.name 
                                ? 'bg-[#6366f1]/10 border-[#6366f1] shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' 
                                : 'bg-white/5 border-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="text-left">
                              <p className="text-sm font-bold text-white">{tier.name}</p>
                              {tier.description && <p className="text-[10px] text-slate-500 mt-1">{tier.description}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-['Outfit'] font-bold text-white">₹{tier.price}</p>
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{tier.capacity} Slots</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Ticket Availability</p>
                      <div className="flex items-baseline justify-between border-b border-white/5 pb-6">
                        <span className="text-5xl font-bold font-['Outfit'] leading-none text-white">{event.capacity || 0}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Global Capacity</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      const label = document.getElementById('share-label-left');
                      if(label) label.innerText = "COPIED!";
                      setTimeout(() => { if(label) label.innerText = "SHARE EVENT LINK"; }, 2000);
                    }}
                    className="w-full py-5 rounded-3xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
                  >
                    <span id="share-label-left">Share Event Link</span>
                    <Share2 size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                  </button>

                  <button 
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full py-5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)]"
                  >
                    <Ticket size={18} />
                    <span>Book Now</span>
                  </button>
                </div>

                <p className="text-center text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto">
                  Guaranteed Entry • Non-Refundable Policy • Valid ID Required
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Presented By</h3>
                <div className="space-y-5">
                  {hostsList.length > 0 ? hostsList.map((host, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 overflow-hidden flex-shrink-0">
                        {host.image ? (
                          <img src={clUrl(host.image)} className="w-full h-full object-cover" alt={host.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-medium bg-white/5 text-white">{host.name?.[0]}</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{host.name}</p>
                        <p className="text-[10px] text-slate-500">{host.role}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="flex items-center gap-4 opacity-50">
                      <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <p className="text-sm font-medium text-white">Backstage Events Official</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-7 space-y-16">
            <div className="space-y-10">
              <h1 className="text-5xl md:text-7xl font-['Outfit'] font-bold tracking-tight">
                {event.displayTitle}
              </h1>
              
              {/* Logistics Refinement */}
              <div className="space-y-10">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden shadow-xl">
                    <div className="bg-[#6366f1] w-full py-1 text-center">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white">{monthName}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{dayNum}</span>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <h4 className="text-lg font-semibold text-white tracking-tight">{dayName}, {monthName} {dayNum}</h4>
                    <p className="text-sm text-slate-500 font-medium">{timeStr} GMT+5:30</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
                    <MapPin size={24} className="text-[#6366f1]" />
                  </div>
                  <div className="space-y-1 pt-1">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.displayLocation)}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-lg font-semibold text-white hover:text-[#6366f1] transition-all group"
                    >
                        {event.location?.name || event.venue || "NCR"}
                        <ArrowUpRight size={16} className="text-slate-600 group-hover:text-[#6366f1] transition-colors" />
                    </a>
                    <p className="text-sm text-slate-500 font-medium">{event.displayLocation}</p>
                  </div>
                </div>
              </div>

              {/* About Section moved up */}
              <div className="space-y-6 pt-12 border-t border-white/5">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">About the Experience</h3>
                <p className="text-slate-300 leading-relaxed text-xl font-medium whitespace-pre-wrap">
                  {event.displayDescription || "No detailed description provided."}
                </p>
              </div>

              {/* Media Gallery Section */}
              {event.mediaGallery && event.mediaGallery.length > 0 && (
                <div className="space-y-6 pt-12 border-t border-white/5">
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Experience Gallery</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {event.mediaGallery.map((item, idx) => (
                      <div key={idx} className="relative rounded-3xl overflow-hidden border border-white/5 bg-white/5 aspect-video group shadow-2xl">
                        {item.type === 'video' ? (
                          <video 
                            src={clUrl(item.url, 'video')} 
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img 
                            src={clUrl(item.url)} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={`Gallery item ${idx + 1}`} 
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/80">View Full {item.type === 'video' ? 'Video' : 'Image'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        setIsOpen={setIsBookingOpen}
        event={{...event, selectedTier}}
      />
    </div>
  );
};

export default DefaultlayoutHoc(EventPage);
