import React from "react";
import Slider from "react-slick";
import Poster from "../Poster/Poster.Component";

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.7)",
        borderRadius: "50%",
        zIndex: 10,
        right: "10px",
        width: "30px",
        height: "30px"
      }}
      onClick={onClick}
    />
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.7)",
        borderRadius: "50%",
        zIndex: 10,
        left: "10px",
        width: "30px",
        height: "30px"
      }} // Explicitly position over the content
      onClick={onClick}
    />
  );
};

const PosterSlider = (props) => {
  const { title, subtitle, posters, isDark, isLoading } = props;

  const settings = {
    infinite: false,
    autoplay: false,
    slidesToShow: 5,
    slidesToScroll: 2,
    initialSlide: 0,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <div className="flex flex-col items-start sm:ml-3 my-2">
        <h3
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-100"
          }`}
        >
          {title}
        </h3>
        <p className={`text-sm ${isDark ? "text-white" : "text-gray-400"}`}>
          {subtitle}
        </p>
      </div>
      <Slider {...settings}>
        {isLoading ? (
          [...Array(5)].map((_, index) => (
             <div key={`skeleton-${index}`} className="px-2">
                 <div className="w-full h-80 bg-slate-800/80 rounded-[3rem] animate-pulse"></div>
                 <div className="w-3/4 h-4 bg-slate-800 rounded-full mt-4 animate-pulse mx-2"></div>
                 <div className="w-1/2 h-3 bg-slate-800 rounded-full mt-2 animate-pulse mx-2"></div>
             </div>
          ))
        ) : posters && posters.length > 0 ? (
          posters.map((each, index) => (
            <Poster {...each} isDark={isDark} key={index} />
          ))
        ) : (
          <div className="py-20 text-center w-full text-slate-500 font-medium border border-dashed border-slate-800 rounded-2xl">
            No events found in this category.
          </div>
        )}
      </Slider>
    </>
  );
};

export default PosterSlider;
