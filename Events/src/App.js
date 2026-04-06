import { Routes, Route } from "react-router-dom";
// Triggering fresh SANGAM deployment build after quota reset.

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomePage from "./pages/Home.Page";
import MoviePage from "./pages/Movie.Page";
import PlayPage from "./pages/Play.Page";
import ErrorPage from "./pages/404";
import CategoryPage from "./pages/Category.Page";
import DiscussionPage from "./pages/Discussion.Page";
import TedxTicketsPage from "./pages/TedxTickets.Page";
import EventPage from "./pages/Event.Page";
import SuccessPage from "./pages/Success.Page";
import FailurePage from "./pages/Failure.Page";
import MyBookingsPage from "./pages/MyBookings.Page";
import AdminPage from "./pages/Admin.Page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="/movie/:id" element={<MoviePage />} />
      <Route path="/plays" element={<PlayPage />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/discussion/:id" element={<DiscussionPage />} />
      <Route path="/tedx-tickets" element={<TedxTicketsPage />} />
      <Route path="/event/:id" element={<EventPage />} />
      <Route path="/payment-success" element={<SuccessPage />} />
      <Route path="/payment-failure" element={<FailurePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
