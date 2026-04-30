import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Activity, Search, Clock, MapPin, 
  RefreshCw, Car
} from 'lucide-react';
import { bookingService } from '../services/api';

const ParkingLogs = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyThreshold, setHistoryThreshold] = useState(0);

  const fetchData = useCallback(async (force = false) => {
    if (force) setLoading(true);
    try {
      const { data } = await bookingService.getAllAttendees();
      // Filter for parking bookings only
      const parkingBookings = (data || []).filter(b => b.parkingId || b.locationName);
      setBookings(parkingBookings);
      // Set the threshold for "history" (older than 24h)
      setHistoryThreshold(Date.now() - 24 * 60 * 60 * 1000);
    } catch (err) {
      console.error('Failed to fetch parking logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Satisfy react-hooks/set-state-in-effect by wrapping in microtask
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = 
        (b.locationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.vehicleNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.ticketId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const bookingDate = new Date(b.createdAt || b.date).getTime();
      const isPast = bookingDate < historyThreshold;
      
      if (activeTab === 'active') return matchesSearch && !isPast;
      return matchesSearch && isPast;
    });
  }, [bookings, searchQuery, activeTab, historyThreshold]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-2">
            <Activity size={10} /> Live Inventory
          </div>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight uppercase flex items-center gap-3">
            Booking Logs
          </h1>
          <p className="text-zinc-600 text-xs font-medium mt-1">
            All incoming reservations across your parking locations.
          </p>
        </div>
        
        <button 
          onClick={() => fetchData(true)}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Feed
        </button>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-4 border-b border-white/[0.02] flex items-center justify-between bg-zinc-950/20">
          <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              History
            </button>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
            <input 
              type="text"
              placeholder="Filter logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.03] text-zinc-200 pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-sky-500/20 transition-all font-mono text-[9px] uppercase tracking-widest"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="text-sky-500/50 animate-spin" size={32} />
            <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em]">Syncing Logs...</span>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.2em] border-b border-white/[0.02]">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Location</th>
                  <th className="px-8 py-5">Vehicle Details</th>
                  <th className="px-8 py-5 text-center">Time Slot</th>
                  <th className="px-8 py-5 text-right">Revenue</th>
                  <th className="px-8 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredData.map((b) => (
                  <tr key={b._id} className="group hover:bg-white/[0.01] transition-all duration-300">
                    <td className="px-8 py-6">
                      <p className="text-[10px] font-bold text-zinc-300 leading-none mb-1">
                        {new Date(b.createdAt || b.date).toLocaleDateString()}
                      </p>
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                        {new Date(b.createdAt || b.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <MapPin size={12} className="text-sky-400" />
                        <span className="text-xs font-bold text-zinc-200">{b.locationName || 'Unknown Site'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                          <Car size={14} className="text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-zinc-100 uppercase tracking-tighter">{b.vehicleNumber || 'N/A'}</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{b.vehicleType || 'CAR'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
                        {b.startTime} - {b.endTime}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-outfit font-black text-emerald-400 text-xs">
                      ₹{b.amount}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        b.status === 'Confirmed' || b.status === 'confirmed' 
                        ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' 
                        : 'bg-amber-500/5 text-amber-500 border-amber-500/10'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-800">
              <Clock size={24} />
            </div>
            <div className="max-w-xs">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-tight">No {activeTab} bookings yet.</p>
              <p className="text-[9px] text-zinc-800 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                Reservations will appear here once guests book via the parking app.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingLogs;
