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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorStyles[color]}`}>
          <Icon size={20} />
        </div>
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
                const published = data.filter(e => e.status === 'published').length;
                const draft = data.filter(e => e.status === 'draft').length;
                setStats({
                  totalEvents: data.length,
                  published,
                  draft
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">DASHBOARD</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">System overview and event performance telemetry.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Total Repository" value={stats.totalEvents} icon={BarChart3} color="sky" />
                <StatsCard title="Active Listings" value={stats.published} icon={Calendar} color="emerald" />
                <StatsCard title="Draft Protocol" value={stats.draft} icon={Activity} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px] space-y-4">
                   <Clock className="text-slate-800" size={48} />
                   <div className="text-center">
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Real-time Telemetry</h3>
                       <p className="text-slate-600 text-xs mt-2 max-w-xs mx-auto font-medium">Live interaction data tracking is being initialized. Charts will populate as system telemetry comes online.</p>
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[350px] space-y-4">
                    <Users className="text-slate-800" size={48} />
                    <div className="text-center">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Attendee Stream</h3>
                        <p className="text-slate-600 text-xs mt-2 max-w-xs mx-auto font-medium">User transaction records will populate here once active bookings begin.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
