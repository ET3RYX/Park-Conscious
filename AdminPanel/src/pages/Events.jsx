import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Calendar, Tag, ChevronRight } from 'lucide-react';
import { eventService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EventStatusBadge = ({ status }) => {
  const styles = {
    draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Archive this event? It will be hidden from public lists but retained in the system.')) {
      try {
        await eventService.delete(id);
        fetchEvents();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (event.location?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EVENT REPOSITORY</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage and audit the Park Conscious inventory.</p>
        </div>
        <button 
          onClick={() => navigate('/events/create')}
          className="bg-sky-600 text-white font-bold text-xs uppercase px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-sky-900/20 hover:bg-sky-500 active:scale-95 transition-all"
        >
          <Plus size={16} /> Deploy New Event
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-12 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-slate-700 transition"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-40 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-slate-700 transition"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30">
                <th className="px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">Entity Details</th>
                <th className="px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">Deployment</th>
                <th className="px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center text-slate-600 font-medium">Syncing repository data...</td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center text-slate-600 font-medium">No records found matching criteria.</td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img 
                          src={event.images[0] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'} 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-800 group-hover:border-sky-500/30 transition-colors" 
                          alt="" 
                        />
                        <div>
                          <p className="text-slate-200 font-bold group-hover:text-white transition-colors uppercase tracking-tight">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-sky-500">₹{event.price}</span>
                            <span className="text-slate-600">•</span>
                            <EventStatusBadge status={event.status} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                          <Calendar size={12} className="text-slate-500" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] font-medium truncate max-w-[200px]">{event.location?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/events/edit/${event._id}`)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                          title="Edit Record"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Archive Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Events;
