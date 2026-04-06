import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { tmdbAxios, backendAxios } from "../axios";
import { API_BASE_URL } from "../config";
import { Helmet } from "react-helmet";

// HOC
import DefaultlayoutHoc from "../layout/Default.layout";

// Components
import PosterSlider from "../components/PosterSlider/PosterSlider.Component";
import DiscussionBoard from "../components/Discussion/DiscussionBoard";

const adCopies = [
  "You planned the day. Parking planned chaos.",
  "Your destination is 200m away. Parking is 2 km away.",
  "Leaving on time doesn't help if parking doesn't exist.",
  "You found the place. Now find the parking.",
  "Maps show the location. Not the parking struggle.",
  "Your car deserves a spot too.",
  "The hardest part of your drive shouldn't be the last 5 minutes.",
  "You reached early. Parking didn’t.",
  "The meeting starts at 10. Parking search starts at 9:30.",
  "You saved time on the route. Lost it in parking.",
  "Driving is easy. Parking is the real challenge.",
  "The closer you get, the harder it gets.",
  "Every trip ends the same way: ‘Where do I park?’",
  "Good plans fail at parking.",
  "You drove smoothly. Now comes the struggle.",
  "Circling is not a strategy.",
  "One destination. Infinite parking loops.",
  "You’re not stuck in traffic. You’re stuck finding parking.",
  "Round and round… still no spot.",
  "If driving was the journey, parking is the boss level.",
  "Parking shouldn't depend on luck.",
  "Hope is not a parking strategy.",
  "Finding parking shouldn’t feel like winning a lottery.",
  "Less guessing. More parking.",
  "You have somewhere to be. Parking shouldn't stop you.",
  "The city is moving. Parking isn’t.",
  "Urban life moves fast. Parking doesn’t.",
  "Modern cities deserve smarter parking.",
  "You bring the destination. We bring the parking.",
  "Drive in. Park easy.",
  "Find parking before parking finds you stressed.",
  "Arrive without the parking anxiety."
];

const categories = ["All Events", "Concerts", "Festivals", "Summits", "Culture"];

