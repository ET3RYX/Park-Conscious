import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Download, IndianRupee, Loader2 } from "lucide-react";
import { backendAxios } from "../axios";
import DefaultlayoutHoc from "../layout/Default.layout";

// Determine event branding from booking data
const getEventBranding = (booking) => {
  const eventId = booking?.eventId || "";
  const title   = (booking?.event?.title || booking?.locationName || "").toLowerCase();

  if (eventId.includes("farewell") || title.includes("afsana")) {
    return {
      headline: "AFSANA '26 Confirmed!",
      subtitle: "Your ticket for Afsana '26 — The Grand Finale is confirmed. See you on May 25th!",
      accent: "from-vibrantBlue to-indigo-500",
      qrColor: "border-indigo-500/30 shadow-indigo-500/20",
    };
  }
  return {
    headline: "TEDx SANGAM Confirmed!",
    subtitle: "Your registration for TEDx GGSIPU EDC is complete. We look forward to seeing you at SANGAM.",
    accent: "from-sky-500 to-emerald-500",
    qrColor: "border-sky-500/20 shadow-sky-500/20",
  };
};

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const txnId  = searchParams.get("txnId");
  const amount = searchParams.get("amount") || null;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!txnId) { setLoading(false); return; }
      try {
        const res = await backendAxios.get(`/api/booking/status/${txnId}`);
        if (res.data) setBooking(res.data);
      } catch (err) {
        console.error("Error fetching booking details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [txnId]);

  // QR data: prefer ticketId, fall back to txnId
  const qrData = booking?.ticketId || txnId;
  const branding = getEventBranding(booking);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#040b17]">
        <Loader2 className="text-sky-500 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050507] py-24 px-8 relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-xl w-full text-center space-y-12 animate-reveal relative z-10">

        {/* Animated Checkmark — Editorial Orbit */}
        <div className="relative mx-auto w-32 h-32 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
          <CheckCircle size={56} className="text-white animate-pulse" />
          <div className="absolute inset-0 bg-indigo-500/10 rounded-[2rem] blur-2xl -z-10 animate-pulse"></div>
        </div>

        <div className="space-y-6 text-center items-center flex flex-col">
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.8]">{branding.headline}</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] max-w-sm border-t border-white/5 pt-6">{branding.subtitle}</p>
        </div>

        {/* Ticket Details Card — Verified Passport */}
        <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-10 md:p-16 text-left space-y-10 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 blur-[100px] -z-10 rounded-full"></div>

          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start justify-between border-b border-white/5 pb-12">
            <div className="space-y-8 flex-1">
              <div>
                <p className="text-[9px] text-slate-200 font-black uppercase tracking-[0.4em] mb-2">Transaction ID</p>
                <code className="text-indigo-400 font-mono text-xs break-all bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/10 uppercase">{txnId || "N/A"}</code>
              </div>
              <div>
                <p className="text-[9px] text-slate-200 font-black uppercase tracking-[0.4em] mb-2">Booking Status</p>
                <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-6 py-2 rounded-full border border-white/10">Verified & Secure ✓</span>
              </div>
              {booking?.ticketId && (
                <div>
                  <p className="text-[9px] text-slate-200 font-black uppercase tracking-[0.4em] mb-2">Ticket Code</p>
                  <p className="text-white font-black text-3xl tracking-tighter italic uppercase">{booking.ticketId}</p>
                </div>
              )}
            </div>

            {/* QR Code */}
            {qrData && (
              <div className="bg-white p-4 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group hover:scale-105 transition-transform duration-700 flex-shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}&ecc=H&margin=0`}
                  alt={`QR Ticket`}
                  width={160}
                  height={160}
                  className="rounded-xl transition-all duration-700 hover:scale-105"
                />
                <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Scan QR Ticket</p>
              </div>
            )}
          </div>

          {amount && (
            <div className="flex items-center justify-between bg-[#050507] border border-white/5 rounded-[2rem] px-8 py-6">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">Amount Paid</p>
              <div className="flex items-center gap-2 text-white font-black text-2xl italic">
                <IndianRupee size={20} />
                {amount}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={() => window.print()}
              className="w-full bg-white text-black py-6 rounded-full font-black text-[11px] uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 group"
            >
              <Download size={20} className="group-hover:translate-y-1 transition-transform" /> Download Ticket
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 pt-8 opacity-40 hover:opacity-100 transition-opacity">
          <Link to="/my-bookings" className="text-white text-[10px] font-black uppercase tracking-[0.3em] transition flex items-center gap-3">
             View Wallet <ArrowRight size={14} />
          </Link>
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full hidden md:block"></div>
          <Link to="/" className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] transition flex items-center gap-3">
            Return to Home <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(SuccessPage);

