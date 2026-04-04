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
const StatCard = ({ icon: Icon, label, value, sub, colorClass }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/8 transition-all duration-300">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
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
      setResult({ success: true, message: data.message || "Check-in successful!" });
      setTicketInput("");
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || "Invalid or already checked-in ticket." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center">
          <ScanLine size={18} className="text-sky-400" />
        </div>
        <div>
          <h3 className="text-white font-black">QR Ticket Check-In</h3>
          <p className="text-slate-500 text-xs">Type or paste the Ticket ID to mark attendance</p>
        </div>
      </div>
      <div className="flex gap-3">
        <input
          value={ticketInput}
          onChange={(e) => setTicketInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheckIn()}
          placeholder="e.g. TKT-A1B2C3D4"
          className="flex-1 bg-black/30 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-sky-500/60 transition-all"
        />
        <button
          onClick={handleCheckIn}
          disabled={loading || !ticketInput.trim()}
          className="bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-slate-600 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
          Check In
        </button>
      </div>
      {result && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold ${result.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {result.success ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
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
    <div className="min-h-screen bg-[#040b17] flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto">
            <Shield size={28} className="text-sky-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Admin Access</h1>
          <p className="text-slate-500 text-sm">Events Organizer Panel</p>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attempt()}
              placeholder="Admin password"
              className={`w-full bg-white/5 border ${error ? "border-red-500/60" : "border-white/10"} text-white placeholder-slate-600 rounded-xl pl-10 pr-12 py-3.5 focus:outline-none focus:border-sky-500/50 transition-all`}
            />
            <button onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs font-bold text-center">Wrong password. Try again.</p>}
          <button
            onClick={attempt}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all"
          >
            Enter Dashboard
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
    <div className="min-h-screen bg-[#040b17] py-12 px-6 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-sky-500 font-black uppercase tracking-widest mb-1">Park Conscious · Admin</p>
            <h1 className="text-4xl font-black text-white tracking-tighter">Organizer Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time attendee and revenue analytics</p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition mt-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="text-sky-500 animate-spin" size={36} />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`} colorClass="bg-emerald-500/15 text-emerald-400" />
              <StatCard icon={Ticket} label="Tickets Sold" value={stats?.totalSales || 0} colorClass="bg-sky-500/15 text-sky-400" />
              <StatCard icon={Users} label="Attended" value={stats?.totalAttended || 0} colorClass="bg-violet-500/15 text-violet-400" />
              <StatCard icon={TrendingUp} label="Attendance Rate" value={`${attendanceRate}%`} colorClass="bg-amber-500/15 text-amber-400" />
            </div>

            {/* Check-In Tool */}
            <CheckInTool />

            {/* Event Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5">
                <h2 className="text-white font-black text-lg">Event Breakdown</h2>
                <p className="text-slate-500 text-xs mt-0.5">Revenue and attendance per event</p>
              </div>
              {stats?.events?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        <th className="text-left px-6 py-4">Event</th>
                        <th className="text-right px-6 py-4">Tickets</th>
                        <th className="text-right px-6 py-4">Attended</th>
                        <th className="text-right px-6 py-4">Revenue</th>
                        <th className="text-right px-6 py-4">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.events.map((ev, i) => {
                        const rate = ev.totalTickets > 0 ? Math.round((ev.attended / ev.totalTickets) * 100) : 0;
                        return (
                          <tr key={ev.eventId || i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                            <td className="px-6 py-4 text-white font-semibold">{ev.title || "Untitled"}</td>
                            <td className="px-6 py-4 text-right text-slate-300 font-mono">{ev.totalTickets}</td>
                            <td className="px-6 py-4 text-right font-mono">
                              <span className="text-emerald-400 font-bold">{ev.attended}</span>
                              <span className="text-slate-600 text-xs ml-1">({rate}%)</span>
                            </td>
                            <td className="px-6 py-4 text-right text-emerald-400 font-mono font-bold">₹{ev.revenue.toLocaleString("en-IN")}</td>
                            <td className="px-6 py-4 text-right text-slate-400 font-mono">{ev.capacity ?? "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                  <Ticket size={36} className="mb-3" />
                  <p className="font-black text-sm">No event data yet</p>
                  <p className="text-xs mt-1">Events will appear once bookings are made.</p>
                </div>
              )}
            </div>
          </>
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
