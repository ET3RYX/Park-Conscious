import React, { useState, useEffect, useCallback } from "react";
import { backendAxios } from "../axios";
import {
  IndianRupee, Ticket, Users, TrendingUp, QrCode,
  CheckCircle2, XCircle, Loader2, ScanLine, Lock, Eye, EyeOff,
  RefreshCw, Shield,
} from "lucide-react";

// ── Admin Password (simple client-side gate) ──────────────────────────────────
const ADMIN_PASSWORD = "parkconscious@admin";
const SESSION_KEY = "pc_admin_session";

// ── Stat Card ─────────────────────────────────────────────────────────────────
// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, colorClass }) => (
  <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 flex items-center gap-6 hover:bg-white/10 transition-all duration-700 shadow-2xl group">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${colorClass} shadow-lg group-hover:scale-110 transition-transform duration-700`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] mb-1.5">{label}</p>
      <p className="text-3xl font-black text-white leading-none italic tracking-tighter">{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{sub}</p>}
    </div>
  </div>
);

// ── Check-In Tool ─────────────────────────────────────────────────────────────
const CheckInTool = () => {
  const [ticketInput, setTicketInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    const id = ticketInput.trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await backendAxios.post("/api/bookings/check-in", { ticketId: id });
      setResult({ success: true, message: data.message || "Check-In Success!" });
      setTicketInput("");
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || "Check-In Failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl backdrop-blur-3xl">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/10">
          <ScanLine size={28} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-black text-xl uppercase tracking-tighter italic">Ticket Scanner</h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Initialize ticket verification</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <input
          value={ticketInput}
          onChange={(e) => setTicketInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheckIn()}
          placeholder="ENTER TICKET ID (e.g. TKT-X9)"
          className="flex-1 bg-[#050507] border border-white/5 text-white placeholder-slate-500 rounded-full px-8 py-5 font-black uppercase tracking-[0.2em] text-xs focus:outline-none focus:border-indigo-500/40 transition-all shadow-inner"
        />
        <button
          onClick={handleCheckIn}
          disabled={loading || !ticketInput.trim()}
          className="bg-white text-black hover:bg-indigo-600 hover:text-white disabled:opacity-20 font-black text-[11px] uppercase tracking-[0.3em] px-12 py-5 rounded-full transition-all flex items-center justify-center gap-4 whitespace-nowrap shadow-2xl active:scale-95 group"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} className="group-hover:rotate-12 transition-transform" />}
          Check-In Ticket
        </button>
      </div>
      {result && (
        <div className={`flex items-center justify-center gap-4 px-8 py-5 rounded-[1.5rem] border text-[11px] font-black uppercase tracking-[0.3em] ${result.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-500"} animate-reveal`}>
          {result.success ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          {result.message}
        </div>
      )}
    </div>
  );
};

// ── Login Gate ────────────────────────────────────────────────────────────────
const LoginGate = ({ onLogin }) => {
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  const attempt = () => {
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg space-y-12 relative z-10 animate-reveal">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
            <Shield size={42} className="text-white animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Admin Login</h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] border-t border-white/5 pt-6">Tier-1 Encryption Required</p>
          </div>
        </div>
        <div className="space-y-8">
          <div className="relative group">
            <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
            <input
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attempt()}
              placeholder="ENTER ADMIN PASSWORD"
              className="w-full bg-white/5 border border-white/5 text-white placeholder-slate-500 rounded-full pl-16 pr-16 py-6 focus:outline-none focus:border-white/20 transition-all font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl backdrop-blur-xl"
            />
            <button onClick={() => setShow(!show)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition">
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] text-center italic">Login Failed. Invalid Password.</p>}
          <button
            onClick={attempt}
            className="w-full bg-white text-black hover:bg-indigo-600 hover:text-white font-black text-[11px] uppercase tracking-[0.4em] py-6 rounded-full transition-all shadow-2xl active:scale-95"
          >
            Authorize Access
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await backendAxios.get("/api/organizer/stats/global");
      setStats(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const attendanceRate = stats?.totalSales > 0
    ? Math.round((stats.totalAttended / stats.totalSales) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050507] py-20 px-6 md:px-12 relative">
      {/* Global Background Glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto space-y-16 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-3">
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.5em] mb-1">BACKSTAGE · Admin Dashboard</p>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.8]">Operations Control</h1>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] max-w-lg mt-6 border-l-4 border-indigo-500/20 pl-6">Real-time analytics and sales data for authorized administrators only.</p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-4 bg-white/5 border border-white/5 text-slate-500 hover:text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all backdrop-blur-xl group">
            <RefreshCw size={16} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"}`} /> Refresh Feed
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border border-white/10 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Syncing Intelligence...</p>
          </div>
        ) : (
          <div className="space-y-16 animate-reveal">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={IndianRupee} label="Total Sales" value={`₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`} colorClass="bg-indigo-500/10 text-white" />
              <StatCard icon={Ticket} label="Tickets Sold" value={stats?.totalSales || 0} colorClass="bg-white/5 text-white" />
              <StatCard icon={Users} label="Confirmed Entry" value={stats?.totalAttended || 0} colorClass="bg-white/5 text-white" />
              <StatCard icon={TrendingUp} label="Attendance Rate" value={`${attendanceRate}%`} colorClass="bg-white/5 text-white" />
            </div>

            {/* Check-In Tool */}
            <CheckInTool />

            {/* Event Breakdown */}
            <div className="bg-white/5 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
              <div className="px-12 py-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-white font-black text-2xl uppercase tracking-tighter italic">Global Sales Summary</h2>
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Status Report: Per Event</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Live</span>
                </div>
              </div>
              {stats?.events?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] text-slate-400 font-black uppercase tracking-[0.5em]">
                        <th className="text-left px-12 py-8">Active Event</th>
                        <th className="text-right px-12 py-8">Tickets Sold</th>
                        <th className="text-right px-12 py-8">Checked In</th>
                        <th className="text-right px-12 py-8">Total Revenue</th>
                        <th className="text-right px-12 py-8">Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.events.map((ev, i) => {
                        const rate = ev.totalTickets > 0 ? Math.round((ev.attended / ev.totalTickets) * 100) : 0;
                        return (
                          <tr key={ev.eventId || i} className="hover:bg-white/5 transition-colors group">
                            <td className="px-12 py-8 text-white font-black uppercase tracking-tighter italic text-xl group-hover:text-indigo-400 transition-colors">{ev.title || "Untitled Event"}</td>
                            <td className="px-12 py-8 text-right text-slate-500 font-mono text-base">{ev.totalTickets}</td>
                            <td className="px-12 py-8 text-right font-mono">
                              <span className="text-white font-black text-base">{ev.attended}</span>
                              <span className="text-slate-500 text-[10px] font-bold ml-2 uppercase tracking-widest">({rate}%)</span>
                            </td>
                            <td className="px-12 py-8 text-right text-indigo-400 font-mono font-black text-base italic">₹{ev.revenue.toLocaleString("en-IN")}</td>
                            <td className="px-12 py-8 text-right text-slate-500 font-mono text-base">{ev.capacity ?? "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-6 opacity-40">
                  <Ticket size={48} />
                  <div className="text-center">
                    <p className="font-black text-[10px] uppercase tracking-[0.5em]">No_Data_Streams_Available</p>
                    <p className="text-[8px] mt-2 font-bold uppercase">Awaiting initial check-ins...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page Entry Point ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "true");

  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;
  return <Dashboard />;
}