const FeaturedEventsSection = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* TEDx SANGAM Card */}
      <div
        onClick={() => navigate("/tedx-tickets")}
        className="group relative w-full h-48 md:h-64 rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl transition-transform duration-500 hover:scale-[1.02] bg-gradient-to-tr from-[#2a0808] via-[#1a0505] to-[#0a0000] border border-red-600/20 flex items-center"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-800/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 px-8 w-full">
          <div className="bg-red-700/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-3 tracking-widest uppercase border border-red-500/20">Featured • Free Entry</div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-1">TEDx GGSIPU EDC</h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium">Theme: SANGAM — Ideas Converge</p>
          <button className="mt-5 bg-white text-black px-5 py-2 rounded-full font-bold text-xs hover:bg-red-600 hover:text-white transition-colors uppercase tracking-wider">Get Tickets</button>
        </div>
      </div>

      {/* Afsana '26 Card */}
      <div
        onClick={() => navigate("/afsana-tickets")}
        className="group relative w-full h-48 md:h-64 rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl transition-transform duration-500 hover:scale-[1.02] bg-gradient-to-tr from-[#0a0410] via-[#1a0b2e] to-[#2d0f54] border border-vibrantBlue/20 flex items-center"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-vibrantBlue/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-premier-500/15 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 px-8 w-full">
          <div className="bg-vibrantBlue/20 backdrop-blur-sm text-vibrantBlue text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-3 tracking-widest uppercase border border-vibrantBlue/20">Farewell • May 25</div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-1">AFSANA '26</h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium">The Grand Finale — Red Carpet • DJ • Dinner</p>
          <button className="mt-5 bg-vibrantBlue text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-indigo-500 transition-colors uppercase tracking-wider">Book Tickets</button>
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
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCurrentEvents = async () => {
      try {
        const { data } = await backendAxios.get(`${API_BASE_URL}/api/events`);
        // Mapping our event schema to the PosterSlider expected schema if necessary
        // Our schema: { title, images: [], ... }
        // TMDB schema: { original_title, poster_path, ... }
        // Poster component probably uses 'poster_path' or 'image'
        const mappedEvents = data.map(event => ({
            ...event,
            original_title: event.title || event.name || 'Untitled Event',
            poster_path: (event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14',
            backdrop_path: (event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'
        }));
        setpremierMovies(mappedEvents);
      } catch (err) {
        console.error("Failed to fetch Park Conscious events:", err);
      }
    };
    fetchCurrentEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All Events") return premierMovies;
    return premierMovies.filter(event => {
        if (!event.category) return false;
        if (Array.isArray(event.category)) {
            return event.category.some(cat => cat && cat.toString().toLowerCase() === selectedCategory.toLowerCase());
        }
        if (typeof event.category === 'string') {
            return event.category.toLowerCase() === selectedCategory.toLowerCase();
        }
        return false;
    });
  }, [selectedCategory, premierMovies]);

  return (
    <div className="bg-darkBackground-900 min-h-screen text-white pb-12 w-full">
      {/* Hero Section */}
      <div className="bg-radial-glow w-full text-center pt-24 pb-16 flex flex-col items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 backdrop-blur-md">
          <span className="text-xs md:text-sm font-bold text-gray-300 tracking-widest uppercase">Parking made smoother for events</span>
        </div>
        <h1 className="text-6xl md:text-[8rem] leading-none font-black text-white uppercase tracking-tighter mb-0">Don't Miss</h1>
        <h1 className="text-6xl md:text-[8rem] leading-none font-black text-gradient uppercase tracking-tighter mb-8 bg-clip-text">The Vibe.</h1>
        <p className="text-gray-400 max-w-2xl text-lg md:text-xl font-medium px-4 mt-4">
          The biggest concerts and festivals in Delhi NCR are here. Pre-book your parking spot and walk straight to the front row.
        </p>
      </div>

      {/* Yellow Banner Carousel */}
      <div className="w-full bg-accentYellow relative z-10 overflow-hidden h-24 md:h-20 flex items-center shadow-2xl">
        <div 
          className="flex transition-transform duration-1000 ease-in-out w-full items-center h-full"
          style={{ transform: `translateX(-${currentAd * 100}%)` }}
        >
          {adCopies.map((copy, idx) => (
            <div key={idx} className="min-w-full flex items-center justify-center gap-4 px-4 h-full flex-shrink-0">
              <p className="text-black font-black text-sm md:text-xl tracking-wide uppercase text-center w-2/3 md:w-auto">{copy}</p>
              <button 
                onClick={() => navigate("/tedx-tickets")}
                className="bg-black text-white px-4 md:px-8 py-2 md:py-2.5 rounded-full font-bold text-[10px] md:text-sm tracking-widest hover:bg-gray-800 transition flex-shrink-0 shadow-lg"
              >
                BOOK NOW
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="container mx-auto px-4 md:px-12 mt-16 mb-8 flex flex-wrap justify-center gap-4 relative z-10">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-8 py-2.5 rounded-full font-bold tracking-wide text-sm transition-all duration-300 ${
              selectedCategory === cat 
                ? "bg-gradient-to-r from-vibrantBlue to-premier-400 text-white shadow-lg shadow-premier-700/30"
                : "bg-darkBackground-800 border border-gray-700 text-gray-300 hover:border-gray-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Events — TEDx SANGAM + Afsana '26 */}
      <div className="container mx-auto px-4 md:px-12 mb-16">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Featured Events</p>
        <FeaturedEventsSection />
      </div>

      {/* Event Grid Section */}
      <div className="container mx-auto px-4 md:px-12 my-12 bg-radial-glow-darker rounded-[2rem] py-12 border border-darkBackground-700 transition-all duration-500">
        <PosterSlider
          title={selectedCategory === "All Events" ? "Live Park Events" : `${selectedCategory} Results`}
          subtitle={selectedCategory === "All Events" ? "Authentic experiences powered by Park Conscious" : `Browsing highlights for ${selectedCategory}`}
          posters={filteredEvents}
          isDark={true}
        />
      </div>

      {/* Discussion Forum */}
      <div className="container mx-auto px-4 md:px-12 mt-16">
        <div className="bg-darkBackground-800 rounded-[2rem] border border-darkBackground-600 p-6 md:p-10 shadow-2xl">
          <DiscussionBoard />
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(HomePage);
