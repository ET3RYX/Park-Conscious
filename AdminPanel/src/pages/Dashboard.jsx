import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Clock } from 'lucide-react';
import { eventService } from '../services/api';

const StatsCard = ({ title, value, icon: Icon, color = 'sky' }) => {
  const colorStyles = {
    sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 transition-all hover:border-sky-500/30 group hover:shadow-[0_0_30px_rgba(14,165,233,0.1)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 group-hover:text-slate-400 transition-colors">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tighter">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${colorStyles[color]} transition-transform group-hover:scale-110`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full bg-current opacity-30 ${colorStyles[color].split(' ')[0]}`} style={{ width: '65%' }}></div>
          </div>
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Nominal</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        published: 0,
        draft: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await eventService.getAll();
                if (!Array.isArray(data)) {
                  setStats({ totalEvents: 0, published: 0, draft: 0 });
                  return;
                }
                const published = data.filter(e => e.status === 'published').length;
                const draft = data.filter(e => e.status === 'draft').length;
                setStats({
                  totalEvents: data.length,
                  published,
                  draft
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
                setStats({ totalEvents: 0, published: 0, draft: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">Live Feed Active</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Nexus Command</h1>
                    <p className="text-slate-500 text-xs mt-1 font-medium italic">Operational overview and event performance telemetry.</p>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Encryption Level</p>
                    <p className="text-xs font-mono text-emerald-500 font-bold tracking-widest">AES-256-GCM</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Event Repository" value={stats.totalEvents} icon={BarChart3} color="sky" />
                <StatsCard title="Active Listings" value={stats.published} icon={Calendar} color="emerald" />
                <StatsCard title="Draft Protocol" value={stats.draft} icon={Activity} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>
                   <Clock className="text-slate-800 group-hover:text-sky-500/20 transition-colors duration-700" size={64} />
                   <div className="text-center mt-6">
                       <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Telemetry</h3>
                       <p className="text-slate-600 text-xs mt-3 max-w-sm mx-auto font-medium leading-relaxed">Intelligence feed is being synchronized. Interaction heatmaps and traffic charts will populate as system data flows online.</p>
                       <div className="mt-8 flex justify-center gap-2">
                           {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-8 bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                       </div>
                   </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Activity size={16} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">System Log</h3>
                    </div>
                    
                    <div className="space-y-6 flex-1 overflow-y-auto">
                        {[
                            { time: 'T-00:42', msg: 'Admin session initialized', status: 'secure' },
                            { time: 'T-01:15', msg: 'Database handshake nominal', status: 'secure' },
                            { time: 'T-02:04', msg: 'API endpoints synchronized', status: 'secure' },
                            { time: 'T-03:45', msg: 'Event cache updated', status: 'pending' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 items-start border-l-2 border-slate-800 pl-4 py-1">
                                <span className="text-[9px] font-mono text-slate-500 mt-0.5">{log.time}</span>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">{log.msg}</p>
                                    <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${log.status === 'secure' ? 'text-emerald-500' : 'text-amber-500'}`}>{log.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-800/50">
                        <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <div className="flex items-center gap-3">
                                 <Users className="text-slate-600" size={16} />
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Attendees</span>
                             </div>
                             <span className="text-sm font-bold text-white">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
