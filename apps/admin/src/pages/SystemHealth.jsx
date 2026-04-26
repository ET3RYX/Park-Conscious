import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, Clock, Globe, Terminal, RefreshCw, Search, ChevronRight, Check, X, Cpu, HardDrive, Database } from 'lucide-react';
import { adminService } from '../services/api';

const SystemHealth = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLog, setExpandedLog] = useState(null);

    const fetchLogs = async () => {
        try {
            const { data } = await adminService.getLogs();
            setLogs(data);
        } catch (_err) {
            console.error('Diagnostic Link Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadInitialLogs = async () => {
            try {
                const { data } = await adminService.getLogs();
                if (isMounted) {
                    setLogs(data);
                    setLoading(false);
                }
            } catch (_err) {
                if (isMounted) setLoading(false);
            }
        };
        loadInitialLogs();
        return () => { isMounted = false; };
    }, []);

    const toggleResolve = async (id, currentStatus) => {
        try {
            await adminService.resolveLog(id, !currentStatus);
            setLogs(logs.map(log => log._id === id ? { ...log, resolved: !currentStatus } : log));
        } catch (_err) {
            alert('CRITICAL: Status Update Rejected by Server');
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             log.type?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'unresolved') return !log.resolved && matchesSearch;
        if (filter === 'admin' || filter === 'events' || filter === 'web') return log.source === filter && matchesSearch;
        return matchesSearch;
    });

    const getStatusColor = (type, resolved) => {
        if (resolved) return 'emerald';
        if (type === 'frontend_crash' || type === 'critical') return 'rose';
        return 'amber';
    };

    return (
        <div className="min-h-screen p-4 md:p-10 space-y-12 animate-in fade-in duration-1000 selection:bg-sky-500/30">
            {/* Header: Mission Control Style */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">System Core: Active</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight italic">
                        Diagnostics<span className="text-sky-500 not-italic">.</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
                        {['all', 'unresolved'].map(f => (
                            <button
                                key={f}
                                onClick={() => { setLoading(true); setFilter(f); fetchLogs(); }}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-sky-500 text-black shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => { setLoading(true); fetchLogs(); }}
                        className="group p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                    </button>
                </div>
            </div>

            {/* Metrics HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'emerald' },
                    { label: 'Unresolved Alerts', value: logs.filter(l => !l.resolved).length, icon: AlertTriangle, color: 'rose' },
                    { label: 'Ecosystem Load', value: 'Low', icon: Database, color: 'sky' },
                    { label: 'Diagnostic Limit', value: '200', icon: Cpu, color: 'amber' }
                ].map((stat, i) => (
                    <div key={i} className="relative group overflow-hidden bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 transition-all hover:bg-white/[0.04] hover:border-white/10">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 blur-[80px] rounded-full -mr-10 -mt-10 group-hover:bg-${stat.color}-500/10 transition-colors`}></div>
                        <div className="flex items-center justify-between mb-8">
                            <stat.icon size={20} className={`text-${stat.color}-500`} />
                            <div className={`w-1 h-1 rounded-full bg-${stat.color}-500 shadow-[0_0_8px_currentColor]`}></div>
                        </div>
                        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-2">{stat.label}</h4>
                        <p className="text-4xl font-black text-white tracking-tighter uppercase">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-sky-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="SEARCH CORE DUMP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl pl-16 pr-6 py-6 text-white text-xs focus:outline-none focus:border-sky-500/30 transition-all font-mono tracking-widest placeholder:text-slate-800"
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['admin', 'events', 'web'].map(s => (
                        <button
                            key={s}
                            onClick={() => { setLoading(true); setFilter(filter === s ? 'all' : s); fetchLogs(); }}
                            className={`px-8 py-4 rounded-3xl border transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 whitespace-nowrap ${filter === s ? 'bg-white text-black border-white shadow-2xl' : 'bg-white/5 border-white/5 text-slate-600 hover:text-white hover:border-white/20'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${s === 'admin' ? 'bg-sky-500' : s === 'events' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Diagnostic Feed */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-6">
                        <div className="w-12 h-12 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Syncing with Mainframe...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-40 flex flex-col items-center justify-center space-y-6 bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem]">
                        <X size={40} className="text-slate-800" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 italic">No Data Anomalies Detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredLogs.map(log => {
                            const color = getStatusColor(log.type, log.resolved);
                            return (
                                <div 
                                    key={log._id}
                                    className={`group relative border transition-all duration-500 rounded-[2rem] overflow-hidden ${log.resolved ? 'bg-white/[0.01] border-white/5 grayscale-[0.8] opacity-40' : 'bg-white/5 border-white/10 hover:border-white/20 shadow-2xl'}`}
                                >
                                    {/* Priority Rail */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${color}-500 shadow-[0_0_15px_currentColor] opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                                    <div className="p-8 md:px-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-${color}-500/30 text-${color}-500 bg-${color}-500/5`}>
                                                    {log.source} // {log.type}
                                                </span>
                                                <span className="text-[9px] font-medium text-slate-500 font-mono flex items-center gap-2">
                                                    <Clock size={12} className="opacity-50" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <h3 className={`text-2xl font-black tracking-tighter leading-none uppercase ${log.resolved ? 'text-slate-600 line-through' : 'text-zinc-100'}`}>
                                                    {log.message}
                                                </h3>
                                                <p className="text-[10px] font-mono text-slate-600 truncate max-w-2xl">{log.url}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                                                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${expandedLog === log._id ? 'bg-sky-500 text-black' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white hover:bg-white/10'}`}
                                            >
                                                <Terminal size={14} />
                                                Trace
                                            </button>
                                            <button
                                                onClick={() => toggleResolve(log._id, log.resolved)}
                                                className={`p-4 rounded-2xl transition-all ${log.resolved ? 'bg-white/5 text-slate-700' : `bg-${color}-500/10 text-${color}-500 border border-${color}-500/20 hover:bg-${color}-500 hover:text-black shadow-lg shadow-${color}-500/10 active:scale-95`}`}
                                            >
                                                {log.resolved ? <RefreshCw size={18} /> : <Check size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Terminal Detail Panel */}
                                    {expandedLog === log._id && (
                                        <div className="bg-black/60 backdrop-blur-3xl border-t border-white/10 p-10 md:p-16 animate-in slide-in-from-top-4 duration-700">
                                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                                                <div className="xl:col-span-4 space-y-10">
                                                    <div className="space-y-6">
                                                        <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.5em] border-b border-sky-500/10 pb-4">Object Header</h4>
                                                        <div className="space-y-4 font-mono text-[11px]">
                                                            <div className="flex justify-between border-b border-white/[0.03] pb-2">
                                                                <span className="text-slate-600">ID</span>
                                                                <span className="text-slate-400">{log._id}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-white/[0.03] pb-2">
                                                                <span className="text-slate-600">Class</span>
                                                                <span className="text-white uppercase">{log.type}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-white/[0.03] pb-2">
                                                                <span className="text-slate-600">Node</span>
                                                                <span className="text-white uppercase">{log.source}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.5em] border-b border-sky-500/10 pb-4">Metadata Payload</h4>
                                                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5 font-mono text-[11px] text-slate-500 max-h-80 overflow-auto scrollbar-hide">
                                                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata || {}, null, 4)}</pre>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="xl:col-span-8 space-y-6">
                                                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] border-b border-rose-500/10 pb-4">Core Stack Trace</h4>
                                                    <div className="bg-[#0a0a0c] border border-white/5 p-10 md:p-14 rounded-[3rem] font-mono text-[11px] text-rose-400/70 overflow-auto max-h-[500px] leading-relaxed shadow-inner">
                                                        <pre className="whitespace-pre-wrap">
                                                            {log.stack || 'NO STACK TRACE AVAILABLE // LOG SOURCE: MANUAL REPORTING'}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemHealth;
