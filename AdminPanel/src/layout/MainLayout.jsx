import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Activity,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-300 font-black text-xs uppercase tracking-widest
      ${isActive 
        ? 'bg-gradient-to-r from-premier-500/10 to-vibrantBlue/10 text-white shadow-xl border border-white/5 active-sidebar-glow' 
        : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}
    `}
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-darkBackground-900 text-white flex overflow-hidden font-inter">
      {/* Sidebar background glow */}
      <div className="absolute top-0 left-0 w-96 h-screen bg-radial-glow opacity-30 pointer-events-none"></div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-all" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-80 bg-darkBackground-800/60 backdrop-blur-2xl border-r border-white/5 z-50 transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-premier-400 to-vibrantBlue flex items-center justify-center shadow-2xl shadow-premier-500/40 border border-white/10">
                <ShieldCheck className="text-white" size={26} />
                </div>
                <div>
                <h1 className="font-black tracking-tighter text-2xl leading-none">PARK</h1>
                <p className="text-[10px] text-vibrantBlue font-black tracking-[0.2em] uppercase mt-1">Production</p>
                </div>
            </div>
            <button className="md:hidden text-gray-500 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
            </button>
            </div>

            <nav className="flex-1 space-y-3">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
                <SidebarItem icon={Calendar} label="Events" to="/events" />
                <SidebarItem icon={Users} label="Attendees" to="/attendees" />
                <SidebarItem icon={Settings} label="System" to="/settings" />
            </nav>

            <div className="pt-8 border-t border-white/5">
                <div className="bg-darkBackground-900 border border-white/5 rounded-3xl p-5 flex items-center gap-4 relative group overflow-hidden">
                    <div className="absolute -inset-1 bg-gradient-to-r from-premier-500/5 to-vibrantBlue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${admin?.name || 'Admin'}&background=3b82f6&color=fff&bold=true`} 
                      className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg" 
                      alt="Admin" 
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate uppercase tracking-tight">{admin?.name || 'Authorized Admin'}</p>
                        <button 
                            onClick={handleLogout}
                            className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-rose-400 transition-colors flex items-center gap-1.5 mt-1"
                        >
                            <LogOut size={10} /> Terminate Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-vibrantBlue/5 blur-[150px] rounded-full pointer-events-none"></div>
        
        {/* Universal Header */}
        <header className="flex-shrink-0 z-30 bg-darkBackground-900/60 backdrop-blur-xl border-b border-white/5 px-8 md:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="md:hidden text-gray-500 hover:text-white bg-darkBackground-800 p-2.5 rounded-xl border border-white/5" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden lg:flex relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-darkBackground-800 border border-white/5 rounded-2xl pl-12 pr-6 py-2.5 text-xs text-white focus:outline-none focus:border-premier-400 transition-all w-80 font-medium placeholder:text-gray-600 shadow-inner" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
                <span className="hidden md:block text-[10px] font-black text-emerald-400 uppercase tracking-widest mr-2 flex items-center gap-1.5 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Secure Connection
                </span>
                <button className="relative p-3 text-gray-500 hover:text-white transition bg-darkBackground-800 rounded-2xl border border-white/5 hover:border-vibrantBlue/30 shadow-lg">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-vibrantBlue rounded-full animate-bounce shadow-glow"></span>
                </button>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                <Outlet />
            </div>
            
            <footer className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 pb-12">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">© 2026 Park Conscious // Production Tier</p>
                <div className="flex items-center gap-6">
                    <a href="#" className="text-[10px] text-gray-600 hover:text-vibrantBlue font-black uppercase tracking-widest transition-colors">Documentation</a>
                    <a href="#" className="text-[10px] text-gray-600 hover:text-vibrantBlue font-black uppercase tracking-widest transition-colors">Security Audit</a>
                </div>
            </footer>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
