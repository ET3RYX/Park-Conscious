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
  CheckCircle2,
  IndianRupee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium
      ${isActive 
        ? 'bg-slate-800 text-sky-400 border border-slate-700' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden selection:bg-sky-500/20">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar - Flat & Professional */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
            {/* Branding */}
            <div className="px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-sky-500" size={24} />
                    <div>
                        <h1 className="font-bold tracking-tight text-lg leading-none text-white">
                          {admin?.role === 'superadmin' ? 'SYSTEM' : 'BACKSTAGE'}
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                          {admin?.role === 'superadmin' ? 'Super Admin Console' : 'Organizer Portal'}
                        </p>
                    </div>
                </div>
                <button className="md:hidden text-slate-500 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 pt-4">
                <SidebarItem icon={BarChart3} label="Dashboard" to="/" />
                <SidebarItem icon={Calendar} label="Events" to="/events" />
                <SidebarItem icon={Users} label="Attendees" to="/attendees" />
                
                {/* Global System Admin Tools - SuperAdmin Only */}
                {admin?.role === 'superadmin' && (
                  <>
                    <SidebarItem icon={IndianRupee} label="Price Controller" to="/price-updater" />
                    <SidebarItem icon={Settings} label="System" to="/settings" />
                  </>
                )}
            </nav>

            {/* User Profile - Fixed at Bottom with Clean Layout */}
            <div className="p-4 border-t border-slate-800 mt-auto">
                <div className="bg-slate-800/40 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50">
                    <div className="relative">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${admin?.name || 'Admin'}&background=334155&color=fff&bold=true`} 
                        className="w-10 h-10 rounded-lg border border-slate-700 shadow-sm" 
                        alt="Admin" 
                      />
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${admin?.role === 'superadmin' ? 'bg-amber-500' : 'bg-sky-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{admin?.name || 'Admin'}</p>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black uppercase tracking-tighter ${
                            admin?.role === 'superadmin' 
                              ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' 
                              : 'text-sky-400 bg-sky-400/10 border-sky-400/20'
                          }`}>
                            {admin?.role || 'admin'}
                          </span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="text-[10px] text-slate-500 font-bold uppercase hover:text-rose-400 transition-colors flex items-center gap-1.5 mt-0.5"
                        >
                            <LogOut size={10} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden bg-slate-950">
        {/* Flat Header */}
        <header className="flex-shrink-0 z-30 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex relative items-center">
              <Search className="absolute left-3 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-slate-800/50 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-slate-700 transition-all w-72" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Secure Core</span>
            </div>
            <button className="relative p-2 text-slate-500 hover:text-white bg-slate-800/40 rounded-lg border border-slate-800">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10">
            <div className="max-w-7xl mx-auto pb-12">
                <Outlet />
            </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
