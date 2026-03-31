import { Routes, Route } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomePage from "./pages/Home.Page";
import MoviePage from "./pages/Movie.Page";
import PlayPage from "./pages/Play.Page";
import ErrorPage from "./pages/404";
import CategoryPage from "./pages/Category.Page";
import DiscussionPage from "./pages/Discussion.Page";
import FarewellTicketsPage from "./pages/FarewellTickets.Page";
import EventPage from "./pages/Event.Page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movie/:id" element={<MoviePage />} />
      <Route path="/plays" element={<PlayPage />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/discussion/:id" element={<DiscussionPage />} />
      <Route path="/farewell-tickets" element={<FarewellTicketsPage />} />
      <Route path="/event/:id" element={<EventPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
