import React, { useEffect, useState } from "react";
import tmdbAxios from "../axios";

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

const HomePage = () => {
  const [premierMovies, setpremierMovies] = useState([]);
  const [currentAd, setCurrentAd] = useState(0);

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

  return (
    <div className="bg-darkBackground-900 min-h-screen text-white pb-12 w-full overflow-hidden">
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
        <button className="bg-gradient-to-r from-vibrantBlue to-premier-400 text-white px-8 py-2.5 rounded-full font-bold shadow-lg shadow-premier-700/30 tracking-wide text-sm">All Events</button>
        <button className="bg-darkBackground-800 border border-gray-700 text-gray-300 px-8 py-2.5 rounded-full font-medium hover:border-gray-500 transition tracking-wide text-sm">Concerts</button>
        <button className="bg-darkBackground-800 border border-gray-700 text-gray-300 px-8 py-2.5 rounded-full font-medium hover:border-gray-500 transition tracking-wide text-sm">Festivals</button>
        <button className="bg-darkBackground-800 border border-gray-700 text-gray-300 px-8 py-2.5 rounded-full font-medium hover:border-gray-500 transition tracking-wide text-sm">Summits</button>
        <button className="bg-darkBackground-800 border border-gray-700 text-gray-300 px-8 py-2.5 rounded-full font-medium hover:border-gray-500 transition tracking-wide text-sm">Culture</button>
      </div>

      {/* Event Grid Section */}
      <div className="container mx-auto px-4 md:px-12 my-12 bg-radial-glow-darker rounded-[2rem] py-12 border border-darkBackground-700">
        <PosterSlider
          title="New Premium Movies"
          subtitle="Brand new popular releases in India"
          posters={premierMovies}
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
