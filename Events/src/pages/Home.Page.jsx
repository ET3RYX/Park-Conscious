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
  "You plan the night. We plan the parking.",
  "Your destination: Front Row. Your parking: Sorted.",
  "No more circling. Just driving in.",
  "Urban life moves fast. Parking should too.",
  "Arrive with zero anxiety. Park with absolute precision.",
  "The hardest part of the drive is now the easiest.",
];

const categories = ["All Events", "Concerts", "Festivals", "Summits", "Culture"];

const FeaturedEventsSection = () => {
    const navigate = useNavigate();
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* TEDx SANGAM - Editorial Layout */}
        <div 
          onClick={() => navigate("/tedx-tickets")}
          className="group relative h-[32rem] rounded-[3rem] overflow-hidden cursor-pointer shadow-3xl bg-slate-900 border border-white/5 flex items-end p-10 md:p-14 hover:border-red-600/30 transition-all duration-700"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
          
          {/* Animated Background Mesh */}
          <div className="absolute top-0 right-0 w-full h-full bg-red-600/5 blur-[120px] group-hover:scale-150 transition-transform duration-[2s]"></div>
          
          <div className="relative z-20 space-y-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
             <div className="flex items-center gap-3">
                <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">LIVE • Free Entry</span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">SANGAM '26</span>
             </div>
             <div>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-4">TEDx<br/><span className="text-red-600">GGSIPU</span></h2>
                <p className="text-slate-400 text-sm md:text-base font-medium max-w-sm">Where ideas, perspectives, and voices converge to shape the future.</p>
             </div>
             <button className="flex items-center gap-4 bg-white text-black pl-8 pr-2 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all group/btn">
                Reserve Seat 
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-colors">
                   <ArrowRight size={16} />
                </div>
             </button>
          </div>
        </div>
  
        {/* AFSANA '24 - Premium Editorial Layout */}
        <div 
          onClick={() => navigate("/afsana-tickets")}
          className="group relative h-[32rem] rounded-[3rem] overflow-hidden cursor-pointer shadow-3xl bg-[#0a0410] border border-white/5 flex items-end p-10 md:p-14 hover:border-indigo-500/30 transition-all duration-700"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-[#0a0410]/40 to-transparent z-10"></div>
          
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
          
          <div className="relative z-20 space-y-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
             <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Farewell • May 25</span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Memories Live Forever</span>
             </div>
             <div>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-4 italic">AFSANA<br/><span className="text-indigo-500">'26</span></h2>
                <p className="text-slate-400 text-sm md:text-base font-medium max-w-sm italic">The final chapter of an era. One night of pure celebration and farewells.</p>
             </div>
             <button className="flex items-center gap-4 bg-indigo-600 text-white pl-8 pr-2 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all group/btn">
                Book Tickets 
                <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center group-hover/btn:bg-indigo-600 group-hover/btn:text-white transition-colors">
                   <ArrowRight size={16} />
                </div>
             </button>
          </div>
        </div>
      </div>
    );
  };

const HomePage = () => {
    const navigate = useNavigate();
    const [premierMovies, setpremierMovies] = useState([]);
    const [currentAd, setCurrentAd] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("All Events");
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % adCopies.length);
      }, 7000);
      return () => clearInterval(interval);
    }, []);
  
    useEffect(() => {
      const fetchCurrentEvents = async () => {
        try {
          const { data } = await backendAxios.get(`${API_BASE_URL}/api/events`);
          const mappedEvents = data.map(event => ({
              ...event,
              original_title: event.title || event.name || 'Untitled Event',
              poster_path: (event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14',
              backdrop_path: (event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'
          }));
          setpremierMovies(mappedEvents);
        } catch (err) {
          console.error("Failed to fetch events:", err);
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
        <div className="w-full relative py-32 md:py-48 flex flex-col items-center overflow-hidden">
           {/* Abstract Ribbon SVG */}
           <svg 
             className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-80 animate-pulse" 
             style={{ animationDuration: '8s' }}
             viewBox="0 0 1440 600" 
             fill="none" 
             xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="xMidYMid slice"
           >
             <path 
               d="M -50 450 C 150 500, 600 650, 600 300 C 600 -50, 250 -50, 250 300 C 250 650, 1000 400, 1550 100" 
               stroke="#6366f1" 
               strokeWidth="5" 
               strokeLinecap="round" 
               style={{ filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.8))' }}
             />
           </svg>

           {/* Moving Mesh Glows */}
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-mesh pointer-events-none z-0"></div>
           <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-mesh pointer-events-none z-0" style={{ animationDelay: '-5s' }}></div>
           
           <div className="container mx-auto px-6 text-center relative z-10">
              <div className="flex flex-col items-center">
                 <h1 className="text-7xl sm:text-8xl md:text-[10rem] lg:text-[14rem] font-black uppercase tracking-tighter leading-[0.85] md:leading-[0.75] m-0 p-0 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none animate-reveal" style={{ animationDelay: '0.1s' }}>
                    DON'T MISS
                 </h1>
                 <h1 className="text-7xl sm:text-8xl md:text-[10rem] lg:text-[14rem] font-black uppercase tracking-tighter leading-[0.85] md:leading-[0.75] m-0 p-0 text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-800/20 select-none pb-4 animate-reveal -mt-1 sm:-mt-2 md:-mt-4" style={{ animationDelay: '0.3s' }}>
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
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-12 px-6">
                   <p className="text-black font-black text-xs uppercase tracking-widest leading-none mt-1">Limited Parking Reserve Live</p>
                   <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                   <p className="text-black font-medium text-xs uppercase tracking-widest leading-none mt-1">{adCopies[i % adCopies.length]}</p>
                   <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </div>
              ))}
           </div>
        </div>
  
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
          <FeaturedEventsSection />
        </div>
  
        {/* Precision Grid Section */}
        <div id="event-grid" className="container mx-auto px-6 md:px-12 my-24 scroll-mt-24">
          <PosterSlider
            title={selectedCategory === "All Events" ? "Upcoming Events" : `FILTERED: ${selectedCategory}`}
            subtitle={selectedCategory === "All Events" ? "Authentic experiences powered by BACKSTAGE" : `Now viewing curated highlights for ${selectedCategory}`}
            posters={filteredEvents}
            isDark={true}
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
