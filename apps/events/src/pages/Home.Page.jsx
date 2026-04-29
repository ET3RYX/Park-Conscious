import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { tmdbAxios, backendAxios } from "../axios";
import { API_BASE_URL } from "../config";
import { Helmet } from "react-helmet";
import { ArrowRight, Play, Star, Calendar, MapPin, Zap } from 'lucide-react';

// HOC
import DefaultlayoutHoc from "../layout/Default.layout";

// Components
import PosterSlider from "../components/PosterSlider/PosterSlider.Component";
import DiscussionBoard from "../components/Discussion/DiscussionBoard";

const adCopies = [
  "You made the plan. Backstage made it work.",
  "The event starts at 7. You’re already ahead.",
  "Others are figuring it out. You’re already in.",
  "Good plans need better execution.",
  "You showed up. Backstage handled the rest.",
  "Not everything has to be last minute.",
  "You’re not late. You’re just early now.",
  "The plan felt chaotic. Now it doesn’t.",
  "Less guessing. More doing.",
  "You knew where to go. We handled how.",
  "Every plan feels better with Backstage.",
  "No stress. Just timing.",
  "You’re exactly where you need to be.",
  "Plans don’t fail. Execution does.",
  "This time, everything just clicked.",
  "You didn’t rush. You just used Backstage.",
  "From ‘maybe’ to ‘done.’",
  "You planned it. We made it smooth.",
  "No chaos. Just control.",
  "The difference? Backstage.",
  "You’re not figuring it out anymore.",
  "Smart plans feel effortless.",
  "You’re not behind. You’re prepared.",
  "No friction. Just flow.",
  "Because plans deserve better.",
  "You arrived without the stress.",
  "Everything worked. That’s not luck.",
  "This is how plans should feel.",
  "You didn’t improvise. You executed.",
  "Backstage → where plans actually happen.",
  "Before things get messy, Backstage steps in.",
  "You focus on the plan. We handle the rest."
];

