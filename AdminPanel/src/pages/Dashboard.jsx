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
    sky:     'text-sky-500 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber:   'text-amber-500 bg-amber-500/10 border-amber-500/20',
    violet:  'text-violet-500 bg-violet-500/10 border-violet-500/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            {trend && (
              <span className={`text-[10px] font-black flex items-center gap-0.5 ${trend > 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                {trend > 0 && <ArrowUpRight size={10} />}
                {trend}%
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 ${colors[color]}`}>
          <Icon size={20} />
        </div>
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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-900/20">
          <ScanLine size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Entry Verification</h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Live Ticket Validation</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          value={ticketInput}
          onChange={(e) => setTicketInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
          placeholder="ENTER TICKET CREDENTIALS..."
          className="flex-1 bg-slate-950 border border-slate-800 text-white placeholder:text-slate-700 rounded-xl px-5 py-4 font-mono text-xs focus:outline-none focus:border-sky-500/50 transition-all uppercase tracking-widest"
        />
        <button
          onClick={handleCheckIn}
          disabled={loading || !ticketInput.trim()}
          className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-[0.2em] px-8 rounded-xl transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
          Validate
        </button>
      </div>

      {result && (
        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border animate-in slide-in-from-top-2 ${
          result.success
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {result.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <Activity size={12} /> Live System Status
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            System Dashboard
            <div className="h-1 w-12 bg-sky-600 rounded-full" />
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {isSuperAdmin ? 'Global organizational metrics and ticket telemetry.' : 'Assigned event performance and guest data.'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Force Sync
        </button>
      </div>

      {loading && !bookingStats ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-sky-600 animate-spin" size={48} />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Accessing Data Stream</span>
        </div>
      ) : (
        <>
          {/* Top Line Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Inventory Breakdown</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-200">Active Listings</span>
                    </div>
                    <span className="text-xs font-black text-emerald-500">{eventStats.published}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span className="text-xs font-bold text-slate-200">Draft Protocols</span>
                    </div>
                    <span className="text-xs font-black text-slate-400">{eventStats.draft}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stream */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Experience Stream</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] mt-1">Live Revenue & Admittance</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Users size={16} className="text-slate-400" />
                </div>
              </div>

              {bookingStats?.events?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-950/30 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] border-b border-slate-800">
                        <th className="px-8 py-5">Assigned Experience</th>
                        <th className="px-8 py-5 text-center">Tickets</th>
                        <th className="px-8 py-5 text-center">Admitted</th>
                        <th className="px-8 py-5 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {bookingStats.events.map((ev, i) => (
                        <tr key={ev.eventId || i} className="group hover:bg-slate-800/20 transition-all duration-300">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-sky-500 uppercase">
                                {ev.title?.charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight">{ev.title || 'Untitled'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center font-mono text-xs text-slate-400">{ev.totalTickets}</td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              {ev.attended}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="text-xs font-bold text-white font-mono">₹{ev.revenue.toLocaleString('en-IN')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-700">
                    <TrendingDown size={32} />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">No Active Streams Detected</p>
                    <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest mt-2 leading-relaxed">
                      Attendee records and revenue data will populate once valid bookings occur in the production gateway.
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
