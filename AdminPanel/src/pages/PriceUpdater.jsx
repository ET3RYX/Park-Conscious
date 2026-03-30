import React, { useState, useEffect } from 'react';
import { Search, IndianRupee, Save, Loader2, CheckCircle2, AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import { eventService } from '../services/api';

const PriceUpdater = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newPrice, setNewPrice] = useState('');
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await eventService.getAll();
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events', error);
            setStatus({ type: 'error', message: 'Failed to sync with repository.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedEvent || !newPrice) return;

        setUpdating(true);
        setStatus({ type: '', message: '' });
        
        try {
            const price = parseInt(newPrice);
            if (isNaN(price)) throw new Error('Invalid price format');

            await eventService.update(selectedEvent._id, { price });
            
            // Update local state
            setEvents(prev => prev.map(ev => 
                ev._id === selectedEvent._id ? { ...ev, price } : ev
            ));
            setSelectedEvent(prev => ({ ...prev, price }));
            
            setStatus({ type: 'success', message: 'Price protocol synchronized successfully.' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error('Update failed', error);
            setStatus({ type: 'error', message: error.message || 'Transmission failure. Update rejected.' });
        } finally {
            setUpdating(false);
        }
    };

    const filteredEvents = events.filter(ev => 
        ev.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Price Controller</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Quick-access terminal for ticket tariff management.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Event Selection List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input 
                            type="text" 
                            placeholder="Filter events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-slate-700 font-medium"
                        />
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-10 text-center text-[10px] uppercase font-bold text-slate-600 tracking-widest animate-pulse">Syncing...</div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="p-10 text-center text-[10px] uppercase font-bold text-slate-700 tracking-widest">No Matches</div>
                        ) : (
                            filteredEvents.map(ev => (
                                <button
                                    key={ev._id}
                                    onClick={() => {
                                        setSelectedEvent(ev);
                                        setNewPrice(ev.price);
                                        setStatus({ type: '', message: '' });
                                    }}
                                    className={`w-full text-left px-4 py-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-all group flex items-center justify-between ${selectedEvent?._id === ev._id ? 'bg-slate-800/50' : ''}`}
                                >
                                    <div className="min-w-0">
                                        <p className={`text-[11px] font-bold uppercase tracking-tight truncate transition-colors ${selectedEvent?._id === ev._id ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {ev.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Calendar size={10} className="text-slate-600" />
                                            <span className="text-[9px] text-slate-600 font-bold">{new Date(ev.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className={`transition-transform ${selectedEvent?._id === ev._id ? 'text-sky-400 translate-x-1' : 'text-slate-800 group-hover:text-slate-600'}`} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Control Panel */}
                <div className="lg:col-span-2">
                    {selectedEvent ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <IndianRupee size={200} />
                            </div>

                            <div className="flex items-center gap-4 border-b border-slate-800 pb-8">
                                <img 
                                    src={selectedEvent.images[0] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'} 
                                    className="w-16 h-16 rounded-xl object-cover border border-slate-800" 
                                    alt="" 
                                />
                                <div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{selectedEvent.title}</h2>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Entity ID: {selectedEvent._id.slice(-8)}</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Tariff</label>
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 flex items-center gap-3">
                                            <IndianRupee size={16} className="text-slate-600" />
                                            <span className="text-2xl font-bold text-slate-400">₹{selectedEvent.price}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">New Specified Price</label>
                                        <div className="relative group">
                                            <IndianRupee size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-500 transition-transform group-focus-within:scale-110" />
                                            <input 
                                                type="number" 
                                                required
                                                value={newPrice}
                                                onChange={(e) => setNewPrice(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-14 pr-5 py-5 text-3xl font-bold text-white focus:outline-none focus:border-sky-500/50 transition-all shadow-inner"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end space-y-4">
                                    {status.message && (
                                        <div className={`px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-1 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                            {status.message}
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={updating || parseInt(newPrice) === selectedEvent.price}
                                        className="w-full bg-sky-600 text-white font-bold py-5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-sky-900/20 hover:bg-sky-500 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-3 group"
                                    >
                                        {updating ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <>
                                                Update Price Protocol
                                                <Save size={16} className="group-hover:translate-y-[-1px] transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[10px] text-center text-slate-600 font-medium italic">Authorized changes are immediate across active platform clusters.</p>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-20 flex flex-col items-center justify-center space-y-6 text-center h-full">
                            <div className="w-20 h-20 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                                <IndianRupee className="text-slate-800" size={32} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Protocol Inactive</h3>
                                <p className="text-slate-600 text-xs mt-2 max-w-xs font-medium italic">Please select an event entity from the repository list to initialize price modification protocols.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceUpdater;
