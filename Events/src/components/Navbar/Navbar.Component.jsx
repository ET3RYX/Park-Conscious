import { BiChevronDown, BiMenu, BiSearch } from "react-icons/bi";
import CustomModal from "../Modal/Modal.Component";
import RequestEventModal from "../Modal/RequestEventModal";
import { useAuth } from "../../context/DiscussionAuth.context";
import axios from "axios";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.jpg";

const apiKey = process.env.REACT_APP_OPENCAGE_API_KEY;

function NavSm({ defaultLocation }) {
  const { user } = useAuth();
  return (
    <>
    <div className="text-white flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold">It All Starts Here!</h3>
        <span className="text-gray-400 text-xs flex items-center cursor-pointer hover:text-white">
          {defaultLocation || "Select you..."} <BiChevronDown />
        </span>
      </div>
      <div className="flex items-center gap-3">
        {user && user.picture && (
          <img src={user.picture} alt="profile" className="w-8 h-8 rounded-full border border-gray-600" />
        )}
        <div className="w-8 h-8">
          <BiSearch className="w-full h-full" />
        </div>
      </div>
    </div>
    </>
  );
}

function NavMd() {
  return (
    <>
      <div className="w-full flex items-center gap-3 bg-white px-3 py-1 rounded-md">
        <BiSearch />
        <input
          type="search"
          className="w-full bg-transparent border-none focus:outline-none"
        />
      </div>
    </>
  );
}

function NavLg({ defaultLocation, onRequestOpen }) {
  const [location, setLocation] = useState("");

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const response = await axios.get(
                `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&language=en&q=${latitude}+${longitude}`
              );

              const state = response.data.results[0].components.state;
              setLocation(state || defaultLocation);
            } catch (error) {
              console.error("Error getting user location:", error);
              setLocation(defaultLocation);
            }
          },
          (error) => {
            console.error("Error getting user location:", error);
            setLocation(defaultLocation);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser");
        setLocation(defaultLocation);
      }
    };

    getUserLocation();
  }, [defaultLocation]);

  return (
    <>
      <div className="container flex mx-auto px-4 items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={logo} alt="Park Events Logo" className="w-8 h-8 rounded object-cover" />
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter hidden lg:block">
              Park <span className="text-gradient">Events</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a href="/" className="nav-link text-sm font-medium">Home</a>
          <a href="#" className="nav-link text-sm font-medium">Find Parking</a>
          <button 
            onClick={onRequestOpen}
            className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-4"
          >
            <span className="text-premier-400 font-bold">+</span> List Your Event
          </button>
          <a href="https://parkconscious.in/contact.html" target="_blank" rel="noreferrer" className="btn-secondary py-1.5 px-4 text-sm inline-block">Support</a>
          <CustomModal />
        </div>
      </div>
    </>
  );
}

// Main NavBar Component
const Navbar = ({ defaultLocation }) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  return (
    <nav className="bg-darkBackground-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      {/* Mobile Screen Navbar */}
      <div className="md:hidden">
        <NavSm defaultLocation={defaultLocation} />
      </div>
      {/* Medium Screen Size */}
      <div className="hidden md:flex lg:hidden">
        <NavMd />
      </div>
      {/* Large Screen Size */}
      <div className="hidden md:hidden lg:flex">
        <NavLg 
          defaultLocation={defaultLocation} 
          onRequestOpen={() => setIsRequestModalOpen(true)}
        />
      </div>
      <RequestEventModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
