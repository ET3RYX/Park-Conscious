import React from "react";
import { Link } from "react-router-dom";
import { User, Calendar, MapPin, Plus } from 'lucide-react';

const Poster = (props) => {
  const isFeatured = props.isFeatured || false;
  
  return (
    <Link to={`/event/${props._id || props.id}`} className="group block h-full">
      <div className="relative flex flex-col h-full bg-[#0D0D12] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 shadow-xl hover:shadow-indigo-500/10">
        
        {/* Main Visual Container */}
        <div className="relative aspect-[3/4] md:aspect-[4/5] w-full overflow-hidden bg-slate-900">
           <img
             src={props.poster_path?.startsWith('http') ? props.poster_path : `https://image.tmdb.org/t/p/original${props.poster_path}`}
             alt={props.original_title}
             className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
           />
           
           {/* Editorial Overlay Labels */}
           <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-20">
              <span className="bg-white text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">₹{props.price || props.displayPrice || 0}</span>
              <span className="bg-black/40 backdrop-blur-md text-white/60 px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest border border-white/10">Active Event</span>
           </div>

           {/* Mobile View Indicator - Bottom Center */}
           <div className="absolute bottom-6 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              <div className="bg-indigo-600 text-white px-6 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-2xl">
                 Explore 
                 <Plus size={10} />
              </div>
           </div>
        </div>

        {/* Content Details */}
        <div className="p-8 md:p-10 space-y-4 flex-1 flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                 <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em]">{props.category || "General Admission"}</p>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">
                {props.original_title}
              </h3>
           </div>

           <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 text-slate-400 font-medium text-xs">
                 <Calendar size={14} className="text-indigo-500" />
                 <span>{props.date || "TBA"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-medium text-[10px] uppercase tracking-widest">
                 <MapPin size={14} className="text-indigo-500" />
                 <span className="truncate">{props.location?.name || props.venue || "Delhi NCR"}</span>
              </div>
           </div>
        </div>

      </div>
    </Link>
  );
};

export default Poster;
