import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, Download, 
  CheckCircle2, XCircle, Clock, 
  ChevronRight, Calendar, Mail, Ticket, Image,
  Loader2, RefreshCw
} from 'lucide-react';
import { bookingService } from '../services/api';

const StatusBadge = ({ attended, onToggle, loading }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    disabled={loading}
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
    attended 
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' 
      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
    {loading ? <Loader2 size={12} className="animate-spin" /> : attended ? <CheckCircle2 size={12} /> : <Clock size={12} />}
    {attended ? 'Attended' : 'Pending'}
    {attended && !loading && <span className="ml-1 opacity-50 group-hover:opacity-100"><XCircle size={10} /></span>}
  </button>
);

const Attendees = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, attended, pending
  const [eventFilter, setEventFilter] = useState('all');
  const [toggleLoading, setToggleLoading] = useState(null); // stores ticketId
  
  // Bulk Email State
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({ current: 0, total: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await bookingService.getAllAttendees();
      setAttendees(data || []);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const eventOptions = useMemo(() => {
    if (!Array.isArray(attendees)) return ['all'];
    const names = attendees.map(a => a.event?.title).filter(Boolean);
    return ['all', ...new Set(names)];
  }, [attendees]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(attendees)) return [];
    return attendees.filter(item => {
      const matchesSearch = 
        (item.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.ticketId || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'attended' && item.attended) ||
        (statusFilter === 'pending' && !item.attended);

      const matchesEvent = 
        eventFilter === 'all' || 
        item.event?.title === eventFilter;

      return matchesSearch && matchesStatus && matchesEvent;
    });
  }, [attendees, searchQuery, statusFilter, eventFilter]);

  const handleToggleAttendance = async (item) => {
    if (toggleLoading) return;
    setToggleLoading(item.ticketId);
    try {
      if (item.attended) {
        await bookingService.unCheckIn(item.ticketId);
      } else {
        await bookingService.checkIn(item.ticketId);
      }
      // Optimistic/Lazy update
      setAttendees(prev => prev.map(a => a._id === item._id ? { ...a, attended: !a.attended } : a));
    } catch (err) {
      console.error("Toggle failed:", err);
      alert("Failed to update status.");
    } finally {
      setToggleLoading(null);
    }
  };

  const handleBroadcast = async () => {
    // Only target those who have an email address and haven't had their email sent yet
    const targetAttendees = attendees.filter(a => a.email && !a.emailSent);
    
    if (targetAttendees.length === 0) {
      alert("No pending unsent emails found in the current pool.");
      return;
    }

    if (!window.confirm(`Are you sure you want to broadcast tickets to ${targetAttendees.length} attendees? This process will run in batches.`)) return;

    setBroadcasting(true);
    setBroadcastProgress({ current: 0, total: targetAttendees.length });

    const batchSize = 20; // 20 per request to safely bypass Vercel limits
    let processed = 0;

    try {
      for (let i = 0; i < targetAttendees.length; i += batchSize) {
        const batch = targetAttendees.slice(i, i + batchSize);
        const batchIds = batch.map(b => b._id);
        
        await bookingService.broadcastEmails(batchIds);
        
        processed += batch.length;
        setBroadcastProgress({ current: processed, total: targetAttendees.length });
        
        // Wait 1 second between batches to be nice to the API provider
        if (i + batchSize < targetAttendees.length) {
          await new Promise(res => setTimeout(res, 1000));
        }
      }
      alert(`Successfully dispatched ${processed} exact emails!`);
      fetchData(); // Refresh UI to update the emailSent statuses
    } catch (err) {
      console.error("Broadcast interrupted:", err);
      alert(`Broadcast failed after sending ${processed} emails. Resume again later.`);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <Users className="text-sky-500" size={32} />
            ATTENDEE NEXUS
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Real-time management of {attendees.length} verified ticket holders.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            title="Reload Data"
            disabled={broadcasting}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleBroadcast}
            disabled={loading || broadcasting}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <Mail size={16} />
            {broadcasting ? 'Sending...' : 'Broadcast Tickets'}
          </button>
          <button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50" disabled={broadcasting}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-2xl">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search by Name, Email or Ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500/50 transition-all text-sm"
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl focus:outline-none text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <option value="all">All Events</option>
            {eventOptions.filter(opt => opt !== 'all').map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl focus:outline-none text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <option value="all">Any Status</option>
            <option value="attended">Attended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Progress Bar Overlay */}
      {broadcasting && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
           <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-300" style={{ width: `${(broadcastProgress.current / broadcastProgress.total) * 100}%` }}></div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Mail size={20} className="text-emerald-500 animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-emerald-400 font-black uppercase tracking-widest text-sm">Transmitting Tickets</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Please keep this window open until complete.</p>
                 </div>
              </div>
              <div className="text-right">
                 <span className="text-3xl font-black text-white">{broadcastProgress.current}</span>
                 <span className="text-slate-500 text-sm font-bold"> / {broadcastProgress.total}</span>
              </div>
           </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
               <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Syncing Telemetry...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Attendee</th>
                  <th className="px-6 py-5">Event Details</th>
                  <th className="px-6 py-5">Ticket ID</th>
                  <th className="px-6 py-5">Verification</th>
                  <th className="px-6 py-5">Screenshot</th>
                  <th className="px-6 py-5 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredData.map((item) => (
                  <tr key={item._id} className="group hover:bg-slate-800/30 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-sky-500/20">
                          {item.user?.name ? item.user.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight">{item.user?.name || 'Unknown'}</p>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                            <Mail size={10} className={item.emailSent ? 'text-emerald-500' : ''} />
                            {item.user?.email || item.email || 'N/A'}
                            {item.emailSent && <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest">Sent</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-300">{item.event?.title || 'External Event'}</p>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                          <Calendar size={10} />
                          {item.event?.date ? new Date(item.event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ticket size={14} className="text-slate-600" />
                        <code className="text-xs font-mono text-sky-500 font-bold bg-sky-500/5 px-2 py-1 rounded-md">
                          {item.ticketId || '--'}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        attended={item.attended} 
                        onToggle={() => handleToggleAttendance(item)}
                        loading={toggleLoading === item.ticketId}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {item.screenshotUrl ? (
                         <a 
                           href={item.screenshotUrl} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
                           title="View Verification Screenshot"
                         >
                           <div className="w-10 h-10 rounded-lg overflow-hidden border border-sky-500/30 bg-slate-800 flex-shrink-0">
                             <img src={item.screenshotUrl} alt="Proof" className="w-full h-full object-cover" />
                           </div>
                           <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest group-hover:text-sky-300">View</span>
                         </a>
                      ) : (
                         <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[10px] font-mono text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Users size={48} className="text-slate-800" />
            <div className="text-center">
              <p className="text-white font-bold uppercase tracking-widest text-sm">No Results Found</p>
              <p className="text-slate-600 text-xs mt-1">Try adjusting your filters or search query.</p>
            </div>
            <button 
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setEventFilter('all'); }}
              className="text-sky-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-sky-400 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendees;