const categories = ["All Events", "Concerts", "Festivals", "Summits", "Culture"];

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
    
    if (!featuredEvents || featuredEvents.length === 0) return null;

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

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {isLoading ? (
          <>
            <SkeletonFeaturedEvent />
            <SkeletonFeaturedEvent />
          </>
        ) : featuredEvents.map((event) => {
          const styles = colorStyles[event.accentColor] || colorStyles["default"];
          const imageUrl = (event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14';
          
          return (
            <div 
              key={event._id}
              onClick={() => navigate(`/event/${event._id}`)}
              className={`group relative h-[28rem] md:h-[32rem] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden cursor-pointer shadow-3xl bg-slate-900 border border-white/5 flex items-end p-8 md:p-14 transition-all duration-700 ${styles.border}`}
            >
              {/* Background Image with Parallax-like effect on hover */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={imageUrl} 
                  alt={event.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent z-10"></div>
              </div>
              
              {/* Animated Background Mesh */}
              <div className={`absolute top-0 right-0 w-full h-full blur-[120px] group-hover:scale-150 transition-transform duration-[2s] z-10 ${styles.mesh}`}></div>
              
              <div className="relative z-20 space-y-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className={`text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${styles.label}`}>
                         {event.featuredLabel || 'Featured Event'}
                       </span>
                       <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">{event.category || 'Special Experience'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/40">
                       <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span className="text-[8px] font-black uppercase tracking-widest">{event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          <span className="text-[8px] font-black uppercase tracking-widest truncate max-w-[60px]">{event.location?.name || event.venue || 'NCR'}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.85] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all">
                      {event.featuredTitle || event.title}
                    </h2>
                    <p className="text-slate-400 text-xs md:text-sm font-medium max-w-sm line-clamp-2 leading-relaxed">
                      {event.featuredSubtitle || event.description}
                    </p>
                 </div>

                 <div className="flex items-center justify-between pt-2">
                    <button className={`flex items-center gap-4 bg-white text-black pl-8 pr-2 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all group/btn ${styles.btn} hover:text-white`}>
                       View Details 
                       <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-colors">
                          <ArrowRight size={16} />
                       </div>
                    </button>
                    
                    <div className="text-right">
                       <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Starts From</p>
                       <p className="text-white text-xl font-black tracking-tighter italic">₹{event.price || 'FREE'}</p>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

const HomePage = () => {
    const navigate = useNavigate();
    const [premierMovies, setpremierMovies] = useState(() => {
        const cached = localStorage.getItem('__cached_events__');
        return cached ? JSON.parse(cached) : [];
    });
    const [featuredEvents, setFeaturedEvents] = useState(() => {
        const cached = localStorage.getItem('__cached_featured_events__');
        return cached ? JSON.parse(cached) : [];
    });
    const [isInitialLoading, setIsInitialLoading] = useState(() => {
        return !localStorage.getItem('__cached_events__');
    });
    const [currentAd, setCurrentAd] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("All Events");
    const [missingConfig, setMissingConfig] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % adCopies.length);
      }, 7000);
      return () => clearInterval(interval);
    }, []);
  
    useEffect(() => {
      const fetchCurrentEvents = async () => {
        try {
          const { data } = await backendAxios.get(`/api/events`);
          
          if (data && data.missingConfig) {
             setMissingConfig(true);
             return;
          }

          const mappedEvents = data.map(event => ({
              ...event,
              original_title: event.title || event.name || 'Untitled Event',
              poster_path: (event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14',
              backdrop_path: (event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'
          }));
          setpremierMovies(mappedEvents);
          localStorage.setItem('__cached_events__', JSON.stringify(mappedEvents));
          
          // Fetch Featured Events separately
          const { data: featuredData } = await backendAxios.get(`/api/events?featured=true`);
          if (Array.isArray(featuredData)) {
              setFeaturedEvents(featuredData);
              localStorage.setItem('__cached_featured_events__', JSON.stringify(featuredData));
          }
        } catch (err) {
          console.error("Failed to fetch events:", err);
        } finally {
          setIsInitialLoading(false);
        }
      };
      fetchCurrentEvents();
    }, []);
  
    const filteredEvents = useMemo(() => {
      if (selectedCategory === "All Events") return premierMovies;
      return premierMovies.filter(event => {
          if (!event.category) return false;
          const catStr = Array.isArray(event.category) ? event.category.join(' ').toLowerCase() : String(event.category).toLowerCase();
          return catStr.includes(selectedCategory.toLowerCase());
      });
    }, [selectedCategory, premierMovies]);
  
    return (
      <div className="bg-[#050507] min-h-screen text-white pb-24 w-full selection:bg-indigo-500/30">
        {/* Dynamic Editorial Hero */}
        <div className="w-full relative py-32 md:py-48 flex flex-col items-center overflow-hidden isolation-isolate">
           {/* Abstract Ribbon SVG - Layered behind text */}
           <svg 
             className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-50 animate-pulse" 
             style={{ animationDuration: '10s' }}
             viewBox="0 0 1440 600" 
             fill="none" 
             xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="xMidYMid slice"
           >
             <path 
               d="M-50,600 C 150,600 350,550 400,400 C 450,200 200,150 150,350 C 100,550 400,650 700,500 C 1000,350 1300,150 1540,200" 
               stroke="#6366f1" 
               strokeWidth="6" 
               strokeLinecap="round" 
               style={{ filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.5))' }}
             />
           </svg>

           {/* Moving Mesh Glows */}
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-mesh pointer-events-none z-0"></div>
           <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-mesh pointer-events-none z-0" style={{ animationDelay: '-5s' }}></div>
           
           <div className="container mx-auto px-6 text-center relative z-10">
              <div className="flex flex-col items-center">
                 <h1 className="text-7xl sm:text-8xl md:text-[10rem] lg:text-[14rem] font-black uppercase tracking-tighter leading-[0.85] md:leading-[0.75] m-0 p-0 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none animate-reveal pr-2 md:pr-4" style={{ animationDelay: '0.1s' }}>
                    DON'T MISS
                 </h1>
                 <h1 className="text-7xl sm:text-8xl md:text-[10rem] lg:text-[14rem] font-black uppercase tracking-tighter leading-[0.85] md:leading-[0.75] m-0 p-0 text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-800/20 select-none pb-4 animate-reveal -mt-1 sm:-mt-2 md:-mt-4 pr-2 md:pr-4" style={{ animationDelay: '0.3s' }}>
                    THE VIBE.
                 </h1>
              </div>

              <div className="mt-8 md:mt-12 max-w-xl mx-auto space-y-12 animate-reveal" style={{ animationDelay: '0.6s' }}>
                 <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed uppercase tracking-[0.4em] text-[9px] md:text-[11px]">
                    Curated experiences across Delhi NCR. Pre-booked parking included.
                 </p>
                 <div className="flex items-center justify-center">
                    <button 
                      onClick={() => document.getElementById('event-grid').scrollIntoView({ behavior: 'smooth' })}
                      className="group relative px-12 py-4 bg-white text-black rounded-full font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                       Explore Experiences
                       <div className="absolute -inset-1 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                 </div>
              </div>
           </div>
        </div>
  
        {/* Static Marquee Banner (Low Weight) */}
        <div className="w-full h-16 bg-white overflow-hidden flex items-center relative z-20">
           <div className="flex animate-marquee whitespace-nowrap items-center h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex items-center gap-12 px-12">
                   <p className="text-black font-black text-[10px] uppercase tracking-[0.4em] leading-none mt-1">{adCopies[i % adCopies.length]}</p>
                   <div className="w-1.5 h-1.5 bg-black/10 rounded-full"></div>
                </div>
              ))}
           </div>
        </div>

        {/* Missing Config Banner */}
        {missingConfig && (
          <div className="container mx-auto px-6 mt-16 relative z-30">
             <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto backdrop-blur-md">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Zap size={32} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-amber-500 uppercase tracking-tight mb-4">Deployment Successful!</h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                   The frontend application is running perfectly. However, it looks like you haven't connected a database yet.
                </p>
                <div className="mt-8 inline-block bg-black/40 px-6 py-4 rounded-2xl border border-white/5 text-left w-full">
                   <p className="text-xs font-mono text-slate-400 mb-2">// To fix this, add the following to your .env</p>
                   <p className="text-sm font-mono text-emerald-400">MONGODB_URI="your_mongodb_connection_string"</p>
                </div>
             </div>
          </div>
        )}
  
        {/* Editorial Category Tabs */}
        <div className="container mx-auto px-6 mt-32 mb-16 relative z-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-start md:justify-center gap-8 md:gap-12 min-w-max pb-4">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${
                  selectedCategory === cat ? "text-white" : "text-slate-500 hover:text-slate-400"
                }`}
              >
                {cat}
                {selectedCategory === cat && (
                   <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full animate-in fade-in slide-in-from-left-2 duration-300"></span>
                )}
              </button>
            ))}
          </div>
        </div>
  
        {/* Featured Editorial Posters */}
        <div className="container mx-auto px-6 md:px-12 mb-32">
          <div className="flex items-center justify-between mb-12">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Handpicked Experiences</p>
             <div className="h-px flex-1 bg-white/5 mx-8"></div>
          </div>
          <FeaturedEventsSection featuredEvents={featuredEvents} />
        </div>
  
        {/* Precision Grid Section */}
        <div id="event-grid" className="container mx-auto px-6 md:px-12 my-24 scroll-mt-24">
          <PosterSlider
            title={selectedCategory === "All Events" ? "Upcoming Events" : `FILTERED: ${selectedCategory}`}
            subtitle={selectedCategory === "All Events" ? "Authentic experiences powered by BACKSTAGE" : `Now viewing curated highlights for ${selectedCategory}`}
            posters={filteredEvents}
            isDark={true}
            isLoading={isInitialLoading}
          />
        </div>
        {/* Discussion Overhaul */}
        <div className="container mx-auto px-6 md:px-12 mt-32">
          <div className="mb-8">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Community Consensus</p>
             <h3 className="text-4xl font-black uppercase tracking-tighter">Event Threads</h3>
          </div>
          <div className="bg-[#111116] border border-white/5 rounded-[3rem] p-8 md:p-14 shadow-3xl">
            <DiscussionBoard />
          </div>
        </div>
      </div>
    );
  };
  
export default DefaultlayoutHoc(HomePage);
