import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultlayoutHoc from "../layout/Default.layout";
import PosterSlider from "../components/PosterSlider/PosterSlider.Component";
import tmdbAxios from "../axios";

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  // Mock mapping of slugs to human-readable titles
  const categoryTitles = {
    "workshop-and-more": "Workshops & More",
    "kids-zone": "Kids Zone",
    "comedy-shows": "Comedy Shows",
    "music-shows": "Music Shows",
    "upskill": "Upskilling",
    "interactive-games": "Interactive Games",
    "arts-crafts": "Arts & Crafts",
    "theatre-shows": "Theatre Shows",
    "adventure-fun": "Adventure & Fun",
  };

  const pageTitle = categoryTitles[id] || "Events";

  useEffect(() => {
    // For the sake of this clone, we'll fetch popular movies to mock event data
    // In a real app, this would fetch events specifically for this category slug
    const fetchCategoryEvents = async () => {
      try {
        const response = await tmdbAxios.get("/movie/popular", {
          params: { region: "IN" },
        });
        // Randomize the results slightly based on the category so they don't all look identical
        const shuffled = response.data.results.sort(() => 0.5 - Math.random());
        setEvents(shuffled);
      } catch (error) {
        console.error("Error fetching category events:", error);
      }
    };

    fetchCategoryEvents();
    window.scrollTo(0, 0);
  }, [id]);

  const handleMovieClick = () => {
    // Navigate to a random movie ID since these are mocked events
    if (events.length > 0) {
      navigate(`/movie/${events[0].id}`);
    }
  };

  const sliderConfig = {
    arrows: true,
    slidesToShow: 4,
    infinite: true,
    dots: false,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="bg-darkBackground-900 min-h-screen pb-12">
      {/* Category Hero Section */}
      <div className="bg-gradient-to-r from-premier-800 to-vibrantBlue py-16">
        <div className="container mx-auto px-4 md:px-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 capitalize">
            {pageTitle}
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl">
            Explore the best {pageTitle.toLowerCase()} happening near you. Book your tickets now and don't miss out on the fun!
          </p>
        </div>
      </div>

      {/* Events Grid/Slider */}
      <div className="container mx-auto px-4 md:px-12 my-12">
        <PosterSlider
          config={sliderConfig}
          title={`Top ${pageTitle}`}
          subtitle={`Discover the most popular ${pageTitle.toLowerCase()} this week.`}
          posters={events}
          isDark={true}
          onMovieClick={handleMovieClick}
        />
      </div>

      <div className="container mx-auto px-4 md:px-12 my-12">
        <PosterSlider
          config={sliderConfig}
          title={`More ${pageTitle}`}
          subtitle={`Wait, there's more! Dive deeper into these events.`}
          posters={events.slice().reverse()} // Just reversing the array for some variation
          isDark={true}
          onMovieClick={handleMovieClick}
        />
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(CategoryPage);
