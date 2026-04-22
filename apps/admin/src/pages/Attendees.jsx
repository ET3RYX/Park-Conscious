import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, Search, Filter, Download, 
  CheckCircle, XCircle, Clock, 
  ChevronRight, Calendar, Mail, Ticket, Image,
  RefreshCw, Trash2, History,
  Activity, ArrowUpRight
} from 'lucide-react';
import { bookingService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const StatusBadge = ({ attended, onToggle, loading }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    disabled={loading}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
    attended 
      ? 'bg-emerald-500/5 text-emerald-500 border border-emerald-500/10' 
      : 'bg-amber-500/5 text-amber-500 border border-amber-500/10'
  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}>
    {loading ? <RefreshCw size={10} className="animate-spin" /> : attended ? <CheckCircle size={10} /> : <Clock size={10} />}
    {attended ? 'Verified' : 'Pending'}
  </button>
);

const Attendees = () => {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [toggleLoading, setToggleLoading] = useState(null);
  
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({ current: 0, total: 0 });
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(async (force = false) => {
    if (force) setLoading(true);
    try {
      const { data } = await bookingService.getAllAttendees();
      setAttendees(data || []);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

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
      setAttendees(prev => prev.map(a => a._id === item._id ? { ...a, attended: !a.attended } : a));
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("ARE YOU SURE? THIS IS PERMANENT.")) return;
    try {
      await bookingService.deleteBooking(id);
      setAttendees(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSyncPayments = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const { data } = await bookingService.reconcilePayments();
      if (data.recovered > 0 || data.failed > 0) fetchData();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleBroadcast = async () => {
    const targetAttendees = filteredData.filter(a => a.status === 'Confirmed' && a.email && !a.emailSent);
    if (targetAttendees.length === 0) return;
    if (!window.confirm(`Dispatched tickets to ${targetAttendees.length} verified guests?`)) return;

    setBroadcasting(true);
    setBroadcastProgress({ current: 0, total: targetAttendees.length });

    const batchSize = 10; 
    let processed = 0;

    try {
      for (let i = 0; i < targetAttendees.length; i += batchSize) {
        const batch = targetAttendees.slice(i, i + batchSize);
        const batchIds = batch.map(b => b._id);
        const response = await bookingService.broadcastEmails(batchIds);
        if (!response.data.success) throw new Error(response.data.message);
        
        processed += batch.length;
        setBroadcastProgress({ current: processed, total: targetAttendees.length });
        if (i + batchSize < targetAttendees.length) await new Promise(res => setTimeout(res, 1000));
      }
      fetchData(); 
    } catch (err) {
      console.error(`Broadcast failed: ${err.message}`);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-2">
            <Activity size={10} /> Live Entry Telemetry
          </div>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight uppercase flex items-center gap-3">
            Guest Registry
            <div className="h-[2px] w-8 bg-sky-500 rounded-full opacity-50" />
          </h1>
          <p className="text-zinc-600 text-xs font-medium mt-1">
            {isSuperAdmin ? `Global management of ${attendees.length} ticket holders.` : `Viewing ${attendees.length} guests for your assigned events.`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchData(true)}
            className="p-2.5 bg-zinc-900/50 border border-white/5 text-zinc-500 hover:text-white rounded-xl transition-all"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button 
            onClick={handleBroadcast}
            disabled={loading || broadcasting}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Mail size={14} /> Broadcast
          </button>
          
          {isSuperAdmin && (
            <button 
              onClick={handleSyncPayments}
              disabled={loading || syncing}
              className="bg-zinc-900 border border-white/5 text-zinc-500 hover:text-zinc-200 px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <History size={14} /> Sync
            </button>
          )}

          <button className="bg-sky-500 hover:bg-sky-400 text-zinc-950 px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 glass-card rounded-2xl">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
          <input 
            type="text"
            placeholder="Search Identity or Ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.03] text-zinc-200 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500/20 transition-all font-mono text-[10px] uppercase tracking-widest"
          />
        </div>
        
        <select 
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="bg-white/[0.02] border border-white/[0.03] text-zinc-500 px-4 py-3 rounded-xl focus:outline-none text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-white/[0.04] transition-all"
        >
          <option value="all">All Experiences</option>
          {eventOptions.filter(opt => opt !== 'all').map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/[0.02] border border-white/[0.03] text-zinc-500 px-4 py-3 rounded-xl focus:outline-none text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-white/[0.04] transition-all"
        >
          <option value="all">Any Protocol</option>
          <option value="attended">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Broadcast Progress */}
      {broadcasting && (
        <div className="glass-card rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-500 border-emerald-500/10">
           <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Mail size={18} className="text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Transmitting Tickets</h3>
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest mt-0.5">Transactional stream active</p>
                  </div>
              </div>
              <div className="text-right">
                 <span className="text-3xl font-black text-zinc-100 font-outfit">{broadcastProgress.current}</span>
                 <span className="text-zinc-700 text-xs font-bold ml-1">/ {broadcastProgress.total}</span>
              </div>
           </div>
           <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-500" style={{ width: `${(broadcastProgress.current / broadcastProgress.total) * 100}%` }} />
           </div>
        </div>
      )}

      {/* Table Container */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="text-sky-500/50 animate-spin" size={32} />
            <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em]">Accessing Data Stream</span>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.2em] border-b border-white/[0.02]">
                  <th className="px-8 py-5">Guest Identity</th>
                  <th className="px-8 py-5">Assigned Experience</th>
                  <th className="px-8 py-5">Ticket Hash</th>
                  <th className="px-8 py-5">Verification</th>
                  <th className="px-8 py-5 text-right w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredData.map((item) => (
                  <tr key={item._id} className="group hover:bg-white/[0.01] transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-sky-500/20 transition-all">
                          <Users size={14} className="text-zinc-600 group-hover:text-sky-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-200 uppercase tracking-tight leading-none mb-1">{item.user?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none">
                              {item.user?.email || item.email || 'N/A'}
                            </p>
                            {item.emailSent && <span className="py-0.5 px-1.5 rounded-full bg-emerald-500/5 text-emerald-500 text-[7px] font-bold uppercase tracking-widest border border-emerald-500/10">Sent</span>}
                          </div>
                          {item.customData && Object.keys(item.customData).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-3">
                              {Object.entries(item.customData).map(([fieldId, value]) => {
                                const customFieldObj = item.event?.customForms?.find(f => String(f.id) === String(fieldId));
                                const label = customFieldObj ? customFieldObj.label : fieldId;
                                return (
                                  <div key={fieldId} className="flex flex-col gap-0.5">
                                    <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-sky-500/60 leading-none">{label}</span>
                                    <span className="text-[9px] font-medium text-zinc-400 truncate max-w-[120px] leading-none">{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-zinc-400">
                       <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight truncate max-w-[180px] leading-none mb-1">{item.event?.title || 'External Event'}</p>
                       <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest leading-none">
                        {item.event?.date ? new Date(item.event.date).toLocaleDateString() : 'TBA'}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[9px] font-mono font-bold text-sky-400/70 bg-sky-400/5 px-2 py-1 rounded-md border border-sky-400/10 uppercase tracking-widest">
                        {item.ticketId || 'NO-HASH'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge 
                        attended={item.attended} 
                        onToggle={() => handleToggleAttendance(item)}
                        loading={toggleLoading === item.ticketId}
                      />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDeleteBooking(item._id)}
                        className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-800">
              <Users size={24} />
            </div>
            <div className="max-w-xs">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-tight">No Guest Matches Found</p>
              <p className="text-[9px] text-zinc-800 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                Adjust your verification type or search filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendees;
