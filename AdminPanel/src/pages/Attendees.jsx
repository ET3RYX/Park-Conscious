import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, Download, 
  CheckCircle2, XCircle, Clock, 
  ChevronRight, Calendar, Mail, Ticket, Image,
  Loader2, RefreshCw
} from 'lucide-react';
import { bookingService } from '../services/api';

const StatusBadge = ({ attended }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
    attended 
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  }`}>
    {attended ? <CheckCircle2 size={12} /> : <Clock size={12} />}
    {attended ? 'Attended' : 'Pending'}
  </span>
);

const Attendees = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, attended, pending
  const [eventFilter, setEventFilter] = useState('all');

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
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
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
                            <Mail size={10} />
                            {item.user?.email || item.email || 'N/A'}
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
                      <StatusBadge attended={item.attended} />
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
