import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, Download, 
  CheckCircle2, XCircle, Clock, 
  ChevronRight, Calendar, Mail, Ticket, Image,
  Loader2, RefreshCw, Trash2, History,
  Activity, ArrowUpRight
} from 'lucide-react';
import { bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ attended, onToggle, loading }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    disabled={loading}
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
    attended 
      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
    {loading ? <Loader2 size={12} className="animate-spin" /> : attended ? <CheckCircle2 size={12} /> : <Clock size={12} />}
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

  useEffect(() => { fetchData(); }, []);

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
      alert("Failed to update status.");
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY DELETE this booking?")) return;
    try {
      await bookingService.deleteBooking(id);
      setAttendees(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      alert("Failed to delete booking.");
    }
  };

  const handleSyncPayments = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const { data } = await bookingService.reconcilePayments();
      alert(data.message);
      if (data.recovered > 0 || data.failed > 0) fetchData();
    } catch (err) {
      alert("Verification failed: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  const handleBroadcast = async () => {
    const targetAttendees = filteredData.filter(a => a.status === 'Confirmed' && a.email && !a.emailSent);
    if (targetAttendees.length === 0) {
      alert("No pending unsent emails found in the current filtered view.");
      return;
    }

    if (!window.confirm(`Broadcasting tickets to ${targetAttendees.length} verified attendees?`)) return;

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
      alert(`Success! Dispatched ${processed} unique tickets.`);
      fetchData(); 
    } catch (err) {
      alert(`BROADCAST FAILED: ${err.message}`);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
            <Activity size={12} /> Live Entry Telemetry
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            Guest Registry
            <div className="h-1 w-12 bg-sky-600 rounded-full" />
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {isSuperAdmin ? `Global management of ${attendees.length} ticket holders.` : `Viewing ${attendees.length} guests for your assigned events.`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button 
            onClick={handleBroadcast}
            disabled={loading || broadcasting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-xl shadow-emerald-900/20 disabled:opacity-50"
          >
            <Mail size={16} /> Broadcast Tickets
          </button>
          
          {isSuperAdmin && (
            <button 
              onClick={handleSyncPayments}
              disabled={loading || syncing}
              className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <History size={16} /> Sync
            </button>
          )}

          <button className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-xl shadow-sky-900/20">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <input 
            type="text"
            placeholder="Search Identity or Ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-sky-500/50 transition-all font-mono text-xs uppercase tracking-widest"
          />
        </div>
        
        <select 
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-400 px-4 py-4 rounded-2xl focus:outline-none text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
        >
          <option value="all">All Experiences</option>
          {eventOptions.filter(opt => opt !== 'all').map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-400 px-4 py-4 rounded-2xl focus:outline-none text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
        >
          <option value="all">Any Protocol</option>
          <option value="attended">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Broadcast Progress */}
      {broadcasting && (
        <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-3xl p-8 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                    <Mail size={20} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-emerald-400 text-sm font-black uppercase tracking-widest">Transmitting Digital Tickets</h3>
                    <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest mt-1">Transactional stream active</p>
                  </div>
              </div>
              <div className="text-right">
                 <span className="text-4xl font-black text-white">{broadcastProgress.current}</span>
                 <span className="text-slate-500 text-sm font-bold ml-1">/ {broadcastProgress.total}</span>
              </div>
           </div>
           <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(broadcastProgress.current / broadcastProgress.total) * 100}%` }} />
           </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-sky-600 animate-spin" size={48} />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Accessing Data Stream</span>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/30 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] border-b border-slate-800">
                  <th className="px-8 py-5">Guest Identity</th>
                  <th className="px-8 py-5">Assigned Experience</th>
                  <th className="px-8 py-5">Ticket Hash</th>
                  <th className="px-8 py-5">Verification</th>
                  <th className="px-8 py-5 text-right">Registered</th>
                  <th className="px-8 py-5 text-right w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredData.map((item) => (
                  <tr key={item._id} className="group hover:bg-slate-800/20 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-sky-500/50 transition-all">
                          <Users size={16} className="text-slate-500 group-hover:text-sky-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight">{item.user?.name || 'Anonymous'}</p>
                          <p className="text-[10px] font-medium text-slate-500">
                            {item.user?.email || item.email || 'N/A'}
                            {item.emailSent && <span className="ml-2 py-0.5 px-1.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Sent</span>}
                          </p>
                          {item.customData && Object.keys(item.customData).length > 0 && (
                            <div className="mt-2 space-y-1.5 border-t border-slate-800 pt-2">
                              {Object.entries(item.customData).map(([fieldId, value]) => {
                                const customFieldObj = item.event?.customForms?.find(f => String(f.id) === String(fieldId));
                                const label = customFieldObj ? customFieldObj.label : fieldId;
                                return (
                                  <div key={fieldId} className="flex flex-col gap-0.5">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-sky-500/70">{label}</span>
                                    <span className="text-[10px] font-bold text-slate-300 truncate max-w-[150px]">{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-tight truncate max-w-[200px]">{item.event?.title || 'External Event'}</p>
                      <p className="text-[10px] font-medium text-slate-600 mt-0.5 uppercase tracking-widest">
                        {item.event?.date ? new Date(item.event.date).toLocaleDateString() : 'TBA'}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black text-sky-500 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20 uppercase tracking-widest">
                          {item.ticketId || 'NO-HASH'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge 
                        attended={item.attended} 
                        onToggle={() => handleToggleAttendance(item)}
                        loading={toggleLoading === item.ticketId}
                      />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] font-medium text-slate-600 mt-1 uppercase tracking-widest">System Record</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDeleteBooking(item._id)}
                        className="p-2.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-700">
              <Users size={32} />
            </div>
            <div className="max-w-xs">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">No Guest Matches Found</p>
              <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest mt-2 leading-relaxed">
                Adjust your verification type or search filters to locate specific entry credentials.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendees;
