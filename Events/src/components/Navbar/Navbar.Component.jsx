import { BiChevronDown, BiMenu, BiSearch } from "react-icons/bi";
import { Link } from "react-router-dom";
import CustomModal from "../Modal/Modal.Component";
import RequestEventModal from "../Modal/RequestEventModal";
import { useAuth } from "../../context/DiscussionAuth.context";
import axios from "axios";
import { useEffect, useState } from "react";
import { Plus, Globe, Shield } from 'lucide-react';

const apiKey = process.env.REACT_APP_OPENCAGE_API_KEY;

function NavSm({ defaultLocation }) {
  const { user } = useAuth();
  return (
    <div className="text-white flex items-center justify-between px-2">
      <div className="flex flex-col">
        <h3 className="text-xl font-black uppercase tracking-tighter leading-none italic italic">BACK<span className="text-indigo-500 italic block">STAGE</span></h3>
        <span className="text-slate-600 text-[8px] font-black uppercase tracking-[0.4em] flex items-center mt-2 cursor-pointer hover:text-white transition-colors">
          {defaultLocation || "Select Location"} <BiChevronDown className="ml-1" />
        </span>
      </div>
      <div className="flex items-center gap-6">
        {user && user.picture && (
          <img src={user.picture} alt="profile" className="w-10 h-10 rounded-[1.2rem] border border-white/10 p-1 bg-white/5" />
        )}
        <BiSearch size={24} className="text-slate-600" />
      </div>
    </div>
  );
}

function NavMd() {
  return (
    <div className="w-full flex items-center gap-6 bg-white/5 border border-white/5 px-6 py-3.5 rounded-2xl backdrop-blur-3xl">
      <BiSearch size={20} className="text-slate-700" />
      <input
        type="search"
        placeholder="Search Events..."
        className="w-full bg-transparent border-none focus:outline-none text-[11px] font-black uppercase tracking-[0.2em] text-white placeholder:text-slate-500"
      />
    </div>
  );
}

function NavLg({ defaultLocation, onRequestOpen }) {
  const { user } = useAuth();
  const [location, setLocation] = useState("");

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation && apiKey) {
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
              setLocation(defaultLocation);
            }
          },
          () => setLocation(defaultLocation)
        );
      } else {
        setLocation(defaultLocation);
      }
    };
    getUserLocation();
  }, [defaultLocation]);

  return (
    <div className="container flex mx-auto px-8 items-center justify-between py-2">
      <div className="flex items-center gap-16">
        <Link to="/" className="cursor-pointer group">
          <h1 className="text-[1.8rem] font-black text-white uppercase tracking-tighter leading-none m-0 p-0 italic">
            BACK<span className="text-indigo-500 italic">STAGE</span>
          </h1>
        </Link>

        <div className="hidden xl:flex items-center gap-10 pl-16 border-l border-white/5">
           <Link to="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-indigo-400 transition-all">Home</Link>
           <a href="https://www.parkconscious.in" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-white transition-all">Parking</a>
           {user && (
             <Link to="/my-bookings" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 hover:text-indigo-300 transition-all">
                <Shield size={14} className="text-indigo-500/50" /> Wallet
             </Link>
           )}
        </div>
      </div>

      <div className="flex items-center gap-10">
         <div className="hidden lg:flex items-center gap-3 text-slate-700">
            <Globe size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">{location || defaultLocation || "Delhi NCR"}</span>
         </div>
        
        <button 
          onClick={onRequestOpen}
          className="flex items-center gap-4 px-8 py-3.5 bg-white text-black rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-[0_20px_40px_-5px_rgba(255,255,255,0.05)] active:scale-95 group"
        >
          <Plus size={16} strokeWidth={4} className="group-hover:rotate-90 transition-transform" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mt-0.5">List Event</span>
         </button>

        <a href="https://parkconscious.in/contact.html" className="hidden xl:block text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-white transition-all">Support</a>
        
        <div className="pl-8 border-l border-white/5">
           <CustomModal />
        </div>
      </div>
    </div>
  );
}

const Navbar = ({ defaultLocation }) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  return (
    <nav className="bg-[#050507]/90 backdrop-blur-3xl sticky top-0 z-[100] border-b border-white/5 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1700px] mx-auto px-6 py-5 md:py-6">
        <div className="lg:hidden">
          <NavSm defaultLocation={defaultLocation} />
        </div>
        <div className="hidden lg:flex">
          <NavLg 
            defaultLocation={defaultLocation} 
            onRequestOpen={() => setIsRequestModalOpen(true)}
          />
        </div>
      </div>
      <RequestEventModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
