import React, { useEffect, useState, useMemo } from "react";
import tmdbAxios from "../axios";

// HOC
import DefaultlayoutHoc from "../layout/Default.layout";

// Components
import PosterSlider from "../components/PosterSlider/PosterSlider.Component";
import DiscussionBoard from "../components/Discussion/DiscussionBoard";

// Assets
// collegeFarewellImg removed for Afsana 2026 redesign

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

const FeaturedEventCard = () => {
  return (
    <div
      onClick={() => window.location.href = "/farewell-tickets"}
      className="group relative w-full h-48 md:h-64 rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl transition-transform duration-500 hover:scale-[1.01] bg-gradient-to-tr from-[#0a0410] via-[#1a0b2e] to-[#2d0f54] border border-white/5 flex items-center"
    >
      {/* Decorative glowing orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-vibrantBlue/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-premier-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 px-8 md:px-16 w-full">
        <div className="bg-premier-700/80 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full w-fit mb-4 tracking-widest uppercase border border-premier-400/20">Featured Event</div>
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">AFSANA 2026</h2>
        <p className="text-gray-300 text-sm md:text-lg max-w-md font-medium">The final countdown begins. Join us for a night of memories, music, and magic.</p>
        <div className="mt-6 flex items-center gap-4">
          <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-premier-400 hover:text-white transition-colors uppercase tracking-wider">Get Tickets</button>
          <span className="text-white/60 text-xs font-medium">Limited Slots Available</span>
        </div>
      </div>
      {/* Dynamic Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-premier-500 to-vibrantBlue opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 -z-10" />
    </div>
  );
};

const HomePage = () => {
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
    const requestPopularMovies = async () => {
      try {
        const getPopularMovies = await tmdbAxios.get("/movie/now_playing", {
          params: { region: "IN" },
        });
        if (getPopularMovies.data && getPopularMovies.data.results) {
          setpremierMovies(getPopularMovies.data.results);
        }
      } catch (err) {
        console.error("Failed to fetch popular movies:", err);
      }
    };
    requestPopularMovies();
  }, []);

  // Filter movies logic: In a real app we'd filter by genre or tags. 
  // Here we'll subset or shuffle the list to show filtering is working.
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All Events") return premierMovies;
    // Simple subsetting logic based on category for visual feedback
    const charCode = selectedCategory.charCodeAt(0);
    return premierMovies.filter((movie, index) => (index + charCode) % 2 === 0);
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
              <button className="bg-black text-white px-4 md:px-8 py-2 md:py-2.5 rounded-full font-bold text-[10px] md:text-sm tracking-widest hover:bg-gray-800 transition flex-shrink-0 shadow-lg">BOOK NOW</button>
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
            className={`px-8 py-2.5 rounded-full font-bold tracking-wide text-sm transition-all duration-300 ${selectedCategory === cat
                ? "bg-gradient-to-r from-vibrantBlue to-premier-400 text-white shadow-lg shadow-premier-700/30"
                : "bg-darkBackground-800 border border-gray-700 text-gray-300 hover:border-gray-500"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Event Card (New Requirement) */}
      <div className="container mx-auto px-4 md:px-12 mb-16">
        <FeaturedEventCard />
      </div>

      {/* Event Grid Section */}
      <div className="container mx-auto px-4 md:px-12 my-12 bg-radial-glow-darker rounded-[2rem] py-12 border border-darkBackground-700 transition-all duration-500">
        <PosterSlider
          title={selectedCategory === "All Events" ? "New Premium Movies" : `${selectedCategory} Results`}
          subtitle={selectedCategory === "All Events" ? "Brand new popular releases in India" : `Browsing highlights for ${selectedCategory}`}
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
