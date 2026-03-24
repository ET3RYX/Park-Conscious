import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket, Users, Settings, TrendingUp, Bell, Search, Activity, Menu, X } from 'lucide-react';
import axios from 'axios';

// The main application URL where the API is hosted (since AdminPanel is a separate app)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-premier-500/20 to-vibrantBlue/20 text-white shadow-lg border border-premier-400/30' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={20} className={active ? 'text-premier-400' : ''} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const StatsCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="bg-darkBackground-800 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
    <div className="absolute -inset-1 bg-gradient-to-br from-premier-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-premier-400/30 transition-colors">
        <Icon size={24} className="text-vibrantBlue" />
      </div>
    </div>
    <div className={`flex items-center gap-2 text-sm relative z-10 ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
      <TrendingUp size={16} />
      <span>{change} vs last week</span>
    </div>
  </div>
);

const TicketManager = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [prices, setPrices] = useState({
    regular: 1499,
    vip: 2999
  });

  // Fetch prices on load
  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/tickets`);
      if (res.data && res.data.success) {
        setPrices({
          regular: res.data.event.regularPrice || 1499,
          vip: res.data.event.vipPrice || 2999
        });
      }
    } catch (err) {
      console.error("Could not fetch prices, using defaults.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/tickets`, {
        eventId: "farewell_2024",
        regularPrice: parseInt(prices.regular),
        vipPrice: parseInt(prices.vip)
      });
      if (res.data.success) {
        setMessage('Ticket prices updated successfully across all servers.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Failed to update ticket prices. Check API connection.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-darkBackground-800 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-premier-500/10 blur-3xl rounded-full"></div>
      
      <div className="relative z-10 flex justify-between items-start mb-8 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Ticket className="text-premier-400" /> Ticket Price Manager
          </h2>
          <p className="text-gray-400 text-sm mt-1">Update live ticket pricing for the College Farewell 2024 event.</p>
        </div>
        <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> Live Synced
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center animate-pulse">Syncing with database...</div>
      ) : (
        <div className="space-y-6 relative z-10 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Regular Entry Ticket (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input 
                type="number" 
                value={prices.regular}
                onChange={(e) => setPrices({...prices, regular: e.target.value})}
                className="w-full bg-darkBackground-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-bold focus:outline-none focus:border-premier-400 focus:ring-1 focus:ring-premier-400 transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 border-t border-white/5 pt-6">VIP Access Ticket (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-premier-400 font-bold">₹</span>
              <input 
                type="number" 
                value={prices.vip}
                onChange={(e) => setPrices({...prices, vip: e.target.value})}
                className="w-full bg-darkBackground-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-premier-400 font-bold focus:outline-none focus:border-premier-400 focus:ring-1 focus:ring-premier-400 transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Activity size={12} /> Includes backstage access and red carpet.</p>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="bg-gradient-to-r from-premier-500 to-vibrantBlue text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-premier-700/20 hover:scale-[1.02] transition disabled:opacity-50"
            >
              {saving ? 'UPDATING MONGODB...' : 'PUBLISH CHANGES'}
            </button>
            {message && <span className={`text-sm font-medium ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>{message}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/admin/login`, { username, password });
      if (res.data && res.data.success) {
        onLogin(res.data.admin);
      } else {
        setError('Invalid credentials. Access denied.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBackground-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Background */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-premier-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-vibrantBlue/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-darkBackground-800 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-premier-400 to-vibrantBlue flex items-center justify-center shadow-lg shadow-premier-500/30 mb-6">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase text-center">Admin Nexus</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Verify credentials to proceed</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2 text-center items-center gap-2">Username</label>
            <input 
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. oliver"
              className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-premier-400/50 transition-all font-medium placeholder:text-gray-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2 text-center items-center gap-2">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-darkBackground-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-premier-400/50 transition-all font-medium placeholder:text-gray-700"
            />
          </div>

          {error && <p className="text-red-400 text-xs font-bold bg-red-400/10 p-4 rounded-xl border border-red-400/20 text-center animate-shake">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-premier-400 to-vibrantBlue text-white font-black py-5 rounded-2xl shadow-xl shadow-premier-500/20 hover:shadow-premier-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wider"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          Park Events Control Center v2.0
        </p>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    setInitialized(true);
  }, []);

  const handleLogin = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem('adminUser');
  };

  if (!initialized) return null; // Wait for localStorage check

  if (!admin) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-darkBackground-900 text-white flex overflow-hidden">
      {/* Sidebar background glow */}
      <div className="absolute top-0 left-0 w-96 h-screen bg-radial-glow opacity-30 pointer-events-none"></div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-darkBackground-800/80 backdrop-blur-xl border-r border-white/5 z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-premier-400 to-vibrantBlue flex items-center justify-center shadow-lg shadow-premier-500/30">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-xl leading-none">PARK EVENTS</h1>
              <p className="text-[10px] text-vibrantBlue font-bold tracking-widest uppercase">Admin Nexus</p>
            </div>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 py-8 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Ticket} label="Ticket Pricing" active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
          <SidebarItem icon={Users} label="Attendees" active={activeTab === 'attendees'} onClick={() => setActiveTab('attendees')} />
          <SidebarItem icon={Settings} label="System Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div 
            onClick={handleLogout}
            className="bg-darkBackground-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <img src={`https://ui-avatars.com/api/?name=${admin.username}&background=3b82f6&color=fff`} className="w-10 h-10 rounded-full" alt="Admin" />
            <div className="flex-1">
              <p className="text-sm font-bold capitalize">{admin.username}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest group-hover:text-red-400 transition-colors">Sign Out</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-vibrantBlue/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-darkBackground-900/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-black tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input type="text" placeholder="Search transactions..." className="bg-darkBackground-800 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-premier-400 transition w-64" />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white transition bg-darkBackground-800 rounded-full border border-white/5">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-vibrantBlue rounded-full animate-bounce"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <StatsCard title="Total Revenue" value="₹12.4L" change="+14%" icon={TrendingUp} trend="up" />
                <StatsCard title="Tickets Sold" value="842" change="+22%" icon={Ticket} trend="up" />
                <StatsCard title="Active Users" value="1,204" change="-5%" icon={Users} trend="down" />
              </div>
              <div className="bg-darkBackground-800 border border-white/5 rounded-3xl p-8 flex items-center justify-center h-64">
                <p className="text-gray-500 font-medium">Revenue Chart Area (Placeholder)</p>
              </div>
            </>
          )}

          {activeTab === 'tickets' && (
            <TicketManager />
          )}

          {(activeTab === 'attendees' || activeTab === 'settings') && (
            <div className="bg-darkBackground-800 border border-white/5 rounded-3xl p-8 flex items-center justify-center h-[50vh]">
              <p className="text-gray-500 font-medium text-lg">Work in progress module.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
