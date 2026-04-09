import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Calendar, Users, TrendingUp, Activity,
  IndianRupee, Ticket, QrCode, ScanLine, CheckCircle2,
  XCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { eventService } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Stat Card (existing style preserved) ─────────────────────────────────────
const StatsCard = ({ title, value, icon: Icon, color = 'sky', sub }) => {
  const colorStyles = {
    sky:     'text-sky-500 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber:   'text-amber-500 bg-amber-500/10 border-amber-500/20',
    rose:    'text-rose-500 bg-rose-500/10 border-rose-500/20',
    violet:  'text-violet-500 bg-violet-500/10 border-violet-500/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorStyles[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

// ── QR Check-In Tool ──────────────────────────────────────────────────────────
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <ScanLine size={18} className="text-sky-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">QR Ticket Check-In</h3>
          <p className="text-slate-600 text-xs mt-0.5">Scan or type a Ticket ID to mark attendance</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          value={ticketInput}
          onChange={(e) => setTicketInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
          placeholder="e.g. TKT-A1B2C3D4"
          className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-sky-500/60 transition-all"
        />
        <button
          onClick={handleCheckIn}
          disabled={loading || !ticketInput.trim()}
          className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
          Check In
        </button>
      </div>

      {result && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border ${
          result.success
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {result.success ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
          {result.message}
        </div>
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin' || admin?.role === 'admin' || admin?.role === 'owner';

  const [eventStats, setEventStats] = useState({ totalEvents: 0, published: 0, draft: 0 });
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Existing: fetch events for event counts
      const { data } = await eventService.getAll();
      if (Array.isArray(data)) {
        setEventStats({
          totalEvents: data.length,
          published:   data.filter(e => e.status === 'published').length,
          draft:       data.filter(e => e.status === 'draft').length,
        });
      }
    } catch (e) {
      console.error('Event fetch failed', e);
    }

    try {
      // New: fetch organizer/booking stats
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isSuperAdmin ? 'DASHBOARD' : 'ORGANIZER OVERVIEW'}
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {isSuperAdmin 
              ? 'System overview, event performance and ticket telemetry.' 
              : 'Real-time performance and guest data for your assigned experiences.'
            }
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Row 1 — Event Counts (existing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title={isSuperAdmin ? "Total Repository" : "Your Experiences"}  value={eventStats.totalEvents} icon={BarChart3}  color="sky"    />
        <StatsCard title={isSuperAdmin ? "Active Listings" : "Live Tickets"}   value={eventStats.published}   icon={Calendar}   color="emerald" />
        <StatsCard title={isSuperAdmin ? "Draft Protocol" : "Assigned Folders"}    value={eventStats.draft}       icon={Activity}   color="amber"  />
      </div>

      {/* Row 2 — Booking / Revenue Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-sky-500 animate-spin" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Revenue"
              value={`₹${(bookingStats?.totalRevenue || 0).toLocaleString('en-IN')}`}
              icon={IndianRupee} color="emerald"
            />
            <StatsCard
              title="Tickets Sold"
              value={bookingStats?.totalSales || 0}
              icon={Ticket} color="sky"
            />
            <StatsCard
              title="Attended"
              value={bookingStats?.totalAttended || 0}
              icon={Users} color="violet"
            />
            <StatsCard
              title="Attendance Rate"
              value={`${attendanceRate}%`}
              icon={TrendingUp} color="amber"
            />
          </div>

          {/* Row 3 — Check-In + Event Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* QR Check-In tool */}
            <CheckInTool />

            {/* Attendee breakdown per event */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Attendee Stream</h3>
                <p className="text-slate-600 text-xs mt-1">Revenue and attendance per event</p>
              </div>

              {bookingStats?.events?.length > 0 ? (
                <div className="overflow-y-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-600 font-black uppercase tracking-widest">
                        <th className="text-left px-5 py-3">Event</th>
                        <th className="text-right px-5 py-3">Sold</th>
                        <th className="text-right px-5 py-3">In</th>
                        <th className="text-right px-5 py-3">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingStats.events.map((ev, i) => (
                        <tr key={ev.eventId || i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3 text-slate-300 font-medium truncate max-w-[140px]">{ev.title || 'Untitled'}</td>
                          <td className="px-5 py-3 text-right text-slate-400 font-mono">{ev.totalTickets}</td>
                          <td className="px-5 py-3 text-right text-emerald-400 font-mono font-bold">{ev.attended}</td>
                          <td className="px-5 py-3 text-right text-emerald-400 font-mono font-bold">₹{ev.revenue.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] space-y-3">
                  <Users className="text-slate-800" size={40} />
                  <p className="text-slate-600 text-xs font-medium text-center max-w-xs">
                    User transaction records will populate here once active bookings begin.
                  </p>
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
