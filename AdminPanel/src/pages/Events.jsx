import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Calendar, Tag, MoreVertical } from 'lucide-react';
import { eventService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EventStatusBadge = ({ status }) => {
  const styles = {
    draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
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
    if (window.confirm('Are you sure you want to delete this event? This will not remove it from history but will hide it from active lists.')) {
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
                          event.location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">EVENTS REPOSITORY</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all public and private events for Park Conscious.</p>
        </div>
        <button 
          onClick={() => navigate('/events/create')}
          className="bg-gradient-to-r from-premier-500 to-vibrantBlue text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-premier-500/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} /> CREATE NEW EVENT
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-darkBackground-800 border border-white/5 rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by title, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-darkBackground-900 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-premier-400 transition"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-gray-500 md:ml-2" size={18} />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 md:w-40 bg-darkBackground-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 focus:outline-none focus:border-premier-400 transition"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table/Grid */}
      <div className="bg-darkBackground-800 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">Event Details</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">Date & Venue</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">Category</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">Status</th>
                <th className="px-8 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-500 animate-pulse font-medium">Loading events repository...</td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-500 font-medium">No events found matching your criteria.</td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={event.images[0] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'} 
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:border-premier-400/50 transition-colors" 
                          alt="" 
                        />
                        <div>
                          <p className="text-white font-bold text-base leading-snug group-hover:text-premier-400 transition-colors">{event.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">₹{event.price}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Calendar size={14} className="text-vibrantBlue" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-500 text-xs pl-5">{event.location.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-wrap gap-1">
                        {event.category.map((cat, idx) => (
                          <span key={idx} className="bg-white/5 text-gray-400 px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold border border-white/5 flex items-center gap-1">
                            <Tag size={10} /> {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <EventStatusBadge status={event.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/events/edit/${event._id}`)}
                          className="p-2.5 bg-darkBackground-900 border border-white/5 rounded-xl text-gray-400 hover:text-white hover:border-vibrantBlue transition-all shadow-sm"
                          title="Edit Event"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="p-2.5 bg-darkBackground-900 border border-white/5 rounded-xl text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-all shadow-sm"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
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
