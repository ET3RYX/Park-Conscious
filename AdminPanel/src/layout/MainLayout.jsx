import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Bell,
  Search,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold
      ${isActive 
        ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-900'}
    `}
  >
    {({ isActive }) => (
      <>
        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-sky-400'} />
        <span>{label}</span>
        {to === '/settings' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />}
      </>
    )}
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

  const isSuperAdmin = admin?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex selection:bg-sky-500/30 font-inter">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-900 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full px-6 py-8">
          {/* Header/Branding */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-xl shadow-sky-900/20">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-white tracking-tighter text-lg leading-none uppercase">
                {isSuperAdmin ? 'System' : 'Backstage'}
              </h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
                {isSuperAdmin ? 'Core Console' : 'Partner Hub'}
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Management</div>
            <SidebarItem icon={BarChart3} label="Dashboard" to="/" />
            <SidebarItem icon={Calendar} label="Events" to="/events" />
            <SidebarItem icon={Users} label="Attendees" to="/attendees" />
            
            {isSuperAdmin && (
              <>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-8 mb-4 ml-4">Infrastructure</div>
                <SidebarItem icon={Settings} label="User Registry" to="/settings" />
              </>
            )}
          </nav>

          {/* User Block */}
          <div className="mt-auto pt-8 border-t border-slate-900">
            <div className="flex items-center gap-3 p-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold text-sm uppercase group-hover:border-sky-500/50 transition-all">
                {admin?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{admin?.name}</p>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-sky-500 transition-colors flex items-center gap-1 mt-0.5"
                >
                  <LogOut size={10} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-xl border-b border-slate-900">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 w-80 group focus-within:border-sky-500/50 transition-all">
              <Search size={14} className="text-slate-500 group-focus-within:text-sky-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Active</span>
            </div>
            <button className="p-2.5 text-slate-500 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500 border-2 border-slate-950" />
            </button>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <div className="p-8 md:p-12">
          <div className="max-w-[1400px] mx-auto pb-12">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
