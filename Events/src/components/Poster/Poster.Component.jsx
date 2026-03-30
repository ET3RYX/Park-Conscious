import React from "react";
import { Link } from "react-router-dom";

const Poster = (props) => {
  return (
    <Link to={`/event/${props._id || props.id}`}>
      <div className="flex flex-col items-start gap-2 px-1 md:px-3">
        <div className="h-40 md:h-80 w-full group relative overflow-hidden rounded-xl">
          <img
            src={props.poster_path?.startsWith('http') ? props.poster_path : `https://image.tmdb.org/t/p/original${props.poster_path}`}
            alt={props.original_title}
            className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
             <span className="text-white text-xs font-bold uppercase tracking-widest bg-sky-600 px-3 py-1 rounded-full shadow-lg">View Details</span>
          </div>
        </div>
        <h3
          className={`text-lg font-bold ${
            props.isDark ? "text-white" : "text-gray-100"
          }`}
        >
          {props.original_title}
        </h3>
      </div>
    </Link>
    // <div>{props.original_title}</div>
    // <div>Poster</div>
  );
};

export default Poster;
