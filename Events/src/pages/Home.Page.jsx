import React, { useEffect, useState } from "react";
import tmdbAxios from "../axios";

// HOC
import DefaultlayoutHoc from "../layout/Default.layout";

// Components
import EntertainmentCardSlider from "../components/Entertainment/EntertainmentCard.Component";
import HeroCarousel from "../components/HeroCarousel/HeroCarousel.Component";
import PosterSlider from "../components/PosterSlider/PosterSlider.Component";
import DiscussionBoard from "../components/Discussion/DiscussionBoard";

const HomePage = () => {
  const [recommendedMovies, setrecommendedMovies] = useState([]);
  const [premierMovies, setpremierMovies] = useState([]);

  useEffect(() => {
    const requestTopRatedMovies = async () => {
      try {
        const getTopRatedMovies = await tmdbAxios.get("/discover/movie", {
          params: {
            with_origin_country: "IN",
            with_original_language: "hi|kn|ml|ta|te",
            sort_by: "popularity.desc",
          },
        });
        if (getTopRatedMovies.data && getTopRatedMovies.data.results) {
          setrecommendedMovies(getTopRatedMovies.data.results);
        }
      } catch (err) {
        console.error("Failed to fetch top rated movies:", err);
      }
    };
    requestTopRatedMovies();
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
    <>
      <HeroCarousel />
      <div className="container mx-auto px-4 md:px-12 my-8">
        <h1 className="text-2xl font-bold text-white sm:ml-3 my-3">
          The Best of Entertainment
        </h1>
        <EntertainmentCardSlider />
      </div>

      <div className="container mx-auto px-4 md:px-12 my-8">
        <PosterSlider
          title="Recommended Movies"
          subtitle="List of Recommended Movies"
          posters={recommendedMovies}
          isDark={false}
        />
      </div>

      <div className="bg-premier-800 py-12">
        <div className="container mx-auto px-4 md:px-12 my-8 flex flex-col gap-3">
          <div className="hidden md:flex">
            <img
              src="https://in.bmscdn.com/discovery-catalog/collections/tr:w-1440,h-120/premiere-rupay-banner-web-collection-202104230555.png"
              alt="Rupay"
              className="w-full h-full"
            />
          </div>
          <PosterSlider
            title="Premiers"
            subtitle="Brand new release every Friday"
            posters={premierMovies}
            isDark={true}
          />
        </div>
      </div>

      {/* Discussion Forum — replaces Online Streaming Events */}
      <div className="bg-darkBackground-900 border-t border-darkBackground-700">
        <div className="container mx-auto px-4 md:px-12 py-12">
          <DiscussionBoard />
        </div>
      </div>
    </>
  );
};

export default DefaultlayoutHoc(HomePage);
