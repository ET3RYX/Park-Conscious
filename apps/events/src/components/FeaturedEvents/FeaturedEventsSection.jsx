import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from 'lucide-react';

const colorStyles = {
    "red-600":    { border: "group-hover:border-red-600/30",     mesh: "bg-red-600/10",     label: "bg-red-600",     btn: "hover:bg-red-600" },
    "indigo-500": { border: "group-hover:border-indigo-500/30",  mesh: "bg-indigo-500/10",  label: "bg-indigo-600",  btn: "hover:bg-indigo-600" },
    "violet-500": { border: "group-hover:border-violet-500/30",  mesh: "bg-violet-500/10",  label: "bg-violet-600",  btn: "hover:bg-violet-600" },
    "rose-500":   { border: "group-hover:border-rose-500/30",    mesh: "bg-rose-500/10",    label: "bg-rose-600",    btn: "hover:bg-rose-600" },
    "amber-500":  { border: "group-hover:border-amber-500/30",   mesh: "bg-amber-500/10",   label: "bg-amber-600",   btn: "hover:bg-amber-600" },
    "emerald-500":{ border: "group-hover:border-emerald-500/30", mesh: "bg-emerald-500/10", label: "bg-emerald-600", btn: "hover:bg-emerald-600" },
    "sky-500":    { border: "group-hover:border-sky-500/30",     mesh: "bg-sky-500/10",     label: "bg-sky-600",     btn: "hover:bg-sky-600" },
    "pink-500":   { border: "group-hover:border-pink-500/30",    mesh: "bg-pink-500/10",    label: "bg-pink-600",    btn: "hover:bg-pink-600" },
    "orange-500": { border: "group-hover:border-orange-500/30",  mesh: "bg-orange-500/10",  label: "bg-orange-600",  btn: "hover:bg-orange-600" },
    "default":    { border: "group-hover:border-indigo-500/30",  mesh: "bg-indigo-500/10",  label: "bg-indigo-600",  btn: "hover:bg-indigo-600" },
};

const SkeletonFeaturedEvent = () => (
  <div className="group relative h-[32rem] rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 flex items-end p-10 md:p-14 animate-pulse">
    <div className="absolute inset-0 bg-slate-800/20"></div>
    <div className="relative z-20 space-y-6 w-full">
      <div className="flex items-center gap-3">
        <div className="w-24 h-6 bg-slate-800 rounded-full"></div>
        <div className="w-32 h-4 bg-slate-800 rounded"></div>
      </div>
      <div>
        <div className="w-3/4 h-12 md:h-16 bg-slate-800 rounded-xl mb-4"></div>
        <div className="w-1/2 h-4 md:h-5 bg-slate-800 rounded"></div>
      </div>
      <div className="w-40 h-10 bg-slate-800 rounded-full"></div>
    </div>
  </div>
);

const FeaturedEventsSection = ({ featuredEvents, isLoading }) => {
    const navigate = useNavigate();
    
    if (isLoading) {
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <SkeletonFeaturedEvent />
            <SkeletonFeaturedEvent />
          </div>
        );
    }

    if (!featuredEvents || featuredEvents.length === 0) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {featuredEvents.map((event) => {
          const styles = colorStyles[event.accentColor] || colorStyles["default"];
          const imageUrl = (event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';
          
          return (
            <div 
              key={event._id}
              onClick={() => navigate(`/event/${event._id}`)}
              className="group relative h-[32rem] md:h-[40rem] rounded-[3rem] overflow-hidden cursor-pointer bg-[#0A0A0C] border border-white/5 transition-all duration-700 hover:border-white/10"
            >
              {/* Image Section - Top Half/Full Background */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={imageUrl} 
                  alt={event.title} 
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[3s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/40 to-transparent z-10"></div>
              </div>
              
              {/* Subtle Mesh Glow */}
              <div className={`absolute -top-[20%] -right-[20%] w-[60%] h-[60%] blur-[120px] rounded-full transition-opacity duration-1000 group-hover:opacity-100 opacity-50 z-10 ${styles.mesh}`}></div>

              {/* Content Overlay */}
              <div className="absolute inset-0 z-20 p-8 md:p-12 flex flex-col justify-between">
                {/* Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-6 px-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">
                        {event.featuredLabel || 'Featured'}
                      </span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">{event.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 py-1 px-3 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
                    <Calendar size={10} className="text-white/40" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                      {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}
                    </span>
                  </div>
                </div>

                {/* Bottom Content Area */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.85] transition-all">
                      {event.featuredTitle || event.title}
                    </h2>
                    <p className="text-slate-400 text-xs md:text-sm font-medium max-w-md line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      {event.featuredSubtitle || event.description}
                    </p>
                  </div>

                  <div className="flex items-end justify-between">
                    <button 
                      className={`flex items-center gap-6 bg-white text-black pl-8 pr-2 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 hover:scale-105 active:scale-95 group/btn ${styles.btn} hover:text-white`}
                    >
                       Experience Now
                       <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center transition-all duration-300 group-hover/btn:bg-white group-hover/btn:text-black group-hover/btn:rotate-[-45deg]">
                          <ArrowRight size={16} />
                       </div>
                    </button>
                    
                    <div className="text-right">
                       <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Passes From</p>
                       <div className="flex items-baseline gap-1">
                          <span className="text-white/40 text-sm font-bold">₹</span>
                          <span className="text-white text-4xl font-black tracking-tighter">{event.price || 'FREE'}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
};

export default FeaturedEventsSection;
