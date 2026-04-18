import React, { useState, useEffect } from 'react';
import { 
  Search, IndianRupee, Save, RefreshCw, 
  CheckCircle, AlertCircle, ChevronRight, 
  Calendar, Lock, HardDrive, Target,
  RefreshCw, ShieldAlert
} from 'lucide-react';
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
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch events', error);
            setStatus({ type: 'error', message: 'CORE SYNCHRONIZATION FAILURE' });
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
            if (isNaN(price)) throw new Error('INVALID CURRENCY FORMAT');

            await eventService.update(selectedEvent._id, { price });
            
            setEvents(prev => prev.map(ev => 
                ev._id === selectedEvent._id ? { ...ev, price } : ev
            ));
            setSelectedEvent(prev => ({ ...prev, price }));
            
            setStatus({ type: 'success', message: 'PROTOCOL SYNCHRONIZED' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error('Update failed', error);
            setStatus({ type: 'error', message: error.message || 'TRANSMISSION REJECTED' });
        } finally {
            setUpdating(false);
        }
    };

    const filteredEvents = events.filter(ev => 
        (ev.title || ev.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/50 pb-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                        Economic Terminal
                    </h1>
                    <p className="text-slate-500 text-[10px] sm:text-[11px] mt-4 font-black uppercase tracking-[0.4em] flex items-center gap-2">
                        <HardDrive size={14} className="text-sky-500" /> Ticket Tariff Modification Layer
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-full bg-slate-950">
                        Node: {Math.random().toString(36).substring(7).toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Repository Navigator */}
                <div className="lg:col-span-4 space-y-8">
                   <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                <Search className="text-sky-500" size={16} /> ENTITY SEARCH
                            </h3>
                            {loading && <RefreshCw className="animate-spin text-slate-700" size={14} />}
                        </div>
                        
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="IDENTIFIER OR TITLE..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black tracking-widest text-white focus:outline-none focus:border-sky-500/50 transition-all uppercase placeholder:text-slate-800"
                            />
                        </div>

                        <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center gap-4 opacity-30">
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-sky-500 animate-spin" />
                                    <span className="text-[9px] font-black tracking-[0.3em] uppercase">Booting...</span>
                                </div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="py-20 text-center text-[9px] font-black text-slate-800 uppercase tracking-[0.3em]">
                                    No Matching Entities
                                </div>
                            ) : (
                                filteredEvents.map(ev => (
                                    <button
                                        key={ev._id}
                                        onClick={() => {
                                            setSelectedEvent(ev);
                                            setNewPrice(ev.price);
                                            setStatus({ type: '', message: '' });
                                        }}
                                        className={`w-full text-left p-5 rounded-3xl border transition-all group flex items-center justify-between relative overflow-hidden ${selectedEvent?._id === ev._id ? 'bg-sky-600 border-sky-400 text-white shadow-xl shadow-sky-900/20' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                                    >
                                        <div className="min-w-0 z-10">
                                            <p className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedEvent?._id === ev._id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                {ev.title || ev.name || 'Untitled Entity'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 opacity-50">
                                                <Calendar size={10} />
                                                <span className="text-[8px] font-black tracking-widest uppercase">{new Date(ev.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className={`transition-all duration-500 ${selectedEvent?._id === ev._id ? 'text-white translate-x-0' : 'text-slate-800 translate-x-[-10px] group-hover:translate-x-0 group-hover:text-slate-500'}`} />
                                    </button>
                                ))
                            )}
                        </div>
                   </div>
                </div>

                {/* Control Interface */}
                <div className="lg:col-span-8">
                    {selectedEvent ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 space-y-12 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12">
                                <IndianRupee size={320} />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-8 border-b border-slate-800 pb-12">
                                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-slate-800 shadow-2xl shrink-0 group">
                                    <img 
                                        src={(selectedEvent.images && selectedEvent.images[0]) || selectedEvent.image || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'} 
                                        className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0" 
                                        alt="" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-[0.2em] uppercase ${selectedEvent.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                            {selectedEvent.status}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">UID: {selectedEvent._id}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{selectedEvent.title}</h2>
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Target size={12} /> Targeting Cluster Layer 01
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Legacy Tariff</label>
                                        <div className="bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-6 flex items-center gap-4 group transition-all hover:border-slate-700">
                                            <IndianRupee size={24} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                                            <span className="text-4xl font-black text-slate-500">₹{selectedEvent.price}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] ml-1">Specified Adjustment</label>
                                        <div className="relative group">
                                            <IndianRupee size={32} className="absolute left-8 top-1/2 -translate-y-1/2 text-sky-500/50 group-focus-within:text-sky-500 transition-all group-focus-within:scale-110" />
                                            <input 
                                                type="number" 
                                                required
                                                value={newPrice}
                                                onChange={(e) => setNewPrice(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-[2.5rem] pl-20 pr-8 py-8 text-6xl font-black text-white focus:outline-none focus:border-sky-500 transition-all shadow-inner font-mono"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end space-y-6">
                                    {status.message && (
                                        <div className={`p-6 rounded-3xl border text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 animate-in fade-in slide-in-from-top-2 shadow-2xl ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                            <div className={`w-3 h-3 rounded-full ${status.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                            {status.message}
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={updating || parseInt(newPrice) === selectedEvent.price}
                                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-8 rounded-[2.5rem] text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-sky-900/40 active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-4 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        {updating ? (
                                            <RefreshCw size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                INITIALIZE SYNC
                                                <Lock size={20} className="group-hover:scale-110 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                        <ShieldAlert size={16} className="text-slate-700 shrink-0 mt-0.5" />
                                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.2em] leading-relaxed">
                                            Authorized adjustments are permanent and synchronize across all primary and edge cached platform nodes within 1.5s.
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-[3rem] p-40 flex flex-col items-center justify-center space-y-10 text-center h-full group transition-all hover:bg-slate-900/50 shadow-inner">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 group-hover:border-sky-500/50 duration-700 relative overflow-hidden">
                                <IndianRupee className="text-slate-800 group-hover:text-sky-500 transition-colors" size={48} />
                                <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[14px] font-black text-slate-600 uppercase tracking-[0.5em]">Terminal Standby</h3>
                                <p className="text-slate-700 text-[10px] max-w-sm font-black uppercase tracking-[0.3em] leading-loose italic opacity-40">
                                    Awaiting entity selection from central repository to initialize adjustment protocols.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceUpdater;
