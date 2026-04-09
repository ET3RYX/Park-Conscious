import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, Calendar, 
  Tag, ChevronRight, MapPin, Activity, 
  Archive, FileEdit, ExternalLink, Loader2
} from 'lucide-react';
import { eventService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventStatusBadge = ({ status }) => {
  const styles = {
    draft:     'bg-slate-500/10 text-slate-500 border-slate-500/20',
    published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  };

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles[status?.toLowerCase()] || styles.draft}`}>
      {status || 'Draft'}
    </span>
  );
};

const Events = () => {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === 'superadmin';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await eventService.getAll();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch events', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Archive this experience record? It will be deactivated from public visibility.')) {
      try {
        await eventService.delete(id);
        fetchEvents();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const safeTitle = (event.title || event.name || '').toLowerCase();
    const safeLocation = (event.location?.name || event.venue || '').toLowerCase();
    const matchesSearch = safeTitle.includes(searchTerm.toLowerCase()) || safeLocation.includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
            <Activity size={12} /> Asset Repository
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            Experience Hub
            <div className="h-1 w-12 bg-sky-600 rounded-full" />
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {isSuperAdmin ? 'Global registry of organizational assets and ticket protocols.' : 'Active management of assigned experiences.'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/events/create')}
          className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-xl shadow-sky-900/20"
        >
          <Plus size={16} /> Deploy Experience
        </button>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <input 
            type="text" 
            placeholder="Search Protocol or Venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-sky-500/50 transition-all font-mono text-xs uppercase tracking-widest"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-400 px-4 py-4 rounded-2xl focus:outline-none text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
        >
          <option value="all">Any Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Repository Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-sky-600 animate-spin" size={48} />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Syncing Repository</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-700">
              <Archive size={32} />
            </div>
            <div className="max-w-xs">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">No Experiences Detected</p>
              <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest mt-2 leading-relaxed">
                Database query returned zero records matching your current filter parameters or the repository is initialized empty.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/30 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] border-b border-slate-800">
                  <th className="px-8 py-5">Entity Details</th>
                  <th className="px-8 py-5">Deployment Metadata</th>
                  <th className="px-8 py-5">Access Protocols</th>
                  <th className="px-8 py-5 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="group hover:bg-slate-800/20 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-800 group-hover:border-sky-500/50 transition-all shadow-lg">
                          <img 
                            src={(event.images && event.images[0]) || event.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                            alt="" 
                          />
                          <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-sky-400 transition-colors">{event.title || 'Untitled'}</p>
                          <div className="flex items-center gap-3 mt-1.5 focus:outline-none">
                            <span className="text-[10px] font-black text-sky-500 bg-sky-500/5 px-2 py-0.5 rounded border border-sky-500/20 uppercase">₹{event.price || 0}</span>
                            <EventStatusBadge status={event.status} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5 font-medium">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-widest">
                          <Calendar size={12} className="text-slate-600" />
                          <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest">
                          <MapPin size={12} className="text-slate-600" /> 
                          <span className="truncate max-w-[200px]">{event.location?.name || event.venue || 'TBA'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex -space-x-1.5">
                         {[1, 2, 3].map(i => (
                           <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 text-[8px] font-black text-slate-500 flex items-center justify-center">
                             {i}
                           </div>
                         ))}
                         <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 text-[8px] font-black text-sky-500 flex items-center justify-center">+</div>
                       </div>
                       <p className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-widest leading-none">Shared Access Nodes</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/events/edit/${event._id}`)}
                          className="p-2.5 text-slate-600 hover:text-sky-500 hover:bg-sky-500/10 rounded-xl transition-all"
                        >
                          <FileEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="p-2.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
