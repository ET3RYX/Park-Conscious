import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Ticket, Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { eventService } from '../services/api';

const StatsCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="bg-darkBackground-800 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
    <div className="absolute -inset-1 bg-gradient-to-br from-premier-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-vibrantBlue/30 transition-colors">
        <Icon size={24} className="text-vibrantBlue" />
      </div>
    </div>
    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest relative z-10 ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
      {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      <span>{change} vs last period</span>
    </div>
  </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        published: 0,
        draft: 0,
        totalRevenue: '₹0.0'
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
                  draft,
                  totalRevenue: '₹14.2L' // Mock since we don't have sales API yet
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Control Console</h1>
                <p className="text-gray-400 text-sm mt-1">Real-time performance analytics for Park Conscious.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Events" value={stats.totalEvents} change="+12%" icon={LayoutDashboard} trend="up" />
                <StatsCard title="Active List" value={stats.published} change="+18%" icon={Calendar} trend="up" />
                <StatsCard title="In Draft" value={stats.draft} change="-5%" icon={Activity} trend="down" />
                <StatsCard title="Revenue Flow" value={stats.totalRevenue} change="+24%" icon={TrendingUp} trend="up" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-darkBackground-800 border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-premier-400 to-vibrantBlue"></div>
                   <Activity className="text-white/10 mb-6" size={80} />
                   <h3 className="text-xl font-bold text-white mb-2">Live Engagement Matrix</h3>
                   <p className="text-gray-500 font-medium text-center max-w-sm">Generating real-time interaction data for active event listings. Visualizations will sync once API telemetry is online.</p>
                </div>

                <div className="bg-darkBackground-800 border border-white/5 rounded-[2.5rem] p-8 space-y-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-vibrantBlue"></div>
                    <Users className="text-white/10 mb-6" size={80} />
                    <h3 className="text-xl font-bold text-white mb-2">Attendee Stream</h3>
                    <p className="text-gray-500 font-medium text-center">User booking logs will populate here once transactions begin.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
