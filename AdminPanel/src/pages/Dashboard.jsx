import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Calendar, Users, TrendingUp, Activity,
  IndianRupee, Ticket, QrCode, ScanLine, CheckCircle2,
  XCircle, Loader2, RefreshCw, ChevronRight,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { eventService } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatsCard = ({ title, value, icon: Icon, color = 'sky', trend }) => {
  const colors = {
    sky:     'text-sky-400 bg-sky-500/5 border-sky-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
    amber:   'text-amber-400 bg-amber-500/5 border-amber-500/10',
    violet:  'text-violet-400 bg-violet-500/5 border-violet-500/10',
  };

  return (
    <div className="glass-card rounded-[2rem] p-7 group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:bg-white/5 ${colors[color]}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend > 0 ? <ArrowUpRight size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-3xl font-bold font-outfit text-zinc-100 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const CheckInTool = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    const id = ticketInput.trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/api/bookings/check-in', { ticketId: id });
      setResult({ success: true, message: data.message || 'Check-in successful!' });
      setTicketInput('');
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Invalid or already checked-in ticket.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <ScanLine size={18} className="text-sky-400" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-[0.1em]">Entry Verification</h3>
          <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest mt-0.5">Live Ticket Validation</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={ticketInput}
          onChange={(e) => setTicketInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
          placeholder="ENTER TICKET CREDENTIALS..."
          className="flex-1 bg-white/[0.02] border border-white/5 text-zinc-100 placeholder:text-zinc-800 rounded-xl px-5 py-3.5 font-mono text-[10px] focus:outline-none focus:border-sky-500/30 transition-all uppercase tracking-widest"
        />
        <button
          onClick={handleCheckIn}
          disabled={loading || !ticketInput.trim()}
          className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-[#050508] font-black text-[9px] uppercase tracking-[0.2em] px-6 rounded-xl transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
          Validate
        </button>
      </div>

      {result && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border animate-in slide-in-from-top-2 ${
          result.success
            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
            : 'bg-red-500/5 border-red-500/10 text-red-400'
        }`}>
          {result.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {result.message}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const [eventStats, setEventStats] = useState({ totalEvents: 0, published: 0, draft: 0 });
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await eventService.getAll();
      if (Array.isArray(data)) {
        setEventStats({
          totalEvents: data.length,
          published:   data.filter(e => e.status === 'published' || e.status === 'Published').length,
          draft:       data.filter(e => e.status === 'draft').length,
        });
      }
    } catch (e) {
      console.error('Event fetch failed', e);
    }

    try {
      const { data } = await api.get('/api/admin/organizer/stats/global');
      setBookingStats(data);
    } catch (e) {
      console.error('Booking stats fetch failed', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const attendanceRate = bookingStats?.totalSales > 0
    ? Math.round((bookingStats.totalAttended / bookingStats.totalSales) * 100)
    : 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-2">
            <Activity size={10} /> Live System Status
          </div>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight uppercase flex items-center gap-3">
            System Dashboard
            <div className="h-[2px] w-8 bg-sky-500 rounded-full opacity-50" />
          </h1>
          <p className="text-zinc-600 text-xs font-medium mt-1">
            {isSuperAdmin ? 'Global organizational metrics and ticket telemetry.' : 'Assigned event performance and guest data.'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 text-zinc-500 hover:text-zinc-200 px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Force Sync
        </button>
      </div>

      {loading && !bookingStats ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-sky-500/50 animate-spin" size={32} />
          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em]">Accessing Data Stream</span>
        </div>
      ) : (
        <>
          {/* Top Line Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Total Events" 
              value={eventStats.totalEvents} 
              icon={BarChart3} 
              color="sky" 
              trend={+12}
            />
            <StatsCard 
              title="Global Revenue" 
              value={`₹${(bookingStats?.totalRevenue || 0).toLocaleString('en-IN')}`} 
              icon={IndianRupee} 
              color="emerald" 
              trend={+8}
            />
            <StatsCard 
              title="Tickets Sold" 
              value={bookingStats?.totalSales || 0} 
              icon={Ticket} 
              color="sky" 
            />
            <StatsCard 
              title="Attendance Rate" 
              value={`${attendanceRate}%`} 
              icon={TrendingUp} 
              color="violet" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Tools */}
            <div className="lg:col-span-1 space-y-8">
              <CheckInTool />
              
              <div className="glass-card rounded-[2.5rem] p-8">
                <h4 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-6 ml-1">Inventory Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[11px] font-bold text-zinc-400">Active Listings</span>
                    </div>
                    <span className="text-xs font-black font-outfit text-emerald-400">{eventStats.published}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-[11px] font-bold text-zinc-400">Draft Protocols</span>
                    </div>
                    <span className="text-xs font-black font-outfit text-zinc-600">{eventStats.draft}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stream */}
            <div className="lg:col-span-2 glass-card rounded-[2.5rem] overflow-hidden">
              <div className="px-8 py-7 border-b border-white/[0.02] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-[0.1em]">Experience Stream</h3>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Live Revenue & Admittance</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center">
                  <Users size={14} className="text-zinc-500" />
                </div>
              </div>

              {bookingStats?.events?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.2em] border-b border-white/[0.02]">
                        <th className="px-8 py-5">Assigned Experience</th>
                        <th className="px-8 py-5 text-center">Tickets</th>
                        <th className="px-8 py-5 text-center">Admitted</th>
                        <th className="px-8 py-5 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {bookingStats.events.map((ev, i) => (
                        <tr key={ev.eventId || i} className="group hover:bg-white/[0.01] transition-all duration-300">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[9px] font-bold text-sky-400 group-hover:border-sky-500/20 transition-all">
                                {ev.title?.charAt(0)}
                              </div>
                              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors tracking-tight">{ev.title || 'Untitled'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center font-outfit text-xs text-zinc-600">{ev.totalTickets}</td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-xs font-bold text-emerald-500/80 font-outfit">
                              {ev.attended}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="text-xs font-bold text-zinc-200 font-outfit">₹{ev.revenue.toLocaleString('en-IN')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-24 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-800">
                    <TrendingDown size={24} />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-tight">No Active Streams Detected</p>
                    <p className="text-[9px] text-zinc-800 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                      Attendee records and revenue data will populate once valid bookings occur.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
