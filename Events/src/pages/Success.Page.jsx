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
    <div className="min-h-[80vh] flex items-center justify-center bg-[#040b17] py-20 px-8">
      <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">

        {/* Animated Checkmark */}
        <div className="relative mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
          <CheckCircle size={48} className="text-emerald-500 animate-bounce" />
          <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl animate-pulse -z-10"></div>
        </div>

        <div className="space-y-4 text-center items-center flex flex-col">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">{branding.headline}</h1>
          <p className="text-slate-400 font-medium max-w-md">{branding.subtitle}</p>
        </div>

        {/* Ticket Details Card */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-left space-y-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl -z-10 rounded-full"></div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-between border-b border-white/5 pb-8">
            <div className="space-y-6 flex-1">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Transaction ID</p>
                <code className="text-sky-500 font-mono text-sm break-all">{txnId || "N/A"}</code>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Status</p>
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">Verified ✓</span>
              </div>
              {booking?.ticketId && (
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Ticket ID</p>
                  <p className="text-white font-black text-lg tracking-wider">{booking.ticketId}</p>
                </div>
              )}
            </div>

            {/* QR Code — always shown using txnId fallback */}
            {qrData && (
              <div className={`bg-white p-3 rounded-2xl shadow-2xl border-4 ${branding.qrColor} hover:scale-105 transition-transform duration-500 flex-shrink-0`}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}&ecc=H&margin=0`}
                  alt={`QR Ticket — ${qrData}`}
                  width={160}
                  height={160}
                  className="rounded-lg"
                />
                <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Scan to Verify</p>
              </div>
            )}
          </div>

          {amount && (
            <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-6 py-4">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Amount Paid</p>
              <div className="flex items-center gap-1 text-emerald-400 font-black text-xl">
                <IndianRupee size={18} />
                {amount}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => window.print()}
              className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5"
            >
              <Download size={16} /> Save / Print Ticket
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
          <Link to="/my-bookings" className="text-sky-500 text-xs font-black uppercase tracking-widest hover:text-white transition flex items-center gap-2">
            View My Tickets <ArrowRight size={14} />
          </Link>
          <Link to="/" className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition flex items-center gap-2">
            Back to Catalog <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(SuccessPage);

