import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle, Clock, Globe, Terminal, RefreshCw, Filter, Search, ChevronDown, Check } from 'lucide-react';
import { adminService } from '../services/api';

const SystemHealth = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unresolved', 'admin', 'events', 'web'
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLog, setExpandedLog] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await adminService.getLogs();
            setLogs(data);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const toggleResolve = async (id, currentStatus) => {
        try {
            await adminService.resolveLog(id, !currentStatus);
            setLogs(logs.map(log => log._id === id ? { ...log, resolved: !currentStatus } : log));
        } catch (err) {
            alert('Failed to update log status');
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.source?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'unresolved') return !log.resolved && matchesSearch;
        if (filter === 'admin' || filter === 'events' || filter === 'web') return log.source === filter && matchesSearch;
        return matchesSearch;
    });

    const getSourceIcon = (source) => {
        switch(source) {
            case 'admin': return <ShieldAlert className="text-sky-500" size={16} />;
            case 'events': return <Activity className="text-indigo-500" size={16} />;
            case 'web': return <Globe className="text-emerald-500" size={16} />;
            default: return <Terminal className="text-slate-500" size={16} />;
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-4">System Health</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Real-time Ecosystem Audit & Crash Monitoring</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={fetchLogs}
                        className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="h-12 w-px bg-white/5 mx-2"></div>
                    <div className="flex bg-white/5 border border-white/5 p-1.5 rounded-2xl gap-1">
                        {['all', 'unresolved'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <CheckCircle2 size={24} className="text-emerald-500" />
                        </div>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Resolved Logs</h4>
                    <p className="text-4xl font-black text-white tracking-tighter">{logs.filter(l => l.resolved).length}</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                            <AlertTriangle size={24} className="text-rose-500" />
                        </div>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Unresolved Issues</h4>
                    <p className="text-4xl font-black text-white tracking-tighter">{logs.filter(l => !l.resolved).length}</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                            <Activity size={24} className="text-sky-500" />
                        </div>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Monitoring Period</h4>
                    <p className="text-4xl font-black text-white tracking-tighter uppercase">Last 200</p>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-4 relative z-10">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Filter by message, source or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-white text-sm focus:outline-none focus:border-white/10 transition-all font-medium placeholder:text-slate-600"
                    />
                </div>
                
                <div className="flex gap-2">
                    {['admin', 'events', 'web'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(filter === s ? 'all' : s)}
                            className={`px-6 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${filter === s ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                        >
                            {getSourceIcon(s)}
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-50">
                        <LoaderIcon className="animate-spin text-white" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Querying System Logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white/5 border border-dashed border-white/5 rounded-[3rem] opacity-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No logs found matching your criteria</p>
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <div 
                            key={log._id}
                            className={`group border transition-all relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] ${log.resolved ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-white/5 border-white/10 shadow-xl shadow-black/20'}`}
                        >
                            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1 flex items-start gap-6">
                                    <div className={`p-4 rounded-2xl shrink-0 mt-1 ${log.resolved ? 'bg-slate-500/10' : (log.type === 'frontend_crash' ? 'bg-rose-500/10' : 'bg-amber-500/10')}`}>
                                        {getSourceIcon(log.source)}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 bg-white/5 px-2 py-1 rounded-md">{log.type}</span>
                                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-1.5">
                                                <Clock size={10} />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                            {log.resolved && (
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <Check size={8} /> Resolved
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`text-xl font-black tracking-tight leading-tight uppercase italic ${log.resolved ? 'text-slate-400' : 'text-white'}`}>
                                            {log.message}
                                        </h3>
                                        <p className="text-slate-500 text-[10px] font-medium break-all">{log.url}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                                        className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <Terminal size={14} />
                                        Details
                                        <ChevronDown size={14} className={`transition-transform duration-500 ${expandedLog === log._id ? 'rotate-180' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => toggleResolve(log._id, log.resolved)}
                                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${log.resolved ? 'bg-white/5 text-slate-500 border border-white/5' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-95'}`}
                                    >
                                        {log.resolved ? 'Unresolve' : 'Mark Fixed'}
                                    </button>
                                </div>
                            </div>

                            {/* Detail Panel */}
                            {expandedLog === log._id && (
                                <div className="border-t border-white/5 bg-black/40 p-8 md:p-12 animate-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Error Context</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest">Platform Origin</span>
                                                    <span className="text-white font-black uppercase">{log.source}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest">Failure Class</span>
                                                    <span className="text-white font-black uppercase italic">{log.type}</span>
                                                </div>
                                                <div className="flex flex-col gap-2 pt-2">
                                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Target Endpoint</span>
                                                    <code className="text-[10px] text-sky-400 bg-sky-400/5 p-3 rounded-xl border border-sky-400/10 break-all">{log.url}</code>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Technical Metadata</h4>
                                            <div className="bg-white/5 p-6 rounded-2xl font-mono text-[10px] text-slate-400 overflow-auto max-h-64 scrollbar-hide">
                                                <pre>{JSON.stringify(log.metadata || {}, null, 2)}</pre>
                                            </div>
                                        </div>
                                    </div>

                                    {log.stack && (
                                        <div className="mt-12 space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Stack Trace</h4>
                                            <div className="bg-rose-500/[0.03] border border-rose-500/10 p-6 md:p-10 rounded-3xl font-mono text-[10px] text-rose-400/80 overflow-auto max-h-96 leading-relaxed">
                                                <pre>{log.stack}</pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const LoaderIcon = ({ size, className }) => (
    <svg 
        width={size} 
        height={size} 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
);

export default SystemHealth;
